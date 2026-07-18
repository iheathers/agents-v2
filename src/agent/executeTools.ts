import { tools } from "./tools/index.ts";

type ToolsType = typeof tools;
type ToolName = keyof ToolsType;

const executors: {
  [K in ToolName]: (args: unknown) => Promise<string>;
} = {
  getDateTime: async () => new Date().toISOString(),
};

export const executeTool = async (name: ToolName, args: any) => {
  const tool = tools[name];

  if (!tool) {
    return "Sorry, this tool is not ready yet. Use something else or better yet, let user know ";
  }

  const execute = executors[name];

  if (!execute) {
    return "This is not a registered tool.";
  }

  const result = await execute(args);

  return String(result);
};
