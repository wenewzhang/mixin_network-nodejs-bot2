# Step by step: How to use nodejs to create a bot in Mixin Messenger
In this charpter, you can create a bot in Mixin Messenger to receive user message after you following the guide. In next chapter, your bot can receive token from user and pay token to user .


[Mixin Network](https://mixin.one) is a free and lightning fast peer-to-peer transactional network for digital assets. 

These articles will show you how to write a bot in nodejs. The bot can receive and response to user's message. User can pay token to bot and bot can transfer token to user.

### Install npm node on your OS
mac OS
```bash
brew install node yarn
```

Ubuntu
```bash
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
apt update
apt upgrade
apt install node yarn
```


### Create you first bot 
Before you write any code, you need to create an app by following [tutorial](https://mixin-network.gitbook.io/mixin-network/mixin-messenger-app/create-bot-account).

write down three required infomations: user id, session id, private key, mixin-node sign the token with them.

| Key | Description                                  |   example                                         |
| --- | -------------------------------------------- |  -------------------------------------------------
| user id | unique bot identity, uuid,for token signature | 21042518-85c7-4903-bb19-f311813d1f51          |
| session id | session identity, uuid,for token signature | 5eb96d87-028e-4199-a6d3-6fc7da8dfe41          |
| private key | RSA private key for token signature  | -----BEGIN RSA PRIVATE KEY----- -----END RSA PRIVATE KEY-----


![mixin_network-keys](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/mixin_network-keys.png)
create config.js, replace your clientId with user id, sessionId with session id, aesKey with session token  and the private key with your's.
other options we should talk later.
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

open the terminal and go to the workspace, make nodejs-bot directory
```bash
mkdir nodejs-bot
cd nodejs-bot/
yarn init
```
run **yarn init** command then according the prompt to create the project, the finished package.json is like below:
```json
{
  "name": "nodejs-bot",
  "version": "1.0.0",
  "main": "app.js",
  "license": "MIT"
}
```
this example dependents on mixin-node-client
```javascript
const { SocketClient, isMessageType } = require('mixin-node-client');
```
execute **yarn add mixin-node-client** to add the packages
```bash
yarn add mixin-node-client
```
now, the package.json add two packages,if you clone this repository, just excute **npm install** to download all dependency packages.
```json
"dependencies": {
  "mixin-node-client": "^0.6.0"
}
```

### The next, source code brief explanation
initial the connection and sign the token.
> app.js
```javascript
const { SocketClient, isMessageType } = require('mixin-node-client');
const config = require('./config');
const client = new SocketClient(config);
```
issue a listener to process the incoming messages
```javascript
client.on(
  'message',
  client.getMessageHandler(message => {
    console.log('Message Received', message);
    return Promise.resolve(message);
  })
);
```
receive message from user and answer the question **pay**
```javascript
if (ValidActions.indexOf(message.action) > -1) {
  if (message.action === 'ACKNOWLEDGE_MESSAGE_RECEIPT') {console.log("ignore receipt");return;}

  if (isMessageType(message, 'text')) {
    const text = message.data.data.toLowerCase();
    if ( (message.data.category === "PLAIN_TEXT") && (message.action === "CREATE_MESSAGE") ) {
      //todo: tell the server you got this message
      return client.sendText(text, message);
    }
  }
  return Promise.resolve(message);
} else console.log("unknow action")
```
send the READ message to the server let it knows this message has already been readed. If not, when the bot restart, it could receive the message again!
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

install [Mixin Messenger](https://mixin.one/),add the bot as your friend,(for example, this bot id is 7000101639) and then send command!
enjoy!

![mixin_messenger](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/mixin_messenger-sayhi.png)
