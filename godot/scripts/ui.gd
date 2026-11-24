class_name UI
extends CanvasLayer
## Tela do jogo: o HUD do jogo antigo (hud.gd: minimapa, bússola, relógio, comandos, barra rápida, vida, fome, sede,
## energia, avisos e mira), a barra da construção (com o plano na mão), a mochila (Tab) com a roupa, o detalhe do item e
## a fabricação por abas (ou o baú aberto). A pausa, o mapa, a morte e as telas de entrada ficam em telas.gd.

var main: Node
var hud: Hud
var painel: PanelContainer
var grade: GridContainer
var grade_barra: HBoxContainer
var grade_roupa: GridContainer
var lista_fab: VBoxContainer
var abas_fab: HBoxContainer
var aba_fab := "todas"
var so_da := false
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
	process_mode = Node.PROCESS_MODE_ALWAYS   # a mochila funciona com o jogo parado
	var raiz := Control.new()
	raiz.set_anchors_preset(Control.PRESET_FULL_RECT)
	raiz.mouse_filter = Control.MOUSE_FILTER_IGNORE
	raiz.theme = Estilo.tema()
	add_child(raiz)
	# o HUD do jogo antigo (minimapa, bússola, relógio, comandos, barra rápida, vida, fome, sede, energia, avisos, mira)
	hud = Hud.new(main)
	raiz.add_child(hud)
	_montar_obras(raiz)
	_montar_mochila(raiz)
	main.jogador.inv.mudou.connect(atualizar)
	atualizar()


## barra da construção: as peças da aba (Q troca), a escolhida em destaque, o custo e o que falta
func _montar_obras(raiz: Control) -> void:
	obra_painel = PanelContainer.new()
	obra_painel.add_theme_stylebox_override("panel", Estilo.caixa_hud(12, 10))
	obra_painel.visible = false
	obra_painel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	raiz.add_child(obra_painel)
	# em cima da barra rápida (que fica embaixo, no meio)
	Estilo.prender(obra_painel, 0.5, 1.0, 0, -80, Control.GROW_DIRECTION_BOTH, Control.GROW_DIRECTION_BEGIN)
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 4)
	obra_painel.add_child(v)
	var topo := HBoxContainer.new()
	v.add_child(topo)
	obra_aba = Estilo.rotulo("", 13, Estilo.BRASA, "ui", 800, 2)
	topo.add_child(obra_aba)
	var dica := Estilo.rotulo("   botão direito: próxima peça · Q: outra aba · R: gira · clique: constrói · B: sai", 12, Estilo.CINZA, "ui", 600)
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
	if hud != null:
		hud.modo_construcao(on)
	if not on:
		return
	var c = main.construcao
	var aba_d: Dictionary = Dados.ABAS_OBRA[c.aba]
	obra_aba.text = ("CONSTRUÇÃO · %s (%d/%d)" % [aba_d["nome"], c.aba + 1, Dados.ABAS_OBRA.size()]).to_upper()
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


## o mouse aparece com a mochila ou uma tela aberta; no jogo fica preso (a câmera vira com ele)
func _mouse() -> void:
	if main.modo_teste or not main.em_jogo:
		return
	Input.mouse_mode = Input.MOUSE_MODE_VISIBLE if (aberto or main.telas.atual != "") else Input.MOUSE_MODE_CAPTURED


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
	main.jogador.preso = on or main.telas.atual != ""
	_mouse()
	atualizar()


## os avisos do que acontece (no canto de baixo, à direita, em cima da vida)
func aviso(txt: String, tempo := 2.6) -> void:
	if hud != null:
		hud.aviso(txt, tempo)


## apanhou (de: de onde veio o golpe, para a seta vermelha)
func dano(de := Vector3.INF) -> void:
	if hud != null:
		hud.dano(de)


## o golpe (ou o tiro) acertou: a mira fica vermelha por um instante (na cabeça, o X maior)
func acerto(cabeca := false) -> void:
	if hud != null:
		hud.acerto(cabeca)


## a munição e o nome do item da mão mudaram (tiro, recarga): o HUD atualiza na hora
func hud_item() -> void:
	if hud != null:
		hud.atualizar_item()


func _process(_dt: float) -> void:
	if not main.em_jogo:
		return
	if main.construcao.ativo and obra_painel.visible:
		_texto_obra()
