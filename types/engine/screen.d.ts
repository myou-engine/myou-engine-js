import { Myou } from "./myou";
import { Camera } from "./camera";
import { Viewport } from "./viewport";
import { Framebuffer, MainFramebuffer } from "./framebuffer";

export class Screen {
    constructor(context: Myou, ...args:any[]);
    viewports: Viewport[];
    framebuffer: Framebuffer;
    width: number;
    height: number;
    diagonal: number;
    pixel_ratio_x: number;
    pixel_ratio_y: number;
    enabled: boolean;
    init(context: Myou, ...args:any[]): void;
    add_viewport(camera: Camera): Viewport;
    resize(width?: number, height?: number, pixel_ratio_x?: number, pixel_ratio_y?: number): void;

    /** Change the aspect ratio of viewports. Useful for very quick changes
    * of the size of the canvas or framebuffer, such as with a CSS animation.
    * Much cheaper than a regular resize, because it doesn't change the
    * resolution.
    * */
   resize_soft(width: number, height: number): void;

   pre_draw: () => void;

   post_draw: () => void;

   get_viewport_coordinates(x: number, y: number): {x: number, y: number, viewport: Viewport};
}

export class CanvasScreen extends Screen {
    init(context: Myou): void;
    auto_resize_to_canvas: boolean;
    canvas: HTMLCanvasElement;
    framebuffer: MainFramebuffer;
    resize_to_canvas(ratio_x?: number, ratio_y?: number): void;
    resize(width: number, height: number, pixel_ratio_x?: number, pixel_ratio_y?: number): void;
}