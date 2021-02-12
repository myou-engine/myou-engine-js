import { vec3 } from "vmath";
import { Myou } from "./myou";
import { GameObject } from "./gameobject";
import { Scene } from "./scene";
import { Viewport } from "./viewport";

declare interface BehaviourOptions {
    objects?: GameObject[],
    viewports?: Viewport[],
    ray_int_mask?: number
}

export class Behaviour {
    id: string;
    context: Myou;
    scene: Scene;
    options: BehaviourOptions
    constructor(scene: Scene, options?: BehaviourOptions);
    assignment_times: Record<string, number>;
    objects: GameObject[];
    init_time: number;
    locked: boolean;

    enable(): this;
    disable(): this;
    age(): number;
    assignment_age(object: GameObject): number;
    assign(object: GameObject): this;
    unassign(object: GameObject): this;
    disable_context_menu(): this;
    enable_context_menu(): this;
    enable_prevent_pointer_defaults(): this;
    disable_prevent_pointer_defaults(): this;
    enable_object_picking(options:{
        method:"physics"
    }): void;
    disable_object_picking(): void;
    pick_object(x: number, y: number, viewport: Viewport): GameObject|{}|null;
    lock_pointer(): this;
    unlock_pointer(): this;

    on_tick?: (frame_duration: number) => void;
    on_object_tick?: (object: GameObject, frame_duration: number) => void;
    on_pointer_down?: (event: Behaviour.PointerEvent) => void;
    on_object_pointer_down?: (event: Behaviour.ObjectPointerEvent) => void;
    on_pointer_up?: (event: Behaviour.PointerEvent) => void;
    on_object_pointer_up?: (event: Behaviour.ObjectPointerEvent) => void;
    on_pointer_move?: (event: Behaviour.PointerEvent) => void;
    on_object_pointer_move?: (event: Behaviour.ObjectPointerEvent) => void;
    on_pointer_over?: (event: Behaviour.PointerEvent) => void;
    on_object_pointer_over?: (event: Behaviour.ObjectPointerEvent) => void;
    on_pointer_out?: (event: Behaviour.PointerEvent) => void;
    on_object_pointer_out?: (event: Behaviour.ObjectPointerEvent) => void;
    on_key_down?: (event: Behaviour.KeyboardEvent) => void;
    on_key_up?: (event: Behaviour.KeyboardEvent) => void;
    on_wheel?: (event: Behaviour.WheelEvent) => void;
    on_lock?: () => void;
    on_unlock?: () => void;
}

declare namespace Behaviour {
    interface PointerEvent {
        x: number,
        y: number,
        delta_x: number,
        delta_y: number,
        button: number,
        buttons: number,
        shiftKey: boolean,
        ctrlKey: boolean,
        metaKey: boolean,
        viewport: Viewport,
        event?: MouseEvent
    }
    interface ObjectPointerEvent extends PointerEvent {
        object: GameObject,
        point: vec3,
        normal: vec3
    }
    interface KeyboardEvent {
        altKey: boolean,
        ctrlKey: boolean,
        shiftKey: boolean,
        metaKey: boolean,
        key: string,
        location: number
    }
    interface WheelEvent {
        altKey: boolean,
        ctrlKey: boolean,
        shiftKey: boolean,
        metaKey: boolean,
        x: number,
        y: number,
        steps_x: number,
        steps_y: number,
        delta_x: number,
        delta_y: number
    }
}

export type Behavior = Behaviour;