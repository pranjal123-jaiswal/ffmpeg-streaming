import { BlobServiceClient } from "@azure/storage-blob";

async function setCorsRules() {
  const AZURITE_CONNECTION_STRING = "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;";
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURITE_CONNECTION_STRING);

  const serviceProperties = {
    cors: [
      {
        allowedOrigins: "*",
        allowedMethods: "GET,POST,OPTIONS",
        allowedHeaders: "*",
        exposedHeaders: "*",
        maxAgeInSeconds: 3600,
      },
    ],
  };

  try {
    console.log("Setting CORS rules...");
    await blobServiceClient.setProperties(serviceProperties);
    console.log("CORS rules set successfully.");
  } catch (error) {
    console.error("Error setting CORS rules:", error.message);
  }
}

setCorsRules();
