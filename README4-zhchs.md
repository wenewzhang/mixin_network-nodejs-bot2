# 通过 Nodejs 买卖Bitcoin
![cover](https://github.com/wenewzhang/mixin_network-nodejs-bot2/raw/master/Bitcoin_node.jpg)

## 方案一: 通过ExinCore API进行币币交易
[Exincore](https://github.com/exinone/exincore) 提供了基于Mixin Network的币币交易API.

你可以支付USDT给ExinCore, ExinCore会以最低的价格，最优惠的交易费将你购买的比特币转给你, 每一币交易都是匿名的，并且可以在区块链上进行验证，交易的细节只有你与ExinCore知道！

ExinCore 也不知道你是谁，它只知道你的UUID.

### 预备知识:
你先需要创建一个机器人, 方法在 [教程一](https://github.com/wenewzhang/mixin_network-nodejs-bot2/README.md).

#### 安装依赖包
正如教程一里我们介绍过的， 我们需要依赖 **mixin-node-client**, 你应该先安装过它了， 这儿我们再安装其它的软件包.

```bash
  yarn add fast-csv inquirer msgpack5 path pem-file
or
  npm i fast-csv inquirer msgpack5 path pem-file
```

#### 充币到 Mixin Network, 并读出它的余额.
通过ExinCore API, 可以进行BTC, USDT, EOS, ETH 等等交易， 此处演示用 USDT购买BTC 或者 用BTC购买USDT。交易前，先检查一下钱包地址。
完整的步骤如下:
- 检查比特币或USDT的余额，钱包地址。并记下钱包地址。
- 从第三方交易所或者你的冷钱包中，将币充到上述钱包地址。
- 再检查一下币的余额，看到帐与否。(比特币的到帐时间是5个区块的高度，约100分钟)。

比特币与USDT的充值地址是一样的。

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

#### 查询ExinCore市场的价格信息
如何来查询ExinCore市场的价格信息呢？你要先了解你交易的基础币是什么，如果你想买比特币，卖出USDT,那么基础货币就是USDT;如果你想买USDT,卖出比特币，那么基础货币就是比特币.

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

#### 交易前，创建一个Memo!
在第二章里,[基于Mixin Network的 Nodejs 比特币开发教程: 机器人接受比特币并立即退还用户](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README2-zhchs.md), 我们学习过退还用户比特币，在这里，我们除了给ExinCore支付币外，还要告诉他我们想购买的币是什么，即将想购买的币存到memo里。
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

#### 币币交易的完整流程
转币给ExinCore时，将memo写入你希望购买的币，否则，ExinCore会直接退币给你！
如果你想卖出比特币买入USDT,调用方式如下：

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

如果你想卖出USDT买入比特币,调用方式如下：

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

交易完成后，Exincore会将你需要的币转到你的帐上，同样，会在memo里，记录成交价格，交易费用等信息！你只需要按下面的方式解开即可！
- **getSnapshots** 读取钱包的交易记录。
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

一次成功的交易如下：
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

#### 读取币的余额
通过读取币的余额，来确认交易情况！
```js
if (args.type === TYPE_BITCOIN_INFO) {
   // console.log('You choice to 1:', args);
   const assetInfo = await newUserClient.getUserAsset(BTC_ASSET_ID);
   console.log("Bitcoin address is ", assetInfo.public_key);
   console.log("Bitcoin balance is ", assetInfo.balance);
   console.log("Bitcoin price is (USD) ", assetInfo.price_usd);
}
```

## 源代码执行
编译执行，即可开始交易了.

- [x] **node  bitcoin-wallet-nodejs.js** 编译项目.

本代码执行时的命令列表:

Make your choose(select the uuid for open the specified wallet): 0b10471b-1aed-3944-9eda-5ab947562761
 You select the : 0b10471b-1aed-3944-9eda-5ab947562761
You select the wallet 0b10471b-1aed-3944-9eda-5ab947562761
?
Make your choose (Use arrow keys)

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

[完整代码](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/bitcoin-wallet-nodejs/bitcoin-wallet-nodejs.js)

## Solution Two: List your order on Ocean.One exchange
