In [last chapter](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README.md), we create our first app.

# Receive and send Bitcoin in Mixin Messenger
Your bot can receive Bitcoin from user and then pay it back immediately after read the chapter.

### Prepare AES key
Now you need to fill some missing parameters in the config.js file.

The config.js file has been created in [last chapter](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README.md#generate-parameter-for-your-app).

Now we will introduce a tool to generate the aes key.

### install command line tool(mixin-cli) and generate a config.js file
open terminal and download tools by yarn
```bash
cd mixin_net-nodejs-bot2
yarn add mixin-cli
```

Execute it by argument dapp:config
```bash
$ ./node_modules/mixin-cli/bin/mixin dapp:config
? What is the DAPP session info Press <enter> to launch your preferred editor.
```
As you see,"Press <enter> to launch your preferred editor.",for example, on my computer, it will open vim.

Now you need to copy all the [generated session](https://mixin-network.gitbook.io/mixin-network/mixin-messenger-app/create-bot-account#generate-session-key-for-your-app) info in dashboard paste into vim, save and quit!
![generated session ](https://github.com/myrual/mixin_network-nodejs-bot2/blob/master/Generated_session_content.png)
![paste-to-vim](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/paste-to-vim.png)

One config file will be generated in current folder. config_mixin_1546851899846.js is generated on my laptop.

```bash
$ ./node_modules/mixin-cli/bin/mixin dapp:config
? What is the DAPP session info Received
? Which config format do you prefer? [Plain Javascript] can be required from any js code
? What is the filename for generated config file config_mixin_1546851899846.js
✔︎ sessionInfo was successfully decoded!
✔︎ Config file written to /Users/wenewzhang/Documents/sl/mixin_network-nodejs-bot/config_mixin_1546851899846.js
✔︎ Press ctrl+v and then enter to view file content
```


The content of generated config.js is
```
// Generated with awesome https://github.com/wangshijun/mixin-cli
module.exports = {
  clientId: '<PUT YOUR DAPP CLIENT_ID HERE>',
  clientSecret: '<PUT YOUR DAPP CLIENT_SECRET HERE>',
  assetPin: '762835',
  sessionId: '4ec58515-814f-421c-844d-8717696cf460',
  aesKey: 'jqZvcLnlqt73TsSWHLezKNjdIdWBZ/rqTQLJlT1BlRQ=',
  privateKey: `-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgQCJDrQG95rRXkGfli1KKNPCdYAbpE795p+A3q7PtgTYwUNal9uP
UqeanDTmeMV5vSQu5f8n9M+60aytYcR1JetIQBMVGL4lVaAuAf1TkPT6GrbOvhdw
pykk6Tdx454Ju7jwv+txuHKlrw+mrKG/pxCVQ6bAcwDkbae5mo8yeBRiQQIDAQAB
AoGAALNZijuTyAQyU62B18IzqufM2tdRLA0UvaTlwdwNVEpQnNLv5WCnyKuJva/a
Wo/z8mVsk3i14x+VQWGhjnO+KyNyS7H8S2HPp/FjTCEpPMgSFfQmHToNgNp0gTpu
cHG5aUvUJYYVvUR3uGTlsZs006M1fNcc/7rAtBP8cwwYYn0CQQDVaZKju0VtRNuC
85zVwfxRngGSxWNJLznTYEdrMlwkLLfkUakU5dA63s0Nh32vFb79GcYJ3BbQTH8u
oXFfEmwnAkEApGhyMcV1myVA4vY2w1Mhd25e8rgqR0HSqdFLYPwz9mqVI9v/e5yc
vxb5Pr+zJLxLKvHP6/D1iq9qzVcvfMj3VwJAFopiDJ0ZBiOBs+EbLZChn9U6gVAL
3oz4ZJUEthPJm6CFg74ER8rGJZGmwskOw1FerMjuG9h9KF8MB9bRbKM7fQJBAKBM
ggMLLubtRL3GKJD7jebfw03OyNIfWKJgwak3XgbF1tJW31wL0Dz0zmIjES0hNf0S
NpMqpo3pCS5a8p8tZxMCQH744X2N3z3On2t0v559eXdJALuxIQKv1KbwQSv44T5Y
REp2XzEpK6y/MfFSiCpc77fLlZ6lsOfufqwxwRn0Cvg=
-----END RSA PRIVATE KEY-----`,
};
```
You need copy missing content from config.js which is generated in last chapter into the config_mixin_1xx.js.  Now we rename the file from config_mixin_1xx.js to config2.js:

A full config2.js [example](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/config2.js)

We also create a app2.js file with following content.
### Hello Bitcoin
```javascript
const { SocketClient, isMessageType } = require('mixin-node-client');
const { HttpClient } = require('mixin-node-client');
const config = require('./config2');
const client = new SocketClient(config);

const ValidActions = ["ACKNOWLEDGE_MESSAGE_RECEIPT" ,"CREATE_MESSAGE", "LIST_PENDING_MESSAGES"];

const receiverID = "0b4f49dc-8fb4-4539-9a89-fb3afc613747";
const coinID = "6cfe566e-4aad-470b-8c9a-2fd35b49c68d";

console.log('Supported MessageSenders by SocketClient', client.getMessageSenders());
console.log(client.getMessageSenders());
// Listen and react to socket messages
client.on(
  'message',
  client.getMessageHandler(message => {
    console.log('Message Received', message);
    if (ValidActions.indexOf(message.action) > -1) {
      if (message.action === 'ACKNOWLEDGE_MESSAGE_RECEIPT') {console.log("ignore receipt");return;}

      if (isMessageType(message, 'text')) {
        console.log('----------------------text-------------------------');
        const text = message.data.data.toLowerCase();
        if ( (message.data.category === "PLAIN_TEXT") && (message.action === "CREATE_MESSAGE") ) {
          var parameter4IncomingMsg = {"message_id":message.data.message_id, "status":"READ"};
          var RspMsg = {"id":client.getUUID(), "action":"ACKNOWLEDGE_MESSAGE_RECEIPT", "params":parameter4IncomingMsg};
          client.sendRaw(RspMsg);

          if (text === 'pay') {
            let payLink = "https://mixin.one/pay?recipient=" +
              config.clientId + "&asset=" +
              "6cfe566e-4aad-470b-8c9a-2fd35b49c68d" +
              "&amount=0.01" + '&trace=' + client.getUUID() +
              "&memo=";
            return client.sendButton({
                label: 'pay 0.01 EOS',
                color: '#FF0000',
                action: payLink,
              },
              message
            );
          }

    // todo: catch a error when balance insufficient
    //       (node:55535) UnhandledPromiseRejectionWarning: Error: Insufficient balance.
    // at HttpClient.(anonymous function) [as createTransfer] (/Users/wenewzhang/Documents/sl/mixin_network-nodejs-bot2/node_modules/mixin-node-client/lib/http.js:99:23)
    // at process.internalTickCallback (internal/process/next_tick.js:77:7)
          if (text === 'refund') {
            asyncRefundCall(coinID,'0.00001',receiverID);
          }
          return client.sendText( message.data.data, message);
        }
      }
      if (message.data && message.data.category === "SYSTEM_ACCOUNT_SNAPSHOT") {
          console.log("-----------the bot got money!---------------");

          var jsData = JSON.parse(Buffer.from(message.data.data, 'base64').toString('utf-8'));
          console.log(jsData);

//let the server know that i have read this message
          var parameter4IncomingMsg = {"message_id":message.data.message_id, "status":"READ"};
          var RspMsg = {"id":client.getUUID(), "action":"ACKNOWLEDGE_MESSAGE_RECEIPT", "params":parameter4IncomingMsg};
          client.sendRaw(RspMsg);

          if (jsData.amount > 0) {
            //refund immediately
            asyncRefundCall(jsData.asset_id,jsData.amount,jsData.opponent_id);
          } else console.log("refund success!");
          console.log("-----------end of bot got money!---------------");
      }
      return Promise.resolve(message);
  } else console.log("unknow action")
  }));

client.on('error', err => console.error(err.message));

function refundInstant(_assetID,_amount,_opponent_id) {
  return new Promise(resolve => {
    var httpClient = new HttpClient(config);
    const Obj = {
      assetId: _assetID,
      recipientId: _opponent_id,
        traceId: httpClient.getUUID(),
        amount: _amount,
        memo: '',
    };
    console.log('resolve...');
    console.log(Obj);
    console.log("end of Obj");
    httpClient.transferFromBot(Obj);
  })
}
async function asyncRefundCall(_assetID,_amount,_opponent_id) {
  console.log('calling asyncCall');
  var result = await refundInstant(_assetID,_amount,_opponent_id);
  console.log(result);
}

```
### Generate payment URL and refund it to user
User can pay 0.001 Bitcoin to bot by click the button and the 0.001 Bitcoin will be refunded in 1 seconds,In fact, user can pay any coins.
![pay-link](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/Pay_and_refund_quickly.jpg)

Developer can send token to their bots in message panel. The bot send token back immediately after receive it.
![transfer and tokens](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/transfer-any-tokens.jpg)

## Source code summary
> app2.js
```javascript
//define acceptable actions
const ValidActions = ["ACKNOWLEDGE_MESSAGE_RECEIPT" ,"CREATE_MESSAGE", "LIST_PENDING_MESSAGES"];
```

create a payment link to user when user send 'pay' to bot
```javascript
if (text === 'pay') {
  let payLink = "https://mixin.one/pay?recipient=" +
    config.clientId + "&asset=" +
    "6cfe566e-4aad-470b-8c9a-2fd35b49c68d" +
    "&amount=0.01" + '&trace=' + client.getUUID() +
    "&memo=";
  return client.sendButton({
      label: 'pay 0.01 EOS',
      color: '#FF0000',
      action: payLink,
    },
    message
  );
}
```

```javascript
if (message.data && message.data.category === "SYSTEM_ACCOUNT_SNAPSHOT") {
    var jsData = JSON.parse(Buffer.from(message.data.data, 'base64').toString('utf-8'));
//let the server know that i have read this message
    var parameter4IncomingMsg = {"message_id":message.data.message_id, "status":"READ"};
    var RspMsg = {"id":client.getUUID(), "action":"ACKNOWLEDGE_MESSAGE_RECEIPT", "params":parameter4IncomingMsg};
    client.sendRaw(RspMsg);
    if (jsData.amount > 0) {
      //refund immediately
      asyncRefundCall(jsData.asset_id,jsData.amount,jsData.opponent_id);
    } else console.log("refund success!");
}
```
* jsData.amount is negative if bot sends token to user successfully.
* jsData.amount is positive if bot receives token from user.

Full app2.js is [here](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/app2.js)
