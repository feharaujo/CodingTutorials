import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { TransactionsTable } from './dynamodb/transactions-table';
import { TransactionsGateway } from './gateway/transactions-gateway';
import { GetTodayTransactionsLambda } from './lambdas/get-today-transactions-lambda';
import { PostNewTransactionLambda } from './lambdas/post-new-transaction-lambda';

export class InitWithCDKTypescriptStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const transactionsTable = new TransactionsTable(this);

    const postNewTransactionsLambda = new PostNewTransactionLambda(this, { transactionsTable });
    const getTodayTransactionsLambda = new GetTodayTransactionsLambda(this, { transactionsTable });

    new TransactionsGateway(this, { postNewTransactionsLambda: postNewTransactionsLambda, getTodayTransactionsLambda });
  }
}

