import { vec3, vec4, mat4 } from "vmath";
import { Myou } from "./myou";
import { Scene } from "./scene";
import { Framebuffer } from "./framebuffer";
import { Camera } from "./camera";
import { Texture } from "./texture";
import { Cubemap } from "./cubemap";
import { Material } from "./material";
import { Probe } from "./probe";

/** Render manager singleton. Performs all operations related to rendering to
* screen or to a buffer.
*
* Access it as `render_manager` member of the {@link Myou} instance.
* */
declare class RenderManager {
    temporary_framebuffers: Record<string, Framebuffer>
    render_tick: number;
    context_lost_count: number;
    camera_z: vec3;
    no_s3tc: boolean;
    compiled_shaders_this_frame: number;
    use_frustum_culling: boolean;
    show_debug_frustum_culling: boolean;
    use_sort_faces: boolean;
    use_sort_faces_opaque: boolean;
    unbind_textures_on_draw_viewport: boolean;
    probes: Probe[];
    clipping_plane: vec4;
    projection_matrix_inverse: mat4;
    triangles_drawn: number;
    meshes_drawn: number;
    breaking_on_any_gl_error: boolean;
    effect_ratio: number;
    gl: WebGLRenderingContext;

    constructor(context: Myou, canvas: HTMLCanvasElement, gl_flags: WebGLContextAttributes);
    recreate_gl_canvas(): void;
    set_canvas(new_canvas: HTMLCanvasElement): void;
    instance_gl_context(gl_flags: WebGLContextAttributes, options?:{
        reinstance_all?: boolean,
        clear?: boolean,
        recreate_canvas?: boolean,
        restore?: boolean
    }): void
    request_fullscreen(): void;

    /** Binds a texture or cubemap to an unused GL texture slot
    * @param texture Texture or Cubemap
    * @return Active texture unit number
    */
    bind_texture(texture: Texture | Cubemap, avoid_material?: Material): number;

    unbind_texture(texture: Texture | Cubemap): void;
    unbind_all_textres(): void;

    draw_all(): void;
    ensure_render_framebuffer(): void;

    draw_cubemap(scene: Scene, cubemap: Cubemap, position: vec3, near: unknown, far: unknown, background_only: boolean): void;

    screenshot_as_blob(width: number, height: number, options?:{
        supersampling?: number,
        camera?: Camera,
        format?: string,
        jpeg_quality?: number
    }): Promise<Blob>

    render_and_read_screen_pixels(x: number, y: number, width: number, height: number, pixels: ArrayBufferView): void;
    debug_uniform_logging(): void;
    debug_uniform_logging_get_log(): string;
    debug_uniform_logging_break(number: number): void;
    debug_uniform_type(): void;
    debug_uniform_nan(): void;
    debug_break_on_any_gl_error(): void;
    debug_mesh_render_time(): void;
    polycount_debug(ratio?: number): void;
    restore_polycount_debug(): void;
}

declare const VECTOR_MINUS_Z: vec3;