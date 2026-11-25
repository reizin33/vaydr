class_name Sono
extends CanvasLayer
## O sono e o cansaço (etapa 6c), como no jogo antigo (48j_sono.js):
## · o sono cai devagar acordado (mais rápido correndo); abaixo de 35 a energia enche mais devagar; abaixo de 15 você anda mais
##   devagar e cochila de pé (a tela apaga); em 0 a vida cai. O café espanta o sono;
## · dorme na cama ou no saco de dormir (E): de noite até umas 6h20, de dia um cochilo de 3 horas. O tempo passa rápido, mas
##   dano, zumbi chegando perto, trovão ou a fome e a sede te acordam. Na cama o jogo é salvo e você acorda com mais vida.
##   Com sono demais dá para dormir a qualquer hora; descansado, só depois que escurece (das 18h).
## Na partida em rede o tempo não acelera: o sono volta enquanto você dorme, e os outros continuam jogando.

const QUEDA := 0.068        # quanto o sono cai por segundo acordado
const NOITE_H := 7.0        # horas de jogo para encher o sono dormindo
const COCHILO_H := 3.0
const TURBO := 10.0         # quantas vezes o relógio corre dormindo (sozinho ou abrindo a partida sem ninguém)
const PERTO := 14.0

var main
var dormindo := {}          # {"fim": minutos de jogo, "noite", "lugar", "vida0", "taxa"}
var _micro_t := 30.0
var _dicas := {}
var _apagao := 0.0
var _acordou := -10.0
var veu: ColorRect
var lbl: Label
var sub: Label


func _init(m) -> void:
	main = m
	layer = 20


func _ready() -> void:
	veu = ColorRect.new()
	veu.color = Color(0.0, 0.0, 0.0, 0.0)
	veu.mouse_filter = Control.MOUSE_FILTER_IGNORE
	veu.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(veu)
	var cc := CenterContainer.new()
	cc.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	cc.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(cc)
	var v := VBoxContainer.new()
	v.alignment = BoxContainer.ALIGNMENT_CENTER
	v.add_theme_constant_override("separation", 10)
	cc.add_child(v)
	lbl = Estilo.rotulo("", 34, Estilo.OSSO, "titulo", 700, 3)
	lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(lbl)
	sub = Estilo.rotulo("", 14, Estilo.CINZA, "ui", 600)
	sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(sub)
	lbl.visible = false
	sub.visible = false


## quanto a energia enche (com sono enche mais devagar)
func regen() -> float:
	var s: float = main.jogador.sono
	return 1.0 if s >= 35.0 else lerpf(0.55, 1.0, s / 35.0)


## a velocidade (exausto anda mais devagar)
func vel() -> float:
	return 0.9 if float(main.jogador.sono) < 15.0 else 1.0


func turbo() -> float:
	if dormindo.is_empty():
		return 1.0
	# na partida em rede (com alguém dentro) o tempo não acelera
	if Rede.on and (Rede.convidado() or not Rede.jog.is_empty()):
		return 1.0
	return TURBO


func passo(dt: float) -> void:
	var j = main.jogador
	if j == null:
		return
	if _apagao > 0.0:
		_apagao = maxf(0.0, _apagao - dt)
	if not j.vivo and not dormindo.is_empty():
		dormindo = {}
	if not dormindo.is_empty():
		_dormindo(dt)
	elif j.vivo:
		var k := QUEDA * (1.35 if j._corre else 1.0)
		j.sono = maxf(0.0, float(j.sono) - k * dt)
		if j.sono < 35.0 and not _dicas.has("sono"):
			_dicas["sono"] = true
			main.ui.aviso("Você está ficando com sono: a energia enche mais devagar. Durma numa cama ou no saco de dormir (E).", 7.0)
		if j.sono > 50.0:
			_dicas.erase("sono")
		if j.sono < 15.0:
			_micro_t -= dt
			if _micro_t <= 0.0:
				_micro_t = (14.0 if j.sono <= 0.0 else 32.0) + randf() * 20.0
				_apagao = 1.4
				j.velocity *= 0.2
				main.ui.aviso("Você cochilou de pé...", 3.0)
				if not _dicas.has("exausto"):
					_dicas["exausto"] = true
					main.ui.aviso("Exausto! Você anda mais devagar e apaga de pé. Se o sono chegar a zero, a vida começa a cair.", 7.0)
		if j.sono <= 0.0:
			j.ferir(0.18 * dt, false)
	# o véu (o cochilo de pé e o sono)
	var a := 0.0
	if not dormindo.is_empty():
		a = 0.94
	elif _apagao > 0.0:
		a = clampf(minf(_apagao / 0.35, (1.4 - _apagao) / 0.25), 0.0, 1.0)
	veu.color.a = a
	var ver := not dormindo.is_empty()
	if lbl.visible != ver:
		lbl.visible = ver
		sub.visible = ver


# ======================================================================== dormir e acordar
## pode dormir aqui agora? (vazio: pode; senão o motivo)
func pode(lugar: Dictionary) -> String:
	var j = main.jogador
	if not j.vivo:
		return "Agora não dá"
	if main.terreno.tipo_agua(j.global_position.x, j.global_position.z) != 0 and main.terreno.nivel_agua(j.global_position.x, j.global_position.z) > j.global_position.y + 0.3:
		return "Não dá para dormir na água"
	var noite := float(main.hora) >= 18.0 or float(main.hora) < 5.0
	if float(j.sono) > 85.0 and not (noite and (bool(lugar.get("cama", false)) or bool(lugar.get("saco", false)))):
		return "Ainda sem sono. Na cama ou no saco de dormir dá para dormir quando escurecer (depois das 18h)."
	for z in main.zumbis:
		if is_instance_valid(z) and z.estado in ["caca", "alerta"] and not z.lan and z.global_position.distance_to(j.global_position) < 30.0:
			return "Tem zumbi atrás de você: não dá para dormir"
		if is_instance_valid(z) and z.lan and z.estado == "caca" and z.global_position.distance_to(j.global_position) < 30.0:
			return "Tem zumbi atrás de você: não dá para dormir"
	return ""


func dormir(lugar: Dictionary) -> bool:
	if Time.get_ticks_msec() / 1000.0 - _acordou < 0.8:
		return false
	var nao := pode(lugar)
	if nao != "":
		main.ui.aviso(nao, 4.0)
		return false
	var j = main.jogador
	var h := float(main.hora)
	var noite := h >= 18.0 or h < 5.0
	var horas := fposmod(6.4 - h, 24.0) if noite else COCHILO_H
	var k := 0.85 if bool(lugar.get("saco", false)) else 1.0
	dormindo = {"fim": _minutos() + horas * 60.0, "noite": noite, "lugar": lugar, "vida0": float(j.vida), "taxa": 100.0 / NOITE_H * k}
	j.acao = {}
	j.velocity = Vector3.ZERO
	j.preso = true
	lbl.text = "DORMINDO"
	if bool(lugar.get("cama", false)) and not Rede.convidado():
		main.salvar_jogo()
	if turbo() <= 1.0:
		sub.text = "Na partida em rede o tempo não acelera: o sono volta enquanto você dorme · E ou Espaço: acordar"
	else:
		sub.text = "E ou Espaço: acordar"
	main.sons.tocar("clique", j.global_position, -6.0)
	return true


func _minutos() -> float:
	return (float(main.dia) * 24.0 + float(main.hora)) * 60.0


func _dormindo(dt: float) -> void:
	var j = main.jogador
	var d := dormindo
	# o sono enche por hora de jogo (com o relógio acelerado, enche rápido)
	var seg_h: float = main.seg_hora()
	j.sono = minf(100.0, float(j.sono) + float(d["taxa"]) * dt * turbo() / seg_h)
	lbl.text = "DORMINDO · %s" % main.hora_txt()
	var motivo := ""
	if float(j.vida) < float(d["vida0"]) - 0.5:
		motivo = "Você acordou com um ataque!"
	else:
		for z in main.zumbis:
			if not is_instance_valid(z) or z.estado == "morto":
				continue
			var dz: float = z.global_position.distance_to(j.global_position)
			if dz < PERTO and (z.estado == "caca" or z.golpe_t >= 0.0 or dz < 6.0):
				motivo = "Barulho lá fora! Você acordou: tem zumbi por perto."
				break
	if motivo == "" and main.get("clima") != null and main.clima.kk("tempestade") > 0.8 and randf() < dt * 0.004 * turbo():
		motivo = "Um trovão te acordou."
	var chegou: bool = _minutos() >= float(d["fim"]) or (not bool(d["noite"]) and float(j.sono) >= 99.5)
	if motivo == "" and (float(j.fome) <= 2.0 or float(j.sede) <= 2.0):
		motivo = "A fome e a sede te acordaram."
	if motivo != "" or chegou:
		acordar(motivo)
	if Input.is_action_just_pressed("usar") or Input.is_action_just_pressed("pular"):
		acordar("__manual")


func acordar(motivo: String) -> void:
	if dormindo.is_empty():
		return
	var d := dormindo
	dormindo = {}
	_acordou = Time.get_ticks_msec() / 1000.0
	var j = main.jogador
	j.preso = false
	var manual := motivo == "__manual"
	if not manual and motivo == "":
		j.vida = minf(100.0, float(j.vida) + 8.0)
		main.ui.aviso("Bom dia. Você dormiu a noite e acordou descansado." if bool(d["noite"]) else "Você tirou um cochilo e acordou melhor.", 5.0)
		if bool(d["lugar"].get("cama", false)) and not Rede.convidado():
			main.salvar_jogo()
	elif manual:
		main.ui.aviso("Você levantou", 2.0)
	else:
		main.ui.aviso(motivo, 5.0)
		main.sons.tocar("dor", j.global_position, -4.0)


func salvar() -> Dictionary:
	return {"sono": snappedf(float(main.jogador.sono), 0.1), "dicas": _dicas.keys()}


func carregar(d: Dictionary) -> void:
	main.jogador.sono = clampf(float(d.get("sono", 100.0)), 0.0, 100.0)
	dormindo = {}
	_dicas = {}
	for k in d.get("dicas", []):
		_dicas[str(k)] = true
