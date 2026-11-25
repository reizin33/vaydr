class_name Lesoes
extends CanvasLayer
## Os ferimentos (etapa 6f), como no jogo antigo (48e_lesoes.js e a ferida grave de 48n_oficinas.js):
## · sangramento: a mordida e a garra dos bichos (lobo, urso, onça, javali, raposa) e a investida do Colosso. A vida cai aos
##   poucos e ficam gotas de sangue no chão; o leve para sozinho em uns 40 s, o forte só com bandagem ou kit médico. Os
##   predadores sentem o cheiro (a matilha e a onça atacam quem está sangrando). Sangrando não dá para dormir;
## · perna quebrada: queda alta ou o pisão do Colosso de perto. Anda devagar, não corre nem pula. A tala (2 gravetos e 2
##   tecidos) imobiliza: anda quase normal, sem correr, até sarar (um dia e meio de jogo; sem tala demora o dobro);
## · vírus: o golpe do zumbi pode passar o vírus (a roupa grossa protege). Ele sobe sozinho e, sem a seringa antiviral, mata
##   em cerca de um dia de jogo: febre e cansaço (a energia cai, a tosse), depois menos vida máxima e a vista apagando, por
##   fim a vida cai. Quem morre do vírus levanta como zumbi perto de onde caiu. A seringa cura na hora e protege por 2 horas;
## · ferida grave: um golpe muito forte de bicho (24 de dano ou mais) rasga: a vida máxima cai até fechar com o kit de
##   sutura ou o kit médico, ou sarar sozinha em um dia (mais rápido dormindo, mais devagar com fome e sede).
## Cada jogador cuida dos seus ferimentos (na partida em rede, o golpe do zumbi de quem abriu chega com a chance do vírus).

const SANGRA_LEVE := 0.55       # vida por segundo
const SANGRA_FORTE := 1.35
const LEVE_DUR := 40.0
const PERNA_VEL := 0.55
const TALA_VEL := 0.85
const CURA_PERNA_H := 36.0      # horas de jogo
const VIRUS_H := 22.0
const IMUNE_H := 2.0
const FERIDA_H := 24.0
## a chance de cada zumbi passar o vírus no golpe (a roupa grossa diminui)
const MORDIDA := {"walker": 0.3, "runner": 0.32, "screamer": 0.28, "emboscada": 0.34, "policial": 0.22, "inchado": 0.18,
	"brute": 0.18, "colosso": 0.2}

var main
var sangra := 0                 # 0 nada, 1 leve, 2 forte
var sangra_t := 0.0
var perna := false
var tala := false
var perna_h := 0.0
var virus := 0.0                # 0 a 100
var imune_h := 0.0
var ferida := false
var ferida_h := 0.0
var causa := ""                 # do que morreu (sangramento, vírus)
var _gota_t := 0.0
var _tosse_t := 0.0
var _apagao_t := 8.0
var _apagao := 0.0
var _corpo := {}                # quem morreu do vírus: {"p", "t"} (o corpo levanta)
var _gotas: Array = []
var veu: ColorRect


func _init(m) -> void:
	main = m
	layer = 19


func _ready() -> void:
	veu = ColorRect.new()
	veu.color = Color(0.02, 0.0, 0.0, 0.0)
	veu.mouse_filter = Control.MOUSE_FILTER_IGNORE
	veu.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(veu)


func zerar() -> void:
	sangra = 0
	sangra_t = 0.0
	perna = false
	tala = false
	perna_h = 0.0
	virus = 0.0
	imune_h = 0.0
	ferida = false
	ferida_h = 0.0
	causa = ""
	_apagao = 0.0
	veu.color.a = 0.0


# ======================================================================== o que machuca
## sangrando (forte: corte fundo, só para com bandagem ou kit)
func sangrar(forte: bool, quem := "") -> void:
	var j = main.jogador
	if not j.vivo:
		return
	var antes := sangra
	sangra = maxi(sangra, 2 if forte else 1)
	sangra_t = 0.0
	if sangra > antes:
		if quem != "":
			var fem: bool = quem.to_lower() in ["onça", "raposa", "ovelha", "cabra", "vaca"]
			main.ui.aviso(("%s %s abriu um corte fundo! Use uma bandagem ou um kit médico logo." % ["A" if fem else "O", quem]) if sangra >= 2 \
				else ("Mordida %s %s: você está sangrando." % ["da" if fem else "do", quem]), 6.0)
		else:
			main.ui.aviso("Corte fundo, você está sangrando muito! Use uma bandagem ou um kit médico logo." if sangra >= 2 else "Você está sangrando. Para sozinho em um tempo, ou use uma bandagem.", 6.0)


func quebrar_perna() -> void:
	var j = main.jogador
	if not j.vivo or perna:
		return
	perna = true
	tala = false
	perna_h = 0.0
	j.tremor = maxf(j.tremor, 0.7)
	main.sons.tocar("dor", j.global_position, 0.0)
	main.ui.aviso("Você quebrou a perna! Não dá para correr nem pular. Faça uma tala (2 gravetos e 2 tecidos) e use para imobilizar.", 8.0)


func ferida_grave() -> void:
	if not main.jogador.vivo or ferida:
		return
	ferida = true
	ferida_h = 0.0
	main.ui.aviso("Ferida grave! A vida máxima caiu. Feche com um kit de sutura ou um kit médico; comendo bem e dormindo, sara em cerca de um dia.", 8.0)


## o golpe de um zumbi em você: pode passar o vírus (a roupa grossa protege; a seringa protege por 2 horas)
func mordida(tipo: String) -> bool:
	var j = main.jogador
	if not j.vivo or imune_h > 0.0:
		return false
	# dentro da caminhonete ou do carro o golpe pega na lataria: não morde (etapa 6j)
	var vc = j.get("veiculo")
	if vc != null and is_instance_valid(vc) and not bool(vc.T.get("exposto", false)):
		return false
	var p: float = float(MORDIDA.get(tipo, 0.25)) * maxf(0.0, 1.0 - float(j.inv.protecao()) * 1.4)
	if randf() >= p:
		return false
	if virus > 0.0:
		virus = minf(99.0, virus + 4.0)
		return true
	virus = 0.5
	main.efeitos.sangue(j.global_position + Vector3(0, 1.1, 0), Vector3.UP)
	main.sons.tocar("mordida", j.global_position, 0.0)
	main.ui.aviso("Você foi mordido e pegou o vírus! Sem a seringa antiviral ele te mata em cerca de um dia. Tem seringa na farmácia, no hospital e nos carros, ou faça na oficina (2 remédios, 1 antisséptico e 1 garrafa d'água).", 10.0)
	return true


## o golpe de um bicho em você: sangra pela chance de cada um (forte pela força), ferida grave nos golpes muito fortes
func golpe_bicho(nome: String, A: Dictionary, dano: float) -> void:
	if randf() < float(A.get("sangra", 0.0)):
		sangrar(randf() < float(A.get("forte", 0.25)), nome)
	if dano >= 24.0:
		ferida_grave()


## a queda: velocidade da batida (m/s) além do limite do dano
func queda(alem: float) -> void:
	if alem > 5.0 or (alem > 3.0 and randf() < 0.55):
		quebrar_perna()


# ======================================================================== o que cura
## o item trata alguma coisa agora? (a tala só com a perna quebrada sem tala; a sutura só com a ferida grave)
func precisa(trata: String) -> bool:
	match trata:
		"perna":
			return perna and not tala
		"ferida":
			return ferida
	return true


## usou o item: a mensagem do que ele tratou ("" se não tratou nada)
func curar(id: String) -> String:
	var msg := ""
	if sangra > 0 and (id == "bandagem" or id == "kit"):
		sangra = 0
		msg = "O sangramento parou"
	if id == "tala" and perna and not tala:
		tala = true
		msg = "Perna imobilizada: dá para andar, sem correr"
	if ferida and (id == "sutura" or id == "kit"):
		ferida = false
		ferida_h = 0.0
		msg = (msg + ". " if msg != "" else "") + "A ferida grave foi fechada: a vida máxima voltou"
	if id == "seringa":
		var tinha := virus > 0.0
		virus = 0.0
		imune_h = IMUNE_H
		msg = "Seringa aplicada: o vírus foi embora" if tinha else "Seringa aplicada: protegido por 2 horas"
	return msg


# ======================================================================== efeitos no corpo
func vida_max() -> float:
	return 100.0 * (0.75 if virus > 50.0 else 1.0) * (0.8 if ferida else 1.0)


## a velocidade com a perna quebrada
func vel() -> float:
	if not perna:
		return 1.0
	return TALA_VEL if tala else PERNA_VEL


func pode_correr() -> bool:
	return not perna


func pode_pular() -> bool:
	return not perna or tala


func passo(dt: float) -> void:
	_corpo_passo(dt)
	_gotas_passo(dt)
	if _apagao > 0.0:
		_apagao = maxf(0.0, _apagao - dt)
	veu.color.a = clampf(_apagao / 0.32, 0.0, 1.0) * 0.88
	var j = main.jogador
	if j == null or not j.vivo:
		return
	var turbo: float = main.sono.turbo() if main.sono != null else 1.0
	var h: float = dt / maxf(0.01, float(main.seg_hora())) * turbo
	# sangramento
	if sangra > 0:
		sangra_t += dt
		causa = "sangramento"
		j.ferir((SANGRA_FORTE if sangra >= 2 else SANGRA_LEVE) * dt, false)
		_gota_t -= dt
		if _gota_t <= 0.0:
			_gota_t = 0.8 if sangra >= 2 else 1.6
			_gota(j.global_position + Vector3(randf() - 0.5, 0, randf() - 0.5) * 0.3)
		if sangra < 2 and sangra_t > LEVE_DUR:
			sangra = 0
			main.ui.aviso("O sangramento parou", 3.0)
		if not j.vivo:
			return
	# a perna sara sozinha (com tala, na metade do tempo)
	if perna:
		perna_h += h * (1.0 if tala else 0.5)
		if perna_h >= CURA_PERNA_H:
			perna = false
			tala = false
			perna_h = 0.0
			main.ui.aviso("Sua perna sarou. Já dá para correr de novo.", 5.0)
	# o vírus
	if imune_h > 0.0:
		imune_h = maxf(0.0, imune_h - h)
	if virus > 0.0:
		var antes := virus
		virus = minf(100.0, virus + h * 100.0 / VIRUS_H)
		for m in [25.0, 50.0, 75.0, 90.0]:
			if antes < m and virus >= m:
				_aviso_virus(int(m))
		if virus > 35.0:
			j.energia = maxf(0.0, float(j.energia) - dt * (0.6 + virus / 100.0))
			_tosse_t -= dt
			if _tosse_t <= 0.0:
				_tosse_t = 10.0 + randf() * 10.0 - virus * 0.06
				main.sons.tocar("tosse", j.global_position, -2.0)
				if virus > 60.0:
					j.tremor = maxf(j.tremor, 0.22)
		if virus > 80.0:
			_apagao_t -= dt
			if _apagao_t <= 0.0:
				_apagao_t = 6.0 + randf() * 6.0
				_apagao = 0.32
		if virus > 75.0:
			causa = "virus"
			j.ferir(dt * 0.4 * (virus - 75.0) / 25.0, false)
		if virus >= 100.0 and j.vivo:
			causa = "virus"
			j.ferir(9999.0, false)
			return
	# a ferida grave fecha sozinha (dormindo mais rápido, com fome e sede bem devagar)
	if ferida:
		var bem: bool = float(j.fome) > 40.0 and float(j.sede) > 40.0
		var dormindo: bool = main.sono != null and not main.sono.dormindo.is_empty()
		ferida_h += h * (3.0 if dormindo else 1.0) * (1.0 if bem else 0.25)
		if ferida_h >= FERIDA_H:
			ferida = false
			ferida_h = 0.0
			main.ui.aviso("A ferida grave fechou. A vida máxima voltou ao normal.", 5.0)
	var vm := vida_max()
	if float(j.vida) > vm:
		j.vida = vm
	if sangra == 0 and virus <= 75.0:
		causa = ""


func _aviso_virus(m: int) -> void:
	var t: String = {25: "O vírus está avançando: febre e cansaço. Procure uma seringa antiviral.",
		50: "Metade do caminho: o vírus já tira parte da sua vida máxima. Seringa, rápido!",
		75: "O vírus está tomando conta. A vista escurece e a vida começa a cair. Sem seringa você não aguenta muito.",
		90: "Está quase no fim... use uma seringa agora!"}.get(m, "")
	if t != "":
		main.ui.aviso(t, 7.0)
		main.sons.tocar("dor", main.jogador.global_position, -4.0)


# ======================================================================== as gotas de sangue no chão e o corpo que levanta
func _gota(p: Vector3) -> void:
	var y: float = main.chao_em(p.x, p.z, p.y + 0.4)["y"]
	var mi := MeshInstance3D.new()
	var pm := PlaneMesh.new()
	var s := 0.05 + randf() * 0.04
	pm.size = Vector2(s * 2.0, s * 2.0)
	mi.mesh = pm
	var m := StandardMaterial3D.new()
	m.albedo_color = Color(0.32, 0.02, 0.02, 0.9)
	m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	m.roughness = 0.35
	mi.material_override = m
	mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	main.add_child(mi)
	mi.global_position = Vector3(p.x, y + 0.015, p.z)
	mi.rotation.y = randf() * TAU
	_gotas.append([mi, 60.0])
	if _gotas.size() > 60:
		var v: Array = _gotas.pop_front()
		if is_instance_valid(v[0]):
			(v[0] as Node).queue_free()


func _gotas_passo(dt: float) -> void:
	for i in range(_gotas.size() - 1, -1, -1):
		var g: Array = _gotas[i]
		g[1] = float(g[1]) - dt
		if float(g[1]) <= 0.0:
			if is_instance_valid(g[0]):
				(g[0] as Node).queue_free()
			_gotas.remove_at(i)


## morreu do vírus: o corpo levanta como zumbi perto de onde caiu (1,5 s depois)
func morreu(p: Vector3) -> void:
	if causa == "virus":
		_corpo = {"p": p, "t": 1.5}
	zerar()


func _corpo_passo(dt: float) -> void:
	if _corpo.is_empty():
		return
	_corpo["t"] = float(_corpo["t"]) - dt
	if float(_corpo["t"]) > 0.0:
		return
	var p: Vector3 = _corpo["p"]
	_corpo = {}
	if Rede.convidado():
		return
	var z = main._nascer(p + Vector3(0.6, 0, 0.4), "walker")
	if z != null:
		z.estado = "vaga"
	main.ui.aviso("Seu corpo levantou como um deles, perto de onde você caiu. Cuidado ao buscar a mochila.", 8.0)


# ======================================================================== jogo salvo
func salvar() -> Dictionary:
	return {"sangra": sangra, "perna": perna, "tala": tala, "perna_h": snappedf(perna_h, 0.01), "virus": snappedf(virus, 0.01),
		"imune_h": snappedf(imune_h, 0.01), "ferida": ferida, "ferida_h": snappedf(ferida_h, 0.01)}


func carregar(d: Dictionary) -> void:
	zerar()
	sangra = clampi(int(d.get("sangra", 0)), 0, 2)
	perna = bool(d.get("perna", false))
	tala = bool(d.get("tala", false)) and perna
	perna_h = float(d.get("perna_h", 0.0))
	virus = clampf(float(d.get("virus", 0.0)), 0.0, 99.0)
	imune_h = maxf(0.0, float(d.get("imune_h", 0.0)))
	ferida = bool(d.get("ferida", false))
	ferida_h = float(d.get("ferida_h", 0.0))
