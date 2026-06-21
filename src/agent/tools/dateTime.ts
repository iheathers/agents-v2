import {tool} from 'ai'

import {z} from 'zod';

export const getDateTime = tool(
    {
        
        description: "Get the current date and time.",
        inputSchema: z.object({}),
        execute: async (arg1, arg2) => {
            return new Date().toISOString()
        }
    }
)


// export const test = tool(
//     {
        
//         description: "Get the current date and time.",
//         inputSchema: z.object({}),
//         execute: async () => {
//             return new Date().toISOString()
//         }
//     }
// )

// console.log({getDateTime})

// export const getDateTime