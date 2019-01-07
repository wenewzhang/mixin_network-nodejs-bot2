## Receive and send token
In this chapter, the bot can receive token from user and then pay it back immediately, you must know the miss options in the config.js file,
here show you how to generate a client secret, PIN, aesKey etc.
>if you had readed the python, javescript or php code, you should find this config.js doesn't have PIN token, yes, nodejs use PIN token generate aesKey,
>i show you how to do it
### First, copy the PIN,session id,private key from [Mixin.one Dashboard](https://developers.mixin.one/dashboard)
![copy config info from dashboard](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/copy-to-clipboard.png)

```bash
cd mixin_net-nodejs-bot2
yarn add mixin-cli
./node_modules/mixin-cli/bin/mixin dapp:config
```
install mixin-cli and then execute **mixin dapp:config**

```bash
wenewzha:mixin_network-nodejs-bot wenewzhang$ ./node_modules/mixin-cli/bin/mixin dapp:config
? What is the DAPP session info Press <enter> to launch your preferred editor.
```
as you see,"Press <enter> to launch your preferred editor.",for example, on my computer, it will open vim,
paste all the infomations into vim, save and quit!
![paste-to-vim](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/paste-to-vim.png)

now,the config_mixin_1546851899846.js file created!
```bash
wenewzha:mixin_network-nodejs-bot wenewzhang$ ./node_modules/mixin-cli/bin/mixin dapp:config
? What is the DAPP session info Received
? Which config format do you prefer? [Plain Javascript] can be required from any js code
? What is the filename for generated config file config_mixin_1546851899846.js
✔︎ sessionInfo was successfully decoded!
✔︎ Config file written to /Users/wenewzhang/Documents/sl/mixin_network-nodejs-bot/config_mixin_1546851899846.js
✔︎ Press ctrl+v and then enter to view file content
```
| Key | Description                                  |   example                                         |
| --- | -------------------------------------------- |  -------------------------------------------------
| client secret  |                                        | 78ef86a80be17601f404ad643e5c85ed4f7f5f9f7a1597 |
| PIN   |                 PIN code                       | 123456 |
| PIN token |       verify/update PIN                        |     don't  need here                         |
| aesKey | generate by PIN token                        |  GlJxnvlfhz7nxIk1eNkEdngf+jDW8XGHxJiaQTuD9v8=     |
| clientSecret |   generate from mixin.one's dashboard  | 9873769d7b4198da2ee397af3ecaa87a5054a03d0114cedf28797567defa6fd8 |

completely config.js can find [here](https://github.com/wenewzhang/mixin_network-nodejs-bot2/blob/master/config2.js)
