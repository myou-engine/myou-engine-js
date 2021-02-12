import { GameObject } from "./gameobject";
import { Myou } from "./myou";
import { Scene } from "./scene";
import { Texture } from "./texture";
import { vec2, vec3, vec4, quat, color3, color4, mat3, mat4 } from "vmath";
import { NLAStrip } from "./animation";
import { BaseFilter } from "./filter";

export class Material {
    context: Myou;
    name: string;
    data: MaterialData;
    scene: Scene;
    render_scene: Scene;
    shader_library: string;
    inputs: Record<string,InputValue>;
    animation_strips?: NLAStrip[]
    double_sided?: boolean;
    alpha_texture?: Texture;
    users: Scene|GameObject|BaseFilter[];

    set_data(data: MaterialData): void;
    get_texture_list(): {
        name?: string,
        varname: string,
        value: Texture
    }[];

    /** Initiates loading of the material and its textures,
     * returning a promise for when all has loaded
     * @option options fetch_textures [boolean]
     *       Whether to fetch textures when they're not loaded already.
     * @option options texture_size_ratio [number]
     *       Quality of textures specified in ratio of number of pixels.
     * @return [Promise]
     * */
    load(options?:{
        fetch_textures?: boolean,
        texture_size_ratio?: number,
        load_videos: boolean
    }): Promise<Texture[]>

    clone_to_scene(scene: Scene): Material;
    delete_all_shaders(destroy: boolean): void;
    destroy(): void;
}

declare interface Uniform {
    name?: string,
    varname: string,
    value: InputValue
}

declare type InputValue = number | vec2 | vec3 | vec4 | quat | color3 | color4 | mat3 | mat4 | Texture

declare interface MaterialData {
    material_type: "PLAIN_SHADER"|"BLENDER_INTERNAL"|"BLENDER_CYCLES_PBR"
    vertex: string,
    fragment: string,
    uniforms: Uniform[],
    varyings: {
        type: "UNUSED" | "VIEW_POSITION" | "PROJ_POSITION" | "VIEW_NORMAL" | "UV" | "VCOL" | "TANGENT" | "ORCO",
        varname: string,
        gltype?: string,
        attname?: string,
        multiplier?: number
    }[]
}