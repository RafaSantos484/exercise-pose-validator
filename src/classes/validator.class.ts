import { Results } from "@mediapipe/pose";
import Point3d from "./point3d.class";
import CoordinatesSystem from "./coordinates-system.class";
import Utils from "./utils.class";
import { Constructor, Exercise, landmarksDict } from "../types";

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
    const originalLeftHipPoint = new Point3d(landmarks[landmarksDict.LEFT_HIP]);
    const originalRightHipPoint = new Point3d(
      landmarks[landmarksDict.RIGHT_HIP]
    );
    const originalHipMidPoint = originalLeftHipPoint.getMidPoint(
      originalRightHipPoint
    );
    const originalFootIndexMidPoint = Utils.getFootIndexesMidPoint(landmarks);
    const originalElbowsMidPoint = Utils.getElbowsMidPoint(landmarks);

    const zAxisVector = originalRightHipPoint.subtract(originalLeftHipPoint);
    const xAxisVector = originalFootIndexMidPoint.subtract(
      originalElbowsMidPoint
    );
    const coordinatesSystem = new CoordinatesSystem(
      [zAxisVector, "z"],
      [xAxisVector, "x"],
      originalHipMidPoint
    );

    const shoulderMidPoint = Utils.getShouldersMidPoint(
      landmarks,
      coordinatesSystem
    );
    const hipMidPoint = Utils.getHipMidPoint(landmarks, coordinatesSystem);
    const kneeMidPoint = Utils.getKneesMidPoint(landmarks, coordinatesSystem);
    const heelMidPoint = Utils.getHeelsMidPoint(landmarks, coordinatesSystem);
    const elbowMidPoint = Utils.getElbowsMidPoint(landmarks, coordinatesSystem);

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
    const landmarks = results.poseWorldLandmarks;

    const leftHipOriginalPoint = new Point3d(landmarks[landmarksDict.LEFT_HIP]);
    const rightHipOriginalPoint = new Point3d(
      landmarks[landmarksDict.RIGHT_HIP]
    );
    const hipOriginalMidPoint = leftHipOriginalPoint.getMidPoint(
      rightHipOriginalPoint
    );
    const shoulderOriginalMidPoint = Utils.getShouldersMidPoint(landmarks);

    let xAxisVector = hipOriginalMidPoint.subtract(shoulderOriginalMidPoint);
    let yAxisVector = rightHipOriginalPoint.subtract(leftHipOriginalPoint);
    let coordinatesSystem = new CoordinatesSystem(
      [xAxisVector, "x"],
      [yAxisVector, "y"],
      hipOriginalMidPoint
    );

    const shouldersMidPoint = Utils.getShouldersMidPoint(
      landmarks,
      coordinatesSystem
    );
    const hipMidPoint = Utils.getHipMidPoint(landmarks, coordinatesSystem);
    const kneesMidPoint = Utils.getKneesMidPoint(landmarks, coordinatesSystem);
    const heelsMidPoint = Utils.getHeelsMidPoint(landmarks, coordinatesSystem);

    const shouldersHipMidAngle = shouldersMidPoint.getAngle(hipMidPoint, true);
    const shouldersKnessMidAngle = shouldersMidPoint.getAngle(
      kneesMidPoint,
      true
    );
    const shouldersHeelsMidAngle = shouldersMidPoint.getAngle(
      heelsMidPoint,
      true
    );

    const response: ExerciseValidation = {
      error: "",
      points: [shouldersMidPoint, hipMidPoint, kneesMidPoint, heelsMidPoint],
      angles: [
        shouldersHipMidAngle,
        shouldersKnessMidAngle,
        shouldersHeelsMidAngle,
      ],
    };

    if (shouldersHipMidAngle > 10) {
      response.error = "Alinhe os ombros com o quadril";
    } else if (shouldersKnessMidAngle > 10) {
      response.error = "Alinhe os ombros com os joelhos";
    } else if (Math.abs(shouldersHipMidAngle - shouldersKnessMidAngle) > 3) {
      response.error = "Alinhe os joelhos com o quadril";
    } else if (shouldersHeelsMidAngle > 10) {
      response.error = "Alinhe os ombros com os calcanhares";
    } else if (Math.abs(shouldersKnessMidAngle - shouldersHeelsMidAngle) > 3) {
      response.error = "Alinhe os calcanhares com os joelhos";
    }

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
