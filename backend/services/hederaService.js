const { FileCreateTransaction, FileContentsQuery, Hbar, FileId } = require("@hashgraph/sdk");
const client = require('../config/hedera');

async function storeDecisionOnHedera(text) {
  try {
    const tx = new FileCreateTransaction()
      .setContents(text)
      .setMaxTransactionFee(new Hbar(2));
    const submitTx = await tx.execute(client);
    const receipt = await submitTx.getReceipt(client);
    return receipt.fileId.toString();
  } catch (err) {
    console.error("Hedera store error:", err);
    throw err;
  }
}

async function readFileFromHedera(fileIdStr) {
  try {
    const contents = await new FileContentsQuery()
      .setFileId(FileId.fromString(fileIdStr))
      .execute(client);
    return Buffer.from(contents).toString('utf8');
  } catch (err) {
    console.error("Hedera read error:", err);
    throw err;
  }
}

module.exports = {
  storeDecisionOnHedera,
  readFileFromHedera
};
