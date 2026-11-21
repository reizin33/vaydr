class_name TelaCriacao
extends Control
## A criação do personagem, como a do jogo antigo (48z_criacao.js, 62za_criacao_corpo.js e 62zb_mh.js): o personagem de verdade no
## palco (a clareira no começo da noite, a fogueira atrás), as abas à esquerda (Rosto, Cabelo, Corpo, Roupas e Acessórios) com as
## miniaturas de cada escolha, à direita o retrato, o nome e o resumo, e embaixo Voltar, a câmera (frente, costas, lado, girar,
## aproximar e resetar) e o Salvar (ou Confirmar e iniciar, quando vem do primeiro mundo).
## · Tipo de corpo: o Sobrevivente (pronto: homem de cueca, cabelo grisalho, sem barba) ou o Personalizado (homem ou mulher,
##   pele, olhos, sobrancelha, cabelo e barba). Mexendo no rosto, no cabelo ou no corpo do Sobrevivente, ele vira Personalizado.
## · A aparência fica no perfil (vale para os mundos dele) com o retrato, que aparece no cartão do perfil.
## · Começa de cueca (ou biquíni) e de mãos vazias: roupa e equipamento você acha ou fabrica no jogo.

const ABAS := [["rosto", "Rosto", "cr-rosto"], ["cabelo", "Cabelo", "cr-cabelo"], ["corpo", "Corpo", "cr-corpo"],
	["roupas", "Roupas", "cr-roupas"], ["acess", "Acessórios", "cr-acess"]]
const ACHADAS := ["camiseta", "camisaLeve", "calcaCargo", "botasTrilha", "cinto", "colete", "luvasCouro", "casacoGrande"]
const ACESS := ["mochilaPequena", "bone", "bandana", "mascaraPano", "mascaraGas", "gorroPele"]
const ESCURO := Color(0.043, 0.051, 0.055)

var telas
var main
var ap := {}
var aba := "rosto"
var ao_confirmar := Callable()
var volta := "lobby"
var nav := {}
var opcoes: VBoxContainer
var rolagem: ScrollContainer
var resumo: VBoxContainer
var nome: LineEdit
var retrato: TextureRect
var foco: Control
var bt_ok: Button
var vistas := {}
var bt_girar: Button
var bt_zoom: Button
var dica: Label
var _ui_antes := false


func _init(t) -> void:
	telas = t
	main = t.main
	name = "criacao"
	set_anchors_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	visible = false


func _ready() -> void:
	_montar()


# ================================================================ montagem da tela
func _painel(raio := 14, margem := 14) -> PanelContainer:
	var p := PanelContainer.new()
	var s := Estilo.caixa(Color(0.043, 0.051, 0.055, 0.82), Estilo.BORDA, raio, margem)
	s.shadow_color = Color(0, 0, 0, 0.35)
	s.shadow_size = 14
	p.add_theme_stylebox_override("panel", s)
	return p


func _montar() -> void:
	# véu escuro nas beiradas (o palco fica claro no meio, os painéis leem bem)
	var veu := ColorRect.new()
	veu.set_anchors_preset(Control.PRESET_FULL_RECT)
	veu.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var sh := Shader.new()
	sh.code = """shader_type canvas_item;
void fragment() {
	float x = abs(UV.x - 0.5) * 2.0;
	float a = smoothstep(0.35, 1.0, x) * 0.55 + smoothstep(0.75, 1.0, UV.y) * 0.45 + (1.0 - smoothstep(0.0, 0.16, UV.y)) * 0.35;
	COLOR = vec4(0.02, 0.025, 0.027, clamp(a, 0.0, 0.85));
}"""
	var mt := ShaderMaterial.new()
	mt.shader = sh
	veu.material = mt
	add_child(veu)
	# o palco: arrastar gira, a rodinha aproxima
	foco = Control.new()
	foco.mouse_filter = Control.MOUSE_FILTER_STOP
	foco.mouse_default_cursor_shape = Control.CURSOR_DRAG
	add_child(foco)
	Estilo.encher(foco, Vector2(0, 0), Vector2(1, 1), Vector2(470, 84), Vector2(-272, -78))
	foco.gui_input.connect(_foco_input)
	dica = Estilo.rotulo("Arraste para girar · role para aproximar", 12, Color(0.925, 0.894, 0.824, 0.55), "ui", 600)
	dica.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	dica.mouse_filter = Control.MOUSE_FILTER_IGNORE
	foco.add_child(dica)
	Estilo.encher(dica, Vector2(0, 1), Vector2(1, 1), Vector2(0, -24), Vector2(0, -4))
	# topo: a marca e o título
	var topo := HBoxContainer.new()
	topo.add_theme_constant_override("separation", 18)
	topo.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(topo)
	Estilo.encher(topo, Vector2(0, 0), Vector2(1, 0), Vector2(22, 18), Vector2(-22, 76))
	var marca := VBoxContainer.new()
	marca.add_theme_constant_override("separation", 0)
	marca.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	marca.add_child(Estilo.rotulo("VAYDR", 36, Estilo.OSSO, "titulo", 700, 3))
	marca.add_child(Estilo.rotulo("SOBREVIVA AO QUE VEM DEPOIS", 10, Estilo.CINZA, "ui", 800, 2))
	topo.add_child(marca)
	var tr := ColorRect.new()
	tr.color = Estilo.BORDA_ALTA
	tr.custom_minimum_size = Vector2(1, 44)
	tr.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	topo.add_child(tr)
	var tt := VBoxContainer.new()
	tt.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	tt.add_theme_constant_override("separation", 2)
	tt.add_child(Estilo.rotulo("CRIAÇÃO DE PERSONAGEM", 19, Estilo.OSSO, "ui", 800, 2))
	tt.add_child(Estilo.rotulo("Personalize seu sobrevivente. Sua jornada começa aqui.", 13, Estilo.CINZA, "ui", 500))
	topo.add_child(tt)
	# as abas (trilho à esquerda)
	var trilho := _painel(14, 7)
	add_child(trilho)
	Estilo.encher(trilho, Vector2(0, 0), Vector2(0, 1), Vector2(16, 94), Vector2(104, -78))
	var tv := VBoxContainer.new()
	tv.add_theme_constant_override("separation", 6)
	trilho.add_child(tv)
	for a in ABAS:
		var b := _bt_aba(str(a[1]), str(a[2]))
		b.pressed.connect(_ir_aba.bind(str(a[0])))
		tv.add_child(b)
		nav[a[0]] = b
	# as opções
	var po := _painel(14, 0)
	add_child(po)
	Estilo.encher(po, Vector2(0, 0), Vector2(0, 1), Vector2(114, 94), Vector2(460, -78))
	rolagem = ScrollContainer.new()
	rolagem.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	po.add_child(rolagem)
	var mg := MarginContainer.new()
	mg.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	for k in ["margin_left", "margin_right"]:
		mg.add_theme_constant_override(k, 18)
	mg.add_theme_constant_override("margin_top", 16)
	mg.add_theme_constant_override("margin_bottom", 18)
	rolagem.add_child(mg)
	opcoes = VBoxContainer.new()
	opcoes.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	opcoes.add_theme_constant_override("separation", 14)
	mg.add_child(opcoes)
	# o lado direito: retrato, nome, resumo, aleatório e o aviso
	var pl := _painel(14, 16)
	add_child(pl)
	Estilo.encher(pl, Vector2(1, 0), Vector2(1, 1), Vector2(-258, 16), Vector2(-16, -78))
	var lv := VBoxContainer.new()
	lv.add_theme_constant_override("separation", 10)
	pl.add_child(lv)
	var rc := CenterContainer.new()
	lv.add_child(rc)
	retrato = TextureRect.new()
	retrato.custom_minimum_size = Vector2(96, 96)
	retrato.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	retrato.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	var rsh := Shader.new()
	rsh.code = """shader_type canvas_item;
void fragment() {
	vec2 d = UV - vec2(0.5);
	float r = length(d);
	vec4 c = texture(TEXTURE, UV);
	float borda = smoothstep(0.455, 0.47, r) * (1.0 - smoothstep(0.485, 0.5, r));
	c.rgb = mix(c.rgb, vec3(0.925, 0.894, 0.824), borda * 0.5);
	c.a *= 1.0 - smoothstep(0.485, 0.5, r);
	COLOR = c;
}"""
	var rm := ShaderMaterial.new()
	rm.shader = rsh
	retrato.material = rm
	rc.add_child(retrato)
	lv.add_child(Estilo.rotulo("NOME DO SOBREVIVENTE", 11, Estilo.CINZA, "ui", 800, 2))
	nome = LineEdit.new()
	nome.max_length = 20
	nome.placeholder_text = "Sobrevivente"
	nome.custom_minimum_size = Vector2(0, 40)
	nome.add_theme_font_size_override("font_size", 16)
	nome.text_changed.connect(func(_t): _resumo())
	lv.add_child(nome)
	var sep := Control.new()
	sep.custom_minimum_size = Vector2(0, 2)
	lv.add_child(sep)
	lv.add_child(Estilo.rotulo("SEU SOBREVIVENTE", 11, Estilo.CINZA, "ui", 800, 2))
	resumo = VBoxContainer.new()
	resumo.add_theme_constant_override("separation", 9)
	lv.add_child(resumo)
	var ba := Button.new()
	ba.text = "GERAR APARÊNCIA ALEATÓRIA"
	ba.icon = Estilo.icone("cr-dado", 20)
	ba.focus_mode = Control.FOCUS_NONE
	ba.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	ba.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	ba.add_theme_font_override("font", Estilo.fonte("ui", 800, 1))
	ba.add_theme_font_size_override("font_size", 12)
	ba.add_theme_stylebox_override("normal", Estilo.caixa(Color(1, 1, 1, 0.03), Estilo.BORDA_ALTA, 8, 10))
	ba.add_theme_stylebox_override("hover", Estilo.caixa(Color(1, 1, 1, 0.08), Estilo.OSSO, 8, 10))
	ba.add_theme_stylebox_override("pressed", Estilo.caixa(Color(1, 1, 1, 0.08), Estilo.BRASA, 8, 10))
	ba.pressed.connect(_aleatorio)
	lv.add_child(ba)
	var info := PanelContainer.new()
	info.add_theme_stylebox_override("panel", Estilo.caixa(Color(1, 1, 1, 0.025), Estilo.BORDA, 10, 12))
	var ih := HBoxContainer.new()
	ih.add_theme_constant_override("separation", 10)
	info.add_child(ih)
	var ii := TextureRect.new()
	ii.texture = Estilo.icone("cr-info", 18)
	ii.modulate = Estilo.CINZA
	ii.size_flags_vertical = Control.SIZE_SHRINK_BEGIN
	ih.add_child(ii)
	var it := Estilo.rotulo("Esta aparência fica no seu perfil e vale para os seus mundos. Roupas e equipamentos você troca no jogo, pela mochila.", 12, Estilo.CINZA, "ui", 500)
	it.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	it.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	ih.add_child(it)
	lv.add_child(info)
	# rodapé: voltar, a câmera e o salvar
	var bv := Estilo.botao("Voltar")
	bv.icon = Estilo.icone("cr-voltar", 18)
	bv.add_theme_stylebox_override("normal", Estilo.caixa(Color(0.043, 0.051, 0.055, 0.85), Estilo.BORDA_ALTA, 8, 16))
	bv.add_theme_stylebox_override("hover", Estilo.caixa(Color(0.1, 0.11, 0.115, 0.9), Estilo.OSSO, 8, 16))
	bv.pressed.connect(_voltar)
	add_child(bv)
	Estilo.encher(bv, Vector2(0, 1), Vector2(0, 1), Vector2(16, -66), Vector2(166, -16))
	var cam := HBoxContainer.new()
	cam.add_theme_constant_override("separation", 12)
	add_child(cam)
	Estilo.prender(cam, 0.5, 1.0, 0, -66, Control.GROW_DIRECTION_BOTH, Control.GROW_DIRECTION_END)
	var pv := PanelContainer.new()
	pv.add_theme_stylebox_override("panel", Estilo.caixa(Color(0.043, 0.051, 0.055, 0.85), Estilo.BORDA, 24, 4))
	cam.add_child(pv)
	var hv := HBoxContainer.new()
	hv.add_theme_constant_override("separation", 2)
	pv.add_child(hv)
	for v in [["frente", "Frente"], ["costas", "Costas"], ["lado", "Lado"]]:
		var b := _chip(str(v[1]).to_upper())
		b.pressed.connect(_vista.bind(str(v[0])))
		hv.add_child(b)
		vistas[v[0]] = b
	var pf := PanelContainer.new()
	pf.add_theme_stylebox_override("panel", Estilo.caixa(Color(0.043, 0.051, 0.055, 0.85), Estilo.BORDA, 24, 4))
	cam.add_child(pf)
	var hf := HBoxContainer.new()
	hf.add_theme_constant_override("separation", 2)
	pf.add_child(hf)
	bt_girar = _chip("", "cr-girar")
	bt_girar.tooltip_text = "Girar sozinho"
	bt_girar.pressed.connect(func():
		main.palco.girar = not main.palco.girar
		_marcar_camera())
	hf.add_child(bt_girar)
	bt_zoom = _chip("", "cr-zoom")
	bt_zoom.tooltip_text = "Aproximar"
	bt_zoom.pressed.connect(func():
		main.palco.zoom_alvo = 0.0 if main.palco.zoom_alvo > 0.5 else 1.0
		_marcar_camera())
	hf.add_child(bt_zoom)
	var br := _chip("", "cr-reset")
	br.tooltip_text = "Resetar a câmera"
	br.pressed.connect(func():
		main.palco.girar = false
		main.palco.vista("frente")
		main.palco.zoom_alvo = 1.0 if aba in ["rosto", "cabelo"] else 0.0
		_marcar_camera())
	hf.add_child(br)
	bt_ok = Estilo.botao("Salvar personagem", true)
	bt_ok.icon = Estilo.icone("cr-ok", 18)
	bt_ok.icon_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	bt_ok.pressed.connect(_confirmar)
	add_child(bt_ok)
	Estilo.encher(bt_ok, Vector2(1, 1), Vector2(1, 1), Vector2(-258, -66), Vector2(-16, -16))


func _bt_aba(txt: String, ico: String) -> Button:
	var b := Button.new()
	b.toggle_mode = true
	b.focus_mode = Control.FOCUS_NONE
	b.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	b.custom_minimum_size = Vector2(74, 70)
	b.icon = Estilo.icone(ico, 22)
	b.icon_alignment = HORIZONTAL_ALIGNMENT_CENTER
	b.vertical_icon_alignment = VERTICAL_ALIGNMENT_TOP
	b.text = txt.to_upper()
	b.add_theme_font_override("font", Estilo.fonte("ui", 800, 1))
	b.add_theme_font_size_override("font_size", 10)
	b.add_theme_color_override("font_color", Estilo.CINZA)
	b.add_theme_color_override("font_hover_color", Estilo.OSSO)
	b.add_theme_color_override("font_pressed_color", ESCURO)
	b.add_theme_color_override("font_hover_pressed_color", ESCURO)
	b.add_theme_color_override("icon_normal_color", Estilo.CINZA)
	b.add_theme_color_override("icon_hover_color", Estilo.OSSO)
	b.add_theme_color_override("icon_pressed_color", ESCURO)
	b.add_theme_color_override("icon_hover_pressed_color", ESCURO)
	var n := Estilo.caixa(Color(0, 0, 0, 0), Color(0, 0, 0, 0), 10, 6)
	n.content_margin_top = 12
	var h := Estilo.caixa(Color(1, 1, 1, 0.05), Color(0, 0, 0, 0), 10, 6)
	h.content_margin_top = 12
	var p := Estilo.caixa(Estilo.OSSO, Color(0, 0, 0, 0), 10, 6)
	p.content_margin_top = 12
	b.add_theme_stylebox_override("normal", n)
	b.add_theme_stylebox_override("hover", h)
	b.add_theme_stylebox_override("pressed", p)
	b.add_theme_stylebox_override("hover_pressed", p)
	b.add_theme_stylebox_override("focus", StyleBoxEmpty.new())
	return b


func _chip(txt: String, ico := "") -> Button:
	var b := Button.new()
	b.toggle_mode = true
	b.focus_mode = Control.FOCUS_NONE
	b.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	b.text = txt
	if ico != "":
		b.icon = Estilo.icone(ico, 18)
		b.custom_minimum_size = Vector2(42, 38)
		b.icon_alignment = HORIZONTAL_ALIGNMENT_CENTER
	else:
		b.custom_minimum_size = Vector2(74, 38)
	b.add_theme_font_override("font", Estilo.fonte("ui", 800, 1))
	b.add_theme_font_size_override("font_size", 12)
	b.add_theme_color_override("font_color", Estilo.CINZA)
	b.add_theme_color_override("font_hover_color", Estilo.OSSO)
	b.add_theme_color_override("font_pressed_color", ESCURO)
	b.add_theme_color_override("font_hover_pressed_color", ESCURO)
	b.add_theme_color_override("icon_normal_color", Estilo.CINZA)
	b.add_theme_color_override("icon_hover_color", Estilo.OSSO)
	b.add_theme_color_override("icon_pressed_color", ESCURO)
	b.add_theme_color_override("icon_hover_pressed_color", ESCURO)
	b.add_theme_stylebox_override("normal", Estilo.caixa(Color(0, 0, 0, 0), Color(0, 0, 0, 0), 19, 8))
	b.add_theme_stylebox_override("hover", Estilo.caixa(Color(1, 1, 1, 0.06), Color(0, 0, 0, 0), 19, 8))
	b.add_theme_stylebox_override("pressed", Estilo.caixa(Estilo.OSSO, Color(0, 0, 0, 0), 19, 8))
	b.add_theme_stylebox_override("hover_pressed", Estilo.caixa(Estilo.OSSO, Color(0, 0, 0, 0), 19, 8))
	b.add_theme_stylebox_override("focus", StyleBoxEmpty.new())
	return b


## uma escolha com a miniatura (pele, olhos, sobrancelha, cabelo, barba): a escolhida ganha a borda clara
func _ladrilho(tex: Texture2D, dica_txt: String, escolhido: bool, f: Callable, legenda := "", ico := "") -> Button:
	var b := Button.new()
	b.custom_minimum_size = Vector2(56, 56)
	b.focus_mode = Control.FOCUS_NONE
	b.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	b.tooltip_text = dica_txt
	b.clip_contents = true
	var bd := Estilo.OSSO if escolhido else Color(1, 1, 1, 0.08)
	var n := Estilo.caixa(Color(0.07, 0.08, 0.085), bd, 9, 0, 2 if escolhido else 1)
	var h := Estilo.caixa(Color(0.09, 0.1, 0.105), Estilo.OSSO if escolhido else Estilo.BORDA_ALTA, 9, 0, 2 if escolhido else 1)
	b.add_theme_stylebox_override("normal", n)
	b.add_theme_stylebox_override("hover", h)
	b.add_theme_stylebox_override("pressed", h)
	b.add_theme_stylebox_override("focus", StyleBoxEmpty.new())
	if tex != null:
		var tr := TextureRect.new()
		tr.texture = tex
		tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
		tr.mouse_filter = Control.MOUSE_FILTER_IGNORE
		b.add_child(tr)
		Estilo.encher(tr, Vector2(0, 0), Vector2(1, 1), Vector2(3, 3), Vector2(-3, -3))
	else:
		var v := VBoxContainer.new()
		v.alignment = BoxContainer.ALIGNMENT_CENTER
		v.mouse_filter = Control.MOUSE_FILTER_IGNORE
		v.add_theme_constant_override("separation", 3)
		b.add_child(v)
		Estilo.encher(v, Vector2(0, 0), Vector2(1, 1), Vector2(2, 4), Vector2(-2, -4))
		if ico != "":
			var ic := TextureRect.new()
			ic.texture = Estilo.icone(ico, 20)
			ic.stretch_mode = TextureRect.STRETCH_KEEP_CENTERED
			ic.mouse_filter = Control.MOUSE_FILTER_IGNORE
			ic.modulate = Estilo.CINZA
			v.add_child(ic)
		var l := Estilo.rotulo(legenda, 11, Estilo.OSSO, "ui", 700)
		l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		v.add_child(l)
	b.pressed.connect(f)
	return b


## cartão de texto (tipo de corpo, homem e mulher, altura): ícone em cima e o nome embaixo
func _cartao(txt: String, ico: String, escolhido: bool, f: Callable, alto := 74, larg := 0) -> Button:
	var b := Button.new()
	b.custom_minimum_size = Vector2(larg, alto)
	b.size_flags_horizontal = Control.SIZE_EXPAND_FILL if larg == 0 else Control.SIZE_SHRINK_BEGIN
	b.focus_mode = Control.FOCUS_NONE
	b.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	b.icon = Estilo.icone(ico, 22)
	b.icon_alignment = HORIZONTAL_ALIGNMENT_CENTER
	b.vertical_icon_alignment = VERTICAL_ALIGNMENT_TOP
	b.text = txt
	b.add_theme_font_override("font", Estilo.fonte("ui", 800))
	b.add_theme_font_size_override("font_size", 12)
	b.add_theme_color_override("font_color", Estilo.OSSO)
	b.add_theme_color_override("font_hover_color", Estilo.OSSO)
	var bd := Estilo.OSSO if escolhido else Color(1, 1, 1, 0.08)
	var n := Estilo.caixa(Color(0.07, 0.08, 0.085), bd, 9, 6, 2 if escolhido else 1)
	n.content_margin_top = 10
	var h := Estilo.caixa(Color(0.09, 0.1, 0.105), Estilo.OSSO if escolhido else Estilo.BORDA_ALTA, 9, 6, 2 if escolhido else 1)
	h.content_margin_top = 10
	b.add_theme_stylebox_override("normal", n)
	b.add_theme_stylebox_override("hover", h)
	b.add_theme_stylebox_override("pressed", h)
	b.add_theme_stylebox_override("focus", StyleBoxEmpty.new())
	b.pressed.connect(f)
	return b


func _secao(titulo: String, valor: String) -> VBoxContainer:
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 10)
	var h := HBoxContainer.new()
	h.add_child(Estilo.rotulo(titulo.to_upper(), 13, Estilo.OSSO, "ui", 800, 2))
	var e := Control.new()
	e.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	h.add_child(e)
	h.add_child(Estilo.rotulo(valor, 12, Estilo.CINZA, "ui", 600))
	v.add_child(h)
	return v


func _linha() -> ColorRect:
	var l := ColorRect.new()
	l.color = Color(1, 1, 1, 0.07)
	l.custom_minimum_size = Vector2(0, 1)
	return l


func _texto(t: String) -> Label:
	var l := Estilo.rotulo(t, 13, Estilo.CINZA, "ui", 500)
	l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	l.custom_minimum_size = Vector2(300, 0)
	return l


func _grade() -> HFlowContainer:
	var g := HFlowContainer.new()
	g.add_theme_constant_override("h_separation", 7)
	g.add_theme_constant_override("v_separation", 7)
	return g


# ================================================================ abrir, abas e escolhas
## abre com a aparência do perfil (ou o Sobrevivente); f: o que fazer no Confirmar (o primeiro mundo)
func abrir(f := Callable(), de := "lobby") -> void:
	ao_confirmar = f
	volta = de
	ap = Corpo.limpa(Perfis.atual.get("ap", {}))
	if str(ap.get("nome", "")) == "":
		ap["nome"] = str(Perfis.atual.get("nome", ""))
	nome.text = str(ap["nome"])
	bt_ok.text = "CONFIRMAR E INICIAR" if f.is_valid() else "SALVAR PERSONAGEM"
	main.get_viewport().disable_3d = false
	# o HUD do jogo (se tiver um mundo aberto atrás) não aparece na criação
	_ui_antes = main.ui.visible
	main.ui.visible = false
	main.palco.abrir(ap)
	retrato.texture = main.palco.retrato_vp.get_texture()
	_ir_aba("rosto")


func fechar() -> void:
	main.palco.fechar()
	main.ui.visible = _ui_antes
	if not main.em_jogo:
		main.get_viewport().disable_3d = true


func _ir_aba(a: String) -> void:
	aba = a
	for k in nav:
		(nav[k] as Button).set_pressed_no_signal(k == a)
	# rosto e cabelo: a câmera chega perto do rosto; corpo, roupas e acessórios: o corpo inteiro
	main.palco.zoom_alvo = 1.0 if a in ["rosto", "cabelo"] else 0.0
	_painel_opcoes()
	rolagem.scroll_vertical = 0
	_resumo()
	_marcar_camera()


func _painel_opcoes() -> void:
	for c in opcoes.get_children():
		c.queue_free()
	var m := Corpo.mh_de(ap)
	var g := str(m["g"])
	var surv := str(ap["corpo"]) != "mh"
	if aba in ["rosto", "cabelo", "corpo"]:
		var s := _secao("Tipo de corpo", "Sobrevivente" if surv else "Personalizado")
		var h := HBoxContainer.new()
		h.add_theme_constant_override("separation", 8)
		h.add_child(_cartao("Sobrevivente", "cr-corpo", surv, _tipo.bind("sobrevivente")))
		h.add_child(_cartao("Personalizado", "cr-corpo", not surv, _tipo.bind("mh")))
		s.add_child(h)
		s.add_child(_texto("Pronto para jogar: homem de cueca, cabelo grisalho, sem barba. Mexendo no rosto, no cabelo ou no corpo, ele vira Personalizado." if surv
			else "Um personagem de verdade montado do seu jeito: homem ou mulher, pele, olhos, sobrancelha, cabelo e barba. Começa de cueca ou biquíni; as roupas vêm do jogo."))
		opcoes.add_child(s)
		opcoes.add_child(_linha())
	match aba:
		"rosto":
			_secao_mh("Pele e rosto", "pele", m)
			_secao_mh("Olhos", "olhos", m)
			_secao_mh("Sobrancelhas", "sobr", m)
			if g == "homem":
				_secao_mh("Barba", "barba", m)
		"cabelo":
			_secao_mh("Cabelo", "cabelo", m)
		"corpo":
			var s := _secao("Corpo", Corpo.nome_op("g", g, g))
			var h := HBoxContainer.new()
			h.add_theme_constant_override("separation", 8)
			h.add_child(_cartao("Homem", "cr-corpo", g == "homem", _mudar.bind("g", "homem")))
			h.add_child(_cartao("Mulher", "cr-corpo", g == "mulher", _mudar.bind("g", "mulher")))
			s.add_child(h)
			opcoes.add_child(s)
			opcoes.add_child(_linha())
			var sa := _secao("Altura", Corpo.altura_txt(ap, int(ap["altura"])))
			var ga := _grade()
			for i in Corpo.ALTURAS.size():
				ga.add_child(_cartao(Corpo.altura_txt(ap, i), "cr-corpo", int(ap["altura"]) == i, _altura.bind(i), 72, 56))
			sa.add_child(ga)
			opcoes.add_child(sa)
		"roupas":
			var s := _secao("Roupas", "biquíni" if g == "mulher" else "cueca")
			s.add_child(_texto(("Ela começa de biquíni" if g == "mulher" else "Ele começa de cueca") + ", descalço e de mãos vazias. Calça, camisa, casaco, botas, gorro, luvas e cinto você acha ou fabrica no jogo, e aparecem no corpo quando vestidos."))
			opcoes.add_child(s)
			opcoes.add_child(_linha())
			var s2 := _secao("Achadas no mundo", "")
			s2.add_child(_texto("Casas, lojas, armários e acampamentos guardam roupas. Vista pela mochila: a peça aparece no corpo na hora e a que você tirou volta para a mochila."))
			s2.add_child(_lista_itens(ACHADAS))
			opcoes.add_child(s2)
			opcoes.add_child(_linha())
			var s3 := _secao("Feitas por você", "")
			s3.add_child(_texto("Couro curtido na estação vira jaqueta, calças, botas, luvas e mochilas melhores."))
			opcoes.add_child(s3)
		"acess":
			var s := _secao("Nenhum acessório inicial", "")
			s.add_child(_texto("Você começa sem mochila, boné, máscara ou ferramenta. Tudo isso aparece durante a exploração:"))
			s.add_child(_lista_itens(ACESS))
			opcoes.add_child(s)


func _secao_mh(titulo: String, campo: String, m: Dictionary) -> void:
	var g := str(m["g"])
	var v := str(m.get(campo, ""))
	var s := _secao(titulo, Corpo.nome_op(campo, v, g))
	var gr := _grade()
	if Corpo.VAZIO.has(campo) and not (campo == "barba" and g == "mulher"):
		gr.add_child(_ladrilho(null, str(Corpo.VAZIO[campo]), v == "", _mudar.bind(campo, ""), str(Corpo.VAZIO[campo]), "x"))
	for k in Corpo.lista(campo, g):
		gr.add_child(_ladrilho(Corpo.miniatura(campo, str(k)), Corpo.nome_op(campo, str(k), g), v == str(k), _mudar.bind(campo, str(k))))
	s.add_child(gr)
	opcoes.add_child(s)
	opcoes.add_child(_linha())


func _lista_itens(ids: Array) -> VBoxContainer:
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 6)
	for id in ids:
		var d := Dados.item(str(id))
		if d.is_empty():
			continue
		var h := HBoxContainer.new()
		h.add_theme_constant_override("separation", 10)
		var ic := TextureRect.new()
		ic.texture = Dados.icone_item(str(id))
		ic.custom_minimum_size = Vector2(28, 28)
		ic.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		ic.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		h.add_child(ic)
		var l := Estilo.rotulo(str(d.get("nome", id)), 13, Estilo.OSSO, "ui", 600)
		l.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		h.add_child(l)
		v.add_child(h)
	return v


func _redesenhar() -> void:
	var y := rolagem.scroll_vertical
	_painel_opcoes()
	_resumo()
	main.palco.trocar(ap)
	await get_tree().process_frame
	rolagem.scroll_vertical = y


func _tipo(c: String) -> void:
	if str(ap["corpo"]) == c:
		return
	var atual_mh := Corpo.mh_de(ap)
	ap["corpo"] = c
	if c == "mh":
		ap["mh"] = atual_mh
	_redesenhar()


## mexeu numa escolha: o Sobrevivente vira Personalizado (com o que ele tinha)
func _mudar(campo: String, v: String) -> void:
	var m := Corpo.mh_de(ap)
	if campo == "g":
		if str(m["g"]) == v:
			return
		m = Corpo.padrao(v)
	else:
		if str(m.get(campo, "")) == v:
			return
		m[campo] = v
	ap["corpo"] = "mh"
	ap["mh"] = Corpo.limpa_mh(m)
	_redesenhar()


func _altura(i: int) -> void:
	if int(ap["altura"]) == i:
		return
	ap["altura"] = i
	_redesenhar()


## sorteia o personalizado (mantém homem ou mulher): às vezes sem barba, raramente careca
func _aleatorio() -> void:
	var g := str(Corpo.mh_de(ap)["g"])
	var m := {"g": g}
	for k in Corpo.CAMPOS:
		if k == "g":
			continue
		var L := Corpo.lista(k, g)
		m[k] = str(L[randi() % L.size()]) if not L.is_empty() else ""
	if randf() < 0.25:
		m["barba"] = ""
	if randf() < 0.08:
		m["cabelo"] = ""
	ap["corpo"] = "mh"
	ap["mh"] = Corpo.limpa_mh(m)
	_redesenhar()


func _resumo() -> void:
	for c in resumo.get_children():
		c.queue_free()
	var m := Corpo.mh_de(ap)
	var g := str(m["g"])
	var n := func(c: String) -> String: return Corpo.nome_op(c, str(m.get(c, "")), g).to_lower()
	var linhas := [["cr-rosto", "Rosto", n.call("pele") + " · olhos " + n.call("olhos") + (" · " + n.call("barba") if g == "homem" else "")],
		["cr-cabelo", "Cabelo", n.call("cabelo")],
		["cr-corpo", "Corpo", Corpo.nome_op("g", g, g).to_lower() + " · " + Corpo.altura_txt(ap, int(ap["altura"]))],
		["cr-roupas", "Roupas", "biquíni" if g == "mulher" else "cueca"],
		["cr-acess", "Acessórios", "nenhum"]]
	for e in linhas:
		var h := HBoxContainer.new()
		h.add_theme_constant_override("separation", 10)
		var ic := TextureRect.new()
		ic.texture = Estilo.icone(str(e[0]), 18)
		ic.modulate = Estilo.CINZA
		ic.size_flags_vertical = Control.SIZE_SHRINK_BEGIN
		h.add_child(ic)
		var l := RichTextLabel.new()
		l.bbcode_enabled = true
		l.fit_content = true
		l.scroll_active = false
		l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		l.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		l.add_theme_font_override("normal_font", Estilo.fonte("ui", 500))
		l.add_theme_font_override("bold_font", Estilo.fonte("ui", 800))
		l.add_theme_font_size_override("normal_font_size", 13)
		l.add_theme_font_size_override("bold_font_size", 13)
		l.add_theme_color_override("default_color", Estilo.CINZA)
		l.text = "[color=#ece4d2][b]%s[/b][/color] %s" % [e[1], e[2]]
		h.add_child(l)
		resumo.add_child(h)


func _vista(v: String) -> void:
	main.palco.vista(v)
	for k in vistas:
		(vistas[k] as Button).set_pressed_no_signal(k == v)
	_marcar_camera()


func _marcar_camera() -> void:
	bt_girar.set_pressed_no_signal(main.palco.girar)
	bt_zoom.set_pressed_no_signal(main.palco.zoom_alvo > 0.5)
	bt_zoom.tooltip_text = "Afastar" if main.palco.zoom_alvo > 0.5 else "Aproximar"
	var a := fposmod(main.palco.ang_alvo, TAU)
	var v := "frente" if (a < 0.4 or a > TAU - 0.4) else ("costas" if absf(a - PI) < 0.4 else ("lado" if absf(a - PI / 2.0) < 0.4 else ""))
	for k in vistas:
		(vistas[k] as Button).set_pressed_no_signal(k == v and not main.palco.girar)


func _foco_input(ev: InputEvent) -> void:
	if ev is InputEventMouseMotion and (ev.button_mask & MOUSE_BUTTON_MASK_LEFT) != 0:
		main.palco.ang_alvo -= ev.relative.x * 0.009
		main.palco.girar = false
		_marcar_camera()
	elif ev is InputEventMouseButton and ev.pressed:
		if ev.button_index == MOUSE_BUTTON_WHEEL_UP:
			main.palco.zoom_alvo = 1.0
			_marcar_camera()
		elif ev.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			main.palco.zoom_alvo = 0.0
			_marcar_camera()


func _process(_dt: float) -> void:
	if not visible:
		return
	main.palco.foco = foco.get_global_rect()


# ================================================================ sair
func _voltar() -> void:
	telas.mostrar(volta)


## guarda a aparência no perfil (com o retrato) e segue: o primeiro mundo, ou de volta para o lobby
func _confirmar() -> void:
	ap["nome"] = Perfis.limpar_nome(nome.text)
	Perfis.atual["ap"] = Corpo.limpa(ap)
	var img: Image = main.palco.foto_retrato()
	if img != null and not img.is_empty():
		DirAccess.make_dir_recursive_absolute("user://retratos")
		img.resize(128, 128, Image.INTERPOLATE_LANCZOS)
		var arq := "user://retratos/%s.png" % str(Perfis.atual.get("id", "perfil"))
		if img.save_png(arq) == OK:
			Perfis.atual["retrato"] = arq
	Perfis.salvar()
	if ao_confirmar.is_valid():
		var f := ao_confirmar
		ao_confirmar = Callable()
		f.call()
	else:
		telas.mostrar(volta)
