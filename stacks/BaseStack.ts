import * as cdk from "aws-cdk-lib";
import { StackContext } from "sst/constructs";

export function BaseStack({ app, stack }: StackContext) {
  const PREFIX = `${app.stage}-${app.name}`;
  const scheduleGroup = new cdk.CfnResource(
    stack,
    `${PREFIX}-myTestSchedulerGroup`,
    {
      type: "AWS::Scheduler::ScheduleGroup",
      properties: {
        Name: `${PREFIX}-myTestSchedulerGroup`,
      },
    }
  );

  return {
    SCHEDULER_GROUP_NAME: scheduleGroup.ref,
  };
}
