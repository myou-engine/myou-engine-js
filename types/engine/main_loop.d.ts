import { Myou } from "./myou";

export class MainLoop {
    constructor();
    frame_duration: number;
    /** Time from beginning of a tick to the next (including idle time) */
    last_frame_durations: Float32Array;
    /** Time it takes for running (logic) JS code */
    logic_durations: Float32Array;
    /** Time it takes for physics evaluations */
    physics_durations: Float32Array;
    /** Time it takes for evaluating animations and constraints */
    animation_durations: Float32Array;
    /** Time it takes for submitting GL commands */
    render_durations: Float32Array;

    timeout_time?: number;
    tasks_per_tick: number;
    last_time: number;
    enabled: boolean;
    stopped: boolean;
    use_raf: boolean;
    use_frame_callbacks: boolean;
    context: Myou;
    frame_number: number;
    req_tick?: number;
    update_fps: (frame_info:FrameInfo) => void;

    run(): void;
    stop(): void;
    sleep(time: number): void;
    add_frame_callback(callback: (frame_duration: number) => void): void;
    timeout(time: number): void;
    reset_timeout(): void;
    tick_once(): void;
    tick(): void;

}

export function set_immediate(func:Function): void;

export interface FrameInfo {
    max_fps: number,
    min_fps: number,
    average_fps: number,
    max_logic_duration: number,
    average_logic_duration: number,
    max_physics_durations: number,
    average_physics_durations: number,
    max_animation_durations: number,
    average_animation_durations: number,
    max_render_durations: number,
    average_render_durations: number
}