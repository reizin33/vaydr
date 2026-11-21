class_name HudRede
extends VBoxContainer
## A partida em rede no jogo (o #lan-hud do jogo antigo): "EM REDE · 3 JOGANDO", quem está, o bate-papo (as últimas mensagens,
## que somem depois de um tempo; com a caixa aberta aparecem todas) e a caixa de texto: Enter abre, Enter manda, Esc fecha.
## /ir vai até quem abriu; /ir Nome, até essa pessoa. Fica embaixo à esquerda, em cima dos comandos.

const SOME := 14000   # ms até a mensagem sumir (com a caixa fechada)

var main
var topo: Label
var nomes: Label
var linhas: VBoxContainer
var campo: LineEdit
var _t := 0.0
var _k := ""


func _init(m) -> void:
	main = m


func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_theme_constant_override("separation", 4)
	custom_minimum_size = Vector2(340, 0)
	topo = Estilo.rotulo_hud("", 11, Color(0.56, 0.79, 1.0), "ui", 800, 2)
	add_child(topo)
	nomes = Estilo.rotulo_hud("", 12, Color(0.765, 0.78, 0.733), "ui", 600)
	nomes.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	add_child(nomes)
	linhas = VBoxContainer.new()
	linhas.add_theme_constant_override("separation", 3)
	linhas.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(linhas)
	campo = LineEdit.new()
	campo.max_length = 160
	campo.placeholder_text = "Mensagem (Enter manda, Esc fecha) · /ir vai até quem abriu"
	campo.add_theme_font_size_override("font_size", 14)
	campo.add_theme_stylebox_override("normal", Estilo.caixa(Color(0.04, 0.055, 0.047, 0.88), Color(0.56, 0.79, 1.0, 0.6), 4, 9))
	campo.add_theme_stylebox_override("focus", Estilo.caixa(Color(0.04, 0.055, 0.047, 0.92), Color(0.56, 0.79, 1.0, 0.9), 4, 9))
	campo.mouse_filter = Control.MOUSE_FILTER_IGNORE
	campo.visible = false
	campo.context_menu_enabled = false
	campo.text_submitted.connect(_mandar)
	campo.gui_input.connect(_campo_tecla)
	campo.focus_exited.connect(func():
		if campo.visible:
			fechar())
	add_child(campo)
	Rede.mudou.connect(_atualizar)
	Rede.falou.connect(_atualizar)
	visible = false


## Enter abre a caixa (no jogo, sem menu aberto)
func _unhandled_key_input(ev: InputEvent) -> void:
	if not Rede.on or campo.visible or not (ev is InputEventKey) or not ev.pressed or ev.echo:
		return
	var k: int = (ev as InputEventKey).keycode
	if k != KEY_ENTER and k != KEY_KP_ENTER:
		return
	if not main.em_jogo or main.telas.atual != "" or main.ui.aberto or Rede.chat_acabou_de_fechar():
		return
	get_viewport().set_input_as_handled()
	abrir()


func abrir() -> void:
	campo.visible = true
	campo.text = ""
	campo.grab_focus()
	Rede.chat_aberto(true)
	main.telas._prender_jogador()
	_atualizar()


func fechar() -> void:
	campo.visible = false
	campo.release_focus()
	Rede.chat_aberto(false)
	main.telas._prender_jogador()
	_atualizar()


func _mandar(t: String) -> void:
	Rede.mandar_chat(t)
	fechar()


func _campo_tecla(ev: InputEvent) -> void:
	if ev is InputEventKey and ev.pressed and (ev as InputEventKey).keycode == KEY_ESCAPE:
		campo.accept_event()
		fechar()


func _process(dt: float) -> void:
	_t -= dt
	if _t <= 0.0:
		_t = 1.0
		_atualizar()


## o quadrinho: quem está e as últimas mensagens (as velhas somem com a caixa fechada)
func _atualizar() -> void:
	visible = Rede.on
	if not Rede.on:
		if campo.visible:
			fechar()
		return
	var L: Array = Rede.nomes()
	topo.text = "EM REDE · %d %s" % [L.size(), "JOGANDO" if L.size() > 1 else "JOGANDO (ESPERANDO OS AMIGOS)"]
	nomes.text = " · ".join(L)
	var agora := Time.get_ticks_msec()
	var mostra := []
	for c in Rede.chat.slice(-7):
		if campo.visible or agora - int(c["t"]) < SOME:
			mostra.append(c)
	var k := JSON.stringify(mostra) + str(campo.visible)
	if k == _k:
		return
	_k = k
	for f in linhas.get_children():
		f.queue_free()
	for c in mostra:
		var p := PanelContainer.new()
		var cx := Estilo.caixa(Color(0.04, 0.055, 0.047, 0.6), Color(0, 0, 0, 0), 3, 8)
		cx.content_margin_top = 3
		cx.content_margin_bottom = 3
		p.add_theme_stylebox_override("panel", cx)
		p.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var r := RichTextLabel.new()
		r.bbcode_enabled = true
		r.fit_content = true
		r.scroll_active = false
		r.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		r.mouse_filter = Control.MOUSE_FILTER_IGNORE
		r.add_theme_font_override("normal_font", Estilo.fonte("ui", 600))
		r.add_theme_font_override("bold_font", Estilo.fonte("ui", 800))
		r.add_theme_font_override("italics_font", Estilo.fonte("ui", 600))
		r.add_theme_font_size_override("normal_font_size", 13)
		r.add_theme_font_size_override("bold_font_size", 13)
		r.add_theme_font_size_override("italics_font_size", 13)
		r.add_theme_color_override("default_color", Color(0.91, 0.894, 0.847))
		var txt := str(c["txt"]).replace("[", "[lb]")
		if str(c["nome"]) == "":
			r.text = "[i][color=#a8bfd3]%s[/color][/i]" % txt
		else:
			r.text = "[b][color=#ffcf8a]%s:[/color][/b] %s" % [str(c["nome"]).replace("[", "[lb]"), txt]
		p.add_child(r)
		linhas.add_child(p)
