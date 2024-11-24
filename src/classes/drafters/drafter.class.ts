import { Results } from "@mediapipe/pose";
import Point3d from "../point3d.class";

export default class Drafter {
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
