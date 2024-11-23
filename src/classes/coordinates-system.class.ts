import Point3d from "./point3d.class";

type Axis = "x" | "y" | "z";
type VectorAxisTuple = [Point3d, Axis];
export default class CoordinatesSystem {
  private origin: Point3d;
  private xAxis: Point3d;
  private yAxis: Point3d;
  private zAxis: Point3d;

  private reorderAxes(
    axis1: Point3d,
    axis2: Point3d,
    axis3: Point3d,
    axis1Label: Axis,
    axis2Label: Axis
  ): [Point3d, Point3d, Point3d] {
    const axes: Record<Axis, Point3d> = {
      x: new Point3d([0, 0, 0]),
      y: new Point3d([0, 0, 0]),
      z: new Point3d([0, 0, 0]),
    };

    axes[axis1Label] = axis1;
    axes[axis2Label] = axis2;

    const remainingAxis = ["x", "y", "z"].find(
      (a) => a !== axis1Label && a !== axis2Label
    ) as Axis;
    axes[remainingAxis] = axis3;

    return [axes.x, axes.y, axes.z];
  }

  constructor(axis1: VectorAxisTuple, axis2: VectorAxisTuple, origin: Point3d) {
    this.origin = origin;
    let [axis1Vector, axis1Label] = axis1;
    let [axis2Vector, axis2Label] = axis2;

    axis1Vector = axis1Vector.normalize();
    axis2Vector = axis2Vector.normalize();
    // Calcula o terceiro eixo (produto vetorial entre os dois primeiros)
    const axis3Vector = axis1Vector.crossProduct(axis2Vector).normalize();

    // Ajusta os eixos em função dos rótulos
    [this.xAxis, this.yAxis, this.zAxis] = this.reorderAxes(
      axis1Vector,
      axis2Vector,
      axis3Vector,
      axis1Label,
      axis2Label
    );
  }

  public convert(p: Point3d) {
    // Translada o ponto para que a origem seja o ponto médio do eixo principal
    const translatedP = p.subtract(this.origin);

    // Projeta o ponto no novo sistema de coordenadas
    return new Point3d([
      translatedP.dotProduct(this.xAxis),
      translatedP.dotProduct(this.yAxis),
      translatedP.dotProduct(this.zAxis),
    ]);
  }
}
