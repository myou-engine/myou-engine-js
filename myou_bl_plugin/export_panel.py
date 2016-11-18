import bpy, os
from bpy.props import *
import subprocess
from .exporter import exporter


class LayoutDemoPanel(bpy.types.Panel):
    bl_label = "Myou engine export"
    bl_idname = "RENDER_PT_myou_export"
    bl_space_type = 'PROPERTIES'
    bl_region_type = 'WINDOW'
    bl_context = "render"

    def draw(self, context):
        layout = self.layout

        scene = context.scene
        
        col = layout.column(align=True)
        split = col.split(percentage=0.9, align=True)
        split.prop(scene, "myou_export_folder", text='Export path')
        split.operator("myou.select_export_path", text='', icon='FILE_FOLDER')

        row = col.row(align=True)
        row.label(text="Export folder name:")
        row.prop(scene, "myou_export_name_as_blend", text="Same as .blend")
        if not scene.myou_export_name_as_blend:
            col.prop(scene, "myou_export_name", text='Export name')

        layout.label(text="Encode textures:")
        layout.prop(scene, "myou_export_tex_quality", expand=True)
        
        split = layout.split(percentage=0.9, align=True)
        row = split.row(align=True)
        row.prop(scene, "myou_export_PNGJPEG")
        row.prop(scene, "myou_export_JPEG_compress", text='')
        split.operator("myou.todo", text='', icon='QUESTION')
        split = layout.split(percentage=0.9, align=True)
        row = split.row(align=True)
        row.prop(scene, "myou_export_DXT")
        row.prop(scene, "myou_export_crunch", text='')
        split.operator("myou.todo", text='', icon='QUESTION')
        split = layout.split(percentage=0.9, align=True)
        row = split.row(align=True)
        row.prop(scene, "myou_export_ETC1")
        split.operator("myou.todo", text='', icon='QUESTION')
        split = layout.split(percentage=0.9, align=True)
        row = split.row(align=True)
        row.prop(scene, "myou_export_ETC2")
        split.operator("myou.todo", text='', icon='QUESTION')
        split = layout.split(percentage=0.9, align=True)
        row = split.row(align=True)
        row.prop(scene, "myou_export_PVRTC")
        row.prop(scene, "myou_export_pvr_mode", text='')
        split.operator("myou.todo", text='', icon='QUESTION')
        split = layout.split(percentage=0.9, align=True)
        row = split.row(align=True)
        row.prop(scene, "myou_export_ASTC")
        row.prop(scene, "myou_export_astc_mode", text='')
        split.operator("myou.todo", text='', icon='QUESTION')
        
        layout.operator("myou.set_tex_defaults", text='Reset defaults')
        layout.operator("myou.todo", text='Generate previews')
        # col = layout.column(align=True)
        # col.label('PVRTC and ATSC tools are not included with myou', icon='ERROR')
        # col.label('Use the buttons below to download the')
        # col.label('tools and place them in the tool folder')
        # row = col.row(align=True)
        # row.operator("wm.url_open", text='Download PVRTC tool', url='https://community.imgtec.com/developers/powervr/installers/')
        # row.operator("wm.url_open", text='Download ATSC tool', url='')
        # col.operator("", text='Open tool folder')

        layout.label(text="Export using above options:")
        row = layout.row()
        row.scale_y = 3.0
        row.operator("myou.export", text='Export')

        col = layout.column(align=True)
        col.label(text="Open exported scene in:")
        row = col.row(align=True)
        row.operator("myou.todo", text='Firefox')
        row.operator("myou.todo", text='Chrome')
        row.operator("myou.todo", text='IE11/Edge/Safari')
        row = col.row(align=True)
        row.operator("myou.todo", text='Mobile browser')
        row.operator("myou.todo", text='Native')
        row.operator("myou.todo", text='Mobile native')

class SelectExportPath(bpy.types.Operator):
    """Select export path"""
    bl_idname = "myou.select_export_path"
    bl_label = "Select export path"

    def execute(self, context):
        def uname():
            return subprocess.Popen(['uname'], stdout=subprocess.PIPE).communicate()[0].decode().replace('\n','')
        # TODO: In all cases, make loop that sends window to front until process
        # has finished
        if os.name == 'nt':
            from . import winutils
            path = subprocess.Popen(
                ['powershell','-Command',"""(new-object -COM 'Shell.Application').BrowseForFolder(0,'Select export path',0,0x11).self.path"""],
                stdout=subprocess.PIPE).communicate()[0].decode().replace('\r\n','')
            # path = winutils.folder_dialog()
        elif uname()=='Darwin':
            # http://mstratman.github.io/cocoadialog/
            popup_message('TODO: OSX Folder selection dialog with cocoaDialog')
        elif os.environ.get('KDE_FULL_SESSION'):
            subprocess.Popen(
                ['kdialog','--getexistingdirectory','~'],
                stdout=subprocess.PIPE).communicate()[0].decode().replace('\n','')
        else:
            subprocess.Popen(
                ['zenity','--file-selection','--directory'],
                stdout=subprocess.PIPE).communicate()[0].decode().replace('\n','')
        if path:
            bpy.context.scene.myou_export_folder = path
        return {'FINISHED'}

class SetTexDefaults(bpy.types.Operator):
    """Reset texture format options to recommended defaults"""
    bl_idname = "myou.set_tex_defaults"
    bl_label = "Reset texture defaults"

    def execute(self, context):
        scene = context.scene
        def reset():
            # If you change any of these, change it also in register()
            scene.myou_export_PNGJPEG = True
            scene.myou_export_JPEG_compress = 'COMPRESS'
            scene.myou_export_DXT = True
            scene.myou_export_crunch = 'CRUNCH_COLORS'
            scene.myou_export_ETC1 = True
            scene.myou_export_ETC2 = True
            scene.myou_export_PVRTC = True
            scene.myou_export_pvr_mode = '4'
            scene.myou_export_ASTC = True
            scene.myou_export_astc_mode = '6x6'
        yes_no('Are you sure?', reset, None)
        return {'FINISHED'}

class DoExport(bpy.types.Operator):
    """Export to configured path and name"""
    bl_idname = "myou.export"
    bl_label = "Export"

    def execute(self, context):
        scene = context.scene
        outname = scene.myou_export_name
        if scene.myou_export_name_as_blend or not outname:
            if not bpy.data.filepath:
                popup_message('Save the file or provide an export name')
                return {'FINISHED'}
            outname = bpy.data.filepath.replace(os.sep,'/').rsplit('/',1)[1].rsplit('.',1)[0]
        exporter.export_myou(os.path.join(scene.myou_export_folder, outname), scene)
        return {'FINISHED'}

class TODO(bpy.types.Operator):
    """To Do"""
    bl_idname = "myou.todo"
    bl_label = ""

    def execute(self, context):
        popup_message('TODO')
        return {'FINISHED'}

class Ok(bpy.types.Operator):
    """Ok"""
    bl_idname = "ok."
    bl_label = "Ok"

    def execute(self, context):
        return {'FINISHED'}

yes_cb = no_cb = menu_type = None

class Yes(bpy.types.Operator):
    """Yes"""
    bl_idname = "yes."
    bl_label = "Yes"

    def execute(self, context):
        yes_cb and yes_cb()
        return {'FINISHED'}

class No(bpy.types.Operator):
    """No"""
    bl_idname = "no."
    bl_label = "No"

    def execute(self, context):
        no_cb and no_cb()
        return {'FINISHED'}

class PopupMenu(bpy.types.Menu):
    bl_label = ""
    bl_idname = "OBJECT_MT_customized_popup_menu"
    
    def draw(self, context):
        layout = self.layout
        if menu_type == 'yes no':
            layout.operator('yes.')
            layout.operator('no.')
        else:
            layout.operator("ok.")

classes = [
    LayoutDemoPanel,
    SelectExportPath,
    SetTexDefaults,
    DoExport,
    Ok, Yes, No, TODO,
    PopupMenu,
]

def popup_message(msg):
    PopupMenu.bl_label = msg
    bpy.utils.unregister_class(PopupMenu)
    bpy.utils.register_class(PopupMenu)
    menu_type = 'ok'
    bpy.ops.wm.call_menu(name=PopupMenu.bl_idname)

def yes_no(msg, _yes_cb, _no_cb):
    global yes_cb, no_cb, menu_type
    yes_cb = _yes_cb
    no_cb = _no_cb
    PopupMenu.bl_label = msg
    bpy.utils.unregister_class(PopupMenu)
    bpy.utils.register_class(PopupMenu)
    menu_type = 'yes no'
    bpy.ops.wm.call_menu(name=PopupMenu.bl_idname)

def register():
    for cls in classes:
        bpy.utils.register_class(cls)
    bpy.types.Scene.myou_export_PNGJPEG = BoolProperty(name='PNG/JPEG', default=True)
    bpy.types.Scene.myou_export_DXT = BoolProperty(name='S3TC', default=True)
    bpy.types.Scene.myou_export_ETC1 = BoolProperty(name='ETC1', default=True)
    bpy.types.Scene.myou_export_ETC2 = BoolProperty(name='ETC2', default=True)
    bpy.types.Scene.myou_export_PVRTC = BoolProperty(name='PVRTC', default=True)
    bpy.types.Scene.myou_export_ASTC = BoolProperty(name='ASTC', default=True)
    
    bpy.types.Scene.myou_export_tex_quality = EnumProperty(items=(
            ("FAST", "Fast export", "Encode textures as fast as possible"),
            ("BEST", "Best quality", "Encode textures with best quality (slow)"),
        ),
        name="Quality",
        description="Quality of encoded textures",
        default="FAST")
    bpy.types.Scene.myou_export_JPEG_compress = EnumProperty(items=(
            ("COMPRESS", "Compress to JPEG where possible", "Compress to JPEG where possible"),
            ("LOSSLESS", "Lossless except original JPEG", "Do not compress to JPEG (except for images already JPEG)"),
        ),
        name="Compress to JPEG",
        description="Whether to compress RGB and normal images to JPEG or not.",
        default="COMPRESS") # If you change default, change it also in SetTexDefaults
    bpy.types.Scene.myou_export_crunch = EnumProperty(items=(
            ("CRUNCH", "Crunch", "Compress with Crunch"),
            ("CRUNCH_COLORS", "Crunch (except normals)", "Compress with Crunch except normal maps"),
            ("DDS", "No crunch", "Just losslessly compress DDS files"),
        ),
        name="Use crunch",
        description="Whether to use Crunch to reduce S3TC file size.",
        default="CRUNCH_COLORS") # If you change default, change it also in SetTexDefaults
    bpy.types.Scene.myou_export_pvr_mode = EnumProperty(items=(
            ("4", "4 bpp", "4 bpp (ok quality)"),
            ("2", "2 bpp", "2 bpp (less quality, half size)"),
        ),
        name="PVRTC mode",
        description="Encoding bits per pixel for PVRTC textures.",
        default="4") # If you change default, change it also in SetTexDefaults
    bpy.types.Scene.myou_export_astc_mode = EnumProperty(items=(
            ("4x4", "4x4, 8.00 bpp", ""),
            ("5x4", "5x4, 6.40 bpp", ""),
            ("5x5", "5x5, 5.12 bpp", ""),
            ("6x5", "6x5, 4.27 bpp", ""),
            ("6x6", "6x6, 3.56 bpp", ""),
            ("8x5", "8x5, 3.20 bpp", ""),
            ("8x6", "8x6, 2.67 bpp", ""),
            ("10x5", "10x5, 2.56 bpp", ""),
            ("10x6", "10x6, 2.13 bpp", ""),
            ("8x8", "8x8, 2.00 bpp", ""),
            ("10x8", "10x8, 1.60 bpp", ""),
            ("10x10", "10x10, 1.28 bpp", ""),
            ("12x10", "12x10, 1.07 bpp", ""),
            ("12x12", "12x12, 0.89 bpp", ""),
        ),
        name="ASTC block size",
        description="ASTC block size (affecting size and visual quality)",
        default="6x6") # If you change default, change it also in SetTexDefaults
        
    bpy.types.Scene.myou_export_folder = StringProperty()
    bpy.types.Scene.myou_export_name_as_blend = BoolProperty(default=True)
    bpy.types.Scene.myou_export_name = StringProperty()
    





def unregister():
    for cls in classes:
        bpy.utils.unregister_class(cls)


if __name__ == "__main__":
    register()
