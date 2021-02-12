import { vec3 } from "vmath";

import { GameObject } from "./gameobject";

export class Curve extends GameObject {
    type: 'CURVE';
    set_curves(curves: number[][], resolution: number, nodes?: boolean): void;
    va: Float32Array;
    ia: Uint16Array;
    // origins: void[]; // TODO: It seems that it's not used.
    closest_point(q: vec3, scale?: vec3): vec3[];
    get_curve_edges_length(curve_index: number): Float32Array;
    get_curve_direction_vectors(curve_index: number): Float32Array;
    get_nodes(main_curve_index?: number, precision?: number): Record<number, number[]>
}