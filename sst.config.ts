import { SSTConfig } from "sst";
import { BaseStack } from "./stacks/BaseStack";

export default {
  config(_input) {
    return {
      name: "JobAppExample",
      region: "us-east-2",
    };
  },
  stacks(app) {
    app.stack(BaseStack);
  },
} satisfies SSTConfig;
