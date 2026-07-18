import type { ModelMessage } from "ai";
/**
 * Filter conversation history to only include compatible message formats.
 * Provider tools (like webSearch) may return messages with formats that
 * cause issues when passed back to subsequent API calls.
 *
 * Important: assistant messages that only contain tool calls (no text) must
 * be kept so tool-result messages still have a matching tool_call_id.
 */
export const filterCompatibleMessages = (
  messages: ModelMessage[],
): ModelMessage[] => {
  return messages.filter((msg) => {
    // Keep user and system messages
    if (msg.role === "user" || msg.role === "system") {
      return true;
    }

    // Keep assistant messages that have text or tool-call content
    if (msg.role === "assistant") {
      const content = msg.content;
      if (typeof content === "string" && content.trim()) {
        return true;
      }
      // Check for array content with text or tool-call parts
      if (Array.isArray(content)) {
        return content.some((part: unknown) => {
          if (typeof part === "string" && part.trim()) return true;
          if (typeof part !== "object" || part === null) return false;

          if ("type" in part) {
            const typedPart = part as { type?: string; text?: string };
            if (typedPart.type === "tool-call") return true;
            if (
              typedPart.type === "text" &&
              typedPart.text &&
              typedPart.text.trim()
            ) {
              return true;
            }
          }

          if ("text" in part) {
            const textPart = part as { text?: string };
            return Boolean(textPart.text && textPart.text.trim());
          }

          return false;
        });
      }
    }

    // Keep tool messages
    if (msg.role === "tool") {
      return true;
    }

    return false;
  });
};
