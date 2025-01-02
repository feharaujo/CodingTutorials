import {
    GetObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { Handler, S3Event } from "aws-lambda";

//const BATCH_BUCKET = process.env['BATCH_BUCKET']

export const handler: Handler = async (event: any) => {
    console.log(`readS3ContentLambda.handler => starting event => ${JSON.stringify(event)}`)

    const eventRecord: S3Event = JSON.parse(event[0].body)
    console.log(`readS3ContentLambda.handler => eventRecord => ${JSON.stringify(eventRecord)}`)

    const record = eventRecord.Records[0];
    console.log(`readS3ContentLambda.handler => record`, JSON.stringify(record))

    const bucket = record.s3.bucket.name;
    console.log(`readS3ContentLambda.handler => bucket`, JSON.stringify(bucket))

    const key = decodeURIComponent(record.s3.object.key.replace(/\\+/g, ' '));

    console.log(`key => ${key}`)

    const client = new S3Client({})
    const response = await client.send(
        new GetObjectCommand({
            Bucket: bucket,
            Key: key,
        }),
    )

    const payloadString = await response.Body!.transformToString()
    console.log(`readS3ContentLambda.handler => payload ${payloadString}`)

    const payload = JSON.parse(payloadString)

    return payload
};