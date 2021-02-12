import { Mesh } from "./mesh";
import { Myou } from "./myou";

export class MeshFactory {
    context: Myou;
    constructor(context: Myou);

    make_sphere(options:{
        radius: number,
        segments?: number,
        rings?: number,
        flip_normals?: boolean
    }): Mesh
}