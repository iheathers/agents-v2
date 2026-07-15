import "dotenv/config";
// // import { generateText, type ModelMessage } from "ai";

// // import { openai } from "@ai-sdk/openai"; // adapter for openai model

// // import { SYSTEM_PROMPT } from "./system/prompt";
// // import type { AgentCallbacks } from "../types";

// // const MODEL_NAME = "gpt-5-mini";

// // export const runAgent = async (
// //   userMessage: string,
// //   conversationHistory: ModelMessage[],
// //   callbacks: AgentCallbacks
// // ) => {
// //   const { text } = await generateText({
// //     model: openai(MODEL_NAME),
// //     prompt: userMessage,
// //     system: SYSTEM_PROMPT,
// //   });

// //   console.log(text)
// // };

// // runAgent('Hi my name is pritam')

// import {tools} from './tools/index.ts';

// import { SYSTEM_PROMPT } from './system/prompt.ts';

// import type { AgentCallbacks } from '../types.ts';
// import { generateText, stepCountIs, type ModelMessage } from 'ai';
// import { openai } from '@ai-sdk/openai';
// import { executeTools } from './executeTools.ts';

// const MODEL_NAME = 'gpt-5-mini';

// export const runAgent = async (
//   useMessage: string,
//  conversationHistory:  ModelMessage[],
//  callbacks: AgentCallbacks
// ) => {
//   const {text, toolCalls} = await generateText({
//     model: openai(MODEL_NAME),
//     prompt: useMessage,
//     system: SYSTEM_PROMPT,
//     tools,
//     stopWhen: stepCountIs(2)

//   })

//   console.log({text})
//   console.log({toolCalls})

// toolCalls.forEach((
//   async toolCall => {

//     const result = await executeTools(toolCall.toolName as any, toolCall.input)
//     console.log({result})}

// ))

// }

// runAgent("get the current data and time")

import { generateText, type ModelMessage } from "ai";

import { getTracer, Laminar } from "@lmnr-ai/lmnr";

import { openai } from "@ai-sdk/openai";

import { tools } from "./tools/index.ts";
import { executeTool } from "./executeTools.ts";

import { SYSTEM_PROMPT } from "./system/prompt.ts";
import type { AgentCallbacks } from "../types.ts";

Laminar.initialize({
  projectApiKey: process.env.LMNR_PROJECT_API_KEY,
});

const MODEL_NAME = "gpt-5-mini";

export const runAgent = async (
  userMessage: string,
  conversationHistory: ModelMessage[],
  callbacks: AgentCallbacks,
) => {
  const { text } = await generateText({
    model: openai(MODEL_NAME),
    prompt: userMessage,
    system: SYSTEM_PROMPT,
    tools,
    experimental_telemetry: {
      isEnabled: true,
      tracer: getTracer(),
    },
  });

  console.log("done");

  // toolCalls.forEach(
  //   async (tc) =>{

  //     console.log(await executeTool(tc.toolName, tc.input))}
  // )
};

// runAgent('What is the current time, right now?')
