import { Results } from "@mediapipe/pose";
import Utils from "../utils.class";
import { landmarksDict } from "../../types";
import Drafter from "./drafter.class";
import Point3d from "../point3d.class";

export default class PushUpDrafter extends Drafter {
  constructor() {
    super([
      landmarksDict.LEFT_ELBOW,
      landmarksDict.RIGHT_ELBOW,
      landmarksDict.LEFT_SHOULDER,
      landmarksDict.RIGHT_SHOULDER,
      landmarksDict.LEFT_WRIST,
      landmarksDict.RIGHT_WRIST,
      landmarksDict.LEFT_HIP,
      landmarksDict.RIGHT_HIP,
      landmarksDict.LEFT_KNEE,
      landmarksDict.RIGHT_KNEE,
      landmarksDict.LEFT_HEEL,
      landmarksDict.RIGHT_HEEL,
      landmarksDict.LEFT_FOOT_INDEX,
      landmarksDict.RIGHT_FOOT_INDEX,
    ]);
  }

  public draw(
    results: Results,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) {
    super.draw(results, canvas, ctx);
    const landmarks = results.poseLandmarks;

    const leftShoulderPoint = new Point3d(
      landmarks[landmarksDict.LEFT_SHOULDER]
    );
    const rightShoulderPoint = new Point3d(
      landmarks[landmarksDict.RIGHT_SHOULDER]
    );
    const shoulderMidPoint = leftShoulderPoint.getMidPoint(rightShoulderPoint);
    this.drawLine(canvas, ctx, leftShoulderPoint, shoulderMidPoint);
    this.drawLine(canvas, ctx, rightShoulderPoint, shoulderMidPoint);

    const hipMidPoint = Utils.getHipMidPoint(landmarks);
    this.drawLine(canvas, ctx, shoulderMidPoint, hipMidPoint);

    const kneeMidPoint = Utils.getKneesMidPoint(landmarks);
    this.drawLine(canvas, ctx, hipMidPoint, kneeMidPoint);

    const heelMidPoint = Utils.getHeelsMidPoint(landmarks);
    this.drawLine(canvas, ctx, kneeMidPoint, heelMidPoint);

    const footIndexMidPoint = Utils.getFootIndexesMidPoint(landmarks);
    this.drawLine(canvas, ctx, heelMidPoint, footIndexMidPoint);

    const leftElbowPoint = new Point3d(landmarks[landmarksDict.LEFT_ELBOW]);
    const rightElbowPoint = new Point3d(landmarks[landmarksDict.RIGHT_ELBOW]);
    this.drawLine(canvas, ctx, leftShoulderPoint, leftElbowPoint);
    this.drawLine(canvas, ctx, rightShoulderPoint, rightElbowPoint);

    const leftWristPoint = new Point3d(landmarks[landmarksDict.LEFT_WRIST]);
    const rightWristPoint = new Point3d(landmarks[landmarksDict.RIGHT_WRIST]);
    this.drawLine(canvas, ctx, leftElbowPoint, leftWristPoint);
    this.drawLine(canvas, ctx, rightElbowPoint, rightWristPoint);
  }
}
