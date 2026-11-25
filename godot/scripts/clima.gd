class_name Clima
extends Node3D
## O tempo, as estações e a lua (etapa 6b), como no jogo antigo (48k_clima.js e 48zf_estacoes.js):
## · cada amanhecer sorteia o tempo do dia (o rádio dá a previsão) e o tempo muda aos poucos: céu limpo, nublado, garoa,
##   chuva, tempestade, neblina, calorão, frente fria, ventania e céu fechado;
## · neblina: enxerga-se pouco (você, os zumbis e os bichos); chuva: abafa o barulho e molha (molhado à noite dá frio);
##   tempestade: escuro, trovão, raio nas árvores altas (pega fogo); calor: a sede aperta ao sol; frente fria: noite gelada;
## · o ano tem quatro estações de 7 dias (começa na primavera), cada uma com a sua temperatura (no relógio, em °C), o seu tempo
##   (verão com calorão e temporal, inverno com frio e céu fechado, outono com ventania, primavera com chuva e neblina), a cor
##   das copas e a força do vento; e períodos de vários dias de chuva, de seca e ondas de frio (avisados no rádio);
## · com frio (de noite sem roupa quente, molhado, na frente fria, no inverno) a energia não enche: roupa quente, abrigo e fogo;
## · a lua tem fases (8 dias): a cheia clareia a noite, a nova escurece; eclipse do sol ao meio-dia a cada 13 dias.
## Na partida em rede quem abriu sorteia o tempo e manda para quem entrou.

const DEF := {
	"limpo": {"nome": "Céu limpo", "icone": "sol", "chuva": 0.0},
	"nublado": {"nome": "Nublado", "icone": "nublado", "chuva": 0.0},
	"chuva": {"nome": "Chuva", "icone": "chuva", "chuva": 0.72},
	"tempestade": {"nome": "Tempestade", "icone": "tempestade", "chuva": 1.0},
	"neblina": {"nome": "Neblina", "icone": "neblina", "chuva": 0.0},
	"calor": {"nome": "Calorão", "icone": "calor", "chuva": 0.0},
	"frio": {"nome": "Frente fria", "icone": "frio", "chuva": 0.0},
	"garoa": {"nome": "Garoa", "icone": "chuva", "chuva": 0.38},
	"ventania": {"nome": "Ventania", "icone": "vento", "chuva": 0.0},
	"escuro": {"nome": "Céu fechado", "icone": "nublado", "chuva": 0.0},
}
const TIPOS := ["limpo", "nublado", "chuva", "tempestade", "neblina", "calor", "frio", "garoa", "ventania", "escuro"]
## os padrões de dia: [peso, [[início, fim, tipo], ...]] em horas do dia de jogo (o dia vira às 6h: 6 a 30, e 24 a 30 é a
## madrugada seguinte)
const PADROES := [
	[30, []],
	[16, [[6, 9.6, "neblina"]]],
	[12, [[9, 14, "nublado"], [14, 18.5, "chuva"]]],
	[8, [[12, 16, "nublado"], [16, 19, "chuva"], [19, 24.5, "tempestade"]]],
	[9, [[10.5, 17.5, "calor"]]],
	[9, [[17, 20, "nublado"], [20, 30, "frio"]]],
	[8, [[6, 11, "nublado"], [11, 13.5, "chuva"], [13.5, 16, "nublado"]]],
	[8, [[6, 7.5, "neblina"], [7.5, 12, "nublado"], [21, 28, "chuva"], [28, 30, "neblina"]]],
	[10, [[6, 30, "garoa"]]],
	[9, [[9, 19, "ventania"]]],
	[8, [[6, 30, "escuro"]]],
	[6, [[6, 12, "garoa"], [12, 18, "nublado"], [18, 24, "garoa"]]],
]
const ESTACOES := [
	{"id": "primavera", "nome": "Primavera", "icone": "flor", "temp": [15, 25], "horta": 1.2, "fauna": 1.6, "pred": 1.0, "vento": 1.0,
		"peso": {"neblina": 1.3, "chuva": 1.35, "calor": 0.7, "frio": 0.6, "tempestade": 0.9, "garoa": 1.2, "ventania": 0.7, "escuro": 0.4},
		"copa": Color(0.96, 1.06, 0.92), "luz": Color(0.99, 1.04, 0.97)},
	{"id": "verao", "nome": "Verão", "icone": "sol", "temp": [21, 33], "horta": 1.0, "fauna": 1.1, "pred": 1.0, "vento": 0.9,
		"peso": {"neblina": 0.5, "chuva": 1.0, "calor": 2.6, "frio": 0.0, "tempestade": 1.7, "garoa": 0.4, "ventania": 0.6, "escuro": 0.2},
		"copa": Color(1.03, 1.01, 0.87), "luz": Color(1.06, 1.02, 0.92)},
	{"id": "outono", "nome": "Outono", "icone": "folha", "temp": [11, 23], "horta": 0.8, "fauna": 0.8, "pred": 1.1, "vento": 1.3,
		"peso": {"neblina": 1.2, "chuva": 1.2, "calor": 0.5, "frio": 1.2, "tempestade": 0.8, "garoa": 1.3, "ventania": 2.2, "escuro": 0.8},
		"copa": Color(1.42, 1.08, 0.53), "luz": Color(1.06, 0.98, 0.86)},
	{"id": "inverno", "nome": "Inverno", "icone": "floco", "temp": [2, 16], "horta": 0.35, "fauna": 0.4, "pred": 1.3, "vento": 1.15,
		"peso": {"neblina": 1.4, "chuva": 0.8, "calor": 0.0, "frio": 2.6, "tempestade": 0.4, "garoa": 1.1, "ventania": 1.2, "escuro": 1.8},
		"copa": Color(0.98, 0.9, 0.78), "luz": Color(0.94, 0.98, 1.07)},
]
const DIAS_ESTACAO := 7
const LUA_CICLO := 8
const LUA_NOMES := ["Lua nova", "Lua crescente", "Quarto crescente", "Crescente gibosa", "Lua cheia", "Minguante gibosa", "Quarto minguante", "Lua minguante"]
const SERRA := Vector2(-100, -84)   # a Serra Velha (mais alta e mais fria)

var main
var dia_c := -1
var segs: Array = []
var atual := "limpo"
var antes := "limpo"
var k := 1.0
var periodo := {}
var molhado := 0.0
var chuva_k := 0.0          # quanto chove agora (0 a 1), com a transição
var _prev_t := -1.0
var _raio_t := 40.0
var _trovao_t := 8.0
var flash := 0.0
var _chuva: CPUParticles3D
var _mat_chuva: StandardMaterial3D
var _som_chuva: AudioStreamPlayer
var _rede_t := 0.0
var _aviso_t := 0.0


func _init(m) -> void:
	main = m


func _ready() -> void:
	# a chuva: gotas em volta da câmera (seguem você)
	_chuva = CPUParticles3D.new()
	_chuva.amount = 900
	_chuva.lifetime = 0.9
	_chuva.emission_shape = CPUParticles3D.EMISSION_SHAPE_BOX
	_chuva.emission_box_extents = Vector3(16, 1, 16)
	_chuva.direction = Vector3(0.08, -1, 0.04)
	_chuva.spread = 3.0
	_chuva.gravity = Vector3(0, -18, 0)
	_chuva.initial_velocity_min = 13.0
	_chuva.initial_velocity_max = 16.0
	_chuva.local_coords = false
	var q := QuadMesh.new()
	q.size = Vector2(0.012, 0.42)
	var m := StandardMaterial3D.new()
	m.albedo_color = Color(0.72, 0.78, 0.86, 0.38)
	m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	m.billboard_mode = BaseMaterial3D.BILLBOARD_FIXED_Y
	m.billboard_keep_scale = true
	q.material = m
	_mat_chuva = m
	_chuva.mesh = q
	_chuva.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	_chuva.emitting = false
	add_child(_chuva)
	# o barulho da chuva (ruído filtrado em laço)
	_som_chuva = AudioStreamPlayer.new()
	_som_chuva.stream = _ruido_chuva()
	_som_chuva.volume_db = -60.0
	add_child(_som_chuva)


func _ruido_chuva() -> AudioStreamWAV:
	var hz := 22050
	var n := hz * 2
	var a := PackedByteArray()
	a.resize(n * 2)
	var rng := RandomNumberGenerator.new()
	rng.seed = 77
	var y := 0.0
	var y2 := 0.0
	for i in n:
		y += (rng.randf_range(-1.0, 1.0) - y) * 0.35
		y2 += (y - y2) * 0.5
		var v := clampf(y2 * 0.55 + (rng.randf_range(-1.0, 1.0) * 0.08 if rng.randf() < 0.02 else 0.0), -1.0, 1.0)
		a.encode_s16(i * 2, int(v * 32000.0))
	var w := AudioStreamWAV.new()
	w.format = AudioStreamWAV.FORMAT_16_BITS
	w.mix_rate = hz
	w.data = a
	w.loop_mode = AudioStreamWAV.LOOP_FORWARD
	w.loop_end = n
	return w


# ======================================================================== o dia do tempo, as estações e a lua
## o dia do tempo vira às 6h (de madrugada ainda é o dia de ontem)
func dia_tempo() -> int:
	return int(main.dia) if float(main.hora) >= 6.0 else int(main.dia) - 1


func h30() -> float:
	return float(main.hora) if float(main.hora) >= 6.0 else float(main.hora) + 24.0


func estacao_idx(d := -1) -> int:
	var dd := dia_tempo() if d < 0 else d
	return int(floor(maxf(0.0, dd - 1) / DIAS_ESTACAO)) % 4


func estacao(d := -1) -> Dictionary:
	return ESTACOES[estacao_idx(d)]


func estacao_dia(d := -1) -> int:
	var dd := dia_tempo() if d < 0 else d
	return (maxi(0, dd - 1) % DIAS_ESTACAO) + 1


func lua_fase(d := -1) -> int:
	var dd := int(main.dia) if d < 0 else d
	return (dd + 1) % LUA_CICLO


func lua_ilum(d := -1) -> float:
	if main.lua_de_sangue():
		return 1.0
	return (1.0 - cos(TAU * lua_fase(d) / LUA_CICLO)) / 2.0


func lua_nome() -> String:
	return "Lua de sangue" if main.lua_de_sangue() else LUA_NOMES[lua_fase()]


func eclipse_dia(d := -1) -> bool:
	var dd := int(main.dia) if d < 0 else d
	return dd >= 6 and (dd * 7 + 3) % 13 == 0


## o eclipse do sol (meio-dia, nos dias dele): de 0 a 1
func eclipse_k() -> float:
	if not eclipse_dia():
		return 0.0
	var h := float(main.hora)
	if h < 11.8 or h > 13.6:
		return 0.0
	return clampf(minf((h - 11.8) / 0.5, (13.6 - h) / 0.5), 0.0, 1.0)


# ======================================================================== o sorteio do tempo
func sortear(d: int) -> Array:
	if d <= 1:
		return [[20.5, 26.0, "nublado"]]   # o primeiro dia: limpo para aprender
	var E0 := estacao(d)
	var per := _periodo(d, E0)
	if not per.is_empty():
		return per
	var tot := 0.0
	var ws: Array = []
	for p in PADROES:
		var w := _peso(p, E0)
		ws.append(w)
		tot += w
	var r := randf() * tot
	var pad: Array = PADROES[0]
	for i in PADROES.size():
		r -= float(ws[i])
		if r <= 0.0:
			pad = PADROES[i]
			break
	var out: Array = []
	for s in pad[1]:
		out.append([float(s[0]), float(s[1]), str(s[2])])
	if pad == PADROES[4] and randf() < (0.6 if str(E0["id"]) == "verao" else 0.4):
		out.append([17.5, 21.0, "tempestade"])   # o temporal no fim de um dia quente
	return out


func _peso(p: Array, E0: Dictionary) -> float:
	var w := float(p[0])
	if (p[1] as Array).is_empty():
		return w * (1.2 if str(E0["id"]) == "verao" else (0.85 if str(E0["id"]) == "inverno" else 1.0))
	for s in p[1]:
		w *= float(E0["peso"].get(str(s[2]), 1.0))
	return w


## os períodos de vários dias (chuvas, seca, onda de frio), avisados no rádio
func _periodo(d: int, E0: Dictionary) -> Array:
	if not periodo.is_empty() and d > int(periodo["ate"]):
		periodo = {}
	if periodo.is_empty():
		var r := randf()
		var id := str(E0["id"])
		if (id == "primavera" or id == "verao") and r < 0.12:
			periodo = {"tipo": "chuvas", "ate": d + 1 + randi() % 2}
		elif (id == "verao" or id == "inverno") and r < 0.22:
			periodo = {"tipo": "seca", "ate": d + 2 + randi() % 2}
		elif id == "inverno" and r < 0.4:
			periodo = {"tipo": "frio", "ate": d + 1 + randi() % 2}
		if not periodo.is_empty():
			var txt: String = {"chuvas": "Vêm aí uns dias de chuva sem parar. Guarde água limpa.", "seca": "Tempo seco pelos próximos dias. A mata seca pega fogo fácil.",
				"frio": "Onda de frio chegando: uns dias gelados. Roupa quente e lenha."}[periodo["tipo"]]
			_aviso_depois("Rádio: " + txt, 9.0)
	if periodo.is_empty():
		return []
	match str(periodo["tipo"]):
		"chuvas":
			return [[6.0, 30.0, "chuva"]] if randf() < 0.5 else [[6.0, 10.0, "garoa"], [10.0, 17.0, "chuva"], [17.0, 21.0, "tempestade"], [21.0, 30.0, "chuva"]]
		"seca":
			return [[10.0, 18.0, "calor"]] if str(E0["id"]) == "verao" else [[6.0, 6.01, "limpo"]]
		"frio":
			return [[6.0, 30.0, "frio"]]
	return []


func tipo_agora() -> String:
	var h := h30()
	for s in segs:
		if h >= float(s[0]) and h < float(s[1]):
			return str(s[2])
	return "limpo"


func previsao() -> String:
	var nomes := {"nublado": "tempo fechado", "chuva": "chuva", "tempestade": "tempestade forte", "neblina": "neblina", "calor": "calorão",
		"frio": "uma frente fria", "garoa": "garoa", "ventania": "ventania", "escuro": "céu fechado"}
	var reais: Array = []
	for s in segs:
		if str(s[2]) != "limpo":
			reais.append(s)
	if reais.is_empty():
		return "Previsão: céu limpo o dia inteiro. Bom para explorar longe."
	var P := PackedStringArray()
	for s in reais:
		var h := float(s[0])
		var per := "de manhã" if h < 12.0 else ("à tarde" if h < 18.0 else ("à noite" if h < 24.0 else "de madrugada"))
		var t := "%s %s" % [nomes.get(str(s[2]), str(s[2])), per]
		if not t in P:
			P.append(t)
	var dicas := {"tempestade": " Na tempestade os raios caem nas árvores altas e o barulho esconde tudo.",
		"neblina": " Na neblina eles não te veem de longe, mas você também não.", "calor": " Leve água: no calor a sede aperta.",
		"frio": " Durma perto do fogo: nem roupa quente segura essa.", "chuva": " A chuva molha: molhado à noite dá frio."}
	var extra := ""
	for s in reais:
		if dicas.has(str(s[2])):
			extra = dicas[str(s[2])]
			break
	var lista := ", ".join(P.slice(0, P.size() - 1)) + (" e " if P.size() > 1 else "") + P[P.size() - 1]
	return "Previsão: " + lista + "." + extra


func _aviso(t: String) -> void:
	var m := {"neblina": "A neblina está baixando. Dá para passar perto deles sem ser visto, mas fique atento.",
		"tempestade": "Tempestade chegando! Fique longe das árvores altas e procure abrigo.",
		"chuva": "Começou a chover. O barulho fica abafado e os zumbis enxergam menos. A chuva molha: à noite, molhado dá frio.",
		"calor": "Que calor. A sede vai apertar: beba água.", "frio": "O vento virou e esfriou muito. Esta noite, só o fogo esquenta de verdade.",
		"garoa": "Começou uma garoa. Molha devagar, mas molha.", "ventania": "Ventania! As árvores balançam forte e o vento esfria.",
		"escuro": "Céu fechado e escuro: o dia vai ficar sombrio. Leve a lanterna."}
	if m.has(t):
		main.ui.aviso(m[t], 6.0)


var _avisos: Array = []


func _aviso_depois(txt: String, t: float) -> void:
	_avisos.append([t, txt])


# ======================================================================== o passo
func passo(dt: float) -> void:
	for i in range(_avisos.size() - 1, -1, -1):
		_avisos[i][0] = float(_avisos[i][0]) - dt
		if float(_avisos[i][0]) <= 0.0:
			main.ui.aviso(str(_avisos[i][1]), 8.0)
			_avisos.remove_at(i)
	var conv: bool = Rede.convidado()
	if not conv:
		var d := dia_tempo()
		if d != dia_c:
			dia_c = d
			segs = sortear(d)
			if d > 1:
				_aviso_depois(previsao(), 6.0)
		var tp := tipo_agora()
		if tp != atual:
			_mudar(tp)
		# quem abriu manda o tempo para quem entrou
		_rede_t -= dt
		if _rede_t <= 0.0 and Rede.anfitriao():
			_rede_t = 1.0
			Rede.mandar_clima(TIPOS.find(atual), k, dia_c)
	k = minf(1.0, k + dt / 25.0)
	var alvo_chuva := float(DEF[atual]["chuva"]) * k + float(DEF[antes]["chuva"]) * (1.0 - k)
	chuva_k = move_toward(chuva_k, alvo_chuva, dt / 8.0)
	_passo_molhado(dt)
	_passo_chuva()
	# a tempestade: trovões seguidos e raios que caem nas árvores altas
	flash = maxf(0.0, flash - dt * 3.0)
	var tem := kk("tempestade")
	if tem > 0.5:
		_trovao_t -= dt
		if _trovao_t <= 0.0:
			_trovao_t = 4.0 + randf() * 9.0
			flash = maxf(flash, 0.5 + randf() * 0.5)
			main.sons.tocar("trovao", main.jogador.global_position + Vector3(randf_range(-200, 200), 120, randf_range(-200, 200)), 4.0)
	if tem > 0.7 and not conv:
		_raio_t -= dt
		if _raio_t <= 0.0:
			_raio_t = 45.0 + randf() * 70.0
			raio()


func _mudar(tp: String) -> void:
	antes = atual
	atual = tp
	k = 0.0
	_aviso(tp)


## quem entrou recebe o tempo de quem abriu
func rede(tipo_i: int, kk2: float, dia_r: int) -> void:
	var tp: String = TIPOS[clampi(tipo_i, 0, TIPOS.size() - 1)]
	if tp != atual:
		_mudar(tp)
	if absf(kk2 - k) > 0.2:
		k = clampf(kk2, 0.0, 1.0)
	dia_c = dia_r


## quanto o tempo t está valendo agora (0 a 1, com a transição)
func kk(t: String) -> float:
	if atual == t:
		return k
	if antes == t:
		return 1.0 - k
	return 0.0


func nublado_k() -> float:
	return maxf(maxf(kk("nublado"), kk("tempestade") * 0.8), maxf(kk("chuva") * 0.6, maxf(kk("escuro"), kk("garoa") * 0.4)))


# ======================================================================== o que os outros usam
## quanto se enxerga (você, os zumbis e os bichos): a neblina e a tempestade tiram; de noite, a lua cheia clareia
func visao() -> float:
	var v := (1.0 - 0.5 * kk("neblina")) * (1.0 - 0.25 * kk("tempestade"))
	var n: float = main.noite_k()
	if n > 0.5:
		v *= lerpf(1.0, 0.82 + 0.36 * lua_ilum(), n)
	return v


## a tempestade abafa o barulho
func ruido() -> float:
	return 1.0 - 0.3 * kk("tempestade")


## a temperatura agora (°C) em x, z
func temperatura(x := INF, z := INF) -> float:
	var E0 := estacao()
	var mn := float(E0["temp"][0])
	var mx := float(E0["temp"][1])
	var h := float(main.hora)
	var s := sin(PI * (h - 6.0) / 14.0) if (h >= 6.0 and h <= 20.0) else 0.0
	var t := mn + (mx - mn) * s
	t += 5.0 * kk("calor") - 8.0 * kk("frio") - 3.0 * maxf(kk("chuva"), 0.7 * kk("garoa")) - 4.0 * kk("tempestade") - 2.0 * kk("nublado") \
		- 1.5 * kk("neblina") - 3.0 * kk("escuro") - 2.5 * kk("ventania")
	var px: float = main.jogador.global_position.x if x == INF else x
	var pz: float = main.jogador.global_position.z if z == INF else z
	if na_serra(px, pz):
		t -= 5.0
	t -= 5.0 * eclipse_k()
	return t


func na_serra(x: float, z: float) -> bool:
	return Vector2(x, z).distance_to(SERRA) < 21.0 * 2.1


## o frio do tempo (0 a 1): a frente fria de noite, molhado de noite ou na tempestade, o frio da temperatura
func frio() -> float:
	var n: float = main.noite_k()
	var f := kk("frio") * (0.6 + 0.6 * n)
	if molhado > 0.35:
		f = maxf(f, molhado * (0.9 if n > 0.5 else (0.7 if kk("tempestade") > 0.5 else 0.0)))
	return maxf(f, clampf((10.0 - temperatura()) / 12.0, 0.0, 1.0))


## a roupa: quanto ela segura a chuva e quanto esquenta
func roupa(campo: String) -> float:
	var s := 0.0
	var j = main.jogador
	for lugar in j.inv.roupa:
		var r = j.inv.roupa[lugar]
		if not (r is Dictionary) or (r as Dictionary).is_empty():
			continue
		s += float(Dados.item(str(r.get("id", ""))).get(campo, 0.0))
	return s


func chuva_roupa() -> float:
	return minf(0.85, roupa("chuva"))


func calor_roupa() -> float:
	return minf(1.0, roupa("quente") * (1.0 - 0.4 * molhado * (1.0 - chuva_roupa())))


## embaixo de teto (dentro de casa, da base ou de um prédio)
func abrigado() -> bool:
	var j = main.jogador
	var o: Vector3 = j.global_position + Vector3(0, 1.6, 0)
	var q := PhysicsRayQueryParameters3D.create(o, o + Vector3(0, 30, 0), 1, [j.get_rid()])
	return not j.get_world_3d().direct_space_state.intersect_ray(q).is_empty()


## com frio: a energia não enche (perto do fogo passa)
func com_frio() -> bool:
	var j = main.jogador
	if not j.vivo or main.construcao.fogo_perto(j.global_position, 4.5):
		return false
	var ab := abrigado()
	var cal := calor_roupa() + (0.35 if ab else 0.0)
	return (main.noite_k() > 0.6 and temperatura() < 18.0 and cal < 0.99) or frio() * (0.5 if ab else 1.0) > cal + 0.01


## a sede no calor (ao sol, longe da sombra, aperta mais)
func sede() -> float:
	var c := kk("calor")
	var sombra := abrigado_rapido()
	var s := 1.0 + (0.2 if sombra else 0.6) * c
	var T := temperatura()
	if T > 29.0 and main.noite_k() < 0.5:
		s *= 1.0 + (0.1 if sombra else 0.35) * minf(1.0, (T - 29.0) / 5.0)
	return s


func horta() -> float:
	var fr := kk("frio")
	var ca := kk("calor")
	var m := 1.0
	if fr > 0.3:
		m = 0.15
	elif ca > 0.3 and chuva_k < 0.3:
		m = 0.7
	return m * float(estacao()["horta"])


# ======================================================================== molhado e a chuva em volta
func _passo_molhado(dt: float) -> void:
	var j = main.jogador
	if j == null or not j.vivo:
		return
	var na_agua: bool = main.terreno.tipo_agua(j.global_position.x, j.global_position.z) != 0 and main.terreno.nivel_agua(j.global_position.x, j.global_position.z) > j.global_position.y + 0.8
	var sob := false
	if chuva_k > 0.3 or molhado > 0.0:
		sob = abrigado()
	if na_agua:
		molhado = 1.0
	elif chuva_k > 0.3 and not sob:
		molhado = minf(1.0, molhado + dt * chuva_k / 70.0 * (1.0 - chuva_roupa()))
	else:
		var fogo: bool = main.construcao.fogo_perto(j.global_position, 4.5)
		molhado = maxf(0.0, molhado - dt * (1.0 / 22.0 if fogo else (1.0 / 120.0 if sob else 1.0 / 260.0)))


func _passo_chuva() -> void:
	var cam := get_viewport().get_camera_3d()
	var ver := chuva_k > 0.05 and cam != null
	if ver:
		_chuva.global_position = cam.global_position + Vector3(0, 9.0, 0)
		_mat_chuva.albedo_color.a = clampf(0.12 + 0.34 * chuva_k, 0.0, 0.46)
	if _chuva.emitting != ver:
		_chuva.emitting = ver
	var vol := -60.0 if chuva_k < 0.02 else lerpf(-34.0, -9.0, chuva_k)
	if abrigado_rapido():
		vol -= 8.0
	_som_chuva.volume_db = vol
	if chuva_k > 0.02 and not _som_chuva.playing:
		_som_chuva.play()
	elif chuva_k <= 0.02 and _som_chuva.playing:
		_som_chuva.stop()


var _abr_t := 0.0
var _abr_v := false
var _frio_t := 0.0
var _frio_v := false


## com frio (olhado a cada meio segundo: o fogo perto, o teto e a roupa)
func com_frio_rapido() -> bool:
	var agora := Time.get_ticks_msec() / 1000.0
	if agora > _frio_t:
		_frio_t = agora + 0.5
		_frio_v = com_frio()
	return _frio_v


func abrigado_rapido() -> bool:
	var agora := Time.get_ticks_msec() / 1000.0
	if agora > _abr_t:
		_abr_t = agora + 0.5
		_abr_v = abrigado()
	return _abr_v


# ======================================================================== o raio
## o raio cai numa árvore alta perto de você: o fogo no pé dela machuca quem está perto
func raio() -> Vector3:
	var j = main.jogador
	var p0: Vector3 = j.global_position
	var alvo := Vector3.INF
	var R: Array = main.mundo.recursos
	if R.is_empty():
		return Vector3.INF
	for t in 60:
		var r: Dictionary = R[randi() % R.size()]
		if str(r.get("tipo", "")) != "arvore" or not r.has("pos") or float(r.get("vida", 1.0)) <= 0.0:
			continue
		var p: Vector3 = r["pos"]
		var d := Vector2(p.x - p0.x, p.z - p0.z).length()
		if d < 18.0 or d > 85.0:
			continue
		alvo = p
		break
	flash = 1.0
	if alvo == Vector3.INF:
		main.sons.tocar("trovao", p0 + Vector3(0, 100, 0), 8.0)
		return alvo
	var dj := alvo.distance_to(p0)
	main.sons.tocar("trovao", alvo + Vector3(0, 20, 0), 10.0)
	main.efeitos.faiscas(alvo + Vector3(0, 6, 0))
	main.efeitos.faiscas(alvo + Vector3(0, 3, 0))
	main.projeteis.fogo(alvo + Vector3(0.8, 0, 0.4), 2.0, 20.0)
	main.barulho(alvo, 55.0)
	for z in main.zumbis:
		if is_instance_valid(z) and z.estado != "morto" and z.global_position.distance_to(alvo) < 4.5:
			z.ferir(70.0, alvo, 0, {"k": "fogo", "forte": true, "derruba": 1.0})
	if dj < 5.0 and j.vivo:
		j.ferir(30.0, true, alvo)
		main.ui.aviso("O raio caiu do seu lado!")
	return alvo


# ======================================================================== o céu, a luz e a neblina
## mexe no ambiente que o ciclo do dia montou (chamado do _ciclo do main)
func ambiente(sol: DirectionalLight3D, lua: DirectionalLight3D, ceu: ProceduralSkyMaterial, amb: Environment, neblina_base: float) -> void:
	var neb := kk("neblina")
	var tem := kk("tempestade")
	var nub := nublado_k()
	var cal := kk("calor")
	var fri := kk("frio")
	var ven := kk("ventania")
	var E0 := estacao()
	var luz: Color = E0["luz"]
	var ec := eclipse_k()
	# a neblina e a tempestade fecham a vista
	amb.fog_density = neblina_base * (1.0 + 2.4 * neb) * (1.0 + 0.6 * tem) * (1.0 + 0.4 * kk("garoa"))
	# o céu fechado: menos sol, o céu e a luz puxando para o cinza
	var cinza := Color(0.42, 0.45, 0.48)
	ceu.sky_top_color = ceu.sky_top_color.lerp(cinza * lerpf(1.0, 0.45, tem), 0.55 * nub)
	ceu.sky_horizon_color = ceu.sky_horizon_color.lerp(Color(0.5, 0.52, 0.54) * lerpf(1.0, 0.5, tem), 0.5 * nub)
	amb.fog_light_color = amb.fog_light_color.lerp(Color(0.55, 0.57, 0.6) * lerpf(1.0, 0.55, tem), 0.5 * maxf(nub, neb))
	sol.light_energy *= (1.0 - 0.6 * nub) * (1.0 - 0.9 * tem) * (1.0 - 0.95 * ec)
	lua.light_energy *= (1.0 - 0.9 * tem) * (0.45 + 0.55 * lua_ilum())
	amb.ambient_light_energy *= (1.0 - 0.25 * nub) * (1.0 - 0.3 * tem) * (1.0 - 0.6 * ec)
	# a cor do tempo e da estação
	var tinta := Color(luz.r, luz.g, luz.b)
	if cal > 0.0:
		tinta = tinta.lerp(Color(1.12, 1.0, 0.86), 0.5 * cal)
	if fri > 0.0:
		tinta = tinta.lerp(Color(0.9, 0.96, 1.1), 0.5 * fri)
	sol.light_color = Color(sol.light_color.r * tinta.r, sol.light_color.g * tinta.g, sol.light_color.b * tinta.b)
	amb.ambient_light_color = Color(amb.ambient_light_color.r * tinta.r, amb.ambient_light_color.g * tinta.g, amb.ambient_light_color.b * tinta.b)
	# o eclipse do sol: escurece como a noite
	if ec > 0.0:
		ceu.sky_top_color = ceu.sky_top_color.lerp(Color(0.04, 0.05, 0.1), 0.85 * ec)
		ceu.sky_horizon_color = ceu.sky_horizon_color.lerp(Color(0.25, 0.15, 0.12), 0.7 * ec)
	# o relâmpago clareia tudo um instante
	if flash > 0.0:
		amb.ambient_light_energy += 2.5 * flash
		ceu.sky_top_color = ceu.sky_top_color.lerp(Color(0.8, 0.84, 0.95), 0.6 * flash)
	# o vento (as copas e a grama balançam mais na ventania e na tempestade) e a cor das copas da estação
	var vento := float(E0["vento"]) * (1.0 + 1.9 * tem + 1.6 * ven)
	main.mundo.tempo_copas(E0["copa"], vento)


func vento_k() -> float:
	return float(estacao()["vento"]) * (1.0 + 1.9 * kk("tempestade") + 1.6 * kk("ventania"))


# ======================================================================== salvar e carregar
func salvar() -> Dictionary:
	return {"dia": dia_c, "segs": segs, "atual": atual, "molhado": snappedf(molhado, 0.01), "periodo": periodo}


func carregar(d: Dictionary) -> void:
	var s = d.get("segs", null)
	if s is Array:
		segs = []
		for e in s:
			if e is Array and e.size() >= 3 and DEF.has(str(e[2])):
				segs.append([float(e[0]), float(e[1]), str(e[2])])
		dia_c = int(d.get("dia", dia_tempo()))
		atual = str(d.get("atual", "limpo")) if DEF.has(str(d.get("atual", "limpo"))) else "limpo"
		antes = atual
		k = 1.0
		molhado = clampf(float(d.get("molhado", 0.0)), 0.0, 1.0)
		var p = d.get("periodo", {})
		periodo = p if p is Dictionary and p.has("ate") else {}
	else:
		dia_c = -1
		atual = "limpo"
		antes = "limpo"
		molhado = 0.0
		periodo = {}
