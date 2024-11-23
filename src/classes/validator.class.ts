import { Results } from "@mediapipe/pose";
import Point3d from "./point3d.class";
import CoordinatesSystem from "./coordinates-system.class";
import Utils from "./utils.class";
import { Constructor, Exercise } from "../types";

export const landmarksDict = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
};

export type ExerciseValidation = {
  error: string;
  points: Point3d[];
  angles: number[];
};

abstract class Validator {
  public abstract validate(results: Results): ExerciseValidation;
}
type validatorChild = Constructor<Validator>;

class PlankValidator extends Validator {
  public validate(results: Results): ExerciseValidation {
    const landmarks = results.poseWorldLandmarks;
    const noseOriginalPoint = new Point3d(landmarks[landmarksDict.NOSE]);
    const leftHipOriginalPoint = new Point3d(landmarks[landmarksDict.LEFT_HIP]);
    const rightHipOriginalPoint = new Point3d(
      landmarks[landmarksDict.RIGHT_HIP]
    );
    const coordinatesSystem = new CoordinatesSystem(
      leftHipOriginalPoint,
      rightHipOriginalPoint,
      noseOriginalPoint
    );

    const shoulderMidPoint = Utils.getMidShoulderPoint(
      landmarks,
      coordinatesSystem
    );
    const hipMidPoint = Utils.getMidHipPoint(landmarks, coordinatesSystem);
    const kneeMidPoint = Utils.getMidKneePoint(landmarks, coordinatesSystem);
    const heelMidPoint = Utils.getMidHeelPoint(landmarks, coordinatesSystem);
    const elbowMidPoint = Utils.getMidElbowPoint(landmarks, coordinatesSystem);

    const shoulderHipMidAngle = shoulderMidPoint.getAngle(hipMidPoint);
    const shoulderKneeMidAngle = shoulderMidPoint.getAngle(kneeMidPoint);
    const shoulderHeelMidAngle = shoulderMidPoint.getAngle(heelMidPoint);
    const shoulderElbowMidAngle = shoulderMidPoint.getAngle(elbowMidPoint);

    const response: ExerciseValidation = {
      error: "",
      points: [
        shoulderMidPoint,
        hipMidPoint,
        kneeMidPoint,
        heelMidPoint,
        elbowMidPoint,
      ],
      angles: [
        shoulderHipMidAngle,
        shoulderKneeMidAngle,
        shoulderHeelMidAngle,
        shoulderElbowMidAngle,
      ],
    };

    if (Math.abs(shoulderHipMidAngle) > 10) {
      response.error = "Ângulo entre ombros e quadril muito alto";
    } else if (Math.abs(shoulderKneeMidAngle) > 20) {
      response.error = "Ângulo entre ombros e joelhos muito alto";
    } else if (shoulderHipMidAngle > shoulderKneeMidAngle) {
      response.error = "Eleve o quadril";
    } else if (Math.abs(shoulderHeelMidAngle) > 20) {
      response.error = "Ângulo entre ombros e calcanhares muito alto";
    } else if (shoulderKneeMidAngle - shoulderHeelMidAngle > 5) {
      response.error = "Eleve os joelhos";
    } else if (Math.abs(90 - Math.abs(shoulderElbowMidAngle)) > 15) {
      response.error = "Cotovelos não estão alinhados com os ombros";
    }

    return response;
  }
}

export class SidePlankValidator extends Validator {
  public validate(results: Results): ExerciseValidation {
    // TODO...
    const response: ExerciseValidation = {
      error: "",
      points: [],
      angles: [],
    };

    return response;
  }
}

export class ValidatorFactory {
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
