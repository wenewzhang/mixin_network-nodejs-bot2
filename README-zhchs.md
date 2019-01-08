# 第一课 一步一步教你用nodejs创建一个Mixin Network机器人
在本章中，你可以按教程在Mixin Messenger中创建一个bot来接收用户消息。在[第二课 发送与接收加密货币](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README2-zhchs.md)
你将学到如何给机器人转帐 或者 让机器人给你转账

[Mixin Network](https://mixin.one) 是一个免费的 极速的端对端加密数字货币交易系统.
通过这一系列教程，你将学会如何用nodejs创建一个机器人APP,让它能接受消息,转币给机器人同时机器人会闪电转回给你。

### 在你的电脑上安装node npm
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


### 创建你的第一个机器人
在写代码之前，我们先看一下面的图文教程，创建一个机器人APP [tutorial](https://mixin-network.gitbook.io/mixin-network/mixin-messenger-app/create-bot-account).

记下下面三项，这是机器人发送接收消息所必须的: user id, session id, private key, Mixin Network使用这三项进行数字签名。

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
### 下面我们来创建项目与代码

打开终端，切换到你的工作目录，创建一个 nodejs-bot 的目录
```bash
mkdir nodejs-bot
cd nodejs-bot/
yarn init
```
运行 **yarn init** 指令，按提示完成项目的创建， 完成后会生成package.json文件，代码例子如下：
```json
{
  "name": "nodejs-bot",
  "version": "1.0.0",
  "main": "app.js",
  "license": "MIT"
}
```
本教程需要安装依赖包 mixin-node-client,
> app.js
```javascript
const { SocketClient, isMessageType } = require('mixin-node-client');
```
执行 **yarn add mixin-node-client** 添加包
```bash
yarn add mixin-node-client
```
安装成功后, package.json 会自动添加上面的代码，如果你克隆了本代码，只需要在项目目录执行 **yarn** 来下载安装包.
```json
"dependencies": {
  "mixin-node-client": "^0.6.0"
}
```

### 下面对代码进行一个简单的解释
初始化连接， SocketClient会连接到服务器并利用签名信息进行登陆认证。
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

在手机上安装 [Mixin Messenger](https://mixin.one/),将你的机器人加为好友,(比如，这个机器人的ID是 7000101639) 然后就可以给它发消息了！

![mixin_messenger](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/mixin_messenger-sayhi.png)


## 第二课 发送与接收加密货币](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README2-zhchs.md)
