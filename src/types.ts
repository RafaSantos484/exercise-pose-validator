export type Exercise = "plank";
export const exercisesTranslator: Record<Exercise, string> = {
  plank: "Prancha",
};
export type Constructor<T> = new (...args: any[]) => T;
