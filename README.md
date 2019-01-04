# Howto create nodejs bot for Mixin Network step by step
Mixin Network is a cryptocurrency payment which confirm the transactions instantly,  users can deposit, withdraw and pay bitcoin or altcoins through [Mixin Messenger](https://mixin.one/),
the developers could earn money from the user's exchanges. It's a excellent ecosystem.

This article will show you howto create a nodejs-bot which let your bot receive message from any user.

### First of all, install npm node on your OS
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


### Then, create you first bot through [Mixin.One](https://developers.mixin.one/dashboard),if you get a "Invaild Data" message,Just finish all the required options.
write down three required infomations: user id, session id, private key, mixin-node sign the token with them.

| Key | Description                                  |   example                                         |
| --- | -------------------------------------------- |  -------------------------------------------------
| user id | unique bot identity, uuid,for token signature | 21042518-85c7-4903-bb19-f311813d1f51          |
| session id | session identity, uuid,for token signature | 5eb96d87-028e-4199-a6d3-6fc7da8dfe41          |
| private key | RSA private key for token signature  | -----BEGIN RSA PRIVATE KEY----- -----END RSA PRIVATE KEY-----


![mixin_network-keys](https://github.com/wenewzhang/mixin_network-nodejs-bot/blob/master/mixin_network-keys.png)
Open the terminal and go to the workspace, make nodejs-bot directory
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
Initial the connection and sign the token.
> app.js
```javascript
const {
  SocketClient, isMessageType
} = require('mixin-node-client');
const config = require('./config');
const client = new SocketClient(config);
```
issue a listener to the incoming message
```javascript
client.on(
  'message',
  client.getMessageHandler(message => {
    console.log('Message Received', message);
    return Promise.resolve(message);
  })
);
```
process the question **pay**
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
open config.js, replace your clientId with user id, sessionId with session id, aesKey with session token,  and the private key with your's.
> config.js
```javascript
module.exports = {
  clientId: 'xxx42518-85c7-4903-bb19-f311813d1f51',
  clientSecret: 'xxxa86a80be17601f404ad643e5c85ed4f7f5f9f7a159723021790bf9f78fe15',
  aesKey: 'xxxOTb2+zjhi9fJ2H1UdULEKx8EMJgbFV2jNjCwcup8HqQorjm6eWeVLvtig5nY2F7FxCTYstzVEXL8w8kFf3xvAbGUJKIxnuVkOfkkjqIE0CGa18oEf1mJYywMdJW04xeG6XPEF/o45aWSW0B69FtnzFfzYj+4egQneUR789NY=',
  assetPin: '805385',
  sessionId: '17195948-bcce-4eb3-bbd7-0ebc5db9a3ba',
  privateKey: `-----BEGIN RSA PRIVATE KEY-----
MIxxxxIBAAKBgQCvPlRan2k7qWuC+8FZ6bkz68JXxaucj+sDJ3hoZKW0B0JauIlg
BGkS8RChRmGdVXOaQHym3U+JU+AFPKiCYKl2wnFhWH1q2ckqatLEjzgSAm5rMWaR
Eg/pKS/lGmbwY1rKAa8lxeNCvLhPaj+ChC4IdlirtupFeq8rw50CCJA/EwIDAQAB
AoGAR0hRQ7OIOK6HfvYtBgfeP9JscQuE7OBVtii9/6jBBmPVh9V8e8QPgZbxLsjU
OA1kQqBsk+t9yNyHSVoNKUtsYqeAShPA50F4B46zXbR5+4qcXsiaWFt58ylJQlHS
ikgFH4ScNrcYi6zDoc4/Eb+F6CDZzbovElss+bhKCktVTGECQQDlrQ41rWa/Mjrs
CozqG6fCruOz1EXSIQ2RT/avsDrIusuziSVjCaQph2lhiMsBnmw5Vc7u5LTluFb1
7FRbJaCrAkEAw1QqEpfT/Rh9sPWKSnrQRFHxuufFjoqOgbnUdXYAqBgiAyGl7m3O
sXd53ZtFa1MiGTsI/oV5IPIZEcw72RhrOQJBAI5akLAcZc6jp3mdoHGJ6pT0KRXQ
v+XZrrseQNvr8sNvY8pHevDDjQhgcaSOUKUUOCfhU30mLCkl9GBAtpg33jkCQFhB
szDrgVGeu0w15eJ5U5lLHVpCVzVsza839BOO2gUZwmR/06XD39y4C0xiWB+CVKnp
zsqSLIUCXul3yqLxMaECQDJV29UtQCQh1wmpSLE3EfKsTIGuawlg0A8sv/Egmq5h
zcEd2Ye+otVEB312xtXT1VZgKie3GDFee53Yf2jZBYY=
-----END RSA PRIVATE KEY-----`,
};

```
### Finally, you can run **node app.js** to take the bot online.
```bash
node app.js
```

install [Mixin Messenger](https://mixin.one/),add the bot as your friend,(for example, this bot id is 7000101639) and then send command!
enjoy!

![mixin_messenger](https://github.com/wenewzhang/mixin_network-nodejs-bot/blob/master/mixin_messenger-bot.jpeg)
