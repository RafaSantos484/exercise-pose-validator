import { LandmarkList } from "@mediapipe/pose";
import Point3d from "./point3d.class";
import CoordinatesSystem from "./coordinates-system.class";
import { landmarksDict } from "../types";

type arccosineOptions = {
  degrees?: boolean;
  abs?: boolean;
};
export default class Utils {
  private static getMidPoint(
    p1: Point3d,
    p2: Point3d,
    coordinatesSystem?: CoordinatesSystem
  ) {
    if (!!coordinatesSystem) {
      p1 = coordinatesSystem.convert(p1);
      p2 = coordinatesSystem.convert(p2);
    }
    return p1.getMidPoint(p2);
  }

  public static arccosine(angle: number, options?: arccosineOptions) {
    const abs = options?.abs !== undefined ? options.abs : false;
    const degrees = options?.degrees !== undefined ? options.degrees : true;
    if (abs) {
      angle = Math.abs(angle);
    }
    angle = Math.acos(angle);
    if (degrees) {
      angle *= 180 / Math.PI;
    }
    return angle;
  }

  public static getShouldersMidPoint(
    landmarks: LandmarkList,
    coordinatesSystem?: CoordinatesSystem
  ) {
    const leftShoulderPoint = new Point3d(
      landmarks[landmarksDict.LEFT_SHOULDER]
    );
    const rightShoulderPoint = new Point3d(
      landmarks[landmarksDict.RIGHT_SHOULDER]
    );
    return Utils.getMidPoint(
      leftShoulderPoint,
      rightShoulderPoint,
      coordinatesSystem
    );
  }

  public static getHipMidPoint(
    landmarks: LandmarkList,
    coordinatesSystem?: CoordinatesSystem
  ) {
    const leftHipPoint = new Point3d(landmarks[landmarksDict.LEFT_HIP]);
    const rightHipPoint = new Point3d(landmarks[landmarksDict.RIGHT_HIP]);
    return Utils.getMidPoint(leftHipPoint, rightHipPoint, coordinatesSystem);
  }

  public static getKneesMidPoint(
    landmarks: LandmarkList,
    coordinatesSystem?: CoordinatesSystem
  ) {
    const leftKneePoint = new Point3d(landmarks[landmarksDict.LEFT_KNEE]);
    const rightKneePoint = new Point3d(landmarks[landmarksDict.RIGHT_KNEE]);
    return Utils.getMidPoint(leftKneePoint, rightKneePoint, coordinatesSystem);
  }

  public static getHeelsMidPoint(
    landmarks: LandmarkList,
    coordinatesSystem?: CoordinatesSystem
  ) {
    const leftHeelPoint = new Point3d(landmarks[landmarksDict.LEFT_HEEL]);
    const rightHeelPoint = new Point3d(landmarks[landmarksDict.RIGHT_HEEL]);
    return Utils.getMidPoint(leftHeelPoint, rightHeelPoint, coordinatesSystem);
  }

  public static getElbowsMidPoint(
    landmarks: LandmarkList,
    coordinatesSystem?: CoordinatesSystem
  ) {
    const leftElbowPoint = new Point3d(landmarks[landmarksDict.LEFT_ELBOW]);
    const rightElbowPoint = new Point3d(landmarks[landmarksDict.RIGHT_ELBOW]);
    return Utils.getMidPoint(
      leftElbowPoint,
      rightElbowPoint,
      coordinatesSystem
    );
  }

  public static getWristsMidPoint(
    landmarks: LandmarkList,
    coordinatesSystem?: CoordinatesSystem
  ) {
    const leftWristPoint = new Point3d(landmarks[landmarksDict.LEFT_WRIST]);
    const rightWristPoint = new Point3d(landmarks[landmarksDict.RIGHT_WRIST]);
    return Utils.getMidPoint(
      leftWristPoint,
      rightWristPoint,
      coordinatesSystem
    );
  }

  public static getFootIndexesMidPoint(
    landmarks: LandmarkList,
    coordinatesSystem?: CoordinatesSystem
  ) {
    const leftFootIndexPoint = new Point3d(
      landmarks[landmarksDict.LEFT_FOOT_INDEX]
    );
    const rightFootIndexPoint = new Point3d(
      landmarks[landmarksDict.RIGHT_FOOT_INDEX]
    );
    return Utils.getMidPoint(
      leftFootIndexPoint,
      rightFootIndexPoint,
      coordinatesSystem
    );
  }
}
