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
          //todo: tell the server you got this message
          if (text === 'pay') {
          // todo: pay
          }
          return client.sendText(text, message);
        }
      }

      return Promise.resolve(message);
  } else console.log("unknow action")
  }));

// Array.prototype.contains = function(element){
//     return this.indexOf(element) > -1;
// };
client.on('error', err => console.error(err.message));
