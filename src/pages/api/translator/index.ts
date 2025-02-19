import { NextApiRequest, NextApiResponse } from "next";
import { sendWebhookNotification } from "@/lib/webhook";
import translate from "google-translate-api-x";

/* eslint-disable */

//full country names to ISO codes
const languageMap: Record<string, string> = {
    "French": "fr",
    "Spanish": "es",
    "German": "de",
    "Chinese": "zh",
    "Arabic": "ar",
    "Italian": "it",
    "Russian": "ru",
    "Japanese": "ja",
    "Hindi": "hi",
    "Korean": "ko",
    "Portuguese": "pt",
    "Dutch": "nl",
    "Turkish": "tr",
    "Swedish": "sv",
    "Polish": "pl",
    "Norwegian": "no",
    "Finnish": "fi",
    "Greek": "el",
    "Hebrew": "he",
    "Thai": "th",
    "English": "en"
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { message, settings } = req.body;

        if (!message || !settings) {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        // Extract settings
        const defaultLanguageSetting = settings.find((s: any) => s.label === "defaultLanguage");
        const webhookSetting = settings.find((s: any) => s.label === "WebhookUrl");

        const targetLanguageFull = defaultLanguageSetting?.default || "English";
        const targetLanguage = languageMap[targetLanguageFull];

        if (!targetLanguage) {
            return res.status(400).json({ error: `Unsupported language: ${targetLanguageFull}` });
        }

        const webhookUrl = webhookSetting?.default;

        const translatedText:any = await translate(message, { to: targetLanguage, forceTo: true });


        // If a Webhook URL is provided, send the translated text
        if (webhookUrl) {
            sendWebhookNotification(webhookUrl, translatedText?.text, targetLanguageFull)
        }

        return res.status(200).json({ originalText: message, message: translatedText?.text, language:targetLanguageFull });
    } catch (error: any) {
        console.error("Translation error:", error.message);
        return res.status(500).json({ error: "Translation failed" });
    }
}
