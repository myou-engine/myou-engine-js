import { quat, vec3, mat4, color4 } from "vmath";
import { Myou } from "./myou"
import { RotationOrder } from "./util";
import { Behaviour, Behavior } from "./behaviour";
import { Scene } from "./scene";
import { NLAStrip } from "./animation"

export class GameObject {
    context: Myou;
    debug: boolean;
    position: vec3;
    rotation: quat;
    radius: number;
    rotation_order: RotationOrder;
    scale: vec3;
    dimensions: vec3;
    bound_box: vec3[];
    color: color4;
    alpha: number;
    matrix_parent_inverse: mat4;
    scene: Scene;
    source_scene_name: string;
    dupli_group: unknown //?
    visible: boolean;
    parent: GameObject;
    children: GameObject[];
    static: boolean;
    world_matrix: mat4;
    probe_cube: Probe;
    probe_planar: Probe;
    properties: Record<string, any>;
    animation_strips: NLAStrip[];
    animations: Record<string, Animation>;
    name: string;
    type?: ObjectType;
    original_name: string;
    lod_objects: GameObject[];
    parent_bone_index: number;
    behaviours: Record<string, Behaviour>
    body: Body;
    avg_poly_area: number;
    avg_poly_length: number;
    zindex: number;
    groups: unknown[]; //??

    pending_bodies: unknown; //??

    constructor(options?: {
        add_to_loaded_scenes?: boolean
    });

    set_rotation_order(order: RotationOrder): void;
    get_world_matrix(): mat4;
    get_world_position(): vec3;
    get_world_rotation(): quat;
    get_world_position_into(out: vec3): vec3;
    get_world_position_into(out: quat): quat;
    get_world_position_rotation(): {position: vec3, rotation: quat};
    get_world_position_rotation_into(out_pos: vec3, out_rot: quat): void;
    translate(vector: vec3, relative_object?: GameObject): this;
    translate_x(x: number, relative_object?: GameObject): this;
    translate_y(y: number, relative_object?: GameObject): this;
    translate_z(z: number, relative_object?: GameObject): this;
    rotate_euler_deg(vector: vec3, order: RotationOrder, relative_object?: GameObject): this;
    rotate_quat(angle: number, relative_object?: GameObject): this;
    rotate_x(angle: number, relative_object?: GameObject): this;
    rotate_y(angle: number, relative_object?: GameObject): this;
    rotate_z(angle: number, relative_object?: GameObject): this;
    rotate_x_deg(angle: number, relative_object?: GameObject): this;
    rotate_y_deg(angle: number, relative_object?: GameObject): this;
    rotate_z_deg(angle: number, relative_object?: GameObject): this;

    /** Sets the world position of object without altering
    * its parent relationship.
    * @param position Global position to set.
    * */
    set_world_position(position: vec3): this;

    /** Sets the world rotation of object without altering
    * its parent relationship.
    * @param rotation Global rotation to set. Must be a quaterion.
    * */
    set_world_rotation(rotation: quat): this;

    /** Sets the world position and rotation of object without altering
    * its parent relationship.
    * @param position Global position to set.
    * @param rotation Global rotation to set. Must be a quaterion.
    * */
    set_world_position_rotation(position: vec3, rotation: quat): this;

    look_at(target: GameObject, options?: {
        front?: string,
        up?: string,
        up_vector?: vec3,
        influence?: number
    }): this;

    add_behaviour(behaviour: Behaviour): void;
    add_behavior(behavior: Behavior): void;
    remove_behaviour(behaviour: Behaviour): void;
    remove_behavior(behavior: Behavior): void;

    /** Returns a clone of the object
    * @option options scene [Scene] Destination scene
    * @option options recursive [bool] Whether to clone its children
    * @option options behaviours [bool] Whether to clone its behaviours
    * */
    clone(options?: CloneOptions, options2?: CloneOptions): GameObject;

    set_parent(parent: GameObject, options?: {
        keep_transform?: boolean
    }): void;
    parent_to(parent: GameObject, options?: {
        keep_transform?: boolean
    }): void;
    clear_parent(options: {
        keep_transform: boolean
    }): void;
    get_top_ancestor(top_level_parents: GameObject[]): GameObject;
    get_descendants(include_self: boolean): GameObject[];
    load(options?: {
        fetch_textures?: boolean,
        texture_size_ratio?: number,
        max_mesh_lod?: number
    }): ReturnType<Scene["load_objects"]>;
    remove(recursive?: boolean): ReturnType<Scene["remove_object"]>;
    destroy(recursive?: boolean): void;
    instance_probes(): void;
    convert_bone_child_to_bone_parent(): void;
    get_world_X_vector(): vec3;
    get_world_Y_vector(): vec3;
    get_world_Z_vector(): vec3;
    get_dimensions(): vec3;
    get_size(): number;
    set_size(size: number): void;
    add_to_group(group_name: string): void;
}

export interface CloneOptions {
    recursive?: boolean,
    behaviours?: boolean,
    new_parent?: GameObject,
    scene?: Scene
}

export type ObjectType = "CAMERA"|"SCENE"|"LAMP"|"ARMATURE"|"MESH"