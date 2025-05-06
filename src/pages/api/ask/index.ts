// /pages/api/ask/index.ts
import { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY || "");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { question, role, level, experience, stack } = req.body;

    if (!question || !role || !level || !experience || !stack) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const systemPrompt = `
            You are a highly experienced ${level} ${role} Developer specializing in ${stack}.
            You have ${experience} years of hands-on professional experience.

            Answer the following interview question very professionally, 
            giving practical examples when necessary, and tailoring the response to a ${stack} ${role}:
        `;

        const result = await model.generateContentStream({
            contents: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt + `\n\nQuestion: ${question}` }],
                },
            ],
        });

        // Pipe the stream directly to frontend
        res.writeHead(200, {
            "Content-Type": "text/plain",
            "Transfer-Encoding": "chunked",
        });

        for await (const chunk of result.stream) {
            res.write(chunk.text());
        }

        res.end();
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message || "Something went wrong" });
    }
}
