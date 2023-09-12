import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { getTodayTransactions } from "../stores/transactionsDataStore";

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {

  try {
    const email = event.queryStringParameters?.email;
    if (!email) {
      throw new Error("email is required");
    }

    const transactions = await getTodayTransactions(email);

    return {
      statusCode: 200,
      body: JSON.stringify(transactions),
    };
  } catch (error: any) {
    console.error("Error :", error);

    return {
      statusCode: 500,
      body: error.message,
    };
  }
};
