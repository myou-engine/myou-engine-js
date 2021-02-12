declare module "vmath" {
    export module quat {
        function to_euler_XYZ(out: quat, q: quat): quat;
        function to_euler_XZY(out: quat, q: quat): quat;
        function to_euler_YXZ(out: quat, q: quat): quat;
        function to_euler_YZX(out: quat, q: quat): quat;
        function to_euler_ZXY(out: quat, q: quat): quat;
        function to_euler_ZYX(out: quat, q: quat): quat;
        function copyArray(out: quat, arr: number[]): quat;
        function setAxisAngle(out: quat, axis: vec3, rad: number): quat;
        function fromEulerOrder(out: quat, v: vec3, order: "XYZ"|"XZY"|"YXZ"|"YZX"|"ZXY"|"ZYX"): quat;
        function fromMat4(out: quat, m: mat4): quat;
    }
    export module vec3 {
        function signedAngle(a: vec3, b: vec3, n: vec3): number;
        function copyArray(out: quat, arr: number[]): quat;
        function fromMat4Scale(out: vec3, m: mat4): vec3;
        function ease_in_out(out: vec3, a: vec3, b: vec3, d: number, t: number): vec3;
        function fixAxes(x_axis: number, y_axis: number, z_axis: number): void;
        function fromMat4(out: vec3, m: mat4): vec3;
    }
    export module mat3 {
        function fromColumns(out: mat3, a: vec3, b: vec3, c: vec3): mat3;
        function rotationFromMat4(out: mat3, m: mat4): mat3
    }
    export module mat4 {
        function fromMat3(out: mat3, m: mat3): mat4;
        function copyArray(out: mat4, arr: number[]): mat4;
        function fromVec4Columns(out: mat4, a: vec4, b: vec4, c: vec4, d: vec4): mat4;
        function toRT(rotation: quat, translation: vec3, m: mat4): void;
    }
    export module color3 {
        function copyArray(out: color3, arr: number[]): color3;
    }
    export module color4 {
        function copyArray(out: color4, arr: number[]): color4;
    }
}