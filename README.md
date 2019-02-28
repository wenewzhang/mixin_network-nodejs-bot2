# Node.js Bitcoin tutorial based on Mixin Network
![cover](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/Bitcoin_node.jpg)
A Mixin messenger bot will be created in this tutorial. The bot is powered by Node.js and echo message and Bitcoin from user.

Full Mixin network resource [index](https://github.com/awesome-mixin-network/index_of_Mixin_Network_resource)

## What you will learn from this tutorial
1. [How to create bot in Mixin messenger and reply message to user](https://github.com/wenewzhang/mixin_network-nodejs-bot2#create-bot-and-receive-message-from-user)
2. [How to receive Bitcoin and send Bitcoin in Mixin Messenger](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README2.md)

## How to create bot in Mixin messenger and reply message to user

### Node.js enviroment setup:
This tutorial is written in [Node.js](https://nodejs.org) and relys on [yarn](https://yarnpkg.com). You need to install yarn node.

macOS
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
### Create Yarn project folder
Open the terminal and go to the workspace, make nodejs-bot directory
```bash
mkdir nodejs-bot
cd nodejs-bot/
```
Run **yarn init** command to create the project by following instruction.
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
This tutorial need a library [wangshijun/mixin-node-client](https://github.com/wangshijun/mixin-node-client). So we need to download the library.

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


### Create your first app in Mixin Network developer dashboard
You need to create an app in dashboard. This [tutorial](https://mixin-network.gitbook.io/mixin-network/mixin-messenger-app/create-bot-account) can help you.

### Generate parameter of your app in dashboard
After app is created in dashboard, you still need to [generate parameter](https://mixin-network.gitbook.io/mixin-network/mixin-messenger-app/create-bot-account#generate-secure-parameter-for-your-app)
and write down required content, these content will be written into config.js file.



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
Replace the value with **content generated in dashboard**.


### Hello, world in Node.js
Fill the following content into app.js. Create app.js if it is missing in your folder.
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
Console will output something
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
Console will ouput log
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
Add the bot as your friend in [Mixin Messenger](https://mixin.one/messenger) and send some words(for example, this bot id is 7000101639).

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


### Source code summary
The code creates a websocket, generates a valid token and creates connection between the websocket and Mixin Messenger server. Messages will be pushed to websocket client.

[API of the operation](https://developers.mixin.one/api/beta-mixin-message/authentication/), [Guide of the operation](https://mixin-network.gitbook.io/mixin-network/mixin-messenger-app/receive-asset-change-notification)

> app.js
```javascript
const { SocketClient, isMessageType } = require('mixin-node-client');
const config = require('./config');
const client = new SocketClient(config);
```
Issue a listener to receive and analyze the incoming messages

```javascript
client.on(
  'message',
  client.getMessageHandler(message => {
    console.log('Message Received', message);
    return Promise.resolve(message);
  })
);
```
Analyze messages from user and do something when received a 'pay' text  **pay**

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
Not only text messages, images and other type message will be pushed to bot. Full message format [introduction](https://developers.mixin.one/api/beta-mixin-message/websocket-messages/).

Websocket client should send the READ message to the server so it knows message has been read. The bot will receive the duplicated message when the bot connected to server again if bot don't send response.
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
Now your bot worked. You can hack it.

Next: [Receive and send Bitcoin](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README2.md)
