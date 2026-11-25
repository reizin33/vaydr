class_name Veiculo
extends CharacterBody3D
## Um veículo do jogo antigo (47_carro.js), etapa 6j: a caminhonete, o carro, a moto e o triciclo; na água (etapa 6k) o barco a
## motor do cais do lago e a jangada (você faz e põe na água). Cada um tem as peças com estado, como lá:
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
		"assento": [0.0, 1.7, -0.2], "farol": [[0.0, 0.92, 1.15]], "camD": 5.6, "camH": 1.6},
	# na água (etapa 6k): só anda onde tem água (encalha na margem), a correnteza do rio leva; a jangada é no remo
	"barco": {"nome": "Barco a motor", "art": "o", "maxV": 9.0, "ace": 2.4, "cons": 0.9, "galao": 50.0, "cap": 6, "ruido": 22.0,
		"hw": 0.95, "hd": 2.3, "alt": 1.1, "bateria": false, "agua": true, "exposto": true, "rodas": [],
		"assento": [0.0, 1.42, -1.4], "farol": [[0.0, 1.0, 2.1]], "camD": 7.0, "camH": 1.8},
	"jangada": {"nome": "Jangada", "art": "a", "maxV": 2.6, "ace": 1.6, "cons": 0.0, "galao": 0.0, "cap": 3, "ruido": 4.0,
		"hw": 1.2, "hd": 1.6, "alt": 0.75, "bateria": false, "agua": true, "exposto": true, "remo": true, "sem_motor": true, "rodas": [],
		"assento": [0.0, 1.25, -0.3], "farol": [], "camD": 6.0, "camH": 1.7},
	# no ar (etapa 6m): Espaço sobe, C desce, W e S para a frente e para trás, A e D giram; precisa das 2 peças de rotor
	"heli": {"nome": "Helicóptero", "art": "o", "maxV": 22.0, "ace": 3.5, "cons": 3.2, "galao": 25.0, "cap": 4, "ruido": 75.0,
		"hw": 1.4, "hd": 3.8, "alt": 2.9, "bateria": true, "voa": true, "rotor": true, "rodas": [],
		"assento": [0.4, 2.05, 1.15], "farol": [[0.0, 0.9, 2.6]], "camD": 11.0, "camH": 3.2}}

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
var motorista := 0           # quem abriu: o id do convidado que está dirigindo este (0: ninguém de fora)
var dono_rede := false       # no convidado: é o veículo de quem abriu que você está dirigindo (o seu jogo diz onde ele está)
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
var _remo_t := 0.0
var rotor := 0.0             # o helicóptero: o rotor ganhando força (0 parado, 1 sustenta)
var vy := 0.0
var alt := 0.0               # a altura do helicóptero sobre o chão (ou o telhado, ou a água)
var _helice_t := 0.0
var rotor_mi: MeshInstance3D
var cauda_mi: MeshInstance3D
var ultimo_choque := ""      # o que o veículo acertou por último (para os testes e para entender batidas estranhas)
var _criaturas := {}         # zumbis e bichos perto: não seguram o veículo como parede (quem resolve é o atropelamento)
var _criaturas_t := 0.0

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
	pecas = {"motor": 100.0, "pneus": pn, "oleo": 80.0, "bateria": true, "rotor": 2}
	set_meta("veiculo", self)
	# na água ninguém tropeça nele (só a mira pega, para o E); na terra é sólido
	collision_layer = 2 if bool(T.get("agua", false)) else 1
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
	if M.has("rotor"):
		rotor_mi = MeshInstance3D.new()
		rotor_mi.mesh = M["rotor"]
		rotor_mi.material_override = _mat_corpo()
		rotor_mi.position = Vector3(0, 2.75, 0.45)
		corpo.add_child(rotor_mi)
		cauda_mi = MeshInstance3D.new()
		cauda_mi.mesh = M["rotor_cauda"]
		cauda_mi.material_override = _mat_corpo()
		cauda_mi.position = Vector3(0.14, 2.25, -4.75)
		corpo.add_child(cauda_mi)
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
	if sem_motor():
		return ""
	if float(pecas["motor"]) <= 0.0:
		return "O motor está quebrado"
	if bool(T.get("bateria", false)) and not bool(pecas["bateria"]):
		return "Sem bateria: não pega"
	if voa() and int(pecas.get("rotor", 2)) < 2:
		return "Faltam peças de rotor (%d de 2)" % int(pecas.get("rotor", 0))
	if comb <= 0.0:
		return "Sem combustível"
	return ""


func voa() -> bool:
	return bool(T.get("voa", false))


func sem_motor() -> bool:
	return bool(T.get("sem_motor", false))


func na_agua() -> bool:
	return bool(T.get("agua", false))


## o texto da mira, parado na frente dele
func texto() -> String:
	var nao := pode()
	# o texto principal e, depois de dois espaços, a dica menor (como o HUD mostra)
	if nao != "":
		return "%s: %s  toque E: o que falta · segure E: oficina" % [nome(), nao.to_lower()]
	if sem_motor():
		return "E  Subir na %s  segure E: a carga" % nome().to_lower()
	if na_agua():
		return "E  Subir no %s  %d%% de combustível · segure E: oficina e carga" % [nome().to_lower(), roundi(comb)]
	if voa():
		return "E  Pilotar o helicóptero  %d%% de combustível · segure E: oficina e carga" % roundi(comb)
	return "E  Dirigir %s %s  %d%% de combustível · segure E: oficina e porta-malas" % [o_a(), nome().to_lower(), roundi(comb)]


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
	# o boneco: no convidado, o de quem abriu; em quem abriu, o que um convidado está dirigindo
	if lan or motorista != 0:
		_boneco(dt)
		return
	var j = main.jogador
	var dirige: bool = ativo and j != null and j.veiculo == self
	_criaturas_t -= dt
	if _criaturas_t <= 0.0 and (dirige or absf(v) > 0.05):
		_criaturas_t = 0.12
		_sem_colisao_criaturas()
	# no ar: o helicóptero (com o rotor girando ou no ar, a física dele; parado no chão, nada)
	if voa():
		if dirige or alt > 0.05 or rotor > 0.01 or absf(vy) > 0.01:
			_mover_voo(dt, dirige, j)
		_som(dirige)
		_luzes(dirige)
		_fumaca_passo(dirige)
		return
	# na água: sempre boiando (e a correnteza leva)
	if na_agua():
		_mover_agua(dt, dirige, j)
		_som(dirige)
		_luzes(dirige)
		_fumaca_passo(dirige)
		return
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
				var pc := col.get_position()
				var fc := col.get_collider_shape()
				ultimo_choque = "%s em (%.1f, %.1f) a %.2f m do chão%s" % [_nome_choque(col.get_collider()), pc.x, pc.z,
					pc.y - main.terreno.h(pc.x, pc.z), (" (" + (fc as Object).get_class() + ")") if fc is Object else ""]
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


## o barco e a jangada (updateBarco do jogo antigo): só na água; encalha na margem (batendo rápido machuca o casco); a correnteza
## do rio leva; a jangada no remo (W rema, A e D viram); bóia mexendo com a água
func _mover_agua(dt: float, dirige: bool, j) -> void:
	var acc := 0.0
	var strv := 0.0
	freando = false
	if dirige and not bool(j.preso):
		var mv := Input.get_vector("esquerda", "direita", "frente", "tras")
		acc = -mv.y
		strv = mv.x
	var sem := sem_motor()
	var motor_ok: bool = sem or (hp > 0.0 and float(pecas["motor"]) > 0.0 and comb > 0.0)
	if not motor_ok:
		acc = minf(0.0, acc) * 0.3
	acel = maxf(0.0, acc)
	var maxv: float = float(T["maxV"]) * (1.0 if sem else 0.6 + 0.4 * float(pecas["motor"]) / 100.0)
	if acc > 0.05:
		v += float(T["ace"]) * acc * dt * _taper(v, maxv)
	elif acc < -0.05:
		v -= float(T["ace"]) * 0.8 * (-acc) * dt
	else:
		v *= exp(-dt * (0.9 if sem else 0.45))
	v = clampf(v, -maxv * 0.4, maxv)
	if absf(v) < 0.02 and absf(acc) < 0.05:
		v = 0.0
	steer = move_toward(steer, strv, dt * 2.5)
	rotation.y -= steer * clampf(absf(v) / 2.0 + 0.25, 0.0, 1.0) * (0.8 if sem else 1.1) * dt * (1.0 if v >= 0.0 else -1.0)
	var fr := frente()
	var antes := global_position
	var mov := fr * v * dt
	# a correnteza do rio leva rio abaixo (mais forte em cima, mais fraca perto do lago)
	if main.pesca != null and main.fauna != null and main.pesca.local(antes.x, antes.z) == "rio":
		var q: Vector2 = main.fauna.rio_perto(antes.x, antes.z)
		var rp: Array = main.fauna.rio_ponto(q.y)
		var dr: Vector2 = rp[1]
		mov += Vector3(dr.x, 0.0, dr.y) * lerpf(0.6, 0.3, q.y) * dt
	if mov.length() > 0.0001:
		var col := move_and_collide(mov)
		if col != null:
			v *= 0.5
	# a proa na margem (ou na água rasa): encalha
	var hd: float = T["hd"]
	var gp := global_position
	var proa := gp + fr * hd * 0.85 * (1.0 if v >= 0.0 else -1.0)
	var n_p: float = main.terreno.nivel_agua(proa.x, proa.z)
	if n_p < -900.0 or n_p - main.terreno.h(proa.x, proa.z) < 0.45:
		global_position = Vector3(antes.x, gp.y, antes.z)
		if absf(v) > 3.0:
			hp = maxf(0.0, hp - (absf(v) - 3.0))
			main.sons.tocar("madeira", global_position, 0.0)
		v *= -0.15
	# boiando
	var p := global_position
	var nv: float = main.terreno.nivel_agua(p.x, p.z)
	var t := Time.get_ticks_msec() / 1000.0
	global_position.y = (nv if nv > -900.0 else main.terreno.h(p.x, p.z)) - 0.22 + sin(t * 1.6 + p.x) * 0.04
	pitch = sin(t * 1.3) * 0.03 - v * 0.006
	roll = sin(t * 1.1 + 1.0) * 0.035 + steer * 0.04 * absf(v) / 4.0
	corpo.rotation = Vector3(pitch, 0, roll)
	giro += v * dt
	# o motor gasta e faz barulho; o remo faz barulho de água
	if dirige and not sem and motor_ok:
		comb = maxf(0.0, comb - (0.02 + absf(v) * 0.015) * float(T["cons"]) * dt)
		_ruido_t -= dt
		if _ruido_t <= 0.0:
			_ruido_t = 0.5
			main.barulho(global_position, float(T["ruido"]) * (1.0 if absf(v) > 1.0 else 0.5))
		if comb <= 0.0 and not _dica_comb:
			_dica_comb = true
			main.ui.aviso("A gasolina do barco acabou. Ache outro galão e abasteça (segure E perto dele).", 6.0)
	if dirige and sem and absf(acc) > 0.1:
		_remo_t -= dt
		if _remo_t <= 0.0:
			_remo_t = 0.9
			main.sons.tocar("nado", global_position, -6.0)
			main.barulho(global_position, float(T["ruido"]))
	if buz > 0.0:
		buz -= dt


## o helicóptero (updateHeli do jogo antigo): o rotor ganha força em uns 3 s; Espaço sobe, C (ou Ctrl) desce, soltando os dois
## ele fica parado no ar; W vai para a frente, S freia (parado, dá ré devagar), A e D giram; soltando tudo ele para no ar;
## perto do chão desce devagar para pousar; pouso forte ou batida rápida no chão amassa (e machuca quem está dentro); não
## atravessa prédio (pousa no telhado)
func _mover_voo(dt: float, dirige: bool, j) -> void:
	var on: bool = ativo and hp > 0.0 and float(pecas["motor"]) > 0.0 and comb > 0.0 and int(pecas.get("rotor", 2)) >= 2
	rotor = move_toward(rotor, 1.0 if on else 0.0, dt * (0.35 if on else 0.25))
	var sus := rotor > 0.8
	var p := global_position
	var g := _chao_voo(p)
	var up := 0.0
	var acc := 0.0
	var gira := 0.0
	if dirige and not bool(j.preso):
		if Input.is_action_pressed("pular"):
			up += 1.0
		if Input.is_action_pressed("agachar"):
			up -= 1.0
		var mv := Input.get_vector("esquerda", "direita", "frente", "tras")
		acc = -mv.y
		gira = mv.x
	acel = maxf(0.0, up) * 0.6 + absf(acc) * 0.4
	var v_desce: float = lerpf(1.5, 5.0, clampf((alt - 0.4) / 3.6, 0.0, 1.0)) if alt < 4.0 else 5.0
	var alvo_vy := (5.0 if up > 0.0 else (-v_desce if up < 0.0 else 0.0)) if sus else (-9.0 if alt > 0.05 else 0.0)
	vy = move_toward(vy, alvo_vy, dt * (3.0 if sus else 6.0))
	if sus:
		var alvo := acc * float(T["maxV"])
		var taxa: float = T["ace"]
		if absf(acc) < 0.05:
			alvo = 0.0
			taxa = float(T["ace"]) * (3.0 if alt < 1.2 else 1.5)
		elif acc * v < -0.01:
			alvo = 0.0
			taxa = float(T["ace"]) * 2.4
		elif acc < 0.0:
			alvo = acc * float(T["maxV"]) * 0.35
		v = move_toward(v, alvo, dt * taxa)
		rotation.y -= gira * 1.2 * dt
	else:
		v *= exp(-dt * 1.5)
	var fr := frente()
	if alt > 0.3 or sus:
		var mov := fr * v * dt
		if mov.length() > 0.0001:
			var col := move_and_collide(mov)
			if col != null:
				v *= -0.3
				if absf(v) > 3.0:
					hp = maxf(0.0, hp - absf(v) * 2.0)
					main.sons.tocar("quebrar", global_position, 0.0)
		var q := global_position
		if not main.terreno.dentro(q.x, q.z):
			global_position = Vector3(p.x, q.y, p.z)
			v *= 0.3
	global_position.y += vy * dt
	var gy := _chao_voo(global_position)
	if global_position.y < gy:
		var imp := -vy
		global_position.y = gy
		if imp > 6.0 or (absf(v) > 6.0 and alt < 1.0):
			hp = maxf(0.0, hp - (imp - 4.0) * 6.0 - absf(v))
			main.sons.tocar("quebrar", global_position, 2.0)
			if dirige:
				j.tremor = 1.0
				if imp > 6.0:
					j.ferir((imp - 6.0) * 5.0, true, global_position)
		vy = 0.0
		v *= 0.4
	alt = global_position.y - gy
	# para a frente o nariz abaixa; na curva ele deita para o lado da curva
	pitch = lerpf(pitch, clampf(v / float(T["maxV"]) * 0.35, -0.35, 0.35), minf(1.0, dt * 2.0))
	roll = lerpf(roll, gira * 0.2, minf(1.0, dt * 2.0))
	corpo.rotation = Vector3(pitch, 0, roll)
	# o rotor girando, o barulho e o combustível
	if rotor > 0.05:
		giro += dt * rotor * 28.0
		if dirige:
			_ruido_t -= dt
			if _ruido_t <= 0.0:
				_ruido_t = 0.5
				main.barulho(global_position, float(T["ruido"]) * rotor)
		_helice_t -= dt
		if _helice_t <= 0.0:
			_helice_t = 0.35
			main.sons.tocar("helice", global_position, -4.0 + rotor * 4.0)
	if rotor_mi != null:
		rotor_mi.rotation = Vector3(0, giro, 0)
		cauda_mi.rotation = Vector3(giro * 1.7, 0, 0)
	if on:
		comb = maxf(0.0, comb - (0.06 + absf(v) * 0.01) * float(T["cons"]) * dt)
	if hp <= 0.0 and dirige:
		main.ui.aviso("O helicóptero caiu!", 5.0)
		j.ferir(40.0, true, global_position)
		if main.get("veiculos") != null and j.vivo:
			main.veiculos.expulsar(j)


## o chão embaixo do helicóptero: a terra, o telhado (um prédio embaixo) ou a água
func _chao_voo(p: Vector3) -> float:
	var g := _chao(p.x, p.z, p.y)
	var n: float = main.terreno.nivel_agua(p.x, p.z)
	return maxf(g, n) if n > -900.0 else g


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


## os zumbis e os bichos por perto não seguram o veículo como uma parede (antes ele quicava neles e nunca atropelava): a
## colisão com eles sai e quem resolve é o atropelamento (derruba, machuca, empurra para o lado). Eles continuam batendo no
## veículo do jeito deles (não atravessam a lataria quando andam)
func _sem_colisao_criaturas() -> void:
	var p := global_position
	var perto := {}
	for z in main.zumbis:
		if is_instance_valid(z) and (z as Node3D).global_position.distance_squared_to(p) < 196.0:
			perto[(z as Object).get_instance_id()] = z
	if main.fauna != null:
		for b in main.fauna.bichos:
			if is_instance_valid(b) and (b as Node3D).global_position.distance_squared_to(p) < 196.0:
				perto[(b as Object).get_instance_id()] = b
	for k in perto:
		if not _criaturas.has(k):
			add_collision_exception_with(perto[k])
			_criaturas[k] = perto[k]
	for k in _criaturas.keys():
		if not perto.has(k):
			var o = _criaturas[k]
			if is_instance_valid(o):
				remove_collision_exception_with(o)
			_criaturas.erase(k)


func _nome_choque(o) -> String:
	if o == null or not is_instance_valid(o):
		return "?"
	var n: String = (o as Node).name if o is Node else str(o)
	if (o as Object).has_meta("zumbi"):
		return "zumbi"
	if (o as Object).has_meta("recurso"):
		return "recurso " + n
	if (o as Object).has_meta("veiculo"):
		return "veículo " + n
	return "%s %s" % [(o as Object).get_class(), n]


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
	if main.fauna != null:
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
			if sp <= 3.2:
				# devagar: empurra para o lado (sem colisão com o veículo, senão ficava embaixo dele)
				var lb := d.dot(rx)
				var pb := hw + r - absf(lb)
				if pb > 0.0 and not bool(b.get("lan")):
					b.global_position += rx * (1.0 if lb >= 0.0 else -1.0) * pb * 0.5
				continue
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
	if buz > 0.0 or sem_motor():
		return
	buz = 0.6
	main.sons.tocar("buzina", global_position, 2.0)
	main.barulho(global_position, 45.0)


## põe no chão (ao nascer, carregar ou descer): altura e inclinação na hora
func assentar() -> void:
	if voa():
		alt = 0.0
		vy = 0.0
		global_position.y = _chao_voo(global_position + Vector3(0, 1.0, 0))
		return
	if na_agua():
		var p := global_position
		var nv: float = main.terreno.nivel_agua(p.x, p.z)
		global_position.y = (nv if nv > -900.0 else main.terreno.h(p.x, p.z)) - 0.22
		return
	_chao_e_inclinacao(1.0)
	_chao_e_inclinacao(1.0)
	_rodas(0.0)


# ================================================================ entrar e sair
## um lugar livre para descer, perto (os de sempre e, sem nenhum, o mais perto em volta até 7 m)
func saida() -> Vector3:
	var hw: float = T["hw"]
	var hd: float = T["hd"]
	var op: Array = []
	if na_agua():
		# do barco e da jangada: na margem, se der; senão pula na água do lado e nada
		var xa := global_transform
		for o in [[2.0, 0.0], [-2.0, 0.0], [0.0, 3.0], [0.0, -3.0], [2.6, 1.5], [-2.6, 1.5], [2.6, -1.5], [-2.6, -1.5]]:
			var q := xa * Vector3(float(o[0]), 0, float(o[1]))
			var c := _ponto_chao(q)
			if c != Vector3.INF and _livre(c):
				return c
		var w := xa * Vector3(1.8, 0, 0)
		var nw: float = main.terreno.nivel_agua(w.x, w.z)
		return Vector3(w.x, (nw if nw > -900.0 else global_position.y) - 1.0, w.z)
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
	if not sem_motor():
		L.append(["Combustível", pct(comb), comb < 15.0])
		L.append(["Motor", pct(float(pecas["motor"])), float(pecas["motor"]) < 35.0])
	L.append(["Casco" if na_agua() else "Lataria", pct(hp), hp < 35.0])
	if not (T["rodas"] as Array).is_empty():
		var pn: Array = []
		for q in pecas["pneus"]:
			pn.append("furado" if float(q) <= 0.0 else pct(float(q)))
		L.append(["Pneus", " · ".join(PackedStringArray(pn)), furados() > 0])
	if not na_agua():
		L.append(["Óleo", pct(float(pecas["oleo"])), float(pecas["oleo"]) < 15.0])
	if bool(T.get("bateria", false)):
		L.append(["Bateria", "ok" if bool(pecas["bateria"]) else "faltando", not bool(pecas["bateria"])])
	if voa():
		L.append(["Rotor", "%d de 2 peças" % int(pecas.get("rotor", 0)), int(pecas.get("rotor", 0)) < 2])
	L.append(["Carga", "%d de %d" % [int(T["cap"]) - porta.livres(), int(T["cap"])], false])
	return L


## o que dá para fazer na oficina: [{id, t (o botão), s (o que gasta), ok}]
func acoes(j) -> Array:
	var kit := not _kit(j).is_empty()
	var tk := "" if kit else " (precisa do kit de ferramentas)"
	var A: Array = []
	var inv: Inventario = j.inv
	if not sem_motor():
		A.append({"id": "abastecer", "t": "Abastecer", "s": ("1 galão: +%d%%" % int(T["galao"])) if inv.conta("gasolina") > 0 else "sem galão de gasolina",
			"ok": inv.conta("gasolina") > 0 and comb < 97.0})
	if hp < 100.0:
		A.append({"id": "lataria", "t": "Remendar o casco" if na_agua() else "Consertar a lataria", "s": "3 sucata e 2 pregos: +35%",
			"ok": inv.conta("sucata") >= 3 and inv.conta("pregos") >= 2})
	if not sem_motor() and float(pecas["motor"]) < 100.0:
		A.append({"id": "motor", "t": "Consertar o motor", "s": "1 peça de motor" + tk, "ok": kit and inv.conta("pecaVeiculo") > 0})
	var fraco := false
	for q in pecas["pneus"]:
		if float(q) < 60.0:
			fraco = true
	if fraco:
		A.append({"id": "pneu", "t": "Trocar pneu", "s": "1 pneu" + tk, "ok": kit and inv.conta("pneu") > 0})
	if not na_agua() and float(pecas["oleo"]) < 90.0:
		A.append({"id": "oleo", "t": "Pôr óleo", "s": "1 óleo de motor: +45%", "ok": inv.conta("oleoMotor") > 0})
	if bool(T.get("bateria", false)) and not bool(pecas["bateria"]):
		A.append({"id": "bateria", "t": "Instalar bateria", "s": "1 bateria automotiva" + tk, "ok": kit and inv.conta("bateriaVeic") > 0})
	if voa() and int(pecas.get("rotor", 0)) < 2:
		A.append({"id": "rotor", "t": "Montar o rotor", "s": "peças de rotor (%d de 2)%s" % [int(pecas.get("rotor", 0)), tk], "ok": kit and inv.conta("pecasRotor") > 0})
	A.append({"id": "carga", "t": "Carga" if na_agua() else "Porta-malas", "s": "%d de %d espaços" % [int(T["cap"]) - porta.livres(), int(T["cap"])], "ok": true})
	var nao := pode()
	A.append({"id": "dirigir", "t": "Pilotar" if voa() else ("Subir" if na_agua() else "Dirigir"), "s": nao if nao != "" else "pronto", "ok": nao == ""})
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
		"rotor":
			if not kit or inv.conta("pecasRotor") <= 0:
				return "Precisa das peças de rotor e do kit de ferramentas"
			var k := mini(2 - int(pecas.get("rotor", 0)), inv.conta("pecasRotor"))
			inv.tirar("pecasRotor", k)
			pecas["rotor"] = int(pecas.get("rotor", 0)) + k
			_gastar_kit(j, 3.0)
			main.sons.tocar("construir", global_position, 0.0)
			return "Rotor montado!" if int(pecas["rotor"]) >= 2 else "Falta mais 1 peça de rotor"
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
	var fl := (1 if ativo or motorista != 0 else 0) | (2 if luz else 0) | (4 if freando else 0) | (8 if hp > 0.0 else 0)
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
	if rotor_mi != null:
		rotor_mi.rotation = Vector3(0, giro, 0)
		cauda_mi.rotation = Vector3(giro * 1.7, 0, 0)
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


## o estado das peças (quem abriu manda para o convidado que vai dirigir; o convidado manda de volta ao descer)
func estado_rede() -> Dictionary:
	var p := global_position
	return {"x": p.x, "y": p.y, "z": p.z, "yaw": rotation.y, "comb": comb, "hp": hp, "pecas": pecas.duplicate(true), "luz": luz}


func receber_estado(d: Dictionary, lugar: bool) -> void:
	comb = clampf(float(d.get("comb", comb)), 0.0, 100.0)
	hp = clampf(float(d.get("hp", hp)), 0.0, 100.0)
	luz = bool(d.get("luz", luz))
	var pd = d.get("pecas", {})
	if pd is Dictionary:
		pecas["motor"] = clampf(float(pd.get("motor", pecas["motor"])), 0.0, 100.0)
		pecas["oleo"] = clampf(float(pd.get("oleo", pecas["oleo"])), 0.0, 100.0)
		pecas["bateria"] = bool(pd.get("bateria", pecas["bateria"]))
		pecas["rotor"] = clampi(int(pd.get("rotor", pecas.get("rotor", 2))), 0, 2)
		var pn = pd.get("pneus", [])
		if pn is Array and (pn as Array).size() == (pecas["pneus"] as Array).size():
			var L: Array = []
			for q in pn:
				L.append(clampf(float(q), 0.0, 100.0))
			pecas["pneus"] = L
	if lugar and d.has("x"):
		global_position = Vector3(float(d["x"]), float(d["y"]), float(d["z"]))
		rotation.y = float(d.get("yaw", rotation.y))


## o convidado dirigindo: [x, y, z, giro, inclinação, deitada, velocidade, volante, giro das rodas, faróis/freando, combustível,
## lataria, motor, óleo] (10 vezes por segundo para quem abriu)
func para_motorista() -> PackedFloat32Array:
	var p := global_position
	var fl := (2 if luz else 0) | (4 if freando else 0)
	return PackedFloat32Array([p.x, p.y, p.z, rotation.y, pitch, roll, v, steer, giro, fl, comb, hp, float(pecas["motor"]), float(pecas["oleo"])])


## quem abriu: onde o convidado que dirige diz que o veículo está
func do_motorista(L: PackedFloat32Array) -> void:
	if L.size() < 14:
		return
	_lan_p = Vector3(L[0], L[1], L[2])
	_lan_yaw = L[3]
	_lan_pr = Vector2(L[4], L[5])
	v = L[6]
	steer = L[7]
	giro = L[8]
	var fl := int(L[9])
	luz = (fl & 2) != 0
	freando = (fl & 4) != 0
	comb = clampf(L[10], 0.0, 100.0)
	hp = clampf(L[11], 0.0, 100.0)
	pecas["motor"] = clampf(L[12], 0.0, 100.0)
	pecas["oleo"] = clampf(L[13], 0.0, 100.0)
	set_meta("lan_ativo", true)
	if global_position.distance_to(_lan_p) > 12.0:
		global_position = _lan_p
		rotation.y = _lan_yaw


func soltar_rede() -> void:
	if not lan:
		return
	lan = false
	if not _antes_rede.is_empty():
		carregar(_antes_rede)
	_antes_rede = {}


# ================================================================ jogo salvo
func salvar() -> Dictionary:
	# na partida em rede (convidado) o jogo salvo guarda o veículo do seu mundo, como estava antes de entrar
	if (lan or dono_rede) and not _antes_rede.is_empty():
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
		pecas["rotor"] = clampi(int(pd.get("rotor", pecas.get("rotor", 2))), 0, 2)
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
