# 通过 Nodejs 买卖Bitcoin
![cover](https://github.com/wenewzhang/mixin_network-nodejs-bot2/raw/master/Bitcoin_node.jpg)
上一章介绍了[Exincore](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README4-zhchs.md)，你可以1秒完成资产的市价买卖。如果你想限定价格买卖，或者买卖一些exincore不支持的资产，你需要OceanOne。

## 方案二: 挂单Ocean.One交易所

[Ocean.one](https://github.com/mixinNetwork/ocean.one)是基于Mixin Network的去中心化交易所，它性能一流。
你可以在OceanOne上交易任何资产，只需要将你的币转给OceanOne, 将交易信息写在交易的memo里，OceanOne会在市场里列出你的交易需求，
交易成功后，会将目标币转入到你的MixinNetwork帐上，它有三大特点与优势：
- 不需要在OceanOne注册
- 不需要存币到交易所
- 支持所有Mixin Network上能够转账的资产，所有的ERC20 EOS代币。

### 预备知识:
你先需要创建一个机器人, 方法在 [教程一](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README-zhchs.md).

#### 安装依赖包
我们需要依赖 **msgpack5** and **mixin-node-client** ,[第四章](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README4-zhchs.md) 已经做过介绍, 你应该先安装过它了.


#### 充币到 Mixin Network, 并读出它的余额.
此处演示用 USDT购买BTC 或者 用BTC购买USDT。交易前，先检查一下钱包地址。
完整的步骤如下:
- 检查比特币或USDT的余额，钱包地址。并记下钱包地址。
- 从第三方交易所或者你的冷钱包中，将币充到上述钱包地址。
- 再检查一下币的余额，看到帐与否。(比特币的到帐时间是5个区块的高度，约100分钟)。

比特币与USDT的充值地址是一样的。

```js
if ( args.type === TYPE_WALLET_ASSETS_INFO ) {
  const assetsInfo = await newUserClient.getUserAssets();
  console.log("-AssetID--Asset--Balance--public_key--");
  assetsInfo.forEach(function(element) {
     console.log(element.asset_id + "  " +
                 element.symbol + "  " +
                 element.balance + "  " +
                 element.public_key + " " +
                 element.account_name + "  " +
                 element.account_tag
               );
   });
  // console.log(assetsInfo);
}
```

#### 取得Ocean.one的市场价格信息
如何来查询Ocean.one市场的价格信息呢？你要先了解你交易的基础币是什么，如果你想买比特币，卖出USDT,那么基础货币就是USDT;如果你想买USDT,卖出比特币，那么基础货币就是比特币.

```js
if ( args.type === TYPE_OO_FETCH_BTC_USDT ) {
  FetchOceanOneMarketInfos(BTC_ASSET_ID, USDT_ASSET_ID);
}
function FetchOceanOneMarketInfos(asset_id, base_asset) {
  var instance = axios.create({
  baseURL: "https://events.ocean.one/markets/" + asset_id + "-" + base_asset + "/book",
  timeout: 3000,
  headers: {'X-Custom-Header': 'foobar'}
  });
  instance.get()
  .then(function(response) {
    console.log("--Price--Amount--Funds--Side")
    response.data.data.data.asks.forEach(function(element) {
       console.log(element.price + "     " +
                   element.amount + "     " +
                   element.funds + "     " +
                   element.side);
     });
     response.data.data.data.bids.forEach(function(element) {
        console.log(element.price + "     " +
                    element.amount + "     " +
                    element.funds + "     " +
                    element.side);
      });
    // console.log(response.data.data.data.asks);
  });
}
```

#### 交易前，创建一个Memo!
在第二章里,[基于Mixin Network的 Nodejs 比特币开发教程: 机器人接受比特币并立即退还用户](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README2-zhchs.md), 我们学习过转帐，这儿我们介绍如何告诉Ocean.one，我们给它转帐的目的是什么，信息全部放在memo里.
- **Side** 方向,"B" 或者 "A", "B"是购买, "A"是出售.
- **AssetUuid** 目标虚拟资产的UUID.
- **Price** 价格，如果操作方向是"B", 价格就是AssetUUID的价格; 如果操作方向是"B", 价格就是转给Ocean.one币的价格.

```js
function GenerateOceanMemo(targetAsset,side,price) {
  const bytes = Buffer.from(
    targetAsset.replace(/-/g, ''),
    'hex'
  );
  const memo = msgpack
    .encode({
      S: side,
      A: bytes,
      P: price,
      T: "L",
    })
    .toString('base64');
  console.log(memo);
  return memo;
}
```

买入XIN的代码如下：

```js
else if ( args.type === TYPE_OO_BUY_XIN_USDT ) {
  var prompts = [
    {
      name: 'price',
      type: 'input',
      message: "Input the price of XIN/USDT: ",
    },
  ];
  price = await inquirer.prompt(prompts);
  var prompts = [
    {
      name: 'amount',
      type: 'input',
      message: "Input the amount of USDT: ",
    },
  ];
  amount = await inquirer.prompt(prompts);
  console.log(price);
  console.log(amount);
  const memo = GenerateOceanMemo(XIN_ASSET_ID,"B",price.price);
  const assetInfo = await newUserClient.getUserAsset(USDT_ASSET_ID);
  console.log("The Wallet 's USDT balance is ", assetInfo.balance);
  if ( assetInfo.balance >= amount.amount && assetInfo.balance >= 1 ) {
    const Obj = {
      assetId: USDT_ASSET_ID,
      recipientId: OCEANONE_BOT,
        traceId: newUserClient.getUUID(),
        amount: amount.amount,
        memo: memo,
      }
      const transInfo = await newUserClient.transferFromBot(Obj);
      console.log(transInfo);
      console.log("The Order id is " + transInfo.trace_id + " It is needed to cancel the order!");
  } else {
    console.log("Not enough USDT!");
  }
}
```

#### 出售XIN的例子
转打算出售的XIN给Ocean.one(OCEANONE_BOT),将你打算换回来的目标虚拟资产的UUID放入memo.

```js
else if ( args.type === TYPE_OO_SELL_XIN_USDT ) {
  var prompts = [
    {
      name: 'price',
      type: 'input',
      message: "Input the price of XIN/USDT: ",
    },
  ];
  price = await inquirer.prompt(prompts);
  var prompts = [
    {
      name: 'amount',
      type: 'input',
      message: "Input the amount of XIN: ",
    },
  ];
  amount = await inquirer.prompt(prompts);
  console.log(price);
  console.log(amount);
  const memo = GenerateOceanMemo(XIN_ASSET_ID,"A",price.price);
  const assetInfo = await newUserClient.getUserAsset(BTC_ASSET_ID);
  console.log("The Wallet 's USDT balance is ", assetInfo.balance);
  if ( assetInfo.balance >= amount.amount ) {
    const Obj = {
      assetId: XIN_ASSET_ID,
      recipientId: OCEANONE_BOT,
        traceId: newUserClient.getUUID(),
        amount: amount.amount,
        memo: memo,
      }
      const transInfo = await newUserClient.transferFromBot(Obj);
      console.log(transInfo);
      console.log("The Order id is " + transInfo.trace_id + " It is needed to cancel the order!");
  } else {
    console.log("Not enough XIN!");
  }
}
```

一个成功的挂单如下：

```bash
? Input the price of XIN/USDT:  160
? Input the amount of USDT:  1
{ price: '160' }
{ amount: '1' }
hKFToUKhQcQQgVsLGidkNzaPqkLWlPpiCqFQozE2MKFUoUw=
The Wallet 's USDT balance is  1.995101
{
  type: 'transfer',
  snapshot_id: '14f144e4-0bd5-43aa-a7d4-70e7d5c695b0',
  opponent_id: 'aaff5bef-42fb-4c9f-90e0-29f69176b7d4',
  asset_id: '815b0b1a-2764-3736-8faa-42d694fa620a',
  amount: '-1',
  trace_id: 'd34f881b-4460-42d3-af91-551f97b20f74',
  memo: 'hKFToUKhQcQQgVsLGidkNzaPqkLWlPpiCqFQozE2MKFUoUw=',
  created_at: '2019-05-10T07:18:21.130357698Z',
  counter_user_id: 'aaff5bef-42fb-4c9f-90e0-29f69176b7d4'
}
The Order id is d34f881b-4460-42d3-af91-551f97b20f74 It is needed to cancel the order!
```

#### 取消挂单
Ocean.one将trace_id当做订单，比如上面的例子， **d34f881b-4460-42d3-af91-551f97b20f74** 就是订单号，我们用他来取消订单。

```js
else if ( args.type === TYPE_OO_CANCEL_ORDER ) {
  const prompts = [
    {
      name: 'order_id',
      type: 'input',
      message: "Input iso8601 datetime: ",
    },
  ];
  answers = await inquirer.prompt(prompts);
  const memo = GenerateOceanCancelMemo(answers.order_id);
  const assetInfo = await newUserClient.getUserAsset(CNB_ASSET_ID);
  console.log("The Wallet 's USDT balance is ", assetInfo.balance);
  if ( assetInfo.balance >= 0.00000001 ) {
    const Obj = {
      assetId: CNB_ASSET_ID,
      recipientId: OCEANONE_BOT,
        traceId: newUserClient.getUUID(),
        amount: "0.00000001",
        memo: memo,
      }
      const transInfo = await newUserClient.transferFromBot(Obj);
      console.log(transInfo);
  } else {
    console.log("Not enough CNB!");
  }
}
```

#### 通过读取资产余额，来确认到帐情况
```js
const assetsInfo = await newUserClient.getUserAssets();
console.log("-AssetID--Asset--Balance--public_key--");
assetsInfo.forEach(function(element) {
   console.log(element.asset_id + "  " +
               element.symbol + "  " +
               element.balance + "  " +
               element.public_key + " " +
               element.account_name + "  " +
               element.account_tag
             );
 });
```

## 源代码执行
编译执行，即可开始交易了.

## 源代码执行
编译执行，即可开始交易了.

- [x] **node bitcoin-wallet-nodejs.js**  编译项目.

本代码执行时的命令列表:

Commands list of this source code:

- 1: Create Bitcoin Wallet and update PIN
- 2: Read Bitcoin balance & address
- 3: Read USDT balance & address
- 4: Read EOS balance & address
- tub: Transfer USDT from Bot to Wallet
- tum: Transfer USDT from Wallet to Master
- tcb: Transfer CNB from Bot to Wallet
- tcm: Transfer CNB from Wallet to Master
- txb: Transfer XIN from Bot to Wallet
- txm: Transfer XIN from Wallet to Master
- 5: pay 0.0001 BTC buy USDT
- 6: pay $1 USDT buy BTC
- 7: Read Snapshots
- 8: Fetch market price(USDT)
- 9: Fetch market price(BTC)
- v: Verify Wallet Pin
- ab: Read Bot Assets
- aw: Read Wallet Assets
- o:  OceanOne Trading
- q: Exit
Make your choose:

Make your choose(eg: q for Exit!):

Make your choose:
o
- 1:  Fetch XIN/USDT orders
- s1: Sell XIN/USDT
- b1: Buy XIN/USDT
- 2:  Fetch ERC20(Benz)/USDT orders
- s2: Sell Benz/USDT
- b2: Buy Benz/USDT
- c: Cancel Order
- q:  Exit

[完整代码](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/bitcoin-wallet-nodejs/bitcoin-wallet-nodejs.js)
