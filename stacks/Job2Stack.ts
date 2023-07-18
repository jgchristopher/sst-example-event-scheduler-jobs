import { Function, Queue, StackContext, use } from "sst/constructs";
import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";

import { BaseStack } from "./BaseStack";

export function Job2Stack({ app, stack }: StackContext) {
  const { SCHEDULER_GROUP_NAME } = use(BaseStack);
  const JOB_NAME = "job2";

  const queue = new Queue(stack, `${JOB_NAME}Queue`, {
    consumer: `packages/functions/src/jobs/${JOB_NAME}.consumer`,
  });

  const producerFunction = new Function(stack, `${JOB_NAME}ProducerFunction`, {
    handler: `packages/functions/src/jobs/${JOB_NAME}.producer`,
    bind: [queue],
  });

  const schedulerRole = new iam.Role(
    stack,
    `${app.logicalPrefixedName(JOB_NAME)}-ScheduleRole`,
    {
      assumedBy: new iam.ServicePrincipal("scheduler.amazonaws.com"),
    }
  );

  const invokeLambdaPolicy = new iam.Policy(
    stack,
    `${app.logicalPrefixedName(JOB_NAME)}-LambdaPolicy`,
    {
      document: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            actions: ["lambda:InvokeFunction"],
            resources: [producerFunction.functionArn],
            effect: iam.Effect.ALLOW,
          }),
        ],
      }),
    }
  );
  schedulerRole.attachInlinePolicy(invokeLambdaPolicy);

  new cdk.CfnResource(
    stack,
    `${app.logicalPrefixedName(JOB_NAME)}-EventBridgeSchedule`,
    {
      type: "AWS::Scheduler::Schedule",
      properties: {
        GroupName: SCHEDULER_GROUP_NAME,
        Name: `${app.logicalPrefixedName(JOB_NAME)}-EventBridgeSchedule`,
        State: "DISABLED",
        Description: "Runs a lambda at the top of every hour",
        FlexibleTimeWindow: { Mode: "OFF" },
        ScheduleExpression: "cron(0 * ? * * *)",
        ScheduleExpressionTimezone: "America/New_York",
        Target: {
          Arn: producerFunction.functionArn,
          RoleArn: schedulerRole.roleArn,
        },
      },
    }
  );
}
