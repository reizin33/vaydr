class_name UI
extends CanvasLayer
## Tela do jogo: mira, aviso do que a mira pega, relógio, avisos de coleta, barras (vida, fome, sede), barra de atalhos,
## mochila com fabricação (Tab), dica da construção e a tela de morte.

var main: Node
var mira_lbl: Label
var dica_lbl: Label
var relogio: Label
var avisos: VBoxContainer
var barras := {}
var barra_slots: Array = []
var painel: PanelContainer
var grade: GridContainer
var grade_barra: HBoxContainer
var lista_fab: VBoxContainer
var morte: PanelContainer
var flash: ColorRect
var constr_lbl: Label
var escolhido := -1
var aberto := false


func _init(m: Node) -> void:
	main = m


func _estilo(cor := Color(0.07, 0.08, 0.07, 0.78), borda := Color(1, 1, 1, 0.06)) -> StyleBoxFlat:
	var s := StyleBoxFlat.new()
	s.bg_color = cor
	s.border_color = borda
	s.set_border_width_all(1)
	s.set_corner_radius_all(4)
	s.content_margin_left = 8
	s.content_margin_right = 8
	s.content_margin_top = 6
	s.content_margin_bottom = 6
	return s


func _ancorar(c: Control, preset: int, r: Rect2) -> void:
	c.set_anchors_preset(preset)
	c.offset_left = r.position.x
	c.offset_top = r.position.y
	c.offset_right = r.position.x + r.size.x
	c.offset_bottom = r.position.y + r.size.y


func _lbl(txt: String, tam := 16, cor := Color(0.92, 0.9, 0.84)) -> Label:
	var l := Label.new()
	l.text = txt
	l.add_theme_font_size_override("font_size", tam)
	l.add_theme_color_override("font_color", cor)
	l.add_theme_color_override("font_shadow_color", Color(0, 0, 0, 0.6))
	l.add_theme_constant_override("shadow_offset_x", 1)
	l.add_theme_constant_override("shadow_offset_y", 1)
	return l


func _ready() -> void:
	var raiz := Control.new()
	raiz.set_anchors_preset(Control.PRESET_FULL_RECT)
	raiz.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(raiz)
	flash = ColorRect.new()
	flash.color = Color(0.6, 0.0, 0.0, 0.0)
	flash.set_anchors_preset(Control.PRESET_FULL_RECT)
	flash.mouse_filter = Control.MOUSE_FILTER_IGNORE
	raiz.add_child(flash)
	# mira
	var ponto := ColorRect.new()
	ponto.color = Color(1, 1, 1, 0.85)
	ponto.size = Vector2(4, 4)
	_ancorar(ponto, Control.PRESET_CENTER, Rect2(-2, -2, 4, 4))
	raiz.add_child(ponto)
	mira_lbl = _lbl("", 17)
	mira_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_ancorar(mira_lbl, Control.PRESET_CENTER, Rect2(-300, 26, 600, 30))
	raiz.add_child(mira_lbl)
	# relógio
	relogio = _lbl("", 18)
	relogio.position = Vector2(18, 14)
	raiz.add_child(relogio)
	# avisos de coleta
	avisos = VBoxContainer.new()
	_ancorar(avisos, Control.PRESET_TOP_RIGHT, Rect2(-330, 16, 310, 300))
	avisos.alignment = BoxContainer.ALIGNMENT_BEGIN
	raiz.add_child(avisos)
	# barras
	var caixa := VBoxContainer.new()
	_ancorar(caixa, Control.PRESET_BOTTOM_RIGHT, Rect2(-250, -118, 230, 100))
	caixa.add_theme_constant_override("separation", 6)
	raiz.add_child(caixa)
	for b in [["vida", "Vida", Color(0.78, 0.22, 0.2)], ["fome", "Fome", Color(0.86, 0.58, 0.2)], ["sede", "Sede", Color(0.3, 0.58, 0.88)]]:
		var fundo := Panel.new()
		fundo.add_theme_stylebox_override("panel", _estilo(Color(0.06, 0.06, 0.06, 0.72)))
		fundo.custom_minimum_size = Vector2(230, 26)
		var cheio := ColorRect.new()
		cheio.color = b[2]
		cheio.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var txt := _lbl(b[1], 14)
		txt.position = Vector2(4, 2)
		fundo.add_child(cheio)
		fundo.add_child(txt)
		caixa.add_child(fundo)
		barras[b[0]] = {"fundo": fundo, "cheio": cheio, "txt": txt, "nome": b[1]}
	# barra de atalhos
	var hb := HBoxContainer.new()
	_ancorar(hb, Control.PRESET_CENTER_BOTTOM, Rect2(-6 * 37, -86, 6 * 74, 70))
	hb.add_theme_constant_override("separation", 6)
	raiz.add_child(hb)
	for i in Inventario.BARRA:
		var s := _slot(i, true)
		hb.add_child(s)
		barra_slots.append(s)
	constr_lbl = _lbl("", 15, Color(0.85, 0.92, 1.0))
	_ancorar(constr_lbl, Control.PRESET_CENTER_BOTTOM, Rect2(-380, -122, 760, 26))
	constr_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	raiz.add_child(constr_lbl)
	# mochila e fabricação
	painel = PanelContainer.new()
	painel.add_theme_stylebox_override("panel", _estilo(Color(0.06, 0.07, 0.06, 0.92)))
	_ancorar(painel, Control.PRESET_CENTER, Rect2(-470, -250, 940, 500))
	painel.visible = false
	raiz.add_child(painel)
	var lados := HBoxContainer.new()
	lados.add_theme_constant_override("separation", 24)
	painel.add_child(lados)
	var esq := VBoxContainer.new()
	lados.add_child(esq)
	esq.add_child(_lbl("Mochila", 20))
	grade = GridContainer.new()
	grade.columns = 6
	grade.add_theme_constant_override("h_separation", 6)
	grade.add_theme_constant_override("v_separation", 6)
	esq.add_child(grade)
	for i in range(Inventario.BARRA, Inventario.ESPACOS):
		grade.add_child(_slot(i, false))
	esq.add_child(_lbl("Barra de atalhos (1 a 6)", 14, Color(0.7, 0.7, 0.66)))
	grade_barra = HBoxContainer.new()
	grade_barra.add_theme_constant_override("separation", 6)
	esq.add_child(grade_barra)
	for i in Inventario.BARRA:
		grade_barra.add_child(_slot(i, false))
	var dir := VBoxContainer.new()
	dir.custom_minimum_size = Vector2(380, 0)
	lados.add_child(dir)
	dir.add_child(_lbl("Fabricar", 20))
	lista_fab = VBoxContainer.new()
	lista_fab.add_theme_constant_override("separation", 4)
	dir.add_child(lista_fab)
	dir.add_child(_lbl("Clique num espaço e depois em outro para trocar de lugar.", 13, Color(0.65, 0.65, 0.6)))
	# morte
	morte = PanelContainer.new()
	morte.add_theme_stylebox_override("panel", _estilo(Color(0.12, 0.02, 0.02, 0.9)))
	_ancorar(morte, Control.PRESET_CENTER, Rect2(-200, -80, 400, 160))
	morte.visible = false
	var mv := VBoxContainer.new()
	mv.alignment = BoxContainer.ALIGNMENT_CENTER
	morte.add_child(mv)
	var t := _lbl("Você morreu", 28, Color(0.95, 0.75, 0.7))
	t.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	mv.add_child(t)
	var bt := Button.new()
	bt.text = "Renascer na clareira"
	bt.pressed.connect(func(): main.renascer())
	mv.add_child(bt)
	raiz.add_child(morte)
	main.jogador.inv.mudou.connect(atualizar)
	atualizar()


func _slot(i: int, barra: bool) -> PanelContainer:
	var p := PanelContainer.new()
	p.custom_minimum_size = Vector2(68, 68)
	p.add_theme_stylebox_override("panel", _estilo())
	var v := VBoxContainer.new()
	v.mouse_filter = Control.MOUSE_FILTER_IGNORE
	p.add_child(v)
	var nome := _lbl("", 12)
	nome.autowrap_mode = TextServer.AUTOWRAP_WORD
	nome.custom_minimum_size = Vector2(54, 34)
	nome.mouse_filter = Control.MOUSE_FILTER_IGNORE
	v.add_child(nome)
	var n := _lbl("", 13, Color(1, 0.95, 0.8))
	n.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	n.mouse_filter = Control.MOUSE_FILTER_IGNORE
	v.add_child(n)
	p.set_meta("i", i)
	p.set_meta("barra", barra)
	if not barra:
		p.gui_input.connect(func(ev): _clique(ev, i))
	return p


func _clique(ev: InputEvent, i: int) -> void:
	if ev is InputEventMouseButton and ev.pressed and ev.button_index == MOUSE_BUTTON_LEFT:
		if escolhido < 0:
			if main.jogador.inv.slots[i] != null:
				escolhido = i
		else:
			main.jogador.inv.trocar(escolhido, i)
			escolhido = -1
		atualizar()


func _pintar(p: PanelContainer) -> void:
	var i: int = p.get_meta("i")
	var s = main.jogador.inv.slots[i]
	var v: VBoxContainer = p.get_child(0)
	var nome: Label = v.get_child(0)
	var n: Label = v.get_child(1)
	if s == null:
		nome.text = ""
		n.text = ""
	else:
		nome.text = Dados.nome(s["id"])
		n.text = "x%d" % s["n"] if int(s["n"]) > 1 else ""
	var sel: bool = p.get_meta("barra") and i == main.jogador.sel
	var cor := Color(0.07, 0.08, 0.07, 0.78)
	if s != null and Dados.ITENS.has(s["id"]) and Dados.ITENS[s["id"]].has("cor"):
		cor = (Dados.ITENS[s["id"]]["cor"] as Color).darkened(0.55)
		cor.a = 0.85
	p.add_theme_stylebox_override("panel", _estilo(cor, Color(1.0, 0.8, 0.35, 0.95) if (sel or i == escolhido) else Color(1, 1, 1, 0.08)))


func atualizar() -> void:
	for p in barra_slots:
		_pintar(p)
	for p in grade.get_children():
		_pintar(p)
	for p in grade_barra.get_children():
		_pintar(p)
	if aberto:
		_lista()


func _lista() -> void:
	for c in lista_fab.get_children():
		c.queue_free()
	var inv: Inventario = main.jogador.inv
	for r in Dados.RECEITAS:
		var b := Button.new()
		var partes := []
		for k in r["custo"]:
			partes.append("%d %s" % [r["custo"][k], Dados.nome(k).to_lower()])
		b.text = "%s  —  %s" % [Dados.nome(r["faz"]), ", ".join(partes)]
		b.alignment = HORIZONTAL_ALIGNMENT_LEFT
		b.disabled = not inv.tem(r["custo"])
		b.pressed.connect(func(): main.fabricar(r))
		lista_fab.add_child(b)
	var t := _lbl("Construção (com o plano na mão): botão direito troca a peça, R gira, clique coloca.", 13, Color(0.65, 0.7, 0.75))
	t.autowrap_mode = TextServer.AUTOWRAP_WORD
	t.custom_minimum_size = Vector2(370, 0)
	lista_fab.add_child(t)
	for p in Dados.PECAS:
		var partes2 := []
		for k in p["custo"]:
			partes2.append("%d %s" % [p["custo"][k], Dados.nome(k).to_lower()])
		lista_fab.add_child(_lbl("· %s: %s" % [p["nome"], ", ".join(partes2)], 13, Color(0.75, 0.75, 0.7)))


func abrir(on: bool) -> void:
	aberto = on
	painel.visible = on
	escolhido = -1
	main.jogador.preso = on
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE if on else Input.MOUSE_MODE_CAPTURED
	atualizar()


func aviso(txt: String) -> void:
	var l := _lbl(txt, 16)
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	l.custom_minimum_size = Vector2(310, 0)
	avisos.add_child(l)
	while avisos.get_child_count() > 7:
		avisos.get_child(0).free()
	var tw := create_tween()
	tw.tween_interval(2.4)
	tw.tween_property(l, "modulate:a", 0.0, 0.8)
	tw.tween_callback(l.queue_free)


func dano() -> void:
	flash.color.a = 0.35
	var tw := create_tween()
	tw.tween_property(flash, "color:a", 0.0, 0.5)


func mostrar_morte(on: bool) -> void:
	morte.visible = on
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE if on else Input.MOUSE_MODE_CAPTURED


func _process(_dt: float) -> void:
	var j = main.jogador
	for k in ["vida", "fome", "sede"]:
		var b: Dictionary = barras[k]
		var v: float = j.get(k)
		var fundo: Panel = b["fundo"]
		var cheio: ColorRect = b["cheio"]
		cheio.position = Vector2(2, 2)
		cheio.size = Vector2(maxf(0.0, (fundo.size.x - 4.0) * v / 100.0), fundo.size.y - 4.0)
		(b["txt"] as Label).text = "  %s  %d" % [b["nome"], int(round(v))]
	relogio.text = "Dia %d · %s" % [main.dia, main.hora_txt()]
	mira_lbl.text = main.texto_mira()
	if main.construcao.ativo:
		var p: Dictionary = main.construcao.peca_atual()
		var partes := []
		for k in p["custo"]:
			partes.append("%d %s" % [p["custo"][k], Dados.nome(k).to_lower()])
		constr_lbl.text = "Construindo: %s (%s) · botão direito troca · R gira · clique coloca" % [p["nome"], ", ".join(partes)]
	else:
		constr_lbl.text = ""
	for p in barra_slots:
		_pintar(p)
