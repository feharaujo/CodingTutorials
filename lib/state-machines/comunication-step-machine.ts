import { Duration, StackProps } from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Choice, Condition, DefinitionBody, Fail, JsonPath, Map, Pass, RetryProps, StateMachine, StateMachineType } from "aws-cdk-lib/aws-stepfunctions";
import { LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";


interface CommunicationStateMachineProps extends StackProps {
    emailLambda: NodejsFunction
    smsLambda: NodejsFunction
    analyticsLambda: NodejsFunction
}

export class CommunicationStateMachine extends StateMachine {
    constructor(scope: Construct, id: string, props: CommunicationStateMachineProps) {

        const { emailLambda, smsLambda, analyticsLambda } = createLambdaInvokes(scope, props)

        // 1. Validate if communications key is in the payload
        const isCommmunicationsPresent = Condition.isPresent('$.communications')

        // 3. Process communication concurrently
        const processBatchMap = new Map(scope, 'Process batch', {
            maxConcurrency: 2,
            itemsPath: JsonPath.stringAt('$.communications'),
            resultPath: '$.processed'
        })

        // 4. Trigger the right lambda based on communication type
        processBatchMap.itemProcessor(createTypeChoice())
        processBatchMap.next(analyticsLambda)

        // 2. If communications key is present process them
        // Otherwise fail flow
        const communicationsValidation = new Choice(scope, 'Is communications key present?')
        communicationsValidation.when(isCommmunicationsPresent, processBatchMap)
            .otherwise(new Fail(scope, 'Communications not found'))

        const definition = communicationsValidation

        super(scope, id, {
            definition,
            stateMachineType: StateMachineType.STANDARD,
        })

        function createTypeChoice() {
            const typeChoice = new Choice(scope, 'SMS or EMAIL?');
            typeChoice
                .when(Condition.stringEquals('$.type', 'EMAIL'), emailLambda)
                .when(Condition.stringEquals('$.type', 'SMS'), smsLambda)
                .otherwise(new Fail(scope, 'type not found or supported'));
            return typeChoice;
        }

        function createLambdaInvokes(scope: Construct, props: CommunicationStateMachineProps) {
            const retryOnFailure: RetryProps = {
                errors: ['States.ALL'],
                maxAttempts: 2,
                backoffRate: 2,
                interval: Duration.seconds(10)
            }
            
            const emailLambda = new LambdaInvoke(scope, 'emailLambda', {
                lambdaFunction: props.emailLambda,
                outputPath: '$',
            }).addRetry(retryOnFailure)

            const smsLambda = new LambdaInvoke(scope, 'smsLambda', {
                lambdaFunction: props.smsLambda,
                outputPath: '$',
            }).addRetry(retryOnFailure)

            const analyticsLambda = new LambdaInvoke(scope, 'analyticsLambda', {
                lambdaFunction: props.analyticsLambda,
                outputPath: '$'
            }).addRetry(retryOnFailure)

            return { emailLambda, smsLambda, analyticsLambda }
        }
    }
}