import { mat4 } from "vmath";
import { GameObject } from "./gameobject";

export class Lamp extends GameObject {
    type: "LAMP";
    shadow_options: {
        texture_size: number,
        frustum_size: number,
        clip_start: number,
        clip_end: number,
        bias: number,
        bleed_bias: number
    };

    constructor();

    instance_physics(): void;
    recalculate_render_data(world2cam: mat4, cam2world: mat4, world2light: mat4): void;
    init_shadow(): void;
    destroy_shadow(): void;
}