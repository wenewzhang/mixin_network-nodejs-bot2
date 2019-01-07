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

//let the server know that i have read this message
          var parameter4IncomingMsg = {"message_id":message.data.message_id, "status":"READ"};
          var RspMsg = {"id":client.getUUID(), "action":"ACKNOWLEDGE_MESSAGE_RECEIPT", "params":parameter4IncomingMsg};
          client.sendRaw(RspMsg);

          if (jsData.amount > 0) {
            //refund immediately
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
