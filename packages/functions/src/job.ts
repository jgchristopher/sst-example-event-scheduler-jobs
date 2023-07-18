import { SQSEvent } from "aws-lambda";
import AWS from "aws-sdk";
import { Queue } from "sst/node/queue";

const sqs = new AWS.SQS();

export async function producer() {
  const queueUrl = Queue.jobQueue.queueUrl;
  // Send a message to queue
  await sqs
    .sendMessage({
      // Get the queue url from the environment variable
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify({ ordered: true }),
    })
    .promise();

  console.log("Message queued!");

  return {
    statusCode: 200,
    body: JSON.stringify({ status: "successful" }),
  };
}

export async function consumer(event: SQSEvent) {
  const records: any[] = event.Records;
  console.log(`Message processed: "${records[0].body}"`);

  return {};
}
