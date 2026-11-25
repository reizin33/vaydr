class_name Telas
extends CanvasLayer
## As telas do jogo antigo (versão 10), refeitas no Godot com o mesmo desenho:
## - carregamento: o VAYDR à esquerda, a barra com a porcentagem de verdade e as etapas da montagem do mundo (terreno,
##   cidade, mata, lugares, sons), uma dica do jogo; à direita o sobrevivente de mochila; embaixo a versão;
## - "Quem vai jogar?": um perfil para cada pessoa deste computador (só o nome), cada um com os seus mundos;
## - lobby: quatro painéis altos (Jogar sozinho, Multiplayer, Personagem, Configurações); o do mouse se abre e mostra os
##   detalhes; em cima a marca e o perfil (Trocar); embaixo Como jogar, Créditos e Sair; teclas 1 a 4 e Enter;
## - Jogar sozinho: à esquerda o mundo escolhido em destaque (imagem, números grandes e o Jogar), à direita a lista dos
##   mundos e o Novo mundo; renomear e apagar (com confirmação);
## - Configurações por abas (Gráficos, Tela, Som, Mouse e mira, Controles) e o Pronto;
## - Personagem: a criação do personagem (TelaCriacao, criacao.gd), com o corpo de verdade no palco; o primeiro mundo de um
##   perfil passa por ela antes de começar;
## - Multiplayer: jogar junto na rede local (rede.gd): abrir a partida, entrar com o IP ou pela lista da rede, quem está;
## - no jogo: a pausa (Esc), o mapa grande (M), a tela de morte; e a passagem escura ao entrar no mundo.

const VERSAO := "0.8.0"
const DICAS := [
	"Com uma pedra na mão já dá para bater nas árvores e tirar madeira mais rápido.",
	"Aperte E para pegar, abrir, beber e revistar armários, gavetas e baús.",
	"O que fica guardado no baú não se perde quando você cai.",
	"As receitas abrem aos poucos: algumas aparecem quando você acha um material novo, outras com as folhas de receita.",
	"Ferramentas e armas gastam com o uso. Perto da bancada de trabalho dá para consertar.",
	"A água do rio e do lago é suja: ferva na fogueira antes de beber, ou arrisque uma dor de barriga.",
	"Para assar a carne crua, aperte E perto de uma fogueira acesa.",
	"De noite os zumbis correm. Uma cama ou um saco de dormir marcam onde você renasce.",
	"Estacas e arame farpado na frente da base machucam os zumbis que passam.",
	"O alarme de latas toca quando um zumbi encosta nele: ouça e corra para a base.",
	"Com o plano de construção na mão (B), o botão direito troca a peça, o Q troca a aba e o R gira.",
	"Correr gasta energia; andando ou parado ela volta. Pular também cansa.",
	"F acende a lanterna da mochila; a pilha acaba, e as pilhas novas recarregam.",
	"Aperte M para o mapa. O minimapa mostra os zumbis perto em vermelho.",
	"O jogo salva sozinho a cada 2 minutos, quando você fecha e no F5.",
	"Roupas seguram parte dos golpes, mas rasgam com o tempo: a fita adesiva remenda.",
]

static var ir_para := ""      # depois de recarregar a cena (Sair para o lobby): a tela que abre direto
static var mundo_pedido := ""   # depois de recarregar a cena para trocar de mundo: o mundo que abre direto

var main: Node
var raiz: Control
var telas := {}
var atual := ""
var anterior := ""
var _volta_ajustes := "lobby"
var _volta_ajuda := "lobby"
var _volta_mapa := ""
# carga
var cg_status: Label
var cg_pct: Label
var cg_barra: ColorRect
var cg_etapas: Array = []
var cg_dica: Label
var cg_rodape: Label
var cg_ver: Label          # a versão e a atualização automática (carregamento)
var lb_ver: Label          # (lobby)
var lb_reiniciar: Button   # "Reiniciar agora" quando a versão nova já baixou
var pz_atualiza: Button
var _dica_i := -1
var _dica_t := 0.0
var _carga_ok := false
# lobby
var lobby_cartoes: Array = []
var lobby_sel := 0
var _lobby_tw: Tween
# jogar sozinho
var sz_sel := ""
var sz_lista: VBoxContainer
var sz_destaque: Control
# login
var lg_grade: HFlowContainer
var lg_form: PanelContainer
var lg_nome: LineEdit
var _renomeando := {}
# ajustes
var aj_abas: VBoxContainer
var aj_corpo: VBoxContainer
var aj_aba := 0
# pausa
var pz_mundo: Label
var pz_onde: Label
var pz_relogio: Label
var pz_stats: HBoxContainer
var pz_aviso: Label
var pz_titulo: Label
# morte
var mt_texto: Label
var mt_stats: HBoxContainer
var mt_cama: Button
# mapa
var mapa: Control
# confirmação
var modal: Control
var modal_tit: Label
var modal_txt: Label
var modal_sim: Button
var _modal_f: Callable
# passagem escura
var veu: ColorRect
# criação do personagem
var cria: TelaCriacao


func _init(m: Node) -> void:
	main = m


func _ready() -> void:
	layer = 20
	process_mode = Node.PROCESS_MODE_ALWAYS
	raiz = Control.new()
	raiz.set_anchors_preset(Control.PRESET_FULL_RECT)
	raiz.mouse_filter = Control.MOUSE_FILTER_IGNORE
	raiz.theme = Estilo.tema()
	add_child(raiz)
	_tela_carga()
	_tela_login()
	_tela_lobby()
	_tela_sozinho()
	_tela_ajustes()
	_tela_multi()
	cria = TelaCriacao.new(self)
	raiz.add_child(cria)
	telas["criacao"] = cria
	_tela_ajuda()
	_tela_creditos()
	_tela_pausa()
	_tela_mapa()
	_tela_morte()
	_modal()
	Atualiza.mudou.connect(_atualiza_mudou)
	_atualiza_mudou()
	veu = ColorRect.new()
	veu.color = Color(0, 0, 0, 0)
	veu.set_anchors_preset(Control.PRESET_FULL_RECT)
	veu.mouse_filter = Control.MOUSE_FILTER_IGNORE
	raiz.add_child(veu)


## a atualização automática mudou (procurando, baixando, pronta...): o texto do rodapé e o botão de reiniciar
func _atualiza_mudou() -> void:
	var t: String = Atualiza.texto()
	var txt := "VERSÃO %s · GODOT · PC" % VERSAO + (("  ·  " + t) if t != "" else "")
	if cg_ver != null:
		cg_ver.text = txt
	if lb_ver != null:
		lb_ver.text = txt
	var pronta: bool = Atualiza.estado == "pronta"
	if lb_reiniciar != null:
		lb_reiniciar.visible = pronta
	if pz_atualiza != null:
		pz_atualiza.visible = pronta
	if pronta and main != null and main.em_jogo and main.ui != null:
		main.ui.aviso("A versão %s do VAYDR baixou: ela entra na próxima vez que você abrir o jogo (ou Reiniciar na versão nova, no Esc)" % Atualiza.versao_nova, 8.0)


# ================================================================ peças comuns
func _tela(nome: String, fundo := Estilo.FUNDO) -> Control:
	var t := Control.new()
	t.name = nome
	t.set_anchors_preset(Control.PRESET_FULL_RECT)
	t.mouse_filter = Control.MOUSE_FILTER_STOP
	t.visible = false
	if fundo.a > 0.0:
		var f := ColorRect.new()
		f.color = fundo
		f.set_anchors_preset(Control.PRESET_FULL_RECT)
		f.mouse_filter = Control.MOUSE_FILTER_IGNORE
		t.add_child(f)
	raiz.add_child(t)
	telas[nome] = t
	return t


## caixa com o traço cor de brasa só do lado esquerdo (o escolhido nas listas e nas abas)
func _so_esquerda(cor: Color, raio: int, margem: int) -> StyleBoxFlat:
	var b := Estilo.caixa(cor, Estilo.BRASA, raio, margem)
	b.border_width_top = 0
	b.border_width_right = 0
	b.border_width_bottom = 0
	b.border_width_left = 3
	return b


func _sombreado(codigo: String) -> ShaderMaterial:
	var sh := Shader.new()
	sh.code = "shader_type canvas_item;\n" + codigo
	var m := ShaderMaterial.new()
	m.shader = sh
	return m


## brilho quente embaixo (o fundo das telas do jogo antigo)
func _brilho(t: Control, centro := Vector2(0.45, 1.08), raio := Vector2(0.5, 0.42), forca := 0.32) -> void:
	var r := ColorRect.new()
	r.set_anchors_preset(Control.PRESET_FULL_RECT)
	r.mouse_filter = Control.MOUSE_FILTER_IGNORE
	r.material = _sombreado("""
uniform vec2 centro;
uniform vec2 raio;
uniform float forca;
void fragment() {
	float a = 1.0 - smoothstep(0.0, 1.0, length((UV - centro) / raio));
	COLOR = vec4(0.55, 0.27, 0.1, forca * a);
}""")
	(r.material as ShaderMaterial).set_shader_parameter("centro", centro)
	(r.material as ShaderMaterial).set_shader_parameter("raio", raio)
	(r.material as ShaderMaterial).set_shader_parameter("forca", forca)
	t.add_child(r)


func _foto(caminho: String) -> TextureRect:
	var f := TextureRect.new()
	f.texture = load(caminho)
	f.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	f.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	f.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return f


## botão de pílula (o "← LOBBY" e o "TROCAR")
func _pilula(txt: String) -> Button:
	var b := Button.new()
	b.text = txt
	b.focus_mode = Control.FOCUS_NONE
	b.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	b.add_theme_font_override("font", Estilo.fonte("ui", 800, 2))
	b.add_theme_font_size_override("font_size", 13)
	var n := Estilo.caixa(Color(1, 1, 1, 0.02), Estilo.BORDA_ALTA, 22, 16)
	n.content_margin_top = 9
	n.content_margin_bottom = 9
	var h := Estilo.caixa(Color(1, 1, 1, 0.07), Estilo.OSSO, 22, 16)
	h.content_margin_top = 9
	h.content_margin_bottom = 9
	b.add_theme_stylebox_override("normal", n)
	b.add_theme_stylebox_override("hover", h)
	b.add_theme_stylebox_override("pressed", h)
	b.add_theme_stylebox_override("focus", StyleBoxEmpty.new())
	return b


## o perfil no canto de cima (nome, quantos mundos e a letra no círculo)
func _perfil_canto(com_trocar: bool) -> HBoxContainer:
	var h := HBoxContainer.new()
	h.add_theme_constant_override("separation", 12)
	h.name = "Perfil"
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 2)
	v.alignment = BoxContainer.ALIGNMENT_CENTER
	h.add_child(v)
	var n := Estilo.rotulo("", 17, Estilo.OSSO, "ui", 800)
	n.name = "Nome"
	n.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	v.add_child(n)
	var s := Estilo.rotulo("", 12, Estilo.CINZA, "ui", 600)
	s.name = "Sub"
	s.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	v.add_child(s)
	var a := Avatar.new()
	a.name = "Avatar"
	a.custom_minimum_size = Vector2(44, 44)
	h.add_child(a)
	if com_trocar:
		var b := _pilula("TROCAR")
		b.pressed.connect(func(): mostrar("login"))
		h.add_child(b)
	return h


func _atualizar_perfis() -> void:
	var p: Dictionary = Perfis.atual
	var nome := str(p.get("nome", ""))
	var nm := (p.get("mundos", []) as Array).size()
	for t in telas.values():
		for pc in t.find_children("Perfil", "HBoxContainer", true, false):
			(pc.find_child("Nome", true, false) as Label).text = nome
			(pc.find_child("Sub", true, false) as Label).text = "%d mundo%s" % [nm, "" if nm == 1 else "s"]
			var av := pc.find_child("Avatar", true, false) as Avatar
			av.definir(nome, str(p.get("retrato", "")))


## a barra de cima das telas de dentro: ← LOBBY, o número e o nome do caminho na cor dele, e o perfil
func _barra_topo(t: Control, numero: String, titulo: String, cor: Color, volta: Callable, volta_txt := "LOBBY") -> void:
	var h := HBoxContainer.new()
	h.add_theme_constant_override("separation", 18)
	t.add_child(h)
	Estilo.encher(h, Vector2(0, 0), Vector2(1, 0), Vector2(44, 24), Vector2(-44, 72))
	var bv := _pilula("←  " + volta_txt)
	bv.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	bv.pressed.connect(volta)
	h.add_child(bv)
	var n := Estilo.rotulo(numero, 14, Estilo.OSSO, "ui", 800, 4)
	n.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	h.add_child(n)
	var tr := ColorRect.new()
	tr.color = cor
	tr.custom_minimum_size = Vector2(38, 2)
	tr.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	h.add_child(tr)
	var tt := Estilo.rotulo(titulo.to_upper(), 32, Estilo.OSSO, "titulo", 700, 3)
	tt.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	h.add_child(tt)
	var esp := Control.new()
	esp.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	h.add_child(esp)
	h.add_child(_perfil_canto(false))


# ================================================================ mostrar e esconder
func mostrar(nome: String) -> void:
	if atual == "criacao" and nome != "criacao":
		cria.fechar()
	if nome != atual:
		anterior = atual
	atual = nome
	for k in telas:
		(telas[k] as Control).visible = k == nome
	_prender_jogador()
	Rede.procurando = nome == "multi"
	match nome:
		"login":
			_montar_login()
		"lobby":
			_montar_lobby()
		"sozinho":
			_montar_sozinho()
		"ajustes":
			_montar_ajustes()
		"multi":
			_montar_multi()
	_atualizar_perfis()
	_mouse()


func esconder() -> void:
	if atual == "criacao":
		cria.fechar()
	anterior = atual
	atual = ""
	for k in telas:
		(telas[k] as Control).visible = false
	_prender_jogador()
	Rede.procurando = false
	_mouse()


## com uma tela aberta o jogador não anda nem gira (sozinho o jogo já está parado; na partida em rede o mundo continua)
func _prender_jogador() -> void:
	if main.jogador != null and main.ui != null:
		main.jogador.preso = atual != "" or main.ui.aberto or Rede.digitando


func _mouse() -> void:
	if main.modo_teste:
		return
	if atual != "":
		Input.mouse_mode = Input.MOUSE_MODE_VISIBLE
	elif main.em_jogo and main.ui != null and not main.ui.aberto:
		Input.mouse_mode = Input.MOUSE_MODE_CAPTURED


## depois de montar o mundo: o "Quem vai jogar?" (ou direto o lobby, se só tem um perfil ou se voltou de um mundo)
func entrada() -> void:
	Perfis.carregar()
	if ir_para != "" and not Perfis.atual.is_empty():
		var p := ir_para
		ir_para = ""
		mostrar(p)
		return
	if Perfis.lista().size() == 1:
		Perfis.escolher(Perfis.lista()[0])
		mostrar("lobby")
	else:
		mostrar("login")


# ================================================================ carregamento
func _tela_carga() -> void:
	var t := _tela("carga")
	var foto := _foto("res://assets/telas/lobby_multi.jpg")
	Estilo.encher(foto, Vector2(0.36, 0), Vector2(1, 1))
	t.add_child(foto)
	var deg := ColorRect.new()
	deg.set_anchors_preset(Control.PRESET_FULL_RECT)
	deg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	deg.material = _sombreado("""
void fragment() {
	float a = 1.0 - smoothstep(0.36, 0.6, UV.x);
	a = max(a, 0.18 * smoothstep(0.6, 1.0, UV.y));
	COLOR = vec4(0.043, 0.051, 0.055, a);
}""")
	t.add_child(deg)
	_brilho(t, Vector2(0.3, 1.1), Vector2(0.42, 0.38), 0.3)
	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 0)
	t.add_child(col)
	Estilo.prender(col, 0.0, 0.5, 80, -150, Control.GROW_DIRECTION_END, Control.GROW_DIRECTION_END)
	col.add_child(Estilo.rotulo("SOBREVIVER É CONSTRUIR", 12, Estilo.BRASA, "titulo", 700, 3))
	var logo := Estilo.rotulo("VAYDR", 104, Estilo.OSSO, "titulo", 700, 4)
	logo.add_theme_constant_override("line_spacing", -10)
	col.add_child(logo)
	col.add_child(Estilo.rotulo("EXPLORE · FABRIQUE · AGUENTE A NOITE", 12, Estilo.CINZA, "ui", 800, 3))
	var esp := Control.new()
	esp.custom_minimum_size = Vector2(0, 38)
	col.add_child(esp)
	var linha := HBoxContainer.new()
	linha.custom_minimum_size = Vector2(290, 0)
	col.add_child(linha)
	cg_status = Estilo.rotulo("MONTANDO O MUNDO", 11, Estilo.MUSGO, "ui", 800, 2)
	cg_status.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	linha.add_child(cg_status)
	cg_pct = Estilo.rotulo("0%", 12, Estilo.BRASA, "titulo", 700)
	linha.add_child(cg_pct)
	var trilho := ColorRect.new()
	trilho.color = Estilo.TRILHO
	trilho.custom_minimum_size = Vector2(290, 3)
	col.add_child(trilho)
	cg_barra = ColorRect.new()
	cg_barra.color = Estilo.BRASA
	cg_barra.size = Vector2(0, 3)
	trilho.add_child(cg_barra)
	var esp2 := Control.new()
	esp2.custom_minimum_size = Vector2(0, 9)
	col.add_child(esp2)
	var et := HBoxContainer.new()
	et.add_theme_constant_override("separation", 14)
	col.add_child(et)
	for nome in ["TERRENO", "CIDADE", "MATA", "LUGARES", "SONS"]:
		var l := Estilo.rotulo(nome, 10, Estilo.APAGADO, "ui", 800, 2)
		et.add_child(l)
		cg_etapas.append(l)
	var esp3 := Control.new()
	esp3.custom_minimum_size = Vector2(0, 40)
	col.add_child(esp3)
	var dica := PanelContainer.new()
	var cx := Estilo.caixa(Color(1, 1, 1, 0.035), Color(0, 0, 0, 0), 2, 12).duplicate() as StyleBoxFlat
	cx.border_color = Estilo.BRASA
	cx.border_width_left = 2
	cx.content_margin_left = 14
	dica.add_theme_stylebox_override("panel", cx)
	dica.custom_minimum_size = Vector2(300, 0)
	col.add_child(dica)
	var dh := HBoxContainer.new()
	dh.add_theme_constant_override("separation", 12)
	dica.add_child(dh)
	var dt := Estilo.rotulo("DICA", 10, Estilo.BRASA, "ui", 800, 3)
	dt.size_flags_vertical = Control.SIZE_SHRINK_BEGIN
	dh.add_child(dt)
	cg_dica = Estilo.rotulo("", 14, Estilo.OSSO, "ui", 500)
	cg_dica.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	cg_dica.custom_minimum_size = Vector2(240, 0)
	dh.add_child(cg_dica)
	var rod := Estilo.rotulo("VERSÃO %s · GODOT · PC" % VERSAO, 10, Estilo.APAGADO, "ui", 800, 2)
	t.add_child(rod)
	cg_ver = rod
	Estilo.prender(rod, 0.0, 1.0, 80, -22, Control.GROW_DIRECTION_END, Control.GROW_DIRECTION_BEGIN)
	cg_rodape = Estilo.rotulo("MONTANDO O MUNDO", 10, Estilo.APAGADO, "ui", 800, 2)
	t.add_child(cg_rodape)
	Estilo.prender(cg_rodape, 1.0, 1.0, -22, -22, Control.GROW_DIRECTION_BEGIN, Control.GROW_DIRECTION_BEGIN)
	_trocar_dica()


func _trocar_dica() -> void:
	_dica_i = (_dica_i + 1 + randi() % (DICAS.size() - 1)) % DICAS.size() if _dica_i >= 0 else randi() % DICAS.size()
	cg_dica.text = DICAS[_dica_i]
	_dica_t = 7.0


## etapa da montagem do mundo (0 terreno, 1 cidade, 2 mata, 3 lugares, 4 sons) e a porcentagem
func carga(etapa: int, texto: String, pct: float) -> void:
	cg_status.text = texto.to_upper()
	cg_pct.text = "%d%%" % roundi(pct)
	cg_barra.size = Vector2(290.0 * clampf(pct / 100.0, 0.0, 1.0), 3)
	for i in cg_etapas.size():
		var l: Label = cg_etapas[i]
		l.add_theme_color_override("font_color", Estilo.MUSGO if i < etapa else (Estilo.OSSO if i == etapa else Estilo.APAGADO))


func carga_pronta() -> void:
	_carga_ok = true
	carga(5, "Pronto", 100.0)
	cg_rodape.text = "MUNDO PRONTO"


# ================================================================ quem vai jogar
func _tela_login() -> void:
	var t := _tela("login")
	_brilho(t)
	var topo := HBoxContainer.new()
	topo.add_theme_constant_override("separation", 16)
	t.add_child(topo)
	Estilo.encher(topo, Vector2(0, 0), Vector2(1, 0), Vector2(44, 24), Vector2(-44, 72))
	_marca(topo)
	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 10)
	col.alignment = BoxContainer.ALIGNMENT_CENTER
	t.add_child(col)
	Estilo.encher(col, Vector2(0, 0), Vector2(1, 1), Vector2(60, 100), Vector2(-60, -60))
	var tit := Estilo.rotulo("Quem vai jogar?", 40, Estilo.OSSO, "titulo", 700)
	tit.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(tit)
	var sub := Estilo.rotulo("Cada pessoa tem o seu perfil neste computador, só com o nome, e nele ficam os mundos dela.", 15, Estilo.CINZA, "ui", 500)
	sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(sub)
	var esp := Control.new()
	esp.custom_minimum_size = Vector2(0, 26)
	col.add_child(esp)
	var cc := CenterContainer.new()
	col.add_child(cc)
	lg_grade = HFlowContainer.new()
	lg_grade.add_theme_constant_override("h_separation", 16)
	lg_grade.add_theme_constant_override("v_separation", 16)
	lg_grade.custom_minimum_size = Vector2(980, 0)
	lg_grade.alignment = FlowContainer.ALIGNMENT_CENTER
	cc.add_child(lg_grade)
	var cf := CenterContainer.new()
	col.add_child(cf)
	lg_form = PanelContainer.new()
	lg_form.add_theme_stylebox_override("panel", Estilo.caixa(Estilo.CARTAO, Estilo.BORDA, 14, 18))
	lg_form.visible = false
	cf.add_child(lg_form)
	var fh := HBoxContainer.new()
	fh.add_theme_constant_override("separation", 10)
	lg_form.add_child(fh)
	lg_nome = LineEdit.new()
	lg_nome.placeholder_text = "Seu nome"
	lg_nome.max_length = 20
	lg_nome.custom_minimum_size = Vector2(280, 44)
	lg_nome.add_theme_font_size_override("font_size", 17)
	lg_nome.text_submitted.connect(func(_t): _criar_perfil())
	fh.add_child(lg_nome)
	var bc := Estilo.botao("Criar perfil", true)
	bc.name = "Criar"
	bc.pressed.connect(_criar_perfil)
	fh.add_child(bc)
	var bx := Estilo.botao("Cancelar")
	bx.pressed.connect(func():
		lg_form.visible = false
		_renomeando = {}
		bc.text = "CRIAR PERFIL")
	fh.add_child(bx)
	var rod := HBoxContainer.new()
	t.add_child(rod)
	Estilo.prender(rod, 1.0, 1.0, -44, -24, Control.GROW_DIRECTION_BEGIN, Control.GROW_DIRECTION_BEGIN)
	var sair := Estilo.link("Sair do jogo")
	sair.pressed.connect(func(): get_tree().quit())
	rod.add_child(sair)


func _marca(onde: Container) -> void:
	var m := Estilo.rotulo("VAYDR", 40, Estilo.OSSO, "titulo", 700, 4)
	m.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	onde.add_child(m)
	var tr := ColorRect.new()
	tr.color = Estilo.BORDA_ALTA
	tr.custom_minimum_size = Vector2(1, 28)
	tr.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	onde.add_child(tr)
	var s := Estilo.rotulo("SOBREVIVER É CONSTRUIR", 12, Estilo.BRASA, "ui", 800, 4)
	s.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	onde.add_child(s)


func _montar_login() -> void:
	for c in lg_grade.get_children():
		c.queue_free()
	for p in Perfis.lista():
		lg_grade.add_child(_cartao_perfil(p))
	if Perfis.lista().size() < Perfis.MAX_PERFIS:
		var novo := Button.new()
		novo.custom_minimum_size = Vector2(200, 200)
		novo.size_flags_vertical = Control.SIZE_SHRINK_BEGIN
		novo.focus_mode = Control.FOCUS_NONE
		novo.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
		novo.text = "+\n\nNOVO PERFIL"
		novo.add_theme_font_override("font", Estilo.fonte("ui", 800, 2))
		novo.add_theme_font_size_override("font_size", 14)
		novo.add_theme_color_override("font_color", Estilo.CINZA)
		novo.add_theme_stylebox_override("normal", Estilo.caixa(Color(1, 1, 1, 0.015), Estilo.BORDA, 16, 12))
		novo.add_theme_stylebox_override("hover", Estilo.caixa(Color(1, 1, 1, 0.05), Estilo.BRASA, 16, 12))
		novo.add_theme_stylebox_override("pressed", Estilo.caixa(Color(1, 1, 1, 0.05), Estilo.BRASA, 16, 12))
		novo.pressed.connect(func():
			_renomeando = {}
			(lg_form.find_child("Criar", true, false) as Button).text = "CRIAR PERFIL"
			lg_form.visible = true
			lg_nome.text = ""
			lg_nome.grab_focus())
		lg_grade.add_child(novo)
	lg_form.visible = Perfis.lista().is_empty()
	if lg_form.visible:
		lg_nome.call_deferred("grab_focus")


func _cartao_perfil(p: Dictionary) -> Control:
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 6)
	var b := Button.new()
	b.custom_minimum_size = Vector2(200, 200)
	b.focus_mode = Control.FOCUS_NONE
	b.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	b.add_theme_stylebox_override("normal", Estilo.caixa(Estilo.CARTAO, Estilo.BORDA, 16, 12))
	b.add_theme_stylebox_override("hover", Estilo.caixa(Color(0.11, 0.12, 0.125, 0.95), Estilo.BRASA, 16, 12))
	b.add_theme_stylebox_override("pressed", Estilo.caixa(Color(0.11, 0.12, 0.125, 0.95), Estilo.BRASA, 16, 12))
	b.pressed.connect(func():
		Perfis.escolher(p)
		mostrar("lobby"))
	v.add_child(b)
	var dentro := VBoxContainer.new()
	dentro.alignment = BoxContainer.ALIGNMENT_CENTER
	dentro.add_theme_constant_override("separation", 8)
	dentro.mouse_filter = Control.MOUSE_FILTER_IGNORE
	b.add_child(dentro)
	Estilo.encher(dentro, Vector2(0, 0), Vector2(1, 1), Vector2(10, 10), Vector2(-10, -10))
	var cc := CenterContainer.new()
	cc.mouse_filter = Control.MOUSE_FILTER_IGNORE
	dentro.add_child(cc)
	var av := Avatar.new()
	av.custom_minimum_size = Vector2(84, 84)
	av.definir(str(p["nome"]), str(p.get("retrato", "")))
	cc.add_child(av)
	var n := Estilo.rotulo(str(p["nome"]), 19, Estilo.OSSO, "ui", 800)
	n.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	dentro.add_child(n)
	var nm := (p.get("mundos", []) as Array).size()
	var s := Estilo.rotulo("%d mundo%s · %s" % [nm, "" if nm == 1 else "s", Perfis.quando(float(p.get("usado", 0.0)))], 12, Estilo.CINZA, "ui", 600)
	s.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	dentro.add_child(s)
	var acoes := HBoxContainer.new()
	acoes.alignment = BoxContainer.ALIGNMENT_CENTER
	v.add_child(acoes)
	var rn := Estilo.link("Renomear", 12)
	rn.pressed.connect(_renomear_perfil.bind(p))
	acoes.add_child(rn)
	var ap := Estilo.link("Apagar", 12)
	ap.pressed.connect(_pedir_apagar_perfil.bind(p))
	acoes.add_child(ap)
	return v


## o mesmo quadro do perfil novo, já com o nome, troca o nome do perfil
func _renomear_perfil(p: Dictionary) -> void:
	_renomeando = p
	lg_form.visible = true
	lg_nome.text = str(p["nome"])
	lg_nome.grab_focus()
	lg_nome.select_all()
	(lg_form.find_child("Criar", true, false) as Button).text = "SALVAR NOME"


func _pedir_apagar_perfil(p: Dictionary) -> void:
	var nm := (p.get("mundos", []) as Array).size()
	confirmar("Apagar o perfil de %s?" % p["nome"], "Os %d mundos deste perfil e os jogos salvos deles somem. Não dá para desfazer." % nm,
		"Apagar perfil", _apagar_perfil.bind(p))


func _apagar_perfil(p: Dictionary) -> void:
	Perfis.apagar_perfil(p)
	_montar_login()


func _criar_perfil() -> void:
	var n := Perfis.limpar_nome(lg_nome.text)
	if n == "":
		lg_nome.placeholder_text = "Escreva um nome"
		return
	if not _renomeando.is_empty():
		Perfis.renomear_perfil(_renomeando, n)
		_renomeando = {}
		lg_form.visible = false
		(lg_form.find_child("Criar", true, false) as Button).text = "CRIAR PERFIL"
		_montar_login()
		return
	Perfis.novo_perfil(n)
	lg_form.visible = false
	mostrar("lobby")


# ================================================================ lobby
const CAMINHOS := [
	{"k": "sozinho", "n": "0 1", "tit": "Jogar sozinho", "sub": "Seus mundos, no seu ritmo. Cada mundo é uma partida separada.", "cor": Color(1.0, 0.541, 0.239),
		"img": "res://assets/telas/lobby_sozinho.jpg", "ir": "Entrar"},
	{"k": "multi", "n": "0 2", "tit": "Multiplayer", "sub": "Jogue com os amigos da mesma rede (ou pelo Radmin VPN).", "cor": Color(0.384, 0.722, 1.0),
		"img": "res://assets/telas/lobby_multi.jpg", "ir": "Jogar junto", "tag": "REDE LOCAL"},
	{"k": "pers", "n": "0 3", "tit": "Personagem", "sub": "Rosto, cabelo e corpo do seu sobrevivente.", "cor": Color(0.592, 0.78, 0.431),
		"img": "res://assets/telas/lobby_pers.jpg", "ir": "Criar personagem"},
	{"k": "ajustes", "n": "0 4", "tit": "Configurações", "sub": "Gráficos, resolução, som, sensibilidade, mira e controles.", "cor": Color(0.925, 0.894, 0.824),
		"img": "", "ir": "Abrir"},
]


func _tela_lobby() -> void:
	var t := _tela("lobby")
	_brilho(t)
	var topo := HBoxContainer.new()
	topo.add_theme_constant_override("separation", 16)
	t.add_child(topo)
	Estilo.encher(topo, Vector2(0, 0), Vector2(1, 0), Vector2(44, 22), Vector2(-44, 74))
	_marca(topo)
	var esp := Control.new()
	esp.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	topo.add_child(esp)
	topo.add_child(_perfil_canto(true))
	var fila := HBoxContainer.new()
	fila.add_theme_constant_override("separation", 16)
	t.add_child(fila)
	Estilo.encher(fila, Vector2(0, 0), Vector2(1, 1), Vector2(44, 96), Vector2(-44, -68))
	for i in CAMINHOS.size():
		var c := _cartao_lobby(i, CAMINHOS[i])
		fila.add_child(c)
		lobby_cartoes.append(c)
	var rod := HBoxContainer.new()
	rod.add_theme_constant_override("separation", 22)
	t.add_child(rod)
	Estilo.encher(rod, Vector2(0, 1), Vector2(1, 1), Vector2(44, -52), Vector2(-44, -16))
	var la := Estilo.link("Como jogar")
	la.pressed.connect(func():
		_volta_ajuda = "lobby"
		mostrar("ajuda"))
	rod.add_child(la)
	var lc := Estilo.link("Créditos")
	lc.pressed.connect(func(): mostrar("creditos"))
	rod.add_child(lc)
	var ls := Estilo.link("Sair do jogo")
	ls.pressed.connect(func(): get_tree().quit())
	rod.add_child(ls)
	var meio := Control.new()
	meio.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	rod.add_child(meio)
	var dica := HBoxContainer.new()
	dica.add_theme_constant_override("separation", 6)
	dica.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	dica.add_child(Estilo.tecla("1"))
	dica.add_child(Estilo.rotulo("–", 13, Estilo.CINZA))
	dica.add_child(Estilo.tecla("4"))
	dica.add_child(Estilo.rotulo("escolhem ·", 13, Estilo.CINZA))
	dica.add_child(Estilo.tecla("Enter"))
	dica.add_child(Estilo.rotulo("entra", 13, Estilo.CINZA))
	rod.add_child(dica)
	var meio2 := Control.new()
	meio2.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	rod.add_child(meio2)
	var ver := Estilo.rotulo("VERSÃO %s · GODOT · PC" % VERSAO, 11, Estilo.APAGADO, "ui", 800, 2)
	ver.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	rod.add_child(ver)
	lb_ver = ver
	lb_reiniciar = Estilo.botao("Reiniciar agora", true, 12)
	lb_reiniciar.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	lb_reiniciar.visible = false
	lb_reiniciar.pressed.connect(func(): Atualiza.reiniciar())
	rod.add_child(lb_reiniciar)


func _cartao_lobby(i: int, d: Dictionary) -> Control:
	var c := Panel.new()
	c.add_theme_stylebox_override("panel", Estilo.caixa(Color(0.07, 0.08, 0.085), Color(0, 0, 0, 0), 14, 0))
	c.clip_children = CanvasItem.CLIP_CHILDREN_AND_DRAW
	c.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	c.size_flags_vertical = Control.SIZE_EXPAND_FILL
	c.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	if str(d["img"]) != "":
		var img := _foto(str(d["img"]))
		img.set_anchors_preset(Control.PRESET_FULL_RECT)
		c.add_child(img)
		c.set_meta("img", img)
	else:
		var g := Grade.new()
		g.set_anchors_preset(Control.PRESET_FULL_RECT)
		c.add_child(g)
		var eng := TextureRect.new()
		eng.texture = _engrenagem(190)
		eng.modulate = Color(1, 1, 1, 0.3)
		eng.stretch_mode = TextureRect.STRETCH_KEEP_CENTERED
		eng.mouse_filter = Control.MOUSE_FILTER_IGNORE
		Estilo.encher(eng, Vector2(0, 0), Vector2(1, 0.62))
		c.add_child(eng)
	var veu_c := ColorRect.new()
	veu_c.set_anchors_preset(Control.PRESET_FULL_RECT)
	veu_c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	veu_c.material = _sombreado("""
uniform float topo = 0.25;
void fragment() {
	float a = mix(topo, 0.95, smoothstep(0.2, 0.92, UV.y));
	COLOR = vec4(0.043, 0.051, 0.055, a);
}""")
	c.add_child(veu_c)
	c.set_meta("veu", veu_c)
	var faixa := ColorRect.new()
	faixa.color = d["cor"]
	faixa.mouse_filter = Control.MOUSE_FILTER_IGNORE
	Estilo.encher(faixa, Vector2(0, 0), Vector2(1, 0), Vector2.ZERO, Vector2(0, 3))
	c.add_child(faixa)
	var num := Estilo.rotulo(str(d["n"]), 14, Color(0.925, 0.894, 0.824, 0.85), "ui", 800, 3)
	Estilo.prender(num, 0.0, 0.0, 26, 24)
	c.add_child(num)
	if d.has("tag"):
		var tg := PanelContainer.new()
		var tb := Estilo.caixa(Color(0.03, 0.05, 0.06, 0.7), Color(d["cor"], 0.7), 12, 10)
		tb.content_margin_top = 4
		tb.content_margin_bottom = 4
		tg.add_theme_stylebox_override("panel", tb)
		tg.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var tl := Estilo.rotulo(str(d["tag"]), 11, Estilo.OSSO, "ui", 800, 2)
		tg.add_child(tl)
		c.add_child(tg)
		Estilo.prender(tg, 1.0, 0.0, -20, 18, Control.GROW_DIRECTION_BEGIN, Control.GROW_DIRECTION_END)
	var baixo := VBoxContainer.new()
	baixo.add_theme_constant_override("separation", 10)
	baixo.mouse_filter = Control.MOUSE_FILTER_IGNORE
	c.add_child(baixo)
	Estilo.encher(baixo, Vector2(0, 1), Vector2(1, 1), Vector2(22, -30), Vector2(-22, -30))
	baixo.grow_vertical = Control.GROW_DIRECTION_BEGIN
	var tr := ColorRect.new()
	tr.color = d["cor"]
	tr.custom_minimum_size = Vector2(36, 3)
	tr.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	tr.mouse_filter = Control.MOUSE_FILTER_IGNORE
	baixo.add_child(tr)
	var tit := Estilo.rotulo(str(d["tit"]).to_upper(), 24, Estilo.OSSO, "titulo", 700, 2)
	tit.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	baixo.add_child(tit)
	var sub := Estilo.rotulo(str(d["sub"]), 15, Color(0.925, 0.894, 0.824, 0.88), "ui", 500)
	sub.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	baixo.add_child(sub)
	var extra := Estilo.rotulo("", 13, Estilo.CINZA, "ui", 600)
	extra.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	baixo.add_child(extra)
	var acao := Estilo.rotulo(str(d["ir"]).to_upper() + "   →", 13, Estilo.OSSO, "ui", 800, 3)
	baixo.add_child(acao)
	c.set_meta("tit", tit)
	c.set_meta("extra", extra)
	c.set_meta("acao", acao)
	var borda := Panel.new()
	borda.set_anchors_preset(Control.PRESET_FULL_RECT)
	borda.mouse_filter = Control.MOUSE_FILTER_IGNORE
	borda.add_theme_stylebox_override("panel", Estilo.caixa(Color(0, 0, 0, 0), Estilo.BORDA, 14, 0))
	c.add_child(borda)
	c.set_meta("borda", borda)
	c.mouse_entered.connect(func(): _lobby_escolher(i))
	c.gui_input.connect(func(ev: InputEvent):
		if ev is InputEventMouseButton and ev.pressed and ev.button_index == MOUSE_BUTTON_LEFT:
			_lobby_entrar(i))
	return c


func _engrenagem(px: int) -> Texture2D:
	var svg := "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#ece4d2\" stroke-width=\".35\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z\"/></svg>"
	var img := Image.new()
	if img.load_svg_from_string(svg, float(px) / 24.0) != OK:
		return null
	return ImageTexture.create_from_image(img)


func _montar_lobby() -> void:
	# o painel do Jogar sozinho diz o último mundo (Continuar) ou que ainda não tem nenhum
	var p: Dictionary = Perfis.atual
	var ms: Array = p.get("mundos", [])
	var ult := Perfis.mundo(p, str(p.get("ultimo_mundo", "")))
	var ex: Label = lobby_cartoes[0].get_meta("extra")
	if not ult.is_empty() and Perfis.tem_jogo(ult):
		ex.text = "Continuar: %s · dia %d" % [ult["nome"], int(ult.get("dia", 1))]
	elif ms.is_empty():
		ex.text = "Nenhum mundo ainda: comece o primeiro"
	else:
		ex.text = "%d mundo%s" % [ms.size(), "" if ms.size() == 1 else "s"]
	(lobby_cartoes[1].get_meta("extra") as Label).text = Rede.resumo()
	(lobby_cartoes[2].get_meta("extra") as Label).text = resumo_personagem(p)
	(lobby_cartoes[2].get_meta("acao") as Label).text = ("EDITAR PERSONAGEM" if p.has("ap") else "CRIAR PERSONAGEM") + "   →"
	(lobby_cartoes[3].get_meta("extra") as Label).text = "Gráficos: %s · Mouse: %.2f" % [Ajustes.QUALIDADES[clampi(int(Ajustes.v["qualidade"]), 0, 2)], float(Ajustes.v["sens"])]
	_lobby_escolher(lobby_sel, true)


func _lobby_escolher(i: int, ja := false) -> void:
	lobby_sel = i
	if _lobby_tw != null and _lobby_tw.is_valid():
		_lobby_tw.kill()
	_lobby_tw = create_tween().set_parallel(true).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
	for k in lobby_cartoes.size():
		var c: Control = lobby_cartoes[k]
		var aberto := k == i
		_lobby_tw.tween_property(c, "size_flags_stretch_ratio", 1.6 if aberto else 1.0, 0.0 if ja else 0.35)
		var tit: Label = c.get_meta("tit")
		tit.add_theme_font_size_override("font_size", 34 if aberto else 19)
		tit.add_theme_font_override("font", Estilo.fonte("titulo", 700, 2 if aberto else 1))
		(c.get_meta("extra") as Label).visible = aberto and (c.get_meta("extra") as Label).text != ""
		if c.has_meta("img"):
			var img: TextureRect = c.get_meta("img")
			img.pivot_offset = img.size * 0.5
			_lobby_tw.tween_property(img, "scale", Vector2(1.06, 1.06) if aberto else Vector2.ONE, 0.0 if ja else 0.6)
		((c.get_meta("veu") as ColorRect).material as ShaderMaterial).set_shader_parameter("topo", 0.08 if aberto else 0.35)
		(c.get_meta("borda") as Panel).add_theme_stylebox_override("panel", Estilo.caixa(Color(0, 0, 0, 0), Estilo.BORDA_ALTA if aberto else Estilo.BORDA, 14, 0))


func _lobby_entrar(i: int) -> void:
	match str(CAMINHOS[i]["k"]):
		"sozinho":
			mostrar("sozinho")
		"multi":
			mostrar("multi")
		"pers":
			abrir_criacao()
		"ajustes":
			_volta_ajustes = "lobby"
			mostrar("ajustes")


# ================================================================ jogar sozinho
func _tela_sozinho() -> void:
	var t := _tela("sozinho")
	_brilho(t)
	_barra_topo(t, "0 1", "Jogar sozinho", Estilo.BRASA, func(): mostrar("lobby"))
	var h := HBoxContainer.new()
	h.add_theme_constant_override("separation", 18)
	t.add_child(h)
	Estilo.encher(h, Vector2(0, 0), Vector2(1, 1), Vector2(44, 96), Vector2(-44, -30))
	sz_destaque = Panel.new()
	sz_destaque.add_theme_stylebox_override("panel", Estilo.caixa(Color(0.07, 0.08, 0.085), Color(0, 0, 0, 0), 14, 0))
	sz_destaque.clip_children = CanvasItem.CLIP_CHILDREN_AND_DRAW
	sz_destaque.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	sz_destaque.size_flags_stretch_ratio = 1.6
	h.add_child(sz_destaque)
	var dir := VBoxContainer.new()
	dir.add_theme_constant_override("separation", 10)
	dir.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	h.add_child(dir)
	sz_rede = Estilo.rotulo("", 13, Estilo.AGUA, "ui", 700)
	sz_rede.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	sz_rede.visible = false
	dir.add_child(sz_rede)
	var cab := HBoxContainer.new()
	dir.add_child(cab)
	var ct := Estilo.rotulo("SEUS MUNDOS", 12, Estilo.CINZA, "ui", 800, 3)
	ct.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	cab.add_child(ct)
	var cn := Estilo.rotulo("", 12, Estilo.APAGADO, "ui", 700)
	cn.name = "Conta"
	cab.add_child(cn)
	var rol := ScrollContainer.new()
	rol.size_flags_vertical = Control.SIZE_EXPAND_FILL
	rol.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	dir.add_child(rol)
	sz_lista = VBoxContainer.new()
	sz_lista.add_theme_constant_override("separation", 8)
	sz_lista.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	rol.add_child(sz_lista)
	var bn := Estilo.botao("+  Novo mundo", true, 15)
	bn.custom_minimum_size = Vector2(0, 50)
	bn.name = "Novo"
	bn.pressed.connect(_novo_mundo)
	dir.add_child(bn)
	var nota := Estilo.rotulo("Começa no dia 1, de mão vazia (nada de item de graça).", 12, Estilo.APAGADO, "ui", 600)
	nota.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	dir.add_child(nota)


func _montar_sozinho() -> void:
	var p: Dictionary = Perfis.atual
	var ms: Array = p.get("mundos", [])
	if sz_sel == "" or Perfis.mundo(p, sz_sel).is_empty():
		sz_sel = str(p.get("ultimo_mundo", ""))
		if Perfis.mundo(p, sz_sel).is_empty() and not ms.is_empty():
			sz_sel = str(ms[ms.size() - 1]["id"])
	for c in sz_lista.get_children():
		c.queue_free()
	var ordem := ms.duplicate()
	ordem.sort_custom(func(a, b): return float(a.get("usado", 0.0)) > float(b.get("usado", 0.0)))
	for m in ordem:
		sz_lista.add_child(_linha_mundo(m))
	if ms.is_empty():
		var vazio := Estilo.rotulo("Você ainda não tem mundos. Aperte \"Novo mundo\" para começar o primeiro.", 14, Estilo.CINZA, "ui", 500)
		vazio.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		sz_lista.add_child(vazio)
	sz_rede.visible = Rede.on
	if Rede.on:
		sz_rede.text = "EM REDE · %s. Escolha um mundo seu para jogar junto." % Rede.resumo()
	var conta := telas["sozinho"].find_child("Conta", true, false) as Label
	conta.text = "%d de %d" % [ms.size(), Perfis.MAX_MUNDOS]
	(telas["sozinho"].find_child("Novo", true, false) as Button).disabled = ms.size() >= Perfis.MAX_MUNDOS
	_montar_destaque()


func _linha_mundo(m: Dictionary) -> Control:
	var sel := str(m["id"]) == sz_sel
	var b := Button.new()
	b.custom_minimum_size = Vector2(0, 64)
	b.focus_mode = Control.FOCUS_NONE
	b.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	var n := Estilo.caixa(Estilo.CARTAO, Color(1, 1, 1, 0.06), 10, 14)
	var s := _so_esquerda(Color(0.12, 0.1, 0.085, 0.95), 10, 14)
	b.add_theme_stylebox_override("normal", s if sel else n)
	b.add_theme_stylebox_override("hover", s if sel else Estilo.caixa(Color(0.1, 0.11, 0.115, 0.95), Estilo.BORDA_ALTA, 10, 14))
	b.add_theme_stylebox_override("pressed", s)
	b.pressed.connect(func():
		sz_sel = str(m["id"])
		_montar_sozinho())
	var v := VBoxContainer.new()
	v.mouse_filter = Control.MOUSE_FILTER_IGNORE
	v.add_theme_constant_override("separation", 3)
	b.add_child(v)
	Estilo.encher(v, Vector2(0, 0), Vector2(1, 1), Vector2(16, 11), Vector2(-14, -10))
	v.add_child(Estilo.rotulo(str(m["nome"]), 17, Estilo.OSSO, "ui", 800))
	var info := "Dia %d · %s · %s" % [int(m.get("dia", 1)), Perfis.duracao(float(m.get("tempo", 0.0))), Perfis.quando(float(m.get("usado", 0.0)))] \
		if Perfis.tem_jogo(m) else "Ainda não começou"
	v.add_child(Estilo.rotulo(info, 12, Estilo.CINZA, "ui", 600))
	return b


func _montar_destaque() -> void:
	for c in sz_destaque.get_children():
		c.queue_free()
	var p: Dictionary = Perfis.atual
	var m := Perfis.mundo(p, sz_sel)
	var img := _foto("res://assets/telas/lobby_sozinho.jpg")
	img.set_anchors_preset(Control.PRESET_FULL_RECT)
	sz_destaque.add_child(img)
	var vc := ColorRect.new()
	vc.set_anchors_preset(Control.PRESET_FULL_RECT)
	vc.mouse_filter = Control.MOUSE_FILTER_IGNORE
	vc.material = _sombreado("""
void fragment() {
	float a = mix(0.15, 0.95, smoothstep(0.15, 0.85, UV.y));
	a = max(a, 0.55 * (1.0 - smoothstep(0.0, 0.6, UV.x)) * smoothstep(0.3, 0.9, UV.y));
	COLOR = vec4(0.043, 0.051, 0.055, a);
}""")
	sz_destaque.add_child(vc)
	var faixa := ColorRect.new()
	faixa.color = Estilo.BRASA
	faixa.mouse_filter = Control.MOUSE_FILTER_IGNORE
	Estilo.encher(faixa, Vector2(0, 0), Vector2(1, 0), Vector2.ZERO, Vector2(0, 3))
	sz_destaque.add_child(faixa)
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 12)
	sz_destaque.add_child(v)
	Estilo.encher(v, Vector2(0, 1), Vector2(1, 1), Vector2(34, -34), Vector2(-34, -34))
	v.grow_vertical = Control.GROW_DIRECTION_BEGIN
	if m.is_empty():
		v.add_child(Estilo.rotulo("COMECE O SEU PRIMEIRO MUNDO", 12, Estilo.BRASA, "ui", 800, 3))
		var t := Estilo.rotulo("Você acorda na mata, sem nada.", 34, Estilo.OSSO, "titulo", 700)
		t.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		v.add_child(t)
		var s := Estilo.rotulo("Junte pedras, galhos e fibras, faça o machado e a picareta, levante a base e aguente a noite.", 15, Estilo.CINZA, "ui", 500)
		s.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		v.add_child(s)
		var b := Estilo.botao("Novo mundo", true, 16)
		b.custom_minimum_size = Vector2(240, 54)
		b.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
		b.pressed.connect(_novo_mundo)
		v.add_child(b)
		return
	var tem := Perfis.tem_jogo(m)
	v.add_child(Estilo.rotulo("MUNDO ESCOLHIDO" if tem else "MUNDO NOVO", 12, Estilo.BRASA, "ui", 800, 3))
	var nome := Estilo.rotulo(str(m["nome"]), 44, Estilo.OSSO, "titulo", 700)
	nome.name = "NomeMundo"
	v.add_child(nome)
	var edita := HBoxContainer.new()
	edita.add_theme_constant_override("separation", 8)
	edita.visible = false
	v.add_child(edita)
	var campo := LineEdit.new()
	campo.max_length = 24
	campo.custom_minimum_size = Vector2(320, 44)
	campo.text = str(m["nome"])
	edita.add_child(campo)
	var ok := Estilo.botao("Pronto", true)
	edita.add_child(ok)
	var salvar_nome := func():
		Perfis.renomear_mundo(p, m, campo.text)
		_montar_sozinho()
	ok.pressed.connect(salvar_nome)
	campo.text_submitted.connect(func(_t): salvar_nome.call())
	var nums := HBoxContainer.new()
	nums.add_theme_constant_override("separation", 34)
	v.add_child(nums)
	if tem:
		var h := float(m.get("hora", 7.0))
		nums.add_child(_numero(str(int(m.get("dia", 1))), "Dia"))
		nums.add_child(_numero("%02d:%02d" % [int(h), int((h - int(h)) * 60.0)], "Hora"))
		nums.add_child(_numero(Perfis.duracao(float(m.get("tempo", 0.0))), "Tempo jogado"))
		nums.add_child(_numero(Perfis.quando(float(m.get("usado", 0.0))), "Última vez"))
	else:
		nums.add_child(_numero("1", "Dia"))
		nums.add_child(_numero("07:00", "Hora"))
		nums.add_child(_numero("vazia", "Mochila"))
	var bts := HBoxContainer.new()
	bts.add_theme_constant_override("separation", 10)
	v.add_child(bts)
	var jg := Estilo.botao("Jogar" if tem else "Começar", true, 16)
	jg.custom_minimum_size = Vector2(220, 54)
	jg.pressed.connect(func(): jogar(m))
	bts.add_child(jg)
	var rn := Estilo.botao("Renomear")
	rn.custom_minimum_size = Vector2(0, 54)
	rn.pressed.connect(func():
		nome.visible = false
		edita.visible = true
		campo.grab_focus()
		campo.select_all())
	bts.add_child(rn)
	var ap := Estilo.botao("Apagar")
	ap.custom_minimum_size = Vector2(0, 54)
	ap.pressed.connect(_pedir_apagar_mundo.bind(m))
	bts.add_child(ap)


func _pedir_apagar_mundo(m: Dictionary) -> void:
	confirmar("Apagar o %s?" % m["nome"], "O jogo salvo deste mundo some (a base, a mochila, o dia). Não dá para desfazer.",
		"Apagar mundo", _apagar_mundo.bind(m))


func _apagar_mundo(m: Dictionary) -> void:
	Perfis.apagar_mundo(Perfis.atual, m)
	sz_sel = ""
	_montar_sozinho()


func _numero(valor: String, legenda: String) -> VBoxContainer:
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 2)
	v.add_child(Estilo.rotulo(valor, 28, Estilo.OSSO, "titulo", 700))
	v.add_child(Estilo.rotulo(legenda.to_upper(), 10, Estilo.CINZA, "ui", 800, 2))
	return v


func _novo_mundo() -> void:
	var m := Perfis.novo_mundo(Perfis.atual)
	sz_sel = str(m["id"])
	_montar_sozinho()


## a criação do personagem; f: o que fazer no Confirmar (entrar no mundo), de: para onde o Voltar leva
func abrir_criacao(f := Callable(), de := "lobby") -> void:
	cria.abrir(f, de)
	mostrar("criacao")


## o personagem do perfil em poucas palavras (o painel do lobby)
func resumo_personagem(p: Dictionary) -> String:
	if not p.has("ap"):
		return "Ainda não criado: comece por aqui"
	var ap := Corpo.limpa(p["ap"])
	var m := Corpo.mh_de(ap)
	var tipo := "Sobrevivente" if str(ap["corpo"]) != "mh" else ("Personalizada" if str(m["g"]) == "mulher" else "Personalizado")
	var nm := str(ap.get("nome", ""))
	return "%s%s · %s, %s" % [nm + " · " if nm != "" else "", tipo, Corpo.nome_op("g", str(m["g"]), str(m["g"])).to_lower(), Corpo.altura_txt(ap, int(ap["altura"]))]


## entra no mundo: com a montagem feita, é só carregar o jogo salvo dele (ou começar do zero); o primeiro mundo de um perfil
## sem personagem passa antes pela criação (como o Novo jogo do jogo antigo)
func jogar(m: Dictionary) -> void:
	if not Perfis.atual.has("ap") and not main.modo_teste:
		abrir_criacao(jogar.bind(m), "sozinho")
		return
	if main.mundo_sujo:
		# já jogou outro mundo nesta montagem: monta de novo e entra direto
		Telas.mundo_pedido = str(m["id"])
		Telas.ir_para = ""
		get_tree().paused = false
		get_tree().reload_current_scene()
		return
	veu.color = Color(0, 0, 0, 0)
	var tw := create_tween()
	tw.tween_property(veu, "color:a", 1.0, 0.25)
	tw.tween_callback(_entrar.bind(m))
	tw.tween_interval(0.5)
	tw.tween_property(veu, "color:a", 0.0, 0.6)


func _entrar(m: Dictionary) -> void:
	esconder()
	main.comecar(m)


# ================================================================ configurações
const ABAS_AJ := [["Gráficos", "olho"], ["Tela", "mapa"], ["Som", "radio"], ["Mouse e mira", "alvo"], ["Controles", "grade"]]


func _tela_ajustes() -> void:
	var t := _tela("ajustes")
	_brilho(t)
	_barra_topo(t, "0 4", "Configurações", Estilo.OSSO, func(): _sair_ajustes(), "VOLTAR")
	aj_abas = VBoxContainer.new()
	aj_abas.add_theme_constant_override("separation", 6)
	t.add_child(aj_abas)
	Estilo.encher(aj_abas, Vector2(0, 0), Vector2(0, 1), Vector2(50, 100), Vector2(290, -110))
	var rol := ScrollContainer.new()
	rol.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	t.add_child(rol)
	Estilo.encher(rol, Vector2(0, 0), Vector2(1, 1), Vector2(322, 98), Vector2(-50, -100))
	aj_corpo = VBoxContainer.new()
	aj_corpo.add_theme_constant_override("separation", 12)
	aj_corpo.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	rol.add_child(aj_corpo)
	var pronto := Estilo.botao("Pronto", true, 16)
	pronto.custom_minimum_size = Vector2(200, 50)
	pronto.pressed.connect(func(): _sair_ajustes())
	t.add_child(pronto)
	Estilo.prender(pronto, 1.0, 1.0, -50, -30, Control.GROW_DIRECTION_BEGIN, Control.GROW_DIRECTION_BEGIN)


func _sair_ajustes() -> void:
	Ajustes.salvar()
	mostrar(_volta_ajustes)


func _montar_ajustes() -> void:
	for c in aj_abas.get_children():
		c.queue_free()
	for i in ABAS_AJ.size():
		var b := Button.new()
		b.text = "   " + str(ABAS_AJ[i][0])
		b.icon = Estilo.icone(str(ABAS_AJ[i][1]), 16)
		b.alignment = HORIZONTAL_ALIGNMENT_LEFT
		b.custom_minimum_size = Vector2(0, 48)
		b.focus_mode = Control.FOCUS_NONE
		b.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
		b.add_theme_font_override("font", Estilo.fonte("ui", 700))
		b.add_theme_font_size_override("font_size", 16)
		var sel := i == aj_aba
		var s := _so_esquerda(Color(0.12, 0.13, 0.135, 0.95), 10, 14)
		var n := Estilo.caixa(Color(0, 0, 0, 0), Color(0, 0, 0, 0), 10, 14)
		b.add_theme_stylebox_override("normal", s if sel else n)
		b.add_theme_stylebox_override("hover", s if sel else Estilo.caixa(Color(1, 1, 1, 0.04), Color(0, 0, 0, 0), 10, 14))
		b.add_theme_stylebox_override("pressed", s)
		b.add_theme_color_override("font_color", Estilo.OSSO if sel else Estilo.CINZA)
		b.add_theme_color_override("icon_normal_color", Estilo.OSSO if sel else Estilo.CINZA)
		b.pressed.connect(func():
			aj_aba = i
			_montar_ajustes())
		aj_abas.add_child(b)
	for c in aj_corpo.get_children():
		c.queue_free()
	var v := Ajustes.v
	match aj_aba:
		0:
			aj_corpo.add_child(_linha("Gráficos", Estilo.segmentos(Ajustes.QUALIDADES, int(v["qualidade"]), func(i): Ajustes.mudar("qualidade", i, main)), Ajustes.DESC_QUALIDADE))
			aj_corpo.add_child(_linha("Resolução 3D", _deslizar(50, 100, 5, float(v["escala"]), "%d%%", func(x): Ajustes.mudar("escala", int(x), main)),
				"Menos que 100% desenha o mundo em resolução menor (o HUD continua nítido): mais quadros por segundo em PC fraco."))
			aj_corpo.add_child(_linha("Campo de visão", _deslizar(60, 100, 1, float(v["fov"]), "%d°", func(x): Ajustes.mudar("fov", int(x), main))))
			aj_corpo.add_child(_linha("Mostrar quadros por segundo (FPS)", Estilo.segmentos(["Não", "Sim"], 1 if v["fps"] else 0, func(i): Ajustes.mudar("fps", i == 1, main))))
		1:
			aj_corpo.add_child(_linha("Tela cheia (F11)", Estilo.segmentos(["Não", "Sim"], 1 if v["tela_cheia"] else 0, func(i): Ajustes.mudar("tela_cheia", i == 1, main))))
			aj_corpo.add_child(_linha("Câmera (V)", Estilo.segmentos(["1ª pessoa", "3ª pessoa"], 1 if v["terceira"] else 0, func(i): Ajustes.mudar("terceira", i == 1, main)),
				"Na terceira pessoa a câmera fica atrás do ombro direito e você vê o seu personagem, a roupa e o que está na mão."))
			aj_corpo.add_child(_linha("Corpo na 3ª pessoa", Estilo.segmentos(["Olha para a câmera", "Vira para onde anda"], 1 if v["corpo_anda"] else 0, func(i): Ajustes.mudar("corpo_anda", i == 1, main)),
				"Olhando para a câmera (como no DayZ e no PUBG) ele anda de lado e de costas; na disparada vira para onde corre."))
			aj_corpo.add_child(_linha("Mostrar os comandos na tela (H)", Estilo.segmentos(["Não", "Sim"], 1 if v["comandos"] else 0, func(i): Ajustes.mudar("comandos", i == 1, main)),
				"O quadro dos comandos do teclado embaixo à esquerda (W A S D, E, Tab...)."))
		2:
			aj_corpo.add_child(_linha("Volume", _deslizar(0, 100, 5, float(v["volume"]), "%d%%", func(x): Ajustes.mudar("volume", int(x), main)),
				"Os sons do jogo: passos, golpes, zumbis, fogueira, construção."))
		3:
			aj_corpo.add_child(_linha("Sensibilidade do mouse", _deslizar(0.2, 3.0, 0.05, float(v["sens"]), "%.2f", func(x): Ajustes.mudar("sens", x, main))))
			aj_corpo.add_child(_linha("Inverter o mouse (para cima e para baixo)", Estilo.segmentos(["Não", "Sim"], 1 if v["inverter_y"] else 0, func(i): Ajustes.mudar("inverter_y", i == 1, main))))
			aj_corpo.add_child(_linha("Cor da mira", Estilo.segmentos(Ajustes.NOMES_CORES, int(v["mira_cor"]), func(i):
				Ajustes.mudar("mira_cor", i, main)
				_previa_mira())))
			aj_corpo.add_child(_linha("Tamanho da mira", _deslizar(1.5, 6.0, 0.5, float(v["mira_tam"]), "%.1f", func(x):
				Ajustes.mudar("mira_tam", x, main)
				_previa_mira())))
			var pv := PreviaMira.new()
			pv.custom_minimum_size = Vector2(0, 96)
			pv.name = "PreviaMira"
			aj_corpo.add_child(pv)
		4:
			var g := GridContainer.new()
			g.columns = 2
			g.add_theme_constant_override("h_separation", 24)
			g.add_theme_constant_override("v_separation", 10)
			for par in [["W A S D", "Andar"], ["Shift", "Correr (gasta energia)"], ["C ou Ctrl", "Agachar"], ["Espaço", "Pular"],
					["Clique", "Bater, comer, beber, usar o item da mão"], ["E", "Pegar, abrir, beber, revistar, cozinhar"],
					["Tab ou I", "Mochila, roupa e fabricação"], ["1 a 6 ou a rodinha", "Item na mão"], ["B", "Plano de construção na mão"],
					["Botão direito (construindo)", "Próxima peça"], ["Q (construindo)", "Outra aba de peças"], ["R (construindo)", "Girar a peça"],
					["F", "Lanterna"], ["M", "Mapa"], ["V", "Primeira ou terceira pessoa"], ["H", "Esconder ou mostrar os comandos"], ["F5", "Salvar"], ["Esc", "Pausa"], ["F11", "Tela cheia"]]:
				g.add_child(Estilo.tecla(par[0], 12))
				g.add_child(Estilo.rotulo(par[1], 15, Estilo.OSSO, "ui", 600))
			var p := PanelContainer.new()
			p.add_theme_stylebox_override("panel", Estilo.caixa(Estilo.CARTAO, Color(1, 1, 1, 0.07), 12, 18))
			p.add_child(g)
			aj_corpo.add_child(p)
			var nota := Estilo.rotulo("Trocar as teclas chega numa próxima versão.", 13, Estilo.APAGADO, "ui", 600)
			aj_corpo.add_child(nota)


func _previa_mira() -> void:
	var pv := aj_corpo.find_child("PreviaMira", true, false)
	if pv:
		pv.queue_redraw()


func _linha(titulo: String, ctrl: Control, desc := "") -> Control:
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 8)
	var p := PanelContainer.new()
	p.add_theme_stylebox_override("panel", Estilo.caixa(Estilo.CARTAO, Color(1, 1, 1, 0.07), 12, 18))
	v.add_child(p)
	var h := HBoxContainer.new()
	h.add_theme_constant_override("separation", 16)
	p.add_child(h)
	var l := Estilo.rotulo(titulo, 16, Estilo.OSSO, "ui", 700)
	l.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	l.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	h.add_child(l)
	ctrl.custom_minimum_size.x = maxf(ctrl.custom_minimum_size.x, 440.0)
	ctrl.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	h.add_child(ctrl)
	if desc != "":
		var d := Estilo.rotulo(desc, 13, Estilo.APAGADO, "ui", 600)
		d.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		v.add_child(d)
	return v


func _deslizar(mn: float, mx: float, passo: float, valor: float, fmt: String, ao_mudar: Callable) -> Control:
	var h := HBoxContainer.new()
	h.add_theme_constant_override("separation", 14)
	var s := HSlider.new()
	s.min_value = mn
	s.max_value = mx
	s.step = passo
	s.value = valor
	s.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	s.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	s.focus_mode = Control.FOCUS_NONE
	h.add_child(s)
	var l := Estilo.rotulo(fmt % valor, 15, Estilo.OSSO, "ui", 800)
	l.custom_minimum_size = Vector2(56, 0)
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	h.add_child(l)
	s.value_changed.connect(func(x: float):
		l.text = fmt % x
		ao_mudar.call(x))
	return h


# ================================================================ multiplayer: jogar junto na rede local
var mp_nome: LineEdit
var mp_abrir: Button
var mp_ips: VBoxContainer
var mp_ips_lista: VBoxContainer
var mp_fw: HBoxContainer
var mp_fw_txt: Label
var mp_fw_bt: Button
var mp_ip: LineEdit
var mp_entrar: Button
var mp_achados: VBoxContainer
var mp_estado: Label
var mp_jog: HFlowContainer
var mp_jogar: Button
var mp_sair: Button
var sz_rede: Label


## a tela do jogo antigo (63_lan.js): à esquerda o nome, abrir a partida (com os IPs para os amigos digitarem e o Firewall) e
## entrar na de um amigo (pelo IP ou pela lista das partidas achadas na rede), o estado, quem está e o Escolher o mundo e
## jogar; à direita a imagem do multiplayer
func _tela_multi() -> void:
	var t := _tela("multi")
	_brilho(t, Vector2(0.3, 1.1), Vector2(0.55, 0.45), 0.22)
	_barra_topo(t, "0 2", "Multiplayer", Estilo.AGUA, func(): mostrar("lobby"))
	var h := HBoxContainer.new()
	h.add_theme_constant_override("separation", 28)
	t.add_child(h)
	Estilo.encher(h, Vector2(0, 0), Vector2(1, 1), Vector2(44, 96), Vector2(-44, -28))
	var rol := ScrollContainer.new()
	rol.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	rol.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	rol.size_flags_stretch_ratio = 1.55
	h.add_child(rol)
	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 14)
	col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	rol.add_child(col)
	var tag := PanelContainer.new()
	var tb := Estilo.caixa(Color(Estilo.AGUA, 0.12), Estilo.AGUA, 12, 12)
	tb.content_margin_top = 5
	tb.content_margin_bottom = 5
	tag.add_theme_stylebox_override("panel", tb)
	tag.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	tag.add_child(Estilo.rotulo("REDE LOCAL · ATÉ %d JOGADORES" % RedeLan.MAX_JOGADORES, 12, Estilo.AGUA, "ui", 800, 3))
	col.add_child(tag)
	col.add_child(Estilo.rotulo("JOGAR JUNTO", 44, Estilo.OSSO, "titulo", 700, 2))
	var tx := Estilo.rotulo("Um abre a partida e os amigos entram com o IP dele, na mesma rede ou pelo Radmin VPN. Vocês se veem, conversam (Enter), " +
		"ficam na mesma hora do dia, e os zumbis são os mesmos para todos: o jogo de quem abriu decide. A base, os baús e a mochila são de cada um.", 16, Color(0.765, 0.78, 0.733), "ui", 600)
	tx.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	col.add_child(tx)
	# o nome
	var ln := VBoxContainer.new()
	ln.add_theme_constant_override("separation", 6)
	col.add_child(ln)
	ln.add_child(Estilo.rotulo("SEU NOME NA PARTIDA", 12, Color(0.66, 0.75, 0.83), "ui", 800, 2))
	mp_nome = LineEdit.new()
	mp_nome.max_length = 20
	mp_nome.custom_minimum_size = Vector2(320, 44)
	mp_nome.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	mp_nome.add_theme_font_size_override("font_size", 17)
	mp_nome.text_changed.connect(func(tt: String):
		Rede.nome = RedeLan._nome_limpo(tt)
		Ajustes.mudar("lan_nome", Rede.nome))
	ln.add_child(mp_nome)
	# as duas escolhas
	var ops := HBoxContainer.new()
	ops.add_theme_constant_override("separation", 12)
	col.add_child(ops)
	var a := _cartao_mp("Abrir a partida e chamar os amigos",
		"O seu mundo vira o da partida. No Windows, na primeira vez, aparece o aviso para liberar o VAYDR no Firewall: clique em Sim.")
	ops.add_child(a)
	var av: VBoxContainer = a.get_child(0)
	mp_abrir = Estilo.botao("Abrir a partida", true, 14)
	mp_abrir.custom_minimum_size = Vector2(0, 46)
	mp_abrir.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	mp_abrir.pressed.connect(func():
		_clique()
		Rede.hospedar())
	av.add_child(mp_abrir)
	mp_ips = VBoxContainer.new()
	mp_ips.add_theme_constant_override("separation", 4)
	mp_ips.visible = false
	av.add_child(mp_ips)
	mp_ips.add_child(Estilo.rotulo("Seus amigos digitam:", 13, Color(0.66, 0.75, 0.83), "ui", 600))
	mp_ips_lista = VBoxContainer.new()
	mp_ips_lista.add_theme_constant_override("separation", 2)
	mp_ips.add_child(mp_ips_lista)
	var rad := Estilo.rotulo("No Radmin VPN, use o IP que começa com 26.", 12, Color(0.66, 0.75, 0.83), "ui", 600)
	mp_ips.add_child(rad)
	mp_fw = HBoxContainer.new()
	mp_fw.add_theme_constant_override("separation", 8)
	mp_fw.visible = false
	av.add_child(mp_fw)
	mp_fw_txt = Estilo.rotulo("", 13, Estilo.GRAO, "ui", 600)
	mp_fw_txt.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	mp_fw_txt.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	mp_fw.add_child(mp_fw_txt)
	mp_fw_bt = Estilo.botao("Liberar no Firewall", false, 12)
	mp_fw_bt.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	mp_fw_bt.pressed.connect(func():
		_clique()
		Rede.liberar(false))
	mp_fw.add_child(mp_fw_bt)
	var b := _cartao_mp("Entrar na partida de um amigo", "Digite o IP que aparece na tela de quem abriu, ou escolha uma partida achada na sua rede.")
	ops.add_child(b)
	var bv: VBoxContainer = b.get_child(0)
	var lip := HBoxContainer.new()
	lip.add_theme_constant_override("separation", 8)
	bv.add_child(lip)
	mp_ip = LineEdit.new()
	mp_ip.placeholder_text = "192.168.0.12"
	mp_ip.custom_minimum_size = Vector2(0, 46)
	mp_ip.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	mp_ip.add_theme_font_size_override("font_size", 17)
	mp_ip.text_submitted.connect(func(_tt): _entrar_ip())
	lip.add_child(mp_ip)
	mp_entrar = Estilo.botao("Entrar", false, 14)
	mp_entrar.custom_minimum_size = Vector2(110, 46)
	mp_entrar.pressed.connect(_entrar_ip)
	lip.add_child(mp_entrar)
	bv.add_child(Estilo.rotulo("PARTIDAS NA SUA REDE", 11, Color(0.56, 0.79, 1.0), "ui", 800, 2))
	mp_achados = VBoxContainer.new()
	mp_achados.add_theme_constant_override("separation", 6)
	bv.add_child(mp_achados)
	# o estado, quem está e as ações
	mp_estado = Estilo.rotulo("", 15, Color(0.81, 0.91, 1.0), "ui", 700)
	mp_estado.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	mp_estado.custom_minimum_size = Vector2(0, 22)
	col.add_child(mp_estado)
	mp_jog = HFlowContainer.new()
	mp_jog.add_theme_constant_override("h_separation", 6)
	mp_jog.add_theme_constant_override("v_separation", 6)
	col.add_child(mp_jog)
	var ac := HBoxContainer.new()
	ac.add_theme_constant_override("separation", 10)
	col.add_child(ac)
	mp_jogar = Estilo.botao("Escolher o mundo e jogar", true, 15)
	mp_jogar.custom_minimum_size = Vector2(300, 52)
	mp_jogar.pressed.connect(func():
		_clique()
		mostrar("sozinho"))
	ac.add_child(mp_jogar)
	mp_sair = Estilo.botao("Sair da partida", false, 14)
	mp_sair.custom_minimum_size = Vector2(0, 52)
	mp_sair.pressed.connect(func():
		_clique()
		Rede.desligar(false))
	ac.add_child(mp_sair)
	var nota := Estilo.rotulo("Cada um entra com o próprio personagem, a sua mochila e o seu mundo (que salva normal). O dia de cada mundo continua o seu; " +
		"a hora e os zumbis são os de quem abriu. Com amigos na partida, a pausa e o mapa não param o jogo.", 13, Color(0.54, 0.565, 0.525), "ui", 600)
	nota.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	col.add_child(nota)
	# à direita: a imagem do multiplayer
	var dir := Panel.new()
	dir.add_theme_stylebox_override("panel", Estilo.caixa(Color(0.07, 0.08, 0.085), Color(0, 0, 0, 0), 18, 0))
	dir.clip_children = CanvasItem.CLIP_CHILDREN_AND_DRAW
	dir.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	dir.size_flags_stretch_ratio = 1.0
	h.add_child(dir)
	var img := _foto("res://assets/telas/lobby_multi.jpg")
	img.set_anchors_preset(Control.PRESET_FULL_RECT)
	dir.add_child(img)
	var veu_i := ColorRect.new()
	veu_i.set_anchors_preset(Control.PRESET_FULL_RECT)
	veu_i.mouse_filter = Control.MOUSE_FILTER_IGNORE
	veu_i.material = _sombreado("""
void fragment() {
	COLOR = mix(vec4(0.078, 0.188, 0.306, 0.35), vec4(0.031, 0.047, 0.067, 0.78), UV.y);
}""")
	dir.add_child(veu_i)
	var borda := Panel.new()
	borda.set_anchors_preset(Control.PRESET_FULL_RECT)
	borda.mouse_filter = Control.MOUSE_FILTER_IGNORE
	borda.add_theme_stylebox_override("panel", Estilo.caixa(Color(0, 0, 0, 0), Color(Estilo.AGUA, 0.25), 18, 0))
	dir.add_child(borda)
	var leg := VBoxContainer.new()
	leg.add_theme_constant_override("separation", 6)
	leg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	dir.add_child(leg)
	Estilo.encher(leg, Vector2(0, 1), Vector2(1, 1), Vector2(24, -24), Vector2(-24, -24))
	leg.grow_vertical = Control.GROW_DIRECTION_BEGIN
	for par in [["Enter", "bate-papo"], ["/ir", "vai até quem abriu"], ["Porta", "%d (UDP e TCP)" % RedeLan.PORTA]]:
		var lh := HBoxContainer.new()
		lh.add_theme_constant_override("separation", 8)
		lh.add_child(Estilo.tecla(par[0], 11))
		lh.add_child(Estilo.rotulo(par[1], 13, Color(0.81, 0.86, 0.9), "ui", 600))
		leg.add_child(lh)
	Rede.mudou.connect(_rede_mudou)


func _cartao_mp(titulo: String, texto: String) -> PanelContainer:
	var p := PanelContainer.new()
	p.add_theme_stylebox_override("panel", Estilo.caixa(Color(0.071, 0.118, 0.165, 0.55), Color(Estilo.AGUA, 0.38), 14, 18))
	p.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 9)
	p.add_child(v)
	var tt := Estilo.rotulo(titulo, 17, Color(0.894, 0.949, 1.0), "ui", 800)
	tt.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	v.add_child(tt)
	var sb := Estilo.rotulo(texto, 14, Color(0.66, 0.75, 0.83), "ui", 600)
	sb.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	v.add_child(sb)
	return p


func _clique() -> void:
	if main.sons != null and main.jogador != null:
		main.sons.tocar("clique", main.jogador.global_position, -8.0)


func _entrar_ip() -> void:
	_clique()
	Rede.entrar(mp_ip.text)


func _rede_mudou() -> void:
	if atual == "multi":
		_montar_multi()
	elif atual == "lobby" and lobby_cartoes.size() > 1:
		(lobby_cartoes[1].get_meta("extra") as Label).text = Rede.resumo()
		(lobby_cartoes[1].get_meta("extra") as Label).visible = lobby_sel == 1


func _montar_multi() -> void:
	if not mp_nome.has_focus():
		mp_nome.text = Rede.nome_jogo()
	if mp_ip.text == "" and not mp_ip.has_focus():
		mp_ip.text = str(Ajustes.v.get("lan_ip", ""))
	var on: bool = Rede.on
	var anf: bool = Rede.anfitriao()
	var ocupado: bool = on or Rede._conectando
	mp_nome.editable = not ocupado
	mp_abrir.disabled = ocupado
	mp_entrar.disabled = ocupado
	mp_ip.editable = not ocupado
	# os IPs de quem abriu
	mp_ips.visible = anf
	for c in mp_ips_lista.get_children():
		c.queue_free()
	if anf:
		if Rede.ips.is_empty():
			mp_ips_lista.add_child(Estilo.rotulo("(sem rede: conecte o PC na rede ou no Radmin)", 15, Estilo.GRAO, "ui", 700))
		for ip in Rede.ips:
			var lh := HBoxContainer.new()
			lh.add_theme_constant_override("separation", 10)
			lh.add_child(Estilo.rotulo(str(ip), 22, Color(1.0, 0.81, 0.54), "ui", 800, 1))
			var cp := _pilula("COPIAR")
			cp.size_flags_vertical = Control.SIZE_SHRINK_CENTER
			cp.pressed.connect(func():
				DisplayServer.clipboard_set(str(ip))
				cp.text = "COPIADO")
			lh.add_child(cp)
			mp_ips_lista.add_child(lh)
	# o Firewall (só no Windows)
	var fw := str(Rede.fw)
	mp_fw.visible = OS.get_name() == "Windows" and (anf or fw == "pedindo") and fw != ""
	mp_fw_txt.text = {"ok": "Firewall do Windows: o VAYDR está liberado.", "pedindo": "Esperando o aviso do Windows…"}.get(fw, "O Firewall do Windows pode estar barrando os amigos.")
	mp_fw_txt.add_theme_color_override("font_color", Color(0.66, 0.88, 0.63) if fw == "ok" else Estilo.GRAO)
	mp_fw_bt.visible = fw != "ok"
	mp_fw_bt.disabled = fw == "pedindo"
	# as partidas achadas na rede
	for c in mp_achados.get_children():
		c.queue_free()
	if Rede.achados.is_empty() or ocupado:
		var vz := Estilo.rotulo("Procurando partidas abertas na rede…" if not ocupado else "—", 13, Color(0.54, 0.565, 0.525), "ui", 600)
		mp_achados.add_child(vz)
	else:
		for k in Rede.achados:
			var e: Dictionary = Rede.achados[k]
			var lh := HBoxContainer.new()
			lh.add_theme_constant_override("separation", 10)
			var info := Estilo.rotulo("%s  ·  %d de %d  ·  %s" % [e["nome"], int(e["n"]), int(e["max"]), e["ip"]], 14, Color(0.894, 0.949, 1.0), "ui", 700)
			info.size_flags_horizontal = Control.SIZE_EXPAND_FILL
			info.size_flags_vertical = Control.SIZE_SHRINK_CENTER
			info.clip_text = true
			lh.add_child(info)
			var outra: bool = str(e["versao"]) != Rede.versao
			var be := Estilo.botao("Entrar" if not outra else "Versão " + str(e["versao"]), false, 12)
			be.disabled = outra
			var alvo := str(e["ip"]) + ("" if int(e["porta"]) == RedeLan.PORTA else ":%d" % int(e["porta"]))
			be.pressed.connect(func():
				mp_ip.text = alvo
				_entrar_ip())
			lh.add_child(be)
			mp_achados.add_child(lh)
	# o estado
	var txt: String = Rede.erro
	if txt == "":
		if on:
			txt = "Partida aberta. Agora escolha o mundo e jogue: os amigos entram quando quiserem." if anf \
				else "Você entrou na partida de %s. Agora escolha um mundo seu e jogue." % Rede.host_nome
		else:
			txt = Rede.status
	mp_estado.text = txt
	mp_estado.add_theme_color_override("font_color", Color(1.0, 0.71, 0.63) if Rede.erro != "" else Color(0.81, 0.91, 1.0))
	# quem está
	for c in mp_jog.get_children():
		c.queue_free()
	if on:
		for n in Rede.nomes():
			var ch := PanelContainer.new()
			var cb := Estilo.caixa(Color(0.384, 0.722, 1.0, 0.16), Color(0, 0, 0, 0), 14, 12)
			cb.content_margin_top = 5
			cb.content_margin_bottom = 5
			ch.add_theme_stylebox_override("panel", cb)
			ch.add_child(Estilo.rotulo(str(n), 13, Color(0.894, 0.949, 1.0), "ui", 700))
			mp_jog.add_child(ch)
	mp_jogar.visible = on
	mp_sair.visible = on or Rede._conectando


# ================================================================ como jogar e créditos
const AJUDA := [
	["O começo", "Você acorda na mata, de mão vazia. Junte pedras, galhos e fibras do chão (E) e bata nas árvores: na mão, a cada 3 socos sai 1 madeira; com uma pedra na mão rende mais."],
	["Fabricar", "Tab abre a mochila e a fabricação. Comece pelo machado improvisado e pela picareta. As receitas abrem aos poucos: quando você acha um material novo, com folhas de receita e com a bancada de trabalho (nível 2)."],
	["Construir", "Faça o plano de construção e aperte B. O botão direito troca a peça, Q troca a aba (casa, muros, defesas, móveis, base, oficina), R gira e o clique constrói. O martelo conserta."],
	["Comer e beber", "Fome e sede caem com o tempo. Frutas, cogumelos e latas se comem como estão; carne crua e água suja vão para a fogueira (E). Garrafa vazia na mão enche no poço, no rio e no lago."],
	["A noite", "Às 19h escurece e os zumbis correm. Fique perto do fogo ou se tranque na base. Uma cama ou um saco de dormir marcam onde você renasce."],
	["Morrer", "O que você carregava fica numa mochila no chão, marcada em verde no minimapa e na bússola. O que está no baú não se perde."],
	["Salvar", "O jogo salva sozinho a cada 2 minutos, quando você fecha e no F5. Cada mundo do perfil é salvo separado."],
	["Jogar junto", "No lobby, Multiplayer: um abre a partida e os amigos entram com o IP dele (mesma rede ou Radmin VPN). Enter abre o bate-papo e /ir leva até quem abriu. A hora e os zumbis são os de quem abriu; a base e a mochila são de cada um."],
]


func _tela_ajuda() -> void:
	var t := _tela("ajuda")
	_brilho(t)
	_barra_topo(t, "?", "Como jogar", Estilo.BRASA, func(): mostrar(_volta_ajuda), "VOLTAR")
	var rol := ScrollContainer.new()
	rol.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	t.add_child(rol)
	Estilo.encher(rol, Vector2(0, 0), Vector2(1, 1), Vector2(110, 100), Vector2(-110, -30))
	var g := GridContainer.new()
	g.columns = 2
	g.add_theme_constant_override("h_separation", 22)
	g.add_theme_constant_override("v_separation", 22)
	g.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	rol.add_child(g)
	for sec in AJUDA:
		var p := PanelContainer.new()
		p.add_theme_stylebox_override("panel", Estilo.caixa(Estilo.CARTAO, Color(1, 1, 1, 0.07), 12, 20))
		p.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		var v := VBoxContainer.new()
		v.add_theme_constant_override("separation", 8)
		p.add_child(v)
		v.add_child(Estilo.rotulo(str(sec[0]).to_upper(), 13, Estilo.BRASA, "ui", 800, 3))
		var tx := Estilo.rotulo(str(sec[1]), 15, Estilo.OSSO, "ui", 500)
		tx.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		tx.custom_minimum_size = Vector2(440, 0)
		v.add_child(tx)
		g.add_child(p)


func _tela_creditos() -> void:
	var t := _tela("creditos")
	_brilho(t)
	_barra_topo(t, "©", "Créditos", Estilo.OSSO, func(): mostrar("lobby"))
	var rol := ScrollContainer.new()
	rol.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	t.add_child(rol)
	Estilo.encher(rol, Vector2(0, 0), Vector2(1, 1), Vector2(110, 100), Vector2(-110, -30))
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 10)
	rol.add_child(v)
	v.add_child(Estilo.rotulo("VAYDR, um jogo do Himalaia, refeito no Godot.", 22, Estilo.OSSO, "titulo", 700))
	var tx := Estilo.rotulo(_creditos(), 15, Estilo.CINZA, "ui", 500)
	tx.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	tx.custom_minimum_size = Vector2(900, 0)
	v.add_child(tx)


func _creditos() -> String:
	var t := "Lugares escaneados (galpão, bunker, prédios, casa, ruína, carros, Base Militar):\n"
	var o = JSON.parse_string(FileAccess.get_file_as_string("res://dados/mapa/objetos3d.json"))
	if o is Dictionary and o.has("creditos"):
		for k in o["creditos"]["lugares"]:
			t += "  · %s\n" % str(o["creditos"]["lugares"][k])
	t += "\nPeças de fachada e telhado da cidade: Post Apocalypse Kitbash (versão gratuita), de Oleg Ushenok\n"
	t += "Árvores, plantas, pedras, móveis e objetos da rua: Poly Haven (CC0)\n"
	t += "Zumbi e animações: Mixamo\n"
	t += "Letras: Gelasio (Eben Sorkin) e Roboto (Christian Robertson), licença SIL Open Font\n"
	t += "Motor: Godot Engine (licença MIT)\n"
	return t


# ================================================================ pausa
func _tela_pausa() -> void:
	var t := _tela("pausa", Color(0.016, 0.024, 0.02, 0.8))
	_brilho(t, Vector2(0.2, 1.1), Vector2(0.55, 0.5), 0.2)
	# à esquerda: o título, quem e onde, e a lista (como no jogo antigo: Voltar em destaque, seções com as teclas)
	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 6)
	t.add_child(col)
	Estilo.encher(col, Vector2(0, 0), Vector2(0, 1), Vector2(64, 22), Vector2(520, -16))
	pz_aviso = Estilo.rotulo("JOGO PARADO", 12, Estilo.BRASA, "ui", 800, 3)
	col.add_child(pz_aviso)
	pz_titulo = Estilo.rotulo("PAUSADO", 64, Estilo.OSSO, "titulo", 700, 3)
	col.add_child(pz_titulo)
	var linha := ColorRect.new()
	linha.color = Estilo.BRASA
	linha.custom_minimum_size = Vector2(70, 3)
	linha.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	col.add_child(linha)
	pz_mundo = Estilo.rotulo("", 13, Estilo.CINZA, "ui", 700, 2)
	col.add_child(pz_mundo)
	pz_onde = Estilo.rotulo("", 15, Estilo.OSSO, "ui", 600)
	col.add_child(pz_onde)
	var esp := Control.new()
	esp.custom_minimum_size = Vector2(0, 8)
	col.add_child(esp)
	col.add_child(_item_pausa("Voltar ao jogo", "Esc", "olho", voltar_ao_jogo, true))
	col.add_child(_secao_pausa("Sobrevivência"))
	col.add_child(_item_pausa("Mapa", "M", "mapa", _pz_mapa))
	col.add_child(_item_pausa("Salvar agora", "F5", "check", _pz_salvar))
	col.add_child(_secao_pausa("Sistema"))
	col.add_child(_item_pausa("Configurações", "", "grade", _pz_ajustes))
	col.add_child(_item_pausa("Como jogar", "", "livro", _pz_ajuda))
	col.add_child(_item_pausa("Salvar e ir ao lobby", "", "mochila", _pz_lobby))
	col.add_child(_item_pausa("Salvar e sair do jogo", "", "x", _pz_sair))
	pz_atualiza = _item_pausa("Reiniciar na versão nova", "", "check", func(): Atualiza.reiniciar())
	pz_atualiza.visible = false
	col.add_child(pz_atualiza)
	# à direita: o relógio (o dia inteiro num anel, com o sol ou a lua) e os números do mundo
	var card := PanelContainer.new()
	card.add_theme_stylebox_override("panel", Estilo.caixa(Color(0.06, 0.07, 0.07, 0.9), Estilo.BORDA, 14, 18))
	t.add_child(card)
	Estilo.prender(card, 1.0, 1.0, -52, -24, Control.GROW_DIRECTION_BEGIN, Control.GROW_DIRECTION_BEGIN)
	var cv := VBoxContainer.new()
	cv.add_theme_constant_override("separation", 14)
	card.add_child(cv)
	var topo := HBoxContainer.new()
	topo.add_theme_constant_override("separation", 18)
	cv.add_child(topo)
	var rel := Relogio.new(main)
	rel.name = "Relogio"
	rel.custom_minimum_size = Vector2(108, 108)
	topo.add_child(rel)
	var tv := VBoxContainer.new()
	tv.alignment = BoxContainer.ALIGNMENT_CENTER
	topo.add_child(tv)
	pz_relogio = Estilo.rotulo("", 40, Estilo.OSSO, "titulo", 700)
	tv.add_child(pz_relogio)
	var sub := Estilo.rotulo("", 13, Estilo.CINZA, "ui", 600)
	sub.name = "Sub"
	tv.add_child(sub)
	pz_stats = HBoxContainer.new()
	pz_stats.add_theme_constant_override("separation", 10)
	cv.add_child(pz_stats)


func _secao_pausa(nome: String) -> Control:
	var h := HBoxContainer.new()
	h.add_theme_constant_override("separation", 10)
	var l := Estilo.rotulo(nome.to_upper(), 11, Estilo.APAGADO, "ui", 800, 3)
	h.add_child(l)
	var tr := ColorRect.new()
	tr.color = Color(0.925, 0.894, 0.824, 0.1)
	tr.custom_minimum_size = Vector2(0, 1)
	tr.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	tr.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	h.add_child(tr)
	var m := MarginContainer.new()
	m.add_theme_constant_override("margin_top", 10)
	m.add_child(h)
	return m


func _item_pausa(txt: String, tecla_txt: String, ico: String, f: Callable, destaque := false) -> Button:
	var b := Button.new()
	b.custom_minimum_size = Vector2(440, 44 if destaque else 38)
	b.focus_mode = Control.FOCUS_NONE
	b.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	var n := Estilo.caixa(Color(0, 0, 0, 0), Color(0, 0, 0, 0), 6, 14)
	var h := Estilo.caixa(Color(1, 1, 1, 0.05), Color(0, 0, 0, 0), 6, 14)
	if destaque:
		n = Estilo.caixa(Color(0.55, 0.25, 0.1, 0.75), Color(0, 0, 0, 0), 4, 14)
		n.border_color = Estilo.BRASA
		n.border_width_left = 3
		h = Estilo.caixa(Color(0.65, 0.3, 0.12, 0.85), Color(0, 0, 0, 0), 4, 14)
		h.border_color = Estilo.BRASA
		h.border_width_left = 3
	b.add_theme_stylebox_override("normal", n)
	b.add_theme_stylebox_override("hover", h)
	b.add_theme_stylebox_override("pressed", h)
	b.add_theme_stylebox_override("focus", StyleBoxEmpty.new())
	b.pressed.connect(f)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 14)
	row.mouse_filter = Control.MOUSE_FILTER_IGNORE
	b.add_child(row)
	Estilo.encher(row, Vector2(0, 0), Vector2(1, 1), Vector2(16, 0), Vector2(-12, 0))
	var ic := TextureRect.new()
	ic.texture = Estilo.icone(ico, 16)
	ic.custom_minimum_size = Vector2(16, 16)
	ic.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	ic.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	ic.modulate = Estilo.OSSO if destaque else Estilo.CINZA
	ic.mouse_filter = Control.MOUSE_FILTER_IGNORE
	row.add_child(ic)
	var l := Estilo.rotulo(txt, 18 if destaque else 16, Estilo.OSSO, "ui", 800 if destaque else 700)
	l.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	l.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	row.add_child(l)
	if tecla_txt != "":
		var k := Estilo.tecla(tecla_txt, 11)
		k.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		row.add_child(k)
	return b


func _pz_mapa() -> void:
	abrir_mapa("pausa")


func _pz_ajustes() -> void:
	_volta_ajustes = "pausa"
	mostrar("ajustes")


func _pz_salvar() -> void:
	var ok: bool = main.salvar_jogo()
	pz_onde.text = "Jogo salvo." if ok else "Não deu para salvar."


func _pz_ajuda() -> void:
	_volta_ajuda = "pausa"
	mostrar("ajuda")


func _pz_lobby() -> void:
	main.sair_para_lobby()


func _pz_sair() -> void:
	main.salvar_jogo()
	get_tree().quit()


func pausa() -> void:
	if not main.em_jogo or not main.jogador.vivo:
		return
	main.ui.abrir(false)
	# na partida em rede com amigos o mundo não para (os outros continuam jogando, e os zumbis também)
	get_tree().paused = not Rede.em_partida()
	main.salvar_jogo()
	var nome_p := str(Perfis.atual.get("nome", ""))
	pz_mundo.text = ("SOBREVIVENTE: %s  ·  %s" % [nome_p, str(main.mundo_atual.get("nome", "Mundo"))]).to_upper() if nome_p != "" \
		else str(main.mundo_atual.get("nome", "Mundo")).to_upper()
	var j: Node3D = main.jogador
	var l: Dictionary = main.mundo.lugar_em(j.global_position.x, j.global_position.z)
	var falta: String = str(main.ui.hud.dia_falta.text)
	pz_onde.text = "Dia %d  ·  %s  ·  %s  ·  %s" % [int(main.dia), main.hora_txt(), falta, str(l["nome"])]
	pz_relogio.text = main.hora_txt()
	(telas["pausa"].find_child("Sub", true, false) as Label).text = "Dia %d  ·  %s" % [int(main.dia), falta]
	telas["pausa"].find_child("Relogio", true, false).queue_redraw()
	_stats(pz_stats)
	# na partida em rede com amigos o jogo não para: a tela diz isso
	var rede: bool = Rede.em_partida()
	pz_aviso.text = "EM REDE · O MUNDO CONTINUA" if rede else "JOGO PARADO"
	pz_aviso.add_theme_color_override("font_color", Estilo.AGUA if rede else Estilo.BRASA)
	pz_titulo.text = "MENU" if rede else "PAUSADO"
	mostrar("pausa")


func _stats(onde: HBoxContainer) -> void:
	for c in onde.get_children():
		c.queue_free()
	var st: Dictionary = main.stats
	var n_base := 0
	for pe in main.construcao.pecas:
		if pe is Dictionary and not pe.get("caiu", false):
			n_base += 1
	for par in [[str(int(main.dia)), "Dia"], [str(int(st.get("zumbis", 0))), "Zumbis"], [str(int(st.get("fabricados", 0))), "Fabricados"], [str(n_base), "Construções"]]:
		var p := PanelContainer.new()
		p.add_theme_stylebox_override("panel", Estilo.caixa(Color(1, 1, 1, 0.03), Color(1, 1, 1, 0.08), 10, 12))
		p.custom_minimum_size = Vector2(96, 0)
		p.add_child(_numero(par[0], par[1]))
		onde.add_child(p)


func voltar_ao_jogo() -> void:
	esconder()
	get_tree().paused = false
	_mouse()


# ================================================================ mapa grande
func _tela_mapa() -> void:
	var t := _tela("mapa", Color(0.035, 0.045, 0.045, 0.97))
	mapa = MapaGrande.new(main)
	t.add_child(mapa)
	Estilo.encher(mapa, Vector2(0, 0), Vector2(1, 1), Vector2(40, 84), Vector2(-40, -40))
	var topo := HBoxContainer.new()
	topo.add_theme_constant_override("separation", 16)
	t.add_child(topo)
	Estilo.encher(topo, Vector2(0, 0), Vector2(1, 0), Vector2(44, 22), Vector2(-44, 70))
	var tt := Estilo.rotulo("MAPA", 30, Estilo.OSSO, "titulo", 700, 4)
	tt.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	topo.add_child(tt)
	var leg := HBoxContainer.new()
	leg.add_theme_constant_override("separation", 18)
	leg.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	topo.add_child(leg)
	for par in [[Estilo.OSSO, "Você"], [Color(0.88, 0.78, 0.49), "Cama / saco"], [Estilo.MUSGO, "Mochila caída"], [Color(0.627, 0.478, 0.29), "Sua base"]]:
		var h := HBoxContainer.new()
		h.add_theme_constant_override("separation", 6)
		var q := ColorRect.new()
		q.color = par[0]
		q.custom_minimum_size = Vector2(10, 10)
		q.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		h.add_child(q)
		h.add_child(Estilo.rotulo(par[1], 13, Estilo.CINZA, "ui", 700))
		leg.add_child(h)
	var esp := Control.new()
	esp.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	topo.add_child(esp)
	var dica := Estilo.rotulo("Rodinha aproxima · arraste para mover · M ou Esc fecha", 13, Estilo.CINZA, "ui", 600)
	dica.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	topo.add_child(dica)
	var fechar := _pilula("FECHAR")
	fechar.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	fechar.pressed.connect(fechar_mapa)
	topo.add_child(fechar)


func abrir_mapa(de: String) -> void:
	_volta_mapa = de
	if de == "":
		main.ui.abrir(false)
		get_tree().paused = not Rede.em_partida()
	(mapa as MapaGrande).centrar()
	mostrar("mapa")


func fechar_mapa() -> void:
	if _volta_mapa == "pausa":
		mostrar("pausa")
	else:
		voltar_ao_jogo()


# ================================================================ morte
func _tela_morte() -> void:
	var t := _tela("morte", Color(0.12, 0.015, 0.015, 0.82))
	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 14)
	col.alignment = BoxContainer.ALIGNMENT_CENTER
	t.add_child(col)
	Estilo.encher(col, Vector2(0, 0), Vector2(1, 1), Vector2(0, 0), Vector2(0, 0))
	var tit := Estilo.rotulo("VOCÊ MORREU", 64, Estilo.SANGUE_TINTA, "titulo", 700, 4)
	tit.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(tit)
	mt_texto = Estilo.rotulo("", 16, Estilo.OSSO, "ui", 500)
	mt_texto.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	mt_texto.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	mt_texto.custom_minimum_size = Vector2(620, 0)
	var cc := CenterContainer.new()
	cc.add_child(mt_texto)
	col.add_child(cc)
	var cs := CenterContainer.new()
	mt_stats = HBoxContainer.new()
	mt_stats.add_theme_constant_override("separation", 36)
	cs.add_child(mt_stats)
	col.add_child(cs)
	var bts := HBoxContainer.new()
	bts.alignment = BoxContainer.ALIGNMENT_CENTER
	bts.add_theme_constant_override("separation", 12)
	col.add_child(bts)
	mt_cama = Estilo.botao("Renascer na cama / saco", true, 15)
	mt_cama.custom_minimum_size = Vector2(300, 50)
	mt_cama.pressed.connect(func(): main.renascer(true))
	bts.add_child(mt_cama)
	var bm := Estilo.botao("Renascer na mata", false, 15)
	bm.custom_minimum_size = Vector2(260, 50)
	bm.pressed.connect(func(): main.renascer(false))
	bts.add_child(bm)


func morte(on: bool, deixou := false) -> void:
	if not on:
		if atual == "morte":
			esconder()
		return
	mt_texto.text = ("Sua mochila ficou onde você caiu, marcada em verde no minimapa e na bússola. Volte lá para pegar suas coisas." if deixou
		else "Você não carregava nada.")
	_stats(mt_stats)
	mt_cama.visible = main.construcao.sacos.size() > 0
	mostrar("morte")


# ================================================================ confirmação (dentro da tela, sem janela do sistema)
func _modal() -> void:
	modal = Control.new()
	modal.set_anchors_preset(Control.PRESET_FULL_RECT)
	modal.mouse_filter = Control.MOUSE_FILTER_STOP
	modal.visible = false
	raiz.add_child(modal)
	var f := ColorRect.new()
	f.color = Color(0, 0, 0, 0.6)
	f.set_anchors_preset(Control.PRESET_FULL_RECT)
	modal.add_child(f)
	var cc := CenterContainer.new()
	cc.set_anchors_preset(Control.PRESET_FULL_RECT)
	modal.add_child(cc)
	var p := PanelContainer.new()
	p.add_theme_stylebox_override("panel", Estilo.caixa(Estilo.VIDRO_SOLIDO, Estilo.BORDA_ALTA, 16, 26))
	p.custom_minimum_size = Vector2(520, 0)
	cc.add_child(p)
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 14)
	p.add_child(v)
	modal_tit = Estilo.rotulo("", 24, Estilo.OSSO, "titulo", 700)
	modal_tit.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	v.add_child(modal_tit)
	modal_txt = Estilo.rotulo("", 15, Estilo.CINZA, "ui", 500)
	modal_txt.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	v.add_child(modal_txt)
	var h := HBoxContainer.new()
	h.add_theme_constant_override("separation", 10)
	h.alignment = BoxContainer.ALIGNMENT_END
	v.add_child(h)
	var nao := Estilo.botao("Cancelar")
	nao.pressed.connect(func(): modal.visible = false)
	h.add_child(nao)
	modal_sim = Estilo.botao("", true)
	modal_sim.pressed.connect(func():
		modal.visible = false
		_modal_f.call())
	h.add_child(modal_sim)


func confirmar(titulo: String, texto: String, sim: String, f: Callable) -> void:
	modal_tit.text = titulo
	modal_txt.text = texto
	modal_sim.text = sim.to_upper()
	_modal_f = f
	modal.visible = true


# ================================================================ teclas
func _process(dt: float) -> void:
	if atual == "carga" and not _carga_ok:
		_dica_t -= dt
		if _dica_t <= 0.0:
			_trocar_dica()
	if main == null or not main.pronto:
		return
	if Input.is_action_just_pressed("tela_cheia"):
		Ajustes.mudar("tela_cheia", not bool(Ajustes.v["tela_cheia"]), main)
	if Rede.digitando or Rede.chat_acabou_de_fechar():
		return
	if Input.is_action_just_pressed("sair"):
		_esc()
	elif Input.is_action_just_pressed("mapa"):
		if atual == "mapa":
			fechar_mapa()
		elif atual == "" and main.em_jogo and main.jogador.vivo:
			abrir_mapa("")


func _esc() -> void:
	if modal.visible:
		modal.visible = false
		return
	match atual:
		"":
			if main.em_jogo:
				if main.ui.aberto:
					main.ui.abrir(false)
				else:
					pausa()
		"pausa":
			voltar_ao_jogo()
		"mapa":
			fechar_mapa()
		"ajustes":
			_sair_ajustes()
		"ajuda":
			mostrar(_volta_ajuda)
		"criacao":
			cria._voltar()
		"sozinho", "multi", "creditos":
			mostrar("lobby")


func _input(ev: InputEvent) -> void:
	if atual != "lobby" or modal.visible or not (ev is InputEventKey) or not ev.pressed or ev.echo:
		return
	var k: int = (ev as InputEventKey).keycode
	if k >= KEY_1 and k <= KEY_4:
		_lobby_escolher(k - KEY_1)
		get_viewport().set_input_as_handled()
	elif k == KEY_LEFT:
		_lobby_escolher(maxi(0, lobby_sel - 1))
	elif k == KEY_RIGHT:
		_lobby_escolher(mini(CAMINHOS.size() - 1, lobby_sel + 1))
	elif k == KEY_ENTER or k == KEY_KP_ENTER:
		_lobby_entrar(lobby_sel)


# ================================================================ pedaços desenhados
## a letra do nome num círculo (o rosto do perfil)
class Avatar extends Control:
	var letra := "?"
	var cor := Color(0.36, 0.3, 0.25)
	var foto: Texture2D = null
	static var _fotos := {}

	func _init() -> void:
		mouse_filter = Control.MOUSE_FILTER_IGNORE

	## o nome (a letra no círculo) e o retrato da criação do personagem, quando o perfil tem
	func definir(nome: String, retrato := "") -> void:
		letra = nome.substr(0, 1).to_upper() if nome != "" else "?"
		var h := float((letra.unicode_at(0) * 7) % 12) / 12.0 if letra != "?" else 0.08
		cor = Color.from_hsv(h, 0.32, 0.4)
		foto = null
		if retrato != "" and FileAccess.file_exists(retrato):
			var mod := FileAccess.get_modified_time(retrato)
			var k := "%s|%d" % [retrato, mod]
			if not _fotos.has(k):
				var img := Image.load_from_file(retrato)
				_fotos[k] = ImageTexture.create_from_image(img) if img != null and not img.is_empty() else null
			foto = _fotos[k]
		queue_redraw()

	func _draw() -> void:
		var r := size.x * 0.5
		if foto != null:
			var pts := PackedVector2Array()
			var uvs := PackedVector2Array()
			for i in 48:
				var a := TAU * float(i) / 48.0
				var d := Vector2(cos(a), sin(a))
				pts.append(Vector2(r, r) + d * r)
				uvs.append(Vector2(0.5, 0.5) + d * 0.5)
			draw_colored_polygon(pts, Color.WHITE, uvs, foto)
			draw_arc(Vector2(r, r), r - 1.0, 0.0, TAU, 48, Color(0.925, 0.894, 0.824, 0.4), 1.5, true)
			return
		draw_circle(Vector2(r, r), r, cor, true, -1.0, true)
		draw_arc(Vector2(r, r), r - 1.0, 0.0, TAU, 48, Color(0.925, 0.894, 0.824, 0.4), 1.5, true)
		var f := Estilo.fonte("titulo", 700)
		var tam := int(size.x * 0.46)
		var w := f.get_string_size(letra, HORIZONTAL_ALIGNMENT_LEFT, -1, tam)
		draw_string(f, Vector2(r - w.x * 0.5, r + tam * 0.36), letra, HORIZONTAL_ALIGNMENT_LEFT, -1, tam, Estilo.OSSO)


## a grade fina do painel das Configurações
class Grade extends Control:
	func _init() -> void:
		mouse_filter = Control.MOUSE_FILTER_IGNORE

	func _draw() -> void:
		var c := Color(0.925, 0.894, 0.824, 0.035)
		var x := 0.0
		while x < size.x:
			draw_line(Vector2(x, 0), Vector2(x, size.y), c, 1.0)
			x += 26.0
		var y := 0.0
		while y < size.y:
			draw_line(Vector2(0, y), Vector2(size.x, y), c, 1.0)
			y += 26.0


## a mira de exemplo em cima de céu, mata e parede clara (como no jogo antigo)
class PreviaMira extends Control:
	func _draw() -> void:
		var w := size.x / 3.0
		draw_rect(Rect2(0, 0, w, size.y), Color(0.56, 0.7, 0.81))
		draw_rect(Rect2(w, 0, w, size.y), Color(0.24, 0.29, 0.23))
		draw_rect(Rect2(w * 2.0, 0, w, size.y), Color(0.85, 0.83, 0.77))
		var r := clampf(float(Ajustes.v["mira_tam"]), 1.5, 6.0)
		for i in 3:
			var c := Vector2(w * (i + 0.5), size.y * 0.5)
			draw_circle(c, r + 1.5, Color(0.04, 0.047, 0.043, 0.6), true, -1.0, true)
			draw_circle(c, r, Ajustes.cor_mira(), true, -1.0, true)
		draw_string(Estilo.fonte("ui", 700), Vector2(8, size.y - 8), "céu · mata · parede clara", HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color(1, 1, 1, 0.75))


## o mapa grande: o mapa inteiro, com a mata, a água, as ruas, os prédios, os lugares com nome, a sua base, as marcas e
## você; a rodinha aproxima e arrastar move
class MapaGrande extends Control:
	var main
	var zoom := 1.0
	var desloca := Vector2.ZERO
	var _arrasta := false
	var camadas := []

	func _init(m) -> void:
		main = m
		clip_contents = true
		mouse_filter = Control.MOUSE_FILTER_STOP

	func _camada(tex: Texture2D, codigo: String, perto := false) -> TextureRect:
		var r := TextureRect.new()
		r.texture = tex
		r.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		r.stretch_mode = TextureRect.STRETCH_SCALE
		r.mouse_filter = Control.MOUSE_FILTER_IGNORE
		r.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST if perto else CanvasItem.TEXTURE_FILTER_LINEAR
		var sh := Shader.new()
		sh.code = "shader_type canvas_item;\n" + codigo
		var mt := ShaderMaterial.new()
		mt.shader = sh
		r.material = mt
		r.show_behind_parent = true
		add_child(r)
		return r

	func centrar() -> void:
		zoom = 1.0
		desloca = Vector2.ZERO
		if camadas.is_empty() and main.terreno != null:
			var ter = main.terreno
			camadas.append(_camada(ter.tex_mata, """
void fragment() {
	float m = texture(TEXTURE, UV).r;
	COLOR = mix(vec4(0.15, 0.27, 0.16, 1.0), vec4(0.075, 0.16, 0.095, 1.0), smoothstep(0.25, 0.85, m));
}"""))
			camadas.append(_camada(ter.tex_agua, """
void fragment() {
	float t = texture(TEXTURE, UV).r * 255.0;
	COLOR = t < 0.5 ? vec4(0.0) : (t < 1.5 ? vec4(0.2, 0.42, 0.56, 1.0) : vec4(0.15, 0.33, 0.47, 1.0));
}""", true))
			camadas.append(_camada(ter.tex_pisos, """
void fragment() {
	vec4 p = texture(TEXTURE, UV);
	float s = p.r + p.g + p.b;
	vec3 c = (vec3(0.42, 0.41, 0.39) * p.r + vec3(0.545, 0.467, 0.349) * p.g + vec3(0.5, 0.49, 0.46) * p.b) / max(0.001, s);
	COLOR = vec4(c, smoothstep(0.12, 0.55, max(max(p.r, p.g), p.b)));
}"""))
		_posicionar()
		queue_redraw()

	func _notification(what: int) -> void:
		if what == NOTIFICATION_RESIZED and not camadas.is_empty():
			_posicionar()
			queue_redraw()

	## as camadas desenhadas pela placa de vídeo (mata, água, pisos) acompanham o zoom e o arrasto
	func _posicionar() -> void:
		if camadas.is_empty():
			return
		var ter = main.terreno
		var k := _k()
		var o := tela(ter.X0 - 0.5 * ter.P, ter.Z0 - 0.5 * ter.P)
		for i in 2:
			(camadas[i] as TextureRect).position = o
			(camadas[i] as TextureRect).size = Vector2(ter.W * ter.P, ter.H * ter.P) * k
		var sh: float = ter.splat_h
		(camadas[2] as TextureRect).position = tela(-sh, -sh)
		(camadas[2] as TextureRect).size = Vector2(sh, sh) * 2.0 * k

	func _k() -> float:
		var ter = main.terreno
		return minf(size.x / (ter.W * ter.P), size.y / (ter.H * ter.P)) * zoom

	func _origem() -> Vector2:
		var ter = main.terreno
		var k := _k()
		return size * 0.5 - Vector2(ter.W * ter.P, ter.H * ter.P) * k * 0.5 + desloca

	func tela(x: float, z: float) -> Vector2:
		var ter = main.terreno
		return _origem() + (Vector2(x, z) - Vector2(ter.X0, ter.Z0)) * _k()

	func _gui_input(ev: InputEvent) -> void:
		if ev is InputEventMouseButton and ev.pressed:
			var mb := ev as InputEventMouseButton
			if mb.button_index == MOUSE_BUTTON_WHEEL_UP or mb.button_index == MOUSE_BUTTON_WHEEL_DOWN:
				var antes := zoom
				zoom = clampf(zoom * (1.25 if mb.button_index == MOUSE_BUTTON_WHEEL_UP else 0.8), 1.0, 6.0)
				# aproxima no ponto do mouse
				var p := mb.position - size * 0.5 - desloca
				desloca -= p * (zoom / antes - 1.0)
				_posicionar()
				queue_redraw()
		if ev is InputEventMouseButton:
			var mb2 := ev as InputEventMouseButton
			if mb2.button_index == MOUSE_BUTTON_LEFT:
				_arrasta = mb2.pressed
		if ev is InputEventMouseMotion and _arrasta:
			desloca += (ev as InputEventMouseMotion).relative
			_posicionar()
			queue_redraw()

	func _draw() -> void:
		if main.terreno == null or camadas.is_empty():
			return
		var k := _k()
		var mu = main.mundo
		for p in mu.lugares:
			draw_circle(tela(p["x"], p["z"]), float(p["r"]) * k, Color(0.2, 0.33, 0.2, 0.9), true, -1.0, true)
		# a cidade: o asfalto em volta dos prédios (como o retângulo da cidade no mapa do jogo antigo)
		var cid_r: Rect2 = mu.area_cidade()
		if cid_r.has_area():
			draw_rect(Rect2(tela(cid_r.position.x, cid_r.position.y), cid_r.size * k), Color(0.23, 0.23, 0.22))
		for r in mu.ruas:
			var pts := PackedVector2Array()
			for q in (r["pts"] as PackedVector2Array):
				pts.append(tela(q.x, q.y))
			draw_polyline(pts, Color(0.427, 0.42, 0.4) if r["cor"] == "asfalto" else Color(0.545, 0.467, 0.349), maxf(1.5, float(r["w"]) * k * 0.8), true)
		for p in mu.predios:
			var ret: Rect2 = p["ret"]
			var rr := Rect2(tela(ret.position.x, ret.position.y), ret.size * k)
			draw_rect(rr, Color(0.79, 0.83, 0.81) if p["tipo"] == "hospital" else Color(0.647, 0.624, 0.576))
			draw_rect(rr, Color(0.027, 0.039, 0.035), false, 1.0)
		for pe in main.construcao.pecas:
			if not (pe is Dictionary) or pe.get("caiu", false):
				continue
			var po: Vector3 = (pe["xf"] as Transform3D).origin
			var tam := maxf(2.0, (Dados.MODULO if bool(Dados.obra(str(pe["id"])).get("grade", false)) else 1.4) * k)
			draw_rect(Rect2(tela(po.x, po.z) - Vector2(tam, tam) * 0.5, Vector2(tam, tam)), Color(0.627, 0.478, 0.29))
		# nomes dos lugares
		var fu := Estilo.fonte("ui", 800, 1)
		var nomes := []
		for p in mu.lugares:
			nomes.append([p["nome"], p["x"], p["z"]])
		var ja := {}
		for p in mu.lugares:
			ja[str(p["nome"])] = true
		# os lugares menores (galpão, bunker, túnel...) só aparecem aproximando, para os nomes não se amontoarem
		if zoom >= 2.0:
			for l in mu.lugares_nome:
				if not ja.has(str(l["nome"])):
					nomes.append([l["nome"], l["x"], l["z"]])
		var cid: Vector2 = mu.centro_cidade()
		if cid != Vector2.ZERO:
			nomes.append(["Cidade", cid.x, cid.y])
		for n in nomes:
			var q := tela(n[1], n[2])
			var t := str(n[0]).to_upper()
			var w := fu.get_string_size(t, HORIZONTAL_ALIGNMENT_LEFT, -1, 11).x
			draw_string(fu, q + Vector2(-w * 0.5 + 1, 1), t, HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color(0, 0, 0, 0.85))
			draw_string(fu, q + Vector2(-w * 0.5, 0), t, HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color(0.925, 0.894, 0.824, 0.9))
		for m in main.ui.hud.marcas():
			var q2 := tela(m["x"], m["z"])
			draw_circle(q2, 5.0, m["cor"], true, -1.0, true)
			draw_arc(q2, 5.0, 0.0, TAU, 20, Color(0.027, 0.039, 0.035), 1.5, true)
		var jp: Vector3 = main.jogador.global_position
		var fw: Vector3 = -main.jogador.global_transform.basis.z
		var ang := atan2(fw.x, -fw.z)
		var c := tela(jp.x, jp.z)
		var s := 10.0
		var pts2 := PackedVector2Array([Vector2(0, -s), Vector2(s * 0.7, s * 0.7), Vector2(0, s * 0.25), Vector2(-s * 0.7, s * 0.7)])
		for i in pts2.size():
			pts2[i] = c + pts2[i].rotated(ang)
		draw_colored_polygon(pts2, Estilo.OSSO)
		var cont := pts2.duplicate()
		cont.append(pts2[0])
		draw_polyline(cont, Color(0.027, 0.039, 0.035), 2.0, true)
		draw_rect(Rect2(Vector2.ZERO, size), Estilo.BORDA, false, 1.0)


## o relógio da pausa: o dia inteiro num anel (a noite azul, o dia dourado), o sol ou a lua no meio e o ponto da hora
class Relogio extends Control:
	var main

	func _init(m) -> void:
		main = m
		mouse_filter = Control.MOUSE_FILTER_IGNORE

	func _draw() -> void:
		var c := size * 0.5
		var r := minf(size.x, size.y) * 0.5 - 8.0
		# 0h em cima, horário; a noite vai das 19h às 5h30
		var a0 := -PI * 0.5
		var noite_ini := a0 + TAU * 19.0 / 24.0
		var noite_fim := a0 + TAU * (24.0 + 5.5) / 24.0
		draw_arc(c, r, a0, a0 + TAU, 64, Color(0.83, 0.62, 0.25, 0.85), 6.0, true)
		draw_arc(c, r, noite_ini, noite_fim, 32, Color(0.29, 0.38, 0.62, 0.95), 6.0, true)
		for h in 24:
			var ang := a0 + TAU * h / 24.0
			var d := Vector2(cos(ang), sin(ang))
			draw_line(c + d * (r + 6.0), c + d * (r + (10.0 if h % 6 == 0 else 8.0)), Color(0.925, 0.894, 0.824, 0.35), 1.0)
		var fu := Estilo.fonte("ui", 800)
		for par in [[0, "0"], [6, "6"], [12, "12"], [18, "18"]]:
			var ang2 := a0 + TAU * float(par[0]) / 24.0
			var p := c + Vector2(cos(ang2), sin(ang2)) * (r - 16.0)
			var w := fu.get_string_size(str(par[1]), HORIZONTAL_ALIGNMENT_LEFT, -1, 10).x
			draw_string(fu, p + Vector2(-w * 0.5, 4), str(par[1]), HORIZONTAL_ALIGNMENT_LEFT, -1, 10, Color(0.925, 0.894, 0.824, 0.55))
		var hora: float = main.hora
		var noite: bool = main.noite()
		var ic := Estilo.icone("lua" if noite else "sol", 22)
		if ic:
			draw_texture_rect(ic, Rect2(c - Vector2(11, 11), Vector2(22, 22)), false, Color(0.7, 0.78, 1.0) if noite else Estilo.BRASA)
		var ah := a0 + TAU * hora / 24.0
		var ph := c + Vector2(cos(ah), sin(ah)) * r
		draw_circle(ph, 7.0, Color(0.04, 0.05, 0.05), true, -1.0, true)
		draw_circle(ph, 5.5, Color(1.0, 0.86, 0.55), true, -1.0, true)
