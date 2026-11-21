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
var bt_saco: Button
var escolhido := -1
var escolhido_dono := ""
var bau_inv: Inventario = null
var col_fab: VBoxContainer
var col_bau: VBoxContainer
var grade_bau: GridContainer
var titulo_bau: Label
var aberto := false
var menu: PanelContainer
var menu_aberto := false
var fps_lbl: Label
var opcoes := {"qualidade": 1, "sens": 1.0, "fps": true, "tela_cheia": true}
const CFG := "user://opcoes.cfg"
const QUALIDADES := ["Baixo (PC fraco)", "Médio", "Alto"]
var _estilos := {}


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
	process_mode = Node.PROCESS_MODE_ALWAYS   # o menu de pausa funciona com o jogo parado
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
	fps_lbl = _lbl("", 14, Color(0.7, 0.9, 0.7))
	fps_lbl.position = Vector2(18, 40)
	raiz.add_child(fps_lbl)
	# avisos de coleta
	avisos = VBoxContainer.new()
	_ancorar(avisos, Control.PRESET_TOP_RIGHT, Rect2(-330, 16, 310, 300))
	avisos.alignment = BoxContainer.ALIGNMENT_BEGIN
	avisos.grow_horizontal = Control.GROW_DIRECTION_BEGIN
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
	_ancorar(painel, Control.PRESET_CENTER, Rect2(-490, -275, 980, 550))
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
	esq.add_child(_lbl("Clique num espaço e depois em outro para trocar de lugar.", 13, Color(0.65, 0.65, 0.6)))
	col_fab = VBoxContainer.new()
	col_fab.custom_minimum_size = Vector2(420, 0)
	lados.add_child(col_fab)
	col_fab.add_child(_lbl("Fabricar", 20))
	var rolar := ScrollContainer.new()
	rolar.custom_minimum_size = Vector2(420, 470)
	rolar.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	col_fab.add_child(rolar)
	lista_fab = VBoxContainer.new()
	lista_fab.add_theme_constant_override("separation", 4)
	lista_fab.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	rolar.add_child(lista_fab)
	# baú (aparece no lugar da fabricação quando você abre um baú)
	col_bau = VBoxContainer.new()
	col_bau.custom_minimum_size = Vector2(420, 0)
	col_bau.visible = false
	lados.add_child(col_bau)
	titulo_bau = _lbl("Baú", 20)
	col_bau.add_child(titulo_bau)
	grade_bau = GridContainer.new()
	grade_bau.columns = 6
	grade_bau.add_theme_constant_override("h_separation", 6)
	grade_bau.add_theme_constant_override("v_separation", 6)
	col_bau.add_child(grade_bau)
	for i in Inventario.ESPACOS:
		grade_bau.add_child(_slot(i, false, "bau"))
	var guardar := Button.new()
	guardar.text = "Guardar madeira, pedra e o resto dos recursos"
	guardar.pressed.connect(_guardar_recursos)
	col_bau.add_child(guardar)
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
	bt_saco = Button.new()
	bt_saco.text = "Renascer no saco de dormir"
	bt_saco.pressed.connect(func(): main.renascer(true))
	mv.add_child(bt_saco)
	var bt := Button.new()
	bt.text = "Renascer na clareira"
	bt.pressed.connect(func(): main.renascer(false))
	mv.add_child(bt)
	raiz.add_child(morte)
	_montar_menu(raiz)
	main.jogador.inv.mudou.connect(atualizar)
	atualizar()


# ---------------- menu de pausa (Esc): opções de gráfico, mouse, tela cheia, FPS e as teclas ----------------
func _montar_menu(raiz: Control) -> void:
	_carregar()
	menu = PanelContainer.new()
	menu.add_theme_stylebox_override("panel", _estilo(Color(0.05, 0.06, 0.05, 0.95)))
	_ancorar(menu, Control.PRESET_CENTER, Rect2(-330, -290, 660, 580))
	menu.visible = false
	raiz.add_child(menu)
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 10)
	menu.add_child(v)
	v.add_child(_lbl("VAYDR  ·  protótipo no Godot", 24))
	var cont := Button.new()
	cont.text = "Continuar (Esc)"
	cont.pressed.connect(abrir_menu.bind(false))
	v.add_child(cont)
	var hq := HBoxContainer.new()
	hq.add_theme_constant_override("separation", 12)
	v.add_child(hq)
	var lq := _lbl("Gráficos", 16)
	lq.custom_minimum_size = Vector2(170, 0)
	hq.add_child(lq)
	var ob := OptionButton.new()
	for t in QUALIDADES:
		ob.add_item(t)
	ob.selected = int(opcoes["qualidade"])
	ob.item_selected.connect(_mudou_qualidade)
	hq.add_child(ob)
	var hs := HBoxContainer.new()
	hs.add_theme_constant_override("separation", 12)
	v.add_child(hs)
	var ls := _lbl("Sensibilidade do mouse", 16)
	ls.custom_minimum_size = Vector2(170, 0)
	hs.add_child(ls)
	var sl := HSlider.new()
	sl.min_value = 0.25
	sl.max_value = 3.0
	sl.step = 0.05
	sl.value = float(opcoes["sens"])
	sl.custom_minimum_size = Vector2(300, 24)
	sl.value_changed.connect(_mudou_sens)
	hs.add_child(sl)
	var tc := CheckBox.new()
	tc.text = "Tela cheia (F11)"
	tc.button_pressed = bool(opcoes["tela_cheia"])
	tc.toggled.connect(_mudou_tela)
	tc.name = "TelaCheia"
	v.add_child(tc)
	var cf := CheckBox.new()
	cf.text = "Mostrar FPS (quadros por segundo)"
	cf.button_pressed = bool(opcoes["fps"])
	cf.toggled.connect(_mudou_fps)
	v.add_child(cf)
	var teclas := _lbl("W A S D andar · Shift correr · Ctrl ou C agachar · Espaço pular\n" +
		"Botão esquerdo bater / usar o item · E pegar, abrir, beber · Tab mochila e fabricação\n" +
		"1 a 6 ou rodinha: item na mão · com o plano: botão direito troca a peça, R gira", 14, Color(0.72, 0.74, 0.7))
	teclas.autowrap_mode = TextServer.AUTOWRAP_WORD
	teclas.custom_minimum_size = Vector2(620, 0)
	v.add_child(teclas)
	var sair := Button.new()
	sair.text = "Sair do jogo"
	sair.pressed.connect(func(): get_tree().quit())
	v.add_child(sair)
	_aplicar_tudo()


func _carregar() -> void:
	var cf := ConfigFile.new()
	if cf.load(CFG) == OK:
		for k in opcoes:
			opcoes[k] = cf.get_value("opcoes", k, opcoes[k])


func _salvar() -> void:
	var cf := ConfigFile.new()
	for k in opcoes:
		cf.set_value("opcoes", k, opcoes[k])
	cf.save(CFG)


func _aplicar_tudo() -> void:
	main.aplicar_qualidade(int(opcoes["qualidade"]))
	main.jogador.sens = 0.0022 * float(opcoes["sens"])
	fps_lbl.visible = bool(opcoes["fps"])
	if not main.modo_teste:
		DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_FULLSCREEN if opcoes["tela_cheia"] else DisplayServer.WINDOW_MODE_MAXIMIZED)


func _mudou_qualidade(i: int) -> void:
	opcoes["qualidade"] = i
	main.aplicar_qualidade(i)
	_salvar()


func _mudou_sens(x: float) -> void:
	opcoes["sens"] = x
	main.jogador.sens = 0.0022 * x
	_salvar()


func _mudou_tela(on: bool) -> void:
	opcoes["tela_cheia"] = on
	if not main.modo_teste:
		DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_FULLSCREEN if on else DisplayServer.WINDOW_MODE_MAXIMIZED)
	_salvar()


func _mudou_fps(on: bool) -> void:
	opcoes["fps"] = on
	fps_lbl.visible = on
	_salvar()


func abrir_menu(on: bool) -> void:
	menu_aberto = on
	menu.visible = on
	get_tree().paused = on
	main.jogador.preso = on or aberto
	_mouse()


func _mouse() -> void:
	if main.modo_teste:
		return
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE if (menu_aberto or aberto or morte.visible) else Input.MOUSE_MODE_CAPTURED


func _slot(i: int, barra: bool, dono := "jog") -> PanelContainer:
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
	p.set_meta("dono", dono)
	if not barra:
		p.gui_input.connect(func(ev): _clique(ev, i, dono))
	return p


func _inv(dono: String) -> Inventario:
	return main.jogador.inv if dono == "jog" else bau_inv


func _clique(ev: InputEvent, i: int, dono: String) -> void:
	if not (ev is InputEventMouseButton and ev.pressed and ev.button_index == MOUSE_BUTTON_LEFT):
		return
	var inv := _inv(dono)
	if inv == null or i >= inv.slots.size():
		return
	if escolhido < 0:
		if inv.slots[i] != null:
			escolhido = i
			escolhido_dono = dono
	else:
		_mover(escolhido_dono, escolhido, dono, i)
		escolhido = -1
	atualizar()


## troca dois espaços (até entre a mochila e o baú); se for o mesmo item, junta a pilha
func _mover(da: String, i: int, para: String, j: int) -> void:
	var a := _inv(da)
	var b := _inv(para)
	if a == null or b == null or (a == b and i == j):
		return
	var x = a.slots[i]
	var y = b.slots[j]
	if x != null and y != null and x["id"] == y["id"]:
		var mx: int = int(Dados.ITENS[x["id"]]["max"]) if Dados.ITENS.has(x["id"]) else 1
		var k := mini(int(x["n"]), mx - int(y["n"]))
		if k > 0:
			y["n"] = int(y["n"]) + k
			x["n"] = int(x["n"]) - k
			if int(x["n"]) <= 0:
				a.slots[i] = null
			a.mudou.emit()
			b.mudou.emit()
			return
	a.slots[i] = y
	b.slots[j] = x
	a.mudou.emit()
	if b != a:
		b.mudou.emit()


func _guardar_recursos() -> void:
	if bau_inv == null:
		return
	var inv: Inventario = main.jogador.inv
	for i in range(Inventario.BARRA, inv.slots.size()):
		var s = inv.slots[i]
		if s != null and Dados.ITENS.has(s["id"]) and Dados.ITENS[s["id"]]["tipo"] == "recurso":
			var sobra := bau_inv.por(s["id"], int(s["n"]))
			if sobra == 0:
				inv.slots[i] = null
			else:
				s["n"] = sobra
	inv.mudou.emit()


func abrir_bau(inv: Inventario, titulo := "Baú") -> void:
	bau_inv = inv
	titulo_bau.text = titulo
	for k in grade_bau.get_child_count():
		(grade_bau.get_child(k) as Control).visible = k < inv.slots.size()
	if not inv.mudou.is_connected(atualizar):
		inv.mudou.connect(atualizar)
	col_fab.visible = false
	col_bau.visible = true
	abrir(true)


func _pintar(p: PanelContainer) -> void:
	var i: int = p.get_meta("i")
	var dono: String = p.get_meta("dono")
	var inv := _inv(dono)
	var s = inv.slots[i] if inv != null and i < inv.slots.size() else null
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
	var marcado := i == escolhido and dono == escolhido_dono
	var cor := Color(0.07, 0.08, 0.07, 0.78)
	if s != null and Dados.ITENS.has(s["id"]) and Dados.ITENS[s["id"]].has("cor"):
		cor = (Dados.ITENS[s["id"]]["cor"] as Color).darkened(0.55)
		cor.a = 0.85
	var borda := Color(1.0, 0.8, 0.35, 0.95) if (sel or marcado) else Color(1, 1, 1, 0.08)
	var chave := cor.to_html() + borda.to_html()
	if not _estilos.has(chave):
		_estilos[chave] = _estilo(cor, borda)
	p.add_theme_stylebox_override("panel", _estilos[chave])


func atualizar() -> void:
	for p in barra_slots:
		_pintar(p)
	for p in grade.get_children():
		_pintar(p)
	for p in grade_barra.get_children():
		_pintar(p)
	for p in grade_bau.get_children():
		_pintar(p)
	if aberto and col_fab.visible:
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
	t.custom_minimum_size = Vector2(400, 0)
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
	if not on:
		bau_inv = null
		col_fab.visible = true
		col_bau.visible = false
	main.jogador.preso = on or menu_aberto
	_mouse()
	atualizar()


func aviso(txt: String, tempo := 2.4) -> void:
	var l := _lbl(txt, 16)
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	l.custom_minimum_size = Vector2(310, 0)
	avisos.add_child(l)
	while avisos.get_child_count() > 7:
		var velho := avisos.get_child(0)
		avisos.remove_child(velho)
		velho.queue_free()
	var tw := create_tween()
	tw.tween_interval(tempo)
	tw.tween_property(l, "modulate:a", 0.0, 0.8)
	tw.tween_callback(l.queue_free)


func dano() -> void:
	flash.color.a = 0.35
	var tw := create_tween()
	tw.tween_property(flash, "color:a", 0.0, 0.5)


func mostrar_morte(on: bool) -> void:
	morte.visible = on
	bt_saco.visible = on and main.construcao.sacos.size() > 0
	_mouse()


func _process(_dt: float) -> void:
	if Input.is_action_just_pressed("sair"):
		if aberto:
			abrir(false)
		elif not morte.visible:
			abrir_menu(not menu_aberto)
	if Input.is_action_just_pressed("tela_cheia"):
		_mudou_tela(not bool(opcoes["tela_cheia"]))
		var tc := menu.find_child("TelaCheia", true, false) as CheckBox
		if tc:
			tc.set_pressed_no_signal(bool(opcoes["tela_cheia"]))
	if fps_lbl.visible:
		fps_lbl.text = "FPS %d" % Engine.get_frames_per_second()
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
