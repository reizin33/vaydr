class_name Projeteis
extends Node3D
## O que voa e o que fica no chão das armas (etapa 5), como no jogo antigo (42_armas2.js e 48d_armas3.js):
## · flechas e virotes: voam e caem um pouco; cravam no zumbi (ficam no corpo e caem quando ele morre, a maioria inteira), na
##   árvore, na parede ou no chão (fincadas em pé); passe por cima para recolher (algumas quebram);
## · o que se arremessa: o coquetel molotov (quebra e põe fogo no chão por 10 s), a bomba caseira (cai, o pavio queima 2,5 s e
##   explode) e a isca de barulho (toca por 12 s e os zumbis vão até ela);
## · o fogo no chão: o zumbi que passa pega fogo (e passa para o do lado); você também queima se entrar.

var main
var flechas: Array = []
var voando: Array = []
var chamas: Array = []
var bombas: Array = []
var iscas: Array = []
var _mats := {}


func _init(m) -> void:
	main = m


func _mat(cor: Color, brilho := 0.0) -> StandardMaterial3D:
	var k := cor.to_html() + str(brilho)
	if _mats.has(k):
		return _mats[k]
	var m := StandardMaterial3D.new()
	m.albedo_color = cor
	m.roughness = 0.8
	if brilho > 0.0:
		m.emission_enabled = true
		m.emission = cor
		m.emission_energy_multiplier = brilho
	_mats[k] = m
	return m


static func _peca(pai: Node3D, malha: Mesh, mat: Material, pos: Vector3, rot := Vector3.ZERO) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	mi.mesh = malha
	mi.material_override = mat
	mi.position = pos
	mi.rotation = rot
	mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	pai.add_child(mi)
	return mi


## a flecha (ou o virote, mais curto e grosso): a haste ao longo de -z, a ponta na frente e as penas atrás
func _modelo_flecha(item: String) -> Node3D:
	var no := Node3D.new()
	var virote := item == "virote"
	var L := 0.42 if virote else 0.74
	var r := 0.009 if virote else 0.006
	var haste := CylinderMesh.new()
	haste.top_radius = r
	haste.bottom_radius = r
	haste.height = L
	haste.radial_segments = 5
	haste.rings = 1
	_peca(no, haste, _mat(Color(0.42, 0.3, 0.18) if not virote else Color(0.2, 0.2, 0.22)), Vector3(0, 0, 0), Vector3(PI / 2.0, 0, 0))
	var ponta := CylinderMesh.new()
	ponta.top_radius = 0.0
	ponta.bottom_radius = r * 2.4
	ponta.height = 0.05
	ponta.radial_segments = 5
	ponta.rings = 1
	_peca(no, ponta, _mat(Color(0.45, 0.45, 0.48)), Vector3(0, 0, -L * 0.5 - 0.024), Vector3(-PI / 2.0, 0, 0))
	var pena := BoxMesh.new()
	pena.size = Vector3(0.002, 0.03, 0.09 if not virote else 0.05)
	var mp := _mat(Color(0.78, 0.74, 0.66) if not virote else Color(0.55, 0.12, 0.1))
	for k in 3:
		var a := TAU * k / 3.0
		var pv := Node3D.new()
		pv.rotation.z = a
		no.add_child(pv)
		_peca(pv, pena, mp, Vector3(0, r + 0.012, L * 0.5 - 0.05))
	return no


static func _apontar(no: Node3D, d: Vector3) -> void:
	if d.length() < 0.01:
		return
	var up := Vector3.UP if absf(d.normalized().y) < 0.98 else Vector3.RIGHT
	no.global_basis = Basis.looking_at(d.normalized(), up)


# ================================================================ flechas e virotes
## atira uma flecha ou um virote de o, na direção dir, com velocidade v; dano já com a força da corda e a qualidade da arma
func flecha(o: Vector3, dir: Vector3, v: float, dano: float, arma: String, item: String) -> void:
	var no := _modelo_flecha(item)
	add_child(no)
	no.global_position = o
	_apontar(no, dir)
	flechas.append({"no": no, "p": o, "o": o, "v": dir * v, "voa": true, "t": 0.0, "dano": dano, "arma": arma, "item": item, "quebrou": false})
	if flechas.size() > 60:
		var velha: Dictionary = flechas.pop_front()
		if is_instance_valid(velha["no"]):
			(velha["no"] as Node3D).queue_free()


func _passo_flechas(dt: float) -> void:
	var sp := get_world_3d().direct_space_state
	var j = main.jogador
	var fora: Array[RID] = []
	fora.append(j.get_rid())
	for i in range(flechas.size() - 1, -1, -1):
		var f: Dictionary = flechas[i]
		var no: Node3D = f["no"]
		if not is_instance_valid(no):
			flechas.remove_at(i)
			continue
		f["t"] = float(f["t"]) + dt
		if f["voa"]:
			var v: Vector3 = f["v"]
			v.y -= float(Armas.ARCO["g"]) * dt
			f["v"] = v
			var a: Vector3 = f["p"]
			var b := a + v * dt
			var h := sp.intersect_ray(PhysicsRayQueryParameters3D.create(a, b, 1, fora))
			if not h.is_empty():
				var c: Object = h["collider"]
				var hp: Vector3 = h["position"]
				var d := v.normalized()
				if c.has_meta("zumbi"):
					var z = c.get_meta("zumbi")
					if is_instance_valid(z) and z.estado != "morto":
						_acerta_zumbi(f, z, hp, d)
						flechas.remove_at(i)
						continue
				# o bicho (etapa 6a): a flecha entra e fica (volta a ser sua quando você esfola)
				if c.has_meta("bicho"):
					var bb = c.get_meta("bicho")
					if is_instance_valid(bb) and bb.vivo:
						bb.ferir(float(f["dano"]), f["o"] if f.has("o") else hp - d, "flecha")
						main.efeitos.sangue(hp, -d)
						main.ui.acerto()
						main.sons.tocar("flecha", hp, -2.0)
						if not bb.vivo and not bb.lan and not f["quebrou"] and randf() < 0.7:
							var rest: Dictionary = bb.carc.get("rest", {})
							rest[str(f["item"])] = int(rest.get(str(f["item"]), 0)) + 1
						no.queue_free()
						flechas.remove_at(i)
						continue
				# cravou: na árvore, na parede ou no chão (no chão fica fincada, em pé)
				var chao: bool = c == main.terreno.corpo_chao
				f["voa"] = false
				f["t"] = 0.0
				f["p"] = hp - d * 0.1
				no.global_position = f["p"]
				if chao and d.y > -0.72:
					var hz := Vector2(d.x, d.z).normalized() * sqrt(1.0 - 0.72 * 0.72)
					d = Vector3(hz.x, -0.72, hz.y)
				_apontar(no, d)
				if randf() < (0.14 if chao else 0.4):
					f["quebrou"] = true
				main.sons.tocar("flecha", hp, -4.0)
				if not chao:
					main.efeitos.lascas(hp, h["normal"], "madeira")
				continue
			f["p"] = b
			no.global_position = b
			_apontar(no, v)
			if float(f["t"]) > 8.0 or b.y < -60.0:
				no.queue_free()
				flechas.remove_at(i)
		else:
			# parada: passe por cima para recolher
			var p: Vector3 = f["p"]
			if not f["quebrou"] and j.vivo and absf(j.global_position.y + 0.5 - p.y) < 1.8 \
					and Vector2(j.global_position.x - p.x, j.global_position.z - p.z).length() < 1.25:
				if j.inv.por(str(f["item"]), 1) == 0:
					main.ui.aviso("+1 %s" % Dados.nome(str(f["item"])))
					main.sons.tocar("clique", p, -8.0)
					no.queue_free()
					flechas.remove_at(i)
					continue
			if float(f["t"]) > (12.0 if f["quebrou"] else 150.0):
				no.queue_free()
				flechas.remove_at(i)


## a flecha pegou no zumbi: a região do corpo, o sangue, e ela fica cravada nele (cai junto quando ele morre)
func _acerta_zumbi(f: Dictionary, z, hp: Vector3, d: Vector3) -> void:
	var reg := Armas.regiao(z, hp)
	var mult := Armas.mult_regiao("projetil", reg)
	var dano: float = float(f["dano"]) * mult * Armas.variacao()
	main.efeitos.sangue(hp, -d)
	main.sons.tocar("flecha", hp, 0.0)
	main.ui.acerto()
	var no: Node3D = f["no"]
	if z.cravadas.size() < 4 and not z.lan:
		var xf := no.global_transform
		no.get_parent().remove_child(no)
		(z as Node3D).add_child(no)
		no.global_transform = xf
		no.global_position = hp + d * 0.12
		z.cravadas.append(str(f["item"]))
	else:
		no.queue_free()
		if z.lan:
			# o zumbi é de quem abriu: a flecha não fica (ela cai no chão perto)
			if randf() < 0.7:
				main.construcao.soltar_no_chao(z.global_position, [[str(f["item"]), 1]])
	z.ferir(dano, hp - d * 2.0, 0, {"k": "flecha", "head": reg == "cabeca", "reg": reg, "arma": str(f["arma"]), "mult": mult})


# ================================================================ arremessos
## joga o que está na mão (molotov, bomba ou isca) de o em direção ao alvo (até 26 m)
func arremessar(o: Vector3, alvo: Vector3, tipo: String, vel_j: Vector3) -> void:
	var v: float = Armas.ARREMESSO["v"]
	var g: float = Armas.ARREMESSO["g"]
	var dh := Vector2(alvo.x - o.x, alvo.z - o.z).length()
	var al: float = Armas.ARREMESSO["alcance"]
	if dh > al:
		var k := al / dh
		alvo = Vector3(o.x + (alvo.x - o.x) * k, alvo.y, o.z + (alvo.z - o.z) * k)
	var dir := Armas.balistica(o, alvo, v, g)
	var no := _modelo_arremesso(tipo)
	add_child(no)
	no.global_position = o
	voando.append({"no": no, "p": o, "v": dir * v + Vector3(vel_j.x, 0, vel_j.z) * 0.4, "tipo": tipo, "t": 0.0})


func _modelo_arremesso(tipo: String) -> Node3D:
	var no := Node3D.new()
	match tipo:
		"molotov":
			var gar := CylinderMesh.new()
			gar.top_radius = 0.035
			gar.bottom_radius = 0.04
			gar.height = 0.2
			gar.radial_segments = 8
			var mv := StandardMaterial3D.new()
			mv.albedo_color = Color(0.35, 0.45, 0.2, 0.75)
			mv.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
			mv.roughness = 0.15
			_peca(no, gar, mv, Vector3.ZERO)
			var pano := BoxMesh.new()
			pano.size = Vector3(0.04, 0.08, 0.04)
			_peca(no, pano, _mat(Color(1.0, 0.55, 0.15), 3.0), Vector3(0, 0.13, 0))
		"bombaCaseira":
			var cano := CylinderMesh.new()
			cano.top_radius = 0.035
			cano.bottom_radius = 0.035
			cano.height = 0.2
			cano.radial_segments = 8
			_peca(no, cano, _mat(Color(0.35, 0.36, 0.38)), Vector3.ZERO)
			var tampa := CylinderMesh.new()
			tampa.top_radius = 0.042
			tampa.bottom_radius = 0.042
			tampa.height = 0.03
			tampa.radial_segments = 8
			_peca(no, tampa, _mat(Color(0.25, 0.25, 0.27)), Vector3(0, 0.1, 0))
			_peca(no, tampa, _mat(Color(0.25, 0.25, 0.27)), Vector3(0, -0.1, 0))
			var pavio := BoxMesh.new()
			pavio.size = Vector3(0.008, 0.06, 0.008)
			_peca(no, pavio, _mat(Color(1.0, 0.7, 0.3), 2.0), Vector3(0, 0.14, 0))
		_:
			var cx := BoxMesh.new()
			cx.size = Vector3(0.1, 0.06, 0.07)
			_peca(no, cx, _mat(Color(0.75, 0.6, 0.1)), Vector3.ZERO)
			var luz := BoxMesh.new()
			luz.size = Vector3(0.02, 0.02, 0.02)
			_peca(no, luz, _mat(Color(1.0, 0.15, 0.1), 3.0), Vector3(0.03, 0.035, 0))
	return no


func _passo_voando(dt: float) -> void:
	var sp := get_world_3d().direct_space_state
	var fora: Array[RID] = []
	fora.append(main.jogador.get_rid())
	var g: float = Armas.ARREMESSO["g"]
	for i in range(voando.size() - 1, -1, -1):
		var b: Dictionary = voando[i]
		var no: Node3D = b["no"]
		b["t"] = float(b["t"]) + dt
		var v: Vector3 = b["v"]
		v.y -= g * dt
		b["v"] = v
		var a: Vector3 = b["p"]
		var c := a + v * dt
		var h := sp.intersect_ray(PhysicsRayQueryParameters3D.create(a, c, 1, fora))
		if not h.is_empty() or float(b["t"]) > 6.0:
			voando.remove_at(i)
			no.queue_free()
			if not h.is_empty():
				_aterrissar(str(b["tipo"]), h["position"])
			continue
		b["p"] = c
		no.global_position = c
		no.rotate_x(dt * 11.0)
		if str(b["tipo"]) != "isca" and randf() < dt * 30.0:
			main.efeitos.faiscas(c)


func _aterrissar(tipo: String, p: Vector3) -> void:
	var y: float = main.chao_em(p.x, p.z, p.y + 0.6)["y"]
	var pc := Vector3(p.x, y, p.z)
	match tipo:
		"molotov":
			fogo(pc, float(Armas.ARREMESSO["raio_fogo"]), float(Armas.ARREMESSO["fogo_dur"]))
			main.sons.tocar("vidro", pc, 4.0)
			main.barulho(pc, 24.0)
		"bombaCaseira":
			var no := _modelo_arremesso("bombaCaseira")
			add_child(no)
			no.global_position = pc + Vector3(0, 0.04, 0)
			no.rotation = Vector3(PI / 2.0, randf() * TAU, 0)
			bombas.append({"no": no, "p": pc, "t": 0.0, "som": 0.0})
			main.sons.tocar("madeira", pc, -6.0)
		"isca":
			var no := _modelo_arremesso("isca")
			add_child(no)
			no.global_position = pc + Vector3(0, 0.03, 0)
			iscas.append({"no": no, "p": pc, "t": 0.0, "bip": 0.0})
			main.sons.tocar("madeira", pc, -8.0)
			main.ui.aviso("A isca está tocando: os zumbis vão até ela por uns 12 segundos", 4.0)


# ================================================================ fogo no chão
func fogo(p: Vector3, r: float, dur: float) -> void:
	var no := Node3D.new()
	add_child(no)
	no.global_position = p
	var part := CPUParticles3D.new()
	part.amount = 70
	part.lifetime = 0.8
	part.emission_shape = CPUParticles3D.EMISSION_SHAPE_SPHERE
	part.emission_sphere_radius = r * 0.8
	part.direction = Vector3.UP
	part.spread = 15.0
	part.initial_velocity_min = 1.1
	part.initial_velocity_max = 2.6
	part.gravity = Vector3(0, 0.6, 0)
	part.scale_amount_min = 0.6
	part.scale_amount_max = 1.4
	part.scale_amount_curve = _curva_some()
	var q := QuadMesh.new()
	q.size = Vector2(0.45, 0.6)
	var mf := StandardMaterial3D.new()
	mf.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mf.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mf.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
	mf.billboard_mode = BaseMaterial3D.BILLBOARD_PARTICLES
	mf.vertex_color_use_as_albedo = true
	mf.albedo_texture = _textura_chama()
	q.material = mf
	part.mesh = q
	part.color_ramp = _rampa_fogo()
	part.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	part.position.y = 0.15
	no.add_child(part)
	part.emitting = true
	var luz := OmniLight3D.new()
	luz.light_color = Color(1.0, 0.55, 0.2)
	luz.light_energy = 2.5 * Desenho.forca_perto()
	luz.omni_range = r * 3.2
	luz.position.y = 0.9
	no.add_child(luz)
	chamas.append({"no": no, "luz": luz, "part": part, "p": p, "r": r, "t": 0.0, "dur": dur, "peca_t": 0.0})
	main.sons.tocar("fogo", p, 3.0)


var _tex_chama: Texture2D = null


func _textura_chama() -> Texture2D:
	if _tex_chama != null:
		return _tex_chama
	var img := Image.create(32, 32, false, Image.FORMAT_RGBA8)
	for y in 32:
		for x in 32:
			var dx := (x - 15.5) / 15.5
			var dy := (y - 15.5) / 15.5
			var r := sqrt(dx * dx * 1.6 + dy * dy)
			var a := clampf(1.0 - r, 0.0, 1.0)
			img.set_pixel(x, y, Color(1, 1, 1, a * a))
	_tex_chama = ImageTexture.create_from_image(img)
	return _tex_chama


func _rampa_fogo() -> Gradient:
	var gr := Gradient.new()
	gr.set_color(0, Color(1.0, 0.85, 0.4, 0.9))
	gr.set_color(1, Color(0.35, 0.08, 0.02, 0.0))
	gr.add_point(0.45, Color(1.0, 0.42, 0.08, 0.75))
	return gr


func _curva_some() -> Curve:
	var c := Curve.new()
	c.add_point(Vector2(0, 0.6))
	c.add_point(Vector2(0.3, 1.0))
	c.add_point(Vector2(1, 0.2))
	return c


func _passo_chamas(dt: float) -> void:
	var j = main.jogador
	for i in range(chamas.size() - 1, -1, -1):
		var c: Dictionary = chamas[i]
		c["t"] = float(c["t"]) + dt
		var t: float = c["t"]
		var dur: float = c["dur"]
		var no: Node3D = c["no"]
		if t >= dur + 1.0:
			no.queue_free()
			chamas.remove_at(i)
			continue
		var k := minf(1.0, t * 4.0) * clampf((dur - t) / 2.5, 0.0, 1.0)
		var r: float = float(c["r"]) * (0.7 + 0.3 * minf(1.0, t * 3.0))
		(c["luz"] as OmniLight3D).light_energy = 2.6 * k * (0.85 + 0.3 * randf()) * Desenho.forca_perto()
		(c["part"] as CPUParticles3D).emitting = t < dur
		if k < 0.3:
			continue
		var p: Vector3 = c["p"]
		for z in main.zumbis:
			if is_instance_valid(z) and z.estado != "morto" and absf(z.global_position.y - p.y) < 1.6 \
					and Vector2(z.global_position.x - p.x, z.global_position.z - p.z).length() < r:
				z.acender(5.0)
		c["bicho_t"] = float(c.get("bicho_t", 0.0)) - dt
		if main.fauna != null and float(c["bicho_t"]) <= 0.0:
			c["bicho_t"] = 0.5
			for b in main.fauna.bichos.duplicate():
				if is_instance_valid(b) and b.vivo and absf(b.global_position.y - p.y) < 1.6 \
						and Vector2(b.global_position.x - p.x, b.global_position.z - p.z).length() < r:
					b.ferir(7.0, p, "fogo")
		if j.vivo and absf(j.global_position.y - p.y) < 1.6 and Vector2(j.global_position.x - p.x, j.global_position.z - p.z).length() < r * 0.87:
			j.queimar(1.4)
		# a madeira da base perto pega fogo (pedra não)
		c["peca_t"] = float(c["peca_t"]) - dt
		if float(c["peca_t"]) <= 0.0:
			c["peca_t"] = 1.0
			main.construcao.queimar_perto(p, r + 0.8, 9.0)


# ================================================================ bomba caseira e isca
func _passo_bombas(dt: float) -> void:
	for i in range(bombas.size() - 1, -1, -1):
		var b: Dictionary = bombas[i]
		b["t"] = float(b["t"]) + dt
		b["som"] = float(b["som"]) - dt
		var p: Vector3 = b["p"]
		if randf() < dt * 25.0:
			main.efeitos.faiscas(p + Vector3(0, 0.12, 0))
		if float(b["som"]) <= 0.0:
			b["som"] = 0.22
			main.sons.tocar("clique", p, -2.0)
		if float(b["t"]) >= float(Armas.ARREMESSO["pavio"]):
			(b["no"] as Node3D).queue_free()
			bombas.remove_at(i)
			explosao(p, float(Armas.ARREMESSO["raio_bomba"]), float(Armas.ARREMESSO["dano_bomba"]))
	for i in range(iscas.size() - 1, -1, -1):
		var l: Dictionary = iscas[i]
		l["t"] = float(l["t"]) + dt
		l["bip"] = float(l["bip"]) - dt
		var p: Vector3 = l["p"]
		if float(l["bip"]) <= 0.0:
			l["bip"] = 0.5
			main.sons.tocar("isca", p, 2.0)
			main.barulho(p, float(Armas.ARREMESSO["isca_raio"]))
		if float(l["t"]) > float(Armas.ARREMESSO["isca_dur"]):
			(l["no"] as Node3D).queue_free()
			iscas.remove_at(i)


## a explosão: os zumbis perto caem (o brutamontes cambaleia), você leva o tranco e o dano se estiver perto, e faz muito barulho
func explosao(p: Vector3, R: float, dano: float) -> void:
	main.sons.tocar("explosao", p, 8.0)
	main.barulho(p, 70.0)
	main.efeitos.explosao(p)
	for z in main.zumbis.duplicate():
		if not is_instance_valid(z) or z.estado == "morto":
			continue
		var d: float = Vector2(z.global_position.x - p.x, z.global_position.z - p.z).length()
		if d > R or absf(z.global_position.y - p.y) > 3.0:
			continue
		var k := 1.0 - 0.65 * d / R
		z.ferir(dano * k, p, 0, {"k": "explosao", "forte": true, "derruba": 1.0, "empurra": 1.5 + k})
	if main.fauna != null:
		for b in main.fauna.bichos.duplicate():
			if not is_instance_valid(b) or not b.vivo:
				continue
			var db: float = Vector2(b.global_position.x - p.x, b.global_position.z - p.z).length()
			if db < R and absf(b.global_position.y - p.y) < 3.0:
				b.ferir(dano * (1.0 - 0.65 * db / R), p, "explosao")
	var j = main.jogador
	var dj: float = Vector2(j.global_position.x - p.x, j.global_position.z - p.z).length()
	if j.vivo and dj < R * 1.1 and absf(j.global_position.y - p.y) < 3.0:
		var kj := 1.0 - dj / (R * 1.1)
		j.ferir(60.0 * kj, true, p)
		var fr: Vector3 = (j.global_position - p)
		fr.y = 0.0
		j.velocity += fr.normalized() * 9.0 * kj + Vector3(0, 3.0 * kj, 0)
	j.tremor = maxf(j.tremor, 1.1 * clampf(1.0 - dj / 35.0, 0.0, 1.0))
	main.construcao.explosao_perto(p, R, dano)


func _physics_process(dt: float) -> void:
	if flechas.size() > 0:
		_passo_flechas(dt)
	if voando.size() > 0:
		_passo_voando(dt)
	if chamas.size() > 0:
		_passo_chamas(dt)
	if bombas.size() > 0 or iscas.size() > 0:
		_passo_bombas(dt)


## tudo some (morreu e renasceu, mudou de mundo)
func limpar() -> void:
	for L in [flechas, voando, chamas, bombas, iscas]:
		for e in L:
			if is_instance_valid(e["no"]):
				(e["no"] as Node3D).queue_free()
		L.clear()
