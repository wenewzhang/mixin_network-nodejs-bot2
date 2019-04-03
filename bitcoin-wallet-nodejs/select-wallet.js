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
var Promise = require('promise');
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

  var stream = fs.createReadStream("mybitcoin_wallet.csv");
  let walletList = [];
  walletList.push("Create Wallet");
  let firstLine  = '';
  csv
   .fromStream(stream, {headers: false})
   .on("data", function(data){
       walletList.push(data[3]);
       if (firstLine === '') { firstLine = data[3];}
   })
   .on("end", function(){
       var PromptMsg;
       PromptMsg = "\nMake your choose(select the uuid for open the specified wallet):";
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
}
if ( process.argv.length == 3 ) {
  console.log(' args: ' + (process.argv[2]));
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
    })();
  }
}
