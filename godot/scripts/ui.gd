class_name UI
extends CanvasLayer
## Tela do jogo: mira, aviso do que a mira pega, relógio, avisos de coleta, barras (vida, fome, sede), barra de atalhos com
## os ícones do jogo antigo, a barra da construção (com o plano na mão), a mochila (Tab) com a roupa, o detalhe do item e a
## fabricação por abas (ou o baú aberto), o menu de pausa e a tela de morte.

var main: Node
var mira_lbl: Label
var relogio: Label
var avisos: VBoxContainer
var barras := {}
var barra_slots: Array = []
var painel: PanelContainer
var grade: GridContainer
var grade_barra: HBoxContainer
var grade_roupa: GridContainer
var lista_fab: VBoxContainer
var abas_fab: HBoxContainer
var aba_fab := "todas"
var so_da := false
var morte: PanelContainer
var flash: ColorRect
var bt_saco: Button
var escolhido := -1
var escolhido_dono := ""
var bau_inv: Inventario = null
var col_fab: VBoxContainer
var col_bau: VBoxContainer
var grade_bau: GridContainer
var titulo_bau: Label
var titulo_moch: Label
var det_ico: TextureRect
var det_nome: Label
var det_txt: Label
var det_botoes: HBoxContainer
var bt_melhora: Button
var obra_painel: PanelContainer
var obra_icones: HBoxContainer
var obra_txt: Label
var obra_aba: Label
var aberto := false
var menu: PanelContainer
var menu_aberto := false
var fps_lbl: Label
var opcoes := {"qualidade": 1, "sens": 1.0, "fps": true, "tela_cheia": true}
const CFG := "user://opcoes.cfg"
const QUALIDADES := ["Baixo (PC fraco)", "Médio", "Alto"]
const TAM := 56
const NOMES_ROUPA := {"cabeca": "Cabeça", "rosto": "Rosto", "camiseta": "Camiseta", "tronco": "Tronco", "maos": "Mãos",
	"cintura": "Cintura", "pernas": "Pernas", "pes": "Pés", "costas": "Costas"}
var _estilos := {}
var _fab_sujo := true


func _init(m: Node) -> void:
	main = m


func _estilo(cor := Color(0.07, 0.08, 0.07, 0.78), borda := Color(1, 1, 1, 0.06), margem := 6) -> StyleBoxFlat:
	var s := StyleBoxFlat.new()
	s.bg_color = cor
	s.border_color = borda
	s.set_border_width_all(1)
	s.set_corner_radius_all(4)
	s.content_margin_left = margem
	s.content_margin_right = margem
	s.content_margin_top = margem
	s.content_margin_bottom = margem
	return s


func _est(cor: Color, borda: Color, margem := 2) -> StyleBoxFlat:
	var chave := "%s|%s|%d" % [cor.to_html(), borda.to_html(), margem]
	if not _estilos.has(chave):
		_estilos[chave] = _estilo(cor, borda, margem)
	return _estilos[chave]


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
	_ancorar(mira_lbl, Control.PRESET_CENTER, Rect2(-320, 26, 640, 30))
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
	_ancorar(avisos, Control.PRESET_TOP_RIGHT, Rect2(-350, 16, 330, 300))
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
	_ancorar(hb, Control.PRESET_CENTER_BOTTOM, Rect2(-6 * 34, -80, 6 * 68, 64))
	hb.add_theme_constant_override("separation", 6)
	raiz.add_child(hb)
	for i in Inventario.BARRA:
		var s := _slot(i, true)
		hb.add_child(s)
		barra_slots.append(s)
	_montar_obras(raiz)
	_montar_mochila(raiz)
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
	bt_saco.text = "Renascer no saco de dormir / na cama"
	bt_saco.pressed.connect(func(): main.renascer(true))
	mv.add_child(bt_saco)
	var bt := Button.new()
	bt.text = "Renascer na mata (começo)"
	bt.pressed.connect(func(): main.renascer(false))
	mv.add_child(bt)
	raiz.add_child(morte)
	_montar_menu(raiz)
	main.jogador.inv.mudou.connect(atualizar)
	atualizar()


## barra da construção: as peças da aba (Q troca), a escolhida em destaque, o custo e o que falta
func _montar_obras(raiz: Control) -> void:
	obra_painel = PanelContainer.new()
	obra_painel.add_theme_stylebox_override("panel", _estilo(Color(0.05, 0.06, 0.05, 0.86)))
	_ancorar(obra_painel, Control.PRESET_CENTER_BOTTOM, Rect2(-430, -196, 860, 108))
	obra_painel.visible = false
	obra_painel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	raiz.add_child(obra_painel)
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 4)
	obra_painel.add_child(v)
	var topo := HBoxContainer.new()
	v.add_child(topo)
	obra_aba = _lbl("", 15, Color(1.0, 0.85, 0.5))
	topo.add_child(obra_aba)
	var dica := _lbl("   botão direito: próxima peça · Q: outra aba · R: gira · clique: constrói", 13, Color(0.7, 0.72, 0.68))
	topo.add_child(dica)
	obra_icones = HBoxContainer.new()
	obra_icones.add_theme_constant_override("separation", 4)
	v.add_child(obra_icones)
	obra_txt = _lbl("", 14)
	v.add_child(obra_txt)


func mostrar_obras(on: bool) -> void:
	if obra_painel == null:
		return
	obra_painel.visible = on
	if not on:
		return
	var c = main.construcao
	var aba_d: Dictionary = Dados.ABAS_OBRA[c.aba]
	obra_aba.text = "Construção · %s (%d/%d)" % [aba_d["nome"], c.aba + 1, Dados.ABAS_OBRA.size()]
	for k in obra_icones.get_children():
		k.queue_free()
	var t: Array = aba_d["t"]
	for i in t.size():
		var p := PanelContainer.new()
		var sel: bool = i == c.peca
		p.add_theme_stylebox_override("panel", _est(Color(0.12, 0.13, 0.1, 0.9) if sel else Color(0.07, 0.08, 0.07, 0.7),
			Color(1.0, 0.8, 0.35, 0.95) if sel else Color(1, 1, 1, 0.08)))
		p.custom_minimum_size = Vector2(46, 46)
		var tr := TextureRect.new()
		tr.texture = Dados.icone_item(str(t[i]))
		tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		tr.custom_minimum_size = Vector2(40, 40)
		if c.liberada(str(t[i])) != "":
			tr.modulate = Color(0.5, 0.5, 0.5, 0.6)
		p.add_child(tr)
		obra_icones.add_child(p)
	_texto_obra()


func _texto_obra() -> void:
	var c = main.construcao
	var id: String = c.id_atual()
	var ob := Dados.obra(id)
	var partes := []
	var inv: Inventario = main.jogador.inv
	var cus := Dados.custo(ob)
	for k in cus:
		var tem := inv.conta(k)
		partes.append("%s %d/%d" % [Dados.nome(k), tem, int(cus[k])])
	var falta: String = c.liberada(id)
	obra_txt.text = "%s · %s%s" % [str(ob.get("nome", id)), ", ".join(partes), ("   (%s)" % falta) if falta != "" else ""]
	obra_txt.add_theme_color_override("font_color", Color(0.92, 0.9, 0.84) if inv.tem(cus) and falta == "" else Color(1.0, 0.6, 0.5))


## mochila (Tab): à esquerda os bolsos, a mochila e a barra; no meio a roupa e o item escolhido; à direita a fabricação
## (ou o baú, quando ele está aberto)
func _montar_mochila(raiz: Control) -> void:
	painel = PanelContainer.new()
	painel.add_theme_stylebox_override("panel", _estilo(Color(0.06, 0.07, 0.06, 0.94), Color(1, 1, 1, 0.06), 10))
	_ancorar(painel, Control.PRESET_CENTER, Rect2(-620, -320, 1240, 640))
	painel.visible = false
	raiz.add_child(painel)
	var lados := HBoxContainer.new()
	lados.add_theme_constant_override("separation", 16)
	painel.add_child(lados)
	# esquerda: bolsos e mochila
	var esq := VBoxContainer.new()
	esq.add_theme_constant_override("separation", 6)
	lados.add_child(esq)
	titulo_moch = _lbl("Bolsos e mochila", 19)
	esq.add_child(titulo_moch)
	grade = GridContainer.new()
	grade.columns = 8
	grade.add_theme_constant_override("h_separation", 4)
	grade.add_theme_constant_override("v_separation", 4)
	esq.add_child(grade)
	for i in range(Inventario.BARRA, Inventario.MAXIMO):
		grade.add_child(_slot(i, false))
	esq.add_child(_lbl("Barra de atalhos (1 a 6)", 14, Color(0.7, 0.7, 0.66)))
	grade_barra = HBoxContainer.new()
	grade_barra.add_theme_constant_override("separation", 4)
	esq.add_child(grade_barra)
	for i in Inventario.BARRA:
		grade_barra.add_child(_slot(i, false))
	var ajuda := _lbl("Clique escolhe o item; clique em outro espaço troca de lugar. Botão direito: usa, veste ou passa para o baú.", 12, Color(0.62, 0.63, 0.58))
	ajuda.autowrap_mode = TextServer.AUTOWRAP_WORD
	ajuda.custom_minimum_size = Vector2(470, 0)
	esq.add_child(ajuda)
	# meio: roupa e o item escolhido
	var meio := VBoxContainer.new()
	meio.custom_minimum_size = Vector2(290, 0)
	meio.add_theme_constant_override("separation", 6)
	lados.add_child(meio)
	meio.add_child(_lbl("Roupa", 19))
	grade_roupa = GridContainer.new()
	grade_roupa.columns = 3
	grade_roupa.add_theme_constant_override("h_separation", 4)
	grade_roupa.add_theme_constant_override("v_separation", 2)
	meio.add_child(grade_roupa)
	for lugar in Dados.SLOTS:
		var v := VBoxContainer.new()
		v.add_theme_constant_override("separation", 0)
		v.add_child(_slot(-1, false, "roupa:" + str(lugar)))
		var nl := _lbl(str(NOMES_ROUPA.get(lugar, lugar)), 11, Color(0.6, 0.62, 0.58))
		v.add_child(nl)
		grade_roupa.add_child(v)
	var det := PanelContainer.new()
	det.add_theme_stylebox_override("panel", _estilo(Color(0.09, 0.1, 0.09, 0.9)))
	det.size_flags_vertical = Control.SIZE_EXPAND_FILL
	meio.add_child(det)
	var dv := VBoxContainer.new()
	dv.add_theme_constant_override("separation", 6)
	det.add_child(dv)
	var dh := HBoxContainer.new()
	dv.add_child(dh)
	det_ico = TextureRect.new()
	det_ico.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	det_ico.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	det_ico.custom_minimum_size = Vector2(64, 64)
	dh.add_child(det_ico)
	det_nome = _lbl("", 17, Color(1.0, 0.9, 0.7))
	det_nome.autowrap_mode = TextServer.AUTOWRAP_WORD
	det_nome.custom_minimum_size = Vector2(200, 0)
	dh.add_child(det_nome)
	det_txt = _lbl("Escolha um item para ver o que ele faz.", 13, Color(0.82, 0.82, 0.78))
	det_txt.autowrap_mode = TextServer.AUTOWRAP_WORD
	det_txt.custom_minimum_size = Vector2(270, 0)
	dv.add_child(det_txt)
	det_botoes = HBoxContainer.new()
	det_botoes.add_theme_constant_override("separation", 6)
	dv.add_child(det_botoes)
	# direita: fabricação
	col_fab = VBoxContainer.new()
	col_fab.custom_minimum_size = Vector2(420, 0)
	col_fab.add_theme_constant_override("separation", 6)
	lados.add_child(col_fab)
	var tf := HBoxContainer.new()
	col_fab.add_child(tf)
	tf.add_child(_lbl("Fabricar", 19))
	var cb := CheckBox.new()
	cb.text = "só o que dá para fazer"
	cb.toggled.connect(_so_da)
	tf.add_child(cb)
	abas_fab = HBoxContainer.new()
	abas_fab.add_theme_constant_override("separation", 3)
	col_fab.add_child(abas_fab)
	for c in Dados.CATS:
		var ba := Button.new()
		ba.tooltip_text = str(c[1])
		ba.icon = Dados.icone("x_" + str(c[2]))
		ba.expand_icon = true
		ba.custom_minimum_size = Vector2(52, 40)
		ba.toggle_mode = true
		ba.button_pressed = str(c[0]) == aba_fab
		ba.pressed.connect(_mudar_aba.bind(str(c[0])))
		abas_fab.add_child(ba)
	bt_melhora = Button.new()
	bt_melhora.visible = false
	bt_melhora.pressed.connect(_melhorar)
	col_fab.add_child(bt_melhora)
	var rolar := ScrollContainer.new()
	rolar.custom_minimum_size = Vector2(420, 500)
	rolar.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	col_fab.add_child(rolar)
	lista_fab = VBoxContainer.new()
	lista_fab.add_theme_constant_override("separation", 3)
	lista_fab.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	rolar.add_child(lista_fab)
	# baú (aparece no lugar da fabricação quando você abre um baú)
	col_bau = VBoxContainer.new()
	col_bau.custom_minimum_size = Vector2(420, 0)
	col_bau.visible = false
	lados.add_child(col_bau)
	titulo_bau = _lbl("Baú", 19)
	col_bau.add_child(titulo_bau)
	grade_bau = GridContainer.new()
	grade_bau.columns = 7
	grade_bau.add_theme_constant_override("h_separation", 4)
	grade_bau.add_theme_constant_override("v_separation", 4)
	col_bau.add_child(grade_bau)
	for i in Inventario.MAXIMO:
		grade_bau.add_child(_slot(i, false, "bau"))
	var hbb := HBoxContainer.new()
	col_bau.add_child(hbb)
	var pegar := Button.new()
	pegar.text = "Pegar tudo"
	pegar.pressed.connect(_pegar_tudo)
	hbb.add_child(pegar)
	var guardar := Button.new()
	guardar.text = "Guardar os materiais"
	guardar.pressed.connect(_guardar_recursos)
	hbb.add_child(guardar)


func _so_da(on: bool) -> void:
	so_da = on
	atualizar()


func _mudar_aba(cid: String) -> void:
	aba_fab = cid
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
		"Botão esquerdo bater / comer / usar o item · E pegar, abrir, beber, cozinhar · Tab mochila e fabricação\n" +
		"1 a 6 ou rodinha: item na mão · com o plano: botão direito troca a peça, Q troca a aba, R gira · F5 salva", 14, Color(0.72, 0.74, 0.7))
	teclas.autowrap_mode = TextServer.AUTOWRAP_WORD
	teclas.custom_minimum_size = Vector2(620, 0)
	v.add_child(teclas)
	var hsv := HBoxContainer.new()
	hsv.add_theme_constant_override("separation", 8)
	v.add_child(hsv)
	var salvar := Button.new()
	salvar.text = "Salvar agora (F5)"
	salvar.pressed.connect(_salvar_jogo)
	hsv.add_child(salvar)
	var novo := Button.new()
	novo.text = "Começar de novo (apaga o jogo salvo)"
	novo.pressed.connect(_novo_jogo)
	hsv.add_child(novo)
	var cred := Button.new()
	cred.text = "Créditos dos modelos 3D"
	v.add_child(cred)
	var sair := Button.new()
	sair.text = "Sair do jogo"
	sair.pressed.connect(func(): get_tree().quit())
	v.add_child(sair)
	# créditos: os modelos escaneados com licença CC BY pedem o nome do autor na tela
	var painel := PanelContainer.new()
	painel.add_theme_stylebox_override("panel", _estilo(Color(0.04, 0.05, 0.04, 0.97)))
	_ancorar(painel, Control.PRESET_CENTER, Rect2(-360, -300, 720, 600))
	painel.visible = false
	raiz.add_child(painel)
	var vc := VBoxContainer.new()
	vc.add_theme_constant_override("separation", 8)
	painel.add_child(vc)
	vc.add_child(_lbl("Créditos dos modelos 3D", 22))
	var rolo := ScrollContainer.new()
	rolo.custom_minimum_size = Vector2(680, 470)
	vc.add_child(rolo)
	var txt := _lbl(_creditos(), 14, Color(0.8, 0.82, 0.78))
	txt.autowrap_mode = TextServer.AUTOWRAP_WORD
	txt.custom_minimum_size = Vector2(660, 0)
	rolo.add_child(txt)
	var volta := Button.new()
	volta.text = "Voltar"
	volta.pressed.connect(func(): painel.visible = false)
	vc.add_child(volta)
	cred.pressed.connect(func(): painel.visible = true)
	_aplicar_tudo()


func _creditos() -> String:
	var t := "Lugares escaneados (galpão, bunker, prédios, casa, ruína, carros, Base Militar):\n"
	var o = JSON.parse_string(FileAccess.get_file_as_string("res://dados/mapa/objetos3d.json"))
	if o is Dictionary and o.has("creditos"):
		for k in o["creditos"]["lugares"]:
			t += "  · %s\n" % str(o["creditos"]["lugares"][k])
	t += "\nPeças de fachada e telhado da cidade: Post Apocalypse Kitbash (versão gratuita), de Oleg Ushenok\n"
	t += "Árvores, plantas, pedras, móveis e objetos da rua: Poly Haven (CC0)\n"
	t += "Zumbi e animações: Mixamo\n"
	return t


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


func _salvar_jogo() -> void:
	aviso("Jogo salvo" if main.salvar_jogo() else "Não deu para salvar")


## apaga o jogo salvo e abre o mundo do começo
func _novo_jogo() -> void:
	main.apagar_salvo()
	get_tree().paused = false
	get_tree().reload_current_scene()


# ---------------------------------------------------------------- espaços (com o ícone do item, a quantidade e o desgaste)
func _slot(i: int, barra: bool, dono := "jog") -> PanelContainer:
	var p := PanelContainer.new()
	var tam := 60 if barra else TAM
	p.custom_minimum_size = Vector2(tam, tam)
	p.add_theme_stylebox_override("panel", _est(Color(0.07, 0.08, 0.07, 0.78), Color(1, 1, 1, 0.06)))
	var tr := TextureRect.new()
	tr.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	tr.mouse_filter = Control.MOUSE_FILTER_IGNORE
	p.add_child(tr)
	var n := _lbl("", 13, Color(1, 0.95, 0.8))
	n.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	n.vertical_alignment = VERTICAL_ALIGNMENT_BOTTOM
	n.mouse_filter = Control.MOUSE_FILTER_IGNORE
	p.add_child(n)
	var gasto := ColorRect.new()
	gasto.mouse_filter = Control.MOUSE_FILTER_IGNORE
	gasto.color = Color(0.4, 0.85, 0.35)
	gasto.custom_minimum_size = Vector2(0, 3)
	gasto.size_flags_vertical = Control.SIZE_SHRINK_END
	gasto.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	p.add_child(gasto)
	p.set_meta("i", i)
	p.set_meta("barra", barra)
	p.set_meta("dono", dono)
	if not barra:
		p.gui_input.connect(func(ev): _clique(ev, i, dono))
	return p


func _inv(dono: String) -> Inventario:
	return main.jogador.inv if dono == "jog" or dono.begins_with("roupa:") else bau_inv


func _pilha(dono: String, i: int):
	if dono.begins_with("roupa:"):
		return main.jogador.inv.roupa.get(dono.substr(6))
	var inv := _inv(dono)
	return inv.slots[i] if inv != null and i >= 0 and i < inv.slots.size() else null


func _clique(ev: InputEvent, i: int, dono: String) -> void:
	if not (ev is InputEventMouseButton and ev.pressed):
		return
	var b: int = ev.button_index
	if b == MOUSE_BUTTON_RIGHT:
		_rapido(i, dono)
		return
	if b != MOUSE_BUTTON_LEFT:
		return
	if dono.begins_with("roupa:"):
		var lugar := dono.substr(6)
		# um item da mochila escolhido e é roupa desse lugar: veste
		if escolhido >= 0 and escolhido_dono == "jog":
			var s = main.jogador.inv.slots[escolhido]
			if s != null and str(Dados.item(str(s["id"])).get("slot", "")) == lugar:
				var m: String = main.jogador.inv.vestir(escolhido)
				if m != "":
					aviso(m)
				escolhido = -1
				atualizar()
				return
		escolhido = -1
		_detalhe(dono, -1)
		escolhido_dono = dono
		atualizar()
		return
	var inv := _inv(dono)
	if inv == null or i >= inv.slots.size():
		return
	if escolhido < 0 or escolhido_dono.begins_with("roupa:"):
		if inv.slots[i] != null:
			escolhido = i
			escolhido_dono = dono
			_detalhe(dono, i)
	else:
		_mover(escolhido_dono, escolhido, dono, i)
		escolhido = -1
	atualizar()


## botão direito: com o baú aberto passa a pilha de um lado para o outro; sem baú, usa, come, bebe ou veste
func _rapido(i: int, dono: String) -> void:
	var j = main.jogador
	if dono.begins_with("roupa:"):
		var m: String = j.inv.despir(dono.substr(6))
		if m != "":
			aviso(m)
		atualizar()
		return
	var inv := _inv(dono)
	if inv == null or i < 0 or i >= inv.slots.size() or inv.slots[i] == null:
		return
	if bau_inv != null:
		var outro: Inventario = j.inv if dono == "bau" else bau_inv
		var s: Dictionary = inv.slots[i]
		inv.slots[i] = null
		if not outro.por_pilha(s):
			inv.slots[i] = s
			aviso("Não cabe")
		inv.mudou.emit()
		outro.mudou.emit()
		escolhido = -1
		atualizar()
		return
	_usar_slot(i)


func _usar_slot(i: int) -> void:
	var j = main.jogador
	var s = j.inv.slots[i]
	if s == null:
		return
	var d := Dados.item(str(s["id"]))
	var tp := str(d.get("tipo", ""))
	if tp in ["comida", "bebida", "cura"]:
		j.consumir_slot(i)
	elif tp == "roupa":
		var m: String = j.inv.vestir(i)
		if m != "":
			aviso(m)
	elif d.has("acao"):
		j.usar_item(i)
	escolhido = -1
	atualizar()


## troca dois espaços (até entre a mochila e o baú); se for o mesmo item, junta a pilha
func _mover(da: String, i: int, para: String, j: int) -> void:
	var a := _inv(da)
	var b := _inv(para)
	if a == null or b == null or (a == b and i == j):
		return
	if j >= b.limite and b == main.jogador.inv:
		aviso("Esse espaço só abre com uma mochila nas costas")
		return
	var x = a.slots[i]
	var y = b.slots[j]
	if x != null and y != null and x["id"] == y["id"] and not x.has("dur"):
		var mx := Dados.max_pilha(str(x["id"]))
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
	for i in range(Inventario.BARRA, inv.limite):
		var s = inv.slots[i]
		if s != null and str(Dados.item(str(s["id"])).get("tipo", "")) == "material":
			inv.slots[i] = null
			if not bau_inv.por_pilha(s):
				inv.slots[i] = s
	inv.mudou.emit()
	bau_inv.mudou.emit()


func _pegar_tudo() -> void:
	if bau_inv == null:
		return
	var inv: Inventario = main.jogador.inv
	for i in bau_inv.slots.size():
		var s = bau_inv.slots[i]
		if s != null:
			bau_inv.slots[i] = null
			if not inv.por_pilha(s):
				bau_inv.slots[i] = s
	inv.mudou.emit()
	bau_inv.mudou.emit()


func abrir_bau(inv: Inventario, titulo := "Baú") -> void:
	bau_inv = inv
	titulo_bau.text = titulo
	for k in grade_bau.get_child_count():
		(grade_bau.get_child(k) as Control).visible = k < inv.slots.size() and k < inv.limite
	if not inv.mudou.is_connected(atualizar):
		inv.mudou.connect(atualizar)
	col_fab.visible = false
	col_bau.visible = true
	abrir(true)


# ---------------------------------------------------------------- detalhe do item
func _detalhe(dono: String, i: int) -> void:
	for c in det_botoes.get_children():
		c.queue_free()
	var s = _pilha(dono, i)
	if s == null:
		det_ico.texture = null
		det_nome.text = ""
		det_txt.text = "Escolha um item para ver o que ele faz." if not dono.begins_with("roupa:") else "Nada vestido aqui. Escolha uma roupa na mochila e clique neste lugar."
		return
	var id := str(s["id"])
	var d := Dados.item(id)
	det_ico.texture = Dados.icone_item(id)
	det_nome.text = Dados.nome(id) + (("  x%d" % int(s["n"])) if int(s["n"]) > 1 else "")
	var L := [str(d.get("desc", ""))]
	var ef := []
	for k in [["fome", "Fome"], ["sede", "Sede"], ["vida", "Vida"]]:
		if float(d.get(k[0], 0.0)) != 0.0:
			ef.append("%s %+d" % [k[1], int(d[k[0]])])
	if not ef.is_empty():
		L.append(" · ".join(ef))
	if d.has("dano"):
		L.append("Dano %d · golpe a cada %.2f s%s%s" % [int(d["dano"]), float(d.get("tempo", 0.6)), " · corta árvore" if d.get("corta", false) else "", " · quebra rocha" if d.get("minera", false) else ""])
	if d.has("prot") and float(d["prot"]) > 0.0:
		L.append("Proteção %d%%" % roundi(float(d["prot"]) * 100.0))
	if d.has("espaco"):
		L.append("Mochila: +%d espaços" % int(d["espaco"]))
	if s.has("dur"):
		L.append("Estado: %d%%" % roundi(100.0 * float(s["dur"]) / maxf(1.0, float(d.get("durMax", 1.0)))))
	det_txt.text = "\n".join(L)
	if dono.begins_with("roupa:"):
		_botao("Tirar", _tirar.bind(dono.substr(6)))
		return
	if dono != "jog":
		return
	var tp := str(d.get("tipo", ""))
	if tp == "comida":
		_botao("Comer", func(): _usar_slot(i))
	elif tp == "bebida":
		_botao("Beber", func(): _usar_slot(i))
	elif tp == "cura":
		_botao("Usar", func(): _usar_slot(i))
	elif tp == "roupa":
		_botao("Vestir", func(): _usar_slot(i))
	elif d.has("acao"):
		_botao(str(d["acao"]), func(): _usar_slot(i))
	if s.has("dur") and float(s["dur"]) < float(d.get("durMax", 1.0)) and main.construcao.nivel_bancada_perto(main.jogador.global_position) > 0:
		_botao("Consertar (%s)" % Dados.custo_txt(Fabricacao.custo_conserto(id)), _consertar.bind(i))
	_botao("Largar", func(): _largar(i))


func _consertar(i: int) -> void:
	var m := Fabricacao.consertar_item(main.jogador, i)
	aviso("Consertado" if m == "" else m)
	_detalhe("jog", i)
	atualizar()


func _tirar(lugar: String) -> void:
	var m: String = main.jogador.inv.despir(lugar)
	if m != "":
		aviso(m)
	_detalhe("jog", -1)
	atualizar()


func _botao(txt: String, f: Callable) -> void:
	var b := Button.new()
	b.text = txt
	b.pressed.connect(f)
	det_botoes.add_child(b)


## larga a pilha no chão (num saquinho)
func _largar(i: int) -> void:
	var j = main.jogador
	var s = j.inv.slots[i]
	if s == null:
		return
	j.inv.slots[i] = null
	var inv := Inventario.new(12, false)
	inv.por_pilha(s)
	main.construcao.por_mochila(j.global_position - j.global_transform.basis.z * 0.8, inv, "Coisas no chão")
	j.inv.mudou.emit()
	escolhido = -1
	_detalhe("jog", -1)
	atualizar()


func _pintar(p: PanelContainer) -> void:
	var i: int = p.get_meta("i")
	var dono: String = p.get_meta("dono")
	var s = _pilha(dono, i)
	var tr: TextureRect = p.get_child(0)
	var n: Label = p.get_child(1)
	var gasto: ColorRect = p.get_child(2)
	if dono == "jog" and not p.get_meta("barra") and i >= main.jogador.inv.limite:
		p.visible = false
		return
	if dono == "bau" and (bau_inv == null or i >= bau_inv.limite):
		p.visible = false
		return
	p.visible = true
	if s == null:
		tr.texture = null
		n.text = ""
		gasto.custom_minimum_size.x = 0
		gasto.visible = false
	else:
		tr.texture = Dados.icone_item(str(s["id"]))
		n.text = str(int(s["n"])) if int(s["n"]) > 1 else ""
		if s.has("dur"):
			var f := clampf(float(s["dur"]) / maxf(1.0, float(Dados.item(str(s["id"])).get("durMax", 1.0))), 0.0, 1.0)
			gasto.visible = true
			gasto.custom_minimum_size.x = (p.custom_minimum_size.x - 6.0) * f
			gasto.color = Color(0.9, 0.3, 0.2) if f < 0.25 else (Color(0.95, 0.75, 0.25) if f < 0.5 else Color(0.4, 0.85, 0.35))
		else:
			gasto.visible = false
	var sel: bool = p.get_meta("barra") and i == main.jogador.sel
	var marcado := i == escolhido and dono == escolhido_dono
	var borda := Color(1.0, 0.8, 0.35, 0.95) if (sel or marcado) else Color(1, 1, 1, 0.08)
	var cor := Color(0.07, 0.08, 0.07, 0.78)
	if dono.begins_with("roupa:"):
		cor = Color(0.08, 0.09, 0.1, 0.85)
	p.add_theme_stylebox_override("panel", _est(cor, borda))


func atualizar() -> void:
	for p in barra_slots:
		_pintar(p)
	if not aberto:
		if main.construcao and main.construcao.ativo:
			_texto_obra()
		return
	var inv: Inventario = main.jogador.inv
	titulo_moch.text = "Bolsos e mochila (%d espaços)" % (inv.limite - Inventario.BARRA)
	for p in grade.get_children():
		_pintar(p)
	for p in grade_barra.get_children():
		_pintar(p)
	for v in grade_roupa.get_children():
		_pintar(v.get_child(0))
	if col_bau.visible:
		for p in grade_bau.get_children():
			_pintar(p)
	if col_fab.visible:
		_lista()


# ---------------------------------------------------------------- fabricação
func _lista() -> void:
	for c in lista_fab.get_children():
		c.queue_free()
	var j = main.jogador
	for k in abas_fab.get_child_count():
		(abas_fab.get_child(k) as Button).button_pressed = str(Dados.CATS[k][0]) == aba_fab
	# bancada nível 1 perto: dá para melhorar
	var nv: int = main.construcao.nivel_bancada_perto(j.global_position)
	bt_melhora.visible = nv == 1
	if nv == 1:
		var c := Dados.custo(Dados.MELHORA_BANCADA)
		bt_melhora.text = "Melhorar a bancada para o nível 2 (%s)" % Dados.custo_txt(c)
		bt_melhora.disabled = not j.inv.tem(c)
	for r in Dados.RECEITAS:
		if aba_fab != "todas" and str(r.get("cat", "")) != aba_fab:
			continue
		var motivo := Fabricacao.pode(r, j)
		var trancada := Fabricacao.motivo_trancada(r, j)
		if so_da and motivo != "":
			continue
		lista_fab.add_child(_linha_receita(r, motivo, trancada))


func _linha_receita(r: Dictionary, motivo: String, trancada: String) -> Control:
	var j = main.jogador
	var p := PanelContainer.new()
	p.add_theme_stylebox_override("panel", _est(Color(0.09, 0.1, 0.09, 0.9) if motivo == "" else Color(0.07, 0.07, 0.07, 0.75), Color(1, 1, 1, 0.05), 4))
	var h := HBoxContainer.new()
	h.add_theme_constant_override("separation", 8)
	p.add_child(h)
	var ic := TextureRect.new()
	ic.texture = Dados.icone_item(str(r["faz"]))
	ic.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	ic.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	ic.custom_minimum_size = Vector2(42, 42)
	if trancada != "":
		ic.modulate = Color(0.45, 0.45, 0.45, 0.7)
	h.add_child(ic)
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 0)
	v.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	h.add_child(v)
	var n := int(r.get("n", 1))
	v.add_child(_lbl(Fabricacao.nome(r) + ((" ×%d" % n) if n > 1 else ""), 14, Color(0.95, 0.92, 0.85) if motivo == "" else Color(0.7, 0.7, 0.66)))
	if trancada != "":
		v.add_child(_lbl(trancada, 12, Color(0.75, 0.6, 0.45)))
	else:
		var c := Fabricacao.custo_real(r, j.inv)
		var partes := []
		for k in c:
			partes.append("%s %d/%d" % [Dados.nome(k), j.inv.conta(k), int(c[k])])
		var lc := _lbl(", ".join(partes), 12, Color(0.75, 0.8, 0.72) if j.inv.tem(c) else Color(0.95, 0.6, 0.5))
		lc.autowrap_mode = TextServer.AUTOWRAP_WORD
		lc.custom_minimum_size = Vector2(250, 0)
		v.add_child(lc)
		var e := Dados.estacao(r)
		if e != "":
			v.add_child(_lbl("Na " + Dados.nome_estacao(e).to_lower(), 11, Color(0.6, 0.75, 0.9) if main.construcao.estacao_perto(e, j.global_position) else Color(0.9, 0.55, 0.45)))
	var b := Button.new()
	b.text = "Fazer"
	b.disabled = motivo != ""
	b.tooltip_text = motivo
	b.pressed.connect(func(): main.fabricar(r))
	h.add_child(b)
	return p


func _melhorar() -> void:
	var m: String = main.construcao.melhorar_bancada(main.jogador.inv, main.jogador.global_position)
	aviso("Bancada de trabalho agora é nível 2" if m == "" else m)
	atualizar()


func desbloqueada(r: Dictionary) -> bool:
	return Fabricacao.desbloqueada(r, main.jogador)


func abrir(on: bool) -> void:
	aberto = on
	painel.visible = on
	escolhido = -1
	if not on:
		if bau_inv != null:
			main.construcao.fechou_bau(bau_inv)
		bau_inv = null
		col_fab.visible = true
		col_bau.visible = false
	else:
		_detalhe("jog", -1)
	main.jogador.preso = on or menu_aberto
	_mouse()
	atualizar()


func aviso(txt: String, tempo := 2.4) -> void:
	var l := _lbl(txt, 16)
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	l.custom_minimum_size = Vector2(330, 0)
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
	if main.construcao.ativo and obra_painel.visible:
		_texto_obra()
	for p in barra_slots:
		_pintar(p)
