# 基于Mixin Network的 Nodejs 比特币开发教程: 创建比特币钱包
![cover](https://github.com/wenewzhang/mixin_network-nodejs-bot2/raw/master/Bitcoin_node.jpg)
我们已经创建过一个[回复消息](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README-zhchs.md)的机器人和一个能自动[支付比特币](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README2-zhchs.md)的机器人.

### 通过本教程的学习，你可以学到如下内容
1. 如何创建一个比特币钱包.
2. 如何读取比特币钱包的余额.
3. 如何支付比特币并即时确认.
4. 如何将Mixin Network的比特币提现到你的冷钱包或第三方交易所.


前期准备：你要有一个Mixin Network账户。下面的代码创建一个帐号，并写到csv文件里。
```js
console.log("create wallet ....");
const { generateKeyPairSync } = require('crypto');
const { publicKey, privateKey } = generateKeyPairSync('rsa',
{   modulusLength: 1024,  // the length of your key in bits
    publicKeyEncoding: {
      type: 'spki',       // recommended to be 'spki' by the Node.js docs
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs1',      // recommended to be 'pkcs8' by the Node.js docs
      format: 'pem',
      //cipher: 'aes-256-cbc',   // *optional*
      //passphrase: 'top secret' // *optional*
  }
});
publicKey1 = publicKey.replace("-----BEGIN PUBLIC KEY-----","");
publicKey2 = publicKey1.replace("-----END PUBLIC KEY-----","");
publicKey3 = publicKey2.replace(/\r?\n|\r/g, "");

console.log(publicKey);
console.log(publicKey3);
(async () => {
  const info = await clientBot.createUser({full_name : "nodejs bitcoin wallet",
                                        session_secret: publicKey3,
                                      });

```
上面的语句会在本地创建一个RSA密钥对，然后调用Mixin Network来创建帐号，最后保存帐号信息到csv文件.
```js
  let aesKey = '';
  const privateKeyBytes = pem.decode(Buffer.from(privateKey));
  const aesKeyBuffer = await oaepDecrypt(
    Buffer.from(info.pin_token, 'base64'),
    privateKeyBytes,
    'SHA-256',
    Buffer.from(info.session_id)
  );
  aesKey = Buffer.from(aesKeyBuffer).toString('base64');
  console.log(aesKey);

  var csvStream = csv.createWriteStream({headers: false, ignoreEmpty: true}),
      writableStream = fs.createWriteStream(WalletName, {flags: 'a'});

  writableStream.on("finish", function(){
    console.log("Bitcoin wallet DONE!");
  });
  csvStream.pipe(writableStream);
  csvStream.write({a: privateKey, b: info.pin_token,
                   c: info.session_id, d: info.user_id,
                   e: "123456"}
                 );
  csvStream.end();
  fs.appendFile(WalletName, require("os").EOL, function(){});

  const newUserConfig = {clientId: info.user_id, aesKey: aesKey,
                         privateKey: privateKey, sessionId: info.session_id,
                         clientSecret: "do not need", assetPin: "123456"};
  console.log(newUserConfig);
  const newUserClient = new HttpClient(newUserConfig);
  var info2 = await newUserClient.updatePin({oldPin : "",
                                             newPin: "123456",
                                           });
  console.log(info2);

  const verifyPin = await newUserClient.verifyPin("123456");
  console.log({ verifyPin });

```

现在你需要小心保管好你的帐号信息，在读取该账户的比特币资产余额或者进行其他操作时，将需要用到这些信息.
### 给新建的帐号创建一个比特币钱包
新账号并不默认内置比特币钱包， 现在读一下比特币余额就可以创建一个比特币钱包。
```js
  const assetInfo = await newUserClient.getUserAsset(BTC_ASSET_ID);
  console.log("Bitcoin address is ", assetInfo.public_key);
  console.log("Bitcoin balance is ", assetInfo.balance);
  console.log("Bitcoin price is (USD) ", assetInfo.price_usd);
```
创建的帐号的比特币资产详细信息如下，其中public key就是比特币的存币地址:
```bash
  Make your choose(select the uuid for open the specified wallet): 0b10471b-1aed-3944-9eda-5ab947562761
   You select the : 0b10471b-1aed-3944-9eda-5ab947562761
  You select the wallet 0b10471b-1aed-3944-9eda-5ab947562761
  ?
  Make your choose 1: Read Bitcoin Balance & Address
  You choice to : { type: '1: Read Bitcoin Balance & Address' }
  You wallet is : 0b10471b-1aed-3944-9eda-5ab947562761
  Bitcoin address is  15MySY7UnA827TRMQWuCKGiogCYXUmt21M
  Bitcoin balance is  0
  Bitcoin price is (USD)  5029.59915767
   You select the : 0b10471b-1aed-3944-9eda-5ab947562761
  You select the wallet 0b10471b-1aed-3944-9eda-5ab947562761
```

这个API能够提供若干与比特币有关的信息:
* 存币地址:[public_key]
* Logo: [icon_url]
* 资产名字:[name]
* 资产在Mixin Network的uuid: [asset_key]
* 对美元的价格(Coinmarketcap.com提供): [price_usd]
* 存币时确认的区块数量:[confirmations]


### 比特币私钥呢？
比特币的私钥呢？这个私钥被Mixin Network通过多重签名保护，所以对用户来说是不可见的,比特币资产的提现和转账都需要用户提供正确的的RSA签名,PIN代码与会话密钥才能完成.

### 不只是比特币，还有以太坊，EOS等
这个帐号不只支持比特币，还支持以太坊，EOS等, 完整的区块链支持[列表](https://mixin.one/network/chains). 这个账户同时也支持所有的 ERC20 代币与 EOS 代币.

创建其它的币的钱包与创建比特币钱包过程一样，读对应的资产余额就可以.

#### Mixin Network 当前支持的加密货币 (2019-02-19)

|crypto |uuid in Mixin Network
|---|---
|EOS|6cfe566e-4aad-470b-8c9a-2fd35b49c68d
|CNB|965e5c6e-434c-3fa9-b780-c50f43cd955c
|BTC|c6d0c728-2624-429b-8e0d-d9d19b6592fa
|ETC|2204c1ee-0ea2-4add-bb9a-b3719cfff93a
|XRP|23dfb5a5-5d7b-48b6-905f-3970e3176e27
|XEM|27921032-f73e-434e-955f-43d55672ee31
|ETH|43d61dcd-e413-450d-80b8-101d5e903357
|DASH|6472e7e3-75fd-48b6-b1dc-28d294ee1476
|DOGE|6770a1e5-6086-44d5-b60f-545f9d9e8ffd
|LTC|76c802a2-7c88-447f-a93e-c29c9e5dd9c8
|SC|990c4c29-57e9-48f6-9819-7d986ea44985
|ZEN|a2c5d22b-62a2-4c13-b3f0-013290dbac60
|ZEC|c996abc9-d94e-4494-b1cf-2a3fd3ac5714
|BCH|fd11b6e3-0b87-41f1-a41f-f0e9b49e5bf0

EOS的存币地址与其它的币有些不同，它由两部分组成： account_name and account tag, 如果你向Mixin Network存入EOS，你需要填两项数据： account name 是**eoswithmixin**,备注里输入你的account_tag,比如**0aa2b00fad2c69059ca1b50de2b45569**.

EOS的资产余额返回结果如下:
```bash
  Make your choose 3: Read EOS Balance & Address
  You choice to : { type: '3: Read EOS Balance & Address' }
  You wallet is : 0b10471b-1aed-3944-9eda-5ab947562761
  EOS account name is  eoswithmixin  tag is  30f0c36057b9b22151173b309bd0d79c
  EOS balance is  0
  EOS price is (USD)  5.26225922
   You select the : 0b10471b-1aed-3944-9eda-5ab947562761
  You select the wallet 0b10471b-1aed-3944-9eda-5ab947562761
```

### 存入比特币与读取比特币余额
现在，你可以向比特币的钱包存币了。

当然，在比特币网络里转币，手续费是相当贵的，费用的中位数在0.001BTC,按当前4000美元的价格，在4美元左右，有一个方便的办法，如果你有[Mixin Messenger](https://mixin.one/messenger)帐号，里面并且有比特币的话，可以直接提现比特币到新创建的帐号的比特币充值地址，它们在同一个Mixin Network网络内，手续费为0，而且1秒到账。

下面的代码，可以读取比特币钱包余额.
```js
  const assetInfo = await newUserClient.getUserAsset(BTC_ASSET_ID);
  console.log("Bitcoin address is ", assetInfo.public_key);
  console.log("Bitcoin balance is ", assetInfo.balance);
  console.log("Bitcoin price is (USD) ", assetInfo.price_usd);
```
### Mixin Network网内免手续费的，并且即时确认
任何币在Mixin Network内部的交易，都是无手续费的，并且立刻到账。
前期准备： 账户设置了PIN

对于新创建的帐号，我们通过updatePin来设置新PIN码, 代码如下：
```js
  var info2 = await newUserClient.updatePin({oldPin : "",
                                             newPin: "123456",
                                           });
  console.log(info2);

  const verifyPin = await newUserClient.verifyPin("123456");
  console.log({ verifyPin });
```
#### Mixin Network帐号之间的比特币支付
通过Mixin Messenger，我们可以先转比特币给机器人，然后让机器人转币给新用户。
```js
  const assetInfo = await newUserClient.getUserAsset(EOS_ASSET_ID);
  console.log("The Wallet 's EOS balance is ", assetInfo.balance);
  if ( assetInfo.balance > 0 ) {
    const Obj = {
      assetId: BTC_ASSET_ID,
      recipientId: MASTER_UUID,
        traceId: newUserClient.getUUID(),
        amount: assetInfo.balance,
        memo: '',
    };
    console.log(Obj);
    newUserClient.transferFromBot(Obj);
  }
```

读取Bitcoin的余额，来确认比特币是不是转成功了！ 注意**newUserClient**是新用户的。
```js
  const assetInfo = await newUserClient.getUserAsset(BTC_ASSET_ID);
  console.log("Bitcoin address is ", assetInfo.public_key);
  console.log("Bitcoin balance is ", assetInfo.balance);
```
### 如何将比特币存入你的冷钱包或者第三方交易所
如果你希望将币存入你的冷钱包或者第三方交易所, 先要得到冷钱包或者你在第三方交易所的钱包地址，然后将钱包地址提交到Mixin Network.

- **要点提示**: 提现是需要支付收续费的,准备好比特币包地址!

#### 增加目的钱包地址到Mixin Network
调用createAddress API, 将会返回一个address_id,下一步的提现操作会用到这个id。
```js
  const withdrawAddress = await newUserClient.createWithdrawAddress({
    assetId: BTC_ASSET_ID,
    label: 'BTC withdraw',
    publicKey: BTC_WALLET_ADDR,
  });
```
 这里的 **14T129GTbXXPGXXvZzVaNLRFPeHXD1C25C** 就是一个比特币钱包地址, 如下所示，提现费用是0.0025738 BTC, address_id  是"345855b5-56a5-4f3b-ba9e-d99601ef86c1".                                                   
```bash
Make your choose 9: BTC withdraw
You choice to : { type: '9: BTC withdraw' }
You wallet is : 0b10471b-1aed-3944-9eda-5ab947562761
{ type: 'address',
  address_id: 'a513da38-a18a-4536-abe4-d1c29ca3a1a8',
  asset_id: 'c6d0c728-2624-429b-8e0d-d9d19b6592fa',
  public_key: '14T129GTbXXPGXXvZzVaNLRFPeHXD1C25C',
  label: 'BTC withdraw',
  account_name: '',
  account_tag: '',
  fee: '0.00212232',
  reserve: '0',
  dust: '0.0001',
  updated_at: '2019-04-04T02:20:42.552274992Z' }
? Input you BTC amount:
```


#### 创建提现地址成功后，你可以用readAddress读取最新的提现费。
```js
  const addressList = await newUserClient.getWithdrawAddress(BTC_ASSET_ID);
  console.log(addressList);
```

#### 提交提现请求，Mixin Network会即时处理提现请求.
提交提现请求到 Mixin Network, withdrawAddress.address_id 就是createAddress创建的。
```js
  console.log(withdrawAddress);
  const prompts = [
    {
      name: 'amount',
      type: 'input',
      message: "Input you BTC amount: ",
    },
  ];
  const answers = await inquirer.prompt(prompts);
  console.log(answers);
  const withdrawResult = await newUserClient.withdraw({
    addressId: withdrawAddress.address_id,
    assetId: BTC_ASSET_ID,
    amount: answers.amount,
    memo: 'withdraw by nodejs',
  });
  console.log(withdrawResult);
```
#### 可以通过blockchain explore来查看进度.

[完整的代码在这儿](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/bitcoin-wallet-nodejs/bitcoin-wallet-nodejs.js)
