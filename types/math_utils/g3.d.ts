import { vec3, vec4 } from "vmath";

/** Calculates the instersection between three planes, in the same format as given
* by plane_from_norm_point.
*
* @param out Output vector
* @param a Plane
* @param b Plane
* @param c Plane
* @return Output vector
*/
export function planes_intersection(out: vec3, a: vec4, b: vec4, c: vec4): vec3;

/** Calculates a plane from a normal and a point in the plane.
 * Gives the plane equation in form Ax + By + Cy + D = 0,
 * where A,B,C,D is given as vec4 {x,y,z,w} respectively.
 *
 * @param out Output vector
 * @param n Is the normal of the plane (NOTE: must be normalized)
 * @param p Is a point of the plane
 * @return Output vector
 */
export function plane_from_norm_point(out: vec4, n: vec3, p: vec3): vec4;

export function rect_from_dir_point(out1: vec4, out2: vec4, d: vec3, p: vec3): void;

export function intersect_vector_plane(out: vec3, origin: vec3, vector: vec3, plane: vec4): vec3 | boolean;

export function v_dist_to_rect(out: vec3, p: vec3, rp: vec3, dir: vec3): vec3;

export function project_vector_to_plane(out: vec3, v: vec3, n: vec3): vec3;

export function reflect_vector(out: vec3, v: vec3, n: vec3): vec3;