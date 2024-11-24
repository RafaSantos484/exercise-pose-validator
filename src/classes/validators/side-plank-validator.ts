import { LandmarkList, Results } from "@mediapipe/pose";
import Point3d from "../point3d.class";
import CoordinatesSystem from "../coordinates-system.class";
import Utils from "../utils.class";
import { landmarksDict } from "../../types";
import { ExerciseValidation, Validator } from "./validator.class";

export default class SidePlankValidator extends Validator {
  private static getShoulderElbowDiffAngles(
    results: Results
  ): [number, number] {
    const landmarks = results.poseLandmarks;
    const { width, height } = results.image;

    const shouldersMidPoint = Utils.getShouldersMidPoint(landmarks);
    shouldersMidPoint.x *= width;
    shouldersMidPoint.y *= height;

    const leftElbowPoint = new Point3d(landmarks[landmarksDict.LEFT_ELBOW]);
    leftElbowPoint.x *= width;
    leftElbowPoint.y *= height;
    const leftHeelPoint = new Point3d(landmarks[landmarksDict.LEFT_HEEL]);
    leftHeelPoint.x *= width;
    leftHeelPoint.y *= height;

    const rightElbowPoint = new Point3d(landmarks[landmarksDict.RIGHT_ELBOW]);
    rightElbowPoint.x *= width;
    rightElbowPoint.y *= height;
    const rightHeelPoint = new Point3d(landmarks[landmarksDict.RIGHT_HEEL]);
    rightHeelPoint.x *= width;
    rightHeelPoint.y *= height;

    const leftCathet1 = shouldersMidPoint.getXYDistance(leftElbowPoint);
    const leftCathet2 = leftElbowPoint.getXYDistance(leftHeelPoint);
    const leftHypotenuse = shouldersMidPoint.getXYDistance(leftHeelPoint);
    const leftCosine =
      (leftCathet1 ** 2 + leftCathet2 ** 2 - leftHypotenuse ** 2) /
      (2 * leftCathet1 * leftCathet2);
    const leftAngle = Utils.arccosine(leftCosine, { abs: true });
    const leftDiff = Math.abs(90 - leftAngle);

    const rightCathet1 = shouldersMidPoint.getXYDistance(rightElbowPoint);
    const rightCathet2 = rightElbowPoint.getXYDistance(rightHeelPoint);
    const rightHypotenuse = shouldersMidPoint.getXYDistance(rightHeelPoint);
    const rightCosine =
      (rightCathet1 ** 2 + rightCathet2 ** 2 - rightHypotenuse ** 2) /
      (2 * rightCathet1 * rightCathet2);
    const rightAngle = Utils.arccosine(rightCosine, {
      abs: true,
    });
    const rightDiff = Math.abs(90 - rightAngle);

    return [leftDiff, rightDiff];
  }
  public static IsLeftShoulderOnGround(results: Results) {
    const [leftDiff, rightDiff] =
      SidePlankValidator.getShoulderElbowDiffAngles(results);
    return leftDiff < rightDiff;
  }

  private getCoordinatesSystem(
    landmarks: LandmarkList,
    isLeftShoulderOnGround: boolean
  ) {
    let x1: Point3d;
    let x2: Point3d;
    let y1: Point3d;
    if (isLeftShoulderOnGround) {
      x1 = new Point3d(landmarks[landmarksDict.LEFT_ELBOW]);
      x2 = new Point3d(landmarks[landmarksDict.LEFT_HEEL]);
      y1 = new Point3d(landmarks[landmarksDict.LEFT_SHOULDER]);
    } else {
      x1 = new Point3d(landmarks[landmarksDict.RIGHT_ELBOW]);
      x2 = new Point3d(landmarks[landmarksDict.RIGHT_HEEL]);
      y1 = new Point3d(landmarks[landmarksDict.RIGHT_SHOULDER]);
    }

    const xAxisVector = x2.subtract(x1);
    const yAxisVector = x1.subtract(y1);
    const hipOriginalMidPoint = Utils.getHipMidPoint(landmarks);
    return new CoordinatesSystem(
      [xAxisVector, "x"],
      [yAxisVector, "y"],
      hipOriginalMidPoint
    );
  }

  public validate(results: Results): ExerciseValidation {
    const landmarks = results.poseWorldLandmarks;
    let isLeftShoulderOnGround =
      SidePlankValidator.IsLeftShoulderOnGround(results);
    let coordinatesSystem = this.getCoordinatesSystem(
      landmarks,
      isLeftShoulderOnGround
    );

    const shoulderPoint = new Point3d(
      landmarks[
        isLeftShoulderOnGround
          ? landmarksDict.LEFT_SHOULDER
          : landmarksDict.RIGHT_SHOULDER
      ],
      coordinatesSystem
    );
    const elbowPoint = new Point3d(
      landmarks[
        isLeftShoulderOnGround
          ? landmarksDict.LEFT_ELBOW
          : landmarksDict.RIGHT_ELBOW
      ],
      coordinatesSystem
    );
    const shouldersMidPoint = Utils.getShouldersMidPoint(
      landmarks,
      coordinatesSystem
    );
    const hipMidPoint = Utils.getHipMidPoint(landmarks, coordinatesSystem);
    const kneesMidPoint = Utils.getKneesMidPoint(landmarks, coordinatesSystem);
    const heelsMidPoint = Utils.getHeelsMidPoint(landmarks, coordinatesSystem);

    const shouldersHipMidAngle = shouldersMidPoint.getAngle(hipMidPoint);
    const shouldersKnessMidAngle = shouldersMidPoint.getAngle(kneesMidPoint);
    const shouldersHeelsMidAngle = shouldersMidPoint.getAngle(heelsMidPoint);
    const shoulderElbowAngle = shoulderPoint.getAngle(elbowPoint, true);

    const response: ExerciseValidation = {
      error: "",
      points: [shouldersMidPoint, hipMidPoint, kneesMidPoint, heelsMidPoint],
      angles: [
        shouldersHipMidAngle,
        shouldersKnessMidAngle,
        shouldersHeelsMidAngle,
        shoulderElbowAngle,
      ],
    };

    const [minAngle, maxAngle] = [10, 30];
    if (Math.abs(90 - shoulderElbowAngle) > 20) {
      response.error = "Alinhe os ombro com o cotovelo apoiado ao chão";
    } else if (
      shouldersHipMidAngle < minAngle ||
      shouldersHipMidAngle > maxAngle
    ) {
      response.error = "Alinhe os ombros com o quadril";
    } else if (
      shouldersKnessMidAngle < minAngle ||
      shouldersKnessMidAngle > maxAngle
    ) {
      response.error = "Alinhe os ombros com os joelhos";
    } else if (shouldersKnessMidAngle + 2 < shouldersHipMidAngle) {
      response.error = "Abaixe os joelhos";
    } else if (shouldersKnessMidAngle - shouldersHipMidAngle > 5) {
      response.error = "Alinhe os joelhos com o quadril";
    } else if (
      shouldersHeelsMidAngle < minAngle ||
      shouldersHeelsMidAngle > maxAngle
    ) {
      response.error = "Alinhe os ombros com os calcanhares";
    } else if (Math.abs(shouldersHipMidAngle - shouldersHeelsMidAngle) > 5) {
      response.error = "Alinhe o quadril com os calcanhares";
    }

    return response;
  }
}
