# How to trade bitcoin through Nodejs
![cover](https://github.com/wenewzhang/mixin_network-nodejs-bot2/raw/master/Bitcoin_node.jpg)

## Solution One: pay to ExinCore API
[Exincore](https://github.com/exinone/exincore) provide a commercial trading API on Mixin Network.

You pay USDT to ExinCore, ExinCore transfer Bitcoin to you on the fly with very low fee and fair price. Every transaction is anonymous to public but still can be verified on blockchain explorer. Only you and ExinCore know the details.

ExinCore don't know who you are because ExinCore only know your client's uuid.

### Pre-request:
You should  have created a bot based on Mixin Network. Create one by reading [Nodejs Bitcoin tutorial](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README.md).

#### Install required packages
As you know, we introduce you the **mixin-node-client** in [chapter 1](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README.md), assume it has installed before, let's install others here.

```bash
  yarn add fast-csv inquirer msgpack5 path pem-file
```
or
```bash
  npm i fast-csv inquirer msgpack5 path pem-file
```

#### Deposit USDT or Bitcoin into your Mixin Network account and read balance
The ExinCore can exchange between Bitcoin, USDT, EOS, ETH etc. Here show you how to exchange between USDT and Bitcoin,
Check the wallet's balance & address before you make order.

- Check the address & balance, remember it Bitcoin wallet address.
- Deposit Bitcoin to this Bitcoin wallet address.
- Check Bitcoin balance after 100 minutes later.

**By the way, Bitcoin & USDT 's address are the same.**

```js
  let aesKey = '';
  const privateKeyBytes = pem.decode(Buffer.from(data[0]));
  const aesKeyBuffer = await oaepDecrypt(
    Buffer.from(data[1], 'base64'),
    privateKeyBytes,
    'SHA-256',
    Buffer.from(data[2])
  );
  aesKey = Buffer.from(aesKeyBuffer).toString('base64');
  // console.log(aesKey);
  const newUserConfig = {clientId: data[3], aesKey: aesKey,
                         privateKey: data[0], sessionId: data[2],
                         clientSecret: "do not need", assetPin: data[4]};
  // console.log(newUserConfig);
  const newUserClient = new HttpClient(newUserConfig);
  if ( args.type === TYPE_ASSETS_INFO ) {
    const assetsInfo = await newUserClient.getUserAssets();
    console.log(assetsInfo);
  } else if (args.type === TYPE_BITCOIN_INFO) {
     // console.log('You choice to 1:', args);
     const assetInfo = await newUserClient.getUserAsset(BTC_ASSET_ID);
     console.log("Bitcoin address is ", assetInfo.public_key);
     console.log("Bitcoin balance is ", assetInfo.balance);
     console.log("Bitcoin price is (USD) ", assetInfo.price_usd);
```

#### Read market price
How to check the coin's price? You need understand what is the base coin. If you want buy Bitcoin and sell USDT, the USDT is the base coin. If you want buy USDT and sell Bitcoin, the Bitcoin is the base coin.

```js

  if (  args.type === TYPE_FETCH_USDT_MARKETINFO ) {
   // Make a request
   var instance = axios.create({
   baseURL: 'https://exinone.com/exincore/markets',
   timeout: 3000,
   headers: {'X-Custom-Header': 'foobar'}
   });
   instance.get('?base_asset=' + USDT_ASSET_ID)
   .then(function(response) {
     console.log(response.data.data);
   });
  } else if (  args.type === TYPE_FETCH_BTC_MARKETINFO ) {
  var instance = axios.create({
  baseURL: 'https://exinone.com/exincore/markets',
  timeout: 3000,
  headers: {'X-Custom-Header': 'foobar'}
  });
  instance.get('?base_asset=' + BTC_ASSET_ID)
  .then(function(response) {
    console.log(response.data.data);
  });
  }
```

#### Create a memo to prepare order
The chapter two: [Echo Bitcoin](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README2.md) introduce transfer coins. But you need to let ExinCore know which coin you want to buy. Just write your target asset into memo.
```js
const bytes = Buffer.from(
  BTC_ASSET_ID.replace(/-/g, ''),
  'hex'
);
const memo = msgpack
  .encode({
    A: bytes,
  })
  .toString('base64');

console.log(memo);
```

#### Pay BTC to API gateway with generated memo
Transfer Bitcoin(BTC_ASSET_ID) to ExinCore(EXIN_BOT), put you target asset uuid in the memo, otherwise, ExinCore will refund you coin immediately!
```js
const EXIN_BOT         =    "61103d28-3ac2-44a2-ae34-bd956070dab1";
const BTC_ASSET_ID     =    "c6d0c728-2624-429b-8e0d-d9d19b6592fa";
const EOS_ASSET_ID     =    "6cfe566e-4aad-470b-8c9a-2fd35b49c68d";
const USDT_ASSET_ID    =    "815b0b1a-2764-3736-8faa-42d694fa620a";

//change to your third exchange/cold  btc wallet address
const BTC_WALLET_ADDR  =    "14T129GTbXXPGXXvZzVaNLRFPeHXD1C25C";
const EOS_WALLET_NAME  =    "huobideposit";
const EOS_WALLET_TAG   =    "1872050";
//change to your mixin messenger account 's uuid
const MASTER_UUID      =    "0b4f49dc-8fb4-4539-9a89-fb3afc613747";

else if ( args.type === TYPE_EXCHANGE_BTC_USDT ) {
  // Pack memo
  const bytes = Buffer.from(
    USDT_ASSET_ID.replace(/-/g, ''),
    'hex'
  );
  const memo = msgpack
    .encode({
      A: bytes,
    })
    .toString('base64');

  console.log(memo); // gaFBxBDG0McoJiRCm44N2dGbZZL6
  const assetInfo = await newUserClient.getUserAsset(BTC_ASSET_ID);
  console.log("The Wallet 's BTC balance is ", assetInfo.balance);
  if ( assetInfo.balance >= 0.0001 ) {
    const Obj = {
      assetId: BTC_ASSET_ID,
      recipientId: EXIN_BOT,
        traceId: newUserClient.getUUID(),
        amount: "0.0001",
        memo: memo,
      }
      console.log(Obj);
      newUserClient.transferFromBot(Obj);
  } else {
    console.log("Not enough BTC!");
  }
}
```
If you want sell USDT buy BTC, call it like below:
```js
else if ( args.type === TYPE_EXCHANGE_USDT_BTC ) {
 // Pack memo
 const bytes = Buffer.from(
   BTC_ASSET_ID.replace(/-/g, ''),
   'hex'
 );
 const memo = msgpack
   .encode({
     A: bytes,
   })
   .toString('base64');

 console.log(memo);
 const assetInfo = await newUserClient.getUserAsset(USDT_ASSET_ID);
 console.log("The Wallet 's BTC balance is ", assetInfo.balance);
 if ( assetInfo.balance >= 1 ) {
   const Obj = {
     assetId: USDT_ASSET_ID,
     recipientId: EXIN_BOT,
       traceId: newUserClient.getUUID(),
       amount: "1",
       memo: memo,
     }
     console.log(Obj);
     newUserClient.transferFromBot(Obj);
 } else {
   console.log("Not enough USDT!");
 }
}
```

The ExinCore should transfer the target coin to your bot, meanwhile, put the fee, order id, price etc. information in the memo, unpack the data like below.
- **getSnapshots** Read snapshots of the user.
```js
if ( args.type === TYPE_READ_SNAPSHOTS ) {
  const prompts = [
    {
      name: 'datetime',
      type: 'input',
      message: "Input iso8601 datetime: ",
    },
  ];
 const answers = await inquirer.prompt(prompts);
 console.log(answers);
 console.log(encodeURIComponent(answers.datetime));
 const snapshots = await newUserClient.getSnapshots({ limit: 10, asset: USDT_ASSET_ID, offset: answers.datetime, order: "ASC"});
 // console.log(snapshots);
 snapshots.forEach(function(element) {
   if ( element.amount > 0) {
     if ( element.data != null ) {
        console.log(element.amount);
        console.log(element.data);
        const buf = Buffer.from(element.data, 'base64');
        console.log(msgpack.decode(buf));
        const codeInt = msgpack.decode(buf).C;
        if ( codeInt === 1000 ) {
          console.log("Successful Exchange");
        } else { console.log("Go to there get more info https://github.com/exinone/exincore#code error code: " + codeStr);}

        const hexStr = Buffer.from(msgpack.decode(buf).FA).toString('hex');
        const uuid = `${hexStr.slice(0,8)}-${hexStr.slice(8,12)}-${hexStr.slice(12,16)}-${hexStr.slice(16,20)}-${hexStr.slice(20)}`;
        console.log("Asset uuid is :" + uuid);
        const priceStr = msgpack.decode(buf).P;
        console.log("Price is :" + priceStr);
        const feeStr = msgpack.decode(buf).F;
        console.log("Fee is :" + feeStr);
        console.log("percent of Fee is :" + (feeStr/element.amount)* 100 + " %");
        const tStr = msgpack.decode(buf).T;
        console.log("T is :" + tStr);
     }
   }
 });
}
```

If you coin exchange successful, console output like below:
```bash
Make your choose 16: Read snapshots
You choice to : { type: '16: Read snapshots' }
You wallet is : 0b10471b-1aed-3944-9eda-5ab947562761
? Input iso8601 datetime:  2019-04-08T05:16:33.615253Z
{ datetime: '2019-04-08T05:16:33.615253Z' }
2019-04-08T05%3A16%3A33.615253Z
0.5228004
hqFDzQPooVCnNTI0OC45OKFGqTAuMDAxMDQ5OKJGQcQQgVsLGidkNzaPqkLWlPpiCqFUoVKhT8QQeJyt3MrqSGOpbqzFXy5JUw==
{ C: 1000,
  P: '5248.98',
  F: '0.0010498',
  FA: <Buffer 81 5b 0b 1a 27 64 37 36 8f aa 42 d6 94 fa 62 0a>,
  T: 'R',
  O: <Buffer 78 9c ad dc ca ea 48 63 a9 6e ac c5 5f 2e 49 53> }
Successful Exchange
Asset uuid is :815b0b1a-2764-3736-8faa-42d694fa620a
Price is :5248.98
Fee is :0.0010498
percent of Fee is :0.2008032128514056 %
T is :R
 You select the : 0b10471b-1aed-3944-9eda-5ab947562761
You select the wallet 0b10471b-1aed-3944-9eda-5ab947562761
```

#### Read Bitcoin balance
Check the wallet's balance.
```js
if (args.type === TYPE_BITCOIN_INFO) {
   // console.log('You choice to 1:', args);
   const assetInfo = await newUserClient.getUserAsset(BTC_ASSET_ID);
   console.log("Bitcoin address is ", assetInfo.public_key);
   console.log("Bitcoin balance is ", assetInfo.balance);
   console.log("Bitcoin price is (USD) ", assetInfo.price_usd);
}
```

## Source code usage
Build it and then run it.

- [x] **node  bitcoin-wallet-nodejs.js**  build project.

Commands list of this source code:

-  0: Read All Asssets Balance
-  1: Read Bitcoin Balance & Address
-  2: Read USDT Balance & Address
-  3: Read EOS Balance & Address
-  4: Transfer BTC from Bot to Wallet
-  5: Transfer EOS from Bot to Wallet
-  6: Transfer BTC from Wallet to Master
-  7: Transfer EOS from Wallet to Master
-  8: Verify Wallet PIN
-  9: BTC withdraw
-  10: EOS withdraw
-  11: Fetch BTC withdrawal info
-  12: Fetch EOS withdrawal info
-  13: Fetch USDT Market info
-  14: Fetch BTC Market info
-  14: Transfer 0.0001 BTC buy USDT
-  15: Transfer USDT $1 buy BTC
-  16: Read snapshots
-  Exit
Make your choose:

[Full source code](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/bitcoin-wallet-nodejs/bitcoin-wallet-nodejs.js)

## Solution Two: List your order on Ocean.One exchange
