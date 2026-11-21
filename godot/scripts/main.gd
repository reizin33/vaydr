extends Node3D
## VAYDR no Godot: monta o mapa do jogo antigo (relevo, água e maré, prédios, casas, bairros, ruas, colisão, a mata e o
## saque), o céu e o dia, o jogador, a tela, a construção e os zumbis (os de cada lugar do mapa e os que andam pela mata).
## A montagem vai por etapas atrás da tela de carregamento (como no jogo antigo); depois vem o "Quem vai jogar?", o lobby
## e o Jogar sozinho, e o mundo escolhido é carregado do seu arquivo (cada mundo de cada perfil é salvo separado).
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
var palco: Palco          # o palco da criação do personagem (a clareira no começo da noite)
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
var telas: Telas
var pronto := false       # o mundo terminou de montar
var em_jogo := false      # um mundo foi escolhido e está rodando (fora do lobby)
var mundo_sujo := false   # já jogou um mundo nesta montagem (outro mundo pede montar de novo)
var mundo_atual := {}
var arq_salvo := ""
var stats := {"zumbis": 0, "fabricados": 0}
var _ini_sessao := 0
var _tempo_base := 0.0
var lugares_z := {}       # zumbis de cada lugar do mapa: id -> {ativo, zumbis, volta}
var _lugares_t := 0.0
const SPAWN := Vector3(8, 0, 44)   # onde o jogo antigo começa: na mata, ao sul da clareira
const SEG_POR_HORA := 50.0


func _ready() -> void:
	var args := OS.get_cmdline_user_args()
	modo_teste = "--teste" in args or "--fotos" in args
	Dados.carregar()
	Ajustes.carregar()
	_teclas()
	telas = Telas.new(self)
	add_child(telas)
	if not modo_teste:
		# a tela de carregamento cobre tudo: o 3D só começa a ser desenhado quando o mundo é escolhido
		get_viewport().disable_3d = true
		Ajustes.tela_cheia(bool(Ajustes.v["tela_cheia"]))
		telas.mostrar("carga")
		telas.carga(0, "Montando o terreno", 2.0)
		await _quadro()
	_ambiente()
	var t0 := Time.get_ticks_msec()
	terreno = Terreno.new()
	terreno.name = "Terreno"
	add_child(terreno)
	terreno.montar()
	var t1 := Time.get_ticks_msec()
	await _etapa(1, "Levantando a cidade", 18.0)
	malhas_mapa = MalhasMapa.new()
	malhas_mapa.name = "Mapa"
	add_child(malhas_mapa)
	malhas_mapa.montar()
	await _etapa(1, "Mobiliando as casas", 38.0)
	objetos = ObjetosMapa.new()
	objetos.name = "Objetos"
	add_child(objetos)
	objetos.montar()
	var t2 := Time.get_ticks_msec()
	await _etapa(1, "Paredes e chão firmes", 52.0)
	colisao = ColisaoMapa.new(terreno)
	colisao.name = "Colisao"
	add_child(colisao)
	colisao.montar()
	var t3 := Time.get_ticks_msec()
	await _etapa(2, "Plantando a mata", 64.0)
	mundo = Mundo.new(terreno)
	mundo.name = "Mundo"
	add_child(mundo)
	mundo.montar(colisao)
	var t4 := Time.get_ticks_msec()
	print("mapa: relevo %d ms, malhas e objetos %d ms (%d mil vértices, %d objetos), colisão %d ms (%d formas), mata e saque %d ms" % [
		t1 - t0, t2 - t1, malhas_mapa.n_vertices / 1000, objetos.n_objetos, t3 - t2, colisao.n_formas, t4 - t3])
	await _etapa(3, "Espalhando os lugares", 82.0)
	mundo.tirar_fotos()
	grama = Grama.new(terreno)
	add_child(grama)
	await _etapa(4, "Ligando os sons", 92.0)
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
	palco = Palco.new(self)
	palco.name = "Palco"
	add_child(palco)
	ui = UI.new(self)
	add_child(ui)
	Ajustes.aplicar(self)
	pronto = true
	# começo: mão vazia (nada de item de graça); tudo sai de coleta, caixa e fabricação
	if "--teste" in args:
		_entrar_teste()
		_vigia(360.0, "TESTE")
		_teste.call_deferred()
	elif "--fotos" in args:
		_entrar_teste()
		_vigia(1500.0, "FOTOS")
		_fotos.call_deferred()
	else:
		# o mundo fica parado (e sem o HUD) até alguém escolher um mundo no lobby
		get_tree().paused = true
		ui.visible = false
		telas.carga_pronta()
		await get_tree().create_timer(0.7).timeout
		if Telas.mundo_pedido != "":
			Perfis.carregar()
			var m := Perfis.mundo(Perfis.atual, Telas.mundo_pedido)
			Telas.mundo_pedido = ""
			if not m.is_empty():
				telas.jogar(m)
				return
		telas.entrada()


## nos testes e nas fotos: entra direto num mundo de teste (arquivo à parte, sem mexer nos perfis)
func _entrar_teste() -> void:
	arq_salvo = "user://teste_mundo.json"
	mundo_atual = {"id": "teste", "nome": "Mundo de teste", "arq": arq_salvo}
	em_jogo = true
	mundo_sujo = true


func _quadro() -> void:
	await get_tree().process_frame
	await get_tree().process_frame


## avança a tela de carregamento (e deixa ela ser desenhada antes da próxima etapa)
func _etapa(i: int, texto: String, pct: float) -> void:
	if modo_teste:
		return
	telas.carga(i, texto, pct)
	await _quadro()


## entra no mundo escolhido no lobby: carrega o jogo salvo dele (ou começa do zero, de mão vazia)
func comecar(m: Dictionary) -> void:
	mundo_atual = m
	arq_salvo = str(m.get("arq", ""))
	_tempo_base = float(m.get("tempo", 0.0))
	var tinha := carregar_jogo()
	# o corpo do personagem do perfil (o da criação; sem criação, o Sobrevivente)
	jogador.aparencia(Perfis.atual.get("ap", {}))
	mundo_sujo = true
	em_jogo = true
	ui.visible = true
	get_viewport().disable_3d = false
	get_tree().paused = false
	_ini_sessao = Time.get_ticks_msec()
	_auto_t = 120.0
	Ajustes.aplicar(self)
	if not modo_teste:
		Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	if not tinha:
		hora = 7.0
		dia = 1
		ui.aviso("Você acordou na mata, sem nada. Pegue pedras, galhos e fibras do chão (E).", 9.0)
		ui.aviso("Na mão, a cada 3 socos a árvore dá 1 madeira. Tab abre a mochila e a fabricação.", 10.0)
		salvar_jogo()
	ui.aviso("Esc: pausa e configurações · M: mapa · F5 salva", 7.0)


## salva e volta para o lobby (o mundo é montado de novo, limpo, para o próximo)
func sair_para_lobby() -> void:
	salvar_jogo()
	Telas.ir_para = "lobby"
	get_tree().paused = false
	get_tree().reload_current_scene()


func _teclas() -> void:
	var mapa := {
		"frente": [KEY_W], "tras": [KEY_S], "esquerda": [KEY_A], "direita": [KEY_D], "pular": [KEY_SPACE], "correr": [KEY_SHIFT],
		"agachar": [KEY_CTRL, KEY_C], "usar": [KEY_E], "mochila": [KEY_TAB, KEY_I], "girar": [KEY_R], "sair": [KEY_ESCAPE], "aba_obra": [KEY_Q], "salvar": [KEY_F5],
		"barra1": [KEY_1], "barra2": [KEY_2], "barra3": [KEY_3], "barra4": [KEY_4], "barra5": [KEY_5], "barra6": [KEY_6], "tela_cheia": [KEY_F11],
		"mapa": [KEY_M], "lanterna": [KEY_F], "construir": [KEY_B], "comandos": [KEY_H], "camera": [KEY_V]}
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
	if not pronto or not em_jogo:
		return
	# teclas do jogo: B constrói, F lanterna, H esconde os comandos
	if jogador.vivo and not ui.aberto and telas.atual == "":
		if Input.is_action_just_pressed("construir"):
			jogador.construir()
		if Input.is_action_just_pressed("lanterna"):
			jogador.alternar_lanterna()
		if Input.is_action_just_pressed("comandos"):
			Ajustes.mudar("comandos", not bool(Ajustes.v["comandos"]))
			ui.hud.mostrar_comandos(bool(Ajustes.v["comandos"]))
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
	if not modo_teste:
		if Input.is_action_just_pressed("salvar") and jogador.vivo:
			salvar_jogo()
			ui.aviso("Jogo salvo")
		_auto_t -= dt
		if _auto_t <= 0.0:
			_auto_t = 120.0
			if jogador.vivo:
				salvar_jogo()
	# voltou de outra janela (Alt+Tab): um clique prende o mouse de novo
	if not modo_teste and Input.mouse_mode == Input.MOUSE_MODE_VISIBLE and not ui.aberto and telas.atual == "" and jogador.vivo \
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


## o zumbi pode deixar alguma coisa no chão (a tabela "zumbi" do jogo antigo: pano, munição, sucata)
func zumbi_morreu(z) -> void:
	stats["zumbis"] = int(stats.get("zumbis", 0)) + 1
	var L: Array = mundo.sortear("zumbi")
	if not L.is_empty():
		construcao.soltar_no_chao(z.global_position, L)
		ui.aviso("O zumbi deixou alguma coisa no chão")


func fabricar(r: Dictionary) -> void:
	var m := Fabricacao.fazer(r, jogador)
	if m != "":
		ui.aviso(m)
		return
	sons.tocar("construir", jogador.global_position, -6.0)
	stats["fabricados"] = int(stats.get("fabricados", 0)) + 1
	ui.aviso("Fabricou: %s" % Fabricacao.nome(r))


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
		var bb: Dictionary = construcao.baus[c.get_meta("bau")]
		return ("E  " + str(bb.get("titulo", "Pegar"))) if bb.get("mochila", false) else "E  Abrir o baú"
	if c.has_meta("obra") and construcao.peca_viva(c.get_meta("obra")):
		var po: Dictionary = construcao.pecas[c.get_meta("obra")]
		var o := Dados.obra(str(po["id"]))
		var acao := ""
		if po.has("bau"):
			acao = "E  Abrir: "
		elif str(po["id"]) == "fogueira":
			acao = "E  Cozinhar na "
		elif str(po["id"]) in ["cama", "camaMadeira"]:
			acao = "E  Renascer nesta "
		elif o.has("estacao") or str(po["id"]) == "bancadaTrab":
			acao = "E  Fabricar na "
		elif str(po["id"]) == "armadilhaUrso":
			acao = "E  Armar a " if not po.get("armada", true) else ""
		var nv := " (nível %d)" % int(po.get("nivel", 1)) if str(po["id"]) == "bancadaTrab" else ""
		var nm := str(o.get("nome", po["id"]))
		return "%s%s%s  %d/%d" % [acao, nm.to_lower() if acao != "" else nm, nv, int(po["vida"]), int(po["max"])]
	if c.has_meta("recurso"):
		var r: Dictionary = mundo.recursos[c.get_meta("recurso")]
		match r["tipo"]:
			"planta":
				return "E  Colher" + (" frutas silvestres" if r.get("fruta", false) else " fibra")
			"solto":
				return "E  Pegar " + str({"pedra": "a pedra", "galho": "o galho", "cogumelo": "o cogumelo", "fibra": "a fibra"}.get(r["nome"], r["nome"]))
			"arvore":
				return "Árvore (machado; na mão, 1 madeira a cada 3 socos)"
			"tronco":
				return "Tronco caído (machado)"
			"pedra":
				return "Rocha (picareta)"
	if c.has_meta("zumbi"):
		return "Zumbi"
	if c.has_meta("peca") and construcao.peca_viva(c.get_meta("peca")):
		var pe: Dictionary = construcao.pecas[c.get_meta("peca")]
		var dica := "  (o martelo conserta)" if float(pe["vida"]) < float(pe["max"]) else ""
		return "%s  %d/%d%s" % [Dados.nome(str(pe["id"])), int(pe["vida"]), int(pe["max"]), dica]
	return ""


func _morreu() -> void:
	ui.abrir(false)
	# como no Rust: o que você tinha (e a roupa do corpo) fica numa mochila no chão, dá para voltar e pegar
	var caida := Inventario.new(Inventario.MAXIMO, false)
	var tinha := false
	for s in jogador.inv.slots:
		if s != null:
			caida.por_pilha(s)
			tinha = true
	for k in jogador.inv.roupa:
		caida.por_pilha(jogador.inv.roupa[k])
		tinha = true
	if tinha:
		construcao.por_mochila(jogador.global_position, caida)
	telas.morte(true, tinha)


func renascer(no_saco := false) -> void:
	telas.morte(false)
	var p := Vector3(SPAWN.x, terreno.h(SPAWN.x, SPAWN.z) + 0.5, SPAWN.z)
	if no_saco and construcao.sacos.size() > 0:
		p = construcao.sacos[construcao.sacos.size() - 1] + Vector3(0, 0.6, 0)
	jogador.renascer(p)
	jogador.inv.mudou.connect(ui.atualizar)
	ui.atualizar()
	telas._mouse()


# ======================= salvar e carregar =======================
var _auto_t := 120.0


## guarda o mundo num arquivo (o jogador, a mochila e a roupa, as receitas aprendidas, a hora, a base inteira com o que está
## nos baús, o que já foi colhido e revistado)
func salvar_jogo() -> bool:
	var j := jogador
	var d := {"versao": 1, "dia": dia, "hora": hora,
		"jogador": {"pos": [j.global_position.x, j.global_position.y, j.global_position.z], "giro": j.rotation.y,
			"vida": j.vida, "fome": j.fome, "sede": j.sede, "bateria": j.bateria, "sel": j.sel, "inv": j.inv.salvar(),
			"vistos": j.vistos.keys(), "aprendidas": j.aprendidas.keys(), "consertos": j.consertos},
		"base": construcao.salvar(), "mundo": mundo.salvar(), "stats": stats}
	if arq_salvo == "":
		return false
	DirAccess.make_dir_recursive_absolute(arq_salvo.get_base_dir())
	var f := FileAccess.open(arq_salvo, FileAccess.WRITE)
	if f == null:
		return false
	f.store_string(JSON.stringify(d))
	f.close()
	# o dia, a hora e o tempo jogado aparecem na lista de mundos do Jogar sozinho
	if mundo_atual.has("criado"):
		Perfis.anotar(mundo_atual, dia, hora, _tempo_base + float(Time.get_ticks_msec() - _ini_sessao) / 1000.0)
	return true


func carregar_jogo() -> bool:
	if arq_salvo == "" or not FileAccess.file_exists(arq_salvo):
		return false
	var d = JSON.parse_string(FileAccess.get_file_as_string(arq_salvo))
	if typeof(d) != TYPE_DICTIONARY:
		return false
	dia = int(d.get("dia", 1))
	hora = float(d.get("hora", 8.0))
	var st = d.get("stats", {})
	if st is Dictionary:
		stats = {"zumbis": int(st.get("zumbis", 0)), "fabricados": int(st.get("fabricados", 0))}
	var jd: Dictionary = d.get("jogador", {})
	var j := jogador
	if jd.has("pos"):
		j.global_position = Vector3(float(jd["pos"][0]), float(jd["pos"][1]) + 0.2, float(jd["pos"][2]))
		j.rotation.y = float(jd.get("giro", 0.0))
	j.vida = float(jd.get("vida", 100.0))
	j.fome = float(jd.get("fome", 100.0))
	j.sede = float(jd.get("sede", 100.0))
	j.bateria = float(jd.get("bateria", 100.0))
	j.consertos = int(jd.get("consertos", 0))
	j.vistos = {}
	for k in jd.get("vistos", []):
		j.vistos[str(k)] = true
	j.aprendidas = {}
	for k in jd.get("aprendidas", []):
		j.aprendidas[str(k)] = true
	if jd.has("inv"):
		j.inv.carregar(jd["inv"])
	j.selecionar(int(jd.get("sel", 0)))
	construcao.carregar(d.get("base", {}))
	mundo.carregar(d.get("mundo", {}))
	ui.atualizar()
	ui.aviso("Jogo carregado: dia %d, %s" % [dia, hora_txt()], 5.0)
	return true


func apagar_salvo() -> void:
	if arq_salvo != "" and FileAccess.file_exists(arq_salvo):
		DirAccess.remove_absolute(ProjectSettings.globalize_path(arq_salvo))


func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_CLOSE_REQUEST and not modo_teste and em_jogo and jogador != null and jogador.vivo:
		salvar_jogo()


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


## o personagem (a etapa 3): o corpo com o esqueleto e as peças, as animações pela velocidade (parado, andando, correndo,
## agachado, pulo), a terceira pessoa (V), o item na mão do corpo e a mão esquerda no cabo, o golpe, a roupa no corpo, a mão da
## primeira pessoa e a criação do personagem (que guarda no perfil e vai para o jogo)
func _teste_personagem(livre: Vector3) -> void:
	var c := jogador.corpo
	_confere(c.esq != null and c.ix.size() == Corpo.NB and not c.ix.has(-1) and c.nos.size() > 40,
		"corpo do personagem: esqueleto de %d ossos e %d malhas (corpo em pedaços, olhos, cabelos, barbas, roupas e cascas)" % [c.ix.size(), c.nos.size()])
	_confere(Corpo.CL.size() >= 18 and Corpo.CLIP.size() > 100000, "animações do sobrevivente: %d clipes" % Corpo.CL.size())
	_por_em(Vector3(livre.x, livre.y + 0.2, livre.z + 4.0))
	_olhar(jogador.global_position + Vector3(0, 1.6, -10))
	await _quadros(40)
	var est0 := c.estado
	var perna0: Quaternion = c.esq.get_bone_pose_rotation(c.ix[Corpo.L_COXA])
	Input.action_press("frente")
	await _quadros(35)
	var est1 := c.estado
	var perna1: Quaternion = c.esq.get_bone_pose_rotation(c.ix[Corpo.L_COXA])
	Input.action_press("correr")
	await _quadros(30)
	var est2 := c.estado
	Input.action_release("correr")
	Input.action_release("frente")
	_confere(est0 == "parado" and est1 in ["andando", "correndo"] and est2 in ["correndo", "disparada"] and perna0.angle_to(perna1) > 0.05,
		"o corpo anda com a velocidade: %s, %s, %s (a perna mexeu %.0f°)" % [est0, est1, est2, rad_to_deg(perna0.angle_to(perna1))])
	await _quadros(40)
	Input.action_press("agachar")
	await _quadros(40)
	var quadril_ag: float = c.quadril_s.y
	Input.action_release("agachar")
	await _quadros(30)
	_confere(quadril_ag < c.hip - 0.2, "agachado: o quadril desce (%.2f de %.2f m)" % [quadril_ag, c.hip])
	Input.action_press("pular")
	await _quadros(5)
	Input.action_release("pular")
	await _quadros(3)
	var est_p := c.estado
	await _quadros(50)
	_confere(est_p == "pulo", "pulo: o corpo pula (%s)" % est_p)
	# terceira pessoa
	jogador.alternar_camera(true)
	await _quadros(50)
	var corpo_aparece := (c.nos["corpo_0"] as MeshInstance3D).cast_shadow == GeometryInstance3D.SHADOW_CASTING_SETTING_ON
	_confere(jogador.terceira and jogador.cam.position.z > 1.5 and corpo_aparece and not jogador.mao.visible,
		"V: terceira pessoa (a câmera a %.1f m atrás do ombro, o corpo aparece)" % jogador.cam.position.z)
	jogador.inv.por("machado", 1)
	_na_mao("machado")
	await _quadros(40)
	_confere(c.item_no != null and c.item_id == "machado" and c.item_no.is_visible_in_tree(), "o machado vai na mão do corpo")
	var mao_e: Vector3 = c.P[Corpo.L_MAO] + (c.Q[Corpo.L_MAO] as Quaternion) * Vector3(0, 0.075, 0)
	var cabo: Vector3 = c.encaixe.transform * Corpo.MAO2["machado"]
	_confere(mao_e.distance_to(cabo) < 0.15, "duas mãos: a esquerda fecha no cabo do machado (a %.2f m do ponto)" % mao_e.distance_to(cabo))
	jogador.cd = 0.0
	jogador.atacar()
	await _quadros(6)
	var gt := jogador.golpe_t
	var braco_golpe: Quaternion = c.Ds[Corpo.R_BRACO]
	await _quadros(30)
	_confere(gt > 0.0 and braco_golpe.angle_to(c.Ds[Corpo.R_BRACO]) > 0.2, "o golpe mexe o braço do corpo (%.0f°)" % rad_to_deg(braco_golpe.angle_to(c.Ds[Corpo.R_BRACO])))
	# roupa no corpo: as 3D (calça e camiseta), as botas e as justas (gorro, cinto)
	for id in ["calcaCargo", "camiseta", "botasTrilha", "gorroPele", "cinto"]:
		jogador.inv.por(id, 1)
		for i in jogador.inv.limite:
			var sm = jogador.inv.slots[i]
			if sm != null and sm["id"] == id:
				jogador.inv.vestir(i)
				break
	await _quadros(40)
	var escondidos := 0
	for gr in Corpo.META["corpos"][c.g]["grupos"]:
		if not (c.nos[str(gr["no"])] as MeshInstance3D).visible:
			escondidos += 1
	_confere((c.nos["roupa_calcaCouro"] as MeshInstance3D).visible and (c.nos["roupa_camiseta"] as MeshInstance3D).visible and (c.nos["roupa_botasCouro"] as MeshInstance3D).visible
		and c.cascas.size() >= 3 and escondidos >= 3,
		"a roupa vestida aparece no corpo: calça, camiseta e botas 3D, %d cascas (gorro e cinto), %d pedaços do corpo cobertos" % [c.cascas.size(), escondidos])
	for lugar in ["pernas", "camiseta", "pes", "cabeca", "cintura"]:
		jogador.inv.despir(lugar)
	await _quadros(40)
	_confere(not (c.nos["roupa_calcaCouro"] as MeshInstance3D).visible and c.cascas.is_empty() and (c.nos["corpo_0"] as MeshInstance3D).visible, "tirou a roupa: o corpo volta de cueca")
	# primeira pessoa de novo: o corpo só faz sombra, a mão de verdade segura o cabo
	jogador.alternar_camera(false)
	await _quadros(10)
	_confere(not jogador.terceira and jogador.mao.visible and (c.nos["corpo_0"] as MeshInstance3D).cast_shadow == GeometryInstance3D.SHADOW_CASTING_SETTING_SHADOWS_ONLY,
		"V de novo: primeira pessoa (o corpo só faz sombra)")
	_confere(jogador.braco_fp != null and jogador.braco_fp.is_visible_in_tree() and absf(jogador._dobra_a) <= 0.71,
		"primeira pessoa: o braço de verdade, com a mão fechada no cabo (pulso dobrado %.2f e %.2f)" % [jogador._dobra_a, jogador._dobra_f])
	jogador.inv.tirar("machado", 1)
	_confere(not bool(Ajustes.v["terceira"]), "a câmera escolhida fica guardada nas configurações")
	# a criação do personagem: abre com o palco, trocar o cabelo vira Personalizado, a mulher, e salva no perfil
	var perfil_antes := Perfis.atual
	Perfis.atual = {"id": "teste_criacao", "nome": "Teste", "mundos": []}
	telas.abrir_criacao()
	await _quadros(10)
	_confere(telas.atual == "criacao" and palco.visible and palco.cam.current and palco.corpo.g == "homem" and (palco.corpo.nos["peca_curto_grisalho"] as MeshInstance3D).visible,
		"criação: o Sobrevivente no palco (cabelo grisalho)")
	telas.cria._mudar("cabelo", "afro")
	await _quadros(3)
	_confere(str(telas.cria.ap["corpo"]) == "mh" and (palco.corpo.nos["peca_afro"] as MeshInstance3D).visible and not (palco.corpo.nos["peca_curto_grisalho"] as MeshInstance3D).visible,
		"criação: trocar o cabelo vira Personalizado e muda no palco")
	telas.cria._mudar("g", "mulher")
	telas.cria._altura(4)
	await _quadros(3)
	_confere(palco.corpo.g == "mulher" and (palco.corpo.nos["peca_cilios_m"] as MeshInstance3D).visible and palco.corpo.escala > 1.0,
		"criação: corpo de mulher (%.2f m)" % (palco.corpo.escala * float(Corpo.META["corpos"]["mulher"]["altura"])))
	telas.cria.nome.text = "Ana"
	telas.cria._confirmar()
	await _quadros(3)
	var ap_s: Dictionary = Perfis.atual.get("ap", {})
	_confere(str(ap_s.get("corpo", "")) == "mh" and str(ap_s["mh"]["g"]) == "mulher" and str(ap_s["nome"]) == "Ana" and telas.atual == "lobby" and not palco.visible,
		"criação: salvou no perfil (mulher, %s) e voltou ao lobby" % ("com retrato" if FileAccess.file_exists(str(Perfis.atual.get("retrato", ""))) else "sem retrato"))
	_confere(telas.resumo_personagem(Perfis.atual).begins_with("Ana"), "lobby: o painel Personagem diz quem é (%s)" % telas.resumo_personagem(Perfis.atual))
	jogador.aparencia(ap_s)
	await _quadros(3)
	_confere(jogador.corpo.g == "mulher" and str(jogador.braco_fp.get_meta("g", "")) == "feminino", "o personagem do perfil vai para o jogo (a mão da mulher na primeira pessoa)")
	telas.esconder()
	jogador.aparencia({})
	Perfis.atual = perfil_antes
	await _quadros(3)


## põe o item na mão (traz para a barra se estiver na mochila)
func _na_mao(id: String) -> bool:
	var inv := jogador.inv
	for i in inv.limite:
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
func _peca_mirando(b0: Dictionary, id: String, de: Vector3, alvo_local: Vector3) -> bool:
	construcao.escolher(id)
	_por_em(b0["xf"] * de)
	await _quadros(4)
	_olhar(b0["xf"] * alvo_local)
	await _quadros(2)
	var a2: Dictionary = construcao._calcular()
	if a2.is_empty() or not a2["ok"]:
		print("      (não deu para pôr %s: %s)" % [id, str(a2.get("chave", "sem alvo"))])
		return false
	construcao.alvo = a2
	construcao.colocar(id, a2["xf"], a2["chave"])
	return true


## constrói uma obra livre no chão, olhando para um ponto (como o jogador faria com o plano)
func _obra_em(id: String, de: Vector3, alvo: Vector3) -> int:
	construcao.escolher(id)
	_por_em(de)
	await _quadros(4)
	_olhar(alvo)
	await _quadros(2)
	var a2: Dictionary = construcao._calcular()
	if a2.is_empty() or not a2["ok"]:
		print("      (não deu para pôr %s: %s)" % [id, "sem alvo" if a2.is_empty() else "lugar ocupado"])
		return -1
	var n0 := construcao.pecas.size()
	construcao.colocar(id, a2["xf"], a2["chave"])
	return n0 if construcao.pecas.size() > n0 else -1


## a receita (a primeira com esse resultado)
func _receita(faz: String) -> Dictionary:
	for r in Dados.RECEITAS:
		if str(r["faz"]) == faz:
			return r
	return {}


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


## o pedaço da tela (visível, que segura o mouse) que cobre este ponto ("" = nenhum)
func _segura_ponto(no: Node, p: Vector2) -> String:
	for f in no.get_children():
		var r := _segura_ponto(f, p)
		if r != "":
			return r
	if no is Control:
		var c := no as Control
		if c.is_visible_in_tree() and c.mouse_filter == Control.MOUSE_FILTER_STOP and c.get_global_rect().has_point(p):
			return "%s (%s)" % [c.name, c.get_class()]
	return ""


## as telas: perfis e mundos (criar, renomear, apagar), o lobby, o Jogar sozinho, as configurações (mudam o jogo de
## verdade), a pausa e o mapa grande, e o HUD (minimapa, bússola, lugar)
func _teste_telas() -> void:
	var antes := Perfis.lista().size()
	var p := Perfis.novo_perfil("  Teste   das telas ")
	_confere(str(p["nome"]) == "Teste das telas" and Perfis.lista().size() == antes + 1, "perfil novo (nome limpo: \"%s\")" % p["nome"])
	var m1 := Perfis.novo_mundo(p)
	var m2 := Perfis.novo_mundo(p)
	_confere(str(m1["nome"]) == "Mundo 1" and str(m2["nome"]) == "Mundo 2" and str(m1["arq"]) != str(m2["arq"]), "dois mundos, cada um no seu arquivo")
	Perfis.renomear_mundo(p, m2, "Base do rio")
	telas.mostrar("lobby")
	await _quadros(3)
	_confere(telas.atual == "lobby" and telas.lobby_cartoes.size() == 4, "lobby com os 4 caminhos (Jogar sozinho, Multiplayer, Personagem, Configurações)")
	telas.mostrar("sozinho")
	await _quadros(3)
	_confere(telas.sz_lista.get_child_count() == 2, "Jogar sozinho lista os 2 mundos")
	Perfis.apagar_mundo(p, m1)
	_confere((p["mundos"] as Array).size() == 1 and str(p["mundos"][0]["nome"]) == "Base do rio", "renomeou e apagou um mundo")
	for aba in 5:
		telas.aj_aba = aba
		telas.mostrar("ajustes")
		await _quadros(2)
	_confere(telas.aj_corpo.get_child_count() > 0, "configurações: as 5 abas montam")
	var fov0 := float(Ajustes.v["fov"])
	Ajustes.mudar("fov", 92, self)
	_confere(absf(jogador.cam.fov - 92.0) < 0.1, "configurações mudam o jogo (campo de visão %.0f°)" % jogador.cam.fov)
	Ajustes.mudar("fov", fov0, self)
	telas.esconder()
	telas.pausa()
	await _quadros(2)
	_confere(telas.atual == "pausa" and get_tree().paused, "Esc: pausa (o jogo para)")
	telas.voltar_ao_jogo()
	telas.abrir_mapa("")
	await _quadros(2)
	_confere(telas.atual == "mapa" and get_tree().paused, "M: mapa grande")
	telas.fechar_mapa()
	await _quadros(2)
	_confere(telas.atual == "" and not get_tree().paused, "fechou o mapa e voltou ao jogo")
	Perfis.apagar_perfil(p)
	# HUD no lugar certo da tela (as âncoras dependem do HUD ocupar a tela inteira)
	var tela := get_viewport().get_visible_rect().size
	var rb: Rect2 = ui.hud.barra.get_global_rect()
	var rbs: Rect2 = ui.hud.bussola.get_global_rect()
	var rv: Rect2 = ui.hud.vitais.get_global_rect()
	_confere(absf(rb.get_center().x - tela.x * 0.5) < 4.0 and rb.end.y > tela.y - 40.0 and absf(rbs.get_center().x - tela.x * 0.5) < 4.0 \
		and rbs.position.y < 20.0 and rv.end.x > tela.x - 40.0 and rv.end.y > tela.y - 40.0,
		"HUD no lugar: barra rápida embaixo no meio (%s), bússola em cima no meio (%s), vida embaixo à direita (%s)" % [rb, rbs, rv])
	# HUD: o nome do lugar embaixo do minimapa e a bússola
	ui.hud._lento = 0.0
	await _quadros(3)
	_confere(ui.hud.lugar_lbl.text != "" and ui.hud.dia_nome.text.begins_with("DIA"), "HUD: lugar no minimapa (%s) e o relógio (%s %s)" % [ui.hud.lugar_lbl.text, ui.hud.dia_nome.text, ui.hud.dia_falta.text])
	var g0 := jogador.rotation.y
	jogador.rotation.y = 0.0
	var norte: float = ui.hud.rumo()
	jogador.rotation.y = -PI * 0.5
	var leste: float = ui.hud.rumo()
	jogador.rotation.y = g0
	_confere(absf(norte) < 1.0 and absf(leste - 90.0) < 1.0, "bússola: olhando para -z é norte (%.0f°), para +x é leste (%.0f°)" % [norte, leste])


func _teste() -> void:
	print("TESTE VAYDR Godot: começo")
	await _quadros(5)
	# o mouse vira a câmera para os lados e para cima e para baixo: com o mouse preso o movimento chega no meio da tela, e
	# nada da tela do jogo pode ficar ali segurando o mouse (na 0.2.0 o pontinho da mira segurava e a câmera não virava)
	var meio := get_viewport().get_visible_rect().size / 2.0
	var segura := _segura_ponto(ui, meio)
	_confere(segura == "", "nada da tela segura o mouse no meio da tela%s" % ("" if segura == "" else ": " + segura))
	jogador.mouse_preso_teste = true
	var giro0 := jogador.rotation.y
	var olhar0 := jogador.cabeca.rotation.x
	for k in 4:
		var mm := InputEventMouseMotion.new()
		mm.position = meio
		mm.global_position = meio
		mm.relative = Vector2(40, 12)
		mm.screen_relative = Vector2(40, 12)
		get_viewport().push_input(mm)
	await _quadros(2)
	jogador.mouse_preso_teste = false
	_confere(absf(angle_difference(giro0, jogador.rotation.y)) > 0.2 and jogador.cabeca.rotation.x < olhar0 - 0.05,
		"o mouse vira a câmera para o lado (%.0f°) e para baixo (%.0f°)" % [rad_to_deg(angle_difference(giro0, jogador.rotation.y)), rad_to_deg(jogador.cabeca.rotation.x - olhar0)])
	jogador.rotation.y = giro0
	jogador.cabeca.rotation.x = olhar0
	# as telas do jogo antigo: perfis, lobby, Jogar sozinho, configurações, pausa, mapa
	await _teste_telas()
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
	# correr gasta energia (o fôlego do HUD) e parado ela volta
	jogador.energia = 100.0
	Input.action_press("frente")
	Input.action_press("correr")
	await _quadros(90)
	Input.action_release("correr")
	Input.action_release("frente")
	var gasto := jogador.energia
	await _quadros(150)
	_confere(gasto < 90.0 and jogador.energia > gasto + 5.0, "correr gasta energia (%.0f) e parado ela volta (%.0f)" % [gasto, jogador.energia])
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
	# coleta do jogo antigo: na mão, a cada 3 socos a árvore dá 1 madeira
	var arv: Dictionary = {}
	var i_arv := -1
	var dmin := 1e9
	for k in mundo.recursos.size():
		var r: Dictionary = mundo.recursos[k]
		if r["tipo"] == "arvore":
			var dd: float = Vector2(r["pos"].x, r["pos"].z).distance_to(Vector2(livre.x, livre.z))
			if dd < dmin:
				dmin = dd
				arv = r
				i_arv = k
	var pa: Vector3 = arv["pos"]
	var raio_a: float = (((arv["corpo"] as StaticBody3D).get_child(0) as CollisionShape3D).shape as CylinderShape3D).radius
	var lado_a := Vector3(livre.x - pa.x, 0, livre.z - pa.z).normalized()
	var junto := pa + lado_a * (raio_a + 0.9)
	_por_em(Vector3(junto.x, terreno.h(junto.x, junto.z) + 0.3, junto.z))
	await _quadros(10)
	_olhar(pa + Vector3(0, 1.3, 0))
	await _quadros(3)
	var md0 := jogador.inv.conta("madeira")
	for i in 6:
		jogador.cd = 0.0
		jogador.atacar()
		await _quadros(2)
	var com_mao := jogador.inv.conta("madeira") - md0
	_confere(com_mao == 2, "coleta: 6 socos na árvore deram %d madeira (1 a cada 3, como no jogo antigo)" % com_mao)
	# rocha: na mão não sai pedra (só com picareta)
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
	var de_p := Vector3(pc_w.x + raio_p + 1.1, terreno.h(pc_w.x + raio_p + 1.1, pc_w.z) + 0.3, pc_w.z)
	_por_em(de_p)
	await _quadros(10)
	_olhar(pc_w + Vector3(0, 0.3, 0))
	await _quadros(3)
	var s0 := jogador.inv.conta("pedra")
	jogador.cd = 0.0
	jogador.atacar()
	_confere(jogador.inv.conta("pedra") == s0, "rocha na mão não dá pedra (precisa de picareta)")
	# pegar coisa do chão (E): pedra solta, galho (gravetos), fibra, cogumelo
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
	_confere(jogador.inv.conta(item_s) > antes_s and float(mundo.recursos[isolto]["vida"]) <= 0.0, "E pega %s do chão (+%d %s)" % [solto["nome"], jogador.inv.conta(item_s) - antes_s, Dados.nome(item_s)])
	# o catálogo do jogo antigo
	_confere(Dados.ITENS.size() >= 213 and Dados.RECEITAS.size() >= 100 and Dados.OBRAS.size() >= 40, "catálogo do jogo antigo: %d itens, %d receitas, %d construções" % [Dados.ITENS.size(), Dados.RECEITAS.size(), Dados.OBRAS.size()])
	var sem_ico := 0
	for k in Dados.ITENS:
		if Dados.icone_item(k) == null:
			sem_ico += 1
	_confere(sem_ico == 0, "todo item tem ícone (%d sem)" % sem_ico)
	# fabricação na mão: machado improvisado, picareta e plano (as receitas de lá)
	jogador.inv.por("pedra", 4)
	jogador.inv.por("graveto", 6)
	jogador.inv.por("fibra", 10)
	jogador.inv.por("madeira", 2)
	for f in ["machadoPedra", "picareta", "plano"]:
		fabricar(_receita(f))
	_confere(jogador.inv.conta("machadoPedra") == 1 and jogador.inv.conta("picareta") == 1 and jogador.inv.conta("plano") == 1,
		"fabricou machado improvisado, picareta e plano (pedra, gravetos e fibras)")
	_confere(Fabricacao.pode(_receita("pregos"), jogador) != "", "pregos ficam trancados sem sucata e sem bancada")
	# mochila nas costas: abre mais espaços
	_confere(jogador.inv.limite == 12, "sem mochila: 6 na barra e 6 bolsos (%d)" % jogador.inv.limite)
	jogador.inv.por("mochilaExpedicao", 1)
	for i in jogador.inv.limite:
		var sm = jogador.inv.slots[i]
		if sm != null and sm["id"] == "mochilaExpedicao":
			jogador.inv.vestir(i)
	_confere(jogador.inv.limite == 44, "mochila de expedição nas costas: %d espaços" % jogador.inv.limite)
	# picareta na rocha: 2 pedras por golpe e gasta a picareta
	_na_mao("picareta")
	_por_em(de_p)
	await _quadros(6)
	_olhar(pc_w + Vector3(0, 0.3, 0))
	await _quadros(2)
	var s1 := jogador.inv.conta("pedra")
	var dur0 := float(jogador.item_mao().get("dur", 0.0))
	jogador.cd = 0.0
	jogador.atacar()
	_confere(jogador.inv.conta("pedra") - s1 == 2, "picareta na rocha: +%d pedra" % (jogador.inv.conta("pedra") - s1))
	_confere(float(jogador.item_mao().get("dur", 0.0)) < dur0, "a picareta gastou (%d -> %d)" % [int(dur0), int(jogador.item_mao().get("dur", 0.0))])
	# machado na árvore: 1 ou 2 por golpe; com 5 golpes ela cai e dá mais
	var im := -1
	for i in Inventario.BARRA:
		if jogador.inv.slots[i] != null and jogador.inv.slots[i]["id"] == "machadoPedra":
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
		var golpes := 0
		while float(mundo.recursos[i_arv]["vida"]) > 0.0 and golpes < 8:
			jogador.cd = 0.0
			jogador.atacar()
			golpes += 1
			await _quadros(2)
		var mad := jogador.inv.conta("madeira") - m1
		_confere(float(mundo.recursos[i_arv]["vida"]) <= 0.0 and mad >= 5, "machado derrubou a árvore em %d golpes (+%d madeira)" % [golpes, mad])
	# bancada de trabalho (madeira, pedra e corda), pregos e melhoria para o nível 2
	jogador.inv.por("madeira", 60)
	jogador.inv.por("pedra", 60)
	jogador.inv.por("corda", 10)
	jogador.inv.por("tabuas", 60)
	jogador.inv.por("pregos", 50)
	jogador.inv.por("sucata", 20)
	jogador.inv.por("fibra", 20)
	jogador.inv.por("graveto", 20)
	jogador.inv.por("pano", 20)
	_na_mao("plano")
	_confere(construcao.ativo, "plano na mão liga a construção")
	var livre3 := _lugar_livre(Vector2(18, 26), 9.0, Vector2(livre.x, livre.z))
	var ib: int = await _obra_em("bancadaTrab", Vector3(livre3.x, livre3.y + 0.3, livre3.z + 2.5), Vector3(livre3.x, livre3.y, livre3.z))
	_confere(ib >= 0, "bancada de trabalho construída")
	if ib >= 0:
		var pb2: Vector3 = (construcao.pecas[ib]["xf"] as Transform3D).origin
		_por_em(pb2 + Vector3(0, 0.3, 1.6))
		await _quadros(4)
		_confere(Fabricacao.pode(_receita("pregos"), jogador) == "", "perto da bancada e com sucata já vista: dá para fazer pregos")
		var pr0 := jogador.inv.conta("pregos")
		fabricar(_receita("pregos"))
		_confere(jogador.inv.conta("pregos") == pr0 + 3, "fabricou 3 pregos na bancada")
		_confere(Fabricacao.pode(_receita("pistola"), jogador) != "", "pistola artesanal pede a bancada nível 2")
		var m_b: String = construcao.melhorar_bancada(jogador.inv, jogador.global_position)
		_confere(m_b == "" and construcao.nivel_bancada_perto(jogador.global_position) == 2, "bancada melhorada para o nível 2 %s" % m_b)
	# fogueira: assa a carne e ferve a água suja
	var ifo: int = await _obra_em("fogueira", Vector3(livre3.x + 3.5, livre3.y + 0.3, livre3.z + 2.5), Vector3(livre3.x + 3.5, livre3.y, livre3.z))
	_confere(ifo >= 0, "fogueira construída (gravetos, pedra e fibra)")
	if ifo >= 0:
		jogador.inv.por("carneCrua", 3)
		jogador.inv.por("aguaSuja", 2)
		construcao.interagir(ifo, jogador)
		_confere(jogador.inv.conta("carneAssada") == 3 and jogador.inv.conta("agua") >= 2 and jogador.inv.conta("carneCrua") == 0, "fogueira assou 3 carnes e ferveu 2 garrafas")
	# comer e beber: a garrafa volta vazia
	jogador.fome = 50.0
	jogador.sede = 50.0
	var ic2 := -1
	var ia2 := -1
	for i in jogador.inv.limite:
		var sc = jogador.inv.slots[i]
		if sc != null and sc["id"] == "carneAssada":
			ic2 = i
		if sc != null and sc["id"] == "agua":
			ia2 = i
	if ic2 >= 0 and ia2 >= 0:
		jogador.consumir_slot(ic2)
		var g0 := jogador.inv.conta("garrafa")
		jogador.consumir_slot(ia2)
		_confere(jogador.fome > 85.0 and jogador.sede > 85.0 and jogador.inv.conta("garrafa") == g0 + 1, "comeu carne assada e bebeu água (fome %d, sede %d; a garrafa voltou)" % [int(jogador.fome), int(jogador.sede)])
	# roupa protege
	jogador.inv.por("colete", 1)
	for i in jogador.inv.limite:
		var sv2 = jogador.inv.slots[i]
		if sv2 != null and sv2["id"] == "colete":
			jogador.inv.vestir(i)
	_confere(jogador.inv.protecao() >= 0.2, "colete vestido: protege %d%% do dano" % roundi(jogador.inv.protecao() * 100.0))
	# construção: base 2x2 num lugar livre perto da clareira, paredes, porta, janela, piso e escada
	_na_mao("plano")
	_por_em(Vector3(livre.x, livre.y + 0.3, livre.z + 1.0))
	await _quadros(8)
	_olhar(jogador.global_position + Vector3(0, -0.2, -4.0))
	await _quadros(3)
	construcao.escolher("fundacao")
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
			construcao.escolher("fundacao")
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
		for pc in [["parede", Vector3(1.5, 1.2 + F, 0)], ["porta", Vector3(-1.5, 1.2 + F, 0)], ["janela", Vector3(0, 1.2 + F, -1.5)], ["parede", Vector3(0, 1.2 + F, 1.5)]]:
			if await _peca_mirando(b0, pc[0], Vector3(0, F + 0.05, 0.3), pc[1]):
				feitas += 1
		_confere(feitas == 4, "paredes: parede, parede com porta, parede com janela e parede (%d de 4)" % feitas)
		var ip_porta := -1
		for k in construcao.pecas.size():
			if construcao.pecas[k]["id"] == "porta":
				ip_porta = k
		_confere(ip_porta >= 0 and construcao.pecas[ip_porta].has("porta"), "porta na parede com porta")
		var i_porta: int = int(construcao.pecas[ip_porta].get("porta", 0)) if ip_porta >= 0 else 0
		# piso em cima da cela (0,0), apoiado nas paredes
		var piso_ok: bool = await _peca_mirando(b0, "piso", Vector3(0, F + 0.05, 0.9), Vector3(0, F + 2.8, 0))
		_confere(piso_ok, "piso/teto em cima das paredes")
		# escada na cela (1,0) e subir por ela andando
		var esc_ok: bool = await _peca_mirando(b0, "escada", Vector3(3.0, F + 0.05, -0.3), Vector3(3.0, F + 1.2, 0.6))
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
		construcao.alternar_porta(i_porta)
		await _quadros(40)
		var dob: Node3D = construcao.portas[i_porta]["dob"]
		_confere(absf(dob.rotation.y + PI / 2.0) < 0.08, "porta abriu (%.2f)" % dob.rotation.y)
		construcao.alternar_porta(i_porta)
		await _quadros(40)
		_confere(absf(dob.rotation.y) < 0.08, "porta fechou")
		# zumbi do lado de fora da porta fechada: bate na porta, não em quem está dentro
		_por_em(b0["xf"] * Vector3(0.4, F + 0.05, 0.0))
		jogador.vida = 100.0
		var v_porta: float = construcao.pecas[ip_porta]["vida"]
		var zp := _nascer(b0["xf"] * Vector3(-3.2, 0, 0.0), false)
		await _quadros(240)
		var v_depois: float = construcao.pecas[ip_porta]["vida"]
		_confere(v_depois < v_porta, "zumbi bate na porta fechada (porta %d de %d)" % [int(v_depois), int(v_porta)])
		_confere(jogador.vida >= 99.0, "a porta segura: o zumbi não acerta quem está dentro (vida %d)" % int(jogador.vida))
		zp.ferir(999.0, jogador.global_position)
		# o martelo conserta a porta (gasta 30% do material dela)
		jogador.inv.por("martelo", 1)
		_na_mao("martelo")
		_olhar(b0["xf"] * Vector3(-1.5, F + 1.2, 0.0))
		var tb0 := jogador.inv.conta("tabuas")
		jogador.cd = 0.0
		jogador.atacar()
		_confere(float(construcao.pecas[ip_porta]["vida"]) >= float(construcao.pecas[ip_porta]["max"]) and jogador.inv.conta("tabuas") < tb0,
			"martelo consertou a porta (%d) gastando tábuas" % int(construcao.pecas[ip_porta]["vida"]))
		# móveis e defesa: baú (guarda coisas), cama (renasce nela) e estacas (ferem zumbi)
		_na_mao("plano")
		var ibau: int = await _obra_em("bau", b0["xf"] * Vector3(3.0, F + 0.05, 4.4), b0["xf"] * Vector3(3.0, F, 3.2))
		_confere(ibau >= 0 and construcao.pecas[ibau].has("bau"), "baú construído no piso da base")
		if ibau >= 0:
			var binv: Inventario = construcao.baus[int(construcao.pecas[ibau]["bau"])]["inv"]
			ui.abrir_bau(binv, "Baú")
			ui._guardar_recursos()
			_confere(binv.conta("tabuas") > 0 and jogador.inv.conta("tabuas") == 0, "guardou os materiais no baú (%d tábuas)" % binv.conta("tabuas"))
			ui._pegar_tudo()
			_confere(jogador.inv.conta("tabuas") > 0, "pegou de volta do baú")
			binv.por("cogumelo", 5)
			ui.abrir(false)
		var n_sacos := construcao.sacos.size()
		var icama: int = await _obra_em("cama", b0["xf"] * Vector3(0.0, F + 0.05, 4.6), b0["xf"] * Vector3(0.0, F, 3.3))
		_confere(icama >= 0 and construcao.sacos.size() == n_sacos + 1, "colchão no piso: lugar para renascer")
		var lv := _lugar_livre(Vector2(livre.x + 14.0, livre.z), 5.0, Vector2(livre.x, livre.z))
		var iest: int = await _obra_em("estacas", Vector3(lv.x, lv.y + 0.3, lv.z + 3.0), Vector3(lv.x, lv.y, lv.z))
		_confere(iest >= 0, "estacas construídas")
		if iest >= 0:
			var ze := _nascer((construcao.pecas[iest]["xf"] as Transform3D).origin, false)
			var vz0: float = ze.vida
			await _quadros(60)
			_confere(ze.vida < vz0 or ze.estado == "morto", "zumbi nas estacas se machuca (vida %d)" % int(ze.vida))
			ze.ferir(999.0, jogador.global_position)
		_confere(construcao.pecas.size() >= 14, "peças na base: %d" % construcao.pecas.size())
		# saco de dormir e lanterna
		jogador.inv.por("sacoDormir", 1)
		jogador.inv.por("lanterna", 1)
		_por_em(b0["xf"] * Vector3(0, F + 0.05, 3.6))
		await _quadros(6)
		_olhar(b0["xf"] * Vector3(-1.2, F, 2.4))
		_na_mao("sacoDormir")
		var ns := construcao.sacos.size()
		jogador.cd = 0.0
		jogador.atacar()
		_confere(construcao.sacos.size() == ns + 1, "saco de dormir no chão da base")
		_na_mao("lanterna")
		_confere(jogador.luz_mao.visible, "lanterna acende na mão")
		_na_mao("plano")
		var sel_plano := jogador.sel
		jogador.selecionar((sel_plano + 1) % Inventario.BARRA)
		jogador.construir()
		_confere(jogador.sel == sel_plano and construcao.ativo, "B: põe o plano de construção na mão")
		jogador.construir()
		_confere(jogador.sel != sel_plano, "B de novo: volta para o item de antes")
		# a lanterna fica na mochila (na mão vai o plano): o F acende e apaga
		jogador.selecionar(sel_plano)
		jogador.alternar_lanterna()
		_confere(jogador.luz_mao.visible, "F: a lanterna da mochila acende sem estar na mão")
		jogador.alternar_lanterna()
		_confere(not jogador.luz_mao.visible, "F de novo: apaga")
		_na_mao("lanterna")
		# salvar e carregar: a mochila, a roupa, a base com o baú e o relógio voltam como estavam
		var n_pecas := construcao.pecas.filter(func(q): return not q.get("caiu", false)).size()
		var pedras := jogador.inv.conta("pedra")
		var bau_tab: int = (construcao.baus[int(construcao.pecas[ibau]["bau"])]["inv"] as Inventario).conta("cogumelo") if ibau >= 0 else -1
		hora = 15.25
		_confere(salvar_jogo(), "jogo salvo em " + arq_salvo)
		jogador.inv.tirar("pedra", pedras)
		hora = 3.0
		construcao.ferir_peca(ibau, 9999.0, Vector3.ZERO)
		_confere(carregar_jogo(), "jogo carregado")
		await _quadros(3)
		var n_pecas2 := construcao.pecas.filter(func(q): return not q.get("caiu", false)).size()
		_confere(n_pecas2 == n_pecas and jogador.inv.conta("pedra") == pedras and absf(hora - 15.25) < 0.01 and jogador.inv.limite == 44 and jogador.inv.protecao() >= 0.2,
			"depois de carregar: %d de %d peças, %d pedras, %s, %d espaços, roupa no corpo" % [n_pecas2, n_pecas, jogador.inv.conta("pedra"), hora_txt(), jogador.inv.limite])
		var bau_ok := false
		for b in construcao.baus:
			if not b.get("mochila", false) and (b["inv"] as Inventario).conta("cogumelo") == bau_tab and bau_tab == 5:
				bau_ok = true
		_confere(bau_ok, "o baú voltou com o que estava guardado (5 cogumelos)")
		apagar_salvo()
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
	jogador.inv.por("garrafa", 2)
	var ag0 := jogador.inv.conta("agua")
	_na_mao("garrafa")
	jogador.usar()
	_confere(jogador.inv.conta("garrafa") == 0 and jogador.inv.conta("agua") >= ag0 + 2,
		"garrafa na mão no poço: encheu as vazias (%d garrafas d'água)" % jogador.inv.conta("agua"))
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
	_confere(not jogador.vivo and telas.atual == "morte", "morreu e apareceu a tela de morte")
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
		_confere(jogador.vivo and jogador.global_position.distance_to(construcao.sacos[construcao.sacos.size() - 1]) < 2.0, "renasceu no saco de dormir")
	hora = 22.0
	_confere(noite(), "noite às 22h")
	# o personagem (a etapa 3), por último: mexe na mochila, na roupa e na câmera
	hora = 10.0
	await _teste_personagem(livre)
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
	await RenderingServer.frame_post_draw
	# no Linux sem placa de vídeo, ler a imagem da textura da tela às vezes desloca a metade de baixo para o lado; a
	# imagem da própria tela (o que a janela mostra) não tem esse defeito: usa ela e, se não der, a da textura
	var img: Image = DisplayServer.screen_get_image(DisplayServer.window_get_current_screen())
	var tam_ok := img != null and not img.is_empty() and img.get_size() == DisplayServer.window_get_size()
	if not tam_ok:
		img = get_viewport().get_texture().get_image()
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
	# as telas de entrada do jogo antigo (os perfis e os mundos são de mentira, só para a foto)
	telas.mostrar("carga")
	telas.carga(2, "Plantando a mata", 64.0)
	await _foto("00a_carregamento")
	var perf_a := Perfis.novo_perfil("Sobrevivente")
	Perfis.novo_perfil("Visitante")
	telas.mostrar("login")
	await _foto("00b_quem_vai_jogar")
	Perfis.escolher(perf_a)
	var mf := Perfis.novo_mundo(perf_a)
	Perfis.anotar(mf, 4, 16.5, 7400.0)
	var fa := FileAccess.open(str(mf["arq"]), FileAccess.WRITE)
	if fa:
		fa.store_string("{}")
		fa.close()
	Perfis.novo_mundo(perf_a, "Base do rio")
	telas.mostrar("lobby")
	await _foto("00c_lobby")
	telas._lobby_escolher(3)
	await _quadros(30)
	await _foto("00d_lobby_configuracoes")
	telas.sz_sel = str(mf["id"])
	telas.mostrar("sozinho")
	await _foto("00e_jogar_sozinho")
	telas.aj_aba = 0
	telas.mostrar("ajustes")
	await _foto("00f_configuracoes")
	telas.aj_aba = 3
	telas.mostrar("ajustes")
	await _foto("00g_configuracoes_mira")
	telas.mostrar("multi")
	await _foto("00h_multiplayer_em_breve")
	# a criação do personagem (etapa 3): o Sobrevivente no palco, de perto; o cabelo; a mulher de corpo inteiro; o lobby depois
	telas.abrir_criacao()
	await _quadros(45)
	await _foto("00i_criacao_rosto")
	telas.cria._ir_aba("cabelo")
	await _quadros(40)
	await _foto("00j_criacao_cabelo")
	telas.cria._mudar("g", "mulher")
	telas.cria._mudar("cabelo", "longo")
	telas.cria._ir_aba("corpo")
	telas.cria.nome.text = "Ana"
	await _quadros(50)
	await _foto("00k_criacao_corpo_mulher")
	telas.cria._vista("lado")
	await _quadros(50)
	await _foto("00l_criacao_lado")
	telas.cria._confirmar()
	telas._lobby_escolher(2, true)
	await _quadros(20)
	await _foto("00m_lobby_personagem")
	telas.esconder()
	jogador.aparencia({})
	# começo do jogo: na mata ao sul da clareira
	await _cam(Vector3(SPAWN.x, 0, SPAWN.z), Vector3(4, 2.5, 10))
	await _foto("01_comeco_na_mata")
	# a mochila com os ícones do jogo antigo, a roupa no corpo, o detalhe do item e a fabricação por abas
	for e in [["mochila", 1], ["camiseta", 1], ["bermuda", 1], ["botasTrilha", 1]]:
		jogador.inv.por(e[0], e[1])
	for lugar in ["costas", "camiseta", "pernas", "pes"]:
		for i in jogador.inv.limite:
			var sv = jogador.inv.slots[i]
			if sv != null and str(Dados.item(str(sv["id"])).get("slot", "")) == lugar:
				jogador.inv.vestir(i)
				break
	for e in [["machadoPedra", 1], ["picareta", 1], ["faca", 1], ["plano", 1], ["madeira", 24], ["pedra", 18], ["graveto", 12],
			["fibra", 20], ["corda", 3], ["tabuas", 12], ["pregos", 9], ["sucata", 5], ["pano", 6], ["feijao", 2], ["agua", 2],
			["bandagem", 2], ["carneCrua", 2], ["frutas", 7], ["garrafa", 1]]:
		jogador.inv.por(e[0], e[1])
	ui.abrir(true)
	for i in jogador.inv.limite:
		var s2 = jogador.inv.slots[i]
		if s2 != null and s2["id"] == "machadoPedra":
			ui.escolhido = i
			ui.escolhido_dono = "jog"
			ui._detalhe("jog", i)
	ui.atualizar()
	await _foto("02_mochila")
	ui._mudar_aba("armas")
	await _foto("02b_fabricacao_armas")
	ui.abrir(false)
	jogador.inv = Inventario.new()
	jogador._ligar_inv()
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
	jogador.cam.far = 1200.0
	amb.fog_density = 0.0018
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
	# terceira pessoa (V): o corpo com o machado, a mão esquerda junto no cabo; o golpe; a roupa no corpo (de frente); e a mão
	# de verdade na primeira pessoa (com a manga da camisa e a luva)
	jogador.alternar_camera(true)
	await _quadros(70)
	await _foto("13b_terceira_pessoa")
	jogador.cd = 0.0
	jogador.atacar()
	await _quadros(7)
	await _foto("13c_golpe_terceira_pessoa")
	await _quadros(30)
	for id in ["camisaLeve", "calcaCargo", "botasTrilha", "gorroPele", "cinto", "luvasCouro"]:
		jogador.inv.por(id, 1)
		for i in jogador.inv.limite:
			var sm = jogador.inv.slots[i]
			if sm != null and sm["id"] == id:
				jogador.inv.vestir(i)
				break
	jogador.corpo.trava = true
	jogador.rotation.y += PI * 0.82
	jogador.cabeca.rotation.x = -0.12
	await _quadros(50)
	await _foto("13d_roupa_no_corpo")
	jogador.rotation.y -= PI * 0.82
	jogador.corpo.trava = false
	jogador.alternar_camera(false)
	_olhar(pa + Vector3(0, 1.5, 0))
	await _quadros(20)
	await _foto("13e_mao_primeira_pessoa")
	for lugar in ["tronco", "pernas", "pes", "cabeca", "cintura", "maos"]:
		jogador.inv.despir(lugar)
	jogador.inv.tirar("machado", 1)
	# uma base pequena montada pelo próprio sistema de construção, num lugar livre perto da clareira
	jogador.inv.por("mochilaExpedicao", 1)
	for i in jogador.inv.limite:
		var sm = jogador.inv.slots[i]
		if sm != null and sm["id"] == "mochilaExpedicao":
			jogador.inv.vestir(i)
	for e in [["madeira", 120], ["pedra", 120], ["tabuas", 240], ["pregos", 160], ["corda", 30], ["graveto", 40], ["fibra", 40],
			["sucata", 40], ["pano", 30]]:
		jogador.inv.por(e[0], e[1])
	jogador.inv.por("plano", 1)
	_na_mao("plano")
	_por_em(Vector3(livre.x, livre.y + 0.3, livre.z + 1.0))
	await _quadros(5)
	_olhar(jogador.global_position + Vector3(0, -0.5, -4.0))
	await _quadros(2)
	construcao.escolher("fundacao")
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
		for w in [["parede", Vector3(-1.5, 1.2 + F, 0)], ["parede", Vector3(0, 1.2 + F, -1.5)], ["porta", Vector3(4.5, 1.2 + F, 0)], ["janela", Vector3(3.0, 1.2 + F, -1.5)],
				["parede", Vector3(-1.5, 1.2 + F, 3.0)], ["janela", Vector3(0, 1.2 + F, 4.5)], ["parede", Vector3(3.0, 1.2 + F, 4.5)], ["parede", Vector3(4.5, 1.2 + F, 3.0)]]:
			await _peca_mirando(b0, w[0], Vector3(1.5, F + 0.05, 1.5), w[1])
		await _peca_mirando(b0, "escada", Vector3(3.0, F + 0.05, 2.0), Vector3(3.0, F + 1.2, 0.4))
		await _peca_mirando(b0, "piso", Vector3(0, F + 0.05, 1.2), Vector3(0, F + 2.8, 0))
		await _peca_mirando(b0, "piso", Vector3(0, F + 0.05, 1.8), Vector3(0, F + 2.8, 3.0))
		# dentro: bancada, baú, colchão e lamparina; fora: fogueira, barricada, estacas, muro e o alarme de latas
		await _obra_em("bancadaTrab", b0["xf"] * Vector3(0.0, F + 0.05, 2.6), b0["xf"] * Vector3(0.0, F, 0.9))
		await _obra_em("bau", b0["xf"] * Vector3(1.0, F + 0.05, 2.0), b0["xf"] * Vector3(1.0, F, 3.6))
		await _obra_em("cama", b0["xf"] * Vector3(-0.2, F + 0.05, 2.2), b0["xf"] * Vector3(-0.8, F, 3.4))
		await _obra_em("lamparina", b0["xf"] * Vector3(0.6, F + 0.05, 1.2), b0["xf"] * Vector3(1.0, F, 0.0))
		var fx: Transform3D = b0["xf"]
		await _obra_em("fogueira", fx * Vector3(-6.0, 0.3, 1.5), fx * Vector3(-4.0, 0.0, 1.5))
		await _obra_em("barricada", fx * Vector3(9.0, 0.3, 2.0), fx * Vector3(7.5, 0.0, 1.5))
		await _obra_em("estacas", fx * Vector3(9.0, 0.3, 6.5), fx * Vector3(7.0, 0.0, 6.0))
		await _obra_em("muro", fx * Vector3(1.5, 0.3, -6.5), fx * Vector3(1.5, 0.0, -4.5))
		await _obra_em("latas", fx * Vector3(-3.5, 0.3, -6.0), fx * Vector3(-3.5, 0.0, -4.0))
		await _obra_em("bancadaTrab", fx * Vector3(-7.0, 0.3, 6.0), fx * Vector3(-5.0, 0.0, 6.5))
		await _obra_em("fornalha", fx * Vector3(-7.0, 0.3, 9.0), fx * Vector3(-5.0, 0.0, 9.5))
		var fora: Vector3 = b0["xf"] * Vector3(-7.0, 0, 9.0)
		var centro: Vector3 = b0["xf"] * Vector3(1.5, 2.0, 1.5)
		# a prévia da construção (o plano na mão) e a barra das peças
		construcao.escolher("palicada")
		_na_mao("plano")
		_por_em(fx * Vector3(-2.0, 0.3, 11.0))
		await _quadros(4)
		_olhar(fx * Vector3(-2.0, 0.0, 7.0))
		await _quadros(4)
		await _foto("14b_construindo_com_o_plano")
		jogador.selecionar(4)
		hora = 17.4
		_nascer(b0["xf"] * Vector3(8.0, 0, 6.0), false)
		_nascer(b0["xf"] * Vector3(6.0, 0, 10.0), false)
		await _cam(fora, centro, false)
		await _foto("14_base_fim_de_tarde")
		# dentro da base: bancada, baú, colchão e lamparina
		_por_em(b0["xf"] * Vector3(1.4, F + 0.05, 3.9))
		await _quadros(4)
		_olhar(b0["xf"] * Vector3(0.2, F + 0.7, 0.6))
		await _foto("14c_dentro_da_base")
		hora = 21.5
		await _cam(b0["xf"] * Vector3(-11.0, 0, -2.0), b0["xf"] * Vector3(-5.0, 1.0, 1.5), false)
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
	# o HUD apanhando: a seta vermelha mostra de que lado veio o golpe, e as bordas ficam vermelhas
	jogador.vida = 30.0
	ui.dano(zz.global_position + Vector3(4, 0, 0))
	await _foto("16b_apanhando")
	jogador.vida = 100.0
	# a pausa (Esc), o mapa grande (M) e a tela de morte
	telas.pausa()
	await _foto("17_pausa")
	telas.voltar_ao_jogo()
	telas.abrir_mapa("")
	await _foto("18_mapa")
	telas.fechar_mapa()
	jogador.inv.por("pedra", 5)
	jogador.ferir(999.0)
	await _quadros(5)
	await _foto("19_morte")
	renascer(false)
	get_tree().quit()
