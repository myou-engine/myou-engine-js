import { Myou } from "./myou";
import { GameObject } from "./gameobject";
import { Scene } from "./scene";
import { vec3 } from "vmath";

export interface Marker {
    name: string,
    frame: number
}

export class Action {
    constructor(name: string, channels: ActionChannel[], markers: Marker[]);
    name: string;
    channels: Record<string, ActionChannel>
    markers: Marker[];
    markers_by_name: Record<string, Marker>
    get(channel_path: string, time: number): number[];
}

export interface NLAStrip {
    type: string,
    extrapolation: "HOLD"|"HOLD_FORWARD"|"NOTHING",
    blend_type: "REPLACE"|"ADD"|"MULTIPLY"|"SUBTRACT",
    frame_start: number,
    frame_end: number,
    blend_in: number,
    blend_out: number,
    reversed: boolean,
    action: string,
    action_frame_start: number,
    action_frame_end: number,
    scale: number,
    repeat: boolean
    name: string,
}

export interface ActionChannel {
    type: string,
    name: string,
    property: string,
    keys: vec3,
    data_type: number
}

export abstract class Animation {
    constructor(objects: GameObject[], options?:{
        exclude?: GameObject[],
        start_marker: Marker,
        end_marker: Marker,
        strip_name: string,
        strip_name_filter?: RegExp
    })
    strips: NLAStrip[];
    objects: GameObject[];
    scene: Scene;
    context: Myou;
    pos: number;
    last_eval: number;
    speed: number;
    start_frame: number;
    end_frame: number;
    playing: boolean;

    has_strips(): boolean;
    debug_strip_filters(): void;
    play(): this;
    pause(): this;
    rewind(): this;
    stop(): this;
    set_frame(pos: number): this;
    abstract init(): void;
    step(frame_delta: number): void;
    apply(): this;
}

export class LoopedAnimation extends Animation {
    init(): void;
    step(frame_delta: number): void;
}

export class PingPongAnimation extends Animation {
    init(): void;
    step(frame_delta: number): void;
}

export class FiniteAnimation extends Animation {
    init(): void;
    step(frame_delta: number): void;
}

export function evaluate_all_animations(context: Myou, frame_duration_ms: number): void;