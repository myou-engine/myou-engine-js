import { vec3 } from "vmath";
import { Myou } from "./myou";

export class Button {
    context: Myou;
    pressed: boolean;
    just_pressed: boolean;
    just_released: boolean;
    on_press?: () => void;
    on_release?: () => void;
    press(): void;
    release(): void;
    constructor(...ids:{
        source: InputSource,
        source_name: string,
        pad_index: number,
        label: string //??
    }[]);
    constructor(...sources:string[]);
}

export class Axis {
    constructor(minus: string, plus: string);
    context: Myou;
    value: number;
}

export class Axes2 {
    context: Myou;
    constructor(minus_x: string, plus_x: string, minus_y: string, plus_y: string);
    value: vec3;
    x_axis: Axis;
    y_axis: Axis;
}

export class InputManager {
    context: Myou;
    constructor();
    input_sources: Record<string,InputSource>
    input_sources_list: InputSource[]
    pending_reset: Button[]
    all_axis: Axis[];
    all_axes2: Axes2[];
    update_axes(): void;
    reset_buttons(): void;
    parse_id(id: number, flip_axis: boolean): {
        source: InputSource,
        source_name: string,
        pad_index: number,
        label: string
    };
}

export abstract class InputSource {
    context: Myou;
    constructor(context: Myou);
    register_source(aliases: string[]): void;
    add_button(button: Button, source_name: string, pad_index: number, label: string): void;
    add_semi_axis(axis: Axis, source_name: string, pad_index: number, label: string, multiplier: number): void;
    abstract has_button(label: string): boolean;
    abstract has_semi_axis(label: string): boolean;
    abstract suggest_button(label?: string): void;
    abstract suggest_semi_axis(label?: string): void;
    abstract update_controller(): void;
    opposite_axis(label: string): void;
    ensure_semi_axis(pad_index: number, label: string): {_value: number}
    ensure_all_existing_semi_axis(): void;
}

declare class KeyboardInputSource extends InputSource {
    context: Myou;
    constructor(context: Myou);
    has_button(label: string): boolean;
    has_semi_axis(label: string): false;
    suggest_button(label: string): string|null;
    suggest_semi_axis(label: string): string|null;
    update_controller(): void;
}

declare class GamepadInputSource extends InputSource {
    // TODO: Define a type specific to each button?
    button_mappings: Record<string, number>
    button_names: string[];
    context: Myou;
    constructor(context: Myou, id: number);
    add_button(button: Button, source_name: string, pad_index: number, label: string): void;
    has_button(label: string): boolean;
    has_semi_axis(label: string): boolean;
    suggest_button(label: string): string;
    suggest_semi_axis(label: string): string;
    opposite_axis(label: string): string;
    ensure_semi_axis(pad_index: number, label: string): {_value: number};
    update_controller(): void;
}