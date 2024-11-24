import { Results } from "@mediapipe/pose";
import Utils from "../utils.class";
import { landmarksDict } from "../../types";
import { Drafter } from "./drafter.class";

export default class PlankDrafter extends Drafter {
  constructor() {
    super([
      landmarksDict.LEFT_ELBOW,
      landmarksDict.RIGHT_ELBOW,
      landmarksDict.LEFT_SHOULDER,
      landmarksDict.RIGHT_SHOULDER,
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

    const shoulderMidPoint = Utils.getShouldersMidPoint(landmarks);

    const hipMidPoint = Utils.getHipMidPoint(landmarks);
    this.drawLine(canvas, ctx, shoulderMidPoint, hipMidPoint);

    const kneeMidPoint = Utils.getKneesMidPoint(landmarks);
    this.drawLine(canvas, ctx, hipMidPoint, kneeMidPoint);

    const heelMidPoint = Utils.getHeelsMidPoint(landmarks);
    this.drawLine(canvas, ctx, kneeMidPoint, heelMidPoint);

    const footIndexMidPoint = Utils.getFootIndexesMidPoint(landmarks);
    this.drawLine(canvas, ctx, heelMidPoint, footIndexMidPoint);

    const elbowMidPoint = Utils.getElbowsMidPoint(landmarks);
    this.drawLine(canvas, ctx, shoulderMidPoint, elbowMidPoint);
  }
}
