const { Client, AccountId, PrivateKey } = require("@hashgraph/sdk");
const config = require('../../config');

if (!config.HEDERA_OPERATOR_ID || !config.HEDERA_OPERATOR_KEY || config.HEDERA_OPERATOR_KEY.startsWith("your")) {
  console.warn("⚠ Warning: Hedera operator id/key not set or placeholder.");
}

const client = Client.forTestnet();

try {
  client.setOperator(
    AccountId.fromString(config.HEDERA_OPERATOR_ID),
    PrivateKey.fromString(config.HEDERA_OPERATOR_KEY)
  );
} catch (err) {
  console.warn("Hedera operator not configured or invalid - Hedera operations will fail until configured.");
}

module.exports = client;
