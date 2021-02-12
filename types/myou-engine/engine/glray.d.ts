import { vec3, mat4 } from "vmath";
import { Camera } from "./camera";

import { Framebuffer } from "./framebuffer";
import { GameObject } from "./gameobject";
import { Mesh } from "./mesh";
import { Scene } from "./scene";

export class GLRay {
    debug_canvas: HTMLCanvasElement;
    width: number;
    height: number;
    max_distance: number;
    render_steps: number;
    wait_steps: number;
    constructor(options?: {
        debug_canvas: HTMLCanvasElement,
        width?: number,
        height?: number,
        max_distance?: number,
        render_steps?: number,
        wait_steps?: number
    })
    buffer: Framebuffer;
    //mat: Shader; Might not be accessible.
    m4: mat4;
    world2cam: mat4;
    cam2world: mat4;
    last_cam2world: mat4;
    meshes: Mesh[];
    sorted_meshes?: Mesh[];
    mesh_by_id: Mesh[];
    debug_x: number;
    debug_y: number;
    scene: Scene;
    camera: Camera;
    ctx?: CanvasRenderingContext2D;

    resize(width: number, height: number): void;
    init(scene: Scene, camera: Camera, add_callback?: boolean): void;
    add_scene(scene: Scene): void;
    debug_xy(x: number, y: number): void;
    get_byte_coords(x: number, y: number): {x: number, y: number, index: number};
    pick_object(x: number, y: number): {object: GameObject, point: vec3, distance: number} | null;
    do_step(): void;
    draw_debug_canvas(): void;
    single_step_pick_object(x: number, y: number): ReturnType<GLRay["pick_object"]>;
    create_debug_canvas(): void;
    destroy_debug_canvas(): void;
    debug_random(): ReturnType<GLRay["pick_object"]>;
}