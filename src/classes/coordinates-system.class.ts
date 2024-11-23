import Point3d from "./point3d.class";

export default class CoordinatesSystem {
  private z1: Point3d;
  private z2: Point3d;
  private x1: Point3d;

  private zMid: Point3d;
  private xAxis: Point3d;
  private yAxis: Point3d;
  private zAxis: Point3d;

  constructor(z1: Point3d, z2: Point3d, x1: Point3d) {
    this.z1 = z1;
    this.z2 = z2;
    this.x1 = x1;

    // Ponto médio entre p_hip_l e p_hip_r
    this.zMid = this.z1.getMidPoint(this.z2);

    // Define o eixo Z (normalizado)
    this.zAxis = this.z2.subtract(this.z1).normalize();

    // Define o eixo X (normalizado)
    this.xAxis = this.x1.subtract(this.zMid).normalize();

    // Define o eixo Y como o produto vetorial entre Z e X
    this.yAxis = this.zAxis.crossProduct(this.xAxis);
  }

  public convert(p: Point3d) {
    // Translada o ponto p para a origem
    const translatedP = p.subtract(this.zMid);

    // Projeta o ponto no novo sistema de coordenadas
    return new Point3d([
      translatedP.dotProduct(this.xAxis),
      translatedP.dotProduct(this.yAxis),
      translatedP.dotProduct(this.zAxis),
    ]);
  }
}
