import { SQSEvent } from "aws-lambda";
import AWS from "aws-sdk";
import { Queue } from "sst/node/queue";

const sqs = new AWS.SQS();

export async function producer() {
  const queueUrl = Queue.job2Queue.queueUrl;

  await sqs
    .sendMessage({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify({ ordered: true }),
    })
    .promise();

  console.info("Message queued!");

  return {
    statusCode: 200,
    body: JSON.stringify({ status: "successful" }),
  };
}

export async function consumer(event: SQSEvent) {
  const records: any[] = event.Records;
  console.info(`Message processed: "${records[0].body}"`);

  return {};
}
