# 在OceanOne上挂单买卖任意ERC20 token
![cover](https://github.com/wenewzhang/mixin_network-nodejs-bot2/raw/master/Bitcoin_node.jpg)

在[上一课](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README5.md)中，我们介绍了如何在OceanOne交易比特币。OceanOne支持交易任何Mixin Network上的token，包括所有的ERC20和EOS token，不需要任何手续和费用，直接挂单即可。下面介绍如何将将一个ERC20 token挂上OceanOne交易！

此处我们用一个叫做Benz的[ERC20 token](https://etherscan.io/token/0xc409b5696c5f9612e194a582e14c8cd41ecdbc67)为例。这个token已经被充值进Mixin Network，你可以在[区块链浏览器](https://mixin.one/snapshots/2b9c216c-ef60-398d-a42a-eba1b298581d )看到这个token在Mixin Network内部的总数和交易
### 预备知识:
先将Ben币存入你的钱包，然后使用**getAssets** API读取它的UUID.

### 取得该币的UUID
调用 **getAssets** API 会返回json数据, 如:

- **asset_id** 币的UUID.
- **public_key** 该币的当前钱包的地址.
- **symbol**  币的名称. 如: Benz.

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

调用 **getUserAssets** API的完整输出如下:

```bash
Make your choose aw: Read Wallet All Asssets Information
You choice to : { type: 'aw: Read Wallet All Asssets Information' }
You wallet is : 0b10471b-1aed-3944-9eda-5ab947562761
-AssetID--Asset--Balance--public_key--
2b9c216c-ef60-398d-a42a-eba1b298581d  Benz  99.9  0xA35722B0a5Ab20f2d2276999F5b18D42C71Ba688
6cfe566e-4aad-470b-8c9a-2fd35b49c68d  EOS  0   eoswithmixin  30f0c36057b9b22151173b309bd0d79c
965e5c6e-434c-3fa9-b780-c50f43cd955c  CNB  999.99999993  0xA35722B0a5Ab20f2d2276999F5b18D42C71Ba688
c6d0c728-2624-429b-8e0d-d9d19b6592fa  BTC  0  15MySY7UnA827TRMQWuCKGiogCYXUmt21M
```

### 限价挂单
- **挂限价买单**  低于或者等于市场价的单.
- **挂限价卖单**  高于或者是等于市场价的单.

OceanOne支持三种基类价格: USDT, XIN, BTC, 即: Benz/USDT, Benz/XIN, Benz/BTC, 这儿示范Benz/USDT.

### 限价挂卖单.
新币挂单后,需要等一分钟左右，等OceanOne来初始化新币的相关数据.

```js
else if ( args.type === TYPE_OO_SELL_ERC_USDT ) {
  var prompts = [
    {
      name: 'price',
      type: 'input',
      message: "Input the price of ERC(Benz)/USDT: ",
    },
  ];
  price = await inquirer.prompt(prompts);
  var prompts = [
    {
      name: 'amount',
      type: 'input',
      message: "Input the amount of ERC20(Benz): ",
    },
  ];
  amount = await inquirer.prompt(prompts);
  console.log(price);
  console.log(amount);
  const memo = GenerateOceanMemo(USDT_ASSET_ID,"A",price.price);
  const assetInfo = await newUserClient.getUserAsset(ERC20_BENZ);
  console.log("The Wallet 's USDT balance is ", assetInfo.balance);
  if ( assetInfo.balance >= amount.amount ) {
    const Obj = {
      assetId: ERC20_BENZ,
      recipientId: OCEANONE_BOT,
        traceId: newUserClient.getUUID(),
        amount: amount.amount,
        memo: memo,
      }
      const transInfo = await newUserClient.transferFromBot(Obj);
      console.log(transInfo);
      console.log("The Order id is " + transInfo.trace_id + " It is needed to cancel the order!");
  } else {
    console.log("Not enough ERC20_BENZ!");
  }
}
```

### 限价挂买单.
新币挂单后,需要等一分钟左右，等OceanOne来初始化新币的相关数据.

```js
else if ( args.type === TYPE_OO_BUY_ERC_USDT ) {
 var prompts = [
   {
     name: 'price',
     type: 'input',
     message: "Input the price of ERC20(Benz)/USDT: ",
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
 const memo = GenerateOceanMemo(ERC20_BENZ,"B",price.price);
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
### 读取币的价格列表
读取币的价格列表，来确认挂单是否成功!

```js
else if ( args.type === TYPE_OO_FETCH_ERC_USDT ) {
  FetchOceanOneMarketInfos(ERC20_BENZ, USDT_ASSET_ID);
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
### ERC20相关的操作指令

Commands list of this source code:

- 21: Fetch ERC20/USDT order book
- 24: Sell ERC20/USDT
- 27: Buy ERC20/USDT
- 28: Cancel the order
- q: Exit


[完整的代码](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/bitcoin-wallet-nodejs/bitcoin-wallet-nodejs.js)
