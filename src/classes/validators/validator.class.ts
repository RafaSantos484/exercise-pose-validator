import { Results } from "@mediapipe/pose";
import Point3d from "../point3d.class";

export type ExerciseValidation = {
  error: string;
  points: Point3d[];
  angles: number[];
};
export abstract class Validator {
  public abstract validate(results: Results): ExerciseValidation;
}
