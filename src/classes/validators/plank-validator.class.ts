import { Results } from "@mediapipe/pose";
import Point3d from "../point3d.class";
import CoordinatesSystem from "../coordinates-system.class";
import Utils from "../utils.class";
import { landmarksDict } from "../../types";
import { ExerciseValidation, Validator } from "./validator.class";

export default class PlankValidator extends Validator {
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
