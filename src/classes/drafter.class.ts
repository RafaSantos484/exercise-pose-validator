import { Results } from "@mediapipe/pose";
import { landmarksDict } from "./validator.class";
import Point3d from "./point3d.class";
import Utils from "./utils.class";
import { Constructor, Exercise } from "../types";

class Drafter {
  protected selectedLandmarks: number[];
  protected canvas: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D;
  protected results: Results;

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    results: Results,
    selectedLandmarks?: number[]
  ) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.results = results;
    this.selectedLandmarks = selectedLandmarks || [];
  }

  protected drawCircle(
    ctx: CanvasRenderingContext2D,
    p: Point3d,
    radius: number
  ) {
    ctx.beginPath();
    ctx.arc(
      p.x * this.canvas.width,
      p.y * this.canvas.height,
      radius,
      0,
      2 * Math.PI
    );
    ctx.fill();
    ctx.stroke();
  }
  protected drawLine(ctx: CanvasRenderingContext2D, p1: Point3d, p2: Point3d) {
    ctx.beginPath();
    ctx.moveTo(p1.x * this.canvas.width, p1.y * this.canvas.height);
    ctx.lineTo(p2.x * this.canvas.width, p2.y * this.canvas.height);
    ctx.stroke();
  }

  public draw() {
    this.ctx.fillStyle = "red";
    this.ctx.strokeStyle = "red";
    this.ctx.lineWidth = 2;

    this.results.poseLandmarks.forEach((landmark, idx) => {
      if (!this.selectedLandmarks.includes(idx)) return;

      const point = new Point3d(landmark);
      this.drawCircle(this.ctx, point, 4);
    });
  }
}

class PlankDrafter extends Drafter {
  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    results: Results
  ) {
    super(canvas, ctx, results, [
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

  public draw() {
    super.draw();
    const landmarks = this.results.poseLandmarks;

    const nosePoint = new Point3d(landmarks[landmarksDict.NOSE]);

    const shoulderMidPoint = Utils.getMidShoulderPoint(landmarks);
    this.drawLine(this.ctx, nosePoint, shoulderMidPoint);

    const hipMidPoint = Utils.getMidHipPoint(landmarks);
    this.drawLine(this.ctx, shoulderMidPoint, hipMidPoint);

    const kneeMidPoint = Utils.getMidKneePoint(landmarks);
    this.drawLine(this.ctx, hipMidPoint, kneeMidPoint);

    const heelMidPoint = Utils.getMidHeelPoint(landmarks);
    this.drawLine(this.ctx, kneeMidPoint, heelMidPoint);

    const elbowMidPoint = Utils.getMidElbowPoint(landmarks);
    this.drawLine(this.ctx, shoulderMidPoint, elbowMidPoint);
  }
}

const draftersDict: Record<Exercise, Constructor<Drafter>> = {
  plank: PlankDrafter,
};
export class DrafterFactory {
  public static getDrafter(
    exercise: Exercise,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    results: Results
  ) {
    return new draftersDict[exercise](canvas, ctx, results);
  }
}
