import * as cdk from "aws-cdk-lib";
import { Stack } from "sst/constructs/Stack";

export interface IScheduleProps {
  scheduleName?: string;
  scheduleGroupName?: string;
  scheduleDescription: string;
  scheduleCronExpression: string;
  scheduleTargetFunctionArn?: string;
  scheduleRoleArn?: string;
}

export function generateSchedule(
  stack: Stack,
  id: string,
  props: IScheduleProps
) {
  return new cdk.CfnResource(stack, id, {
    type: "AWS::Scheduler::Schedule",
    properties: {
      GroupName: props.scheduleGroupName, //scheduleGroup.ref,
      Name: props.scheduleName, //"myTestEventBridgeScheduler",
      State: "DISABLED",
      Description: props.scheduleDescription, // "Runs a lambda every weekday at 6 AM EST",
      FlexibleTimeWindow: { Mode: "OFF" },
      ScheduleExpression: props.scheduleCronExpression, // "cron(0 6 ? * MON-FRI *)",
      ScheduleExpressionTimezone: "America/New_York",
      Target: {
        Arn: props.scheduleTargetFunctionArn, // producerFunction.functionArn,
        RoleArn: props.scheduleRoleArn, // schedulerRole.roleArn,
      },
    },
  });
}
