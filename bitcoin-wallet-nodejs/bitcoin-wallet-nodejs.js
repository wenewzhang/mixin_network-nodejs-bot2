const { HttpClient }   =    require('mixin-node-client');
const config           =    require('./config');
const client           =    new HttpClient(config);
const pem              =    require('pem-file');
const fs               =    require('fs');
const csv              =    require("fast-csv");
const { oaepDecrypt }  =    require('./crypto');

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

  // console.log('Supported Endpoints by HttpClient', client.getEndpoints());
  // const user = await client.getUser("21042518-85c7-4903-bb19-f311813d1f51");
  // console.log(user);
  // console.log(new Date().toString());
  //
  const info = await client.createUser({full_name : "bitcoin wallet",
                                        session_secret: publicKey3,
                                      });
  console.log(info);
  console.log(privateKey);
  console.log(info.pin_token);
  console.log(info.session_id);
  console.log(info.user_id);
  // var info2 = await client.updatePin({oldPin : "",
  //                                     newPin: "123456",
  //                                    });
  // console.log(info2);

  let aesKey = '';
  const privateKeyBytes = pem.decode(Buffer.from(privateKey));
  const aesKeyBuffer = await oaepDecrypt(
    Buffer.from(info.pin_token, 'base64'),
    privateKeyBytes,
    'SHA-256',
    Buffer.from(info.session_id)
  );
  aesKey = Buffer.from(aesKeyBuffer).toString('base64');
  console.log(aesKey);

  var csvStream = csv.createWriteStream({headers: false, ignoreEmpty: true}),
      writableStream = fs.createWriteStream("./mybitcoin_wallet.csv", {flags: 'a'});

  writableStream.on("finish", function(){
    console.log("Bitcoin wallet DONE!");
  });
  csvStream.pipe(writableStream);
  csvStream.write({a: privateKey, b: info.pin_token,
                   c: info.session_id, d: info.user_id,
                   e: "123456"}
                 );
  csvStream.end();
  fs.appendFile("./mybitcoin_wallet.csv", require("os").EOL, function(){});
  
  const newUserConfig = {clientId: info.user_id, aesKey: aesKey,
                         privateKey: privateKey, sessionId: info.session_id,
                         clientSecret: "do not need", assetPin: "123456"};
  console.log(newUserConfig);
  const newUserClient = new HttpClient(newUserConfig);
  var info2 = await newUserClient.updatePin({oldPin : "",
                                             newPin: "123456",
                                           });
  console.log(info2);

  const verifyPin = await newUserClient.verifyPin("123456");
  console.log({ verifyPin });


  var PromptMsg;
	PromptMsg  = "1: Create Wallet\n2: Read Bitcoin balance & Address \n3: Read USDT balance & Address\n4: Read EOS balance & address\n";
	PromptMsg += "5: pay 0.0001 BTC buy USDT\n6: Read ExinCore Price(USDT)\n7: Read ExinCore Price(BTC)\n";
	PromptMsg += "8: pay 1 USDT buy BTC\n9: Read Snapshots\na: Verify bot PIN code\nv: Verify wallet PIN code\n";
	PromptMsg += "q: Exit \nMake your choose:";
  const inquirer = require('inquirer');

  const TYPE_CREATE_WALLET             = '1: Create Wallet';
  const TYPE_BITCOIN_INFO              = '2: Read Bitcoin balance & Address ';
  const TYPE_USDT_INFO                 = '3: Read USDT balance & Address';
  const TYPE_EOS_INFO                  = '4: Read EOS balance & Address';

  const prompts = [
    {
      name: 'type',
      type: 'list',
      default: TYPE_CREATE_WALLET,
      message: PromptMsg,
      choices: [TYPE_CREATE_WALLET, TYPE_BITCOIN_INFO, TYPE_USDT_INFO, TYPE_EOS_INFO],
    },
  ];

  const args = await inquirer.prompt(prompts);
  console.log('dappCreate.args', args);
})();
// console.log(sign.sign(privateKey, 'base64'));
