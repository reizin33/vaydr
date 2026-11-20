extends Node3D
## VAYDR no Godot (protótipo 0.1): monta o mundo, o céu e o dia, o jogador, a tela, a construção e os zumbis.
## Modos para os testes da nuvem: "-- --teste" (sem tela, confere coleta, fabricação, construção e zumbi) e
## "-- --fotos" (tira as fotos de conferência em fotos/).

var terreno: Terreno
var mundo: Mundo
var construcao: Construcao
var sons: Sons
var efeitos: Efeitos
var jogador: Jogador
var ui: UI
var sol: DirectionalLight3D
var lua: DirectionalLight3D
var amb: Environment
var ceu: ProceduralSkyMaterial
var hora := 9.0
var dia := 1
var zumbis: Array = []
var spawn_t := 3.0
const SPAWN := Vector3(0, 0, 6)
const SEG_POR_HORA := 30.0


func _ready() -> void:
	_teclas()
	_ambiente()
	terreno = Terreno.new()
	add_child(terreno)
	terreno.montar()
	mundo = Mundo.new(terreno)
	add_child(mundo)
	mundo.montar()
	sons = Sons.new()
	add_child(sons)
	efeitos = Efeitos.new()
	add_child(efeitos)
	construcao = Construcao.new(self)
	add_child(construcao)
	jogador = Jogador.new(self)
	add_child(jogador)
	jogador.global_position = Vector3(SPAWN.x, terreno.h(SPAWN.x, SPAWN.z) + 0.3, SPAWN.z)
	jogador.morreu.connect(_morreu)
	ui = UI.new(self)
	add_child(ui)
	# começo: uma pedra na mão, como no Rust, e umas bandagens
	jogador.inv.por("bandagem", 2)
	_zumbis_vila()
	var args := OS.get_cmdline_user_args()
	if "--teste" in args:
		_teste.call_deferred()
	elif "--fotos" in args:
		_fotos.call_deferred()
	else:
		Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
		ui.aviso("Colete madeira e pedra, fabrique (Tab) e construa antes da noite.")


func _teclas() -> void:
	var mapa := {
		"frente": [KEY_W], "tras": [KEY_S], "esquerda": [KEY_A], "direita": [KEY_D], "pular": [KEY_SPACE], "correr": [KEY_SHIFT],
		"agachar": [KEY_CTRL, KEY_C], "usar": [KEY_E], "mochila": [KEY_TAB, KEY_I], "girar": [KEY_R], "sair": [KEY_ESCAPE],
		"barra1": [KEY_1], "barra2": [KEY_2], "barra3": [KEY_3], "barra4": [KEY_4], "barra5": [KEY_5], "barra6": [KEY_6]}
	for a in mapa:
		if not InputMap.has_action(a):
			InputMap.add_action(a)
		for k in mapa[a]:
			var ev := InputEventKey.new()
			ev.physical_keycode = k
			InputMap.action_add_event(a, ev)
	for b in [["atacar", MOUSE_BUTTON_LEFT], ["mirar", MOUSE_BUTTON_RIGHT]]:
		if not InputMap.has_action(b[0]):
			InputMap.add_action(b[0])
		var m := InputEventMouseButton.new()
		m.button_index = b[1]
		InputMap.action_add_event(b[0], m)


func _ambiente() -> void:
	var we := WorldEnvironment.new()
	amb = Environment.new()
	ceu = ProceduralSkyMaterial.new()
	ceu.sky_top_color = Color(0.32, 0.47, 0.68)
	ceu.sky_horizon_color = Color(0.68, 0.74, 0.78)
	ceu.ground_horizon_color = Color(0.5, 0.52, 0.5)
	ceu.ground_bottom_color = Color(0.2, 0.2, 0.18)
	ceu.sun_angle_max = 30.0
	ceu.sun_curve = 0.12
	var sky := Sky.new()
	sky.sky_material = ceu
	amb.background_mode = Environment.BG_SKY
	amb.sky = sky
	amb.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
	amb.ambient_light_energy = 0.75
	amb.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	amb.tonemap_exposure = 1.0
	amb.fog_enabled = true
	amb.fog_light_color = Color(0.62, 0.68, 0.72)
	amb.fog_density = 0.0055
	amb.fog_sky_affect = 0.35
	amb.glow_enabled = true
	amb.glow_intensity = 0.35
	amb.glow_bloom = 0.04
	amb.adjustment_enabled = true
	amb.adjustment_saturation = 0.92
	amb.adjustment_contrast = 1.06
	we.environment = amb
	add_child(we)
	sol = DirectionalLight3D.new()
	sol.shadow_enabled = true
	sol.directional_shadow_max_distance = 110.0
	sol.light_color = Color(1.0, 0.95, 0.86)
	sol.light_energy = 1.25
	add_child(sol)
	lua = DirectionalLight3D.new()
	lua.light_color = Color(0.55, 0.65, 0.95)
	lua.light_energy = 0.0
	lua.rotation = Vector3(deg_to_rad(-55), deg_to_rad(30), 0)
	add_child(lua)


func noite() -> bool:
	return hora >= 19.0 or hora < 5.5


func hora_txt() -> String:
	var h := int(hora)
	var m := int((hora - h) * 60.0)
	return "%02d:%02d" % [h, m]


func _ciclo() -> void:
	# o sol nasce às 6 e se põe às 18; a noite tem luz da lua
	var a := (hora - 6.0) / 12.0 * PI
	var alt := sin(a)
	sol.rotation = Vector3(-a, deg_to_rad(-35), 0)
	var dia_k := clampf(alt * 3.0, 0.0, 1.0)
	sol.light_energy = 1.3 * dia_k
	sol.visible = dia_k > 0.01
	var por := clampf(1.0 - absf(alt) * 4.0, 0.0, 1.0) * (1.0 if alt > -0.1 else 0.0)
	sol.light_color = Color(1.0, 0.95, 0.86).lerp(Color(1.0, 0.62, 0.38), por)
	lua.light_energy = 0.16 * (1.0 - dia_k)
	var noite_k := 1.0 - clampf((alt + 0.15) * 4.0, 0.0, 1.0)
	ceu.sky_top_color = Color(0.32, 0.47, 0.68).lerp(Color(0.02, 0.03, 0.07), noite_k)
	ceu.sky_horizon_color = Color(0.68, 0.74, 0.78).lerp(Color(0.95, 0.6, 0.4), por * 0.7).lerp(Color(0.05, 0.06, 0.1), noite_k)
	amb.fog_light_color = Color(0.62, 0.68, 0.72).lerp(Color(0.8, 0.55, 0.4), por * 0.5).lerp(Color(0.03, 0.04, 0.07), noite_k)
	amb.ambient_light_energy = lerpf(0.75, 0.12, noite_k)


func _process(dt: float) -> void:
	hora += dt / SEG_POR_HORA
	if hora >= 24.0:
		hora -= 24.0
		dia += 1
	_ciclo()
	# zumbis: alguns de dia, muitos de noite; nascem longe e fora da vista
	spawn_t -= dt
	if spawn_t <= 0.0:
		spawn_t = 12.0
		zumbis = zumbis.filter(func(z): return is_instance_valid(z))
		var vivos := zumbis.filter(func(z): return z.estado != "morto").size()
		var teto := 14 if noite() else 7
		if vivos < teto and jogador.vivo:
			_nascer_perto()
	if Input.is_action_just_pressed("mochila") and jogador.vivo:
		ui.abrir(not ui.aberto)
	if Input.is_action_just_pressed("sair"):
		if ui.aberto:
			ui.abrir(false)
		else:
			Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
	if Input.mouse_mode == Input.MOUSE_MODE_VISIBLE and not ui.aberto and jogador.vivo and Input.is_action_just_pressed("atacar"):
		Input.mouse_mode = Input.MOUSE_MODE_CAPTURED


func _zumbis_vila() -> void:
	for i in 6:
		var p := Vector3(Terreno.VILA.x + randf_range(-25, 25), 0, Terreno.VILA.y + randf_range(-25, 25))
		_nascer(p, false)


func _nascer(p: Vector3, corre: bool) -> Zumbi:
	var z := Zumbi.new(self, corre)
	add_child(z)
	z.global_position = Vector3(p.x, terreno.h(p.x, p.z) + 0.2, p.z)
	zumbis.append(z)
	return z


func _nascer_perto() -> void:
	for t in 12:
		var a := randf() * TAU
		var r := randf_range(32.0, 55.0)
		var p := jogador.global_position + Vector3(cos(a), 0, sin(a)) * r
		if absf(p.x) > 225 or absf(p.z) > 225 or terreno.h(p.x, p.z) < Terreno.AGUA + 0.3:
			continue
		var frente := -jogador.cam.global_transform.basis.z
		if frente.dot((p - jogador.global_position).normalized()) > 0.5 and t < 8:
			continue
		_nascer(p, noite() and randf() < 0.4)
		return


func zumbi_morreu(_z) -> void:
	if randf() < 0.6:
		var s := jogador.inv.por("pano", randi_range(1, 2))
		ui.aviso("O zumbi largou pano" if s == 0 else "Mochila cheia")


func fabricar(r: Dictionary) -> void:
	if not jogador.inv.pagar(r["custo"]):
		return
	var sobra := jogador.inv.por(r["faz"], r["n"])
	sons.tocar("construir", jogador.global_position, -6.0)
	ui.aviso("Fabricou: " + Dados.nome(r["faz"]) + ("" if sobra == 0 else " (mochila cheia)"))


func texto_mira() -> String:
	if not jogador.vivo or ui.aberto:
		return ""
	var h := jogador.mira(Jogador.ALCANCE + 0.4)
	if h.is_empty():
		return ""
	var c: Object = h["collider"]
	if c.has_meta("caixa"):
		return "E  Revistar a caixa" if mundo.caixas[c.get_meta("caixa")]["cheia"] else "Caixa vazia"
	if c.has_meta("porta"):
		return "E  Fechar a porta" if construcao.portas[c.get_meta("porta")]["aberta"] else "E  Abrir a porta"
	if c.has_meta("recurso"):
		var r: Dictionary = mundo.recursos[c.get_meta("recurso")]
		match r["tipo"]:
			"planta":
				return "E  Colher fibra"
			"arvore", "tronco":
				return "Madeira (bata com o machado)"
			"pedra":
				return "Pedra (bata com a picareta)"
	if c.has_meta("zumbi"):
		return "Zumbi"
	return ""


func _morreu() -> void:
	ui.abrir(false)
	ui.mostrar_morte(true)


func renascer() -> void:
	ui.mostrar_morte(false)
	jogador.renascer(Vector3(SPAWN.x, terreno.h(SPAWN.x, SPAWN.z) + 0.5, SPAWN.z))
	jogador.inv.por("bandagem", 1)


# ======================= testes da nuvem =======================
var _erros: Array = []


func _confere(ok: bool, txt: String) -> void:
	print(("ok   " if ok else "FALHA ") + txt)
	if not ok:
		_erros.append(txt)


func _quadros(n: int) -> void:
	for i in n:
		await get_tree().physics_frame


func _olhar(p: Vector3) -> void:
	var o := jogador.cam.global_position
	var d := p - o
	jogador.rotation.y = atan2(-d.x, -d.z)
	jogador.cabeca.rotation.x = atan2(d.y, Vector2(d.x, d.z).length())


func _teste() -> void:
	print("TESTE VAYDR Godot: começo")
	await _quadros(5)
	var n_arv := 0
	var n_ped := 0
	var n_pla := 0
	for r in mundo.recursos:
		match r["tipo"]:
			"arvore":
				n_arv += 1
			"pedra":
				n_ped += 1
			"planta":
				n_pla += 1
	_confere(n_arv > 300 and n_ped > 40 and n_pla > 200, "mundo: %d árvores, %d pedras, %d plantas, %d caixas" % [n_arv, n_ped, n_pla, mundo.caixas.size()])
	# coleta de verdade: o jogador vai até uma árvore e bate com a mão
	var arv: Dictionary = {}
	for r in mundo.recursos:
		if r["tipo"] == "arvore" and Vector2(r["pos"].x, r["pos"].z).distance_to(Vector2(jogador.global_position.x, jogador.global_position.z)) < 80:
			arv = r
			break
	if arv.is_empty():
		arv = mundo.recursos[0]
	var pa: Vector3 = arv["pos"]
	jogador.global_position = pa + Vector3(1.4, 0.3, 0)
	await _quadros(10)
	_olhar(pa + Vector3(0, 1.3, 0))
	await _quadros(3)
	var m0 := jogador.inv.conta("madeira")
	for i in 4:
		jogador.cd = 0.0
		jogador.atacar()
		await _quadros(2)
	_confere(jogador.inv.conta("madeira") > m0, "coleta: bater na árvore com a mão deu madeira (%d)" % (jogador.inv.conta("madeira") - m0))
	# fabricação
	jogador.inv.por("madeira", 400)
	jogador.inv.por("pedra", 100)
	for r in Dados.RECEITAS:
		if r["faz"] in ["machado", "plano"]:
			fabricar(r)
	_confere(jogador.inv.conta("machado") == 1 and jogador.inv.conta("plano") == 1, "fabricou machado e plano de construção")
	# construção: fundação na clareira, parede e parede com porta nas beiradas
	jogador.global_position = Vector3(10, terreno.h(10, 20) + 0.3, 20)
	await _quadros(8)
	var ip := -1
	for i in Inventario.ESPACOS:
		if jogador.inv.slots[i] != null and jogador.inv.slots[i]["id"] == "plano":
			ip = i
	if ip >= Inventario.BARRA:
		jogador.inv.trocar(ip, 0)
		ip = 0
	jogador.selecionar(ip)
	_olhar(jogador.global_position + Vector3(0, -0.2, -4.0))
	await _quadros(3)
	construcao.peca = 0
	var a: Dictionary = construcao._calcular()
	construcao.alvo = a
	_confere(not a.is_empty() and a["ok"], "fundação: lugar válido")
	if not a.is_empty():
		construcao.colocar("fundacao", a["xf"], a["chave"])
	var b0: Dictionary = construcao.bases[0] if construcao.bases.size() > 0 else {}
	var feitas := 0
	if not b0.is_empty():
		for pc in [[1, Vector3(1.5, 1.2, 0)], [2, Vector3(-1.5, 1.2, 0)], [1, Vector3(0, 1.2, 1.5)]]:
			construcao.peca = pc[0]
			var w: Vector3 = b0["xf"] * (pc[1] + Vector3(0, Construcao.FUND, 0))
			jogador.global_position = b0["xf"] * Vector3(0, Construcao.FUND + 0.1, 0)
			await _quadros(4)
			_olhar(w)
			await _quadros(2)
			var a2: Dictionary = construcao._calcular()
			if not a2.is_empty() and a2["ok"]:
				construcao.alvo = a2
				construcao.colocar(Dados.PECAS[pc[0]]["id"], a2["xf"], a2["chave"])
				feitas += 1
	_confere(feitas == 3 and construcao.pecas.size() == 4, "construção: fundação + 3 paredes (%d peças)" % construcao.pecas.size())
	_confere(construcao.portas.size() == 1, "porta na parede com porta")
	# zumbi: nasce perto, ataca, e morre com os golpes
	jogador.global_position = Vector3(-20, terreno.h(-20, 30) + 0.3, 30)
	jogador.vida = 100.0
	var z := _nascer(Vector3(-20, 0, 27.5), false)
	await _quadros(150)
	_confere(z.estado == "caca", "zumbi viu e caçou o jogador")
	_confere(jogador.vida < 100.0, "zumbi bateu (vida %d)" % int(jogador.vida))
	for i in 8:
		z.ferir(22.0, jogador.global_position)
	await _quadros(10)
	_confere(z.estado == "morto", "zumbi morreu com os golpes")
	_confere(z.anim != null and z.anim.has_animation("sFeridoAnda") and z.anim.has_animation("sGolpe"), "animações do zumbi carregadas")
	hora = 22.0
	_confere(noite(), "noite às 22h")
	if _erros.is_empty():
		print("TESTE OK")
	else:
		print("TESTE FALHOU: ", _erros)
	get_tree().quit(0 if _erros.is_empty() else 1)


func _foto(nome: String) -> void:
	await _quadros(45)
	await RenderingServer.frame_post_draw
	var img := get_viewport().get_texture().get_image()
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path("res://fotos"))
	img.save_png(ProjectSettings.globalize_path("res://fotos/%s.png" % nome))
	print("foto ", nome)


func _cam(pos: Vector3, alvo: Vector3) -> void:
	jogador.global_position = Vector3(pos.x, terreno.h(pos.x, pos.z) + 0.2, pos.z)
	await _quadros(3)
	_olhar(alvo)


func _fotos() -> void:
	await _quadros(60)
	hora = 9.5
	await _cam(Vector3(0, 0, 14), Vector3(0, 6, -60))
	await _foto("1_clareira")
	await _cam(Vector3(-40, 0, -70), Vector3(-80, 4, -120))
	await _foto("2_mata")
	await _cam(Vector3(40, 0, -20), Vector3(Terreno.VILA.x, 6, Terreno.VILA.y))
	await _foto("3_vila")
	# uma base pequena montada pelo próprio sistema de construção
	jogador.inv.por("madeira", 900)
	jogador.global_position = Vector3(12, terreno.h(12, 22) + 0.3, 22)
	await _quadros(5)
	_olhar(jogador.global_position + Vector3(0, -0.5, -4.0))
	await _quadros(2)
	construcao.peca = 0
	var a: Dictionary = construcao._calcular()
	construcao.alvo = a
	if not a.is_empty():
		construcao.colocar("fundacao", a["xf"], a["chave"])
	if construcao.bases.size() > 0:
		var b0: Dictionary = construcao.bases[0]
		for c in [Vector2i(1, 0), Vector2i(0, 1), Vector2i(1, 1)]:
			var xf: Transform3D = construcao._xf_cela(b0, c.x, c.y, 0)
			construcao.alvo = {}
			construcao.colocar("fundacao", xf, "c|%d|%d|%d|0" % [b0["id"], c.x, c.y])
		for w in [[1, Vector3(-1.5, 1.2, 0)], [1, Vector3(0, 1.2, -1.5)], [2, Vector3(4.5, 1.2, 0)], [3, Vector3(3.0, 1.2, -1.5)], [1, Vector3(-1.5, 1.2, 3.0)], [3, Vector3(0, 1.2, 4.5)], [1, Vector3(3.0, 1.2, 4.5)], [1, Vector3(4.5, 1.2, 3.0)]]:
			construcao.peca = w[0]
			var alvo_w: Vector3 = b0["xf"] * (w[1] + Vector3(0, Construcao.FUND, 0))
			jogador.global_position = b0["xf"] * Vector3(1.5, Construcao.FUND + 0.1, 1.5)
			await _quadros(3)
			_olhar(alvo_w)
			await _quadros(2)
			var a2: Dictionary = construcao._calcular()
			if not a2.is_empty() and a2["ok"]:
				construcao.colocar(Dados.PECAS[w[0]]["id"], a2["xf"], a2["chave"])
		var fora: Vector3 = b0["xf"] * Vector3(-7.0, 0, 9.0)
		var centro: Vector3 = b0["xf"] * Vector3(1.5, 2.0, 1.5)
		hora = 17.4
		_nascer(b0["xf"] * Vector3(8.0, 0, 6.0), false)
		_nascer(b0["xf"] * Vector3(6.0, 0, 10.0), false)
		await _cam(fora, centro)
		await _foto("4_base_fim_de_tarde")
		hora = 21.5
		jogador.inv.por("fogueira", 1)
		jogador.global_position = b0["xf"] * Vector3(-4.0, 0.3, 1.5)
		jogador.global_position.y = terreno.h(jogador.global_position.x, jogador.global_position.z) + 0.3
		await _quadros(4)
		_olhar(jogador.global_position + Vector3(0, -1.2, -1.8))
		await _quadros(2)
		construcao.por_fogueira(jogador)
		await _cam(b0["xf"] * Vector3(-9.0, 0, -2.0), b0["xf"] * Vector3(-3.0, 1.0, 1.5))
		await _foto("5_noite_fogueira")
	hora = 10.0
	for z in zumbis:
		if is_instance_valid(z):
			z.queue_free()
	var zz := _nascer(Vector3(30, 0, 40), false)
	zz.estado = "vaga"
	await _cam(Vector3(30, 0, 44.5), Vector3(30, 1.3, 40))
	await _foto("6_zumbi")
	jogador.inv.por("pedra", 120)
	jogador.inv.por("fibra", 30)
	jogador.inv.por("machado", 1)
	ui.abrir(true)
	await _foto("7_mochila")
	get_tree().quit()
