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

// console.log(sign.sign(privateKey, 'base64'));
