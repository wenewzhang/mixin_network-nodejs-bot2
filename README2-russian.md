![cover](https://github.com/wenewzhang/mixin_network-nodejs-bot2/raw/master/Bitcoin_node.jpg)
В [предыдущем разделе](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README-russian.md), мы создавали своё первое приложение. 

# Как получить и отправить биткойн?
В этом разделе мы расскажем, как ваш бот сможет получать от пользователя биткойны, и сразу возвращать их.

### Подготовьте AES ключ
Допишите в `config.js` недостающие параметры.

Как создать `config.js`, смотрите в  [предыдущем разделе](https://github.com/bartov-e/mixin_network-nodejs-bot2/blob/master/README.md#%D1%81%D0%B3%D0%B5%D0%BD%D0%B5%D1%80%D0%B8%D1%80%D1%83%D0%B9%D1%82%D0%B5-%D0%BA%D0%BB%D1%8E%D1%87-%D0%B2%D0%B0%D1%88%D0%B5%D0%B3%D0%BE-%D0%BF%D1%80%D0%B8%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D1%8F-%D0%B2-%D0%BF%D0%B0%D0%BD%D0%B5%D0%BB%D0%B8-%D0%B8%D0%BD%D1%81%D1%82%D1%80%D1%83%D0%BC%D0%B5%D0%BD%D1%82%D0%BE%D0%B2).

Теперь мы покажем каким образом можно сгенерировать AES ключ для `config.js`

У вас должен быть код, который вы сгенерировали в панели инструментов.

### Установите утилиту с поддержкой командной строки (mixin-cli) и создайте из неё config.js
Откройте терминал и загрузите утилиту через `yarn`
```bash
cd mixin_net-nodejs-bot2
yarn add mixin-cli
```

Выполните команду с аргументом `dapp:config`
```bash
$ ./node_modules/mixin-cli/bin/mixin dapp:config
? What is the DAPP session info Press <enter> to launch your preferred editor.
```
Если нажать `<enter>`, то, откроется текстовый редактор по умолчанию (в моём случае это VIM). 

Теперь перейдите в панель инструментов, скопируйте оттуда [код сессии](https://mixin-network.gitbook.io/mixin-network/mixin-messenger-app/create-bot-account#generate-session-key-for-your-app), вставьте в vim, сохраните файл и выходите из редактора. 
![generated session ](https://github.com/myrual/mixin_network-nodejs-bot2/raw/master/Generated_session_content.png)
![paste-to-vim](https://github.com/wenewzhang/mixin_network-nodejs-bot2/raw/master/paste-to-vim.png)

В рабочей папке появится новый конфигурационный файл.  На моём компьютере это  `config_mixin_1546851899846.js`

```bash
$ ./node_modules/mixin-cli/bin/mixin dapp:config
? What is the DAPP session info Received
? Which config format do you prefer? [Plain Javascript] can be required from any js code
? What is the filename for generated config file config_mixin_1546851899846.js
✔︎ sessionInfo was successfully decoded!
✔︎ Config file written to /Users/wenewzhang/Documents/sl/mixin_network-nodejs-bot/config_mixin_1546851899846.js
✔︎ Press ctrl+v and then enter to view file content
```


Код сгенерированного файла `config.js`:
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
Теперь скопируйте недостающее содержимое из файла `config.js`, который мы подготовили по инструкциям из предыдущего раздела, в файл `config_mixin_1xx.js`.  Затем переименуйте `config_mixin_1xx.js` в `config2.js`:

Файл `config2.js` целиком можно посмотреть [здесь](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/config2.js)

Теперь надо создать файл `app2.js`, инструкции ниже.
### Начните работу с биткойном
```javascript
const { SocketClient, isMessageType } = require('mixin-node-client');
const { HttpClient } = require('mixin-node-client');
const config = require('./config2');
const client = new SocketClient(config);

const ValidActions = ["ACKNOWLEDGE_MESSAGE_RECEIPT" ,"CREATE_MESSAGE", "LIST_PENDING_MESSAGES"];

const receiverID = "0b4f49dc-8fb4-4539-9a89-fb3afc613747";
const coinID = "6cfe566e-4aad-470b-8c9a-2fd35b49c68d";

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
        console.log('----------------------text-------------------------');
        const text = message.data.data.toLowerCase();
        if ( (message.data.category === "PLAIN_TEXT") && (message.action === "CREATE_MESSAGE") ) {
          var parameter4IncomingMsg = {"message_id":message.data.message_id, "status":"READ"};
          var RspMsg = {"id":client.getUUID(), "action":"ACKNOWLEDGE_MESSAGE_RECEIPT", "params":parameter4IncomingMsg};
          client.sendRaw(RspMsg);

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

    // todo: catch a error when balance insufficient
    //       (node:55535) UnhandledPromiseRejectionWarning: Error: Insufficient balance.
    // at HttpClient.(anonymous function) [as createTransfer] (/Users/wenewzhang/Documents/sl/mixin_network-nodejs-bot2/node_modules/mixin-node-client/lib/http.js:99:23)
    // at process.internalTickCallback (internal/process/next_tick.js:77:7)
          if (text === 'refund') {
            asyncRefundCall(coinID,'0.00001',receiverID);
          }
          return client.sendText( message.data.data, message);
        }
      }
      if (message.data && message.data.category === "SYSTEM_ACCOUNT_SNAPSHOT") {
          console.log("-----------the bot got money!---------------");

          var jsData = JSON.parse(Buffer.from(message.data.data, 'base64').toString('utf-8'));
          console.log(jsData);

//сообщите на сервер, что сообщение прочитано
          var parameter4IncomingMsg = {"message_id":message.data.message_id, "status":"READ"};
          var RspMsg = {"id":client.getUUID(), "action":"ACKNOWLEDGE_MESSAGE_RECEIPT", "params":parameter4IncomingMsg};
          client.sendRaw(RspMsg);

          if (jsData.amount > 0) {
            //и сразу же верните сумму 
            asyncRefundCall(jsData.asset_id,jsData.amount,jsData.opponent_id);
          } else console.log("refund success!");
          console.log("-----------end of bot got money!---------------");
      }
      return Promise.resolve(message);
  } else console.log("unknow action")
  }));

client.on('error', err => console.error(err.message));

function refundInstant(_assetID,_amount,_opponent_id) {
  return new Promise(resolve => {
    var httpClient = new HttpClient(config);
    const Obj = {
      assetId: _assetID,
      recipientId: _opponent_id,
        traceId: httpClient.getUUID(),
        amount: _amount,
        memo: '',
    };
    console.log('resolve...');
    console.log(Obj);
    console.log("end of Obj");
    httpClient.transferFromBot(Obj);
  })
}
async function asyncRefundCall(_assetID,_amount,_opponent_id) {
  console.log('calling asyncCall');
  var result = await refundInstant(_assetID,_amount,_opponent_id);
  console.log(result);
}

```
### Сгенерируйте URL платежа и верните его пользователю
Можно заплатить 0.001 биткойн боту, нажав на кнопку, и 0.001 биткойн будет возвращен в течение 1 секунды. Оплата может быть в любой криптовалюте. 
![pay-link](https://github.com/wenewzhang/mixin_network-nodejs-bot2/raw/master/Pay_and_refund_quickly.jpg)

Разработчик может отправить токен своим ботам в панели сообщений. Бот получает токены и сразу же возвращает их.
![transfer and tokens](https://github.com/wenewzhang/mixin_network-nodejs-bot2/raw/master/transfer-any-tokens.jpg)

## Пояснения к исходному коду
> app2.js
```javascript
//define acceptable actions
const ValidActions = ["ACKNOWLEDGE_MESSAGE_RECEIPT" ,"CREATE_MESSAGE", "LIST_PENDING_MESSAGES"];
```

Создайте ссылку на оплату после отправления боту запроса  `'pay'`
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

```javascript
if (message.data && message.data.category === "SYSTEM_ACCOUNT_SNAPSHOT") {
    var jsData = JSON.parse(Buffer.from(message.data.data, 'base64').toString('utf-8'));
//сообщите на сервер, что сообщение прочитано
    var parameter4IncomingMsg = {"message_id":message.data.message_id, "status":"READ"};
    var RspMsg = {"id":client.getUUID(), "action":"ACKNOWLEDGE_MESSAGE_RECEIPT", "params":parameter4IncomingMsg};
    client.sendRaw(RspMsg);
    if (jsData.amount > 0) {
      //и сразу же верните сумму
      asyncRefundCall(jsData.asset_id,jsData.amount,jsData.opponent_id);
    } else console.log("refund success!");
}
```
- Если бот отправляет токен пользователю, то сумма `jsData.amount` отрицательна
- Если пользователь отправляет токен боту, то сумма `jsData.amount` положительна.

`App2.js` полностью можно посмотреть [здесь](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/config2.js)
