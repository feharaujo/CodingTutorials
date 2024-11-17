import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CommunicationStateMachine } from './state-machines/comunication-step-machine';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class StepFunctionsExampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const sendEmailLambda = new NodejsFunction(this, 'SendEmailLambdaFunction', {
      entry: 'application/src/sendEmailLambda.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_20_X,
    })

    const sendSMSLambda = new NodejsFunction(this, 'SendSMSLambdaFunction', {
      entry: 'application/src/sendSMSLambda.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_20_X,
    })

    const saveAnalyticsLambda = new NodejsFunction(this, 'SaveAnalyticsLambdaFunction', {
      entry: 'application/src/saveAnalytics.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_20_X,
    })

    new CommunicationStateMachine(this, 'CommunicationStateMachine', {
      smsLambda: sendSMSLambda,
      emailLambda: sendEmailLambda,
      analyticsLambda: saveAnalyticsLambda
    })

  }
}
