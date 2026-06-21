import {tools} from './tools/index.ts'

// export type ToolName = keyof typeof tools



type ToolsType = typeof tools;
type ToolName = keyof ToolsType




export const executeTool = async (name: ToolName, args: any) =>{

    const tool = tools[name]

    if (!tool){
        return "Sorry, this tool is not ready yet. Use something else or better yet, let user know "
    }

    const execute = tool.execute

    if (!execute){
        return 'This is not a registered tool.'
    }

    const result = await execute(args as any, {
        toolCallId: "", 
        messages: []
    })

    return String(result)

}

executeTool('getDateTime', "args")