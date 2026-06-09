require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit'); //rate limit importado 
const logger = require('./config/logger'); //logger ven a mi

const authRoutes     = require('./routes/auth');
const productRoutes  = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const clientRoutes   = require('./routes/clients');
const saleRoutes     = require('./routes/sales');
const reportRoutes   = require('./routes/reports');
const userRoutes     = require('./routes/users');
const evalRoutes     = require('./routes/eval');

const app = express();

// ─── CORS SEGURIZADO────────────────────────────────────────────────────────────────────
// ⚠️ TODO: En producción restringir a dominios específicos:
// Si esta en produccion, restringe al dominio del Fronted en Azure.

if (process.env.NODE_ENV === 'production'){
  app.use(cors({ 
    origin: process.env.FRONTEND_URL,
    credentials: true 
  }));  
} else {
  app.use(cors()); // Permite todos los orígenes — NO recomendado en producción
}

// ─── PARSERS ─────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── RATE LIMITING (Mitigación DoS) ──────────────────────────────────────────
// Resuelto: Limita abusos de peticiones a la API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 peticiones por IP
  message: { error: 'Demasiadas peticiones desde esta IP. Intenta más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn(`⚠️ Rate limit excedido por IP: ${req.ip} en ${req.originalUrl}`);
    res.status(options.statusCode).send(options.message);
  }
});
app.use('/api/', limiter);

// ─── ARCHIVOS ESTÁTICOS (imágenes) ───────────────────────────────────────────
// TODO: Eliminar cuando se migre a almacenamiento en la nube (S3, GCS, etc.)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── HEALTH CHECK ────────────────────────────────────────────────────────────
// TODO: Implementar endpoint de health check para:
//   - Load Balancers (ALB, NGINX, etc.)
//   - Orquestadores de contenedores (ECS, Kubernetes)
//   - Servicios de monitoreo
//
//   Endpoint de Healt Check para Azure - Balanceadores de carga 
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date(),
    uptime: process.uptime() //Indicador cuantos segundos lleva corriendo el servidor
  })
});

// ─── RUTAS ───────────────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/clients',    clientRoutes);
app.use('/api/sales',      saleRoutes);
app.use('/api/reports',    reportRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/eval',       evalRoutes);  // Ruta de evaluación docente (requiere EVAL_SECRET)

// ─── MANEJO DE ERRORES GLOBAL ────────────────────────────────────────────────
// TODO: Reemplazar console.error con logging estructurado (Winston, Pino, etc.)
//       e integrar con servicio de monitoreo (CloudWatch, Datadog, Sentry, etc.)
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  logger.error({ err }, `[ERROR GLOBAL]: ${err.message}`);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

module.exports = app;
