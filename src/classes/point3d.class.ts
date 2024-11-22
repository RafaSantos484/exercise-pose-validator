import { Landmark } from "@mediapipe/pose";

type Point3dTuple = [number, number, number];

export default class Point3d {
  public x: number;
  public y: number;
  public z: number;

  constructor(landmark: Landmark | Point3dTuple) {
    if (Array.isArray(landmark)) {
      this.x = landmark[0];
      this.y = landmark[1];
      this.z = landmark[2];
    } else {
      this.x = landmark.x;
      this.y = landmark.y;
      this.z = landmark.z;
    }
  }

  public getMidPoint(p2: Point3d) {
    return new Point3d([
      (this.x + p2.x) / 2,
      (this.y + p2.y) / 2,
      (this.z + p2.z) / 2,
    ]);
  }

  public getAngle(p2: Point3d) {
    let tang = (p2.y - this.y) / (p2.x - this.x);
    return Math.atan(tang) * (180 / Math.PI);
  }

  public subtract(p2: Point3d) {
    return new Point3d([this.x - p2.x, this.y - p2.y, this.z - p2.z]);
  }

  public crossProduct(p2: Point3d) {
    return new Point3d([
      this.y * p2.z - this.z * p2.y,
      this.z * p2.x - this.x * p2.z,
      this.x * p2.y - this.y * p2.x,
    ]);
  }

  public dotProduct(p2: Point3d) {
    return this.x * p2.x + this.y * p2.y + this.z * p2.z;
  }

  public getMagnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
  }

  public normalize() {
    const magnitude = this.getMagnitude();
    return new Point3d([
      this.x / magnitude,
      this.y / magnitude,
      this.z / magnitude,
    ]);
  }

  public toString(fractionDigits = 2) {
    return `(${this.x.toFixed(fractionDigits)}, ${this.y.toFixed(
      fractionDigits
    )}, ${this.z.toFixed(fractionDigits)})`;
  }
}
