import { Duration, StackProps } from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Choice, Condition, DefinitionBody, Fail, JsonPath, Map, Pass, RetryProps, StateMachine, StateMachineType, TaskInput } from "aws-cdk-lib/aws-stepfunctions";
import { LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";


interface CommunicationStateMachineProps extends StackProps {
    emailLambda: NodejsFunction
    smsLambda: NodejsFunction
    analyticsLambda: NodejsFunction
    readContentLambda: NodejsFunction
}

export class CommunicationStateMachine extends StateMachine {
    constructor(scope: Construct, id: string, props: CommunicationStateMachineProps) {

        const { emailLambda, smsLambda, analyticsLambda, readContentLambda } = createLambdaInvokes(scope, props)

        // 3. Process communication concurrently
        const processBatchMap = new Map(scope, 'Process batch', {
            maxConcurrency: 2,
            itemsPath: JsonPath.stringAt('$.Payload.communications'),
            resultPath: '$.processed'
        })

        // 4. Trigger the right lambda based on communication type
        const typeChoice = new Choice(scope, 'SMS or EMAIL?');
            typeChoice
                .when(Condition.stringEquals('$.type', 'EMAIL'), emailLambda)
                .when(Condition.stringEquals('$.type', 'SMS'), smsLambda)
                .otherwise(new Fail(scope, 'type not found or supported'));
        processBatchMap.itemProcessor(typeChoice)
        processBatchMap.next(analyticsLambda)

        // 2. Validate if communications key is in the payload
        const isCommmunicationsPresent = Condition.isPresent('$.Payload.communications')
        const communicationsValidation = new Choice(scope, 'Is communications key present?')
        communicationsValidation.when(isCommmunicationsPresent, processBatchMap)
            .otherwise(new Fail(scope, 'Communications not found'))

        // 1. read s3 content
        readContentLambda.next(communicationsValidation)

        const definition = readContentLambda

        super(scope, id, {
            definition,
        })

        function createLambdaInvokes(scope: Construct, props: CommunicationStateMachineProps) {
            const retryOnFailure: RetryProps = {
                errors: ['States.ALL'],
                maxAttempts: 2,
                backoffRate: 2,
                interval: Duration.seconds(10)
            }
            
            const emailLambda = new LambdaInvoke(scope, 'Email Lambda', {
                lambdaFunction: props.emailLambda,
                outputPath: '$',
            }).addRetry(retryOnFailure)

            const smsLambda = new LambdaInvoke(scope, 'SMS Lambda', {
                lambdaFunction: props.smsLambda,
                outputPath: '$',
            }).addRetry(retryOnFailure)

            const analyticsLambda = new LambdaInvoke(scope, 'Analytics Lambda', {
                lambdaFunction: props.analyticsLambda,
                outputPath: '$'
            }).addRetry(retryOnFailure)

            const readContentLambda = new LambdaInvoke(scope, 'Read S3 Content Lambda', {
                lambdaFunction: props.readContentLambda,
                outputPath: '$',
            })

            return { emailLambda, smsLambda, analyticsLambda, readContentLambda }
        }
    }
}