export function isBotMentioned(message: string): boolean {
    return /@layobrights/i.test(message);
}


export function extractMessageContent(message: string): string {
    return message.replace(/@layobrights/gi, "").trim(); 
}