import { DynamoDB } from "aws-sdk";
import { RecordedTransaction, Transaction } from "../objects/transaction";

const TRANSACTION_TABLE_NAME: string = getEnv('TRANSACTIONS_TABLE');

const transactionsClient = new DynamoDB.DocumentClient();

export async function createNewTransaction(transaction: Transaction) {
  const params = {
    TableName: TRANSACTION_TABLE_NAME,
    Item: {
      ...generateMainKeys(transaction.email),
      ...generateSecondaryIndex(transaction.value, transaction.currency),
      address: transaction.address,
      phone: transaction.phone,
      comments: transaction.comments,
    },
  };

  return await transactionsClient.put(params).promise();
}

export async function getTodayTransactions(email: string): Promise<RecordedTransaction[]> {
  const params = {
    TableName: TRANSACTION_TABLE_NAME,
    KeyConditionExpression: "EMAIL = :email AND CREATEDAT BETWEEN :start AND :end",
    ExpressionAttributeValues: {
      ":email": email,
      ":start": new Date().toISOString().split("T")[0],
      ":end": new Date().toISOString(),
    },
  };

  const result = await transactionsClient.query(params).promise();

  return result.Items as RecordedTransaction[];
}

function generateMainKeys(email: string) {
  return {
    EMAIL: email,
    CREATEDAT: new Date().toISOString(),
  };
}

function generateSecondaryIndex(value: number, currency: string) {
  return {
    VALUE: value,
    CURRENCY: currency,
  };
}

function getEnv(name: string): string {
    const envValue = process.env[name];
    console.log(`transactionsDataStore.gevEnv: ${name} => ${envValue}`);
    if(!envValue) throw new Error('env variable not found');

    return envValue;
}