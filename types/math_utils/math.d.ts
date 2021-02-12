export function cubic_bezier(t: number, p0: number, p1: number, p2: number, p3: number): number;

export function wave(a: number, b: number, d: number, t: number): number;

export function ease_in_out(a: number, b: number, d: number, t: number): number;

/** Gives the previous power of two after X if X is not power of two already
* @param x input number 
* */
export function previous_POT(x: number): number;

/** Gives the next power of two after X if X is not power of two already
* @param x input number 
* */
export function next_POT(x: number): number;

/** Gives the nearest power of two after X if X is not power of two already
* @param x input number 
* */
export function nearest_POT(x: number): number;