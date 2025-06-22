export function isBotMentioned(message: string): boolean {
    return /@lexa/i.test(message);
}


export function extractMessageContent(message: string): string {
    return message.replace(/@lexa/gi, "").trim(); 
}