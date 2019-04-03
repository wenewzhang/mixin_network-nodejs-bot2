const childProcess     =    require('child_process');
const path             =    require('path');
const fs               =    require('fs');
const inquirer         =    require('inquirer');
const { HttpClient }   =    require('mixin-node-client');
const config           =    require('./config');
const pem              =    require('pem-file');
const csv              =    require("fast-csv");
const { oaepDecrypt }  =    require('./crypto');
const client           =    new HttpClient(config);
var scriptName         =    path.basename(__filename);
const PromptMsg        =    "\nMake your choose(select the uuid for open the \
specified wallet):";
const PromptCmd        =    "\nMake your choose";
const WalletName       =    "./mybitcoin_wallet.csv";

const EXIN_BOT         =    "61103d28-3ac2-44a2-ae34-bd956070dab1";
const BTC_ASSET_ID     =    "c6d0c728-2624-429b-8e0d-d9d19b6592fa";
const EOS_ASSET_ID     =    "6cfe566e-4aad-470b-8c9a-2fd35b49c68d";
const USDT_ASSET_ID    =    "815b0b1a-2764-3736-8faa-42d694fa620a";
const BTC_WALLET_ADDR  =    "14T129GTbXXPGXXvZzVaNLRFPeHXD1C25C";

'use strict';

function runScript(scriptPath, args, callback) {

    // keep track of whether callback has been invoked to prevent multiple invocations
     var invoked = false;
     const spawnOptions = {
       // cwd: process.cwd(),
       detached: true,
       stdio: 'inherit',
     };
    var process = childProcess.fork(scriptPath, args, spawnOptions);

    // listen for errors as they may prevent the exit event from firing
    process.on('error', function (err) {
        if (invoked) return;
        invoked = true;
        callback(err);
    });

    // execute the callback once the process has finished running
    process.on('exit', function (code) {
        if (invoked) return;
        invoked = true;
        var err = code === 0 ? null : new Error('exit code ' + code);
        callback(err);
    });
}

// Now we can run a script and invoke a callback when complete, e.g.
if ( process.argv.length == 2 ) {
  let walletList = [];
  walletList.push("Create Wallet");
  if ( fs.existsSync(WalletName) ) {
    var stream = fs.createReadStream(WalletName);
    let firstLine  = '';
    csv
     .fromStream(stream, {headers: false})
     .on("data", function(data){
         walletList.push(data[3]);
         if (firstLine === '') { firstLine = data[3];}
     })
     .on("end", function(){

         const prompts = [
           {
             name: 'type',
             type: 'list',
             default: firstLine,
             message: PromptMsg,
             choices: walletList,
           },
         ];
         (async () => {
           walletList.push("Exit");
           const args = await inquirer.prompt(prompts);
           runScript(scriptName, [args.type], function (err) {
               if (err) throw err;
           });
         })();
     });
   } else {
     const prompts = [
       {
         name: 'type',
         type: 'list',
         default: "Create Wallet",
         message: PromptMsg,
         choices: walletList,
       },
     ];
     (async () => {
       walletList.push("Exit");
       const args = await inquirer.prompt(prompts);
       runScript(scriptName, [args.type], function (err) {
           if (err) throw err;
       });
     })();
   }
}
if ( process.argv.length == 3 ) {
  console.log(' You select the : ' + (process.argv[2]));
  if ( process.argv[2] === "Exit") { process.exit();}
  if ( process.argv[2] === "Create Wallet") {
    console.log("create wallet ....");
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
    (async () => {
      const info = await client.createUser({full_name : "nodejs bitcoin wallet",
                                            session_secret: publicKey3,
                                          });
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
          writableStream = fs.createWriteStream(WalletName, {flags: 'a'});

      writableStream.on("finish", function(){
        console.log("Bitcoin wallet DONE!");
      });
      csvStream.pipe(writableStream);
      csvStream.write({a: privateKey, b: info.pin_token,
                       c: info.session_id, d: info.user_id,
                       e: "123456"}
                     );
      csvStream.end();
      fs.appendFile(WalletName, require("os").EOL, function(){});

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
      //run again
      runScript(scriptName, [], function (err) {
          if (err) throw err;
      });
    })();
  } else { //must select a wallet
    console.log("You select the wallet " + process.argv[2]);
    const TYPE_BITCOIN_INFO              = '2: Read Bitcoin Balance & Address';
    const TYPE_USDT_INFO                 = '3: Read USDT Balance & Address';
    const TYPE_EOS_INFO                  = '4: Read EOS Balance & Address';

    const prompts = [
      {
        name: 'type',
        type: 'list',
        default: TYPE_BITCOIN_INFO,
        message: PromptCmd,
        choices: [TYPE_BITCOIN_INFO, TYPE_USDT_INFO, TYPE_EOS_INFO, "Exit"],
      },
    ];
    (async () => {
      const args = await inquirer.prompt(prompts);
      console.log('You choice to :', args);
      console.log('You wallet is :', process.argv[2]);
      if ( args.type === 'Exit' ) { process.exit(); }
      var stream = fs.createReadStream(WalletName);
      csv
       .fromStream(stream, {headers: false})
       .on("data", function(data){
         (async () => {
           if ( process.argv[2] === data[3] ) {
             // console.log(data[0]);
             // console.log(args);
             let aesKey = '';
             const privateKeyBytes = pem.decode(Buffer.from(data[0]));
             const aesKeyBuffer = await oaepDecrypt(
               Buffer.from(data[1], 'base64'),
               privateKeyBytes,
               'SHA-256',
               Buffer.from(data[2])
             );
             aesKey = Buffer.from(aesKeyBuffer).toString('base64');
             // console.log(aesKey);
             const newUserConfig = {clientId: data[3], aesKey: aesKey,
                                    privateKey: data[0], sessionId: data[2],
                                    clientSecret: "do not need", assetPin: data[3]};
             // console.log(newUserConfig);
             const newUserClient = new HttpClient(newUserConfig);
             if (args.type === TYPE_BITCOIN_INFO) {
                // console.log('You choice to 1:', args);
                const assetInfo = await newUserClient.getUserAsset(BTC_ASSET_ID);
                console.log("Bitcoin address is ", assetInfo.public_key);
                console.log("Bitcoin balance is ", assetInfo.balance);
                console.log("Bitcoin price is (USD) ", assetInfo.price_usd);
             } else if (args.type === TYPE_USDT_INFO) {
               // console.log('You choice to 1:', args);
               const assetInfo = await newUserClient.getUserAsset(USDT_ASSET_ID);
               console.log("USDT address is ", assetInfo.public_key);
               console.log("USDT balance is ", assetInfo.balance);
               console.log("USDT price is (USD) ", assetInfo.price_usd);
             } else if (args.type === TYPE_EOS_INFO) {
               // console.log('You choice to 1:', args);
               const assetInfo = await newUserClient.getUserAsset(EOS_ASSET_ID);
               console.log("EOS account name is ", assetInfo.account_name, " tag is ", assetInfo.account_tag);
               console.log("EOS balance is ", assetInfo.balance);
               console.log("EOS price is (USD) ", assetInfo.price_usd);
             }
             runScript(scriptName, [process.argv[2]], function (err) {
                 if (err) throw err;
             });
           }
           })();
       })
       .on("end", function(){
       });
    })();
  }
}
