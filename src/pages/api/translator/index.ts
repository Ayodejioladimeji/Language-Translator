import { NextApiRequest, NextApiResponse } from "next";
import { sendWebhookNotification } from "@/lib/webhook";
import translate from "google-translate-api-x";
import { getAIResponse } from "../services/aiServices";
import { isBotMentioned, extractMessageContent } from "../utils/helpers";
import axios from "axios";
import Cors from "cors";

// Configure CORS
const cors = Cors({
    origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://telex.im",
        "https://staging.telex.im",
        "https://telex-auth.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
});

/* eslint-disable */

// Middleware function to run CORS
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}


// Full country names to ISO codes
const languageMap: Record<string, string> = {
    French: "fr",
    Spanish: "es",
    German: "de",
    Chinese: "zh",
    Arabic: "ar",
    Italian: "it",
    Russian: "ru",
    Japanese: "ja",
    Hindi: "hi",
    Korean: "ko",
    Portuguese: "pt",
    Dutch: "nl",
    Turkish: "tr",
    Swedish: "sv",
    Polish: "pl",
    Norwegian: "no",
    Finnish: "fi",
    Greek: "el",
    Hebrew: "he",
    Thai: "th",
    English: "en",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    await runMiddleware(req, res, cors);

    try {
        const { message, thread_id, channel_id, settings, is_dm } = req.body;

        if (!message || !settings) {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        let userMessage = message.trim();

        // Extract language and webhook settings
        const defaultLanguageSetting = settings.find((s: any) => s.label === "defaultLanguage");
        const webhookSetting = settings.find((s: any) => s.label === "WebhookUrl");

        const targetLanguageFull = defaultLanguageSetting?.default || "English";
        const targetLanguage = languageMap[targetLanguageFull];

        if (!targetLanguage) {
            return res.status(400).json({ error: `Unsupported language: ${targetLanguageFull}` });
        }

        // Translate the original message before further processing
        const translatedText: any = await translate(userMessage, { to: targetLanguage, forceTo: true });

        // If the bot is NOT mentioned and isDM is false, return only the translated message
        if (!isBotMentioned(userMessage) && !is_dm) {
            return res.status(200).json({
                originalText: userMessage,
                message: translatedText?.text,
                language: targetLanguageFull,
            });
        }

        // Extract actual message if the bot was mentioned
        if(!is_dm){
            userMessage = extractMessageContent(userMessage);
        }

        // Fetch AI-generated response
        const botResponse = await getAIResponse(userMessage);

        // Translate AI response
        const translatedBotResponse: any = await translate(botResponse, { to: targetLanguage, forceTo: true });

        // Send translated response to webhook if available
        const webhookUrl = webhookSetting?.default;
        if (webhookUrl) {
            await sendWebhookNotification(webhookUrl, translatedBotResponse?.text, targetLanguageFull);
        }

        const payload = {
            message: botResponse,
            reply: false,
            username: "lexa",
            thread_id: thread_id,
        };

        await axios.post(`https://ping.staging.telex.im/v1/return/${channel_id}`, payload);

        return res.status(200).json({
            message: translatedText?.text,
            originalText: userMessage,
            translatedMessage: translatedBotResponse?.text,
            language: targetLanguageFull,
        });

    } catch (error: any) {
        console.error("Error processing bot request:", error.message);
        return res.status(500).json({ error: "Bot processing failed" });
    }
}

