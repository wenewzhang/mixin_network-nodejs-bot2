const { SocketClient, isMessageType } = require('mixin-node-client');
const { HttpClient } = require('mixin-node-client');
const config = require('./config2');
const client = new SocketClient(config);
const receiverID = "0b4f49dc-8fb4-4539-9a89-fb3afc613747";
const coinID = "6cfe566e-4aad-470b-8c9a-2fd35b49c68d";

console.log('Supported MessageSenders by SocketClient', client.getMessageSenders());
console.log(client.getMessageSenders());
// Listen and react to socket messages
client.on(
  'message',
  client.getMessageHandler(message => {
    // console.log('Message Received', message);

    if (isMessageType(message, 'text')) {
      const text = message.data.data.toLowerCase();
      console.log(text);
      if (text === 'button') {
        return client.sendButton({
            label: 'Open Node.js Client SDK',
            color: '#FF0000',
            action: 'https://github.com/wangshijun/mixin-node-client',
          },
          message
        );
      }
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
      // if (text === 'refund') {
      //   asyncCall();
      // }
      if (text === 'contact') {
        return client.sendContact(
          '0b4f49dc-8fb4-4539-9a89-fb3afc613747',
          message);
      }

      if (text === 'app') {
        return client.sendApp({
            icon_url: 'https://images.mixin.one/PQ2dYjNNXYYCCcSi_jDxrh0PJM8XBaiwu4I5_5e7tJhpQNbCVULnc5VRzR4AHF2e7AK6mVpvaHxO0EZr24cUjbg=s256',
            title: 'Mixin Node.js SDK',
            description: 'Utilities to easy Mixin dapp development',
            action: 'https://github.com/wangshijun/mixin-node-client',
          },
          message
        );
      }

      return client.sendText(text, message);
    }

    return Promise.resolve(message);
  }));

client.on('error', err => console.error(err.message));

function resolveAfter2Seconds() {
  return new Promise(resolve => {
    var httpClient = new HttpClient(config);
    const Obj = {
      coinID,
      recipientId: receiverID,
        traceId: httpClient.getUUID(),
        amount: '0.01',
        memo: 'Test',
    };
    console.log('resolve...');
    console.log(Obj);
    console.log("end of Obj");
    // console.log(httpClient.getUUID());
    // Obj;
    httpClient.transferFromBot(Obj);
    // httpClient.createTransfer(Obj);
  });
}
async function asyncCall() {
  console.log('calling');
  var result = await resolveAfter2Seconds();
  console.log(result);
  // expected output: 'resolved'
}
