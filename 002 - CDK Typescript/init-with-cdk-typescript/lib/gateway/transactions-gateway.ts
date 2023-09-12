import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as apiGateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";

interface TransactionsGatewayParams {
    postNewTransactionsLambda: NodejsFunction,
    getTodayTransactionsLambda: NodejsFunction,
}

export class TransactionsGateway extends Construct {
    constructor(scope: Construct, params: TransactionsGatewayParams) {
        super(scope, 'TransactionsGateway');

        const api = new apiGateway.RestApi(this, "TransactionsApi", {
            restApiName: "New Transactions API",
            description: "Juno Coding - New Transactions API",
          });
      
          api.root.addMethod("POST", new apiGateway.LambdaIntegration(params.postNewTransactionsLambda, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' },
          }));

          api.root.addMethod("GET", new apiGateway.LambdaIntegration(params.getTodayTransactionsLambda, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' },
          }));
    } 
}