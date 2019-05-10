# How to list bitcoin order through Nodejs
![cover](https://github.com/wenewzhang/mixin_network-nodejs-bot2/raw/master/Bitcoin_node.jpg)

Exincore is introduced in [last chapter](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README4.md), you can exchange many crypto asset at market price and receive your asset in 1 seconds. If you want to trade asset at limited price, or trade asset is not supported by ExinCore now, OceanOne is the answer.
## Solution Two: List your order on Ocean.One exchange
[Ocean.one](https://github.com/mixinNetwork/ocean.one) is a decentralized exchange built on Mixin Network, it's almost the first time that a decentralized exchange gain the same user experience as a centralized one.

You can list any asset on OceanOne. Pay the asset you want to sell to OceanOne account, write your request in payment memo, OceanOne will list your order to market. It send asset to your wallet after your order is matched.

* No sign up required
* No deposit required
* No listing process.

### Pre-request:
You should  have created a bot based on Mixin Network. Create one by reading [Nodejs Bitcoin tutorial](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README.md).

#### Install required packages
This tutorial dependent **msgpack5** and **mixin-node-client**  , [chapter 4](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README4.md), assume them had installed before.

#### Deposit USDT or Bitcoin into your Mixin Network account and read balance
The Ocean.one can match any order. Here we exchange between USDT and Bitcoin, Check the wallet's balance & address before you make order.

- Check the address & balance, find it's Bitcoin wallet address.
- Deposit Bitcoin to this Bitcoin wallet address.
- Check Bitcoin balance after 100 minutes later.

**Omni USDT address is same as Bitcoin address**

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

#### Read orders book from Ocean.one
How to check the coin's price? You need understand what is the base coin. If you want buy Bitcoin and sell USDT, the USDT is the base coin. If you want buy USDT and sell Bitcoin, the Bitcoin is the base coin.



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

#### Create a memo to prepare order
The chapter two: [Echo Bitcoin](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README2.md) introduce transfer coins. But you need to let Ocean.one know which coin you want to buy.
- **Side** "B" or "A", "B" for buy, "A" for Sell.
- **AssetUuid** UUID of the asset you want to buy
- **Price** If Side is "B", Price is AssetUUID; if Side is "A", Price is the asset which transfer to Ocean.one.

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

The code show you how to buy XIN：
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

#### Pay XIN to OceanOne with generated memo
Transfer XIN(XIN_ASSET_ID) to Ocean.one(OCEANONE_BOT), put you target asset uuid(USDT) in the memo.
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

A success order output like below:

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

## Cancel the Order
To cancel order, just pay any amount of any asset to OceanOne, and write trace_id into memo. Ocean.one take the trace_id as the order id, for example, **d34f881b-4460-42d3-af91-551f97b20f74** is a order id,
We can use it to cancel the order.

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
#### Read Bitcoin balance
Check the wallet's balance.
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

## Source code usage

- [x] **node bitcoin-wallet-nodejs.js** run it.

Commands list of this source code:

Make your choose(select the uuid for open the specified wallet): 0b10471b-1aed-3944-9eda-5ab947562761
 You select the : 0b10471b-1aed-3944-9eda-5ab947562761
You select the wallet 0b10471b-1aed-3944-9eda-5ab947562761
?
Make your choose (Use arrow keys)
- ❯ aw: Read Wallet All Asssets Information
-  ab: Read Bot All Asssets Information
-  --------------OCean.One-------------------------
- 19: Fetch BTC/USDT order book
- 20: Fetch XIN/USDT order book
- 21: Fetch ERC20/USDT order book
- 22: Sell BTC/USDT
- 23: Sell XIN/USDT
- 24: Sell ERC20/USDT
- 25: Buy BTC/USDT
- 26: Buy XIN/USDT
- 27: Buy ERC20/USDT
- 28: Cancel the order
- Exit

[Full source code](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/bitcoin-wallet-nodejs/bitcoin-wallet-nodejs.js)
