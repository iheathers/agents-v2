import "dotenv/config";
import { streamObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const { partialObjectStream } = streamObject({
  model: openai("gpt-5.4-nano"),
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(z.object({ name: z.string(), amount: z.string() })),
      steps: z.array(z.string()),
    }),
  }),
  prompt: "Generate a lasagna recipe.",
});

for await (const partialObject of partialObjectStream) {
  console.dir(partialObject, { depth: null });
}
