import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

interface TodayTransactionsLambdaParams {
    transactionsTable: Table
}

export class GetTodayTransactionsLambda extends NodejsFunction {
    constructor(scope: Construct, params: TodayTransactionsLambdaParams) {
        super(scope, 'TodayTransactionsLambda', {
            runtime: Runtime.NODEJS_18_X,
            memorySize: 256,
            bundling: {
              minify: true,
              sourceMap: true,
            },
            entry: "application/src/lambda/todayTransactionsLambda.ts",
            handler: "handler",
            environment: {
                TRANSACTIONS_TABLE: params.transactionsTable.tableName
            }
        });

        params.transactionsTable.grantReadData(this);
    }
}