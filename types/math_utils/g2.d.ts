import { vec3 } from "vmath";

export function rect_from_points(out: vec3, a: vec3, b: vec3): vec3

export function rects_intersection(out: vec3, ra: vec3, rb: vec3): vec3

export function segments_intersection(out: vec3, sa: vec3[], sb: vec3[]): vec3 | boolean