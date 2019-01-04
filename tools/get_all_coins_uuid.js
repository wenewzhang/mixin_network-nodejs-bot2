const {
  HttpClient
} = require('../node_modules/mixin-node-client');
const config = require('../config');
const client = new HttpClient(config);


console.log('Supported Endpoints by HttpClient', client.getEndpoints());

// Read/write data on mixin blockchain and messenger through HTTP API
(async() => {
  try {
    // asset related
    const assets = await client.getAssets();
    // const asset = await client.getAsset(assetId);
    // const topAssets = await client.getTopAssets();
    // const topAsset = await client.getTopAsset(assetId);
    console.log("| Coin        | UUID                |");
    console.log("| ----------- | ------------------- |");
    assets.forEach(function(e) {
      console.log("|  " + e.symbol + " | " + e.asset_id + " |");
    });
    console.log(client.getUUID());
  } catch (err) {
    console.error(err);
  }
})();
