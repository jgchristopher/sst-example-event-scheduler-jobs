import { Function, Queue, StackContext, use } from "sst/constructs";
import { BaseStack } from "../stacks/BaseStack";
import * as iam from "aws-cdk-lib/aws-iam";
import { IScheduleProps, generateSchedule } from "./scheduler";

export interface IJobStackProps {
  jobName: string;
  jobProducerHandler: string;
  jobConsumerHandler: string;
}

export function generateJobStack(
  jobProps: IJobStackProps,
  schedulerProps: IScheduleProps
) {
  return function ({ app, stack }: StackContext) {
    const PREFIX = `${app.logicalPrefixedName(jobProps.jobName)}`;

    const { SCHEDULER_GROUP_NAME } = use(BaseStack);

    const queue = new Queue(stack, `${jobProps.jobName}Queue`, {
      consumer: jobProps.jobConsumerHandler,
    });

    const producerFunction = new Function(
      stack,
      `${jobProps.jobName}Function`,
      {
        handler: jobProps.jobProducerHandler,
        bind: [queue],
      }
    );

    const schedulerRole = new iam.Role(stack, `${PREFIX}-SchedulerRole`, {
      assumedBy: new iam.ServicePrincipal("scheduler.amazonaws.com"),
    });

    const invokeLambdaPolicy = new iam.Policy(stack, `${PREFIX}-LambdaPolicy`, {
      document: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            actions: ["lambda:InvokeFunction"],
            resources: [producerFunction.functionArn],
            effect: iam.Effect.ALLOW,
          }),
        ],
      }),
    });
    schedulerRole.attachInlinePolicy(invokeLambdaPolicy);

    generateSchedule(stack, `${PREFIX}-EventBridgeSchedule`, {
      scheduleName: `${PREFIX}-EventBridgeSchedule`, // schedulerProps.scheduleName, // `${PREFIX}-EventBridgeSchedule`,
      scheduleGroupName: SCHEDULER_GROUP_NAME,
      scheduleDescription: schedulerProps.scheduleDescription, // "Runs a lambda every weekday at 6 AM EST",
      scheduleCronExpression: schedulerProps.scheduleCronExpression, // "cron(0 6 ? * MON-FRI *)",
      scheduleTargetFunctionArn: producerFunction.functionArn,
      scheduleRoleArn: schedulerRole.roleArn,
    });
  };
}
