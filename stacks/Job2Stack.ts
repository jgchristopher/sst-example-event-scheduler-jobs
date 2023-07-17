import { StackContext } from "sst/constructs";
import { generateJobStack } from "../constructs/JobStackTemplate";

export function Job2Stack(stackContext: StackContext) {
  const JOB_NAME = "job2";
  generateJobStack(
    {
      jobName: JOB_NAME,
      jobProducerHandler: `packages/functions/src/jobs/${JOB_NAME}.producer`,
      jobConsumerHandler: `packages/functions/src/jobs/${JOB_NAME}.consumer`,
    },
    {
      scheduleDescription: "Runs a lambda at the top of every hour",
      scheduleCronExpression: "cron(0 * ? * * *)",
    }
  )(stackContext);
}
