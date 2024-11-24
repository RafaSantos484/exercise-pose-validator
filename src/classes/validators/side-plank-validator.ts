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

    let shoulderElbowAngle: number;
    if (isLeftShoulderOnGround) {
      shoulderElbowAngle = leftShoulderPoint.getAngle(leftElbowPoint, true);
    } else {
      shoulderElbowAngle = rightShoulderPoint.getAngle(rightElbowPoint, true);
    }

    const leftRightHipDiff = leftHipPoint.subtract(rightHipPoint);
    const leftRightKneeDiff = leftKneePoint.subtract(rightKneePoint);
    const leftRightHeelDiff = leftHeelPoint.subtract(rightHeelPoint);

    const shoulderHipMidAngle = shoulderMidPoint.getAngle(hipMidPoint);
    const shoulderKneeMidAngle = shoulderMidPoint.getAngle(kneeMidPoint);
    const shoulderHeelMidAngle = shoulderMidPoint.getAngle(heelMidPoint);
    const shoulderElbowMidAngle = shoulderMidPoint.getAngle(elbowMidPoint);

    const response: ExerciseValidation = {
      error: "",
      points: [leftRightHipDiff, leftRightKneeDiff, leftRightHeelDiff],
      angles: [
        shoulderHipMidAngle,
        shoulderKneeMidAngle,
        shoulderHeelMidAngle,
        shoulderElbowMidAngle,
      ],
    };

    const maxXDiff = 0.1;
    const maxYDiff = 0.2;
    const [minAngle, maxAngle] = [10, 30];
    if (
      Math.abs(leftRightHipDiff.x) > maxXDiff ||
      Math.abs(leftRightHipDiff.y) > maxYDiff
    ) {
      response.error = "Alinhe os quadril";
    } else if (
      Math.abs(leftRightKneeDiff.x) > maxXDiff ||
      Math.abs(leftRightKneeDiff.y) > maxYDiff
    ) {
      response.error = "Alinhe os joelhos";
    } else if (
      Math.abs(leftRightHeelDiff.x) > maxXDiff ||
      Math.abs(leftRightHeelDiff.y) > maxYDiff
    ) {
      response.error = "Alinhe os calcanhares";
    } else if (Math.abs(90 - shoulderElbowAngle) > 20) {
      response.error = "Alinhe os ombro com o cotovelo apoiado ao chão";
    } else if (
      shoulderHipMidAngle < minAngle ||
      shoulderHipMidAngle > maxAngle
    ) {
      response.error = "Alinhe os ombros com o quadril";
    } else if (
      shoulderKneeMidAngle < minAngle ||
      shoulderKneeMidAngle > maxAngle
    ) {
      response.error = "Alinhe os ombros com os joelhos";
    } else if (shoulderKneeMidAngle + 2 < shoulderHipMidAngle) {
      response.error = "Abaixe os joelhos";
    } else if (shoulderKneeMidAngle - shoulderHipMidAngle > 5) {
      response.error = "Alinhe os joelhos com o quadril";
    } else if (
      shoulderHeelMidAngle < minAngle ||
      shoulderHeelMidAngle > maxAngle
    ) {
      response.error = "Alinhe os ombros com os calcanhares";
    } else if (Math.abs(shoulderHipMidAngle - shoulderHeelMidAngle) > 5) {
      response.error = "Alinhe o quadril com os calcanhares";
    }

    return response;
  }
}
