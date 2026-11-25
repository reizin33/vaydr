class_name Veiculo
extends CharacterBody3D
## Um veículo do jogo antigo (47_carro.js), etapa 6j: a caminhonete, o carro, a moto e o triciclo. Cada um tem as peças com
## estado, como lá:
## · motor: perde com batidas, com a água funda e sem óleo; em 0 não pega. Conserta com peça de motor + kit de ferramentas.
## · pneus: furam em batidas e atropelando; furado deixa lento e puxa para o lado. Troca com pneu + kit.
## · óleo: gasta rodando; pouco óleo estraga o motor. Repõe com óleo de motor.
## · bateria: o carro, a caminhonete e a moto precisam dela para pegar.
## · lataria: batidas e zumbis (dentro da caminhonete e do carro eles batem na lataria e você leva só um pouco).
## · tanque (o galão de gasolina enche uma parte) e o porta-malas (a caminhonete leva 12, a moto 2).
## Dirigindo: W acelera, S freia e dá ré, A e D viram, Espaço é o freio de mão, clique buzina, F acende os faróis e E desce.
## A arrancada cai perto da velocidade máxima; fora da estrada fica mais lento (menos o triciclo); a água funda não passa;
## atropela e empurra os zumbis (o brutamontes amassa e freia); faz barulho (os zumbis ouvem de longe).

const TIPOS := {
	"caminhonete": {"nome": "Caminhonete", "art": "a", "maxV": 13.0, "ace": 3.0, "cons": 1.0, "galao": 50.0, "cap": 12, "ruido": 24.0,
		"hw": 1.0, "hd": 2.45, "alt": 1.75, "bateria": true, "cacamba": true, "fora": 0.9,
		"rodas": [[0.86, 0.42, 1.55, 1, 1.0], [-0.86, 0.42, 1.55, 1, 1.0], [0.86, 0.42, -1.55, 0, 1.0], [-0.86, 0.42, -1.55, 0, 1.0]],
		"assento": [0.42, 1.48, 0.12], "farol": [[0.68, 0.98, 2.47], [-0.68, 0.98, 2.47]], "camD": 7.4, "camH": 1.9},
	"sedan": {"nome": "Carro", "art": "o", "maxV": 14.5, "ace": 3.4, "cons": 0.8, "galao": 60.0, "cap": 8, "ruido": 20.0,
		"hw": 0.95, "hd": 2.15, "alt": 1.42, "bateria": true, "fora": 0.7,
		"rodas": [[0.8, 0.37, 1.3, 1, 0.88], [-0.8, 0.37, 1.3, 1, 0.88], [0.8, 0.37, -1.35, 0, 0.88], [-0.8, 0.37, -1.35, 0, 0.88]],
		"assento": [0.38, 1.18, -0.15], "farol": [[0.6, 0.72, 2.12], [-0.6, 0.72, 2.12]], "camD": 6.6, "camH": 1.6},
	"moto": {"nome": "Moto", "art": "a", "maxV": 16.0, "ace": 4.2, "cons": 0.45, "galao": 100.0, "cap": 2, "ruido": 26.0,
		"hw": 0.35, "hd": 1.05, "alt": 1.2, "bateria": true, "fora": 0.85, "exposto": true, "moto": true,
		"rodas": [[0.0, 0.33, 0.74, 1, 0.78], [0.0, 0.33, -0.72, 0, 0.78]],
		"assento": [0.0, 1.72, -0.3], "farol": [[0.0, 0.98, 0.95]], "camD": 5.2, "camH": 1.55},
	"triciclo": {"nome": "Triciclo", "art": "o", "maxV": 11.0, "ace": 3.2, "cons": 0.6, "galao": 80.0, "cap": 4, "ruido": 22.0,
		"hw": 0.75, "hd": 1.3, "alt": 1.22, "bateria": false, "fora": 1.0, "exposto": true,
		"rodas": [[0.0, 0.36, 0.98, 1, 0.86], [0.66, 0.38, -0.62, 0, 0.9], [-0.66, 0.38, -0.62, 0, 0.9]],
		"assento": [0.0, 1.7, -0.2], "farol": [[0.0, 0.92, 1.15]], "camD": 5.6, "camH": 1.6}}

var main
var tipo := ""
var T: Dictionary = {}
var uid := ""                # o nome do jogo antigo (caminhonete, sedanVila, motoCidade, triFazenda)
var v := 0.0                 # a velocidade para a frente (m/s; negativa é ré)
var steer := 0.0
var comb := 0.0              # o tanque (0 a 100)
var hp := 100.0              # a lataria
var pecas := {}              # motor, pneus [uma por roda], óleo, bateria
var porta: Inventario        # o porta-malas
var visto := false
var ativo := false           # alguém está dirigindo
var luz := true              # os faróis (F)
var giro := 0.0              # o giro das rodas
var buz := 0.0
var pitch := 0.0
var roll := 0.0
var acel := 0.0              # o acelerador agora (o som do motor sobe junto)
var freando := false
var lan := false             # boneco: o veículo de quem abriu a partida, aqui no convidado
var corpo: Node3D            # o desenho (inclina com o chão)
var base_mi: MeshInstance3D
var cabine_mi: MeshInstance3D
var rodas_mi: Array = []
var farois: Array = []
var mat_farol: StandardMaterial3D
var mat_lanterna: StandardMaterial3D
var som: AudioStreamPlayer3D
var fumaca: CPUParticles3D
var _ruido_t := 0.0
var _estrada_t := 0.0
var _na_estrada := true
var _dica_oleo := false
var _dica_comb := false
var _assentar := 2           # quadros para assentar no chão depois de parar ou nascer
var _lan_p := Vector3.ZERO
var _lan_yaw := 0.0
var _lan_pr := Vector2.ZERO
var _antes_rede := {}

static var _mat_c: StandardMaterial3D
static var _mat_v: StandardMaterial3D


func _init(m, t: String, id_: String) -> void:
	main = m
	tipo = t
	T = TIPOS[t]
	uid = id_
	name = "Veiculo_" + id_
	porta = Inventario.new(int(T["cap"]), false)
	var pn: Array = []
	for w in T["rodas"]:
		pn.append(100.0)
	pecas = {"motor": 100.0, "pneus": pn, "oleo": 80.0, "bateria": true}
	set_meta("veiculo", self)
	collision_layer = 1
	collision_mask = 1


func _ready() -> void:
	var cs := CollisionShape3D.new()
	var bx := BoxShape3D.new()
	var h: float = float(T["alt"]) - 0.3
	bx.size = Vector3(float(T["hw"]) * 2.0, h, float(T["hd"]) * 2.0)
	cs.shape = bx
	cs.position.y = 0.3 + h / 2.0
	add_child(cs)
	if main.terreno.corpo_chao != null:
		add_collision_exception_with(main.terreno.corpo_chao)
	corpo = Node3D.new()
	add_child(corpo)
	var M := ModelosCarros.malhas(tipo)
	mat_farol = StandardMaterial3D.new()
	mat_farol.albedo_color = Color(1.0, 0.95, 0.82)
	mat_farol.emission_enabled = true
	mat_farol.emission = Color(1.0, 0.93, 0.75)
	mat_farol.emission_energy_multiplier = 0.0
	mat_lanterna = StandardMaterial3D.new()
	mat_lanterna.albedo_color = Color(0.55, 0.07, 0.05)
	mat_lanterna.emission_enabled = true
	mat_lanterna.emission = Color(1.0, 0.1, 0.05)
	mat_lanterna.emission_energy_multiplier = 0.0
	base_mi = _mi(M["base"], M["sup_base"])
	if M["cabine"] != null:
		cabine_mi = _mi(M["cabine"], M["sup_cabine"])
	for w in T["rodas"]:
		var mi := MeshInstance3D.new()
		mi.mesh = M["roda"]
		mi.material_override = _mat_corpo()
		corpo.add_child(mi)
		rodas_mi.append(mi)
	# os faróis de verdade (acendem de noite, com alguém dirigindo)
	for f in T["farol"]:
		var sl := SpotLight3D.new()
		sl.position = Vector3(float(f[0]), float(f[1]), float(f[2]) + 0.05)
		sl.rotation = Vector3(-0.1, PI, 0)
		sl.light_color = Color(1.0, 0.95, 0.84)
		sl.light_energy = 4.0 if (T["farol"] as Array).size() > 1 else 6.0
		sl.spot_range = 36.0
		sl.spot_angle = 30.0
		sl.spot_attenuation = 0.8
		sl.shadow_enabled = false
		sl.visible = false
		corpo.add_child(sl)
		farois.append(sl)
	# o motor (o som sobe com a velocidade e com o acelerador)
	som = AudioStreamPlayer3D.new()
	som.stream = main.sons.motor_loop()
	som.unit_size = 6.0
	som.max_distance = 70.0
	som.volume_db = -6.0
	add_child(som)
	# a fumaça do motor ruim
	fumaca = CPUParticles3D.new()
	fumaca.amount = 14
	fumaca.lifetime = 1.8
	fumaca.emitting = false
	fumaca.direction = Vector3.UP
	fumaca.spread = 18.0
	fumaca.initial_velocity_min = 0.8
	fumaca.initial_velocity_max = 1.6
	fumaca.gravity = Vector3(0, 0.4, 0)
	fumaca.scale_amount_min = 0.5
	fumaca.scale_amount_max = 1.0
	var gr := Gradient.new()
	gr.set_color(0, Color(0.42, 0.42, 0.44, 0.45))
	gr.set_color(1, Color(0.5, 0.5, 0.5, 0.0))
	fumaca.color_ramp = gr
	var sm := SphereMesh.new()
	sm.radius = 0.3
	sm.height = 0.6
	sm.radial_segments = 8
	sm.rings = 4
	var fm := StandardMaterial3D.new()
	fm.vertex_color_use_as_albedo = true
	fm.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	fm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	sm.material = fm
	fumaca.mesh = sm
	fumaca.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	fumaca.position = Vector3(0, 0.9 if bool(T.get("moto", false)) else 1.25, float(T["hd"]) * 0.7)
	corpo.add_child(fumaca)
	_rodas(0.0)


static func _mat_corpo() -> StandardMaterial3D:
	if _mat_c == null:
		_mat_c = StandardMaterial3D.new()
		_mat_c.vertex_color_use_as_albedo = true
		_mat_c.vertex_color_is_srgb = true
		_mat_c.roughness = 0.66
		_mat_c.metallic = 0.12
		_mat_c.cull_mode = BaseMaterial3D.CULL_DISABLED
	return _mat_c


static func _mat_vidro() -> StandardMaterial3D:
	if _mat_v == null:
		_mat_v = StandardMaterial3D.new()
		_mat_v.albedo_color = Color(0.05, 0.08, 0.1)
		_mat_v.roughness = 0.07
		_mat_v.metallic = 0.45
		_mat_v.metallic_specular = 0.9
		_mat_v.cull_mode = BaseMaterial3D.CULL_DISABLED
	return _mat_v


func _mi(malha: ArrayMesh, sups: Array) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	mi.mesh = malha
	for i in sups.size():
		var s := str(sups[i])
		var m: Material = _mat_corpo()
		if s == "vidro":
			m = _mat_vidro()
		elif s == "farol":
			m = mat_farol
		elif s == "lanterna":
			m = mat_lanterna
		mi.set_surface_override_material(i, m)
	corpo.add_child(mi)
	return mi


# ================================================================ o estado
func nome() -> String:
	return str(T["nome"])


## o artigo: "a caminhonete", "o carro"
func o_a() -> String:
	return "a" if str(T["art"]) == "a" else "o"


func furados() -> int:
	var n := 0
	for q in pecas["pneus"]:
		if float(q) <= 0.0:
			n += 1
	return n


## dá para dirigir? ("" = sim; senão, o que falta)
func pode() -> String:
	if hp <= 0.0:
		return "%s destruíd%s" % [nome(), str(T["art"])]
	if float(pecas["motor"]) <= 0.0:
		return "O motor está quebrado"
	if bool(T.get("bateria", false)) and not bool(pecas["bateria"]):
		return "Sem bateria: não pega"
	if comb <= 0.0:
		return "Sem combustível"
	return ""


## o texto da mira, parado na frente dele
func texto() -> String:
	var nao := pode()
	if nao != "":
		return "%s: %s · toque E: o que falta · segure E: oficina" % [nome(), nao.to_lower()]
	return "E  Dirigir %s %s · %d%% de combustível · segure E: oficina e porta-malas" % [o_a(), nome().to_lower(), roundi(comb)]


## onde fica o olho de quem dirige (o assento, inclinando com o veículo)
func olho() -> Vector3:
	var a: Array = T["assento"]
	return corpo.global_transform * Vector3(float(a[0]), float(a[1]), float(a[2]))


func frente() -> Vector3:
	return Vector3(sin(rotation.y), 0, cos(rotation.y))


## a cabine some na primeira pessoa (você vê a estrada por cima do capô)
func mostrar_cabine(on: bool) -> void:
	if cabine_mi != null and cabine_mi.visible != on:
		cabine_mi.visible = on


# ================================================================ a física (como no jogo antigo: updateVeic)
## a força da arrancada pela velocidade: cheia parado, vai caindo até 12% perto do máximo (o carro "pesa" no fim)
static func _taper(vel: float, maxv: float) -> float:
	return 1.0 if vel <= 0.0 else maxf(0.12, 1.0 - pow(clampf(vel / maxv, 0.0, 1.0), 2.0))


func _physics_process(dt: float) -> void:
	if lan:
		_boneco(dt)
		return
	var j = main.jogador
	var dirige: bool = ativo and j != null and j.veiculo == self
	if not dirige and absf(v) < 0.02:
		v = 0.0
		acel = 0.0
		if _assentar > 0:
			_assentar -= 1
			_chao_e_inclinacao(1.0)
		_som(false)
		_luzes(false)
		_fumaca_passo(false)
		return
	_assentar = 2
	_mover(dt, dirige, j)
	_rodas(dt)
	_som(dirige)
	_luzes(dirige)
	_fumaca_passo(dirige)


func _mover(dt: float, dirige: bool, j) -> void:
	var acc := 0.0
	var strv := 0.0
	freando = false
	if dirige and not bool(j.preso):
		var mv := Input.get_vector("esquerda", "direita", "frente", "tras")
		acc = -mv.y
		strv = mv.x
		freando = Input.is_action_pressed("pular")
	var vivo: bool = hp > 0.0 and float(pecas["motor"]) > 0.0
	var tem := comb > 0.0
	if not vivo or not tem:
		acc = minf(acc, 0.0)
	acel = maxf(0.0, acc)
	var fur := furados()
	_estrada_t -= dt
	if _estrada_t <= 0.0:
		_estrada_t = 0.3
		_na_estrada = main.veiculos.na_estrada(global_position) if main.get("veiculos") != null else true
	var maxv: float = float(T["maxV"]) * (1.0 - 0.22 * fur) * (0.75 if float(pecas["motor"]) < 35.0 else 1.0) * (1.0 if _na_estrada else float(T.get("fora", 1.0)))
	var ace: float = float(T["ace"]) * (0.55 + 0.45 * float(pecas["motor"]) / 100.0)
	if acc > 0.05:
		v += ace * acc * dt * (2.0 if v < 0.0 else _taper(v, maxv))
	elif acc < -0.05:
		v += (-15.0 if v > 0.5 else -5.5) * (-acc) * dt
		if v > 0.5:
			freando = true
	else:
		v *= exp(-dt * 0.55)
	if freando and dirige and Input.is_action_pressed("pular"):
		v *= exp(-dt * 3.5)
	if not tem and dirige:
		v *= exp(-dt * 0.8)
	v = clampf(v, -6.0, maxv)
	if absf(v) < 0.03 and absf(acc) < 0.05:
		v = 0.0
	# o pneu furado puxa para o lado dele
	if fur > 0 and absf(v) > 2.0:
		var puxa := 0.0
		var R: Array = T["rodas"]
		for i in R.size():
			if float(pecas["pneus"][i]) <= 0.0:
				var w: Array = R[i]
				puxa -= signf(float(w[0])) * (0.25 if int(w[3]) == 1 else 0.12)
		strv = clampf(strv + puxa, -1.0, 1.0)
	steer = move_toward(steer, strv, dt * 3.2)
	var moto: bool = bool(T.get("moto", false))
	var giro_k: float = steer * clampf(absf(v) / 3.5, 0.0, 1.0) * (1.75 if moto else 1.55) \
		* (1.0 - 0.45 * clampf(absf(v) / float(T["maxV"]), 0.0, 1.0)) * (1.0 if v >= 0.0 else -1.0)
	rotation.y -= giro_k * dt
	var fr := frente()
	var hd: float = T["hd"]
	var hw: float = T["hw"]
	if v != 0.0:
		var antes := global_position
		var mov := fr * v * dt
		# a água funda na frente: o veículo não passa
		var pf := antes + fr * hd * 0.8 * signf(v)
		if _prof(pf.x, pf.z) > 1.15:
			v *= -0.2
			mov = Vector3.ZERO
		if mov != Vector3.ZERO:
			var col := move_and_collide(mov)
			if col != null:
				var nn := col.get_normal()
				nn.y = 0.0
				if nn.length() > 0.01:
					nn = nn.normalized()
					var de_frente := clampf(-fr.dot(nn) * signf(v), 0.0, 1.0)
					var hit := absf(v) * de_frente
					if hit > 3.0:
						_bateu(hit, dirige, j)
						v *= -0.25
					else:
						v *= 1.0 - 0.55 * de_frente
						var resto := col.get_remainder().slide(nn)
						resto.y = 0.0
						move_and_collide(resto)
		giro += v * dt / 0.42
		# fora do mapa: volta
		var p := global_position
		if not main.terreno.dentro(p.x, p.z):
			global_position = Vector3(antes.x, p.y, antes.z)
			v *= 0.5
	_chao_e_inclinacao(dt)
	# a água: freia; o motor afoga na água funda
	var pr := _prof(global_position.x, global_position.z)
	if pr > 0.45:
		v *= exp(-dt * 2.2 * pr)
		if dirige and vivo and pr > 0.8:
			pecas["motor"] = maxf(0.0, float(pecas["motor"]) - 22.0 * dt)
			if float(pecas["motor"]) <= 0.0:
				main.ui.aviso("O motor afogou na água", 5.0)
	_atropelar(dt, dirige, j, fr, hd, hw)
	# o combustível, o óleo e o barulho
	if dirige and tem and vivo:
		comb = maxf(0.0, comb - (0.02 + absf(v) * 0.012) * float(T["cons"]) * dt)
		if absf(v) > 0.5:
			pecas["oleo"] = maxf(0.0, float(pecas["oleo"]) - dt * 0.01 * (0.4 + absf(v) / float(T["maxV"])))
		if float(pecas["oleo"]) < 12.0:
			pecas["motor"] = maxf(0.0, float(pecas["motor"]) - dt * 0.3)
			if not _dica_oleo:
				_dica_oleo = true
				main.ui.aviso("O óleo acabou e o motor está esquentando. Ponha óleo de motor (segure E perto do veículo).", 7.0)
		_ruido_t -= dt
		if _ruido_t <= 0.0:
			_ruido_t = 0.5
			main.barulho(global_position, float(T["ruido"]) * (1.0 if absf(v) > 1.0 else 0.5))
		if comb <= 0.0 and not _dica_comb:
			_dica_comb = true
			main.ui.aviso("A gasolina acabou. Ache outro galão no posto, nos carros ou no depósito de combustível e abasteça.", 7.0)
	if buz > 0.0:
		buz -= dt


## bateu de frente forte: amassa (acima de 7 m/s machuca a lataria e o motor; acima de 9 pode furar um pneu)
func _bateu(hit: float, dirige: bool, j) -> void:
	if hit > 7.0:
		var d := (hit - 7.0) * 2.0
		hp = maxf(0.0, hp - d)
		pecas["motor"] = maxf(0.0, float(pecas["motor"]) - d * 0.35)
		if hit > 9.0 and randf() < 0.4:
			var i: int = randi() % (pecas["pneus"] as Array).size()
			pecas["pneus"][i] = maxf(0.0, float(pecas["pneus"][i]) - 60.0)
		main.sons.tocar("quebrar", global_position, 0.0)
		if dirige:
			j.tremor = minf(1.0, hit * 0.06)
			if bool(T.get("exposto", false)) and hit > 9.0:
				j.ferir((hit - 8.0) * 3.0, true, global_position + frente() * 2.0)
				main.ui.aviso("Você bateu feio", 3.0)
	else:
		main.sons.tocar("madeira", global_position, -6.0)
		if dirige:
			j.tremor = maxf(float(j.tremor), 0.15)


## a altura do chão de verdade num ponto (o piso, a ponte ou a terra), de perto do veículo para baixo
func _chao(x: float, z: float, y0: float) -> float:
	var fora: Array[RID] = [get_rid()]
	if main.jogador != null:
		fora.append(main.jogador.get_rid())
	var q := PhysicsRayQueryParameters3D.create(Vector3(x, y0 + 1.3, z), Vector3(x, y0 - 5.0, z), 1, fora)
	var h := get_world_3d().direct_space_state.intersect_ray(q)
	if h.is_empty() or h["collider"] is CharacterBody3D:
		return main.terreno.h(x, z)
	return (h["position"] as Vector3).y


## o chão em 4 pontos: a altura e a inclinação (a moto deita na curva)
func _chao_e_inclinacao(dt: float) -> void:
	var moto: bool = bool(T.get("moto", false))
	var hd: float = T["hd"]
	var hw: float = T["hw"]
	var hf := 0.74 if moto else hd * 0.63
	var hl := 0.01 if moto else hw * 0.86
	var p := global_position
	var fr := frente()
	var rx := Vector3(cos(rotation.y), 0, -sin(rotation.y))
	var gF := _chao(p.x + fr.x * hf, p.z + fr.z * hf, p.y)
	var gB := _chao(p.x - fr.x * hf, p.z - fr.z * hf, p.y)
	var gL := _chao(p.x + rx.x * hl, p.z + rx.z * hl, p.y)
	var gR := _chao(p.x - rx.x * hl, p.z - rx.z * hl, p.y)
	global_position.y = (gF + gB + gL + gR) / 4.0
	var k := minf(1.0, dt * 10.0)
	pitch = lerpf(pitch, -atan2(gF - gB, hf * 2.0), k)
	if moto:
		roll = lerpf(roll, steer * 0.32 * clampf(absf(v) / 8.0, 0.0, 1.0), minf(1.0, dt * 6.0))
	else:
		roll = lerpf(roll, atan2(gL - gR, hl * 2.0), k)
	corpo.rotation = Vector3(pitch, 0, roll)


func _prof(x: float, z: float) -> float:
	var n: float = main.terreno.nivel_agua(x, z)
	if n < -900.0:
		return 0.0
	return maxf(0.0, n - main.terreno.h(x, z))


## atropela e empurra os zumbis da frente (o brutamontes e o Colosso amassam e freiam); os bichos também
func _atropelar(_dt: float, dirige: bool, j, fr: Vector3, hd: float, hw: float) -> void:
	var sp := absf(v)
	if sp < 0.2 and not dirige:
		return
	var p := global_position
	var rx := Vector3(cos(rotation.y), 0, -sin(rotation.y))
	var moto: bool = bool(T.get("moto", false))
	for z in main.zumbis:
		if not is_instance_valid(z) or z.estado == "morto":
			continue
		var d: Vector3 = z.global_position - p
		if d.x * d.x + d.z * d.z > 16.0 or absf(d.y) > 2.2:
			continue
		var lz := d.dot(fr)
		var lx := d.dot(rx)
		if absf(lz) > hd + 0.15 or absf(lx) > hw + 0.25:
			continue
		if sp > 3.2 and z.estado not in ["atordoado", "derrubado", "levanta"]:
			var br: bool = bool(z.S.get("pesado", false)) or bool(z.S.get("chefe", false))
			var de: Vector3 = z.global_position - fr * signf(v) * 2.0
			z.ferir(sp * (5.0 if br else 10.0) * (0.6 if moto else 1.0), de, 0, {"k": "veiculo", "forte": true, "derruba": 0.0 if br else 1.0,
				"empurra": 0.6 if br else 2.4})
			v *= 0.55 if br else (0.75 if moto else 0.9)
			hp = maxf(0.0, hp - (4.0 if br else 1.2))
			if randf() < 0.025:
				var i: int = randi() % (pecas["pneus"] as Array).size()
				pecas["pneus"][i] = maxf(0.0, float(pecas["pneus"][i]) - 40.0)
			main.efeitos.sangue(z.global_position + Vector3(0, 1.0, 0), fr)
			main.sons.tocar("acerto", z.global_position, 2.0)
			if dirige:
				j.tremor = maxf(float(j.tremor), 0.25)
				if moto and br:
					j.ferir(10.0, true, z.global_position)
		# empurra para o lado (não fica entalado embaixo)
		var push := hw + 0.3 - absf(lx)
		if push > 0.0 and not z.lan:
			var s := 1.0 if lx >= 0.0 else -1.0
			z.global_position += rx * s * push * 0.5
	if sp > 3.2 and main.fauna != null:
		for b in main.fauna.bichos:
			if not is_instance_valid(b) or not b.vivo:
				continue
			var d: Vector3 = b.global_position - p
			if d.x * d.x + d.z * d.z > 20.0 or absf(d.y) > 2.2:
				continue
			var r: float = float(b.S.get("r", 0.5))
			if absf(d.dot(fr)) > hd + r or absf(d.dot(rx)) > hw + r:
				continue
			var gr: bool = str(b.S.get("porte", "")) == "grande" or r > 0.7
			b.ferir(sp * (6.0 if gr else 12.0), p - fr * signf(v) * 2.0, "veiculo", 0)
			v *= 0.45 if gr else 0.85
			hp = maxf(0.0, hp - (8.0 if gr else 1.0))
			if dirige:
				j.tremor = maxf(float(j.tremor), 0.5 if gr else 0.2)


func _rodas(dt: float) -> void:
	var R: Array = T["rodas"]
	var moto: bool = bool(T.get("moto", false))
	for i in R.size():
		var w: Array = R[i]
		var mi: MeshInstance3D = rodas_mi[i]
		var sc: float = float(w[4])
		var fu := float(pecas["pneus"][i]) <= 0.0
		var dr := float(w[0]) < 0.0
		var vira := (-steer * 0.5 if int(w[3]) == 1 else 0.0) + (PI if dr else 0.0)
		mi.position = Vector3(float(w[0]), float(w[1]) * (0.82 if fu else 1.0), float(w[2]))
		mi.basis = Basis.from_euler(Vector3(-giro if dr else giro, vira, 0), EULER_ORDER_YXZ) * Basis.from_scale(Vector3(0.5 if moto else sc, sc * (0.85 if fu else 1.0), sc))


func _som(dirige: bool) -> void:
	var ligado: bool = dirige and hp > 0.0 and float(pecas["motor"]) > 0.0 and comb > 0.0
	if not ligado:
		if som.playing:
			som.stop()
		return
	if not som.playing:
		som.play()
	var k := absf(v) / float(T["maxV"])
	som.pitch_scale = clampf(0.55 + k * 1.15 + acel * 0.22, 0.4, 2.2) * (1.25 if bool(T.get("moto", false)) else 1.0)
	som.volume_db = -9.0 + acel * 4.0 + k * 3.0


func _luzes(dirige: bool) -> void:
	var noite: float = main.noite_k()
	var on: bool = dirige and luz and hp > 0.0 and noite > 0.1
	for sl in farois:
		if (sl as SpotLight3D).visible != on:
			(sl as SpotLight3D).visible = on
	mat_farol.emission_energy_multiplier = 2.6 if on else 0.0
	mat_lanterna.emission_energy_multiplier = (3.0 if freando else 1.4) if (on or (dirige and freando)) else 0.0


func _fumaca_passo(dirige: bool) -> void:
	var quer: bool = (hp < 35.0 or float(pecas["motor"]) < 25.0) and (dirige or hp < 35.0) and not lan
	if fumaca.emitting != quer:
		fumaca.emitting = quer


## buzina (clique dirigindo): os zumbis ouvem de longe
func buzinar() -> void:
	if buz > 0.0:
		return
	buz = 0.6
	main.sons.tocar("buzina", global_position, 2.0)
	main.barulho(global_position, 45.0)


## põe no chão (ao nascer, carregar ou descer): altura e inclinação na hora
func assentar() -> void:
	_chao_e_inclinacao(1.0)
	_chao_e_inclinacao(1.0)
	_rodas(0.0)


# ================================================================ entrar e sair
## um lugar livre para descer, perto (os de sempre e, sem nenhum, o mais perto em volta até 7 m)
func saida() -> Vector3:
	var hw: float = T["hw"]
	var hd: float = T["hd"]
	var op: Array = []
	if bool(T.get("moto", false)):
		op = [[0.9, 0.0], [-0.9, 0.0], [0.0, -1.6], [1.4, 0.0], [-1.4, 0.0], [0.0, 1.6], [0.0, -2.3]]
	else:
		op = [[hw + 0.7, 0.3], [-hw - 0.7, 0.3], [0.0, -hd - 0.85], [0.0, hd + 0.85], [hw + 1.3, 0.3], [-hw - 1.3, 0.3], [hw + 0.8, -hd * 0.7],
			[-hw - 0.8, -hd * 0.7], [hw + 0.8, hd * 0.7], [-hw - 0.8, hd * 0.7], [0.0, -hd - 1.6], [0.0, hd + 1.6]]
	var xf := global_transform
	for o in op:
		var q := xf * Vector3(float(o[0]), 0, float(o[1]))
		var c := _ponto_chao(q)
		if c != Vector3.INF and _livre(c):
			return c
	var r := 1.2
	while r <= 7.0:
		for k in 16:
			var a := rotation.y + k / 16.0 * TAU
			var q := global_position + Vector3(sin(a), 0, cos(a)) * r
			var c := _ponto_chao(q)
			if c != Vector3.INF and _livre(c) and absf(c.y - global_position.y) < 2.5:
				return c
		r += 0.4
	return Vector3.INF


func _ponto_chao(q: Vector3) -> Vector3:
	if not main.terreno.dentro(q.x, q.z):
		return Vector3.INF
	var y: float = main.chao_em(q.x, q.z, global_position.y + 1.6)["y"]
	return Vector3(q.x, y, q.z)


func _livre(p: Vector3) -> bool:
	var n: float = main.terreno.nivel_agua(p.x, p.z)
	if n > -900.0 and n - main.terreno.h(p.x, p.z) > 0.5:
		return false
	var sh := SphereShape3D.new()
	sh.radius = 0.4
	var q := PhysicsShapeQueryParameters3D.new()
	q.shape = sh
	q.transform = Transform3D(Basis.IDENTITY, p + Vector3(0, 0.95, 0))
	q.collision_mask = 1
	var fora: Array[RID] = [get_rid()]
	if main.jogador != null:
		fora.append(main.jogador.get_rid())
	q.exclude = fora
	return get_world_3d().direct_space_state.intersect_shape(q, 1).is_empty()


# ================================================================ a oficina do veículo (segure E perto dele)
func _kit(j) -> Dictionary:
	for i in j.inv.limite:
		var s = j.inv.slots[i]
		if s != null and str(s["id"]) == "kitFerramentas":
			return s
	return {}


func _gastar_kit(j, n: float) -> void:
	var s := _kit(j)
	if s.is_empty() or not s.has("dur"):
		return
	s["dur"] = float(s["dur"]) - n
	if float(s["dur"]) <= 0.0:
		var i: int = j.inv.slots.find(s)
		if i >= 0:
			j.inv.slots[i] = null
			j.inv.mudou.emit()
		main.ui.aviso("O kit de ferramentas acabou")


static func pct(x: float) -> String:
	return "%d%%" % roundi(clampf(x, 0.0, 100.0))


## o estado de cada peça (para a oficina e o HUD): [nome, valor, ruim]
func estado() -> Array:
	var L: Array = []
	L.append(["Combustível", pct(comb), comb < 15.0])
	L.append(["Motor", pct(float(pecas["motor"])), float(pecas["motor"]) < 35.0])
	L.append(["Lataria", pct(hp), hp < 35.0])
	var pn: Array = []
	for q in pecas["pneus"]:
		pn.append("furado" if float(q) <= 0.0 else pct(float(q)))
	L.append(["Pneus", " · ".join(PackedStringArray(pn)), furados() > 0])
	L.append(["Óleo", pct(float(pecas["oleo"])), float(pecas["oleo"]) < 15.0])
	if bool(T.get("bateria", false)):
		L.append(["Bateria", "ok" if bool(pecas["bateria"]) else "faltando", not bool(pecas["bateria"])])
	L.append(["Carga", "%d de %d" % [int(T["cap"]) - porta.livres(), int(T["cap"])], false])
	return L


## o que dá para fazer na oficina: [{id, t (o botão), s (o que gasta), ok}]
func acoes(j) -> Array:
	var kit := not _kit(j).is_empty()
	var tk := "" if kit else " (precisa do kit de ferramentas)"
	var A: Array = []
	var inv: Inventario = j.inv
	A.append({"id": "abastecer", "t": "Abastecer", "s": ("1 galão: +%d%%" % int(T["galao"])) if inv.conta("gasolina") > 0 else "sem galão de gasolina",
		"ok": inv.conta("gasolina") > 0 and comb < 97.0})
	if hp < 100.0:
		A.append({"id": "lataria", "t": "Consertar a lataria", "s": "3 sucata e 2 pregos: +35%", "ok": inv.conta("sucata") >= 3 and inv.conta("pregos") >= 2})
	if float(pecas["motor"]) < 100.0:
		A.append({"id": "motor", "t": "Consertar o motor", "s": "1 peça de motor" + tk, "ok": kit and inv.conta("pecaVeiculo") > 0})
	var fraco := false
	for q in pecas["pneus"]:
		if float(q) < 60.0:
			fraco = true
	if fraco:
		A.append({"id": "pneu", "t": "Trocar pneu", "s": "1 pneu" + tk, "ok": kit and inv.conta("pneu") > 0})
	if float(pecas["oleo"]) < 90.0:
		A.append({"id": "oleo", "t": "Pôr óleo", "s": "1 óleo de motor: +45%", "ok": inv.conta("oleoMotor") > 0})
	if bool(T.get("bateria", false)) and not bool(pecas["bateria"]):
		A.append({"id": "bateria", "t": "Instalar bateria", "s": "1 bateria automotiva" + tk, "ok": kit and inv.conta("bateriaVeic") > 0})
	A.append({"id": "carga", "t": "Porta-malas", "s": "%d de %d espaços" % [int(T["cap"]) - porta.livres(), int(T["cap"])], "ok": true})
	var nao := pode()
	A.append({"id": "dirigir", "t": "Dirigir", "s": nao if nao != "" else "pronto", "ok": nao == ""})
	return A


## faz a ação da oficina; devolve a mensagem
func fazer(id: String, j) -> String:
	var inv: Inventario = j.inv
	var kit := not _kit(j).is_empty()
	match id:
		"abastecer":
			if inv.conta("gasolina") <= 0:
				return "Sem galão de gasolina"
			if comb >= 97.0:
				return "O tanque já está cheio"
			inv.tirar("gasolina", 1)
			comb = minf(100.0, comb + float(T["galao"]))
			_dica_comb = false
			main.sons.tocar("pegar", global_position, 0.0)
			return "Abasteceu: %s de combustível" % pct(comb)
		"lataria":
			if inv.conta("sucata") < 3 or inv.conta("pregos") < 2:
				return "Precisa de 3 sucata e 2 pregos"
			inv.tirar("sucata", 3)
			inv.tirar("pregos", 2)
			hp = minf(100.0, hp + 35.0)
			main.sons.tocar("construir", global_position, 0.0)
			return "Lataria em " + pct(hp)
		"motor":
			if not kit or inv.conta("pecaVeiculo") <= 0:
				return "Precisa de 1 peça de motor e do kit de ferramentas"
			inv.tirar("pecaVeiculo", 1)
			pecas["motor"] = minf(100.0, float(pecas["motor"]) + 70.0)
			_gastar_kit(j, 3.0)
			j.consertos += 1
			main.sons.tocar("construir", global_position, 0.0)
			return "Motor em " + pct(float(pecas["motor"]))
		"pneu":
			if not kit or inv.conta("pneu") <= 0:
				return "Precisa de 1 pneu e do kit de ferramentas"
			var pn: Array = pecas["pneus"]
			var pior := 0
			for i in pn.size():
				if float(pn[i]) < float(pn[pior]):
					pior = i
			inv.tirar("pneu", 1)
			pn[pior] = 100.0
			_gastar_kit(j, 2.0)
			main.sons.tocar("construir", global_position, 0.0)
			return "Pneu trocado"
		"oleo":
			if inv.conta("oleoMotor") <= 0:
				return "Sem óleo de motor"
			inv.tirar("oleoMotor", 1)
			pecas["oleo"] = minf(100.0, float(pecas["oleo"]) + 45.0)
			_dica_oleo = false
			main.sons.tocar("pegar", global_position, 0.0)
			return "Óleo em " + pct(float(pecas["oleo"]))
		"bateria":
			if not kit or inv.conta("bateriaVeic") <= 0:
				return "Precisa de 1 bateria automotiva e do kit de ferramentas"
			inv.tirar("bateriaVeic", 1)
			pecas["bateria"] = true
			_gastar_kit(j, 1.0)
			main.sons.tocar("construir", global_position, 0.0)
			return "Bateria instalada"
	return ""


# ================================================================ a partida em rede: o veículo de quem abriu, aqui
## [x, y, z, giro, inclinação, deitada, velocidade, volante, giro das rodas, faróis/ligado/freando, combustível, lataria]
func para_rede() -> PackedFloat32Array:
	var fl := (1 if ativo else 0) | (2 if luz else 0) | (4 if freando else 0) | (8 if hp > 0.0 else 0)
	var p := global_position
	return PackedFloat32Array([p.x, p.y, p.z, rotation.y, pitch, roll, v, steer, giro, fl, comb, hp])


func rede(L: PackedFloat32Array, i: int) -> void:
	if not lan:
		_antes_rede = salvar()
		lan = true
		ativo = false
		collision_layer = 1
	_lan_p = Vector3(L[i], L[i + 1], L[i + 2])
	_lan_yaw = L[i + 3]
	_lan_pr = Vector2(L[i + 4], L[i + 5])
	v = L[i + 6]
	steer = L[i + 7]
	giro = L[i + 8]
	var fl := int(L[i + 9])
	luz = (fl & 2) != 0
	freando = (fl & 4) != 0
	comb = L[i + 10]
	hp = L[i + 11]
	set_meta("lan_ativo", (fl & 1) != 0)
	if global_position.distance_to(_lan_p) > 12.0:
		global_position = _lan_p
		rotation.y = _lan_yaw


func _boneco(dt: float) -> void:
	var k := 1.0 - exp(-dt * 12.0)
	global_position = global_position.lerp(_lan_p, k)
	rotation.y = lerp_angle(rotation.y, _lan_yaw, k)
	pitch = lerpf(pitch, _lan_pr.x, k)
	roll = lerpf(roll, _lan_pr.y, k)
	corpo.rotation = Vector3(pitch, 0, roll)
	_rodas(dt)
	var ligado: bool = bool(get_meta("lan_ativo", false)) and hp > 0.0
	if ligado and not som.playing:
		som.play()
	elif not ligado and som.playing:
		som.stop()
	if ligado:
		som.pitch_scale = clampf(0.55 + absf(v) / float(T["maxV"]) * 1.15, 0.4, 2.2)
	var noite: float = main.noite_k()
	var on := ligado and luz and noite > 0.1
	for sl in farois:
		(sl as SpotLight3D).visible = on
	mat_farol.emission_energy_multiplier = 2.6 if on else 0.0
	mat_lanterna.emission_energy_multiplier = (3.0 if freando else 1.4) if on else 0.0


func soltar_rede() -> void:
	if not lan:
		return
	lan = false
	if not _antes_rede.is_empty():
		carregar(_antes_rede)
	_antes_rede = {}


# ================================================================ jogo salvo
func salvar() -> Dictionary:
	if lan and not _antes_rede.is_empty():
		return _antes_rede.duplicate(true)
	var p := global_position
	return {"id": uid, "tipo": tipo, "x": snappedf(p.x, 0.01), "y": snappedf(p.y, 0.01), "z": snappedf(p.z, 0.01), "yaw": snappedf(rotation.y, 0.001),
		"comb": snappedf(comb, 0.001), "hp": roundi(hp), "pecas": pecas.duplicate(true), "itens": porta.salvar(), "visto": visto, "luz": luz}


func carregar(d: Dictionary) -> void:
	global_position = Vector3(float(d.get("x", global_position.x)), float(d.get("y", global_position.y)), float(d.get("z", global_position.z)))
	rotation.y = float(d.get("yaw", rotation.y))
	comb = clampf(float(d.get("comb", comb)), 0.0, 100.0)
	hp = clampf(float(d.get("hp", hp)), 0.0, 100.0)
	visto = bool(d.get("visto", false))
	luz = bool(d.get("luz", true))
	v = 0.0
	steer = 0.0
	ativo = false
	var pd = d.get("pecas", {})
	if pd is Dictionary:
		pecas["motor"] = clampf(float(pd.get("motor", pecas["motor"])), 0.0, 100.0)
		pecas["oleo"] = clampf(float(pd.get("oleo", pecas["oleo"])), 0.0, 100.0)
		pecas["bateria"] = bool(pd.get("bateria", pecas["bateria"]))
		var pn = pd.get("pneus", [])
		var R: Array = T["rodas"]
		if pn is Array and (pn as Array).size() == R.size():
			var L: Array = []
			for q in pn:
				L.append(clampf(float(q), 0.0, 100.0))
			pecas["pneus"] = L
	var it = d.get("itens", {})
	if it is Dictionary:
		porta.carregar(it)
	assentar()
