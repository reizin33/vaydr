class_name Jogador
extends CharacterBody3D
## Sobrevivente em primeira e terceira pessoa (V): anda, corre, agacha, pula, bate (coleta), fabrica, constrói, come e bebe.
## O corpo é o do personagem da criação (Corpo, o do MakeHuman do jogo antigo): na terceira pessoa ele aparece com a roupa vestida
## e o item na mão; na primeira, faz sombra, e a mão de verdade fecha em volta do cabo do que você segura. A coleta é a
## do jogo antigo: árvore aguenta 5 golpes de machado (1 ou 2 de madeira por golpe e mais um tanto quando cai), na mão sai
## 1 madeira a cada 3 socos (2 com uma pedra na mão), rocha só com picareta (2 pedras por golpe, às vezes minério de ferro).
## Ferramenta e arma gastam a cada golpe e quebram. A roupa protege do dano.

signal morreu

const ANDA := 4.2
const CORRE := 6.6
const AGACHA := 2.0
const PULO := 6.2
const GRAV := 21.0
const ALCANCE := 2.6

var main: Node
var cam: Camera3D
var cabeca: Node3D
var mao: Node3D
var inv := Inventario.new()
var sel := 0
var vida := 100.0
var fome := 100.0
var sede := 100.0
var vivo := true
var agachado := false
var sens := 0.0022
var inverter_y := false
var mouse_preso_teste := false   # o teste sem tela não prende o mouse: finge que está preso
var cd := 0.0
var balanco := 0.0
var golpe := 0.0
var ferramenta_no: Node3D = null
var ferramenta_id := ""
var passo := 0.0
var tremor := 0.0
var queda_v := 0.0
var preso := false   # menu aberto: não anda nem gira
var luz_mao: SpotLight3D
var vistos := {}         # itens que já passaram pela mochila (desbloqueiam receitas, como no jogo antigo)
var aprendidas := {}     # receitas aprendidas lendo folhas de receita e plantas (id -> true)
var consertos := 0       # quantas vezes consertou (desbloqueia a receita da fita)
var soco_mad := 0.0      # socos na árvore (a cada 3, 1 madeira)
var enjoo := 0.0         # dor de barriga (água suja, carne crua): segundos que faltam
var bateria := 100.0     # carga da lanterna de mão
var energia := 100.0     # fôlego: correr e pular gastam, andando e parado volta (como no jogo antigo)
var cansado := false     # a energia acabou: só corre de novo depois de recuperar um pouco
var _folego_t := 0.0     # tempo desde a última corrida (a energia só volta depois de um instante)
var lanterna_ligada := false   # F liga a lanterna que está na mochila (sem precisar pôr na mão)
var _antes_plano := 0    # o espaço que estava na mão antes do B (o B de novo volta para ele)
var corpo: Corpo         # o corpo do personagem (aparece na terceira pessoa; na primeira só faz sombra)
var terceira := false    # V: terceira pessoa (a câmera atrás do ombro direito, como no jogo antigo)
var mao_item: Node3D     # o item e a mão da primeira pessoa, no espaço da mão do jogo antigo (cabo ao longo de +z)
var braco_fp: Node3D     # o braço da primeira pessoa (antebraço e mão do MakeHuman, fechada no cabo)
var braco_mat: ShaderMaterial
var cam_dist := 1.0      # distância da câmera na terceira pessoa (chega perto quando bate em parede)
var _cam_livre := 0.0
var _cam_dentro := 0.0
var _bob := Vector3.ZERO
var _corre := false
var _dica_frio := false
var golpe_t := -1.0      # o golpe no corpo (terceira pessoa): tempo desde o clique
var golpe_dur := 0.4
var golpe_parado := false   # para a foto: o golpe fica parado onde está
var uso_t := -1.0        # comendo ou bebendo: a mão vai à boca
var _roupa_t := 0.0
var _dobra_a := 0.0      # o pulso da mão da primeira pessoa (para o lado do mindinho ou do polegar)
var _dobra_f := 0.0      # (para a frente ou para trás)
var golpe_n := 0         # quantos golpes já deu (a partida em rede manda: o boneco dele golpeia junto)
var uso_n := 0           # quantas vezes comeu ou bebeu (idem)
var acao := {}           # o empurrão (Q), a voadora (Q correndo) e o pisão (no zumbi caído): {tipo, t, dur, alvo, feito}
var acao_n := 0          # (a partida em rede manda: o boneco faz junto)
var mira_k := 0.0        # mirando (botão direito, com arma de fogo ou arco): 0 a 1
var recuo := 0.0         # o coice do tiro (a câmera sobe e volta devagar)
var tiro_n := 0          # quantos tiros já deu (a partida em rede manda: o boneco atira junto)
var queima := 0.0        # pegando fogo: segundos que faltam
var _queima_t := 0.0
var _besta_t := -1.0     # a besta arma sozinha um instante depois do tiro
var fov_base := 75.0     # o campo de visão das configurações (mirando fecha um pouco)
## a lanterna acesa no escuro ajuda os zumbis a te ver
var lanterna_acesa: bool:
	get:
		return luz_mao != null and luz_mao.visible


func _init(m: Node) -> void:
	main = m


func _ready() -> void:
	var cs := CollisionShape3D.new()
	var cap := CapsuleShape3D.new()
	cap.radius = 0.34
	cap.height = 1.8
	cs.shape = cap
	cs.position.y = 0.9
	add_child(cs)
	cabeca = Node3D.new()
	cabeca.position.y = 1.62
	add_child(cabeca)
	cam = Camera3D.new()
	cam.fov = 75.0
	cam.near = 0.05
	cam.far = 900.0
	cabeca.add_child(cam)
	mao = Node3D.new()
	cam.add_child(mao)
	# lanterna: um facho de luz que sai da câmera quando ela está na mão
	luz_mao = SpotLight3D.new()
	luz_mao.light_color = Color(1.0, 0.95, 0.82)
	luz_mao.light_energy = 3.2
	luz_mao.spot_range = 34.0
	luz_mao.spot_angle = 26.0
	luz_mao.spot_attenuation = 0.9
	luz_mao.shadow_enabled = true
	luz_mao.position = Vector3(0.25, -0.2, -0.3)
	luz_mao.visible = false
	# a lanterna sai de dentro da cabeça: o corpo não pode fazer sombra dela
	luz_mao.shadow_caster_mask = 0xFFFFF & ~Corpo.CAMADA
	cam.add_child(luz_mao)
	# o item vem no espaço da mão do jogo antigo (cabo ao longo de +z, lâmina para -y); onde ele fica na tela é o _view_model
	mao_item = Node3D.new()
	mao.add_child(mao_item)
	corpo = Corpo.new(self)
	add_child(corpo)
	corpo.montar({})
	corpo.primeira_pessoa(true)
	_montar_braco()
	floor_max_angle = deg_to_rad(48.0)
	floor_snap_length = 0.4
	_ligar_inv()


func _ligar_inv() -> void:
	inv.mudou.connect(_atualizar_mao)
	inv.chegou.connect(_visto)


## a aparência do personagem (a do perfil): monta o corpo e a mão da primeira pessoa
func aparencia(ap: Dictionary) -> void:
	corpo.montar(ap)
	corpo.vestir(inv.roupa)
	_montar_braco()
	_vestir_braco()


## V: primeira ou terceira pessoa (fica guardado nas configurações)
func alternar_camera(on = null) -> void:
	terceira = (not terceira) if on == null else bool(on)
	corpo.primeira_pessoa(not terceira)
	mao.visible = not terceira
	cam_dist = 1.0
	_cam_livre = 0.0
	if not terceira:
		cam.position = _bob
		luz_mao.transform = Transform3D(Basis.IDENTITY, Vector3(0.25, -0.2, -0.3))
	if bool(Ajustes.v.get("terceira", false)) != terceira:
		Ajustes.mudar("terceira", terceira)


## para os zumbis: onde você está (o boneco de um amigo da partida em rede responde com a posição que chegou dele)
func pos_alvo() -> Vector3:
	return global_position


## de onde sai a mira: na primeira pessoa, a câmera; na terceira, o ponto da linha da mira na altura do ombro (o alcance
## conta dali, não de trás do personagem)
func olho() -> Vector3:
	var o := cam.global_position
	if terceira:
		o += -cam.global_transform.basis.z * cam_dist
	return o


func _visto(id: String) -> void:
	vistos[id] = true


## o mouse vira a câmera aqui, antes da tela (interface): com o mouse preso o Windows informa o movimento no meio da tela,
## e qualquer pedaço da interface que esteja no meio (a mira) engolia o movimento antes de chegar ao jogador
func _input(ev: InputEvent) -> void:
	if not vivo or preso:
		return
	if ev is InputEventMouseMotion and (Input.mouse_mode == Input.MOUSE_MODE_CAPTURED or mouse_preso_teste):
		# screen_relative: o movimento do mouse na tela, igual em qualquer tamanho de janela (o relative muda com a escala)
		var r: Vector2 = ev.screen_relative
		rotate_y(-r.x * sens)
		cabeca.rotation.x = clampf(cabeca.rotation.x - r.y * sens * (-1.0 if inverter_y else 1.0), -1.45, 1.45)


func _unhandled_input(ev: InputEvent) -> void:
	if not vivo or preso:
		return
	if ev is InputEventMouseButton and ev.pressed:
		if ev.button_index == MOUSE_BUTTON_WHEEL_UP:
			selecionar((sel + Inventario.BARRA - 1) % Inventario.BARRA)
		elif ev.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			selecionar((sel + 1) % Inventario.BARRA)


func selecionar(i: int) -> void:
	sel = i
	_atualizar_mao()


func item_mao() -> Dictionary:
	var s = inv.slots[sel]
	return s if s != null else {}


func _atualizar_mao() -> void:
	if corpo != null:
		corpo.vestir(inv.roupa)
		_vestir_braco()
	var it := item_mao()
	var id: String = it.get("id", "")
	if id == ferramenta_id:
		return
	ferramenta_id = id
	if ferramenta_no:
		ferramenta_no.queue_free()
		ferramenta_no = null
	if Dados.modelo(id) != "" or ModelosArmas.tem(id):
		if Dados.modelo(id) != "":
			var cena: PackedScene = load(Dados.modelo(id))
			ferramenta_no = cena.instantiate()
		else:
			ferramenta_no = ModelosArmas.criar(id)
		mao_item.add_child(ferramenta_no)
		for no in ferramenta_no.find_children("*", "MeshInstance3D", true, false):
			var mi := no as MeshInstance3D
			mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
			# na frente de tudo (o jogo antigo limpava a profundidade antes de desenhar a mão): não atravessa parede nem mato
			if mi.material_override != null:
				mi.material_override = _mat_na_frente(mi.material_override)
			else:
				for k in mi.mesh.get_surface_count():
					mi.set_surface_override_material(k, _mat_na_frente(mi.get_active_material(k)))
	corpo.segurar(id)
	_luz()
	main.construcao.ativar(id == "plano")


# ---------------------------------------------------------------- a mão da primeira pessoa
const SHADER_BRACO := """
shader_type spatial;
// o braço da primeira pessoa (62yh_braco.js do jogo antigo): o pulso dobra para o antebraço ir na direção do cotovelo
// (a dobra espalhada em 5 cm para não vincar); a manga da peça do tronco e a luva de couro são pintadas na própria pele
uniform sampler2D pele : source_color, filter_linear_mipmap;
uniform sampler2D mascara : filter_linear_mipmap;
uniform vec3 piv = vec3(0.0065, 0.112, -0.0387);
uniform float dobra_a = 0.0;
uniform float dobra_f = 0.0;
uniform vec3 tom = vec3(1.0);
uniform float tem_manga = 0.0;
uniform vec3 manga = vec3(0.2);
uniform vec3 punho = vec3(0.15);
uniform float manga_c0 = 9.0;
uniform float luva = 0.0;
void vertex() {
	float t = clamp((VERTEX.y - piv.y + 0.01) / 0.05, 0.0, 1.0);
	t = t * t * (3.0 - 2.0 * t);
	float ca = cos(dobra_a * t), sa = sin(dobra_a * t), cf = cos(dobra_f * t), sf = sin(dobra_f * t);
	vec3 p = VERTEX - piv;
	float y1 = p.y * cf - p.z * sf;
	VERTEX = piv + vec3(p.x * ca + y1 * sa, -p.x * sa + y1 * ca, p.y * sf + p.z * cf);
	vec3 n = NORMAL;
	float n1 = n.y * cf - n.z * sf;
	NORMAL = vec3(n.x * ca + n1 * sa, -n.x * sa + n1 * ca, n.y * sf + n.z * cf);
	// na frente de tudo, como o item (a profundidade no pedaço mais perto da câmera)
	POSITION = PROJECTION_MATRIX * MODELVIEW_MATRIX * vec4(VERTEX, 1.0);
	POSITION.z = (0.95 + 0.05 * (POSITION.z / POSITION.w)) * POSITION.w;
}
void fragment() {
	vec3 c = texture(pele, UV).rgb;
	vec3 mk = texture(mascara, UV).rgb;
	vec3 s = pow(max(c, vec3(0.0)), vec3(1.0 / 2.2));
	float l = dot(s, vec3(0.3, 0.59, 0.11)) * (255.0 / 180.0);
	float sh = 0.55 + 0.55 * min(1.2, l);
	vec3 o = c * tom;
	if (luva > 0.5 && mk.r > 0.5) {
		o = pow(min(vec3(0.353, 0.243, 0.157) * sh, vec3(1.0)), vec3(2.2));
	} else if (tem_manga > 0.5 && mk.r < 0.5 && mk.g > manga_c0) {
		o = pow(min((mk.g < manga_c0 + 0.09 ? punho : manga) * sh, vec3(1.0)), vec3(2.2));
	}
	ALBEDO = o;
	ROUGHNESS = 0.72;
	SPECULAR = 0.35;
}
"""
## o material do item da primeira pessoa: o mesmo do modelo (textura, cor, aspereza), mas desenhado na frente de tudo
const SHADER_NA_FRENTE := """
shader_type spatial;
uniform sampler2D tex : source_color, filter_linear_mipmap;
uniform vec4 cor : source_color = vec4(1.0);
uniform float rug = 0.8;
uniform float met = 0.0;
uniform float tem_tex = 0.0;
void vertex() {
	// a profundidade vai para o pedaço mais perto da câmera (de 0,9 a 1, com a profundidade invertida do Godot): a mão e o
	// item não entram na parede nem no mato, e entre eles continuam na ordem certa
	POSITION = PROJECTION_MATRIX * MODELVIEW_MATRIX * vec4(VERTEX, 1.0);
	POSITION.z = (0.95 + 0.05 * (POSITION.z / POSITION.w)) * POSITION.w;
}
void fragment() {
	vec4 c = cor;
	if (tem_tex > 0.5) {
		c *= texture(tex, UV);
	}
	ALBEDO = c.rgb;
	ROUGHNESS = rug;
	METALLIC = met;
}
"""
static var _mats_na_frente := {}
static var _shader_na_frente: Shader = null


func _mat_na_frente(m: Material) -> Material:
	if not m is BaseMaterial3D:
		return m
	if _mats_na_frente.has(m):
		return _mats_na_frente[m]
	if _shader_na_frente == null:
		_shader_na_frente = Shader.new()
		_shader_na_frente.code = SHADER_NA_FRENTE
	var b := m as BaseMaterial3D
	var sm := ShaderMaterial.new()
	sm.shader = _shader_na_frente
	sm.set_shader_parameter("cor", b.albedo_color)
	sm.set_shader_parameter("rug", b.roughness)
	sm.set_shader_parameter("met", b.metallic)
	if b.albedo_texture != null:
		sm.set_shader_parameter("tex", b.albedo_texture)
		sm.set_shader_parameter("tem_tex", 1.0)
	_mats_na_frente[m] = sm
	return sm


## a manga de cada peça do tronco na mão da primeira pessoa (MANGAS_FP do jogo antigo): longa ou dobrada, a cor e o punho
const MANGAS := {"camisaLeve": ["dobrada", 0x2f3742, 0x262c35], "casacoPele": ["longa", 0x7a5638, 0xd6c29c],
	"casacoGrande": ["longa", 0x6c4b2f, 0x4a3220], "camisaCouro": ["longa", 0x8a5a36, 0x5a3820]}


## o braço do corpo escolhido (o da mulher é mais fino, a mão menor)
func _montar_braco() -> void:
	var gg := "feminino" if corpo != null and corpo.g == "mulher" else "direito"
	if braco_fp != null and str(braco_fp.get_meta("g", "")) == gg:
		return
	if braco_fp != null:
		braco_fp.queue_free()
	var cena: PackedScene = load("res://assets/personagens/braco_%s.glb" % gg)
	braco_fp = cena.instantiate()
	braco_fp.set_meta("g", gg)
	mao_item.add_child(braco_fp)
	var info: Dictionary = Corpo.META["braco"][gg]
	if braco_mat == null:
		var sh := Shader.new()
		sh.code = SHADER_BRACO
		braco_mat = ShaderMaterial.new()
		braco_mat.shader = sh
	braco_mat.set_shader_parameter("pele", load("res://assets/personagens/mh/" + str(info["pele"])))
	braco_mat.set_shader_parameter("mascara", load("res://assets/personagens/mh/" + str(info["mascara"])))
	var pv: Array = info["piv"]
	braco_mat.set_shader_parameter("piv", Vector3(pv[0], pv[1], pv[2]))
	for mi in braco_fp.find_children("*", "MeshInstance3D", true, false):
		(mi as MeshInstance3D).material_override = braco_mat
		(mi as MeshInstance3D).cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	_vestir_braco()


## o tom da pele escolhida (a média dela sobre a da textura do braço, na luz linear), a manga e a luva do que está vestido
func _vestir_braco() -> void:
	if braco_mat == null or corpo == null or corpo.m.is_empty():
		return
	var info: Dictionary = Corpo.META["braco"][str(braco_fp.get_meta("g", "direito"))]
	var pl: Dictionary = Corpo.META["peles"].get(str(corpo.m["pele"]), {})
	var tom := Vector3.ONE
	if pl.has("media") and float(info.get("media", 0)) > 0:
		var a := Corpo._cor(int(pl["media"])).srgb_to_linear()
		var b := Corpo._cor(int(info["media"])).srgb_to_linear()
		tom = Vector3(clampf(a.r / maxf(1e-4, b.r), 0.05, 1.3), clampf(a.g / maxf(1e-4, b.g), 0.05, 1.3), clampf(a.b / maxf(1e-4, b.b), 0.05, 1.3))
	braco_mat.set_shader_parameter("tom", tom)
	var tr := str(inv.roupa["tronco"]["id"]) if inv.roupa.has("tronco") else ""
	var mg: Array = MANGAS.get(tr, [])
	braco_mat.set_shader_parameter("tem_manga", 1.0 if not mg.is_empty() else 0.0)
	if not mg.is_empty():
		var c1 := Corpo._cor(int(mg[1]))
		var c2 := Corpo._cor(int(mg[2]))
		braco_mat.set_shader_parameter("manga", Vector3(c1.r, c1.g, c1.b))
		braco_mat.set_shader_parameter("punho", Vector3(c2.r, c2.g, c2.b))
		braco_mat.set_shader_parameter("manga_c0", 0.05 if mg[0] == "longa" else 0.6)
	var lv := inv.roupa.has("maos") and str(inv.roupa["maos"]["id"]) == "luvasCouro"
	braco_mat.set_shader_parameter("luva", 1.0 if lv else 0.0)


## a mão fecha no cabo do jeito da mão do corpo (o polegar para +z, o antebraço para +y, a palma para +x); a lanterna é segura
## pelo corpo (o eixo y dela) com o antebraço indo para o cotovelo. O pulso dobra o que falta para o antebraço ir para o
## cotovelo (atrás, embaixo e à direita da câmera), até um limite
func _dobrar_braco(dt: float) -> void:
	if braco_fp == null or not braco_fp.is_visible_in_tree():
		return
	var cot := mao_item.global_transform.affine_inverse() * mao.to_global(Vector3(0.45, -0.38, 0.0))
	var f := cot.normalized()
	var x := Vector3(0, 0, -1)
	var y := Vector3(0, 1, 0)
	if ferramenta_id == "lanterna":
		x = Vector3(0, 1, 0)
		y = (f - x * f.dot(x)).normalized()
		if y.length() < 0.5:
			y = Vector3(0, 0, 1)
	var z := x.cross(y)
	braco_fp.transform = Transform3D(Basis(x, y, z), Vector3.ZERO)
	var fx := f.dot(x)
	var fy := maxf(1e-6, f.dot(y))
	var fz := f.dot(z)
	var k := 1.0 - exp(-dt * 14.0)
	_dobra_a = lerpf(_dobra_a, clampf(atan2(fx, fy), -0.35, 0.7), k)
	_dobra_f = lerpf(_dobra_f, clampf(atan2(fz, fy), -0.9, 0.9), k)
	braco_mat.set_shader_parameter("dobra_a", _dobra_a)
	braco_mat.set_shader_parameter("dobra_f", _dobra_f)


## onde o item e a mão ficam na tela da primeira pessoa (o viewModel do jogo antigo): na mão, o cabo para cima e para a frente
## e a lâmina para a frente; de mãos vazias, o punho embaixo à direita. O golpe de cima (machado, picareta) sobe a mão para trás
## do ombro no preparo e cruza para o meio da tela, para baixo e para a frente, na descida; o soco sobe e avança para dentro da
## tela; a pistola e a lanterna ficam na frente; comendo, a mão vai para a boca
const VM_MAO := [0.29, -0.24, -0.52, -2.499, 0.062, 3.833]
const VM_VAZIA := [0.33, -0.46, -0.62, -2.45, 0.25, PI]
const GOLPE_FP := {"k": -0.85, "kd": 0.0, "sobe": [0.12, 0.08, 0.05, -0.293, 0.049, 0.188], "desce": [-0.18, -0.14, -0.18, 0.207, 0.149, 0.188]}
const GOLPE_FP_VAZIA := {"k": -0.85, "kd": 0.0, "sobe": [0.08, 0.3, 0.15, 0.4, 0.0, 0.0], "desce": [-0.22, 0.08, -0.08, 0.9, 0.1, 0.0]}


func _view_model() -> void:
	# o jogo antigo desenhava a mão com um campo de visão próprio, mais fechado (0,9 rad): na tela ela fica grande, embaixo à
	# direita, com o antebraço saindo pela borda. Aqui o mundo usa o campo de visão das configurações; a mão é esticada na
	# horizontal e na vertical da câmera para cair no mesmo lugar da tela (é o que o outro campo de visão faz)
	var kv := tan(deg_to_rad(cam.fov) * 0.5) / tan(0.45)
	mao.scale = Vector3(kv, kv, 1.0)
	var id := ferramenta_id
	var d := Dados.item(id) if id != "" and id != "-" else {}
	var com_item := ferramenta_no != null
	var fogo := bool(d.get("fogo", false)) or id == "lanterna" or id == "arco"
	var g0: Dictionary = GOLPE_FP if com_item else GOLPE_FP_VAZIA
	var b0: Array = VM_MAO if com_item else VM_VAZIA
	var sx := 0.0
	var sy := 0.0
	var kick := 0.0
	var gx := 0.0
	var gy := 0.0
	var gz := 0.0
	var gr := 0.0
	var a := minf(1.0, Vector2(velocity.x, velocity.z).length() / 4.0) if is_on_floor() else 0.0
	var bob := sin(balanco * 2.0) * 0.012 * a
	var bobx := cos(balanco) * 0.012 * a
	var soco := str(d.get("tipo", "")) != "arma"
	var s := clampf(golpe_t / golpe_dur, 0.0, 1.0) if golpe_t >= 0.0 else -1.0
	if s >= 0.0:
		var w := -Corpo._ease_io(s / 0.4) * 0.9 if s < 0.4 else lerpf(-0.9, 1.2, Corpo._ease_out(minf(1.0, (s - 0.4) / 0.25))) * (1.0 - smoothstep(0.7, 1.0, s))
		var vertical := bool(d.get("vertical", false)) or id == "pedra"
		if vertical:
			sx = w * (1.0 if soco else (float(g0["k"]) if w < 0.0 else float(g0["kd"])))
		else:
			sy = -w * 1.2
		if vertical and not soco:
			var sobe := Corpo._ease_io(s / 0.4) if s < 0.4 else 1.0 - Corpo._ease_out(minf(1.0, (s - 0.4) / 0.2))
			var desce := 0.0 if s < 0.4 else Corpo._ease_out(minf(1.0, (s - 0.4) / 0.2)) * (1.0 - smoothstep(0.68, 1.0, s))
			var ga: Array = g0["sobe"]
			var gb: Array = g0["desce"]
			gx = ga[0] * sobe + gb[0] * desce
			gy = ga[1] * sobe + gb[1] * desce
			gz = ga[2] * sobe + gb[2] * desce
			gr = ga[3] * sobe + gb[3] * desce
			sx += ga[4] * sobe + gb[4] * desce
			sy += ga[5] * sobe + gb[5] * desce
	if uso_t >= 0.0:
		kick = -0.5 * minf(1.0, minf(uso_t / 0.2, (0.9 - uso_t) / 0.2))
	var px: float = (0.17 if fogo else float(b0[0])) + bobx
	var py: float = (-0.17 if fogo else float(b0[1])) + bob
	var pz: float = -0.42 if fogo else float(b0[2])
	# soco de mãos vazias: o punho sobe e avança para dentro da tela
	if not fogo and s >= 0.0 and soco and id != "pedra":
		var k := sin(s * PI)
		px -= 0.13 * k
		py += 0.27 * k
		pz -= 0.16 * k
	if fogo:
		# mirando (botão direito): a arma vai para o meio da tela, na frente do olho; o coice sobe o cano
		var longa := id in ["espingarda", "rifle", "besta"]
		var ak := Corpo._ease_io(mira_k)
		px = lerpf(px, 0.0, ak)
		py = lerpf(py, -0.075 if longa else -0.1, ak)
		pz = lerpf(pz + (0.06 if longa else 0.0), -0.34 if longa else -0.38, ak)
		var coice := recuo * 4.0
		mao_item.transform = Transform3D(Basis.from_euler(Vector3(-PI / 2.0 + kick + coice, PI, 0.0)), Vector3(px, py, pz + coice * 0.25))
		# com a luneta no olho a arma some (a tela da luneta é o HUD)
		mao.visible = not terceira and not (id == "rifle" and mira_k > 0.6)
	else:
		mao.visible = not terceira
		mao_item.transform = Transform3D(Basis.from_euler(Vector3(float(b0[3]) + sx + kick, float(b0[4]) + sy, float(b0[5]) + gr)).scaled(Vector3.ONE * 0.85),
			Vector3(px + gx, py + gy, pz + gz))


## a lanterna acende com ela na mão ou ligada pelo F (estando na mochila), enquanto tiver pilha
func _luz() -> void:
	var na_mao: bool = str(item_mao().get("id", "")) == "lanterna"
	if lanterna_ligada and inv.conta("lanterna") <= 0:
		lanterna_ligada = false
	luz_mao.visible = (na_mao or lanterna_ligada) and bateria > 0.0


## F: liga e desliga a lanterna da mochila
func alternar_lanterna() -> void:
	if inv.conta("lanterna") <= 0:
		main.ui.aviso("Você não tem lanterna (procure nas casas e no posto)")
		return
	if bateria <= 0.0:
		main.ui.aviso("A lanterna está sem pilha (pilhas: Trocar pilhas)")
		return
	lanterna_ligada = not luz_mao.visible
	if not lanterna_ligada and str(item_mao().get("id", "")) == "lanterna":
		main.ui.aviso("A lanterna está na mão: troque de item para apagar")
	_luz()
	main.sons.tocar("clique", global_position, -14.0)


## B: põe o plano de construção na mão (ou volta para o item de antes)
func construir() -> void:
	if str(item_mao().get("id", "")) == "plano":
		selecionar(_antes_plano)
		return
	for i in Inventario.BARRA:
		var s = inv.slots[i]
		if s != null and str(s["id"]) == "plano":
			_antes_plano = sel
			selecionar(i)
			return
	if inv.conta("plano") > 0:
		main.ui.aviso("Ponha o plano de construção na barra rápida (1 a 6) para construir")
	else:
		main.ui.aviso("Faça o plano de construção (Tab, Fabricar: 1 madeira e 2 fibras)")


func _physics_process(dt: float) -> void:
	if not vivo:
		return
	cd = maxf(0.0, cd - dt)
	# fome e sede
	fome = maxf(0.0, fome - dt / 22.0)
	sede = maxf(0.0, sede - dt / 15.0 * (main.clima.sede() if main.clima != null else 1.0))
	if fome <= 0.0 or sede <= 0.0:
		ferir(dt * 0.8, false)
	elif fome > 60.0 and sede > 60.0 and vida < 100.0 and enjoo <= 0.0:
		vida = minf(100.0, vida + dt * 0.25)
	# dor de barriga: perde um pouco de vida e de água até passar (remédio corta)
	if enjoo > 0.0:
		enjoo -= dt
		ferir(dt * 0.25, false)
		sede = maxf(0.0, sede - dt * 0.15)
	# lanterna acesa gasta a pilha (10 minutos com a carga cheia)
	if luz_mao.visible:
		bateria = maxf(0.0, bateria - dt * 100.0 / 600.0)
		if bateria <= 0.0:
			luz_mao.visible = false
			main.ui.aviso("A pilha da lanterna acabou (pilhas: Trocar pilhas)")
	# movimento
	var dir := Vector3.ZERO
	if not preso:
		var mv := Input.get_vector("esquerda", "direita", "frente", "tras")
		dir = (transform.basis * Vector3(mv.x, 0, mv.y))
		dir.y = 0
		if dir.length() > 1.0:
			dir = dir.normalized()
		agachado = Input.is_action_pressed("agachar")
	var quer_correr := Input.is_action_pressed("correr") and not agachado and not preso and dir.length() > 0.1
	if energia <= 0.5:
		cansado = true
	elif energia >= 25.0:
		cansado = false
	var corre := quer_correr and not cansado
	# energia: correndo gasta (uns 8 s de corrida), parado ou andando volta depois de um instante
	if corre:
		energia = maxf(0.0, energia - dt * 12.0)
		_folego_t = 0.0
	else:
		_folego_t += dt
		if _folego_t > 0.8:
			energia = minf(100.0, energia + dt * (14.0 if dir.length() < 0.1 else 9.0))
	# com frio (de noite sem roupa quente, molhado, na frente fria, no inverno) a energia não enche (etapa 6b)
	if main.clima != null and main.clima.com_frio_rapido():
		var lim: float = 100.0 - 50.0 * (1.0 - main.clima.calor_roupa())
		if energia > lim:
			energia = maxf(lim, energia - 24.0 * dt)
		if not _dica_frio:
			_dica_frio = true
			main.ui.aviso("Está frio: sem roupa quente a sua energia não enche. Fique perto do fogo ou faça um casaco e um gorro de pele.", 7.0)
	_corre = corre and dir.length() > 0.1
	var vel := AGACHA if agachado else (CORRE if corre else ANDA)
	var alvo := dir * vel
	var k := 12.0 if is_on_floor() else 2.5
	velocity.x = lerpf(velocity.x, alvo.x, 1.0 - exp(-k * dt))
	velocity.z = lerpf(velocity.z, alvo.z, 1.0 - exp(-k * dt))
	if is_on_floor():
		if queda_v < -11.0:
			ferir((-queda_v - 11.0) * 6.0, false)
			tremor = 0.35
		queda_v = 0.0
		if Input.is_action_just_pressed("pular") and not preso and energia >= 6.0:
			velocity.y = PULO
			energia -= 6.0
			_folego_t = 0.0
	else:
		velocity.y -= GRAV * dt
		queda_v = minf(queda_v, velocity.y)
	move_and_slide()
	# meio-fio, soleira e degrau (até 55 cm, como no jogo antigo): sobe andando
	if is_on_wall() and is_on_floor() and Vector2(alvo.x, alvo.z).length() > 0.5:
		Jogador.degrau(self, Vector3(alvo.x, 0, alvo.z) * dt)
	# cabeça: altura agachado, balanço do passo, tremor
	var hs := Vector2(velocity.x, velocity.z).length()
	cabeca.position.y = lerpf(cabeca.position.y, 1.05 if agachado else 1.62, 1.0 - exp(-10.0 * dt))
	if is_on_floor() and hs > 0.5:
		balanco += dt * hs * 1.9
		passo -= dt * hs
		if passo <= 0.0:
			passo = 1.9 if corre else 1.5
			main.sons.tocar("passo", global_position, -10.0 if agachado else -2.0)
			# correndo faz barulho (os zumbis ouvem); andando, pouco; agachado, nada
			if not agachado:
				main.barulho(global_position, 9.0 if corre else 3.0)
	_bob = Vector3(cos(balanco) * 0.025 * minf(1.0, hs / 4.0), sin(balanco * 2.0) * 0.035 * minf(1.0, hs / 4.0), 0)
	tremor = maxf(0.0, tremor - dt)
	if tremor > 0.0:
		_bob += Vector3(randf() - 0.5, randf() - 0.5, 0) * tremor * 0.15
	if not terceira:
		cam.position = _bob
	golpe = maxf(0.0, golpe - dt * 3.2)
	_passo_acao(dt)
	_passo_armas(dt)
	if global_position.y < -30.0:
		ferir(999.0, false)


func _process(dt: float) -> void:
	_camera(dt)
	# mirando, o campo de visão fecha um pouco (a luneta do rifle, bem mais); o coice levanta a câmera e volta
	var id_m := str(item_mao().get("id", ""))
	var fov_alvo := fov_base * lerpf(1.0, 0.8, mira_k)
	if id_m == "rifle" and mira_k > 0.6:
		fov_alvo = 16.0
	cam.fov = fov_alvo if absf(cam.fov - fov_alvo) < 0.5 or mira_k <= 0.0 else lerpf(cam.fov, fov_alvo, 1.0 - exp(-dt * 18.0))
	cam.rotation.x = recuo
	_animar_corpo(dt)
	_view_model()
	_dobrar_braco(dt)
	if not vivo or preso:
		return
	if Input.is_action_just_pressed("camera"):
		alternar_camera()
	for i in Inventario.BARRA:
		if Input.is_action_just_pressed("barra%d" % (i + 1)):
			selecionar(i)
	if Input.is_action_pressed("atacar") and cd <= 0.0:
		atacar()
	# Q: o empurrão (com o plano na mão o Q troca a aba da construção)
	if Input.is_action_just_pressed("aba_obra") and not main.construcao.ativo:
		empurrar()
	if Input.is_action_just_pressed("usar"):
		usar()
	if Input.is_action_just_pressed("recarregar") and not main.construcao.ativo:
		recarregar()


## o que a mira pega (até "alcance")
func mira(alcance: float, mascara := 3) -> Dictionary:
	var sp := get_world_3d().direct_space_state
	var o := olho()
	var q := PhysicsRayQueryParameters3D.create(o, o - cam.global_transform.basis.z * alcance, mascara, [get_rid()])
	return sp.intersect_ray(q)


## a câmera da terceira pessoa (como a do jogo antigo, v10.3.2): atrás do ombro direito, 3,1 m; dentro de casa chega mais perto
## e mais para trás do ombro; batendo em parede chega na hora e só volta a afastar depois de um tempinho livre (sem vai e vem)
func _camera(dt: float) -> void:
	if not terceira:
		return
	var sp := get_world_3d().direct_space_state
	var cab := cabeca.global_position
	var teto := sp.intersect_ray(PhysicsRayQueryParameters3D.create(cab, cab + Vector3(0, 3.2, 0), 1, [get_rid()]))
	_cam_dentro = lerpf(_cam_dentro, 0.0 if teto.is_empty() else 1.0, 1.0 - exp(-dt * 3.0))
	var dist := lerpf(3.1, 2.2, _cam_dentro)
	var lado := lerpf(0.5, 0.42, _cam_dentro)
	# o ombro não pode entrar na parede do lado
	var piv := cabeca.to_global(Vector3(lado, 0, 0))
	var hl := sp.intersect_ray(PhysicsRayQueryParameters3D.create(cab, piv, 1, [get_rid()]))
	if not hl.is_empty():
		lado = maxf(0.0, cab.distance_to(hl["position"]) - 0.12)
		piv = cabeca.to_global(Vector3(lado, 0, 0))
	var dd := dist
	var h := sp.intersect_ray(PhysicsRayQueryParameters3D.create(piv, cabeca.to_global(Vector3(lado, 0, dist + 0.3)), 1, [get_rid()]))
	if not h.is_empty():
		dd = maxf(0.3, piv.distance_to(h["position"]) - 0.3)
	if dd < cam_dist - 0.05:
		_cam_livre = 0.0
	else:
		_cam_livre += dt
	if dd > cam_dist and _cam_livre < 0.3:
		dd = cam_dist
	cam_dist += (dd - cam_dist) * (1.0 - exp(-dt * (26.0 if dd < cam_dist else 4.0)))
	cam.position = Vector3(lado, 0, cam_dist)
	var cg := cam.global_position
	var gy: float = main.terreno.h(cg.x, cg.z) + 0.35
	if cg.y < gy and global_position.y > gy - 3.0:
		cam.global_position = Vector3(cg.x, gy, cg.z)
	# perto demais (encostado na parede): o corpo some para não tampar a vista
	corpo.primeira_pessoa(cam_dist < 0.75)
	# a lanterna sai do peito, para onde a câmera olha
	if luz_mao.visible:
		var fr := -cam.global_transform.basis.z
		luz_mao.global_transform = Transform3D(cam.global_transform.basis, global_position + Vector3(0, 1.35 if not agachado else 0.9, 0) + Vector3(fr.x, 0, fr.z).normalized() * 0.3)


## o corpo anda, corre, agacha, pula, cai e golpeia com o que o jogador faz
func _animar_corpo(dt: float) -> void:
	if corpo == null:
		return
	var id := str(item_mao().get("id", ""))
	var d := Dados.item(id) if id != "" else {}
	var gs := -1.0
	if golpe_t >= 0.0:
		if not golpe_parado:
			golpe_t += dt
		gs = golpe_t / golpe_dur
		if gs >= 1.0:
			golpe_t = -1.0
			gs = -1.0
	var uk := 0.0
	if uso_t >= 0.0:
		uso_t += dt
		uk = minf(1.0, minf(uso_t / 0.25, (0.9 - uso_t) / 0.25))
		if uso_t >= 0.9:
			uso_t = -1.0
			uk = 0.0
	corpo.animar(dt, {"vel": velocity, "chao": is_on_floor(), "agachado": agachado, "correndo": _corre, "ferido": vida < 28.0,
		"energia": energia, "item": id, "golpe": gs, "vertical": bool(d.get("vertical", false)), "usar": maxf(0.0, uk), "mira": mira_k,
		"vivo": vivo, "primeira": not terceira, "yaw": rotation.y, "vira_anda": bool(Ajustes.v.get("corpo_anda", false)),
		"acao": str(acao.get("tipo", "")), "acao_k": (float(acao["t"]) / float(acao["dur"])) if not acao.is_empty() else 0.0})
	# a roupa no corpo (muda pela mochila, rasga com os golpes)
	_roupa_t -= dt
	if _roupa_t <= 0.0:
		_roupa_t = 0.5
		corpo.vestir(inv.roupa)


func atacar() -> void:
	var it := item_mao()
	var id: String = it.get("id", "")
	var d := Dados.item(id)
	var tp := str(d.get("tipo", ""))
	if tp == "plano":
		return
	if tp in ["comida", "bebida", "cura"]:
		consumir()
		return
	if id == "sacoDormir":
		main.construcao.por_saco(self)
		cd = 0.5
		return
	if tp in ["util", "material", "garrafa"] and d.has("acao"):
		usar_item(sel)
		cd = 0.5
		return
	var arma := tp == "arma"
	var st: Dictionary = d if arma else Dados.MAO
	if not acao.is_empty():
		return
	# o laço de caça (etapa 6a): arma no chão, na frente
	if id == "laco":
		cd = 0.6
		if Rede.convidado():
			main.ui.aviso("Na partida em rede, por enquanto só quem abriu arma laço")
			return
		var r: String = main.fauna.armar_laco(self)
		main.ui.aviso(r, 4.0)
		if r.begins_with("Laço armado"):
			inv.tirar("laco", 1)
			main.ui.atualizar()
		return
	# armas de fogo e besta, o arco e o que se arremessa (molotov, bomba caseira, isca)
	if Armas.de_fogo(id):
		_disparar(it, id)
		return
	if id == "arco":
		_puxar_arco()
		return
	if bool(d.get("arremesso", false)):
		_arremesso(id)
		return
	# um zumbi caído na frente: o golpe vira pisão
	var caido = _caido_na_frente(1.7)
	if caido != null and energia >= 5.0:
		_pisao(caido)
		return
	cd = float(st.get("tempo", 0.55))
	golpe = 1.0
	golpe_t = 0.0
	golpe_dur = maxf(0.3, cd * 0.85)
	golpe_n += 1
	main.sons.tocar("golpe", global_position, -8.0)
	var alc := float(st.get("alcance", 1.9))
	var h := mira(alc + 0.7)
	# os zumbis: o da mira primeiro, depois os do arco do golpe (o golpe de lado pega até dois; o de cima, um)
	var direto = null
	if not h.is_empty() and (h["collider"] as Object).has_meta("zumbi"):
		direto = (h["collider"] as Object).get_meta("zumbi")
	var no_arco := _zumbis_no_golpe(alc)
	if direto != null or (not no_arco.is_empty() and (h.is_empty() or not (h["collider"] as Object).has_meta("recurso"))):
		var alvos := []
		if direto != null:
			alvos.append(direto)
		for z in no_arco:
			if z != direto:
				alvos.append(z)
		var max_hits := 1 if bool(d.get("vertical", false)) else 2
		for i in mini(max_hits, alvos.size()):
			_bater_zumbi(alvos[i], st, d, arma, h if alvos[i] == direto else {})
		main.ui.acerto()
		main.barulho(global_position, 6.0)
		if arma:
			_gastar()
		return
	if h.is_empty():
		return
	var c: Object = h["collider"]
	if c.has_meta("bicho") and c.get_meta("bicho").vivo:
		_bater_bicho(c.get_meta("bicho"), st, d, arma, h)
		main.ui.acerto()
		main.barulho(global_position, 6.0)
		if arma:
			_gastar()
		return
	if c.has_meta("recurso"):
		_coletar(c.get_meta("recurso"), d, arma, h)
		main.barulho(global_position, 6.0)
	elif c.has_meta("peca") and bool(d.get("conserta", false)):
		var r: String = main.construcao.consertar(c.get_meta("peca"), inv)
		if r == "":
			consertos += 1
			main.efeitos.lascas(h["position"], h["normal"], "madeira")
			_gastar()
		else:
			main.ui.aviso(r)


## um golpe num zumbi: de cima rende mais; agachado, pelas costas de quem não te viu, dobra (golpe furtivo); as armas pesadas
## às vezes derrubam
func _bater_zumbi(z, st: Dictionary, d: Dictionary, arma: bool, h: Dictionary) -> void:
	var dano := float(st.get("dano", 9.0)) * randf_range(0.92, 1.08) * (Armas.qual_dano(item_mao()) if arma else 1.0)
	if bool(d.get("vertical", false)):
		dano *= 1.15
	var furtivo: bool = agachado and z.estado in ["vaga", "alerta", "dorme"]
	if furtivo:
		dano *= 2.0
		main.ui.aviso("Golpe furtivo: dano dobrado")
	var emp := float(d.get("empurra", 0.6))
	var derr := 0.0
	if arma:
		derr = maxf(0.0, emp - 1.0) * 0.45 + (0.15 if bool(d.get("vertical", false)) and float(d.get("dano", 0.0)) >= 30.0 else 0.0)
	var p: Vector3 = h["position"] if not h.is_empty() else z.global_position + Vector3(0, 1.25 * z.escala, 0) + (global_position - z.global_position).normalized() * 0.28
	z.ferir(dano, global_position, 0, {"k": "golpe", "forte": d.has("empurra"), "empurra": emp, "derruba": derr})
	main.sons.tocar("acerto", p, 0.0)
	main.efeitos.sangue(p, (global_position + Vector3(0, 1.2, 0) - p).normalized())


## um golpe num bicho (etapa 6a): o dano da arma ou da ferramenta; agachado e sem ele te ver, dobra
func _bater_bicho(b, st: Dictionary, d: Dictionary, arma: bool, h: Dictionary) -> void:
	var dano := float(st.get("dano", 9.0)) * randf_range(0.92, 1.08) * (Armas.qual_dano(item_mao()) if arma else 1.0)
	if bool(d.get("vertical", false)):
		dano *= 1.15
	if agachado and float(b.alerta) < 0.3:
		dano *= 2.0
	var p: Vector3 = h["position"] if not h.is_empty() else b.centro()
	b.ferir(dano, global_position, "golpe")
	main.sons.tocar("acerto", p, 0.0)
	main.efeitos.sangue(p, (global_position + Vector3(0, 1.2, 0) - p).normalized())


## a lâmina gasta um pouco a cada carcaça esfolada
func gastar_lamina(s: Dictionary, n: int) -> void:
	if not s.has("dur"):
		return
	s["dur"] = float(s["dur"]) - n
	if float(s["dur"]) <= 0.0:
		var i := inv.slots.find(s)
		if i >= 0:
			inv.slots[i] = null
			inv.mudou.emit()
		main.ui.aviso("A %s quebrou" % Dados.nome(str(s["id"])).to_lower())
	main.ui.atualizar()


## os zumbis no arco do golpe (na frente, ao alcance, sem parede no meio), do mais perto para o mais longe
func _zumbis_no_golpe(alc: float) -> Array:
	var fr := -global_transform.basis.z
	fr.y = 0.0
	fr = fr.normalized()
	var L := []
	for z in main.zumbis:
		if not is_instance_valid(z) or z.estado == "morto":
			continue
		var dz: Vector3 = z.global_position - global_position
		if absf(dz.y) > 1.7:
			continue
		dz.y = 0.0
		var dd := dz.length()
		if dd < 0.01 or dd > alc + float(z.S["r"]) + 0.15 or fr.dot(dz / dd) < 0.32:
			continue
		if not _livre_ate(z):
			continue
		L.append([dd, z])
	L.sort_custom(func(a, b): return a[0] < b[0])
	var r := []
	for e in L:
		r.append(e[1])
	return r


## nada (parede, porta, árvore) entre o peito e o zumbi
func _livre_ate(z) -> bool:
	var a := global_position + Vector3(0, 1.2, 0)
	var b: Vector3 = z.global_position + Vector3(0, 1.0 * z.escala, 0)
	var q := PhysicsRayQueryParameters3D.create(a, b, 1, [get_rid(), z.get_rid()])
	var h := get_world_3d().direct_space_state.intersect_ray(q)
	return h.is_empty() or (h["collider"] as Object).has_meta("zumbi")


func _caido_na_frente(alc: float):
	var fr := -global_transform.basis.z
	fr.y = 0.0
	fr = fr.normalized()
	var melhor = null
	var bd := alc
	for z in main.zumbis:
		if not is_instance_valid(z) or z.estado != "derrubado":
			continue
		var dz: Vector3 = z.global_position - global_position
		if absf(dz.y) > 1.2:
			continue
		dz.y = 0.0
		var dd := dz.length()
		if dd < bd and fr.dot(dz / maxf(dd, 0.01)) > 0.25:
			bd = dd
			melhor = z
	return melhor


# ---------------------------------------------------------------- empurrão, voadora e pisão (64b_combate.js do jogo antigo)
## Q: empurra quem está na frente (cambaleiam para trás; golpe logo depois derruba). Correndo, vira voadora: pula com o pé e
## derruba (o brutamontes só cambaleia). Com um zumbi caído na frente, vira pisão na cabeça
func empurrar() -> void:
	if not vivo or not acao.is_empty() or cd > 0.0:
		return
	var caido = _caido_na_frente(1.9)
	if caido != null and energia >= 5.0:
		_pisao(caido)
		return
	if _corre and is_on_floor() and energia >= 14.0:
		energia -= 14.0
		_folego_t = 0.0
		var fr := -global_transform.basis.z
		fr.y = 0.0
		fr = fr.normalized()
		velocity.x = fr.x * 8.2
		velocity.z = fr.z * 8.2
		velocity.y = 3.3
		acao = {"tipo": "voadora", "t": 0.0, "dur": 0.7, "feito": false, "dir": fr}
		acao_n += 1
		main.sons.tocar("golpe", global_position, -4.0)
		main.barulho(global_position, 5.0)
		return
	if energia < 8.0:
		return
	energia -= 8.0
	_folego_t = 0.0
	acao = {"tipo": "empurrao", "t": 0.0, "dur": 0.4, "feito": false}
	acao_n += 1
	cd = 0.45
	main.sons.tocar("golpe", global_position, -8.0)


func _pisao(z) -> void:
	energia -= 5.0
	_folego_t = 0.0
	acao = {"tipo": "pisao", "t": 0.0, "dur": 0.62, "feito": false, "alvo": z}
	acao_n += 1
	cd = 0.62
	main.sons.tocar("golpe", global_position, -6.0)


func _passo_acao(dt: float) -> void:
	if acao.is_empty():
		return
	acao["t"] = float(acao["t"]) + dt
	var t: float = acao["t"]
	var fr := -global_transform.basis.z
	fr.y = 0.0
	fr = fr.normalized()
	match str(acao["tipo"]):
		"esfolar":
			var b = acao["bicho"]
			if not is_instance_valid(b) or global_position.distance_to(b.global_position) > ALCANCE + 1.5 or not Input.is_action_pressed("usar"):
				acao = {}
				main.ui.aviso("Parou de esfolar")
				return
			if t >= float(acao["dur"]):
				acao = {}
				if b.lan:
					Rede.esfolar_b(b.uid)
				else:
					var r: String = main.fauna.esfolar(b, self)
					if r != "":
						main.ui.aviso(r, 5.0)
					main.ui.atualizar()
				return
		"recarga":
			if sel != int(acao.get("slot", sel)):
				acao = {}
				return
			if t >= float(acao["dur"]):
				_fim_recarga()
		"arco":
			acao["puxa"] = minf(1.0, t / float(Armas.ARCO["puxa"]))
			if float(acao["puxa"]) >= 1.0:
				energia = maxf(0.0, energia - (9.0 + float(Armas.ARCO["energia"])) * dt)
				_folego_t = 0.0
				if not acao.get("cheio", false):
					acao["cheio"] = true
					main.sons.tocar("clique", global_position, -10.0)
			if not Input.is_action_pressed("atacar") or energia <= 0.0 or sel != int(acao.get("slot", sel)) or bool(acao.get("soltar", false)):
				if float(acao["puxa"]) > 0.2:
					_soltar_flecha(float(acao["puxa"]))
				acao = {}
				cd = 0.22
				return
		"arremesso":
			if not acao["feito"] and t >= float(acao["dur"]) * 0.4:
				acao["feito"] = true
				_lancar(str(acao["id"]))
		"empurrao":
			if not acao["feito"] and t >= 0.15:
				acao["feito"] = true
				var n := 0
				for z in main.zumbis:
					if not is_instance_valid(z) or z.estado == "morto":
						continue
					var dz: Vector3 = z.global_position - global_position
					dz.y = 0.0
					var dd := dz.length()
					if dd < 2.2 and fr.dot(dz / maxf(dd, 0.01)) > 0.3 and _livre_ate(z):
						z.empurrar(dz)
						n += 1
				if n > 0:
					main.sons.tocar("acerto", global_position + fr, -2.0)
				main.barulho(global_position, 6.0)
		"voadora":
			var dirv: Vector3 = acao["dir"]
			if not acao["feito"] and t >= 0.16:
				var n := 0
				for z in main.zumbis:
					if not is_instance_valid(z) or z.estado == "morto":
						continue
					var dz: Vector3 = z.global_position - global_position
					if absf(dz.y) > 1.6:
						continue
					dz.y = 0.0
					var dd := dz.length()
					if dd < 2.5 and dirv.dot(dz / maxf(dd, 0.01)) > 0.35:
						z.ferir(12.0, global_position, 0, {"k": "voadora", "forte": true, "derruba": 1.0, "empurra": 1.8})
						n += 1
				if n > 0:
					acao["feito"] = true
					main.sons.tocar("impacto", global_position, 2.0)
					tremor = 0.3
					velocity.x *= 0.35
					velocity.z *= 0.35
				elif t >= 0.42:
					acao["feito"] = true
		"pisao":
			if not acao["feito"] and t >= 0.34:
				acao["feito"] = true
				var z = acao.get("alvo")
				if z != null and is_instance_valid(z) and z.estado == "derrubado" and z.global_position.distance_to(global_position) < 2.3:
					var p: Vector3 = z.global_position + Vector3(0, 0.2, 0)
					z.ferir(260.0, global_position, 0, {"k": "pisao", "forte": true})
					main.efeitos.sangue(p, Vector3.UP)
					main.efeitos.sangue(p, Vector3.UP)
					main.sons.tocar("impacto", p, 2.0)
					main.sons.tocar("acerto", p, 2.0)
					tremor = 0.35
					main.barulho(global_position, 6.0)
					main.ui.acerto()
				else:
					main.sons.tocar("passo", global_position, 0.0)
	if not acao.is_empty() and t >= float(acao.get("dur", 0.0)):
		acao = {}


## o golpe gastou a arma/ferramenta da mão (quebra quando acaba, como no jogo antigo)
func _gastar() -> void:
	var it := item_mao()
	if it.is_empty():
		return
	if inv.gastar(sel, 1.0):
		main.ui.aviso("%s quebrou." % Dados.nome(str(it["id"])))
		main.sons.tocar("pedra", global_position, -6.0)


func _ganhar(id: String, n: int, extra := {}) -> void:
	if n <= 0:
		return
	var sobra := inv.por(id, n, extra)
	if n - sobra > 0:
		main.ui.aviso("+%d %s" % [n - sobra, Dados.nome(id)])
	if sobra > 0:
		main.construcao.soltar_no_chao(global_position, [[id, sobra, extra]])
		main.ui.aviso("Sem espaço: %s ficou no chão" % Dados.nome(id))


## coleta do jogo antigo (árvore, rocha, tronco caído, moita e o que fica no chão)
func _coletar(i: int, d: Dictionary, arma: bool, h: Dictionary) -> void:
	var rec: Dictionary = main.mundo.recursos[i]
	var tp: String = rec["tipo"]
	match tp:
		"arvore":
			if arma and bool(d.get("corta", false)):
				var caiu: bool = main.mundo.golpe(i)
				_ganhar("madeira", 1 + (1 if randf() < float(d.get("rende", 0.5)) else 0))
				if caiu:
					_ganhar("madeira", maxi(2, roundi(1.5 * float(rec.get("s", 1.0)))))
				_gastar()
			elif arma:
				main.ui.aviso("Isso não corta árvore: use um machado (ou bata com a mão)")
				return
			else:
				# na mão: a cada 3 socos, 1 madeira; com uma pedra na mão, a cada 2 (e às vezes a pedra racha)
				soco_mad += 1.0
				if str(item_mao().get("id", "")) == "pedra":
					soco_mad += 0.5
					if randf() < 0.1:
						inv.usar_um(sel)
						main.ui.aviso("A pedra rachou")
				if soco_mad >= 3.0:
					soco_mad = 0.0
					main.mundo.golpe(i)
					_ganhar("madeira", 1)
			main.sons.tocar("madeira", h["position"], 0.0)
			main.efeitos.lascas(h["position"], h["normal"], "madeira")
		"pedra":
			if arma and bool(d.get("minera", false)):
				main.mundo.golpe(i)
				_ganhar("pedra", 2)
				if randf() < (0.5 if rec.get("serra", false) else 0.1):
					_ganhar("minerioFerro", 1)
				_gastar()
				main.sons.tocar("pedra", h["position"], 0.0)
				main.efeitos.lascas(h["position"], h["normal"], "pedra")
			else:
				main.ui.aviso("Rocha só quebra com picareta (2 pedras, 2 gravetos e 3 fibras)")
				main.sons.tocar("pedra", h["position"], -8.0)
		"tronco":
			if arma and bool(d.get("corta", false)):
				main.mundo.golpe(i)
				_ganhar("madeira", 2)
				_gastar()
				main.sons.tocar("madeira", h["position"], 0.0)
				main.efeitos.lascas(h["position"], h["normal"], "madeira")
			else:
				main.ui.aviso("Tronco caído: corte com o machado")
		_:
			_colher(i, h)


## moita e o que fica no chão: pega com E (ou batendo)
func _colher(i: int, h: Dictionary) -> void:
	var rec: Dictionary = main.mundo.recursos[i]
	if not main.mundo.golpe(i):
		return
	if rec["tipo"] == "planta":
		if rec.get("fruta", false):
			_ganhar("frutas", randi_range(2, 4))
			_ganhar("fibra", 1)
		else:
			_ganhar("fibra", randi_range(1, 2))
		main.sons.tocar("planta", h["position"], -3.0)
		main.efeitos.lascas(h["position"], h["normal"], "fibra")
		return
	match str(rec.get("nome", "")):
		"pedra":
			_ganhar("pedra", 1 + (1 if randf() < 0.5 else 0))
		"galho":
			_ganhar("graveto", 2 + (1 if randf() < 0.4 else 0))
		"fibra":
			_ganhar("fibra", 2 + (1 if randf() < 0.5 else 0))
		"cogumelo":
			_ganhar("cogumelo", 1)
	main.sons.tocar("caixa", h["position"], -3.0)


func usar() -> void:
	var h := mira(ALCANCE + 0.4)
	if not h.is_empty():
		var c: Object = h["collider"]
		if c.has_meta("bicho"):
			var b = c.get_meta("bicho")
			if is_instance_valid(b) and not b.vivo:
				esfolar(b)
				return
		if c.has_meta("laco"):
			main.fauna.usar_laco(c.get_meta("laco"), self)
			return
		if c.has_meta("caixa"):
			var L: Array = main.mundo.revistar(c.get_meta("caixa"))
			if L.is_empty():
				main.ui.aviso("Não tem nada aqui (volta a ter coisa depois)")
			for e in L:
				_ganhar(str(e[0]), int(e[1]), e[2] if e.size() > 2 else {})
			main.sons.tocar("caixa", h["position"], 0.0)
			return
		if c.has_meta("porta"):
			main.construcao.alternar_porta(c.get_meta("porta"))
			return
		if c.has_meta("bau"):
			var b: Dictionary = main.construcao.baus[c.get_meta("bau")]
			main.ui.abrir_bau(b["inv"], str(b.get("titulo", "Baú")))
			return
		if c.has_meta("obra"):
			main.construcao.interagir(c.get_meta("obra"), self)
			return
		if c.has_meta("agua"):
			_agua(true, str(main.mundo.aguas[c.get_meta("agua")]["nome"]))
			return
		if c.has_meta("recurso"):
			var i: int = c.get_meta("recurso")
			var rec: Dictionary = main.mundo.recursos[i]
			if rec["tipo"] in ["planta", "solto"]:
				_colher(i, h)
				return
	# rio ou lago (o mar é salgado): a água tem que estar logo ali na frente, para onde você olha
	for dist in [1.0, 1.5, 2.0, 2.5, 3.0]:
		var o: Vector3 = olho() - cam.global_transform.basis.z * dist
		var nivel: float = main.terreno.nivel_agua(o.x, o.z)
		if nivel < -900.0 or absf(global_position.y - nivel) > 2.5:
			continue
		if main.terreno.tipo_agua(o.x, o.z) == 2:
			main.ui.aviso("Água do mar é salgada: não mata a sede")
			return
		_agua(false, "rio")
		return


## esfolar a carcaça (etapa 6a): segure E o tempo da espécie (precisa de uma lâmina na mochila)
func esfolar(b) -> void:
	if not acao.is_empty():
		return
	if not b.lan and (b.carc.is_empty() or bool(b.carc.get("vazia", false))):
		main.ui.aviso("Não sobrou nada nesta carcaça")
		return
	if main.fauna.lamina(inv).is_empty():
		main.ui.aviso("Precisa de uma faca (ou outra lâmina) para esfolar. Faca de pedra: 1 madeira e 2 pedras.", 4.0)
		return
	acao = {"tipo": "esfolar", "t": 0.0, "dur": main.fauna.tempo_esfolar(b), "feito": false, "bicho": b}
	main.sons.tocar("planta", b.global_position, -4.0)


## água: com a garrafa vazia na mão, enche todas as vazias da mochila (limpa no poço e no barril, suja no rio e no lago);
## sem ela na mão, bebe ali mesmo
func _agua(limpa: bool, onde: String) -> void:
	var vazias := inv.conta("garrafa")
	if vazias > 0 and str(item_mao().get("id", "")) == "garrafa":
		inv.tirar("garrafa", vazias)
		_ganhar("agua" if limpa else "aguaSuja", vazias)
		main.ui.aviso("Encheu %d garrafa%s (%s)" % [vazias, "s" if vazias > 1 else "", "água limpa" if limpa else "água suja: ferva na fogueira"])
	else:
		sede = minf(100.0, sede + (30.0 if limpa else 25.0))
		main.ui.aviso("Você bebeu água (%s)" % onde)
		if not limpa and randf() < 0.3:
			_enjoar()
	main.sons.tocar("agua", global_position, -4.0)


func _enjoar() -> void:
	enjoo = maxf(enjoo, 60.0)
	main.ui.aviso("Dor de barriga: perde vida até passar (remédio ajuda)", 4.0)

## sobe um degrau de até "alt" m (meio-fio, soleira, degrau de escada): se um pouco mais alto dá para seguir andando
## e lá na frente tem chão, o corpo vai para cima dele. Serve para o jogador e para os zumbis.
static func degrau(c: CharacterBody3D, mov: Vector3, alt := 0.55) -> bool:
	var hz := Vector3(mov.x, 0.0, mov.z)
	if hz.length() < 0.0005:
		return false
	hz = hz.normalized() * maxf(hz.length(), 0.12)
	var xf := c.global_transform
	var sobe := Vector3(0, alt, 0)
	var col := KinematicCollision3D.new()
	if c.test_move(xf, sobe, col):
		sobe = col.get_travel()
		if sobe.y < 0.12:
			return false
	var alto := xf.translated(sobe)
	if c.test_move(alto, hz):
		return false
	var frente := alto.translated(hz)
	if not c.test_move(frente, -sobe - Vector3(0, 0.05, 0), col):
		return false
	if col.get_normal().y < 0.7:
		return false
	var y := frente.origin.y + col.get_travel().y
	if y - xf.origin.y < 0.02:
		return false
	c.global_position = Vector3(frente.origin.x, y + 0.01, frente.origin.z)
	return true


func consumir() -> void:
	consumir_slot(sel)


## come, bebe ou usa o remédio do espaço i (efeitos do jogo antigo: fome, sede, vida; a garrafa volta vazia; água suja e
## carne crua podem dar dor de barriga)
func consumir_slot(i: int) -> void:
	var it = inv.slots[i]
	if it == null:
		return
	var id: String = it["id"]
	var d := Dados.item(id)
	fome = clampf(fome + float(d.get("fome", 0.0)), 0.0, 100.0)
	sede = clampf(sede + float(d.get("sede", 0.0)), 0.0, 100.0)
	vida = clampf(vida + float(d.get("vida", 0.0)), 0.0, 100.0)
	inv.usar_um(i)
	if d.has("vira"):
		_ganhar(str(d["vira"]), 1)
	if float(d.get("suja", 0.0)) > 0.0 and randf() < float(d["suja"]):
		_enjoar()
	if id == "carneCrua" and randf() < 0.35:
		_enjoar()
	cd = 0.8
	uso_t = 0.0
	uso_n += 1
	var verbo := "Bebeu" if str(d.get("tipo", "")) == "bebida" else ("Usou" if str(d.get("tipo", "")) == "cura" else "Comeu")
	main.ui.aviso("%s: %s" % [verbo, d.get("nome", id)])
	main.sons.tocar("comer", global_position, -4.0)


## a ação de um item que não é de comer (a do jogo antigo: ler, trocar pilhas, remendar, purificar, tomar remédio...)
func usar_item(i: int) -> void:
	var it = inv.slots[i]
	if it == null:
		return
	var id: String = it["id"]
	var d := Dados.item(id)
	match id:
		"remedios":
			inv.usar_um(i)
			enjoo = 0.0
			vida = minf(100.0, vida + 6.0)
			main.ui.aviso("Tomou remédio: a dor de barriga passou")
		"pilhas":
			if bateria >= 99.0:
				main.ui.aviso("A lanterna já está com a pilha cheia")
				return
			inv.usar_um(i)
			bateria = minf(100.0, bateria + 50.0)
			main.ui.aviso("Trocou as pilhas da lanterna (%d%%)" % roundi(bateria))
		"fita":
			# remenda a ferramenta mais gasta (primeiro a da mão): devolve 35% do estado
			var alvo := -1
			var pior := 2.0
			for k in inv.limite:
				var s = inv.slots[k]
				if s == null or not s.has("dur"):
					continue
				var f := float(s["dur"]) / Armas.dur_max(str(s["id"]), s.get("q", 1))
				if k == sel and f < 1.0:
					alvo = k
					break
				if f < pior:
					pior = f
					alvo = k
			if alvo < 0 or pior >= 1.0 and alvo != sel:
				main.ui.aviso("Nada gasto para remendar")
				return
			var s2: Dictionary = inv.slots[alvo]
			var mx := Armas.dur_max(str(s2["id"]), s2.get("q", 1))
			s2["dur"] = minf(mx, float(s2["dur"]) + mx * 0.35)
			inv.usar_um(i)
			main.ui.aviso("Remendou: %s" % Dados.nome(str(s2["id"])))
		"pastilha":
			if inv.conta("aguaSuja") <= 0:
				main.ui.aviso("Precisa de uma garrafa de água suja")
				return
			inv.tirar("aguaSuja", 1)
			inv.usar_um(i)
			_ganhar("agua", 1)
		"receita":
			var r := _aprender_uma()
			inv.usar_um(i)
			main.ui.aviso("Aprendeu: %s" % r if r != "" else "Você já sabia tudo o que estava escrito", 4.0)
		"plantaFerro", "plantaEstufa", "plantaRadio":
			aprendidas[id] = true
			inv.usar_um(i)
			main.ui.aviso("Aprendeu a construir com a %s" % Dados.nome(id), 4.0)
		"sacoDormir":
			main.construcao.por_saco(self)
		_:
			main.ui.aviso("%s: chega numa próxima etapa" % str(d.get("acao", d.get("nome", id))))


## folha de receita: aprende uma receita trancada (primeiro as de manual e de estudo)
func _aprender_uma() -> String:
	var opcoes := []
	for r in Dados.RECEITAS:
		var db = r.get("desb")
		if typeof(db) != TYPE_DICTIONARY or aprendidas.has(str(r["faz"])):
			continue
		if Fabricacao.desbloqueada(r, self):
			continue
		opcoes.append(r)
	if opcoes.is_empty():
		return ""
	var esc_r: Dictionary = opcoes[randi() % opcoes.size()]
	aprendidas[str(esc_r["faz"])] = true
	return Dados.nome(str(esc_r["faz"]))


## de: de onde veio o golpe (a seta vermelha mostra o lado)
func ferir(dano: float, tremer := true, de := Vector3.INF) -> void:
	if not vivo:
		return
	# a roupa segura parte do golpe (não da fome, da sede ou da queda) e gasta com isso
	if tremer:
		dano *= 1.0 - inv.protecao()
		for lugar in inv.roupa.keys():
			var r: Dictionary = inv.roupa[lugar]
			if lugar != "costas" and r.has("dur") and float(Dados.item(str(r["id"])).get("prot", 0.0)) > 0.0:
				r["dur"] = float(r["dur"]) - 1.0
				if float(r["dur"]) <= 0.0:
					inv.roupa.erase(lugar)
					main.ui.aviso("%s rasgou." % Dados.nome(str(r["id"])))
	vida -= dano
	if tremer:
		tremor = 0.25
		main.ui.dano(de)
		main.sons.tocar("dor", global_position, -2.0)
	if vida <= 0.0:
		vida = 0.0
		vivo = false
		morreu.emit()


func renascer(p: Vector3) -> void:
	global_position = p
	velocity = Vector3.ZERO
	acao = {}
	vida = 100.0
	fome = 80.0
	sede = 80.0
	vivo = true
	queda_v = 0.0
	enjoo = 0.0
	energia = 100.0
	cansado = false
	lanterna_ligada = false
	inv = Inventario.new()
	_ligar_inv()
	ferramenta_id = "-"
	_atualizar_mao()
	inv.mudou.emit()
	golpe_t = -1.0
	uso_t = -1.0
	corpo.ini = false
	corpo.vestir(inv.roupa)
	_vestir_braco()

# ---------------------------------------------------------------- armas de fogo, besta, arco e arremesso (etapa 5)
## a arma de fogo ou o arco na mão: o botão direito mira
func _arma_mira() -> bool:
	var id := str(item_mao().get("id", ""))
	return Armas.de_fogo(id) or id == "arco"


## o ponto onde a mira pega (zumbi, parede, árvore ou chão), até maxd
func ponto_mira(maxd: float) -> Vector3:
	var o := cam.global_position
	var d := -cam.global_transform.basis.z
	var h := get_world_3d().direct_space_state.intersect_ray(PhysicsRayQueryParameters3D.create(o, o + d * maxd, 1, [get_rid()]))
	return h["position"] if not h.is_empty() else o + d * maxd


## de onde sai o tiro (a boca da arma): na primeira pessoa, na frente da câmera; na terceira, na frente do peito do lado direito
func boca_arma(longa: bool) -> Vector3:
	var b := cam.global_transform.basis
	if not terceira or mira_k > 0.6:
		return cam.global_position - b.z * 0.9 + b.x * 0.12 * (1.0 - mira_k) - b.y * 0.1
	var fr := -global_transform.basis.z
	var lado := global_transform.basis.x
	return global_position + Vector3(0, 1.42 if not agachado else 0.95, 0) + fr * (0.75 if longa else 0.5) + lado * 0.18


## o que o tiro pega primeiro: um zumbi (o ponto e ele) ou um obstáculo (parede, árvore, chão: as faíscas)
func _tiro_hit(o: Vector3, d: Vector3, maxd: float, ign: Array) -> Dictionary:
	var fora: Array[RID] = [get_rid()]
	for z in ign:
		fora.append((z as CollisionObject3D).get_rid())
	var h := get_world_3d().direct_space_state.intersect_ray(PhysicsRayQueryParameters3D.create(o, o + d * maxd, 1, fora))
	if h.is_empty():
		return {}
	var c: Object = h["collider"]
	if c.has_meta("zumbi"):
		var z = c.get_meta("zumbi")
		if is_instance_valid(z) and z.estado != "morto":
			return {"z": z, "p": h["position"], "n": h["normal"]}
	if c.has_meta("bicho"):
		var b = c.get_meta("bicho")
		if is_instance_valid(b) and b.vivo:
			return {"b": b, "p": h["position"], "n": h["normal"]}
	return {"p": h["position"], "n": h["normal"], "c": c}


## o tiro (pistola, espingarda, rifle) ou o virote (besta)
func _disparar(s: Dictionary, id: String) -> void:
	var B := Armas.dados(id)
	if int(s.get("mun", 0)) <= 0:
		main.sons.tocar("vazio", global_position, -4.0)
		cd = 0.35
		if inv.conta(str(B["municao"])) > 0:
			recarregar()
		else:
			main.ui.aviso("Sem %s (procure na delegacia, no posto, nos carros e na base militar)" % Dados.nome(str(B["municao"])).to_lower())
		return
	s["mun"] = int(s["mun"]) - 1
	cd = float(B["tempo"])
	acao = {"tipo": "tiro", "t": 0.0, "dur": minf(float(B["tempo"]), 0.3), "feito": true}
	acao_n += 1
	tiro_n += 1
	var q := int(s.get("q", 1))
	var o := cam.global_position
	var dir := -cam.global_transform.basis.z
	var boca := boca_arma(id != "pistola")
	main.sons.tocar(str(B["som"]), global_position, 6.0 if id != "besta" else -2.0)
	main.barulho(global_position, float(B["barulho"]))
	recuo += float(B["recuo"]) * (0.6 if mira_k > 0.6 else 1.0)
	tremor = maxf(tremor, 0.08 if id in ["pistola", "besta"] else 0.2)
	main.ui.hud_item()
	if id == "besta":
		var vb: float = B["vel"]
		var db := Armas.balistica(boca, ponto_mira(120.0), vb, float(Armas.ARCO["g"]))
		main.projeteis.flecha(boca, db, vb, float(B["dano"]) * float(Armas.QUAL_DANO[clampi(q, 0, 3)]), "besta", "virote")
		_besta_t = 0.35
		return
	main.efeitos.boca(boca, dir, id != "pistola")
	var mirando := mira_k > 0.6
	if B.has("chumbo"):
		# espingarda: 8 bagos; o dano de todos no mesmo zumbi vai junto
		var acum := {}
		var ab := Armas.abre(id, mirando, _corre)
		for k in int(B["chumbo"]):
			var d2 := Armas.espalhar(dir, ab)
			var h := _tiro_hit(o, d2, 45.0, [])
			if h.has("z"):
				var z = h["z"]
				var hp: Vector3 = h["p"]
				var reg := Armas.regiao(z, hp)
				var a: Dictionary = acum.get(z, {"dano": 0.0, "head": false, "n": 0, "p": hp})
				a["dano"] = float(a["dano"]) + Armas.dano_tiro(id, reg, cam.global_position.distance_to(hp), q)
				a["head"] = bool(a["head"]) or reg == "cabeca"
				a["n"] = int(a["n"]) + 1
				a["p"] = hp
				acum[z] = a
			elif h.has("b"):
				var bb = h["b"]
				var hb: Vector3 = h["p"]
				bb.ferir(Armas.dano_tiro(id, "tronco", cam.global_position.distance_to(hb), q), global_position, "bala")
				main.efeitos.sangue(hb, -dir)
				main.ui.acerto()
			elif h.has("p"):
				main.efeitos.faiscas(h["p"])
		var cab := false
		for z in acum:
			var a: Dictionary = acum[z]
			main.efeitos.sangue(a["p"], -dir)
			if int(a["n"]) >= 4:
				main.efeitos.sangue(a["p"], -dir)
			cab = cab or bool(a["head"])
			z.ferir(float(a["dano"]), global_position, 0, {"k": "bala", "head": a["head"], "reg": "cabeca" if a["head"] else "tronco", "arma": id,
				"mult": 1.6 if a["head"] else 1.0, "forte": true, "empurra": 0.8 if int(a["n"]) >= 4 else 0.4})
		if not acum.is_empty():
			main.ui.acerto(cab)
		return
	# pistola e rifle (o rifle atravessa até dois zumbis; o segundo leva menos)
	dir = Armas.espalhar(dir, Armas.abre(id, mirando, _corre))
	var ign := []
	var n := 0
	var oo := o
	var fim := o + dir * 60.0
	var cat := str(B["cat"])
	while n < int(B.get("atravessa", 1)):
		var h := _tiro_hit(oo, dir, 140.0 if id == "rifle" else 70.0, ign)
		if h.has("b"):
			var hb: Vector3 = h["p"]
			var cab_b: bool = hb.y > float(h["b"].global_position.y) + ModelosBichos.altura_corpo(h["b"].F) * float(h["b"].esc) * 1.35
			h["b"].ferir(Armas.dano_tiro(id, "cabeca" if cab_b else "tronco", cam.global_position.distance_to(hb), q), global_position, "bala")
			main.efeitos.sangue(hb, -dir)
			main.ui.acerto(cab_b)
			fim = hb
			break
		if not h.has("z"):
			if h.has("p"):
				main.efeitos.faiscas(h["p"])
				fim = h["p"]
			break
		var z = h["z"]
		var hp: Vector3 = h["p"]
		var reg := Armas.regiao(z, hp)
		var dano := Armas.dano_tiro(id, reg, cam.global_position.distance_to(hp), q) * (float(B.get("atravessa_k", 1.0)) if n > 0 else 1.0)
		main.efeitos.sangue(hp, -dir)
		if reg == "cabeca":
			main.efeitos.sangue(hp, -dir)
		z.ferir(dano, global_position, 0, {"k": "bala", "head": reg == "cabeca", "reg": reg, "arma": id, "mult": Armas.mult_regiao(cat, reg),
			"forte": true, "empurra": 0.7 if id == "rifle" else 0.45})
		main.ui.acerto(reg == "cabeca")
		ign.append(z)
		n += 1
		oo = hp + dir * 0.05
		fim = hp
	if n >= 2:
		main.ui.aviso("Dois de uma vez!")
	if id == "rifle":
		main.efeitos.rastro(boca, fim)


## R: recarrega a arma da mão com a munição da mochila (a espingarda põe um cartucho de cada vez)
func recarregar() -> void:
	var s := item_mao()
	var id := str(s.get("id", ""))
	# o coice do tiro não impede (dá para recarregar logo depois de atirar)
	if not Armas.de_fogo(id) or not vivo or (not acao.is_empty() and str(acao.get("tipo", "")) != "tiro"):
		return
	var B := Armas.dados(id)
	var mun := int(s.get("mun", 0))
	if mun >= int(B["pente"]):
		return
	var tem := inv.conta(str(B["municao"]))
	if tem <= 0:
		main.ui.aviso("Sem %s" % Dados.nome(str(B["municao"])).to_lower())
		return
	var dur := float(B.get("recarga", 1.3))
	if bool(B.get("por_cartucho", false)):
		dur = 0.35 + 0.42 * mini(int(B["pente"]) - mun, tem)
	acao = {"tipo": "recarga", "t": 0.0, "dur": dur, "feito": false, "slot": sel}
	acao_n += 1
	main.sons.tocar("puxar" if id == "besta" else "recarga", global_position, -4.0)


func _fim_recarga() -> void:
	var s := item_mao()
	var id := str(s.get("id", ""))
	acao = {}
	if not Armas.de_fogo(id):
		return
	var B := Armas.dados(id)
	var mun := int(s.get("mun", 0))
	var k := mini(int(B["pente"]) - mun, inv.conta(str(B["municao"])))
	if k > 0 and inv.tirar(str(B["municao"]), k):
		s["mun"] = mun + k
		main.sons.tocar("clique", global_position, -6.0)
	main.ui.hud_item()


## o arco: segure para puxar a corda e solte para atirar
func _puxar_arco() -> void:
	if inv.conta("flecha") <= 0:
		main.sons.tocar("vazio", global_position, -6.0)
		cd = 0.4
		main.ui.aviso("Sem flechas (na mochila, aba Fabricar: gravetos, pedra e fibra viram flechas)")
		return
	acao = {"tipo": "arco", "t": 0.0, "dur": 1e9, "puxa": 0.0, "feito": false, "slot": sel}
	acao_n += 1
	main.sons.tocar("puxar", global_position, -8.0)


func _soltar_flecha(k: float) -> void:
	if not inv.tirar("flecha", 1):
		return
	var v := lerpf(float(Armas.ARCO["v_min"]), float(Armas.ARCO["v_max"]), k)
	var o := boca_arma(false)
	var dir := Armas.balistica(o, ponto_mira(95.0), v, float(Armas.ARCO["g"]))
	var q := int(item_mao().get("q", 1))
	var dano := float(Armas.ARCO["dano"]) * float(Armas.QUAL_DANO[clampi(q, 0, 3)]) * (0.3 + 0.7 * k * k)
	main.projeteis.flecha(o, dir, v, dano, "arco", "flecha")
	main.sons.tocar("arco", global_position, -2.0)
	main.barulho(global_position, 3.0)
	recuo += 0.012
	tiro_n += 1
	_gastar()
	main.ui.hud_item()


## o molotov, a bomba caseira e a isca: o braço vai para trás e joga (até 26 m, para onde a mira aponta)
func _arremesso(id: String) -> void:
	acao = {"tipo": "arremesso", "t": 0.0, "dur": 0.62, "feito": false, "id": id}
	acao_n += 1
	cd = 0.7
	main.sons.tocar("golpe", global_position, -8.0)


func _lancar(id: String) -> void:
	if not inv.tirar(id, 1):
		return
	var b := cam.global_transform.basis
	var o := cam.global_position - b.z * 0.5 + b.x * 0.2 + Vector3(0, 0.05, 0)
	if terceira:
		o = global_position + Vector3(0, 1.6, 0) - global_transform.basis.z * 0.4 + global_transform.basis.x * 0.25
	main.projeteis.arremessar(o, ponto_mira(Armas.ARREMESSO["alcance"] + 8.0), id, velocity)
	main.barulho(global_position, 4.0)
	tiro_n += 1
	main.ui.hud_item()


## pegou fogo (o fogo do molotov no chão, um zumbi queimando encostado): 4,5 de dano a cada meio segundo enquanto queima
func queimar(t: float) -> void:
	if not vivo:
		return
	if queima <= 0.0:
		main.ui.aviso("Você está pegando fogo! Saia das chamas", 2.5)
	queima = maxf(queima, t)


func _passo_armas(dt: float) -> void:
	# mirando: o botão direito com a arma de fogo ou o arco (com o plano na mão o botão direito é da construção)
	var quer: bool = Input.is_action_pressed("mirar") and _arma_mira() and not preso and not main.construcao.ativo \
		and str(acao.get("tipo", "")) != "recarga"
	mira_k = move_toward(mira_k, 1.0 if quer else 0.0, dt * 6.0)
	# o coice volta devagar
	if recuo > 0.0:
		var k := minf(recuo, dt * 0.35)
		recuo -= k
	if _besta_t >= 0.0:
		_besta_t -= dt
		if _besta_t < 0.0 and str(item_mao().get("id", "")) == "besta" and int(item_mao().get("mun", 0)) <= 0 and inv.conta("virote") > 0:
			recarregar()
	if queima > 0.0:
		queima -= dt
		_queima_t -= dt
		if _queima_t <= 0.0:
			_queima_t = 0.5
			ferir(4.5, false)
		if main.terreno.tipo_agua(global_position.x, global_position.z) != 0 and global_position.y < main.terreno.nivel_agua(global_position.x, global_position.z) + 0.3:
			queima = 0.0
			main.ui.aviso("Fogo apagado")
