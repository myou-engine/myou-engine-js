import { quat, vec3 } from "vmath";
import { GameObject } from "./gameobject";
import { Scene } from "./scene";
import { Mesh } from "./mesh";

export class World {
    scene: Scene;
    readonly gravity: vec3;
    physics_fps: number;
    time_ratio: number;
    max_substeps: number;

    constructor(scene: Scene);

    instance(): void;
    destroy(): void;
    set_gravity(gravity: vec3): void;
    step(frame_duration: number): void;
    ray_test(ray_from: vec3, ray_to: vec3, int_mask?: number): void;
    
}

declare type CollisionType = "NO_COLLISION"|"DYNAMIC"|"STATIC"|"SENSOR"|"CHARACTER";
declare type CollisionShape = "BOX"|"SPHERE"|"CYLINDER"|"CONE"|"CAPSULE"|"CONVEX_HULL"|"TRIANGLE_MESH";

export class Body {
    owner: GameObject;
    world: World;
    readonly type: CollisionType;
    readonly shape: CollisionShape;
    radius: number;
    use_anisotropic_friction: boolean;
    friction_coefficients: vec3;
    group: number;
    mask: number;
    margin: number;
    readonly is_compound: boolean;
    mass: number;
    readonly no_sleeping: boolean;
    readonly is_ghost: boolean;
    readonly linear_factor: vec3;
    readonly angular_factor: vec3;
    form_factor: number;
    friction: number;
    elasticity: number;
    half_extents: vec3;
    physics_mesh?: Mesh;
    step_height: number;
    jump_force: number;
    max_fall_speed: number;
    slope: number;
    last_position: vec3;
    constraints: Constraint[];

    constructor(owner: GameObject);
    set_shape(shape: CollisionShape, is_compound?:boolean): void;
    set_type(shape: CollisionType): void;
    instance(use_visual_mesh?: boolean): void;
    get_physics_mesh(use_visual_mesh?: boolean): void;
    destroy(): void;
    set_linear_factor(linear_factor: vec3): void;
    set_angular_factor(angular_factor: vec3): void;
    set_deactivation_time(time: number): void;
    activate(): void;
    deactivate(): void;
    allow_sleeping(): void;
    disallow_sleeping(): void;
    make_ghost(): void;
    clear_ghost(): void;
    update_transform(): void;
    update_rotation(): void;
    update_scale(): void;
    get_linear_velocity(local?: boolean): vec3;
    get_angular_velocity(local?: boolean): vec3;
    set_linear_velocity(v: vec3): void;
    set_angular_velocity(v: vec3): void;
    apply_force(force: vec3, rel_pos: vec3): void;
    apply_central_force(force: vec3): void;
    apply_central_impulse(force: vec3): void;
    set_friction(friction: number): void;
    set_character_velocity(v: vec3): void;
    set_character_gravity(v: vec3): void;
    set_jump_force(f: number): void;
    jump(): void;
    on_ground(): void;
    set_max_fall_speed(f: number): void;
    colliding_points(margin?: number, use_ghost?: boolean): {point_on_body: vec3, point_on_other: vec3}[];
    add_point_constraint(other: Body, point: vec3, linked_collision?: boolean): Constraint;
    add_conetwist_constraint(other: Body, point: vec3, rot: quat, limit_twist: number, limit_y: number, limit_z: number, linked_collision?: boolean): Constraint;
}

export class Constraint {
    destroy(): void;
}