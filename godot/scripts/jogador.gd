class_name Jogador
extends CharacterBody3D
## Sobrevivente em primeira pessoa: anda, corre, agacha, pula, bate (coleta), fabrica, constrói, come e bebe. A coleta é a
## do jogo antigo: árvore aguenta 5 golpes de machado (1 ou 2 de madeira por golpe e mais um tanto quando cai), na mão sai
## 1 madeira a cada 3 socos (2 com uma pedra na mão), rocha só com picareta (2 pedras por golpe, às vezes minério de ferro).
## Ferramenta e arma gastam a cada golpe e quebram. A roupa protege do dano.

signal morreu

const ANDA := 4.2
const CORRE := 6.6
const AGACHA := 2.0
const PULO := 6.2
const GRAV := 21.0
const ALCANCE := 2.6

var main: Node
var cam: Camera3D
var cabeca: Node3D
var mao: Node3D
var inv := Inventario.new()
var sel := 0
var vida := 100.0
var fome := 100.0
var sede := 100.0
var vivo := true
var agachado := false
var sens := 0.0022
var cd := 0.0
var balanco := 0.0
var golpe := 0.0
var ferramenta_no: Node3D = null
var ferramenta_id := ""
var passo := 0.0
var tremor := 0.0
var queda_v := 0.0
var preso := false   # menu aberto: não anda nem gira
var luz_mao: SpotLight3D
var vistos := {}         # itens que já passaram pela mochila (desbloqueiam receitas, como no jogo antigo)
var aprendidas := {}     # receitas aprendidas lendo folhas de receita e plantas (id -> true)
var consertos := 0       # quantas vezes consertou (desbloqueia a receita da fita)
var soco_mad := 0.0      # socos na árvore (a cada 3, 1 madeira)
var enjoo := 0.0         # dor de barriga (água suja, carne crua): segundos que faltam
var bateria := 100.0     # carga da lanterna de mão


func _init(m: Node) -> void:
	main = m


func _ready() -> void:
	var cs := CollisionShape3D.new()
	var cap := CapsuleShape3D.new()
	cap.radius = 0.34
	cap.height = 1.8
	cs.shape = cap
	cs.position.y = 0.9
	add_child(cs)
	cabeca = Node3D.new()
	cabeca.position.y = 1.62
	add_child(cabeca)
	cam = Camera3D.new()
	cam.fov = 75.0
	cam.near = 0.05
	cam.far = 900.0
	cabeca.add_child(cam)
	mao = Node3D.new()
	mao.position = Vector3(0.34, -0.42, -0.55)
	cam.add_child(mao)
	# lanterna: um facho de luz que sai da câmera quando ela está na mão
	luz_mao = SpotLight3D.new()
	luz_mao.light_color = Color(1.0, 0.95, 0.82)
	luz_mao.light_energy = 3.2
	luz_mao.spot_range = 34.0
	luz_mao.spot_angle = 26.0
	luz_mao.spot_attenuation = 0.9
	luz_mao.shadow_enabled = true
	luz_mao.position = Vector3(0.25, -0.2, -0.3)
	luz_mao.visible = false
	cam.add_child(luz_mao)
	floor_max_angle = deg_to_rad(48.0)
	floor_snap_length = 0.4
	_ligar_inv()


func _ligar_inv() -> void:
	inv.mudou.connect(_atualizar_mao)
	inv.chegou.connect(_visto)


func _visto(id: String) -> void:
	vistos[id] = true


func _unhandled_input(ev: InputEvent) -> void:
	if not vivo or preso:
		return
	if ev is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		rotate_y(-ev.relative.x * sens)
		cabeca.rotation.x = clampf(cabeca.rotation.x - ev.relative.y * sens, -1.45, 1.45)
	if ev is InputEventMouseButton and ev.pressed:
		if ev.button_index == MOUSE_BUTTON_WHEEL_UP:
			selecionar((sel + Inventario.BARRA - 1) % Inventario.BARRA)
		elif ev.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			selecionar((sel + 1) % Inventario.BARRA)


func selecionar(i: int) -> void:
	sel = i
	_atualizar_mao()


func item_mao() -> Dictionary:
	var s = inv.slots[sel]
	return s if s != null else {}


func _atualizar_mao() -> void:
	var it := item_mao()
	var id: String = it.get("id", "")
	if id == ferramenta_id:
		return
	ferramenta_id = id
	if ferramenta_no:
		ferramenta_no.queue_free()
		ferramenta_no = null
	if Dados.modelo(id) != "":
		var cena: PackedScene = load(Dados.modelo(id))
		ferramenta_no = cena.instantiate()
		# o modelo vem no espaço da mão do jogo antigo: cabo ao longo de +z, lâmina para -y
		ferramenta_no.rotation = Vector3(deg_to_rad(-70), deg_to_rad(10), deg_to_rad(0))
		ferramenta_no.scale = Vector3.ONE * 0.9
		mao.add_child(ferramenta_no)
	luz_mao.visible = id == "lanterna" and bateria > 0.0
	main.construcao.ativar(id == "plano")


func _physics_process(dt: float) -> void:
	if not vivo:
		return
	cd = maxf(0.0, cd - dt)
	# fome e sede
	fome = maxf(0.0, fome - dt / 22.0)
	sede = maxf(0.0, sede - dt / 15.0)
	if fome <= 0.0 or sede <= 0.0:
		ferir(dt * 0.8, false)
	elif fome > 60.0 and sede > 60.0 and vida < 100.0 and enjoo <= 0.0:
		vida = minf(100.0, vida + dt * 0.25)
	# dor de barriga: perde um pouco de vida e de água até passar (remédio corta)
	if enjoo > 0.0:
		enjoo -= dt
		ferir(dt * 0.25, false)
		sede = maxf(0.0, sede - dt * 0.15)
	# lanterna acesa gasta a pilha (10 minutos com a carga cheia)
	if luz_mao.visible:
		bateria = maxf(0.0, bateria - dt * 100.0 / 600.0)
		if bateria <= 0.0:
			luz_mao.visible = false
			main.ui.aviso("A pilha da lanterna acabou (pilhas: Trocar pilhas)")
	# movimento
	var dir := Vector3.ZERO
	if not preso:
		var mv := Input.get_vector("esquerda", "direita", "frente", "tras")
		dir = (transform.basis * Vector3(mv.x, 0, mv.y))
		dir.y = 0
		if dir.length() > 1.0:
			dir = dir.normalized()
		agachado = Input.is_action_pressed("agachar")
	var corre := Input.is_action_pressed("correr") and not agachado and not preso
	var vel := AGACHA if agachado else (CORRE if corre else ANDA)
	var alvo := dir * vel
	var k := 12.0 if is_on_floor() else 2.5
	velocity.x = lerpf(velocity.x, alvo.x, 1.0 - exp(-k * dt))
	velocity.z = lerpf(velocity.z, alvo.z, 1.0 - exp(-k * dt))
	if is_on_floor():
		if queda_v < -11.0:
			ferir((-queda_v - 11.0) * 6.0, false)
			tremor = 0.35
		queda_v = 0.0
		if Input.is_action_just_pressed("pular") and not preso:
			velocity.y = PULO
	else:
		velocity.y -= GRAV * dt
		queda_v = minf(queda_v, velocity.y)
	move_and_slide()
	# meio-fio, soleira e degrau (até 55 cm, como no jogo antigo): sobe andando
	if is_on_wall() and is_on_floor() and Vector2(alvo.x, alvo.z).length() > 0.5:
		Jogador.degrau(self, Vector3(alvo.x, 0, alvo.z) * dt)
	# cabeça: altura agachado, balanço do passo, tremor
	var hs := Vector2(velocity.x, velocity.z).length()
	cabeca.position.y = lerpf(cabeca.position.y, 1.05 if agachado else 1.62, 1.0 - exp(-10.0 * dt))
	if is_on_floor() and hs > 0.5:
		balanco += dt * hs * 1.9
		passo -= dt * hs
		if passo <= 0.0:
			passo = 1.9 if corre else 1.5
			main.sons.tocar("passo", global_position, -10.0 if agachado else -2.0)
	cam.position.y = sin(balanco * 2.0) * 0.035 * minf(1.0, hs / 4.0)
	cam.position.x = cos(balanco) * 0.025 * minf(1.0, hs / 4.0)
	tremor = maxf(0.0, tremor - dt)
	if tremor > 0.0:
		cam.position += Vector3(randf() - 0.5, randf() - 0.5, 0) * tremor * 0.15
	# mão: balanço do golpe
	golpe = maxf(0.0, golpe - dt * 3.2)
	var g := sin(golpe * PI) if golpe > 0.0 else 0.0
	mao.rotation = Vector3(-g * 1.2, g * 0.4, g * 0.3)
	mao.position = Vector3(0.34 - g * 0.12, -0.42 + cam.position.y * 0.5, -0.55 - g * 0.15)
	if global_position.y < -30.0:
		ferir(999.0, false)


func _process(_dt: float) -> void:
	if not vivo or preso:
		return
	for i in Inventario.BARRA:
		if Input.is_action_just_pressed("barra%d" % (i + 1)):
			selecionar(i)
	if Input.is_action_pressed("atacar") and cd <= 0.0:
		atacar()
	if Input.is_action_just_pressed("usar"):
		usar()


## o que a mira pega (até "alcance")
func mira(alcance: float, mascara := 3) -> Dictionary:
	var sp := get_world_3d().direct_space_state
	var o := cam.global_position
	var q := PhysicsRayQueryParameters3D.create(o, o - cam.global_transform.basis.z * alcance, mascara, [get_rid()])
	return sp.intersect_ray(q)


func atacar() -> void:
	var it := item_mao()
	var id: String = it.get("id", "")
	var d := Dados.item(id)
	var tp := str(d.get("tipo", ""))
	if tp == "plano":
		return
	if tp in ["comida", "bebida", "cura"]:
		consumir()
		return
	if id == "sacoDormir":
		main.construcao.por_saco(self)
		cd = 0.5
		return
	if tp in ["util", "material", "garrafa"] and d.has("acao"):
		usar_item(sel)
		cd = 0.5
		return
	var arma := tp == "arma"
	var st: Dictionary = d if arma else Dados.MAO
	cd = float(st.get("tempo", 0.55))
	golpe = 1.0
	main.sons.tocar("golpe", global_position, -8.0)
	var h := mira(float(st.get("alcance", 1.9)) + 0.7)
	if h.is_empty():
		return
	var c: Object = h["collider"]
	if c.has_meta("recurso"):
		_coletar(c.get_meta("recurso"), d, arma, h)
	elif c.has_meta("zumbi"):
		var z = c.get_meta("zumbi")
		z.ferir(float(st.get("dano", 9.0)), global_position)
		main.sons.tocar("acerto", h["position"], 0.0)
		main.efeitos.sangue(h["position"], h["normal"])
		if arma:
			_gastar()
	elif c.has_meta("peca") and bool(d.get("conserta", false)):
		var r: String = main.construcao.consertar(c.get_meta("peca"), inv)
		if r == "":
			consertos += 1
			main.efeitos.lascas(h["position"], h["normal"], "madeira")
			_gastar()
		else:
			main.ui.aviso(r)


## o golpe gastou a arma/ferramenta da mão (quebra quando acaba, como no jogo antigo)
func _gastar() -> void:
	var it := item_mao()
	if it.is_empty():
		return
	if inv.gastar(sel, 1.0):
		main.ui.aviso("%s quebrou." % Dados.nome(str(it["id"])))
		main.sons.tocar("pedra", global_position, -6.0)


func _ganhar(id: String, n: int, extra := {}) -> void:
	if n <= 0:
		return
	var sobra := inv.por(id, n, extra)
	if n - sobra > 0:
		main.ui.aviso("+%d %s" % [n - sobra, Dados.nome(id)])
	if sobra > 0:
		main.construcao.soltar_no_chao(global_position, [[id, sobra, extra]])
		main.ui.aviso("Sem espaço: %s ficou no chão" % Dados.nome(id))


## coleta do jogo antigo (árvore, rocha, tronco caído, moita e o que fica no chão)
func _coletar(i: int, d: Dictionary, arma: bool, h: Dictionary) -> void:
	var rec: Dictionary = main.mundo.recursos[i]
	var tp: String = rec["tipo"]
	match tp:
		"arvore":
			if arma and bool(d.get("corta", false)):
				var caiu: bool = main.mundo.golpe(i)
				_ganhar("madeira", 1 + (1 if randf() < float(d.get("rende", 0.5)) else 0))
				if caiu:
					_ganhar("madeira", maxi(2, roundi(1.5 * float(rec.get("s", 1.0)))))
				_gastar()
			elif arma:
				main.ui.aviso("Isso não corta árvore: use um machado (ou bata com a mão)")
				return
			else:
				# na mão: a cada 3 socos, 1 madeira; com uma pedra na mão, a cada 2 (e às vezes a pedra racha)
				soco_mad += 1.0
				if str(item_mao().get("id", "")) == "pedra":
					soco_mad += 0.5
					if randf() < 0.1:
						inv.usar_um(sel)
						main.ui.aviso("A pedra rachou")
				if soco_mad >= 3.0:
					soco_mad = 0.0
					main.mundo.golpe(i)
					_ganhar("madeira", 1)
			main.sons.tocar("madeira", h["position"], 0.0)
			main.efeitos.lascas(h["position"], h["normal"], "madeira")
		"pedra":
			if arma and bool(d.get("minera", false)):
				main.mundo.golpe(i)
				_ganhar("pedra", 2)
				if randf() < (0.5 if rec.get("serra", false) else 0.1):
					_ganhar("minerioFerro", 1)
				_gastar()
				main.sons.tocar("pedra", h["position"], 0.0)
				main.efeitos.lascas(h["position"], h["normal"], "pedra")
			else:
				main.ui.aviso("Rocha só quebra com picareta (2 pedras, 2 gravetos e 3 fibras)")
				main.sons.tocar("pedra", h["position"], -8.0)
		"tronco":
			if arma and bool(d.get("corta", false)):
				main.mundo.golpe(i)
				_ganhar("madeira", 2)
				_gastar()
				main.sons.tocar("madeira", h["position"], 0.0)
				main.efeitos.lascas(h["position"], h["normal"], "madeira")
			else:
				main.ui.aviso("Tronco caído: corte com o machado")
		_:
			_colher(i, h)


## moita e o que fica no chão: pega com E (ou batendo)
func _colher(i: int, h: Dictionary) -> void:
	var rec: Dictionary = main.mundo.recursos[i]
	if not main.mundo.golpe(i):
		return
	if rec["tipo"] == "planta":
		if rec.get("fruta", false):
			_ganhar("frutas", randi_range(2, 4))
			_ganhar("fibra", 1)
		else:
			_ganhar("fibra", randi_range(1, 2))
		main.sons.tocar("planta", h["position"], -3.0)
		main.efeitos.lascas(h["position"], h["normal"], "fibra")
		return
	match str(rec.get("nome", "")):
		"pedra":
			_ganhar("pedra", 1 + (1 if randf() < 0.5 else 0))
		"galho":
			_ganhar("graveto", 2 + (1 if randf() < 0.4 else 0))
		"fibra":
			_ganhar("fibra", 2 + (1 if randf() < 0.5 else 0))
		"cogumelo":
			_ganhar("cogumelo", 1)
	main.sons.tocar("caixa", h["position"], -3.0)


func usar() -> void:
	var h := mira(ALCANCE + 0.4)
	if not h.is_empty():
		var c: Object = h["collider"]
		if c.has_meta("caixa"):
			var L: Array = main.mundo.revistar(c.get_meta("caixa"))
			if L.is_empty():
				main.ui.aviso("Não tem nada aqui (volta a ter coisa depois)")
			for e in L:
				_ganhar(str(e[0]), int(e[1]), e[2] if e.size() > 2 else {})
			main.sons.tocar("caixa", h["position"], 0.0)
			return
		if c.has_meta("porta"):
			main.construcao.alternar_porta(c.get_meta("porta"))
			return
		if c.has_meta("bau"):
			var b: Dictionary = main.construcao.baus[c.get_meta("bau")]
			main.ui.abrir_bau(b["inv"], str(b.get("titulo", "Baú")))
			return
		if c.has_meta("obra"):
			main.construcao.interagir(c.get_meta("obra"), self)
			return
		if c.has_meta("agua"):
			_agua(true, str(main.mundo.aguas[c.get_meta("agua")]["nome"]))
			return
		if c.has_meta("recurso"):
			var i: int = c.get_meta("recurso")
			var rec: Dictionary = main.mundo.recursos[i]
			if rec["tipo"] in ["planta", "solto"]:
				_colher(i, h)
				return
	# rio ou lago (o mar é salgado): a água tem que estar logo ali na frente, para onde você olha
	for dist in [1.0, 1.5, 2.0, 2.5, 3.0]:
		var o: Vector3 = cam.global_position - cam.global_transform.basis.z * dist
		var nivel: float = main.terreno.nivel_agua(o.x, o.z)
		if nivel < -900.0 or absf(global_position.y - nivel) > 2.5:
			continue
		if main.terreno.tipo_agua(o.x, o.z) == 2:
			main.ui.aviso("Água do mar é salgada: não mata a sede")
			return
		_agua(false, "rio")
		return


## água: com garrafas vazias na mochila, enche todas (limpa no poço e no barril, suja no rio e no lago); sem garrafa, bebe ali
func _agua(limpa: bool, onde: String) -> void:
	var vazias := inv.conta("garrafa")
	if vazias > 0:
		inv.tirar("garrafa", vazias)
		_ganhar("agua" if limpa else "aguaSuja", vazias)
		main.ui.aviso("Encheu %d garrafa%s (%s)" % [vazias, "s" if vazias > 1 else "", "água limpa" if limpa else "água suja: ferva na fogueira"])
	else:
		sede = minf(100.0, sede + (30.0 if limpa else 25.0))
		main.ui.aviso("Você bebeu água (%s)" % onde)
		if not limpa and randf() < 0.3:
			_enjoar()
	main.sons.tocar("agua", global_position, -4.0)


func _enjoar() -> void:
	enjoo = maxf(enjoo, 60.0)
	main.ui.aviso("Dor de barriga: perde vida até passar (remédio ajuda)", 4.0)

## sobe um degrau de até "alt" m (meio-fio, soleira, degrau de escada): se um pouco mais alto dá para seguir andando
## e lá na frente tem chão, o corpo vai para cima dele. Serve para o jogador e para os zumbis.
static func degrau(c: CharacterBody3D, mov: Vector3, alt := 0.55) -> bool:
	var hz := Vector3(mov.x, 0.0, mov.z)
	if hz.length() < 0.0005:
		return false
	hz = hz.normalized() * maxf(hz.length(), 0.12)
	var xf := c.global_transform
	var sobe := Vector3(0, alt, 0)
	var col := KinematicCollision3D.new()
	if c.test_move(xf, sobe, col):
		sobe = col.get_travel()
		if sobe.y < 0.12:
			return false
	var alto := xf.translated(sobe)
	if c.test_move(alto, hz):
		return false
	var frente := alto.translated(hz)
	if not c.test_move(frente, -sobe - Vector3(0, 0.05, 0), col):
		return false
	if col.get_normal().y < 0.7:
		return false
	var y := frente.origin.y + col.get_travel().y
	if y - xf.origin.y < 0.02:
		return false
	c.global_position = Vector3(frente.origin.x, y + 0.01, frente.origin.z)
	return true


func consumir() -> void:
	consumir_slot(sel)


## come, bebe ou usa o remédio do espaço i (efeitos do jogo antigo: fome, sede, vida; a garrafa volta vazia; água suja e
## carne crua podem dar dor de barriga)
func consumir_slot(i: int) -> void:
	var it = inv.slots[i]
	if it == null:
		return
	var id: String = it["id"]
	var d := Dados.item(id)
	fome = clampf(fome + float(d.get("fome", 0.0)), 0.0, 100.0)
	sede = clampf(sede + float(d.get("sede", 0.0)), 0.0, 100.0)
	vida = clampf(vida + float(d.get("vida", 0.0)), 0.0, 100.0)
	inv.usar_um(i)
	if d.has("vira"):
		_ganhar(str(d["vira"]), 1)
	if float(d.get("suja", 0.0)) > 0.0 and randf() < float(d["suja"]):
		_enjoar()
	if id == "carneCrua" and randf() < 0.35:
		_enjoar()
	cd = 0.8
	var verbo := "Bebeu" if str(d.get("tipo", "")) == "bebida" else ("Usou" if str(d.get("tipo", "")) == "cura" else "Comeu")
	main.ui.aviso("%s: %s" % [verbo, d.get("nome", id)])
	main.sons.tocar("comer", global_position, -4.0)


## a ação de um item que não é de comer (a do jogo antigo: ler, trocar pilhas, remendar, purificar, tomar remédio...)
func usar_item(i: int) -> void:
	var it = inv.slots[i]
	if it == null:
		return
	var id: String = it["id"]
	var d := Dados.item(id)
	match id:
		"remedios":
			inv.usar_um(i)
			enjoo = 0.0
			vida = minf(100.0, vida + 6.0)
			main.ui.aviso("Tomou remédio: a dor de barriga passou")
		"pilhas":
			if bateria >= 99.0:
				main.ui.aviso("A lanterna já está com a pilha cheia")
				return
			inv.usar_um(i)
			bateria = minf(100.0, bateria + 50.0)
			main.ui.aviso("Trocou as pilhas da lanterna (%d%%)" % roundi(bateria))
		"fita":
			# remenda a ferramenta mais gasta (primeiro a da mão): devolve 35% do estado
			var alvo := -1
			var pior := 2.0
			for k in inv.limite:
				var s = inv.slots[k]
				if s == null or not s.has("dur"):
					continue
				var f := float(s["dur"]) / float(Dados.item(str(s["id"])).get("durMax", 1.0))
				if k == sel and f < 1.0:
					alvo = k
					break
				if f < pior:
					pior = f
					alvo = k
			if alvo < 0 or pior >= 1.0 and alvo != sel:
				main.ui.aviso("Nada gasto para remendar")
				return
			var s2: Dictionary = inv.slots[alvo]
			var mx := float(Dados.item(str(s2["id"])).get("durMax", 1.0))
			s2["dur"] = minf(mx, float(s2["dur"]) + mx * 0.35)
			inv.usar_um(i)
			main.ui.aviso("Remendou: %s" % Dados.nome(str(s2["id"])))
		"pastilha":
			if inv.conta("aguaSuja") <= 0:
				main.ui.aviso("Precisa de uma garrafa de água suja")
				return
			inv.tirar("aguaSuja", 1)
			inv.usar_um(i)
			_ganhar("agua", 1)
		"receita":
			var r := _aprender_uma()
			inv.usar_um(i)
			main.ui.aviso("Aprendeu: %s" % r if r != "" else "Você já sabia tudo o que estava escrito", 4.0)
		"plantaFerro", "plantaEstufa", "plantaRadio":
			aprendidas[id] = true
			inv.usar_um(i)
			main.ui.aviso("Aprendeu a construir com a %s" % Dados.nome(id), 4.0)
		"sacoDormir":
			main.construcao.por_saco(self)
		_:
			main.ui.aviso("%s: chega numa próxima etapa" % str(d.get("acao", d.get("nome", id))))


## folha de receita: aprende uma receita trancada (primeiro as de manual e de estudo)
func _aprender_uma() -> String:
	var opcoes := []
	for r in Dados.RECEITAS:
		var db = r.get("desb")
		if typeof(db) != TYPE_DICTIONARY or aprendidas.has(str(r["faz"])):
			continue
		if Fabricacao.desbloqueada(r, self):
			continue
		opcoes.append(r)
	if opcoes.is_empty():
		return ""
	var esc_r: Dictionary = opcoes[randi() % opcoes.size()]
	aprendidas[str(esc_r["faz"])] = true
	return Dados.nome(str(esc_r["faz"]))


func ferir(dano: float, tremer := true) -> void:
	if not vivo:
		return
	# a roupa segura parte do golpe (não da fome, da sede ou da queda) e gasta com isso
	if tremer:
		dano *= 1.0 - inv.protecao()
		for lugar in inv.roupa.keys():
			var r: Dictionary = inv.roupa[lugar]
			if lugar != "costas" and r.has("dur") and float(Dados.item(str(r["id"])).get("prot", 0.0)) > 0.0:
				r["dur"] = float(r["dur"]) - 1.0
				if float(r["dur"]) <= 0.0:
					inv.roupa.erase(lugar)
					main.ui.aviso("%s rasgou." % Dados.nome(str(r["id"])))
	vida -= dano
	if tremer:
		tremor = 0.25
		main.ui.dano()
		main.sons.tocar("dor", global_position, -2.0)
	if vida <= 0.0:
		vida = 0.0
		vivo = false
		morreu.emit()


func renascer(p: Vector3) -> void:
	global_position = p
	velocity = Vector3.ZERO
	vida = 100.0
	fome = 80.0
	sede = 80.0
	vivo = true
	queda_v = 0.0
	enjoo = 0.0
	inv = Inventario.new()
	_ligar_inv()
	ferramenta_id = "-"
	_atualizar_mao()
	inv.mudou.emit()
