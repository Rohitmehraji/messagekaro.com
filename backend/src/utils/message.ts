export const getWordCount = (message: string) => message.trim().split(/\s+/).filter(Boolean).length;

export const validateMessageWordLimit = (message: string, maxWords = 20) => {
  const wordCount = getWordCount(message);
  return {
    valid: wordCount <= maxWords,
    wordCount,
    maxWords
  };
};
