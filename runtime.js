const { getNetworkInfo, Network } = require("@injectivelabs/networks");
const {
  TxClient,
  PrivateKey,
  TxGrpcClient,
  ChainRestAuthApi,
  createTransaction,
} = require("@injectivelabs/sdk-ts");
const { MsgSend } = require("@injectivelabs/sdk-ts");
const { BigNumberInBase, DEFAULT_STD_FEE } = require("@injectivelabs/utils");

// Wrap your existing code in a function
const executeLoop = async () => {
  try {
    const network = getNetworkInfo(Network.MainnetSentry);
    const privateKeyHash =
      "##update";
    const privateKey = PrivateKey.fromHex(privateKeyHash);
    const injectiveAddress = privateKey.toBech32();
    const publicKey = privateKey.toPublicKey().toBase64();

    /** Account Details **/
    const accountDetails = await new ChainRestAuthApi(network.rest).fetchAccount(
      injectiveAddress
    );

    /** Prepare the Message */
    const amount = {
      amount: new BigNumberInBase(1.19).toWei().toFixed(),
      denom: "inj",
    };

    const msg = MsgSend.fromJSON({
      amount,
      srcInjectiveAddress: injectiveAddress,
      dstInjectiveAddress: "inj155peamfpakt7phr3kvl83ud80c8c90qynmwtx2",
    });

    /** Prepare the Transaction **/
    const { signBytes, txRaw } = createTransaction({
      message: msg,
      memo: "",
      fee: DEFAULT_STD_FEE,
      pubKey: publicKey,
      sequence: parseInt(accountDetails.account.base_account.sequence, 10),
      accountNumber: parseInt(
        accountDetails.account.base_account.account_number,
        10
      ),
      chainId: network.chainId,
    });

    /** Sign transaction */
    const signature = await privateKey.sign(Buffer.from(signBytes));

    /** Append Signatures */
    txRaw.signatures = [signature];

    /** Calculate hash of the transaction */
    console.log(`Transaction Hash: ${TxClient.hash(txRaw)}`);

    const txService = new TxGrpcClient(network.grpc);

    /** Simulate transaction */
    const simulationResponse = await txService.simulate(txRaw);
    console.log(
      "Transaction simulation response:",
      JSON.stringify(simulationResponse.gasInfo)
    );

    /** Broadcast transaction */
    const txResponse = await txService.broadcast(txRaw);

    if (txResponse.code !== "0") {
      console.log(`Transaction failed: ${txResponse.rawLog}`);
    } else {
      console.log(
        "Broadcasted transaction hash:",
        JSON.stringify(txResponse.txHash)
      );
    }

  } catch (error) {
    console.error("An error occurred:", error);
  }
};

// Set an interval to execute the loop every 10 seconds (adjust the interval as needed)
const intervalId = setInterval(executeLoop, 1000);

// Optionally, you can use clearInterval to stop the loop after a certain period
// Uncomment the following line to stop the loop after 60 seconds
// setTimeout(() => clearInterval(intervalId), 60000);
