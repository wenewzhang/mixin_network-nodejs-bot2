const fs               =    require('fs');
const csv              =    require("fast-csv");
var parse = require('csv-parse');
var async = require('async');

var stream = fs.createReadStream("mybitcoin_wallet.csv");
let walletList = [];
let firstLine  = '';
csv
 .fromStream(stream, {headers: false})
 .on("data", function(data){
     console.log(data);
     console.log("line end\n",data[3]);
     walletList.push(data[3]);
     console.log(walletList);
     if (firstLine === '') { firstLine = data[3];}
 })
 .on("end", function(){
     console.log("done");
     var PromptMsg;
     PromptMsg  = "1: Create Wallet\n2: Read Bitcoin balance & Address \n3: Read USDT balance & Address\n4: Read EOS balance & address\n";
     PromptMsg += "5: pay 0.0001 BTC buy USDT\n6: Read ExinCore Price(USDT)\n7: Read ExinCore Price(BTC)\n";
     PromptMsg += "8: pay 1 USDT buy BTC\n9: Read Snapshots\na: Verify bot PIN code\nv: Verify wallet PIN code\n";
     PromptMsg += "q: Exit \nMake your choose:";
     const inquirer = require('inquirer');

     // const TYPE_CREATE_WALLET             = '1: Create Wallet';
     // const TYPE_BITCOIN_INFO              = '2: Read Bitcoin balance & Address ';
     // const TYPE_USDT_INFO                 = '3: Read USDT balance & Address';
     // const TYPE_EOS_INFO                  = '4: Read EOS balance & Address';

     const prompts = [
       {
         name: 'type',
         type: 'list',
         default: firstLine,
         message: PromptMsg,
         choices: walletList,
       },
     ];
     (async () => {
       const args = await inquirer.prompt(prompts);
       console.log('dappCreate.args', args);
     })();
 });
console.log("-----LINE END OF------");
