import { evaluate, Laminar } from "@lmnr-ai/lmnr";

import { llmJudge } from "./evaluators";

import type {
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
      const { score, reason } = await llmJudge(
        output,
        target as MultiTurnTarget,
      );
      // Laminar scores must be numeric; attach reason on the trace for the UI
      Laminar.setTraceMetadata({ judgeReason: reason });
      return score;
    },
  },
  config: {
    projectApiKey: process.env.LAMR_API_KEY,
  },
  groupName: "agent-multiturn",
});
