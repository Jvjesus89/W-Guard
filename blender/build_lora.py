
# W-Guard - modelo 3D (Blender 5.x). 1 unidade local = 1 cm; o grupo raiz tem escala 0.01 (cena em metros).
import bpy, bmesh, math, os
from mathutils import Vector, Matrix

OUT = r"C:\joao\W-Guard\blender"

def clean():
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)
    for block in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.lights, bpy.data.cameras):
        for d in list(block):
            if d.users == 0:
                block.remove(d)

clean()
scene = bpy.context.scene
col = bpy.data.collections.new("W-Guard")
scene.collection.children.link(col)

# ------------------------------------------------------------------ materiais
def mat(name, color, rough=0.5, metal=0.0, coat=0.0, emit=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes.get("Principled BSDF")
    if b is None:
        nt.nodes.clear()
        b = nt.nodes.new("ShaderNodeBsdfPrincipled")
        b.name = "Principled BSDF"
        out = nt.nodes.new("ShaderNodeOutputMaterial")
        nt.links.new(b.outputs["BSDF"], out.inputs["Surface"])
    def s(k, v):
        if k in b.inputs:
            b.inputs[k].default_value = v
    s("Base Color", (color[0], color[1], color[2], 1.0))
    s("Roughness", rough)
    s("Metallic", metal)
    s("Coat Weight", coat)
    if coat:
        s("Coat Roughness", 0.18)
    if emit:
        s("Emission Color", (emit[0][0], emit[0][1], emit[0][2], 1.0))
        s("Emission Strength", emit[1])
    return m

def layer_lines(m, scale=9.0, strength=0.35):
    """Linhas de camada de impressao 3D (FDM) via bump procedural."""
    nt = m.node_tree
    n, l = nt.nodes, nt.links
    b = n["Principled BSDF"]
    tc = n.new("ShaderNodeTexCoord")
    w = n.new("ShaderNodeTexWave")
    w.wave_type = 'BANDS'
    w.bands_direction = 'Z'
    w.wave_profile = 'SAW'
    w.inputs["Scale"].default_value = scale
    w.inputs["Distortion"].default_value = 0.0
    bump = n.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = strength
    bump.inputs["Distance"].default_value = 0.0004
    l.new(tc.outputs["Object"], w.inputs["Vector"])
    l.new(w.outputs["Fac"], bump.inputs["Height"])
    l.new(bump.outputs["Normal"], b.inputs["Normal"])

M = {}
M["pla"] = mat("PLA_preto_grafite", (0.045, 0.05, 0.058), 0.52, 0.0, 0.05)
layer_lines(M["pla"])
M["pla_green"] = mat("PLA_verde", (0.06, 0.55, 0.10), 0.42, 0.0, 0.12)
layer_lines(M["pla_green"], 9.0, 0.25)
M["pcb_black"] = mat("PCB_preto", (0.012, 0.014, 0.018), 0.38, 0.0, 0.35)
M["pcb_blue"] = mat("PCB_azul", (0.015, 0.04, 0.22), 0.38, 0.0, 0.35)
M["silver"] = mat("Metal_prata", (0.78, 0.79, 0.82), 0.28, 1.0)
M["gold"] = mat("Metal_ouro", (0.95, 0.58, 0.14), 0.3, 1.0)
M["steel"] = mat("Aco", (0.55, 0.57, 0.6), 0.35, 1.0)
M["black"] = mat("Plastico_preto", (0.01, 0.01, 0.012), 0.45, 0.0, 0.1)
M["cell"] = mat("Bateria_azul", (0.01, 0.09, 0.5), 0.33, 0.0, 0.6)
M["glass"] = mat("Vidro_OLED", (0.004, 0.005, 0.009), 0.05, 0.0, 1.0)
M["oled_txt"] = mat("OLED_texto", (0.6, 0.8, 1.0), 0.4, 0.0, 0.0, ((0.65, 0.85, 1.0), 6.0))
M["white"] = mat("Serigrafia", (0.85, 0.88, 0.85), 0.5)
M["ledg"] = mat("LED_verde", (0.05, 0.9, 0.2), 0.3, 0.0, 0.0, ((0.1, 1.0, 0.3), 8.0))
M["ledb"] = mat("LED_azul", (0.05, 0.3, 1.0), 0.3, 0.0, 0.0, ((0.1, 0.4, 1.0), 6.0))
M["btn"] = mat("Botao", (0.02, 0.02, 0.025), 0.5, 0.0, 0.1)

# ------------------------------------------------------------------ helpers
def link(ob, parent=None):
    col.objects.link(ob)
    if parent:
        ob.parent = parent
    return ob

def mesh_obj(name, bm, m, parent, loc, rot, smooth=False):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    if smooth:
        for p in me.polygons:
            p.use_smooth = True
    if m:
        me.materials.append(m)
    ob = bpy.data.objects.new(name, me)
    ob.location = loc
    ob.rotation_euler = rot
    return link(ob, parent)

def box(name, size, loc, m, parent=None, rot=(0, 0, 0), bevel=0.0):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=Vector(size), verts=bm.verts)
    ob = mesh_obj(name, bm, m, parent, loc, rot, smooth=bool(bevel))
    if bevel:
        md = ob.modifiers.new("bevel", 'BEVEL')
        md.width = bevel
        md.segments = 3
        md.limit_method = 'ANGLE'
        wn = ob.modifiers.new("wn", 'WEIGHTED_NORMAL')
        wn.keep_sharp = True
    return ob

def cyl(name, r, depth, loc, m, parent=None, rot=(0, 0, 0), seg=32):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg, radius1=r, radius2=r, depth=depth)
    ob = mesh_obj(name, bm, m, parent, loc, rot, smooth=True)
    ob.modifiers.new("es", 'EDGE_SPLIT')
    return ob

def poly(name, pts, depth, loc, m, parent):
    bm = bmesh.new()
    vs = [bm.verts.new((x, y, 0)) for x, y in pts]
    f = bm.faces.new(vs)
    r = bmesh.ops.extrude_face_region(bm, geom=[f])
    vv = [e for e in r["geom"] if isinstance(e, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, vec=(0, 0, depth), verts=vv)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return mesh_obj(name, bm, m, parent, loc, (0, 0, 0))

def text(name, s, size, loc, m, parent, align='CENTER', extrude=0.0):
    cu = bpy.data.curves.new(name, 'FONT')
    cu.body = s
    cu.size = size
    cu.align_x = align
    cu.align_y = 'CENTER'
    cu.extrude = extrude
    cu.materials.append(m)
    ob = bpy.data.objects.new(name, cu)
    ob.location = loc
    return link(ob, parent)

def pins(name, n, pitch, x0, y, z, parent, size=(0.09, 0.09, 0.03)):
    bm = bmesh.new()
    for i in range(n):
        c = bmesh.ops.create_cube(bm, size=1.0)
        bmesh.ops.scale(bm, vec=Vector(size), verts=c["verts"])
        bmesh.ops.translate(bm, vec=(x0 + i * pitch, y, z), verts=c["verts"])
    return mesh_obj(name, bm, M["gold"], parent, (0, 0, 0), (0, 0, 0))

def cut(ob, cutter, name):
    md = ob.modifiers.new(name, 'BOOLEAN')
    md.operation = 'DIFFERENCE'
    md.solver = 'EXACT'
    md.object = cutter
    cutter.hide_render = True
    cutter.hide_viewport = True
    cutter.display_type = 'WIRE'

def reorder_wn_last(ob):
    for md in list(ob.modifiers):
        if md.type == 'WEIGHTED_NORMAL':
            ob.modifiers.move(list(ob.modifiers).index(md), len(ob.modifiers) - 1)

# ------------------------------------------------------------------ raiz (cena em metros)
root = bpy.data.objects.new("lora", None)
root.scale = (0.01, 0.01, 0.01)
link(root)

# ------------------------------------------------------------------ geometria da caixa
W, H, YTOP, YBOT = 7.6, 9.5, -2.4, -4.6
theta = math.atan2(abs(YBOT - YTOP), H)
up = Vector((0, math.sin(theta), math.cos(theta)))        # tangente subindo a rampa
nrm = Vector((0, -math.cos(theta), math.sin(theta)))      # normal para fora da face frontal

def frame_at(z):
    y = YBOT + (z / H) * (YTOP - YBOT)
    M4 = Matrix(((1, 0, 0, 0), (0, up.y, nrm.y, y), (0, up.z, nrm.z, z), (0, 0, 0, 1)))
    e = bpy.data.objects.new("frame_%s" % round(z, 1), None)
    e.parent = root
    e.matrix_basis = M4
    return link(e, root)

f_win = frame_at(6.2)
f_logo = frame_at(1.65)

# corpo em cunha
bm = bmesh.new()
pts = [(0, 0), (YBOT, 0), (YTOP, H), (0, H)]
Lv = [bm.verts.new((-W / 2, y, z)) for y, z in pts]
Rv = [bm.verts.new((W / 2, y, z)) for y, z in pts]
bm.faces.new(Lv[::-1])
bm.faces.new(Rv)
for i in range(4):
    j = (i + 1) % 4
    bm.faces.new((Lv[i], Lv[j], Rv[j], Rv[i]))
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
case = mesh_obj("lora_case", bm, M["pla"], root, (0, 0, 0), (0, 0, 0), smooth=True)
bv = case.modifiers.new("bevel", 'BEVEL')
bv.width = 0.22
bv.segments = 3
bv.limit_method = 'ANGLE'

# recorte da janela frontal (rebaixo de 5 mm) e do compartimento das baterias
c_win = box("cut_window", (5.6, 5.8, 1.0), (0, 0, 0), None, f_win)
cut(case, c_win, "janela")
c_bat = box("cut_bateria", (6.9, 2.1, 4.2), (0, -0.95, 2.8), None, root)
cut(case, c_bat, "bateria")

# orelhas de fixacao com furo
for s in (-1, 1):
    ear = box("lora_ear_%d" % s, (1.7, 0.6, 1.9), (s * 2.95, -0.3, H + 0.45), M["pla"], root, bevel=0.15)
    hole = cyl("cut_furo_%d" % s, 0.28, 2.0, (s * 2.95, -0.3, H + 0.85), None, root, rot=(math.pi / 2, 0, 0), seg=24)
    cut(ear, hole, "furo")
    reorder_wn_last(ear)
bm_wn = case.modifiers.new("wn", 'WEIGHTED_NORMAL')
bm_wn.keep_sharp = True

# logo W-Guard (filamento verde em relevo na parte inferior)
shield = [(0, 1.0), (0.75, 0.78), (0.72, -0.2), (0, -0.85), (-0.72, -0.2), (-0.75, 0.78)]
poly("logo_escudo", shield, 0.06, (0, 0.3, 0), M["pla_green"], f_logo)
for s in (-1, 1):
    wing = [(0.8, 0.7), (2.2, 1.1), (1.95, 0.78), (2.25, 0.52), (1.9, 0.33), (2.1, 0.08), (1.6, -0.08), (0.85, 0.05)]
    poly("logo_asa_%d" % s, [(s * x, y) for x, y in wing] if s > 0 else [(-x, y) for x, y in wing][::-1], 0.06, (0, 0.3, 0), M["pla_green"], f_logo)
text("logo_texto", "W-GUARD", 0.52, (0, -1.15, 0), M["pla_green"], f_logo, extrude=0.035)

# ------------------------------------------------------------------ eletronica na janela (coords locais: x, y rampa acima, z para fora)
ZF = -0.5   # piso do rebaixo
# ESP32 DevKit V1
ex, ey = 0.0, 1.5
zt = ZF + 0.12 + 0.16
for sx in (-2.3, 2.3):
    for sy in (-1.2, 1.2):
        cyl("esp_poste", 0.16, 0.12, (ex + sx, ey + sy, ZF + 0.06), M["black"], f_win, seg=12)
box("esp32_placa", (5.1, 2.8, 0.16), (ex, ey, ZF + 0.12 + 0.08), M["pcb_black"], f_win, bevel=0.03)
box("esp32_blindagem", (1.8, 1.8, 0.3), (0.9, ey, zt + 0.15), M["silver"], f_win, bevel=0.03)
text("esp32_texto", "ESP-WROOM-32", 0.17, (0.9, ey + 0.1, zt + 0.305), M["black"], f_win)
text("esp32_texto2", "ESPRESSIF", 0.11, (0.9, ey - 0.25, zt + 0.305), M["black"], f_win)
box("esp32_antena", (0.75, 1.8, 0.03), (2.175, ey, zt + 0.015), M["pcb_black"], f_win)
for i in range(4):
    box("esp32_trilha", (0.05, 1.35, 0.01), (1.95 + i * 0.15, ey, zt + 0.035), M["gold"], f_win)
box("esp32_cp2102", (0.5, 0.5, 0.1), (-1.3, ey, zt + 0.05), M["black"], f_win)
box("esp32_usb", (0.62, 0.75, 0.26), (-2.38, ey, zt + 0.13), M["silver"], f_win, bevel=0.03)
for sy in (-0.95, 0.95):
    box("esp32_botao", (0.4, 0.4, 0.16), (-1.85, ey + sy, zt + 0.08), M["btn"], f_win, bevel=0.03)
    cyl("esp32_botao_topo", 0.12, 0.06, (-1.85, ey + sy, zt + 0.19), M["silver"], f_win, seg=16)
box("esp32_led", (0.14, 0.14, 0.06), (-0.85, ey - 0.95, zt + 0.03), M["ledb"], f_win)
for sy in (-1.25, 1.25):
    box("esp32_header", (4.85, 0.26, 0.26), (0.1, ey + sy, zt + 0.13), M["black"], f_win, bevel=0.02)
    pins("esp32_pinos", 19, 0.254, -2.15, ey + sy, zt + 0.27, f_win)
text("esp32_serigrafia", "ESP32 DEVKIT V1", 0.12, (-0.95, ey + 0.55, zt + 0.01), M["white"], f_win)

# OLED 0.96"
ox, oy = -1.4, -1.4
zo = ZF + 0.12 + 0.06
box("oled_placa", (2.7, 2.8, 0.12), (ox, oy, zo), M["pcb_blue"], f_win, bevel=0.03)
for sx in (-1.2, 1.2):
    for sy in (-1.25, 1.25):
        cyl("oled_furo", 0.11, 0.015, (ox + sx, oy + sy, zo + 0.065), M["gold"], f_win, seg=16)
zg = zo + 0.06
box("oled_vidro", (2.62, 1.9, 0.07), (ox, -1.0, zg + 0.035), M["glass"], f_win, bevel=0.02)
zs = zg + 0.075
text("oled_l1", "W-GUARD", 0.2, (ox - 1.0, -0.6, zs), M["oled_txt"], f_win, align='LEFT')
text("oled_l2", "12.4 L/min", 0.2, (ox - 1.0, -0.92, zs), M["oled_txt"], f_win, align='LEFT')
text("oled_l3", "BAT 87%  -72dBm", 0.13, (ox - 1.0, -1.25, zs), M["oled_txt"], f_win, align='LEFT')
box("oled_header", (1.1, 0.25, 0.22), (ox, oy - 1.25, zo + 0.17), M["black"], f_win)
pins("oled_pinos", 4, 0.254, ox - 0.38, oy - 1.25, zo + 0.29, f_win)

# modulo LoRa SX1278 (Ra-02)
lx, ly = 0.95, -1.4
zl = ZF + 0.12 + 0.05
box("lora_ra02_placa", (1.7, 1.6, 0.1), (lx, ly, zl), M["pcb_blue"], f_win, bevel=0.02)
box("lora_ra02_blindagem", (1.1, 1.0, 0.22), (lx - 0.1, ly, zl + 0.16), M["silver"], f_win, bevel=0.03)
text("lora_ra02_texto", "RA-02", 0.16, (lx - 0.1, ly, zl + 0.275), M["black"], f_win)
for sy in (-0.72, 0.72):
    pins("lora_ra02_pads", 8, 0.2, lx - 0.7, ly + sy, zl + 0.055, f_win, size=(0.1, 0.12, 0.012))
box("lora_ufl", (0.22, 0.22, 0.12), (lx + 0.62, ly + 0.1, zl + 0.11), M["gold"], f_win, bevel=0.02)

# botao e LED de status
box("ctrl_placa", (0.9, 2.1, 0.1), (2.3, -1.45, ZF + 0.12 + 0.05), M["pcb_black"], f_win)
cyl("ctrl_botao", 0.3, 0.22, (2.3, -0.8, ZF + 0.12 + 0.21), M["btn"], f_win, seg=24)
cyl("ctrl_botao_aro", 0.33, 0.05, (2.3, -0.8, ZF + 0.12 + 0.12), M["silver"], f_win, seg=24)
cyl("ctrl_led", 0.13, 0.14, (2.3, -2.0, ZF + 0.12 + 0.17), M["ledg"], f_win, seg=16)

# ------------------------------------------------------------------ baterias 18650 (compartimento traseiro)
for i, zc in enumerate((1.75, 3.85)):
    nm = "bateria_%d" % (i + 1)
    cyl(nm, 0.93, 6.3, (0, -1.2, zc), M["cell"], root, rot=(0, math.pi / 2, 0), seg=40)
    for s in (-1, 1):
        cyl(nm + "_tampa", 0.9, 0.1, (s * 3.2, -1.2, zc), M["silver"], root, rot=(0, math.pi / 2, 0), seg=40)
    cyl(nm + "_polo", 0.35, 0.12, (3.3, -1.2, zc), M["silver"], root, rot=(0, math.pi / 2, 0), seg=24)
    for s in (-1, 1):
        box(nm + "_contato", (0.15, 1.5, 1.7), (s * 3.42, -1.2, zc), M["steel"], root, bevel=0.03)
box("bateria_suporte", (6.9, 0.2, 4.2), (0, -1.95, 2.8), M["black"], root)

bpy.context.view_layer.update()
os.makedirs(OUT, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "wguard.blend"))
