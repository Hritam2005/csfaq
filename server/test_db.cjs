const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://cryptic5123:ft6ISPMuxLTjVDsp@csfaq.wspmgcv.mongodb.net/?appName=csfaq";

async function run() {
  console.log("Connecting...");
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    console.log("Connected successfully to server");
    console.log("Replica Set:", client.topology.s.description.setName);
  } catch (err) {
    console.error("Connection failed:", err.message);
  } finally {
    await client.close();
  }
}
run();
