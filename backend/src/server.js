require('dotenv').config();
require('./monitoring');
const app = require('./app');
const logger = require('./config/logger'); //logger nuevo

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  //console.log cambiada
  logger.info(`Servidor POS corriendo en http://localhost:${PORT}`);
  logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  // TODO: En producción, registrar inicio en sistema de monitoreo
});
