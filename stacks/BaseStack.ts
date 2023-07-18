import { Function, Queue, StackContext } from "sst/constructs";
import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";

export function BaseStack({ app, stack }: StackContext) {
  const PREFIX = `${app.stage}-${app.name}`;

  const scheduleGroup = new cdk.CfnResource(
    stack,
    `${PREFIX}-myTestScheduleGroup`,
    {
      type: "AWS::Scheduler::ScheduleGroup",
      properties: {
        Name: `${PREFIX}-myTestScheduleGroup`,
      },
    }
  );

  const queue = new Queue(stack, "jobQueue", {
    consumer: `packages/functions/src/job.consumer`,
  });

  const producerFunction = new Function(stack, "jobProducerFunction", {
    handler: `packages/functions/src/job.producer`,
    bind: [queue],
  });

  const schedulerRole = new iam.Role(
    stack,
    `${app.logicalPrefixedName("job")}-ScheduleRole`,
    {
      assumedBy: new iam.ServicePrincipal("scheduler.amazonaws.com"),
    }
  );

  const invokeLambdaPolicy = new iam.Policy(
    stack,
    `${app.logicalPrefixedName("job")}-InvokeLambdaPolicy`,
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

  new cdk.CfnResource(stack, `${app.logicalPrefixedName("job")}-Schedule`, {
    type: "AWS::Scheduler::Schedule",
    properties: {
      GroupName: scheduleGroup.ref,
      Name: `${app.logicalPrefixedName("job")}-Schedule`,
      State: "DISABLED",
      Description: "Runs a lambda every minute ",
      FlexibleTimeWindow: { Mode: "OFF" },
      ScheduleExpression: "cron(* * ? * * *)",
      ScheduleExpressionTimezone: "America/New_York",
      Target: {
        Arn: producerFunction.functionArn,
        RoleArn: schedulerRole.roleArn,
      },
    },
  });
}
