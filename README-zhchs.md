# 第一课 一步一步教你用nodejs创建一个Mixin Network机器人
[Mixin Network](https://mixin.one) 是一个免费的 极速的端对端加密数字货币交易系统.
在本章中，你可以按教程在Mixin Messenger中创建一个bot来接收用户消息, 学到如何给机器人转**比特币** 或者 让机器人给你转**比特币**.


## 课程简介
1. [创建一个接受消息的机器人](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README-zhchs.md#创建你的第一个机器人)
2. [机器人接受比特币并立即退还用户](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README2-zhchs.md)

## 创建一个接受消息的机器人
通过本教程，你将学会如何用nodejs创建一个机器人APP,让它能接受消息.

### Node.js的环境安装
本教程是用node.js写的，在开始之前，我们先安装node与yarn

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
### 下面我们来创建一个项目目录
打开终端，切换到你的工作目录，创建一个 nodejs-bot 的目录
```bash
mkdir nodejs-bot
cd nodejs-bot/
```
运行 **yarn init** 指令，按提示完成项目的创建， 完成后会生成package.json文件，代码例子如下：
```bash
yarn init
```
```json
{
  "name": "nodejs-bot",
  "version": "1.0.0",
  "main": "app.js",//默认生成的名字是main.js
  "license": "MIT"
}
```
本教程需要依赖一个SDK, [wangshijun/mixin-node-client](https://github.com/wangshijun/mixin-node-client). 所以我们先下载这个库.
在新生成的项目目录下，执行 **yarn add mixin-node-client** 来添加mixin-node-client
```bash
yarn add mixin-node-client
```
现在，package.json会增加下面几行:
```json
"dependencies": {
  "mixin-node-client": "^0.6.0"
}
```
如果你是克隆这个教程,在项目目录下执行 **yarn** 来下载安装依赖的软件包.

### 创建你的第一个机器人
在写代码之前，我们先看一下面的图文教程，创建一个机器人APP [教程](https://mixin-network.gitbook.io/mixin-network-cn/messenger-ying-yong-kai-fa/chuang-jian-ji-qi-ren).

记住下面三项，这是机器人发送接收消息所必须的: user id, session id, private key, Mixin Network使用这三项进行数字签名。

| 关键字 | 描述                                  |   例子                                         |
| --- | -------------------------------------------- |  -------------------------------------------------
| user id | 机器人的唯一标识, uuid | 21042518-85c7-4903-bb19-f311813d1f51          |
| session id | 会话标识, uuid | 5eb96d87-028e-4199-a6d3-6fc7da8dfe41          |
| private key | RSA 私钥  | -----BEGIN RSA PRIVATE KEY----- -----END RSA PRIVATE KEY-----


![mixin_network-keys](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/mixin_network-keys.png)

创建一个config.js文件, 替换clientID为你的机器人的id, sessionId 为你的机器人的session id, privateKey为你的私钥,aesKey,clientSecret, assetPin 我们后面才需要，这里可先不修改，但请保留这个数据不要删除！
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
### Hello world
在项目目录下创建一个app.js, 并将下面的代码粘贴进去.
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
开始执行
```bash
node app.js
```
如果你的配置文件有错，可能会出现下面的提示：
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
如果一切顺利，机器人将连接上服务器并等待服务器的消息,提示如下:
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
打开[Mixin Messenger](https://mixin.one/),将你的机器人加为好友,(比如，这个机器人的ID是 7000101639) 然后就可以给它发消息了！
比如你发一个"hi"

![mixin_messenger](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/mixin_messenger-sayhi.png)

终端将显示如下：
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

### 下面对代码进行一个简单的解释

机器人接受消息前，先建立到服务器的连接，再利用签名信息进行登陆认证。

[API调用](https://developers.mixin.one/api/beta-mixin-message/authentication/)
> app.js
```javascript
const { SocketClient, isMessageType } = require('mixin-node-client');
const config = require('./config');
const client = new SocketClient(config);
```
开启一个侦听，在这对收到的消息进行处理

```javascript
client.on(
  'message',
  client.getMessageHandler(message => {
    console.log('Message Received', message);
    return Promise.resolve(message);
  })
);
```
接收消息, 进行**pay**相关的逻辑处理
```javascript
if (ValidActions.indexOf(message.action) > -1) {
  if (message.action === 'ACKNOWLEDGE_MESSAGE_RECEIPT') {console.log("ignore receipt");return;}

  if (isMessageType(message, 'text')) {
    const text = message.data.data.toLowerCase();
    if ( (message.data.category === "PLAIN_TEXT") && (message.action === "CREATE_MESSAGE") ) {
      //todo: tell the server you got this message
      if (text === 'pay') {
        //todo: pay
      }
      return client.sendText(text, message);
    }
  }
  return Promise.resolve(message);
} else console.log("unknow action")
```
除了发送文本消息之外，还可以发送图片等消息，详细的消息类型请参考[这里](https://developers.mixin.one/api/beta-mixin-message/websocket-messages/).

对于每一条接收到的消息，将消息号（message_id)做为参数，回应服务器，action为ACKNOWLEDGE_MESSAGE_RECEIPT! 如果不回应，机器人下次登入，会重新获得消息。
```javascript

    if ( (message.data.category === "PLAIN_TEXT") && (message.action === "CREATE_MESSAGE") ) {
    //  READ message start
        var parameter4IncomingMsg = {"message_id":message.data.message_id, "status":"READ"};
        var RspMsg = {"id":client.getUUID(), "action":"ACKNOWLEDGE_MESSAGE_RECEIPT", "params":parameter4IncomingMsg};
        client.sendRaw(RspMsg);
    // READ message end
      return client.sendText(text, message);
```

### 最后, 执行 **node app.js** 将机器人上线！
```bash
node app.js
```
## [第二课 发送与接收加密货币](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README2-zhchs.md)
