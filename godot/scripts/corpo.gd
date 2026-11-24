class_name Corpo
extends Node3D
## O corpo do jogador, como o do VAYDR antigo (62zb_mh.js, 62z_sobrevivente.js e 62zd_maos.js): o personagem do MakeHuman (CC0),
## homem ou mulher, com a pele, os olhos, a sobrancelha, o cabelo e a barba da criação. O Sobrevivente é um desses pronto (homem,
## cabelo grisalho, sem barba). Começa de cueca (ou biquíni), pintados na própria pele.
## · A roupa vestida aparece no corpo: camiseta, camisas, colete, casacos, calças, bermuda e botas são roupas 3D de verdade (o
##   pedaço do corpo que elas cobrem some); gorro, boné, luvas, cinto, máscara, capacete e as peças de malha e reforçadas são
##   cascas do próprio corpo, infladas pela normal e pintadas na cor da peça.
## · As animações do sobrevivente misturadas pela velocidade de verdade: parado (respira e troca de apoio; ofegante depois de
##   correr), andando de frente, de costas e de lado, correndo, em disparada, agachado parado e andando, ferido (vida baixa)
##   parado e mancando, pulo, caindo e a queda forte. O passo segue a distância andada (o pé não escorrega).
## · Com algo na mão, os braços ficam com a pose do jogo (o boneco antigo de 12 ossos): o cabo na frente do corpo, a mão
##   esquerda junto no cabo das ferramentas de duas mãos (cinemática inversa de dois ossos) e o golpe sai daí.
## · Na primeira pessoa o corpo não aparece, mas faz sombra no chão.

const OSSOS := ["Hips", "Spine", "Spine1", "Spine2", "Neck", "Head", "LeftShoulder", "LeftArm", "LeftForeArm", "LeftHand",
	"RightShoulder", "RightArm", "RightForeArm", "RightHand", "LeftUpLeg", "LeftLeg", "LeftFoot", "LeftToeBase", "RightUpLeg",
	"RightLeg", "RightFoot", "RightToeBase"]
const NB := 22
const HIPS := 0
const SPINE := 1
const SPINE1 := 2
const SPINE2 := 3
const NECK := 4
const HEAD := 5
const L_OMBRO := 6
const L_BRACO := 7
const L_ANTE := 8
const L_MAO := 9
const R_OMBRO := 10
const R_BRACO := 11
const R_ANTE := 12
const R_MAO := 13
const L_COXA := 14
const L_PERNA := 15
const L_PE := 16
const L_DEDO := 17
const R_COXA := 18
const R_PERNA := 19
const R_PE := 20
const R_DEDO := 21
## o boneco antigo (12 ossos): quadril, tronco, cabeça, braço e antebraço esquerdos, braço e antebraço direitos, coxas e canelas, mão direita
const PROC_PAI := [-1, 0, 1, 1, 3, 1, 5, 0, 7, 0, 9, 6]
## altura com a escolha do meio da criação (o resto é a escala: 0,94 a 1,06)
const ALT := {"homem": 1.76, "mulher": 1.64}
const ALTURAS := [0.94, 0.97, 1.0, 1.03, 1.06]
const CAMPOS := ["g", "pele", "olhos", "sobr", "cabelo", "barba"]
const CAT := {"sobr": "sobrancelha", "cabelo": "cabelo", "barba": "barba"}
const VAZIO := {"cabelo": "Careca", "barba": "Sem barba"}
const SOBREVIVENTE := {"g": "homem", "pele": "h_adulto_clara", "olhos": "castanho", "sobr": "sobr3", "cabelo": "curto_grisalho", "barba": ""}
## camada de desenho do corpo: a lanterna da mão (que sai de dentro da cabeça) não faz sombra dele
const CAMADA := 1 << 10
## ferramentas de duas mãos: onde a mão esquerda fecha no cabo (no espaço do item: cabo ao longo de +z, a mão direita no zero)
const MAO2 := {"machado": Vector3(0, 0, 0.27), "machadoPedra": Vector3(0, 0, 0.27), "picareta": Vector3(0, 0, 0.27),
	"pa": Vector3(0, 0, 0.3), "lanca": Vector3(0, 0, 0.11), "taco": Vector3(0, 0, 0.11), "tacoCravado": Vector3(0, 0, 0.11),
	"espingarda": Vector3(0, -0.36, -0.02), "rifle": Vector3(0, -0.32, -0.02), "besta": Vector3(0, -0.2, -0.03)}
## roupa justa: região do corpo, quanto incha (m) e a cor (as do jogo antigo: SURV_CASCAS, 61c_oficina, 48e_lesoes, 68r_lajes)
const CASCAS := {
	"gorroPele": [["cabeca", 0.026, 0x8c6b4a], ["cabecaAba", 0.036, 0xd6c29c]],
	"bone": [["cabeca", 0.02, 0x2b3a55]],
	"luvasCouro": [["maos", 0.007, 0x5a3e28]],
	"cinto": [["cinto", 0.012, 0x3a2a1c]],
	"cinturaoExploracao": [["cinto", 0.02, 0x3b3a2c]],
	"mascaraGas": [["rosto", 0.03, 0x2b2f2a], ["cabecaAba", 0.018, 0x1a1c1a]],
	"capaceteMalha": [["cabeca", 0.03, 0x8d939a], ["cabecaAba", 0.042, 0x5f656b]],
	"peitoralMalha": [["troncoLongo", 0.017, 0x7c8288], ["golaLonga", 0.026, 0x4a3424]],
	"calcaMalha": [["pernas", 0.014, 0x7c8288], ["cinto", 0.022, 0x3a2818]],
	"jaquetaReforcada": [["troncoLongo", 0.014, 0x5e3d26], ["golaLonga", 0.022, 0x6c7176]],
	"calcaReforcada": [["pernas", 0.01, 0x5a3d27], ["cinto", 0.018, 0x2a1d14]],
	"tenisCorrida": [["pes", 0.011, 0xe6e2d8]],
}
## a camiseta fica por baixo da camisa e do casaco (some para não atravessar); com o colete ela aparece
const COBRE_CAMISETA := {"camisaLeve": true, "camisaCouro": true, "casacoPele": true, "casacoGrande": true}

static var META := {}
static var CLIP := PackedFloat32Array()
static var CL := {}            # clipe -> {n, fps, dur, ciclo, d, h} (já em números)
static var _cenas := {}
static var _mats := {}
static var _texs := {}

var j = null                   # o jogador (null no palco da criação)
var ap := {}
var m := {}                    # o personalizado em uso: g, pele, olhos, sobr, cabelo, barba
var g := ""
var modelo: Node3D
var esq: Skeleton3D
var ix := PackedInt32Array()   # índice de cada osso no esqueleto do Godot
var nos := {}                  # nome do nó -> MeshInstance3D
var cascas: Array = []         # as cascas vestidas (cópias das regiões, com a cor da peça)
var encaixe: Node3D            # a mão direita: o item vai aqui (cabo ao longo de +z, lâmina para -y)
var item_no: Node3D
var item_id := ""
var escala := 1.0
var hip := 0.99
var k_akai := 1.0
var qb: Array = []
var tb: Array = []
var A: Array = []
var aq_inv: Array = []
var pai := PackedInt32Array()
var mat_pele: StandardMaterial3D
var roupa_k := "-"
var so_sombra := false
var mostra_item := true
var trava := false             # para a foto: o corpo não vira (a câmera dá a volta e mostra a frente)
# pose
var D: Array = []
var Dp: Array = []
var Ds: Array = []
var Q: Array = []
var P: Array = []
var _SA: Array = []
var _SH := Vector3.ZERO
var _W: Array = []
var o: Array = []
var _B: Array = []
var lw := 0.0
var ln := 0.0
var lh := Vector3.ZERO
var lm := PackedFloat32Array()
var quadril_s := Vector3.ZERO
var ini := false
# estado do corpo (o SURV do jogo antigo)
var fase := 0.0
var fase_p := 0.0
var ar := 0.0
var pulo := -1.0
var queda := -1.0
var cansado_t := 0.0
var estado := ""
var ph := 0.0
var amp := 0.0
var run_k := 0.0
var ag_k := 0.0
var tempo := 0.0
var m2w := 0.0
var m2g := Vector3.ZERO
var yaw := 0.0
var gira := false
var pouso := 0.0
var _chao_antes := true
var _vy_antes := 0.0


static func carregar_dados() -> void:
	if not META.is_empty():
		return
	META = JSON.parse_string(FileAccess.get_file_as_string("res://dados/personagem/mh.json"))
	CLIP = FileAccess.get_file_as_bytes("res://dados/personagem/clipes.bin").to_float32_array()
	for nome in META["clipes"]:
		var c: Dictionary = META["clipes"][nome]
		var v = c.get("vel")
		var vv := Vector2(float(v[0]), float(v[2])).length() if v is Array else 1.2
		CL[nome] = {"n": int(c["n"]), "fps": float(c["fps"]), "dur": float(c["dur"]), "ciclo": maxf(0.4, vv * float(c["dur"])),
			"d": int(c["d"]) / 4, "h": int(c["h"]) / 4}


# ================================================================ aparência (a do perfil e a da criação)
static func padrao(gg: String) -> Dictionary:
	if gg == "mulher":
		return {"g": "mulher", "pele": "m_adulta_clara", "olhos": "castanho", "sobr": "sobr5", "cabelo": "rabo", "barba": ""}
	return {"g": "homem", "pele": "h_adulto_clara", "olhos": "castanho", "sobr": "sobr3", "cabelo": "curto_castanho", "barba": ""}


static func lista(campo: String, gg: String) -> Array:
	carregar_dados()
	var r: Array = []
	if campo == "pele":
		for k in META["peles"]:
			if str(META["peles"][k]["corpo"]) == gg:
				r.append(k)
	elif campo == "olhos":
		r = (META["olhos"] as Dictionary).keys()
	elif CAT.has(campo):
		for k in META["pecas"]:
			var p: Dictionary = META["pecas"][k]
			if str(p["cat"]) == CAT[campo] and gg in p["corpos"]:
				r.append(k)
	return r


## o personalizado sempre válido (o que não existe volta para o padrão; a mulher não tem barba)
static func limpa_mh(x) -> Dictionary:
	var gg := "mulher" if x is Dictionary and str(x.get("g", "")) == "mulher" else "homem"
	var r := padrao(gg)
	if not x is Dictionary:
		return r
	for k in CAMPOS:
		if k == "g":
			continue
		var v = x.get(k)
		if v is String:
			if v == "" and VAZIO.has(k) and not (k == "barba" and gg == "mulher"):
				r[k] = ""
			elif v in lista(k, gg):
				r[k] = v
	if gg == "mulher":
		r["barba"] = ""
	return r


static func limpa(x) -> Dictionary:
	var r := {"corpo": "sobrevivente", "mh": SOBREVIVENTE.duplicate(), "altura": 2, "nome": ""}
	if x is Dictionary:
		if str(x.get("corpo", "")) == "mh":
			r["corpo"] = "mh"
			r["mh"] = limpa_mh(x.get("mh"))
		r["altura"] = clampi(int(x.get("altura", 2)), 0, ALTURAS.size() - 1)
		r["nome"] = str(x.get("nome", "")).substr(0, 20)
	return r


static func mh_de(x: Dictionary) -> Dictionary:
	return SOBREVIVENTE.duplicate() if str(x.get("corpo", "")) != "mh" else limpa_mh(x.get("mh"))


static func nome_op(campo: String, v: String, gg: String) -> String:
	carregar_dados()
	if v == "":
		return VAZIO.get(campo, "")
	if campo == "g":
		return "Mulher" if v == "mulher" else "Homem"
	if campo == "pele":
		return str(META["peles"][v]["nome"]) if META["peles"].has(v) else v
	if campo == "olhos":
		return str(META["olhos"][v]["nome"]) if META["olhos"].has(v) else v
	return str(META["pecas"][v]["nome"]) if META["pecas"].has(v) else v


## a miniatura de uma escolha (a do jogo antigo, 80x80)
static func miniatura(campo: String, v: String) -> Texture2D:
	carregar_dados()
	var chave := campo + "|" + v
	if _texs.has(chave):
		return _texs[chave]
	var b64 := ""
	if campo == "pele" and META["peles"].has(v):
		b64 = str(META["peles"][v]["mini"])
	elif campo == "olhos" and META["olhos"].has(v):
		b64 = str(META["olhos"][v]["mini"])
	elif META["pecas"].has(v):
		b64 = str(META["pecas"][v]["mini"])
	var tex: Texture2D = null
	if b64 != "":
		var img := Image.new()
		if img.load_webp_from_buffer(Marshalls.base64_to_raw(b64)) == OK:
			tex = ImageTexture.create_from_image(img)
	_texs[chave] = tex
	return tex


static func altura_txt(x: Dictionary, i: int) -> String:
	var gg := str(mh_de(x)["g"])
	return ("%.2f m" % (float(ALTURAS[clampi(i, 0, 4)]) * float(ALT[gg]))).replace(".", ",")


# ================================================================ montagem
func _init(jogador = null) -> void:
	j = jogador
	carregar_dados()
	for b in NB:
		D.append(Quaternion.IDENTITY)
		Dp.append(Quaternion.IDENTITY)
		Ds.append(Quaternion.IDENTITY)
		Q.append(Quaternion.IDENTITY)
		P.append(Vector3.ZERO)
		_SA.append(Quaternion.IDENTITY)
	for i in 12:
		_W.append(Quaternion.IDENTITY)
	for i in 36:
		o.append(0.0)
		_B.append(0.0)
	lm.resize(NB)


## monta o corpo da aparência (troca o modelo só quando muda de homem para mulher)
func montar(x: Dictionary) -> void:
	ap = limpa(x)
	m = mh_de(ap)
	if str(m["g"]) != g:
		_trocar_corpo(str(m["g"]))
	escala = float(ALTURAS[int(ap["altura"])]) * float(ALT[g]) / float(META["corpos"][g]["altura"])
	modelo.scale = Vector3.ONE * escala
	mat_pele.albedo_texture = _tex("res://assets/personagens/mh/pele_%s.jpg" % m["pele"])
	var olhos_mat := _mat_peca("olhos|" + str(m["olhos"]), "res://assets/personagens/mh/" + str(META["olhos"][m["olhos"]]["tex"]), 0.25)
	for nome in nos:
		if not str(nome).begins_with("peca_"):
			continue
		var id := str(nome).substr(5)
		var mi: MeshInstance3D = nos[nome]
		var quer := id == "olhos" or id == str(m["cabelo"]) or id == str(m["barba"]) or id == str(m["sobr"]) or id == ("cilios_m" if g == "mulher" else "cilios_h")
		mi.visible = quer
		if quer:
			if id == "olhos":
				mi.material_override = olhos_mat
			else:
				var cat := str(META["pecas"][id]["cat"])
				mi.material_override = _mat_peca(id, "res://assets/personagens/mh/" + str(META["pecas"][id]["tex"]), 0.7 if cat in ["cabelo", "barba"] else 0.8)
	roupa_k = "-"
	ini = false


func _trocar_corpo(gg: String) -> void:
	g = gg
	if modelo:
		modelo.queue_free()
		modelo = null
	nos.clear()
	cascas.clear()
	if not _cenas.has(g):
		_cenas[g] = load("res://assets/personagens/mh/mh_%s.glb" % g)
	modelo = (_cenas[g] as PackedScene).instantiate()
	modelo.rotation.y = PI   # o Mixamo olha para +z; aqui a frente é -z
	add_child(modelo)
	esq = modelo.find_children("*", "Skeleton3D", true, false)[0]
	ix.resize(NB)
	for b in NB:
		ix[b] = esq.find_bone(OSSOS[b])
	for no in modelo.find_children("*", "MeshInstance3D", true, false):
		var mi := no as MeshInstance3D
		nos[str(mi.name)] = mi
		mi.layers = CAMADA
		mi.extra_cull_margin = 0.6   # a pose anda longe da de repouso (pulo, queda): a caixa da malha não pode cortar o desenho
	mat_pele = StandardMaterial3D.new()
	mat_pele.roughness = 0.62
	mat_pele.metallic_specular = 0.4
	for nome in nos:
		var mi: MeshInstance3D = nos[nome]
		if str(nome).begins_with("corpo_"):
			mi.material_override = mat_pele
		elif str(nome).begins_with("casca_") or str(nome).begins_with("roupa_"):
			mi.visible = false
	# ossos: pai, deslocamento, repouso e o alinhamento com a pose do jogo
	var c: Dictionary = META["corpos"][g]
	hip = float(c["quadril"])
	k_akai = hip / float(META["quadril_akai"])
	pai = PackedInt32Array(c["pai"])
	qb.clear()
	tb.clear()
	A.clear()
	aq_inv.clear()
	for b in NB:
		var t: Array = c["t"]
		var q: Array = c["qb"]
		var a: Array = c["A"]
		tb.append(Vector3(t[b * 3], t[b * 3 + 1], t[b * 3 + 2]))
		qb.append(Quaternion(q[b * 4], q[b * 4 + 1], q[b * 4 + 2], q[b * 4 + 3]).normalized())
		A.append(Quaternion(a[b * 4], a[b * 4 + 1], a[b * 4 + 2], a[b * 4 + 3]).normalized())
		aq_inv.append(((A[b] as Quaternion) * (qb[b] as Quaternion)).inverse())
	encaixe = Node3D.new()
	esq.add_child(encaixe)
	if item_no:
		item_no = null
		var id := item_id
		item_id = ""
		segurar(id)
	_sombra()


func _tex(caminho: String) -> Texture2D:
	if not _texs.has(caminho):
		_texs[caminho] = load(caminho) if ResourceLoader.exists(caminho) else null
	return _texs[caminho]


func _mat_peca(chave: String, caminho: String, rug: float) -> StandardMaterial3D:
	if _mats.has(chave):
		return _mats[chave]
	var mt := StandardMaterial3D.new()
	mt.albedo_texture = _tex(caminho)
	mt.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA_SCISSOR
	mt.alpha_scissor_threshold = 0.4
	mt.cull_mode = BaseMaterial3D.CULL_DISABLED
	mt.roughness = rug
	mt.metallic_specular = 0.3
	_mats[chave] = mt
	return mt


func _mat_roupa(id: String) -> StandardMaterial3D:
	var chave := "roupa|%s|%s" % [g, id]
	if _mats.has(chave):
		return _mats[chave]
	var mt := StandardMaterial3D.new()
	var tx := _tex("res://assets/personagens/mh/roupa_%s_%s.jpg" % [g, id])
	if tx:
		mt.albedo_texture = tx
	else:
		mt.albedo_color = _cor(int(META["pecas"][id].get("cor", 0x808080)))
	mt.roughness = 0.88 if not id.begins_with("botas") else 0.7
	mt.cull_mode = BaseMaterial3D.CULL_DISABLED
	_mats[chave] = mt
	return mt


func _mat_casca(cor: int, inf: float) -> StandardMaterial3D:
	var chave := "casca|%d|%.3f" % [cor, inf]
	if _mats.has(chave):
		return _mats[chave]
	var mt := StandardMaterial3D.new()
	mt.albedo_color = _cor(cor)
	mt.roughness = 0.9
	mt.grow = true
	mt.grow_amount = inf
	_mats[chave] = mt
	return mt


static func _cor(c: int) -> Color:
	return Color8((c >> 16) & 255, (c >> 8) & 255, c & 255)


## veste o que está no corpo (lugar -> {id}): roupas 3D, o corpo que elas cobrem some, e as cascas das justas
func vestir(roupa: Dictionary) -> void:
	var ids := {}
	for lugar in roupa:
		var s = roupa[lugar]
		if s is Dictionary and s.has("id"):
			ids[str(lugar)] = str(s["id"])
	var k := JSON.stringify(ids)
	if k == roupa_k or modelo == null:
		return
	roupa_k = k
	# roupas 3D, na ordem das camadas
	var formas := {}   # forma -> id vestido
	for lugar in ["pes", "pernas", "camiseta", "tronco"]:
		var id := str(ids.get(lugar, ""))
		if id == "" or not META["pecas"].has(id) or str(META["pecas"][id]["cat"]) != "roupa":
			continue
		if lugar == "camiseta" and COBRE_CAMISETA.has(str(ids.get("tronco", ""))):
			continue
		var fm: Dictionary = META["pecas"][id].get("forma", {})
		if fm.has(g):
			formas[str(fm[g])] = id
	for nome in nos:
		if str(nome).begins_with("roupa_"):
			var forma := str(nome).substr(6)
			var mi: MeshInstance3D = nos[nome]
			mi.visible = formas.has(forma)
			if mi.visible:
				mi.material_override = _mat_roupa(formas[forma])
	for gr in META["corpos"][g]["grupos"]:
		var cob := false
		for f in gr["cobre"]:
			if formas.has(str(f)):
				cob = true
		(nos[str(gr["no"])] as MeshInstance3D).visible = not cob
	# cascas
	for c in cascas:
		c.queue_free()
	cascas.clear()
	for lugar in ids:
		var id := str(ids[lugar])
		if not CASCAS.has(id):
			continue
		for e in CASCAS[id]:
			var base: MeshInstance3D = nos.get("casca_" + str(e[0]))
			if base == null:
				continue
			var mi := MeshInstance3D.new()
			mi.mesh = base.mesh
			mi.skin = base.skin
			mi.layers = CAMADA
			mi.extra_cull_margin = 0.6
			mi.material_override = _mat_casca(int(e[2]), float(e[1]))
			base.get_parent().add_child(mi)
			mi.skeleton = mi.get_path_to(esq)
			cascas.append(mi)
	_sombra()


## o item na mão direita (aparece na terceira pessoa)
func segurar(id: String) -> void:
	if id == item_id and (item_no != null or (Dados.modelo(id) == "" and not ModelosArmas.tem(id))):
		return
	item_id = id
	if item_no:
		item_no.queue_free()
		item_no = null
	if id != "" and (Dados.modelo(id) != "" or ModelosArmas.tem(id)) and encaixe:
		item_no = (load(Dados.modelo(id)) as PackedScene).instantiate() if Dados.modelo(id) != "" else ModelosArmas.criar(id)
		item_no.scale = Vector3.ONE * 0.85   # as ferramentas são desenhadas a 85% na mão, como no jogo antigo
		encaixe.add_child(item_no)
		for mi in item_no.find_children("*", "MeshInstance3D", true, false):
			(mi as MeshInstance3D).layers = CAMADA
	_sombra()


## primeira pessoa: o corpo só faz sombra (o item da mão é o da câmera)
func primeira_pessoa(on: bool) -> void:
	so_sombra = on
	_sombra()


func _sombra() -> void:
	var modo := GeometryInstance3D.SHADOW_CASTING_SETTING_SHADOWS_ONLY if so_sombra else GeometryInstance3D.SHADOW_CASTING_SETTING_ON
	for nome in nos:
		(nos[nome] as MeshInstance3D).cast_shadow = modo
	for c in cascas:
		(c as MeshInstance3D).cast_shadow = modo
	if item_no:
		item_no.visible = not so_sombra and mostra_item


# ================================================================ quatérnios (como no jogo antigo)
static func _nl(a: Quaternion, b: Quaternion, k: float) -> Quaternion:
	var s := -1.0 if a.dot(b) < 0.0 else 1.0
	var u := 1.0 - k
	var q := Quaternion(a.x * u + b.x * k * s, a.y * u + b.y * k * s, a.z * u + b.z * k * s, a.w * u + b.w * k * s)
	var l := q.length()
	return q / l if l > 1e-9 else Quaternion.IDENTITY


## o euler do jogo antigo (R = Ry * Rx * Rz)
static func _euler(rx: float, ry: float, rz: float) -> Quaternion:
	return Quaternion(Vector3.UP, ry) * Quaternion(Vector3.RIGHT, rx) * Quaternion(Vector3.BACK, rz)


static func _de_para(a: Vector3, b: Vector3) -> Quaternion:
	var d := a.dot(b)
	var c := a.cross(b)
	var w := 1.0 + d
	if w < 1e-6:
		return Quaternion(0, 0, 1, 0)
	return Quaternion(c.x, c.y, c.z, w).normalized()


static func _suave(a: float, b: float, x: float) -> float:
	return smoothstep(a, b, x)


static func _chegar(a: float, b: float, d: float) -> float:
	return a + clampf(b - a, -d, d)


# ================================================================ clipes
func _amostra(nome: String, tt: float) -> void:
	var c: Dictionary = CL[nome]
	var n: int = c["n"]
	var f := clampf(tt * float(c["fps"]), 0.0, float(n - 1))
	var i := mini(n - 2, int(f))
	var k := f - float(i)
	var o0: int = int(c["d"]) + i * NB * 4
	var o1 := o0 + NB * 4
	for b in NB:
		var a0 := o0 + b * 4
		var a1 := o1 + b * 4
		_SA[b] = _nl(Quaternion(CLIP[a0], CLIP[a0 + 1], CLIP[a0 + 2], CLIP[a0 + 3]), Quaternion(CLIP[a1], CLIP[a1 + 1], CLIP[a1 + 2], CLIP[a1 + 3]), k)
	var h0: int = int(c["h"]) + i * 3
	_SH = Vector3(lerpf(CLIP[h0], CLIP[h0 + 3], k), lerpf(CLIP[h0 + 1], CLIP[h0 + 4], k), lerpf(CLIP[h0 + 2], CLIP[h0 + 5], k))


func _soma(nome: String, tt: float, w: float) -> void:
	if w <= 0.001:
		return
	_amostra(nome, tt)
	ln += w
	var k := w / ln
	if k >= 0.999:
		for b in NB:
			D[b] = _SA[b]
	else:
		for b in NB:
			D[b] = _nl(D[b], _SA[b], k)
	lh = lh.lerp(_SH, k)


static func _dur(n: String) -> float:
	return float(CL[n]["dur"]) if CL.has(n) else 1.0


# ================================================================ a pose de cada quadro
## ent: vel (Vector3, m/s), chao, agachado, correndo, ferido, energia, item (o id na mão), golpe (0 a 1, ou -1), vertical,
## usar (0 a 1), mira (0 a 1), vivo, primeira (primeira pessoa), yaw (para onde a câmera olha)
func animar(dt: float, ent: Dictionary) -> void:
	if modelo == null:
		return
	tempo += dt
	var vel: Vector3 = ent.get("vel", Vector3.ZERO)
	var hv := Vector2(vel.x, vel.z)
	var sp_real := hv.length()
	var correndo: bool = ent.get("correndo", false)
	var agachado: bool = ent.get("agachado", false)
	var chao: bool = ent.get("chao", true)
	var item := str(ent.get("item", ""))
	var golpe_s: float = ent.get("golpe", -1.0)
	var usar_k: float = ent.get("usar", 0.0)
	var mira_k: float = ent.get("mira", 0.0)
	var acao := golpe_s >= 0.0 or usar_k > 0.01
	_virar(dt, ent, sp_real, correndo, acao or mira_k > 0.3)
	# pulo e pouso (o pouso forte vira a queda com as mãos no chão)
	var vy: float = vel.y
	if chao and not _chao_antes:
		if _vy_antes < -11.0:
			queda = 0.0
		if _vy_antes < -6.0:
			pouso = minf(0.16, (-_vy_antes - 6.0) * 0.03)
	if not chao and _chao_antes and vy > 4.0:
		pulo = 0.0
	_chao_antes = chao
	_vy_antes = vy
	pouso *= exp(-dt * 7.0)
	if correndo and float(ent.get("energia", 100.0)) < 40.0:
		cansado_t = 6.0
	cansado_t = maxf(0.0, cansado_t - dt)
	_loco(dt, ent, vel, chao, agachado)
	# máscara: com algo na mão (ou golpeando, comendo) os braços ficam com a pose do jogo; mirando, o tronco também
	var na_mao := item != "" and Dados.modelo(item) != ""
	var mao_cheia := na_mao or acao
	for b in NB:
		lm[b] = 1.0
	if mao_cheia and estado != "queda":
		for b in range(L_OMBRO, R_MAO + 1):
			lm[b] = 0.0
	if (golpe_s >= 0.0 or mira_k > 0.25) and estado != "queda":
		for b in [SPINE1, SPINE2, NECK, HEAD]:
			lm[b] = 0.15
	# o empurrão, a voadora e o pisão (64b_combate.js): as pernas e os braços vêm da pose do jogo só nessa hora
	var acao_c := str(ent.get("acao", ""))
	var acao_k := clampf(float(ent.get("acao_k", 0.0)), 0.0, 1.0)
	if acao_c != "" and estado != "queda":
		for b in range(L_OMBRO, R_MAO + 1):
			lm[b] = 0.0
		if acao_c in ["voadora", "pisao"]:
			for b in range(L_COXA, R_DEDO + 1):
				lm[b] = 0.0
			for b in [HIPS, SPINE, SPINE1, SPINE2]:
				lm[b] = 0.3
	# a pose do jogo (o boneco antigo): passos, agachar, o item na mão, o golpe
	amp = _chegar(amp, (1.0 if correndo else 0.75) if sp_real > 0.4 else 0.0, dt * 4.0)
	ph += dt * (11.0 if correndo else 7.5) * (1.0 if sp_real > 0.3 else 0.25)
	run_k = _chegar(run_k, 1.0 if correndo else 0.0, dt * 4.0)
	ag_k = _chegar(ag_k, 1.0 if agachado else 0.0, dt * 6.0)
	_pose_loco(ph, amp * (1.0 - 0.4 * ag_k), tempo, run_k * (1.0 - ag_k))
	var k := ag_k
	if k > 0.01:
		o[3] += 0.34 * k
		o[6] -= 0.2 * k
		o[9] -= 0.2 * k
		o[12] -= 0.35 * k
		o[15] -= 0.2 * k
		o[18] -= 0.35 * k
		o[21] -= 1.0 * k
		o[24] += 1.55 * k
		o[27] -= 1.0 * k
		o[30] += 1.55 * k
	var d := Dados.item(item) if item != "" else {}
	if MAO2.has(item) and not (acao and golpe_s < 0.0):
		_s3(o, 5, -0.3, 0, -0.18)
		_s3(o, 6, -0.75, 0, 0)
	if golpe_s >= 0.0:
		var s := clampf(golpe_s, 0.0, 1.0)
		for i in 36:
			_B[i] = o[i]
		_pose_melee(_B, s, bool(ent.get("vertical", false)))
		var w := clampf(minf(1.0, minf(s / 0.1, (1.0 - s) / 0.2 + 0.3)), 0.0, 1.0)
		for i in range(3, 36):
			if i < 21 or i >= 33:
				o[i] = lerpf(o[i], _B[i], w)
	elif bool(d.get("fogo", false)):
		if mira_k > 0.05:
			_pose_aim(mira_k, 0.0)
		else:
			_s3(o, 5, -0.35, 0, -0.1)
			_s3(o, 6, -0.45, 0, 0)
	if usar_k > 0.01:
		_pose_use(usar_k)
	match acao_c:
		"empurrao":
			_pose_empurrao(minf(1.0, minf(acao_k * 0.4 / 0.12, (1.0 - acao_k) * 0.4 / 0.2)))
		"voadora":
			_pose_voadora(acao_k)
		"pisao":
			_pose_pisao(acao_k)
	_da_pose()
	# mistura por osso, suavização e cinemática direta
	var ks := 1.0 - exp(-dt * 16.0)
	var hl := Vector3(lh.x * k_akai, hip + lh.y * k_akai - pouso * 1.1 * k_akai, lh.z * k_akai)
	var hq := Vector3(0, hip, 0).lerp(hl, lw)
	for b in NB:
		var wb := lw * lm[b]
		var dd: Quaternion = Dp[b] if wb <= 0.001 else _nl(Dp[b], D[b], wb)
		Ds[b] = dd if not ini else _nl(Ds[b], dd, ks)
	quadril_s = hq if not ini else quadril_s.lerp(hq, ks)
	ini = true
	for b in NB:
		Q[b] = Ds[b] * qb[b]
		var p := pai[b]
		P[b] = quadril_s if p < 0 else P[p] + Q[p] * tb[b]
	_duas_maos(dt, item if na_mao and not bool(ent.get("primeira", false)) else "")
	# no esqueleto
	for b in NB:
		var p := pai[b]
		var loc: Quaternion = Q[b] if p < 0 else (Q[p] as Quaternion).inverse() * Q[b]
		esq.set_bone_pose_rotation(ix[b], loc)
	esq.set_bone_pose_position(ix[HIPS], P[HIPS])
	var q_mao: Quaternion = Q[R_MAO]
	var q_enc: Quaternion = q_mao * (aq_inv[R_MAO] as Quaternion)
	var p_mao: Vector3 = P[R_MAO]
	encaixe.transform = Transform3D(Basis(q_enc), p_mao + q_mao * Vector3(0, 0.075, 0))


## para onde o corpo olha: para onde a câmera olha (como no DayZ e no PUBG do jogo antigo, v10.3.2); andando ele vai de lado e
## de costas com as animações próprias; na disparada vira para onde corre; parado, só vira quando a câmera passa do ombro
func _virar(dt: float, ent: Dictionary, sp: float, correndo: bool, agindo: bool) -> void:
	if trava:
		global_rotation = Vector3(0, yaw, 0)
		return
	if ent.has("yaw_corpo"):
		# o boneco de outro jogador (partida em rede): para onde o corpo dele olha chega pronto, e quem segura o corpo vira
		# (o pivô do boneco também deita quando ele cai)
		yaw = float(ent["yaw_corpo"])
		return
	var cam_yaw: float = ent.get("yaw", yaw)
	var vel: Vector3 = ent.get("vel", Vector3.ZERO)
	var alvo := yaw
	var prim: bool = ent.get("primeira", false)
	if prim or agindo:
		alvo = cam_yaw
	elif sp > 0.5:
		alvo = atan2(-vel.x, -vel.z) if (correndo or bool(ent.get("vira_anda", false))) else cam_yaw
		gira = false
	elif bool(ent.get("vira_anda", false)):
		alvo = yaw
	else:
		var df := absf(angle_difference(yaw, cam_yaw))
		if df > 1.1:
			gira = true
		if gira:
			alvo = cam_yaw
			if df < 0.08:
				gira = false
	if prim:
		yaw = lerp_angle(yaw, alvo, 1.0 - exp(-dt * (12.0 if sp > 0.5 else 7.0)))
	elif agindo:
		yaw = lerp_angle(yaw, alvo, 1.0 - exp(-dt * 16.0))
	elif sp > 0.5:
		yaw = lerp_angle(yaw, alvo, 1.0 - exp(-dt * 9.0))
	else:
		var lim := 3.6 * dt
		yaw += clampf(angle_difference(yaw, alvo) * (1.0 - exp(-dt * 6.0)), -lim, lim)
	global_rotation = Vector3(0, yaw, 0)


## a locomoção do sobrevivente (survLoco): parado e passos misturados pela velocidade e pela direção
func _loco(dt: float, ent: Dictionary, vel: Vector3, chao: bool, agachado: bool) -> void:
	var livre: bool = ent.get("vivo", true)
	lw = _chegar(lw, 1.0 if livre else 0.0, dt * (5.0 if livre else 9.0))
	ln = 0.0
	lh = Vector3.ZERO
	if lw <= 0.001:
		estado = ""
		return
	var esc := k_akai * escala
	var frente := -global_basis.z
	var esquerda := -global_basis.x
	var hv := Vector3(vel.x, 0, vel.z)
	var sp := hv.length() / esc
	var fr := hv.dot(frente) / esc
	var lat := hv.dot(esquerda) / esc
	var ferido: bool = ent.get("ferido", false)
	if not chao:
		ar += dt
		if pulo >= 0.0:
			pulo += dt
	else:
		ar = 0.0
		pulo = -1.0
	if queda >= 0.0:
		queda += dt
		if queda > _dur("sQueda") - 0.05 or (queda > 0.9 and sp > 0.6):
			queda = -1.0
	if queda >= 0.0:
		estado = "queda"
		_soma("sQueda", queda, 1.0)
	elif not chao and pulo >= 0.0 and pulo < _dur("sPulo") * 0.55:
		estado = "pulo"
		_soma("sPulo", 0.1 + pulo, 1.0)
	elif not chao and ar > 0.28:
		estado = "caindo"
		fase_p += dt
		_soma("sCaindo", fmod(fase_p, _dur("sCaindo")), 1.0)
	else:
		var n_p := "sAgachado" if agachado else ("sFeridoParado" if ferido else ("sRespira" if float(ent.get("energia", 100.0)) < 25.0 or cansado_t > 0.0 else "sParado"))
		var w_mov := _suave(0.18, 0.75, sp)
		var lst: Array = []
		if agachado:
			lst = [["sAgachadoAnda", 1.0]]
		elif ferido:
			lst = [["sFeridoAnda", 1.0]]
		else:
			var ang := atan2(lat, fr)
			var af := absf(ang)
			var w_f := clampf(1.0 - af / (PI / 2.0), 0.0, 1.0)
			var w_t := clampf((af - PI / 2.0) / (PI / 2.0), 0.0, 1.0)
			var w_l := 1.0 - w_f - w_t
			var lado := "sLadoE" if ang > 0.0 else "sLadoD"
			# ritmo: andar até 1,9 m/s, correr até 4,8, disparada acima (o "andar" normal do jogo é um trote)
			var w_run := _suave(1.6, 3.0, sp)
			var w_spr := _suave(4.6, 5.8, sp)
			lst = [["sAnda", w_f * (1.0 - w_run)], ["sCorre", w_f * w_run * (1.0 - w_spr)], ["sDispara", w_f * w_run * w_spr],
				[lado, w_l * (1.0 - w_run * 0.5)], ["sCorre", w_l * w_run * 0.5], ["sAndaTras", w_t]]
		# fase única dos passos: avança pela distância andada sobre a distância do ciclo misturado
		var soma := 0.0
		var ciclo := 0.0
		for e in lst:
			if float(e[1]) <= 0.0:
				continue
			soma += float(e[1])
			ciclo += float(e[1]) * float(CL[e[0]]["ciclo"])
		ciclo = ciclo / soma if soma > 0.0 else 1.0
		fase = fmod(fase + dt * maxf(sp, 0.35) / ciclo, 1.0)
		fase_p += dt
		_soma(n_p, fmod(fase_p, _dur(n_p)), 1.0 - w_mov)
		for e in lst:
			if float(e[1]) > 0.001:
				_soma(e[0], fase * _dur(e[0]), w_mov * float(e[1]) / maxf(soma, 1e-6))
		estado = "parado" if sp < 0.18 else ("agachado" if agachado else ("ferido" if ferido else ("disparada" if sp > 4.6 else ("correndo" if sp > 2.0 else "andando"))))


# ================================================================ a pose do jogo (o boneco antigo de 12 ossos)
static func _s3(a: Array, i: int, x: float, y: float, z: float) -> void:
	a[i * 3] = x
	a[i * 3 + 1] = y
	a[i * 3 + 2] = z


## parado não é estátua: respira, troca o peso de perna, os braços balançam soltos; andando o quadril gira e os cotovelos dobram
func _pose_loco(fph: float, a: float, t: float, rk: float) -> void:
	for i in 36:
		o[i] = 0.0
	var s := sin(fph)
	var c := cos(fph)
	var id := 1.0 - minf(1.0, a * 1.5)
	var br := sin(t * 1.6) * 0.02 * id
	var pe := sin(t * 0.37) * 0.04 * id
	var ol := (sin(t * 0.23) * 0.12 + sin(t * 0.71) * 0.04) * id
	_s3(o, 0, 0, s * 0.07 * a, c * 0.045 * a + pe)
	_s3(o, 1, 0.04 + lerpf(0.06, 0.2, rk) * a + br, -s * 0.1 * a, -c * 0.035 * a - pe * 0.6)
	_s3(o, 2, -lerpf(0.04, 0.12, rk) * a - br * 0.5, s * 0.05 * a + ol, c * 0.02 * a)
	var ab := 0.1 + 0.04 * a
	var b_s := s * lerpf(0.52, 0.72, rk) * a
	var cot := lerpf(0.32, 1.0, rk) * a
	_s3(o, 3, -0.06 + b_s + sin(t * 1.6 + 0.4) * 0.03 * id, 0, ab)
	_s3(o, 4, -0.28 - cot - maxf(0.0, s) * 0.22 * a, 0, 0)
	_s3(o, 5, -0.06 - b_s + sin(t * 1.6 + 1.1) * 0.03 * id, 0, -ab)
	_s3(o, 6, -0.28 - cot - maxf(0.0, -s) * 0.22 * a, 0, 0)
	_s3(o, 7, -s * 0.62 * a - pe * 0.4, 0, 0.03)
	_s3(o, 8, (0.08 + maxf(0.0, sin(fph + 1.3)) * 0.95) * a + 0.04 + maxf(0.0, pe) * 1.2, 0, 0)
	_s3(o, 9, s * 0.62 * a + pe * 0.4, 0, -0.03)
	_s3(o, 10, (0.08 + maxf(0.0, sin(fph + 1.3 + PI)) * 0.95) * a + 0.04 + maxf(0.0, -pe) * 1.2, 0, 0)


static func _ease_io(x: float) -> float:
	return 2.0 * x * x if x < 0.5 else 1.0 - pow(-2.0 * x + 2.0, 2.0) / 2.0


static func _ease_out(x: float) -> float:
	return 1.0 - pow(1.0 - x, 3.0)


## o empurrão: os dois braços para a frente (posePush do jogo antigo)
func _pose_empurrao(k: float) -> void:
	_s3(o, 3, lerpf(o[9], -1.55, k), 0, lerpf(o[11], 0.1, k))
	_s3(o, 4, lerpf(o[12], -0.1, k), 0, 0)
	_s3(o, 5, lerpf(o[15], -1.55, k), 0, lerpf(o[17], -0.1, k))
	_s3(o, 6, lerpf(o[18], -0.1, k), 0, 0)
	_s3(o, 1, lerpf(o[3], 0.25, k), 0, 0)


## a voadora: o pé direito para a frente, a perna de apoio reta, os braços abertos (poseVoadora)
func _pose_voadora(k: float) -> void:
	var s := sin(minf(1.0, k) * PI)
	_s3(o, 9, -1.4 * s, 0, 0)
	_s3(o, 10, lerpf(0.9, 0.05, minf(1.0, k * 2.2)) * s + 0.05, 0, 0)
	_s3(o, 7, 0.06 * s, 0, 0)
	_s3(o, 8, 0.08 * s, 0, 0)
	_s3(o, 1, -0.32 * s, 0, 0)
	_s3(o, 3, -0.5 * s, 0, 0.75 * s)
	_s3(o, 5, -0.3 * s, 0, -0.85 * s)
	_s3(o, 0, -0.12 * s, 0, 0)


## o pisão: o joelho sobe e o pé desce de uma vez (posePisao)
func _pose_pisao(k: float) -> void:
	var sobe := sin(k / 0.5 * PI / 2.0) if k < 0.5 else 1.0
	var desce := 0.0 if k < 0.5 else minf(1.0, (k - 0.5) / 0.12)
	var volta := (k - 0.75) / 0.25 if k > 0.75 else 0.0
	var th := lerpf(-1.25 * sobe, -0.35, desce)
	var kn := lerpf(1.55 * sobe, 0.15, desce)
	_s3(o, 9, th * (1.0 - volta), 0, 0)
	_s3(o, 10, kn * (1.0 - volta), 0, 0)
	_s3(o, 7, 0.04 * sobe * (1.0 - volta), 0, 0)
	_s3(o, 8, 0.08 * sobe * (1.0 - volta), 0, 0)
	_s3(o, 1, 0.35 * (1.0 - volta), 0, 0)
	_s3(o, 2, 0.25 * (1.0 - volta), 0, 0)
	_s3(o, 3, -0.4 * sobe * (1.0 - volta), 0, 0.35)
	_s3(o, 5, -0.4 * sobe * (1.0 - volta), 0, -0.35)


## golpe corpo a corpo: s de 0 a 1; vertical para machado e picareta (o tronco gira junto), horizontal para o resto
static func _pose_melee(b: Array, s: float, vertical: bool) -> void:
	var ux: float
	var uz: float
	var fo: float
	var pr: float
	var ch: float
	var cy: float
	if vertical:
		var tw: float
		if s < 0.4:
			var k := _ease_io(s / 0.4)
			ux = lerpf(-0.4, -2.9, k)
			fo = lerpf(-0.7, -0.5, k)
			ch = lerpf(0.05, -0.15, k)
			pr = 0.0
			tw = lerpf(0.0, 0.32, k)
		else:
			var k := _ease_out(minf(1.0, (s - 0.4) / 0.22))
			var v := 1.0 - smoothstep(0.7, 1.0, s)
			ux = lerpf(-2.9, -0.7, k)
			fo = lerpf(-0.5, -0.2, k)
			ch = lerpf(-0.15, 0.4, k)
			pr = lerpf(0.0, 1.2, k)
			tw = lerpf(0.32, -0.22, k) * v
		_s3(b, 1, ch, tw, 0)
		_s3(b, 2, -ch * 0.4, -tw * 0.5, 0)
		_s3(b, 3, ux, 0, -0.18)
		_s3(b, 4, fo, 0, 0)
		_s3(b, 5, ux, 0, 0.12)
		_s3(b, 6, fo, 0, 0)
		_s3(b, 11, pr, 0, 0)
		return
	if s < 0.38:
		var k := _ease_io(s / 0.38)
		cy = lerpf(0.0, -0.7, k)
		ux = lerpf(-0.35, -1.3, k)
		uz = lerpf(-0.12, -0.75, k)
		fo = lerpf(-0.9, -0.55, k)
		pr = lerpf(0.0, 0.5, k)
	else:
		var k := _ease_out(minf(1.0, (s - 0.38) / 0.2))
		cy = lerpf(-0.7, 0.65, k)
		ux = lerpf(-1.3, -1.45, k)
		uz = lerpf(-0.75, 0.35, k)
		fo = lerpf(-0.55, -0.15, k)
		pr = lerpf(0.5, 0.9, k)
	_s3(b, 1, 0.08, cy, 0)
	_s3(b, 2, 0, -cy * 0.5, 0)
	_s3(b, 3, -0.4, 0, 0.2)
	_s3(b, 4, -0.8, 0, 0)
	_s3(b, 5, ux, 0, uz)
	_s3(b, 6, fo, 0, 0)
	_s3(b, 11, pr, 0, 0)


func _pose_aim(k: float, recuo: float) -> void:
	_s3(o, 5, lerpf(o[15], -1.48 - recuo * 0.25, k), 0, lerpf(o[17], 0.12, k))
	_s3(o, 6, lerpf(o[18], -0.02, k), 0, 0)
	_s3(o, 11, 0, 0, 0)
	_s3(o, 3, lerpf(o[9], -1.3, k), 0, lerpf(o[11], -0.45, k))
	_s3(o, 4, lerpf(o[12], -0.35, k), 0, 0)


func _pose_use(k: float) -> void:
	_s3(o, 5, lerpf(o[15], -1.25, k), 0, lerpf(o[17], 0.45, k))
	_s3(o, 6, lerpf(o[18], -1.95, k), 0, 0)
	_s3(o, 2, lerpf(o[6], -0.25, k), 0, 0)


## a pose do jogo (12 ossos, ângulos em o) nos deltas dos 22 ossos do Mixamo (skDaPose)
func _da_pose() -> void:
	for i in 12:
		var q := _euler(o[i * 3], o[i * 3 + 1], o[i * 3 + 2])
		var p: int = PROC_PAI[i]
		_W[i] = q if p < 0 else (_W[p] as Quaternion) * q
	Dp[HIPS] = _W[0] * A[HIPS]
	Dp[SPINE2] = _W[1] * A[SPINE2]
	Dp[SPINE] = _nl(Dp[HIPS], Dp[SPINE2], 0.34)
	Dp[SPINE1] = _nl(Dp[HIPS], Dp[SPINE2], 0.67)
	Dp[HEAD] = _W[2] * A[HEAD]
	Dp[NECK] = _nl(Dp[SPINE2], Dp[HEAD], 0.5)
	Dp[L_OMBRO] = Dp[SPINE2]
	Dp[R_OMBRO] = Dp[SPINE2]
	Dp[L_BRACO] = _W[3] * A[L_BRACO]
	Dp[L_ANTE] = _W[4] * A[L_ANTE]
	Dp[L_MAO] = _W[4] * A[L_MAO]
	Dp[R_BRACO] = _W[5] * A[R_BRACO]
	Dp[R_ANTE] = _W[6] * A[R_ANTE]
	Dp[R_MAO] = _W[11] * A[R_MAO]
	Dp[L_COXA] = _W[7] * A[L_COXA]
	Dp[L_PERNA] = _W[8] * A[L_PERNA]
	Dp[R_COXA] = _W[9] * A[R_COXA]
	Dp[R_PERNA] = _W[10] * A[R_PERNA]
	# pés quase sempre paralelos ao chão (seguem um pouco a canela)
	Dp[L_PE] = _nl(Quaternion.IDENTITY, Dp[L_PERNA], 0.28)
	Dp[R_PE] = _nl(Quaternion.IDENTITY, Dp[R_PERNA], 0.28)
	Dp[L_DEDO] = Dp[L_PE]
	Dp[R_DEDO] = Dp[R_PE]


## a mão esquerda no cabo das ferramentas de duas mãos (maosIK): o ombro fica, o cotovelo vai para baixo e para fora e o meio da
## mão chega ao ponto do cabo; entra e sai aos poucos (troca de item não faz o braço pular)
func _duas_maos(dt: float, id: String) -> void:
	var quer := MAO2.has(id)
	m2w = _chegar(m2w, 1.0 if quer else 0.0, dt * 5.0)
	if quer:
		m2g = MAO2[id]
	if m2w < 0.004:
		return
	var w := m2w * m2w * (3.0 - 2.0 * m2w)
	var qr: Quaternion = Q[R_MAO] * aq_inv[R_MAO]
	var h: Vector3 = P[R_MAO] + (Q[R_MAO] as Quaternion) * Vector3(0, 0.075, 0)
	var alvo_c: Vector3 = h + qr * m2g
	var s: Vector3 = P[L_BRACO]
	var e: Vector3 = P[L_ANTE]
	var wr: Vector3 = P[L_MAO]
	var hm: Vector3 = wr + (Q[L_MAO] as Quaternion) * Vector3(0, 0.075, 0)
	var l1 := e.distance_to(s)
	var l2 := hm.distance_to(e)
	if l1 < 1e-3 or l2 < 1e-3:
		return
	var t := hm.lerp(alvo_c, w)
	var dv := t - s
	var d0 := maxf(dv.length(), 1e-4)
	var u := dv / d0
	var dd := minf((l1 + l2) * 0.998, maxf(absf(l1 - l2) * 1.05 + 1e-3, d0))
	t = s + u * dd
	# o cotovelo vai para o lado do cotovelo da animação, puxado para baixo e para fora (a esquerda do personagem é +x)
	var pv := e - s + Vector3(0.22 * w, -0.3 * w, -0.08 * w)
	pv -= u * pv.dot(u)
	if pv.length() < 1e-5:
		pv = Vector3(0.3, -1, 0)
		pv -= u * pv.dot(u)
	pv = pv.normalized()
	var a := (l1 * l1 - l2 * l2 + dd * dd) / (2.0 * dd)
	var hh := sqrt(maxf(0.0, l1 * l1 - a * a))
	var e2 := s + u * a + pv * hh
	var qa := _de_para((e - s).normalized(), (e2 - s).normalized())
	for b in [L_BRACO, L_ANTE, L_MAO]:
		Q[b] = qa * Q[b]
	var h1 := s + qa * (hm - s)
	var w1 := s + qa * (wr - s) - e2
	var qb2 := _de_para((h1 - e2).normalized(), (t - e2).normalized())
	for b in [L_ANTE, L_MAO]:
		Q[b] = qb2 * Q[b]
	P[L_ANTE] = e2
	P[L_MAO] = e2 + qb2 * w1


## a altura do topo da cabeça (com o cabelo), para a câmera do palco
func altura_total() -> float:
	return float(META["corpos"][g]["altura"]) * escala * 1.06
