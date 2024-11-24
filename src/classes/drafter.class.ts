import { Results } from "@mediapipe/pose";
import Point3d from "./point3d.class";
import Utils from "./utils.class";
import { Constructor, Exercise, landmarksDict } from "../types";
import { SidePlankValidator } from "./validator.class";

class Drafter {
  protected selectedLandmarks: number[];

  constructor(selectedLandmarks?: number[]) {
    this.selectedLandmarks = selectedLandmarks || [];
  }

  protected drawCircle(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    p: Point3d,
    radius: number
  ) {
    ctx.beginPath();
    ctx.arc(p.x * canvas.width, p.y * canvas.height, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  }
  protected drawLine(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    p1: Point3d,
    p2: Point3d
  ) {
    ctx.beginPath();
    ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
    ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
    ctx.stroke();
  }

  public draw(
    results: Results,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) {
    ctx.fillStyle = "red";
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;

    results.poseLandmarks.forEach((landmark, idx) => {
      if (!this.selectedLandmarks.includes(idx)) return;

      const point = new Point3d(landmark);
      this.drawCircle(canvas, ctx, point, 4);
    });
  }
}

class PlankDrafter extends Drafter {
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

class SidePlankDrafter extends Drafter {
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

export class DrafterFactory {
  private static draftersDict: Record<Exercise, Constructor<Drafter>> = {
    plank: PlankDrafter,
    side_plank: SidePlankDrafter,
  };
  private static instance: DrafterFactory | undefined = undefined;

  private drafters: Record<string, Drafter>;

  private constructor() {
    this.drafters = {};
  }

  public static getInstance() {
    if (!DrafterFactory.instance) {
      DrafterFactory.instance = new DrafterFactory();
    }
    return DrafterFactory.instance;
  }

  public getDrafter(exercise: Exercise) {
    if (!this.drafters[exercise]) {
      this.drafters[exercise] = new DrafterFactory.draftersDict[exercise]();
    }
    return this.drafters[exercise];
  }
}
