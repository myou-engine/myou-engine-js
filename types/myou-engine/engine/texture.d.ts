import { Scene } from "./scene"
import { Material } from "./material"
import { Myou } from "./myou";

export interface TextureBase {
    type: "TEXTURE",
    gl_tex?: WebGLTexture;
    gl_target?: number,
    loaded: boolean,
    bound_unit: number,
    is_framebuffer_active: boolean,
    bind(): this,
    unbind(): this
}

/** Main texture class (see also {Cubemap}). It allows creating and managing
 * texture images and videos in many formats and multiple sizes.
 *
 * The `formats` option is an object with the following format:
 * - Each key is the format name in lower case:
 *   png, jpeg, rgb565, dxt1, dxt5, etc1, pvrtc, atc, crunch, etc
 * - The value is a list of objects, ordered from low quality
 *   to high quality, with these fields:
 *   {width, height, file_size, file_name, data_uri, pixels}
 * - `file_name` is the file name relative to data_dir/textures/
 * - `data_uri` is a "data:" URI containing the whole image
 * - `pixels` is an array or typed array with the pixels in byte RGBA format.
 * - `file_name`, `data_uri` or `pixels` must be present, but not more than one.
 *
 * Example:
 * ```
 *     {
 *         png: [
 *             {width: 16, height: 16, file_name: 'foo-16x16.png'},
 *             {width: 256, height: 256, file_name: 'foo.png'},
 *         ]
 *         raw_pixels: [
 *             // raw RGBA pixels
 *             {width: 256, height: 256, pixels: [0,0,0,0, ...]},
 *         ]
 *     }
 * ```
 * @param scene [Scene]
 * @option options [String] name
 * @option options [Object] formats See above.
 * @option options [String]
 *   wrap One of 'C', 'R' or 'M', for Clamp, Repeat or Mirrored, respectively.
 * @option options [Boolean] filter Whether to enable bilinear filtering
 * @option options [Boolean]
 *   use_mipmap Whether to enable mipmapping. If the loaded format doesn't have
 *   mipmaps, they will be generated.
 * */
export class Texture implements TextureBase {
    type: "TEXTURE";
    context: Myou;
    scene: Scene;
    constructor(scene: Scene, options:{
        name: string,
        formats: {
            [format in TextureFormat]: {
                width: number;
                height: number;
                file_size: number;
                file_name: string;
                data_uri: string;
                pixels: Uint8Array;
            }[];
        },
        wrap: 'C'|'R'|'M',
        filter: boolean,
        use_mipmap: boolean
    })
    filter: boolean;
    use_mipmap: boolean;
    use_alpha: boolean;
    wrap: 'C'|'R'|'M';
    gl_target: number;
    gl_tex?: WebGLTexture;
    bound_unit: number;
    last_used_material?: Material;
    loaded: boolean;
    is_framebuffer_active: boolean;
    promise: Promise<this>;
    promised_data: TextureFormatOptions; //??
    promised_ratio: number; //??
    users: Material[];
    texture_type: TextureType;
    width: number;
    height: number;
    image?: HTMLImageElement;
    video?: HTMLVideoElement;
    gl_format: number;
    gl_internal_format: number;
    gl_type: number;
    arrays: Uint8Array[];

    /** Loads a texture if it's not loaded already.
     *
     * `size_ratio` is a number between 0 and 1 to chooses which
     * texture resolution will be loaded. For example an image of one
     * megapixel, with a size_ratio of 0.1 will try to load the version
     * closest to 100k pixels.
     *
     * @option options [number] size_ratio See above.
     * @return [Promise]
     * */
    load(options?:{
        size_ratio: number,
        force?: boolean,
        load_videos?: boolean
    }):Promise<this>

    bind(): this;
    unbind(): this;
    unload(): void;
    destroy(): void;

    /** Tells if both dimensions of the image are power of two.
     * @return [Boolean]
     * */
    is_power_of_two(): boolean;
}

declare type TextureType = "image"|"video"|"arrays"|"compressed"|""
declare type TextureFormat = "png"| "jpeg"| "rgb565"| "dxt1"| "dxt5"| "etc1"| "pvrtc"| "astc"| "crunch"| "etc"|"raw_pixels"|"atc"|"mp4"|"m4v"|"ogv"|"ogg"|"webm"|"mov"|"flv"
declare interface TextureFormatOptions {
    width: number;
    height: number;
    file_size: number;
    file_name: string;
    data_uri: string;
    pixels: Uint8Array | Uint16Array | Uint32Array;
}