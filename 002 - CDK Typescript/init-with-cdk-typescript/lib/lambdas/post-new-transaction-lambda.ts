import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Table } from "aws-cdk-lib/aws-dynamodb";

interface PostNewTransactionLambdaParams {
    transactionsTable: Table
}

export class PostNewTransactionLambda extends NodejsFunction {
    constructor(scope: Construct, params: PostNewTransactionLambdaParams) {
        super(scope, 'NewTransactionLambda', {
            runtime: Runtime.NODEJS_18_X,
            memorySize: 256,
            bundling: {
              minify: true,
              sourceMap: true,
            },
            entry: "application/src/lambda/newTransactionLambda.ts",
            handler: "handler",
            environment: {
                TRANSACTIONS_TABLE: params.transactionsTable.tableName
            }
        });

        params.transactionsTable.grantReadWriteData(this);
    }
}