import { color4 } from "vmath";
import { Myou } from "./myou";
import { GameObject } from "./gameobject";
import { Marker } from "./animation";
import { Camera } from "./camera";
import { Lamp } from "./lamp";
import { World } from "./physics";
import { Material } from "./material";
import { Texture } from "./texture";
import { Probe, ProbeData } from "./probe";
import { Armature } from "./armature"
import { Mesh } from "./mesh";
import { DebugDraw } from "./debug_render";

export class Scene {
    type: "SCENE";
    context: Myou;
    enabled: boolean;
    children: GameObject[];
    mesh_passes: Array<Mesh[]>;
    bg_pass: Mesh[];
    fg_pass: Mesh[];
    lamps: Lamp[];
    armatures: Armature[];
    objects: Record<string, GameObject>;
    parents: Record<string, GameObject>;
    materials: Record<string, Material>;
    textures: Record<string, Texture>;
    active_camera: Camera;
    physics_enabled: boolean;
    world: World;
    background_color: color4;
    ambient_color: color4;
    bsdf_samples: number;
    lod_bias: number;
    world_material: Material;
    background_probe: Probe;
    background_probe_data: ProbeData;
    probes: Probe[];
    last_shadow_render_tick: number;
    last_update_matrices_tick: number;
    pre_draw_callbacks: Array<(scene: Scene, frame_duration: number) => void>
    post_draw_callbacks: Array<(scene: Scene, frame_duration: number) => void>
    frame_start: number;
    frame_end: number;
    anim_fps: number;
    markers: Marker[];
    markers_by_name: Record<string, Marker>;
    extra_data: unknown; //TODO: What is this?
    data_dir: string;
    original_scene_name: string;
    foreground_planes: Mesh[]; //??
    shader_libary: string;
    groups: Record<string, GameObject[]>;
    global_vars: Record<string, any>;
    constructor(name: string, options?:{add_to_loaded_scenes?:boolean});

    add_object(ob: GameObject, name?: string, parent_name?: string, parent_bone?: string): void;
    remove_object(ob: GameObject, recursive?: boolean): void;
    make_parent(parent: GameObject, child: GameObject, options?:{keep_transform: boolean}): void;
    clear_parent(child: GameObject, options?:{keep_transform: boolean}): void;
    reorder_children(): void;
    update_all_matrices(): void;
    set_objects_auto_update_matrix(objects: GameObject[], auto_update: boolean): void;
    destroy(): void;

    /**Loads data required to use the scene. The things that can be loaded are:
    *
    * * visible: Loads visible meshes and the textures of their materials.
    * * physics: Loads the physics engine and meshes used for physics.
    *
    * @param items... [Array<String>] List of elements to load. Each one must be
    * one of: 'visible', 'physics', 'all'
    */
    load(...items:SceneData[]): Promise<Scene>;

    /** Loads a list of objects, returns a promise
    * @param list [array] List of objects to load.
    * @option options [boolean] fetch_textures
    *       Whether to fetch textures when they're not loaded already.
    * @option options [number] texture_size_ratio
    *       Quality of textures specified in ratio of number of pixels.
    # @option options [number] max_mesh_lod
    *       Quality of meshes specified in LoD polycount ratio.
    * @return [Promise]
    * */
    load_objects(list: GameObject[], options?:{
        fetch_textures?: boolean,
        texture_size_ratio?: number,
        max_mesh_lod?: number
    }): Promise<Scene>

    unload_invisible_objects(options?:{unload_textures: boolean}): void;
    unload_objects(list: GameObject[], options?:{unload_textures: boolean}): void;
    unload_all(): void;

    merge_scene(other_scene: Scene, options?:object): void;
    extend(name: string, options?:{
        data_dir?: string,
        original_scene_name?: string,
        skip_if_already_exists?: boolean
    }): Promise<Scene>
    add_object_to_group(ob: Object, group_name: string): void;

    /** Enables features of the scene. The things that can be enabled are:
    *
    * * render: Enables rendering of visual elements (meshes, background, etc).
    * * physics: Enables physics movement. Note that some features of physics
    * can still be used without this (e.g. ray test).
    *
    * @param items... [Array<String>] List of features to enable.
    *       Each one must be one of: 'render', 'physics', 'all'
    * */
    enable(...items:SceneFeature[]): void;

    disable(...items:SceneFeature[]): void;

    /** Sets the active camera of the scene, adds it if necessary, and if there's
     * no screen it creates a screen and a viewport filling the screen.
     * @param camera [Camera] The camera object 
     * */
    set_active_camera(camera: Camera): void;
    instance_probe(): Probe;
    set_samples(bsdf_samples: number): void;

    /** Returns a DebugDraw instance for this scene, creating it if necessary.
    * @return [DebugDraw]
    * */
    get_debug_draw(options:{
        draw_physics: boolean,
        draw_invisibles: boolean,
        hidden_alpha: boolean
    }): DebugDraw;
    
    /** Returns whether it has a DebugDraw instance
    * @return [boolean]
    * */
    has_debug_draw(): boolean;

    remove_debug_draw(): void;
}
    
declare type SceneData = "visible"|"physics"|"all";
declare type SceneFeature = "render"|"physics"|"all";