// hooks/useAskStream.ts
import { useState } from "react";

export const useAskStream = () => {
    const [isStreaming, setIsStreaming] = useState(false);

    const askStream = async ({
        question,
        role,
        level,
        experience,
        stack,
        onDelta,
    }: {
        question: string;
        role: string;
        level: string;
        experience: number;
        stack: string;
        onDelta: (text: string) => void;
    }) => {
        setIsStreaming(true);
        try {
            const res = await fetch("/api/ask-stream", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question, role, level, experience, stack }),
            });

            if (!res.body) throw new Error("No response body");

            const reader = res.body.getReader();
            const decoder = new TextDecoder("utf-8");

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                onDelta(chunk);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsStreaming(false);
        }
    };

    return { askStream, isStreaming };
};
