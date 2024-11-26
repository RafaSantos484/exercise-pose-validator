import { Results } from "@mediapipe/pose";
import { ExerciseValidation, Validator } from "./validator.class";

export default class PushUpValidator extends Validator {
  public validate(results: Results): ExerciseValidation {
    const response: ExerciseValidation = {
      error: "",
      points: [],
      angles: [],
    };

    return response;
  }
}
