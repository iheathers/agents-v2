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

import { streamText, type ModelMessage } from "ai";
import { DevToolsTelemetry } from "@ai-sdk/devtools";
import { OpenTelemetry } from "@ai-sdk/otel";
import { getTracer } from "@lmnr-ai/lmnr";
import { openai } from "@ai-sdk/openai";

import { tools } from "./tools/index.ts";
import { executeTool } from "./executeTools.ts";

import { SYSTEM_PROMPT } from "./system/prompt.ts";
import type { AgentCallbacks, ToolCallInfo } from "../types.ts";

import { filterCompatibleMessages } from "./system/filterMessages.ts";

const MODEL_NAME = "gpt-5-mini";

export const runAgent = async (
  userMessage: string,
  conversationHistory: ModelMessage[],
  callbacks: AgentCallbacks,
) => {
  // const { text } = await generateText({
  //   model: openai(MODEL_NAME),
  //   prompt: userMessage,
  //   system: SYSTEM_PROMPT,
  //   tools,
  //   experimental_telemetry: {
  //     isEnabled: true,
  //     tracer: getTracer(),
  //   },
  // });
  // console.log("done");
  // toolCalls.forEach(
  //   async (tc) =>{
  //     console.log(await executeTool(tc.toolName, tc.input))}
  // )

  const workingHistory = filterCompatibleMessages(conversationHistory);
  const messages: ModelMessage[] = [
    ...workingHistory,
    {
      role: "user",
      content: userMessage,
    },
  ];

  let fullResponse = "";

  // Share one DevTools runId across all streamText calls in this turn
  // so tool-call + follow-up steps appear as one run.
  const runId = crypto.randomUUID();
  const telemetryIntegrations = [
    DevToolsTelemetry({ runId }),
    new OpenTelemetry({ tracer: getTracer() }),
  ];

  while (true) {
    const result = streamText({
      model: openai(MODEL_NAME),
      instructions: SYSTEM_PROMPT,
      messages,
      tools,
      telemetry: {
        integrations: telemetryIntegrations,
      },
    });

    const toolCalls: ToolCallInfo[] = [];

    let currentText = "";
    let streamError: Error | null = null;

    try {
      for await (const chunk of result.fullStream) {
        if (chunk.type === "text-delta") {
          currentText += chunk.text;
          callbacks.onToken(chunk.text);
        }

        if (chunk.type === "tool-call") {
          const input = "input" in chunk ? chunk.input : {};
          toolCalls.push({
            toolCallId: chunk.toolCallId,
            toolName: chunk.toolName,
            args: input as any,
          });

          callbacks.onToolCallStart(chunk.toolName, input);
        }
      }
    } catch (error) {
      streamError = error as Error;

      if (
        !currentText &&
        !streamError.message.includes("No output generated")
      ) {
        throw streamError;
      }
    }

    fullResponse += currentText;

    if (streamError && !currentText) {
      fullResponse = "Sorry about that. ";

      callbacks.onToken(fullResponse);
      break;
    }

    const finishReason = await result.finishReason;

    if (finishReason !== "tool-calls" || toolCalls.length === 0) {
      const responseMessages = await result.response;

      messages.push(...responseMessages.messages);
      break;
    }

    const responseMessages = await result.response;
    messages.push(...responseMessages.messages);

    for (const tc of toolCalls) {
      const result = await executeTool(
        tc.toolName as keyof typeof tools,
        tc.args,
      );

      callbacks.onToolCallEnd(tc.toolName, result);

      messages.push({
        role: "tool",
        content: [
          {
            type: "tool-result",
            toolCallId: tc.toolCallId,
            toolName: tc.toolName,
            output: {
              type: "text",
              value: result,
            },
          },
        ],
      });
    }
  }

  callbacks.onComplete(fullResponse);
  return messages;
};

// runAgent('What is the current time, right now?')
