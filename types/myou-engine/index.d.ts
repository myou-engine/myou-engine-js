// Type definitions for myou-engine
// Project: https://github.com/myou-engine/myou-engine
// Definitions by: Mario Martínez <https://github.com/YonicDev>

import * as g2 from "./math_utils/g2";
import * as g3 from "./math_utils/g3";
import * as math from "./math_utils/math";
import * as vmath from "./math_utils/vmath";
import { Behaviour, Behavior } from "./engine/behaviour";
import { Myou, create_canvas, create_full_window_canvas } from "./engine/myou";

declare const gmath: {
    g2: typeof g2,
    g3: typeof g3
}

export { Myou, Behaviour, Behavior, create_canvas, create_full_window_canvas, vmath, gmath, math }