import { getAIResponse } from "../services/aiServices";
import { isBotMentioned, extractMessageContent } from "../utils/helpers";

interface BotData {
    name: string;
    description: string;
    image: string;
    trigger_word: string;
    commands: Record<string, string>;
}

export async function handleMessage(
    message: string,
    botData: BotData,
    isDirectMessage: boolean
) {
    let userMessage = message.trim();

    // If it's a group chat, check if the bot is mentioned
    if (!isDirectMessage && !isBotMentioned(message)) {
        return null;
    }

    // If bot is mentioned in a group chat, extract the actual message
    if (!isDirectMessage) {
        userMessage = extractMessageContent(message);
    }

    // Check if user entered a command
    if (botData.commands[userMessage]) {
        return {
            sender: {
                name: botData.name,
                avatar: botData.image,
            },
            message: botData.commands[userMessage],
        };
    }

    // Fetch AI-generated response
    const botResponse = await getAIResponse(userMessage);

    return {
        sender: {
            name: botData.name,
            avatar: botData.image,
        },
        message: botResponse,
    };
}
