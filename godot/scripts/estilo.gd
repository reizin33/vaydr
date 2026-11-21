class_name Estilo
extends RefCounted
## As cores, as letras, os ícones e os pedaços de tela (painéis, botões, abas, chaves de escolha) das telas e do HUD,
## iguais aos do jogo antigo: as variáveis do CSS do page.html (noite, vidro, osso, cinza, brasa, sangue, grão, água,
## musgo...), a letra de título serifada e a de interface estreita, e os ícones desenhados (dados/hud/icones_svg.json,
## tirados dos <symbol> do jogo antigo pelo tools/gerar_telas_antigas.py).

const NOITE := Color(0.027, 0.039, 0.035)
const FUNDO := Color(0.043, 0.051, 0.055)            # fundo das telas de entrada (lobby, configurações)
const VIDRO := Color(0.039, 0.055, 0.047, 0.64)
const VIDRO_ALTO := Color(0.039, 0.055, 0.047, 0.84)
const VIDRO_SOLIDO := Color(0.055, 0.075, 0.067)
const CARTAO := Color(0.075, 0.086, 0.09, 0.92)      # cartões das telas (linhas das configurações, mundos)
const BORDA := Color(0.925, 0.894, 0.824, 0.16)
const BORDA_ALTA := Color(0.925, 0.894, 0.824, 0.34)
const TRILHO := Color(0.925, 0.894, 0.824, 0.15)
const OSSO := Color(0.925, 0.894, 0.824)
const CINZA := Color(0.663, 0.682, 0.624)
const APAGADO := Color(0.482, 0.506, 0.463)
const BRASA := Color(1.0, 0.541, 0.239)
const BRASA_FUNDA := Color(0.761, 0.333, 0.114)
const BRASA_VEU := Color(0.761, 0.333, 0.114, 0.38)
const SANGUE := Color(0.89, 0.286, 0.243)
const SANGUE_TINTA := Color(1.0, 0.667, 0.635)
const SANGUE_VEU := Color(0.89, 0.286, 0.243, 0.16)
const GRAO := Color(0.91, 0.671, 0.263)
const AGUA := Color(0.384, 0.722, 1.0)
const MUSGO := Color(0.592, 0.78, 0.431)
const MUSGO_VEU := Color(0.592, 0.78, 0.431, 0.16)
const FOLEGO := Color(0.851, 0.827, 0.416)
const SONO := Color(0.604, 0.659, 0.902)
const SOMBRA := Color(0, 0, 0, 0.5)
const VEU := Color(0.016, 0.024, 0.02, 0.72)
const VERDE_DUR := Color(0.482, 0.784, 0.424)

static var _fontes := {}
static var _svg := {}
static var _icones := {}
static var _tema: Theme = null


## letra: "titulo" (serifada, a dos nomes grandes do jogo antigo) ou "ui" (estreita, a do resto); o peso vai de 100 a 900;
## espaco separa as letras (o letter-spacing do jogo antigo, nos textos em maiúsculas)
static func fonte(tipo := "ui", peso := 600, espaco := 0) -> Font:
	var k := "%s:%d:%d" % [tipo, peso, espaco]
	if _fontes.has(k):
		return _fontes[k]
	var f := FontVariation.new()
	f.spacing_glyph = espaco
	if tipo == "titulo":
		f.base_font = load("res://assets/fontes/Gelasio.ttf")
		f.variation_opentype = {"wght": float(clampi(peso, 400, 700))}
	else:
		f.base_font = load("res://assets/fontes/Roboto.ttf")
		f.variation_opentype = {"wght": float(peso), "wdth": 84.0}
	_fontes[k] = f
	return f


## ícone do jogo antigo (branco: a cor vem do modulate de quem usa), no tamanho pedido em pixels
static func icone(nome: String, px := 24) -> Texture2D:
	var k := "%s:%d" % [nome, px]
	if _icones.has(k):
		return _icones[k]
	if _svg.is_empty():
		var d = JSON.parse_string(FileAccess.get_file_as_string("res://dados/hud/icones_svg.json"))
		_svg = d if d is Dictionary else {"x": ""}
	var tex: Texture2D = null
	if _svg.has(nome):
		var img := Image.new()
		# o desenho tem 24 px de lado; o dobro do tamanho e depois reduz fica mais liso
		if img.load_svg_from_string(str(_svg[nome]), float(px) / 24.0 * 2.0) == OK:
			img.resize(px, px, Image.INTERPOLATE_LANCZOS)
			tex = ImageTexture.create_from_image(img)
	_icones[k] = tex
	return tex


## prende o pedaço num ponto da tela (ax, ay de 0 a 1) com um deslocamento; ele cresce para o lado pedido conforme o
## tamanho do que tem dentro
static func prender(c: Control, ax: float, ay: float, ox: float, oy: float, gx := Control.GROW_DIRECTION_END, gy := Control.GROW_DIRECTION_END) -> void:
	c.anchor_left = ax
	c.anchor_right = ax
	c.anchor_top = ay
	c.anchor_bottom = ay
	c.offset_left = ox
	c.offset_right = ox
	c.offset_top = oy
	c.offset_bottom = oy
	c.grow_horizontal = gx
	c.grow_vertical = gy


## ocupa um retângulo da tela: âncoras (de 0 a 1) e margens em pixels a partir delas
static func encher(c: Control, a0: Vector2, a1: Vector2, m0 := Vector2.ZERO, m1 := Vector2.ZERO) -> void:
	c.anchor_left = a0.x
	c.anchor_top = a0.y
	c.anchor_right = a1.x
	c.anchor_bottom = a1.y
	c.offset_left = m0.x
	c.offset_top = m0.y
	c.offset_right = m1.x
	c.offset_bottom = m1.y


## caixa (fundo de painel): cor, borda, raio dos cantos e margem de dentro
## (cada chamada faz uma caixa nova: quem pega pode mudar as margens sem mexer nas dos outros)
static func caixa(cor: Color, borda := Color(0, 0, 0, 0), raio := 10, margem := 10, larg_borda := 1) -> StyleBoxFlat:
	var s := StyleBoxFlat.new()
	s.bg_color = cor
	s.border_color = borda
	s.set_border_width_all(larg_borda if borda.a > 0.0 else 0)
	s.set_corner_radius_all(raio)
	s.content_margin_left = margem
	s.content_margin_right = margem
	s.content_margin_top = margem
	s.content_margin_bottom = margem
	s.anti_aliasing = true
	return s


## painel do HUD (o .hud .painel do jogo antigo: vidro escuro com borda clara fina e sombra)
static func caixa_hud(raio := 12, margem := 10) -> StyleBoxFlat:
	var s := caixa(Color(0.063, 0.082, 0.075, 0.76), BORDA, raio, margem)
	s.shadow_color = Color(0, 0, 0, 0.3)
	s.shadow_size = 10
	s.shadow_offset = Vector2(0, 5)
	return s


static func rotulo(txt: String, tam := 15, cor := OSSO, tipo := "ui", peso := 600, espaco := 0) -> Label:
	var l := Label.new()
	l.text = txt
	l.add_theme_font_override("font", fonte(tipo, peso, espaco))
	l.add_theme_font_size_override("font_size", tam)
	l.add_theme_color_override("font_color", cor)
	l.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return l


## rótulo com sombra (para ficar legível em cima do mundo 3D)
static func rotulo_hud(txt: String, tam := 14, cor := OSSO, tipo := "ui", peso := 700, espaco := 0) -> Label:
	var l := rotulo(txt, tam, cor, tipo, peso, espaco)
	l.add_theme_color_override("font_shadow_color", Color(0, 0, 0, 0.85))
	l.add_theme_constant_override("shadow_offset_x", 0)
	l.add_theme_constant_override("shadow_offset_y", 1)
	l.add_theme_constant_override("shadow_outline_size", 3)
	return l


## o tema das telas: letra estreita, botões de vidro com borda clara, campos e barras de rolagem no mesmo jeito
static func tema() -> Theme:
	if _tema != null:
		return _tema
	var t := Theme.new()
	t.default_font = fonte("ui", 500)
	t.default_font_size = 15
	t.set_color("font_color", "Label", OSSO)
	# botão
	t.set_stylebox("normal", "Button", caixa(Color(0.09, 0.105, 0.11, 0.9), BORDA, 8, 10))
	t.set_stylebox("hover", "Button", caixa(Color(0.13, 0.145, 0.15, 0.95), BORDA_ALTA, 8, 10))
	t.set_stylebox("pressed", "Button", caixa(Color(0.2, 0.12, 0.07, 0.95), BRASA, 8, 10))
	t.set_stylebox("disabled", "Button", caixa(Color(0.07, 0.08, 0.085, 0.6), Color(1, 1, 1, 0.05), 8, 10))
	t.set_stylebox("focus", "Button", caixa(Color(0, 0, 0, 0), BRASA, 8, 10, 2))
	t.set_color("font_color", "Button", OSSO)
	t.set_color("font_hover_color", "Button", Color(1, 1, 1))
	t.set_color("font_pressed_color", "Button", BRASA)
	t.set_color("font_disabled_color", "Button", APAGADO)
	t.set_font("font", "Button", fonte("ui", 700))
	# caixa de marcar
	t.set_color("font_color", "CheckBox", OSSO)
	t.set_color("font_hover_color", "CheckBox", Color(1, 1, 1))
	t.set_color("font_pressed_color", "CheckBox", OSSO)
	t.set_stylebox("normal", "CheckBox", caixa(Color(0, 0, 0, 0), Color(0, 0, 0, 0), 6, 4))
	t.set_stylebox("hover", "CheckBox", caixa(Color(1, 1, 1, 0.04), Color(0, 0, 0, 0), 6, 4))
	t.set_stylebox("pressed", "CheckBox", caixa(Color(0, 0, 0, 0), Color(0, 0, 0, 0), 6, 4))
	t.set_stylebox("focus", "CheckBox", caixa(Color(0, 0, 0, 0), Color(0, 0, 0, 0), 6, 4))
	# campo de texto
	t.set_stylebox("normal", "LineEdit", caixa(Color(0.05, 0.06, 0.065, 0.95), BORDA, 8, 10))
	t.set_stylebox("focus", "LineEdit", caixa(Color(0.05, 0.06, 0.065, 0.95), BRASA, 8, 10))
	t.set_color("font_color", "LineEdit", OSSO)
	t.set_color("caret_color", "LineEdit", BRASA)
	t.set_color("font_placeholder_color", "LineEdit", APAGADO)
	# barra deslizante (a do jogo antigo: trilho fino e bolinha cor de brasa)
	var trilho := caixa(Color(0.925, 0.894, 0.824, 0.18), Color(0, 0, 0, 0), 3, 0)
	trilho.content_margin_top = 3
	trilho.content_margin_bottom = 3
	var cheio := caixa(BRASA, Color(0, 0, 0, 0), 3, 0)
	cheio.content_margin_top = 3
	cheio.content_margin_bottom = 3
	t.set_stylebox("slider", "HSlider", trilho)
	t.set_stylebox("grabber_area", "HSlider", cheio)
	t.set_stylebox("grabber_area_highlight", "HSlider", cheio)
	var bola := Image.create(18, 18, false, Image.FORMAT_RGBA8)
	for y in 18:
		for x in 18:
			var dd := Vector2(x - 8.5, y - 8.5).length()
			bola.set_pixel(x, y, Color(BRASA, clampf(8.5 - dd, 0.0, 1.0)))
	var tb := ImageTexture.create_from_image(bola)
	t.set_icon("grabber", "HSlider", tb)
	t.set_icon("grabber_highlight", "HSlider", tb)
	# barras de rolagem finas
	var rol := caixa(Color(1, 1, 1, 0.03), Color(0, 0, 0, 0), 4, 0)
	var pega := caixa(Color(0.925, 0.894, 0.824, 0.22), Color(0, 0, 0, 0), 4, 0)
	var pega2 := caixa(Color(0.925, 0.894, 0.824, 0.4), Color(0, 0, 0, 0), 4, 0)
	t.set_stylebox("scroll", "VScrollBar", rol)
	t.set_stylebox("grabber", "VScrollBar", pega)
	t.set_stylebox("grabber_highlight", "VScrollBar", pega2)
	t.set_stylebox("grabber_pressed", "VScrollBar", pega2)
	t.set_stylebox("panel", "PanelContainer", caixa(VIDRO_ALTO, BORDA, 10, 10))
	t.set_stylebox("panel", "TooltipPanel", caixa(VIDRO_SOLIDO, BORDA_ALTA, 6, 8))
	t.set_color("font_color", "TooltipLabel", OSSO)
	# lista de escolha
	t.set_stylebox("normal", "OptionButton", caixa(Color(0.09, 0.105, 0.11, 0.9), BORDA, 8, 10))
	t.set_stylebox("hover", "OptionButton", caixa(Color(0.13, 0.145, 0.15, 0.95), BORDA_ALTA, 8, 10))
	t.set_stylebox("panel", "PopupMenu", caixa(VIDRO_SOLIDO, BORDA_ALTA, 8, 6))
	_tema = t
	return t


## botão do jogo antigo: maiúsculo com letras separadas; o principal é cor de brasa
static func botao(txt: String, principal := false, tam := 14) -> Button:
	var b := Button.new()
	b.text = txt.to_upper()
	b.add_theme_font_override("font", fonte("ui", 800, 2 if tam <= 15 else 1))
	b.add_theme_font_size_override("font_size", tam)
	b.focus_mode = Control.FOCUS_NONE
	b.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	if principal:
		b.add_theme_stylebox_override("normal", caixa(BRASA_FUNDA, BRASA, 10, 14))
		b.add_theme_stylebox_override("hover", caixa(Color(0.85, 0.4, 0.15), Color(1.0, 0.66, 0.4), 10, 14))
		b.add_theme_stylebox_override("pressed", caixa(Color(0.6, 0.26, 0.09), BRASA, 10, 14))
		b.add_theme_color_override("font_color", Color(1, 0.97, 0.92))
		b.add_theme_color_override("font_hover_color", Color(1, 1, 1))
		b.add_theme_color_override("font_pressed_color", Color(1, 0.9, 0.8))
	return b


## botão de texto simples (links do rodapé do lobby)
static func link(txt: String, tam := 15) -> Button:
	var b := Button.new()
	b.text = txt
	b.flat = true
	b.focus_mode = Control.FOCUS_NONE
	b.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	b.add_theme_font_override("font", fonte("ui", 600))
	b.add_theme_font_size_override("font_size", tam)
	b.add_theme_color_override("font_color", CINZA)
	b.add_theme_color_override("font_hover_color", OSSO)
	b.add_theme_color_override("font_pressed_color", BRASA)
	var vazio := StyleBoxEmpty.new()
	for st in ["normal", "hover", "pressed", "focus", "disabled"]:
		b.add_theme_stylebox_override(st, vazio)
	return b


## tecla desenhada (o <kbd> do jogo antigo)
static func tecla(txt: String, tam := 11) -> PanelContainer:
	var p := PanelContainer.new()
	var s := caixa(TRILHO, BORDA, 5, 5)
	s.content_margin_top = 3
	s.content_margin_bottom = 4
	s.border_width_bottom = 2
	p.add_theme_stylebox_override("panel", s)
	p.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var l := rotulo(txt, tam, OSSO, "ui", 800)
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	p.add_child(l)
	return p


## escolha em pedaços (BAIXO | MÉDIO | ALTO): o escolhido fica claro com um traço cor de brasa embaixo
static func segmentos(opcoes: Array, atual: int, ao_mudar: Callable) -> PanelContainer:
	var p := PanelContainer.new()
	p.add_theme_stylebox_override("panel", caixa(Color(0.06, 0.07, 0.075, 0.95), BORDA, 10, 4))
	var h := HBoxContainer.new()
	h.add_theme_constant_override("separation", 4)
	p.add_child(h)
	var grupo := []
	for i in opcoes.size():
		var b := Button.new()
		b.text = str(opcoes[i]).to_upper()
		b.toggle_mode = true
		b.focus_mode = Control.FOCUS_NONE
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		b.custom_minimum_size = Vector2(86, 38)
		b.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
		b.add_theme_font_override("font", fonte("ui", 800, 2))
		b.add_theme_font_size_override("font_size", 13)
		b.add_theme_color_override("font_color", CINZA)
		b.add_theme_color_override("font_hover_color", OSSO)
		b.add_theme_color_override("font_pressed_color", OSSO)
		b.add_theme_color_override("font_hover_pressed_color", OSSO)
		var vazio := caixa(Color(0, 0, 0, 0), Color(0, 0, 0, 0), 8, 6)
		var sobre := caixa(Color(1, 1, 1, 0.04), Color(0, 0, 0, 0), 8, 6)
		var escolhido := caixa(Color(0.2, 0.21, 0.215), Color(0, 0, 0, 0), 8, 6).duplicate() as StyleBoxFlat
		escolhido.border_color = BRASA
		escolhido.border_width_bottom = 2
		b.add_theme_stylebox_override("normal", vazio)
		b.add_theme_stylebox_override("hover", sobre)
		b.add_theme_stylebox_override("pressed", escolhido)
		b.add_theme_stylebox_override("hover_pressed", escolhido)
		b.add_theme_stylebox_override("focus", StyleBoxEmpty.new())
		b.button_pressed = i == atual
		grupo.append(b)
		h.add_child(b)
	for i in grupo.size():
		var b: Button = grupo[i]
		b.pressed.connect(func():
			for k in grupo.size():
				(grupo[k] as Button).set_pressed_no_signal(k == i)
			ao_mudar.call(i))
	return p
