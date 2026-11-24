class_name Hud
extends Control
## O HUD do jogo antigo (o do PC, versão 10, com as partes que o Himalaia aprovou no HUD novo):
## - em cima à esquerda, o minimapa redondo (mata, clareiras, água, ruas, prédios, a base, os zumbis perto e você no meio,
##   com o N cor de brasa e dois anéis de distância) e, embaixo dele, o nome do lugar mais perto com a distância;
## - em cima no meio, a bússola (letras a cada 45°, graus a cada 15°, tracinhos a cada 5°, some nas pontas, traço cor de
##   brasa no meio, a cama e a mochila caída marcadas) e o relógio (dia, hora, quanto falta para anoitecer ou amanhecer);
## - embaixo à esquerda, os comandos do teclado (H esconde);
## - embaixo no meio, os botões (mochila, construir, lanterna), o nome do item da mão com o tipo e o desgaste em
##   tracinhos, e a barra rápida (6 espaços, o da mão com cantos cor de brasa);
## - embaixo à direita, a vida (barra), a fome, a sede e a energia (arcos), e os avisos de cima (pilha, proteção...);
## - os avisos do que acontece, a mira (ponto claro com contorno; fica vermelha no acerto), o que dá para fazer com o que
##   a mira pega (tecla E), o vermelho nas bordas quando apanha (e de que lado veio) e com pouca vida.

const MINI := 120.0
const ALCANCE_MINI := 42.0
const PX_GRAU := 2.4
const LARG_BUSSOLA := 440.0

var main: Node
var mini_mascara: Control
var mini_conteudo: Control
var mini_mata: TextureRect
var mini_agua: TextureRect
var mini_pisos: TextureRect
var mini_lugares: Control
var mini_coisas: Control
var mini_cima: Control
var lugar_lbl: Label
var bussola: Control
var dia_painel: PanelContainer
var dia_ico: TextureRect
var dia_nome: Label
var dia_hora: Label
var dia_falta: Label
var dia_chip: PanelContainer
var dia_chip_lbl: Label
var teclas: PanelContainer
var util: HBoxContainer
var bt_lanterna: Button
var nome_item: Label
var sub_item: HBoxContainer
var tipo_item: Label
var tracos_item: Control
var pct_item: Label
var barra: Control
var vitais: Control
var folego: Control
var chips: HBoxContainer
var feed: VBoxContainer
var mira: Control
var prompt: PanelContainer
var prompt_tecla: PanelContainer
var prompt_txt: Label
var prompt_sub: Label
var veu_dano: ColorRect
var veu_vida: ColorRect
var seta_dano: Control
var fps_lbl: Label
var rede: HudRede
var acerto_t := 0.0
var acerto_cab := false    # o último acerto foi na cabeça (o X fica maior)
var luneta: Control        # a tela da luneta do rifle (mirando)
var chefe_painel: PanelContainer   # a vida do Colosso (aparece quando ele está perto)
var chefe_barra: Control
var chefe_k := 0.0
var _chefe_t := 0.0
var dano_ang := 0.0
var dano_t := 0.0
var _t := 0.0
var _lento := 0.0
var _chip_cache := ""
var construindo := false
var cidade := Rect2()      # o retângulo da cidade (calculado uma vez, para o minimapa)


func _init(m: Node) -> void:
	main = m


func _ready() -> void:
	# já dentro da tela: as âncoras E as margens (só as âncoras deixavam o HUD com tamanho zero e tudo ia para o canto)
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	theme = Estilo.tema()
	_veus()
	_minimapa()
	_topo()
	_chefe()
	_teclas()
	_barra()
	_vitais()
	_folego()
	_feed()
	_mira()
	# a partida em rede: quem está e o bate-papo (embaixo à esquerda, em cima dos comandos)
	rede = HudRede.new(main)
	add_child(rede)
	fps_lbl = Estilo.rotulo_hud("", 12, Color(0.75, 0.9, 0.7), "ui", 700)
	fps_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	add_child(fps_lbl)
	Estilo.prender(fps_lbl, 1.0, 0.0, -16, 8, Control.GROW_DIRECTION_BEGIN, Control.GROW_DIRECTION_END)
	_ignorar(self)


## nada do HUD segura o mouse (com o mouse preso o movimento chega no meio da tela)
func _ignorar(n: Node) -> void:
	for f in n.get_children():
		if f is Control and not (f is Button):
			(f as Control).mouse_filter = Control.MOUSE_FILTER_IGNORE
		_ignorar(f)


# ---------------------------------------------------------------- véus (dano, pouca vida) e a seta do lado do golpe
func _veu(cor: Color, dentro: float) -> ColorRect:
	var r := ColorRect.new()
	r.set_anchors_preset(Control.PRESET_FULL_RECT)
	r.color = Color(1, 1, 1, 1)
	var sh := Shader.new()
	sh.code = """
shader_type canvas_item;
uniform vec4 cor : source_color = vec4(0.63, 0.08, 0.05, 0.55);
uniform float forca = 0.0;
uniform float dentro = 0.45;
void fragment() {
	vec2 d = (UV - 0.5) * 2.0;
	d.y *= 0.82;
	float a = smoothstep(dentro, 1.2, length(d));
	COLOR = vec4(cor.rgb, cor.a * a * forca);
}
"""
	var m := ShaderMaterial.new()
	m.shader = sh
	m.set_shader_parameter("cor", cor)
	m.set_shader_parameter("dentro", dentro)
	r.material = m
	add_child(r)
	return r


func _veus() -> void:
	luneta = Luneta.new(self)
	luneta.set_anchors_preset(Control.PRESET_FULL_RECT)
	luneta.visible = false
	add_child(luneta)
	veu_vida = _veu(Color(0.27, 0.0, 0.0, 0.9), 0.5)
	veu_dano = _veu(Color(0.63, 0.08, 0.05, 0.6), 0.42)
	seta_dano = SetaDano.new(self)
	seta_dano.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(seta_dano)


# ---------------------------------------------------------------- minimapa
func _textura_mapa(tex: Texture2D, codigo: String, perto := false) -> TextureRect:
	var r := TextureRect.new()
	r.texture = tex
	r.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	r.stretch_mode = TextureRect.STRETCH_SCALE
	r.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST if perto else CanvasItem.TEXTURE_FILTER_LINEAR
	var sh := Shader.new()
	sh.code = "shader_type canvas_item;\n" + codigo
	var m := ShaderMaterial.new()
	m.shader = sh
	r.material = m
	return r


func _minimapa() -> void:
	var ter = main.terreno
	# o botão da pausa (≡) à esquerda do minimapa, como no jogo antigo
	var bp := Button.new()
	bp.icon = Estilo.icone("pausa", 18)
	bp.icon_alignment = HORIZONTAL_ALIGNMENT_CENTER
	bp.focus_mode = Control.FOCUS_NONE
	bp.tooltip_text = "Pausa (Esc)"
	bp.position = Vector2(16, 14)
	bp.size = Vector2(34, 34)
	bp.add_theme_stylebox_override("normal", Estilo.caixa(Estilo.VIDRO, Estilo.BORDA, 8, 0))
	bp.add_theme_stylebox_override("hover", Estilo.caixa(Estilo.VIDRO_ALTO, Estilo.BORDA_ALTA, 8, 0))
	bp.add_theme_stylebox_override("pressed", Estilo.caixa(Estilo.VIDRO_ALTO, Estilo.BRASA, 8, 0))
	bp.add_theme_stylebox_override("focus", StyleBoxEmpty.new())
	bp.pressed.connect(func(): main.telas.pausa())
	add_child(bp)
	mini_mascara = Mascara.new()
	mini_mascara.position = Vector2(60, 12)
	mini_mascara.size = Vector2(MINI, MINI)
	mini_mascara.clip_children = CanvasItem.CLIP_CHILDREN_AND_DRAW
	add_child(mini_mascara)
	mini_conteudo = Control.new()
	mini_conteudo.size = Vector2(MINI, MINI)
	mini_mascara.add_child(mini_conteudo)
	mini_mata = _textura_mapa(ter.tex_mata, """
void fragment() {
	float m = texture(TEXTURE, UV).r;
	COLOR = vec4(0.075, 0.16, 0.095, smoothstep(0.25, 0.85, m) * 0.9);
}""")
	mini_conteudo.add_child(mini_mata)
	mini_lugares = DesenhoMapa.new(self, "lugares")
	mini_lugares.size = Vector2(MINI, MINI)
	mini_conteudo.add_child(mini_lugares)
	mini_agua = _textura_mapa(ter.tex_agua, """
void fragment() {
	float t = texture(TEXTURE, UV).r * 255.0;
	COLOR = t < 0.5 ? vec4(0.0) : (t < 1.5 ? vec4(0.2, 0.42, 0.56, 1.0) : vec4(0.15, 0.33, 0.47, 1.0));
}""", true)
	mini_conteudo.add_child(mini_agua)
	mini_pisos = _textura_mapa(ter.tex_pisos, """
void fragment() {
	vec4 p = texture(TEXTURE, UV);
	float s = p.r + p.g + p.b;
	vec3 c = (vec3(0.42, 0.41, 0.39) * p.r + vec3(0.545, 0.467, 0.349) * p.g + vec3(0.5, 0.49, 0.46) * p.b) / max(0.001, s);
	COLOR = vec4(c, smoothstep(0.12, 0.55, max(max(p.r, p.g), p.b)));
}""")
	mini_conteudo.add_child(mini_pisos)
	mini_coisas = DesenhoMapa.new(self, "coisas")
	mini_coisas.size = Vector2(MINI, MINI)
	mini_conteudo.add_child(mini_coisas)
	mini_cima = DesenhoMapa.new(self, "cima")
	mini_cima.position = mini_mascara.position
	mini_cima.size = Vector2(MINI, MINI)
	add_child(mini_cima)
	lugar_lbl = Estilo.rotulo_hud("", 11, Color(0.925, 0.894, 0.824, 0.85), "ui", 800, 2)
	lugar_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lugar_lbl.position = Vector2(60 + MINI / 2.0 - 120.0, 12 + MINI + 7)
	lugar_lbl.size = Vector2(240, 16)
	add_child(lugar_lbl)


## de metros do mundo para pixels do minimapa (norte em cima: x para a direita, z para baixo)
func _mini_k() -> float:
	return (MINI * 0.5 - 3.0) / ALCANCE_MINI


func _mini_pos(x: float, z: float) -> Vector2:
	var j: Node3D = main.jogador
	return Vector2(MINI, MINI) * 0.5 + (Vector2(x, z) - Vector2(j.global_position.x, j.global_position.z)) * _mini_k()


func _mini_atualizar() -> void:
	var ter = main.terreno
	var k := _mini_k()
	var p0 := _mini_pos(ter.X0 - 0.5 * ter.P, ter.Z0 - 0.5 * ter.P)
	var tam := Vector2(ter.W * ter.P, ter.H * ter.P) * k
	mini_mata.position = p0
	mini_mata.size = tam
	mini_agua.position = p0
	mini_agua.size = tam
	var sh: float = ter.splat_h
	mini_pisos.position = _mini_pos(-sh, -sh)
	mini_pisos.size = Vector2(sh, sh) * 2.0 * k
	# de noite o mapa escurece (como no jogo antigo)
	var n: float = _noite_k()
	mini_conteudo.modulate = Color(1, 1, 1).lerp(Color(0.55, 0.6, 0.62), n)
	(mini_mascara as Mascara).cor = Color(0.122, 0.227, 0.141).lerp(Color(0.055, 0.102, 0.067), n)
	mini_mascara.queue_redraw()
	mini_lugares.queue_redraw()
	mini_coisas.queue_redraw()
	mini_cima.queue_redraw()


func _noite_k() -> float:
	var h: float = main.hora
	if h >= 20.0 or h < 4.5:
		return 1.0
	if h >= 17.5:
		return (h - 17.5) / 2.5
	if h < 6.5:
		return 1.0 - (h - 4.5) / 2.0
	return 0.0


## para onde o jogador olha: o ângulo da bússola (0 = norte, 90 = leste, horário)
func rumo() -> float:
	var f: Vector3 = -main.jogador.global_transform.basis.z
	return fposmod(rad_to_deg(atan2(f.x, -f.z)), 360.0)


func rumo_para(x: float, z: float) -> float:
	var j: Node3D = main.jogador
	return fposmod(rad_to_deg(atan2(x - j.global_position.x, -(z - j.global_position.z))), 360.0)


## o que aparece marcado (minimapa e bússola): a cama ou o saco de dormir onde renasce, a mochila que ficou onde caiu e os
## amigos da partida em rede
func marcas() -> Array:
	var r := []
	var c = main.construcao
	if c == null:
		return r
	# vale o último saco de dormir ou cama
	if c.sacos.size() > 0 and c.sacos[c.sacos.size() - 1] is Vector3:
		var p: Vector3 = c.sacos[c.sacos.size() - 1]
		r.append({"x": p.x, "z": p.z, "cor": Color(0.88, 0.78, 0.49), "ico": "cama"})
	for b in c.baus:
		if b is Dictionary and b.get("mochila", false) and b.has("no") and is_instance_valid(b["no"]):
			var p2: Vector3 = (b["no"] as Node3D).global_position
			r.append({"x": p2.x, "z": p2.z, "cor": Estilo.MUSGO, "ico": "mochila"})
	# os amigos da partida em rede que estão num mundo (azul)
	for q in Rede.no_mundo():
		r.append({"x": q.alvo.x, "z": q.alvo.z, "cor": Estilo.AGUA, "ico": "grupo"})
	return r


# ---------------------------------------------------------------- bússola e relógio
func _topo() -> void:
	bussola = Bussola.new(self)
	bussola.custom_minimum_size = Vector2(LARG_BUSSOLA, 36)
	add_child(bussola)
	Estilo.prender(bussola, 0.5, 0.0, 0, 8, Control.GROW_DIRECTION_BOTH, Control.GROW_DIRECTION_END)
	var centro := CenterContainer.new()
	add_child(centro)
	Estilo.prender(centro, 0.5, 0.0, 0, 50, Control.GROW_DIRECTION_BOTH, Control.GROW_DIRECTION_END)
	dia_painel = PanelContainer.new()
	var cx := Estilo.caixa_hud(17, 6)
	cx.content_margin_left = 12
	cx.content_margin_right = 14
	dia_painel.add_theme_stylebox_override("panel", cx)
	centro.add_child(dia_painel)
	var h := HBoxContainer.new()
	h.add_theme_constant_override("separation", 8)
	h.alignment = BoxContainer.ALIGNMENT_CENTER
	dia_painel.add_child(h)
	dia_ico = TextureRect.new()
	dia_ico.custom_minimum_size = Vector2(17, 17)
	dia_ico.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	dia_ico.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	dia_ico.modulate = Estilo.BRASA
	h.add_child(dia_ico)
	dia_nome = Estilo.rotulo("DIA 1", 17, Estilo.OSSO, "titulo", 700, 2)
	h.add_child(dia_nome)
	dia_hora = Estilo.rotulo("07:00 ·", 13, Estilo.CINZA, "ui", 600)
	h.add_child(dia_hora)
	dia_falta = Estilo.rotulo("", 13, Estilo.OSSO, "ui", 800)
	h.add_child(dia_falta)
	dia_chip = PanelContainer.new()
	h.add_child(dia_chip)
	dia_chip_lbl = Estilo.rotulo("", 10, Estilo.MUSGO, "ui", 800, 2)
	dia_chip.add_child(dia_chip_lbl)


func _relogio() -> void:
	var h: float = main.hora
	var noite: bool = main.noite()
	dia_ico.texture = Estilo.icone("lua" if noite else "sol", 18)
	dia_nome.text = "DIA %d" % int(main.dia)
	dia_hora.text = "%s ·" % main.hora_txt()
	var falta: float
	if noite:
		falta = (5.5 - h) if h < 5.5 else (24.0 - h + 5.5)
	else:
		falta = 19.0 - h
	var t := ("%dh" % int(ceil(falta))) if falta >= 1.0 else ("%d min" % maxi(1, int(falta * 60.0)))
	dia_falta.text = ("amanhece em " if noite else "anoitece em ") + t
	var chip := "calmo"
	if noite:
		chip = "noite"
	elif h >= 17.0:
		chip = "tarde"
	if chip != _chip_cache:
		_chip_cache = chip
		var cor := Estilo.MUSGO
		var veu := Estilo.MUSGO_VEU
		var txt := "EXPLORE E COLETE"
		if chip == "noite":
			cor = Estilo.SANGUE_TINTA
			veu = Estilo.SANGUE_VEU
			txt = "NOITE: ELES CORREM"
		elif chip == "tarde":
			cor = Estilo.GRAO
			veu = Color(Estilo.GRAO, 0.16)
			txt = "VAI ESCURECER"
		var b := Estilo.caixa(veu, Color(cor, 0.9), 10, 6)
		b.content_margin_top = 3
		b.content_margin_bottom = 3
		dia_chip.add_theme_stylebox_override("panel", b)
		dia_chip_lbl.text = txt
		dia_chip_lbl.add_theme_color_override("font_color", cor)


# ---------------------------------------------------------------- o chefe (o Colosso da lua de sangue)
func _chefe() -> void:
	var centro := CenterContainer.new()
	add_child(centro)
	Estilo.prender(centro, 0.5, 0.0, 0, 96, Control.GROW_DIRECTION_BOTH, Control.GROW_DIRECTION_END)
	chefe_painel = PanelContainer.new()
	var cx := Estilo.caixa_hud(12, 8)
	cx.border_color = Color(Estilo.SANGUE, 0.55)
	chefe_painel.add_theme_stylebox_override("panel", cx)
	centro.add_child(chefe_painel)
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 5)
	chefe_painel.add_child(v)
	var nome := Estilo.rotulo("COLOSSO · LUA DE SANGUE", 13, Estilo.SANGUE_TINTA, "titulo", 700, 3)
	nome.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(nome)
	chefe_barra = BarraChefe.new(self)
	chefe_barra.custom_minimum_size = Vector2(360, 10)
	v.add_child(chefe_barra)
	chefe_painel.visible = false


## o Colosso vivo a menos de 80 m de você: a barra aparece com a vida dele
func _chefe_ver(j) -> void:
	var melhor := -1.0
	var bd := 80.0
	for z in main.zumbis:
		if not is_instance_valid(z) or z.estado == "morto" or not bool(z.S.get("chefe", false)):
			continue
		var d: float = z.global_position.distance_to(j.global_position)
		if d < bd:
			bd = d
			melhor = clampf(float(z.vida) / float(z.vida_max), 0.0, 1.0)
	var ver := melhor >= 0.0
	if chefe_painel.visible != ver:
		chefe_painel.visible = ver
	if ver and absf(melhor - chefe_k) > 0.001:
		chefe_k = melhor
		chefe_barra.queue_redraw()


class BarraChefe extends Control:
	var hud

	func _init(h) -> void:
		hud = h

	func _draw() -> void:
		var r := Rect2(Vector2.ZERO, size)
		draw_rect(r, Color(0.06, 0.03, 0.03, 0.85))
		var k: float = hud.chefe_k
		draw_rect(Rect2(Vector2(1, 1), Vector2((size.x - 2.0) * k, size.y - 2.0)), Estilo.SANGUE)
		draw_rect(Rect2(Vector2(1, 1), Vector2((size.x - 2.0) * k, (size.y - 2.0) * 0.4)), Color(1.0, 0.55, 0.5, 0.35))
		for i in range(1, 10):
			var x := size.x * i / 10.0
			draw_line(Vector2(x, 1), Vector2(x, size.y - 1), Color(0, 0, 0, 0.35), 1.0)
		draw_rect(r, Color(Estilo.SANGUE, 0.7), false, 1.0)


# ---------------------------------------------------------------- comandos (embaixo à esquerda)
const COMANDOS := [
	["W A S D", "Andar · Shift corre"],
	["C", "Agachar · Espaço pula"],
	["Clique", "Bater · usar o item da mão"],
	["E", "Pegar, abrir, beber, revistar"],
	["Tab", "Mochila e fabricação"],
	["1 a 6", "Item na mão (ou a rodinha)"],
	["B", "Construir (com o plano)"],
	["M", "Mapa · F lanterna"],
	["V", "Primeira ou terceira pessoa"],
	["F5", "Salvar · Esc menu"],
	["H", "Esconder estes comandos"],
]


func _teclas() -> void:
	teclas = PanelContainer.new()
	teclas.add_theme_stylebox_override("panel", Estilo.caixa_hud(12, 10))
	add_child(teclas)
	Estilo.prender(teclas, 0.0, 1.0, 16, -40, Control.GROW_DIRECTION_END, Control.GROW_DIRECTION_BEGIN)
	var g := GridContainer.new()
	g.columns = 2
	g.add_theme_constant_override("h_separation", 10)
	g.add_theme_constant_override("v_separation", 5)
	teclas.add_child(g)
	for c in COMANDOS:
		g.add_child(Estilo.tecla(c[0], 10))
		g.add_child(Estilo.rotulo(c[1], 12, Estilo.CINZA, "ui", 600))


func mostrar_comandos(on: bool) -> void:
	teclas.visible = on


# ---------------------------------------------------------------- barra do meio: botões, nome do item e barra rápida
func _bt_util(ico: String, tecla_txt: String, dica: String, f: Callable) -> Button:
	var b := Button.new()
	b.custom_minimum_size = Vector2(44, 44)
	b.focus_mode = Control.FOCUS_NONE
	b.tooltip_text = dica
	b.icon = Estilo.icone(ico, 20)
	b.icon_alignment = HORIZONTAL_ALIGNMENT_CENTER
	b.expand_icon = false
	var n := Estilo.caixa(Estilo.VIDRO, Estilo.BORDA, 22, 0, 2)
	var s := Estilo.caixa(Estilo.VIDRO_ALTO, Estilo.BORDA_ALTA, 22, 0, 2)
	b.add_theme_stylebox_override("normal", n)
	b.add_theme_stylebox_override("hover", s)
	b.add_theme_stylebox_override("pressed", Estilo.caixa(Estilo.VIDRO_ALTO, Estilo.BRASA, 22, 0, 2))
	b.add_theme_stylebox_override("focus", StyleBoxEmpty.new())
	b.pressed.connect(f)
	var k := Estilo.tecla(tecla_txt, 9)
	k.position = Vector2(30, 31)
	b.add_child(k)
	return b


func _barra() -> void:
	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 7)
	col.alignment = BoxContainer.ALIGNMENT_END
	add_child(col)
	Estilo.prender(col, 0.5, 1.0, 0, -12, Control.GROW_DIRECTION_BOTH, Control.GROW_DIRECTION_BEGIN)
	util = HBoxContainer.new()
	util.alignment = BoxContainer.ALIGNMENT_CENTER
	util.add_theme_constant_override("separation", 14)
	col.add_child(util)
	util.add_child(_bt_util("mochila", "Tab", "Mochila (Tab)", func(): main.ui.abrir(not main.ui.aberto)))
	util.add_child(_bt_util("martelo", "B", "Construir (B)", func(): main.jogador.construir()))
	bt_lanterna = _bt_util("lanterna", "F", "Lanterna (F)", func(): main.jogador.alternar_lanterna())
	util.add_child(bt_lanterna)
	var nome_col := VBoxContainer.new()
	nome_col.add_theme_constant_override("separation", 5)
	nome_col.custom_minimum_size = Vector2(0, 31)
	col.add_child(nome_col)
	nome_item = Estilo.rotulo_hud("", 16, Estilo.OSSO, "titulo", 700, 2)
	nome_item.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	nome_col.add_child(nome_item)
	sub_item = HBoxContainer.new()
	sub_item.alignment = BoxContainer.ALIGNMENT_CENTER
	sub_item.add_theme_constant_override("separation", 8)
	nome_col.add_child(sub_item)
	tipo_item = Estilo.rotulo_hud("", 10, Color(0.925, 0.894, 0.824, 0.65), "ui", 800, 2)
	sub_item.add_child(tipo_item)
	tracos_item = Tracos.new()
	tracos_item.custom_minimum_size = Vector2(57, 10)
	sub_item.add_child(tracos_item)
	pct_item = Estilo.rotulo_hud("", 10, Color(0.925, 0.894, 0.824, 0.65), "ui", 800, 1)
	sub_item.add_child(pct_item)
	barra = BarraRapida.new(self)
	var cb := CenterContainer.new()
	cb.add_child(barra)
	col.add_child(cb)


const TIPOS := {"arma": "Arma", "util": "Ferramenta", "material": "Material", "comida": "Comida", "bebida": "Bebida",
	"cura": "Remédio", "roupa": "Roupa", "municao": "Munição", "missao": "Achado", "garrafa": "Garrafa", "plano": "Construção"}


func _nome_item() -> void:
	var j = main.jogador
	var s = j.inv.slots[j.sel]
	if s == null:
		nome_item.text = "MÃOS VAZIAS"
		nome_item.add_theme_font_size_override("font_size", 13)
		tipo_item.text = "SOCO · 3 SOCOS = 1 MADEIRA"
		tracos_item.visible = false
		pct_item.text = ""
		return
	nome_item.add_theme_font_size_override("font_size", 16)
	var id := str(s["id"])
	var d := Dados.item(id)
	nome_item.text = Dados.nome(id).to_upper()
	var tipo := str(TIPOS.get(Dados.tipo(id), "")).to_upper()
	tipo_item.text = tipo
	if s.has("q") and int(s["q"]) != 1:
		nome_item.text = Armas.nome_q(id, s["q"]).to_upper()
	if Armas.de_fogo(id):
		# a munição: no pente / na mochila
		var B := Armas.dados(id)
		tracos_item.visible = false
		tipo_item.text = "ARMA DE FOGO" if id != "besta" else "BESTA"
		pct_item.text = "%d / %d" % [int(s.get("mun", 0)), j.inv.conta(str(B["municao"]))]
		return
	if id == "arco":
		tipo_item.text = "ARCO · %d FLECHAS" % j.inv.conta("flecha")
	if s.has("dur"):
		var f := clampf(float(s["dur"]) / maxf(1.0, Armas.dur_max(id, s.get("q", 1))), 0.0, 1.0)
		tracos_item.visible = true
		(tracos_item as Tracos).f = f
		tracos_item.queue_redraw()
		pct_item.text = "%d%%" % roundi(f * 100.0)
	else:
		tracos_item.visible = false
		var n := int(s["n"])
		var mx := Dados.max_pilha(id)
		pct_item.text = ("%d de %d" % [n, mx]) if mx > 1 else ""


## com o plano na mão a barra da construção ocupa o lugar dos botões e do nome do item
func modo_construcao(on: bool) -> void:
	construindo = on
	util.visible = not on
	nome_item.get_parent().visible = not on


# ---------------------------------------------------------------- vida, fome, sede (estilo DayZ) e o fôlego
## embaixo à direita, como no jogo antigo (HUD do PC, "estilo DayZ"): ícones de contorno sem painel que enchem de baixo
## para cima conforme o nível e mudam de cor (claro bem, amarelo baixo, vermelho crítico), com setas embaixo quando o
## valor sobe ou cai mais rápido que o normal. A temperatura e o sono chegam com o clima e o sono (etapa 6).
func _vitais() -> void:
	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 8)
	col.alignment = BoxContainer.ALIGNMENT_END
	add_child(col)
	Estilo.prender(col, 1.0, 1.0, -18, -10, Control.GROW_DIRECTION_BEGIN, Control.GROW_DIRECTION_BEGIN)
	chips = HBoxContainer.new()
	chips.alignment = BoxContainer.ALIGNMENT_END
	chips.add_theme_constant_override("separation", 10)
	col.add_child(chips)
	vitais = Vitais.new(self)
	vitais.size_flags_horizontal = Control.SIZE_SHRINK_END
	col.add_child(vitais)


## a barrinha do fôlego (embaixo à esquerda, debaixo dos comandos): some um pouco quando está cheia
func _folego() -> void:
	folego = Folego.new(self)
	folego.custom_minimum_size = Vector2(210, 18)
	add_child(folego)
	Estilo.prender(folego, 0.0, 1.0, 18, -12, Control.GROW_DIRECTION_END, Control.GROW_DIRECTION_BEGIN)


func _chip(ico: String, txt: String, cor: Color) -> HBoxContainer:
	var h := HBoxContainer.new()
	h.add_theme_constant_override("separation", 5)
	var i := TextureRect.new()
	i.texture = Estilo.icone(ico, 14)
	i.custom_minimum_size = Vector2(14, 14)
	i.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	i.modulate = cor
	h.add_child(i)
	h.add_child(Estilo.rotulo_hud(txt, 12, Estilo.OSSO, "ui", 800))
	_ignorar(h)
	h.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return h


func _chips() -> void:
	var j = main.jogador
	var quer := []
	if j.inv.conta("lanterna") > 0:
		quer.append(["lanterna", "%d%%" % roundi(j.bateria), Color(1.0, 0.86, 0.5)])
	var pr: float = j.inv.protecao()
	if pr > 0.0:
		quer.append(["escudo", "%d%%" % roundi(pr * 100.0), Color(0.84, 0.67, 0.4)])
	if j.enjoo > 0.0:
		quer.append(["alerta", "Dor de barriga", Color(0.61, 0.76, 0.29)])
	var chave := str(quer)
	if chave == str(chips.get_meta("chave", "")):
		return
	chips.set_meta("chave", chave)
	for c in chips.get_children():
		c.queue_free()
	for q in quer:
		chips.add_child(_chip(q[0], q[1], q[2]))


# ---------------------------------------------------------------- avisos
func _feed() -> void:
	feed = VBoxContainer.new()
	feed.add_theme_constant_override("separation", 4)
	feed.alignment = BoxContainer.ALIGNMENT_END
	add_child(feed)
	Estilo.prender(feed, 1.0, 1.0, -16, -150, Control.GROW_DIRECTION_BEGIN, Control.GROW_DIRECTION_BEGIN)


func aviso(txt: String, tempo := 2.6, ruim := false) -> void:
	var p := PanelContainer.new()
	var b := Estilo.caixa(Estilo.VIDRO, Estilo.BORDA, 7, 9)
	b.content_margin_top = 5
	b.content_margin_bottom = 5
	p.add_theme_stylebox_override("panel", b)
	p.size_flags_horizontal = Control.SIZE_SHRINK_END
	var l := Estilo.rotulo(txt, 13, Estilo.SANGUE_TINTA if ruim else Estilo.OSSO, "ui", 700)
	if txt.length() > 46:
		l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		l.custom_minimum_size = Vector2(360, 0)
	p.add_child(l)
	p.mouse_filter = Control.MOUSE_FILTER_IGNORE
	feed.add_child(p)
	while feed.get_child_count() > 6:
		var velho := feed.get_child(0)
		feed.remove_child(velho)
		velho.queue_free()
	p.modulate.a = 0.0
	var tw := create_tween()
	tw.tween_property(p, "modulate:a", 1.0, 0.2)
	tw.tween_interval(tempo)
	tw.tween_property(p, "modulate:a", 0.0, 0.5)
	tw.tween_callback(p.queue_free)


# ---------------------------------------------------------------- mira e o que dá para fazer
func _mira() -> void:
	mira = Mira.new(self)
	mira.custom_minimum_size = Vector2(22, 22)
	add_child(mira)
	Estilo.prender(mira, 0.5, 0.5, 0, 0, Control.GROW_DIRECTION_BOTH, Control.GROW_DIRECTION_BOTH)
	var c := CenterContainer.new()
	add_child(c)
	Estilo.prender(c, 0.5, 0.5, 0, 34, Control.GROW_DIRECTION_BOTH, Control.GROW_DIRECTION_END)
	prompt = PanelContainer.new()
	var b := Estilo.caixa(Estilo.VIDRO_ALTO, Estilo.BORDA, 9, 10)
	b.content_margin_top = 6
	b.content_margin_bottom = 6
	prompt.add_theme_stylebox_override("panel", b)
	c.add_child(prompt)
	var h := HBoxContainer.new()
	h.add_theme_constant_override("separation", 8)
	prompt.add_child(h)
	prompt_tecla = Estilo.tecla("E", 11)
	h.add_child(prompt_tecla)
	prompt_txt = Estilo.rotulo("", 14, Estilo.OSSO, "ui", 700)
	h.add_child(prompt_txt)
	prompt_sub = Estilo.rotulo("", 12, Estilo.CINZA, "ui", 600)
	h.add_child(prompt_sub)
	prompt.visible = false


func _prompt() -> void:
	var t: String = main.texto_mira() if not main.ui.aberto else ""
	if t == "":
		prompt.visible = false
		return
	prompt.visible = true
	var tecla := t.begins_with("E  ")
	prompt_tecla.visible = tecla
	var corpo := t.substr(3) if tecla else t
	# a vida da peça ("  120/260") e a dica entre parênteses vão menores, ao lado
	var sub := ""
	var i := corpo.find("  ")
	if i > 0:
		sub = corpo.substr(i + 2)
		corpo = corpo.substr(0, i)
	elif corpo.find(" (") > 0:
		var k := corpo.find(" (")
		sub = corpo.substr(k + 1)
		corpo = corpo.substr(0, k)
	prompt_txt.text = corpo
	prompt_sub.text = sub
	prompt_sub.visible = sub != ""


## a mira fica vermelha e cresce um pouco quando o golpe acerta; o tiro mostra o X (maior na cabeça)
func acerto(cabeca := false) -> void:
	acerto_t = 0.22 if cabeca else 0.18
	acerto_cab = cabeca


func atualizar_item() -> void:
	_nome_item()


## apanhou: as bordas ficam vermelhas e, se veio de algum lugar, a seta mostra o lado
func dano(de := Vector3.INF) -> void:
	var m := veu_dano.material as ShaderMaterial
	m.set_shader_parameter("forca", 1.0)
	var tw := create_tween()
	tw.tween_method(func(v: float): m.set_shader_parameter("forca", v), 1.0, 0.0, 0.6)
	if de != Vector3.INF:
		dano_ang = deg_to_rad(rumo_para(de.x, de.z) - rumo())
		dano_t = 1.2


# ---------------------------------------------------------------- a cada quadro
func _process(dt: float) -> void:
	if main.jogador == null or not main.em_jogo:
		return
	_t += dt
	acerto_t = maxf(0.0, acerto_t - dt)
	dano_t = maxf(0.0, dano_t - dt)
	_mini_atualizar()
	bussola.queue_redraw()
	barra.queue_redraw()
	vitais.queue_redraw()
	folego.queue_redraw()
	mira.queue_redraw()
	var lun: bool = j_luneta()
	if luneta.visible != lun:
		luneta.visible = lun
	if lun:
		luneta.queue_redraw()
	mira.visible = not lun
	if dano_t > 0.0 or seta_dano.visible:
		seta_dano.visible = dano_t > 0.0
		seta_dano.queue_redraw()
	var j = main.jogador
	var mv := veu_vida.material as ShaderMaterial
	var baixa: float = clampf((35.0 - float(j.vida)) / 35.0, 0.0, 1.0) if j.vivo else 0.0
	mv.set_shader_parameter("forca", baixa * (0.75 + 0.25 * sin(_t * 4.0)))
	bt_lanterna.modulate = Estilo.BRASA if j.luz_mao.visible else Color(1, 1, 1)
	if rede.visible:
		var base_y: float = (teclas.get_global_rect().position.y - get_global_rect().position.y - 10.0) if teclas.visible else size.y - 44.0
		rede.position = Vector2(16.0, base_y - rede.size.y)
	_prompt()
	_chefe_t -= dt
	if _chefe_t <= 0.0:
		_chefe_t = 0.1
		_chefe_ver(j)
	_lento -= dt
	if _lento <= 0.0:
		_lento = 0.25
		_relogio()
		_nome_item()
		_chips()
		var l: Dictionary = main.mundo.lugar_em(j.global_position.x, j.global_position.z)
		lugar_lbl.text = str(l["nome"]).to_upper() + ("  ·  %d M" % roundi(float(l["d"])) if float(l["d"]) >= 0.0 else "")
		if fps_lbl.visible:
			fps_lbl.text = "%d FPS" % Engine.get_frames_per_second()


# ================================================================ pedaços desenhados
## o círculo do minimapa (o que fica dentro dele é cortado no formato do círculo)
class Mascara extends Control:
	var cor := Color(0.122, 0.227, 0.141)

	func _draw() -> void:
		var r := size.x * 0.5
		draw_circle(Vector2(r, r), r - 1.0, cor, true, -1.0, true)


## desenho do minimapa: "lugares" (clareiras), "coisas" (ruas, prédios, base, zumbis, anéis) e "cima" (aro, N, marcas na
## borda e a seta do jogador, sem corte)
class DesenhoMapa extends Control:
	var hud
	var parte := ""

	func _init(h, p: String) -> void:
		hud = h
		parte = p
		mouse_filter = Control.MOUSE_FILTER_IGNORE

	func _draw() -> void:
		var main = hud.main
		if main.jogador == null or main.mundo == null:
			return
		var k: float = hud._mini_k()
		var c := size * 0.5
		var alc2: float = (Hud.ALCANCE_MINI + 30.0) * (Hud.ALCANCE_MINI + 30.0)
		var jp: Vector3 = main.jogador.global_position
		if parte == "lugares":
			# a cidade: o asfalto em volta dos prédios
			if hud.cidade == Rect2():
				hud.cidade = main.mundo.area_cidade()
			if hud.cidade.has_area():
				var cp: Vector2 = hud._mini_pos(hud.cidade.position.x, hud.cidade.position.y)
				draw_rect(Rect2(cp, hud.cidade.size * k), Color(0.23, 0.23, 0.22))
			for p in main.mundo.lugares:
				if Vector2(float(p["x"]) - jp.x, float(p["z"]) - jp.z).length_squared() < alc2 + float(p["r"]) * float(p["r"]) * 4.0:
					draw_circle(hud._mini_pos(p["x"], p["z"]), float(p["r"]) * k, Color(0.184, 0.302, 0.192), true, -1.0, true)
		elif parte == "coisas":
			for r in main.mundo.ruas:
				var pts: PackedVector2Array = r["pts"]
				var tela := PackedVector2Array()
				for q in pts:
					tela.append(hud._mini_pos(q.x, q.y))
				var cor := Color(0.427, 0.42, 0.4) if r["cor"] == "asfalto" else Color(0.545, 0.467, 0.349)
				draw_polyline(tela, cor, maxf(1.5, float(r["w"]) * k * 0.8), true)
			for p in main.mundo.predios:
				var ret: Rect2 = p["ret"]
				if Vector2(ret.get_center().x - jp.x, ret.get_center().y - jp.z).length_squared() > alc2 * 1.6:
					continue
				var a: Vector2 = hud._mini_pos(ret.position.x, ret.position.y)
				var rr := Rect2(a, ret.size * k)
				draw_rect(rr, Color(0.79, 0.83, 0.81) if p["tipo"] == "hospital" else Color(0.647, 0.624, 0.576))
				draw_rect(rr, Color(0.027, 0.039, 0.035), false, 1.0)
			# a base: cada peça construída
			var cs = main.construcao
			if cs != null:
				for pe in cs.pecas:
					if pe == null or not (pe is Dictionary) or not pe.has("xf") or pe.get("caiu", false):
						continue
					var o: Vector3 = (pe["xf"] as Transform3D).origin
					if Vector2(o.x - jp.x, o.z - jp.z).length_squared() > alc2:
						continue
					var q: Vector2 = hud._mini_pos(o.x, o.z)
					var tam := Dados.MODULO * k if bool(Dados.obra(str(pe["id"])).get("grade", false)) else 1.4 * k
					draw_rect(Rect2(q - Vector2(tam, tam) * 0.5, Vector2(tam, tam)), Color(0.627, 0.478, 0.29))
			# zumbis perto (pontos vermelhos)
			for z in main.zumbis:
				if not is_instance_valid(z) or z.estado == "morto":
					continue
				var zp: Vector3 = z.global_position
				if Vector2(zp.x - jp.x, zp.z - jp.z).length_squared() > Hud.ALCANCE_MINI * Hud.ALCANCE_MINI:
					continue
				draw_circle(hud._mini_pos(zp.x, zp.z), 2.4, Color(1.0, 0.29, 0.24), true, -1.0, true)
			for f in [0.36, 0.7]:
				draw_arc(c, c.x * f, 0.0, TAU, 48, Color(0.925, 0.894, 0.824, 0.11), 1.0, true)
		else:
			var r := c.x
			draw_arc(c, r - 2.5, 0.0, TAU, 72, Color(0.063, 0.07, 0.07, 0.75), 5.0, true)
			draw_arc(c, r - 5.2, 0.0, TAU, 72, Color(0.925, 0.894, 0.824, 0.32), 1.0, true)
			var fn := Estilo.fonte("titulo", 700)
			draw_string(fn, Vector2(c.x - 5.0, 20.0), "N", HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Estilo.BRASA)
			for m in hud.marcas():
				var q: Vector2 = hud._mini_pos(m["x"], m["z"])
				var dq := q - c
				if dq.length() > r - 7.0:
					q = c + dq.normalized() * (r - 7.0)
				draw_circle(q, 3.4, m["cor"], true, -1.0, true)
				draw_arc(q, 3.4, 0.0, TAU, 16, Color(0.027, 0.039, 0.035), 1.2, true)
			# você: a seta no meio, apontando para onde olha
			var fw: Vector3 = -main.jogador.global_transform.basis.z
			var ang := atan2(fw.x, -fw.z)
			var s := maxf(5.0, r * 0.13)
			var pts := PackedVector2Array([Vector2(0, -s), Vector2(s * 0.7, s * 0.7), Vector2(0, s * 0.25), Vector2(-s * 0.7, s * 0.7)])
			for i in pts.size():
				pts[i] = c + pts[i].rotated(ang)
			draw_colored_polygon(pts, Estilo.OSSO)
			var contorno := pts.duplicate()
			contorno.append(pts[0])
			draw_polyline(contorno, Color(0.027, 0.039, 0.035), 1.5, true)


## a fita da bússola
class Bussola extends Control:
	var hud
	const NOMES := {0: "N", 45: "NE", 90: "L", 135: "SE", 180: "S", 225: "SO", 270: "O", 315: "NO"}

	func _init(h) -> void:
		hud = h
		mouse_filter = Control.MOUSE_FILTER_IGNORE

	func _draw() -> void:
		if hud.main.jogador == null:
			return
		var rumo: float = hud.rumo()
		var cx := size.x * 0.5
		var meia := size.x * 0.5
		var ft := Estilo.fonte("titulo", 700)
		var fu := Estilo.fonte("ui", 800)
		for a in range(0, 360, 5):
			var d := wrapf(float(a) - rumo, -180.0, 180.0)
			var x := cx + d * Hud.PX_GRAU
			if absf(x - cx) > meia:
				continue
			var al := 1.0 - smoothstep(0.7, 1.0, absf(x - cx) / meia)
			var alto := 10.0 if a % 45 == 0 else (8.0 if a % 15 == 0 else 5.0)
			draw_line(Vector2(x, size.y - 2.0 - alto), Vector2(x, size.y - 2.0), Color(0.925, 0.894, 0.824, 0.8 * al), 1.0)
			if a % 45 == 0:
				var t: String = NOMES[a]
				var grande := a % 90 == 0
				var tam := 14 if grande else 12
				var f: Font = ft if grande else fu
				var w := f.get_string_size(t, HORIZONTAL_ALIGNMENT_LEFT, -1, tam).x
				var cor := Color(1, 1, 1, al) if a == 0 else Color(0.925, 0.894, 0.824, (1.0 if grande else 0.78) * al)
				draw_string(f, Vector2(x - w * 0.5 + 1, 14), t, HORIZONTAL_ALIGNMENT_LEFT, -1, tam, Color(0, 0, 0, 0.8 * al))
				draw_string(f, Vector2(x - w * 0.5, 13), t, HORIZONTAL_ALIGNMENT_LEFT, -1, tam, cor)
			elif a % 15 == 0:
				var tg := str(a)
				var wg := fu.get_string_size(tg, HORIZONTAL_ALIGNMENT_LEFT, -1, 10).x
				draw_string(fu, Vector2(x - wg * 0.5, 12), tg, HORIZONTAL_ALIGNMENT_LEFT, -1, 10, Color(0.925, 0.894, 0.824, 0.55 * al))
		# as marcas (cama, mochila caída) com a distância
		var jp: Vector3 = hud.main.jogador.global_position
		for m in hud.marcas():
			var d2 := wrapf(hud.rumo_para(m["x"], m["z"]) - rumo, -180.0, 180.0)
			var x2 := cx + d2 * Hud.PX_GRAU
			if absf(x2 - cx) > meia - 10.0:
				continue
			var ic := Estilo.icone(m["ico"], 14)
			if ic:
				draw_texture_rect(ic, Rect2(x2 - 7, 15, 14, 14), false, m["cor"])
			var dist := "%d" % roundi(Vector2(float(m["x"]) - jp.x, float(m["z"]) - jp.z).length())
			draw_string(fu, Vector2(x2 + 9, 27), dist, HORIZONTAL_ALIGNMENT_LEFT, -1, 9, Color(0.925, 0.894, 0.824, 0.9))
		draw_rect(Rect2(cx - 1.0, size.y - 16.0, 2.0, 15.0), Estilo.BRASA)


## a barra rápida (os 6 espaços da mão)
class BarraRapida extends Control:
	var hud
	const T := 46.0
	const E := 5.0
	var fundo: StyleBoxFlat
	var caixa: StyleBoxFlat
	var caixa_sel: StyleBoxFlat

	func _init(h) -> void:
		hud = h
		mouse_filter = Control.MOUSE_FILTER_IGNORE
		custom_minimum_size = Vector2(6.0 * T + 7.0 * E, T + 2.0 * E)
		fundo = Estilo.caixa(Color(0.063, 0.07, 0.075, 0.8), Color(0.925, 0.894, 0.824, 0.12), 8, 0)
		fundo.shadow_color = Color(0, 0, 0, 0.35)
		fundo.shadow_size = 10
		fundo.shadow_offset = Vector2(0, 5)
		caixa = Estilo.caixa(Color(0.133, 0.149, 0.157, 0.93), Color(0.925, 0.894, 0.824, 0.07), 4, 0)
		caixa_sel = Estilo.caixa(Color(0.29, 0.17, 0.095, 0.7), Color(1.0, 0.541, 0.239, 0.25), 4, 0)

	func _draw() -> void:
		var j = hud.main.jogador
		if j == null:
			return
		draw_style_box(fundo, Rect2(Vector2.ZERO, size))
		var ft := Estilo.fonte("titulo", 700)
		var fu := Estilo.fonte("ui", 800)
		for i in Inventario.BARRA:
			var r := Rect2(E + i * (T + E), E, T, T)
			var sel: bool = i == j.sel
			draw_style_box(caixa_sel if sel else caixa, r)
			var s = j.inv.slots[i]
			if s != null:
				var tex := Dados.icone_item(str(s["id"]))
				if tex:
					draw_texture_rect(tex, Rect2(r.position + Vector2(9, 7), Vector2(28, 28)), false)
				var n := int(s["n"])
				if n > 1:
					var tn := str(n)
					draw_string(fu, r.position + Vector2(1, T - 3), tn, HORIZONTAL_ALIGNMENT_RIGHT, T - 4, 11, Color(0, 0, 0, 0.9))
					draw_string(fu, r.position + Vector2(0, T - 4), tn, HORIZONTAL_ALIGNMENT_RIGHT, T - 4, 11, Estilo.OSSO)
				if s.has("dur"):
					var f := clampf(float(s["dur"]) / maxf(1.0, Armas.dur_max(str(s["id"]), s.get("q", 1))), 0.0, 1.0)
					var cor := Estilo.VERDE_DUR if f >= 0.35 else (Color(0.914, 0.773, 0.29) if f >= 0.15 else Color(0.886, 0.286, 0.227))
					var larg := T * 0.46
					var x := 0.0
					while x < larg:
						var w := minf(4.0, larg - x)
						var on := (x + w * 0.5) / larg <= f
						draw_rect(Rect2(r.position + Vector2(6.0 + x, T - 8.0), Vector2(w, 3.0)), cor if on else Color(0.925, 0.894, 0.824, 0.2))
						x += 6.0
			draw_string(ft, r.position + Vector2(5, 13), str(i + 1), HORIZONTAL_ALIGNMENT_LEFT, -1, 10, Color(0.925, 0.894, 0.824, 0.5))
			if sel:
				var c := Estilo.BRASA
				var a := r.grow(2.0)
				for canto in [a.position, Vector2(a.end.x, a.position.y), Vector2(a.position.x, a.end.y), a.end]:
					var sx := 1.0 if canto.x == a.position.x else -1.0
					var sy := 1.0 if canto.y == a.position.y else -1.0
					draw_rect(Rect2(Vector2(minf(canto.x, canto.x + sx * 10.0), minf(canto.y, canto.y + sy * 2.0)), Vector2(10, 2)), c)
					draw_rect(Rect2(Vector2(minf(canto.x, canto.x + sx * 2.0), minf(canto.y, canto.y + sy * 10.0)), Vector2(2, 10)), c)


## os ícones DayZ: sede (garrafa), fome (maçã) | vida (cruz); cada um enche de baixo para cima
class Vitais extends Control:
	var hud
	const T := 31.0
	const DESENHOS := {
		"sede": "M10 2.5h4v2.2l1.6 2.6c.3.5.4 1 .4 1.5V20a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 8 20V8.8c0-.5.1-1 .4-1.5L10 4.7z",
		"fome": "M12 7.6c-1.2-1.1-2.6-1.6-3.9-1.3C5.6 6.8 4.6 9.1 5 12c.6 4.4 3.3 8.6 5.5 8.6.6 0 1-.3 1.5-.3s.9.3 1.5.3c2.2 0 4.9-4.2 5.5-8.6.4-2.9-.6-5.2-3.1-5.7-1.3-.3-2.7.2-3.9 1.3zM12 7.4c0-1.9.9-3.6 2.6-4.6",
		"vida": "M9.2 3h5.6v6.2H21v5.6h-6.2V21H9.2v-6.2H3V9.2h6.2z",
	}
	var tex := {}
	var ult := {}
	var taxa := {}
	var _t0 := -1.0

	func _init(h) -> void:
		hud = h
		mouse_filter = Control.MOUSE_FILTER_IGNORE
		custom_minimum_size = Vector2(3.0 * T + 2.0 * 17.0 + 12.0, T + 14.0)
		for k in DESENHOS:
			var d: String = DESENHOS[k]
			var corpo := "M" + d.split("M", false)[0]
			tex[k] = [_svg("<path d=\"%s\" fill=\"none\" stroke=\"#ffffff\" stroke-width=\"1.7\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/>" % d),
				_svg("<path d=\"%s\" fill=\"#ffffff\" fill-opacity=\"0.9\"/>" % corpo)]

	func _svg(corpo: String) -> Texture2D:
		var img := Image.new()
		var txt := "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\">%s</svg>" % corpo
		if img.load_svg_from_string(txt, T * 2.0 / 24.0) != OK:
			return null
		img.resize(int(T), int(T), Image.INTERPOLATE_LANCZOS)
		return ImageTexture.create_from_image(img)

	func _draw() -> void:
		var j = hud.main.jogador
		if j == null:
			return
		var agora: float = hud._t
		var dt := clampf(agora - _t0, 0.0, 1.0) if _t0 >= 0.0 else 0.0
		_t0 = agora
		var vals := {"sede": float(j.sede), "fome": float(j.fome), "vida": float(j.vida)}
		var x := 0.0
		for k in ["sede", "fome", "vida"]:
			if k == "vida":
				# o tracinho que separa (no jogo antigo: sede, fome, temperatura | sono, vida)
				draw_rect(Rect2(x - 2.0, 2.0, 2.0, 28.0), Color(0.949, 0.937, 0.91, 0.8))
				x += 10.0
			var v: float = vals[k]
			var f := clampf(v / 100.0, 0.0, 1.0)
			var cor := Color(0.949, 0.937, 0.91)
			if f < 0.15:
				cor = Color(0.886, 0.286, 0.227, 0.6 + 0.4 * sin(agora * 7.0))
			elif f < 0.35:
				cor = Color(0.914, 0.773, 0.29)
			var par: Array = tex[k]
			var cheio: Texture2D = par[1]
			var contorno: Texture2D = par[0]
			# sombra para ler em cima do céu claro
			if contorno:
				draw_texture_rect(contorno, Rect2(x, 1.0, T, T), false, Color(0, 0, 0, 0.55))
			if cheio and f > 0.01:
				var h := T * f
				draw_texture_rect_region(cheio, Rect2(x, T - h, T, h), Rect2(0, cheio.get_height() * (1.0 - f), cheio.get_width(), cheio.get_height() * f), cor)
			if contorno:
				draw_texture_rect(contorno, Rect2(x, 0, T, T), false, cor)
			# tendência: setas quando sobe ou cai mais rápido que o normal (comendo, sarando, apanhando, passando fome)
			if dt > 0.0:
				if ult.has(k):
					var tx := clampf((v - float(ult[k])) / dt, -12.0, 12.0)
					taxa[k] = float(taxa.get(k, 0.0)) + (tx - float(taxa.get(k, 0.0))) * minf(1.0, dt * 0.9)
				ult[k] = v
			var t := float(taxa.get(k, 0.0))
			var n := 2 if absf(t) > 2.0 else (1 if absf(t) > 0.12 else 0)
			for a in n:
				var y0 := T + 4.0 + a * 5.0
				var cx := x + T * 0.5
				var pts := PackedVector2Array([Vector2(cx - 4.5, y0 + 3.5), Vector2(cx, y0), Vector2(cx + 4.5, y0 + 3.5)]) if t > 0.0 \
					else PackedVector2Array([Vector2(cx - 4.5, y0), Vector2(cx, y0 + 3.5), Vector2(cx + 4.5, y0)])
				draw_polyline(pts, cor, 1.8, true)
			x += T + 17.0


## o fôlego: o ícone de correr e a barra fina (amarela quando está acabando, vermelha quase no fim)
class Folego extends Control:
	var hud
	var cheio_t := 0.0

	func _init(h) -> void:
		hud = h
		mouse_filter = Control.MOUSE_FILTER_IGNORE

	func _draw() -> void:
		var j = hud.main.jogador
		if j == null:
			return
		var e := clampf(float(j.energia) / 100.0, 0.0, 1.0)
		cheio_t = cheio_t + 0.016 if e >= 0.995 else 0.0
		var al := 0.35 if cheio_t > 2.5 else 1.0
		var cor := Color(0.949, 0.937, 0.91, al)
		if e < 0.15:
			cor = Color(0.886, 0.286, 0.227, al)
		elif e < 0.35:
			cor = Color(0.914, 0.773, 0.29, al)
		var ic := Estilo.icone("correr", 17)
		if ic:
			draw_texture_rect(ic, Rect2(1, 1, 17, 17), false, Color(0, 0, 0, 0.6 * al))
			draw_texture_rect(ic, Rect2(0, 0, 17, 17), false, Color(0.949, 0.937, 0.91, al))
		var bar := Rect2(25, 7, 180, 3)
		draw_rect(bar, Color(1, 1, 1, 0.18 * al))
		draw_rect(Rect2(bar.position, Vector2(bar.size.x * e, bar.size.y)), cor)


## os tracinhos do desgaste do item da mão (5, verdes; amarelos e vermelhos quando está acabando)
class Tracos extends Control:
	var f := 1.0

	func _draw() -> void:
		var n := ceili(f * 5.0 - 0.0001)
		var cor := Estilo.VERDE_DUR if f >= 0.35 else (Color(0.914, 0.773, 0.29) if f >= 0.15 else Color(0.886, 0.286, 0.227))
		for k in 5:
			draw_rect(Rect2(k * 12.0, 3.0, 9.0, 3.0), cor if k < n else Color(0.925, 0.894, 0.824, 0.22))


## a mira com a luneta do rifle no olho
func j_luneta() -> bool:
	var j = main.jogador
	return j.vivo and str(j.item_mao().get("id", "")) == "rifle" and j.mira_k > 0.6 and not main.ui.aberto


## a mira: ponto claro com contorno escuro; no acerto fica vermelha e maior. Com arma de fogo, quatro tracinhos mostram quanto o
## tiro abre (mirando fecha, correndo abre); o tiro que acerta mostra um X (maior e vermelho na cabeça)
class Mira extends Control:
	var hud

	func _init(h) -> void:
		hud = h
		mouse_filter = Control.MOUSE_FILTER_IGNORE

	func _draw() -> void:
		var c := size * 0.5
		var acerto: bool = hud.acerto_t > 0.0
		var r := clampf(float(Ajustes.v["mira_tam"]), 1.5, 6.0) * (1.45 if acerto else 1.0)
		var j = hud.main.jogador
		var id := str(j.item_mao().get("id", ""))
		var cor_m: Color = Ajustes.cor_mira()
		var escuro := Color(0.04, 0.047, 0.043, 0.6)
		if Armas.de_fogo(id) and id != "besta":
			# a abertura do tiro em pixels (na altura da tela)
			var ab := Armas.abre(id, j.mira_k > 0.6, j._corre)
			var vp := get_viewport_rect().size
			var px := tan(maxf(ab, 0.002)) / tan(deg_to_rad(j.cam.fov) * 0.5) * vp.y * 0.5
			var g := clampf(px, 6.0, 90.0) * lerpf(1.0, 0.75, j.mira_k)
			for v in [Vector2(1, 0), Vector2(-1, 0), Vector2(0, 1), Vector2(0, -1)]:
				draw_line(c + v * g, c + v * (g + 7.0), escuro, 3.5, true)
				draw_line(c + v * g, c + v * (g + 7.0), cor_m, 1.6, true)
			r = minf(r, 2.2)
		if acerto and (Armas.de_fogo(id) or id == "arco"):
			var cab: bool = hud.acerto_cab
			var k := 9.0 if cab else 6.5
			var cx := Estilo.SANGUE if cab else Color(0.95, 0.92, 0.85)
			for v in [Vector2(1, 1), Vector2(-1, 1), Vector2(1, -1), Vector2(-1, -1)]:
				draw_line(c + v * 4.0, c + v * (4.0 + k), escuro, 3.5, true)
				draw_line(c + v * 4.0, c + v * (4.0 + k), cx, 1.8, true)
			acerto = false
		draw_circle(c, r + 1.5, escuro, true, -1.0, true)
		draw_circle(c, r, Estilo.SANGUE if acerto else cor_m, true, -1.0, true)


## a luneta do rifle: tudo escuro fora do círculo, o retículo fino no meio e a borda do vidro
class Luneta extends Control:
	var hud

	func _init(h) -> void:
		hud = h
		mouse_filter = Control.MOUSE_FILTER_IGNORE

	func _draw() -> void:
		var sz := size
		var c := sz * 0.5
		var r := minf(sz.x, sz.y) * 0.46
		var preto := Color(0.0, 0.0, 0.0, 1.0)
		# fora do círculo: preto (faixas dos lados e um anel grosso)
		draw_rect(Rect2(0, 0, c.x - r + 1.0, sz.y), preto)
		draw_rect(Rect2(c.x + r - 1.0, 0, sz.x - (c.x + r - 1.0), sz.y), preto)
		draw_arc(c, r + 400.0, 0.0, TAU, 96, preto, 800.0, true)
		# a sombra da borda do vidro
		draw_arc(c, r - 6.0, 0.0, TAU, 96, Color(0, 0, 0, 0.45), 12.0, true)
		# o retículo: linhas finas com o meio aberto e as pontas grossas
		var fino := Color(0.02, 0.02, 0.02, 0.92)
		draw_line(Vector2(c.x - r, c.y), Vector2(c.x - 18.0, c.y), fino, 1.4, true)
		draw_line(Vector2(c.x + 18.0, c.y), Vector2(c.x + r, c.y), fino, 1.4, true)
		draw_line(Vector2(c.x, c.y - r), Vector2(c.x, c.y - 18.0), fino, 1.4, true)
		draw_line(Vector2(c.x, c.y + 18.0), Vector2(c.x, c.y + r), fino, 1.4, true)
		draw_line(Vector2(c.x - r, c.y), Vector2(c.x - r * 0.55, c.y), fino, 5.0, true)
		draw_line(Vector2(c.x + r * 0.55, c.y), Vector2(c.x + r, c.y), fino, 5.0, true)
		draw_line(Vector2(c.x, c.y + r * 0.55), Vector2(c.x, c.y + r), fino, 5.0, true)
		draw_circle(c, 1.6, Color(0.85, 0.12, 0.08, 0.95), true, -1.0, true)
		if hud.acerto_t > 0.0:
			var cx := Estilo.SANGUE if hud.acerto_cab else Color(0.95, 0.92, 0.85)
			for v in [Vector2(1, 1), Vector2(-1, 1), Vector2(1, -1), Vector2(-1, -1)]:
				draw_line(c + v * 6.0, c + v * 16.0, cx, 2.0, true)


## o arco vermelho em volta do meio da tela, do lado de onde veio o golpe
class SetaDano extends Control:
	var hud

	func _init(h) -> void:
		hud = h
		mouse_filter = Control.MOUSE_FILTER_IGNORE
		visible = false

	func _draw() -> void:
		var a: float = clampf(hud.dano_t / 1.2, 0.0, 1.0)
		if a <= 0.0:
			return
		var c := size * 0.5
		var r := minf(size.x, size.y) * 0.32
		var ang: float = hud.dano_ang - PI * 0.5
		draw_arc(c, r, ang - 0.38, ang + 0.38, 24, Color(0.86, 0.18, 0.125, 0.85 * a), 7.0, true)
