import { Results } from "@mediapipe/pose";
import { landmarksDict } from "./validator.class";
import Point3d from "./point3d.class";
import Utils from "./utils.class";
import { Constructor, Exercise } from "../types";

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

    const shoulderMidPoint = Utils.getMidShoulderPoint(landmarks);
    this.drawLine(canvas, ctx, nosePoint, shoulderMidPoint);

    const hipMidPoint = Utils.getMidHipPoint(landmarks);
    this.drawLine(canvas, ctx, shoulderMidPoint, hipMidPoint);

    const kneeMidPoint = Utils.getMidKneePoint(landmarks);
    this.drawLine(canvas, ctx, hipMidPoint, kneeMidPoint);

    const heelMidPoint = Utils.getMidHeelPoint(landmarks);
    this.drawLine(canvas, ctx, kneeMidPoint, heelMidPoint);

    const elbowMidPoint = Utils.getMidElbowPoint(landmarks);
    this.drawLine(canvas, ctx, shoulderMidPoint, elbowMidPoint);
  }
}

export class DrafterFactory {
  private static draftersDict: Record<Exercise, Constructor<Drafter>> = {
    plank: PlankDrafter,
  };

  private static drafters: { [key: string]: Drafter } = {};

  public static getDrafter(exercise: Exercise) {
    if (!DrafterFactory.drafters[exercise]) {
      DrafterFactory.drafters[exercise] = new DrafterFactory.draftersDict[
        exercise
      ]();
    }

    return DrafterFactory.drafters[exercise];
  }
}
