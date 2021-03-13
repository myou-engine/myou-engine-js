import { vec3 } from "vmath";

import { Myou } from "./myou";
import { Armature } from "./armature";
import { GameObject } from "./gameobject";
import { Material } from "./material";
import { Viewport } from "./viewport";
import { Scene } from "./scene";

declare interface MeshDataLayout {
    count: number,
    location: number,
    name: string,
    offset: number,
    type: "f"|"b"
}

declare class MeshData {
    type: 'MESH';
    context: Myou;
    constructor(context: Myou);
    hash: string;
    varray?: Float32Array;
    iarray?: Uint16Array;
    varray_byte?: Uint8Array;
    loaded: boolean;
    vertex_buffers: WebGLBuffer[];
    index_buffers: WebGLBuffer[];
    num_indices: number[];
    vaos: WebGLVertexArrayObject[];
    layouts: MeshDataLayout[];
    stride: number;
    offsets: number[];
    draw_method: number;
    phy_convex_hull?: unknown;
    phy_mesh?: unknown;

    remove(ob: GameObject, delete_buffers?: boolean): void;
    clone(): MeshData;
}

/** Mesh object class.
 *
 * For information on using a Blender mesh go
 * {@link ../extra/Tutorials/Using a Blender mesh.md | here}
 *
 * To learn how to create a mesh from code go
 * {@link ../extra/Advanced tutorials/Creating a mesh from code.md | here }
 * */
export class Mesh extends GameObject {
    context: Myou;
    constructor();
    type: 'MESH';
    data?: MeshData;
    materials: Material[];
    material_defines: unknown;
    passes: number[];
    armature?: Armature;
    uv_rect: number;
    uv_right_eye_offset: number;
    culled_in_last_frame: boolean;
    center: vec3;
    sort_vector: vec3;
    last_lod: Record<string,object> //TODO: Specify the type more.
    hash: string;
    layout: MeshData["layouts"];
    offsets: MeshData["offsets"];
    stride: MeshData["stride"];
    mesh_id: number;
    all_f: boolean;
    bone_index_maps: unknown[]; //??
    sort_sign: -1|1;
    mesh_name: string;

    /** Loads mesh data from arrays or arraybuffers containing
     * vertices and indices. Automatically sets submesh offsets.
     * @param vertices [Array<number>] Raw vertex buffer data.
     * @param indices [Array<number>] Raw indices.
     * */
    load_from_lists(vertices: number[], indices: number[]): void;

    /** Updates index arrays. Usually used after faces are sorted. */
    update_iarray(): void;

    /** Returns a LoD version of the mesh that has enough detail for its visual
     * size.
     * @param [Viewport] Viewport
     * @param [number] min_length_px:
     *       The minimum length of the average polygon, in screen pixels
     * @param [number] render_tick
     *       Frame number, so the same frame is not calculated twice.
     * */
    get_lod_mesh(viewport: Viewport, min_length_px: number, render_tick: number): Mesh;

    /** Returns a clone of the object
     * @option options scene [Scene] Destination scene
     * @option options recursive [bool] Whether to clone its children
     * @option options behaviours [bool] Whether to clone its behaviours
     * */
    clone(options?: {
        scene?: Scene,
        recursive?: boolean,
        behaviours?: boolean
    }): Mesh;

    sort_faces(camera_position: vec3): void;

}