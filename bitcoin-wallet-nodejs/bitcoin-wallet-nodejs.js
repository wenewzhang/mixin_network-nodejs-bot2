// const { SocketClient, isMessageType } = require('mixin-node-client');
const { HttpClient } = require('mixin-node-client');
const config = require('./config');
const client = new HttpClient(config);
(async () => {
  const { generateKeyPairSync } = require('crypto');
  const { publicKey, privateKey } = generateKeyPairSync('rsa',
  {   modulusLength: 1024,  // the length of your key in bits
      publicKeyEncoding: {
        type: 'spki',       // recommended to be 'spki' by the Node.js docs
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs1',      // recommended to be 'pkcs8' by the Node.js docs
        format: 'pem',
        //cipher: 'aes-256-cbc',   // *optional*
        //passphrase: 'top secret' // *optional*
    }
  });
  publicKey1 = publicKey.replace("-----BEGIN PUBLIC KEY-----","");
  publicKey2 = publicKey1.replace("-----END PUBLIC KEY-----","");
  publicKey3 = publicKey2.replace(/\r?\n|\r/g, "");

  console.log(publicKey);
  console.log(publicKey3);

  // const assets = await client.getUserAssets();
  // console.log(assets);
  console.log('Supported Endpoints by HttpClient', client.getEndpoints());
  const user = await client.getUser("21042518-85c7-4903-bb19-f311813d1f51");
  console.log(user);
  console.log(new Date().toString());

  const info = await client.createUser({full_name : "bitcoin wallet",
                     session_secret: publicKey3,
                   });
  console.log(info);
})();
// console.log(sign.sign(privateKey, 'base64'));
