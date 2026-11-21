class_name Mundo
extends Node3D
## Mata (árvores, plantas, capim), pedras, troncos, a vila de barracos e as caixas de saque.
## A vegetação fica em pedaços de 64 m (MultiMesh por tipo e por pedaço): cada pedaço escolhe o detalhe pela distância.

const PEDACO := 64.0
var terreno: Terreno
var rng := RandomNumberGenerator.new()
var malhas := {}          # caminho -> Mesh
var grupos := {}          # "tipo:pedaco" -> {mmi, n}
var recursos := []        # {tipo, pos, vida, max, rend, item, grupo, idx, corpo, volta}
var caixas := []          # {corpo, pos, volta, cheia}
var portas := []

const ARVORES := [
	{"m": "res://assets/mata/ilha1.glb", "esc": [1.7, 2.6], "peso": 3, "raio": 0.35},
	{"m": "res://assets/mata/ilha2.glb", "esc": [2.0, 3.0], "peso": 3, "raio": 0.3},
	{"m": "res://assets/mata/pequena.glb", "esc": [1.4, 2.2], "peso": 2, "raio": 0.3},
	{"m": "res://assets/mata/jacaranda.glb", "esc": [0.55, 0.8], "peso": 1, "raio": 0.55},
]
const PLANTAS := ["res://assets/mata/samambaia_0.glb", "res://assets/mata/samambaia_1.glb", "res://assets/mata/calathea_0.glb",
	"res://assets/mata/antorio_0.glb", "res://assets/mata/monguba_0.glb", "res://assets/mata/monguba_1.glb"]
const CAPIM := ["res://assets/mata/capim_0.glb", "res://assets/mata/capim_1.glb", "res://assets/mata/capim_2.glb", "res://assets/mata/capim_3.glb"]
const PEDRAS := ["res://assets/mata/pedra.glb", "res://assets/mata/pedras_musgo_0.glb", "res://assets/mata/pedras_musgo_1.glb",
	"res://assets/mata/pedras_musgo_2.glb", "res://assets/mata/pedras_musgo_3.glb"]

const SAQUE := [["lata", 1, 2, 0.5], ["agua", 1, 2, 0.5], ["pano", 2, 5, 0.6], ["sucata", 2, 6, 0.7], ["bandagem", 1, 2, 0.35],
	["madeira", 10, 30, 0.3], ["facao", 1, 1, 0.06], ["taco", 1, 1, 0.08], ["machado", 1, 1, 0.05], ["picareta", 1, 1, 0.05], ["lanterna", 1, 1, 0.1]]


func _init(t: Terreno) -> void:
	terreno = t
	rng.seed = 2026


## a malha de um modelo .glb (a primeira que tiver); "tinta" escurece/esverdeia o material (casca, folha, pedra)
func malha(caminho: String, tinta := Color(1, 1, 1), tinta_folha := Color(1, 1, 1)) -> Mesh:
	if malhas.has(caminho):
		return malhas[caminho]
	var cena: PackedScene = load(caminho)
	var no := cena.instantiate()
	var m: Mesh = null
	for f in no.find_children("*", "MeshInstance3D", true, false):
		m = (f as MeshInstance3D).mesh
		break
	no.free()
	if m != null and (tinta != Color(1, 1, 1) or tinta_folha != Color(1, 1, 1)):
		for s in m.get_surface_count():
			var mt := m.surface_get_material(s) as BaseMaterial3D
			if mt == null:
				continue
			var novo := mt.duplicate() as BaseMaterial3D
			var folha := novo.transparency != BaseMaterial3D.TRANSPARENCY_DISABLED
			novo.albedo_color = novo.albedo_color * (tinta_folha if folha else tinta)
			(m as ArrayMesh).surface_set_material(s, novo)
	malhas[caminho] = m
	return m


func _chave(p: Vector3, pedaco: float) -> Vector2i:
	return Vector2i(floori((p.x + Terreno.TAM / 2.0) / pedaco), floori((p.z + Terreno.TAM / 2.0) / pedaco))


## guarda uma instância para montar depois (as MultiMesh nascem com o número certo)
var _pend := {}


func _instancia(caminho: String, xf: Transform3D, alc: float, sombra: bool, pedaco := PEDACO) -> Dictionary:
	var k := _chave(xf.origin, pedaco)
	var id := "%s|%d|%d|%d" % [caminho, int(pedaco), k.x, k.y]
	if not _pend.has(id):
		_pend[id] = {"m": caminho, "xfs": [], "alc": alc, "sombra": sombra}
	_pend[id]["xfs"].append(xf)
	return {"grupo": id, "idx": _pend[id]["xfs"].size() - 1}


func _fechar_grupos() -> void:
	for id in _pend:
		var g: Dictionary = _pend[id]
		var mm := MultiMesh.new()
		mm.transform_format = MultiMesh.TRANSFORM_3D
		mm.mesh = malha(g["m"])
		mm.instance_count = g["xfs"].size()
		for i in g["xfs"].size():
			mm.set_instance_transform(i, g["xfs"][i])
		var mmi := MultiMeshInstance3D.new()
		mmi.multimesh = mm
		mmi.visibility_range_end = g["alc"]
		mmi.visibility_range_end_margin = 8.0
		mmi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON if g["sombra"] else GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		add_child(mmi)
		grupos[id] = {"mmi": mmi, "xfs": g["xfs"], "alc": g["alc"]}
	_pend.clear()


func esconder(r: Dictionary) -> void:
	var g: Dictionary = grupos[r["grupo"]]
	(g["mmi"] as MultiMeshInstance3D).multimesh.set_instance_transform(r["idx"], Transform3D(Basis().scaled(Vector3.ZERO), Vector3.ZERO))


func mostrar(r: Dictionary) -> void:
	var g: Dictionary = grupos[r["grupo"]]
	(g["mmi"] as MultiMeshInstance3D).multimesh.set_instance_transform(r["idx"], g["xfs"][r["idx"]])


func _livre(p: Vector2, folga: float) -> bool:
	if p.distance_to(Terreno.CLAREIRA) < 22.0 + folga or p.distance_to(Terreno.VILA) < 40.0 + folga or p.distance_to(Terreno.LAGO) < 46.0:
		return false
	return maxf(absf(p.x), absf(p.y)) < 236.0


func montar() -> void:
	# árvores: mais densas onde o ruído da mata é alto
	var soma := 0
	for a in ARVORES:
		soma += a["peso"]
	# cores da mata um pouco mais escuras e verdes (os modelos vieram claros demais)
	for a in ARVORES:
		malha(a["m"], Color(0.78, 0.72, 0.64), Color(0.82, 1.0, 0.78))
	for m in PEDRAS:
		malha(m, Color(0.8, 0.78, 0.76))
	malha("res://assets/mata/paredao.glb", Color(0.75, 0.72, 0.68))
	malha("res://assets/mata/paredao2.glb", Color(0.75, 0.72, 0.68))
	var tent := 0
	var feitas := 0
	var sombras := []
	while feitas < 700 and tent < 20000:
		tent += 1
		var p := Vector2(rng.randf_range(-236, 236), rng.randf_range(-236, 236))
		if not _livre(p, 0.0):
			continue
		var dens := terreno.ruido.get_noise_2d(p.x * 1.7 + 300, p.y * 1.7) * 0.5 + 0.5
		if rng.randf() > dens * 1.3:
			continue
		var y := terreno.h(p.x, p.y)
		if y < Terreno.AGUA + 0.4:
			continue
		var r := rng.randi_range(1, soma)
		var a: Dictionary = ARVORES[0]
		for b in ARVORES:
			r -= b["peso"]
			if r <= 0:
				a = b
				break
		var esc := rng.randf_range(a["esc"][0], a["esc"][1])
		var xf := Transform3D(Basis(Vector3.UP, rng.randf() * TAU).scaled(Vector3.ONE * esc), Vector3(p.x, y - 0.15, p.y))
		var ins := _instancia(a["m"], xf, 260.0, true)
		var corpo := _corpo_cilindro(Vector3(p.x, y, p.y), a["raio"] * esc, 6.0 * esc)
		var rec := {"tipo": "arvore", "item": "madeira", "pos": Vector3(p.x, y, p.y), "vida": 100.0, "max": 100.0, "rend": 12.0 + esc * 3.0,
			"grupo": ins["grupo"], "idx": ins["idx"], "corpo": corpo, "volta": 0.0}
		corpo.set_meta("recurso", recursos.size())
		recursos.append(rec)
		sombras.append([Vector3(p.x, y, p.y), 3.0 + esc * 1.6])
		feitas += 1
	terreno.sombrear(sombras)
	# plantas (dão fibra) e capim (só enfeite)
	for i in 900:
		var p := Vector2(rng.randf_range(-236, 236), rng.randf_range(-236, 236))
		if not _livre(p, -14.0):
			continue
		var y := terreno.h(p.x, p.y)
		if y < Terreno.AGUA + 0.3:
			continue
		var m: String = PLANTAS[rng.randi() % PLANTAS.size()]
		var xf := Transform3D(Basis(Vector3.UP, rng.randf() * TAU).scaled(Vector3.ONE * rng.randf_range(0.9, 1.5)), Vector3(p.x, y - 0.05, p.y))
		var ins := _instancia(m, xf, 120.0, false)
		var corpo := _corpo_esfera(Vector3(p.x, y + 0.4, p.y), 0.55)
		var rec := {"tipo": "planta", "item": "fibra", "pos": Vector3(p.x, y, p.y), "vida": 1.0, "max": 1.0, "rend": 6.0,
			"grupo": ins["grupo"], "idx": ins["idx"], "corpo": corpo, "volta": 0.0}
		corpo.set_meta("recurso", recursos.size())
		recursos.append(rec)
	for i in 6000:
		var p := Vector2(rng.randf_range(-236, 236), rng.randf_range(-236, 236))
		if p.distance_to(Terreno.LAGO) < 44.0 or p.distance_to(Terreno.VILA) < 30.0:
			continue
		var y := terreno.h(p.x, p.y)
		var hx := terreno.h(p.x + 1.0, p.y) - y
		if absf(hx) > 0.6 or y < Terreno.AGUA + 0.3:
			continue
		var xf := Transform3D(Basis(Vector3.UP, rng.randf() * TAU).scaled(Vector3.ONE * rng.randf_range(0.8, 1.3)), Vector3(p.x, y - 0.05, p.y))
		_instancia(CAPIM[i % CAPIM.size()], xf, 75.0, false, 32.0)
	# pedras (dão pedra), troncos e tocos (dão madeira)
	for i in 170:
		var p := Vector2(rng.randf_range(-236, 236), rng.randf_range(-236, 236))
		if not _livre(p, -10.0):
			continue
		var y := terreno.h(p.x, p.y)
		var m: String = PEDRAS[rng.randi() % PEDRAS.size()]
		var esc := rng.randf_range(1.0, 2.4)
		var no := MeshInstance3D.new()
		no.mesh = malha(m)
		no.transform = Transform3D(Basis(Vector3.UP, rng.randf() * TAU).scaled(Vector3.ONE * esc), Vector3(p.x, y - 0.25 * esc, p.y))
		no.visibility_range_end = 220.0
		_alcances.append([no, 220.0])
		add_child(no)
		var corpo := StaticBody3D.new()
		var cs := CollisionShape3D.new()
		cs.shape = no.mesh.create_convex_shape(true, true)
		corpo.add_child(cs)
		corpo.transform = no.transform
		add_child(corpo)
		var rec := {"tipo": "pedra", "item": "pedra", "pos": Vector3(p.x, y, p.y), "vida": 120.0 * esc, "max": 120.0 * esc, "rend": 10.0 + 4.0 * esc,
			"no": no, "corpo": corpo, "volta": 0.0}
		corpo.set_meta("recurso", recursos.size())
		recursos.append(rec)
	for i in 60:
		var p := Vector2(rng.randf_range(-230, 230), rng.randf_range(-230, 230))
		if not _livre(p, -12.0):
			continue
		var y := terreno.h(p.x, p.y)
		var m := "res://assets/mata/tronco.glb" if i % 3 else "res://assets/mata/toco.glb"
		var no := MeshInstance3D.new()
		no.mesh = malha(m)
		no.transform = Transform3D(Basis(Vector3.UP, rng.randf() * TAU).scaled(Vector3.ONE * rng.randf_range(1.0, 1.6)), Vector3(p.x, y - 0.05, p.y))
		no.visibility_range_end = 160.0
		_alcances.append([no, 160.0])
		add_child(no)
		var corpo := StaticBody3D.new()
		var cs := CollisionShape3D.new()
		cs.shape = no.mesh.create_convex_shape(true, true)
		corpo.add_child(cs)
		corpo.transform = no.transform
		add_child(corpo)
		var rec := {"tipo": "tronco", "item": "madeira", "pos": Vector3(p.x, y, p.y), "vida": 70.0, "max": 70.0, "rend": 14.0, "no": no, "corpo": corpo, "volta": 0.0}
		corpo.set_meta("recurso", recursos.size())
		recursos.append(rec)
	# paredões de pedra na serra da borda
	for i in 26:
		var a := float(i) / 26.0 * TAU
		var r := 226.0 + rng.randf_range(-6, 6)
		var p := Vector2(cos(a), sin(a)) * r
		p = p.clamp(Vector2(-232, -232), Vector2(232, 232))
		var no := MeshInstance3D.new()
		no.mesh = malha("res://assets/mata/paredao.glb" if i % 2 else "res://assets/mata/paredao2.glb")
		no.transform = Transform3D(Basis(Vector3.UP, -a + PI / 2 + rng.randf_range(-0.3, 0.3)).scaled(Vector3.ONE * rng.randf_range(2.2, 3.2)), Vector3(p.x, terreno.h(p.x, p.y) - 2.0, p.y))
		add_child(no)
	_vila()
	_fechar_grupos()


## até onde a mata, as pedras e os troncos aparecem (gráficos baixo/médio/alto)
var _alcances := []


func alcance(k: float) -> void:
	for id in grupos:
		var g: Dictionary = grupos[id]
		(g["mmi"] as MultiMeshInstance3D).visibility_range_end = float(g["alc"]) * k
	for par in _alcances:
		(par[0] as GeometryInstance3D).visibility_range_end = float(par[1]) * k


func _corpo_cilindro(p: Vector3, raio: float, altura: float) -> StaticBody3D:
	var corpo := StaticBody3D.new()
	var cs := CollisionShape3D.new()
	var c := CylinderShape3D.new()
	c.radius = maxf(0.18, raio)
	c.height = altura
	cs.shape = c
	cs.position.y = altura / 2.0
	corpo.add_child(cs)
	corpo.position = p
	add_child(corpo)
	return corpo


func _corpo_esfera(p: Vector3, raio: float) -> StaticBody3D:
	var corpo := StaticBody3D.new()
	corpo.collision_layer = 2   # planta: a mira pega, o corpo passa
	corpo.collision_mask = 0
	var cs := CollisionShape3D.new()
	var s := SphereShape3D.new()
	s.radius = raio
	cs.shape = s
	corpo.add_child(cs)
	corpo.position = p
	add_child(corpo)
	return corpo


# ---------------- vila de barracos ----------------
var mat_tabua: StandardMaterial3D
var mat_telha: StandardMaterial3D


func _mats() -> void:
	mat_tabua = StandardMaterial3D.new()
	mat_tabua.albedo_texture = load("res://assets/tex/tabua_cor.jpg")
	mat_tabua.normal_enabled = true
	mat_tabua.normal_texture = load("res://assets/tex/tabua_nrm.jpg")
	mat_tabua.uv1_triplanar = true
	mat_tabua.uv1_scale = Vector3(0.55, 0.55, 0.55)
	mat_tabua.roughness = 0.9
	mat_telha = StandardMaterial3D.new()
	mat_telha.albedo_color = Color(0.36, 0.31, 0.27)
	mat_telha.metallic = 0.55
	mat_telha.roughness = 0.62
	mat_telha.albedo_texture = load("res://assets/tex/rocha_cor.jpg")
	mat_telha.uv1_triplanar = true
	mat_telha.uv1_scale = Vector3(0.3, 0.3, 0.3)


func caixa(pai: Node3D, tam: Vector3, xf: Transform3D, mat: Material, colide := true) -> void:
	var mi := MeshInstance3D.new()
	var bm := BoxMesh.new()
	bm.size = tam
	mi.mesh = bm
	mi.material_override = mat
	mi.transform = xf
	pai.add_child(mi)
	if colide:
		var corpo := StaticBody3D.new()
		var cs := CollisionShape3D.new()
		var bs := BoxShape3D.new()
		bs.size = tam
		cs.shape = bs
		corpo.add_child(cs)
		corpo.transform = xf
		pai.add_child(corpo)


func _vila() -> void:
	_mats()
	var casas := [Vector3(55, 0, -45), Vector3(72, 0, -40), Vector3(88, 0, -52), Vector3(60, 0, -66), Vector3(80, 0, -70), Vector3(96, 0, -34)]
	for i in casas.size():
		var c: Vector3 = casas[i]
		c.y = terreno.h(c.x, c.z)
		_barraco(c, rng.randf() * TAU, Vector3(rng.randf_range(4.5, 6.5), 2.7, rng.randf_range(4.0, 5.5)), i)


func _barraco(c: Vector3, giro: float, tam: Vector3, n: int) -> void:
	var no := Node3D.new()
	no.position = c
	no.rotation.y = giro
	add_child(no)
	var w := tam.x
	var d := tam.z
	var a := tam.y
	var e := 0.12
	# piso, paredes (a da frente com vão de porta), telhado caído para trás
	caixa(no, Vector3(w + 0.3, 0.6, d + 0.3), Transform3D(Basis(), Vector3(0, -0.2, 0)), mat_tabua)
	caixa(no, Vector3(w, a, e), Transform3D(Basis(), Vector3(0, a / 2.0, -d / 2.0)), mat_tabua)
	caixa(no, Vector3(e, a, d), Transform3D(Basis(), Vector3(-w / 2.0, a / 2.0, 0)), mat_tabua)
	caixa(no, Vector3(e, a, d), Transform3D(Basis(), Vector3(w / 2.0, a / 2.0, 0)), mat_tabua)
	var porta := 1.1
	var lado := (w - porta) / 2.0
	caixa(no, Vector3(lado, a, e), Transform3D(Basis(), Vector3(-porta / 2.0 - lado / 2.0, a / 2.0, d / 2.0)), mat_tabua)
	caixa(no, Vector3(lado, a, e), Transform3D(Basis(), Vector3(porta / 2.0 + lado / 2.0, a / 2.0, d / 2.0)), mat_tabua)
	caixa(no, Vector3(porta, a - 2.1, e), Transform3D(Basis(), Vector3(0, 2.1 + (a - 2.1) / 2.0, d / 2.0)), mat_tabua)
	var tilt := Basis(Vector3.RIGHT, -0.12)
	caixa(no, Vector3(w + 0.8, 0.08, d + 0.9), Transform3D(tilt, Vector3(0, a + 0.25, 0)), mat_telha)
	# caixa de saque lá dentro
	var bau := MeshInstance3D.new()
	bau.mesh = malha("res://assets/objetos/bau.glb")
	var pb := Vector3(rng.randf_range(-w / 2.0 + 0.8, w / 2.0 - 0.8), 0.1, -d / 2.0 + 0.7)
	bau.position = pb
	bau.scale = Vector3.ONE * 0.8
	no.add_child(bau)
	var corpo := StaticBody3D.new()
	var cs := CollisionShape3D.new()
	var bs := BoxShape3D.new()
	bs.size = Vector3(0.9, 0.7, 0.7)
	cs.shape = bs
	cs.position.y = 0.35
	corpo.add_child(cs)
	corpo.position = pb
	no.add_child(corpo)
	corpo.set_meta("caixa", caixas.size())
	caixas.append({"corpo": corpo, "volta": 0.0, "cheia": true, "n": n})


## um golpe num recurso: devolve [item, quantidade] (vazio se nada)
func bater(i: int, dano: float, fator: float) -> Array:
	var r: Dictionary = recursos[i]
	if r["vida"] <= 0.0:
		return []
	var tira := dano * fator
	r["vida"] -= tira
	var q := int(round(r["rend"] * fator))
	if r["tipo"] == "planta":
		q = int(r["rend"])
		r["vida"] = 0.0
	if r["vida"] <= 0.0:
		q += int(r["rend"])
		_acabou(r)
	return [r["item"], maxi(q, 1)]


func _acabou(r: Dictionary) -> void:
	r["volta"] = 600.0 if r["tipo"] != "planta" else 240.0
	(r["corpo"] as StaticBody3D).process_mode = Node.PROCESS_MODE_DISABLED
	(r["corpo"] as StaticBody3D).visible = false
	for c in (r["corpo"] as StaticBody3D).get_children():
		(c as CollisionShape3D).disabled = true
	if r.has("grupo"):
		esconder(r)
	elif r.has("no"):
		(r["no"] as Node3D).visible = false


func revistar(i: int) -> Array:
	var c: Dictionary = caixas[i]
	if not c["cheia"]:
		return []
	c["cheia"] = false
	c["volta"] = 480.0
	var L := []
	for s in SAQUE:
		if rng.randf() < s[3]:
			L.append([s[0], rng.randi_range(s[1], s[2])])
	if L.is_empty():
		L.append(["sucata", 2])
	return L


func _process(dt: float) -> void:
	for r in recursos:
		if r["volta"] > 0.0:
			r["volta"] -= dt
			if r["volta"] <= 0.0:
				r["vida"] = r["max"]
				for c in (r["corpo"] as StaticBody3D).get_children():
					(c as CollisionShape3D).disabled = false
				(r["corpo"] as StaticBody3D).process_mode = Node.PROCESS_MODE_INHERIT
				if r.has("grupo"):
					mostrar(r)
				elif r.has("no"):
					(r["no"] as Node3D).visible = true
	for c in caixas:
		if not c["cheia"]:
			c["volta"] -= dt
			if c["volta"] <= 0.0:
				c["cheia"] = true
