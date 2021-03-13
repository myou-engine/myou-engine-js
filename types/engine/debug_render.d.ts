import { vec3, color4 } from "vmath";

import { Behaviour } from "./behaviour";
import { Camera } from "./camera";
import { GameObject } from "./gameobject";
import { Scene } from "./scene";

export class DebugCamera extends Behaviour {
    debug_camera: Camera;
    pivot: GameObject;
    active: boolean;
    rotating: boolean;
    panning: boolean;
    distance: number;
    pan_distance: number;
    debug: DebugDraw;
    pivot_vis: DebugShape.Point;
    
    on_tick: () => void;
    on_pointer_down: (event: Behaviour.PointerEvent) => void;
    on_pointer_move: (event: Behaviour.PointerEvent) => void;
    on_pointer_up: (event: Behaviour.PointerEvent) => void;
    on_wheel: (event: Behaviour.WheelEvent) => void;
    activate(): void;
    deactivate(): void;
    on_key_down: (event: Behaviour.KeyboardEvent) => void;
}

 /** This object allows you to create and draw wireframe shapes for debugging,
 * as well as automatically drawing invisible objects and physic bodies
 * (of all shape types).
 * You can access this object from `scene.get_debug_draw()` and a new instance
 * will be created for that scene if it doesn't exist already.
 * */
export class DebugDraw {
    draw_physics: boolean;
    draw_invisibles: boolean;
    hidden_alpha: number;
    constructor(scene: Scene, options?: {
        draw_physics?: boolean,
        draw_invisibles?: boolean,
        hidden_alpha?: number
    })

    Vector: typeof DebugShape.Vector;
    Line: typeof DebugShape.Line;
    Point: typeof DebugShape.Point;
    Plane: typeof DebugShape.Plane;
}

export class DebugShape {
    constructor(debug_draw: DebugDraw);
    destroy(): void;
}

export namespace DebugShape {
    class Vector extends DebugShape {
        vector: vec3;
        position: vec3;
        color: color4;
        ttl_frames: number;
        constructor(options?:{
            vector?: vec3,
            position?: vec3,
            color?: color4,
            ttl_frames?: number
        })
    }
    class Line extends DebugShape {
        positions: vec3[];
        color: color4;
        segment_count: number;
        segment_ratio: number;
        ttl_frames: number;
        use_wide: boolean
        constructor(options?: {
            positions?: vec3[],
            color?: color4,
            segment_count?: number,
            segment_ratio?: number,
            ttl_frames?: number,
            use_wide?: boolean
        })
    }
    class Point extends DebugShape {
        position: vec3;
        color: color4;
        size: number;
        ttl_frames: number;
        constructor(options?: {
            position?: vec3;
            color?: color4;
            size?: number;
            ttl_frames?: number;
        })
    }
    class Plane extends DebugShape {
        position: vec3;
        normal: vec3;
        color_front: color4;
        color_back: color4;
        cell_size: number;
        divisions: number;
        ttl_frames: number;
        constructor(options?: {
            position?: vec3;
            normal?: vec3;
            color_front?: color4;
            color_back?: color4;
            cell_size?: number;
            divisions?: number;
            ttl_frames?: number;
        })
    }
}