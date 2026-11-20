class_name Construcao
extends Node3D
## Construção da base no estilo do Rust: fundação no chão, paredes nas beiradas, parede com porta e com janela, piso em cima
## das paredes e escada. Tudo encaixa num módulo de 3 m a partir da primeira fundação de cada base.

const M := Dados.MODULO
const ALT := 3.0          # altura da parede
const FUND := 0.9         # altura da fundação acima do chão (o resto entra no chão)
var main: Node
var ativo := false
var peca := 0
var giro := 0.0
var fantasma: MeshInstance3D
var mat_ok: StandardMaterial3D
var mat_nao: StandardMaterial3D
var mat_madeira: StandardMaterial3D
var pecas := []           # {id, xf, no}
var ocupado := {}         # chave -> true (celas e beiradas)
var alvo := {}            # onde a peça vai (calculado a cada quadro)
var fogueiras := []


func _init(m: Node) -> void:
	main = m


func _ready() -> void:
	mat_ok = StandardMaterial3D.new()
	mat_ok.albedo_color = Color(0.35, 0.85, 0.45, 0.35)
	mat_ok.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat_ok.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mat_nao = mat_ok.duplicate()
	mat_nao.albedo_color = Color(0.95, 0.3, 0.25, 0.35)
	mat_madeira = StandardMaterial3D.new()
	mat_madeira.albedo_texture = load("res://assets/tex/tabua_cor.jpg")
	mat_madeira.normal_enabled = true
	mat_madeira.normal_texture = load("res://assets/tex/tabua_nrm.jpg")
	mat_madeira.uv1_triplanar = true
	mat_madeira.uv1_scale = Vector3(0.5, 0.5, 0.5)
	mat_madeira.roughness = 0.88
	fantasma = MeshInstance3D.new()
	fantasma.visible = false
	fantasma.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	add_child(fantasma)


func ativar(on: bool) -> void:
	ativo = on
	fantasma.visible = on


func peca_atual() -> Dictionary:
	return Dados.PECAS[peca]


func _process(_dt: float) -> void:
	if not ativo or not main.jogador.vivo or main.jogador.preso:
		fantasma.visible = false
		return
	if Input.is_action_just_pressed("mirar"):
		peca = (peca + 1) % Dados.PECAS.size()
		main.sons.tocar("clique", main.jogador.global_position, -10.0)
	if Input.is_action_just_pressed("girar"):
		giro += PI / 2.0
	alvo = _calcular()
	fantasma.visible = not alvo.is_empty()
	if alvo.is_empty():
		return
	var idp: String = peca_atual()["id"]
	fantasma.mesh = _malha(idp)
	fantasma.global_transform = alvo["xf"] * Transform3D(Basis(), Vector3(0, _meio(idp), 0))
	var pode: bool = alvo["ok"] and main.jogador.inv.tem(peca_atual()["custo"])
	fantasma.material_override = mat_ok if pode else mat_nao
	if Input.is_action_just_pressed("atacar") and pode:
		colocar(peca_atual()["id"], alvo["xf"], alvo["chave"])


## celas da base: cada fundação/piso tem posição (base, i, k, andar); beiradas entre celas
func _calcular() -> Dictionary:
	var j = main.jogador
	var id: String = peca_atual()["id"]
	var h: Dictionary = j.mira(9.0, 1)
	var p: Vector3
	if h.is_empty():
		p = j.cam.global_position - j.cam.global_transform.basis.z * 4.0
	else:
		p = h["position"]
	var yaw: float = j.rotation.y + giro
	# a base mais perto manda na grade
	var base = _base_perto(p)
	if id == "fundacao":
		if base == null:
			var y: float = main.terreno.h(p.x, p.z)
			var xf := Transform3D(Basis(Vector3.UP, yaw), Vector3(p.x, y, p.z))
			return {"xf": xf, "ok": p.distance_to(j.global_position) < 10.0 and _plano(xf), "chave": "c|%d|%d|%d|0" % [pecas.size() + 1000, 0, 0], "nova": true}
		var c := _cela(base, p)
		var xf := _xf_cela(base, c.x, c.y, 0)
		var chave := "c|%d|%d|%d|0" % [base["id"], c.x, c.y]
		return {"xf": xf, "ok": not ocupado.has(chave) and _plano(xf), "chave": chave}
	if base == null:
		return {}
	# paredes, piso e escada: o ponto é onde a mira cruza a altura do andar em que você está (mais 1,2 m)
	if id != "fundacao":
		var o: Vector3 = j.cam.global_position
		var dv: Vector3 = -j.cam.global_transform.basis.z
		var nivel: float = base["y"] + maxf(0.0, round((j.global_position.y - base["y"]) / ALT)) * ALT + (1.2 if id != "piso" else ALT - 0.2)
		if absf(dv.y) > 0.04:
			var t: float = (nivel - o.y) / dv.y
			if t > 0.0 and t < 9.0:
				p = o + dv * t
	var andar := clampi(int(floor((p.y - base["y"] + 0.4) / ALT)), 0, 3)
	if id == "piso":
		var c2 := _cela(base, p)
		var xf2 := _xf_cela(base, c2.x, c2.y, maxi(andar, 1))
		var chave2 := "c|%d|%d|%d|%d" % [base["id"], c2.x, c2.y, maxi(andar, 1)]
		return {"xf": xf2, "ok": not ocupado.has(chave2) and _tem_apoio(base, c2, maxi(andar, 1)), "chave": chave2}
	if id == "escada":
		var c3 := _cela(base, p)
		var xf3 := _xf_cela(base, c3.x, c3.y, andar)
		xf3.basis = Basis(Vector3.UP, base["yaw"] + round(giro / (PI / 2.0)) * PI / 2.0)
		var chave3 := "e|%d|%d|%d|%d" % [base["id"], c3.x, c3.y, andar]
		return {"xf": xf3, "ok": not ocupado.has(chave3) and ocupado.has("c|%d|%d|%d|%d" % [base["id"], c3.x, c3.y, andar]), "chave": chave3}
	# paredes: a beirada mais perto de uma cela que existe
	var loc: Vector3 = base["inv"] * p
	var fi := loc.x / M
	var fk := loc.z / M
	var i := int(round(fi))
	var k := int(round(fk))
	var dx := fi - i
	var dk := fk - k
	var lado := ""
	var bi := i
	var bk := k
	if absf(dx) > absf(dk):
		lado = "x"
		bi = i if dx > 0 else i - 1
	else:
		lado = "z"
		bk = k if dk > 0 else k - 1
	var centro: Vector3
	var bas: Basis
	if lado == "x":
		centro = Vector3((bi + 0.5) * M, 0, k * M)
		bas = Basis(Vector3.UP, PI / 2.0)
	else:
		centro = Vector3(i * M, 0, (bk + 0.5) * M)
		bas = Basis()
	var chave4 := "b|%d|%s|%d|%d|%d" % [base["id"], lado, bi if lado == "x" else i, k if lado == "x" else bk, andar]
	var apoio := false
	for c4 in [Vector2i(bi, k), Vector2i(bi + 1, k)] if lado == "x" else [Vector2i(i, bk), Vector2i(i, bk + 1)]:
		if ocupado.has("c|%d|%d|%d|%d" % [base["id"], c4.x, c4.y, andar]):
			apoio = true
	var g: Transform3D = base["xf"] * Transform3D(bas, centro + Vector3(0, base["y_loc"] + andar * ALT, 0))
	return {"xf": g, "ok": apoio and not ocupado.has(chave4), "chave": chave4}


func _base_perto(p: Vector3):
	var melhor = null
	var md := 12.0
	for b in bases:
		var loc: Vector3 = b["inv"] * p
		var d := Vector2(loc.x, loc.z).length() - b["raio"]
		if d < md:
			md = d
			melhor = b
	return melhor


var bases := []


func _cela(base: Dictionary, p: Vector3) -> Vector2i:
	var loc: Vector3 = base["inv"] * p
	return Vector2i(int(round(loc.x / M)), int(round(loc.z / M)))


func _xf_cela(base: Dictionary, i: int, k: int, andar: int) -> Transform3D:
	return base["xf"] * Transform3D(Basis(), Vector3(i * M, base["y_loc"] + andar * ALT, k * M))


func _tem_apoio(base: Dictionary, c: Vector2i, andar: int) -> bool:
	var n := 0
	for lado in [["x", c.x, c.y], ["x", c.x - 1, c.y], ["z", c.x, c.y], ["z", c.x, c.y - 1]]:
		if ocupado.has("b|%d|%s|%d|%d|%d" % [base["id"], lado[0], lado[1], lado[2], andar - 1]):
			n += 1
	for v in [Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1)]:
		if ocupado.has("c|%d|%d|%d|%d" % [base["id"], c.x + v.x, c.y + v.y, andar]):
			n += 2
	return n >= 2


## a fundação precisa de chão mais ou menos plano embaixo (até 1,4 m de desnível entre os cantos)
func _plano(xf: Transform3D) -> bool:
	var ys := []
	for v in [Vector3(-1.4, 0, -1.4), Vector3(1.4, 0, -1.4), Vector3(-1.4, 0, 1.4), Vector3(1.4, 0, 1.4)]:
		var w := xf * v
		ys.append(main.terreno.h(w.x, w.z))
	return ys.max() - ys.min() < 1.4


func colocar(id: String, xf: Transform3D, chave: String) -> void:
	if not main.jogador.inv.pagar(Dados.peca(id)["custo"]):
		return
	if id == "fundacao" and alvo.get("nova", false):
		# base nova: a grade nasce desta fundação (no alto do chão, para não ficar enterrada)
		var b := {"id": bases.size(), "xf": Transform3D(xf.basis, xf.origin), "y": xf.origin.y + FUND, "y_loc": FUND, "raio": M * 0.8}
		b["inv"] = b["xf"].affine_inverse()
		bases.append(b)
		chave = "c|%d|0|0|0" % b["id"]
		xf = _xf_cela(b, 0, 0, 0)
	elif id == "fundacao":
		var b2 = _base_perto(xf.origin)
		if b2:
			var loc: Vector3 = b2["inv"] * xf.origin
			b2["raio"] = maxf(b2["raio"], Vector2(loc.x, loc.z).length() + M * 0.8)
	ocupado[chave] = true
	var no := _no(id, xf)
	add_child(no)
	pecas.append({"id": id, "xf": xf, "no": no, "chave": chave})
	main.sons.tocar("construir", xf.origin, 0.0)
	main.ui.aviso("Construiu: " + Dados.peca(id)["nome"])


var _malhas := {}


func _meio(id: String) -> float:
	match id:
		"fundacao":
			return -(FUND + 1.5) / 2.0
		"piso":
			return -0.1
	return ALT / 2.0


func _malha(id: String) -> Mesh:
	if _malhas.has(id):
		return _malhas[id]
	var bm := BoxMesh.new()
	_malhas[id] = bm
	match id:
		"fundacao":
			bm.size = Vector3(M, FUND + 1.5, M)
		"piso":
			bm.size = Vector3(M, 0.2, M)
		"escada":
			bm.size = Vector3(1.4, ALT, M - 0.2)
		_:
			bm.size = Vector3(M, ALT, 0.22)
	return bm


## o nó da peça: madeira com textura, colisão de verdade (porta com vão e folha que abre, janela com vão)
func _no(id: String, xf: Transform3D) -> Node3D:
	var no := Node3D.new()
	no.transform = xf
	match id:
		"fundacao":
			_bloco(no, Vector3(M, FUND + 1.5, M), Vector3(0, -(FUND + 1.5) / 2.0, 0))
		"piso":
			_bloco(no, Vector3(M, 0.2, M), Vector3(0, -0.1, 0))
		"parede":
			_bloco(no, Vector3(M, ALT, 0.22), Vector3(0, ALT / 2.0, 0))
		"janela":
			_bloco(no, Vector3(M, 1.0, 0.22), Vector3(0, 0.5, 0))
			_bloco(no, Vector3(M, 0.9, 0.22), Vector3(0, ALT - 0.45, 0))
			_bloco(no, Vector3(0.9, 1.1, 0.22), Vector3(-1.05, 1.55, 0))
			_bloco(no, Vector3(0.9, 1.1, 0.22), Vector3(1.05, 1.55, 0))
		"porta":
			_bloco(no, Vector3(0.95, ALT, 0.22), Vector3(-1.025, ALT / 2.0, 0))
			_bloco(no, Vector3(0.95, ALT, 0.22), Vector3(1.025, ALT / 2.0, 0))
			_bloco(no, Vector3(1.1, ALT - 2.2, 0.22), Vector3(0, 2.2 + (ALT - 2.2) / 2.0, 0))
			var dob := Node3D.new()
			dob.position = Vector3(-0.55, 0, 0)
			no.add_child(dob)
			var folha: StaticBody3D = _bloco(dob, Vector3(1.08, 2.18, 0.08), Vector3(0.55, 1.09, 0))
			folha.set_meta("porta", portas.size())
			portas.append({"dob": dob, "aberta": false})
		"escada":
			for s in 10:
				var t := float(s) / 10.0
				_bloco(no, Vector3(1.4, 0.12, 0.29), Vector3(0, ALT * (t + 0.1) - 0.06, M / 2.0 - 0.3 - t * (M - 0.5)))
	return no


func _bloco(pai: Node3D, tam: Vector3, pos: Vector3) -> StaticBody3D:
	var mi := MeshInstance3D.new()
	var bm := BoxMesh.new()
	bm.size = tam
	mi.mesh = bm
	mi.material_override = mat_madeira
	mi.position = pos
	pai.add_child(mi)
	var sb := StaticBody3D.new()
	var cs := CollisionShape3D.new()
	var bs := BoxShape3D.new()
	bs.size = tam
	cs.shape = bs
	sb.add_child(cs)
	sb.position = pos
	pai.add_child(sb)
	return sb


var portas := []


func alternar_porta(i: int) -> void:
	var p: Dictionary = portas[i]
	p["aberta"] = not p["aberta"]
	var tw := create_tween()
	tw.tween_property(p["dob"], "rotation:y", -PI / 2.0 if p["aberta"] else 0.0, 0.35).set_trans(Tween.TRANS_SINE)
	main.sons.tocar("porta", (p["dob"] as Node3D).global_position, 0.0)


## fogueira: luz e calor; à noite segura a escuridão em volta
func por_fogueira(j) -> void:
	var h: Dictionary = j.mira(4.0, 1)
	if h.is_empty() or not j.inv.tirar("fogueira", 1):
		return
	var no := Node3D.new()
	no.position = h["position"]
	add_child(no)
	var pedras := MeshInstance3D.new()
	var tm := TorusMesh.new()
	tm.inner_radius = 0.35
	tm.outer_radius = 0.6
	pedras.mesh = tm
	pedras.scale = Vector3(1, 0.5, 1)
	var pm := StandardMaterial3D.new()
	pm.albedo_texture = load("res://assets/tex/rocha_cor.jpg")
	pm.uv1_triplanar = true
	pedras.material_override = pm
	no.add_child(pedras)
	for a in 4:
		var lenha := MeshInstance3D.new()
		var cm := CylinderMesh.new()
		cm.top_radius = 0.05
		cm.bottom_radius = 0.06
		cm.height = 0.8
		lenha.mesh = cm
		lenha.material_override = mat_madeira
		lenha.transform = Transform3D(Basis(Vector3.UP, a * PI / 2.0) * Basis(Vector3.RIGHT, 1.1), Vector3(0, 0.2, 0))
		no.add_child(lenha)
	var luz := OmniLight3D.new()
	luz.light_color = Color(1.0, 0.62, 0.3)
	luz.light_energy = 2.2
	luz.omni_range = 9.0
	luz.position.y = 0.6
	luz.shadow_enabled = true
	no.add_child(luz)
	var fogo := CPUParticles3D.new()
	fogo.amount = 40
	fogo.lifetime = 0.8
	fogo.emission_shape = CPUParticles3D.EMISSION_SHAPE_SPHERE
	fogo.emission_sphere_radius = 0.18
	fogo.direction = Vector3.UP
	fogo.spread = 12.0
	fogo.gravity = Vector3(0, 1.4, 0)
	fogo.initial_velocity_min = 0.3
	fogo.initial_velocity_max = 0.8
	fogo.scale_amount_min = 0.35
	fogo.scale_amount_max = 0.6
	var qm := QuadMesh.new()
	qm.size = Vector2(0.35, 0.35)
	var fm := StandardMaterial3D.new()
	fm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	fm.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	fm.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
	fm.billboard_mode = BaseMaterial3D.BILLBOARD_PARTICLES
	fm.vertex_color_use_as_albedo = true
	qm.material = fm
	fogo.mesh = qm
	var gr := Gradient.new()
	gr.set_color(0, Color(1.0, 0.75, 0.3, 0.9))
	gr.set_color(1, Color(0.8, 0.15, 0.02, 0.0))
	fogo.color_ramp = gr
	fogo.position.y = 0.25
	no.add_child(fogo)
	fogueiras.append({"no": no, "luz": luz})
	main.ui.aviso("Fogueira acesa")
