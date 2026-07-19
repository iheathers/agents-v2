import { evaluate } from "@lmnr-ai/lmnr";

import { toolOrderCorrect, toolsAvoided, llmJudge } from "./evaluators";

import type {
  MultiTurnDatasetEntry,
  MultiTurnEvalData,
  MultiTurnResult,
  MultiTurnTarget,
} from "./types";

import dataset from "./data/agent-multiturn.json" with { type: "json" };

import { multiTurnWithMocks } from "./executors";

const executor = async (data: MultiTurnEvalData) => {
  return multiTurnWithMocks(data);
};

evaluate({
  data: dataset as any,
  executor,
  evaluators: {
    outputQuality: async (output, target) => {
      if (!target) return 1;
      return llmJudge(output as any, target as any);
    },
  },
  config: {
    projectApiKey: process.env.LAMR_API_KEY,
  },
  groupName: "agent-multiturn",
});
