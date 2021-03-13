import { mat4, vec3, vec4 } from "vmath";
import { CloneOptions, GameObject } from "./gameobject";

declare type SensorFit = "AUTO" | "HORIZONTAL" | "VERTICAL" | "COVER" | "CONTAIN"

export class Camera extends GameObject {
    type: "CAMERA";
    near_plane: number;
    far_plane: number;
    field_of_view: number;
    ortho_scale: number;
    aspect_ratio: number;
    cam_type: "PERSP" | "ORTHO";
    sensor_fit: SensorFit;
    fov_4: number[];
    target_aspect_ratio: number;
    projection_matrix: mat4;
    projection_matrix_inv: mat4;
    world_to_screen_matrix: mat4;
    cull_planes: vec4[];
    constructor(options?:{
        near_plane?: number;
        far_plane?: number;
        field_of_view?: number;
        ortho_scale?: number;
        aspect_ratio?: number;
        cam_type?: "PERSP" | "ORTHO";
        sensor_fit?: SensorFit;
    });

    clone(options: CloneOptions): Camera;

    instance_physics(): void;

    /** Returns a world vector from screen coordinates,
    * 0 to 1, where (0,0) is the upper left corner.
    * */
    get_ray_direction(x: number, y: number): vec3;
    get_ray_direction_into(out: vec3, x: vec3, y: vec3): vec3;
    get_ray_direction_local(x: number, y: number): vec3;
    get_ray_direction_local_into(out: vec3, x: number, y: number): vec3;

    is_vertical_fit(): boolean;
    set_projection_matrix(matrix: mat4, adjust_aspect_ratio?:boolean): void;
    update_projection(): void;
}