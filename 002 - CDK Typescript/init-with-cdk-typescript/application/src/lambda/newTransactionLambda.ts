import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import { Transaction } from "../objects/transaction";
import { createNewTransaction } from "../stores/transactionsDataStore";

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {

  try {
    const transaction = parseAndValidate(event);
    await createNewTransaction(transaction);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Transaction created with success`,
      }),
    };
  } catch (error: any) {
    console.error("Error :", error);

    return {
      statusCode: 500,
      body: error.message,
    };
  }
};

function parseAndValidate(event: APIGatewayProxyEvent): Transaction {
  if (!event.body) throw new Error("Invalid input");

  const body = JSON.parse(event.body);
  if (!body.email || !body.value || !body.currency)
    throw new Error("Invalid input");

  return body;
}
