class_name Jogador
extends CharacterBody3D
## Sobrevivente em primeira pessoa: anda, corre, agacha, pula, bate (coleta), fabrica, constrói, come e bebe.

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
	mao.position = Vector3(0.32, -0.3, -0.5)
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
	inv.mudou.connect(_atualizar_mao)


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
	if id != "" and Dados.ITENS[id].has("modelo"):
		var cena: PackedScene = load(Dados.ITENS[id]["modelo"])
		ferramenta_no = cena.instantiate()
		# o modelo vem no espaço da mão do jogo antigo: cabo ao longo de +z, lâmina para -y
		ferramenta_no.rotation = Vector3(deg_to_rad(-70), deg_to_rad(10), deg_to_rad(0))
		ferramenta_no.scale = Vector3.ONE * 0.9
		mao.add_child(ferramenta_no)
	luz_mao.visible = id != "" and Dados.ITENS[id].get("luz", false)
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
	elif fome > 60.0 and sede > 60.0 and vida < 100.0:
		vida = minf(100.0, vida + dt * 0.25)
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
	mao.position = Vector3(0.32 - g * 0.12, -0.3 + cam.position.y * 0.5, -0.5 - g * 0.15)
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
	if id != "" and Dados.ITENS[id]["tipo"] in ["plano"]:
		return
	if id != "" and Dados.ITENS[id]["tipo"] in ["comida", "cura"]:
		consumir()
		return
	if id == "fogueira":
		main.construcao.por_fogueira(self)
		cd = 0.5
		return
	if id == "saco":
		main.construcao.por_saco(self)
		cd = 0.5
		return
	if id == "bau":
		main.construcao.por_bau(self)
		cd = 0.5
		return
	var d: Dictionary = Dados.ITENS[id] if id != "" and Dados.ITENS[id]["tipo"] == "ferramenta" else Dados.MAO
	cd = d["tempo"]
	golpe = 1.0
	main.sons.tocar("golpe", global_position, -8.0)
	var h := mira(ALCANCE)
	if h.is_empty():
		return
	var c: Object = h["collider"]
	if c.has_meta("recurso"):
		var i: int = c.get_meta("recurso")
		var rec: Dictionary = main.mundo.recursos[i]
		var fator: float = d.get(rec["item"], 0.2) if rec["tipo"] != "planta" else 1.0
		var r: Array = main.mundo.bater(i, d["dano"], fator)
		if not r.is_empty():
			var sobra := inv.por(r[0], r[1])
			main.ui.aviso("+%d %s" % [r[1] - sobra, Dados.nome(r[0])])
			if rec["tipo"] == "planta":
				_frutinha()
		main.sons.tocar("madeira" if rec["item"] == "madeira" else ("pedra" if rec["item"] == "pedra" else "planta"), h["position"], 0.0)
		main.efeitos.lascas(h["position"], h["normal"], rec["item"])
	elif c.has_meta("zumbi"):
		var z = c.get_meta("zumbi")
		z.ferir(d["dano"], global_position)
		main.sons.tocar("acerto", h["position"], 0.0)
		main.efeitos.sangue(h["position"], h["normal"])
	elif c.has_meta("peca") and d.get("conserta", false):
		if main.construcao.consertar(c.get_meta("peca")):
			main.efeitos.lascas(h["position"], h["normal"], "madeira")


func usar() -> void:
	var h := mira(ALCANCE + 0.4)
	if not h.is_empty():
		var c: Object = h["collider"]
		if c.has_meta("caixa"):
			var L: Array = main.mundo.revistar(c.get_meta("caixa"))
			if L.is_empty():
				main.ui.aviso("A caixa está vazia (volta a ter coisa depois)")
			for s in L:
				var sobra := inv.por(s[0], s[1])
				main.ui.aviso("+%d %s" % [s[1] - sobra, Dados.nome(s[0])])
			main.sons.tocar("caixa", h["position"], 0.0)
			return
		if c.has_meta("porta"):
			main.construcao.alternar_porta(c.get_meta("porta"))
			return
		if c.has_meta("bau"):
			main.ui.abrir_bau(main.construcao.baus[c.get_meta("bau")]["inv"])
			return
		if c.has_meta("recurso"):
			var i: int = c.get_meta("recurso")
			if main.mundo.recursos[i]["tipo"] == "planta":
				var r: Array = main.mundo.bater(i, 1.0, 1.0)
				if not r.is_empty():
					inv.por(r[0], r[1])
					main.ui.aviso("+%d %s" % [r[1], Dados.nome(r[0])])
					main.sons.tocar("planta", h["position"], 0.0)
					main.efeitos.lascas(h["position"], h["normal"], "fibra")
					_frutinha()
				return
	# beber no lago
	var o := cam.global_position - cam.global_transform.basis.z * 1.5
	if main.terreno.na_agua(Vector3(o.x, Terreno.AGUA, o.z)) and global_position.distance_to(Vector3(o.x, Terreno.AGUA, o.z)) < 3.5:
		sede = minf(100.0, sede + 25.0)
		main.ui.aviso("Você bebeu água do lago")
		main.sons.tocar("agua", global_position, -4.0)


## às vezes a planta tem frutinha (comida que dá para achar no mato)
func _frutinha() -> void:
	if randf() < 0.35:
		var n := randi_range(1, 3)
		inv.por("fruta", n)
		main.ui.aviso("+%d %s" % [n, Dados.nome("fruta")])


func consumir() -> void:
	var it := item_mao()
	if it.is_empty():
		return
	var d: Dictionary = Dados.ITENS[it["id"]]
	fome = clampf(fome + d.get("fome", 0.0), 0.0, 100.0)
	sede = clampf(sede + d.get("sede", 0.0), 0.0, 100.0)
	vida = clampf(vida + d.get("vida", 0.0), 0.0, 100.0)
	inv.usar_um(sel)
	cd = 0.8
	main.ui.aviso("Usou: " + d["nome"])
	main.sons.tocar("comer", global_position, -4.0)


func ferir(dano: float, tremer := true) -> void:
	if not vivo:
		return
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
	inv = Inventario.new()
	inv.mudou.connect(_atualizar_mao)
	ferramenta_id = "-"
	_atualizar_mao()
	inv.mudou.emit()
