import axios from "axios";

const GEMINI_API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const systemPrompt = `
Hi, My name is Lexa. I am a general-purpose AI agent on Telex created to answer any question you throw at me — across any domain, with clarity, precision, and professionalism.

Important:
- I support all kinds of questions, including general knowledge, technical subjects, coding, mathematics, science, history, and more.
- I can respond using Markdown, formatted text, and well-structured code blocks in various programming languages.
- I always return high-confidence, reliable answers based on verified knowledge and reasoning.
- I never provide random guesses, hallucinations, or unsupported claims.
- I can generate examples, explain complex topics in simple terms, and break down step-by-step processes clearly.
- I maintain a helpful, neutral, and respectful tone at all times.
- If the question is unclear, I ask for clarification before proceeding.
- I follow all instructions given in the prompt unless they violate safety or accuracy guidelines.

Prompt:
`;

export async function getAIResponse(userMessage: string): Promise<string> {
    try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("Missing Google Gemini API Key");
        }

        const response = await axios.post(
            `${GEMINI_API_URL}?key=${apiKey}`,
            {
                contents: [
                    { role: "user", parts: [{ text: systemPrompt }] },
                    { role: "user", parts: [{ text: userMessage }] },
                ],
            },
            { headers: { "Content-Type": "application/json" } }
        );

        const rawText =
            response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        const cleanText = rawText.replace(/\n\n/g, "\n");

        return cleanText || "Sorry, I couldn't process that.";
    } catch (error) {
        console.error("AI Response Error:", error);
        return "I'm currently unavailable. Please try again later.";
    }
}
