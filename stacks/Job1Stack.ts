import { StackContext } from "sst/constructs";
import { generateJobStack } from "../constructs/JobStackTemplate";

export function Job1Stack(stackContext: StackContext) {
  const JOB_NAME = "job1";
  generateJobStack(
    {
      jobName: JOB_NAME,
      jobProducerHandler: `packages/functions/src/jobs/${JOB_NAME}.producer`,
      jobConsumerHandler: `packages/functions/src/jobs/${JOB_NAME}.consumer`,
    },
    {
      scheduleDescription: "Runs a lambda every minute",
      scheduleCronExpression: "cron(* * ? * * *)",
    }
  )(stackContext);
}
