# Node.js: listing any ERC20 token on decentralized exchange OceanOne
![cover](https://github.com/wenewzhang/mixin_network-nodejs-bot2/raw/master/Bitcoin_node.jpg)

OceanOne is introduced in [last chapter](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README5.md), you can trade Bitcoin. All kinds of crypto asset on Mixin Network can be listed on OceanOne.All ERC20 token and EOS token can be listed. Following example will show you how to list a ERC20 token.

There is a [ERC20 token](https://etherscan.io/token/0xc409b5696c5f9612e194a582e14c8cd41ecdbc67) called Benz. It is deposited into Mixin Network. You can search all transaction history from [Mixin Network browser](https://mixin.one/snapshots/2b9c216c-ef60-398d-a42a-eba1b298581d )

### Pre-request:
Deposit some coin to your wallet, and then use **getAssets** API fetch the asset UUID which Mixin Network gave it.

### Get the ERC-20 compliant coin UUID
The **getUserAssets** API return json data, for example:

- **asset_id** UUID of this coin
- **public_key** The wallet address for this coin
- **symbol**  Coin name, Eg: Benz.

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

The detail information of **getUserAssets** is output like below:

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
### Make the limit order
- **Limit Order to Buy**  at or below the market.
- **Limit Order to Sell**  at or above the market.

OceanOne support three base coin: USDT, XIN, BTC, that mean you can sell or buy it between USDT, XIN, BTC, so, you have there order: Benz/USDT, Benz/XIN, Benz/BTC, here show you how to make the sell order with USDT.

### Make the limit order to sell.

``js
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

### Make the limit order to buy.
After the order commit, wait 1 minute to let the OceanOne exchange initialize it.

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

### Read orders book from Ocean.one
Now, check the orders-book.

````js
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

### Command of make orders

Commands list of this source code:

- 21: Fetch ERC20/USDT order book
- 24: Sell ERC20/USDT
- 27: Buy ERC20/USDT
- 28: Cancel the order
- q: Exit

[Full source code](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/bitcoin-wallet-nodejs/bitcoin-wallet-nodejs.js)
