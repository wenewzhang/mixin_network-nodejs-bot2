# Chapter 2: Receive and send token
In this chapter, the bot can receive token from user and then pay it back immediately.

Before pay token, developer need to prepare correct parameter in the config.js file.


### Generate config.js
>if you have read the python, javescript or php code, you will find the aes key in this config.js is not PIN token, yes, code of nodejs use clear aesKey intead of encrypted pin_token.


In developer dash board, copy those parameters. Copy the PIN,session id,private key etc. from [Mixin.one Dashboard](https://developers.mixin.one/dashboard)
![copy config info from dashboard](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/copy-to-clipboard.png)

#### install command line tool and use it to generte config.js
install mixin-cli
```bash
cd mixin_net-nodejs-bot2
yarn add mixin-cli
```

And then execute
```bash
wenewzha:mixin_network-nodejs-bot wenewzhang$ ./node_modules/mixin-cli/bin/mixin dapp:config
? What is the DAPP session info Press <enter> to launch your preferred editor.
```
As you see,"Press <enter> to launch your preferred editor.",for example, on my computer, it will open vim,
paste all the infomations into vim, save and quit!
![paste-to-vim](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/paste-to-vim.png)

One config file will be generated in the working folder. The config file on my laptop is config_mixin_1546851899846.js

```bash
wenewzha:mixin_network-nodejs-bot wenewzhang$ ./node_modules/mixin-cli/bin/mixin dapp:config
? What is the DAPP session info Received
? Which config format do you prefer? [Plain Javascript] can be required from any js code
? What is the filename for generated config file config_mixin_1546851899846.js
✔︎ sessionInfo was successfully decoded!
✔︎ Config file written to /Users/wenewzhang/Documents/sl/mixin_network-nodejs-bot/config_mixin_1546851899846.js
✔︎ Press ctrl+v and then enter to view file content
```


The content of generanted config.js is
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
You just need to fill missing content. The missing content include:
- **clientId** You can find the uuid format number in dashboard.
- **client secret** You can click the generate client secret link in dash board to generate one

A full config.js can find [here](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/config2.js)

## Source code explanation
> app2.js define acceptable actions
```javascript
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
User can pay 0.01 EOS to bot by click the button,
![pay-link](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/pay-link.png)
Developer can send token to their bots in message panel. The bot receive the tokens and then send back immediately.
![transfer and tokens](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/transfer-any-tokens.jpeg)

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
When bot send token to user successfully, the jsData.amount is negative.
When user send token to user, the jsData.amount is positive.

A full app2.js can find [here](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/app2.js)
