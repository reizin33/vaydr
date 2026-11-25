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
var projeteis: Projeteis
var noites: Noites          # as noites: as ondas da horda, a lua de sangue e o Colosso (etapa 5c)
var fauna: Fauna            # os bichos do mato: as regiões, a caça e as carcaças (etapa 6a)
var clima: Clima            # o tempo, as estações e a lua (etapa 6b)
var sono: Sono              # o sono e o dormir (etapa 6c)
var pesca: Pesca            # a pesca (etapa 6d)
var cao: Cao                # o Caramelo, o cachorro (etapa 6e)
var lesoes: Lesoes          # os ferimentos: sangramento, perna quebrada, vírus e ferida grave (etapa 6f)
var plantio: Plantio        # os canteiros e as árvores de fruta (etapa 6g)
var curtume: Curtume        # o couro curtindo no varal da estação de couro (etapa 6h)
var veiculos: Veiculos      # a caminhonete, o carro, a moto e o triciclo do jogo antigo (etapa 6j)
var neblina_base := 0.0046  # a neblina das configurações (o tempo mexe em cima dela)
var lua_rede := false       # no convidado: a lua de sangue que veio de quem abriu
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
	modo_teste = "--teste" in args or "--fotos" in args or "--teste-rede" in args or "--fotos-rede" in args
	Rede.ligar(self)
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
	projeteis = Projeteis.new(self)
	add_child(projeteis)
	noites = Noites.new(self)
	add_child(noites)
	fauna = Fauna.new(self)
	add_child(fauna)
	clima = Clima.new(self)
	add_child(clima)
	sono = Sono.new(self)
	add_child(sono)
	pesca = Pesca.new(self)
	add_child(pesca)
	cao = Cao.new(self)
	cao.name = "Caramelo"
	add_child(cao)
	cao.iniciar()
	lesoes = Lesoes.new(self)
	add_child(lesoes)
	plantio = Plantio.new(self)
	add_child(plantio)
	curtume = Curtume.new(self)
	add_child(curtume)
	veiculos = Veiculos.new(self)
	add_child(veiculos)
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
		_vigia(2400.0, "FOTOS")
		_fotos.call_deferred()
	elif "--teste-rede" in args or "--fotos-rede" in args:
		# a partida em rede de verdade: dois jogos neste computador (quem abriu e quem entrou), cada um no seu mundo de teste
		var papel := str(args[args.find("--teste-rede" if "--teste-rede" in args else "--fotos-rede") + 1]) if args.size() > 1 else "anfitriao"
		arq_salvo = "user://teste_rede_%s.json" % papel
		mundo_atual = {"id": "teste_rede", "nome": "Mundo de teste", "arq": arq_salvo}
		em_jogo = true
		mundo_sujo = true
		var t := TesteRede.new(self, papel, "--fotos-rede" in args)
		add_child(t)
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
		"mapa": [KEY_M], "lanterna": [KEY_F], "construir": [KEY_B], "comandos": [KEY_H], "camera": [KEY_V], "recarregar": [KEY_R]}
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


## quantos segundos dura uma hora de jogo agora (de noite passa mais rápido)
func seg_hora() -> float:
	return SEG_POR_HORA * (0.5 if noite() else 1.0)


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
	# a lua de sangue (como no jogo antigo): a lua vermelha e mais forte, o céu, o horizonte e a neblina puxados para o vermelho
	var sangue := lua_de_sangue()
	lua.light_color = Color(1.0, 0.3, 0.2) if sangue else Color(0.55, 0.65, 0.95)
	if sangue and noite_k > 0.05:
		lua.light_energy *= 1.25
		ceu.sky_horizon_color = ceu.sky_horizon_color.lerp(Color(0.34, 0.1, 0.1), 0.4 * noite_k)
		ceu.sky_top_color = ceu.sky_top_color.lerp(Color(0.12, 0.02, 0.03), 0.35 * noite_k)
		amb.fog_light_color = amb.fog_light_color.lerp(Color(0.3, 0.09, 0.08), 0.45 * noite_k)
		amb.ambient_light_color = amb.ambient_light_color.lerp(Color(0.75, 0.2, 0.15), 0.4 * noite_k)


	if clima != null:
		clima.ambiente(sol, lua, ceu, amb, neblina_base)


## a lua de sangue agora (no convidado vem de quem abriu, junto com a hora)
func lua_de_sangue() -> bool:
	if Rede.convidado():
		return lua_rede
	return noites != null and noites.lua_sangue


func _process(dt: float) -> void:
	if not pronto or not em_jogo:
		return
	var digitando: bool = Rede.digitando or Rede.chat_acabou_de_fechar()
	# teclas do jogo: B constrói, F lanterna, H esconde os comandos
	if jogador.vivo and not ui.aberto and telas.atual == "" and not digitando:
		if Input.is_action_just_pressed("construir") and jogador.veiculo == null:
			jogador.construir()
		if Input.is_action_just_pressed("lanterna"):
			# dirigindo, o F acende e apaga os faróis
			if jogador.veiculo != null and is_instance_valid(jogador.veiculo):
				jogador.veiculo.luz = not jogador.veiculo.luz
				ui.aviso("Faróis acesos" if jogador.veiculo.luz else "Faróis apagados", 1.6)
				sons.tocar("clique", jogador.global_position, -10.0)
			else:
				jogador.alternar_lanterna()
		if Input.is_action_just_pressed("comandos"):
			Ajustes.mudar("comandos", not bool(Ajustes.v["comandos"]))
			ui.hud.mostrar_comandos(bool(Ajustes.v["comandos"]))
	# o dia passa devagar (50 s por hora) e a noite mais rápido (25 s por hora): ~11 min de dia e ~5 de noite
	var antes := hora
	hora += dt / seg_hora() * (sono.turbo() if sono != null else 1.0)
	if hora >= 24.0:
		hora -= 24.0
		dia += 1
	if not modo_teste:
		if antes < 17.5 and hora >= 17.5:
			ui.aviso("O sol está indo embora: de noite os zumbis correm. Faça uma fogueira ou se tranque na base.", 7.0)
		if antes < 6.0 and hora >= 6.0:
			ui.aviso("Amanheceu: dia %d" % dia, 5.0)
		clima.passo(dt)
	sono.passo(dt)
	lesoes.passo(dt)
	plantio.passo(dt)
	_ciclo()
	terreno.mare(hora)
	# zumbis: os de cada lugar (vila, posto, fazenda, sítios...) aparecem quando alguém chega perto; fora isso, alguns
	# andam pela mata e pela cidade (mais de noite), nascendo longe e fora da vista de cada um. Na partida em rede quem decide
	# é o jogo de quem abriu: no convidado os zumbis são bonecos que vêm de lá
	var conv: bool = Rede.convidado()
	if not modo_teste and not conv:
		_zumbis_dos_lugares(dt)
		_emboscadas(dt)
		noites.passo(dt)
		fauna.passo(dt)
	spawn_t -= dt
	if spawn_t <= 0.0:
		spawn_t = 12.0
		zumbis = zumbis.filter(func(z): return is_instance_valid(z))
		if not conv:
			for q in jogadores_vivos():
				var p: Vector3 = q["p"]
				var solto_perto := func(z):
					return z.estado != "morto" and not z.has_meta("lugar") and not z.lan and Vector2(z.global_position.x - p.x, z.global_position.z - p.z).length() < 75.0
				var soltos := zumbis.filter(solto_perto).size()
				var teto := 10 if noite() else 5
				if na_cidade(p):
					teto += 4
				if lua_de_sangue():
					teto += 6
				if soltos < teto:
					_nascer_perto(p, q["frente"])
	if Input.is_action_just_pressed("mochila") and jogador.vivo and not digitando:
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
	neblina_base = cfg["neblina"]
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


## nasce um zumbi (tipo: o nome do tipo, ou true para o corredor e false para o comum)
func _nascer(p: Vector3, tipo = "walker", dorme := false) -> Zumbi:
	var z := Zumbi.new(self, tipo)
	z.uid = Rede.novo_uid()
	if dorme:
		z.estado = "dorme"
	add_child(z)
	# no chão de terra ou da rua; com a altura dada (o andar de cima de uma casa), no piso daquele andar
	var de := terreno.h(p.x, p.z) + 2.5
	if p.y > de - 1.0:
		de = p.y + 1.2
	var y: float = chao_em(p.x, p.z, de)["y"]
	z.global_position = Vector3(p.x, y + 0.15, p.z)
	zumbis.append(z)
	return z


## nasce um zumbi longe de alguém e fora da vista dele: no chão de terra ou na rua (nunca em cima de telhado, dentro d'água
## ou fora do mapa)
func _nascer_perto(centro: Vector3, frente: Vector3) -> void:
	for t in 14:
		var a := randf() * TAU
		var r := randf_range(32.0, 55.0)
		var p := centro + Vector3(cos(a), 0, sin(a)) * r
		if not terreno.dentro(p.x, p.z) or terreno.tipo_agua(p.x, p.z) != 0:
			continue
		var c := chao_em(p.x, p.z)
		if absf(float(c["y"]) - terreno.h(p.x, p.z)) > 0.6:
			continue
		if frente.dot((p - centro).normalized()) > 0.5 and t < 9:
			continue
		# nem na frente de outro jogador
		var visto := false
		for q in jogadores_vivos():
			var pq: Vector3 = q["p"]
			if pq.distance_to(p) < 28.0:
				visto = true
		if visto and t < 12:
			continue
		_nascer(p, tipo_sorteado(p, ""))
		return


## o tipo de zumbi que nasce aqui e agora (de noite mais corredores; na cidade, policiais; o gritador e o brutamontes são raros)
func tipo_sorteado(p: Vector3, lugar: String) -> String:
	var nk := noite_k()
	var r := randf()
	var cidade := na_cidade(p)
	if lugar.contains("delegacia") or lugar.contains("policia") or lugar.contains("militar"):
		if r < 0.55:
			return "policial"
	if lugar.contains("hospital") and r < 0.4:
		return "inchado"
	r = randf()
	var corre := lerpf(0.06, 0.38, nk)
	if r < corre:
		return "runner"
	r -= corre
	if r < 0.07:
		return "screamer"
	r -= 0.07
	if r < 0.05:
		return "brute"
	r -= 0.05
	if r < 0.05:
		return "inchado"
	r -= 0.05
	if cidade and r < 0.07:
		return "policial"
	return "walker"


## quanto é noite (0 de dia, 1 de noite; o fim da tarde e o amanhecer no meio), como o nightAmt do jogo antigo
func noite_k() -> float:
	var h := hora
	if h >= 20.75 or h < 5.0:
		return 1.0
	if h >= 19.25:
		return smoothstep(19.25, 20.75, h)
	if h < 6.5:
		return 1.0 - smoothstep(5.0, 6.5, h)
	return 0.0


## barulho em p que se ouve até r metros (tiro, explosão, golpe, corrida): os zumbis perto vão ver o que foi (alvo: para onde
## eles vão; o gritador manda para onde você está). Na partida em rede o barulho de um convidado vai para quem abriu
func barulho(p: Vector3, r: float, alvo := Vector3.INF) -> void:
	if Rede.convidado():
		Rede.ruido(p, r)
		return
	if clima != null:
		r *= clima.ruido()
	# quem dorme acorda com barulho forte perto
	if sono != null and not sono.dormindo.is_empty() and jogador.global_position.distance_to(p) < r * 0.5 and r >= 30.0:
		sono.acordar("Um barulho forte te acordou.")
	if fauna != null:
		fauna.ouvir(p, r)
	var para := p if alvo == Vector3.INF else alvo
	for z in zumbis:
		if not is_instance_valid(z) or z.lan:
			continue
		var d: float = z.global_position.distance_to(p)
		if d < r:
			z.ouvir(para, 0.15 + d / 16.0 + randf() * 0.3)


## quem dorme nas casas (a emboscada): perto de quem chega, nas casas com móveis para revistar, às vezes um ou dois zumbis deitados
## no escuro; acordam com barulho, com quem chega perto ou com golpe (cada casa sorteia uma vez por jogo)
var _casas_t := 0.0
var _casas_vistas := {}


func _emboscadas(dt: float) -> void:
	_casas_t -= dt
	if _casas_t > 0.0 or mundo == null:
		return
	_casas_t = 2.0
	var quem := jogadores_vivos()
	if quem.is_empty():
		return
	for i in mundo.caixas.size():
		if _casas_vistas.has(i):
			continue
		var cx: Dictionary = mundo.caixas[i]
		if not cx.has("pos") or str(cx.get("nome", "")).contains("porta-malas") or str(cx.get("nome", "")).contains("carrinho"):
			continue
		var cp: Vector3 = cx["pos"]
		var perto := false
		var muito := false
		for q in quem:
			var d: float = (q["p"] as Vector3).distance_to(cp)
			if d < 45.0:
				perto = true
			if d < 14.0:
				muito = true
		if not perto or muito:
			continue
		_casas_vistas[i] = true
		if randf() > 0.12:
			continue
		for k in (1 if randf() < 0.7 else 2):
			var a := randf() * TAU
			var pz := cp + Vector3(cos(a), 0, sin(a)) * randf_range(0.9, 1.8)
			var ch := chao_em(pz.x, pz.z, cp.y + 1.5)
			if absf(float(ch["y"]) - cp.y) > 1.2:
				continue
			_nascer(Vector3(pz.x, float(ch["y"]), pz.z), "emboscada", true)


## quem está no mundo e de pé: você e, na partida em rede, os amigos que estão num mundo (onde está e para onde olha)
func jogadores_vivos() -> Array:
	var L := []
	if jogador.vivo:
		L.append({"p": jogador.global_position, "frente": -jogador.cam.global_transform.basis.z})
	if Rede.anfitriao():
		for b in Rede.no_mundo():
			if b.vivo:
				L.append({"p": b.alvo, "frente": Vector3(-sin(b.yaw_r), 0, -cos(b.yaw_r))})
	return L


## o alvo de um zumbi: quem estiver mais perto (você ou um amigo da partida em rede que está no mundo, de pé e no mesmo andar)
func alvo_zumbi(z: Node3D):
	var melhor = jogador
	var zp := z.global_position
	var bd := INF
	if jogador.vivo:
		bd = Vector2(jogador.global_position.x - zp.x, jogador.global_position.z - zp.z).length() - 0.3
	if Rede.anfitriao() and not Rede.jog.is_empty():
		for b in Rede.no_mundo():
			if not b.vivo or absf(b.alvo.y - zp.y) > 6.0:
				continue
			var d := Vector2(b.alvo.x - zp.x, b.alvo.z - zp.z).length()
			if d < bd:
				bd = d
				melhor = b
	return melhor


## os zumbis de cada lugar do mapa (os mesmos pontos do jogo antigo): aparecem quando alguém chega a 120 m e somem quando
## todos vão para longe (os que não estão caçando); o lugar se enche de novo 4 minutos depois
func _zumbis_dos_lugares(dt: float) -> void:
	_lugares_t -= dt
	if _lugares_t > 0.0:
		return
	_lugares_t = 1.5
	# onde cada um está (você mesmo caído conta para o lugar não sumir; para encher, só quem está de pé)
	var pos: Array = [[Vector2(jogador.global_position.x, jogador.global_position.z), jogador.vivo]]
	if Rede.anfitriao():
		for b in Rede.no_mundo():
			pos.append([Vector2(b.alvo.x, b.alvo.z), b.vivo])
	for id in mundo.zspawn:
		var pts: Array = mundo.zspawn[id]
		if pts.is_empty():
			continue
		var c := Vector2.ZERO
		for q in pts:
			c += Vector2(float(q[0]), float(q[1]))
		c /= float(pts.size())
		var d := INF
		var d_vivo := INF
		for e in pos:
			var dd: float = (e[0] as Vector2).distance_to(c)
			d = minf(d, dd)
			if e[1]:
				d_vivo = minf(d_vivo, dd)
		if not lugares_z.has(id):
			lugares_z[id] = {"ativo": false, "zumbis": [], "volta": 0.0}
		var L: Dictionary = lugares_z[id]
		L["volta"] = maxf(0.0, float(L["volta"]) - 1.5)
		if not L["ativo"] and d_vivo < 120.0 and float(L["volta"]) <= 0.0:
			L["ativo"] = true
			var zs := []
			for q in pts:
				var z := _nascer(Vector3(float(q[0]), 0, float(q[1])), tipo_sorteado(Vector3(float(q[0]), 0, float(q[1])), str(id).to_lower()))
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


## o zumbi pode deixar alguma coisa no chão (a tabela "zumbi" do jogo antigo: pano, munição, sucata); na partida em rede, quem
## matou leva: se foi um amigo, o saque cai no mundo dele
func zumbi_morreu(z, quem := 0) -> void:
	if quem != 0 and Rede.anfitriao():
		Rede.matou_z(quem, z.global_position)
		return
	_saque_zumbi(z.global_position)


func _saque_zumbi(p: Vector3) -> void:
	stats["zumbis"] = int(stats.get("zumbis", 0)) + 1
	var L: Array = mundo.sortear("zumbi")
	if not L.is_empty():
		construcao.soltar_no_chao(p, L)
		ui.aviso("O zumbi deixou alguma coisa no chão")


# ======================================================================== partida em rede (rede.gd)
var z_rede := {}   # convidado: uid -> o boneco de cada zumbi de quem abriu


## convidado: a hora e os zumbis de quem abriu (h < 0: quem abriu está no lobby)
func mundo_rede(h: float, L: PackedFloat32Array) -> void:
	if h >= 0.0:
		# a hora vem com 100 a mais quando é lua de sangue lá
		var sangue := h >= 100.0
		if sangue:
			h -= 100.0
		if sangue and not lua_rede:
			ui.aviso("Lua de sangue! Esta noite a horda vem maior e tem algo enorme andando com ela.", 8.0)
		lua_rede = sangue
		h = fposmod(h, 24.0)
		if h < hora - 12.0:
			dia += 1
		hora = h
	var vistos := {}
	for i in int(L.size() / 9.0):
		var b := i * 9
		var uid := int(L[b])
		var p := Vector3(L[b + 1], L[b + 2], L[b + 3])
		var st := int(L[b + 5])
		if not (is_finite(p.x) and is_finite(p.y) and is_finite(p.z)):
			continue
		vistos[uid] = true
		var z = z_rede.get(uid)
		if z != null and not is_instance_valid(z):
			z = null
		if z == null:
			if st == 3:
				continue   # já caiu lá: não nasce boneco só para cair
			var ti := clampi(int(L[b + 8]), 0, Zumbi.TIPOS.size() - 1)
			z = Zumbi.new(self, Zumbi.TIPOS.keys()[ti])
			z.lan = true
			z.uid = uid
			add_child(z)
			z.global_position = p
			z.rotation.y = L[b + 4]
			z.lan_alvo = p
			zumbis.append(z)
			z_rede[uid] = z
		var fr := fposmod(L[b + 8], 1.0)
		z.rede(p, L[b + 4], st, L[b + 6], L[b + 7], fr >= 0.45, fposmod(fr, 0.5) >= 0.2)
	for uid in z_rede.keys():
		if not vistos.has(uid):
			var z = z_rede[uid]
			if is_instance_valid(z):
				z.queue_free()
			z_rede.erase(uid)


## convidado: entrou na partida (os zumbis daqui somem: vêm todos de quem abriu)
func rede_entrou() -> void:
	for z in zumbis:
		if is_instance_valid(z) and not z.lan:
			z.queue_free()
	zumbis = zumbis.filter(func(z): return is_instance_valid(z) and z.lan)
	lugares_z.clear()
	fauna.limpar()


## saiu da partida (ou ela fechou): os bonecos dos zumbis somem e o seu mundo volta a ter os seus
func rede_desligou() -> void:
	for z in zumbis:
		if is_instance_valid(z) and z.lan:
			z.queue_free()
	zumbis = zumbis.filter(func(z): return is_instance_valid(z) and not z.lan)
	z_rede.clear()
	lugares_z.clear()
	fauna.limpar()
	cao.soltar_rede()
	veiculos.soltar_rede()
	spawn_t = 3.0
	if em_jogo and telas.atual in ["pausa", "mapa"]:
		get_tree().paused = true


## quem abriu: o golpe (ou a armadilha, o empurrão, a voadora) de um convidado num zumbi
func hit_rede(uid: int, d: float, de: Vector3, quem: int, info: Dictionary) -> void:
	for z in zumbis:
		if is_instance_valid(z) and z.uid == uid and not z.lan and z.estado != "morto":
			if str(info.get("k", "")) == "empurrao":
				z.empurrar(z.global_position - de)
			else:
				z.ferir(d, de, quem, info)
			return


func efeito_rede(uid: int, tipo: int, t: float) -> void:
	for z in zumbis:
		if is_instance_valid(z) and z.uid == uid and not z.lan and z.estado != "morto":
			if tipo == 1:
				z.prender(t)
			elif tipo == 2:
				z.acender(t)
			else:
				z.atrasar(t)
			return


## convidado: o zumbi que você matou caiu lá (no jogo de quem abriu); o que ele deixa cai aqui, no seu mundo
func zumbi_morreu_rede(p: Vector3) -> void:
	var y: float = chao_em(p.x, p.z, p.y + 1.5)["y"]
	_saque_zumbi(Vector3(p.x, y, p.z))


## convidado: o zumbi de quem abriu bateu em você; se a sua base está no meio (aqui, no seu mundo), ele bate nela
func dano_rede(d: float, de: Vector3) -> void:
	var z = null
	var melhor := 3.0
	for q in z_rede.values():
		if is_instance_valid(q) and q.estado != "morto" and q.global_position.distance_to(de) < melhor:
			melhor = q.global_position.distance_to(de)
			z = q
	var o: Vector3 = (z.global_position if z != null else de) + Vector3(0, 1.2, 0)
	var fora: Array[RID] = [jogador.get_rid()]
	if z != null:
		fora.append(z.get_rid())
	var rq := PhysicsRayQueryParameters3D.create(o, jogador.global_position + Vector3(0, 1.2, 0), 1, fora)
	var h := get_world_3d().direct_space_state.intersect_ray(rq)
	if not h.is_empty() and (h["collider"] as Object).has_meta("peca"):
		var np := int((h["collider"] as Object).get_meta("peca"))
		if construcao.peca_viva(np):
			construcao.ferir_peca(np, 3.0, h["position"])
			return
	jogador.ferir(d, true, o)
	# o golpe do zumbi de quem abriu pode passar o vírus (etapa 6f)
	lesoes.mordida(str(z.tipo) if z != null else "walker")


## /ir: para o lado de alguém (no seu mundo, onde ele está no dele)
func ir_para(p: Vector3) -> void:
	var sp := get_world_3d().direct_space_state
	var dest := p
	for k in 8:
		var a := randf() * TAU
		var t := p + Vector3(cos(a), 0, sin(a)) * 1.6
		var q := PhysicsRayQueryParameters3D.create(p + Vector3(0, 1.0, 0), t + Vector3(0, 1.0, 0), 1, [jogador.get_rid()])
		if sp.intersect_ray(q).is_empty():
			dest = t
			break
	var y: float = chao_em(dest.x, dest.z, p.y + 1.6)["y"]
	jogador.global_position = Vector3(dest.x, maxf(y, p.y - 0.5) + 0.1, dest.z)
	jogador.velocity = Vector3.ZERO
	jogador.queda_v = 0.0
	sons.tocar("clique", jogador.global_position, -6.0)


func _exit_tree() -> void:
	Rede.soltar(self)


func fabricar(r: Dictionary) -> void:
	# curtir o couro (etapa 6h): vai para o varal da estação e fica pronto depois de umas horas
	if r.has("varal"):
		ui.aviso(curtume.pendurar(r, jogador), 5.0)
		ui.atualizar()
		return
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
	# dirigindo (etapa 6j): E desce
	if jogador.veiculo != null and is_instance_valid(jogador.veiculo):
		var vc := jogador.veiculo
		if absf(vc.v) > 4.0:
			return "Diminua a velocidade para descer"
		return "E  Descer %s %s" % ["da" if vc.o_a() == "a" else "do", vc.nome().to_lower()]
	if pesca != null and pesca.ativa():
		return pesca.texto()
	if pesca != null and str(jogador.item_mao().get("id", "")) == "vara" and pesca.agua_na_frente(jogador) != Vector3.INF:
		return "E  Pescar (jogue a linha e espere morder)"
	# o Caramelo perto e na frente (como no jogo antigo: não precisa mirar certinho no cachorro)
	if cao != null and cao.na_mira(jogador):
		var tc := cao.texto(jogador)
		if tc != "":
			return tc
	# o canteiro ou a árvore de fruta perto (etapa 6g)
	if plantio != null:
		var tp := plantio.texto(jogador)
		if tp != "":
			return tp
	var h := jogador.mira(Jogador.ALCANCE + 0.4)
	if h.is_empty():
		return ""
	var c: Object = h["collider"]
	if c.has_meta("cao") and cao != null:
		return cao.texto(jogador)
	if c.has_meta("veiculo") and is_instance_valid(c.get_meta("veiculo")):
		return c.get_meta("veiculo").texto()
	if c.has_meta("bicho") and is_instance_valid(c.get_meta("bicho")):
		return fauna.texto(c.get_meta("bicho"), jogador)
	if c.has_meta("laco"):
		return fauna.texto_laco(c.get_meta("laco"))
	if c.has_meta("saco_dormir"):
		return "E  Dormir no saco de dormir"
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
			acao = "E  Dormir (e renascer) nesta "
		elif o.has("estacao") or str(po["id"]) == "bancadaTrab":
			acao = "E  Fabricar na "
		elif str(po["id"]) == "armadilhaUrso":
			acao = "E  Armar a " if not po.get("armada", true) else ""
		var nv := " (nível %d)" % int(po.get("nivel", 1)) if str(po["id"]) == "bancadaTrab" else ""
		if str(po["id"]) == "estacaoCouro" and curtume != null:
			var rs := curtume.resumo(int(c.get_meta("obra")))
			if rs != "":
				nv = " (%s)" % rs
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
	if jogador.veiculo != null:
		veiculos.expulsar(jogador)
	if lesoes.causa == "virus":
		ui.aviso("O vírus te venceu.", 5.0)
	lesoes.morreu(jogador.global_position)
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
	# dirigindo: o jogo salvo guarda você do lado de fora do veículo (senão você carregaria dentro da lataria)
	var jp := j.global_position
	if j.veiculo != null and is_instance_valid(j.veiculo):
		var sv: Vector3 = j.veiculo.saida()
		jp = sv if sv != Vector3.INF else j.veiculo.global_position + Vector3(0, float(j.veiculo.T["alt"]) + 0.3, 0)
	var d := {"versao": 1, "dia": dia, "hora": hora,
		"jogador": {"pos": [jp.x, jp.y, jp.z], "giro": j.rotation.y,
			"vida": j.vida, "fome": j.fome, "sede": j.sede, "bateria": j.bateria, "sel": j.sel, "inv": j.inv.salvar(),
			"vistos": j.vistos.keys(), "aprendidas": j.aprendidas.keys(), "consertos": j.consertos},
		"base": construcao.salvar(), "mundo": mundo.salvar(), "stats": stats, "noites": noites.salvar(), "fauna": fauna.salvar(), "clima": clima.salvar(), "sono": sono.salvar(), "pesca": pesca.salvar(),
		"cao": cao.salvar(), "lesoes": lesoes.salvar(), "plantio": plantio.salvar(),
		"curtume": curtume.salvar(), "veiculos": veiculos.salvar()}
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
		stats = {"zumbis": int(st.get("zumbis", 0)), "fabricados": int(st.get("fabricados", 0)), "cacados": int(st.get("cacados", 0))}
	var jd: Dictionary = d.get("jogador", {})
	var j := jogador
	if j.veiculo != null:
		veiculos.expulsar(j)
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
	var nd = d.get("noites", {})
	if nd is Dictionary:
		noites.carregar(nd)
	var fd = d.get("fauna", {})
	if fd is Dictionary:
		fauna.carregar(fd)
	var cd = d.get("clima", {})
	if cd is Dictionary:
		clima.carregar(cd)
	var sd = d.get("sono", {})
	if sd is Dictionary:
		sono.carregar(sd)
	var pd = d.get("pesca", {})
	if pd is Dictionary:
		pesca.carregar(pd)
	var kd = d.get("cao", {})
	cao.carregar(kd if kd is Dictionary else {})
	var ld = d.get("lesoes", {})
	lesoes.carregar(ld if ld is Dictionary else {})
	var pld = d.get("plantio", {})
	plantio.carregar(pld if pld is Dictionary else {})
	var ctd = d.get("curtume", {})
	curtume.carregar(ctd if ctd is Dictionary else {})
	veiculos.carregar(d.get("veiculos", null))
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


func _escrever(cam: String, txt: String) -> void:
	var f := FileAccess.open(cam, FileAccess.WRITE)
	if f != null:
		f.store_string(txt)
		f.close()


## a atualização automática: compara as versões, acha a mais nova publicada (godot-vX.Y.Z com o .exe), troca o .exe (o aberto
## vira .velho e o novo fica com o mesmo nome) e limpa o velho ao abrir; e pergunta de verdade ao GitHub
func _teste_atualiza() -> void:
	_confere(AtualizadorJogo.comparar("0.10.0", "0.9.9") == 1 and AtualizadorJogo.comparar("0.5.0", "0.5.0") == 0 and AtualizadorJogo.comparar("0.4.9", "0.5.0") == -1
		and AtualizadorJogo.comparar("abc", "0.0.1") == -1, "atualização: compara as versões (0.10.0 vem depois da 0.9.9)")
	var lista := [
		{"tag_name": "v10.7.0", "assets": [{"name": "VAYDR-Setup-10.7.0.exe", "browser_download_url": "https://github.com/x/v10.exe", "size": 5}]},
		{"tag_name": "godot-v0.5.0", "assets": [{"name": "VAYDR-Godot-0.5.0.exe", "browser_download_url": "https://github.com/a/0.5.0.exe", "size": 400000000}]},
		{"tag_name": "godot-v0.6.0", "draft": true, "assets": [{"name": "VAYDR-Godot-0.6.0.exe", "browser_download_url": "https://github.com/a/0.6.0.exe", "size": 1}]},
		{"tag_name": "godot-v0.5.2", "assets": [{"name": "VAYDR-Godot-0.5.2.exe", "browser_download_url": "https://github.com/a/0.5.2.exe", "size": 410000000}]},
		{"tag_name": "godot-v0.5.3", "assets": []}]
	var r := AtualizadorJogo.escolher(lista, "0.5.0")
	_confere(str(r.get("versao", "")) == "0.5.2" and str(r.get("url", "")).ends_with("0.5.2.exe") and int(r.get("tam", 0)) == 410000000,
		"atualização: acha a versão nova (%s; pula o rascunho, a do jogo antigo e a sem .exe)" % str(r.get("versao", "nenhuma")))
	_confere(AtualizadorJogo.escolher(lista, "0.5.2").is_empty(), "atualização: na versão mais nova fica em dia")
	# a troca do .exe, com arquivos de teste
	var pasta := OS.get_user_data_dir().path_join("teste_atualiza")
	DirAccess.make_dir_recursive_absolute(pasta)
	var exe := pasta.path_join("VAYDR-Godot-0.5.0.exe")
	var novo := pasta.path_join("VAYDR-Godot-0.5.2.exe.baixando")
	_escrever(exe, "velho")
	_escrever(novo, "novo")
	var t := AtualizadorJogo.trocar(exe, novo, "0.5.2")
	_confere(bool(t["ok"]) and bool(t["trocou"]) and FileAccess.get_file_as_string(exe) == "novo" and FileAccess.file_exists(exe + ".velho")
		and not FileAccess.file_exists(novo), "atualização: troca o .exe (o aberto vira .velho e o novo fica com o mesmo nome: os atalhos continuam)")
	_escrever(pasta.path_join("VAYDR-Godot-0.5.9.exe.baixando"), "parou no meio")
	AtualizadorJogo.limpar(exe)
	_confere(not FileAccess.file_exists(exe + ".velho") and not FileAccess.file_exists(pasta.path_join("VAYDR-Godot-0.5.9.exe.baixando")),
		"atualização: ao abrir, apaga o .exe velho e o download que parou no meio")
	DirAccess.remove_absolute(exe)
	var ps := AtualizadorJogo.script_ajudante(1234, "C:/Jogos/VAYDR d'Ana/VAYDR.exe", "C:/Jogos/VAYDR d'Ana/VAYDR.exe.novo", true)
	_confere(ps.contains("$p = 1234") and ps.contains("Wait-Process") and ps.contains("Move-Item") and ps.contains("'C:\\Jogos\\VAYDR d''Ana\\VAYDR.exe'")
		and ps.contains("--atualizou"), "atualização: o ajudante do Windows espera o jogo fechar, põe o novo no lugar e abre de novo (com aspas no caminho)")
	_confere(not Atualiza.ligada and Atualiza.estado == "desligada", "atualização: desligada nos testes e fora do .exe do Windows")
	# de verdade: a lista de versões publicadas no GitHub (uma versão bem velha acha a mais nova)
	var res: Dictionary = await Atualiza.consultar("0.0.1")
	if int(res.get("codigo", 0)) == 403:
		print("ok    atualização: o GitHub limitou as perguntas desta máquina agora (403); a conferência de verdade fica para a próxima")
	else:
		_confere(not res.has("erro") and AtualizadorJogo.comparar(str(res.get("versao", "")), "0.5.0") >= 0 and int(res.get("tam", 0)) > 100000000,
			"atualização: o GitHub respondeu e a versão publicada mais nova é a %s (%d MB)" % [str(res.get("versao", res.get("erro", "?"))), int(res.get("tam", 0)) / 1000000])


## mira num ponto com o botão direito apertado (a arma fecha) e atira uma vez
func _atirar_em(p: Vector3) -> void:
	_olhar(p)
	jogador.cd = 0.0
	jogador.atacar()


## as armas (a etapa 5b): o balanço (dano por região e distância), a munição no pente, a recarga, o tiro na cabeça e no peito,
## mirar (fecha o campo de visão), a espingarda de perto, o rifle que atravessa, o barulho do tiro, a besta (arma sozinha) e o
## arco (o que voa e crava), o molotov (o zumbi pega fogo), a bomba caseira (explode e derruba) e a isca (chama os zumbis)
func _teste_armas(livre: Vector3) -> void:
	var spawn_antes := spawn_t
	spawn_t = 9999.0
	_limpar_zumbis()
	hora = 10.0
	var c := _lugar_plano(Vector2(-35, 45), 30.0, Vector2(livre.x, livre.z))
	var clareira := _clareira_teste(c, 45.0)
	var X := Vector3(1, 0, 0)
	var Zv := Vector3(0, 0, 1)
	# os números do balanço
	var dc := Armas.dano_tiro("pistola", "cabeca", 10.0)
	var dpe := Armas.dano_tiro("pistola", "pernas", 10.0)
	var dr := Armas.dano_tiro("rifle", "cabeca", 30.0)
	var dl := Armas.dano_tiro("pistola", "tronco", 50.0)
	_confere(dc > 47.0 and dc < 57.0 and dpe > 16.0 and dpe < 20.0 and dr > 340.0 and dr < 410.0 and dl > 12.0 and dl < 16.0,
		"armas: pistola na cabeça %.0f, nas pernas %.0f, de longe (50 m) %.0f; rifle na cabeça %.0f" % [dc, dpe, dl, dr])
	_confere(int(Inventario.novo("pistola", 1).get("mun", -1)) == 0 and Inventario.novo("municao9", 5).get("mun", -1) == -1,
		"armas: a arma achada vem vazia (as balas ficam na mochila)")
	# a pistola: sem bala, o gatilho dá o clique e recarrega sozinha
	_jogador_em(c, c + X * 8.0 + Vector3(0, 1.6, 0))
	jogador.inv.por("pistola", 1)
	jogador.inv.por("municao9", 16)
	_na_mao("pistola")
	await _quadros(3)
	jogador.atacar()
	var rec := str(jogador.acao.get("tipo", ""))
	await _quadros(90)
	var s := jogador.item_mao()
	_confere(rec == "recarga" and int(s.get("mun", 0)) == 8 and jogador.inv.conta("municao9") == 8,
		"pistola: sem bala, o gatilho dá o clique e recarrega sozinha (8 no pente, %d na mochila)" % jogador.inv.conta("municao9"))
	main_hud_item_ok(s)
	# mirar: o botão direito fecha o campo de visão (e o tiro abre menos)
	Input.action_press("mirar")
	await _quadros(25)
	_confere(jogador.mira_k > 0.95 and jogador.cam.fov < jogador.fov_base * 0.85, "mirar (botão direito): a arma vem para o meio e a visão fecha (%.0f°)" % jogador.cam.fov)
	# o tiro na cabeça e no peito (um zumbi a 8 m, de frente); quem ouve de longe, de costas, vem ver
	var ouve := _z_teste(c - X * 34.0, "walker", c - X * 80.0)
	var z := _z_teste(c + X * 8.0, "walker", c)
	await _quadros(3)
	_atirar_em(z.global_position + Vector3(0, 1.62 * z.escala, 0))
	var d1 := z.vida_max - z.vida
	var mun1 := int(s.get("mun", 0))
	await _quadros(22)
	var v0 := z.vida
	_atirar_em(z.global_position + Vector3(0, 1.15 * z.escala, 0))
	var d2 := v0 - z.vida
	_confere(d1 > 40.0 and d2 > 18.0 and d2 < 32.0 and mun1 == 7, "pistola: na cabeça a 8 m tira %.0f, no peito %.0f (gastou uma bala por tiro)" % [d1, d2])
	var e_ouve: String = await _z_ate(ouve, ["alerta", "caca"], 150)
	_confere(e_ouve in ["alerta", "caca"], "o tiro faz barulho: o zumbi a 34 m, de costas, veio ver (%s)" % e_ouve)
	_limpar_zumbis()
	await _quadros(3)
	# a espingarda de perto (8 bagos): quase derruba de um tiro; recarrega um cartucho de cada vez
	jogador.inv.por("espingarda", 1)
	jogador.inv.por("cartucho", 10)
	_na_mao("espingarda")
	await _quadros(3)
	jogador.recarregar()
	var dur_e := float(jogador.acao.get("dur", 0.0))
	await _quadros(int(dur_e * 60.0) + 12)
	var se := jogador.item_mao()
	z = _z_teste(c + X * 4.0, "walker", c)
	await _quadros(3)
	_atirar_em(z.global_position + Vector3(0, 1.15 * z.escala, 0))
	var de := z.vida_max - maxf(z.vida, 0.0)
	_confere(int(se.get("mun", 0)) == 4 and absf(dur_e - (0.35 + 0.42 * 5.0)) < 0.05 and (de >= 60.0 or z.estado == "morto"),
		"espingarda: 5 cartuchos em %.1f s; de perto tira %.0f de um tiro (%s)" % [dur_e, de, z.estado])
	_limpar_zumbis()
	await _quadros(3)
	# o rifle com luneta: atravessa o primeiro e pega o de trás (com menos força)
	jogador.inv.por("rifle", 1)
	jogador.inv.por("balaRifle", 5)
	_na_mao("rifle")
	await _quadros(3)
	jogador.recarregar()
	await _quadros(135)
	var z1 := _z_teste(c + X * 10.0, "walker", c)
	var z2 := _z_teste(c + X * 12.5, "walker", c)
	await _quadros(25)
	var luneta := jogador.cam.fov < 25.0
	var mun_r := int(jogador.item_mao().get("mun", 0))
	_atirar_em(z1.global_position + Vector3(0, 1.15 * z1.escala, 0))
	var d_z2 := z2.vida_max - maxf(z2.vida, 0.0)
	_confere(luneta and z1.estado == "morto" and d_z2 > 40.0, "rifle: a luneta no olho (%.0f°); o tiro mata o da frente e atravessa no de trás (%.0f) · %d balas no pente, o da frente %s" % [
		jogador.cam.fov, d_z2, mun_r, z1.estado])
	_limpar_zumbis()
	await _quadros(3)
	# a besta: o virote voa e crava; arma sozinha depois do tiro
	jogador.inv.por("besta", 1)
	jogador.inv.por("virote", 3)
	_na_mao("besta")
	await _quadros(3)
	jogador.recarregar()
	await _quadros(100)
	z = _z_teste(c + X * 15.0, "walker", c + X * 40.0)
	await _quadros(3)
	_atirar_em(z.global_position + Vector3(0, 1.15 * z.escala, 0))
	await _quadros(40)
	var db := z.vida_max - maxf(z.vida, 0.0)
	var cravou: bool = z.estado == "morto" or z.cravadas.size() > 0
	await _quadros(130)
	_confere(db > 50.0 and cravou and int(jogador.item_mao().get("mun", 0)) == 1 and jogador.inv.conta("virote") == 1,
		"besta: o virote voou 15 m e cravou (%.0f de dano); ela armou sozinha de novo" % db)
	_limpar_zumbis()
	await _quadros(3)
	# o arco: segura para puxar e solta (puxado até o fim vai longe e mata mais)
	Input.action_release("mirar")
	jogador.inv.por("arco", 1)
	jogador.inv.por("flecha", 5)
	_na_mao("arco")
	z = _z_teste(c + X * 12.0, "walker", c + X * 40.0)
	await _quadros(3)
	_olhar(z.global_position + Vector3(0, 1.2 * z.escala, 0))
	jogador.cd = 0.0
	Input.action_press("atacar")
	await _quadros(50)
	var puxa := float(jogador.acao.get("puxa", 0.0))
	Input.action_release("atacar")
	await _quadros(45)
	var da := z.vida_max - maxf(z.vida, 0.0)
	_confere(puxa >= 1.0 and jogador.inv.conta("flecha") == 4 and da > 25.0, "arco: puxou até o fim e a flecha pegou a 12 m (%.0f de dano)" % da)
	_limpar_zumbis()
	await _quadros(3)
	# o molotov: o fogo no chão e o zumbi pegando fogo
	jogador.inv.por("molotov", 1)
	_na_mao("molotov")
	z = _z_teste(c + X * 8.0, "walker", c + X * 40.0)
	await _quadros(3)
	_olhar(z.global_position + Vector3(0, 0.05, 0))
	jogador.cd = 0.0
	jogador.atacar()
	await _quadros(100)
	var chamas := projeteis.chamas.size()
	var pegou: bool = z.estado == "morto" or z.queima > 0.0
	_confere(chamas == 1 and pegou and z.vida < z.vida_max and jogador.inv.conta("molotov") == 0,
		"molotov: quebrou, o chão pegou fogo e o zumbi também (vida %.0f)" % maxf(z.vida, 0.0))
	projeteis.limpar()
	_limpar_zumbis()
	await _quadros(3)
	# a bomba caseira: cai, o pavio queima e explode (os de perto morrem ou caem)
	jogador.inv.por("bombaCaseira", 1)
	_na_mao("bombaCaseira")
	var grupo := []
	for k in 3:
		grupo.append(_z_teste(c + X * 9.0 + Zv * (k - 1) * 1.3, "walker", c + X * 40.0))
	await _quadros(3)
	_olhar(c + X * 9.0 + Vector3(0, 0.05, 0))
	jogador.cd = 0.0
	jogador.atacar()
	await _quadros(80)
	var no_chao := projeteis.bombas.size()
	await _quadros(200)
	var caidos := 0
	for g in grupo:
		if g.estado in ["morto", "derrubado", "levanta"]:
			caidos += 1
	_confere(no_chao == 1 and caidos == 3, "bomba caseira: caiu, o pavio queimou e explodiu (%d de 3 zumbis mortos ou no chão)" % caidos)
	projeteis.limpar()
	_limpar_zumbis()
	await _quadros(3)
	# a isca: toca e os zumbis vão até ela
	jogador.inv.por("isca", 1)
	_na_mao("isca")
	var a1 := _z_teste(c + X * 10.0 + Zv * 14.0, "walker", c + X * 10.0 + Zv * 40.0)
	var a2 := _z_teste(c + X * 10.0 - Zv * 14.0, "walker", c + X * 10.0 - Zv * 40.0)
	await _quadros(3)
	_olhar(c + X * 10.0 + Vector3(0, 0.05, 0))
	jogador.cd = 0.0
	jogador.atacar()
	# espera a isca cair (o arremesso leva uns 0,25 s e o voo quase 1 s)
	for i in 150:
		await get_tree().physics_frame
		if projeteis.iscas.size() > 0:
			break
	var lp: Vector3 = projeteis.iscas[0]["p"] if projeteis.iscas.size() > 0 else Vector3.INF
	var ea1: String = await _z_ate(a1, ["alerta", "caca"], 240)
	var ea2: String = await _z_ate(a2, ["alerta", "caca"], 120)
	var diag_i := ""
	if lp != Vector3.INF:
		var rel := lp - c
		diag_i = " · isca em x %.1f z %.1f (y %.1f) do lugar; zumbis a %.1f e %.1f m dela; ouvindo %.2f e %.2f; para %.1f m e %.1f m" % [
			rel.x, rel.z, rel.y, a1.global_position.distance_to(lp), a2.global_position.distance_to(lp), a1.ouvir_t, a2.ouvir_t,
			a1.alerta_p.distance_to(lp), a2.alerta_p.distance_to(lp)]
	_confere(lp != Vector3.INF and ea1 in ["alerta", "caca"] and ea2 in ["alerta", "caca"] and a1.alerta_p.distance_to(lp) < 4.0,
		"isca: caiu a uns 10 m, tocou e os dois zumbis foram até ela (%s, %s)%s" % [ea1, ea2, diag_i])
	projeteis.limpar()
	_limpar_zumbis()
	for id in ["pistola", "municao9", "espingarda", "cartucho", "rifle", "balaRifle", "besta", "virote", "arco", "flecha", "molotov", "bombaCaseira", "isca"]:
		var n := jogador.inv.conta(id)
		if n > 0:
			jogador.inv.tirar(id, n)
	_mao_vazia()
	await _quadros(3)
	_devolver_clareira(clareira)
	jogador.vida = 100.0
	spawn_t = spawn_antes


## a distância média de um grupo de zumbis até um ponto (no chão)
func _dist_media(L: Array, p: Vector3) -> float:
	var s := 0.0
	var n := 0
	for z in L:
		if is_instance_valid(z) and z.estado != "morto":
			s += Vector2(z.global_position.x - p.x, z.global_position.z - p.z).length()
			n += 1
	return s / float(n) if n > 0 else 0.0


## espera o ataque especial do Colosso chegar numa fase (e num tempo dela); devolve se chegou
func _chefe_ate(z: Zumbi, fase: String, t: float, n: int) -> bool:
	for i in n:
		if not is_instance_valid(z):
			return false
		if str(z.chefe.get("fase", "")) == fase and float(z.chefe.get("t", 0.0)) >= t:
			return true
		await get_tree().physics_frame
	return false


## as noites (etapa 5c): a conta das noites e a lua de sangue (3ª, 7ª, 11ª), as ondas da horda (de longe, vêm para você), o
## céu vermelho, a lua de sangue que vai para quem entrou na partida, o Colosso (chega perto, a barra da vida dele aparece, o
## pisão pega quem está no chão e não quem pula, a investida derruba, batendo na parede ele fica tonto, o fogo machuca mais e
## derrubado ele deixa suprimentos), a caixa de suprimentos da manhã e o jogo salvo
func _teste_noites(livre: Vector3) -> void:
	var spawn_antes := spawn_t
	spawn_t = 9999.0
	_limpar_zumbis()
	var hora_antes := hora
	var salvo := noites.salvar()
	var sangue: Array = []
	for n in range(1, 13):
		if Noites.e_lua_sangue(n):
			sangue.append(n)
	_confere(sangue == [3, 7, 11] and Noites.horas_ondas(1, false).size() == 3 and Noites.horas_ondas(2, false).size() == 4
		and Noites.horas_ondas(3, true).size() == 6 and Noites.qtd_onda(1, false) == 4 and Noites.qtd_onda(3, true) == 11,
		"noites: lua de sangue na %s noite; 3 ondas na 1ª, 4 nas outras e 6 na lua de sangue; 4 zumbis por onda na 1ª, 11 na lua de sangue" % str(sangue))
	_confere(Noites.passou(18.9, 19.1, 19.0) and Noites.passou(23.9, 0.2, 0.1) and not Noites.passou(23.9, 0.2, 23.5) and Noites.passou(23.8, 0.3, 23.9)
		and Noites.tipo_onda(3, 0, 0.5, false) == "brute" and Noites.tipo_onda(1, 2, 0.1, false) == "walker" and Noites.tipo_onda(2, 2, 0.1, false) == "runner",
		"noites: a hora que passou (também na virada da meia-noite) e quem vem na onda (da 3ª noite em diante um brutamontes na frente)")
	# a 3ª noite cai às 19h: lua de sangue
	noites.noite_n = 2
	noites.lua_sangue = false
	noites._hora_antes = -1.0
	hora = 18.95
	noites.passo(0.0)
	hora = 19.05
	noites.passo(0.0)
	_confere(noites.noite_n == 3 and noites.lua_sangue and noites.ondas.size() == 6, "lua de sangue: a 3ª noite caiu às 19h (%d ondas marcadas)" % noites.ondas.size())
	hora = 0.0
	_ciclo()
	var hz: Color = ceu.sky_horizon_color
	var cl: Color = lua.light_color
	_confere(hz.r > hz.b * 1.4 and cl.r > 0.9 and cl.g < 0.4, "lua de sangue: o céu da noite fica vermelho (horizonte %.2f %.2f %.2f) e a lua também" % [hz.r, hz.g, hz.b])
	# quem entrou na partida recebe a lua de sangue junto com a hora (101,5 = 1h30 com lua de sangue)
	lua_rede = false
	mundo_rede(101.5, PackedFloat32Array())
	var rede_ok := lua_rede and absf(hora - 1.5) < 0.01
	mundo_rede(2.0, PackedFloat32Array())
	rede_ok = rede_ok and not lua_rede and absf(hora - 2.0) < 0.01
	_confere(rede_ok, "partida em rede: a lua de sangue vai junto com a hora para quem entrou")
	# uma onda: de 42 a 56 m de você, todos vindo para onde você está (e a horda anda)
	var c := _lugar_plano(Vector2(-35, 45), 30.0, Vector2(livre.x, livre.z))
	var clareira := _clareira_teste(c, 60.0)
	var X := Vector3(1, 0, 0)
	var Zv := Vector3(0, 0, 1)
	_jogador_em(c, c + Vector3(0, 1.5, -10))
	await _quadros(5)
	hora = 21.0
	var antes_n := zumbis.size()
	var feitos := noites.onda()
	var novos: Array = zumbis.slice(antes_n)
	var longe_ok := true
	var vem := 0
	for z in novos:
		var d: float = Vector2(z.global_position.x - c.x, z.global_position.z - c.z).length()
		if d < 40.0 or d > 58.0:
			longe_ok = false
		if float(z.ouvir_t) >= 0.0 and (z.ouvir_p as Vector3).distance_to(jogador.global_position) < 2.0:
			vem += 1
	var t0: String = novos[0].tipo if novos.size() > 0 else "-"
	_confere(feitos >= 8 and novos.size() == feitos and longe_ok and vem == feitos and t0 == "brute",
		"onda da lua de sangue: %d zumbis de 42 a 56 m, todos vindo para você (%d), com um brutamontes na frente (%s)" % [feitos, vem, t0])
	var d0 := _dist_media(novos, c)
	noites._marcha_t = 0.0
	for i in 240:
		noites._marchar(1.0 / 60.0)
		await get_tree().physics_frame
	var d1 := _dist_media(novos, c)
	_confere(d1 < d0 - 3.0, "a horda anda para você (de %.0f m para %.0f m em 4 s)" % [d0, d1])
	_limpar_zumbis()
	noites.marcha.clear()
	await _quadros(3)
	# o Colosso chega a uns 35 m, já atrás de você; a barra da vida dele aparece
	hora = 12.0
	_jogador_em(c, c + Vector3(0, 1.5, -10))
	await _quadros(3)
	noites.colosso_veio = false
	var co := noites.colosso()
	var dco: float = Vector2(co.global_position.x - c.x, co.global_position.z - c.z).length() if co != null else -1.0
	_confere(co != null and noites.colosso_veio and dco > 28.0 and dco < 44.0 and co.estado == "caca" and co.vida_max >= 1800.0 and co.escala > 2.2,
		"Colosso: chegou a %.0f m, já atrás de você, com %.0f de vida e %.2f vezes o tamanho" % [dco, co.vida_max if co != null else 0.0, co.escala if co != null else 0.0])
	if co == null:
		co = _z_teste(c + X * 30.0, "colosso", c)
		co.estado = "caca"
	ui.hud._chefe_ver(jogador)
	_confere(ui.hud.chefe_painel.visible and ui.hud.chefe_k > 0.99, "Colosso: a barra da vida dele aparece no alto da tela")
	# o pisão: quem está no chão leva o tranco
	co.parado = false
	co.global_position = Vector3(c.x + 3.6, co.global_position.y, c.z)
	co.global_position.y = terreno.h(co.global_position.x, co.global_position.z) + 0.1
	co.rotation.y = atan2(3.6, 0.0)
	co.chefe = {"cd_pisao": 0.0, "cd_inv": 99.0, "cd_rug": 99.0}
	_jogador_em(c, co.global_position + Vector3(0, 2.0, 0))
	jogador.set_physics_process(true)
	var chegou: bool = await _chefe_ate(co, "pisao", 1.05, 150)
	var v1 := jogador.vida
	_confere(chegou and v1 < 90.0 and v1 > 40.0, "Colosso: o pisão pega quem está no chão (vida %.0f)" % v1)
	await _quadros(60)
	# o pisão de novo: pulando na hora, a onda não pega
	_jogador_em(c, co.global_position + Vector3(0, 2.0, 0))
	co.chefe = {"cd_pisao": 0.0, "cd_inv": 99.0, "cd_rug": 99.0}
	var armou: bool = await _chefe_ate(co, "pisao", 0.72, 150)
	jogador.vida = 100.0
	jogador.energia = 100.0
	Input.action_press("pular")
	await _quadros(1)
	Input.action_release("pular")
	var bateu := false
	for i in 40:
		await get_tree().physics_frame
		if bool(co.chefe.get("bateu", false)):
			bateu = true
			break
	_confere(armou and bateu and jogador.vida >= 99.0, "Colosso: pulando na hora do pisão a onda não pega (vida %.0f)" % jogador.vida)
	await _quadros(60)
	# a investida: ruge, abaixa e corre reto; pega você e te joga longe
	co.global_position = Vector3(c.x + 11.0, co.global_position.y, c.z)
	co.global_position.y = terreno.h(co.global_position.x, co.global_position.z) + 0.1
	co.rotation.y = atan2(11.0, 0.0)
	_jogador_em(c, co.global_position + Vector3(0, 2.0, 0))
	await _quadros(2)
	co.chefe = {"cd_pisao": 99.0, "cd_inv": 0.0, "cd_rug": 99.0}
	var correu: bool = await _chefe_ate(co, "investida", 0.0, 120)
	jogador.vida = 100.0
	for i in 120:
		await get_tree().physics_frame
		if jogador.vida < 99.0:
			break
	var v2 := jogador.vida
	_confere(correu and v2 < 75.0, "Colosso: a investida pega quem está na frente (vida %.0f)" % v2)
	await _quadros(90)
	# batendo na parede na investida ele fica tonto
	var parede := StaticBody3D.new()
	var ps := CollisionShape3D.new()
	var pb := BoxShape3D.new()
	pb.size = Vector3(0.8, 6.0, 10.0)
	ps.shape = pb
	parede.add_child(ps)
	add_child(parede)
	parede.global_position = Vector3(c.x - 1.0, terreno.h(c.x - 1.0, c.z) + 2.5, c.z)
	co.global_position = Vector3(c.x - 7.0, 0, c.z)
	co.global_position.y = terreno.h(co.global_position.x, co.global_position.z) + 0.1
	co.rotation.y = atan2(-1.0, 0.0)
	_jogador_em(c + Zv * 14.0 + X * 4.0, c + Zv * 14.0)
	await _quadros(3)
	co.estado = "caca"
	co.chefe = {"fase": "investida", "t": 0.0, "dir": X, "pegou": [], "cd_pisao": 99.0, "cd_inv": 99.0, "cd_rug": 99.0}
	var tonto: bool = await _chefe_ate(co, "tonto", 0.0, 120)
	_confere(tonto, "Colosso: na investida bateu na parede e ficou tonto (%s)" % str(co.chefe.get("fase", "")))
	parede.queue_free()
	# o fogo machuca mais (1,6 vez)
	co.chefe = {"cd_pisao": 99.0, "cd_inv": 99.0, "cd_rug": 99.0}
	var va := co.vida
	co.ferir(10.0, co.global_position + X, 0, {"k": "bala"})
	var vb := co.vida
	co.ferir(10.0, co.global_position + X, 0, {"k": "fogo"})
	var vc := co.vida
	_confere(absf((va - vb) - 10.0) < 0.5 and absf((vb - vc) - 16.0) < 0.5, "Colosso: o fogo machuca mais (bala 10, fogo %.0f)" % (vb - vc))
	# derrubado, deixa os suprimentos no chão (e a barra some)
	var baus_antes := construcao.baus.size()
	co.ferir(5000.0, co.global_position + X, 0, {"k": "bala"})
	var inv_c: Inventario = null
	for i in range(baus_antes, construcao.baus.size()):
		if str(construcao.baus[i]["titulo"]) == "O que o Colosso deixou":
			inv_c = construcao.baus[i]["inv"]
	var deixou := inv_c != null
	_confere(co.estado == "morto" and deixou and inv_c != null and inv_c.conta("molotov") >= 2 and inv_c.conta("flecha") >= 10 and inv_c.conta("kit") >= 1,
		"Colosso: derrubado, deixou no chão o kit médico, molotovs, flechas e suprimentos (%d coisas)" % (inv_c.slots.filter(func(s): return s != null).size() if inv_c != null else 0))
	ui.hud._chefe_ver(jogador)
	_confere(not ui.hud.chefe_painel.visible, "Colosso: caiu e a barra da vida some")
	_limpar_zumbis()
	# amanheceu depois da lua de sangue: às 7h12 a caixa de suprimentos cai perto, com fumaça vermelha
	noites._hora_antes = -1.0
	hora = 5.9
	noites.passo(0.0)
	hora = 6.05
	noites.passo(0.0)
	var amanheceu := not noites.lua_sangue and noites.ondas.is_empty() and absf(noites.caixa_h - 7.2) < 0.01
	var baus_c := construcao.baus.size()
	hora = 7.1
	noites.passo(0.0)
	hora = 7.3
	noites.passo(0.0)
	var caixa_ok := construcao.baus.size() == baus_c + 1 and str(construcao.baus[-1]["titulo"]) == "Caixa de suprimentos"
	var dcx := -1.0
	if caixa_ok:
		var pc: Vector3 = (construcao.baus[-1]["no"] as Node3D).global_position
		dcx = Vector2(pc.x - jogador.global_position.x, pc.z - jogador.global_position.z).length()
	_confere(amanheceu and caixa_ok and dcx > 25.0 and dcx < 65.0 and noites.caixa_h < 0.0,
		"amanheceu depois da lua de sangue: às 7h12 caiu a caixa de suprimentos a %.0f m, com fumaça vermelha" % dcx)
	# o jogo salvo guarda as noites
	var sv := noites.salvar()
	noites.carregar({})
	var zerou := noites.noite_n == 0
	noites.carregar(sv)
	_confere(zerou and noites.noite_n == 3 and not noites.lua_sangue, "jogo salvo: as noites voltam como estavam (noite %d)" % noites.noite_n)
	noites.carregar(salvo)
	_limpar_zumbis()
	await _quadros(3)
	_devolver_clareira(clareira)
	hora = hora_antes
	_ciclo()
	jogador.vida = 100.0
	spawn_t = spawn_antes


## um bicho para o teste: em p, olhando para "olha", parado no lugar até o teste soltar
func _b_teste(tp: String, p: Vector3, olha: Vector3, vd := "", zona_id := "") -> Bicho:
	var b := fauna.criar(tp, p, zona_id, null, vd)
	var d := olha - p
	b.yaw = atan2(d.x, d.z)
	b.rotation.y = b.yaw
	b.st = "come"
	b.t = 99.0
	b.v_alvo = 0.0
	b.rumo = Vector2(d.x, d.z).normalized()
	return b


## espera o bicho ficar num dos estados (ou acabar o tempo); devolve o estado
func _b_ate(b: Bicho, estados: Array, n: int) -> String:
	for i in n:
		if not is_instance_valid(b) or b.st in estados:
			break
		await get_tree().physics_frame
	return b.st if is_instance_valid(b) else "sumiu"


func _limpar_bichos() -> void:
	fauna.limpar()


## os bichos (etapa 6a): os modelos das dez espécies, as regiões, quem vê e foge, o barulho, a matilha de noite, o urso que
## defende e investe, o javali que revida, o predador que caça, o tiro, a flecha e o esfolar (com e sem faca), a população que
## baixa com a caça, os bichos que aparecem perto das regiões e somem longe, e o jogo salvo
func _teste_fauna(livre: Vector3) -> void:
	var spawn_antes := spawn_t
	spawn_t = 9999.0
	_limpar_zumbis()
	_limpar_bichos()
	var hora_antes := hora
	hora = 12.0
	# os modelos: 12 ossos e as malhas de cada espécie
	var tris := 0
	var ok_m := true
	for tp in Fauna.TIPOS:
		var mb := ModelosBichos.montar(tp)
		var O: Array = mb["ossos"]
		if O.size() != 12:
			ok_m = false
		for o in O:
			for ch in (o as Node3D).get_children():
				if ch is MeshInstance3D:
					tris += ((ch as MeshInstance3D).mesh as ArrayMesh).surface_get_array_len(0) / 3
		(mb["raiz"] as Node3D).free()
	_confere(ok_m and tris > 20000, "bichos: os modelos das 10 espécies montados por código, com 12 ossos cada (%d mil triângulos)" % (tris / 1000))
	# as regiões do jogo antigo (os pastos da fazenda, o vale do Rio Claro...) e a população de cada uma
	var zp: Dictionary = fauna.zona_em(-72, 60)
	var zr: Dictionary = fauna.zona("rio")
	var rio_d := fauna.rio_perto(14.0, -45.0).x
	_confere(str(zp.get("id", "")) == "pastos" and fauna.dentro_zona(zr, 20.0, -45.0) and rio_d < 1.0
		and int(fauna.pop["pastos"]["vaca"]["n"]) == 5 and int(fauna.pop["serra"]["urso"]["n"]) == 1,
		"bichos: as regiões (pastos da fazenda com %d vacas, a serra com %d urso, o vale ao longo do Rio Claro: o rio a %.1f m)" % [
			int(fauna.pop["pastos"]["vaca"]["n"]), int(fauna.pop["serra"]["urso"]["n"]), rio_d])
	var c := _lugar_plano(Vector2(-35, 45), 30.0, Vector2(livre.x, livre.z))
	var clareira := _clareira_teste(c, 60.0)
	var X := Vector3(1, 0, 0)
	var Zv := Vector3(0, 0, 1)
	_jogador_em(c, c + X * 10.0 + Vector3(0, 1.0, 0))
	jogador.agachado = false
	await _quadros(5)
	# o cervo te vê de frente e foge
	var cv := _b_teste("cervo", c + X * 12.0, c)
	await _quadros(3)
	var d0 := cv.global_position.distance_to(c)
	var ec: String = await _b_ate(cv, ["foge"], 240)
	await _quadros(90)
	var d1 := cv.global_position.distance_to(c)
	_confere(ec == "foge" and d1 > d0 + 2.0, "cervo: te viu de frente a 12 m e fugiu (%s, de %.0f m para %.0f m)" % [ec, d0, d1])
	_limpar_bichos()
	await _quadros(2)
	# agachado, pelas costas, ele não te vê; o tiro faz ele fugir
	Input.action_press("agachar")
	var cv2 := _b_teste("cervo", c + X * 10.0, c + X * 30.0)
	await _quadros(150)
	var quieto := cv2.st
	barulho(jogador.global_position, 55.0)
	var ec2: String = await _b_ate(cv2, ["foge"], 120)
	_confere(quieto == "come" and ec2 == "foge", "cervo: agachado e pelas costas ele não te vê (%s); o barulho do tiro faz ele fugir (%s)" % [quieto, ec2])
	Input.action_release("agachar")
	_limpar_bichos()
	await _quadros(2)
	# o rifle derruba o cervo: vira carcaça (a população da região baixa um)
	jogador.inv.por("rifle", 1)
	jogador.inv.por("balaRifle", 5)
	_na_mao("rifle")
	jogador.item_mao()["mun"] = 5
	var n_antes := int(fauna.pop["clareira"]["cervo"]["n"])
	var cv3 := _b_teste("cervo", c + X * 9.0, c + X * 9.0 + Zv * 5.0, "", "clareira")
	await _quadros(4)
	_atirar_em(cv3.centro())
	await _quadros(5)
	var rest: Dictionary = cv3.carc.get("rest", {})
	_confere(not cv3.vivo and cv3.st == "morto" and int(rest.get("couro", 0)) == 3 and int(rest.get("carneCrua", 0)) == 3
		and int(fauna.pop["clareira"]["cervo"]["n"]) == n_antes - 1,
		"rifle: derrubou o cervo; a carcaça tem %s e a mata da clareira ficou com um cervo a menos" % cv3.resumo())
	# esfolar: sem lâmina não dá; com a faca, segura E e sai o couro (com qualidade), a carne, os ossos e o tendão
	var laminas := {}
	for id in ["machado", "machadoPedra", "faca", "facaPedra", "facao", "facaCaca", "cutelo"]:
		var n := jogador.inv.conta(id)
		if n > 0:
			laminas[id] = n
			jogador.inv.tirar(id, n)
	var antes_e := {}
	for id in ["couro", "carneCrua", "ossos", "tendao"]:
		antes_e[id] = jogador.inv.conta(id)
	jogador.acao = {}
	_jogador_em(cv3.global_position - X * 1.6, cv3.centro())
	await _quadros(3)
	var sem := texto_mira()
	jogador.inv.por("faca", 1)
	_olhar(cv3.centro())
	await _quadros(2)
	var com := texto_mira()
	jogador.esfolar(cv3)
	Input.action_press("usar")
	await _quadros(int(fauna.tempo_esfolar(cv3) * 60.0) + 20)
	Input.action_release("usar")
	var q_c := -1
	for s in jogador.inv.slots:
		if s != null and str(s["id"]) == "couro":
			q_c = int(s.get("q", -1))
	var ganhou := {}
	for id in antes_e:
		ganhou[id] = jogador.inv.conta(id) - int(antes_e[id])
	_confere(sem.begins_with("Precisa de faca") and com.begins_with("E  Esfolar o cervo") and int(ganhou["couro"]) == 3 and q_c >= 0
		and int(ganhou["carneCrua"]) == 3 and int(ganhou["ossos"]) == 2 and int(ganhou["tendao"]) == 1 and bool(cv3.carc.get("vazia", false)),
		"esfolar: sem faca não dá (%s); com a faca saíram 3 couros (%s), 3 carnes, 2 ossos e 1 tendão (%s)" % [sem.left(40), Armas.QUAL_NOME[q_c] if q_c >= 0 else "?", str(ganhou)])
	var nf := jogador.inv.conta("faca")
	if nf > 0:
		jogador.inv.tirar("faca", nf)
	for id in laminas:
		jogador.inv.por(id, int(laminas[id]))
	for id in ["couro", "carneCrua", "ossos", "tendao"]:
		var n2 := jogador.inv.conta(id) - int(antes_e[id])
		if n2 > 0:
			jogador.inv.tirar(id, n2)
	for id in ["rifle", "balaRifle"]:
		var n := jogador.inv.conta(id)
		if n > 0:
			jogador.inv.tirar(id, n)
	_mao_vazia()
	_limpar_bichos()
	await _quadros(2)
	# o coelho ouve o barulho e foge ziguezagueando
	var co := _b_teste("coelho", c + X * 14.0, c + X * 30.0)
	await _quadros(3)
	barulho(jogador.global_position, 30.0)
	var ecc: String = await _b_ate(co, ["foge"], 90)
	_confere(ecc == "foge", "coelho: ouviu o barulho a 14 m e fugiu (%s)" % ecc)
	_limpar_bichos()
	await _quadros(2)
	# a flecha pega a ovelha
	jogador.inv.por("arco", 1)
	jogador.inv.por("flecha", 4)
	_na_mao("arco")
	var ov := _b_teste("ovelha", c + X * 10.0, c + X * 10.0 + Zv * 5.0)
	await _quadros(4)
	_olhar(ov.centro() + Vector3(0, 0.25, 0))
	jogador.set_physics_process(false)
	jogador.acao = {"tipo": "arco", "t": 0.8, "dur": 1e9, "puxa": 1.0, "feito": false, "slot": jogador.sel, "soltar": true}
	jogador.set_physics_process(true)
	await _quadros(40)
	_confere(ov.hp < ov.hp_max, "arco: a flecha pegou a ovelha a 10 m (vida %.0f de %.0f)" % [maxf(ov.hp, 0.0), ov.hp_max])
	for id in ["arco", "flecha"]:
		var n := jogador.inv.conta(id)
		if n > 0:
			jogador.inv.tirar(id, n)
	_mao_vazia()
	_limpar_bichos()
	projeteis.limpar()
	await _quadros(2)
	# a matilha de noite: os lobos te cercam e mordem
	hora = 23.0
	jogador.vida = 100.0
	var lobos: Array = []
	var ld: Bicho = null
	for k in 3:
		var lb := _b_teste("lobo", c + X * 12.0 + Zv * (k - 1) * 2.0, c)
		if ld == null:
			ld = lb
		else:
			lb.lider = ld
		lobos.append(lb)
	var atacou := false
	for i in 600:
		await get_tree().physics_frame
		if jogador.vida < 99.0:
			atacou = true
			break
	var est_l := []
	for lb in lobos:
		est_l.append(lb.st)
	var abrigo_l := construcao.base_perto(jogador.global_position, 26.0) or construcao.fogo_perto(jogador.global_position, 6.0)
	_confere(atacou, "lobos: de noite a matilha veio em grupo e mordeu (vida %.0f; %s%s)" % [jogador.vida, ", ".join(PackedStringArray(est_l)), "; base perto" if abrigo_l else ""])
	_limpar_bichos()
	jogador.vida = 100.0
	hora = 12.0
	await _quadros(2)
	# o urso: defende o espaço dele (fica de pé), depois investe
	_jogador_em(c, c + X * 10.0 + Vector3(0, 1.0, 0))
	var ur := _b_teste("urso", c + X * 11.0, c)
	var eu: String = await _b_ate(ur, ["defende"], 240)
	var pegou_u := false
	for i in 480:
		await get_tree().physics_frame
		if jogador.vida < 99.0:
			pegou_u = true
			break
	_confere(eu == "defende" and pegou_u, "urso: ficou de pé defendendo o espaço (%s) e depois investiu (vida %.0f)" % [eu, jogador.vida])
	_limpar_bichos()
	jogador.vida = 100.0
	await _quadros(2)
	# o javali ferido revida
	_jogador_em(c, c + X * 8.0 + Vector3(0, 0.6, 0))
	jogador.inv.por("pistola", 1)
	jogador.inv.por("municao9", 8)
	_na_mao("pistola")
	jogador.item_mao()["mun"] = 8
	var jv := _b_teste("javali", c + X * 8.0, c + X * 8.0 + Zv * 5.0)
	await _quadros(4)
	_atirar_em(jv.centro())
	var ej: String = await _b_ate(jv, ["defende", "persegue", "ataca"], 120)
	var pegou_j := false
	for i in 300:
		await get_tree().physics_frame
		if jogador.vida < 99.0:
			pegou_j = true
			break
	_confere(jv.vivo and ej in ["defende", "persegue", "ataca"] and pegou_j, "javali: levou o tiro e revidou (%s; vida %.0f)" % [ej, jogador.vida])
	for id in ["pistola", "municao9"]:
		var n := jogador.inv.conta(id)
		if n > 0:
			jogador.inv.tirar(id, n)
	_mao_vazia()
	_limpar_bichos()
	jogador.vida = 100.0
	await _quadros(2)
	# a raposa com fome caça o coelho
	_jogador_em(c - X * 30.0, c - X * 40.0 + Vector3(0, 1.0, 0))
	var rp := _b_teste("raposa", c + Zv * 6.0, c)
	var cl := _b_teste("coelho", c, c - Zv * 5.0)
	cl.set_physics_process(false)
	rp.fome = 9999.0
	rp.t = 0.0
	var cacou := false
	for i in 480:
		await get_tree().physics_frame
		if not cl.vivo:
			cacou = true
			break
	_confere(cacou, "raposa: com fome caçou o coelho (%s; o coelho %s)" % [rp.st, "morto" if not cl.vivo else cl.st])
	_limpar_bichos()
	await _quadros(2)
	# o laço de caça: arma na frente; o coelho que passa fica preso; E arma de novo e, armado, recolhe
	_jogador_em(c, c + X * 5.0 + Vector3(0, 0.2, 0))
	await _quadros(3)
	jogador.inv.por("laco", 2)
	_na_mao("laco")
	var n_laco := jogador.inv.conta("laco")
	jogador.cd = 0.0
	jogador.atacar()
	var armou_l := fauna.lacos.size() == 1 and jogador.inv.conta("laco") == n_laco - 1
	var pegou_l := false
	var L0: Dictionary = {}
	if armou_l:
		L0 = fauna.lacos[0]
		var cl2 := _b_teste("coelho", (L0["p"] as Vector3) + Zv * 0.5, L0["p"])
		await _quadros(3)
		fauna._passo_lacos()
		pegou_l = not cl2.vivo and str(L0["pego"]) == "coelho" and not bool(L0["armado"])
	var txt_l := fauna.texto_laco(L0) if armou_l else ""
	if armou_l:
		fauna.usar_laco(L0, jogador)
	var rearmou := armou_l and bool(L0["armado"])
	if armou_l:
		fauna.usar_laco(L0, jogador)
	_confere(armou_l and pegou_l and txt_l.contains("pegou: coelho") and rearmou and fauna.lacos.is_empty() and jogador.inv.conta("laco") == n_laco,
		"laço: armou na frente, o coelho que passou ficou preso (%s); E armou de novo e depois recolheu" % txt_l)
	var nl := jogador.inv.conta("laco")
	if nl > 0:
		jogador.inv.tirar("laco", nl)
	_mao_vazia()
	_limpar_bichos()
	await _quadros(2)
	# perto de uma região os bichos aparecem (longe de você e fora da vista); longe de todas, somem
	_jogador_em(Vector3(-72, 0, 30), Vector3(-72, 1.5, 60))
	await _quadros(5)
	fauna._t = 0.0
	fauna.passo(0.1)
	var vistos := 0
	var longe_ok := true
	for b in fauna.bichos:
		if is_instance_valid(b) and b.vivo:
			vistos += 1
			if Vector2(b.global_position.x - jogador.global_position.x, b.global_position.z - jogador.global_position.z).length() < 29.0:
				longe_ok = false
	var tipos_v := {}
	for b in fauna.bichos:
		tipos_v[b.tipo] = true
	_confere(vistos >= 4 and longe_ok, "bichos: perto dos pastos apareceram %d (%s), todos a mais de 30 m de você" % [vistos, ", ".join(PackedStringArray(tipos_v.keys()))])
	_jogador_em(Vector3(150, 0, -250), Vector3(150, 1.5, -260))
	await _quadros(3)
	fauna._t = 0.0
	fauna.passo(0.1)
	var sobraram := 0
	for b in fauna.bichos:
		if is_instance_valid(b) and Vector2(b.global_position.x + 72.0, b.global_position.z - 60.0).length() < 120.0:
			sobraram += 1
	_confere(sobraram == 0, "bichos: longe de todo mundo eles voltam para a população (%d ficaram)" % sobraram)
	# o jogo salvo guarda a população
	var sv := fauna.salvar()
	fauna.pop["pastos"]["vaca"]["n"] = 1
	fauna.carregar(sv)
	_confere(int(fauna.pop["pastos"]["vaca"]["n"]) == 5 and int(fauna.pop["clareira"]["cervo"]["n"]) == n_antes - 1,
		"jogo salvo: a população dos bichos volta como estava (o cervo caçado continua faltando)")
	fauna.pop["clareira"]["cervo"]["n"] = n_antes
	_limpar_bichos()
	_devolver_clareira(clareira)
	hora = hora_antes
	jogador.vida = 100.0
	spawn_t = spawn_antes


## o tempo, as estações e a lua (etapa 6b): as estações de 7 dias, as fases da lua e o eclipse, o sorteio do tempo (o 1º dia
## limpo), a hora do tempo que vira às 6h, a neblina que fecha a vista, a chuva que molha, a tempestade que abafa o barulho e
## o raio que põe fogo na árvore, a temperatura (frio no inverno à noite, calor no verão à tarde), o frio que segura a energia,
## a cor das copas no outono, o tempo para quem entrou na partida, o relógio e o jogo salvo
func _teste_clima(livre: Vector3) -> void:
	var hora_antes := hora
	var dia_antes := dia
	var salvo := clima.salvar()
	_confere(clima.estacao_idx(1) == 0 and clima.estacao_idx(7) == 0 and clima.estacao_idx(8) == 1 and clima.estacao_idx(15) == 2
		and clima.estacao_idx(22) == 3 and clima.estacao_idx(29) == 0,
		"estações: primavera (dias 1 a 7), verão, outono, inverno e a primavera de novo no dia 29")
	_confere(clima.lua_fase(3) == 4 and absf(clima.lua_ilum(3) - 1.0) < 0.01 and clima.lua_ilum(7) < 0.01 and clima.eclipse_dia(7)
		and clima.eclipse_dia(20) and not clima.eclipse_dia(8),
		"lua: cheia no dia 3 (clareia a noite), nova no dia 7; eclipse do sol nos dias 7 e 20")
	var s1 := clima.sortear(1)
	var tipos := {}
	for i in 80:
		clima.periodo = {}
		for sg in clima.sortear(2 + i % 27):
			tipos[str(sg[2])] = true
	clima.periodo = {}
	_confere(s1.size() == 1 and str(s1[0][2]) == "nublado" and tipos.size() >= 7,
		"tempo: o 1º dia é limpo; nos outros sai de tudo (%s)" % ", ".join(PackedStringArray(tipos.keys())))
	dia = 5
	clima.segs = [[6.0, 9.6, "neblina"], [20.0, 30.0, "frio"]]
	clima.dia_c = 5
	hora = 7.0
	var a1 := clima.tipo_agora()
	hora = 3.0
	dia = 6
	var dt6 := clima.dia_tempo()
	var a2 := clima.tipo_agora()
	hora = 12.0
	dia = 5
	var a3 := clima.tipo_agora()
	_confere(a1 == "neblina" and a2 == "frio" and dt6 == 5 and a3 == "limpo",
		"tempo: a neblina de manhã, a frente fria de madrugada (ainda do dia de ontem), limpo à tarde")
	# a neblina fecha a vista (você, os zumbis e os bichos)
	clima.atual = "neblina"
	clima.antes = "neblina"
	clima.k = 1.0
	_ciclo()
	var dens_neb := amb.fog_density
	var vis_neb := clima.visao()
	clima.atual = "limpo"
	clima.antes = "limpo"
	_ciclo()
	var dens_limpo := amb.fog_density
	_confere(dens_neb > dens_limpo * 2.5 and vis_neb < 0.6,
		"neblina: a vista fecha (neblina %.4f contra %.4f) e eles enxergam a metade (%.0f%%)" % [dens_neb, dens_limpo, vis_neb * 100.0])
	# a chuva molha quem está no aberto
	var c := _lugar_plano(Vector2(-35, 45), 30.0, Vector2(livre.x, livre.z))
	var clareira := _clareira_teste(c, 14.0)
	_jogador_em(c, c + Vector3(0, 1.5, -10))
	await _quadros(3)
	clima.atual = "chuva"
	clima.antes = "chuva"
	clima.k = 1.0
	clima.chuva_k = 0.72
	clima.molhado = 0.0
	for i in 60:
		clima._passo_molhado(0.5)
	clima._passo_chuva()
	var molh := clima.molhado
	var gotas := clima._chuva.emitting
	_confere(molh > 0.2 and gotas and not clima.abrigado(), "chuva: no aberto você fica molhado (%.0f%%) e as gotas caem em volta" % (molh * 100.0))
	# a tempestade abafa o barulho; o raio cai numa árvore alta perto e ela pega fogo
	clima.atual = "tempestade"
	clima.antes = "tempestade"
	var ruido_t := clima.ruido()
	var fogos := projeteis.chamas.size()
	var pr := clima.raio()
	var dr := Vector2(pr.x - c.x, pr.z - c.z).length() if pr != Vector3.INF else -1.0
	_confere(absf(ruido_t - 0.7) < 0.01 and pr != Vector3.INF and projeteis.chamas.size() == fogos + 1 and dr >= 17.0 and dr <= 86.0,
		"tempestade: o barulho fica abafado (%.0f%%) e o raio caiu numa árvore a %.0f m (pegou fogo)" % [ruido_t * 100.0, dr])
	projeteis.limpar()
	clima.chuva_k = 0.0
	clima.molhado = 0.0
	clima._passo_chuva()
	# a temperatura: inverno de madrugada faz frio de verdade; verão à tarde faz calor e a sede aperta
	clima.atual = "limpo"
	clima.antes = "limpo"
	dia = 23
	hora = 2.0
	var t_inv := clima.temperatura()
	var frio_inv := clima.com_frio()
	jogador.energia = 100.0
	clima._frio_t = 0.0
	await _quadros(150)
	var en_frio := jogador.energia
	dia = 8
	hora = 14.0
	var t_ver := clima.temperatura()
	var sede_ver := clima.sede()
	clima._frio_t = 0.0
	_confere(t_inv < 6.0 and frio_inv and en_frio < 85.0 and t_ver > 30.0 and sede_ver > 1.15,
		"temperatura: inverno de madrugada %d °C (com frio, a energia não enche: %.0f); verão à tarde %d °C (a sede aperta %.0f%% mais)" % [
			roundi(t_inv), en_frio, roundi(t_ver), (sede_ver - 1.0) * 100.0])
	jogador.energia = 100.0
	# as copas: no outono amarelo e laranja
	dia = 15
	hora = 12.0
	_ciclo()
	var copa_out: Color = mundo._copa_cor
	dia = 2
	_ciclo()
	_confere(copa_out.r > 1.3 and copa_out.b < 0.7 and mundo.mats_folha.size() > 0, "outono: as copas ficam amarelas e laranja (%d materiais de folha)" % mundo.mats_folha.size())
	# quem entrou recebe o tempo de quem abriu; o relógio mostra a temperatura e o tempo
	clima.rede(Clima.TIPOS.find("chuva"), 1.0, 9)
	var rede_ok := clima.atual == "chuva"
	ui.hud._relogio()
	var rel: String = ui.hud.dia_hora.text
	_confere(rede_ok and rel.contains("°C") and ui.hud.dia_clima.visible and ui.hud.dia_clima.text.contains("Chuva"),
		"relógio: a temperatura e o tempo (%s %s); o tempo de quem abriu chega para quem entrou" % [rel, ui.hud.dia_clima.text])
	# o jogo salvo guarda o tempo do dia
	var sv := clima.salvar()
	clima.carregar({})
	var zerou := clima.atual == "limpo"
	clima.carregar(sv)
	_confere(zerou and clima.atual == "chuva" and clima.segs.size() == sv["segs"].size(), "jogo salvo: o tempo do dia volta como estava (%s)" % clima.atual)
	clima.carregar(salvo)
	clima.chuva_k = 0.0
	clima._passo_chuva()
	_devolver_clareira(clareira)
	dia = dia_antes
	hora = hora_antes
	_ciclo()
	jogador.energia = 100.0


## o sono (etapa 6c): cai acordado, com sono a energia enche devagar, exausto anda devagar e cochila de pé; o saco de dormir
## (E): descansado e de dia não dá, de noite dorme com o relógio correndo e acorda descansado; dano e zumbi perto acordam; o
## café espanta o sono; o HUD com a temperatura e o sono; o jogo salvo
func _teste_sono(livre: Vector3) -> void:
	var hora_antes := hora
	var spawn_antes := spawn_t
	spawn_t = 9999.0
	_limpar_zumbis()
	var c := _lugar_plano(Vector2(-35, 45), 30.0, Vector2(livre.x, livre.z))
	_jogador_em(c, c + Vector3(0, 1.5, -10))
	await _quadros(3)
	jogador.sono = 50.0
	sono.passo(10.0)
	var caiu := 50.0 - jogador.sono
	jogador.sono = 20.0
	var rg := sono.regen()
	jogador.sono = 10.0
	var vl := sono.vel()
	sono._micro_t = 0.0
	sono.passo(0.016)
	var cochilou := sono._apagao > 0.0
	_confere(absf(caiu - 0.68) < 0.05 and rg < 0.9 and vl < 1.0 and cochilou,
		"sono: cai acordado (%.2f em 10 s); com sono a energia enche a %.0f%%; exausto anda mais devagar e cochilou de pé" % [caiu, rg * 100.0])
	sono._apagao = 0.0
	# o saco de dormir: E nele; descansado e de dia não dá
	jogador.sono = 95.0
	hora = 12.0
	var ps := c + Vector3(1.6, 0, 0)
	ps.y = terreno.h(ps.x, ps.z)
	construcao._saco_no(ps, 0.0)
	_olhar(ps + Vector3(0, 0.1, 0))
	await _quadros(3)
	var txt := texto_mira()
	jogador.usar()
	var nao_dia := sono.dormindo.is_empty()
	# de noite dorme: o relógio corre e ele acorda descansado
	hora = 22.0
	jogador.sono = 40.0
	jogador.vida = 80.0
	await _quadros(60)
	jogador.usar()
	var dormiu := not sono.dormindo.is_empty() and jogador.preso
	var turbo := sono.turbo()
	if dormiu:
		sono.dormindo["fim"] = sono._minutos() + 40.0
	var h0 := hora
	for i in 300:
		await get_tree().physics_frame
		if sono.dormindo.is_empty():
			break
	_confere(txt == "E  Dormir no saco de dormir" and nao_dia and dormiu and turbo > 5.0 and sono.dormindo.is_empty() and not jogador.preso
		and jogador.sono > 40.0 and jogador.vida > 80.0,
		"saco de dormir: de dia descansado não dá; de noite dormiu com o relógio %.0fx mais rápido (%.1fh em pouco tempo) e acordou descansado (sono %.0f, vida %.0f)" % [
			turbo, fposmod(hora - h0, 24.0), jogador.sono, jogador.vida])
	# o dano acorda; o zumbi chegando perto acorda
	hora = 23.0
	await _quadros(60)
	sono.dormir({"saco": true})
	await _quadros(5)
	jogador.ferir(3.0, false)
	await _quadros(3)
	var acordou_dano := sono.dormindo.is_empty()
	await _quadros(60)
	sono.dormir({"saco": true})
	await _quadros(5)
	var z := _z_teste(c + Vector3(0, 0, 5.0), "walker", c)
	await _quadros(5)
	var acordou_z := sono.dormindo.is_empty()
	_limpar_zumbis()
	_confere(acordou_dano and acordou_z, "dormindo: o dano te acorda (%s) e o zumbi chegando perto também (%s)" % [acordou_dano, acordou_z])
	sono.acordar("__manual")
	jogador.preso = false
	# o café espanta o sono
	jogador.sono = 30.0
	jogador.inv.por("cafe", 1)
	_na_mao("cafe")
	jogador.cd = 0.0
	jogador.atacar()
	_confere(jogador.sono > 45.0, "café: espantou o sono (%.0f)" % jogador.sono)
	_mao_vazia()
	# o HUD: sede, fome, temperatura | sono, vida
	_confere(ui.hud.vitais.custom_minimum_size.x > 200.0, "HUD: a temperatura e o sono junto da sede, da fome e da vida")
	var sv := sono.salvar()
	jogador.sono = 5.0
	sono.carregar(sv)
	_confere(jogador.sono > 40.0 and absf(jogador.sono - float(sv["sono"])) < 0.2, "jogo salvo: o sono volta como estava (%.0f)" % jogador.sono)
	jogador.sono = 100.0
	jogador.vida = 100.0
	hora = hora_antes
	spawn_t = spawn_antes


## a pesca (etapa 6d): com a vara na mão, na beira do Rio Claro, E joga a linha; quando morde, E puxa o peixe (a espécie do
## rio, com peso; ou lixo); esperando demais ele escapa; saindo do lugar a linha volta; o jogo guarda as espécies pescadas
func _teste_pesca() -> void:
	var hora_antes := hora
	hora = 10.0
	var centro := Vector2(16, -45)
	var pm := Vector3.INF
	var pa := Vector3.INF
	for r in range(2, 60):
		for a8 in 24:
			var a := a8 / 24.0 * TAU
			var q := centro + Vector2(cos(a), sin(a)) * r * 0.5
			if terreno.tipo_agua(q.x, q.y) != 0 or not terreno.dentro(q.x, q.y):
				continue
			var dirc := (centro - q).normalized()
			var w := q + dirc * 3.5
			var n: float = terreno.nivel_agua(w.x, w.y)
			if n < -900.0 or n - terreno.h(w.x, w.y) < 0.3 or absf(n - terreno.h(q.x, q.y)) > 1.5:
				continue
			pm = Vector3(q.x, terreno.h(q.x, q.y), q.y)
			pa = Vector3(w.x, n, w.y)
			break
		if pm != Vector3.INF:
			break
	_confere(pm != Vector3.INF, "pesca: achou a beira do Rio Claro para pescar")
	if pm == Vector3.INF:
		return
	_jogador_em(pm, pa)
	jogador.inv.por("vara", 1)
	_na_mao("vara")
	await _quadros(4)
	_olhar(pa)
	await _quadros(2)
	var txt := texto_mira()
	var n_peixe := jogador.inv.conta("peixeCru")
	var lixo := 0
	var peixes := 0
	var mordeu_ok := true
	for tentativa in 12:
		jogador.usar()
		if not pesca.ativa():
			mordeu_ok = false
			break
		pesca.P["morde"] = 0.1
		await _quadros(20)
		if not bool(pesca.P.get("mordeu", false)) or not pesca.texto().begins_with("E  Puxar o peixe!"):
			mordeu_ok = false
		var antes_l := jogador.inv.conta("sucata") + jogador.inv.conta("garrafa")
		jogador.usar()
		if jogador.inv.conta("sucata") + jogador.inv.conta("garrafa") > antes_l:
			lixo += 1
		else:
			peixes += 1
		await _quadros(2)
		if peixes >= 2:
			break
	var ganhou := jogador.inv.conta("peixeCru") - n_peixe
	var esp := PackedStringArray()
	for k in pesca.registro:
		esp.append(str(pesca.PEIXES[k]["nome"]))
	_confere(txt.begins_with("E  Pescar") and mordeu_ok and peixes >= 1 and ganhou >= peixes and pesca.local(pa.x, pa.z) == "rio" and not esp.is_empty(),
		"pesca: E joga a linha, a boia afunda quando morde e E puxa: %d peixes (%d peixes crus: %s) e %d vez%s lixo" % [
			peixes, ganhou, ", ".join(esp), lixo, "" if lixo == 1 else "es"])
	# esperando demais o peixe escapa; saindo do lugar a linha volta
	jogador.usar()
	pesca.P["morde"] = 0.05
	await _quadros(150)
	var escapou := not pesca.ativa()
	jogador.usar()
	var lancou := pesca.ativa()
	_por_em(pm + Vector3(3.0, 0.2, 0))
	await _quadros(3)
	_confere(escapou and lancou and not pesca.ativa(), "pesca: demorou e o peixe escapou; saindo do lugar a linha volta")
	var sv := pesca.salvar()
	pesca.carregar({})
	var vazio := pesca.registro.is_empty()
	pesca.carregar(sv)
	_confere(vazio and pesca.registro.size() == (sv["registro"] as Dictionary).size(), "jogo salvo: as espécies pescadas ficam guardadas")
	for id in ["vara", "peixeCru", "sucata", "garrafa"]:
		var n := jogador.inv.conta(id) - (n_peixe if id == "peixeCru" else 0)
		if n > 0:
			jogador.inv.tirar(id, n)
	_mao_vazia()
	hora = hora_antes


## os ferimentos (etapa 6f): o sangramento (o leve para sozinho, o forte só com bandagem), a perna quebrada na queda alta
## (devagar, sem correr nem pular; a tala; sara), o vírus no golpe do zumbi (sobe, tira vida máxima, a seringa cura e
## protege), a ferida grave do golpe forte de bicho (a sutura fecha), o HUD, o jogo salvo e quem morre do vírus levanta
func _teste_lesoes(livre: Vector3) -> void:
	var spawn_antes := spawn_t
	spawn_t = 9999.0
	_limpar_zumbis()
	_limpar_bichos()
	var hora_antes := hora
	hora = 12.0
	lesoes.zerar()
	var c := _lugar_plano(Vector2(-35, 45), 30.0, Vector2(livre.x, livre.z))
	_jogador_em(c, c + Vector3(10, 1, 0))
	await _quadros(3)
	# o sangramento leve: a vida cai e para sozinho; o forte não para, a bandagem para
	jogador.vida = 100.0
	lesoes.sangrar(false, "lobo")
	await _quadros(60)
	var caiu := jogador.vida < 99.6
	lesoes.sangra_t = Lesoes.LEVE_DUR + 1.0
	await _quadros(3)
	var parou := lesoes.sangra == 0
	lesoes.sangrar(true)
	lesoes.sangra_t = 120.0
	await _quadros(3)
	var forte_continua := lesoes.sangra == 2
	ui.hud._chips()
	var chip_s := str(ui.hud.chips.get_meta("chave", ""))
	jogador.inv.por("bandagem", 1)
	var n_band := jogador.inv.conta("bandagem")
	jogador.consumir_slot(_slot_de("bandagem"))
	_confere(caiu and parou and forte_continua and chip_s.contains("Sangrando") and lesoes.sangra == 0 and jogador.inv.conta("bandagem") == n_band - 1,
		"sangramento: a vida cai (%s), o leve para sozinho (%s), o forte continua (%s; o HUD mostra: %s) e a bandagem para (%d)" % [
			caiu, parou, forte_continua, chip_s.contains("Sangrando"), lesoes.sangra])
	# a perna quebrada: a queda alta quebra; devagar, sem correr nem pular; a tala; sara
	jogador.vida = 100.0
	lesoes.queda(6.0)
	var quebrou := lesoes.perna and not lesoes.pode_correr() and not lesoes.pode_pular() and absf(lesoes.vel() - Lesoes.PERNA_VEL) < 0.01
	jogador.inv.por("tala", 2)
	jogador.consumir_slot(_slot_de("tala"))
	var com_tala := lesoes.tala and lesoes.pode_pular() and not lesoes.pode_correr() and absf(lesoes.vel() - Lesoes.TALA_VEL) < 0.01
	var n_tala := jogador.inv.conta("tala")
	jogador.consumir_slot(_slot_de("tala"))
	var nao_gastou := jogador.inv.conta("tala") == n_tala
	lesoes.perna_h = Lesoes.CURA_PERNA_H - 0.01
	hora = 12.0
	await _quadros(90)
	_confere(quebrou and com_tala and nao_gastou and not lesoes.perna,
		"perna quebrada: a queda alta quebrou (devagar, sem correr nem pular); a tala imobilizou (a segunda não foi gasta); sarou")
	var nt := jogador.inv.conta("tala")
	if nt > 0:
		jogador.inv.tirar("tala", nt)
	# o vírus: o golpe do zumbi passa; sobe e tira vida máxima; a seringa cura e protege
	var pegou := false
	for i in 200:
		if lesoes.mordida("walker"):
			pegou = true
			break
	lesoes.virus = 60.0
	await _quadros(3)
	var vm := jogador.vida_max()
	ui.hud._chips()
	var chip_v := str(ui.hud.chips.get_meta("chave", ""))
	jogador.inv.por("seringa", 1)
	jogador.consumir_slot(_slot_de("seringa"))
	var curou := lesoes.virus == 0.0 and lesoes.imune_h > 1.9
	var protegido := not lesoes.mordida("walker")
	_confere(pegou and absf(vm - 75.0) < 0.5 and chip_v.contains("Vírus 60%") and curou and protegido,
		"vírus: o golpe do zumbi passou; com 60%% a vida máxima caiu para %.0f (o HUD mostra); a seringa curou e protege" % vm)
	lesoes.imune_h = 0.0
	# a ferida grave: o golpe forte de bicho rasga; a sutura fecha
	lesoes.golpe_bicho("urso", {"sangra": 0.0}, 30.0)
	var rasgou := lesoes.ferida and absf(jogador.vida_max() - 80.0) < 0.5
	jogador.inv.por("sutura", 1)
	jogador.consumir_slot(_slot_de("sutura"))
	_confere(rasgou and not lesoes.ferida and jogador.vida_max() == 100.0, "ferida grave: o golpe forte do bicho baixou a vida máxima (80) e a sutura fechou")
	# o jogo salvo
	lesoes.sangra = 1
	lesoes.perna = true
	lesoes.tala = true
	lesoes.virus = 33.0
	var sv := lesoes.salvar()
	lesoes.zerar()
	lesoes.carregar(sv)
	_confere(lesoes.sangra == 1 and lesoes.perna and lesoes.tala and absf(lesoes.virus - 33.0) < 0.1, "jogo salvo: os ferimentos voltam como estavam")
	# quem morre do vírus levanta como zumbi perto de onde caiu
	lesoes.zerar()
	lesoes.virus = 99.99
	var pm := jogador.global_position
	await _quadros(120)
	var morreu_v := not jogador.vivo
	await get_tree().create_timer(2.2).timeout
	var levantou := false
	for z in zumbis:
		if is_instance_valid(z) and z.global_position.distance_to(pm) < 3.0:
			levantou = true
	_confere(morreu_v and levantou, "vírus: em 100% você morre e o corpo levanta como zumbi perto de onde caiu")
	renascer(false)
	await _quadros(5)
	_limpar_zumbis()
	lesoes.zerar()
	hora = hora_antes
	jogador.vida = 100.0
	spawn_t = spawn_antes


## o plantio e o pomar (etapa 6g): os canteiros da fazenda e dos sítios, plantar com semente (o toque troca a cultura),
## crescer com o tempo (a chuva ajuda, o inverno atrasa), colher (volta semente), as árvores de fruta e o jogo salvo
func _teste_plantio() -> void:
	var hora_antes := hora
	var dia_antes := dia
	hora = 12.0
	dia = 2
	plantio.novo()
	var n_faz := 0
	var n_sit_pronto := 0
	for d in plantio.DEF:
		if d["tipo"] == "fazenda" and float(plantio.S[d["id"]]) < 0.0:
			n_faz += 1
		if d["tipo"] == "sitio" and float(plantio.S[d["id"]]) >= 1.0:
			n_sit_pronto += 1
	_confere(plantio.DEF.size() >= 30 and plantio.FR.size() >= 20 and n_faz >= 10 and n_sit_pronto >= 5,
		"plantio: %d canteiros (%d da fazenda vazios, %d dos sítios prontos para colher) e %d árvores de fruta" % [plantio.DEF.size(), n_faz, n_sit_pronto, plantio.FR.size()])
	# um canteiro vazio da fazenda: sem semente não planta; o toque troca a cultura; segurar planta
	var dc: Dictionary = {}
	for d in plantio.DEF:
		if d["tipo"] == "fazenda":
			dc = d
			break
	var a2: Vector2 = dc["a"]
	var b2: Vector2 = dc["b"]
	var meio := (a2 + b2) * 0.5
	var perp := Vector2(-(b2 - a2).y, (b2 - a2).x).normalized()
	var pj := Vector3(meio.x + perp.x * 1.1, 0, meio.y + perp.y * 1.1)
	var ns := jogador.inv.conta("sementes")
	if ns > 0:
		jogador.inv.tirar("sementes", ns)
	_jogador_em(pj, Vector3(meio.x, float(dc["y"]) + 0.2, meio.y))
	await _quadros(3)
	var ap := plantio.alvo(jogador)
	var t_sem := plantio.texto(jogador)
	jogador.inv.por("sementes", 3)
	var t_com := plantio.texto(jogador)
	plantio.sel = 0
	plantio.toque(ap, jogador)
	var trocou := plantio.sel == 1
	plantio.concluir(ap, jogador)
	var id := str(dc["id"])
	var plantou := float(plantio.S[id]) == 0.0 and int(plantio.C[id]) == 1 and jogador.inv.conta("sementes") == 2
	_confere(str(ap.get("id", "")) == id and t_sem.begins_with("Canteiro vazio") and t_com.begins_with("E  Plantar milho") and trocou and plantou,
		"canteiro: sem semente não planta (%s); com sementes (%s) o toque trocou para batata e segurar plantou" % [t_sem, t_com])
	# cresce: a chuva acelera, o inverno atrasa; o pé aparece; pronto, colhe (e volta semente)
	clima.chuva_k = 0.0
	var r_sol := plantio.ritmo()
	clima.chuva_k = 0.9
	var r_chuva := plantio.ritmo()
	clima.chuva_k = 0.0
	dia = 23
	var r_inv := plantio.ritmo()
	dia = 2
	plantio.S[id] = 0.6
	plantio._atualizar_tudo()
	var no: MeshInstance3D = plantio._nos.get(id)
	var pe_ok: bool = no != null and no.visible and no.mesh == plantio._malhas["batata"]
	var t_cresce := plantio.texto(jogador)
	plantio.S[id] = 0.9999
	await _quadros(60)
	var pronto := float(plantio.S[id]) >= 1.0
	var t_colhe := plantio.texto(jogador)
	var antes_b := jogador.inv.conta("batata")
	plantio.concluir(plantio.alvo(jogador), jogador)
	var colheu := jogador.inv.conta("batata") > antes_b and float(plantio.S[id]) < 0.0
	_confere(absf(r_chuva / r_sol - 1.8) < 0.01 and r_inv < r_sol * 0.5 and pe_ok and t_cresce.begins_with("Batata crescendo · 60%") and pronto
		and t_colhe.begins_with("E  Colher batata") and colheu,
		"canteiro: a chuva acelera (x%.1f), o inverno atrasa (x%.2f); o pé de batata aparece (%s); pronto, colheu %d batata(s)" % [
			r_chuva / r_sol, r_inv / r_sol, t_cresce, jogador.inv.conta("batata") - antes_b])
	# a árvore de fruta: colhe, as frutas somem e voltam com o tempo
	var fr: Dictionary = plantio.FR[0]
	var fp: Vector3 = fr["p"]
	_jogador_em(fp + Vector3(1.4, 0, 0), fp + Vector3(0, 1.2, 0))
	await _quadros(3)
	var t_fr := plantio.texto(jogador)
	var fruta := str(fr["fruta"])
	var antes_f := jogador.inv.conta(fruta)
	plantio.concluir(plantio.alvo(jogador), jogador)
	var ganhou_f := jogador.inv.conta(fruta) - antes_f
	var sumiu: bool = not (plantio._frutas[fr["id"]] as Node3D).visible
	var t_sem_f := plantio.texto(jogador)
	_confere(t_fr.begins_with("E  Colher") and ganhou_f >= 2 and sumiu and t_sem_f.contains("sem fruta"),
		"pomar: colheu %d %s (%s); as frutas sumiram da árvore e voltam (%s)" % [ganhou_f, Dados.nome(fruta).to_lower(), t_fr, t_sem_f])
	# o jogo salvo
	plantio.S[id] = 0.5
	plantio.C[id] = 4
	var sv := plantio.salvar()
	plantio.novo()
	var zerou := float(plantio.S[id]) < 0.0
	plantio.carregar(sv)
	_confere(zerou and absf(float(plantio.S[id]) - 0.5) < 0.01 and int(plantio.C[id]) == 4 and float(plantio.W[fr["id"]]) < 0.5,
		"jogo salvo: a roça e as frutas voltam como estavam")
	for it in ["sementes", "batata", fruta]:
		var n := jogador.inv.conta(it)
		if n > 0:
			jogador.inv.tirar(it, n)
	plantio.novo()
	hora = hora_antes
	dia = dia_antes


## o curtume (etapa 6h): as receitas de curtir na estação de couro, o couro no varal com gordura ou sal, as horas, E na
## estação recolhe (guarda a qualidade), a jaqueta de couro libera, o varal cheio e o jogo salvo
func _teste_curtume(livre: Vector3) -> void:
	var hora_antes := hora
	hora = 10.0
	var c := _lugar_plano(Vector2(-35, 45), 30.0, Vector2(livre.x, livre.z))
	var clareira := _clareira_teste(c, 30.0)
	_jogador_em(c, c + Vector3(0, 1, -6))
	await _quadros(3)
	# o material da estação de couro (6 tábuas, 4 pregos, 2 cordas)
	jogador.inv.por("tabuas", 6)
	jogador.inv.por("pregos", 4)
	jogador.inv.por("corda", 2)
	var ie := await _obra_em("estacaoCouro", c + Vector3(0, 0.3, 0), c + Vector3(0, 0, -3.0))
	_confere(ie >= 0, "curtume: a estação de couro construída")
	var rec := {}
	for r in Dados.RECEITAS:
		if str(r["faz"]) == "couroCurtido" and r.has("varal"):
			rec = r
	for it in ["couro", "gordura", "sal", "couroCurtido", "linha", "pano"]:
		var n := jogador.inv.conta(it)
		if n > 0:
			jogador.inv.tirar(it, n)
	_jogador_em(c, c + Vector3(0, 1, -6))
	jogador.inv.por("couro", 2, {"q": 2})
	jogador.inv.por("gordura", 1)
	jogador.inv.por("sal", 1)
	var m1 := curtume.pendurar(rec, jogador)
	var m2 := curtume.pendurar(rec, jogador)
	var m3 := curtume.pendurar(rec, jogador)
	var rs0 := curtume.resumo(ie) if ie >= 0 else ""
	var n0 := curtume.recolher(ie, jogador) if ie >= 0 else -1
	_confere(ie >= 0 and not rec.is_empty() and m1.contains("no varal") and m2.contains("no varal") and m3 == "Falta material"
		and jogador.inv.conta("gordura") == 0 and jogador.inv.conta("sal") == 0 and rs0.begins_with("varal: 2 de 4") and n0 == 0,
		"curtume: a estação de couro; o couro foi para o varal com gordura e com sal (%s); sem material não vai; antes da hora nada pronto (%s)" % [m1, rs0])
	hora += 4.1
	var rs1 := curtume.resumo(ie) if ie >= 0 else ""
	if ie >= 0:
		construcao.interagir(ie, jogador)
	ui.abrir(false)
	var q_ok := false
	for s in jogador.inv.slots:
		if s != null and str(s["id"]) == "couroCurtido" and int(s.get("q", -1)) == 2:
			q_ok = true
	var camisa := _receita("camisaCouro")
	var liberou := Fabricacao.motivo_trancada(camisa, jogador) == ""
	_confere(rs1.contains("2 prontos") and jogador.inv.conta("couroCurtido") == 2 and q_ok and liberou,
		"curtume: depois de 4 horas de jogo (%s), E na estação recolheu 2 couros curtidos (a qualidade boa ficou); a jaqueta de couro liberou" % rs1)
	# o varal cheio e o jogo salvo
	jogador.inv.por("couro", 5)
	jogador.inv.por("gordura", 5)
	for i in 4:
		curtume.pendurar(rec, jogador)
	var m_cheio := curtume.pendurar(rec, jogador)
	var sv := curtume.salvar()
	curtume.carregar({})
	var zerou := curtume.resumo(ie) == "" if ie >= 0 else false
	curtume.carregar(sv)
	_confere(m_cheio.begins_with("O varal está cheio") and zerou and (curtume.resumo(ie) if ie >= 0 else "").begins_with("varal: 4 de 4"),
		"curtume: o varal cheio não aceita mais (%s); o jogo salvo guarda o que está curtindo" % m_cheio.left(30))
	for it in ["couro", "gordura", "couroCurtido"]:
		var n := jogador.inv.conta(it)
		if n > 0:
			jogador.inv.tirar(it, n)
	curtume.carregar({})
	_devolver_clareira(clareira)
	hora = hora_antes


## a natação (etapa 6i): a água acima do peito vira nado (a cabeça fora d'água), nadar gasta energia (correndo, muito), sem
## energia você se afoga, o zumbi no fundo fundo não alcança quem nada por cima, na água rasa anda devagar, na margem volta a
## andar
func _teste_nado() -> void:
	var hora_antes := hora
	var spawn_antes := spawn_t
	spawn_t = 9999.0
	hora = 12.0
	_limpar_zumbis()
	# um ponto fundo (mais de 2,4 m de água doce), um raso e um seco perto dele
	var fundo := Vector3.INF
	for x in range(-150, 160, 3):
		for z in range(-200, 160, 3):
			var n: float = terreno.nivel_agua(float(x), float(z))
			if n < -900.0 or terreno.tipo_agua(float(x), float(z)) != 1:
				continue
			if n - terreno.h(float(x), float(z)) > 2.4:
				fundo = Vector3(float(x), n, float(z))
				break
		if fundo != Vector3.INF:
			break
	var raso := Vector3.INF
	var seco := Vector3.INF
	if fundo != Vector3.INF:
		for r in range(2, 60):
			for k in 16:
				var a := k / 16.0 * TAU
				var q := fundo + Vector3(cos(a), 0, sin(a)) * float(r)
				var nq: float = terreno.nivel_agua(q.x, q.z)
				var dq: float = nq - terreno.h(q.x, q.z)
				if raso == Vector3.INF and nq > -900.0 and dq > 0.5 and dq < 0.9:
					raso = q
				if seco == Vector3.INF and nq < -900.0 and terreno.dentro(q.x, q.z):
					seco = q
			if raso != Vector3.INF and seco != Vector3.INF:
				break
	_confere(fundo != Vector3.INF and raso != Vector3.INF and seco != Vector3.INF, "natação: achou água funda (%s), rasa e a margem" % str(fundo))
	if fundo == Vector3.INF or raso == Vector3.INF or seco == Vector3.INF:
		spawn_t = spawn_antes
		hora = hora_antes
		return
	# entra na água funda: nada com a cabeça fora d'água
	_jogador_em(fundo, fundo + Vector3(6, 0.5, 0))
	await _quadros(30)
	var nadou := jogador.nadando and absf(jogador.global_position.y - (fundo.y - 1.32)) < 0.15
	var cab: float = jogador.cabeca.global_position.y - fundo.y
	jogador.energia = 100.0
	var p0 := jogador.global_position
	Input.action_press("frente")
	await _quadros(60)
	var e_anda := jogador.energia
	Input.action_press("correr")
	await _quadros(60)
	var e_corre := jogador.energia
	Input.action_release("correr")
	Input.action_release("frente")
	var andou := Vector2(jogador.global_position.x - p0.x, jogador.global_position.z - p0.z).length()
	ui.hud._chips()
	var chip_n := str(ui.hud.chips.get_meta("chave", "")).contains("Nadando")
	_confere(nadou and cab > 0.05 and andou > 1.5 and e_anda < 100.0 and e_anda > 98.0 and e_corre < e_anda - 4.0 and chip_n,
		"natação: na água funda você nada com a cabeça fora d'água (%.2f m acima); nadou %.1f m; a energia cai (%.1f nadando, %.1f correndo); o HUD mostra" % [
			cab, andou, e_anda, e_corre])
	# sem energia: afoga (de volta ao ponto fundo: nadando ele foi para a beira)
	_jogador_em(fundo, fundo + Vector3(6, 0.5, 0))
	await _quadros(30)
	jogador.energia = 0.0
	jogador.vida = 100.0
	await _quadros(60)
	var vida_afogando := jogador.vida
	var afogou := jogador.nadando and jogador.vida < 97.0
	ui.hud._chips()
	var chip_a := str(ui.hud.chips.get_meta("chave", "")).contains("Afogando")
	jogador.energia = 100.0
	jogador.vida = 100.0
	# o zumbi no fundo do lago (o ponto mais fundo em volta, a 1,3 a 2,2 m) não alcança quem nada por cima
	var pj := jogador.global_position
	var pz := Vector3.INF
	var fz := 0.0
	for r in [1.3, 1.7, 2.2]:
		for k in 16:
			var a := k / 16.0 * TAU
			var q := pj + Vector3(cos(a), 0, sin(a)) * float(r)
			var nq: float = terreno.nivel_agua(q.x, q.z)
			var dq: float = nq - terreno.h(q.x, q.z)
			if nq > -900.0 and dq > fz:
				fz = dq
				pz = q
	var nao_alcancou := false
	var vida_z := 100.0
	if pz != Vector3.INF and fz > 1.8:
		var z := _z_teste(pz, "walker", pj, false)
		z.estado = "caca"
		z.visto_em = pj
		await _quadros(150)
		vida_z = jogador.vida
		nao_alcancou = jogador.vida >= 99.9 and is_instance_valid(z) and z.global_position.distance_to(pj) < 4.0
	_limpar_zumbis()
	_confere(afogou and chip_a and nao_alcancou, "natação: sem energia você se afoga (vida %.1f, chip %s); o zumbi no fundo do lago (%.1f m de água) não te alcança (vida %.0f)" % [
		vida_afogando, str(chip_a), fz, vida_z])
	# a água rasa: anda devagar; a margem: volta a andar
	_jogador_em(raso, raso + Vector3(0, 1, -5))
	await _quadros(10)
	var devagar := not jogador.nadando and absf(jogador._vel_agua() - 0.55) < 0.01
	_jogador_em(seco, seco + Vector3(0, 1, -5))
	await _quadros(10)
	_confere(devagar and not jogador.nadando and jogador._vel_agua() == 1.0, "natação: na água rasa anda devagar; na margem volta ao normal")
	jogador.energia = 100.0
	spawn_t = spawn_antes
	hora = hora_antes


## os veículos (etapa 6j): os quatro do jogo antigo perto dos lugares de lá e no estado de lá, a mira, abastecer, entrar,
## acelerar, virar, frear, dar ré, o freio de mão, descer, a oficina (pneu, bateria, óleo, lataria, motor) e o porta-malas, bater
## no muro, atropelar o zumbi, o zumbi batendo na lataria (dentro da caminhonete você leva pouco), a moto (o golpe pega em você),
## o Caramelo na caçamba, os faróis de noite e o jogo salvo
func _teste_veiculos(livre: Vector3) -> void:
	var hora_antes := hora
	var spawn_antes := spawn_t
	spawn_t = 9999.0
	hora = 12.0
	_limpar_zumbis()
	veiculos.novo()
	await _quadros(3)
	var ok_lugar := veiculos.lista.size() == Veiculos.PADRAO.size()
	var dists: Array = []
	for i in veiculos.lista.size():
		var vi: Veiculo = veiculos.lista[i]
		var d0: Array = Veiculos.PADRAO[i]
		var dd := Vector2(vi.global_position.x - float(d0[2]), vi.global_position.z - float(d0[3])).length()
		dists.append("%s %.1f m" % [vi.uid, dd])
		if dd > 10.5 or absf(vi.global_position.y - terreno.h(vi.global_position.x, vi.global_position.z)) > 1.5:
			ok_lugar = false
	var cv := veiculos.por_id("caminhonete")
	var sd := veiculos.por_id("sedanVila")
	var mt := veiculos.por_id("motoCidade")
	var tc := veiculos.por_id("triFazenda")
	_confere(ok_lugar and cv != null and sd != null and mt != null and tc != null and cv.pode() == "Sem combustível"
		and sd.pode().begins_with("Sem bateria") and mt.pode() == "O motor está quebrado" and tc.pode() == "" and sd.furados() == 1,
		"veículos: a caminhonete (sem gasolina), o carro (sem bateria, um pneu furado), a moto (motor quebrado), o triciclo (pronto) e o barco perto dos lugares do jogo antigo (%s)" % ", ".join(PackedStringArray(dists)))
	if cv == null or sd == null or mt == null or tc == null:
		spawn_t = spawn_antes
		hora = hora_antes
		return
	# a pista: um lugar plano e limpo (sem as árvores e pedras em volta)
	var c := _lugar_plano(Vector2(-35, 45), 40.0, Vector2(livre.x, livre.z))
	var clar := _clareira_teste(c, 34.0)
	var Zv := Vector3(0, 0, 1)
	cv.global_position = c - Zv * 16.0
	cv.rotation.y = 0.0
	cv.assentar()
	await _quadros(3)
	# a mira e o galão
	_jogador_em(cv.global_position + Vector3(2.7, 0, 0), cv.global_position + Vector3(0, 1.0, 0))
	await _quadros(3)
	var tm := texto_mira()
	for it in ["gasolina", "kitFerramentas", "pneu", "bateriaVeic", "oleoMotor", "pecaVeiculo"]:
		var n := jogador.inv.conta(it)
		if n > 0:
			jogador.inv.tirar(it, n)
	jogador.inv.por("gasolina", 2)
	var m_ab := cv.fazer("abastecer", jogador)
	_confere(tm.begins_with("Caminhonete: sem combustível") and m_ab.begins_with("Abasteceu") and absf(cv.comb - 50.0) < 0.01 and jogador.inv.conta("gasolina") == 1,
		"veículos: a mira mostra o que falta (%s); o galão enche metade do tanque da caminhonete (%s)" % [tm.left(44), m_ab])
	# o Caramelo seguindo: pula na caçamba
	cao.iniciar()
	cao.ativo = true
	cao.st = "segue"
	cao.modo = "segue"
	cao._no_chao(cv.global_position + Vector3(3.5, 0, -2.0))
	# entra
	var entrou := veiculos.entrar(cv, jogador)
	await _quadros(6)
	var no_assento: bool = jogador.veiculo == cv and jogador.collision_layer == 0 and jogador.cabeca.global_position.distance_to(cv.olho()) < 0.25
	_confere(entrou and no_assento and texto_mira().begins_with("E  Descer da caminhonete") and cao.st == "carro",
		"veículos: E entra (no assento, sem colisão; a mira diz como descer); o Caramelo pulou na caçamba (%s)" % cao.st)
	# acelera para a frente
	var p0 := cv.global_position
	var c0 := cv.comb
	Input.action_press("frente")
	await _quadros(150)
	var v1 := cv.v
	var andou := Vector2(cv.global_position.x - p0.x, cv.global_position.z - p0.z)
	await _quadros(8)
	var painel: bool = ui.hud.veic_painel.visible
	var cacamba: Vector3 = cv.corpo.global_transform * Vector3(-0.42, 1.0, -1.55)
	var cao_junto := cao.global_position.distance_to(cacamba) < 0.4
	# vira para a direita (a frente vai para o lado do -x)
	var y0 := cv.rotation.y
	Input.action_press("direita")
	await _quadros(50)
	Input.action_release("direita")
	Input.action_release("frente")
	var dy := angle_difference(y0, cv.rotation.y)
	var fx := cv.frente().x
	_confere(v1 > 4.0 and andou.length() > 6.0 and absf(andou.normalized().y) > 0.9 and cv.comb < c0 and painel and cao_junto and dy < -0.15 and fx < -0.1,
		"veículos: W acelera (%.1f m/s em 2,5 s, andou %.1f m para a frente), gasta gasolina (%.2f%%), o painel aparece, o Caramelo vai na caçamba; D vira para a direita (%.2f rad)" % [
			v1, andou.length(), c0 - cv.comb, dy])
	# freia e dá ré; o freio de mão para
	Input.action_press("tras")
	await _quadros(50)
	var freou := cv.v
	await _quadros(70)
	var re := cv.v
	Input.action_release("tras")
	Input.action_press("pular")
	await _quadros(110)
	Input.action_release("pular")
	var parou := absf(cv.v) < 0.4
	_confere(freou < 1.0 and re < -0.5 and parou, "veículos: S freia (%.1f m/s) e dá ré (%.1f m/s); o freio de mão para (%.2f m/s)" % [freou, re, cv.v])
	# desce
	await _quadros(5)
	var desceu := veiculos.sair(jogador)
	await _quadros(10)
	var lado := jogador.global_position.distance_to(cv.global_position)
	_confere(desceu and jogador.veiculo == null and jogador.collision_layer == 1 and cv.v == 0.0 and lado < 4.5 and not ui.hud.veic_painel.visible
		and cao.st == "segue" and cao.global_position.distance_to(cv.global_position) < 5.0,
		"veículos: E desce do lado (%.1f m do meio); o veículo fica parado; o Caramelo desce da caçamba e volta a seguir" % lado)
	# bate no muro: a lataria e o motor amassam
	var muro := StaticBody3D.new()
	var ms := CollisionShape3D.new()
	var mb := BoxShape3D.new()
	mb.size = Vector3(8.0, 3.0, 0.8)
	ms.shape = mb
	muro.add_child(ms)
	add_child(muro)
	muro.global_position = Vector3(c.x, terreno.h(c.x, c.z + 17.0) + 1.4, c.z + 17.0)
	cv.global_position = c - Zv * 17.0
	cv.rotation.y = 0.0
	cv.assentar()
	var hp0 := cv.hp
	var mot0 := float(cv.pecas["motor"])
	veiculos.entrar(cv, jogador)
	Input.action_press("frente")
	var bateu_v := 0.0
	for k in 420:
		await get_tree().physics_frame
		if cv.v > bateu_v:
			bateu_v = cv.v
		if cv.v < -0.5:
			break
	Input.action_release("frente")
	var amassou := cv.hp < hp0 and float(cv.pecas["motor"]) < mot0 and cv.v < 0.0
	_confere(amassou and cv.global_position.z < muro.global_position.z, "veículos: bateu no muro a %.1f m/s: a lataria (%.0f%%) e o motor (%.0f%%) amassaram e ele voltou" % [
		bateu_v, cv.hp, float(cv.pecas["motor"])])
	muro.queue_free()
	Input.action_press("pular")
	await _quadros(60)
	Input.action_release("pular")
	# atropela o zumbi parado na frente
	veiculos.sair(jogador)
	await _quadros(3)
	cv.global_position = c - Zv * 15.0
	cv.rotation.y = 0.0
	cv.assentar()
	veiculos.entrar(cv, jogador)
	var z := _z_teste(c + Zv * 2.0, "walker", c - Zv * 15.0)
	await _quadros(2)
	var zv0: float = z.vida
	var hp1 := cv.hp
	Input.action_press("frente")
	for k in 300:
		await get_tree().physics_frame
		if not is_instance_valid(z) or z.estado in ["derrubado", "morto"] or z.vida < zv0:
			break
	Input.action_release("frente")
	var pegou: bool = not is_instance_valid(z) or z.estado in ["derrubado", "morto"] or z.vida < zv0 * 0.7
	_confere(pegou and cv.hp < hp1, "veículos: atropelou o zumbi (%s, vida %.0f de %.0f) e a lataria sentiu (%.1f%%)" % [
		z.estado if is_instance_valid(z) else "sumiu", z.vida if is_instance_valid(z) else 0.0, zv0, hp1 - cv.hp])
	Input.action_press("pular")
	await _quadros(90)
	Input.action_release("pular")
	_limpar_zumbis()
	# o golpe dentro da caminhonete pega na lataria (você leva só um pouco e não pega o vírus)
	jogador.vida = 100.0
	var hp2 := cv.hp
	jogador.ferir(10.0, true, cv.global_position + Vector3(2, 1, 0))
	var levou := 100.0 - jogador.vida
	var mordeu := lesoes.mordida("walker")
	_confere(absf((hp2 - cv.hp) - 7.0) < 0.01 and levou > 0.5 and levou <= 3.01 and not mordeu,
		"veículos: dentro da caminhonete o golpe pega na lataria (%.1f) e você leva %.1f; não morde" % [hp2 - cv.hp, levou])
	# um zumbi de verdade do lado: bate na lataria
	var hp3 := cv.hp
	var zl := _z_teste(cv.global_position + Vector3(2.6, 0, 0.3), "walker", cv.global_position, false)
	zl.estado = "caca"
	zl.visto_em = jogador.global_position
	for k in 360:
		await get_tree().physics_frame
		if cv.hp < hp3:
			break
	_confere(cv.hp < hp3 and jogador.vida > 90.0, "veículos: o zumbi do lado bate na lataria (%.0f%% → %.0f%%) e você quase não sente (vida %.0f)" % [hp3, cv.hp, jogador.vida])
	_limpar_zumbis()
	# os faróis de noite
	hora = 22.0
	await _quadros(4)
	var acesos: bool = (cv.farois[0] as SpotLight3D).visible and cv.mat_farol.emission_energy_multiplier > 1.0
	cv.luz = false
	await _quadros(3)
	var apagados: bool = not (cv.farois[0] as SpotLight3D).visible
	cv.luz = true
	hora = 12.0
	await _quadros(3)
	var de_dia: bool = not (cv.farois[0] as SpotLight3D).visible
	_confere(acesos and apagados and de_dia, "veículos: de noite os faróis acendem (F apaga); de dia ficam apagados")
	veiculos.sair(jogador)
	await _quadros(3)
	# a oficina do carro: pneu, bateria, óleo, lataria e motor (com o kit de ferramentas), e o porta-malas
	_jogador_em(sd.global_position + sd.frente() * 3.6, sd.global_position + Vector3(0, 0.8, 0))
	await _quadros(3)
	for it in [["kitFerramentas", 1], ["pneu", 1], ["bateriaVeic", 1], ["oleoMotor", 1], ["sucata", 3], ["pregos", 2], ["pecaVeiculo", 1]]:
		jogador.inv.por(str(it[0]), int(it[1]))
	var acs: Array = sd.acoes(jogador)
	var prontas := 0
	for a in acs:
		if str(a["id"]) in ["pneu", "bateria", "oleo", "lataria", "motor"] and bool(a["ok"]):
			prontas += 1
	var kit0 := 0.0
	for s in jogador.inv.slots:
		if s != null and str(s["id"]) == "kitFerramentas":
			kit0 = float(s.get("dur", 0.0))
	var msgs: Array = []
	for id in ["pneu", "bateria", "oleo", "lataria", "motor"]:
		msgs.append(sd.fazer(id, jogador))
	var kit1 := 0.0
	for s in jogador.inv.slots:
		if s != null and str(s["id"]) == "kitFerramentas":
			kit1 = float(s.get("dur", 0.0))
	_confere(prontas == 5 and sd.furados() == 0 and bool(sd.pecas["bateria"]) and absf(float(sd.pecas["oleo"]) - 80.0) < 0.01 and absf(sd.hp - 100.0) < 0.01
		and absf(float(sd.pecas["motor"]) - 100.0) < 0.01 and sd.pode() == "Sem combustível" and absf((kit0 - kit1) - 6.0) < 0.01,
		"veículos: na oficina do carro trocou o pneu, pôs a bateria e o óleo, consertou a lataria e o motor (o kit gastou %.0f): %s" % [kit0 - kit1, " · ".join(PackedStringArray(msgs))])
	ui.abrir_veiculo(sd)
	await _quadros(3)
	var tela_ok: bool = ui.aberto and ui.col_veic.visible and ui.veic_botoes.get_child_count() >= 3
	ui._veic_acao("carga")
	await _quadros(2)
	var porta_ok: bool = ui.col_bau.visible and ui.bau_inv == sd.porta and not ui.col_veic.visible
	ui.abrir(false)
	_confere(tela_ok and porta_ok, "veículos: segure E abre a oficina na mochila (o estado e os consertos); o porta-malas abre como um baú")
	# a moto: exposta (o golpe pega em você), deita na curva
	for it in [["kitFerramentas", 1], ["pecaVeiculo", 1], ["gasolina", 1]]:
		jogador.inv.por(str(it[0]), int(it[1]))
	mt.global_position = c + Vector3(6.0, 0, -10.0)
	mt.rotation.y = 0.0
	mt.assentar()
	mt.fazer("motor", jogador)
	mt.fazer("abastecer", jogador)
	var entrou_m := veiculos.entrar(mt, jogador)
	jogador.vida = 100.0
	jogador.ferir(10.0, true, mt.global_position + Vector3(2, 1, 0))
	var levou_m := 100.0 - jogador.vida
	Input.action_press("frente")
	await _quadros(90)
	Input.action_press("direita")
	await _quadros(30)
	var deitou := mt.roll
	Input.action_release("direita")
	Input.action_release("frente")
	Input.action_press("pular")
	await _quadros(120)
	Input.action_release("pular")
	_confere(entrou_m and levou_m > levou * 2.5 and levou_m > 1.0 and deitou > 0.05 and absf(mt.comb - 100.0) < 0.5,
		"veículos: a moto consertada e com o tanque cheio (um galão enche); nela o golpe pega em você (%.1f); deita na curva (%.2f)" % [levou_m, deitou])
	veiculos.sair(jogador)
	await _quadros(3)
	# o jogo salvo
	cv.comb = 33.0
	cv.pecas["oleo"] = 44.0
	cv.porta.por("madeira", 5)
	var pcv := cv.global_position
	var sv := veiculos.salvar()
	veiculos.novo()
	var zerou: bool = absf(veiculos.por_id("caminhonete").comb) < 0.01
	veiculos.carregar(sv)
	var cv2 := veiculos.por_id("caminhonete")
	_confere(zerou and cv2 != null and absf(cv2.comb - 33.0) < 0.01 and absf(float(cv2.pecas["oleo"]) - 44.0) < 0.01 and cv2.porta.conta("madeira") == 5
		and Vector2(cv2.global_position.x - pcv.x, cv2.global_position.z - pcv.z).length() < 0.1,
		"veículos: o jogo salvo guarda onde cada um ficou, o tanque, as peças e o porta-malas")
	for it in ["gasolina", "kitFerramentas", "pneu", "bateriaVeic", "oleoMotor", "pecaVeiculo", "sucata", "pregos"]:
		var n := jogador.inv.conta(it)
		if n > 0:
			jogador.inv.tirar(it, n)
	cao.iniciar()
	veiculos.novo()
	_devolver_clareira(clar)
	spawn_t = spawn_antes
	hora = hora_antes


## o barco e a jangada (etapa 6k): o barco no lago (motor quebrado e sem gasolina), conserta, abastece, sobe, anda na água, vira,
## desce no meio do lago (nadando); a jangada no remo (sem gasolina); pôr a jangada na água de frente para o lago; o jogo salvo
func _teste_barcos() -> void:
	var hora_antes := hora
	var spawn_antes := spawn_t
	spawn_t = 9999.0
	hora = 12.0
	_limpar_zumbis()
	veiculos.novo()
	await _quadros(3)
	var bc := veiculos.por_id("barcoCais")
	if bc == null:
		_confere(false, "barcos: o barco do cais existe")
		spawn_t = spawn_antes
		hora = hora_antes
		return
	var nb: float = terreno.nivel_agua(bc.global_position.x, bc.global_position.z)
	var boia := nb > -900.0 and absf(bc.global_position.y - (nb - 0.22)) < 0.12
	var tm0 := bc.texto()
	for it in [["kitFerramentas", 1], ["pecaVeiculo", 1], ["gasolina", 1]]:
		jogador.inv.por(str(it[0]), int(it[1]))
	var m1 := bc.fazer("motor", jogador)
	var m2 := bc.fazer("abastecer", jogador)
	_confere(boia and tm0.contains("motor está quebrado") and bc.pode() == "" and absf(bc.comb - 50.0) < 0.01,
		"barcos: o barco do cais bóia no lago (%.2f m abaixo da água) com o motor quebrado; consertou (%s) e abasteceu (%s)" % [nb - bc.global_position.y, m1, m2])
	# sobe e anda
	bc.rotation.y = 0.05
	var entrou := veiculos.entrar(bc, jogador)
	await _quadros(4)
	var p0 := bc.global_position
	var c0 := bc.comb
	Input.action_press("frente")
	await _quadros(120)
	var v1 := bc.v
	Input.action_press("esquerda")
	var y0 := bc.rotation.y
	await _quadros(40)
	Input.action_release("esquerda")
	Input.action_release("frente")
	var dy := angle_difference(y0, bc.rotation.y)
	var andou := Vector2(bc.global_position.x - p0.x, bc.global_position.z - p0.z).length()
	var n1: float = terreno.nivel_agua(bc.global_position.x, bc.global_position.z)
	_confere(entrou and jogador.veiculo == bc and v1 > 2.0 and andou > 2.5 and n1 > -900.0 and bc.comb < c0 and dy > 0.1,
		"barcos: subiu no barco e ele anda na água (%.1f m/s, andou %.1f m, gasta gasolina); A vira para a esquerda (%.2f rad)" % [v1, andou, dy])
	# desce no meio do lago: cai na água e nada
	await _quadros(30)
	var desceu := veiculos.sair(jogador)
	await _quadros(40)
	_confere(desceu and jogador.veiculo == null and jogador.nadando, "barcos: desceu no meio do lago e caiu na água (nadando)")
	# a jangada: no remo, sem gasolina
	var jg := veiculos.nova_jangada(Vector3(66.0, 0, 104.0), 0.0)
	await _quadros(3)
	var nj: float = terreno.nivel_agua(66.0, 104.0)
	var ok_j := jg.pode() == "" and absf(jg.global_position.y - (nj - 0.22)) < 0.12 and jg.texto().contains("Subir na jangada")
	veiculos.entrar(jg, jogador)
	var pj := jg.global_position
	Input.action_press("frente")
	await _quadros(150)
	var vj := jg.v
	Input.action_release("frente")
	var andou_j := Vector2(jg.global_position.x - pj.x, jg.global_position.z - pj.z).length()
	_confere(ok_j and jogador.veiculo == jg and vj > 1.0 and vj <= 2.61 and andou_j > 1.5 and jg.comb == 0.0,
		"barcos: a jangada bóia e anda no remo sem gasolina (%.1f m/s, andou %.1f m)" % [vj, andou_j])
	veiculos.sair(jogador)
	await _quadros(5)
	# pôr a jangada na água: na margem, de frente para o lago
	var margem := Vector3.INF
	var lago := Vector3(66.0, 0, 104.0)
	for k in 24:
		var a := k / 24.0 * TAU
		var dr := Vector3(cos(a), 0, sin(a))
		for r in range(4, 60):
			var q := lago + dr * float(r)
			var nq: float = terreno.nivel_agua(q.x, q.z)
			if nq < -900.0 or nq - terreno.h(q.x, q.z) < 0.05:
				var w := q - dr * 3.5
				var nw: float = terreno.nivel_agua(w.x, w.z)
				if nw > -900.0 and nw - terreno.h(w.x, w.z) > 0.7:
					margem = q + dr * 0.8
				break
		if margem != Vector3.INF:
			break
	var antes_n := veiculos.lista.size()
	var pos_ok := false
	if margem != Vector3.INF:
		_jogador_em(margem, Vector3(lago.x, terreno.h(margem.x, margem.z) + 1.4, lago.z))
		await _quadros(3)
		jogador.inv.por("jangada", 1)
		jogador.usar_item(_slot_de("jangada"))
		await _quadros(3)
		pos_ok = veiculos.lista.size() == antes_n + 1 and jogador.inv.conta("jangada") == 0
	_confere(margem != Vector3.INF and pos_ok, "barcos: de frente para o lago, a jangada desmontada vai para a água (%s)" % str(margem))
	# o jogo salvo guarda a jangada
	var sv := veiculos.salvar()
	veiculos.carregar(sv)
	var jangadas := 0
	for v in veiculos.lista:
		if is_instance_valid(v) and (v as Veiculo).tipo == "jangada":
			jangadas += 1
	_confere(jangadas == 2 and veiculos.por_id("barcoCais") != null and absf(veiculos.por_id("barcoCais").comb - bc.comb) < 0.5,
		"barcos: o jogo salvo guarda o barco e as jangadas (%d)" % jangadas)
	for it in ["gasolina", "kitFerramentas", "pecaVeiculo", "jangada"]:
		var n := jogador.inv.conta(it)
		if n > 0:
			jogador.inv.tirar(it, n)
	veiculos.novo()
	_jogador_em(Vector3(SPAWN.x, 0, SPAWN.z), Vector3(SPAWN.x, 1.0, SPAWN.z - 5.0))
	spawn_t = spawn_antes
	hora = hora_antes


## o espaço da mochila com o item (para os testes)
func _slot_de(id: String) -> int:
	for i in jogador.inv.slots.size():
		var s = jogador.inv.slots[i]
		if s != null and str(s["id"]) == id:
			return i
	return 0


## os sons gravados (CC0) do jogo antigo: carregaram e tocam no lugar dos sons por código; o limitador no som geral
func _teste_sons() -> void:
	var mp3 := 0
	for b in Sons.GRAVADOS:
		if sons.bancos.has(b) and (sons.bancos[b] as Array).size() > 0 and (sons.bancos[b][0] is AudioStreamMP3):
			mp3 += 1
	var lim := false
	for i in AudioServer.get_bus_effect_count(0):
		if AudioServer.get_bus_effect(0, i) is AudioEffectHardLimiter:
			lim = true
	sons.tocar("tiro", jogador.global_position)
	sons.tocar("passo_asf", jogador.global_position)
	_confere(sons.gravados >= 110 and mp3 == Sons.GRAVADOS.size() and lim,
		"sons: as gravações de verdade do jogo antigo (%d gravações em %d de %d sons) e o limitador no som geral" % [sons.gravados, mp3, Sons.GRAVADOS.size()])


## o Caramelo (etapa 6e): espera com fome na beira da mata, come e passa a seguir; longe, aparece atrás de você; late e morde
## o zumbi que chega e o zumbi bate nele; machucado volta mancando para a clareira e no amanhecer melhora; E manda ficar e
## chama; os bichos do mato fogem dele; o jogo salvo
func _teste_cao(livre: Vector3) -> void:
	var spawn_antes := spawn_t
	spawn_t = 9999.0
	_limpar_zumbis()
	_limpar_bichos()
	var hora_antes := hora
	hora = 12.0
	# a comida que sobrou dos outros testes sai da mochila (ele precisa de comida para vir)
	var tirar_comida := func():
		for s in jogador.inv.slots.duplicate():
			if s != null and str(Dados.item(str(s["id"])).get("tipo", "")) == "comida":
				jogador.inv.tirar(str(s["id"]), jogador.inv.conta(str(s["id"])))
	tirar_comida.call()
	cao.iniciar()
	await _quadros(5)
	var pe: Vector3 = cao.global_position
	var espera_ok := cao.st == "espera" and not cao.ativo and Vector2(pe.x - Cao.ESPERA.x, pe.z - Cao.ESPERA.z).length() < 1.5
	_jogador_em(Cao.ESPERA + Vector3(0, 0, 1.8), Cao.ESPERA + Vector3(0, 0.3, 0))
	await _quadros(3)
	var mira_ok := cao.na_mira(jogador)
	var txt0 := texto_mira()
	jogador.usar()
	var sem := not cao.ativo
	jogador.inv.por("frutas", 2)
	var txt1 := texto_mira()
	jogador.usar()
	var comeu := cao.ativo and cao.st == "segue" and jogador.inv.conta("frutas") == 1
	_confere(espera_ok and mira_ok and sem and comeu and txt0.begins_with("Cachorro com fome") and txt1.begins_with("E  Dar comida"),
		"Caramelo: esperando com fome na beira da mata (%s); sem comida não vem; com as frutas (%s) comeu e passou a te seguir" % [txt0, txt1])
	tirar_comida.call()
	# longe, ele aparece atrás de você; andando, ele vem junto
	var c := _lugar_plano(Vector2(-35, 45), 30.0, Vector2(livre.x, livre.z))
	var clareira := _clareira_teste(c, 60.0)
	var X := Vector3(1, 0, 0)
	_jogador_em(c, c + X * 10.0 + Vector3(0, 1.0, 0))
	await _quadros(40)
	var d1 := Vector2(cao.global_position.x - c.x, cao.global_position.z - c.z).length()
	_jogador_em(c + X * 12.0, c + X * 24.0 + Vector3(0, 1.0, 0))
	await _quadros(200)
	var jp := jogador.global_position
	var d2 := Vector2(cao.global_position.x - jp.x, cao.global_position.z - jp.z).length()
	_confere(d1 < 12.0 and d2 < 4.0, "Caramelo: estava longe e apareceu atrás de você (a %.0f m); você foi 12 m para a frente e ele veio junto (a %.1f m)" % [d1, d2])
	# o zumbi chega: ele late, parte para cima e morde; o zumbi bate nele
	var z := _z_teste(jp + X * 7.0 + Vector3(0, 0, 1.5), "walker", jp, false)
	z.estado = "caca"
	z.visto_em = jp
	var tz := 0
	var brigou := false
	while tz < 600 and is_instance_valid(z) and z.estado != "morto" and (cao.mordidas == 0 or cao.hp >= Cao.HP_MAX):
		await get_tree().physics_frame
		tz += 1
		jogador.vida = 100.0
		if cao.st == "ataca":
			brigou = true
	var vida_z: float = z.vida if is_instance_valid(z) else 0.0
	_confere(brigou and cao.mordidas > 0 and cao.hp < Cao.HP_MAX,
		"Caramelo: partiu para cima do zumbi e mordeu (%d mordidas, o zumbi com %.0f de vida); o zumbi bateu nele (vida dele %.0f de %.0f)" % [
			cao.mordidas, vida_z, cao.hp, Cao.HP_MAX])
	_limpar_zumbis()
	await _quadros(3)
	# machucado feio: volta mancando para a clareira, descansa e no amanhecer melhora
	cao.st = "segue"
	cao.medo_t = 0.0
	cao.ferir(999.0)
	var ferido := cao.st == "ferido"
	cao._no_chao(Cao.CLAREIRA + Vector3(1.5, 0, 0))
	var tf := 0
	while tf < 600 and cao.st != "descansa":
		await get_tree().physics_frame
		tf += 1
	var descansou := cao.st == "descansa"
	var txt_d := ""
	_jogador_em(cao.global_position + Vector3(0, 0, -1.8), cao.global_position + Vector3(0, 0.3, 0))
	await _quadros(3)
	txt_d = texto_mira()
	hora = 5.9
	await _quadros(3)
	hora = 6.1
	await _quadros(3)
	_confere(ferido and descansou and cao.st == "fica" and cao.hp >= Cao.HP_MAX and txt_d.begins_with("O Caramelo está se recuperando"),
		"Caramelo: machucado feio foi mancando para a clareira e deitou (%s); no amanhecer melhorou e ficou te esperando (%s, vida %.0f)" % [txt_d, cao.st, cao.hp])
	hora = 12.0
	# E: chama (vem) e manda ficar
	_jogador_em(cao.global_position + Vector3(0, 0, 1.8), cao.global_position + Vector3(0, 0.3, 0))
	await _quadros(3)
	var txt_vem := texto_mira()
	jogador.usar()
	var veio := cao.st == "segue"
	await _quadros(30)
	_olhar(cao.global_position + Vector3(0, 0.3, 0))
	await _quadros(2)
	var txt_fica := texto_mira()
	jogador.usar()
	var ficou := cao.st == "fica"
	_confere(veio and ficou and txt_vem.begins_with("E  Chamar") and txt_fica.begins_with("E  Mandar"),
		"Caramelo: E chamou (%s) e E mandou ficar (%s)" % [txt_vem, txt_fica])
	# os bichos do mato fogem dele (você agachado e de costas para o cervo: ele não te vê)
	cao.st = "segue"
	cao.modo = "segue"
	_jogador_em(c, c - X * 10.0 + Vector3(0, 1.0, 0))
	Input.action_press("agachar")
	await _quadros(60)
	var pcao: Vector3 = cao.global_position
	var cv := _b_teste("cervo", pcao + X * 9.0, pcao + X * 30.0)
	var ec: String = await _b_ate(cv, ["foge"], 300)
	await _quadros(60)
	var dcv: float = Vector2(cv.global_position.x - pcao.x, cv.global_position.z - pcao.z).length() if is_instance_valid(cv) else 0.0
	Input.action_release("agachar")
	_confere(ec == "foge" and dcv > 11.0, "Caramelo: o cervo a 9 m fugiu do cachorro (%s, a %.0f m dele)" % [ec, dcv])
	_limpar_bichos()
	# o jogo salvo: ele continua seu
	var sv := cao.salvar()
	cao.iniciar()
	var zerou := not cao.ativo and cao.st == "espera"
	cao.carregar(sv)
	_confere(zerou and cao.ativo and cao.st == str(sv["st"]) and cao.mordidas == int(sv["mordidas"]),
		"jogo salvo: o Caramelo continua seu (%s, %d mordidas)" % [cao.st, cao.mordidas])
	cao.iniciar()
	_devolver_clareira(clareira)
	hora = hora_antes
	jogador.vida = 100.0
	spawn_t = spawn_antes


## o HUD com a arma de fogo na mão: as balas no pente / na mochila
func main_hud_item_ok(s: Dictionary) -> void:
	if ui == null or ui.hud == null:
		return
	ui.hud_item()
	var t: String = ui.hud.pct_item.text
	_confere(t == "%d / %d" % [int(s.get("mun", 0)), jogador.inv.conta("municao9")], "HUD: a munição na arma da mão (%s)" % t)


## tira os zumbis e as nuvens de gás (os testes dos zumbis começam do zero)
func _limpar_zumbis() -> void:
	for z in zumbis:
		if is_instance_valid(z):
			z.queue_free()
	zumbis.clear()
	for n in get_tree().get_nodes_in_group("gas"):
		n.queue_free()


## um lugar plano para os testes dos zumbis e das armas (sem casa nem muro no meio; árvore e pedra podem ter: a clareira tira)
func _lugar_plano(centro: Vector2, lado: float, evita: Vector2) -> Vector3:
	var sp := get_world_3d().direct_space_state
	var q := PhysicsShapeQueryParameters3D.new()
	var caixa := BoxShape3D.new()
	caixa.size = Vector3(lado, 4.0, lado)
	q.shape = caixa
	q.collision_mask = 1
	var fora: Array[RID] = [terreno.corpo_chao.get_rid()]
	q.exclude = fora
	for k in 700:
		var a := k * 2.39996
		var r := 1.0 + k * 0.6
		var p := centro + Vector2(cos(a), sin(a)) * r
		if p.distance_to(evita) < lado + 4.0 or not terreno.dentro(p.x, p.y) or terreno.tipo_agua(p.x, p.y) != 0:
			continue
		var ys := []
		var m := lado * 0.5
		for d in [Vector2(-m, -m), Vector2(m, -m), Vector2(-m, m), Vector2(m, m), Vector2.ZERO, Vector2(-m, 0), Vector2(m, 0), Vector2(0, -m), Vector2(0, m)]:
			ys.append(terreno.h(p.x + d.x, p.y + d.y))
		if ys.max() - ys.min() > 0.8:
			continue
		q.transform = Transform3D(Basis(), Vector3(p.x, terreno.h(p.x, p.y) + 2.3, p.y))
		var ok := true
		for hh in sp.intersect_shape(q, 64):
			if not (hh["collider"] as Object).has_meta("recurso"):
				ok = false
				break
		if ok:
			return Vector3(p.x, terreno.h(p.x, p.y), p.y)
	return Vector3(centro.x, terreno.h(centro.x, centro.y), centro.y)


## para os testes: tira a colisão das árvores e pedras em volta (o mato fechado tapa a visão dos zumbis e o tiro); volta depois
func _clareira_teste(c: Vector3, raio: float) -> Array:
	var tirados := []
	for r in mundo.recursos:
		var corpo = r.get("corpo")
		if corpo is CollisionObject3D and is_instance_valid(corpo) and r.has("pos"):
			var p: Vector3 = r["pos"]
			if Vector2(p.x - c.x, p.z - c.z).length() < raio and (corpo as CollisionObject3D).collision_layer != 0:
				tirados.append([corpo, (corpo as CollisionObject3D).collision_layer])
				(corpo as CollisionObject3D).collision_layer = 0
	return tirados


func _devolver_clareira(L: Array) -> void:
	for e in L:
		if is_instance_valid(e[0]):
			(e[0] as CollisionObject3D).collision_layer = e[1]


## para entender uma falha de visão: a distância, se ele está de frente, quanto vê e o que tapa a linha do olho dele até você
func _diag_z(z: Zumbi) -> String:
	if not is_instance_valid(z):
		return "sumiu"
	var j = jogador
	var para: Vector3 = j.global_position - z.global_position
	var dist := Vector2(para.x, para.z).length()
	var fr := -z.global_basis.z
	var ang := (fr.x * para.x + fr.z * para.z) / maxf(dist, 0.01)
	var a := z.global_position + Vector3(0, 1.6 * z.escala, 0)
	var b: Vector3 = j.global_position + Vector3(0, 1.4 if not j.agachado else 0.9, 0)
	var h := get_world_3d().direct_space_state.intersect_ray(PhysicsRayQueryParameters3D.create(a, b, 1, [z.get_rid(), j.get_rid()]))
	var tapa := "nada"
	if not h.is_empty():
		var c: Object = h["collider"]
		tapa = "%s (%s, metas %s) em %s" % [str(c.get("name")) if c is Node else "?", c.get_class(), str(c.get_meta_list()), str(h["position"])]
	return "dist %.1f, de frente %.2f, noite %.2f, lanterna %s, enxerga %s, y zumbi/você %.2f/%.2f, tapa: %s" % [dist, ang, noite_k(),
		str(j.lanterna_acesa), str(z._enxerga(j)), z.global_position.y, j.global_position.y, tapa]


## um zumbi de teste num ponto, olhando para "olha" (parado: de guarda, não vaga)
func _z_teste(p: Vector3, tipo: String, olha: Vector3, parado := true, dorme := false) -> Zumbi:
	var z := _nascer(Vector3(p.x, 0, p.z), tipo, dorme)
	var d := olha - p
	z.rotation.y = atan2(-d.x, -d.z)
	z.parado = parado
	return z


## põe o jogador no chão em p olhando para o peito de z (ou para um ponto)
func _jogador_em(p: Vector3, olha: Vector3) -> void:
	if jogador.veiculo != null:
		veiculos.expulsar(jogador)
	_por_em(Vector3(p.x, terreno.h(p.x, p.z) + 0.15, p.z))
	# os ferimentos dos testes anteriores (a mordida do lobo, o vírus do zumbi) não atrapalham o próximo
	if lesoes != null:
		lesoes.zerar()
	jogador.vida = 100.0
	jogador.energia = 100.0
	jogador.cd = 0.0
	_olhar(olha)


## espera até o zumbi ficar num dos estados (ou acabar o tempo); devolve o estado
func _z_ate(z: Zumbi, estados: Array, n: int) -> String:
	for i in n:
		if not is_instance_valid(z) or z.estado in estados:
			break
		await get_tree().physics_frame
	return z.estado if is_instance_valid(z) else "sumiu"


## os zumbis (a etapa 5): os tipos com a roupa e o capacete, a visão (de frente, agachado, parede no meio, de noite com a
## lanterna), o ouvido, o empurrão e o golpe logo depois dele, a voadora, o pisão, o golpe furtivo, o gritador, o inchado, a
## emboscada que dorme nas casas e a armadura do policial
func _teste_zumbis(livre: Vector3) -> void:
	var spawn_antes := spawn_t
	spawn_t = 9999.0
	_limpar_zumbis()
	hora = 10.0
	for lugar in jogador.inv.roupa.keys():
		if str(jogador.inv.roupa[lugar].get("id", "")) == "mascaraGas":
			jogador.inv.despir(lugar)
	var c := _lugar_plano(Vector2(-35, 45), 30.0, Vector2(livre.x, livre.z))
	var clareira := _clareira_teste(c, 34.0)
	print("zumbis: teste em %.0f, %.0f (sem a colisão de %d árvores e pedras em volta)" % [c.x, c.z, clareira.size()])
	var X := Vector3(1, 0, 0)
	var Zv := Vector3(0, 0, 1)
	_jogador_em(c + Zv * 9.0, c)
	await _quadros(3)
	# os tipos: a vida, o tamanho, a roupa (cascas) e o capacete
	var tipos := {}
	var k := 0
	for t in Zumbi.TIPOS:
		tipos[t] = _z_teste(c + X * (k * 2.2 - 6.6) - Zv * 6.0, t, c - Zv * 20.0)
		k += 1
	await _quadros(4)
	var br: Zumbi = tipos["brute"]
	var po: Zumbi = tipos["policial"]
	var inc: Zumbi = tipos["inchado"]
	var wk: Zumbi = tipos["walker"]
	_confere(br.vida_max == 420.0 and absf(br.escala - 1.3) < 0.01 and po.capacete == 2 and po.capacete_no != null and po.cascas.size() >= 3
		and inc.cascas.size() >= 2 and tipos["emboscada"].tipo == "emboscada",
		"7 tipos de zumbi: brutamontes (420 de vida, 1,3x), policial (capacete e %d peças de farda), inchado, gritador, corredor, emboscada" % po.cascas.size())
	_confere(wk.anim != null and wk.anim.has_animation("zLevantar") and wk.anim.has_animation("sCaindo") and wk.anim.has_animation("sDispara"),
		"animações novas do zumbi: levantar do chão, cair para trás, disparada")
	# a armadura do policial: o tiro na cabeça bate no capacete (duas vezes e ele voa); o colete segura o tiro no peito
	var v0 := po.vida
	po.ferir(26.0, jogador.global_position, 0, {"k": "bala", "head": true, "arma": "pistola", "mult": 2.0})
	var cap1 := po.capacete
	var d_cap := v0 - po.vida
	po.ferir(26.0, jogador.global_position, 0, {"k": "bala", "head": true, "arma": "pistola", "mult": 2.0})
	_confere(cap1 == 1 and d_cap < 8.0 and po.capacete == 0 and po.capacete_no == null,
		"policial: o tiro na cabeça bate no capacete (%.1f de dano), no segundo ele voa" % d_cap)
	v0 = po.vida
	po.ferir(26.0, jogador.global_position, 0, {"k": "bala", "reg": "tronco", "arma": "pistola"})
	_confere(absf((v0 - po.vida) - 26.0 * 0.6) < 0.2, "policial: o colete segura o tiro no peito (%.1f de 26)" % (v0 - po.vida))
	var po2 := _z_teste(c + Zv * 3.0, "policial", c)
	await _quadros(2)
	po2.ferir(30.0, jogador.global_position, 0, {"k": "bala", "head": true, "arma": "espingarda", "mult": 1.6})
	_confere(po2.capacete == 0 and po2.vida < po2.vida_max - 25.0, "policial: a espingarda arranca o capacete de uma vez")
	_limpar_zumbis()
	await _quadros(3)
	# a visão: agachado atrás dele, não vê; de pé perto, vê (de qualquer lado)
	Input.action_press("agachar")
	_jogador_em(c - X * 2.0, c + X * 4.0 + Vector3(0, 1.2, 0))
	await _quadros(3)
	var z := _z_teste(c + X * 4.0, "walker", c + X * 20.0)
	await _quadros(45)
	var e1 := z.estado
	Input.action_release("agachar")
	var e2: String = await _z_ate(z, ["caca"], 50)
	_confere(e1 == "vaga" and e2 == "caca", "visão: agachado atrás do zumbi ele não vê (%s); de pé a 6 m, vê (%s)" % [e1, e2])
	_limpar_zumbis()
	await _quadros(3)
	# parede no meio: não vê; sem a parede, vê
	_jogador_em(c - X * 4.0, c + X * 4.0 + Vector3(0, 1.4, 0))
	var parede := StaticBody3D.new()
	var cs := CollisionShape3D.new()
	var bx := BoxShape3D.new()
	bx.size = Vector3(0.4, 3.2, 5.0)
	cs.shape = bx
	parede.add_child(cs)
	add_child(parede)
	parede.global_position = Vector3(c.x, terreno.h(c.x, c.z) + 1.6, c.z)
	await _quadros(3)
	z = _z_teste(c + X * 4.0, "walker", c - X * 4.0)
	await _quadros(45)
	e1 = z.estado
	var tapado := not z._enxerga(jogador)
	parede.queue_free()
	e2 = await _z_ate(z, ["caca"], 50)
	_confere(e1 == "vaga" and tapado and e2 == "caca", "visão: com uma parede no meio não vê (%s); tirou a parede, viu (%s)" % [e1, e2])
	_limpar_zumbis()
	await _quadros(3)
	# de noite vê menos; a lanterna acesa no escuro chama a atenção
	hora = 23.0
	z = _z_teste(c + X * 7.0, "walker", c - X * 7.0)
	_jogador_em(c - X * 7.0, c + X * 7.0 + Vector3(0, 1.4, 0))
	await _quadros(50)
	e1 = z.estado
	jogador.inv.por("lanterna", 1)
	jogador.bateria = 100.0
	if not jogador.lanterna_acesa:
		jogador.alternar_lanterna()
	var acesa := jogador.lanterna_acesa
	e2 = await _z_ate(z, ["caca"], 50)
	_confere(e1 == "vaga" and acesa and e2 == "caca", "de noite a 14 m ele não te vê (%s); com a lanterna acesa, vê (%s) · %s" % [e1, e2, _diag_z(z)])
	if jogador.lanterna_acesa:
		jogador.alternar_lanterna()
	jogador.inv.tirar("lanterna", 1)
	hora = 10.0
	_limpar_zumbis()
	await _quadros(3)
	# o ouvido: de costas, longe, não vê; um barulho perto de você e ele vem ver o que foi
	Input.action_press("agachar")
	_jogador_em(c - X * 5.0, c + X * 7.0 + Vector3(0, 1.2, 0))
	await _quadros(3)
	z = _z_teste(c + X * 7.0, "walker", c + X * 30.0)
	await _quadros(20)
	e1 = z.estado
	barulho(jogador.global_position, 20.0)
	e2 = await _z_ate(z, ["alerta", "caca"], 110)
	Input.action_release("agachar")
	_confere(e1 == "vaga" and e2 in ["alerta", "caca"], "ouvido: o barulho a 12 m faz o zumbi vir ver o que foi (%s → %s)" % [e1, e2])
	_limpar_zumbis()
	await _quadros(3)
	# o empurrão (Q): cambaleia para trás; o golpe logo depois derruba; caído, o golpe vira pisão e acaba com ele
	z = _z_teste(c + X * 1.4, "walker", c)
	_jogador_em(c, c + X * 1.4 + Vector3(0, 1.2, 0))
	await _quadros(3)
	var p_antes := z.global_position
	jogador.empurrar()
	await _quadros(20)
	var e_emp := z.estado
	var recuou := Vector2(z.global_position.x - p_antes.x, z.global_position.z - p_antes.z).length()
	await _quadros(8)
	_jogador_em(z.global_position - X * 1.3, z.global_position + Vector3(0, 1.1, 0))
	jogador.atacar()
	await _quadros(3)
	var e_comb := z.estado
	_confere(e_emp == "atordoado" and recuou > 0.3 and e_comb == "derrubado",
		"Q empurra: o zumbi cambaleia para trás (%.1f m, %s); o golpe logo depois derruba (%s)" % [recuou, e_emp, e_comb])
	await _quadros(4)
	_jogador_em(z.global_position - X * 1.1, z.global_position + Vector3(0, 0.3, 0))
	jogador.atacar()
	var pisou := str(jogador.acao.get("tipo", ""))
	var e_pis: String = await _z_ate(z, ["morto"], 45)
	_confere(pisou == "pisao" and e_pis == "morto", "zumbi caído: o golpe vira pisão na cabeça (%s, %s)" % [pisou, e_pis])
	_limpar_zumbis()
	await _quadros(3)
	# a voadora (Q correndo): derruba o comum; o brutamontes só cambaleia
	var voadoras := []
	for t in ["walker", "brute"]:
		z = _z_teste(c + X * 5.0, t, c)
		_jogador_em(c, c + X * 5.0 + Vector3(0, 1.2, 0))
		await _quadros(3)
		Input.action_press("frente")
		Input.action_press("correr")
		await _quadros(12)
		jogador.empurrar()
		var foi := str(jogador.acao.get("tipo", ""))
		var e_v: String = await _z_ate(z, ["derrubado"], 30)
		Input.action_release("correr")
		Input.action_release("frente")
		voadoras.append([foi, e_v, z.vida < z.vida_max])
		await _quadros(30)
		_limpar_zumbis()
		await _quadros(3)
	_confere(voadoras[0][0] == "voadora" and voadoras[0][1] == "derrubado" and voadoras[1][1] != "derrubado" and voadoras[1][2],
		"Q correndo: a voadora derruba o zumbi (%s); o brutamontes não cai (%s)" % [voadoras[0][1], voadoras[1][1]])
	# o golpe furtivo: agachado, pelas costas de quem não te viu, dobra
	Input.action_press("agachar")
	_jogador_em(c + X * 1.5, c + X * 3.0 + Vector3(0, 1.0, 0))
	await _quadros(3)
	z = _z_teste(c + X * 3.0, "walker", c + X * 20.0)
	await _quadros(12)
	_olhar(z.global_position + Vector3(0, 1.0, 0))
	var e_f := z.estado
	jogador.atacar()
	var d_furtivo := z.vida_max - z.vida
	Input.action_release("agachar")
	_limpar_zumbis()
	await _quadros(12)
	z = _z_teste(c + X * 3.0, "walker", c)
	_jogador_em(c + X * 1.5, c + X * 3.0 + Vector3(0, 1.2, 0))
	await _quadros(4)
	jogador.atacar()
	var d_normal := z.vida_max - z.vida
	_confere(e_f == "vaga" and d_normal > 0.0 and d_furtivo >= d_normal * 1.6,
		"golpe furtivo (agachado, pelas costas): %.0f de dano contra %.0f de frente" % [d_furtivo, d_normal])
	_limpar_zumbis()
	await _quadros(3)
	# o brutamontes: o soco não faz ele cambalear
	_jogador_em(c, c + X * 1.6 + Vector3(0, 1.5, 0))
	await _quadros(2)
	z = _z_teste(c + X * 1.6, "brute", c)
	await _quadros(3)
	var no_arco_b: int = jogador._zumbis_no_golpe(1.9).size()
	jogador.atacar()
	await _quadros(2)
	_confere(z.vida < z.vida_max and z.estado != "atordoado", "brutamontes: o soco não faz ele cambalear (%s, vida %.0f/%.0f, no arco %d) · %s"
		% [z.estado, z.vida, z.vida_max, no_arco_b, _diag_z(z)])
	_limpar_zumbis()
	await _quadros(3)
	# o gritador: te vê, grita, e o zumbi de longe (de costas, a 26 m de você) vem para onde você está
	var gr := _z_teste(c + X * 6.0, "screamer", c - X * 2.0)
	var longe := _z_teste(c + X * 24.0, "walker", c + X * 60.0)
	_jogador_em(c - X * 2.0, c + X * 6.0 + Vector3(0, 1.4, 0))
	var e_g: String = await _z_ate(gr, ["grito"], 60)
	var e_l: String = await _z_ate(longe, ["alerta", "caca"], 200)
	_confere(e_g == "grito" and gr.gritou and e_l in ["alerta", "caca"], "gritador: viu, gritou (%s) e o zumbi de longe veio (%s) · %s" % [e_g, e_l, _diag_z(gr)])
	_limpar_zumbis()
	await _quadros(3)
	# o inchado: chega perto e estoura numa nuvem de gás que machuca
	var ic := _z_teste(c + X * 1.25, "inchado", c)
	_jogador_em(c, c + X * 1.25 + Vector3(0, 1.2, 0))
	var e_i: String = await _z_ate(ic, ["morto"], 60)
	var nuvens := get_tree().get_nodes_in_group("gas").size()
	jogador.vida = 100.0
	await _quadros(45)
	_confere(e_i == "morto" and ic.estourou and nuvens > 0 and jogador.vida < 99.0,
		"inchado: chegou perto e estourou (%d nuvem de gás); no gás a vida cai (%d)" % [nuvens, int(jogador.vida)])
	_limpar_zumbis()
	await _quadros(3)
	# a emboscada: dorme deitada no escuro; de longe não acorda, de perto levanta e vem
	var em := _z_teste(c + X * 3.0, "emboscada", c, false, true)
	_jogador_em(c - X * 3.0, c + X * 3.0)
	await _quadros(40)
	var e_d := em.estado
	var deitada: bool = em.anim != null and em.anim.current_animation == "zLevantar"
	_jogador_em(c + X * 0.9, c + X * 3.0)
	var e_a: String = await _z_ate(em, ["levanta", "caca"], 30)
	var e_c: String = await _z_ate(em, ["caca"], 100)
	_confere(e_d == "dorme" and deitada and e_a in ["levanta", "caca"] and e_c == "caca",
		"emboscada: deitada dormindo (%s); chegou perto, levantou (%s) e veio (%s)" % [e_d, e_a, e_c])
	_limpar_zumbis()
	await _quadros(3)
	jogador.vida = 100.0
	_devolver_clareira(clareira)
	spawn_t = spawn_antes


## o personagem (a etapa 3): o corpo com o esqueleto e as peças, as animações pela velocidade (parado, andando, correndo,
## agachado, pulo), a terceira pessoa (V), o item na mão do corpo e a mão esquerda no cabo, o golpe, a roupa no corpo, a mão da
## primeira pessoa e a criação do personagem (que guarda no perfil e vai para o jogo)
func _teste_personagem(livre: Vector3) -> void:
	var c := jogador.corpo
	_confere(c.esq != null and c.ix.size() == Corpo.NB and not c.ix.has(-1) and c.nos.size() > 40,
		"corpo do personagem: esqueleto de %d ossos e %d malhas (corpo em pedaços, olhos, cabelos, barbas, roupas e cascas)" % [c.ix.size(), c.nos.size()])
	_confere(Corpo.CL.size() >= 18 and Corpo.CLIP.size() > 100000, "animações do sobrevivente: %d clipes" % Corpo.CL.size())
	# um lugar aberto longe da base de teste (que foi montada perto da clareira)
	livre = _lugar_livre(Vector2(-35, 45), 16.0, Vector2(livre.x, livre.z))
	_por_em(Vector3(livre.x, livre.y + 0.2, livre.z + 6.0))
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


## a mão vazia (um espaço vazio da barra; sem nenhum, o item do primeiro vai para a mochila)
func _mao_vazia() -> void:
	var inv := jogador.inv
	for i in Inventario.BARRA:
		if inv.slots[i] == null:
			jogador.selecionar(i)
			return
	for i in range(Inventario.BARRA, inv.limite):
		if inv.slots[i] == null:
			inv.trocar(0, i)
			jogador.selecionar(0)
			return


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
	if construcao.pecas.size() <= n0:
		print("      (não deu para pôr %s: falta material %s)" % [id, str(Dados.custo(Dados.obra(id)))])
		return -1
	return n0


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
	# o Multiplayer (etapa 4): a tela de verdade (sem "em breve"), abrir a partida liga o servidor, a pergunta pelo TCP e a
	# procura na rede respondem, e sair desliga (a partida em rede com dois jogos tem o teste dela: --teste-rede)
	_confere(str(Telas.CAMINHOS[1].get("tag", "")) != "EM BREVE" and str(Telas.CAMINHOS[1]["ir"]) == "Jogar junto", "lobby: o Multiplayer deixou de ser \"em breve\"")
	telas.mostrar("multi")
	await _quadros(3)
	_confere(Rede.procurando and telas.mp_abrir.is_visible_in_tree() and not telas.mp_abrir.disabled and not telas.mp_jogar.visible,
		"Multiplayer: a tela monta (abrir, entrar com IP, procurando partidas na rede)")
	Rede.nome = "Teste"
	await Rede.hospedar()
	await _quadros(3)
	var sonda: Dictionary = await Rede._sondar("127.0.0.1", RedeLan.PORTA)
	_confere(Rede.anfitriao() and sonda["ok"] and telas.mp_jogar.visible and telas.mp_ips.visible and telas.mp_abrir.disabled,
		"Multiplayer: abriu a partida (IPs: %s) e ela responde pela rede (versão %s)" % [", ".join(Rede.ips), str(sonda.get("info", {}).get("vaydr", "?"))])
	telas.esconder()
	telas.pausa()
	await _quadros(2)
	_confere(get_tree().paused, "partida aberta sem ninguém: a pausa ainda para o jogo")
	telas.voltar_ao_jogo()
	Rede.desligar(false)
	await _quadros(3)
	_confere(not Rede.on and Rede.papel == "", "Multiplayer: sair da partida desliga")
	Rede.entrar("o ip do amigo")
	await _quadros(2)
	_confere(not Rede.on and Rede.erro.begins_with("Digite o IP"), "Multiplayer: IP errado diz o que digitar (%s)" % Rede.erro)
	var sem := await Rede._sondar("127.0.0.1", RedeLan.PORTA)
	_confere(not sem["ok"] and str(sem["codigo"]) == "RECUSOU", "Multiplayer: sem partida aberta no IP, diz que o computador respondeu mas a partida não está aberta (%s)" % str(sem["codigo"]))
	Rede.erro = ""
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
	await _teste_atualiza()
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
	await _teste_zumbis(livre)
	await _teste_armas(livre)
	await _teste_noites(livre)
	await _teste_fauna(livre)
	await _teste_clima(livre)
	await _teste_sono(livre)
	await _teste_pesca()
	_teste_sons()
	await _teste_cao(livre)
	await _teste_lesoes(livre)
	await _teste_plantio()
	await _teste_curtume(livre)
	await _teste_nado()
	await _teste_veiculos(livre)
	await _teste_barcos()
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
	# no Linux sem placa de vídeo (llvmpipe), de vez em quando um quadro sai com um pedaço deslocado (da linha tal para baixo,
	# tudo vai para o lado), às vezes em dois quadros seguidos. As marcas magenta na beira esquerda dizem se o quadro saiu
	# inteiro: tira de novo até sair um inteiro (e apaga as marcas da foto)
	_marcas_fotos()
	var img: Image = null
	var faltam := 99
	for k in 12:
		await RenderingServer.frame_post_draw
		await get_tree().process_frame
		await RenderingServer.frame_post_draw
		var im := _capturar()
		var f := _marcas_faltando(im)
		if f < faltam:
			faltam = f
			img = im
		if f == 0:
			break
		print("foto %s: quadro %d com defeito (%d marcas fora do lugar)" % [nome, k, f])
		await _quadros(2 + k)
	if faltam > 0:
		print("foto %s: nenhum quadro saiu inteiro (%d marcas fora)" % [nome, faltam])
	_sem_marcas(img)
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path("res://fotos"))
	img.save_jpg(ProjectSettings.globalize_path("res://fotos/%s.jpg" % nome), 0.86)
	var dc := RenderingServer.get_rendering_info(RenderingServer.RENDERING_INFO_TOTAL_DRAW_CALLS_IN_FRAME)
	var pr := RenderingServer.get_rendering_info(RenderingServer.RENDERING_INFO_TOTAL_PRIMITIVES_IN_FRAME)
	print("foto %s: %d chamadas de desenho, %d mil triângulos, %d fps (software)" % [nome, dc, pr / 1000, Engine.get_frames_per_second()])


func _capturar() -> Image:
	# a imagem que o Godot desenhou (a textura da tela); a cópia da janela do X às vezes vinha com o HUD deslocado para o lado
	var img: Image = get_viewport().get_texture().get_image()
	if img == null or img.is_empty():
		img = DisplayServer.screen_get_image(DisplayServer.window_get_current_screen())
	return img


## as marcas das fotos: quadradinhos magenta (3 x 2 px) na beira esquerda a cada 44 linhas, por cima de tudo. Se alguma não
## está no lugar na foto, o quadro saiu com o defeito do llvmpipe
const MARCAS := 17
var _marcas: CanvasLayer = null


func _marcas_fotos() -> void:
	if _marcas != null and is_instance_valid(_marcas):
		return
	_marcas = CanvasLayer.new()
	_marcas.layer = 128
	for k in MARCAS:
		var r := ColorRect.new()
		r.color = Color(1, 0, 1)
		r.position = Vector2(0, 4 + k * 44)
		r.size = Vector2(3, 2)
		r.mouse_filter = Control.MOUSE_FILTER_IGNORE
		_marcas.add_child(r)
	get_tree().root.add_child.call_deferred(_marcas)


## quantas marcas não estão no lugar (0: o quadro saiu inteiro)
func _marcas_faltando(img: Image) -> int:
	if img == null or img.is_empty() or img.get_width() < 8 or img.get_height() < 4 + MARCAS * 44:
		return MARCAS
	var f := 0
	for k in MARCAS:
		var c := img.get_pixel(1, 5 + k * 44)
		if c.r < 0.85 or c.g > 0.15 or c.b < 0.85:
			f += 1
	return f


## tira as marcas da foto (copia as colunas do lado)
func _sem_marcas(img: Image) -> void:
	if img == null or img.is_empty() or img.get_height() < 4 + MARCAS * 44:
		return
	for k in MARCAS:
		for dy in 2:
			var y := 4 + k * 44 + dy
			for x in 3:
				img.set_pixel(x, y, img.get_pixel(x + 3, y))


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
	_marcas_fotos()
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
	await _quadros(20)
	await _foto("00h_multiplayer")
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
	var la := _lugar_livre(Vector2(10, 12), 12.0)
	_por_em(Vector3(la.x, la.y + 0.3, la.z))
	await _quadros(8)
	jogador.rotation.y = atan2(la.x - 0.0, la.z - 0.0) + 0.5
	jogador.cabeca.rotation.x = -0.12
	jogador.alternar_camera(true)
	await _quadros(70)
	await _foto("13b_terceira_pessoa")
	# o golpe parado no meio (sem placa de vídeo cada quadro leva um segundo: o golpe inteiro passaria entre dois quadros)
	jogador.cd = 0.0
	jogador.atacar()
	jogador.golpe_t = 0.2
	jogador.golpe_parado = true
	await _quadros(20)
	await _foto("13c_golpe_terceira_pessoa")
	jogador.golpe_parado = false
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
	_mao_vazia()
	hora = 10.0
	for z in zumbis:
		if is_instance_valid(z):
			z.queue_free()
	var livre2 := _lugar_livre(Vector2(-20, 30), 8.0, Vector2(livre.x, livre.z))
	var zz := _nascer(Vector3(livre2.x, 0, livre2.z - 1.5), false)
	zz.estado = "vaga"
	await _cam(Vector3(livre2.x, 0, livre2.z + 3.0), Vector3(livre2.x, 1.2, livre2.z - 1.5))
	await _foto("16_zumbi")
	# o HUD apanhando: a seta vermelha mostra de que lado veio o golpe, e as bordas ficam vermelhas (o zumbi fica parado: com
	# 30 de vida, os golpes de verdade dele durante a foto matavam e as fotos seguintes saíam com a tela de morte)
	if is_instance_valid(zz):
		zz.set_physics_process(false)
	jogador.vida = 30.0
	ui.dano(zz.global_position + Vector3(4, 0, 0))
	await _foto("16b_apanhando")
	if not jogador.vivo:
		renascer(false)
	jogador.vida = 100.0
	# os tipos de zumbi lado a lado: o comum, o corredor, o brutamontes, o gritador, o policial (farda, colete e capacete), o
	# inchado e a emboscada (os de rua com trapos de cores diferentes)
	_limpar_zumbis()
	var lt := _lugar_livre(Vector2(-35, 45), 16.0, Vector2(livre.x, livre.z))
	var cam_t := lt + Vector3(0.3, 0, 6.2)
	var kt := 0
	for t in ["walker", "runner", "brute", "screamer", "policial", "inchado", "emboscada"]:
		var pt := lt + Vector3(-5.1 + kt * 1.7, 0, -0.35 * absf(kt - 3.0))
		var zt := _z_teste(pt, t, cam_t + Vector3(0, 0, 3.0))
		zt.set_physics_process(false)
		zt.global_position.y -= 0.15
		kt += 1
	await _cam(cam_t, lt + Vector3(0.3, 1.0, 0.0))
	await _quadros(8)
	await _foto("16c_tipos_de_zumbi")
	# a voadora em terceira pessoa: o pé no peito e o zumbi caindo para trás
	_limpar_zumbis()
	var lv := _lugar_livre(Vector2(-20, 30), 8.0, Vector2(livre.x, livre.z))
	var zv := _z_teste(lv + Vector3(0, 0, -1.5), "walker", lv)
	zv.set_physics_process(false)
	zv.global_position.y -= 0.15
	_jogador_em(lv + Vector3(0, 0, 0.1), lv + Vector3(0, 1.1, -1.5))
	jogador.alternar_camera(true)
	await _quadros(6)
	jogador.set_physics_process(false)
	jogador.global_position.y += 0.45
	jogador.acao = {"tipo": "voadora", "t": 0.27, "dur": 0.7, "feito": true, "dir": Vector3(0, 0, -1)}
	if zv.anim != null and zv.anim.has_animation("sCaindo"):
		zv.anim.play("sCaindo", 0.0, 1.0)
		zv.anim.seek(0.3, true)
		zv.anim.pause()
	zv.rotation.x = 0.3   # inclinado para trás (o pé dele ainda no chão)
	await _quadros(8)
	await _foto("16d_voadora")
	jogador.acao = {}
	jogador.set_physics_process(true)
	jogador.alternar_camera(false)
	_limpar_zumbis()
	# as armas (etapa 5b): a pistola mirando num zumbi, a luneta do rifle, a espingarda em terceira pessoa, o arco puxado e o
	# zumbi pegando fogo no molotov
	var lw := _lugar_plano(Vector2(-35, 45), 30.0, Vector2(livre.x, livre.z))
	var clar := _clareira_teste(lw, 45.0)
	var X3 := Vector3(1, 0, 0)
	for id_a in ["pistola", "rifle", "espingarda", "arco"]:
		jogador.inv.por(id_a, 1)
	jogador.inv.por("municao9", 16)
	jogador.inv.por("balaRifle", 5)
	jogador.inv.por("cartucho", 8)
	jogador.inv.por("flecha", 8)
	jogador.inv.por("molotov", 1)
	var za := _z_teste(lw + X3 * 7.0, "walker", lw)
	za.set_physics_process(false)
	za.global_position.y -= 0.15
	_jogador_em(lw, za.global_position + Vector3(0, 1.45, 0))
	_na_mao("pistola")
	jogador.item_mao()["mun"] = 8
	ui.hud_item()
	Input.action_press("mirar")
	await _quadros(30)
	await _foto("16e_pistola_mirando")
	# a luneta do rifle num zumbi a 35 m
	var zl := _z_teste(lw + X3 * 35.0, "brute", lw)
	zl.set_physics_process(false)
	zl.global_position.y -= 0.15
	za.queue_free()
	zumbis.erase(za)
	_na_mao("rifle")
	jogador.item_mao()["mun"] = 5
	_olhar(zl.global_position + Vector3(0, 1.5 * zl.escala, 0))
	await _quadros(30)
	await _foto("16f_luneta_do_rifle")
	Input.action_release("mirar")
	_limpar_zumbis()
	# a espingarda em terceira pessoa, mirando
	var ze := _z_teste(lw + X3 * 6.0, "policial", lw)
	ze.set_physics_process(false)
	ze.global_position.y -= 0.15
	_jogador_em(lw, ze.global_position + Vector3(0, 1.3, 0))
	_na_mao("espingarda")
	jogador.item_mao()["mun"] = 5
	jogador.alternar_camera(true)
	Input.action_press("mirar")
	await _quadros(35)
	await _foto("16g_espingarda_terceira")
	Input.action_release("mirar")
	jogador.alternar_camera(false)
	_limpar_zumbis()
	# o arco puxado
	var zb := _z_teste(lw + X3 * 12.0, "runner", lw)
	zb.set_physics_process(false)
	zb.global_position.y -= 0.15
	_jogador_em(lw, zb.global_position + Vector3(0, 1.3, 0))
	_na_mao("arco")
	await _quadros(4)
	jogador.set_physics_process(false)
	jogador.acao = {"tipo": "arco", "t": 0.8, "dur": 1e9, "puxa": 1.0, "feito": false, "slot": jogador.sel}
	await _quadros(12)
	await _foto("16h_arco_puxado")
	jogador.acao = {}
	jogador.set_physics_process(true)
	_limpar_zumbis()
	# o molotov: o fogo no chão e um zumbi pegando fogo
	var zf := _z_teste(lw + X3 * 8.0, "walker", lw + X3 * 40.0)
	_jogador_em(lw, zf.global_position + Vector3(0, 0.05, 0))
	_na_mao("molotov")
	await _quadros(3)
	jogador.cd = 0.0
	jogador.atacar()
	await _quadros(75)
	if is_instance_valid(zf):
		zf.set_physics_process(false)
		_olhar(zf.global_position + Vector3(0, 1.0, 0))
	await _quadros(10)
	await _foto("16i_molotov")
	projeteis.limpar()
	_limpar_zumbis()
	for id_a in ["pistola", "rifle", "espingarda", "arco", "municao9", "balaRifle", "cartucho", "flecha", "molotov"]:
		var n_a := jogador.inv.conta(id_a)
		if n_a > 0:
			jogador.inv.tirar(id_a, n_a)
	_mao_vazia()
	# a lua de sangue (etapa 5c): o céu vermelho e o Colosso chegando com a horda, a barra da vida dele no alto; em terceira
	# pessoa, com a lanterna acesa
	var noites_antes := noites.salvar()
	var hora_f := hora
	noites.lua_sangue = true
	hora = 23.3
	_ciclo()
	var zc := _z_teste(lw + X3 * 12.0, "colosso", lw)
	zc.set_physics_process(false)
	zc.global_position.y = terreno.h(zc.global_position.x, zc.global_position.z) + 0.02
	var Zf := Vector3(0, 0, 1)
	var acomp: Array = []
	for k in [-1.0, 1.0]:
		var zk := _z_teste(lw + X3 * 9.5 + Zf * 3.2 * k, "walker", lw)
		zk.set_physics_process(false)
		zk.global_position.y = terreno.h(zk.global_position.x, zk.global_position.z) - 0.1
		acomp.append(zk)
		if zk.anim != null and zk.anim.has_animation("sFeridoAnda"):
			zk.anim.play("sFeridoAnda", 0.0, 1.0)
			zk.anim.seek(0.4 + 0.3 * k, true)
			zk.anim.pause()
	if zc.anim != null and zc.anim.has_animation("sGolpe"):
		zc.anim.play("sGolpe", 0.0, 1.0)
		zc.anim.seek(0.3, true)
		zc.anim.pause()
	_jogador_em(lw, zc.global_position + Vector3(0, 2.4 * zc.escala, 0))
	if not jogador.luz_mao.visible:
		jogador.alternar_lanterna()
	jogador.alternar_camera(true)
	ui.aviso("Lua de sangue! O Colosso chegou: pule na hora do pisão, saia da frente da investida.", 6.0)
	await _quadros(20)
	await _foto("16j_lua_de_sangue_colosso")
	jogador.alternar_camera(false)
	if jogador.luz_mao.visible:
		jogador.alternar_lanterna()
	_limpar_zumbis()
	# a caixa de suprimentos da manhã depois da lua de sangue: o caixote com a fumaça vermelha subindo
	noites.lua_sangue = false
	hora = 7.4
	_ciclo()
	var pcx := lw + X3 * 9.0 + Zf * 2.0
	pcx.y = terreno.h(pcx.x, pcx.z)
	var inv_f := Inventario.new(20, false)
	inv_f.por("municao9", 10)
	construcao.por_mochila(pcx, inv_f, "Caixa de suprimentos", true)
	var fum := efeitos.fumaca(pcx + Vector3(0, 0.5, 0), Color(0.85, 0.16, 0.12), 30.0)
	_jogador_em(lw, pcx + Vector3(0, 2.6, 0))
	await _quadros(260)
	await _foto("16k_caixa_de_suprimentos")
	if is_instance_valid(fum):
		fum.queue_free()
	noites.carregar(noites_antes)
	# os bichos do mato (etapa 6a): cervos pastando (o macho com a galhada, as fêmeas sem), um coelho e um javali
	hora = 9.3
	_ciclo()
	_limpar_bichos()
	var pb := lw + X3 * 9.0
	var cena: Array = [["cervo", Vector3(0, 0, 0), "", 2.2, "alerta"], ["cervo", Vector3(1.6, 0, 1.9), "F", 1.4, "come"],
		["cervo", Vector3(-1.4, 0, 2.6), "F", 2.9, "come"], ["coelho", Vector3(-2.6, 0, -1.6), "", 1.0, "come"],
		["javali", Vector3(4.2, 0, 4.6), "", 3.6, "come"]]
	var feitos_f: Array = []
	for e in cena:
		var pp: Vector3 = pb + (e[1] as Vector3)
		var bf := fauna.criar(str(e[0]), pp, "", null, str(e[2]))
		feitos_f.append([bf, e])
	await _quadros(20)
	for fe in feitos_f:
		var bf: Bicho = fe[0]
		var e: Array = fe[1]
		bf.set_physics_process(false)
		bf.yaw = float(e[3])
		bf.rotation.y = bf.yaw
		bf.st = str(e[4])
		bf.v = 0.0
		bf.global_position.y = terreno.h(bf.global_position.x, bf.global_position.z)
		bf._pose(0.016)
	_jogador_em(lw - X3 * 1.0, pb + Vector3(0.5, 0.7, 1.0))
	await _quadros(10)
	await _foto("17a_bichos_do_mato")
	_limpar_bichos()
	# o urso de pé defendendo o espaço dele
	var ub := fauna.criar("urso", lw + X3 * 7.5, "", null, "")
	await _quadros(20)
	ub.set_physics_process(false)
	ub.yaw = atan2(-1.0, 0.0)
	ub.rotation.y = ub.yaw
	ub.st = "defende"
	ub.v = 0.0
	ub.global_position.y = terreno.h(ub.global_position.x, ub.global_position.z)
	ub._pose(0.016)
	_jogador_em(lw, ub.global_position + Vector3(0, 1.6, 0))
	jogador.alternar_camera(true)
	await _quadros(10)
	await _foto("17b_urso_de_pe")
	jogador.alternar_camera(false)
	_limpar_bichos()
	# a carcaça do cervo e o esfolar (com a faca na mochila)
	var cb := fauna.criar("cervo", lw + X3 * 2.2, "", null, "")
	await _quadros(20)
	cb.morrer("bala", 10.0)
	cb.set_physics_process(false)
	cb.global_position.y = terreno.h(cb.global_position.x, cb.global_position.z)
	cb.rolo = float(cb.carc["lado"]) * 1.45
	cb._pose_morto(0.016)
	jogador.inv.por("faca", 1)
	_jogador_em(lw, cb.centro() - Vector3(0, 0.25, 0))
	await _quadros(10)
	await _foto("17c_esfolar_o_cervo")
	var nfa := jogador.inv.conta("faca")
	if nfa > 0:
		jogador.inv.tirar("faca", nfa)
	_limpar_bichos()
	# o tempo (etapa 6b): a chuva no meio da tarde, a neblina de manhã cedo e as copas do outono
	var clima_antes := clima.salvar()
	var dia_f := dia
	dia = 10
	hora = 15.0
	clima.atual = "chuva"
	clima.antes = "chuva"
	clima.k = 1.0
	clima.chuva_k = 0.9
	_jogador_em(lw, lw + X3 * 25.0 + Vector3(0, 1.4, 0))
	await _quadros(3)
	clima._passo_chuva()
	await _quadros(70)
	await _foto("17d_chuva")
	clima.chuva_k = 0.0
	clima._passo_chuva()
	clima.atual = "neblina"
	clima.antes = "neblina"
	hora = 7.1
	await _quadros(12)
	await _foto("17e_neblina")
	dia = 17
	hora = 16.4
	clima.atual = "limpo"
	clima.antes = "limpo"
	_jogador_em(lw, lw - X3 * 40.0 + Vector3(0, 4.0, 0))
	await _quadros(12)
	await _foto("17f_outono")
	clima.carregar(clima_antes)
	dia = dia_f
	hora = hora_f
	_ciclo()
	# o Caramelo (etapa 6e): magro e com fome (a mira mostra o que fazer); depois de comer, sentado do seu lado (terceira pessoa)
	cao.iniciar()
	cao._no_chao(lw + X3 * 4.0 + Zf * 1.5)
	jogador.inv.por("frutas", 3)
	_jogador_em(cao.global_position + Vector3(-2.0, 0, 0.6), cao.global_position + Vector3(0, 0.35, 0))
	await _quadros(40)
	await _foto("17g_caramelo_com_fome")
	jogador.usar()
	await _quadros(5)
	var fr_c := -jogador.global_transform.basis.z
	fr_c.y = 0.0
	fr_c = fr_c.normalized()
	var esq_c := Vector3(fr_c.z, 0, -fr_c.x)
	cao.set_physics_process(false)
	cao._no_chao(jogador.global_position + fr_c * 1.7 + esq_c * 0.8)
	cao.yaw = atan2(-fr_c.x, -fr_c.z) + 0.5
	cao.rotation.y = cao.yaw
	cao._hy = -0.4
	cao._t = 1.3
	cao._pose("senta", 1.0)
	cao.corpo.visible = true
	jogador.alternar_camera(true)
	await _quadros(20)
	await _foto("17h_caramelo_junto")
	jogador.alternar_camera(false)
	cao.set_physics_process(true)
	cao.iniciar()
	var nfr := jogador.inv.conta("frutas")
	if nfr > 0:
		jogador.inv.tirar("frutas", nfr)
	# a roça da fazenda (etapa 6g): milho, batata, abóbora, tomate, cenoura e feijão crescendo nos canteiros; e um pé de
	# manga da vila com fruta
	var nfaz := 0
	for d in plantio.DEF:
		if d["tipo"] == "fazenda":
			plantio.S[d["id"]] = 1.0 if nfaz % 7 != 3 else 0.3
			plantio.C[d["id"]] = nfaz % 6
			nfaz += 1
	plantio._atualizar_tudo()
	await _cam_alto(Vector3(-38.0, terreno.h(-38.0, 86.0) + 4.2, 86.0), Vector3(-53.0, 0.3, 72.0))
	await _quadros(20)
	await _foto("17i_roca_da_fazenda")
	jogador.set_physics_process(true)
	var fr0: Dictionary = plantio.FR[0]
	var pf: Vector3 = fr0["p"]
	await _cam(pf + Vector3(-3.2, 0, 3.4), Vector3(pf.x, 2.3, pf.z))
	await _quadros(15)
	await _foto("17j_pe_de_manga")
	plantio.novo()
	# os veículos (etapa 6j): a caminhonete perto da fazenda; de noite com os faróis acesos (terceira pessoa); o volante na
	# primeira pessoa (a cabine some e aparece o capô); a oficina do carro da vila; o triciclo com você sentado
	veiculos.novo()
	var cvf := veiculos.por_id("caminhonete")
	if cvf != null:
		hora = 15.2
		var frv := cvf.frente()
		var esqv := Vector3(frv.z, 0, -frv.x)
		await _cam(cvf.global_position + frv * 5.2 + esqv * 3.8, cvf.global_position + Vector3(0, 0.9, 0), false)
		await _quadros(20)
		await _foto("17k_caminhonete")
		cvf.comb = 60.0
		hora = 20.8
		jogador.alternar_camera(true)
		veiculos.entrar(cvf, jogador)
		await _quadros(45)
		await _foto("17l_farois_de_noite")
		hora = 10.5
		jogador.alternar_camera(false)
		await _quadros(30)
		await _foto("17m_volante_primeira_pessoa")
		veiculos.expulsar(jogador)
	var sdf := veiculos.por_id("sedanVila")
	if sdf != null:
		hora = 11.0
		_jogador_em(sdf.global_position + sdf.frente() * 3.8, sdf.global_position + Vector3(0, 0.8, 0))
		jogador.inv.por("kitFerramentas", 1)
		jogador.inv.por("pneu", 1)
		jogador.inv.por("gasolina", 1)
		await _quadros(15)
		ui.abrir_veiculo(sdf)
		await _quadros(10)
		await _foto("17n_oficina_do_carro")
		ui.abrir(false)
		for it in ["kitFerramentas", "pneu", "gasolina"]:
			var nv := jogador.inv.conta(it)
			if nv > 0:
				jogador.inv.tirar(it, nv)
	var tcf := veiculos.por_id("triFazenda")
	if tcf != null:
		hora = 16.4
		jogador.alternar_camera(true)
		veiculos.entrar(tcf, jogador)
		jogador.rotation.y = tcf.rotation.y + PI - 0.9
		jogador._olhar_t = -30.0
		await _quadros(40)
		await _foto("17o_triciclo")
		veiculos.expulsar(jogador)
		jogador.alternar_camera(false)
	var bcf := veiculos.por_id("barcoCais")
	if bcf != null:
		hora = 17.2
		bcf.pecas["motor"] = 100.0
		bcf.comb = 60.0
		bcf.rotation.y = 0.6
		jogador.alternar_camera(true)
		veiculos.entrar(bcf, jogador)
		jogador.rotation.y = bcf.rotation.y + PI + 0.7
		jogador._olhar_t = -30.0
		await _quadros(40)
		await _foto("17p_barco_no_lago")
		veiculos.expulsar(jogador)
		jogador.alternar_camera(false)
	veiculos.novo()
	_devolver_clareira(clar)
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
	# a partida em rede (etapa 4): o outro jogo (sem tela, rodando junto na nuvem) entra na partida deste
	var tr := TesteRede.new(self, "fotos", true)
	add_child(tr)
	await tr.fotos_principal()
	get_tree().quit()
