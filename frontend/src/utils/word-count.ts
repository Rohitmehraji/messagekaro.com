export const getWordCount = (message: string) => message.trim().split(/\s+/).filter(Boolean).length;
