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

    const leftShoulderPoint = new Point3d(
      landmarks[landmarksDict.LEFT_SHOULDER],
      coordinatesSystem
    );
    const rightShoulderPoint = new Point3d(
      landmarks[landmarksDict.RIGHT_SHOULDER],
      coordinatesSystem
    );
    const shoulderMidPoint = leftShoulderPoint.getMidPoint(rightShoulderPoint);
    const leftHipPoint = new Point3d(
      landmarks[landmarksDict.LEFT_HIP],
      coordinatesSystem
    );
    const rightHipPoint = new Point3d(
      landmarks[landmarksDict.RIGHT_HIP],
      coordinatesSystem
    );
    const hipMidPoint = leftHipPoint.getMidPoint(rightHipPoint);
    const leftKneePoint = new Point3d(
      landmarks[landmarksDict.LEFT_KNEE],
      coordinatesSystem
    );
    const rightKneePoint = new Point3d(
      landmarks[landmarksDict.RIGHT_KNEE],
      coordinatesSystem
    );
    const kneeMidPoint = leftKneePoint.getMidPoint(rightKneePoint);
    const leftHeelPoint = new Point3d(
      landmarks[landmarksDict.LEFT_HEEL],
      coordinatesSystem
    );
    const rightHeelPoint = new Point3d(
      landmarks[landmarksDict.RIGHT_HEEL],
      coordinatesSystem
    );
    const heelMidPoint = leftHeelPoint.getMidPoint(rightHeelPoint);
    const leftElbowPoint = new Point3d(
      landmarks[landmarksDict.LEFT_ELBOW],
      coordinatesSystem
    );
    const rightElbowPoint = new Point3d(
      landmarks[landmarksDict.RIGHT_ELBOW],
      coordinatesSystem
    );
    const elbowMidPoint = leftElbowPoint.getMidPoint(rightElbowPoint);

    const leftRightShoulderDiff =
      leftShoulderPoint.subtract(rightShoulderPoint);
    const leftRightHipDiff = leftHipPoint.subtract(rightHipPoint);
    const leftRightKneeDiff = leftKneePoint.subtract(rightKneePoint);
    const leftRightHeelDiff = leftHeelPoint.subtract(rightHeelPoint);
    const leftRightElbowDiff = leftElbowPoint.subtract(rightElbowPoint);

    const shoulderHipMidAngle = shoulderMidPoint.getAngle(hipMidPoint);
    const shoulderKneeMidAngle = shoulderMidPoint.getAngle(kneeMidPoint);
    const shoulderHeelMidAngle = shoulderMidPoint.getAngle(heelMidPoint);
    const shoulderElbowMidAngle = shoulderMidPoint.getAngle(elbowMidPoint);

    const response: ExerciseValidation = {
      error: "",
      points: [
        leftRightShoulderDiff,
        leftRightHipDiff,
        leftRightKneeDiff,
        leftRightHeelDiff,
        leftRightElbowDiff,
      ],
      angles: [
        shoulderHipMidAngle,
        shoulderKneeMidAngle,
        shoulderHeelMidAngle,
        shoulderElbowMidAngle,
      ],
    };

    const maxDiff = 0.11;
    if (
      Math.abs(leftRightShoulderDiff.x) > maxDiff ||
      Math.abs(leftRightShoulderDiff.y) > maxDiff
    ) {
      response.error = "Alinhe os ombros";
    } else if (
      Math.abs(leftRightHipDiff.x) > maxDiff ||
      Math.abs(leftRightHipDiff.y) > maxDiff
    ) {
      response.error = "Alinhe os quadril";
    } else if (
      Math.abs(leftRightKneeDiff.x) > maxDiff ||
      Math.abs(leftRightKneeDiff.y) > maxDiff
    ) {
      response.error = "Alinhe os joelhos";
    } else if (
      Math.abs(leftRightHeelDiff.x) > maxDiff ||
      Math.abs(leftRightHeelDiff.y) > maxDiff
    ) {
      response.error = "Alinhe os calcanhares";
    } else if (
      Math.abs(leftRightElbowDiff.x) > maxDiff ||
      Math.abs(leftRightElbowDiff.y) > maxDiff
    ) {
      response.error = "Alinhe os cotovelos";
    } else if (Math.abs(shoulderHipMidAngle) > 5) {
      response.error = "Alinhe os ombros e quadril";
    } else if (shoulderKneeMidAngle < 0 || shoulderKneeMidAngle > 10) {
      response.error = "Alinhe os ombros e joelhos";
    } else if (shoulderKneeMidAngle + 2 < shoulderHipMidAngle) {
      response.error = "Eleve o quadril";
    } else if (shoulderHeelMidAngle < 0 || shoulderHeelMidAngle > 10) {
      response.error = "Alinhe os ombros e calcanhares";
    } else if (shoulderHeelMidAngle + 1 < shoulderKneeMidAngle) {
      response.error = "Eleve os joelhos";
    } else if (Math.abs(90 - Math.abs(shoulderElbowMidAngle)) > 20) {
      response.error = "Alinhe os ombros e cotovelos";
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

    if (shouldersHipMidAngle > 5) {
      response.error = "Alinhe os ombros com o quadril";
    } else if (shouldersKnessMidAngle > 5) {
      response.error = "Alinhe os ombros com os joelhos";
    } else if (Math.abs(shouldersHipMidAngle - shouldersKnessMidAngle) > 3) {
      response.error = "Alinhe os joelhos com o quadril";
    } else if (shouldersHeelsMidAngle > 5) {
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
