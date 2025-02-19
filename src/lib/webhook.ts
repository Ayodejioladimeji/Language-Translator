import axios from "axios";

export const sendWebhookNotification = async (webhookUrl: string, message: string, language:string) => {
    try {
        if (!webhookUrl || !/^https?:\/\//.test(webhookUrl)) {
            throw new Error("Invalid webhook URL");
        }

        const payload = {
            username: "Language Translator",
            event_name: `Language - ${language}`,
            message,
            status: "success",
        };

        console.log("Sending payload:", payload, "to", webhookUrl);

        const res = await axios.post(webhookUrl, payload, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });

        console.log("Webhook response:", res?.data);
    } catch (error:any) {
        console.error(
            "Error sending webhook notification:",
            error?.response?.data || error.message
        );
    }
};