{mat2, mat3, mat4, vec2, vec3, vec4, quat} = require 'gl-matrix'
{fetch_mesh} = require './fetch_assets'
FLOW = 0
FOLLOW = 1

clear_unused_particle_clones = (original)->
    for ob in original.unused_clones
        ob.remove() #delete object from the scene
    original.unused_clones = []

class ParticleSystem
    constructor: (@context, @properties)->
        @order = 0
        @start_time = @context.main_loop.last_time *0.001
        @time = 0
        @launched = false
        @auto_pause = false
        @paused = false
        @paused_time = 0
        @pause_start = 0
        @particles = []
        @configure_particles @properties

    #This function must be used only on curve based particles
    _get_max_path_time: ->
        if @accel
            #general formula of uniformly accelerated motion
            #TODO: Test with negative accel
            sqrt = Math.sqrt(Math.pow(@speed,2)+2*@accel*@max_length)
            max_time = Math.abs(Math.max((-@speed + sqrt),(-@speed -sqrt))/@accel)
        else
            #general formula of uniform motion
            max_time = Math.abs(@max_length/@speed)
        return max_time

    #"set_new_flow_speed_and_freq" function must be used only on flow particle systems
    #This function is needed because the new speed or freq could require more particles.
    set_new_flow_speed_and_freq: (new_speed=@speed,new_freq=@freq)->
        new_speed_is_smaller = new_speed < @speed
        new_freq_is_bigger = new_freq > @freq
        if new_speed_is_smaller
            @_get_max_path_time()
        if  new_speed_is_smaller or new_freq_is_bigger
            @_add_particles()
        @time_offset = 1/@freq

    _add_particles: ->
        #It only add particles if it's needed.
        #The maximum number of particles will be calculated as the number of
        #particleslaunched during the time wasted by the first one to go
        #through the max lengh path...
        number_of_particles = Math.ceil(@max_time/@time_offset)

        i = 0
        for p in [0...Math.max(number_of_particles - @particles.length,0)]
            @particles.push({
                'index': i,
                'time_offset': -i*@time_offset,
                'particle_system':@,
                'used_clones':[],
                'random_n':Math.random(),
            })
            i+=1

    _basic_curve_conf: ->
        #basic formula asigns position to the particle.
        #It is only used if any formula has been defined
        #in the particle system properties.
        basic_formula = (ob,position)->
            vec3.copy ob.position, position

        #Getting tracker from the specified scene("Scene" by default).
        if not 'tracker_scene' in @properties
            @properties.tracker_scene = 'Scene'
        @tracker_scene = t_scn = @context.scenes[@properties.tracker_scene]
        if not t_scn
            return console.error 'Error: no scene found "'+@properties.tracker_scene+'" for tracker "'+@properties.tracker+'"'
        @tracker = t_scn.parents[@properties.tracker]
        if not @tracker
            return console.error 'Error: no tracker found "'+@properties.tracker+'"'
        #adding particle system to the scene:
        t_scn.active_particle_systems.push @

        #Getting particle from the specified scene("Scene" by default).
        #Every particle clon will be clonned to the tracker scene.
        if not 'particle_scene' in @properties
            @properties.particle_scene = 'Scene'
        @particle_scene = p_scn = @context.scenes[@properties.particle_scene]
        if not p_scn
            return console.error 'Error: no scene found "'+@properties.particle_scene+'" for particle "'+@properties.particle+'"'
        @particle = p_scn.parents[@properties.particle]
        if not @particle
            return console.error 'Error: no particle found "'+@properties.particle+'" for tracker "'+@properties.tracker+'"'
        if @particle.type == 'MESH' and not @particle.data
            fetch_mesh @particle
        if not 'unused_clones' in @particle
            @particle.unused_clones = []

        #particle system properties:
        @speed = @properties.speed
        @accel = 0
        if 'accel' in @properties
            @accel = @properties.accel
        @start_time = main_loop.last_time *0.001
        track = @track = Track @tracker
        if 'auto_pause' in @properties
            @last_tracker_position = vec3.copy vec3.create(),@tracker.position
            @auto_pause = @properties.auto_pause
        if 'formula' in @properties and @properties.formula?
            @formula = @properties.formula
        else
            @formula = basic_formula
        @max_length = @track.get_max_path_length()
        @max_time = @_get_max_path_time()

        @_delete_particles()
        @init_space = 0
        if @speed < 0
            @init_space = @max_length

    configure_particles: (properties)->
        properties = @properties = properties or @properties

        if properties['type'] == 'follow' or properties['type'] == FOLLOW
            #The original particle is launched trough a curve
            @type = FOLLOW
            @_basic_curve_conf()
            @particles = [{
                'index': 0,
                'particle_system':@,
                'used_clones':[@particle]
            }]

        if properties['type'] == 'flow' or properties['type'] == FLOW
            #Some clones of the particle are launched trough a curve
            #A particle could use some particle clones because it could be split
            #in some others on each curve node.
            @type = FLOW
            @_basic_curve_conf()

            @freq = properties.freq
            if properties['fill']
                @fill = true

            @time_offset = 1/@freq
            @sync_time = @max_time + (@time_offset - @max_time % @time_offset)
            #Nearest time multiple of time_offset and superior to max_time
            #to use to sync particle launches on the eval function.
            @_add_particles()

        @_eval()

    _delete_particles: ->
        for p in @particles
            for c in p.used_clones
                c.visible = false
                @particle.unused_clones.push c
        @particles = []

    _add_clones_to_particle:  (needed_clones, p)->
        #needed_clones type: int
        #p type: particle
        n_clones_to_add = needed_clones - p.used_clones.length
        if n_clones_to_add < 0 #clones to remove
            for c in [0...-n_clones_to_add]
                unused_clon = p.used_clones.pop()
                unused_clon.visible = false
                @particle.unused_clones.push unused_clon

        else#clones to add
            original = @particle
            tracker_scene = @tracker_scene
            create_new_clon: ->
                #set the objet as static before clonning.
                is_static = original.static
                original.static = false
                new_clon = original.clone tracker_scene
                #restored original state after clonning.
                original.static = is_static
                p.used_clones.push new_clon
                return new_clon

            for c in [0...n_clones_to_add]
                if original.unused_clones.length
                    #reuse unused clon if it is available
                    new_clon = original.unused_clones.pop()
                    if new_clon.scene.name == tracker_scene.name
                        p.used_clones.push new_clon
                        vec3.copy new_clon.position, original.position
                        vec4.copy new_clon.rotation, original.rotation
                        vec3.copy new_clon.scale, original.scale
                        vec4.copy new_clon.color, original.color
                    else
                        original.unused_clones.push new_clon
                        new_clon = create_new_clon()
                else
                    new_clon = create_new_clon()
                #reset clon config
                new_clon.random_n = Math.random()
                new_clon.visible = true
                new_clon.particle = p




    pause: ->
        if not @paused
            @paused = true
            @pause_starts = main_loop.last_time*0.001 - @start_time

    play: ->
        if not @particles.length
            @configure_particles()
        if @paused
            @paused = false
            @paused_time += main_loop.last_time*0.001 - @start_time -@pause_starts

    stop: ->
        @_delete_particles()

    restart: ->
        @configure_particles()
        @paused_time = 0
        @pause_starts = 0

    remove: ->
        @stop()
        @tracker_scene.active_particle_systems.splice @tracker_scene.active_particle_systems.indexOf(), 1

    _eval: ->
        if @paused
            return

        if @auto_pause and (@time >= @max_time or @fill)
            @pause()

        if not @paused
            @time = main_loop.last_time*0.001 - @start_time - @paused_time

        #number of launches
        n = Math.ceil(@time/@max_time)
        if @type == FLOW
            for p in @particles
                fill_offset = 0
                if @fill
                    #TODO: It may cause problems with the accel
                    #Because the particle system starts in time different to 0
                    fill_offset = @max_time
                t = (@time + p.time_offset + fill_offset)%@sync_time
                #general formula of uniformly accelerated motion
                s = @init_space + @speed*t + 0.5*@accel*Math.pow(t,2)
                #saving space, time and index (based on the launch order)
                #in the particle to use it in the formula
                p.space = s
                p.time = t
                p.index += (n-1)*@particles.length
                #Getting tracked points and directions:
                points_and_directions = @track.get_all_tracked_points p.space,true
                #this function can recicle unused clones
                @_add_clones_to_particle points_and_directions.length ,p
                #assigning position, direction and some other properties
                #(defined on formula) to each clon.
                i = 0
                for pd in points_and_directions
                    point = pd[0]
                    direction = pd[1]
                    @formula p.used_clones[i],point,direction
                    i+=1

        else if @type == FOLLOW
            t = @time%@max_time
            #general formula of uniformly accelerated motion
            s = @init_space + @speed*t + 0.5*@accel*Math.pow(t,2)
            #saving space, time and index (based on the launch order)
            #in the particle to use it in the formula
            p = @particles[0]
            p.space = s
            p.time = t
            p.index = n
            #Getting tracked points and directions:
            point_and_directions = @track.get_all_tracked_points p.space,true
            #assigning position, direction and some other properties
            #(defined on formula) to the particle
            if point_and_directions.length
                p.used_clones[0].visible = true
                pd = point_and_directions[0]
                point = pd[0]
                direction = pd[1]
                @formula p.used_clones[0],point,direction
            else
                p.used_clones[0].visible = false

module.exports = {ParticleSystem, clear_unused_particle_clones}
