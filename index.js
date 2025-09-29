import { Client, AccountId, PrivateKey } from "@hashgraph/sdk";
import dotenv from "dotenv";

// تحميل متغيرات البيئة
dotenv.config();

// جلب بيانات الحساب من .env
const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY);

// إنشاء client على Testnet
const client = Client.forTestnet();
client.setOperator(operatorId, operatorKey);

console.log("Hedera Client جاهز للعمل على Testnet!");