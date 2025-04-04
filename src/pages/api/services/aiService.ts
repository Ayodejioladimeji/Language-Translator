import axios from "axios";

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_API_KEY;

console.log(OPENAI_API_KEY)

export async function getAIResponse(message: string): Promise<string> {
    if (!OPENAI_API_KEY) {
        console.error("OpenAI API Key is missing.");
        return "AI service is unavailable.";
    }

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                // model: "gpt-4o-mini",
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: message }],
                max_tokens: 100,
                store:true
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                },
            }
        );

        return response.data.choices[0]?.message?.content || "I couldn't understand that.";
    } catch (error:any) {
        console.error("AI API Error:", error.response?.data || error.message);
        return "I'm having trouble responding right now.";
    }
}
