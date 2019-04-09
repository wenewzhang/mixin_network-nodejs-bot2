const childProcess     =    require('child_process');
const path             =    require('path');
const fs               =    require('fs');
const inquirer         =    require('inquirer');
const { HttpClient }   =    require('mixin-node-client');
const config           =    require('./config');
const pem              =    require('pem-file');
const csv              =    require("fast-csv");
const { oaepDecrypt }  =    require('./crypto');
const msgpack          =    require('msgpack5')();
const axios            =    require('axios');
const clientBot        =    new HttpClient(config);
const PromptMsg        =    "\nMake your choose(select the uuid for open the \
specified wallet):";
const PromptCmd        =    "\nMake your choose";
const WalletName       =    "./mybitcoin_wallet.csv";

const EXIN_BOT         =    "61103d28-3ac2-44a2-ae34-bd956070dab1";
const BTC_ASSET_ID     =    "c6d0c728-2624-429b-8e0d-d9d19b6592fa";
const EOS_ASSET_ID     =    "6cfe566e-4aad-470b-8c9a-2fd35b49c68d";
const USDT_ASSET_ID    =    "815b0b1a-2764-3736-8faa-42d694fa620a";

//change to your third exchange/cold  btc wallet address
const BTC_WALLET_ADDR  =    "14T129GTbXXPGXXvZzVaNLRFPeHXD1C25C";
const EOS_WALLET_NAME  =    "huobideposit";
const EOS_WALLET_TAG   =    "1872050";
//change to your mixin messenger account 's uuid
const MASTER_UUID      =    "0b4f49dc-8fb4-4539-9a89-fb3afc613747";

var scriptName         =    path.basename(__filename);

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
         pageSize: 15,
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
      const info = await clientBot.createUser({full_name : "nodejs bitcoin wallet",
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
    const TYPE_ASSETS_INFO               = '0: Read All Asssets Balance';
    const TYPE_BITCOIN_INFO              = '1: Read Bitcoin Balance & Address';
    const TYPE_USDT_INFO                 = '2: Read USDT Balance & Address';
    const TYPE_EOS_INFO                  = '3: Read EOS Balance & Address';
    const TYPE_TRANS_BTC_TO_WALLET       = '4: Transfer BTC from Bot to Wallet';
    const TYPE_TRANS_EOS_TO_WALLET       = '5: Transfer EOS from Bot to Wallet';
    const TYPE_TRANS_BTC_TO_MASTER       = '6: Transfer BTC from Wallet to Master';
    const TYPE_TRANS_EOS_TO_MASTER       = '7: Transfer EOS from Wallet to Master';
    const TYPE_VERIFY_PIN                = '8: Verify Wallet PIN ';
    const TYPE_BTC_WITHDRAW              = '9: BTC withdraw';
    const TYPE_EOS_WITHDRAW              = '10: EOS withdraw';
    const TYPE_BTC_WITHDRAW_READ         = '11: Fetch BTC withdrawal info';
    const TYPE_EOS_WITHDRAW_READ         = '12: Fetch EOS withdrawal info';
    const TYPE_FETCH_USDT_MARKETINFO     = '13: Fetch USDT Market info';
    const TYPE_FETCH_BTC_MARKETINFO      = '14: Fetch BTC Market info';
    const TYPE_EXCHANGE_BTC_USDT         = '14: Transfer 0.0001 BTC buy USDT';
    const TYPE_EXCHANGE_USDT_BTC         = '15: Transfer USDT $1 buy BTC';
    const TYPE_READ_SNAPSHOTS            = '16: Read snapshots';
    const prompts = [
      {
        name: 'type',
        type: 'list',
        pageSize: 25,
        default: TYPE_BITCOIN_INFO,
        message: PromptCmd,
        choices: [TYPE_ASSETS_INFO, TYPE_BITCOIN_INFO, TYPE_USDT_INFO, TYPE_EOS_INFO, TYPE_TRANS_BTC_TO_WALLET,
                  TYPE_TRANS_EOS_TO_WALLET, TYPE_TRANS_BTC_TO_MASTER, TYPE_TRANS_EOS_TO_MASTER,
                  TYPE_VERIFY_PIN, TYPE_BTC_WITHDRAW, TYPE_EOS_WITHDRAW, TYPE_BTC_WITHDRAW_READ,
                  TYPE_EOS_WITHDRAW_READ, TYPE_FETCH_USDT_MARKETINFO, TYPE_FETCH_BTC_MARKETINFO,
                  TYPE_EXCHANGE_BTC_USDT, TYPE_EXCHANGE_USDT_BTC, TYPE_READ_SNAPSHOTS, "Exit"],
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
                                    clientSecret: "do not need", assetPin: data[4]};
             // console.log(newUserConfig);
             const newUserClient = new HttpClient(newUserConfig);
             if ( args.type === TYPE_ASSETS_INFO ) {
               const assetsInfo = await newUserClient.getUserAssets();
               console.log(assetsInfo);
             } else if (args.type === TYPE_BITCOIN_INFO) {
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
             } else if (args.type === TYPE_TRANS_BTC_TO_WALLET) {
               // console.log('You choice to 1:', args);
               const assetInfo = await clientBot.getUserAsset(BTC_ASSET_ID);
               console.log("The Bot 's BTC balance is ", assetInfo.balance);
               if ( assetInfo.balance > 0 ) {
                 const Obj = {
                   assetId: BTC_ASSET_ID,
                   recipientId: process.argv[2],
                     traceId: clientBot.getUUID(),
                     amount: assetInfo.balance,
                     memo: '',
                 };
                 console.log(Obj);
                 transInfo = clientBot.transferFromBot(Obj);
                 console.log(transInfo);
               }
             } else if (args.type === TYPE_TRANS_EOS_TO_WALLET) {
               // console.log('You choice to 1:', args);
               const assetInfo = await clientBot.getUserAsset(EOS_ASSET_ID);
               console.log("The Bot 's EOS balance is ", assetInfo.balance);
               if ( assetInfo.balance > 0 ) {
                 const Obj = {
                   assetId: EOS_ASSET_ID,
                   recipientId: process.argv[2],
                     traceId: clientBot.getUUID(),
                     amount: assetInfo.balance,
                     memo: '',
                 };
                 console.log(Obj);
                 clientBot.transferFromBot(Obj);
               }
             } else if (args.type === TYPE_TRANS_BTC_TO_MASTER) {
               // console.log('You choice to 1:', args);
               const assetInfo = await newUserClient.getUserAsset(BTC_ASSET_ID);
               console.log("The Wallet 's BTC balance is ", assetInfo.balance);
               if ( assetInfo.balance > 0 ) {
                 const Obj = {
                   assetId: BTC_ASSET_ID,
                   recipientId: MASTER_UUID,
                     traceId: newUserClient.getUUID(),
                     amount: assetInfo.balance,
                     memo: '',
                 };
                 console.log(Obj);
                 newUserClient.transferFromBot(Obj);
               }
             } else if (args.type === TYPE_TRANS_EOS_TO_MASTER) {
               // console.log('You choice to 1:', args);
               const assetInfo = await newUserClient.getUserAsset(EOS_ASSET_ID);
               console.log("The Wallet 's EOS balance is ", assetInfo.balance);
               if ( assetInfo.balance > 0 ) {
                 const Obj = {
                   assetId: EOS_ASSET_ID,
                   recipientId: MASTER_UUID,
                     traceId: newUserClient.getUUID(),
                     amount: assetInfo.balance,
                     memo: '',
                 };
                 console.log(Obj);
                 newUserClient.transferFromBot(Obj);
               }
             } else if (args.type === TYPE_VERIFY_PIN) {
               // console.log('You choice to 1:', args);
               const verifyPin = await newUserClient.verifyPin(data[4]);
               // const updatePin = await client.updatePin({ oldPin: config.assetPin, newPin: '123456' }); // CAUTION
               console.log({ verifyPin });
             } else if (args.type === TYPE_BTC_WITHDRAW) {
               const withdrawAddress = await newUserClient.createWithdrawAddress({
                 assetId: BTC_ASSET_ID,
                 label: 'BTC withdraw',
                 publicKey: BTC_WALLET_ADDR,
               });
               console.log(withdrawAddress);
               const prompts = [
                 {
                   name: 'amount',
                   type: 'input',
                   message: "Input you BTC amount: ",
                 },
               ];
              const answers = await inquirer.prompt(prompts);
              console.log(answers);
              const withdrawResult = await newUserClient.withdraw({
                 addressId: withdrawAddress.address_id,
                 assetId: BTC_ASSET_ID,
                 amount: answers.amount,
                 memo: 'withdraw by nodejs',
              });
              console.log(withdrawResult);
            } else if (args.type === TYPE_EOS_WITHDRAW) {
              const withdrawAddress = await newUserClient.createWithdrawAddress({
                assetId: EOS_ASSET_ID,
                label: 'EOS withdraw',
                publicKey: "do not need",
                accountName: EOS_WALLET_NAME,
                accountTag: EOS_WALLET_TAG,
              });
              console.log(withdrawAddress);
              // const addressList = await newUserClient.getWithdrawAddress(EOS_ASSET_ID);
              // console.log(addressList);
              const prompts = [
                {
                  name: 'amount',
                  type: 'input',
                  message: "Input withdrawal BTC amount: ",
                },
              ];
             const answers = await inquirer.prompt(prompts);
             console.log(answers);
             const withdrawResult = await newUserClient.withdraw({
                addressId: withdrawAddress.address_id,
                assetId: EOS_ASSET_ID,
                amount: answers.amount,
                memo: 'withdraw by nodejs',
             });
             console.log(withdrawResult);
           } else if (args.type === TYPE_EOS_WITHDRAW_READ) {
              const addressList = await newUserClient.getWithdrawAddress(EOS_ASSET_ID);
              console.log(addressList);
            } else if (args.type === TYPE_BTC_WITHDRAW_READ) {
               const addressList = await newUserClient.getWithdrawAddress(BTC_ASSET_ID);
               console.log(addressList);
             } else if ( args.type === TYPE_EXCHANGE_BTC_USDT ) {
               // Pack memo
               const bytes = Buffer.from(
                 USDT_ASSET_ID.replace(/-/g, ''),
                 'hex'
               );
               const memo = msgpack
                 .encode({
                   A: bytes,
                 })
                 .toString('base64');

               console.log(memo); // gaFBxBDG0McoJiRCm44N2dGbZZL6
               const assetInfo = await newUserClient.getUserAsset(BTC_ASSET_ID);
               console.log("The Wallet 's BTC balance is ", assetInfo.balance);
               if ( assetInfo.balance >= 0.0001 ) {
                 const Obj = {
                   assetId: BTC_ASSET_ID,
                   recipientId: EXIN_BOT,
                     traceId: newUserClient.getUUID(),
                     amount: "0.0001",
                     memo: memo,
                   }
                   console.log(Obj);
                   newUserClient.transferFromBot(Obj);
               } else {
                 console.log("Not enough BTC!");
               }
             } else if ( args.type === TYPE_EXCHANGE_USDT_BTC ) {
               // Pack memo
               const bytes = Buffer.from(
                 BTC_ASSET_ID.replace(/-/g, ''),
                 'hex'
               );
               const memo = msgpack
                 .encode({
                   A: bytes,
                 })
                 .toString('base64');

               console.log(memo); // gaFBxBDG0McoJiRCm44N2dGbZZL6
               const assetInfo = await newUserClient.getUserAsset(USDT_ASSET_ID);
               console.log("The Wallet 's BTC balance is ", assetInfo.balance);
               if ( assetInfo.balance >= 1 ) {
                 const Obj = {
                   assetId: USDT_ASSET_ID,
                   recipientId: EXIN_BOT,
                     traceId: newUserClient.getUUID(),
                     amount: "1",
                     memo: memo,
                   }
                   console.log(Obj);
                   newUserClient.transferFromBot(Obj);
               } else {
                 console.log("Not enough USDT!");
               }
             } else if (  args.type === TYPE_FETCH_USDT_MARKETINFO ) {
               // Make a request
               var instance = axios.create({
               baseURL: 'https://exinone.com/exincore/markets',
               timeout: 3000,
               headers: {'X-Custom-Header': 'foobar'}
               });
               instance.get('?base_asset=' + USDT_ASSET_ID)
               .then(function(response) {
                 console.log(response.data.data);
               });
             } else if (  args.type === TYPE_FETCH_BTC_MARKETINFO ) {
              var instance = axios.create({
              baseURL: 'https://exinone.com/exincore/markets',
              timeout: 3000,
              headers: {'X-Custom-Header': 'foobar'}
              });
              instance.get('?base_asset=' + BTC_ASSET_ID)
              .then(function(response) {
                console.log(response.data.data);
              });
            } else if ( args.type === TYPE_READ_SNAPSHOTS ) {
              // const dt = new Date().toString();
              // console.log(dt);
              // const snapshot = await client.getSnapshot(snapshots[0].snapshot_id);
              const prompts = [
                {
                  name: 'datetime',
                  type: 'input',
                  message: "Input iso8601 datetime: ",
                },
              ];
             const answers = await inquirer.prompt(prompts);
             console.log(answers);
             console.log(encodeURIComponent(answers.datetime));
             const snapshots = await newUserClient.getSnapshots({ limit: 10, asset: USDT_ASSET_ID, offset: answers.datetime, order: "ASC"});
             // console.log(snapshots);
             snapshots.forEach(function(element) {
               if ( element.amount > 0) {
                 if ( element.data != null ) {
                    console.log(element.amount);
                    console.log(element.data);
                    const buf = Buffer.from(element.data, 'base64');
                    console.log(msgpack.decode(buf));
                    const codeInt = msgpack.decode(buf).C;
                    if ( codeInt === 1000 ) {
                      console.log("Successful Exchange");
                    } else { console.log("Go to there get more info https://github.com/exinone/exincore#code error code: " + codeStr);}

                    const hexStr = Buffer.from(msgpack.decode(buf).FA).toString('hex');
                    const uuid = `${hexStr.slice(0,8)}-${hexStr.slice(8,12)}-${hexStr.slice(12,16)}-${hexStr.slice(16,20)}-${hexStr.slice(20)}`;
                    console.log("Asset uuid is :" + uuid);
                    const priceStr = msgpack.decode(buf).P;
                    console.log("Price is :" + priceStr);
                    const feeStr = msgpack.decode(buf).F;
                    console.log("Fee is :" + feeStr);
                    console.log("percent of Fee is :" + (feeStr/element.amount)* 100 + " %");
                    const tStr = msgpack.decode(buf).T;
                    console.log("T is :" + tStr);
                 }
               }
             });
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
