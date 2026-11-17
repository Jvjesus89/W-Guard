
import bpy, math
from mathutils import Vector

def setup_studio(cam_loc=(-0.20, -0.36, 0.17), target=(0.0, -0.03, 0.05), lens=90):
    scene = bpy.context.scene
    col = bpy.data.collections.get("W-Guard")
    for o in [o for o in bpy.data.objects if o.name.startswith(("studio_",))]:
        bpy.data.objects.remove(o, do_unlink=True)

    def link(o):
        col.objects.link(o)
        return o

    # mundo: estudio claro e neutro
    w = bpy.data.worlds.get("Estudio") or bpy.data.worlds.new("Estudio")
    w.use_nodes = True
    nt = w.node_tree
    nt.nodes.clear()
    bg = nt.nodes.new("ShaderNodeBackground")
    bg.inputs["Color"].default_value = (0.82, 0.85, 0.9, 1)
    bg.inputs["Strength"].default_value = 0.55
    out = nt.nodes.new("ShaderNodeOutputWorld")
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])
    scene.world = w

    # chao claro
    me = bpy.data.meshes.new("studio_chao")
    me.from_pydata([(-2, -2, 0), (2, -2, 0), (2, 2, 0), (-2, 2, 0)], [], [(0, 1, 2, 3)])
    ch = link(bpy.data.objects.new("studio_chao", me))
    m = bpy.data.materials.new("Chao")
    m.use_nodes = True
    b = m.node_tree.nodes.get("Principled BSDF")
    if b is None:
        m.node_tree.nodes.clear()
        b = m.node_tree.nodes.new("ShaderNodeBsdfPrincipled")
        o2 = m.node_tree.nodes.new("ShaderNodeOutputMaterial")
        m.node_tree.links.new(b.outputs["BSDF"], o2.inputs["Surface"])
    b.inputs["Base Color"].default_value = (0.78, 0.8, 0.84, 1)
    b.inputs["Roughness"].default_value = 0.55
    me.materials.append(m)

    def area(name, loc, energy, size, color=(1, 1, 1)):
        ld = bpy.data.lights.new(name, 'AREA')
        ld.energy = energy
        ld.size = size
        ld.color = color
        o = link(bpy.data.objects.new(name, ld))
        o.location = loc
        d = Vector(target) - Vector(loc)
        o.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
        return o
    area("studio_key", (-0.35, -0.5, 0.45), 90, 0.5, (1.0, 0.97, 0.92))
    area("studio_fill", (0.55, -0.35, 0.2), 30, 0.6, (0.88, 0.93, 1.0))
    area("studio_rim", (0.15, 0.5, 0.35), 60, 0.4, (1, 1, 1))
    area("studio_top", (0.0, -0.1, 0.7), 25, 0.7, (1, 1, 1))

    cd = bpy.data.cameras.new("studio_cam")
    cd.lens = lens
    cam = link(bpy.data.objects.new("studio_cam", cd))
    cam.location = cam_loc
    cam.rotation_euler = (Vector(target) - Vector(cam_loc)).to_track_quat('-Z', 'Y').to_euler()
    scene.camera = cam

def render_eevee(path, w=1280, h=960, samples=32):
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE'
    try:
        scene.eevee.taa_render_samples = samples
    except Exception:
        pass
    scene.render.resolution_x = w
    scene.render.resolution_y = h
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.filepath = path
    scene.view_settings.view_transform = 'AgX'
    bpy.ops.render.render(write_still=True)
