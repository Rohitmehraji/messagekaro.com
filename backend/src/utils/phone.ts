export const toE164 = (input: string) => {
  const value = input.trim().replace(/[\s()-]/g, '');
  return /^\+[1-9]\d{7,14}$/.test(value) ? value : null;
};
