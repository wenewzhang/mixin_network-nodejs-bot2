# Mixin Messener application development tutorial in Node.js
This tutorial will let you know how to write a Mixin Messenger bot in Node.js. The bot can receive and response to user's message. User can pay token to bot and bot can transfer token to user.

## Index
1. [Create bot and receive message from user](https://github.com/wenewzhang/mixin_network-nodejs-bot2#create-bot-and-receive-message-from-user)
2. [Receive token and pay token](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README2.md)

## Create bot and receive message from user
You will create a bot in Mixin Messenger to receive user message after read the chapter.


### Node.js enviroment setup:
This tutorial is written in Node.js. So you need to install yarn node before writing code.

on macOS
```bash
brew install node yarn
```

on Ubuntu
```bash
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
apt update
apt upgrade
apt install node yarn
```
### Create Yarn project folder
Open the terminal and go to the workspace, make nodejs-bot directory
```bash
mkdir nodejs-bot
cd nodejs-bot/
```
Run **yarn init** command then according the prompt to create the project
```bash
yarn init
```
The command will generate a new file: package.json with following content:
```json
{
  "name": "nodejs-bot",
  "version": "1.0.0",
  "main": "app.js",//Default name is main.js
  "license": "MIT"
}
```
This tutorial need a library a library [wangshijun/mixin-node-client](https://github.com/wangshijun/mixin-node-client). So we need to download the library.

In this folder, execute **yarn add mixin-node-client** to add the package
```bash
yarn add mixin-node-client
```
Now the package.json should contains the library package.
```json
"dependencies": {
  "mixin-node-client": "^0.6.0"
}
```
If you clone this repository, just execute **yarn** to download all dependency packages.


### Create you first app in developer dashboard
Create an app by following [tutorial](https://mixin-network.gitbook.io/mixin-network/mixin-messenger-app/create-bot-account).

### Generate parameter for your app
Remember to [generate parameter](https://mixin-network.gitbook.io/mixin-network/mixin-messenger-app/create-bot-account#generate-secure-parameter-for-your-app)
and write down required information: user id, session id, private key because they are required in config.js file soon.



![mixin_network-keys](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/mixin_network-keys.png)
In the folder, create a file: config.js. Copy the following content into it.
> config.js
```javascript
// NOTE: please update this config file with your app parameter
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
Replace the value with **YOUR APP** user id, sessionId, and the private key, you already generated them in dashboard.
We will introduce other parameter later.


### Hello world
Fill the following content in app.js. Create app.js if it is missing in your folder.
```javascript
const { SocketClient, isMessageType } = require('mixin-node-client');
const { HttpClient } = require('mixin-node-client');
const config = require('./config');
const client = new SocketClient(config);
const ValidActions = ["ACKNOWLEDGE_MESSAGE_RECEIPT" ,"CREATE_MESSAGE", "LIST_PENDING_MESSAGES"];

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
        const text = message.data.data.toLowerCase();
        if ( (message.data.category === "PLAIN_TEXT") && (message.action === "CREATE_MESSAGE") ) {
      	  var parameter4IncomingMsg = {"message_id":message.data.message_id, "status":"READ"};
      	  var RspMsg = {"id":client.getUUID(), "action":"ACKNOWLEDGE_MESSAGE_RECEIPT", "params":parameter4IncomingMsg};
      	  client.sendRaw(RspMsg);
          if (text === 'pay') {
          // todo: pay
          }
          return client.sendText(text, message);
        }
      }

      return Promise.resolve(message);
  } else console.log("unknow action")
  }));
client.on('error', err => console.error(err.message));
```
Run the code
```bash
node app.js
```
If something wrong, following content will be display
```bash
➜  nodejsdemo node app.js
Supported MessageSenders by SocketClient [ 'sendText',
  'sendImage',
  'sendVideo',
  'sendData',
  'sendSticker',
  'sendContact',
  'sendButton',
  'sendButtons',
  'sendApp' ]
[ 'sendText',
  'sendImage',
  'sendVideo',
  'sendData',
  'sendSticker',
  'sendContact',
  'sendButton',
  'sendButtons',
  'sendApp' ]
Message Received { id: '00000000-0000-0000-0000-000000000000',
  action: 'ERROR',
  error:
   { status: 202,
     code: 401,
     description: 'Unauthorized, maybe invalid token.' } }
```
If everything is ok, following is content will be display
```
➜  nodejsdemo node app.js
Supported MessageSenders by SocketClient [ 'sendText',
  'sendImage',
  'sendVideo',
  'sendData',
  'sendSticker',
  'sendContact',
  'sendButton',
  'sendButtons',
  'sendApp' ]
[ 'sendText',
  'sendImage',
  'sendVideo',
  'sendData',
  'sendSticker',
  'sendContact',
  'sendButton',
  'sendButtons',
  'sendApp' ]
Message Received { id: '30e3c929-f6b7-46c2-9e46-6634af66daab',
  action: 'LIST_PENDING_MESSAGES' }
```
In [Mixin Messenger](https://mixin.one/),add the bot as your friend,(for example, this bot id is 7000101639) and then send any text!

![mixin_messenger](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/mixin_messenger-sayhi.png)

The console will display following content
```bash
Message Received { id: 'de4671c2-8873-419b-92b0-0d6ae8381940',
  action: 'LIST_PENDING_MESSAGES' }
Message Received { id: 'a41816ca-2b65-4668-abdd-4526c1d29015',
  action: 'CREATE_MESSAGE',
  data:
   { type: 'message',
     representative_id: '',
     quote_message_id: '',
     conversation_id: 'c5458ec8-5e95-3e64-ae63-d4dfc3135c9e',
     user_id: '28ee416a-0eaa-4133-bc79-9676909b7b4e',
     message_id: 'a93ebfca-3d3f-44a9-9d63-3ad41ddca4b8',
     category: 'PLAIN_TEXT',
     data: 'hi',
     status: 'SENT',
     source: 'CREATE_MESSAGE',
     created_at: '2019-01-10T03:44:12.600158Z',
     updated_at: '2019-01-10T03:44:12.600158Z' } }
Message Received { id: '810b93d9-56d4-413a-9837-6dc241e36ed0',
  action: 'ACKNOWLEDGE_MESSAGE_RECEIPT' }
ignore receipt
Message Received { id: 'd45c5139-8201-4f8a-aa2f-86c98ba3a849',
  action: 'CREATE_MESSAGE',
  data:
   { type: 'message',
     representative_id: '',
     quote_message_id: '',
     conversation_id: '',
     user_id: 'daf8b473-39a0-4419-991a-77f30d28dd6d',
     message_id: '9054acea-1a62-4716-9fa3-1a8c70a2165a',
     category: '',
     data: '',
     status: 'SENT',
     source: 'CREATE_MESSAGE',
     created_at: '2019-01-10T03:44:22.540536153Z',
     updated_at: '2019-01-10T03:44:22.540536153Z' } }
Message Received { id: 'cf69c7a2-787b-4a91-be22-f51f38338179',
  action: 'ACKNOWLEDGE_MESSAGE_RECEIPT',
  data:
   { type: 'message',
     representative_id: '',
     quote_message_id: '',
     conversation_id: '',
     user_id: '',
     message_id: '9054acea-1a62-4716-9fa3-1a8c70a2165a',
     category: '',
     data: '',
     status: 'DELIVERED',
     source: 'ACKNOWLEDGE_MESSAGE_RECEIPT',
     created_at: '0001-01-01T00:00:00Z',
     updated_at: '2019-01-10T03:44:23.236843Z' } }
ignore receipt
Message Received { id: 'daa66945-abb6-4b8f-bc6a-04c4ccb6a837',
  action: 'ACKNOWLEDGE_MESSAGE_RECEIPT',
  data:
   { type: 'message',
     representative_id: '',
     quote_message_id: '',
     conversation_id: '',
     user_id: '',
     message_id: '9054acea-1a62-4716-9fa3-1a8c70a2165a',
     category: '',
     data: '',
     status: 'READ',
     source: 'ACKNOWLEDGE_MESSAGE_RECEIPT',
     created_at: '0001-01-01T00:00:00Z',
     updated_at: '2019-01-10T03:44:23.787562Z' } }
ignore receipt
```


### Source code explanation
To receive message from Mixin messenger user, the application need to create a connection to Mixin Messenger server. The application also need to create a token which is used in later communication.

[API of the operation](https://developers.mixin.one/api/beta-mixin-message/authentication/), [Guide of the operation](https://mixin-network.gitbook.io/mixin-network/mixin-messenger-app/receive-asset-change-notification)

> app.js
```javascript
const { SocketClient, isMessageType } = require('mixin-node-client');
const config = require('./config');
const client = new SocketClient(config);
```
Then issue a listener to receive and analyze the incoming messages

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

```javascript
if (ValidActions.indexOf(message.action) > -1) {
  if (message.action === 'ACKNOWLEDGE_MESSAGE_RECEIPT') {
    console.log("ignore receipt");return;
  }
  if (isMessageType(message, 'text')) {
    const text = message.data.data.toLowerCase();
    if ( (message.data.category === "PLAIN_TEXT") && (message.action === "CREATE_MESSAGE") ) {
      var parameter4IncomingMsg = {"message_id":message.data.message_id, "status":"READ"};
      var RspMsg = {"id":client.getUUID(), "action":"ACKNOWLEDGE_MESSAGE_RECEIPT", "params":parameter4IncomingMsg};
      client.sendRaw(RspMsg);
      if (text === 'pay') {
        // todo: pay
      }
      return client.sendText(text, message);
    }
  }
  return Promise.resolve(message);
} else console.log("unknow action")
```
Not only text messages, images and other type message can be received. You can find message details in [Here](https://developers.mixin.one/api/beta-mixin-message/websocket-messages/).

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

### End
Now your bot is running. You can try your idea now,enjoy!

Next: [Receive and send token](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README2.md)
