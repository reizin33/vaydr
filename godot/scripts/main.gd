extends Node3D
## VAYDR no Godot (protótipo 0.1): monta o mundo, o céu e o dia, o jogador, a tela, a construção e os zumbis.
## Modos para os testes da nuvem: "-- --teste" (sem tela, confere coleta, fabricação, construção e zumbi) e
## "-- --fotos" (tira as fotos de conferência em fotos/).

var terreno: Terreno
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
const SPAWN := Vector3(0, 0, 6)
const SEG_POR_HORA := 50.0


func _ready() -> void:
	var args := OS.get_cmdline_user_args()
	modo_teste = "--teste" in args or "--fotos" in args
	_teclas()
	_ambiente()
	terreno = Terreno.new()
	add_child(terreno)
	terreno.montar()
	mundo = Mundo.new(terreno)
	add_child(mundo)
	mundo.montar()
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
	_zumbis_vila()
	if "--teste" in args:
		_vigia(240.0, "TESTE")
		_teste.call_deferred()
	elif "--fotos" in args:
		_vigia(800.0, "FOTOS")
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
	amb.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
	amb.ambient_light_energy = 0.5
	amb.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	amb.tonemap_exposure = 1.0
	amb.tonemap_white = 6.0
	amb.fog_enabled = true
	amb.fog_light_color = Color(0.52, 0.6, 0.68)
	amb.fog_density = 0.0055
	amb.fog_sky_affect = 0.3
	amb.glow_enabled = true
	amb.glow_intensity = 0.35
	amb.glow_bloom = 0.04
	amb.adjustment_enabled = true
	amb.adjustment_saturation = 1.08
	amb.adjustment_contrast = 1.08
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
	sol.light_energy = 1.15 * dia_k
	sol.visible = dia_k > 0.01
	var por := clampf(1.0 - absf(alt) * 4.0, 0.0, 1.0) * (1.0 if alt > -0.1 else 0.0)
	sol.light_color = Color(1.0, 0.95, 0.86).lerp(Color(1.0, 0.62, 0.38), por)
	lua.light_energy = 0.16 * (1.0 - dia_k)
	var noite_k := 1.0 - clampf((alt + 0.15) * 4.0, 0.0, 1.0)
	ceu.sky_top_color = Color(0.2, 0.38, 0.68).lerp(Color(0.02, 0.03, 0.07), noite_k)
	ceu.sky_horizon_color = Color(0.6, 0.7, 0.8).lerp(Color(0.95, 0.6, 0.4), por * 0.7).lerp(Color(0.05, 0.06, 0.1), noite_k)
	amb.fog_light_color = Color(0.52, 0.6, 0.68).lerp(Color(0.75, 0.52, 0.4), por * 0.5).lerp(Color(0.03, 0.04, 0.07), noite_k)
	amb.ambient_light_energy = lerpf(0.5, 0.1, noite_k)


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
	# voltou de outra janela (Alt+Tab): um clique prende o mouse de novo
	if not modo_teste and Input.mouse_mode == Input.MOUSE_MODE_VISIBLE and not ui.aberto and not ui.menu_aberto and jogador.vivo \
			and Input.is_action_just_pressed("atacar"):
		Input.mouse_mode = Input.MOUSE_MODE_CAPTURED


## Gráficos: baixo (PC fraco), médio e alto. Mexe no antisserrilhado, na resolução 3D, nas sombras, no brilho,
## na neblina e até onde a mata aparece.
func aplicar_qualidade(q: int) -> void:
	var cfg: Dictionary = [
		{"msaa": Viewport.MSAA_DISABLED, "escala": 0.75, "sombra": 2048, "dist": 40.0, "brilho": false, "mata": 0.55, "longe": 420.0, "neblina": 0.0085,
			"capim": 56, "capim_passo": 0.9},
		{"msaa": Viewport.MSAA_DISABLED, "escala": 1.0, "sombra": 2048, "dist": 75.0, "brilho": true, "mata": 0.8, "longe": 650.0, "neblina": 0.0055,
			"capim": 90, "capim_passo": 0.8},
		{"msaa": Viewport.MSAA_2X, "escala": 1.0, "sombra": 4096, "dist": 110.0, "brilho": true, "mata": 1.0, "longe": 900.0, "neblina": 0.0042,
			"capim": 120, "capim_passo": 0.75},
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
	grama.densidade(cfg["capim"], cfg["capim_passo"])


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
	if c.has_meta("bau"):
		return "E  Pegar suas coisas" if construcao.baus[c.get_meta("bau")].get("mochila", false) else "E  Abrir o baú"
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


func _teste() -> void:
	print("TESTE VAYDR Godot: começo")
	await _quadros(5)
	var F := Construcao.FUND
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
	_confere(jogador.inv.conta("bandagem") == 0 and jogador.item_mao().is_empty(), "começa de mão vazia (sem item de graça)")
	# andar e pular de verdade (pelas teclas)
	_por_em(Vector3(0, terreno.h(0, 10) + 0.2, 10))
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
	# coleta de verdade: o jogador vai até uma árvore e bate com a mão
	var arv: Dictionary = {}
	for r in mundo.recursos:
		if r["tipo"] == "arvore" and Vector2(r["pos"].x, r["pos"].z).distance_to(Vector2(jogador.global_position.x, jogador.global_position.z)) < 80:
			arv = r
			break
	if arv.is_empty():
		arv = mundo.recursos[0]
	var pa: Vector3 = arv["pos"]
	_por_em(pa + Vector3(1.4, 0.3, 0))
	await _quadros(10)
	_olhar(pa + Vector3(0, 1.3, 0))
	await _quadros(3)
	var m0 := jogador.inv.conta("madeira")
	for i in 4:
		jogador.cd = 0.0
		jogador.atacar()
		await _quadros(2)
	var com_mao := jogador.inv.conta("madeira") - m0
	_confere(com_mao > 0, "coleta: bater na árvore com a mão deu madeira (%d em 4 golpes)" % com_mao)
	# pedra com a mão
	var ped: Dictionary = {}
	for r in mundo.recursos:
		if r["tipo"] == "pedra" and Vector2(r["pos"].x, r["pos"].z).length() < 150:
			ped = r
			break
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
		_por_em(pa + Vector3(1.4, 0.3, 0))
		await _quadros(10)
		_olhar(pa + Vector3(0, 1.3, 0))
		await _quadros(3)
		var m1 := jogador.inv.conta("madeira")
		jogador.cd = 0.0
		jogador.atacar()
		var com_machado := jogador.inv.conta("madeira") - m1
		_confere(com_machado > com_mao / 4.0 * 2.0, "machado: %d de madeira num golpe (mão: %d em 4)" % [com_machado, com_mao])
	# construção: base 2x2 na clareira, paredes, porta, janela, piso e escada
	var ip := -1
	for i in Inventario.ESPACOS:
		if jogador.inv.slots[i] != null and jogador.inv.slots[i]["id"] == "plano":
			ip = i
	if ip >= Inventario.BARRA:
		jogador.inv.trocar(ip, 0)
		ip = 0
	jogador.selecionar(ip)
	_confere(construcao.ativo, "plano na mão liga a construção")
	_por_em(Vector3(10, terreno.h(10, 20) + 0.3, 20))
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
	# caixa da vila
	var L: Array = mundo.revistar(0)
	_confere(L.size() > 0 and not mundo.caixas[0]["cheia"], "caixa da vila tem coisa e fica vazia depois (%s)" % str(L))
	# água do lago
	var beira := Vector3.ZERO
	for k in 60:
		var dd := 20.0 + k * 0.5
		var q := Vector2(Terreno.LAGO.x + dd, Terreno.LAGO.y)
		if terreno.h(q.x, q.y) > Terreno.AGUA + 0.15:
			beira = Vector3(q.x, terreno.h(q.x, q.y), q.y)
			break
	if beira != Vector3.ZERO:
		_por_em(beira + Vector3(0.3, 0.2, 0))
		await _quadros(15)
		_olhar(Vector3(beira.x - 2.5, Terreno.AGUA, beira.z))
		jogador.sede = 40.0
		jogador.usar()
		_confere(jogador.sede > 60.0, "beber água no lago (sede %d)" % int(jogador.sede))
	else:
		_confere(false, "achar a beira do lago")
	_confere(jogador.fome < 100.0 and jogador.sede < 100.0, "fome e sede caem com o tempo")
	# zumbi: nasce perto, caça, bate e morre com os golpes
	_por_em(Vector3(-20, terreno.h(-20, 30) + 0.3, 30))
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
	_confere(jogador.vivo and jogador.inv.conta("madeira") == 0, "renasceu na clareira de mão vazia")
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
	await _quadros(24)
	await RenderingServer.frame_post_draw
	var img := get_viewport().get_texture().get_image()
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path("res://fotos"))
	img.save_jpg(ProjectSettings.globalize_path("res://fotos/%s.jpg" % nome), 0.86)
	var dc := RenderingServer.get_rendering_info(RenderingServer.RENDERING_INFO_TOTAL_DRAW_CALLS_IN_FRAME)
	var pr := RenderingServer.get_rendering_info(RenderingServer.RENDERING_INFO_TOTAL_PRIMITIVES_IN_FRAME)
	print("foto %s: %d chamadas de desenho, %d mil triângulos, %d fps (software)" % [nome, dc, pr / 1000, Engine.get_frames_per_second()])


## põe a câmera num ponto do chão olhando para o alvo (relativo: a altura do alvo conta a partir do chão de lá)
func _cam(pos: Vector3, alvo: Vector3, relativo := true) -> void:
	_por_em(Vector3(pos.x, terreno.h(pos.x, pos.z) + 0.2, pos.z))
	await _quadros(3)
	if relativo:
		alvo.y += terreno.h(alvo.x, alvo.z)
	_olhar(alvo)


func _fotos() -> void:
	await _quadros(60)
	hora = 9.5
	await _cam(Vector3(0, 0, 14), Vector3(0, 2.5, -60))
	await _foto("1_clareira")
	jogador.inv.por("pedra", 120)
	jogador.inv.por("fibra", 30)
	jogador.inv.por("madeira", 260)
	jogador.inv.por("machado", 1)
	ui.abrir(true)
	await _foto("7_mochila")
	ui.abrir(false)
	jogador.inv = Inventario.new()
	jogador.inv.mudou.connect(jogador._atualizar_mao)
	jogador.inv.mudou.connect(ui.atualizar)
	ui.atualizar()
	await _cam(Vector3(-40, 0, -70), Vector3(-80, 2.0, -120))
	await _foto("2_mata")
	await _cam(Vector3(40, 0, -20), Vector3(Terreno.VILA.x, 2.0, Terreno.VILA.y))
	await _foto("3_vila")
	# machado na mão, de frente para uma árvore
	jogador.inv.por("machado", 1)
	for i in Inventario.BARRA:
		if jogador.inv.slots[i] != null and jogador.inv.slots[i]["id"] == "machado":
			jogador.selecionar(i)
	for r in mundo.recursos:
		if r["tipo"] == "arvore" and Vector2(r["pos"].x, r["pos"].z).length() < 90:
			var pa: Vector3 = r["pos"]
			_por_em(pa + Vector3(1.8, 0.3, 0.6))
			await _quadros(6)
			_olhar(pa + Vector3(0, 1.5, 0))
			break
	await _foto("8_machado_na_mao")
	jogador.inv.tirar("machado", 1)
	# uma base pequena montada pelo próprio sistema de construção
	jogador.inv.por("madeira", 900)
	_por_em(Vector3(12, terreno.h(12, 22) + 0.3, 22))
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
		await _foto("4_base_fim_de_tarde")
		# dentro da base, olhando a escada
		hora = 12.0
		_por_em(b0["xf"] * Vector3(0.6, F + 0.05, 3.6))
		await _quadros(6)
		_olhar(b0["xf"] * Vector3(3.0, F + 1.2, 0.0))
		await _foto("9_escada_por_dentro")
		hora = 21.5
		jogador.inv.por("fogueira", 1)
		_por_em(b0["xf"] * Vector3(-4.0, 0.3, 1.5))
		jogador.global_position.y = terreno.h(jogador.global_position.x, jogador.global_position.z) + 0.3
		await _quadros(4)
		_olhar(jogador.global_position + Vector3(0, -1.2, -1.8))
		await _quadros(2)
		construcao.por_fogueira(jogador)
		await _cam(b0["xf"] * Vector3(-9.0, 0, -2.0), b0["xf"] * Vector3(-3.0, 1.0, 1.5), false)
		await _foto("5_noite_fogueira")
	jogador.selecionar(5)
	hora = 10.0
	for z in zumbis:
		if is_instance_valid(z):
			z.queue_free()
	var zz := _nascer(Vector3(30, 0, 40), false)
	zz.estado = "vaga"
	await _cam(Vector3(30, 0, 44.5), Vector3(30, 1.2, 40))
	await _foto("6_zumbi")
	get_tree().quit()
