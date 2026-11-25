class_name Cao
extends CharacterBody3D
## O Caramelo, o cachorro companheiro (etapa 6e), como no jogo antigo (49_cao.js): magro e com fome, deitado na beira da
## mata ao norte da clareira. Dê qualquer comida para ele (frutas servem) e ele te segue: late quando tem zumbi vindo, parte
## para cima dos zumbis perto e morde; agachado, ele fica quieto do seu lado. Perto dele, E manda ele ficar vigiando um lugar
## ou chama de volta. Os zumbis também atacam ele. Se ele se machucar feio, volta mancando para a clareira, descansa e no dia
## seguinte está bom. Os bichos do mato fogem dele. Dormindo, ele deita do seu lado.
## Na partida em rede ele é de quem abriu (quem entrou vê o boneco dele andando, mas quem manda nele é quem abriu).

const ESPERA := Vector3(-3.2, 0, -22)     # na beira da mata, ao norte da clareira
const CLAREIRA := Vector3(0.7, 0, 1.8)    # onde ele descansa machucado (perto do meio da clareira)
const HP_MAX := 80.0
const POSES := ["pe", "anda", "corre", "senta", "deita", "ferido", "morde"]

var main
var ativo := false          # já é seu (comeu e te segue)
var st := "espera"          # espera, segue, fica, ataca, ferido, descansa
var modo := "segue"         # o que ele volta a fazer depois de atacar (segue ou fica)
var hp := HP_MAX
var alvo = null
var fica := Vector3.ZERO
var yaw := 0.4
var lat_t := 0.0
var mord_t := 0.0
var medo_t := 0.0
var dano_t := 0.0
var gan_t := 3.0
var ferido_t := 0.0
var scan_t := 0.0
var parado_t := 0.0
var flash := 0.0
var ph := 0.0
var amp := 0.0
var mordidas := 0           # quantas vezes ele mordeu zumbi (para o teste e as conquistas)
var _t := 0.0
var _desvio := 0.0
var _desvio_s := 1.0
var _stuck_t := 0.0
var _ultimo := Vector3.ZERO
var _travado := 0
var _dica := {}
var _hora_antes := -1.0
var lan := false            # convidado: é só o boneco do cachorro de quem abriu
var _lan_alvo := Vector3.ZERO
var _lan_yaw := 0.0
var _lan_modo := "pe"
var _lan_t := 0.0
var _antes_rede := {}       # convidado: o seu cachorro como estava antes de entrar na partida
var _pose_atual := "pe"
var corpo: Node3D
var O: Array = []
var _hy := 0.0


func _init(m) -> void:
	main = m


func _ready() -> void:
	_montar()
	var cs := CollisionShape3D.new()
	var bx := BoxShape3D.new()
	bx.size = Vector3(0.3, 0.6, 0.85)
	cs.shape = bx
	cs.position = Vector3(0, 0.3, 0.05)
	add_child(cs)
	set_meta("cao", self)
	collision_layer = 2         # a mira pega (E), mas ninguém tropeça nele
	collision_mask = 1
	floor_snap_length = 0.5
	floor_max_angle = deg_to_rad(55.0)


## o corpo caramelo com o peito claro, as meias brancas e a bandana vermelha (como no jogo antigo)
func _montar() -> void:
	corpo = Node3D.new()
	add_child(corpo)
	var H := 0.28
	var L := 0.62
	var bx := 0.095
	var bz := 0.22
	var ly := -H * 0.3
	# os ossos: o corpo, a cabeça, as quatro pernas e o rabo
	var base: Array = [[-1, Vector3(0, 0.36 + H * 0.35, 0)], [0, Vector3(0, H * 0.3, L / 2.0 - 0.05)], [0, Vector3(bx, ly, bz)],
		[0, Vector3(-bx, ly, bz)], [0, Vector3(bx, ly, -bz)], [0, Vector3(-bx, ly, -bz)], [0, Vector3(0, H * 0.3, -L / 2.0 + 0.03)]]
	for i in base.size():
		var no := Node3D.new()
		no.position = base[i][1]
		O.append(no)
		var pai: int = base[i][0]
		if pai < 0:
			corpo.add_child(no)
		else:
			(O[pai] as Node3D).add_child(no)
	var car := 0xb06e30
	var car2 := 0x8a5222
	var cre := 0xe2c9a0
	var pre := 0x141210
	var ver := 0xb3261e
	var pecas: Array = []
	for i in 7:
		pecas.append([])
	ModelosBichos._jit = 0.05
	ModelosBichos._put(pecas, 0, ModelosBichos._caixa(0.26, 0.28, 0.62, 0.92, 1.0), Transform3D(), car)
	ModelosBichos._put(pecas, 0, ModelosBichos._caixa(0.2, 0.07, 0.44), ModelosBichos._m(0, -0.12, 0.02), cre)
	ModelosBichos._put(pecas, 0, ModelosBichos._caixa(0.19, 0.05, 0.48), ModelosBichos._m(0, 0.135, -0.03), car2)
	ModelosBichos._put(pecas, 0, ModelosBichos._caixa(0.21, 0.22, 0.12), ModelosBichos._m(0, -0.01, 0.29), cre, 0.03)
	ModelosBichos._put(pecas, 1, ModelosBichos._caixa(0.14, 0.2, 0.15), ModelosBichos._m(0, 0.07, 0.02, 0.4, 0, 0), car)
	ModelosBichos._put(pecas, 1, ModelosBichos._caixa(0.17, 0.16, 0.19, 1.0, 0.9), ModelosBichos._m(0, 0.17, 0.08), car)
	ModelosBichos._put(pecas, 1, ModelosBichos._caixa(0.1, 0.085, 0.13), ModelosBichos._m(0, 0.135, 0.21), cre)
	ModelosBichos._put(pecas, 1, ModelosBichos._caixa(0.045, 0.032, 0.03), ModelosBichos._m(0, 0.165, 0.275), pre, 0.0)
	ModelosBichos._put(pecas, 1, ModelosBichos._caixa(0.034, 0.012, 0.06), ModelosBichos._m(0, 0.084, 0.245, 0.55, 0, 0), 0xd9606a, 0.0)
	for s in [1.0, -1.0]:
		var sf: float = s
		ModelosBichos._put(pecas, 1, ModelosBichos._caixa(0.026, 0.026, 0.012), ModelosBichos._m(sf * 0.05, 0.2, 0.172), pre, 0.0)
		ModelosBichos._put(pecas, 1, ModelosBichos._cil(0.0, 0.05, 0.115, 3), ModelosBichos._m(sf * 0.06, 0.232, 0.05, 0.25, 0, -sf * 0.32, 1, 1, 0.55), car2)
	ModelosBichos._put(pecas, 1, ModelosBichos._caixa(0.2, 0.05, 0.2), ModelosBichos._m(0, 0.0, 0.0, 0.3, 0, 0), ver)
	ModelosBichos._put(pecas, 1, ModelosBichos._cil(0.0, 0.075, 0.12, 3), ModelosBichos._m(0, -0.02, 0.1, PI + 0.35, 0, 0, 1, 1, 0.4), ver)
	for i in 4:
		ModelosBichos._put(pecas, 2 + i, ModelosBichos._cil(0.044, 0.03, 0.34, 6), ModelosBichos._m(0, -0.34, 0), car)
		ModelosBichos._put(pecas, 2 + i, ModelosBichos._caixa(0.07, 0.06, 0.09), ModelosBichos._m(0, -0.335, 0.012), cre)
	ModelosBichos._put(pecas, 6, ModelosBichos._cil(0.016, 0.032, 0.27, 6), Transform3D(), car)
	ModelosBichos._put(pecas, 6, ModelosBichos._cil(0.004, 0.016, 0.06, 5), ModelosBichos._m(0, 0.27, 0), cre)
	for i in 7:
		var mi := MeshInstance3D.new()
		mi.mesh = ModelosBichos._juntar(pecas[i])
		mi.material_override = ModelosBichos._mat()
		(O[i] as Node3D).add_child(mi)


func iniciar() -> void:
	ativo = false
	st = "espera"
	modo = "segue"
	hp = HP_MAX
	alvo = null
	yaw = 0.4
	lan = false
	_dica = {}
	_no_chao(ESPERA)
	velocity = Vector3.ZERO


func _no_chao(p: Vector3) -> void:
	var y: float = main.chao_em(p.x, p.z, main.terreno.h(p.x, p.z) + 1.5)["y"] if main.has_method("chao_em") else main.terreno.h(p.x, p.z)
	global_position = Vector3(p.x, y + 0.1, p.z)


## ativo e de pé (nem machucado, nem descansando)
func livre() -> bool:
	return ativo and st != "ferido" and st != "descansa" and not lan


func _comida(j) -> Dictionary:
	var inv = j.inv
	for i in range(inv.slots.size() - 1, -1, -1):
		var s = inv.slots[i]
		if s != null and str(Dados.item(str(s["id"])).get("tipo", "")) == "comida":
			return s
	return {}


## o cachorro está na frente de quem olha (como o "tryIt" do jogo antigo: perto e mais ou menos na frente)
func na_mira(j) -> bool:
	if not (lan or st == "espera" or livre() or st == "descansa") or not corpo.visible:
		return false
	var o: Vector3 = j.olho()
	var fr: Vector3 = -j.cam.global_transform.basis.z
	var d := global_position + Vector3(0, 0.35, 0) - o
	var dh := Vector2(d.x, d.z)
	var r := 2.6 if st == "espera" else 2.3
	if dh.length() > r or dh.length() < 0.05:
		return false
	var fh := Vector2(fr.x, fr.z)
	if fh.length() < 0.05:
		return true
	return fh.normalized().dot(dh.normalized()) > 0.78


func texto(j) -> String:
	if lan:
		return "Caramelo (o cachorro de quem abriu a partida)" if ativo else "Cachorro com fome (quem abriu a partida pode dar comida)"
	if st == "espera":
		var s := _comida(j)
		return ("E  Dar comida ao cachorro (%s · ele vai te seguir)" % Dados.nome(str(s["id"])).to_lower()) if not s.is_empty() else "Cachorro com fome (precisa de comida: frutas servem)"
	if not ativo or st == "ferido":
		return "Caramelo (machucado)" if st == "ferido" else ""
	if st == "descansa":
		return "O Caramelo está se recuperando (amanhã ele volta)"
	if st == "fica" or (st == "ataca" and modo == "fica"):
		return "E  Chamar o Caramelo (ele volta a te seguir)"
	return "E  Mandar o Caramelo ficar aqui (ele vigia este lugar)"


func interagir(j) -> void:
	if lan:
		main.ui.aviso("O Caramelo obedece quem abriu a partida", 3.0)
		return
	if st == "espera":
		var s := _comida(j)
		if s.is_empty():
			main.ui.aviso("Ele precisa de comida (frutas servem)")
			main.sons.tocar("ganido", global_position, -2.0)
			return
		var id := str(s["id"])
		j.inv.tirar(id, 1)
		main.ui.atualizar()
		ativo = true
		st = "segue"
		modo = "segue"
		hp = HP_MAX
		lat_t = 2.0
		main.sons.tocar("latido", global_position, 2.0)
		main.efeitos.anel(global_position + Vector3(0, 0.8, 0))
		main.ui.aviso("Deu %s ao cachorro. Ele comeu, abanou o rabo e resolveu te seguir: esse é o Caramelo! Ele late quando tem zumbi perto e ajuda na briga. Agachado, ele fica quieto do seu lado." % Dados.nome(id).to_lower(), 9.0)
		main.ui.aviso("Perto do Caramelo, E manda ele ficar vigiando um lugar, ou chama de volta.", 8.0)
		return
	if not livre():
		return
	if st == "fica" or (st == "ataca" and modo == "fica"):
		st = "segue"
		modo = "segue"
		alvo = null
		main.ui.aviso("Caramelo: vem!", 2.0)
		main.sons.tocar("latido", global_position, 0.0)
	else:
		st = "fica"
		modo = "fica"
		alvo = null
		fica = global_position
		main.ui.aviso("Caramelo: fica!", 2.0)
		main.sons.tocar("clique", global_position, -6.0)


## o golpe de um zumbi (ou o pisão do Colosso, o gás do inchado)
func ferir(d: float, _de := Vector3.INF) -> void:
	if not livre():
		return
	hp -= d * 0.8
	dano_t = 5.0
	flash = 0.15
	main.efeitos.sangue(global_position + Vector3(0, 0.45, 0), Vector3.UP)
	main.sons.tocar("ganido", global_position, 0.0)
	if hp <= 0.0:
		hp = 0.0
		st = "ferido"
		ferido_t = 0.0
		alvo = null
		main.ui.aviso("O Caramelo se machucou feio! Ele vai mancando para a clareira e amanhã está bom.", 7.0)
	elif hp < HP_MAX * 0.3 and st == "ataca":
		st = modo
		alvo = null
		medo_t = 6.0


## amanheceu: ferido ou descansando, ele melhora e fica esperando na clareira; de pé, a vida enche
func amanheceu() -> void:
	if not ativo or lan:
		return
	hp = HP_MAX
	if st == "ferido" or st == "descansa":
		if st == "ferido":
			_no_chao(CLAREIRA)
		st = "fica"
		modo = "fica"
		fica = global_position
		main.ui.aviso("O Caramelo melhorou e está te esperando na clareira. Chame ele com E.", 6.0)


func _teleporte(j) -> void:
	var atras: Vector3 = j.global_transform.basis.z
	for k in 10:
		var a := atan2(atras.x, atras.z) + (randf() - 0.5) * 1.4
		var r := 5.0 + randf() * 4.0
		var p: Vector3 = j.global_position + Vector3(sin(a), 0, cos(a)) * r
		if main.terreno.tipo_agua(p.x, p.z) == 0 and main.terreno.dentro(p.x, p.z):
			_no_chao(p)
			_desvio = 0.0
			_travado = 0
			return


func _physics_process(dt: float) -> void:
	if lan:
		_boneco(dt)
		return
	var j = main.jogador
	if j == null or not main.pronto:
		return
	_t += dt
	# na caçamba da caminhonete (etapa 6j): sentado, indo junto
	if st == "carro":
		_na_cacamba(j)
		return
	lat_t -= dt
	mord_t -= dt
	medo_t -= dt
	dano_t -= dt
	flash = maxf(0.0, flash - dt)
	# o amanhecer (6h): o machucado melhora
	var h: float = main.hora
	if _hora_antes >= 0.0 and Noites.passou(_hora_antes, h, 6.0):
		amanheceu()
	_hora_antes = h
	var jp: Vector3 = j.global_position
	var dxp := jp.x - global_position.x
	var dzp := jp.z - global_position.z
	var dp := Vector2(dxp, dzp).length()
	var quieto: bool = j.agachado
	var dica_ok: bool = main.em_jogo and not main.modo_teste
	var dorme: bool = main.sono != null and not main.sono.dormindo.is_empty()
	var alvo_p := Vector3.INF
	var spd := 0.0
	var pose := "pe"
	var olha := dp < 12.0
	var wag := 0.6
	if st != "ferido" and st != "descansa" and dano_t <= 0.0 and hp < HP_MAX:
		hp = minf(HP_MAX, hp + 2.5 * dt)
	match st:
		"espera":
			pose = "senta" if dp < 10.0 else "deita"
			wag = 1.0 if dp < 10.0 else 0.2
			gan_t -= dt
			if gan_t <= 0.0:
				gan_t = 6.0 + randf() * 7.0
				if dp < 45.0 and main.em_jogo:
					main.sons.tocar("latido" if dp < 14.0 else "ganido", global_position, -4.0)
			if dp < 16.0 and j.vivo and dica_ok and not _dica.has("achou"):
				_dica["achou"] = true
				main.ui.aviso("Um cachorro caramelo, magro e com fome, na beira da mata. Dê qualquer comida para ele (frutas servem).", 8.0)
		"descansa":
			pose = "deita"
			wag = 0.3
		"ferido":
			ferido_t += dt
			pose = "ferido"
			olha = false
			if ferido_t > 3.5:
				pose = "anda"
				alvo_p = CLAREIRA
				spd = 1.15
				wag = 0.0
				var dc := Vector2(global_position.x - CLAREIRA.x, global_position.z - CLAREIRA.z).length()
				# longe de você e da clareira (preso num rio, num muro): ele chega lá sozinho
				if dc > 40.0 and dp > 50.0:
					_no_chao(CLAREIRA)
					dc = 0.0
				if dc < 1.2:
					st = "descansa"
					alvo_p = Vector3.INF
		_:
			var base := modo if st == "ataca" else st
			var ap: Vector3 = fica if base == "fica" else jp
			# procura zumbi para enfrentar
			if not quieto and not dorme and medo_t <= 0.0 and st != "ataca" and j.vivo:
				scan_t -= dt
				if scan_t <= 0.0:
					scan_t = 0.3
					var best = null
					var bd := 1e9
					for z in main.zumbis:
						if not is_instance_valid(z) or z.estado == "morto" or z.lan:
							continue
						var da := Vector2(z.global_position.x - ap.x, z.global_position.z - ap.z).length()
						if da > (11.0 if base == "fica" else 13.0):
							continue
						if not (z.estado in ["caca", "grito", "atordoado", "derrubado"] or da < 7.0):
							continue
						var dc: float = z.global_position.distance_squared_to(global_position)
						if dc < bd:
							bd = dc
							best = z
					if best != null:
						modo = base
						st = "ataca"
						alvo = best
						if lat_t <= 0.0:
							lat_t = 5.0
							main.sons.tocar("latido", global_position, 4.0)
							main.barulho(global_position, 7.0)
						if dica_ok and not _dica.has("briga"):
							_dica["briga"] = true
							main.ui.aviso("O Caramelo parte para cima dos zumbis. Se ele se machucar feio, volta para a clareira e melhora no dia seguinte.", 7.0)
			# late avisando que tem zumbi vindo
			if not quieto and st != "ataca" and lat_t <= 0.0 and j.vivo:
				for z in main.zumbis:
					if is_instance_valid(z) and z.estado in ["caca", "alerta"] and z.global_position.distance_to(jp) < 22.0:
						lat_t = 7.0
						main.sons.tocar("latido", global_position, 3.0)
						main.barulho(global_position, 6.0)
						if dorme:
							main.sono.acordar("O Caramelo latiu: tem zumbi vindo!")
						break
			if st == "ataca":
				var z = alvo
				if z == null or not is_instance_valid(z) or z.estado == "morto" or Vector2(z.global_position.x - ap.x, z.global_position.z - ap.z).length() > 20.0 or quieto:
					st = modo
					alvo = null
				else:
					var dz := Vector2(z.global_position.x - global_position.x, z.global_position.z - global_position.z).length()
					var alc: float = 0.62 + float(z.S["r"]) * float(z.escala)
					pose = "corre"
					alvo_p = z.global_position
					spd = 7.4
					wag = 0.3
					olha = false
					if dz < alc + 0.2:
						alvo_p = Vector3.INF
						pose = "morde"
						yaw = lerp_angle(yaw, atan2(z.global_position.x - global_position.x, z.global_position.z - global_position.z), 1.0 - exp(-dt * 10.0))
						if mord_t <= 0.0:
							mord_t = 0.85
							mordidas += 1
							z.ferir(9.0 if z.tipo == "brute" else 12.0, global_position, 0, {"k": "mordida"})
							main.sons.tocar("mordida", global_position, -2.0)
			if st == "fica":
				var df := Vector2(fica.x - global_position.x, fica.z - global_position.z).length()
				if df > 0.7:
					alvo_p = fica
					spd = 6.0 if df > 5.0 else 2.6
					pose = "corre" if df > 5.0 else "anda"
				else:
					pose = "senta" if parado_t > 1.2 else "pe"
			elif st == "segue":
				var atras_v: Vector3 = j.global_transform.basis.z
				var b := atan2(-atras_v.x, -atras_v.z)
				var atras := 1.1 if quieto else 1.7
				var lado := 0.55 if quieto else 0.95
				var g := Vector3(jp.x - sin(b) * atras + cos(b) * lado, 0, jp.z - cos(b) * atras - sin(b) * lado)
				var dg := Vector2(g.x - global_position.x, g.z - global_position.z).length()
				if dp > 45.0 and j.vivo:
					_teleporte(j)
				if dorme and dp < 6.0:
					# você dormindo: ele deita do seu lado
					pose = "deita"
					wag = 0.2
				elif dg < 0.45 or (dp < 2.1 and dg < 1.5):
					pose = "senta" if parado_t > 1.5 else "pe"
					wag = 1.0
				else:
					alvo_p = g
					var pv := Vector2(j.velocity.x, j.velocity.z).length()
					spd = 7.4 if dg > 6.0 else clampf(pv + dg * 0.9, 1.4, 6.6)
					if quieto:
						spd = minf(spd, 2.1)
					pose = "corre" if spd > 4.4 else "anda"
					wag = 0.8
	_andar(dt, j, alvo_p, spd, pose, olha, dxp, dzp, dp)
	rotation.y = yaw
	var hy := 0.0
	if olha and j.vivo:
		hy = clampf(wrapf(atan2(dxp, dzp) - yaw, -PI, PI), -0.95, 0.95)
	_hy = lerpf(_hy, hy, minf(1.0, dt * 5.0))
	_pose(pose, wag)
	_pose_atual = pose
	var ve := dp < 100.0
	if corpo.visible != ve:
		corpo.visible = ve


## você entrou num veículo: na caminhonete, o Caramelo (seguindo você, até 30 m) pula na caçamba, como no jogo antigo
func entrou_veiculo(v) -> void:
	if not ativo or lan or not bool(v.T.get("cacamba", false)):
		return
	if not (st == "segue" or (st == "ataca" and modo == "segue")):
		return
	if global_position.distance_to(v.global_position) > 30.0:
		return
	st = "carro"
	alvo = null
	main.sons.tocar("latido", global_position, -2.0)
	if main.em_jogo and not main.modo_teste and not _dica.has("cacamba"):
		_dica["cacamba"] = true
		main.ui.aviso("O Caramelo pulou na caçamba. Ele desce quando você descer.", 6.0)


## você desceu: ele pula da caçamba do lado e volta a seguir
func saiu_veiculo(v) -> void:
	if st != "carro":
		return
	st = "segue"
	modo = "segue"
	var p: Vector3 = v.global_transform * Vector3(-1.7, 0, -1.6)
	_no_chao(p)


func _na_cacamba(j) -> void:
	var v = j.veiculo
	if v == null or not is_instance_valid(v):
		st = "segue"
		modo = "segue"
		_no_chao(j.global_position + Vector3(1.0, 0, 1.0))
		return
	global_position = (v.corpo as Node3D).global_transform * Vector3(-0.42, 1.0, -1.55)
	velocity = Vector3.ZERO
	yaw = v.rotation.y + 0.35 * sin(_t * 0.45)
	rotation.y = yaw
	_hy = lerpf(_hy, 0.0, 0.1)
	_pose("senta", 0.8)
	_pose_atual = "senta"
	if not corpo.visible:
		corpo.visible = true


## o passo: vai até o ponto (desviando quando trava), não entra em água funda, cai com a gravidade
func _andar(dt: float, j, alvo_p: Vector3, spd: float, pose: String, olha: bool, dxp: float, dzp: float, dp: float) -> void:
	if alvo_p != Vector3.INF and spd > 0.0:
		var d := Vector2(alvo_p.x - global_position.x, alvo_p.z - global_position.z)
		var dd := d.length()
		if dd > 0.05:
			d /= dd
			if _desvio > 0.0:
				_desvio -= dt
				d = (d * 0.35 + Vector2(-d.y, d.x) * _desvio_s).normalized()
			var v := minf(spd, dd / maxf(dt, 1e-3))
			yaw = lerp_angle(yaw, atan2(d.x, d.y), 1.0 - exp(-dt * 9.0))
			velocity.x = d.x * v
			velocity.z = d.y * v
			_stuck_t += dt
			if _stuck_t > 1.2:
				if global_position.distance_to(_ultimo) < 0.3 * spd / 2.0 and _desvio <= 0.0:
					_desvio = 0.9
					_desvio_s = -1.0 if randf() < 0.5 else 1.0
					_travado += 1
				else:
					_travado = 0
				_stuck_t = 0.0
				_ultimo = global_position
			if _travado >= 3 and st == "segue" and dp > 5.0:
				_teleporte(j)
			amp = move_toward(amp, 1.0, dt * 5.0)
			ph += dt * (13.0 if pose == "corre" else 8.0) * minf(1.0, v / 2.0 + 0.3)
			parado_t = 0.0
		else:
			velocity.x = 0.0
			velocity.z = 0.0
	else:
		velocity.x = 0.0
		velocity.z = 0.0
		amp = move_toward(amp, 0.0, dt * 5.0)
		parado_t += dt
		if pose == "pe" and amp < 0.05 and st == "segue" and olha:
			yaw = lerp_angle(yaw, atan2(dxp, dzp), 1.0 - exp(-dt * 2.0))
	if is_on_floor():
		velocity.y = -0.5
	else:
		velocity.y -= 20.0 * dt
	var antes := global_position
	move_and_slide()
	var p := global_position
	if main.terreno.tipo_agua(p.x, p.z) != 0 and main.terreno.nivel_agua(p.x, p.z) - main.terreno.h(p.x, p.z) > 0.75:
		global_position = Vector3(antes.x, p.y, antes.z)
	if global_position.y < -40.0:
		if ativo:
			_teleporte(j)
		else:
			_no_chao(ESPERA)


# ======================================================================== as poses (como poseCao do jogo antigo)
func _o(i: int, rx: float, ry := 0.0, rz := 0.0) -> void:
	(O[i] as Node3D).rotation = Vector3(rx, ry, rz)


func _pose(pose: String, wag: float) -> void:
	var t := _t
	var s := sin(ph)
	var hip := 0.0
	for i in 7:
		_o(i, 0.0)
	match pose:
		"senta":
			_o(0, -0.45)
			_o(1, 0.42, _hy, sin(t * 0.7) * 0.12)
			_o(2, 0.45)
			_o(3, 0.45)
			_o(4, -0.95, 0, 0.12)
			_o(5, -0.95, 0, -0.12)
			_o(6, -1.9, sin(t * 9.0) * 0.5 * wag)
			hip = -0.13
		"deita":
			_o(1, 0.18, _hy)
			_o(2, -1.45)
			_o(3, -1.45)
			_o(4, -1.35, 0, 0.2)
			_o(5, -1.35, 0, -0.2)
			_o(6, -1.75, sin(t * 6.0) * 0.3 * wag)
			hip = -0.3
		"ferido":
			_o(1, 0.3)
			_o(2, 0.25)
			_o(3, -0.2)
			_o(4, 0.3)
			_o(5, -0.25)
			_o(6, -2.4)
		_:
			var corre := pose == "corre"
			var a := amp if pose == "pe" else maxf(amp, 0.6)
			var k := a * (0.85 if corre else 0.55)
			_o(0, sin(ph * 2.0) * 0.05 * a + (0.12 if pose == "morde" else 0.0))
			_o(1, -0.05 + sin(ph * 2.0) * 0.07 * a + (0.4 * maxf(0.0, sin(t * 13.0)) if pose == "morde" else 0.0), _hy)
			if corre:
				_o(2, -s * k)
				_o(3, -sin(ph + 0.45) * k)
				_o(4, sin(ph + 0.95) * k)
				_o(5, sin(ph + 1.35) * k)
			else:
				_o(2, -s * k)
				_o(5, -s * k)
				_o(3, s * k)
				_o(4, s * k)
			_o(6, -1.0 if pose == "morde" else -0.55, sin(t * (13.0 if wag > 0.5 else 5.0)) * 0.45 * maxf(wag, 0.25))
	(O[0] as Node3D).position.y = 0.36 + 0.28 * 0.35 + hip
	corpo.rotation.z = lerpf(corpo.rotation.z, 1.45 if pose == "ferido" else 0.0, 0.1)
	corpo.position.y = 0.08 if pose == "ferido" else 0.0


# ======================================================================== partida em rede e jogo salvo
## quem abriu manda: posição, giro, a pose e se ele já é de alguém
func para_rede() -> PackedFloat32Array:
	var p := global_position
	return PackedFloat32Array([p.x, p.y, p.z, yaw, float(POSES.find(_pose_atual)), 1.0 if ativo else 0.0, hp / HP_MAX])


## quem entrou: o boneco segue o que veio
func rede(L: PackedFloat32Array) -> void:
	if L.size() < 6:
		return
	var p := Vector3(L[0], L[1], L[2])
	if not (is_finite(p.x) and is_finite(p.y) and is_finite(p.z)):
		return
	if not lan:
		_antes_rede = salvar()
		lan = true
		alvo = null
		global_position = p
	_lan_alvo = p
	_lan_yaw = L[3]
	_lan_modo = POSES[clampi(int(L[4]), 0, POSES.size() - 1)]
	ativo = L[5] > 0.5
	hp = (L[6] if L.size() > 6 else 1.0) * HP_MAX
	st = "segue" if ativo else "espera"
	_lan_t = 0.0


## saiu da partida: o cachorro daqui volta (como estava no seu jogo)
func soltar_rede() -> void:
	if not lan:
		return
	lan = false
	carregar(_antes_rede)
	_antes_rede = {}


func _boneco(dt: float) -> void:
	_t += dt
	_lan_t += dt
	var d := _lan_alvo - global_position
	if d.length() > 6.0:
		global_position = _lan_alvo
	else:
		global_position += d * minf(1.0, dt * 8.0)
	yaw = lerp_angle(yaw, _lan_yaw, minf(1.0, dt * 10.0))
	rotation.y = yaw
	var andando := _lan_modo == "anda" or _lan_modo == "corre"
	amp = move_toward(amp, 1.0 if andando else 0.0, dt * 5.0)
	if andando:
		ph += dt * (13.0 if _lan_modo == "corre" else 8.0)
	_pose(_lan_modo, 0.8)
	var j = main.jogador
	var ve: bool = j != null and global_position.distance_to(j.global_position) < 100.0 and _lan_t < 5.0
	if corpo.visible != ve:
		corpo.visible = ve


func salvar() -> Dictionary:
	if lan:
		return _antes_rede.duplicate(true)
	var p := global_position
	# na caçamba: no jogo salvo ele está seguindo (você carrega fora do veículo)
	return {"ativo": ativo, "st": "segue" if st == "carro" else st, "modo": modo, "hp": snappedf(hp, 0.1), "p": [p.x, p.y, p.z],
		"fica": [fica.x, fica.y, fica.z], "dica": _dica.keys(), "mordidas": mordidas}


## como no jogo antigo: atacando volta ao que fazia; machucado volta descansando na clareira
func carregar(d: Dictionary) -> void:
	iniciar()
	if d.is_empty() or not bool(d.get("ativo", false)):
		return
	ativo = true
	st = str(d.get("st", "segue"))
	modo = str(d.get("modo", "segue"))
	if modo != "fica":
		modo = "segue"
	if st == "ataca":
		st = modo
	hp = clampf(float(d.get("hp", HP_MAX)), 0.0, HP_MAX)
	if hp <= 0.0 and st != "ferido" and st != "descansa":
		hp = HP_MAX * 0.5
	var p = d.get("p", [])
	if p is Array and p.size() >= 3:
		_no_chao(Vector3(float(p[0]), float(p[1]), float(p[2])))
	var f = d.get("fica", [])
	if f is Array and f.size() >= 3:
		fica = Vector3(float(f[0]), float(f[1]), float(f[2]))
	if st == "ferido":
		st = "descansa"
		_no_chao(CLAREIRA)
	if not st in ["segue", "fica", "descansa"]:
		st = "segue"
		modo = "segue"
	if st == "fica" and fica == Vector3.ZERO:
		fica = global_position
	mordidas = int(d.get("mordidas", 0))
	for k in d.get("dica", []):
		_dica[str(k)] = true
