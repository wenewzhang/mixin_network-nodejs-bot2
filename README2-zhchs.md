在 [上一篇教程中](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README-zhchs.md), 我们创建了自动回复消息的机器人。

# 第二课: 机器人接收与处理加密货币
按本篇教程后学习后完成后，你的机器人将会接受用户发送过来的加密货币，然后立即转回用户。
After you follow the step introduced in this chapter, your bot can receive token from user and then pay it back immediately.

在开始之前， 开发者需要准备一些config.js的必备参数。


### 应用工具生成 config.js
> 如果你看过python,javascript或php的代码，你会发现在这没有Pin token选项，这会有一个aes key来替代它。



从mixin.one的开发者中心，点击"Click to generate a new session",拷贝新生成的所有数据 [Mixin.one Dashboard](https://developers.mixin.one/dashboard)
![copy config info from dashboard](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/copy-to-clipboard.png)

#### 安装一个工具mixin-cli，用它来生成 config.js
```bash
cd mixin_net-nodejs-bot2
yarn add mixin-cli
```

然后在终端里执行
```bash
wenewzha:mixin_network-nodejs-bot wenewzhang$ ./node_modules/mixin-cli/bin/mixin dapp:config
? What is the DAPP session info Press <enter> to launch your preferred editor.
```
如你所见，按"回车"将打开默认的编辑器，比如在我的电脑上，是打开vim,
粘贴剪切版里的数据，然后保存并退出。
As you see,"Press <enter> to launch your preferred editor.",for example, on my computer, it will open vim,
paste all the infomations into vim, save and quit!
![paste-to-vim](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/paste-to-vim.png)

回车三次，就产生了一个临时文件，比如config_mixin_1546851899846.js

```bash
wenewzha:mixin_network-nodejs-bot wenewzhang$ ./node_modules/mixin-cli/bin/mixin dapp:config
? What is the DAPP session info Received
? Which config format do you prefer? [Plain Javascript] can be required from any js code
? What is the filename for generated config file config_mixin_1546851899846.js
✔︎ sessionInfo was successfully decoded!
✔︎ Config file written to /Users/wenewzhang/Documents/sl/mixin_network-nodejs-bot/config_mixin_1546851899846.js
✔︎ Press ctrl+v and then enter to view file content
```

生成的config.js如下：
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
你还需要补充以下数据，才是一个完整的config.js
- **clientId** 在dashboard可以找到
- **client secret** 左dashboard 点击 "Click to generate a new secret"生成一个！

一个完整的例子如下： [here](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/config2.js)

## 源代码解释
> app2.js
```javascript
//定义可接受的消息名称
const ValidActions = ["ACKNOWLEDGE_MESSAGE_RECEIPT" ,"CREATE_MESSAGE", "LIST_PENDING_MESSAGES"];
```

创建一个支付链接，影响用户的**pay**指令
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
用户点击链接，依提示在Mixin Messenger里支付,如下图:
![pay-link](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/pay-link.png)

开发者可以支付任意的币给机器人，机器人在收到币后，立即转回给开发者!
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
操作如下图所示：
![transfer and tokens](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/transfer-any-tokens.jpeg)
如果机器人收到币，jsData.amount大于零；如果机器人支付币给用户，接收到的消息是一样的，唯一不同的是 jsData.amount是一个负数.

[完整的例子请点击](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/app2.js)
