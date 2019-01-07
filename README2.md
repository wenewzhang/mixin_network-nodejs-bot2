# Chapter 2: Receive and send token
In this chapter, the bot can receive token from user and then pay it back immediately, you must know the miss options in the config.js file,
here show you how to generate a client secret, PIN, aesKey etc.
>if you have read the python, javescript or php code, you should find this config.js doesn't have PIN token, yes, nodejs use PIN token generate aesKey,
>i show you how to do it
## First, generate a completely config.js
copy the PIN,session id,private key etc. from [Mixin.one Dashboard](https://developers.mixin.one/dashboard)
![copy config info from dashboard](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/copy-to-clipboard.png)

```bash
cd mixin_net-nodejs-bot2
yarn add mixin-cli
./node_modules/mixin-cli/bin/mixin dapp:config
```
install mixin-cli and then execute **mixin dapp:config**

```bash
wenewzha:mixin_network-nodejs-bot wenewzhang$ ./node_modules/mixin-cli/bin/mixin dapp:config
? What is the DAPP session info Press <enter> to launch your preferred editor.
```
as you see,"Press <enter> to launch your preferred editor.",for example, on my computer, it will open vim,
paste all the infomations into vim, save and quit!
![paste-to-vim](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/paste-to-vim.png)

now,the config_mixin_1546851899846.js file created!
```bash
wenewzha:mixin_network-nodejs-bot wenewzhang$ ./node_modules/mixin-cli/bin/mixin dapp:config
? What is the DAPP session info Received
? Which config format do you prefer? [Plain Javascript] can be required from any js code
? What is the filename for generated config file config_mixin_1546851899846.js
✔︎ sessionInfo was successfully decoded!
✔︎ Config file written to /Users/wenewzhang/Documents/sl/mixin_network-nodejs-bot/config_mixin_1546851899846.js
✔︎ Press ctrl+v and then enter to view file content
```
| Key | Description                                  |   example                                         |
| --- | -------------------------------------------- |  -------------------------------------------------
| client secret  | generate from mixin.one's dashboard   | 78ef86a80be17601f404ad643e5c85ed4f7f5f9f7a1597 |
| PIN   |                 PIN code                       | 123456 |
| PIN token |       verify/update PIN                        |     don't  need here                         |
| aesKey | generate by PIN token                        |  GlJxnvlfhz7nxIk1eNkEdngf+jDW8XGHxJiaQTuD9v8=     |


- **aesKey**  generate aesKey by mixin-cli tool
- **client secret** don't forget generate client secret
completely config.js can find [here](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/config2.js)

## Source code brief explanation
> app2.js define acceptable actions
```javascript
const ValidActions = ["ACKNOWLEDGE_MESSAGE_RECEIPT" ,"CREATE_MESSAGE", "LIST_PENDING_MESSAGES"];
```

create a payment link to user when user ask 'pay'
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
you can pay 0.01 EOS to bot through pay command,
![pay-link](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/pay-link.png)
otherwise, you can transfer any tokens to boy through message panel, the bot receive the tokens and then send back immediately.
![transfer and tokens](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/transfer-any-tokens.jpeg)

```javascript
if (message.data && message.data.category === "SYSTEM_ACCOUNT_SNAPSHOT") {
    var jsData = JSON.parse(Buffer.from(message.data.data, 'base64').toString('utf-8'));
//let the server know that i have readed this message
    var parameter4IncomingMsg = {"message_id":message.data.message_id, "status":"READ"};
    var RspMsg = {"id":client.getUUID(), "action":"ACKNOWLEDGE_MESSAGE_RECEIPT", "params":parameter4IncomingMsg};
    client.sendRaw(RspMsg);
    if (jsData.amount > 0) {
      //refund immediately
      asyncRefundCall(jsData.asset_id,jsData.amount,jsData.opponent_id);
    } else console.log("refund success!");
}
```
if jsData.amount is negative, that's mean send the token back success!
