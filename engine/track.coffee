{mat2, mat3, mat4, vec2, vec3, vec4, quat} = require 'gl-matrix'

class Track
    last_section: -1
    offsets: []
    constructor: (curve) ->
        @curve_object = curve
        @curve = curve.calculated_curves[0]
        curves = curve.calculated_curves
        lc = curves.length
        for i in [0...lc]
            curve_index = parseInt i
            c = curves[curve_index]
            @offsets.append null

        @save_offsets 0
        s = 0

    save_offsets: (curve_index,offset=0) ->
        @offsets[curve_index] = offset
        c = @curve_object.calculated_curves[curve_index]
        for n of c.nodes
            i = parseInt n
            for node in c.nodes[i]
                o = node[0]
                if not @offsets[o]?
                    s = offset
                    for e in c.la.subarray(0,i)
                        s+=e
                    @save_offsets o,s
        return

    get_max_path_length: ->
        winner = 0
        for c in [0...@curve_object.calculated_curves.length]
            l = @offsets[c] + @curve_object.calculated_curves[c].length
            if l > winner
                winner = l
        return winner

    get_tracked_point: (offset, curve_index)->
        curve = @curve_object.calculated_curves[curve_index]
        offset -= @offsets[curve_index]
        if offset>=0 and offset<=curve.length
            curve_object = @curve_object
            scale = curve_object.scale
            pre_section_distance = 0

            for section_number in [0...curve.la.lenth]
                s = curve.la[section_number]
                ss = pre_section_distance + s
                if ss >= offset
                    break
                pre_section_distance = ss

            section_distance = offset - pre_section_distance
            factor = 0
            slength = curve.la[section_number]
            if slength != 0
                factor = section_distance/slength

            p1 = vec3.create()
            p2 = vec3.create()
            start = section_number*3
            end = start+3
            direction = curve.da.subarray start, end
            p = vec3.create()
            vec3.mul p1, curve.va.subarray(start, end), scale
            vec3.mul p2, curve.va.subarray(start+3, end+6), scale

            vec3.lerp p, p1, p2, factor
            vec3.transformQuat p, p, curve_object.rotation
            vec3.add p, p, curve_object.get_world_position()

            return [p,direction]
        else if offset<0
            return 1 #unstarted
        else
            return 0 #finished

    get_all_tracked_points: (offset, avoid_non_tracked) ->
        tracked_points = []
        for c in [0...@curve_object.calculated_curves.length]
            tp = @get_tracked_point offset, c
            if not (avoid_non_tracked and tp >= 0)
                tracked_points.append tp
        return tracked_points

module.exports = Track
