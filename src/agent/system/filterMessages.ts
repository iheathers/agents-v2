import type { ModelMessage } from "ai";
/**
 * Filter conversation history to only include compatible message formats.
 * Provider tools (like webSearch) may return messages with formats that
 * cause issues when passed back to subsequent API calls.
 */
export const filterCompatibleMessages = (
  messages: ModelMessage[],
): ModelMessage[] => {
  return messages.filter((msg) => {
    // Keep user and system messages
    if (msg.role === "user" || msg.role === "system") {
      return true;
    }

    // Keep assistant messages that have text and/or tool-call content.
    // Tool-call-only messages must be kept so matching tool results stay valid.
    if (msg.role === "assistant") {
      const content = msg.content;
      if (typeof content === "string" && content.trim()) {
        return true;
      }
      if (Array.isArray(content)) {
        return content.some((part: unknown) => {
          if (typeof part === "string" && part.trim()) return true;
          if (typeof part !== "object" || part === null) return false;
          if ("text" in part) {
            const textPart = part as { text?: string };
            return Boolean(textPart.text?.trim());
          }
          if ("type" in part) {
            const typedPart = part as { type?: string };
            return (
              typedPart.type === "tool-call" ||
              typedPart.type === "tool-call-delta"
            );
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
