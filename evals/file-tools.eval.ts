import "dotenv/config";
import { evaluate } from "@lmnr-ai/lmnr";

import { toolSelectionScore } from "./evaluators";

import type { EvalData, EvalTarget } from "./types";
import dataset from "./data/file-tools.json" with { type: "json" };

import { singleTurnExecutorWithMocks } from "./executors";

const executor = async (data: EvalData) => {
  return singleTurnExecutorWithMocks(data);
};

// This thing is called experiment
evaluate({
  data: dataset as any,
  executor,
  name: "Baseline",
  evaluators: {
    selectionScore: (output: any, target: any) => {
      if (target?.category === "secondary") return 1;

      return toolSelectionScore(output, target);
    },
  },
  groupName: "file-tools-selection",
});
