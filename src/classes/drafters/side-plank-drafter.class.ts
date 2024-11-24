import { Results } from "@mediapipe/pose";
import Point3d from "../point3d.class";
import Utils from "../utils.class";
import { landmarksDict } from "../../types";
import SidePlankValidator from "../validators/side-plank-validator";
import { Drafter } from "./drafter.class";

export default class SidePlankDrafter extends Drafter {
  constructor() {
    super([
      landmarksDict.NOSE,
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
    ]);
  }

  public draw(
    results: Results,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) {
    super.draw(results, canvas, ctx);
    const landmarks = results.poseLandmarks;

    const nosePoint = new Point3d(landmarks[landmarksDict.NOSE]);

    const shoulderLeftPoint = new Point3d(
      landmarks[landmarksDict.LEFT_SHOULDER]
    );
    const shoulderRightPoint = new Point3d(
      landmarks[landmarksDict.RIGHT_SHOULDER]
    );
    const shoulderMidPoint = shoulderLeftPoint.getMidPoint(shoulderRightPoint);
    this.drawLine(canvas, ctx, nosePoint, shoulderMidPoint);
    this.drawLine(canvas, ctx, shoulderMidPoint, shoulderLeftPoint);
    this.drawLine(canvas, ctx, shoulderMidPoint, shoulderRightPoint);

    const hipMidPoint = Utils.getHipMidPoint(landmarks);
    this.drawLine(canvas, ctx, shoulderMidPoint, hipMidPoint);

    const kneeMidPoint = Utils.getKneesMidPoint(landmarks);
    this.drawLine(canvas, ctx, hipMidPoint, kneeMidPoint);

    const heelMidPoint = Utils.getHeelsMidPoint(landmarks);
    this.drawLine(canvas, ctx, kneeMidPoint, heelMidPoint);

    const leftElbowPoint = new Point3d(landmarks[landmarksDict.LEFT_ELBOW]);
    let rightElbowPoint = new Point3d(landmarks[landmarksDict.RIGHT_ELBOW]);
    this.drawLine(canvas, ctx, shoulderLeftPoint, leftElbowPoint);
    this.drawLine(canvas, ctx, shoulderRightPoint, rightElbowPoint);

    const isLeftShoulderOnGround =
      SidePlankValidator.IsLeftShoulderOnGround(results);
    let elbowPoint: Point3d;
    if (isLeftShoulderOnGround) {
      elbowPoint = leftElbowPoint;
    } else {
      elbowPoint = rightElbowPoint;
    }
    this.drawLine(canvas, ctx, heelMidPoint, elbowPoint);
  }
}
