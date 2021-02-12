import { Myou } from "./myou";
import { Material, Uniform, InputValue } from "./material";
import { Framebuffer } from "./framebuffer";
import { vec2, vec4 } from "vmath";

export class BaseFilter {
    context: Myou
    name: string
    fragment: string
    uniforms: Uniform[]
    material?: Material
    use_derivatives: boolean
    use_depth: boolean
    library: string[]
    defines: Record<string,unknown>

    constructor(context: Myou, name: string);
    get_material(): Material;
    add_depth(): void;
    set_input(name: string,value: InputValue): void;
    apply(source: Framebuffer, destination: Framebuffer, rect:number[], inputs: Material["inputs"]): void;
    set_debugger(dbg: unknown): void;
}

export class CopyFilter extends BaseFilter {
    constructor(context: Myou)
}
export class FlipFilter extends BaseFilter {
    constructor(context: Myou)
}
export class BoxBlurFilter extends BaseFilter {
    constructor(context: Myou)
}
export class Block2x2BlurFilter extends BaseFilter {
    constructor(context: Myou, options?:{
        use_depth_as_alpha?: boolean
    })
}
export class MipmapBiasFilter extends BaseFilter {
    bias: number;
    constructor(context: Myou, bias: number);
}
export class DirectionalBlurFilter extends BaseFilter {
    constructor(context: Myou, options?:{
        use_vec4?: boolean,
        use_depth_as_alpha?: boolean
    });
    vector: vec2;
}
export class ExprFilter extends BaseFilter {
    num_inputs: number;
    expression: string;
    constructor(context: Myou, num_inputs?: number, expression?: string, options?: {
        use_vec4?: boolean,
        use_depth?: boolean,
        functions?: string,
        debug_vector?: vec4,
        use_derivatives: boolean
    })

    set_buffers(...buffers:Framebuffer[]): void;
}
export class FunctionFilter extends ExprFilter {
    constructor(context: Myou, function_?: string, options?:{});
}