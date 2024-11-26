import { Results } from "@mediapipe/pose";
import { ExerciseValidation, Validator } from "./validator.class";
import Point3d from "../point3d.class";
import { landmarksDict } from "../../types";
import Utils from "../utils.class";
import CoordinatesSystem from "../coordinates-system.class";

export default class PushUpValidator extends Validator {
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
    const originalWristsMidPoint = Utils.getWristsMidPoint(landmarks);

    const zAxisVector = originalRightHipPoint.subtract(originalLeftHipPoint);
    const xAxisVector = originalFootIndexMidPoint.subtract(
      originalWristsMidPoint
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
    const leftWristPoint = new Point3d(
      landmarks[landmarksDict.LEFT_WRIST],
      coordinatesSystem
    );
    const rightWristPoint = new Point3d(
      landmarks[landmarksDict.RIGHT_WRIST],
      coordinatesSystem
    );
    const wristMidPoint = leftWristPoint.getMidPoint(rightWristPoint);

    const leftRightShoulderDiff =
      leftShoulderPoint.subtract(rightShoulderPoint);
    const leftRightHipDiff = leftHipPoint.subtract(rightHipPoint);
    const leftRightKneeDiff = leftKneePoint.subtract(rightKneePoint);
    const leftRightHeelDiff = leftHeelPoint.subtract(rightHeelPoint);
    const leftRightElbowDiff = leftElbowPoint.subtract(rightElbowPoint);
    const leftRightWristDiff = leftWristPoint.subtract(rightWristPoint);

    const shoulderHipMidAngle = shoulderMidPoint.getAngle(hipMidPoint);
    const shoulderKneeMidAngle = shoulderMidPoint.getAngle(kneeMidPoint);
    const shoulderHeelMidAngle = shoulderMidPoint.getAngle(heelMidPoint);
    const shoulderElbowMidAngle = shoulderMidPoint.getAngle(
      elbowMidPoint,
      true
    );
    const shoulderWristMidAngle = shoulderMidPoint.getAngle(
      wristMidPoint,
      true
    );

    const response: ExerciseValidation = {
      error: "",
      points: [
        leftRightShoulderDiff,
        leftRightHipDiff,
        leftRightKneeDiff,
        leftRightHeelDiff,
        leftRightElbowDiff,
        leftRightWristDiff,
      ],
      angles: [
        shoulderHipMidAngle,
        shoulderKneeMidAngle,
        shoulderHeelMidAngle,
        shoulderElbowMidAngle,
        shoulderWristMidAngle,
      ],
    };

    const maxDiff = 0.2;
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
    } else if (
      Math.abs(leftRightWristDiff.x) > maxDiff ||
      Math.abs(leftRightWristDiff.y) > maxDiff
    ) {
      response.error = "Alinhe os punhos";
    } else if (shoulderHipMidAngle < -3 || shoulderHipMidAngle > 20) {
      response.error = "Alinhe os ombros e quadril";
    } else if (shoulderKneeMidAngle < -3 || shoulderKneeMidAngle > 20) {
      response.error = "Alinhe os ombros e joelhos";
    } else if (shoulderKneeMidAngle + 2 < shoulderHipMidAngle) {
      response.error = "Eleve o quadril";
    } else if (shoulderHeelMidAngle < -3 || shoulderHeelMidAngle > 20) {
      response.error = "Alinhe os ombros e calcanhares";
    } else if (Math.abs(shoulderKneeMidAngle - shoulderHeelMidAngle) > 10) {
      response.error = "Alinhe os joelhos e calcanhares";
    } else if (shoulderElbowMidAngle < 10) {
      response.error = "Alinhe os ombros e cotovelos";
    } else if (
      (shoulderWristMidAngle < 0 && shoulderWristMidAngle < -85) ||
      (shoulderWristMidAngle > 0 && shoulderWristMidAngle < 30)
    ) {
      response.error = "Alinhe os punhos com os ombros";
    }

    return response;
  }
}
