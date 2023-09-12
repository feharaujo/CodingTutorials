import { 
  AttributeType,
  Table,
} from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class TransactionsTable extends Table {
  constructor(scope: Construct) {
    super(scope, 'TRANSACTIONS_TABLE', {
      partitionKey: { name: 'EMAIL', type: AttributeType.STRING },
      sortKey: { name: 'CREATEDAT', type: AttributeType.STRING },
    });
  }

}
