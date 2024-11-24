import { Results } from "@mediapipe/pose";
import Point3d from "../point3d.class";
import { Constructor, Exercise } from "../../types";
import PlankValidator from "./plank-validator.class";
import SidePlankValidator from "./side-plank-validator";

export type ExerciseValidation = {
  error: string;
  points: Point3d[];
  angles: number[];
};

export abstract class Validator {
  public abstract validate(results: Results): ExerciseValidation;
}
type validatorChild = Constructor<Validator>;

export default class ValidatorFactory {
  private static validatorsDict: Record<Exercise, validatorChild> = {
    plank: PlankValidator,
    side_plank: SidePlankValidator,
  };
  private static instance: ValidatorFactory | undefined = undefined;

  private validators: Record<string, Validator>;

  private constructor() {
    this.validators = {};
  }

  public static getInstance() {
    if (!ValidatorFactory.instance) {
      ValidatorFactory.instance = new ValidatorFactory();
    }
    return ValidatorFactory.instance;
  }

  public getValidator(exercise: Exercise) {
    if (!this.validators[exercise]) {
      this.validators[exercise] = new ValidatorFactory.validatorsDict[
        exercise
      ]();
    }
    return this.validators[exercise];
  }
}
