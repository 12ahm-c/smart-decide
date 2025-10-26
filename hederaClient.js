require('dotenv').config();
const { Client, TopicMessageSubmitTransaction, AccountId, PrivateKey, TokenCreateTransaction } = require("@hashgraph/sdk");

const client = Client.forTestnet();
client.setOperator(
    AccountId.fromString(process.env.HEDERA_OPERATOR_ID),
    PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY)
);

const submitToHCS = async (message) => {
    const tx = new TopicMessageSubmitTransaction({
        topicId: process.env.HEDERA_TOPIC_ID,
        message: JSON.stringify(message)
    });
    const submitResponse = await tx.execute(client);
    const receipt = await submitResponse.getReceipt(client);
    return receipt.status.toString();
};

const issueNFT = async (opinionText) => {
    const tx = new TokenCreateTransaction()
        .setTokenName("Smart-Decide NFT")
        .setTokenSymbol("SDNFT")
        .setTreasuryAccountId(AccountId.fromString(process.env.HEDERA_OPERATOR_ID))
        .setInitialSupply(1)
        .setTokenType("NON_FUNGIBLE_UNIQUE")
        .setDecimals(0);

    const submitTx = await tx.execute(client);
    const receipt = await submitTx.getReceipt(client);
    return receipt.tokenId.toString();
};

module.exports = { client, submitToHCS };