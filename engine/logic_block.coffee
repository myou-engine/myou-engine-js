
class LogicBlock
    constructor: (@context, scene_name)->
        @objets = @context.objects
        @events = @context.events
        @render_manager = @context.render_manager

        @context.on_scene_ready scene_name, =>
            @init @context.scenes[scene_name]
        @context.on_scene_ready scene_name, =>
            @context.scenes[scene_name].post_draw_callbacks.push(@sensors.bind(@))
        @context.on_scene_ready scene_name, =>
            @context.scenes[scene_name].pre_draw_callbacks.push(@actuators.bind(@))

    init: (scene) => return
    sensors: (scene, frame_duration)-> return
    actuators: (scene, frame_duration)-> return

module.exports = {LogicBlock}
