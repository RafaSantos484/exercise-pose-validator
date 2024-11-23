export type Exercise = "plank" | "side_plank";
export const exercisesTranslator: Record<Exercise, string> = {
  plank: "Prancha",
  side_plank: "Prancha Lateral",
};
export type Constructor<T> = new (...args: any[]) => T;
