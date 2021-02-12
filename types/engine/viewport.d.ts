import { Screen } from "./screen";
import { Camera } from "./camera";
import { vec2, vec3 } from "vmath";
import { BaseEffect, BloomEffect } from "./effect";
import { DebugCamera } from "./debug_render";

export class Viewport {
    screen: Screen;
    camera: Camera;
    clear_bits: unknown;
    eye_shift: vec3;
    right_eye_factor: number;
    custom_fov?: number;
    debug_camera?: DebugCamera;
    units_to_pixels: number;
    requires_float_buffers: boolean;
    last_filter_should_blend: boolean;
    debug_camera_behaviour?: DebugCamera;
    constructor(screen: Screen,camera: Camera);

    /** Sets whether color and depth buffers will be cleared
    * before rendering.
    * @param color Whether to clear color with `scene.background_color`.
    * @param depth Whether to clear depth buffer.
    * */
    set_clear(color: boolean, depth: boolean): void;
    clone(options?:ViewportCloneOptions): Viewport;
    get_size_px(): vec2;
    destroy(): void;
    add_effect(effect: BaseEffect): BaseEffect;
    insert_effect(index: number, effect: BaseEffect): BaseEffect;
    replace_effect(before: BaseEffect, after: BaseEffect): BaseEffect;
    remove_effect(index_or_effect: number|BaseEffect): number;
    clear_effects(): this;
    BloomEffect: typeof BloomEffect;
    ensure_shared_effect(effect_class: NewableFunction, a?: BaseEffect|number, b?: number, c?: number, d?: number): BaseEffect;

    /** Splits the viewport into two, side by side, by converting this to
    * the left one, and returning the right one.
    * */
    split_left_right(options?: ViewportCloneOptions): Viewport;

    /** Splits the viewport into two, over/under, by converting this to
    * the top one, and returning the bottom one.
    * */
    split_top_bottom(options?: ViewportCloneOptions): Viewport;

    enable_debug_camera(): boolean;
    disable_debug_camera(): boolean;
    store_debug_camera(name: string): void;
    load_debug_camera(name: string): void;
    get_viewport_coordinates(x: number, y: number): {x: number, y: number};
}

declare type ViewportCloneOptions = {
    copy_effects: boolean,
    copy_behaviours: boolean
}