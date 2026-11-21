extends Node3D
## VAYDR no Godot: monta o mapa do jogo antigo (relevo, água e maré, prédios, casas, bairros, ruas, colisão, a mata e o
## saque), o céu e o dia, o jogador, a tela, a construção e os zumbis (os de cada lugar do mapa e os que andam pela mata).
## Modos para os testes da nuvem: "-- --teste" (sem tela, confere o mapa, coleta, fabricação, construção e zumbi) e
## "-- --fotos" (tira as fotos de conferência em fotos/).

var terreno: Terreno
var malhas_mapa: MalhasMapa
var objetos: ObjetosMapa
var colisao: ColisaoMapa
var mundo: Mundo
var grama: Grama
var construcao: Construcao
var sons: Sons
var efeitos: Efeitos
var jogador: Jogador
var ui: UI
var sol: DirectionalLight3D
var lua: DirectionalLight3D
var amb: Environment
var ceu: ProceduralSkyMaterial
var hora := 8.0
var dia := 1
var zumbis: Array = []
var spawn_t := 3.0
var modo_teste := false   # nos testes da nuvem: não mexe no mouse nem na janela
var lugares_z := {}       # zumbis de cada lugar do mapa: id -> {ativo, zumbis, volta}
var _lugares_t := 0.0
const SPAWN := Vector3(8, 0, 44)   # onde o jogo antigo começa: na mata, ao sul da clareira
const SEG_POR_HORA := 50.0


func _ready() -> void:
	var args := OS.get_cmdline_user_args()
	modo_teste = "--teste" in args or "--fotos" in args
	_teclas()
	_ambiente()
	var t0 := Time.get_ticks_msec()
	terreno = Terreno.new()
	terreno.name = "Terreno"
	add_child(terreno)
	terreno.montar()
	var t1 := Time.get_ticks_msec()
	malhas_mapa = MalhasMapa.new()
	malhas_mapa.name = "Mapa"
	add_child(malhas_mapa)
	malhas_mapa.montar()
	objetos = ObjetosMapa.new()
	objetos.name = "Objetos"
	add_child(objetos)
	objetos.montar()
	var t2 := Time.get_ticks_msec()
	colisao = ColisaoMapa.new(terreno)
	colisao.name = "Colisao"
	add_child(colisao)
	colisao.montar()
	var t3 := Time.get_ticks_msec()
	mundo = Mundo.new(terreno)
	mundo.name = "Mundo"
	add_child(mundo)
	mundo.montar(colisao)
	var t4 := Time.get_ticks_msec()
	print("mapa: relevo %d ms, malhas e objetos %d ms (%d mil vértices, %d objetos), colisão %d ms (%d formas), mata e saque %d ms" % [
		t1 - t0, t2 - t1, malhas_mapa.n_vertices / 1000, objetos.n_objetos, t3 - t2, colisao.n_formas, t4 - t3])
	mundo.tirar_fotos()
	grama = Grama.new(terreno)
	add_child(grama)
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
	# começo: mão vazia (nada de item de graça); tudo sai de coleta, caixa e fabricação
	if "--teste" in args:
		_vigia(360.0, "TESTE")
		_teste.call_deferred()
	elif "--fotos" in args:
		_vigia(1500.0, "FOTOS")
		_fotos.call_deferred()
	else:
		Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
		ui.aviso("Bata nas árvores e nas pedras (clique) para pegar madeira e pedra.", 8.0)
		ui.aviso("Tab abre a mochila e a fabricação: comece pelo machado e pelo plano de construção.", 9.0)
		ui.aviso("Esc: menu (gráficos, mouse, sair).", 9.0)


func _teclas() -> void:
	var mapa := {
		"frente": [KEY_W], "tras": [KEY_S], "esquerda": [KEY_A], "direita": [KEY_D], "pular": [KEY_SPACE], "correr": [KEY_SHIFT],
		"agachar": [KEY_CTRL, KEY_C], "usar": [KEY_E], "mochila": [KEY_TAB, KEY_I], "girar": [KEY_R], "sair": [KEY_ESCAPE],
		"barra1": [KEY_1], "barra2": [KEY_2], "barra3": [KEY_3], "barra4": [KEY_4], "barra5": [KEY_5], "barra6": [KEY_6], "tela_cheia": [KEY_F11]}
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
	ceu.sky_top_color = Color(0.2, 0.38, 0.68)
	ceu.sky_horizon_color = Color(0.6, 0.7, 0.8)
	ceu.ground_horizon_color = Color(0.5, 0.52, 0.5)
	ceu.ground_bottom_color = Color(0.2, 0.2, 0.18)
	ceu.sun_angle_max = 30.0
	ceu.sun_curve = 0.12
	var sky := Sky.new()
	sky.sky_material = ceu
	amb.background_mode = Environment.BG_SKY
	amb.sky = sky
	# luz de ambiente como a do jogo antigo (céu claro por cima, ~0,5 de luz): 70% uma cor clara e 30% o próprio céu
	# (o céu sozinho é azul demais e deixava a sombra escura e azulada)
	amb.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
	amb.ambient_light_sky_contribution = 0.3
	amb.ambient_light_color = Color(0.7, 0.74, 0.8)
	amb.ambient_light_energy = 1.0
	# o mesmo tom do jogo antigo (ACES)
	amb.tonemap_mode = Environment.TONE_MAPPER_ACES
	amb.tonemap_exposure = 1.0
	amb.tonemap_white = 6.0
	amb.fog_enabled = true
	amb.fog_light_color = Color(0.52, 0.6, 0.68)
	amb.fog_density = 0.0046
	amb.fog_sky_affect = 0.3
	amb.glow_enabled = true
	amb.glow_intensity = 0.35
	amb.glow_bloom = 0.04
	amb.adjustment_enabled = true
	amb.adjustment_saturation = 1.0
	amb.adjustment_contrast = 1.03
	we.environment = amb
	add_child(we)
	sol = DirectionalLight3D.new()
	sol.shadow_enabled = true
	sol.directional_shadow_max_distance = 110.0
	sol.light_color = Color(1.0, 0.96, 0.89)
	sol.light_energy = 2.0
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
	# o sol do jogo antigo (~2 de luz ao meio-dia); no pôr do sol fica laranja e fraco
	sol.light_energy = 2.0 * dia_k
	sol.visible = dia_k > 0.01
	var por := clampf(1.0 - absf(alt) * 4.0, 0.0, 1.0) * (1.0 if alt > -0.1 else 0.0)
	sol.light_color = Color(1.0, 0.96, 0.89).lerp(Color(1.0, 0.62, 0.38), por)
	lua.light_energy = 0.3 * (1.0 - dia_k)
	var noite_k := 1.0 - clampf((alt + 0.15) * 4.0, 0.0, 1.0)
	ceu.sky_top_color = Color(0.2, 0.38, 0.68).lerp(Color(0.02, 0.03, 0.07), noite_k)
	ceu.sky_horizon_color = Color(0.6, 0.7, 0.8).lerp(Color(0.95, 0.6, 0.4), por * 0.7).lerp(Color(0.05, 0.06, 0.1), noite_k)
	amb.fog_light_color = Color(0.52, 0.6, 0.68).lerp(Color(0.75, 0.52, 0.4), por * 0.5).lerp(Color(0.03, 0.04, 0.07), noite_k)
	# ambiente: claro de dia, quente no fim da tarde, azul-escuro de noite (a lua ilumina pouco)
	amb.ambient_light_color = Color(0.7, 0.74, 0.8).lerp(Color(0.72, 0.62, 0.56), por * 0.6).lerp(Color(0.22, 0.27, 0.4), noite_k)
	amb.ambient_light_energy = lerpf(1.0, 0.75, noite_k)


func _process(dt: float) -> void:
	# o dia passa devagar (50 s por hora) e a noite mais rápido (25 s por hora): ~11 min de dia e ~5 de noite
	var antes := hora
	hora += dt / (SEG_POR_HORA * (0.5 if noite() else 1.0))
	if hora >= 24.0:
		hora -= 24.0
		dia += 1
	if not modo_teste:
		if antes < 17.5 and hora >= 17.5:
			ui.aviso("O sol está indo embora: de noite os zumbis correm. Faça uma fogueira ou se tranque na base.", 7.0)
		if antes < 6.0 and hora >= 6.0:
			ui.aviso("Amanheceu: dia %d" % dia, 5.0)
	_ciclo()
	terreno.mare(hora)
	# zumbis: os de cada lugar (vila, posto, fazenda, sítios...) aparecem quando você chega perto; fora isso, alguns
	# andam pela mata e pela cidade (mais de noite), nascendo longe e fora da vista
	if not modo_teste:
		_zumbis_dos_lugares(dt)
	spawn_t -= dt
	if spawn_t <= 0.0:
		spawn_t = 12.0
		zumbis = zumbis.filter(func(z): return is_instance_valid(z))
		var soltos := zumbis.filter(func(z): return z.estado != "morto" and not z.has_meta("lugar")).size()
		var teto := 10 if noite() else 5
		if na_cidade(jogador.global_position):
			teto += 4
		if soltos < teto and jogador.vivo:
			_nascer_perto()
	if Input.is_action_just_pressed("mochila") and jogador.vivo:
		ui.abrir(not ui.aberto)
	# voltou de outra janela (Alt+Tab): um clique prende o mouse de novo
	if not modo_teste and Input.mouse_mode == Input.MOUSE_MODE_VISIBLE and not ui.aberto and not ui.menu_aberto and jogador.vivo \
			and Input.is_action_just_pressed("atacar"):
		Input.mouse_mode = Input.MOUSE_MODE_CAPTURED


## Gráficos: baixo (PC fraco), médio e alto. Mexe no antisserrilhado, na resolução 3D, nas sombras, no brilho,
## na neblina e até onde a mata aparece.
func aplicar_qualidade(q: int) -> void:
	var cfg: Dictionary = [
		{"msaa": Viewport.MSAA_DISABLED, "escala": 0.75, "sombra": 2048, "dist": 40.0, "brilho": false, "mata": 0.55, "longe": 420.0, "neblina": 0.0075,
			"capim": 56, "capim_passo": 0.9, "predios": 0.75},
		{"msaa": Viewport.MSAA_DISABLED, "escala": 1.0, "sombra": 2048, "dist": 75.0, "brilho": true, "mata": 0.8, "longe": 650.0, "neblina": 0.0046,
			"capim": 90, "capim_passo": 0.8, "predios": 1.0},
		{"msaa": Viewport.MSAA_2X, "escala": 1.0, "sombra": 4096, "dist": 110.0, "brilho": true, "mata": 1.0, "longe": 900.0, "neblina": 0.0036,
			"capim": 120, "capim_passo": 0.75, "predios": 1.35},
	][clampi(q, 0, 2)]
	var vp := get_viewport()
	vp.msaa_3d = cfg["msaa"]
	vp.scaling_3d_scale = cfg["escala"]
	RenderingServer.directional_shadow_atlas_set_size(cfg["sombra"], true)
	sol.directional_shadow_max_distance = cfg["dist"]
	amb.glow_enabled = cfg["brilho"]
	amb.fog_density = cfg["neblina"]
	jogador.cam.far = cfg["longe"]
	mundo.alcance(cfg["mata"])
	malhas_mapa.alcance(cfg["predios"])
	objetos.alcance(cfg["predios"])
	grama.densidade(cfg["capim"], cfg["capim_passo"])


func na_cidade(p: Vector3) -> bool:
	return Terreno.CIDADE.grow(20.0).has_point(Vector2(p.x, p.z))


## a altura do chão de verdade num ponto (o que estiver embaixo de "de_cima": calçada, piso, ponte ou o chão de terra)
func chao_em(x: float, z: float, de_cima := 90.0) -> Dictionary:
	var q := PhysicsRayQueryParameters3D.create(Vector3(x, de_cima, z), Vector3(x, -40.0, z), 1)
	var h := get_world_3d().direct_space_state.intersect_ray(q)
	if h.is_empty():
		return {"y": terreno.h(x, z), "terra": true}
	return {"y": (h["position"] as Vector3).y, "terra": h["collider"] == terreno.corpo_chao}


func _nascer(p: Vector3, corre: bool) -> Zumbi:
	var z := Zumbi.new(self, corre)
	add_child(z)
	var y: float = chao_em(p.x, p.z, terreno.h(p.x, p.z) + 2.5)["y"]
	z.global_position = Vector3(p.x, y + 0.15, p.z)
	zumbis.append(z)
	return z


## nasce um zumbi longe e fora da vista: no chão de terra ou na rua (nunca em cima de telhado, dentro d'água ou fora do mapa)
func _nascer_perto() -> void:
	for t in 14:
		var a := randf() * TAU
		var r := randf_range(32.0, 55.0)
		var p := jogador.global_position + Vector3(cos(a), 0, sin(a)) * r
		if not terreno.dentro(p.x, p.z) or terreno.tipo_agua(p.x, p.z) != 0:
			continue
		var c := chao_em(p.x, p.z)
		if absf(float(c["y"]) - terreno.h(p.x, p.z)) > 0.6:
			continue
		var frente := -jogador.cam.global_transform.basis.z
		if frente.dot((p - jogador.global_position).normalized()) > 0.5 and t < 9:
			continue
		_nascer(p, noite() and randf() < 0.4)
		return


## os zumbis de cada lugar do mapa (os mesmos pontos do jogo antigo): aparecem quando você chega a 120 m e somem quando
## você vai para longe (os que não estão caçando); o lugar se enche de novo 4 minutos depois
func _zumbis_dos_lugares(dt: float) -> void:
	_lugares_t -= dt
	if _lugares_t > 0.0:
		return
	_lugares_t = 1.5
	var pj := Vector2(jogador.global_position.x, jogador.global_position.z)
	for id in mundo.zspawn:
		var pts: Array = mundo.zspawn[id]
		if pts.is_empty():
			continue
		var c := Vector2.ZERO
		for q in pts:
			c += Vector2(float(q[0]), float(q[1]))
		c /= float(pts.size())
		var d := pj.distance_to(c)
		if not lugares_z.has(id):
			lugares_z[id] = {"ativo": false, "zumbis": [], "volta": 0.0}
		var L: Dictionary = lugares_z[id]
		L["volta"] = maxf(0.0, float(L["volta"]) - 1.5)
		if not L["ativo"] and d < 120.0 and float(L["volta"]) <= 0.0 and jogador.vivo:
			L["ativo"] = true
			var zs := []
			for q in pts:
				var z := _nascer(Vector3(float(q[0]), 0, float(q[1])), noite() and randf() < 0.3)
				z.set_meta("lugar", id)
				zs.append(z)
			L["zumbis"] = zs
		elif L["ativo"] and d > 220.0:
			L["ativo"] = false
			L["volta"] = 240.0
			for z in L["zumbis"]:
				if is_instance_valid(z) and z.estado != "caca":
					z.queue_free()
			L["zumbis"] = []


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
		var cx: Dictionary = mundo.caixas[c.get_meta("caixa")]
		return ("E  " + str(cx["nome"])) if cx["cheia"] else "Vazio (volta a ter coisa depois)"
	if c.has_meta("agua"):
		return "E  Beber água: " + str(mundo.aguas[c.get_meta("agua")]["nome"])
	if c.has_meta("porta"):
		return "E  Fechar a porta" if construcao.portas[c.get_meta("porta")]["aberta"] else "E  Abrir a porta"
	if c.has_meta("bau"):
		return "E  Pegar suas coisas" if construcao.baus[c.get_meta("bau")].get("mochila", false) else "E  Abrir o baú"
	if c.has_meta("recurso"):
		var r: Dictionary = mundo.recursos[c.get_meta("recurso")]
		match r["tipo"]:
			"planta":
				return "E  Colher fibra" + (" (tem frutinha)" if r.get("fruta", false) else "")
			"solto":
				return "E  Pegar " + str({"pedra": "a pedra", "galho": "o galho", "cogumelo": "o cogumelo", "fibra": "a fibra"}.get(r["nome"], r["nome"]))
			"arvore", "tronco":
				return "Madeira (bata com o machado)"
			"pedra":
				return "Pedra (bata com a picareta)"
	if c.has_meta("zumbi"):
		return "Zumbi"
	if c.has_meta("peca") and construcao.peca_viva(c.get_meta("peca")):
		var pe: Dictionary = construcao.pecas[c.get_meta("peca")]
		var dica := "  (o pé de cabra conserta)" if float(pe["vida"]) < float(pe["max"]) else ""
		return "%s  %d/%d%s" % [Dados.peca(pe["id"])["nome"], int(pe["vida"]), int(pe["max"]), dica]
	return ""


func _morreu() -> void:
	ui.abrir(false)
	# como no Rust: o que você tinha fica numa mochila no chão, dá para voltar e pegar
	var tinha := false
	for s in jogador.inv.slots:
		if s != null:
			tinha = true
	if tinha:
		construcao.por_mochila(jogador.global_position, jogador.inv)
	ui.mostrar_morte(true)


func renascer(no_saco := false) -> void:
	ui.mostrar_morte(false)
	var p := Vector3(SPAWN.x, terreno.h(SPAWN.x, SPAWN.z) + 0.5, SPAWN.z)
	if no_saco and construcao.sacos.size() > 0:
		p = construcao.sacos[construcao.sacos.size() - 1] + Vector3(0, 0.6, 0)
	jogador.renascer(p)
	jogador.inv.mudou.connect(ui.atualizar)
	ui.atualizar()


# ======================= testes da nuvem =======================
var _erros: Array = []


## se o teste travar, sai com erro em vez de ficar rodando até o tempo da nuvem acabar
func _vigia(seg: float, nome: String) -> void:
	await get_tree().create_timer(seg, true, false, true).timeout
	print("%s FALHOU: tempo esgotado (%d s)" % [nome, int(seg)])
	get_tree().quit(2)


func _confere(ok: bool, txt: String) -> void:
	print(("ok    " if ok else "FALHA ") + txt)
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


## anda segurando uma tecla por n quadros de física
func _segurar(acao: String, n: int) -> void:
	Input.action_press(acao)
	await _quadros(n)
	Input.action_release(acao)


## põe o item na mão (traz para a barra se estiver na mochila)
func _na_mao(id: String) -> bool:
	var inv := jogador.inv
	for i in Inventario.ESPACOS:
		if inv.slots[i] != null and inv.slots[i]["id"] == id:
			var k := i
			if k >= Inventario.BARRA:
				inv.trocar(k, 5)
				k = 5
			jogador.selecionar(k)
			return true
	return false


func _por_em(p: Vector3) -> void:
	jogador.global_position = p
	jogador.velocity = Vector3.ZERO


## mira num ponto (local da base) e põe a peça escolhida como o jogador poria
func _peca_mirando(b0: Dictionary, n_peca: int, de: Vector3, alvo_local: Vector3) -> bool:
	construcao.peca = n_peca
	_por_em(b0["xf"] * de)
	await _quadros(4)
	_olhar(b0["xf"] * alvo_local)
	await _quadros(2)
	var a2: Dictionary = construcao._calcular()
	if a2.is_empty() or not a2["ok"]:
		print("      (não deu para pôr %s: %s)" % [Dados.PECAS[n_peca]["id"], str(a2.get("chave", "sem alvo"))])
		return false
	construcao.alvo = a2
	construcao.colocar(Dados.PECAS[n_peca]["id"], a2["xf"], a2["chave"])
	return true


## um lugar livre e quase plano de "lado" metros perto de "centro" (para a base de teste e as fotos): sem árvore, pedra,
## parede nem água
func _lugar_livre(centro: Vector2, lado: float, evita := Vector2(99999, 99999)) -> Vector3:
	var sp := get_world_3d().direct_space_state
	var q := PhysicsShapeQueryParameters3D.new()
	var caixa := BoxShape3D.new()
	caixa.size = Vector3(lado, 4.0, lado)
	q.shape = caixa
	q.collision_mask = 1
	var fora: Array[RID] = [terreno.corpo_chao.get_rid()]
	q.exclude = fora
	for k in 400:
		var a := k * 2.39996
		var r := 1.0 + k * 0.45
		var p := centro + Vector2(cos(a), sin(a)) * r
		if p.distance_to(evita) < lado + 4.0 or not terreno.dentro(p.x, p.y) or terreno.tipo_agua(p.x, p.y) != 0:
			continue
		var ys := []
		var m := lado * 0.5
		for d in [Vector2(-m, -m), Vector2(m, -m), Vector2(-m, m), Vector2(m, m), Vector2.ZERO]:
			ys.append(terreno.h(p.x + d.x, p.y + d.y))
		if ys.max() - ys.min() > 1.0:
			continue
		q.transform = Transform3D(Basis(), Vector3(p.x, terreno.h(p.x, p.y) + 2.3, p.y))
		if sp.intersect_shape(q, 1).is_empty():
			return Vector3(p.x, terreno.h(p.x, p.y), p.y)
	return Vector3(centro.x, terreno.h(centro.x, centro.y), centro.y)


## a beira de terra de um lago ou rio: anda do meio da água para fora até achar chão seco com 3 m de terra depois
func _beira(centro: Vector2) -> Dictionary:
	var melhor := {}
	for k in 16:
		var a := k * TAU / 16.0
		var d := Vector2(cos(a), sin(a))
		var achou_agua := false
		for n in 120:
			var p := centro + d * (n * 0.5)
			var t := terreno.tipo_agua(p.x, p.y)
			if t == 1:
				achou_agua = true
				continue
			if not achou_agua:
				continue
			var seco := true
			for m in 6:
				var q := p + d * (m * 0.5)
				if terreno.tipo_agua(q.x, q.y) != 0:
					seco = false
			if seco and terreno.h(p.x, p.y) > terreno.nivel_agua(p.x - d.x, p.y - d.y) + 0.05:
				if melhor.is_empty() or n < int(melhor["n"]):
					melhor = {"p": p, "d": d, "n": n}
			break
	return melhor


func _teste() -> void:
	print("TESTE VAYDR Godot: começo")
	await _quadros(5)
	var F := Construcao.FUND
	# o mapa do jogo antigo
	_confere(terreno.W >= 801 and terreno.H >= 681 and terreno.alturas.size() == terreno.W * terreno.H, "relevo do jogo antigo: %d x %d m (com a Serra Velha)" % [terreno.W, terreno.H])
	_confere(malhas_mapa.nos.size() >= 320 and malhas_mapa.n_vertices > 1500000, "prédios, casas, bairros, ruas, kit e o resto: %d malhas, %d mil vértices" % [malhas_mapa.nos.size(), malhas_mapa.n_vertices / 1000])
	_confere(objetos.n_objetos > 2800 and objetos.modelos.size() > 100, "objetos 3D do jogo antigo: %d (móveis, rua, acampamento e lugares), %d modelos" % [objetos.n_objetos, objetos.modelos.size()])
	_confere(colisao.n_formas > 5000 and colisao.brenha.size() > 1000, "colisão do mapa: %d formas (%d sem desenho ficaram de fora), borda de mato com %d pontos" % [colisao.n_formas, colisao.n_sem_desenho, colisao.brenha.size()])
	var n := {"arvore": 0, "pedra": 0, "planta": 0, "solto": 0, "tronco": 0}
	for r in mundo.recursos:
		n[r["tipo"]] = int(n.get(r["tipo"], 0)) + 1
	_confere(n["arvore"] > 6000 and n["pedra"] > 250 and n["planta"] > 800 and n["solto"] > 700 and n["tronco"] > 50,
		"mata do jogo antigo: %d árvores, %d pedras, %d moitas, %d coisas no chão, %d troncos caídos" % [n["arvore"], n["pedra"], n["planta"], n["solto"], n["tronco"]])
	_confere(mundo.caixas.size() > 700 and mundo.aguas.size() >= 9, "%d móveis e baús para revistar, %d poços e barris" % [mundo.caixas.size(), mundo.aguas.size()])
	var sv: Dictionary = mundo.serra
	_confere(sv["paredoes"] > 100 and sv["soltas"] > 300 and sv["folhagem"] > 1000 and sv["colisoes"] > 100,
		"Serra Velha: %d paredões de rocha e %d pedras soltas (%d com colisão dentro do mapa); %d plantas no chão da mata" % [sv["paredoes"], sv["soltas"], sv["colisoes"], sv["folhagem"]])
	# o paredão segura (a colisão tem o formato da rocha, acima do chão da encosta)
	var pt: Vector3 = sv["teste"]
	var raio := PhysicsRayQueryParameters3D.create(pt + Vector3(0, 40, 0), pt - Vector3(0, 10, 0))
	raio.exclude = [jogador.get_rid()]
	var bate := get_world_3d().direct_space_state.intersect_ray(raio)
	var eh_rocha := false
	if not bate.is_empty() and bate["collider"] is StaticBody3D:
		for c in (bate["collider"] as Node).get_children():
			if c is CollisionShape3D and (c as CollisionShape3D).shape is ConvexPolygonShape3D:
				eh_rocha = true
	_confere(eh_rocha and float(bate["position"].y) > terreno.h(pt.x, pt.z) + 0.3,
		"paredão da serra tem colisão no formato da rocha (%s)" % ("y %.1f, chão %.1f" % [float(bate["position"].y), terreno.h(pt.x, pt.z)] if not bate.is_empty() else "nada"))
	_confere(mundo.zspawn.size() >= 10, "zumbis de %d lugares do mapa" % mundo.zspawn.size())
	_confere(jogador.inv.conta("bandagem") == 0 and jogador.item_mao().is_empty(), "começa de mão vazia (sem item de graça)")
	_confere(Vector2(jogador.global_position.x, jogador.global_position.z).distance_to(Vector2(SPAWN.x, SPAWN.z)) < 2.0, "começa onde o jogo antigo começa (8, 44)")
	# a maré sobe e desce
	terreno.mare(0.0)
	var m0 := terreno.nivel_mar
	terreno.mare(3.1)
	_confere(terreno.nivel_mar > m0 + 0.5, "maré: o mar sobe (%.2f -> %.2f m)" % [m0, terreno.nivel_mar])
	# andar e pular de verdade (pelas teclas), num lugar livre da clareira
	var livre := _lugar_livre(Vector2(0, 0), 14.0)
	_por_em(Vector3(livre.x, livre.y + 0.2, livre.z + 4.0))
	await _quadros(20)
	_olhar(jogador.global_position + Vector3(0, 1.6, -10))
	var p0 := jogador.global_position
	await _segurar("frente", 40)
	var andou := Vector2(jogador.global_position.x - p0.x, jogador.global_position.z - p0.z).length()
	_confere(andou > 1.5, "andar com W (%.1f m em 0,7 s)" % andou)
	await _quadros(20)
	var y0 := jogador.global_position.y
	Input.action_press("pular")
	await _quadros(12)
	Input.action_release("pular")
	_confere(jogador.global_position.y > y0 + 0.4, "pular (subiu %.2f m)" % (jogador.global_position.y - y0))
	await _quadros(40)
	# degrau de 30 cm (meio-fio): sobe andando, sem pular
	var dg := StaticBody3D.new()
	var dgs := CollisionShape3D.new()
	var dgb := BoxShape3D.new()
	dgb.size = Vector3(3.0, 0.3, 3.0)
	dgs.shape = dgb
	dg.add_child(dgs)
	add_child(dg)
	_por_em(Vector3(livre.x, livre.y + 0.1, livre.z + 3.0))
	await _quadros(15)
	var chao0 := jogador.global_position.y
	dg.global_position = Vector3(livre.x, chao0 + 0.15, livre.z + 0.4)
	_olhar(jogador.global_position + Vector3(0, 1.6, -10))
	await _quadros(4)
	await _segurar("frente", 50)
	await _quadros(10)
	_confere(jogador.global_position.y > chao0 + 0.25, "sobe degrau de 30 cm andando (%.2f m)" % (jogador.global_position.y - chao0))
	dg.queue_free()
	await _quadros(5)
	# o chão da cidade e o andar de cima de um prédio seguram (não cai pelo chão)
	_por_em(Vector3(250, 1.2, 12))
	await _quadros(45)
	_confere(jogador.global_position.y > -0.3 and jogador.global_position.y < 0.8 and jogador.vivo, "rua da cidade segura (y %.2f)" % jogador.global_position.y)
	_por_em(Vector3(216.1, 3.47 + 0.6, 28.2))
	await _quadros(45)
	_confere(jogador.global_position.y > 3.3 and jogador.global_position.y < 4.6, "1º andar do Edifício Aurora segura (y %.2f, piso 3,47; móvel até 4,5)" % jogador.global_position.y)
	# coleta de verdade: o jogador vai até a árvore mais perto do começo e bate com a mão
	var arv: Dictionary = {}
	var dmin := 1e9
	for r in mundo.recursos:
		if r["tipo"] == "arvore":
			var dd: float = Vector2(r["pos"].x, r["pos"].z).distance_to(Vector2(livre.x, livre.z))
			if dd < dmin:
				dmin = dd
				arv = r
	var pa: Vector3 = arv["pos"]
	var raio_a: float = (((arv["corpo"] as StaticBody3D).get_child(0) as CollisionShape3D).shape as CylinderShape3D).radius
	var lado_a := Vector3(livre.x - pa.x, 0, livre.z - pa.z).normalized()
	var junto := pa + lado_a * (raio_a + 0.9)
	_por_em(Vector3(junto.x, terreno.h(junto.x, junto.z) + 0.3, junto.z))
	await _quadros(10)
	_olhar(pa + Vector3(0, 1.3, 0))
	await _quadros(3)
	var md0 := jogador.inv.conta("madeira")
	for i in 4:
		jogador.cd = 0.0
		jogador.atacar()
		await _quadros(2)
	var com_mao := jogador.inv.conta("madeira") - md0
	_confere(com_mao > 0, "coleta: bater na árvore com a mão deu madeira (%d em 4 golpes)" % com_mao)
	# pedra com a mão: a pedra mais perto
	var ped: Dictionary = {}
	dmin = 1e9
	for r in mundo.recursos:
		if r["tipo"] == "pedra":
			var dd2: float = Vector2(r["pos"].x, r["pos"].z).distance_to(Vector2(livre.x, livre.z))
			if dd2 < dmin:
				dmin = dd2
				ped = r
	var pno: MeshInstance3D = ped["no"]
	var caixa_p: AABB = pno.get_aabb()
	var pc_w: Vector3 = pno.global_transform * caixa_p.get_center()
	var raio_p: float = maxf(caixa_p.size.x, caixa_p.size.z) * 0.5 * pno.transform.basis.get_scale().x
	_por_em(Vector3(pc_w.x + raio_p + 1.1, terreno.h(pc_w.x + raio_p + 1.1, pc_w.z) + 0.3, pc_w.z))
	await _quadros(10)
	_olhar(pc_w + Vector3(0, 0.3, 0))
	await _quadros(3)
	var s0 := jogador.inv.conta("pedra")
	for i in 3:
		jogador.cd = 0.0
		jogador.atacar()
		await _quadros(2)
	_confere(jogador.inv.conta("pedra") > s0, "coleta: bater na pedra deu pedra (%d)" % (jogador.inv.conta("pedra") - s0))
	# pegar coisa do chão (E)
	var solto: Dictionary = {}
	var isolto := -1
	dmin = 1e9
	for k in mundo.recursos.size():
		var r: Dictionary = mundo.recursos[k]
		if r["tipo"] == "solto":
			var dd3: float = Vector2(r["pos"].x, r["pos"].z).distance_to(Vector2(livre.x, livre.z))
			if dd3 < dmin:
				dmin = dd3
				solto = r
				isolto = k
	var ps: Vector3 = solto["pos"]
	_por_em(Vector3(ps.x + 1.0, terreno.h(ps.x + 1.0, ps.z) + 0.3, ps.z))
	await _quadros(10)
	_olhar(ps + Vector3(0, 0.15, 0))
	await _quadros(3)
	var item_s: String = solto["item"]
	var antes_s := jogador.inv.conta(item_s)
	jogador.usar()
	_confere(jogador.inv.conta(item_s) > antes_s and float(mundo.recursos[isolto]["vida"]) <= 0.0, "E pega %s do chão (+%d %s)" % [solto["nome"], jogador.inv.conta(item_s) - antes_s, item_s])
	# fabricação
	jogador.inv.por("madeira", 600)
	jogador.inv.por("pedra", 100)
	for r in Dados.RECEITAS:
		if r["faz"] in ["machado", "plano", "picareta"]:
			fabricar(r)
	_confere(jogador.inv.conta("machado") == 1 and jogador.inv.conta("plano") == 1 and jogador.inv.conta("picareta") == 1, "fabricou machado, picareta e plano de construção")
	# o machado tira muito mais madeira que a mão
	var im := -1
	for i in Inventario.BARRA:
		if jogador.inv.slots[i] != null and jogador.inv.slots[i]["id"] == "machado":
			im = i
	_confere(im >= 0, "machado foi para a barra de atalhos")
	if im >= 0:
		jogador.selecionar(im)
		_confere(jogador.ferramenta_no != null, "machado aparece na mão")
		_por_em(Vector3(junto.x, terreno.h(junto.x, junto.z) + 0.3, junto.z))
		await _quadros(10)
		_olhar(pa + Vector3(0, 1.3, 0))
		await _quadros(3)
		var m1 := jogador.inv.conta("madeira")
		jogador.cd = 0.0
		jogador.atacar()
		var com_machado := jogador.inv.conta("madeira") - m1
		_confere(com_machado > com_mao / 4.0 * 2.0, "machado: %d de madeira num golpe (mão: %d em 4)" % [com_machado, com_mao])
	# construção: base 2x2 num lugar livre perto da clareira, paredes, porta, janela, piso e escada
	var ip := -1
	for i in Inventario.ESPACOS:
		if jogador.inv.slots[i] != null and jogador.inv.slots[i]["id"] == "plano":
			ip = i
	if ip >= Inventario.BARRA:
		jogador.inv.trocar(ip, 0)
		ip = 0
	jogador.selecionar(ip)
	_confere(construcao.ativo, "plano na mão liga a construção")
	_por_em(Vector3(livre.x, livre.y + 0.3, livre.z + 1.0))
	await _quadros(8)
	_olhar(jogador.global_position + Vector3(0, -0.2, -4.0))
	await _quadros(3)
	construcao.peca = 0
	var a: Dictionary = construcao._calcular()
	construcao.alvo = a
	_confere(not a.is_empty() and a["ok"], "fundação: lugar válido")
	if not a.is_empty():
		construcao.colocar("fundacao", a["xf"], a["chave"])
	var b0: Dictionary = construcao.bases[0] if construcao.bases.size() > 0 else {}
	if b0.is_empty():
		_confere(false, "base criada")
	else:
		# as outras 3 fundações pela mira, encostadas na primeira
		var fund := 1
		for c in [Vector2i(1, 0), Vector2i(0, 1), Vector2i(1, 1)]:
			construcao.peca = 0
			_por_em(b0["xf"] * Vector3(0, F + 0.05, 0))
			await _quadros(4)
			_olhar(b0["xf"] * Vector3(c.x * 3.0, F - 0.3, c.y * 3.0))
			await _quadros(2)
			var af: Dictionary = construcao._calcular()
			if not af.is_empty() and af["ok"]:
				construcao.alvo = af
				construcao.colocar("fundacao", af["xf"], af["chave"])
				fund += 1
			else:
				print("      (fundação %s não deu: %s)" % [str(c), str(af)])
		_confere(fund == 4, "4 fundações encaixadas na grade (%d)" % fund)
		var feitas := 0
		for pc in [[1, Vector3(1.5, 1.2 + F, 0)], [2, Vector3(-1.5, 1.2 + F, 0)], [3, Vector3(0, 1.2 + F, -1.5)], [1, Vector3(0, 1.2 + F, 1.5)]]:
			if await _peca_mirando(b0, pc[0], Vector3(0, F + 0.05, 0.3), pc[1]):
				feitas += 1
		_confere(feitas == 4, "paredes: parede, parede com porta, parede com janela e parede (%d de 4)" % feitas)
		_confere(construcao.portas.size() == 1, "porta na parede com porta")
		# piso em cima da cela (0,0), apoiado nas paredes
		var piso_ok: bool = await _peca_mirando(b0, 4, Vector3(0, F + 0.05, 0.9), Vector3(0, F + 2.8, 0))
		_confere(piso_ok, "piso/teto em cima das paredes")
		# escada na cela (1,0) e subir por ela andando
		var esc_ok: bool = await _peca_mirando(b0, 5, Vector3(3.0, F + 0.05, -0.3), Vector3(3.0, F + 1.2, 0.6))
		_confere(esc_ok, "escada na cela (1,0)")
		if esc_ok:
			var pe: Dictionary = construcao.pecas[construcao.pecas.size() - 1]
			var exf: Transform3D = pe["xf"]
			_por_em(exf * Vector3(-0.75, 0.1, 2.6))
			await _quadros(10)
			_olhar(exf * Vector3(-0.75, 1.6, -1.0))
			var ya := jogador.global_position.y
			await _segurar("frente", 55)
			await _quadros(20)
			var subiu: float = jogador.global_position.y - ya
			_confere(subiu > 1.1, "subiu a escada andando (%.2f m)" % subiu)
		# porta abre e fecha
		construcao.alternar_porta(0)
		await _quadros(40)
		var dob: Node3D = construcao.portas[0]["dob"]
		_confere(absf(dob.rotation.y + PI / 2.0) < 0.08, "porta abriu (%.2f)" % dob.rotation.y)
		construcao.alternar_porta(0)
		await _quadros(40)
		_confere(absf(dob.rotation.y) < 0.08, "porta fechou")
		# zumbi do lado de fora da porta fechada: bate na porta, não em quem está dentro
		_por_em(b0["xf"] * Vector3(0.4, F + 0.05, 0.0))
		jogador.vida = 100.0
		var ip_porta := -1
		for k in construcao.pecas.size():
			if construcao.pecas[k]["id"] == "porta":
				ip_porta = k
		var v_porta: float = construcao.pecas[ip_porta]["vida"]
		var zp := _nascer(b0["xf"] * Vector3(-3.2, 0, 0.0), false)
		await _quadros(240)
		var v_depois: float = construcao.pecas[ip_porta]["vida"]
		_confere(v_depois < v_porta, "zumbi bate na porta fechada (porta %d de %d)" % [int(v_depois), int(v_porta)])
		_confere(jogador.vida >= 99.0, "a porta segura: o zumbi não acerta quem está dentro (vida %d)" % int(jogador.vida))
		zp.ferir(999.0, jogador.global_position)
		# o pé de cabra conserta a porta
		jogador.inv.por("martelo", 1)
		jogador.inv.por("madeira", 20)
		_na_mao("martelo")
		_olhar(b0["xf"] * Vector3(-1.5, F + 1.2, 0.0))
		jogador.cd = 0.0
		jogador.atacar()
		_confere(float(construcao.pecas[ip_porta]["vida"]) > v_depois or v_depois >= v_porta, "pé de cabra conserta a porta (%d)" % int(construcao.pecas[ip_porta]["vida"]))
		_confere(construcao.pecas.size() == 10, "peças na base: %d (4 fundações, 4 paredes, piso, escada)" % construcao.pecas.size())
		# saco de dormir, baú e lanterna
		jogador.inv.por("saco", 1)
		jogador.inv.por("bau", 1)
		jogador.inv.por("lanterna", 1)
		_por_em(b0["xf"] * Vector3(0, F + 0.05, 3.6))
		await _quadros(6)
		_olhar(b0["xf"] * Vector3(0, F, 2.4))
		_na_mao("saco")
		jogador.cd = 0.0
		jogador.atacar()
		_confere(construcao.sacos.size() == 1, "saco de dormir no chão da base")
		_olhar(b0["xf"] * Vector3(1.2, F, 3.6))
		_na_mao("bau")
		jogador.cd = 0.0
		jogador.atacar()
		_confere(construcao.baus.size() == 1, "baú no chão da base")
		if construcao.baus.size() == 1:
			ui.abrir_bau(construcao.baus[0]["inv"])
			ui._guardar_recursos()
			var bi: Inventario = construcao.baus[0]["inv"]
			_confere(bi.conta("madeira") > 0 and jogador.inv.conta("madeira") == 0, "guardou a madeira no baú (%d)" % bi.conta("madeira"))
			ui.abrir(false)
		_na_mao("lanterna")
		_confere(jogador.luz_mao.visible, "lanterna acende na mão")
	# móveis dos prédios: o que tem dentro sai da tabela do jogo antigo; depois de revistado fica vazio
	var ic := -1
	var achou: Array = []
	for k in 60:
		var L2: Array = mundo.revistar(k)
		if not L2.is_empty():
			ic = k
			achou = L2
			break
	_confere(ic >= 0 and not mundo.caixas[ic]["cheia"] and mundo.revistar(ic).is_empty(),
		"revistar móvel: %s deu %s e ficou vazio" % [mundo.caixas[maxi(ic, 0)]["nome"] + " (" + str(mundo.caixas[maxi(ic, 0)]["tabela"]) + ")", str(achou)])
	# revistar pela mira (E) um móvel do 1º andar do Edifício Aurora
	var ia := -1
	for k in mundo.caixas.size():
		var cx: Dictionary = mundo.caixas[k]
		var pc: Vector3 = cx["pos"]
		if cx["cheia"] and pc.y > 3.0 and pc.y < 4.0 and pc.x > 213.0 and pc.x < 227.0 and pc.z > 19.0 and pc.z < 37.0:
			ia = k
			break
	if ia >= 0:
		var pcx: Vector3 = mundo.caixas[ia]["pos"]
		var frente_c := Vector3(220.0 - pcx.x, 0, 28.0 - pcx.z).normalized()
		var de_c := pcx + frente_c * 1.3
		_por_em(Vector3(de_c.x, pcx.y + 0.1, de_c.z))
		await _quadros(10)
		_olhar(pcx + Vector3(0, 0.5, 0))
		await _quadros(3)
		var txt := texto_mira()
		jogador.usar()
		_confere(not mundo.caixas[ia]["cheia"], "revistar com E dentro do prédio (mira: \"%s\")" % txt)
	else:
		_confere(false, "achar móvel no 1º andar do Edifício Aurora")
	# água do lago (a beira de terra mais perto do meio)
	var bl := _beira(Vector2(66, 104))
	if not bl.is_empty():
		var pb: Vector2 = bl["p"]
		var db: Vector2 = bl["d"]
		_por_em(Vector3(pb.x, terreno.h(pb.x, pb.y) + 0.2, pb.y))
		await _quadros(15)
		var alvo_b := pb - db * 2.5
		_olhar(Vector3(alvo_b.x, terreno.nivel_agua(alvo_b.x, alvo_b.y), alvo_b.y))
		jogador.sede = 40.0
		jogador.usar()
		_confere(jogador.sede > 60.0, "beber água no lago (sede %d)" % int(jogador.sede))
	else:
		_confere(false, "achar a beira do lago")
	# poço: E bebe
	var pp: Vector3 = mundo.aguas[1]["pos"]
	_por_em(Vector3(pp.x + 1.6, terreno.h(pp.x + 1.6, pp.z) + 0.3, pp.z))
	await _quadros(10)
	_olhar(pp + Vector3(0, 0.6, 0))
	jogador.sede = 40.0
	jogador.usar()
	_confere(jogador.sede > 60.0, "beber no %s (sede %d)" % [mundo.aguas[1]["nome"], int(jogador.sede)])
	_confere(jogador.fome < 100.0 and jogador.sede < 100.0, "fome e sede caem com o tempo")
	# zumbis da vila: aparecem quando você chega perto e somem quando vai embora
	_por_em(Vector3(40, terreno.h(40, -40) + 0.3, -40))
	await _quadros(3)
	_lugares_t = 0.0
	_zumbis_dos_lugares(0.1)
	var nv: int = (lugares_z.get("vila", {}).get("zumbis", []) as Array).size()
	_confere(nv >= 8, "chegou na vila: %d zumbis apareceram nos pontos do jogo antigo" % nv)
	_por_em(Vector3(livre.x, livre.y + 0.3, livre.z + 30.0))
	await _quadros(3)
	_por_em(Vector3(-60, terreno.h(-60, 150) + 0.3, 150))
	await _quadros(3)
	_lugares_t = 0.0
	_zumbis_dos_lugares(0.1)
	await _quadros(3)
	_confere(not lugares_z["vila"]["ativo"], "foi embora: os zumbis da vila sumiram (voltam depois)")
	# zumbi: nasce perto, caça, bate e morre com os golpes (noutro lugar livre)
	var livre2 := _lugar_livre(Vector2(-20, 30), 8.0, Vector2(livre.x, livre.z))
	_por_em(Vector3(livre2.x, livre2.y + 0.3, livre2.z + 1.5))
	jogador.vida = 100.0
	await _quadros(5)
	var z := _nascer(Vector3(livre2.x, 0, livre2.z - 1.0), false)
	await _quadros(150)
	_confere(z.estado == "caca", "zumbi viu e caçou o jogador")
	_confere(jogador.vida < 100.0, "zumbi bateu (vida %d)" % int(jogador.vida))
	for i in 8:
		z.ferir(22.0, jogador.global_position)
	await _quadros(10)
	_confere(z.estado == "morto", "zumbi morreu com os golpes")
	_confere(z.anim != null and z.anim.has_animation("sFeridoAnda") and z.anim.has_animation("sGolpe"), "animações do zumbi carregadas")
	# morte e volta: a mochila cai no chão com o que tinha
	jogador.inv.por("pedra", 37)
	var n_baus := construcao.baus.size()
	jogador.ferir(999.0)
	await _quadros(3)
	_confere(not jogador.vivo and ui.morte.visible, "morreu e apareceu a tela de morte")
	var caiu: bool = construcao.baus.size() == n_baus + 1 and construcao.baus[n_baus].get("mochila", false)
	_confere(caiu and (construcao.baus[n_baus]["inv"] as Inventario).conta("pedra") >= 37, "a mochila caiu no chão com as coisas")
	renascer()
	await _quadros(5)
	_confere(jogador.vivo and jogador.inv.conta("madeira") == 0 and Vector2(jogador.global_position.x, jogador.global_position.z).distance_to(Vector2(SPAWN.x, SPAWN.z)) < 2.0,
		"renasceu no começo, de mão vazia")
	if construcao.sacos.size() > 0:
		jogador.ferir(999.0)
		await _quadros(3)
		renascer(true)
		await _quadros(5)
		_confere(jogador.vivo and jogador.global_position.distance_to(construcao.sacos[0]) < 2.0, "renasceu no saco de dormir")
	hora = 22.0
	_confere(noite(), "noite às 22h")
	if _erros.is_empty():
		print("TESTE OK")
	else:
		print("TESTE FALHOU: ", _erros)
	get_tree().quit(0 if _erros.is_empty() else 1)


func _foto(nome: String) -> void:
	# a janela das fotos é 1280 x 720 (às vezes ela encolhia no meio e a foto saía com dois quadros misturados)
	if DisplayServer.window_get_size() != Vector2i(1280, 720):
		print("foto %s: janela estava %s" % [nome, DisplayServer.window_get_size()])
		DisplayServer.window_set_size(Vector2i(1280, 720))
		await _quadros(6)
	await _quadros(10)
	await RenderingServer.frame_post_draw
	var img := get_viewport().get_texture().get_image()
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path("res://fotos"))
	img.save_jpg(ProjectSettings.globalize_path("res://fotos/%s.jpg" % nome), 0.86)
	var dc := RenderingServer.get_rendering_info(RenderingServer.RENDERING_INFO_TOTAL_DRAW_CALLS_IN_FRAME)
	var pr := RenderingServer.get_rendering_info(RenderingServer.RENDERING_INFO_TOTAL_PRIMITIVES_IN_FRAME)
	print("foto %s: %d chamadas de desenho, %d mil triângulos, %d fps (software)" % [nome, dc, pr / 1000, Engine.get_frames_per_second()])


## põe a câmera num ponto do chão olhando para o alvo (relativo: a altura do alvo conta a partir do chão de lá)
func _cam(pos: Vector3, alvo: Vector3, relativo := true) -> void:
	var y: float = chao_em(pos.x, pos.z, terreno.h(pos.x, pos.z) + 2.5)["y"]
	_por_em(Vector3(pos.x, y + 0.2, pos.z))
	await _quadros(3)
	if relativo:
		alvo.y += terreno.h(alvo.x, alvo.z)
	_olhar(alvo)


## câmera solta no ar (o jogador fica parado lá em cima só para a foto)
func _cam_alto(pos: Vector3, alvo: Vector3) -> void:
	jogador.set_physics_process(false)
	_por_em(pos)
	await _quadros(2)
	_olhar(alvo)


func _fotos() -> void:
	await _quadros(30)
	hora = 9.5
	print("fotos das espécies prontas: ", mundo.fotos_prontas)
	# começo do jogo: na mata ao sul da clareira
	await _cam(Vector3(SPAWN.x, 0, SPAWN.z), Vector3(4, 2.5, 10))
	await _foto("01_comeco_na_mata")
	jogador.inv.por("pedra", 120)
	jogador.inv.por("fibra", 30)
	jogador.inv.por("madeira", 260)
	jogador.inv.por("machado", 1)
	ui.abrir(true)
	await _foto("02_mochila")
	ui.abrir(false)
	jogador.inv = Inventario.new()
	jogador.inv.mudou.connect(jogador._atualizar_mao)
	jogador.inv.mudou.connect(ui.atualizar)
	ui.atualizar()
	await _cam(Vector3(14, 0, 16), Vector3(-6, 2.0, -8))
	await _foto("03_clareira")
	# a estrada de asfalto chegando na cidade
	await _cam(Vector3(140, 0, 6), Vector3(220, 6.0, 10))
	await _foto("04_estrada_para_a_cidade")
	# avenida da cidade (prédios dos dois lados)
	await _cam(Vector3(205, 0, 12), Vector3(300, 8.0, 14))
	await _foto("05_avenida_da_cidade")
	# dentro do Edifício Aurora (portaria, térreo)
	_por_em(Vector3(214.5, 0.4, 20.6))
	await _quadros(4)
	_olhar(Vector3(218.0, 1.4, 24.0))
	await _foto("06_dentro_do_predio")
	# lugares escaneados: Base Militar Serra Velha e o galpão de trens
	await _cam(Vector3(-84, 0, -48), Vector3(-108, 2.0, -30))
	await _foto("06b_base_militar")
	await _cam(Vector3(128, 0, 52), Vector3(152, 3.0, 60))
	await _foto("06c_galpao_de_trens")
	# Serra Velha: paredões de rocha e pedras soltas na encosta (noroeste do mapa)
	await _cam(Vector3(-160, 0, -88), Vector3(-196, 6.0, -94))
	await _foto("06d_serra_velha")
	# Morro do Sabiá (sul da cidade) e Cidade Alta (norte)
	await _cam(Vector3(250, 0, 84), Vector3(255, 6.0, 135))
	await _foto("07_morro_do_sabia")
	await _cam_alto(Vector3(244, 34, -52), Vector3(246, 6.0, -150))
	await _foto("08_cidade_alta")
	jogador.set_physics_process(true)
	# porto e mar
	await _cam_alto(Vector3(334, 24, 58), Vector3(378, 2.0, 8))
	await _foto("09_porto_e_mar")
	jogador.set_physics_process(true)
	# vila e lago
	await _cam(Vector3(40, 0, -60), Vector3(62, 2.0, -76))
	await _foto("10_vila")
	await _cam(Vector3(30, 0, 100), Vector3(66, 0.5, 104))
	await _foto("11_lago")
	# o mapa visto do alto
	# vista do alto (câmera solta): enxerga mais longe e com menos neblina que no jogo, para mostrar o mapa inteiro
	var far0 := jogador.cam.far
	var neb0 := amb.fog_density
	jogador.cam.far = 2500.0
	amb.fog_density = 0.0012
	await _cam_alto(Vector3(60, 140, 190), Vector3(220, 0, -20))
	await _foto("12_mapa_do_alto")
	jogador.cam.far = far0
	amb.fog_density = neb0
	jogador.set_physics_process(true)
	# machado na mão, de frente para uma árvore perto do começo
	var livre := _lugar_livre(Vector2(0, 0), 14.0)
	jogador.inv.por("machado", 1)
	for i in Inventario.BARRA:
		if jogador.inv.slots[i] != null and jogador.inv.slots[i]["id"] == "machado":
			jogador.selecionar(i)
	var arv: Dictionary = {}
	var dmin := 1e9
	for r in mundo.recursos:
		if r["tipo"] == "arvore":
			var dd: float = Vector2(r["pos"].x, r["pos"].z).distance_to(Vector2(livre.x, livre.z))
			if dd < dmin:
				dmin = dd
				arv = r
	var pa: Vector3 = arv["pos"]
	var lado_a := Vector3(livre.x - pa.x, 0, livre.z - pa.z).normalized()
	var junto := pa + lado_a * 2.2
	_por_em(Vector3(junto.x, terreno.h(junto.x, junto.z) + 0.3, junto.z))
	await _quadros(6)
	_olhar(pa + Vector3(0, 1.5, 0))
	await _foto("13_machado_na_mao")
	jogador.inv.tirar("machado", 1)
	# uma base pequena montada pelo próprio sistema de construção, num lugar livre perto da clareira
	jogador.inv.por("madeira", 900)
	_por_em(Vector3(livre.x, livre.y + 0.3, livre.z + 1.0))
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
		var F := Construcao.FUND
		for c in [Vector2i(1, 0), Vector2i(0, 1), Vector2i(1, 1)]:
			var xf: Transform3D = construcao._xf_cela(b0, c.x, c.y, 0)
			construcao.alvo = {}
			construcao.colocar("fundacao", xf, "c|%d|%d|%d|0" % [b0["id"], c.x, c.y])
		for w in [[1, Vector3(-1.5, 1.2 + F, 0)], [1, Vector3(0, 1.2 + F, -1.5)], [2, Vector3(4.5, 1.2 + F, 0)], [3, Vector3(3.0, 1.2 + F, -1.5)],
				[1, Vector3(-1.5, 1.2 + F, 3.0)], [3, Vector3(0, 1.2 + F, 4.5)], [1, Vector3(3.0, 1.2 + F, 4.5)], [1, Vector3(4.5, 1.2 + F, 3.0)]]:
			await _peca_mirando(b0, w[0], Vector3(1.5, F + 0.05, 1.5), w[1])
		await _peca_mirando(b0, 5, Vector3(3.0, F + 0.05, 2.0), Vector3(3.0, F + 1.2, 0.4))
		await _peca_mirando(b0, 4, Vector3(0, F + 0.05, 1.2), Vector3(0, F + 2.8, 0))
		await _peca_mirando(b0, 4, Vector3(0, F + 0.05, 1.8), Vector3(0, F + 2.8, 3.0))
		var fora: Vector3 = b0["xf"] * Vector3(-7.0, 0, 9.0)
		var centro: Vector3 = b0["xf"] * Vector3(1.5, 2.0, 1.5)
		hora = 17.4
		_nascer(b0["xf"] * Vector3(8.0, 0, 6.0), false)
		_nascer(b0["xf"] * Vector3(6.0, 0, 10.0), false)
		await _cam(fora, centro, false)
		await _foto("14_base_fim_de_tarde")
		hora = 21.5
		jogador.inv.por("fogueira", 1)
		_por_em(b0["xf"] * Vector3(-4.0, 0.3, 1.5))
		jogador.global_position.y = terreno.h(jogador.global_position.x, jogador.global_position.z) + 0.3
		await _quadros(4)
		_olhar(jogador.global_position + Vector3(0, -1.2, -1.8))
		await _quadros(2)
		construcao.por_fogueira(jogador)
		await _cam(b0["xf"] * Vector3(-9.0, 0, -2.0), b0["xf"] * Vector3(-3.0, 1.0, 1.5), false)
		await _foto("15_noite_fogueira")
	jogador.selecionar(5)
	hora = 10.0
	for z in zumbis:
		if is_instance_valid(z):
			z.queue_free()
	var livre2 := _lugar_livre(Vector2(-20, 30), 8.0, Vector2(livre.x, livre.z))
	var zz := _nascer(Vector3(livre2.x, 0, livre2.z - 1.5), false)
	zz.estado = "vaga"
	await _cam(Vector3(livre2.x, 0, livre2.z + 3.0), Vector3(livre2.x, 1.2, livre2.z - 1.5))
	await _foto("16_zumbi")
	get_tree().quit()
