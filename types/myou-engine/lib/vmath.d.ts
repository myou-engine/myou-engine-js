declare module "vmath" {

    const EPSILON: number;

    /**
     * Tests whether or not the arguments have approximately the same value, within an absolute
     * or relative tolerance of glMatrix.EPSILON (an absolute tolerance is used for values less
     * than or equal to 1.0, and a relative tolerance is used for larger values)
     *
     * @param a The first number to test.
     * @param b The second number to test.
     * @returns True if the numbers are approximately equal, false otherwise.
     */
    function equals(a: number, b: number): boolean;

    /**
     * Tests whether or not the arguments have approximately the same value by given maxDiff
     *
     * @param a The first number to test.
     * @param b The second number to test.
     * @param maxDiff Maximum difference.
     * @returns True if the numbers are approximately equal, false otherwise.
     */
    function approx(a: number, b: number, maxDiff?: number): boolean;

    /**
     * Clamps a value between a minimum float and maximum float value.
     *
     * @method clamp
     * @param val Value to be clamped
     * @param min Minimum value
     * @param max Maximum value
     * @return Clamped value
     */
    function clamp(val: number, min: number, max: number): number;

    /**
     * Clamps a value between 0 and 1.
     *
     * @method clamp01
     * @param val Value to be clamped
     * @return
     */
    function clamp01(val: number): number;

    /**
     * @method lerp
     * @param from
     * @param to
     * @param ratio The interpolation coefficient
     * @return
     */
    function lerp(from: number, to: number, ratio: number): number;

    /**
    * Convert Degree To Radian
    *
    * @param a Angle in Degrees
    */
    function toRadian(a: number): number;

    /**
    * Convert Radian To Degree
    *
    * @param a Angle in Radian
    */
   function toDegree(a: number): number;

   /**
    * @method random
    */
   function random(): number;

   /**
     * Returns a floating-point random number between min (inclusive) and max (exclusive).
     *
     * @method randomRange
     * @param min
     * @param max
     * @return the random number
     */
   function randomRange(min: number, max: number): number;

   /**
     * Returns a random integer between min (inclusive) and max (exclusive).
     *
     * @method randomRangeInt
     * @param {number} min
     * @param {number} max
     * @return {number} the random integer
     */
    function randomRangeInt(min: number, max: number): number

    /**
     * Returns the next power of two for the value
     *
     * @method nextPow2
     * @param val
     * @return the the next power of two
     */
    function nextPow2(val: number): number

    /**
     * @class 2 Dimensional Vector
     * @name vec2
     */
    class vec2 {
        x: number;
        y: number;
        constructor(x: number, y: number);
        toJSON():number[];

        /**
         * Creates a new, empty vec2
         *
         * @returns {vec2} a new 2D vector
         */
        static create(): vec2;

        /**
         * Creates a new vec2 initialized with the given values
         *
         * @param {Number} x X component
         * @param {Number} y Y component
         * @returns {vec2} a new 2D vector
         */
        static new(x: number, y: number): vec2;

        /**
         * Creates a new vec2 initialized with values from an existing vector
         *
         * @param {vec2} a vector to clone
         * @returns {vec2} a new 2D vector
         */
        static clone(a: vec2): vec2;

        /**
         * Copy the values from one vec2 to another
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a the source vector
         * @returns {vec2} out
         */
        static copy(out: vec2, a: vec2): vec2;

        /**
         * Set the components of a vec2 to the given values
         *
         * @param {vec2} out the receiving vector
         * @param {Number} x X component
         * @param {Number} y Y component
         * @returns {vec2} out
         */
        static set(out: vec2, x: number, y: number): vec2;

        /**
         * Adds two vec2's
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a the first operand
         * @param {vec2} b the second operand
         * @returns {vec2} out
         */
        static add(out: vec2, a: vec2, b: vec2): vec2;

        /**
         * Subtracts vector b from vector a
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a the first operand
         * @param {vec2} b the second operand
         * @returns {vec2} out
         */
        static subtract(out: vec2, a: vec2, b: vec2): vec2;

        /**
         * Alias for {@link vec2.subtract}
         * @function
         */
        static sub(out: vec2, a: vec2, b: vec2): vec2;

        /**
         * Multiplies two vec2's
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a the first operand
         * @param {vec2} b the second operand
         * @returns {vec2} out
         */
        static multiply(out: vec2, a: vec2, b: vec2): vec2;

        /**
         * Alias for {@link vec2.multiply}
         * @function
         */
        static mul(out: vec2, a: vec2, b: vec2): vec2;

        /**
         * Divides two vec2's
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a the first operand
         * @param {vec2} b the second operand
         * @returns {vec2} out
         */
        static divide(out: vec2, a: vec2, b: vec2): vec2;

        /**
         * Alias for {@link vec2.divide}
         * @function
         */
        static div(out: vec2, a: vec2, b: vec2): vec2;

        /**
         * Math.ceil the components of a vec2
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a vector to ceil
         * @returns {vec2} out
         */
        static ceil(out: vec2, a: vec2): vec2;

        /**
         * Math.floor the components of a vec2
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a vector to floor
         * @returns {vec2} out
         */
        static floor(out: vec2, a: vec2): vec2;

        /**
         * Returns the minimum of two vec2's
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a the first operand
         * @param {vec2} b the second operand
         * @returns {vec2} out
         */
        static min(out: vec2, a: vec2, b: vec2): vec2;

        /**
         * Returns the maximum of two vec2's
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a the first operand
         * @param {vec2} b the second operand
         * @returns {vec2} out
         */
        static max(out: vec2, a: vec2, b: vec2): vec2;

        /**
         * Math.round the components of a vec2
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a vector to round
         * @returns {vec2} out
         */
        static round(out: vec2, a: vec2): vec2;

        /**
         * Scales a vec2 by a scalar number
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a the vector to scale
         * @param {Number} b amount to scale the vector by
         * @returns {vec2} out
         */
        static scale(out: vec2, a: vec2, b: number): vec2;

        /**
         * Adds two vec2's after scaling the second operand by a scalar value
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a the first operand
         * @param {vec2} b the second operand
         * @param {Number} scale the amount to scale b by before adding
         * @returns {vec2} out
         */
        static scaleAndAdd(out: vec2, a: vec2, b: vec2, scale: number): vec2;

        /**
         * Calculates the euclidian distance between two vec2's
         *
         * @param {vec2} a the first operand
         * @param {vec2} b the second operand
         * @returns {Number} distance between a and b
         */
        static distance(a: vec2, b: vec2): number;

        /**
         * Alias for {@link vec2.distance}
         * @function
         */
        static dist(a: vec2, b: vec2): number;

        /**
         * Calculates the squared euclidian distance between two vec2's
         *
         * @param {vec2} a the first operand
         * @param {vec2} b the second operand
         * @returns {Number} squared distance between a and b
         */
        static squaredDistance(a: vec2, b: vec2): number;

        /**
         * Alias for {@link vec2.squaredDistance}
         * @function
         */
        static sqrDist(a: vec2, b: vec2): number;

        /**
         * Calculates the length of a vec2
         *
         * @param {vec2} a vector to calculate length of
         * @returns {Number} length of a
         */
        static length(a: vec2): number;

        /**
         * Alias for {@link vec2.length}
         * @function
         */
        static len(a: vec2): number;

        /**
         * Calculates the squared length of a vec2
         *
         * @param {vec2} a vector to calculate squared length of
         * @returns {Number} squared length of a
         */
        static squaredLength(a: vec2): number;

        /**
         * Alias for {@link vec2.squaredLength}
         * @function
         */
        static sqrLen(a: vec2): number;

        /**
         * Negates the components of a vec2
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a vector to negate
         * @returns {vec2} out
         */
        static negate(out: vec2, a: vec2): vec2;

        /**
         * Returns the inverse of the components of a vec2
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a vector to invert
         * @returns {vec2} out
         */
        static inverse(out: vec2, a: vec2): vec2;

        /**
         * Returns the inverse of the components of a vec2 safely
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a vector to invert
         * @returns {vec2} out
         */
        static inverseSafe(out: vec2, a: vec2): vec2;

        /**
         * Normalize a vec2
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a vector to normalize
         * @returns {vec2} out
         */
        static normalize(out: vec2, a:vec2): vec2;

        /**
         * Calculates the dot product of two vec2's
         *
         * @param {vec2} a the first operand
         * @param {vec2} b the second operand
         * @returns {Number} dot product of a and b
         */
        static dot(a: vec2, b: vec2): vec2;

        /**
         * Computes the cross product of two vec2's
         * Note that the cross product must by definition produce a 3D vector
         *
         * @param {vec3} out the receiving vector
         * @param {vec2} a the first operand
         * @param {vec2} b the second operand
         * @returns {vec3} out
         */
        static cross(out: vec3, a: vec2, b: vec2): vec3;

        /**
         * Performs a linear interpolation between two vec2's
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a the first operand
         * @param {vec2} b the second operand
         * @param {Number} t interpolation amount between the two inputs
         * @returns {vec2} out
         */
        static lerp(out: vec2, a: vec2, b: vec2, t: number): vec2;

        /**
         * Generates a random vector with the given scale
         *
         * @param {vec2} out the receiving vector
         * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
         * @returns {vec2} out
         */
        static random(out: vec2, scale?: number): vec2;

        /**
         * Transforms the vec2 with a mat2
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a the vector to transform
         * @param {mat2} m matrix to transform with
         * @returns {vec2} out
         */
        static transformMat2(out: vec2, a: vec2, m: mat2): vec2;

        /**
         * Transforms the vec2 with a mat23
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a the vector to transform
         * @param {mat23} m matrix to transform with
         * @returns {vec2} out
         */
        static transformMat23(out: vec2, a: vec2, m: mat23): vec2;

        /**
         * Transforms the vec2 with a mat3
         * 3rd vector component is implicitly '1'
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a the vector to transform
         * @param {mat3} m matrix to transform with
         * @returns {vec2} out
         */
        static transformMat3(out: vec2, a: vec2, m: mat3): vec2;

        /**
         * Transforms the vec2 with a mat4
         * 3rd vector component is implicitly '0'
         * 4th vector component is implicitly '1'
         *
         * @param {vec2} out the receiving vector
         * @param {vec2} a the vector to transform
         * @param {mat4} m matrix to transform with
         * @returns {vec2} out
         */
        static transformMat4(out: vec2, a: vec2, m: mat4): vec2;

        /**
         * Perform some operation over an array of vec2s.
         *
         * @param {Array} a the array of vectors to iterate over
         * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
         * @param {Number} offset Number of elements to skip at the beginning of the array
         * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
         * @param {Function} fn Function to call for each vector in the array
         * @param {Object} [arg] additional argument to pass to fn
         * @returns {Array} a
         * @function
         */
        static forEach (a: vec2[], stride: number, offset: number, count: number, fn:Function, arg?: any): vec2[];

        /**
         * Returns a string representation of a vector
         *
         * @param {vec2} a vector to represent as a string
         * @returns {String} string representation of the vector
         */
        static str(a: vec2): string;

        /**
         * Returns typed array
         *
         * @param {array} out
         * @param {vec2} v
         * @returns {array}
         */
        static array(out: number[], v: vec2): number[];

        /**
         * Returns whether or not the vectors exactly have the same elements in the same position (when compared with ===)
         *
         * @param {vec2} a The first vector.
         * @param {vec2} b The second vector.
         * @returns {Boolean} True if the vectors are equal, false otherwise.
         */
        static exactEquals(a: vec2, b: vec2): boolean;

        /**
         * Returns whether or not the vectors have approximately the same elements in the same position.
         *
         * @param {vec2} a The first vector.
         * @param {vec2} b The second vector.
         * @returns {Boolean} True if the vectors are equal, false otherwise.
         */
        static equals(a: vec2, b: vec2): boolean;
    }

    /**
     * @class 3 Dimensional Vector
     * @name vec3
     */
    class vec3 {
        x: number;
        y: number;
        z: number;

        constructor(x: number, y: number, z: number);

        toJSON(): number[];

        /**
         * Creates a new, empty vec3
         *
         * @returns a new 3D vector
         */
        static create(): vec3;

        /**
         * Creates a new vec3 initialized with the given values
         *
         * @param x X component
         * @param y Y component
         * @param z Z component
         * @returns a new 3D vector
         */
        static new(x:number ,y:number ,z:number ): vec3;

        /**
         * Creates a new vec3 initialized with values from an existing vector
         *
         * @param a vector to clone
         * @returns a new 3D vector
         */
        static clone(a: vec3): vec3;

        /**
         * Copy the values from one vec3 to another
         *
         * @param out the receiving vector
         * @param a the source vector
         * @returns out
         */
        static copy(out: vec3, a: vec3): vec3;

        /**
         * Set the components of a vec3 to the given values
         *
         * @param out the receiving vector
         * @param x X component
         * @param y Y component
         * @param z Z component
         * @returns out
         */
        static set(out: vec3, x: number, y: number, z: number): vec3;

        /**
         * Adds two vec3's
         *
         * @param out the receiving vector
         * @param a the first operand
         * @param b the second operand
         * @returns out
         */
        static add(out: vec3, a: vec3, b: vec3): vec3;

        /**
         * Subtracts vector b from vector a
         *
         * @param out the receiving vector
         * @param a the first operand
         * @param b the second operand
         * @returns out
         */
        static subtract(out: vec3, a: vec3, b:vec3): vec3;

        /**
         * Alias for {@link vec3.subtract}
         * @function
         */
        static sub(out: vec3, a: vec3, b:vec3): vec3;

        /**
         * Multiplies two vec3's
         *
         * @param out the receiving vector
         * @param a the first operand
         * @param b the second operand
         * @returns out
         */
        static multiply(out: vec3, a: vec3, b:vec3): vec3;

        /**
         * Alias for {@link vec3.multiply}
         * @function
         */
        static mul(out: vec3, a: vec3, b:vec3): vec3;

        /**
         * Divides two vec3's
         *
         * @param out the receiving vector
         * @param a the first operand
         * @param b the second operand
         * @returns out
         */
        static divide(out: vec3, a: vec3, b:vec3): vec3;

        /**
         * Alias for {@link vec3.divide}
         * @function
         */
        static div(out: vec3, a: vec3, b:vec3): vec3;

        /**
         * Math.ceil the components of a vec3
         *
         * @param out the receiving vector
         * @param a vector to ceil
         * @returns out
         */
        static ceil(out: vec3, a: vec3): vec3;

        /**
         * Math.floor the components of a vec3
         *
         * @param out the receiving vector
         * @param a vector to floor
         * @returns out
         */
        static floor(out: vec3, a: vec3): vec3;

        /**
         * Returns the minimum of two vec3's
         *
         * @param out the receiving vector
         * @param a the first operand
         * @param b the second operand
         * @returns out
         */
        static min(out: vec3, a: vec3, b: vec3): vec3;

        /**
         * Returns the maximum of two vec3's
         *
         * @param out the receiving vector
         * @param a the first operand
         * @param b the second operand
         * @returns out
         */
        static max(out: vec3, a: vec3, b: vec3): vec3;

        /**
         * Math.round the components of a vec3
         *
         * @param out the receiving vector
         * @param a vector to round
         * @returns out
         */
        static round(out: vec3, a: vec3): vec3;

        /**
         * Scales a vec3 by a scalar number
         *
         * @param out the receiving vector
         * @param a the vector to scale
         * @param b amount to scale the vector by
         * @returns out
         */
        static scale(out: vec3, a: vec3, b: number): vec3;

        /**
         * Adds two vec3's after scaling the second operand by a scalar value
         *
         * @param out the receiving vector
         * @param a the first operand
         * @param b the second operand
         * @param scale the amount to scale b by before adding
         * @returns out
         */
        static scaleAndAdd(out: vec3, a: vec3, b: vec3, scale: number): vec3;

        /**
         * Calculates the euclidian distance between two vec3's
         *
         * @param a the first operand
         * @param b the second operand
         * @returns distance between a and b
         */
        static distance(a: vec3, b: vec3): number;

        /**
         * Alias for {@link vec3.distance}
         * @function
         */
        static dist(a: vec3, b: vec3): number;

        /**
         * Calculates the squared euclidian distance between two vec3's
         *
         * @param a the first operand
         * @param b the second operand
         * @returns squared distance between a and b
         */
        static squaredDistance(a: vec3, b: vec3): number;

        /**
         * Alias for {@link vec3.squaredDistance}
         * @function
         */
        static sqrDist(a: vec3, b: vec3): number;

        /**
         * Calculates the length of a vec3
         *
         * @param a vector to calculate length of
         * @returns length of a
         */
        static length(a: vec3): number;

        /**
         * Alias for {@link vec3.length}
         * @function
         */
        static len(a: vec3): number;

        /**
         * Calculates the squared length of a vec3
         *
         * @param a vector to calculate squared length of
         * @returns squared length of a
         */
        static squaredLength(a: vec3): number;

        /**
         * Alias for {@link vec3.squaredLength}
         * @function
         */
        static sqrLen(a: vec3): number;

        /**
         * Negates the components of a vec3
         *
         * @param out the receiving vector
         * @param a vector to negate
         * @returns out
         */
        static negate(out: vec3, a: vec3): vec3;

        /**
         * Returns the inverse of the components of a vec3
         *
         * @param out the receiving vector
         * @param a vector to invert
         * @returns out
         */
        static inverse(out: vec3, a: vec3): vec3;

        /**
         * Returns the inverse of the components of a vec3 safely
         *
         * @param out the receiving vector
         * @param a vector to invert
         * @returns out
         */
        static inverseSafe(out: vec3, a: vec3): vec3;

        /**
         * Normalize a vec3
         *
         * @param out the receiving vector
         * @param a vector to normalize
         * @returns out
         */
        static normalize(out: vec3, a: vec3): vec3;

        /**
         * Calculates the dot product of two vec3's
         *
         * @param a the first operand
         * @param b the second operand
         * @returns dot product of a and b
         */
        static dot(a: vec3, b: vec3): number;

        /**
         * Computes the cross product of two vec3's
         *
         * @param out the receiving vector
         * @param a the first operand
         * @param b the second operand
         * @returns out
         */
        static cross(out: vec3, a: vec3, b: vec3): vec3;

        /**
         * Performs a linear interpolation between two vec3's
         *
         * @param out the receiving vector
         * @param a the first operand
         * @param b the second operand
         * @param t interpolation amount between the two inputs
         * @returns out
         */
        static lerp(out: vec3, a: vec3, b: vec3, t: number): vec3;

        /**
         * Performs a hermite interpolation with two control points
         *
         * @param out the receiving vector
         * @param a the first operand
         * @param b the second operand
         * @param c the third operand
         * @param d the fourth operand
         * @param t interpolation amount between the two inputs
         * @returns out
         */
        static hermite(out: vec3, a: vec3, b: vec3, c: vec3, d: vec3, t: number): vec3;
        
        /**
         * Performs a bezier interpolation with two control points
         *
         * @param out the receiving vector
         * @param a the first operand
         * @param b the second operand
         * @param c the third operand
         * @param d the fourth operand
         * @param t interpolation amount between the two inputs
         * @returns out
         */
        static bezier(out: vec3, a: vec3, b: vec3, c: vec3, d: vec3, t: number): vec3;
        
        /**
         * Generates a random vector with the given scale
         *
         * @param out the receiving vector
         * @param scale Length of the resulting vector. If ommitted, a unit vector will be returned
         * @returns out
         */
        static random(out: vec3, scale?: number): vec3;
        /**
         * Transforms the vec3 with a mat4.
         * 4th vector component is implicitly '1'
         *
         * @param out the receiving vector
         * @param a the vector to transform
         * @param m matrix to transform with
         * @returns out
         */
        static transformMat4(out: vec3, a: vec3, m: mat4): vec3;

        /**
         * Transforms the vec3 with a mat3.
         *
         * @param out the receiving vector
         * @param a the vector to transform
         * @param m the 3x3 matrix to transform with
         * @returns out
         */
        static transformMat3(out: vec3, a: vec3, m: mat4): vec3;

        /**
         * Transforms the vec3 with a quat
         *
         * @param out the receiving vector
         * @param a the vector to transform
         * @param q quaternion to transform with
         * @returns out
         */
        static transformQuat(out: vec3, a: vec3, q: quat): vec3;

        /**
         * Rotate a 3D vector around the x-axis
         * @param out The receiving vec3
         * @param a The vec3 point to rotate
         * @param b The origin of the rotation
         * @param c The angle of rotation
         * @returns out
         */
        static rotateX(out: vec3, a: vec3, b: vec3, c: number): vec3;

        /**
         * Rotate a 3D vector around the y-axis
         * @param out The receiving vec3
         * @param a The vec3 point to rotate
         * @param b The origin of the rotation
         * @param c The angle of rotation
         * @returns out
         */
        static rotateY(out: vec3, a: vec3, b: vec3, c: number): vec3;

        /**
         * Rotate a 3D vector around the z-axis
         * @param out The receiving vec3
         * @param a The vec3 point to rotate
         * @param b The origin of the rotation
         * @param c The angle of rotation
         * @returns out
         */
        static rotateZ(out: vec3, a: vec3, b: vec3, c: number): vec3;

        /**
         * Perform some operation over an array of vec3s.
         *
         * @param a the array of vectors to iterate over
         * @param stride Number of elements between the start of each vec3. If 0 assumes tightly packed
         * @param offset Number of elements to skip at the beginning of the array
         * @param count Number of vec3s to iterate over. If 0 iterates over entire array
         * @param fn Function to call for each vector in the array
         * @param arg additional argument to pass to fn
         * @returns a
         * @function
         */
        static forEach(a: vec3[], stride: number, offset: number, count: number, fn: Function, arg?:any): vec3[];
        
        /**
         * Get the angle between two 3D vectors
         * @param a The first operand
         * @param b The second operand
         * @returns The angle in radians
         */
        static angle(a: vec3, b: vec3): number;

        /**
         * Returns a string representation of a vector
         *
         * @param a vector to represent as a string
         * @returns string representation of the vector
         */
        static str(a: vec3): string;

        /**
         * Returns typed array
         *
         * @param out The receiving array
         * @param v The vector to represent as an array
         * @returns out
         */
        static array(out: number[],v: vec3): number[];

        /**
         * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
         *
         * @param a The first vector.
         * @param b The second vector.
         * @returns True if the vectors are equal, false otherwise.
         */
        static exactEquals(a: vec3, b: vec3): boolean;

        /**
         * Returns whether or not the vectors have approximately the same elements in the same position.
         *
         * @param a The first vector.
         * @param b The second vector.
         * @returns True if the vectors are equal, false otherwise.
         */
        static equals(a: vec3, b: vec3): boolean;
    }

    /**
     * @class 4 Dimensional Vector
     * @name vec4
     */
    class vec4 {
        x: number;
        y: number;
        z: number;
        w: number;
        constructor(x: number, y: number, z: number, w: number);
        toJSON(): number[];

        /**
         * Creates a new, empty vec4
         *
         * @returns {vec4} a new 4D vector
         */
        static create(): vec4;
        
        /**
         * Creates a new vec4 initialized with the given values
         *
         * @param {Number} x X component
         * @param {Number} y Y component
         * @param {Number} z Z component
         * @param {Number} w W component
         * @returns {vec4} a new 4D vector
         */
        static new(x: number, y: number, z: number, w: number): vec4;
        
        /**
         * Creates a new vec4 initialized with values from an existing vector
         *
         * @param {vec4} a vector to clone
         * @returns {vec4} a new 4D vector
         */
        static clone(a: vec4): vec4;
        
        /**
         * Copy the values from one vec4 to another
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a the source vector
         * @returns {vec4} out
         */
        static copy(out: vec4, a: vec4): vec4;
        
        /**
         * Set the components of a vec4 to the given values
         *
         * @param {vec4} out the receiving vector
         * @param {Number} x X component
         * @param {Number} y Y component
         * @param {Number} z Z component
         * @param {Number} w W component
         * @returns {vec4} out
         */
        static set(out: vec4, x: number, y: number, z: number, w: number): vec4;
        
        /**
         * Adds two vec4's
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a the first operand
         * @param {vec4} b the second operand
         * @returns {vec4} out
         */
        static add(out: vec4, a: vec4, b: vec4): vec4;
        
        /**
         * Subtracts vector b from vector a
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a the first operand
         * @param {vec4} b the second operand
         * @returns {vec4} out
         */
        static subtract(out: vec4, a: vec4, b: vec4): vec4;
        
        /**
         * Alias for {@link vec4.subtract}
         * @function
         */
        static sub(out: vec4, a: vec4, b: vec4): vec4;
        
        /**
         * Multiplies two vec4's
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a the first operand
         * @param {vec4} b the second operand
         * @returns {vec4} out
         */
        static multiply(out: vec4, a: vec4, b: vec4): vec4;
        
        /**
         * Alias for {@link vec4.multiply}
         * @function
         */
        static mul(out: vec4, a: vec4, b: vec4): vec4;
        
        /**
         * Divides two vec4's
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a the first operand
         * @param {vec4} b the second operand
         * @returns {vec4} out
         */
        static divide(out: vec4, a: vec4, b: vec4): vec4;
        
        /**
         * Alias for {@link vec4.divide}
         * @function
         */
        static div(out: vec4, a: vec4, b: vec4): vec4;
        
        /**
         * Math.ceil the components of a vec4
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a vector to ceil
         * @returns {vec4} out
         */
        static ceil(out: vec4, a: vec4): vec4;
        
        /**
         * Math.floor the components of a vec4
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a vector to floor
         * @returns {vec4} out
         */
        static floor(out: vec4, a: vec4): vec4;
        
        /**
         * Returns the minimum of two vec4's
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a the first operand
         * @param {vec4} b the second operand
         * @returns {vec4} out
         */
        static min(out: vec4, a: vec4, b: vec4): vec4;
        
        /**
         * Returns the maximum of two vec4's
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a the first operand
         * @param {vec4} b the second operand
         * @returns {vec4} out
         */
        static max(out: vec4, a: vec4, b: vec4): vec4;
        
        /**
         * Math.round the components of a vec4
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a vector to round
         * @returns {vec4} out
         */
        static round(out: vec4, a: vec4): vec4;
        
        /**
         * Scales a vec4 by a scalar number
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a the vector to scale
         * @param {Number} b amount to scale the vector by
         * @returns {vec4} out
         */
        static scale(out: vec4, a: vec4, b: number): vec4;
        
        /**
         * Adds two vec4's after scaling the second operand by a scalar value
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a the first operand
         * @param {vec4} b the second operand
         * @param {Number} scale the amount to scale b by before adding
         * @returns {vec4} out
         */
        static scaleAndAdd(out: vec4, a: vec4, b: vec4, scale: number): vec4;
        
        /**
         * Calculates the euclidian distance between two vec4's
         *
         * @param {vec4} a the first operand
         * @param {vec4} b the second operand
         * @returns {Number} distance between a and b
         */
        static distance(a: vec4, b: vec4): number;
        
        /**
         * Alias for {@link vec4.distance}
         * @function
         */
        static dist(a: vec4, b: vec4): number;
        
        /**
         * Calculates the squared euclidian distance between two vec4's
         *
         * @param {vec4} a the first operand
         * @param {vec4} b the second operand
         * @returns {Number} squared distance between a and b
         */
        static squaredDistance(a: vec4, b: vec4): number;
        
        /**
         * Alias for {@link vec4.squaredDistance}
         * @function
         */
        static sqrDist(a: vec4, b: vec4): number;
        
        /**
         * Calculates the length of a vec4
         *
         * @param {vec4} a vector to calculate length of
         * @returns {Number} length of a
         */
        static length(a: vec4): number;
        
        /**
         * Alias for {@link vec4.length}
         * @function
         */
        static len(a: vec4): number;
        
        /**
         * Calculates the squared length of a vec4
         *
         * @param {vec4} a vector to calculate squared length of
         * @returns {Number} squared length of a
         */
        static squaredLength(a: vec4): number;
        
        /**
         * Alias for {@link vec4.squaredLength}
         * @function
         */
        static sqrLen(a: vec4): number;
        
        /**
         * Negates the components of a vec4
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a vector to negate
         * @returns {vec4} out
         */
        static negate(out: vec4, a: vec4): vec4;
        
        /**
         * Returns the inverse of the components of a vec4
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a vector to invert
         * @returns {vec4} out
         */
        static inverse(out: vec4, a: vec4): vec4;
        
        /**
         * Returns the inverse of the components of a vec4 safely
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a vector to invert
         * @returns {vec4} out
         */
        static inverseSafe(out: vec4, a: vec4): vec4;
        
        /**
         * Normalize a vec4
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a vector to normalize
         * @returns {vec4} out
         */
        static normalize(out: vec4, a: vec4): vec4;
        
        /**
         * Calculates the dot product of two vec4's
         *
         * @param {vec4} a the first operand
         * @param {vec4} b the second operand
         * @returns {Number} dot product of a and b
         */
        static dot(a: vec4, b: vec4): number;
        
        /**
         * Performs a linear interpolation between two vec4's
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a the first operand
         * @param {vec4} b the second operand
         * @param {Number} t interpolation amount between the two inputs
         * @returns {vec4} out
         */
        static lerp(out: vec4, a: vec4, b: vec4, t: number): vec4;
        
        /**
         * Generates a random vector with the given scale
         *
         * @param {vec4} out the receiving vector
         * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
         * @returns {vec4} out
         */
        static random(out: vec4, scale?: number): vec4;
        
        /**
         * Transforms the vec4 with a mat4.
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a the vector to transform
         * @param {mat4} m matrix to transform with
         * @returns {vec4} out
         */
        static transformMat4(out: vec4, a: vec4, m: mat4): vec4;
        
        /**
         * Transforms the vec4 with a quat
         *
         * @param {vec4} out the receiving vector
         * @param {vec4} a the vector to transform
         * @param {quat} q quaternion to transform with
         * @returns {vec4} out
         */
        static transformQuat(out: vec4, a: vec4, q: quat): vec4;
        
        /**
         * Perform some operation over an array of vec4s.
         *
         * @param {Array} a the array of vectors to iterate over
         * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
         * @param {Number} offset Number of elements to skip at the beginning of the array
         * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
         * @param {Function} fn Function to call for each vector in the array
         * @param {Object} [arg] additional argument to pass to fn
         * @returns {Array} a
         * @function
         */
        static forEach(a: vec4[], stride: number, offset: number, count: number, fn: Function, arg?: any): vec4[];
        
        /**
         * Returns a string representation of a vector
         *
         * @param {vec4} a vector to represent as a string
         * @returns {String} string representation of the vector
         */
        static str(a: vec4): string;
        
        /**
         * Returns typed array
         *
         * @param {array} out
         * @param {vec4} v
         * @returns {array}
         */
        static array(out: number[], v: vec4): number[];
        
        /**
         * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
         *
         * @param {vec4} a The first vector.
         * @param {vec4} b The second vector.
         * @returns {Boolean} True if the vectors are equal, false otherwise.
         */
        static exactEquals(a: vec4, b: vec4): boolean;
        
        /**
         * Returns whether or not the vectors have approximately the same elements in the same position.
         *
         * @param {vec4} a The first vector.
         * @param {vec4} b The second vector.
         * @returns {Boolean} True if the vectors are equal, false otherwise.
         */
        static equals(a: vec4, b: vec4): boolean;
    }

    /**
    * @class Quaternion
    * @name quat
    */
    class quat {
        x: number;
        y: number;
        z: number;
        w: number;
        constructor(x: number, y: number, z: number, w: number);
        toJSON(): number[];

        /**
         * Creates a new identity quat
         *
         * @returns a new quaternion
         */
        static create(): quat;

        /**
         * Creates a new quat initialized with the given values
         *
         * @param x X component
         * @param y Y component
         * @param z Z component
         * @param w W component
         * @returns a new quaternion
         * @function
         */
        static new(x: number, y: number, z: number, w: number): quat;

        /**
         * Creates a new quat initialized with values from an existing quaternion
         *
         * @param a quaternion to clone
         * @returns a new quaternion
         * @function
         */
        static clone(a: quat): quat;

        /**
         * Copy the values from one quat to another
         *
         * @param out the receiving quaternion
         * @param a the source quaternion
         * @returns out
         * @function
         */
        static copy(out: quat, a: quat): quat;

        /**
         * Set the components of a quat to the given values
         *
         * @param out the receiving quaternion
         * @param x X component
         * @param y Y component
         * @param z Z component
         * @param w W component
         * @returns out
         * @function
         */
        static set(out: quat, x: number, y: number, z: number, w: number): quat;

        /**
         * Set a quat to the identity quaternion
         *
         * @param out the receiving quaternion
         * @returns out
         */
        static identity(out: quat): quat

        /**
         * Sets a quaternion to represent the shortest rotation from one
         * vector to another.
         *
         * Both vectors are assumed to be unit length.
         *
         * @param out the receiving quaternion.
         * @param a the initial vector
         * @param b the destination vector
         * @returns out
         */
        static rotationTo(out: quat, a: vec3, b: vec3): quat

        /**
         * Gets the rotation axis and angle for a given
         *  quaternion. If a quaternion is created with
         *  fromAxisAngle, this method will return the same
         *  values as providied in the original parameter list
         *  OR functionally equivalent values.
         * Example: The quaternion formed by axis [0, 0, 1] and
         *  angle -90 is the same as the quaternion formed by
         *  [0, 0, 1] and 270. This method favors the latter.
         * @param out_axis  Vector receiving the axis of rotation
         * @param q     Quaternion to be decomposed
         * @return     Angle, in radians, of the rotation
         */
        static getAxisAngle(out_axis: vec3, q: quat): number;

        /**
         * Multiplies two quat's
         *
         * @param out the receiving quaternion
         * @param a the first operand
         * @param b the second operand
         * @returns out
         */
        static multiply(out: quat, a: quat, b: quat): quat;

        /**
         * Alias for {@link quat.multiply}
         * @function
         */
        static mul(out: quat, a: quat, b: quat): quat;
        
        /**
         * Scales a quat by a scalar number
         *
         * @param out the receiving vector
         * @param a the vector to scale
         * @param b amount to scale the vector by
         * @returns out
         * @function
         */
        static scale(out: quat, a: quat, b: number): quat

        /**
         * Rotates a quaternion by the given angle about the X axis
         *
         * @param out quat receiving operation result
         * @param a quat to rotate
         * @param rad angle (in radians) to rotate
         * @returns out
         */
        static rotateX(out: quat, a: quat, rad: number): quat;

        /**
         * Rotates a quaternion by the given angle about the Y axis
         *
         * @param out quat receiving operation result
         * @param a quat to rotate
         * @param rad angle (in radians) to rotate
         * @returns out
         */
        static rotateY(out: quat, a: quat, rad: number): quat;

        /**
         * Rotates a quaternion by the given angle about the Z axis
         *
         * @param out quat receiving operation result
         * @param a quat to rotate
         * @param rad angle (in radians) to rotate
         * @returns out
         */
        static rotateZ(out: quat, a: quat, rad: number): quat;

        /**
         * Rotates a quaternion by the given angle about the axis in world space
         *
         * @param out quat receiving operation result
         * @param rot quat to rotate
         * @param axis the axis around which to rotate in world space
         * @param rad angle (in radians) to rotate
         * @returns out
         */
        static rotateAround(out: quat, rot: quat, axis: vec3, rad: number): quat;

        /**
         * Rotates a quaternion by the given angle about the axis in local space
         *
         * @param out quat receiving operation result
         * @param rot quat to rotate
         * @param axis the axis around which to rotate in local space
         * @param rad angle (in radians) to rotate
         * @returns out
         */
        static rotateAroundLocal(out: quat, rot: quat, axis: vec3, rad: number): quat;

        /**
         * Calculates the W component of a quat from the X, Y, and Z components.
         * Assumes that quaternion is 1 unit in length.
         * Any existing W component will be ignored.
         *
         * @param out the receiving quaternion
         * @param a quat to calculate W component of
         * @returns out
         */
        static calculateW(out: quat, a:quat): quat;

        /**
         * Calculates the dot product of two quat's
         *
         * @param a the first operand
         * @param b the second operand
         * @returns dot product of a and b
         * @function
         */
        static dot(a: quat, b: quat): number;

        /**
         * Performs a linear interpolation between two quat's
         *
         * @param out the receiving quaternion
         * @param a the first operand
         * @param b the second operand
         * @param t interpolation amount between the two inputs
         * @returns out
         * @function
         */
        static lerp(out: quat, a: quat, b: quat, t: number): quat;

        /**
         * Performs a spherical linear interpolation between two quat
         *
         * @param out the receiving quaternion
         * @param a the first operand
         * @param b the second operand
         * @param t interpolation amount between the two inputs
         * @returns out
         */
        static slerp(out: quat, a: quat, b: quat, t: number): quat;

        /**
         * Performs a spherical linear interpolation with two control points
         *
         * @param out the receiving quaternion
         * @param a the first operand
         * @param b the second operand
         * @param c the third operand
         * @param d the fourth operand
         * @param t interpolation amount
         * @returns out
         */
        static sqlerp(out: quat, a: quat, b: quat, c: quat, d: quat, t: number): quat;

        /**
         * Calculates the inverse of a quat
         *
         * @param {quat} out the receiving quaternion
         * @param {quat} a quat to calculate inverse of
         * @returns {quat} out
         */
        static invert(out: quat, a: quat): quat;

        /**
         * Calculates the conjugate of a quat
         * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
         *
         * @param {quat} out the receiving quaternion
         * @param {quat} a quat to calculate conjugate of
         * @returns {quat} out
         */
        static conjugate(out: quat, a: quat): quat;

        /**
         * Calculates the length of a quat
         *
         * @param {quat} a vector to calculate length of
         * @returns {Number} length of a
         * @function
         */
        static length(a: quat): number;

        
        /**
         * Alias for {@link quat.length}
         * @function
         */
        static len(a: quat): number;

        /**
         * Calculates the squared length of a quat
         *
         * @param a vector to calculate squared length of
         * @returns squared length of a
         * @function
         */
        static squaredLength(a: quat): number;

        /**
         * Alias for {@link quat.squaredLength}
         * @function
         */
        static sqrLen(a: quat): number;

        /**
         * Normalize a quat
         *
         * @param out the receiving quaternion
         * @param a quaternion to normalize
         * @returns out
         * @function
         */
        static normalize(out: quat, a: quat): quat;

        /**
         * Sets the specified quaternion with values corresponding to the given
         * axes. Each axis is a vec3 and is expected to be unit length and
         * perpendicular to all other specified axes.
         *
         * @param xAxis the vector representing the local "right" direction
         * @param yAxis the vector representing the local "up" direction
         * @param zAxis the vector representing the viewing direction
         * @returns out
         */
        static fromAxes(xAxis: vec3, yAxis: vec3, zAxis: vec3): quat;

        /**
        * Calculates a quaternion from view direction and up direction
        *
        * @param out mat3 receiving operation result
        * @param view view direction (must be normalized)
        * @param up up direction, default is (0,1,0) (must be normalized)
        *
        * @returns out
        */
        static fromViewUp(out: quat, view: vec3, up?: vec3): quat;

        /**
         * Sets a quat from the given angle and rotation axis,
         * then returns it.
         *
         * @param {quat} out the receiving quaternion
         * @param {vec3} axis the axis around which to rotate
         * @param {number} rad the angle in radians
         * @returns {quat} out
         **/
        static fromAxisAngle(out: quat, axis: vec3, rad: number): quat;

        /**
         * Creates a quaternion from the given 3x3 rotation matrix.
         *
         * NOTE: The resultant quaternion is not normalized, so you should be sure
         * to renormalize the quaternion yourself where necessary.
         *
         * @param {quat} out the receiving quaternion
         * @param {mat3} m rotation matrix
         * @returns {quat} out
         * @function
         */
        static fromMat3(out: quat, m: mat3): quat;

        /**
         * Creates a quaternion from the given euler angle x, y, z.
         *
         * @param {quat} out the receiving quaternion
         * @param {number} x Angle to rotate around X axis in degrees.
         * @param {number} y Angle to rotate around Y axis in degrees.
         * @param {number} z Angle to rotate around Z axis in degrees.
         * @returns {quat} out
         * @function
         */
        static fromEuler(out: quat, x: number, y: number, z: number): quat;

        /**
         * Returns a string representation of a quatenion
         *
         * @param {quat} a vector to represent as a string
         * @returns {String} string representation of the vector
         */
        static str(a: quat): string;

        /**
         * Returns typed array
         *
         * @param {array} out
         * @param {quat} q
         * @returns {array}
         */
        static array(out: number[], q: quat): number[];

        /**
         * Returns whether or not the quaternions have exactly the same elements in the same position (when compared with ===)
         *
         * @param {quat} a The first quaternion.
         * @param {quat} b The second quaternion.
         * @returns {Boolean} True if the vectors are equal, false otherwise.
         */
        static exactEquals(a: quat, b: quat): boolean;

        /**
         * Returns whether or not the quaternions have approximately the same elements in the same position.
         *
         * @param {quat} a The first vector.
         * @param {quat} b The second vector.
         * @returns {Boolean} True if the vectors are equal, false otherwise.
         */
        static equals(a: quat, b: quat): boolean;
    }

    /**
     * @class 2x2 Matrix
     * @name mat2
     */
    class mat2 {
        m00: number;
        m01: number;
        m02: number;
        m03: number;

        constructor(m00: number, m01: number, m02: number, m03: number);
        toJSON(): string;

        /**
         * Creates a new identity mat2
         *
         * @returns a new 2x2 matrix
         */
        static create(): mat2;

        /**
         * Create a new mat2 with the given values
         *
         * @param m00 Component in column 0, row 0 position (index 0)
         * @param m01 Component in column 0, row 1 position (index 1)
         * @param m10 Component in column 1, row 0 position (index 2)
         * @param m11 Component in column 1, row 1 position (index 3)
         * @returns out A new 2x2 matrix
         */
        static new(m00: number,m01: number,m10: number,m11: number): mat2;

        /**
         * Creates a new mat2 initialized with values from an existing matrix
         *
         * @param a matrix to clone
         * @returns a new 2x2 matrix
         */
        static clone(a: mat2): mat2;

        /**
         * Copy the values from one mat2 to another
         *
         * @param out the receiving matrix
         * @param a the source matrix
         * @returns out
         */
        static copy(out: mat2, a: mat2): mat2;

        /**
         * Set a mat2 to the identity matrix
         *
         * @param {mat2} out the receiving matrix
         * @returns {mat2} out
         */
        static identity(out: mat2): mat2;

        /**
         * Set the components of a mat2 to the given values
         *
         * @param {mat2} out the receiving matrix
         * @param {Number} m00 Component in column 0, row 0 position (index 0)
         * @param {Number} m01 Component in column 0, row 1 position (index 1)
         * @param {Number} m10 Component in column 1, row 0 position (index 2)
         * @param {Number} m11 Component in column 1, row 1 position (index 3)
         * @returns {mat2} out
         */
        static set(out: mat2, m00: number, m01: number, m10: number, m11: number): mat2;

        /**
         * Transpose the values of a mat2
         *
         * @param {mat2} out the receiving matrix
         * @param {mat2} a the source matrix
         * @returns {mat2} out
         */
        static transpose(out: mat2, a: mat2): mat2;

        /**
         * Inverts a mat2
         *
         * @param {mat2} out the receiving matrix
         * @param {mat2} a the source matrix
         * @returns {mat2} out
         */
        static invert(out: mat2, a: mat2): mat2;

        /**
         * Calculates the adjugate of a mat2
         *
         * @param {mat2} out the receiving matrix
         * @param {mat2} a the source matrix
         * @returns {mat2} out
         */
        static adjoint(out: mat2, a: mat2): mat2;

        /**
         * Calculates the determinant of a mat2
         *
         * @param {mat2} a the source matrix
         * @returns {Number} determinant of a
         */
        static determinant(a: mat2): number;

        /**
         * Multiplies two mat2's
         *
         * @param {mat2} out the receiving matrix
         * @param {mat2} a the first operand
         * @param {mat2} b the second operand
         * @returns {mat2} out
         */
        static multiply(out: mat2, a: mat2, b: mat2): mat2;

        /**
         * Alias for {@link mat2.multiply}
         * @function
         */
        static mul: typeof mat2.multiply;

        // INCOMPLETE
    }

    /**
     * @class 2x3 Matrix
     * @name mat2
     */
    class mat23 {
        // INCOMPLETE
        m00: number;
        m01: number;
        m02: number;
        m03: number;
        m04: number;
        m05: number;
    }

    /**
     * @class 3x3 Matrix
     * @name mat2
     */
    class mat3 {
        // INCOMPLETE
        m00: number;
        m01: number;
        m02: number;
        m03: number;
        m04: number;
        m05: number;
        m06: number;
        m07: number;
        m08: number;
    }

    /**
     * @class 4x4 Matrix
     * @name mat2
     */
    class mat4 {
        // INCOMPLETE
        m00: number;
        m01: number;
        m02: number;
        m03: number;
        m04: number;
        m05: number;
        m06: number;
        m07: number;
        m08: number;
        m09: number;
        m10: number;
        m11: number;
        m12: number;
        m13: number;
        m14: number;
        m15: number;
    }

    class color3 {
        r: number;
        g: number;
        b: number;
    }

    class color4 {
        r: number;
        g: number;
        b: number;
        a: number;
    }
}