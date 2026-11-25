class_name Remoto
extends Node3D
## Um jogador da partida em rede (o boneco dele no seu jogo), como no jogo antigo (63_lan.js): o personagem que ele criou, com a
## roupa que está vestindo e o item da mão, o nome em cima (aparece através das paredes, mais apagado de longe), a lanterna
## quando ele acende e as animações do sobrevivente pela velocidade que chega pela rede (andando, correndo, de lado, agachado,
## pulando, golpeando, comendo). A posição anda atrás da que chegou, suave; caído, ele deita no chão.
## Para os zumbis de quem abriu a partida ele é um alvo como o jogador (pos_alvo, vivo, agachado, ferir).

var id := 0
var nome := ""
var anf := false
var piv: Node3D            # vira para onde ele olha e deita quando ele cai
var corpo: Corpo
var etiqueta: Label3D
var luz: SpotLight3D
var ok := false            # já chegou a primeira posição
var no_mundo := false      # está num mundo (fora do lobby)
var alvo := Vector3.ZERO   # a posição que chegou pela rede (o desenho anda atrás)
var vel := Vector3.ZERO
var yaw_r := 0.0
var yaw_s := 0.0
var olhar := 0.0
var vivo := true
var agachado := false
var correndo := false
var chao := true
var ferido := false
var lanterna := false
var sentado := ""            # dirigindo (etapa 6j): "carro" (caminhonete, carro) ou "moto" (moto, triciclo)
var energia := 100.0
var item := ""
var golpe_t := -1.0
var golpe_dur := 0.4
var uso_t := -1.0
var deitado := 0.0
var visto := 0
var _gn := -1
var _un := -1
var acao := ""             # empurrão, voadora ou pisão (a pose no corpo)
var acao_k := 0.0
## para os zumbis de quem abriu: a lanterna acesa no escuro ajuda a ver
var lanterna_acesa: bool:
	get:
		return lanterna


func _init(i: int, n: String, a: bool) -> void:
	id = i
	nome = n
	anf = a
	name = "Jogador_%d" % i


func _ready() -> void:
	piv = Node3D.new()
	add_child(piv)
	corpo = Corpo.new(null)
	piv.add_child(corpo)
	corpo.montar({})
	corpo.vestir({})
	corpo.primeira_pessoa(false)
	etiqueta = Label3D.new()
	etiqueta.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	etiqueta.no_depth_test = true
	etiqueta.fixed_size = true
	etiqueta.pixel_size = 0.0011
	etiqueta.font = Estilo.fonte("ui", 700)
	etiqueta.font_size = 30
	etiqueta.outline_size = 10
	etiqueta.outline_modulate = Color(0.04, 0.055, 0.047, 0.85)
	etiqueta.render_priority = 10
	etiqueta.position = Vector3(0, 2.05, 0)
	add_child(etiqueta)
	luz = SpotLight3D.new()
	luz.light_color = Color(1.0, 0.95, 0.82)
	luz.light_energy = 3.0 * Desenho.forca_perto()
	luz.spot_range = 30.0
	luz.spot_angle = 26.0
	luz.spot_attenuation = 0.9
	luz.visible = false
	piv.add_child(luz)
	renomear(nome, anf)
	visible = false


## o nome em cima (quem abriu a partida fica com o nome mais quente)
func renomear(n: String, a: bool) -> void:
	nome = n
	anf = a
	if etiqueta == null:
		return
	etiqueta.text = ("● " if anf else "") + nome + ("" if vivo else " (caído)")
	etiqueta.modulate = Color(1.0, 0.84, 0.66, etiqueta.modulate.a) if anf else Color(0.93, 0.9, 0.84, etiqueta.modulate.a)


## o que chegou pela rede (10 vezes por segundo): posição, velocidade, para onde olha, o que está fazendo e o item da mão
func estado(d: PackedFloat32Array, it: String) -> void:
	visto = Time.get_ticks_msec()
	if d.size() < 13:
		no_mundo = false
		return
	no_mundo = true
	alvo = Vector3(clampf(d[0], -6000.0, 6000.0), clampf(d[1], -500.0, 2000.0), clampf(d[2], -6000.0, 6000.0))
	vel = Vector3(clampf(d[3], -60.0, 60.0), clampf(d[4], -80.0, 80.0), clampf(d[5], -60.0, 60.0))
	yaw_r = d[6]
	olhar = clampf(d[7], -1.5, 1.5)
	var fl := int(d[8])
	var vivo_antes := vivo
	vivo = (fl & 1) != 0
	agachado = (fl & 2) != 0
	correndo = (fl & 4) != 0
	chao = (fl & 8) != 0
	ferido = (fl & 16) != 0
	lanterna = (fl & 32) != 0
	sentado = "carro" if (fl & 64) != 0 else ("moto" if (fl & 128) != 0 else "")
	var gn := int(d[9])
	if _gn >= 0 and gn != _gn:
		golpe_t = 0.0
		golpe_dur = clampf(d[10], 0.2, 2.0)
	_gn = gn
	var un := int(d[11])
	if _un >= 0 and un != _un:
		uso_t = 0.0
	_un = un
	energia = clampf(d[12], 0.0, 100.0)
	if d.size() >= 15:
		acao = ["", "empurrao", "voadora", "pisao", "rola"][clampi(int(d[13]), 0, 4)]
		acao_k = clampf(d[14], 0.0, 1.0)
	if it != item:
		item = it
		if corpo != null:
			corpo.segurar(item)
	if vivo != vivo_antes:
		renomear(nome, anf)
	if not ok:
		ok = true
		global_position = alvo
		yaw_s = yaw_r


## o personagem que a pessoa criou (já limpo) e a roupa que está vestindo (lugar -> id)
func visual(ap: Dictionary, roupa: Dictionary) -> void:
	if corpo == null:
		return
	corpo.montar(ap)
	var r := {}
	for lugar in roupa:
		r[str(lugar)] = {"id": str(roupa[lugar])}
	corpo.vestir(r)
	corpo.segurar(item)


func recente() -> bool:
	return Time.get_ticks_msec() - visto < 4000


## para os zumbis de quem abriu: onde ele está de verdade (a última posição que chegou)
func pos_alvo() -> Vector3:
	return alvo


## o zumbi de quem abriu bateu nele: o golpe vai para o jogo dele
func ferir(dano: float, _tremer := true, de := Vector3.INF) -> void:
	Rede.dano_para(id, dano, de if de != Vector3.INF else global_position)


func _process(dt: float) -> void:
	var ativo := no_mundo and ok and recente()
	var cam := get_viewport().get_camera_3d()
	var dc := global_position.distance_to(cam.global_position) if cam != null else 0.0
	visible = ativo and dc < 130.0
	if not ativo:
		return
	# a posição anda atrás da que chegou (longe demais: pula)
	var d := alvo - global_position
	if d.length() > 8.0:
		global_position = alvo
	else:
		global_position += d * (1.0 - exp(-dt * 10.0))
	yaw_s = lerp_angle(yaw_s, yaw_r, 1.0 - exp(-dt * 12.0))
	deitado = move_toward(deitado, 0.0 if vivo else 1.0, dt * 2.5)
	piv.basis = Basis(Vector3.UP, yaw_s) * Basis(Vector3.RIGHT, -1.45 * deitado)
	piv.position = Vector3(0, 0.12 * deitado, 0)
	if not visible:
		return
	var gs := -1.0
	if golpe_t >= 0.0:
		golpe_t += dt
		gs = golpe_t / golpe_dur
		if gs >= 1.0:
			golpe_t = -1.0
			gs = -1.0
	var uk := 0.0
	if uso_t >= 0.0:
		uso_t += dt
		uk = minf(1.0, minf(uso_t / 0.25, (0.9 - uso_t) / 0.25))
		if uso_t >= 0.9:
			uso_t = -1.0
			uk = 0.0
	var dd := Dados.item(item) if item != "" else {}
	var ent := {"vel": vel, "chao": chao, "agachado": agachado, "correndo": correndo, "ferido": ferido, "energia": energia,
		"item": item, "golpe": gs, "vertical": bool(dd.get("vertical", false)), "usar": maxf(0.0, uk), "mira": 0.0, "vivo": vivo,
		"primeira": false, "yaw_corpo": yaw_s, "acao": acao, "acao_k": acao_k}
	# rolando (etapa 6l): o clipe do rolamento no ponto em que ele está
	if acao == "rola":
		ent["rola"] = 0.55 + (2.05 - 0.55) * acao_k
		ent["acao"] = ""
	# dirigindo (etapa 6j): sentado; dentro da caminhonete ou do carro o boneco fica escondido pela lataria
	if sentado != "":
		ent["sentado"] = sentado
		ent["vel"] = Vector3.ZERO
		ent["item"] = ""
	if corpo.visible != (sentado != "carro"):
		corpo.visible = sentado != "carro"
	corpo.animar(dt, ent)
	# o nome em cima da cabeça, mais apagado de longe
	etiqueta.position.y = (corpo.altura_total() * (0.78 if agachado else 1.0) + 0.28) if deitado < 0.5 else 0.7
	etiqueta.modulate.a = clampf(1.25 - dc / 90.0, 0.35, 1.0)
	# a lanterna dele (sai do peito, para onde ele olha)
	luz.visible = lanterna and vivo
	if luz.visible:
		luz.position = Vector3(0.12, 0.95 if agachado else 1.35, -0.3)
		luz.rotation = Vector3(olhar, 0, 0)
