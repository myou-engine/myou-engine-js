import { Myou } from "./myou";
import { TextureBase } from "./texture";
import { color4 } from "vmath";
import { Material } from "./material";
import { Framebuffer } from "./framebuffer";

/** Cubemap texture, currently only for rendering environment maps and probes,
 * not loaded from a file yet.
 *
 * See {@link Texture} for more information.
 * */
export class Cubemap implements TextureBase {
    context: Myou;
    readonly type: 'TEXTURE';
    readonly texture_type: 'cubemap'
    /** Size of each face of the cubemap */
    size: number;
    /** GL texture type (default: gl.UNSIGNED_BYTE) */
    gl_type: number;
    gl_target: number;
    gl_tex?: WebGLTexture;
    coefficients: Float32Array[];
    loaded: boolean;
    last_used_material?: Material;
    bound_unit: number;
    is_framebuffer_active: boolean;
    constructor(context: Myou, options?:{
        size: number,
        gl_type: number,
        gl_internal_format: number,
        gl_format: number,
        use_filter: boolean,
        use_mipmap: boolean,
        color: color4
    })

    instance(data?: ImageData|ImageBitmap[]): this;
    fill_color(color?: color4): void;
    bind(): void; 
    unbind(): never; // It seems like it's not implemented here.
    generate_mipmap(): this;

    /** Render all cubemap faces to a framebuffer with a size of at least
     * 3*size by 2*size.
     *
     * The format is six faces in a 3*2 mosaic like this:
     *
     *       | -X -Y -Z
     *       | +X +Y +Z
     *     0,0 --------
     *
     * You can see the OpenGL cube texture convention here:
     * http://stackoverflow.com/questions/11685608/convention-of-faces-in-opengl-cubemapping
     * @param fb [framebuffer] Destination framebuffer.
     * @param size [number] Size of each face.
     * @return [Cubemap] self
     * */
    render_to_framebuffer(fb: Framebuffer, size?: number): this;

    /** Gets the pixels of the six cube faces.
     * @param faces [Array<Uint8Array>] An array of six Uint8Array (enough to hold amount of pixels*4) to write into
     * */
    read_faces(faces: Uint8Array[], size?: number): void;

    /** Generate spherical harmonics for diffuse shading */
    generate_spherical_harmonics(size?: number): this;

    destroy(): void;
}