# Nodejs Bitcoin tutorial based on Mixin Network III: Create Bitcoin wallet, read balance and send Bitcoin
![cover](https://github.com/wenewzhang/mixin_network-nodejs-bot2/raw/master/Bitcoin_node.jpg)

We have created a bot to [echo message](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README.md) and [echo Bitcoin](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/README2.md).

### What you will learn from this chapter
1. How to create Bitcoin wallet
2. How to read Bitcoin balance
3. How to send Bitcoin with zero transaction fee and confirmed in 1 second
4. How to send Bitcoin to other wallet


Pre-request: You should have a Mixin Network app account. Create an account:

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
The function create a RSA key pair automatically, then call Mixin Network to create an account and return all account information, save it to csv file.

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

Now you need to carefully keep the account information. These information are required to read asset balance and other content of account.
### Create Bitcoin wallet for the Mixin Network account
The Bitcoin  wallet is not generated automatically at same time when we create Mixin Network account. Read Bitcoin asset once to generate a Bitcoin wallet.
```js
  const assetInfo = await newUserClient.getUserAsset(BTC_ASSET_ID);
  console.log("Bitcoin address is ", assetInfo.public_key);
  console.log("Bitcoin balance is ", assetInfo.balance);
  console.log("Bitcoin price is (USD) ", assetInfo.price_usd);
```
You can found information about Bitcoin asset in the account. Public key is the Bitcoin deposit address. Full response of read  Bitcoin asset is
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


The API provide many information about Bitcoin asset.
* Deposit address:[public_key]
* Logo: [icon_url]
* Asset name:[name]
* Asset uuid in Mixin network: [asset_key]
* Price in USD from Coinmarketcap.com: [price_usd]
* Least confirmed blocks before deposit is accepted by Mixin network:[confirmations]


### Private key?
Where is Bitcoin private key? The private key is protected by multi signature inside Mixin Network so it is invisible for user. Bitcoin asset can only be withdraw to other address when user provide correct RSA private key signature, PIN code and Session key.

### Not only Bitcoin, but also Ethereum, EOS
The account not only contain a Bitcoin wallet, but also contains wallet for Ethereum, EOS, etc. Full blockchain support [list](https://mixin.one/network/chains). All ERC20 Token and EOS token are supported by the account.

Create other asset wallet is same as create Bitcoin wallet, just read the asset.
#### Mixin Network support cryptocurrencies (2019-02-19)

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

If you read EOS deposit address, the deposit address is composed of two parts: account_name and account tag. When you transfer EOS token to your account in Mixin network, you should fill both account name and memo. The memo content is value of 'account_tag'.
Result of read EOS asset is:
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

### Deposit Bitcoin and read balance
Now you can deposit Bitcoin into the deposit address.

This is maybe too expensive for this tutorial. There is a free and lightening fast solution to deposit Bitcoin: add the address in your Mixin messenger account withdrawal address and withdraw small amount Bitcoin from your account to the address. It is free and confirmed instantly because they are both on Mixin Network.

Now you can read Bitcoin balance of the account.
```js
  const assetInfo = await newUserClient.getUserAsset(BTC_ASSET_ID);
  console.log("Bitcoin address is ", assetInfo.public_key);
  console.log("Bitcoin balance is ", assetInfo.balance);
  console.log("Bitcoin price is (USD) ", assetInfo.price_usd);
```
### Send Bitcoin inside Mixin Network to enjoy instant confirmation and ZERO transaction fee
Any transaction happen between Mixin network account is free and is confirmed in 1 second.

Pre-request: A PIN has been created for account

A PIN is required to send any asset in Mixin Network. Let's create PIN for the account if it is missing.
```js
  var info2 = await newUserClient.updatePin({oldPin : "",
                                             newPin: "123456",
                                           });
  console.log(info2);

  const verifyPin = await newUserClient.verifyPin("123456");
  console.log({ verifyPin });
```
#### Send Bitcoin to another Mixin Network account
We can send Bitcoin to our bot through Mixin Messenger, and then transfer Bitcoin from bot to new user.

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

Read bot's Bitcoin balance to confirm the transaction.
Caution: **newUserClient** is for the New User!
```js
  const assetInfo = await newUserClient.getUserAsset(BTC_ASSET_ID);
  console.log("Bitcoin address is ", assetInfo.public_key);
  console.log("Bitcoin balance is ", assetInfo.balance);
```
### Send Bitcoin to another Bitcoin exchange or wallet
If you want to send Bitcoin to another exchange or wallet, you need to know the destination deposit address, then add the address in withdraw address list of the Mixin network account.

Pre-request: Withdrawal address is added and know the Bitcoin withdrawal fee

#### Add destination address to withdrawal address list
Call createAddress, the ID of address will be returned in result of API and is required soon.
```js
  const withdrawAddress = await newUserClient.createWithdrawAddress({
    assetId: BTC_ASSET_ID,
    label: 'BTC withdraw',
    publicKey: BTC_WALLET_ADDR,
  });
```

The **14T129GTbXXPGXXvZzVaNLRFPeHXD1C25C** is a Bitcoin wallet address, Output like below, fee is 0.0025738 BTC, The API result contains the withdrawal address ID.                                                   
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


#### Read withdraw fee anytime
```js
  const addressList = await newUserClient.getWithdrawAddress(BTC_ASSET_ID);
  console.log(addressList);
```

#### Send Bitcoin to destination address
Submit the withdrawal request to Mixin Network, the withdrawAddress.address_id is the address id return by createAddress
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
#### Confirm the transaction in blockchain explore

[Full source code](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/bitcoin-wallet-nodejs/bitcoin-wallet-nodejs.js)
