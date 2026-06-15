const { BlobServiceClient } = require('@azure/storage-blob');
const path = require('path');

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);

const containerClient = blobServiceClient.getContainerClient(
  process.env.AZURE_CONTAINER_NAME
);

async function uploadImageToBlob(file) {
  const ext = path.extname(file.originalname);
  const blobName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(file.buffer, {
    blobHTTPHeaders: {
      blobContentType: file.mimetype
    }
  });

  return blockBlobClient.url;
}

module.exports = { uploadImageToBlob };
