import { vec3, quat, mat4 } from "vmath";
import { GameObject } from "./gameobject";

declare class Bone {
    constructor();
    base_position: vec3;
    base_rotation: quat;
    position: vec3;
    rotation: quat;
    scale: vec3;
    final_position: vec3;
    final_rotation: quat;
    final_scale: vec3;
    matrix: mat4;
    /** Object local matrix (relative to rest pose) */
    ol_matrix: mat4;
    parent: Bone;
    index: number;
    inv_rest_matrix: mat4;
    deform_id: number;
    blength: number;
    constraints: BoneConstraints[];
    object_children: GameObject[];
    parent_object: GameObject;
}

declare interface Pose {
    position: vec3[],
    rotation: quat[],
    scale: vec3[]
}

export class Armature extends GameObject {
    type: "ARMATURE";
    constructor();
    add_bones(bones: Bone[]): void;
    recalculate_bone_matrices(use_constraints?: boolean): this;
    apply_pose_arrays(pose?: Pose): this;
    apply_rigid_body_constraints(): this;
    rotation_to(out: quat, p1: vec3, p2: vec3, maxang: number): quat;
}

declare class BoneConstraints {
    copy_location(owner: Bone, target: Bone): void;
    copy_rotation(owner: Bone, target: Bone, influence?: number): void;
    copy_scale(owner: Bone, target: Bone): void;
    copy_rotation_one_axis(owner: Bone, target: Bone, axis:string): void;
    stretch_to(owner: Bone, target: Bone, rest_length: number, bulge: number): void;
    ik(owner: Bone, target: Bone, chain_length: number, num_iterations: number): void;
}