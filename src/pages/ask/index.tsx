"use client";

import { backendStacks } from "@/constants/backend-stacks";
import { frontendStacks } from "@/constants/frontend-stacks";
import { mobileStacks } from "@/constants/mobile-stacks";
import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import Select from "react-select";

// Home Component
const Home = () => {
    const [isListening, setIsListening] = useState(false);
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [role, setRole] = useState("Frontend");
    const [level, setLevel] = useState("Junior");
    const [fullName, setFullName] = useState("");
    const [experience, setExperience] = useState("1");
    const [stack, setStack] = useState<string[]>([]);
    const recognitionRef = useRef<any>(null);
    const [availableStacks, setAvailableStacks] = useState<any[]>([]);
    const [selectedStacks, setSelectedStacks] = useState<any[]>([]);
    const [companyName, setCompanyName] = useState("");
    const [jobDescription, setJobDescription] = useState("");

    // set initial data from local storage
    useEffect(() => {
        const res = JSON.parse(localStorage.getItem("data") || "{}");

        setRole(res.role || "Frontend");
        setLevel(res.level || "Junior");
        setFullName(res.fullName || "");
        setExperience(res.experience || "1");
        setCompanyName(res.companyName || "");
        setJobDescription(res.jobDescription || "");

        const storedStacks = res.stack || [];
        // Set raw stack values for backend usage
        setStack(storedStacks);

        const stacksToSet = storedStacks.map((stack: string) => ({ value: stack, label: stack }));
        setSelectedStacks(stacksToSet);
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition =
                (window as any).SpeechRecognition ||
                (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.lang = "en-US";
                recognition.interimResults = true;
                recognition.continuous = true;

                recognition.onresult = (event: any) => {
                    let finalTranscript = "";
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        const result = event.results[i];
                        if (result.isFinal) {
                            finalTranscript += result[0].transcript;
                        }
                    }
                    if (finalTranscript) {
                        setQuestion((prev) => prev + " " + finalTranscript);
                    }
                };
                recognitionRef.current = recognition;
            } else {
                alert("Speech Recognition not supported in this browser");
            }
        }
    }, []);

    const startListening = () => {
        setQuestion("")
        if (recognitionRef.current) {
            recognitionRef.current.start();
            setIsListening(true);
        }

        // save the information in the local storage
        const data = {
            fullName,
            role,
            level,
            experience,
            stack,
            companyName,
            jobDescription,
        }
        localStorage.setItem("data", JSON.stringify(data))
    };

    const stopListening = async () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
            fetchAnswer(question);
        }
    };

    const fetchAnswer = async (question: string) => {
        setAnswer("🤔 Thinking...");
        try {
            const res = await fetch("/api/ask-stream", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question,
                    fullName,
                    role,
                    level,
                    experience,
                    stack,
                    companyName,
                    jobDescription,
                }),
            });

            if (!res.body) throw new Error("No response body");

            const reader = res.body.getReader();
            const decoder = new TextDecoder("utf-8");

            let chunk = "";
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                const text = decoder.decode(value);
                chunk += text;
                setAnswer((prev) => (prev === "🤔 Thinking..." ? text : prev + text));
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Update available stacks based on the selected role
    useEffect(() => {
        let newAvailableStacks: any[] = [];
        if (role === "Full Stack") {
            newAvailableStacks = [
                ...frontendStacks.map((stack) => ({ value: stack, label: stack })),
                ...backendStacks.map((stack) => ({ value: stack, label: stack })),
            ];
        } else if (role === "Mobile") {
            newAvailableStacks = mobileStacks.map((stack) => ({ value: stack, label: stack }));
        } else if (role === "Frontend") {
            newAvailableStacks = frontendStacks.map((stack) => ({ value: stack, label: stack }));
        } else if (role === "Backend") {
            newAvailableStacks = backendStacks.map((stack) => ({ value: stack, label: stack }));
        }
        setAvailableStacks(newAvailableStacks);
    }, [role]);

    // Handle stack selection change (multi-select dropdown)
    const handleStackChange = (selectedOptions: any) => {
        setSelectedStacks(selectedOptions || []);
        setStack(selectedOptions ? selectedOptions.map((option: any) => option.value) : []);
    };

    const formatAnswer = (text: string) => {
        return text
            .replace(/\. /g, '.\n\n')
            .trim()
    };


    return (
        <div className="bg-white">
            <div className="container-fluid mx-auto p-6 text-black">
                <h1 className="text-2xl font-bold mb-6 text-center text-black">
                    🎙 Interview Assistant
                </h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* LEFT SIDE: Inputs and Buttons */}
                    <div className="lg:w-1/2 w-full">
                        {/* System Prompt Setup */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Full Name</label>
                                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" className="w-full border rounded p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Company Name</label>
                                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Enter company name" className="w-full border rounded p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Role</label>
                                <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border rounded p-2">
                                    <option>Frontend</option>
                                    <option>Backend</option>
                                    <option>Full Stack</option>
                                    <option>Mobile</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Level</label>
                                <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full border rounded p-2">
                                    <option>Junior</option>
                                    <option>Mid</option>
                                    <option>Senior</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Experience (years)</label>
                                <select value={experience} onChange={(e) => setExperience(e.target.value)} className="w-full border rounded p-2">
                                    {[...Array(7)].map((_, i) => <option key={i}>{i + 1}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2">Stacks</label>
                                <Select isMulti options={availableStacks} value={selectedStacks} onChange={handleStackChange} className="w-full border rounded p-2" placeholder="Select stacks..." />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Job Description / Key Requirements</label>
                                <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste job description or key points" className="w-full border rounded p-2" rows={4} />
                            </div>
                        </div>

                        {/* Listening Buttons */}
                        <div className="flex justify-center gap-4">
                            <button onClick={isListening ? stopListening : startListening} className={`px-6 py-2 rounded font-semibold ${isListening ? "bg-red-500" : "bg-blue-500"} text-white`}>
                                {isListening ? "Stop Listening" : "Start Listening"}
                            </button>
                            <button onClick={() => setQuestion("")} className="px-6 py-2 rounded bg-gray-500 text-white font-semibold">
                                Clear
                            </button>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Question & Answer */}
                    <div className="lg:w-1/2 w-full">
                        {/* Detected Question */}
                        <div className="bg-gray-100 p-4 rounded mb-6">
                            <h2 className="text-lg font-semibold mb-2">🎤 Question Detected:</h2>
                            <p className="text-gray-700 mb-2">{question || "Waiting for speech..."}</p>
                            {question && (
                                <button className="bg-blue-500 p-2 rounded text-white text-xs" onClick={() => fetchAnswer(question)}>
                                    Send
                                </button>
                            )}
                        </div>

                        {/* Generated Answer */}
                        <div className="bg-gray-100 p-4 rounded">
                            <h2 className="text-lg font-semibold mb-2">✍️ Generated Answer:</h2>
                            <div className="prose max-w-none space-y-4">
                                {answer ? (
                                    <ReactMarkdown>{formatAnswer(answer)}</ReactMarkdown>
                                ) : (
                                    <p className="text-gray-500">Answer will appear here...</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Home;