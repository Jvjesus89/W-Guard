
# ============================ LINHA DE AGUA + ELETRONICA (cm; grupo 'hydro' com escala 0.01) ============================
for _n, _a in (("pvc", ((0.78, 0.80, 0.80), 0.38, 0.0, 0.3)), ("brass", ((0.85, 0.52, 0.16), 0.32, 1.0, 0.0)),
               ("nylon", ((0.03, 0.032, 0.036), 0.5, 0.0, 0.1)), ("abs", ((0.5, 0.52, 0.55), 0.5, 0.0, 0.1)),
               ("white_pl", ((0.85, 0.86, 0.88), 0.35, 0.0, 0.3)), ("plate", ((0.7, 0.72, 0.74), 0.45, 0.0, 0.05)),
               ("w_red", ((0.7, 0.02, 0.02), 0.5, 0.0, 0.1)), ("w_blk", ((0.012, 0.012, 0.014), 0.5, 0.0, 0.1)),
               ("w_yel", ((0.9, 0.7, 0.04), 0.5, 0.0, 0.1)), ("w_wht", ((0.8, 0.8, 0.8), 0.5, 0.0, 0.1)),
               ("tp_blue", ((0.02, 0.13, 0.55), 0.38, 0.0, 0.35)), ("red_pcb", ((0.45, 0.02, 0.03), 0.38, 0.0, 0.35)),
               ("green_blk", ((0.03, 0.4, 0.12), 0.45, 0.0, 0.1)), ("ledr", ((0.9, 0.05, 0.03), 0.3, 0.0, 0.0)),
               ("trim", ((0.0, 0.18, 0.8), 0.4, 0.0, 0.1)), ("rubber", ((0.015, 0.015, 0.018), 0.6, 0.0, 0.0))):
    M[_n] = mat("H_" + _n, _a[0], _a[1], _a[2], _a[3])
_poly = mat("H_policarbonato", (0.75, 0.8, 0.85), 0.05, 0.0, 0.0)
_b = _poly.node_tree.nodes["Principled BSDF"]
for _k, _v in (("Transmission Weight", 1.0), ("IOR", 1.45)):
    if _k in _b.inputs:
        _b.inputs[_k].default_value = _v
M["poly"] = _poly

hydro = bpy.data.objects.new("hydro", None)
hydro.scale = (0.01, 0.01, 0.01)
hydro.location = (0.12, 0.0, 0.0)
link(hydro)
def group(name):
    e = bpy.data.objects.new(name, None)
    return link(e, hydro)
G = {k: group(k) for k in ("body", "sensor", "power", "valve", "pcb", "cap", "antena")}

ZL = 7.0
def px(name, x0, x1, r, m, parent, y=0.0, z=ZL, seg=48):
    return cyl(name, r, abs(x1 - x0), ((x0 + x1) / 2, y, z), m, parent, rot=(0, math.pi / 2, 0), seg=seg)
def threads(name, x0, x1, r, m, parent, n=5):
    step = (x1 - x0) / n
    for i in range(n):
        px(name + "_rosca", x0 + step * i + step * 0.2, x0 + step * i + step * 0.75, r + 0.05, m, parent, seg=36)
def hexnut(name, x, r, L, m, parent):
    return cyl(name, r, L, (x, 0, ZL), m, parent, rot=(0, math.pi / 2, 0), seg=6)
def cone(name, r1, r2, depth, loc, m, parent=None, rot=(0, 0, 0), seg=24):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg, radius1=r1, radius2=r2, depth=depth)
    ob = mesh_obj(name, bm, m, parent, loc, rot, smooth=True)
    ob.modifiers.new("es", 'EDGE_SPLIT')
    return ob
def sphere(name, r, loc, m, parent, scale=(1, 1, 1)):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=40, v_segments=20, radius=r)
    ob = mesh_obj(name, bm, m, parent, loc, (0, 0, 0), smooth=True)
    ob.scale = scale
    return ob
def wire(name, pts, r, m, parent):
    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = r
    cu.bevel_resolution = 3
    cu.resolution_u = 10
    sp = cu.splines.new('BEZIER')
    sp.bezier_points.add(len(pts) - 1)
    for bp, p in zip(sp.bezier_points, pts):
        bp.co = p
        bp.handle_left_type = 'AUTO'
        bp.handle_right_type = 'AUTO'
    cu.materials.append(m)
    return link(bpy.data.objects.new(name, cu), parent)

# ------------------------------------------------ BODY: tubos PVC, luvas, T com eletrodos
b = G["body"]
for i, (x0, x1) in enumerate([(0, 4), (10.5, 13.5), (19.5, 22.5), (27.5, 30.5), (36.5, 40.5)]):
    px("body_tubo_%d" % (i + 1), x0, x1, 1.0, M["pvc"], b)
for i, x in enumerate([4, 10.5, 13.5, 19.5, 30.5, 36.5]):
    px("body_luva_%d" % (i + 1), x - 1.0, x + 1.0, 1.28, M["pvc"], b)
for i, (xa, xb_) in enumerate([(-1.3, 0.0), (40.0, 41.3)]):
    px("body_conexao_%d" % (i + 1), xa, xb_, 1.3, M["pvc"], b)
xT = 25.0
px("body_T_corpo", 22.5, 27.5, 1.25, M["pvc"], b)
for i, x in enumerate((22.9, 27.1)):
    px("body_T_hub_%d" % (i + 1), x - 0.4, x + 0.4, 1.45, M["pvc"], b)
cyl("body_T_ramal", 1.25, 4.4, (xT, 0, ZL + 2.2), M["pvc"], b)
cyl("body_T_ramal_hub", 1.45, 0.7, (xT, 0, ZL + 3.6), M["pvc"], b)
cyl("body_T_tampa", 1.35, 0.6, (xT, 0, ZL + 4.7), M["pvc"], b)
for k, sx in enumerate((-0.55, 0.55)):
    cyl("body_eletrodo_%d_haste" % (k + 1), 0.17, 3.0, (xT + sx, 0, ZL + 3.6), M["steel"], b, seg=16)
    cyl("body_eletrodo_%d_terminal" % (k + 1), 0.5, 0.06, (xT + sx, 0, ZL + 5.03), M["gold"], b, seg=20)
    cyl("body_eletrodo_%d_cabeca" % (k + 1), 0.36, 0.22, (xT + sx, 0, ZL + 5.17), M["steel"], b, seg=24)
    box("body_eletrodo_%d_fenda" % (k + 1), (0.46, 0.07, 0.05), (xT + sx, 0, ZL + 5.29), M["black"], b)

# ------------------------------------------------ SENSOR YF-S201
s = G["sensor"]
xs = 7.25
box("sensor_corpo", (2.6, 3.4, 3.4), (xs, 0, ZL), M["nylon"], s, bevel=0.5)
for sg in (-1, 1):
    px("sensor_hub_%d" % sg, xs + sg * 1.65, xs + sg * 2.0, 1.5, M["nylon"], s)
    px("sensor_bocal_%d" % sg, xs + sg * 2.0, xs + sg * 3.25, 1.1, M["nylon"], s)
    threads("sensor_%d" % sg, min(xs + sg * 2.0, xs + sg * 3.25), max(xs + sg * 2.0, xs + sg * 3.25), 1.1, M["nylon"], s, 4)
box("sensor_hall", (1.6, 1.2, 0.9), (xs, 0, ZL + 1.7 + 0.35), M["nylon"], s, bevel=0.12)
t = text("sensor_texto", "YF-S201", 0.42, (xs, -1.705, ZL), M["white"], s)
t.rotation_euler = (math.pi / 2, 0, 0)
t2 = text("sensor_seta", "->", 0.5, (xs, -1.705, ZL - 0.9), M["white"], s)
t2.rotation_euler = (math.pi / 2, 0, 0)

# ------------------------------------------------ GERADOR HIDRAULICO F50-5V
p = G["power"]
xg = 16.5
px("power_gerador_corpo", xg - 1.5, xg + 1.5, 1.9, M["nylon"], p)
for i in range(3):
    px("power_gerador_nervura_%d" % i, xg - 1.1 + i * 1.1, xg - 0.95 + i * 1.1, 1.96, M["nylon"], p)
for sg in (-1, 1):
    px("power_gerador_tampa_%d" % sg, xg + sg * 1.5, xg + sg * 2.1, 1.55, M["nylon"], p)
    px("power_gerador_bocal_%d" % sg, xg + sg * 2.1, xg + sg * 3.0, 1.1, M["nylon"], p)
    threads("power_gerador_%d" % sg, min(xg + sg * 2.1, xg + sg * 3.0), max(xg + sg * 2.1, xg + sg * 3.0), 1.1, M["nylon"], p, 3)
px("power_gerador_faixa", xg - 0.6, xg + 0.6, 1.93, M["silver"], p)
t = text("power_gerador_texto", "F50-5V", 0.34, (xg, -1.94, ZL), M["black"], p)
t.rotation_euler = (math.pi / 2, 0, 0)
box("power_gerador_bornes", (1.6, 1.0, 0.5), (xg, 0, ZL + 1.9 + 0.2), M["nylon"], p, bevel=0.08)

# ------------------------------------------------ VALVULA DE ESFERA MOTORIZADA
v = G["valve"]
xv = 33.5
sphere("valve_corpo", 1.9, (xv, 0, ZL), M["brass"], v, scale=(1.0, 0.85, 0.95))
for sg in (-1, 1):
    hexnut("valve_porca_%d" % sg, xv + sg * 2.1, 1.55, 1.0, M["brass"], v)
    px("valve_bocal_%d" % sg, xv + sg * 2.6, xv + sg * 3.0, 1.1, M["brass"], v)
cyl("valve_pescoco", 0.85, 1.6, (xv, 0, ZL + 2.0), M["brass"], v)
cyl("valve_base_atuador", 1.5, 0.5, (xv, 0, ZL + 2.9), M["steel"], v)
cyl("valve_atuador", 2.1, 4.2, (xv, 0, ZL + 5.2), M["white_pl"], v, seg=48)
sphere("valve_atuador_topo", 2.1, (xv, 0, ZL + 7.3), M["white_pl"], v, scale=(1, 1, 0.35))
box("valve_indicador", (0.3, 1.8, 0.3), (xv, 0, ZL + 8.0), M["ledr"], v, bevel=0.06)
cyl("valve_prensa_cabo", 0.4, 0.9, (xv + 2.25, 0, ZL + 4.8), M["rubber"], v, rot=(0, math.pi / 2, 0), seg=20)

# ------------------------------------------------ CAIXA ESTANQUE IP65
c = G["cap"]
xb, yb, zb = 16.5, 0.0, ZL + 11.0
BW, BD, BH = 16.0, 11.0, 5.5
FZ = -BH / 2 + 0.3
PZ = FZ + 0.7
def P(x, y, z):
    return (xb + x, yb + y, zb + z)
tub = box("cap_caixa", (BW, BD, BH), P(0, 0, 0), M["abs"], c, bevel=0.5)
inner = box("cut_interior", (BW - 0.7, BD - 0.7, BH), P(0, 0, 0.3), None, c)
cut(tub, inner, "interior")
reorder_wn_last(tub)
box("cap_tampa", (BW, BD, 0.45), P(0, 0, BH / 2 + 0.23), M["poly"], c, bevel=0.15)
for sx in (-7.0, 7.0):
    for sy in (-4.6, 4.6):
        cyl("cap_parafuso", 0.3, 0.2, P(sx, sy, BH / 2 + 0.55), M["steel"], c, seg=20)
        box("cap_parafuso_fenda", (0.42, 0.07, 0.05), P(sx, sy, BH / 2 + 0.66), M["black"], c)
GX = [11.5, 15.0, 18.0, 21.5]
GY = -2.0
zbot = zb - BH / 2
for i, gx in enumerate(GX):
    cyl("cap_prensa_%d" % (i + 1), 0.55, 1.1, (gx, GY, zbot - 0.45), M["rubber"], c, seg=20)
    cyl("cap_prensa_porca_%d" % (i + 1), 0.72, 0.3, (gx, GY, zbot + 0.1), M["rubber"], c, seg=6)
# suportes (abracadeiras + hastes) da caixa na tubulacao
for i, x in enumerate((12.0, 21.0)):
    px("cap_abracadeira_%d" % (i + 1), x - 0.5, x + 0.5, 1.36, M["nylon"], c)
    zl, zh = ZL + 1.2, zbot
    box("cap_haste_%d" % (i + 1), (1.0, 1.2, zh - zl), (x, 0, (zl + zh) / 2), M["nylon"], c, bevel=0.1)

# ------------------------------------------------ ELETRONICA (pcb / power)
pc = G["pcb"]
box("pcb_placa", (14.0, 9.2, 0.2), P(0, 0, FZ + 0.6), M["plate"], pc, bevel=0.05)
for sx in (-6.3, 6.3):
    for sy in (-4.0, 4.0):
        cyl("pcb_pilar", 0.3, 0.5, P(sx, sy, FZ + 0.25), M["nylon"], pc, seg=16)

def esp32(pre, parent, ox, oy, oz):
    zt = oz + 0.28
    for sx in (-2.3, 2.3):
        for sy in (-1.2, 1.2):
            cyl(pre + "_poste", 0.16, 0.12, (ox + sx, oy + sy, oz + 0.06), M["black"], parent, seg=12)
    box(pre + "_placa", (5.1, 2.8, 0.16), (ox, oy, oz + 0.2), M["pcb_black"], parent, bevel=0.03)
    box(pre + "_blindagem", (1.8, 1.8, 0.3), (ox + 0.9, oy, zt + 0.15), M["silver"], parent, bevel=0.03)
    text(pre + "_texto", "ESP-WROOM-32", 0.17, (ox + 0.9, oy + 0.1, zt + 0.305), M["black"], parent)
    box(pre + "_antena", (0.75, 1.8, 0.03), (ox + 2.175, oy, zt + 0.015), M["pcb_black"], parent)
    for i in range(4):
        box(pre + "_trilha", (0.05, 1.35, 0.01), (ox + 1.95 + i * 0.15, oy, zt + 0.035), M["gold"], parent)
    box(pre + "_cp2102", (0.5, 0.5, 0.1), (ox - 1.3, oy, zt + 0.05), M["black"], parent)
    box(pre + "_usb", (0.62, 0.75, 0.26), (ox - 2.38, oy, zt + 0.13), M["silver"], parent, bevel=0.03)
    for sy in (-0.95, 0.95):
        box(pre + "_botao", (0.4, 0.4, 0.16), (ox - 1.85, oy + sy, zt + 0.08), M["btn"], parent, bevel=0.03)
        cyl(pre + "_botao_topo", 0.12, 0.06, (ox - 1.85, oy + sy, zt + 0.19), M["silver"], parent, seg=16)
    box(pre + "_led", (0.14, 0.14, 0.06), (ox - 0.85, oy - 0.95, zt + 0.03), M["ledb"], parent)
    for sy in (-1.25, 1.25):
        box(pre + "_header", (4.85, 0.26, 0.26), (ox + 0.1, oy + sy, zt + 0.13), M["black"], parent, bevel=0.02)
        pins(pre + "_pinos", 19, 0.254, ox - 2.15, oy + sy, zt + 0.27, parent)
    text(pre + "_serigrafia", "ESP32 DEVKIT V1", 0.12, (ox - 0.95, oy + 0.55, zt + 0.01), M["white"], parent)

def ra02(pre, parent, lx, ly, zl):
    box(pre + "_placa", (1.7, 1.6, 0.1), (lx, ly, zl + 0.05), M["pcb_blue"], parent, bevel=0.02)
    box(pre + "_blindagem", (1.1, 1.0, 0.22), (lx - 0.1, ly, zl + 0.21), M["silver"], parent, bevel=0.03)
    text(pre + "_texto", "RA-02", 0.16, (lx - 0.1, ly, zl + 0.325), M["black"], parent)
    for sy in (-0.72, 0.72):
        pins(pre + "_pads", 8, 0.2, lx - 0.7, ly + sy, zl + 0.105, parent, size=(0.1, 0.12, 0.012))
    box(pre + "_ufl", (0.22, 0.22, 0.12), (lx + 0.62, ly + 0.1, zl + 0.16), M["gold"], parent, bevel=0.02)

def tp4056(pre, parent, ox, oy, oz):
    box(pre + "_placa", (2.6, 1.7, 0.1), (ox, oy, oz + 0.05), M["tp_blue"], parent, bevel=0.02)
    box(pre + "_usb", (0.85, 0.75, 0.3), (ox - 1.1, oy, oz + 0.25), M["silver"], parent, bevel=0.03)
    box(pre + "_ci1", (0.5, 0.4, 0.08), (ox + 0.3, oy + 0.35, oz + 0.14), M["black"], parent)
    box(pre + "_ci2", (0.5, 0.4, 0.08), (ox + 0.3, oy - 0.35, oz + 0.14), M["black"], parent)
    box(pre + "_led_r", (0.14, 0.14, 0.07), (ox + 0.85, oy + 0.55, oz + 0.13), M["ledr"], parent)
    box(pre + "_led_v", (0.14, 0.14, 0.07), (ox + 0.85, oy - 0.55, oz + 0.13), M["ledg"], parent)
    for sx in (-1.1, 1.1):
        for sy in (-0.65, 0.65):
            cyl(pre + "_pad", 0.14, 0.02, (ox + sx, oy + sy, oz + 0.105), M["gold"], parent, seg=16)
    text(pre + "_texto", "TP4056", 0.16, (ox + 0.2, oy, oz + 0.105), M["white"], parent)

def l9110s(pre, parent, ox, oy, oz):
    box(pre + "_placa", (2.9, 2.3, 0.1), (ox, oy, oz + 0.05), M["red_pcb"], parent, bevel=0.02)
    for sy in (-0.55, 0.55):
        box(pre + "_ci", (0.55, 0.45, 0.09), (ox - 0.3, oy + sy, oz + 0.145), M["black"], parent)
    box(pre + "_borne", (1.0, 0.6, 0.5), (ox + 0.85, oy - 0.7, oz + 0.35), M["green_blk"], parent, bevel=0.03)
    box(pre + "_header", (0.8, 0.25, 0.25), (ox - 0.2, oy + 0.95, oz + 0.225), M["black"], parent)
    pins(pre + "_pinos", 3, 0.254, ox - 0.45, oy + 0.95, oz + 0.36, parent)
    text(pre + "_texto", "L9110S", 0.16, (ox - 0.5, oy - 0.2, oz + 0.105), M["white"], parent)

def mt3608(pre, parent, ox, oy, oz):
    box(pre + "_placa", (3.7, 1.7, 0.1), (ox, oy, oz + 0.05), M["tp_blue"], parent, bevel=0.02)
    box(pre + "_indutor", (0.95, 0.95, 0.5), (ox - 1.0, oy, oz + 0.35), M["black"], parent, bevel=0.08)
    box(pre + "_ci", (0.4, 0.3, 0.07), (ox + 0.2, oy + 0.3, oz + 0.135), M["black"], parent)
    box(pre + "_diodo", (0.4, 0.3, 0.08), (ox + 0.2, oy - 0.35, oz + 0.14), M["black"], parent)
    box(pre + "_trimpot", (0.4, 0.4, 0.3), (ox + 1.0, oy, oz + 0.25), M["trim"], parent, bevel=0.03)
    cyl(pre + "_trimpot_parafuso", 0.1, 0.05, (ox + 1.0, oy, oz + 0.41), M["gold"], parent, seg=16)
    for sy in (-0.45, 0.45):
        cyl(pre + "_cap", 0.28, 0.5, (ox + 0.2 + 0.0, oy + sy * 1.5, oz + 0.35), M["black"], parent, seg=20)
    for sx in (-1.55, 1.55):
        for sy in (-0.65, 0.65):
            cyl(pre + "_pad", 0.13, 0.02, (ox + sx, oy + sy, oz + 0.105), M["gold"], parent, seg=16)
    text(pre + "_texto", "MT3608", 0.14, (ox + 0.8, oy - 0.55, oz + 0.105), M["white"], parent)

x0, y0, z0 = P(0, 0, PZ)
esp32("pcb_esp32", pc, x0 + 2.4, y0 + 2.6, z0)
ra02("pcb_lora_ra02", pc, x0 + 6.1, y0 + 3.0, z0)
l9110s("pcb_l9110s", pc, x0 + 2.2, y0 - 0.6, z0)
mt3608("pcb_mt3608", pc, x0 + 5.2, y0 - 3.3, z0)
tp4056("power_tp4056", p, x0 - 4.2, y0 + 1.8, z0)

# baterias 18650 (power)
bx, by = x0 - 3.6, y0 - 2.4
box("power_suporte_base", (7.1, 4.1, 0.2), (bx, by, z0 + 0.1), M["black"], p)
for sg in (-1, 1):
    box("power_suporte_parede_%d" % sg, (0.25, 4.1, 1.5), (bx + sg * 3.45, by, z0 + 0.75), M["black"], p, bevel=0.04)
for i, dy in enumerate((-0.95, 0.95)):
    zc = z0 + 0.2 + 0.93
    nm = "power_bateria_%d" % (i + 1)
    cyl(nm, 0.93, 6.3, (bx, by + dy, zc), M["cell"], p, rot=(0, math.pi / 2, 0), seg=40)
    for sg in (-1, 1):
        cyl(nm + "_tampa", 0.9, 0.1, (bx + sg * 3.2, by + dy, zc), M["silver"], p, rot=(0, math.pi / 2, 0), seg=40)
    cyl(nm + "_polo", 0.35, 0.12, (bx + 3.3, by + dy, zc), M["silver"], p, rot=(0, math.pi / 2, 0), seg=24)

# ------------------------------------------------ ANTENA 433 MHz (SMA + pigtail)
a = G["antena"]
asx = xb + BW / 2
px("antena_sma_porca", asx - 0.1, asx + 0.5, 0.5, M["gold"], a, y=0, z=zb + 0.5, seg=6)
px("antena_sma_cotovelo", asx + 0.5, asx + 1.5, 0.4, M["gold"], a, y=0, z=zb + 0.5, seg=24)
cyl("antena_sma_haste", 0.4, 1.0, (asx + 1.5, 0, zb + 1.0), M["gold"], a, seg=24)
cyl("antena_base", 0.62, 1.4, (asx + 1.5, 0, zb + 2.2), M["rubber"], a, seg=24)
cone("antena_corpo", 0.52, 0.4, 14.0, (asx + 1.5, 0, zb + 2.9 + 7.0), M["rubber"], a, seg=24)
sphere("antena_ponta", 0.4, (asx + 1.5, 0, zb + 2.9 + 14.0), M["rubber"], a)
wire("antena_pigtail", [P(6.1 - 0.3, 3.0 - 0.7, PZ + 0.2), P(6.9, 2.0, PZ + 1.2), P(7.6, 0.6, 0.5), P(7.9, 0.0, 0.5)], 0.07, M["w_blk"], a)

# ------------------------------------------------ CABOS (componentes -> prensa-cabos -> placas)
def feed(name_pre, start, gx, colors, y_off, inside_target):
    for k, (col_m, dy) in enumerate(zip(colors, y_off)):
        sx_, sy_, sz_ = start
        up = [(sx_, sy_ + dy, sz_), (sx_ + (gx - sx_) * 0.15, sy_ + dy - 0.6, sz_ + 2.5),
              (gx - (gx - sx_) * 0.1, GY + dy * 0.5, zbot - 2.2), (gx, GY + dy * 0.5, zbot - 0.2)]
        wire("%s_fio_ext_%d" % (name_pre, k + 1), up, 0.11, col_m, c)
        tx, ty, tz = inside_target[k]
        inn = [(gx, GY + dy * 0.5, zbot + 0.3), (gx, GY + dy * 0.4, zbot + 1.0), (tx, ty, tz + 0.9), (tx, ty, tz + 0.15)]
        wire("%s_fio_int_%d" % (name_pre, k + 1), inn, 0.1, col_m, pc)
feed("sensor", (xs, 0, ZL + 2.6), GX[0], (M["w_red"], M["w_yel"], M["w_blk"]), (-0.25, 0, 0.25),
     [(x0 + 0.4, y0 + 3.9, z0 + 0.6), (x0 + 0.65, y0 + 3.9, z0 + 0.6), (x0 + 0.9, y0 + 3.9, z0 + 0.6)])
feed("gerador", (xg, 0, ZL + 2.45), GX[1], (M["w_red"], M["w_blk"]), (-0.2, 0.2),
     [(x0 - 3.4, y0 + 2.2, z0 + 0.3), (x0 - 3.4, y0 + 1.4, z0 + 0.3)])
feed("eletrodos", (xT, 0, ZL + 5.1), GX[2], (M["w_red"], M["w_blk"]), (-0.55, 0.55),
     [(x0 + 3.1, y0 + 0.6, z0 + 0.6), (x0 + 3.4, y0 + 0.6, z0 + 0.6)])
feed("valvula", (xv + 2.7, 0, ZL + 4.8), GX[3], (M["w_red"], M["w_blk"], M["w_wht"]), (-0.2, 0.2, 0),
     [(x0 + 1.2, y0 - 1.5, z0 + 0.3), (x0 + 1.8, y0 - 1.5, z0 + 0.3), (x0 + 2.4, y0 - 1.5, z0 + 0.3)])
# fios entre baterias -> TP4056 -> MT3608 -> ESP32
wire("power_fio_bat_pos", [(bx + 3.35, by + 0.95, z0 + 1.1), (bx + 3.5, by + 2.0, z0 + 1.6), (x0 - 3.1, y0 + 2.3, z0 + 0.8), (x0 - 3.1, y0 + 2.45, z0 + 0.15)], 0.1, M["w_red"], p)
wire("power_fio_bat_neg", [(bx - 3.35, by - 0.95, z0 + 1.1), (bx - 3.6, by + 0.5, z0 + 1.7), (x0 - 5.3, y0 + 2.2, z0 + 0.8), (x0 - 5.3, y0 + 2.45, z0 + 0.15)], 0.1, M["w_blk"], p)
wire("pcb_fio_saida_pos", [(x0 - 3.1, y0 + 1.15, z0 + 0.15), (x0 - 1.0, y0 - 1.0, z0 + 1.6), (x0 + 3.6, y0 - 2.8, z0 + 1.4), (x0 + 3.65, y0 - 3.0, z0 + 0.15)], 0.1, M["w_red"], pc)
wire("pcb_fio_saida_neg", [(x0 - 3.1, y0 + 0.85, z0 + 0.15), (x0 - 1.0, y0 - 1.6, z0 + 1.8), (x0 + 3.6, y0 - 3.6, z0 + 1.5), (x0 + 3.65, y0 - 3.7, z0 + 0.15)], 0.1, M["w_blk"], pc)
wire("pcb_fio_5v", [(x0 + 6.75, y0 - 2.8, z0 + 0.15), (x0 + 7.0, y0 - 1.0, z0 + 1.6), (x0 + 4.2, y0 + 1.2, z0 + 1.4), (x0 + 3.9, y0 + 1.6, z0 + 0.5)], 0.1, M["w_red"], pc)
print("objetos:", len(bpy.data.objects))
bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "wguard.blend"))
