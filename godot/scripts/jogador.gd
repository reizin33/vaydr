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
var golpe_t := -1.0      # o golpe no corpo (terceira pessoa): tempo desde o clique
var golpe_dur := 0.4
var golpe_parado := false   # para a foto: o golpe fica parado onde está
var uso_t := -1.0        # comendo ou bebendo: a mão vai à boca
var _roupa_t := 0.0
var _dobra_a := 0.0      # o pulso da mão da primeira pessoa (para o lado do mindinho ou do polegar)
var _dobra_f := 0.0      # (para a frente ou para trás)


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
	if Dados.modelo(id) != "":
		var cena: PackedScene = load(Dados.modelo(id))
		ferramenta_no = cena.instantiate()
		mao_item.add_child(ferramenta_no)
		for mi in ferramenta_no.find_children("*", "MeshInstance3D", true, false):
			(mi as MeshInstance3D).cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
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
	var fogo := bool(d.get("fogo", false)) or id == "lanterna"
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
		mao_item.transform = Transform3D(Basis.from_euler(Vector3(-PI / 2.0 + kick, PI, 0.0)), Vector3(px, py, pz))
	else:
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
	sede = maxf(0.0, sede - dt / 15.0)
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
	_bob = Vector3(cos(balanco) * 0.025 * minf(1.0, hs / 4.0), sin(balanco * 2.0) * 0.035 * minf(1.0, hs / 4.0), 0)
	tremor = maxf(0.0, tremor - dt)
	if tremor > 0.0:
		_bob += Vector3(randf() - 0.5, randf() - 0.5, 0) * tremor * 0.15
	if not terceira:
		cam.position = _bob
	golpe = maxf(0.0, golpe - dt * 3.2)
	if global_position.y < -30.0:
		ferir(999.0, false)


func _process(dt: float) -> void:
	_camera(dt)
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
	if Input.is_action_just_pressed("usar"):
		usar()


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
		"energia": energia, "item": id, "golpe": gs, "vertical": bool(d.get("vertical", false)), "usar": maxf(0.0, uk), "mira": 0.0,
		"vivo": vivo, "primeira": not terceira, "yaw": rotation.y, "vira_anda": bool(Ajustes.v.get("corpo_anda", false))})
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
	cd = float(st.get("tempo", 0.55))
	golpe = 1.0
	golpe_t = 0.0
	golpe_dur = maxf(0.3, cd * 0.85)
	main.sons.tocar("golpe", global_position, -8.0)
	var h := mira(float(st.get("alcance", 1.9)) + 0.7)
	if h.is_empty():
		return
	var c: Object = h["collider"]
	if c.has_meta("recurso"):
		_coletar(c.get_meta("recurso"), d, arma, h)
	elif c.has_meta("zumbi"):
		var z = c.get_meta("zumbi")
		z.ferir(float(st.get("dano", 9.0)), global_position)
		main.ui.acerto()
		main.sons.tocar("acerto", h["position"], 0.0)
		main.efeitos.sangue(h["position"], h["normal"])
		if arma:
			_gastar()
	elif c.has_meta("peca") and bool(d.get("conserta", false)):
		var r: String = main.construcao.consertar(c.get_meta("peca"), inv)
		if r == "":
			consertos += 1
			main.efeitos.lascas(h["position"], h["normal"], "madeira")
			_gastar()
		else:
			main.ui.aviso(r)


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
				var f := float(s["dur"]) / float(Dados.item(str(s["id"])).get("durMax", 1.0))
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
			var mx := float(Dados.item(str(s2["id"])).get("durMax", 1.0))
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
