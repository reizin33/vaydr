class_name Bicho
extends CharacterBody3D
## Um bicho do mato (etapa 6a), como no jogo antigo (46_animais.js): dez espécies, cada uma com o seu jeito
## (presa, rebanho, arisco, defensivo, matilha, territorial, emboscada). Estados: repouso, explora, come, alerta, foge, defende,
## persegue, ataca, recupera e morto (a carcaça). Vê de frente (menos de noite, menos se você estiver agachado), ouve barulho,
## foge de zumbi, de predador e de fogo; o rebanho foge junto e segue o líder; o predador com fome caça (o lobo em matilha,
## a onça escondida dá o bote, o urso defende o espaço dele e investe, o javali encurralado revida). Morto vira carcaça:
## com uma lâmina na mochila, segure E para esfolar (couro com qualidade, carne, ossos, gordura, lã, tendão).

const ESTADOS := ["repouso", "explora", "come", "alerta", "foge", "defende", "persegue", "ataca", "recupera", "morto"]

var main
var fauna
var tipo := "coelho"
var vid := ""
var S: Dictionary = {}
var F: Dictionary = {}
var uid := 0
var lan := false            # boneco da partida em rede (quem abriu é que decide)
var esc := 1.0
var hp := 10.0
var hp_max := 10.0
var vivo := true
var st := "explora"
var t := 2.0
var cd := 0.0
var flash := 0.0
var golpeado_t := 0.0
var alerta := 0.0
var amea := {}              # {"p": Vector3, "f": força, "jog": é um jogador}
var amea_t := 0.0
var fome := 0.0
var lider: Bicho = null
var off_a := 0.0
var off_r := 0.0
var presa: Bicho = null
var alvo_p := false
var investidas := 0
var furtivo := false
var devagar := false
var parada := 0.0
var foge_de := Vector3.ZERO
var rec_de := Vector3.INF
var rumo := Vector2(0, 1)   # para onde quer ir (x, z)
var _rumo_t := 0.0
var v := 0.0
var v_alvo := 0.0
var yaw := 0.0
var desv_t := 0.0
var desv_mant := 0.0
var desv := Vector2.ZERO
var prog_t := 0.0
var prog_p := Vector2.ZERO
var comendo: Bicho = null
var atq_t := 0.0
var atq_alvo = null         # "J" (o jogador mais perto) ou outro bicho
var atq_feito := false
var zona := ""
var golpes := 0
var queimou := false
var explodiu := false
var carc := {}              # a carcaça: {"rest": {item: n}, "t0": minutos de jogo, "q": -1, "limpo", "estrago", "vazia", "esfolada"}
var morto_t := 0.0
var _z_t := 0.0
var _zumbi = null
var _predador: Bicho = null
var _som_t := 8.0
var amp := 0.0
var ph := 0.0
var rolo := 0.0
var afunda := 0.0
var corpo: Node3D
var O: Array = []
var forma_col: CollisionShape3D
var _lan_alvo := Vector3.ZERO
var _lan_yaw := 0.0
var _alvo = null            # o jogador (ou amigo) mais perto
var _dp := 999.0


func _init(m, fa, tp: String, vd := "") -> void:
	main = m
	fauna = fa
	tipo = tp
	vid = vd
	S = ModelosBichos.dados()["fauna"][tp]
	F = ModelosBichos.forma(tp, vd)


func _ready() -> void:
	var e: Array = S["esc"]
	esc = randf_range(float(e[0]), float(e[1]))
	hp_max = float(S["hp"]) * esc
	hp = hp_max
	var mb := ModelosBichos.montar(tipo, vid)
	corpo = mb["raiz"]
	O = mb["ossos"]
	corpo.scale = Vector3.ONE * esc
	add_child(corpo)
	# a forma para bater, atirar e esbarrar: uma caixa do tamanho do corpo (com a cabeça)
	forma_col = CollisionShape3D.new()
	var bx := BoxShape3D.new()
	var Hc := ModelosBichos.altura_corpo(F)
	var alto := (Hc + float(F["H"]) * 0.55) * esc
	var cab := float(F["cab"]["len"]) + float(F["pesc"]["len"]) * cos(float(F["pesc"]["ang"]))
	bx.size = Vector3(maxf(float(F["W"]) * 1.05, 0.12) * esc, alto, (float(F["L"]) + cab * 0.8) * esc)
	forma_col.shape = bx
	forma_col.position = Vector3(0, alto * 0.5, cab * 0.3 * esc)
	add_child(forma_col)
	set_meta("bicho", self)
	collision_layer = 1
	collision_mask = 1
	floor_snap_length = 0.6
	floor_max_angle = deg_to_rad(55.0)
	fome = randf() * float(S.get("fomeS", 100.0))
	t = randf_range(1.0, 6.0)
	yaw = randf() * TAU
	rotation.y = yaw
	prog_p = Vector2(global_position.x, global_position.z)


func nome() -> String:
	return str(S["nome"])


func centro() -> Vector3:
	return global_position + Vector3(0, ModelosBichos.altura_corpo(F) * esc, 0)


# ======================================================================== o passo de cada quadro
func _physics_process(dt: float) -> void:
	if lan:
		_passo_boneco(dt)
		return
	if not vivo:
		_passo_carcaca(dt)
		return
	_alvo = main.alvo_zumbi(self)
	var ap: Vector3 = _alvo.global_position if _alvo != null else global_position + Vector3(999, 0, 0)
	_dp = Vector2(ap.x - global_position.x, ap.z - global_position.z).length() if _alvo != null and bool(_alvo.vivo) else 999.0
	var lento := _dp > float(fauna.POP["raioLento"])
	t -= dt
	cd = maxf(0.0, cd - dt)
	flash = maxf(0.0, flash - dt)
	golpeado_t = maxf(0.0, golpeado_t - dt)
	if S.has("presas"):
		fome += dt
	if hp < hp_max and st not in ["foge", "persegue", "ataca"]:
		hp = minf(hp_max, hp + hp_max * 0.004 * dt)
	if not lento:
		_percebe(dt)
	else:
		alerta = maxf(0.0, alerta - dt * 0.3)
	if st == "ataca":
		_atacando(dt)
	else:
		_decide(dt)
	_mover(dt)
	var ve := _dp < 110.0
	if corpo.visible != ve:
		corpo.visible = ve
	if ve:
		_pose(dt)
		_som_t -= dt
		if _som_t <= 0.0:
			_som_t = 10.0 + randf() * 22.0
			if _dp < 45.0 and st in ["come", "explora", "repouso"]:
				_som("idle")


# ======================================================================== percepção (visão, barulho, zumbis, predadores, fogo)
func _percebe(dt: float) -> void:
	var forca := 0.0
	var am_p := Vector3.ZERO
	var eh_j := false
	var noite: float = main.noite_k()
	var ve := float(S["ve"])
	if _alvo != null and bool(_alvo.vivo) and _dp < ve * 2.0:
		var alc := ve * (1.0 if bool(S.get("noturno", false)) else lerpf(1.0, 0.62, noite))
		if _alvo.get("agachado") == true:
			alc *= 0.45
		if _alvo.get("lanterna_acesa") == true and noite > 0.3:
			alc *= 1.35
		if st == "come":
			alc *= 0.78
		elif st == "repouso":
			alc *= 0.6
		var ap: Vector3 = _alvo.global_position
		var dx := ap.x - global_position.x
		var dz := ap.z - global_position.z
		var cv := (dx * sin(yaw) + dz * cos(yaw)) / maxf(_dp, 0.01)
		if _dp < alc and (cv > float(S["fov"]) or _dp < alc * 0.3):
			var corre: bool = _alvo.get("_corre") == true
			alerta = minf(1.5, alerta + dt * (0.8 + 3.2 * (1.0 - _dp / alc)) * (1.6 if corre else 1.0))
		if alerta > 0.15 and _dp < ve * 1.6:
			am_p = ap
			forca = 1.0
			eh_j = true
	# os zumbis e os predadores perto (a cada 0,6 s)
	_z_t -= dt
	if _z_t <= 0.0:
		_z_t = 0.6
		_zumbi = null
		var bd := 14.0 * 14.0
		for z in main.zumbis:
			if not is_instance_valid(z) or z.estado == "morto":
				continue
			var q := (z.global_position as Vector3).distance_squared_to(global_position)
			if q < bd:
				bd = q
				_zumbi = z
		_predador = null
		var ia := str(S["ia"])
		if ia != "territorial" and ia != "emboscada":
			var pd := 1e9
			for o in fauna.bichos:
				if o == self or not is_instance_valid(o) or not o.vivo or not o.S.has("presas"):
					continue
				if not tipo in (o.S["presas"] as Array):
					continue
				var q2: float = (o.global_position as Vector3).distance_squared_to(global_position)
				var lim := 28.0 if o.presa == self else 16.0
				if q2 < lim * lim and q2 < pd:
					pd = q2
					_predador = o
	if _zumbi != null and is_instance_valid(_zumbi) and forca < 1.2:
		alerta = minf(1.5, alerta + dt * 2.0)
		am_p = _zumbi.global_position
		forca = 1.2
		eh_j = false
	if _predador != null and is_instance_valid(_predador) and _predador.vivo and forca < 1.3:
		alerta = minf(1.5, alerta + dt * 2.5)
		am_p = _predador.global_position
		forca = 1.3
		eh_j = false
	if forca > 0.0:
		amea = {"p": am_p, "f": forca, "jog": eh_j}
		amea_t = 6.0
	else:
		alerta = maxf(0.0, alerta - dt * 0.22)
		amea_t -= dt
		if amea_t <= 0.0:
			amea = {}


## ouviu um barulho (tiro, golpe, explosão, isca...): r é até onde o barulho chega
func ouvir(p: Vector3, r: float) -> void:
	if not vivo or lan:
		return
	var d := Vector2(p.x - global_position.x, p.z - global_position.z).length()
	var alc := r * float(S["ouve"])
	if d >= alc:
		return
	var f := 1.0 - d / alc
	alerta = minf(1.5, alerta + 0.25 + f * 1.3)
	if amea.is_empty() or f * 1.6 > float(amea["f"]):
		var jog := false
		if _alvo != null:
			jog = (_alvo.global_position as Vector3).distance_to(p) < 2.0
		amea = {"p": p, "f": f * 1.6, "jog": jog}
		amea_t = 6.0


func _membros() -> Array:
	var L: Bicho = _lider_vivo()
	if L == null:
		L = self
	var out: Array = []
	for o in fauna.bichos:
		if is_instance_valid(o) and o.vivo and (o == L or o._lider_vivo() == L):
			out.append(o)
	return out


func _lider_vivo() -> Bicho:
	if lider != null and is_instance_valid(lider) and lider.vivo:
		return lider
	return null


func fugir(de: Vector3, dur := 6.0) -> void:
	if st != "foge":
		_som("fuga")
	st = "foge"
	t = dur
	foge_de = de
	_rumo_t = 0.0
	# o susto passa para o grupo
	var ia := str(S["ia"])
	if ia in ["rebanho", "presa", "matilha"]:
		for o in _membros():
			if o != self and o.st != "foge" and o.st != "ataca":
				o.st = "foge"
				o.t = dur * 0.9
				o.foge_de = de
				o._rumo_t = 0.0
				o.alerta = 1.0


func _jog_pos() -> Vector3:
	return _alvo.global_position if _alvo != null else global_position


func _jog_vida() -> float:
	return float(_alvo.get("vida")) if _alvo != null and _alvo.get("vida") != null else 100.0


## perto do fogo ou dentro da base: a matilha e a onça não atacam (olhado a cada meio segundo)
var _abrigo_t := 0.0
var _abrigo_v := false


func _abrigo() -> bool:
	var agora := Time.get_ticks_msec() / 1000.0
	if agora < _abrigo_t:
		return _abrigo_v
	_abrigo_t = agora + 0.5
	var p := _jog_pos()
	_abrigo_v = main.construcao.fogo_perto(p, 6.0) or main.construcao.base_perto(p, 26.0)
	return _abrigo_v


# ======================================================================== decisão (cada espécie do seu jeito)
func _decide(dt: float) -> void:
	var dA := 1e9
	if not amea.is_empty():
		var ap: Vector3 = amea["p"]
		dA = Vector2(ap.x - global_position.x, ap.z - global_position.z).length()
	var ia := str(S["ia"])
	var ve := float(S["ve"])
	# muito ferido: até os bravos fogem
	if hp < hp_max * 0.3 and not amea.is_empty() and st != "foge" and not (ia == "emboscada" and st == "persegue" and dA < 3.0):
		fugir(amea["p"], 10.0)
		return
	var jv: bool = _alvo != null and bool(_alvo.vivo)
	match ia:
		"presa", "rebanho", "arisco":
			if S.has("presas") and st == "persegue" and presa != null:
				_caca(dt)
				return
			if not amea.is_empty() and alerta >= (0.85 if ia == "rebanho" else 0.65):
				var lim := ve * 0.62 if ia == "rebanho" else ve * 0.82
				if float(amea["f"]) >= 1.2 or dA < lim or (st == "alerta" and t <= 0.0) or golpeado_t > 0.0:
					fugir(amea["p"], 5.0 if ia == "rebanho" else (8.0 if ia == "arisco" else 7.0))
					return
				if st != "alerta" and st != "foge":
					st = "alerta"
					t = 0.8 + randf() * 1.4
					_som("alerta")
		"defensivo":
			# o javali: foge, mas encurralado ou ferido vira e ataca
			if not amea.is_empty() and alerta >= 0.7:
				if bool(amea["jog"]) and (dA < 5.0 or golpeado_t > 0.0) and investidas < 2 and hp > hp_max * 0.35:
					if st != "defende" and st != "persegue":
						st = "defende"
						t = 0.9
						_som("alerta")
						alvo_p = true
				elif st not in ["defende", "persegue", "recupera"]:
					if dA < ve or float(amea["f"]) >= 1.2:
						fugir(amea["p"], 7.0)
						return
					if st != "alerta":
						st = "alerta"
						t = 1.2
						_som("alerta")
			if st == "defende" and t <= 0.0:
				st = "persegue"
				t = 4.0
				investidas += 1
				_som("ataque")
			if st == "persegue" and alvo_p:
				_perseguir_jogador(dt, true, false)
				return
		"matilha":
			# o lobo: ataca em grupo de noite, com você ferido ou sozinho; o fogo e a base afastam
			var grupo := _membros()
			var fortes := 0
			for o in grupo:
				if o.hp > o.hp_max * 0.55:
					fortes += 1
			var noite: bool = main.noite_k() > 0.5
			var fraco := _jog_vida() < 45.0
			var abrigo := _abrigo()
			var L: Bicho = _lider_vivo()
			if L == null:
				L = self
			if st == "persegue" and presa != null:
				_caca(dt)
				return
			if st == "persegue" and alvo_p:
				if abrigo or fortes < maxi(1, grupo.size() - 1):
					fugir(_jog_pos(), 8.0)
					return
				_perseguir_jogador(dt, false, false)
				return
			if not amea.is_empty() and bool(amea["jog"]) and alerta >= 0.75 and jv:
				var ataca := not abrigo and fortes >= 2 and (noite or fraco or golpeado_t > 0.0 or (L.st == "come" and _dp < 9.0))
				if ataca:
					for o in grupo:
						if o.st != "ataca":
							o.st = "persegue"
							o.alvo_p = true
							o.presa = null
							o.t = 12.0
					_som("ataque")
					return
				if golpeado_t > 0.0 or _dp < 5.0:
					fugir(amea["p"], 7.0)
					return
				if _dp < 14.0:
					if st != "defende":
						st = "defende"
						t = 2.0 + randf()
						_som("alerta")
					return
				if st not in ["alerta", "defende", "recupera"]:
					st = "alerta"
					t = 2.5
			elif not amea.is_empty() and not bool(amea["jog"]) and float(amea["f"]) >= 1.2 and st != "foge":
				fugir(amea["p"], 6.0)
				return
			if st == "defende" and t <= 0.0:
				st = "recupera"
				t = 6.0
				rec_de = _jog_pos()
		"territorial":
			# o urso: defende o espaço dele, investe se você insiste, foge muito ferido
			if st == "persegue" and presa != null:
				_caca(dt)
				return
			if not amea.is_empty() and bool(amea["jog"]) and alerta >= 0.6 and jv:
				if st == "persegue" and alvo_p:
					if _dp > 24.0:
						st = "recupera"
						t = 8.0
						rec_de = _jog_pos()
						return
					_perseguir_jogador(dt, false, false)
					return
				if golpeado_t > 0.0 and hp > hp_max * 0.45 and st != "persegue":
					st = "persegue"
					alvo_p = true
					t = 10.0
					_som("ataque")
					return
				if _dp < 16.0 and st not in ["defende", "persegue", "recupera"]:
					st = "defende"
					t = 2.6
					_som("alerta")
					return
				if st == "defende" and t <= 0.0:
					if _dp < 13.0:
						st = "persegue"
						alvo_p = true
						t = 10.0
						_som("ataque")
					else:
						st = "recupera"
						t = 8.0
						rec_de = _jog_pos()
					return
			elif not amea.is_empty() and not bool(amea["jog"]) and float(amea["f"]) >= 1.3 and st not in ["foge", "persegue"]:
				fugir(amea["p"], 5.0)
				return
		"emboscada":
			# a onça: evita você; de noite ou com você fraco, persegue escondida e dá o bote
			if st == "persegue" and presa != null:
				_caca(dt)
				return
			var noite2: bool = main.noite_k() > 0.55
			var fraco2 := _jog_vida() < 50.0
			var abrigo2 := _abrigo()
			if not amea.is_empty() and bool(amea["jog"]) and alerta >= 0.5 and jv:
				var quer := not abrigo2 and (noite2 or fraco2 or golpeado_t > 0.0) and hp > hp_max * 0.5
				if st == "persegue" and alvo_p:
					if not quer:
						fugir(amea["p"], 10.0)
						return
					_perseguir_jogador(dt, false, true)
					return
				if quer and st != "recupera":
					st = "persegue"
					alvo_p = true
					t = 30.0
					furtivo = true
					return
				if st != "foge" and st != "recupera":
					fugir(amea["p"], 9.0)
					devagar = true
					return
			elif not amea.is_empty() and not bool(amea["jog"]) and float(amea["f"]) >= 1.3 and st != "foge":
				fugir(amea["p"], 6.0)
				return
	_rotina(dt)


# ======================================================================== sem ameaça: descansa, anda, come; o grupo segue o líder
func _rotina(dt: float) -> void:
	var L: Bicho = _lider_vivo()
	match st:
		"foge":
			if t <= 0.0 or Vector2(global_position.x - foge_de.x, global_position.z - foge_de.z).length() > float(S["ve"]) * 1.4:
				st = "recupera"
				t = 8.0 + randf() * 8.0
				devagar = false
				rec_de = foge_de
			else:
				_rumo_t -= dt
				if _rumo_t <= 0.0:
					_rumo_t = 0.5
					rumo = _rumo_fuga()
				v_alvo = float(S["trota"]) * 1.2 if devagar else float(S["corre"]) * (0.75 if hp < hp_max * 0.4 else 1.0)
			return
		"alerta":
			v_alvo = 0.0
			if not amea.is_empty():
				var ap: Vector3 = amea["p"]
				yaw = lerp_angle(yaw, atan2(ap.x - global_position.x, ap.z - global_position.z), 1.0 - exp(-dt * 4.0))
			if t <= 0.0 and alerta < 0.5:
				st = "explora"
				t = 3.0 + randf() * 4.0
			elif t <= 0.0:
				t = 0.5
			return
		"defende":
			v_alvo = 0.0
			var jp := _jog_pos()
			yaw = lerp_angle(yaw, atan2(jp.x - global_position.x, jp.z - global_position.z), 1.0 - exp(-dt * 5.0))
			if t <= 0.0 and not str(S["ia"]) in ["defensivo", "matilha", "territorial"]:
				st = "explora"
				t = 3.0
			return
		"recupera":
			# anda devagar para longe de onde veio o perigo e volta ao normal
			var de := rec_de if rec_de != Vector3.INF else global_position - Vector3(rumo.x, 0, rumo.y)
			var d := Vector2(global_position.x - de.x, global_position.z - de.z)
			rumo = d.normalized() if d.length() > 0.01 else rumo
			v_alvo = float(S["anda"]) * (0.7 if hp < hp_max * 0.5 else 1.0)
			if t <= 0.0:
				st = "explora"
				t = 3.0 + randf() * 5.0
				alvo_p = false
				furtivo = false
				investidas = 0
			return
		"persegue":
			if presa == null and not alvo_p:
				st = "explora"
				t = 3.0
			return
	# o predador com fome procura presa
	if S.has("presas") and fome > float(S["fomeS"]) and (L == null or str(S["ia"]) != "matilha"):
		var pr := _procurar_presa()
		if pr != null:
			st = "persegue"
			presa = pr
			t = 22.0
			alvo_p = false
			if str(S["ia"]) == "matilha":
				for o in _membros():
					if o != self and o.st != "ataca":
						o.st = "persegue"
						o.presa = pr
						o.t = 22.0
						o.alvo_p = false
			return
	# o rebanho e a matilha acompanham o líder
	if L != null:
		var a := L.yaw + off_a
		var tx := L.global_position.x + sin(a) * off_r
		var tz := L.global_position.z + cos(a) * off_r
		var d2 := Vector2(tx - global_position.x, tz - global_position.z)
		if d2.length() > 2.2:
			st = "explora"
			rumo = d2.normalized()
			v_alvo = float(S["trota"]) if d2.length() > 9.0 else float(S["anda"]) * (1.3 if d2.length() > 4.0 else 1.0)
			return
		if L.st == "repouso" or L.st == "come":
			if st != L.st:
				st = L.st
				t = L.t + randf() * 3.0
			v_alvo = 0.0
			return
		v_alvo = 0.0
		if t <= 0.0:
			st = "come" if randf() < 0.6 else "explora"
			t = 2.0 + randf() * 4.0
		return
	if t <= 0.0:
		var r := randf()
		var noite: bool = main.noite_k() > 0.5
		var dorme := not noite if bool(S.get("noturno", false)) else noite
		if r < (0.45 if dorme else 0.18):
			st = "repouso"
			t = 12.0 + randf() * 25.0
		elif r < 0.62:
			st = "come"
			t = 5.0 + randf() * 9.0
		else:
			st = "explora"
			t = 4.0 + randf() * 7.0
		if st == "explora":
			var Z: Dictionary = fauna.zona(zona)
			var alvo := Vector2.ZERO
			if not Z.is_empty() and not bool(Z.get("rio", false)) and not fauna.dentro_zona(Z, global_position.x, global_position.z):
				alvo = Vector2(float(Z["x"]) - global_position.x, float(Z["z"]) - global_position.z)
			else:
				var a2 := yaw + (randf() - 0.5) * 2.4
				alvo = Vector2(sin(a2), cos(a2))
			rumo = alvo.normalized() if alvo.length() > 0.01 else Vector2(0, 1)
	v_alvo = float(S["anda"]) if st == "explora" else 0.0
	if st == "come" and comendo != null and is_instance_valid(comendo) and not comendo.vivo:
		var dc := Vector2(comendo.global_position.x - global_position.x, comendo.global_position.z - global_position.z)
		if dc.length() > 1.6:
			rumo = dc.normalized()
			v_alvo = float(S["anda"])


func _procurar_presa() -> Bicho:
	var best: Bicho = null
	var bd := pow(float(S["ve"]) * 1.1, 2.0)
	for o in fauna.bichos:
		if not is_instance_valid(o) or not o.vivo or not o.tipo in (S["presas"] as Array):
			continue
		var q: float = (o.global_position as Vector3).distance_squared_to(global_position)
		if q < bd:
			bd = q
			best = o
	return best


## o predador atrás da presa: corre, morde, mata e come
func _caca(_dt: float) -> void:
	var pr := presa
	if pr == null or not is_instance_valid(pr) or not pr.vivo or t <= 0.0:
		presa = null
		st = "recupera"
		t = 5.0
		return
	var dd := Vector2(pr.global_position.x - global_position.x, pr.global_position.z - global_position.z)
	var d := dd.length()
	if d > float(S["ve"]) * 1.6:
		presa = null
		st = "recupera"
		t = 5.0
		return
	rumo = dd.normalized()
	v_alvo = float(S["corre"]) * (1.0 if d < 6.0 else 0.9)
	if d < float(S["ataque"]["alc"]) * esc + float(pr.S["r"]) and cd <= 0.0:
		st = "ataca"
		atq_t = 0.0
		atq_alvo = pr
		atq_feito = false


## atrás do jogador (a investida do javali passa reto; a onça chega escondida e para se você olhar para ela)
func _perseguir_jogador(dt: float, investida: bool, furtiva: bool) -> void:
	var jp := _jog_pos()
	var dd := Vector2(jp.x - global_position.x, jp.z - global_position.z)
	if t <= 0.0 or _alvo == null or not bool(_alvo.vivo):
		st = "recupera"
		t = 6.0
		rec_de = jp
		return
	if furtiva:
		var olhando := false
		if _alvo.get("cam") != null:
			var fr: Vector3 = -(_alvo.cam as Camera3D).global_transform.basis.z
			olhando = (-dd.x * fr.x - dd.y * fr.z) / maxf(_dp, 0.01) > 0.6
		if olhando and _dp < 14.0 and _dp > 7.0:
			v_alvo = 0.0
			rumo = dd.normalized()
			parada += dt
			if parada > 2.5:
				parada = 0.0
				fugir(jp, 8.0)
				devagar = true
			return
		parada = 0.0
		rumo = dd.normalized()
		v_alvo = float(S["anda"]) * 1.25 if _dp > 8.0 else float(S["corre"])
		furtivo = _dp > 8.0
	else:
		# a matilha: no máximo dois atacam de cada vez; os outros rodeiam rosnando
		if str(S["ia"]) == "matilha" and _dp < 8.0:
			var perto := 0
			for o in _membros():
				if o != self and (o.st == "ataca" or (o.st == "persegue" and Vector2(o.global_position.x - jp.x, o.global_position.z - jp.z).length() < 3.5)):
					perto += 1
			if perto >= 2:
				var a := atan2(global_position.x - jp.x, global_position.z - jp.z) + 0.9
				rumo = Vector2(jp.x + sin(a) * 6.5 - global_position.x, jp.z + cos(a) * 6.5 - global_position.z).normalized()
				v_alvo = float(S["trota"])
				return
		rumo = dd.normalized()
		v_alvo = float(S["corre"]) * (1.05 if investida else (0.8 if _dp < 4.0 else 1.0))
	var alc := float(S["ataque"]["alc"]) * esc + 0.35
	if _dp < alc and cd <= 0.0:
		st = "ataca"
		atq_t = 0.0
		atq_alvo = "J"
		atq_feito = false
		furtivo = false


## o golpe: preparação curta, acerta se o alvo ainda está perto e na frente, depois o intervalo
func _atacando(dt: float) -> void:
	var A: Dictionary = S["ataque"]
	var prep := 0.5 if tipo == "urso" else (0.3 if tipo == "onca" else (0.08 if tipo == "javali" else 0.32))
	atq_t += dt
	var eh_j: bool = atq_alvo is String
	var alvo = _alvo if eh_j else atq_alvo
	if not eh_j and alvo != null and is_instance_valid(alvo) and not alvo.vivo and comendo == alvo:
		st = "come"
		t = 35.0 + randf() * 40.0
		cd = float(A["cad"])
		return
	if alvo == null or not is_instance_valid(alvo) or not bool(alvo.vivo):
		st = "recupera"
		t = 4.0
		return
	var ap: Vector3 = alvo.global_position
	var dd := Vector2(ap.x - global_position.x, ap.z - global_position.z)
	var d := dd.length()
	var encosta: float = (0.45 if eh_j else float(alvo.S["r"])) + float(S["r"]) * esc
	if tipo != "javali":
		yaw = lerp_angle(yaw, atan2(dd.x, dd.y), 1.0 - exp(-dt * 14.0))
		rumo = dd.normalized() if d > 0.01 else rumo
		v_alvo = (float(S["corre"]) if tipo == "onca" else float(S["trota"])) if (atq_t < prep and d > encosta + 0.3) else 0.0
	else:
		v_alvo = float(S["corre"]) * 0.9
	if not atq_feito and atq_t >= prep:
		atq_feito = true
		var frente := (dd.x * sin(yaw) + dd.y * cos(yaw)) / maxf(d, 0.01)
		var alc: float = float(A["alc"]) * esc * 1.3 + (0.4 if eh_j else float(alvo.S["r"]))
		if d < alc and (frente > 0.2 or d < encosta + 0.6):
			if eh_j:
				_ferir_jogador(alvo)
			else:
				alvo.ferir(float(A["dano"]) * 3.0, global_position, "predador")
				if not alvo.vivo:
					comendo = alvo
					presa = null
					fome = 0.0
		_som("ataque")
	if atq_t >= prep + float(A["cad"]) * 0.6:
		cd = float(A["cad"])
		if comendo != null:
			st = "come"
			t = 35.0 + randf() * 40.0
			return
		if eh_j:
			if tipo == "javali":
				st = "recupera"
				t = 2.5
				rec_de = _jog_pos()
				return
			if tipo == "lobo" and randf() < 0.7:
				st = "recupera"
				t = 2.5 + randf() * 2.0
				rec_de = _jog_pos()
				return
			if tipo == "onca" and (golpeado_t > 0.0 or randf() < 0.4):
				fugir(_jog_pos(), 7.0)
				devagar = false
				return
			st = "persegue"
			alvo_p = true
			t = maxf(t, 6.0)
			return
		st = "persegue"


func _ferir_jogador(j) -> void:
	var A: Dictionary = S["ataque"]
	var d := float(A["dano"]) * esc
	j.ferir(d, true, global_position)
	if bool(A.get("derruba", false)) and j == main.jogador:
		var fr: Vector3 = j.global_position - global_position
		fr.y = 0.0
		j.velocity += fr.normalized() * 6.0 + Vector3(0, 2.5, 0)
		j.tremor = maxf(j.tremor, 1.0)
	if j == main.jogador:
		fauna.dica_ataque(self)


# ======================================================================== andar: o rumo, desviar do que tapa, não entrar na água
func _livre(dx: float, dz: float) -> bool:
	var k := maxf(1.0, esc * float(S["r"]) * 3.0)
	var y0 := global_position.y
	for dist in [1.0 * k, 2.2 * k]:
		var x := global_position.x + dx * dist
		var z := global_position.z + dz * dist
		if not fauna.ponto_livre(x, z, 4.0, 12.0):
			return false
		if not bool(S.get("escala", false)) and absf(main.terreno.h(x, z) - y0) / dist > 0.8:
			return false
	# o que tapa na frente (árvore, pedra, parede)
	var o := centro()
	var sp := get_world_3d().direct_space_state
	var q := PhysicsRayQueryParameters3D.create(o, o + Vector3(dx, 0, dz) * 2.2 * k, 1, [get_rid()])
	var h := sp.intersect_ray(q)
	if not h.is_empty():
		var c: Object = h["collider"]
		if not c.has_meta("bicho") and not c.has_meta("zumbi"):
			return false
	return true


func _melhor_rumo(dx: float, dz: float) -> Vector2:
	for a in [0.55, -0.55, 1.1, -1.1, 1.7, -1.7, 2.4, -2.4, 3.14]:
		var c := cos(a)
		var s := sin(a)
		var nx := dx * c - dz * s
		var nz := dx * s + dz * c
		if _livre(nx, nz):
			return Vector2(nx, nz)
	return Vector2.ZERO


## o rumo da fuga: longe da ameaça, sem obstáculo, água ou ladeira; a raposa e a onça procuram o mato; o coelho ziguezagueia
func _rumo_fuga() -> Vector2:
	var de := foge_de
	var a := Vector2(global_position.x - de.x, global_position.z - de.z).normalized()
	if a == Vector2.ZERO:
		a = Vector2(sin(yaw), cos(yaw))
	var best := a
	var bs := -1e9
	var Z: Dictionary = fauna.zona(zona)
	for k in 12:
		var an := k / 12.0 * TAU
		var dx := sin(an)
		var dz := cos(an)
		var s := (dx * a.x + dz * a.y) * 2.0
		if not _livre(dx, dz):
			s -= 4.0
		if not Z.is_empty() and not bool(Z.get("rio", false)) and not fauna.dentro_zona(Z, global_position.x + dx * 3.2, global_position.z + dz * 3.2):
			s -= 0.4
		if s > bs:
			bs = s
			best = Vector2(dx, dz)
	if tipo == "coelho":
		var zz := sin(Time.get_ticks_msec() / 1000.0 * 5.0 + uid) * 0.55
		return Vector2(best.x + best.y * zz, best.y - best.x * zz).normalized()
	return best


func _mover(dt: float) -> void:
	var va := 0.0 if (st == "repouso" or (st == "come" and comendo == null)) else v_alvo
	if va > 0.05:
		var dir := rumo.normalized() if rumo.length() > 0.001 else Vector2(sin(yaw), cos(yaw))
		desv_t -= dt
		if desv_t <= 0.0:
			desv_t = 0.25
			if not _livre(dir.x, dir.y):
				var alt := _melhor_rumo(dir.x, dir.y)
				if alt != Vector2.ZERO:
					desv = alt
					desv_mant = 0.7
				else:
					va = 0.0
		if desv_mant > 0.0:
			desv_mant -= dt
			dir = desv
		yaw = lerp_angle(yaw, atan2(dir.x, dir.y), 1.0 - exp(-dt * (6.0 if va > float(S["trota"]) else 3.5)))
	var acel := float(S["corre"]) * (1.3 if va > v else 2.2)
	v = move_toward(v, va, dt * acel)
	rotation.y = yaw
	var fx := sin(yaw)
	var fz := cos(yaw)
	velocity.x = fx * v
	velocity.z = fz * v
	if is_on_floor():
		velocity.y = -0.5
	else:
		velocity.y -= 20.0 * dt
	var antes := global_position
	move_and_slide()
	# água funda, fora do mapa ou na cidade: volta
	if not fauna.ponto_livre(global_position.x, global_position.z, 4.0, 10.0) or fauna.agua_funda(global_position.x, global_position.z, 0.5):
		global_position = Vector3(antes.x, global_position.y, antes.z)
		yaw += PI * 0.7
		v *= 0.4
		desv_t = 0.0
	# preso (andando sem sair do lugar): vira e tenta outro rumo
	prog_t += dt
	if prog_t > 1.2:
		var m := Vector2(global_position.x, global_position.z).distance_to(prog_p)
		if va > 0.6 and m < 0.3 * prog_t:
			yaw += (1.0 if randf() < 0.5 else -1.0) * (1.2 + randf())
			rumo = Vector2(sin(yaw), cos(yaw))
			desv_mant = 0.0
			if st == "explora":
				st = "come"
				t = 2.0
		prog_p = Vector2(global_position.x, global_position.z)
		prog_t = 0.0
	if global_position.y < -40.0:
		fauna.tirar(self)


# ======================================================================== golpe, morte e carcaça
## tipo_dano: golpe, bala, flecha, fogo, explosao, predador, laco
func ferir(dmg: float, de: Vector3, tipo_dano := "golpe", quem := 0) -> void:
	if lan:
		if vivo:
			Rede.hit_b(uid, dmg, de, tipo_dano)
			flash = 0.15
		return
	if not vivo:
		return
	hp -= dmg
	flash = 0.15
	golpes += 1
	if tipo_dano == "fogo":
		queimou = true
	if tipo_dano == "explosao":
		explodiu = true
	main.efeitos.sangue(centro(), Vector3.UP)
	if hp <= 0.0:
		morrer(tipo_dano, dmg, quem)
		return
	_som("dor")
	golpeado_t = 6.0
	alerta = 1.5
	if tipo_dano != "predador":
		amea = {"p": de, "f": 1.6, "jog": true}
		amea_t = 8.0
	var ia := str(S["ia"])
	if ia in ["presa", "rebanho", "arisco"]:
		fugir(de, 9.0)
		return
	if tipo_dano == "predador":
		return
	if ia == "defensivo" and hp > hp_max * 0.35:
		st = "defende"
		t = 0.5
		alvo_p = true
		return
	if ia == "matilha":
		if hp < hp_max * 0.6:
			fugir(de, 8.0)
		else:
			for o in _membros():
				if o.hp > o.hp_max * 0.55 and o.st != "ataca":
					o.st = "persegue"
					o.alvo_p = true
					o.t = 10.0
		return
	if ia == "territorial":
		if hp > hp_max * 0.45:
			st = "persegue"
			alvo_p = true
			t = 12.0
			_som("ataque")
		else:
			fugir(de, 12.0)
		return
	if ia == "emboscada":
		if hp > hp_max * 0.5 and _dp < 10.0:
			st = "persegue"
			alvo_p = true
			t = 8.0
			furtivo = false
		else:
			fugir(de, 12.0)
			devagar = false


func morrer(tipo_dano: String, dmg: float, quem := 0) -> void:
	vivo = false
	st = "morto"
	t = 0.0
	v = 0.0
	velocity = Vector3.ZERO
	var limpo := golpes <= 2 and not queimou and not explodiu and tipo_dano != "predador"
	var estrago := golpes > 6 or queimou or explodiu or dmg > hp_max * 1.8
	var rest: Dictionary = (ModelosBichos.dados()["fauna_rende"][tipo] as Dictionary).duplicate()
	if tipo_dano == "predador":
		rest["carneCrua"] = int(floor(float(rest.get("carneCrua", 0)) * 0.35))
		if rest.has("gordura"):
			rest["gordura"] = int(floor(float(rest["gordura"]) / 2.0))
	carc = {"rest": rest, "t0": fauna.minutos(), "q": -1, "limpo": limpo, "estrago": estrago, "vazia": false, "esfolada": false,
		"lado": 1.0 if randf() < 0.5 else -1.0}
	# a carcaça: a mira pega (E para esfolar), mas ninguém tropeça nela
	collision_layer = 2
	collision_mask = 1
	fauna.baixa(self)
	_som("morte")
	for o in _membros():
		if o != self and o.vivo and str(o.S["ia"]) != "matilha":
			o.alerta = 1.2
			o.fugir(global_position, 6.0)
	for o in fauna.bichos:
		if is_instance_valid(o) and o.lider == self:
			o.lider = null
	if tipo_dano != "predador":
		fauna.cacou(self, quem)


func _passo_carcaca(dt: float) -> void:
	morto_t += dt
	var idade: float = fauna.minutos() - float(carc.get("t0", 0.0))
	var some := false
	if bool(carc.get("vazia", false)) and fauna.minutos() - float(carc.get("tv", fauna.minutos())) > 360.0:
		some = true   # esfolada: os restos somem em 6 horas
	if not bool(carc.get("vazia", false)) and idade > 2880.0:
		some = true   # inteira apodrece em 2 dias
	if some:
		afunda -= dt * 0.35
		if afunda < -0.8:
			fauna.tirar(self)
			return
	if not is_on_floor():
		velocity = Vector3(0, velocity.y - 20.0 * dt, 0)
		move_and_slide()
	var jp: Vector3 = main.jogador.global_position
	var ve := jp.distance_to(global_position) < 110.0
	if corpo.visible != ve:
		corpo.visible = ve
	if ve:
		_pose_morto(dt)


## o que dá para tirar: a qualidade do couro sai da espécie, do estado da carcaça (golpes, fogo, explosão, idade) e da lâmina
func qualidade(lamina: Dictionary) -> int:
	var q := int(S.get("couroQ", 1))
	if bool(carc.get("estrago", false)):
		q -= 1
	if bool(carc.get("limpo", false)):
		q += 1
	var h := (fauna.minutos() - float(carc.get("t0", 0.0))) / 60.0
	if h > 24.0:
		q -= 2
	elif h > 10.0:
		q -= 1
	q += int(Dados.item(str(lamina.get("id", ""))).get("esfolaQ", 0))
	return clampi(q, 0, 3)


func resumo() -> String:
	var L := PackedStringArray()
	var rest: Dictionary = carc.get("rest", {})
	for k in rest:
		if int(rest[k]) > 0:
			L.append("%d %s" % [int(rest[k]), Dados.nome(str(k)).to_lower()])
	return ", ".join(L)


# ======================================================================== a pose (como faunaPose do jogo antigo)
const MARCHA := {"passo": [0.25, 0.75, 0.0, 0.5], "trote": [0.0, 0.5, 0.5, 0.0], "galope": [0.0, 0.12, 0.55, 0.66], "salto": [0.0, 0.06, 0.5, 0.56]}


func _osso(i: int, rx: float, ry := 0.0, rz := 0.0) -> void:
	(O[i] as Node3D).rotation = Vector3(rx, ry, rz)


func _pose(dt: float) -> void:
	var o: Array = []
	o.resize(36)
	o.fill(0.0)
	var hip_y := 0.0
	var pitch := 0.0
	var roll := 0.0
	var tt := Time.get_ticks_msec() / 1000.0 + uid * 1.7
	var leg := float(F["pS"][0]) + float(F["pI"][0])
	var coelho := tipo == "coelho"
	var marcha := "passo"
	var A := 0.35
	var B := 0.6
	var passo_l := leg * 1.9
	if coelho and v > 0.3:
		marcha = "salto"
		A = 0.85
		B = 1.0
		passo_l = leg * 4.0
	elif v > (float(S["trota"]) + float(S["corre"])) / 2.0:
		marcha = "galope"
		A = 0.75
		B = 1.1
		passo_l = leg * 4.2
	elif v > (float(S["anda"]) + float(S["trota"])) / 2.0:
		marcha = "trote"
		A = 0.5
		B = 0.85
		passo_l = leg * 2.8
	amp = move_toward(amp, 1.0 if v > 0.12 else 0.0, dt * 4.0)
	ph += dt * v / maxf(0.1, passo_l * esc) * TAU
	var off: Array = MARCHA[marcha]
	if amp > 0.01:
		for k in 4:
			var a := ph + float(off[k]) * TAU
			var up := 3 + k * 2
			o[up * 3] = sin(a) * A * amp * (0.9 if k < 2 else 1.0)
			o[(up + 1) * 3] = maxf(0.0, -cos(a)) * B * amp * (1.0 if k < 2 else 0.9)
	if marcha == "galope" or marcha == "salto":
		pitch = sin(ph) * 0.07 * amp
		hip_y = maxf(0.0, sin(ph)) * leg * 0.12 * amp
	else:
		hip_y = -absf(sin(ph)) * leg * 0.03 * amp
	var pesc := sin(ph * 2.0) * 0.05 * amp
	var cab := 0.0
	var rabo := sin(tt * 2.2) * 0.12
	if st == "come" and v < 0.2:
		pesc = 0.65 if tipo == "javali" else float(F["pesc"]["ang"]) * 0.85 + 0.62
		cab = 0.3 + sin(tt * 5.0) * 0.08
		hip_y -= leg * 0.03
		if tipo in ["urso", "lobo", "onca", "raposa"]:
			pesc = 0.7
			cab = 0.3 + sin(tt * 3.0) * 0.15
	elif st == "alerta":
		pesc = -0.32
		cab = -0.1
		rabo = 1.0 if tipo in ["cervo", "coelho"] else 0.3
	elif st == "repouso" and v < 0.2:
		_aplicar(o, _pose_deitado(o, tt), 0.0, 0.0)
		return
	elif st == "defende":
		if tipo == "urso":
			_aplicar(o, _pose_em_pe(o, tt, 1.0), 0.0, 0.0)
			return
		if tipo == "javali":
			pesc = 0.5
			cab = 0.15
			pitch = 0.06
			o[9] = -0.35 + sin(tt * 9.0) * 0.45
			o[12] = maxf(0.0, sin(tt * 9.0)) * 0.8
			hip_y -= 0.03
		else:
			pesc = 0.32
			cab = -0.25
			pitch = 0.07
			hip_y -= leg * 0.07
			rabo = -0.7
			for k in [0, 1]:
				o[(3 + k * 2) * 3] = -0.12
				o[(4 + k * 2) * 3] = 0.22
			for k in [2, 3]:
				o[(3 + k * 2) * 3] = -0.25
				o[(4 + k * 2) * 3] = 0.45
	elif st == "ataca":
		var prep := 0.5 if tipo == "urso" else 0.35
		var kk := clampf(atq_t / prep, 0.0, 1.0)
		var f := sin(minf(1.0, atq_t / (prep + 0.25)) * PI)
		if tipo == "urso":
			var hy := _pose_em_pe(o, tt, 0.55 * f)
			o[15] = -1.6 + kk * 2.0
			o[18] = 0.4
			_aplicar(o, hy, 0.0, sin(kk * PI) * 0.15)
			return
		if tipo == "onca":
			hip_y += f * leg * 0.45
			pitch = -0.15 * f
			o[9] = -1.1 * f
			o[15] = -1.1 * f
			o[21] = 0.7 * f
			o[27] = 0.7 * f
			pesc = -0.2 + 0.4 * kk
			cab = 0.2
		else:
			pesc = -0.25 + 0.6 * kk
			cab = 0.25 * kk
			pitch = 0.12 * f
			o[9] = -0.5 * f
			o[15] = -0.5 * f
	elif st == "recupera" and v < 1.5:
		pesc = 0.25
		cab = sin(tt * 9.0) * 0.05
	elif st == "persegue" and furtivo:
		hip_y -= leg * 0.22
		pesc = 0.15
		cab = -0.2
		rabo = -0.2 + sin(tt * 3.0) * 0.25
		for k in 4:
			o[(4 + k * 2) * 3] = float(o[(4 + k * 2) * 3]) + 0.35
	if coelho and v < 0.3:
		for k in [2, 3]:
			o[(3 + k * 2) * 3] = -0.9
			o[(4 + k * 2) * 3] = 1.6
		hip_y -= 0.05
		pitch = -0.1
	# ladeira: o corpo acompanha o chão
	var L := float(F["L"]) * 0.4 * esc
	var fx := sin(yaw) * L
	var fz := cos(yaw) * L
	var hf: float = main.terreno.h(global_position.x + fx, global_position.z + fz)
	var ht: float = main.terreno.h(global_position.x - fx, global_position.z - fz)
	pitch += clampf(-atan2(hf - ht, L * 2.0), -0.5, 0.5)
	o[3] = pesc
	o[6] = cab
	o[33] = float(o[33]) + rabo
	o[34] = sin(tt * 1.7) * 0.2
	_aplicar(o, hip_y, pitch, roll)


## põe as rotações nos ossos (o corpo sobe ou desce hip_y e inclina pitch/roll)
func _aplicar(o: Array, hip_y: float, pitch: float, roll: float) -> void:
	var Hc := ModelosBichos.altura_corpo(F)
	var b0 := O[0] as Node3D
	b0.position.y = Hc + hip_y
	b0.rotation = Vector3(float(o[0]) + pitch, float(o[1]), float(o[2]) + roll)
	if flash > 0.0:
		corpo.scale = Vector3.ONE * esc * (1.0 + flash * 0.25)
	elif corpo.scale.x != esc:
		corpo.scale = Vector3.ONE * esc
	for i in range(1, 12):
		(O[i] as Node3D).rotation = Vector3(float(o[i * 3]), float(o[i * 3 + 1]), float(o[i * 3 + 2]))


func _pose_deitado(o: Array, tt: float) -> float:
	var leg := float(F["pS"][0]) + float(F["pI"][0])
	var hip_y := -leg * 0.82
	var dobra := str(F.get("dobra", "pata"))
	if dobra == "casco":
		o[9] = 0.6
		o[15] = 0.6
		o[12] = -2.6
		o[18] = -2.6
		o[21] = -1.2
		o[27] = -1.2
		o[24] = 2.5
		o[30] = 2.5
	elif dobra == "coelho":
		hip_y = -leg * 0.45
		o[9] = -0.3
		o[15] = -0.3
		o[21] = -1.1
		o[27] = -1.1
		o[24] = 2.2
		o[30] = 2.2
	else:
		o[9] = -1.35
		o[15] = -1.35
		o[12] = -0.15
		o[18] = -0.15
		o[21] = -1.2
		o[27] = -1.2
		o[24] = 2.4
		o[30] = 2.4
	o[3] = 0.3 + sin(tt * 0.6) * 0.05
	o[4] = sin(tt * 0.3) * 0.15
	o[6] = 0.2
	o[33] = -0.3
	return hip_y


## o urso em pé nas patas de trás (o quadril gira em torno dos pés de trás)
func _pose_em_pe(o: Array, tt: float, k: float) -> float:
	var a := -1.15 * k
	var Hc := ModelosBichos.altura_corpo(F)
	var jy := -(Hc - float(F["pS"][1]) - float(F["pI"][1]))
	var jz := float(F["legZ"][1])
	var yj := jy * cos(a) - jz * sin(a)
	var raiz := float(F["pS"][1]) + float(F["pI"][1]) - yj
	o[0] = a
	o[21] = -a
	o[27] = -a
	o[9] = -0.9 * k + sin(tt * 3.0) * 0.2
	o[15] = -0.9 * k + sin(tt * 3.0) * 0.2
	o[12] = 0.6 * k
	o[18] = 0.6 * k
	o[3] = -0.15
	o[6] = 0.35 * k
	o[33] = -0.4
	return raiz - Hc


func _pose_morto(dt: float) -> void:
	var o: Array = []
	o.resize(36)
	o.fill(0.0)
	var Hc := ModelosBichos.altura_corpo(F)
	var alvo := float(carc.get("lado", 1.0)) * 1.45
	rolo = lerpf(rolo, alvo, minf(1.0, dt * 5.0))
	o[2] = rolo
	var k := absf(rolo) / 1.45
	var hip_y := lerpf(0.0, float(F["W"]) * 0.42 - Hc, k) + afunda
	o[9] = -0.35
	o[15] = -0.15
	o[21] = 0.35
	o[27] = 0.15
	o[12] = 0.12
	o[18] = 0.12
	o[24] = 0.12
	o[30] = 0.12
	o[3] = -0.25
	o[6] = 0.1
	o[33] = -0.3
	_aplicar(o, hip_y, 0.0, 0.0)


func _som(ev: String) -> void:
	if _dp > 48.0 and ev == "idle":
		return
	main.sons.tocar("bicho_" + fauna.voz(tipo, ev), global_position, -2.0 if ev == "idle" else 2.0)


# ======================================================================== partida em rede
func para_rede() -> PackedFloat32Array:
	var p := global_position
	return PackedFloat32Array([uid, p.x, p.y, p.z, yaw, ESTADOS.find(st), clampf(hp / hp_max, 0.0, 1.0), v,
		float(fauna.TIPOS.find(tipo)) + (0.5 if vid != "" else 0.0), esc, float(carc.get("lado", 1.0)) if not vivo else 0.0])


func rede(p: Vector3, y: float, est: int, h: float, vel: float, e: float, lado: float) -> void:
	if e > 0.05 and absf(e - esc) > 0.001:
		esc = e
		hp_max = float(S["hp"]) * esc
		if corpo != null:
			corpo.scale = Vector3.ONE * esc
	_lan_alvo = p
	_lan_yaw = y
	v = vel
	hp = h * hp_max
	var es: String = ESTADOS[clampi(est, 0, ESTADOS.size() - 1)]
	if es == "morto" and vivo:
		vivo = false
		collision_layer = 2
		carc["lado"] = lado
		carc["rest"] = {}
	st = es


func _passo_boneco(dt: float) -> void:
	var d := _lan_alvo - global_position
	if d.length() > 6.0:
		global_position = _lan_alvo
	else:
		global_position += d * minf(1.0, dt * 8.0)
	yaw = lerp_angle(yaw, _lan_yaw, minf(1.0, dt * 10.0))
	rotation.y = yaw
	flash = maxf(0.0, flash - dt)
	var jp: Vector3 = main.jogador.global_position
	_dp = Vector2(jp.x - global_position.x, jp.z - global_position.z).length()
	var ve := _dp < 110.0
	if corpo.visible != ve:
		corpo.visible = ve
	if not ve:
		return
	if vivo:
		_pose(dt)
	else:
		_pose_morto(dt)
