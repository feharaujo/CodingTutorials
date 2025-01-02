import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CommunicationStateMachine } from './state-machines/comunication-step-machine';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Bucket, EventType } from 'aws-cdk-lib/aws-s3';
import { Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { CfnPipe } from 'aws-cdk-lib/aws-pipes';
import { SqsDestination } from 'aws-cdk-lib/aws-s3-notifications';

export class StepFunctionsExampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const batchBucket = new Bucket(this, 'BatchBucket')

    const sendEmailLambda = new NodejsFunction(this, 'SendEmailLambdaFunction', {
      entry: 'application/src/sendEmailLambda.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_22_X,
    })

    const sendSMSLambda = new NodejsFunction(this, 'SendSMSLambdaFunction', {
      entry: 'application/src/sendSMSLambda.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_22_X,
    })

    const saveAnalyticsLambda = new NodejsFunction(this, 'SaveAnalyticsLambdaFunction', {
      entry: 'application/src/saveAnalyticsLambda.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_22_X,
    })

    const readS3ContentLambda = new NodejsFunction(this, 'ReadS3ContentLambdaFunction', {
      entry: 'application/src/readS3ContentLambda.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_22_X,
    })

    const communicationStateMachine = new CommunicationStateMachine(this, 'CommunicationStateMachine', {
      smsLambda: sendSMSLambda,
      emailLambda: sendEmailLambda,
      analyticsLambda: saveAnalyticsLambda,
      readContentLambda: readS3ContentLambda
    })


    batchBucket.grantRead(readS3ContentLambda)
    readS3ContentLambda.addEnvironment('BATCH_BUCKET', batchBucket.bucketName)

    // When file is added to the bucket, a message is added to the queue
    const batchQueue = new Queue(this, 'BatchQueue')
    batchBucket.addEventNotification(
      EventType.OBJECT_CREATED, new SqsDestination(batchQueue)
    )

    this.createPipe(batchQueue, communicationStateMachine);

  }

  private createPipe(batchQueue: cdk.aws_sqs.Queue, communicationStateMachine: CommunicationStateMachine) {
    const sourcePolicy = new PolicyStatement({
      actions: ['sqs:ReceiveMessage', 'sqs:DeleteMessage', 'sqs:GetQueueAttributes'],
      resources: [batchQueue.queueArn],
      effect: Effect.ALLOW,
    });

    const targetPolicy = new PolicyStatement({
      actions: ['states:StartExecution'],
      resources: [communicationStateMachine.stateMachineArn],
      effect: Effect.ALLOW,
    });

    // Create an EventBridge Pipe that will start the state machine
    // when a msg is received in the queue
    new CfnPipe(this, 'QueueToSF-Pipe', {
      source: batchQueue.queueArn,
      target: communicationStateMachine.stateMachineArn,
      roleArn: new Role(this, 'PipeRole', {
        assumedBy: new ServicePrincipal('pipes.amazonaws.com'),
        inlinePolicies: {
          allowSQSAndStepFunctions: new PolicyDocument({
            statements: [sourcePolicy, targetPolicy]
          })
        }
      }).roleArn,
      sourceParameters: {
        sqsQueueParameters: {
          batchSize: 1,
        },
      },
      targetParameters: {
        stepFunctionStateMachineParameters: {
          invocationType: 'FIRE_AND_FORGET',
        },
      },
    });
  }
}
