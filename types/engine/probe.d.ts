import { vec3, quat, mat4 } from "vmath";

import { Camera } from "./camera";
import { GameObject } from "./gameobject";
import { Myou } from "./myou";
import { TextureBase } from "./texture";

export class Probe {
    context: Myou;
    readonly type: ProbeType;
    constructor(object: GameObject, options: ProbeData);
    target_object: GameObject;
    parallax_object: GameObject;
    cubemap?: TextureBase;
    planar?: TextureBase;
    reflection_camera?: Camera;
    fake_vp?: {
        camera: Camera,
        eye_shift: vec3,
        clear_bits: number,
        units_to_pixel: number
    };
    position: vec3;
    rotation: quat;
    normal: vec3;
    view_normal: vec3;
    planarreflectmat: mat4;

    set_auto_refresh(auto_refresh: boolean): void;
    set_lod_factor(): void;
    render(): void;
    destroy(): void;
}

export interface ProbeData {
    type: ProbeType,
    object: string,
    auto_refresh: boolean,
    compute_sh: boolean,
    double_refresh: boolean,
    same_layers: boolean,
    size: number,
    sh_quality: number,
    clip_start: number,
    clip_end: number,
    parallax_type: string, //TODO: Specify possible values
    parallax_volume: string,
    reflection_plane: string,
    background_only?: boolean
}

declare type ProbeType = "CUBEMAP" | "CUBE" | "PLANE";