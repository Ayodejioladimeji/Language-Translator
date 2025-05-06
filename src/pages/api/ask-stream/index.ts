import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY!);

export const config = {
    runtime: "edge",
};

export default async function handler(req: Request) {
    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    const body = await req.json();
    const { question, fullName, role, level, experience, stack, companyName, jobDescription } = body;

    if (!question) {
        return new Response(JSON.stringify({ error: "No question provided" }), { status: 400 });
    }

    try {

        const systemPrompt = `
            I am currently undergoing a technical interview.
            I am a ${level} ${role} developer named ${fullName}, with ${experience} years of experience.
            My main technologies include ${stack.join(", ")}.
            I am applying for a ${role} position at ${companyName}.
            Here is a brief overview of the job description and skills required: ${jobDescription}.


            Important:
            - I have worked with WebSockets, Firebase, and other technologies as listed on my resume.
            - When answering questions, assume I have practical, real-world experience with these tools.
            - Provide responses based on my previous project experiences, not generic definitions.
            - Answer in a professional, detailed, human-friendly tone.
            - Do NOT give advice or tutorials, only respond based on my personal experience.
            + - **Ensure technical terms are spelled correctly and used accurately.

            Question:
            `;


        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContentStream({
            contents: [
                {
                    role: "user",
                    parts: [{ text: `${systemPrompt}\n\nQuestion: ${question}` }],
                },
            ],
        });

        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();

        (async () => {
            for await (const chunk of result.stream) {
                const textChunk = chunk.text();
                if (textChunk) {
                    const encoded = new TextEncoder().encode(textChunk);
                    await writer.write(encoded);
                }
            }
            await writer.close();
        })();

        return new Response(readable, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            },
        });

    } catch (error: any) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message || "Something went wrong" }), { status: 500 });
    }
}
