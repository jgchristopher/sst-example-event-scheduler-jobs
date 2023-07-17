import { SSTConfig } from "sst";
import { BaseStack } from "./stacks/BaseStack";
import { Job1Stack } from "./stacks/Job1Stack";
import { Job2Stack } from "./stacks/Job2Stack";

export default {
  config(_input) {
    return {
      name: "JobAppExample",
      region: "us-east-2",
    };
  },
  stacks(app) {
    app.stack(BaseStack).stack(Job1Stack).stack(Job2Stack);
  },
} satisfies SSTConfig;
