# Mixin Messener application development tutorial in Node.js: 
This tutorial will let you know how to write a Mixin Messenger bot in Node.js. The bot can receive and response to user's message. User can pay token to bot and bot can transfer token to user.

## Index
1. [Create bot and receive message from user](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README.md)
2. [Receive token and pay token](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README2.md)

## Create bot and receive message from user 
You will create a bot in Mixin Messenger to receive user message after read the chapter. 


### Node.js enviroment setup:
This tutorial is written in Node.js and use a library [wangshijun/mixin-node-client](https://github.com/wangshijun/mixin-node-client). So you need to install yarn node before writing code.

on MacOS
```bash
brew install node yarn
```

on Ubuntu
```bashREADME2.md
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
apt update
apt upgrade
apt install node yarn
```


### Create you first app in developer dash board
Create an app by following [tutorial](https://mixin-network.gitbook.io/mixin-network/mixin-messenger-app/create-bot-account).

### Generate parameter for your app
Remember to [generate parameter](https://mixin-network.gitbook.io/mixin-network/mixin-messenger-app/create-bot-account#generate-secure-parameter-for-your-app)
and write down required infomation: user id, session id, private key because they are required in config.js file soon.



![mixin_network-keys](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/mixin_network-keys.png)
Create config.js, fill the user id, sessionId, and the private key you got from dashboard.
We will introduce other parameter later.
> config.js
```javascript
// NOTE: please update this config file with your own
module.exports = {
  clientId: '21042518-85c7-4903-bb19-f311813d1f51',
  clientSecret: 'will-generate-later',
  assetPin: 'will-generate-later',
  sessionId: '6ca194a4-727f-4e5f-a348-3c62987536ba',
  aesKey: 'will-generate-later',
  privateKey: `-----BEGIN RSA PRIVATE KEY-----
MIICWwIBAAKBgQC1P7QK7rK8lyX7X5t4A/reu7Q94xJkAllf1NPsW7zUdVgs/BCV
f4RA6YK2prTpHHqXSCAzToEmou8R0xBMdnT/IQqijt0NzMpvrphiQrKrXEHrKrLm
at6eZHYvLoGEPYjVq6RrgLkt2Mjld+RfHWd4zHXeqSCVfHAH67+gcPHYCwIDAQAB
AoGADGotoeYRthtATcSRuJnFMEZ5JRgNpW4HwymnznPGLmNPQ92MIUFXxL555prq
n2EFAKG/GuSQsh3M9FKZtjMS9l0aXpXy4T4ieBptkhahKbGVMLbQBru8wo/Pow3r
r+DuNJs64ELvBYyydS7r1Fm/mtrd38Aq+4+04Z3UDW50AUkCQQDuhy8FoA3TKdZM
mIEiPFb2dW8ohe8MsGM370S8HFPk7kdCaarJbiJCx1E+KjUxbkAeEFcLqKgaALTu
IVCikIHNAkEAwoZvPaY0yFB1+V8HuToIR4X7AqWMy6WTBZ9U4wp34aNO21DLcrqf
P40FHrHvqbWNK5bS8nSxLiv0kYL6+ezJNwJAO/GxOYKttsGu33T8DvSHDk0Y8GAo
YVH6vVXeOkAMPV48fk47439QEOQyYKMO1ytT5bpJhd6O0GoZDjdFInWaiQJAAq4l
hDzxBz2MkpYLnjK9gHbJIZ00Vm3+m5o5ajNvuW0tnfn8A6WsogyIYIblHXqB6nLW
jz6qXk9+vC6I1L69ewJAasE+oC3TMblSOC9xqeBQgm8BPhb0UwJL4UuZLOSyUETr
+bAwyiZ37Cc7r/nxKhVH+FwMCVoeNUMcRIYYMRjwmg==
-----END RSA PRIVATE KEY-----`,
};

```

Open the terminal and go to the workspace, make nodejs-bot directory
```bash
mkdir nodejs-bot
cd nodejs-bot/
yarn init
```
Run **yarn init** command then according the prompt to create the project, the finished package.json is like below:
```json
{
  "name": "nodejs-bot",
  "version": "1.0.0",
  "main": "app.js",
  "license": "MIT"
}
```
This example dependents on mixin-node-client
```javascript
const { SocketClient, isMessageType } = require('mixin-node-client');
```
Execute **yarn add mixin-node-client** to add the packages
```bash
yarn add mixin-node-client
```
Now the package.json contails two packages,if you clone this repository, just excute **yarn** to download all dependency packages.
```json
"dependencies": {
  "mixin-node-client": "^0.6.0"
}
```

### Source code brief explanation
App need to create a connection and sign a token for later communication.

[Code](https://github.com/myrual/mixin_network-nodejs-bot2/blob/master/app.js#L1)
> app.js
```javascript
const { SocketClient, isMessageType } = require('mixin-node-client');
const config = require('./config');
const client = new SocketClient(config);
```
Then issue a listener to receive and analyze the incoming messages

[Code](https://github.com/myrual/mixin_network-nodejs-bot2/blob/master/app.js#L12)
```javascript
client.on(
  'message',
  client.getMessageHandler(message => {
    console.log('Message Received', message);
    return Promise.resolve(message);
  })
);
```
Analyze message from user and do something when receive a 'pay' text  **pay**

[Code](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/app2.js#L29)
```javascript
if (ValidActions.indexOf(message.action) > -1) {
  if (message.action === 'ACKNOWLEDGE_MESSAGE_RECEIPT') {console.log("ignore receipt");return;}

  if (isMessageType(message, 'text')) {
    const text = message.data.data.toLowerCase();
    if ( (message.data.category === "PLAIN_TEXT") && (message.action === "CREATE_MESSAGE") ) {
      //todo: tell the server you got this message
      if (text === 'pay') {
      // todo: pay
      }
      return client.sendText(text, message);
    }
  }
  return Promise.resolve(message);
} else console.log("unknow action")
```
Send the READ message to the server let it knows this message has already been read. If you don't send it,  the bot will receive the duplicated message again after the bot connect to server again!
```javascript

    if ( (message.data.category === "PLAIN_TEXT") && (message.action === "CREATE_MESSAGE") ) {
    //  READ message start
        var parameter4IncomingMsg = {"message_id":message.data.message_id, "status":"READ"};
        var RspMsg = {"id":client.getUUID(), "action":"ACKNOWLEDGE_MESSAGE_RECEIPT", "params":parameter4IncomingMsg};
        client.sendRaw(RspMsg);
    // READ message end
      return client.sendText(text, message);
```

### Finally, you can run **node app.js** to take the bot online.
```bash
node app.js
```

Install [Mixin Messenger](https://mixin.one/),add the bot as your friend,(for example, this bot id is 7000101639) and then send command!
enjoy!

![mixin_messenger](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/mixin_messenger-sayhi.png)


## [Chapter 2: Receive and send token](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README2.md)
