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
      GroupName: props.scheduleGroupName,
      Name: props.scheduleName,
      State: "DISABLED",
      Description: props.scheduleDescription,
      FlexibleTimeWindow: { Mode: "OFF" },
      ScheduleExpression: props.scheduleCronExpression,
      ScheduleExpressionTimezone: "America/New_York",
      Target: {
        Arn: props.scheduleTargetFunctionArn,
        RoleArn: props.scheduleRoleArn,
      },
    },
  });
}
