{Shader} = require './material.coffee'
{vec2} = require 'gl-matrix'

box_filter_code = """
    return (get(-1,-1)+get(0,-1)+get(1,-1)+
            get(-1, 0)+get(0, 0)+get(1, 0)+
            get(-1, 1)+get(0, 1)+get(1, 1))/9.0;"""


barrel_filter_code = """
    vec4 HmdWarpParam = vec4(1.0,0.22,0.24,0.0);
    vec2 c = vec2(coord.x - (VP_TO_LENS), coord.y * INV_RATIO);
    float rSq = c.x * c.x + c.y * c.y;
    vec2 rvector = c * ( HmdWarpParam.x + HmdWarpParam.y * rSq +
            HmdWarpParam.z * rSq * rSq
            + HmdWarpParam.w * rSq * rSq * rSq
            ) * INV_FOV_SCALE;
    rvector.y *= RATIO;
    rvector.x += VP_TO_IPD;
    return all(equal(rvector, clamp(rvector, vec2(-1), vec2(1))))?
            gettex(rvector):vec3(0);
    """

barrel_filter_chromeab_code = """
    vec4 HmdWarpParam = vec4(1.0,0.22,0.24,0.0);
    vec4 u_chromAbParam = vec4(0.996, -0.004, 1.0038, 0.0);
    vec2 c = vec2(coord.x - (VP_TO_LENS), coord.y * INV_RATIO);
    float rSq = c.x * c.x + c.y * c.y;
    vec2 rvector = c * ( HmdWarpParam.x + HmdWarpParam.y * rSq +
            HmdWarpParam.z * rSq * rSq
            + HmdWarpParam.w * rSq * rSq * rSq
            );
    float inv_fov_scale = INV_FOV_SCALE;
    if (any(notEqual(step(0.985, rvector*inv_fov_scale)+step(-0.985, rvector*inv_fov_scale), vec2(1.0, 1.0)))) {
      return vec3(0);
    }
    vec2 rvec_blue = rvector * (u_chromAbParam.z + u_chromAbParam.w * rSq);
    vec2 rvec_red  = rvector * (u_chromAbParam.x + u_chromAbParam.y * rSq);
    vec2 scale = vec2(inv_fov_scale, inv_fov_scale * RATIO);
    rvector *= scale;
    rvec_blue *= scale;
    rvec_red *= scale;
    float vp_to_ipd = VP_TO_IPD;
    rvector.x += vp_to_ipd;
    rvec_red.x += vp_to_ipd;
    rvec_blue.x += vp_to_ipd;
    vec2 asdf = vec2(0.00048828125);
    return vec3(gettex(rvec_red+asdf).r+gettex(rvec_red-asdf).r,
                gettex(rvector+asdf).g+gettex(rvector-asdf).g,
                gettex(rvec_blue+asdf).b+gettex(rvec_blue-asdf).b)*0.5;
    """

class Filter extends Shader

    # In the filters use:
    # get(x, y)     to get the pixel at the relative position
    #               x, y are pixels where 0, 0 is the current one
    # gettex(coords) to get the pixel at coordinates relative to
    #               the viewport (-1, 1)
    # coord         it holds the current coordinate relative to
    #               the viewport (-1, 1)

    # Use get() for managing pixels, use the other two for
    # managing UVs as if it were whole textures.

    constructor: (render_manager, code, name='filter')->
        vs = """precision highp float;
        precision highp int;
        attribute vec3 vertex;
        uniform vec2 src_size, pixel_ratio;
        uniform vec4 src_rect, dst_rect;
        varying vec2 src_co, dst_co, uv, coord;
        varying vec2 src_offset, src_scale;

        void main(){
            coord = (vertex.xy*2.0)-vec2(1.0,1.0);
            gl_Position = vec4(coord, 0.0, 1.0);
            src_co = src_rect.xy + src_rect.zw * vertex.xy;
            dst_co = dst_rect.xy + dst_rect.zw * vertex.xy;
            uv = src_co / src_size;
            src_scale = src_rect.zw / src_size;
            src_offset = src_rect.xy / src_size;
        }"""

        fs = """precision highp float;
        uniform sampler2D source;
        uniform vec2 src_size;
        varying vec2 src_co, dst_co, uv, coord;
        varying vec2 src_offset, src_scale;
        vec3 get(vec2 off){
            return texture2D(source, uv+off/src_size).rgb;
        }
        vec3 get(float x, float y){
            vec2 off = vec2(x, y);
            return texture2D(source, uv+off/src_size).rgb;
        }
        vec3 get(int x, int y){
            vec2 off = vec2(x, y);
            return texture2D(source, uv+off/src_size).rgb;
        }
        vec3 gettex(vec2 co){
            return texture2D(source, (co/2.0+vec2(0.5,0.5))*src_scale+src_offset).rgb;
        }
        vec3 filter(){"""+code+"""}
        void main(){
            gl_FragColor = vec4(filter(), 1.0);
        }"""


        gl = render_manager.gl
        super render_manager.context, {name, vertex: vs, fragment: fs}, null, \
            [{"name":"vertex","type":"f","count":3,"offset":0}], []


class FilterBase
    constructor: (@context, @name) ->
        @name = 'base'
        @fragment = ''
        @uniforms = []
        @material = null
        throw "Abstract class or missing constructor."

    get_material: ->
        if @material?
            return @material
        return @material = new @context.Material '_filter_'+@name, {
            material_type: 'PLAIN_SHADER',
            vertex: '''
                attribute vec3 vertex;
                uniform vec2 source_size;
                varying vec2 source_coord, source_size_inverse;
                void main(){
                    source_coord = vertex.xy*source_size;
                    source_size_inverse = vec2(1.0)/source_size;
                    gl_Position = vec4(vertex.xy*2.0-1.0, 0.0, 1.0); }''',
            fragment: @fragment
            uniforms: [
                {varname: 'source', value: @context.render_manager.blank_texture},
                {varname: 'source_size', value: vec2.fromValues(128, 128)},
            ].concat @uniforms,
        }

class ResizeFilter extends FilterBase
    constructor: (@context) ->
        @name = 'resize'
        # Avoiding negative numbers in modulo because it's implementation specific
        @fragment = '''
            precision highp float;
            uniform sampler2D source;
            uniform vec2 scale_inverse, source_size;
            uniform float flip_y_ratio;
            varying vec2 source_coord, source_size_inverse;
            void main() {
                vec2 coord = source_coord * scale_inverse;
                if(flip_y_ratio != 0.0){
                    coord.y = source_size.y * flip_y_ratio - coord.y;
                }
                gl_FragColor = texture2D(source, coord*source_size_inverse);
            }
        '''
        @uniforms = [
            {varname: 'scale_inverse', value: [1,1]},
            {varname: 'flip_y_ratio', value: 0},
        ]
        @material = null

module.exports = {
    box_filter_code, barrel_filter_code, barrel_filter_chromeab_code, Filter,
    FilterBase, ResizeFilter,
}
