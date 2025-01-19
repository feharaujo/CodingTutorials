import {
    GetObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { Handler, S3Event } from "aws-lambda";

export const handler: Handler = async (event: any) => {
    console.log(`readS3ContentLambda.handler => starting event => ${JSON.stringify(event)}`)

    const eventRecord: S3Event = JSON.parse(event[0].body)
    const record = eventRecord.Records[0];
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\\+/g, ' '));

    const client = new S3Client({})
    const response = await client.send(
        new GetObjectCommand({
            Bucket: bucket,
            Key: key,
        }),
    )

    const payloadString = await response.Body!.transformToString()
    console.log(`readS3ContentLambda.handler => payload ${payloadString}`)

    return JSON.parse(payloadString)
};