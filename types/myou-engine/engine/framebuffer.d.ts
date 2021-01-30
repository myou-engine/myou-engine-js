import { Myou } from "./myou";
import { Viewport } from "./viewport";

/** Framebuffer class. Use it for off-screen rendering, by creating a {Viewport}
* with a framebuffer as `dest_buffer`.
* Also used internally for cubemaps, filters, post-processing effects, etc.
* */
export class Framebuffer {
    constructor(options:FramebufferOptions);
    context: Myou;
    size_x: number;
    size_y: number;
    color_type: BufferComponentType;
    use_mipmap: boolean;
    use_filter: boolean;
    options: FramebufferOptions;
    filters_should_blend: boolean;
    texture: Texture | FbTexture;
    tex_type: number;
    is_complete: boolean;
    has_mipmap: boolean;
    last_viewport: Viewport;
    init(context: Myou, options?:FramebufferOptions): void;
    /** Sets the framebuffer as the active one for further rendering operations.
    * Lower left corner is (0,0)
    * @param rect [Array<number>]
    *       Viewport rect in pixels: X position, Y position, width, height.
    */
    enable(rect?: number[]): this;
    clear(): void;
    disable(): void;
    draw_with_filter(filter: unknown, inputs?: Record<string,any>): void;
    blit_to(dest: Framebuffer, src_rect: number[], dst_rect: number[], options?:{ components?: string[], use_filter?: boolean }): void;
    bind_to_cubemap_side(cubemap: Cubemap, side: string): void; //??
    unbind_cubemap(cubemap: Cubemap): void;
    get_framebuffer_status(): "COMPLETE" | "INCOMPLETE_ATTACHMENT" | "INCOMPLETE_DIMENSIONS" | "INCOMPLETE_MISSING_ATTACHMENT";
    generate_mipmap(): void;
    destroy(remove_from_context: boolean): void;
}

export class ByteFramebuffer extends Framebuffer {}
export class ShortFramebuffer extends Framebuffer {}
export class FloatFramebuffer extends Framebuffer {}

/** Screen framebuffer target. Usually instanced as `render_manager.main_fb`. */ 
export class MainFramebuffer extends Framebuffer {
    init(context: Myou): void;
}

declare interface FramebufferOptions {
    size: number[],
    use_depth?: boolean,
    color_type?: BufferComponentType,
    use_mipmap?: boolean,
    use_filter?: boolean
}

declare class FbTexture {
    type: "TEXTURE";
    gl_tex: WebGLTexture;
    gl_target: unknown;
    loaded: boolean;
    bound_unit: number;
    is_framebuffer_active: boolean;
    set(gl_tex: WebGLTexture, gl_target: unknown): void;
    load(): void;
}

declare type BufferComponentType = "BYTE" | "UNSIGNED_BYTE" | "SHORT" | "UNSIGNED_SHORT" | "INT" | "UNSIGNED_INT" | "FLOAT" | "HALF_FLOAT"