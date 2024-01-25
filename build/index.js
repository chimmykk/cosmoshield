import { getWalletItems, printBalances, untilPositiveBalance } from "./utils/cosmos-common.js";
import { sendConsolidatedTransactions } from "./utils/cosmos-tx.js";
import { readFile, sleep, until5SecLeft } from "./utils/other.js";
import { GENESIS_TIMESTAMP, RPC_ENDPOINT } from "./config.js";

async function main() {
    let fileStrings = readFile("../.././data/mnemonic.txt");
    await until5SecLeft(GENESIS_TIMESTAMP);
    let walletItems = await getWalletItems(fileStrings, RPC_ENDPOINT);

    console.log('\n/////// BALANCE ///////\n');
    await untilPositiveBalance(walletItems);

    console.log('\n/////// TRANSFER ///////\n');
    
    // Run sendConsolidatedTransactions multiple times (adjust the loop as needed)
    for (let i = 0; i < 10000; i++) {
        await sendConsolidatedTransactions(walletItems);
        console.log('\n/////// BALANCE ///////\n');
        await printBalances(walletItems, true, true);
        await sleep(100);
    }

    console.log('\n yo yo success.\n');
}

await main();
