import { NextApiRequest, NextApiResponse } from "next";
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
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
});

/* eslint-disable */

// Middleware function to run CORS
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn:any) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "GET") {
        await runMiddleware(req, res, cors);

        if (process.env.NEXT_PUBLIC_BREAK_SITE === 'true') {
            throw new Error('Intentional downtime for testing');
        }

        return res.status(200).json(
            {
                data: {
                    date: {
                        created_at: "2025-02-19",
                        updated_at: "2025-02-19"
                    },
                    descriptions: {
                        app_description: "Translates text into a selected default language in real-time.",
                        app_logo: "https://res.cloudinary.com/devsource/image/upload/v1740004619/istockphoto-1281121906-612x612_p4dv6x.jpg",
                        app_name: "Language Translator",
                        app_url: "https://language-translators.vercel.app/api/translate",
                        background_color: "#ffffff"
                    },
                    is_active: false,
                    integration_type: "modifier",
                    key_features: [
                        "Translate any text to a selected default language.",
                        "Support for automatic language detection.",
                        "Webhook integration to send translated text.",
                        "Allows selection of 20 different languages."
                    ],
                    permissions: {
                        events: [
                            "Translate any text to a selected default language.",
                            "Support for automatic language detection.",
                            "Webhook integration to send translated text.",
                            "Allows selection of 20 different languages."
                        ]
                    },
                    author: "Layobright",
                    integration_category: "Communication & Collaboration",
                    website: "https://language-translators.vercel.app",
                    settings: [
                        {
                            label: "defaultLanguage",
                            type: "dropdown",
                            options: [
                                "English",
                                "French",
                                "Spanish",
                                "German",
                                "Chinese",
                                "Arabic",
                                "Italian",
                                "Russian",
                                "Japanese",
                                "Hindi",
                                "Korean",
                                "Portuguese",
                                "Dutch",
                                "Turkish",
                                "Swedish",
                                "Polish",
                                "Norwegian",
                                "Finnish",
                                "Greek",
                                "Hebrew",
                                "Thai"
                            ],
                            description: "Select the default language for translation.",
                            default: "English",
                            required: true
                        },
                        {
                            label: "WebhookUrl",
                            type: "text",
                            description: "Specify the webhook URL to receive translated text.",
                            default: "",
                            required: false
                        }
                    ],
                    target_url: "https://language-translators.vercel.app/api/translator",
                    bot:true,
                    bot_profile:{
                        name: "Lexa",
                        description:"I am a general-purpose AI agent created to answer any question you throw at me — across any domain, with clarity, precision, and professionalism.",
                        image:"https://res.cloudinary.com/devsource/image/upload/v1741533595/chatbot_fofyng.avif",
                        trigger_word:"@lexa",
                        commands: {
                            "/help": "Available commands: /help, /joke, /quote, /language [code]",
                            "/joke": "Tell a joke",
                            "/quote": "Give a motivational quote",
                            "/language": "Change bot language. Example: /language es"
                        }
                    }
                }
            }

        );
    } else {
        return res.status(405).json({ error: "Method not allowed" });
    }
}
