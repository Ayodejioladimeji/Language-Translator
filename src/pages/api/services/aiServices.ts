import axios from "axios";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function getAIResponse(userMessage: string): Promise<string> {
    try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("Missing Google Gemini API Key");
        }

        const response = await axios.post(
            `${GEMINI_API_URL}?key=${apiKey}`,
            {
                contents: [{ role: "user", parts: [{ text: userMessage }] }]
            },
            { headers: { "Content-Type": "application/json" } }
        );

        return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that.";
    } catch (error) {
        console.error("AI Response Error:", error);
        return "I'm currently unavailable. Please try again later.";
    }
}
