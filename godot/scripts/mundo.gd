class_name Mundo
extends Node3D
## A mata e o que se pega no mapa, nos mesmos lugares do jogo antigo (dados/mapa/vegetacao.json): as 7.400 árvores, cada uma
## com a espécie, o tamanho e o giro de lá (jacarandá, duas árvores de folha larga e a árvore pequena; os pinheiros antigos
## viram espécie da mata, mais altos), as árvores gigantes com copa de jacarandá do tamanho delas, pedras, moitas (algumas com
## frutinha), samambaias, flores, troncos caídos e o que fica no chão (pedra solta, galho, cogumelo e fibra). Também as
## gavetas, armários, geladeiras, cofres e baús das casas e prédios (com as tabelas de saque do jogo antigo) e os poços.
## Da Serra Velha (dados/mapa/pedras_plantas.json): os paredões de rocha cravados nas encostas e as pedras soltas no pé
## deles; e a folhagem do chão da mata (calathea, antúrio e monguba) em volta dos troncos.
##
## Árvore tem três versões, trocadas por pedaço de 40 m conforme a distância: a inteira (perto), uma de meia distância (o
## tronco, os galhos e 1/4 das folhas, cada folha que fica um pouco maior) e, de longe, uma placa virada para a câmera com a
## foto da própria espécie (tirada quando o jogo abre). As placas de um pedaço vão todas num desenho só.

const PEDACO := 40.0
const PEDACO_ARV := 32.0
# distâncias das três versões da árvore (gráfico Alto; o Médio e o Baixo multiplicam por "mata" das opções)
const ARV_PERTO := 60.0
const ARV_MEIO := 130.0
var terreno: Terreno
var rng := RandomNumberGenerator.new()
var malhas := {}          # chave -> Mesh
var grupos := {}          # id -> {mmi, xfs, ini, fim}
var recursos := []        # {tipo, item, pos, vida, max, rend, inst: [[grupo, idx]...] ou no, corpo, volta}
var caixas := []          # {corpo, pos, volta, cheia, nome, tabela}
var aguas := []           # poços e barris: {pos, nome}
var portas := []
var zspawn := {}          # lugar -> [[x, z]...] (onde os zumbis de cada lugar nascem)
var lugares := []         # {id, nome, x, z, r}
var esp := []             # espécies: {id, k, cx, cz, aabb, cela}
var _alcances := []       # [GeometryInstance3D, ini, fim]
var _pend := {}
var _formas := {}
var loot := {}            # tabelas do jogo antigo: [item, min, max, chance]
var loot_cid := {}        # tabelas da cidade: [item, chance, min, max]
var mat_placa: ShaderMaterial
var fotos_prontas := false
var _folha_orig := {}     # material de folha novo -> o material do modelo (para a foto da espécie)
var _voltando := []       # recursos que acabaram e esperam voltar (índices)
var _vazias := []         # móveis já revistados (índices)
var serra := {"paredoes": 0, "soltas": 0, "folhagem": 0, "colisoes": 0, "teste": Vector3.ZERO}

const ESPECIES := {"jacaranda": "res://assets/mata/jacaranda.glb", "ilha1": "res://assets/mata/ilha1.glb",
	"ilha2": "res://assets/mata/ilha2.glb", "pequena": "res://assets/mata/pequena.glb"}
const PEDRAS := ["res://assets/mata/pedra.glb", "res://assets/mata/pedras_musgo_0.glb", "res://assets/mata/pedras_musgo_1.glb",
	"res://assets/mata/pedras_musgo_2.glb", "res://assets/mata/pedras_musgo_3.glb"]
# moitas: [modelo, altura em m quando o tamanho do jogo antigo é 1]
const MOITAS := [["res://assets/mata/monguba_0.glb", 1.15], ["res://assets/mata/monguba_1.glb", 1.0], ["res://assets/mata/monguba_2.glb", 1.15],
	["res://assets/mata/calathea_0.glb", 0.75], ["res://assets/mata/calathea_1.glb", 0.7]]
const SAMAMBAIAS := ["res://assets/mata/samambaia_0.glb", "res://assets/mata/samambaia_1.glb", "res://assets/mata/samambaia_2.glb"]
const FLORES := ["res://assets/mata/antorio_0.glb", "res://assets/mata/antorio_1.glb", "res://assets/mata/antorio_2.glb"]
# Serra Velha: os dois paredões escaneados (o morro "mountainside" e o paredão "rock_face_01") e as pedras com musgo
const PAREDOES := ["res://assets/mata/paredao.glb", "res://assets/mata/paredao2.glb"]
const MUSGO := ["res://assets/mata/pedras_musgo_0.glb", "res://assets/mata/pedras_musgo_1.glb", "res://assets/mata/pedras_musgo_2.glb",
	"res://assets/mata/pedras_musgo_3.glb", "res://assets/mata/pedras_musgo_4.glb", "res://assets/mata/pedras_musgo_5.glb"]
# folhagem do chão da mata: as variantes do jogo antigo (0-4 calathea, 5-10 antúrio, 11-14 monguba); aqui há 3 de cada
const FOLHAGEM := ["res://assets/mata/calathea_%d.glb", "res://assets/mata/antorio_%d.glb", "res://assets/mata/monguba_%d.glb"]
# a oeste disso é a parte da serra fora do mapa (paisagem: sem colisão), como no jogo antigo
const BORDA_OESTE := -197.0
# itens do jogo antigo que ainda não existem aqui viram o parecido (a etapa 2 traz todos)
const PARECIDO := {"feijao": "lata", "biscoito": "lata", "sopa": "lata", "carneAssada": "lata", "refri": "agua", "tabuas": "madeira",
	"graveto": "madeira", "pregos": "sucata", "canoFerro": "sucata", "cabo": "sucata", "frutas": "fruta", "maca": "fruta",
	"laranja": "fruta", "remedios": "bandagem", "antisseptico": "bandagem", "kit": "bandagem", "peDeCabra": "martelo",
	"cutelo": "facao", "faca": "facao", "corda": "fibra", "linha": "fibra", "camiseta": "pano", "camisaLeve": "pano",
	"bermuda": "pano", "calcaCargo": "pano", "pilhas": "sucata", "fita": "pano"}


func _init(t: Terreno) -> void:
	terreno = t
	rng.seed = 2026


## a malha de um modelo .glb (a primeira que tiver); "tinta" escurece/esverdeia o material (casca, folha, pedra)
func malha(caminho: String, tinta := Color(1, 1, 1), tinta_folha := Color(1, 1, 1)) -> Mesh:
	if malhas.has(caminho):
		return malhas[caminho]
	var cena: PackedScene = load(caminho)
	var no := cena.instantiate()
	var m: Mesh = null
	for f in no.find_children("*", "MeshInstance3D", true, false):
		m = (f as MeshInstance3D).mesh
		break
	no.free()
	if m != null and (tinta != Color(1, 1, 1) or tinta_folha != Color(1, 1, 1)):
		for s in m.get_surface_count():
			var mt := m.surface_get_material(s) as BaseMaterial3D
			if mt == null:
				continue
			var folha := mt.transparency != BaseMaterial3D.TRANSPARENCY_DISABLED
			if folha:
				# folha: o shader de folhagem (luz dos dois lados, como um volume, e um balanço leve de vento)
				var mf := _mat_folha(mt, tinta_folha)
				_folha_orig[mf] = mt
				(m as ArrayMesh).surface_set_material(s, mf)
			else:
				var novo := mt.duplicate() as BaseMaterial3D
				novo.albedo_color = novo.albedo_color * tinta
				(m as ArrayMesh).surface_set_material(s, novo)
	malhas[caminho] = m
	return m


## folhagem: a textura da folha com recorte; a luz pega a folha dos dois lados (metade a normal dela, metade para cima,
## como numa copa) e as folhas balançam um pouco com o vento (mais na ponta dos galhos)
func _mat_folha(base: BaseMaterial3D, tinta: Color) -> ShaderMaterial:
	var sh := Shader.new()
	sh.code = """
shader_type spatial;
render_mode cull_disabled, diffuse_burley, specular_disabled;
uniform sampler2D tex : source_color, filter_linear_mipmap_anisotropic, repeat_enable;
uniform vec4 cor : source_color = vec4(1.0);
uniform float corte = 0.45;

void vertex() {
	vec3 w = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
	float ponta = clamp(VERTEX.y * 0.25, 0.0, 1.0);
	VERTEX.x += sin(TIME * 1.3 + w.x * 0.21 + w.z * 0.13) * 0.035 * ponta;
	VERTEX.z += cos(TIME * 1.1 + w.z * 0.17 + w.x * 0.07) * 0.03 * ponta;
}

void fragment() {
	vec4 c = texture(tex, UV) * cor;
	ALBEDO = c.rgb;
	ALPHA = c.a;
	ALPHA_SCISSOR_THRESHOLD = corte;
	ROUGHNESS = 0.92;
	vec3 n = FRONT_FACING ? NORMAL : -NORMAL;
	NORMAL = normalize(mix(n, (VIEW_MATRIX * vec4(0.0, 1.0, 0.0, 0.0)).xyz, 0.55));
}
"""
	var m := ShaderMaterial.new()
	m.shader = sh
	m.set_shader_parameter("tex", base.albedo_texture)
	m.set_shader_parameter("cor", base.albedo_color * tinta)
	m.set_shader_parameter("corte", base.alpha_scissor_threshold if base.alpha_scissor_threshold > 0.05 else 0.45)
	return m


func _chave(p: Vector3, pedaco: float) -> Vector2i:
	return Vector2i(floori(p.x / pedaco), floori(p.z / pedaco))


## guarda uma instância para montar depois (as MultiMesh nascem com o número certo); ini/fim: distâncias em que aparece
func _instancia(chave_m: String, xf: Transform3D, ini: float, fim: float, sombra: bool, pedaco := PEDACO, extra := Color(0, 0, 0, 0), ref = null) -> Array:
	# as versões de uma árvore vão no mesmo pedaço (o do pé dela): numa distância só uma delas aparece
	var base: Vector3 = xf.origin if ref == null else ref
	var k := _chave(base, pedaco)
	var id := "%s|%d|%d|%d|%d" % [chave_m, int(pedaco), k.x, k.y, int(ini)]
	if not _pend.has(id):
		_pend[id] = {"m": chave_m, "xfs": [], "cor": [], "ini": ini, "fim": fim, "sombra": sombra}
	_pend[id]["xfs"].append(xf)
	_pend[id]["cor"].append(extra)
	return [id, _pend[id]["xfs"].size() - 1]


func _fechar_grupos() -> void:
	for id in _pend:
		var g: Dictionary = _pend[id]
		var mm := MultiMesh.new()
		mm.transform_format = MultiMesh.TRANSFORM_3D
		var placa: bool = g["m"] == "placa"
		mm.use_custom_data = placa
		mm.mesh = malha(g["m"])
		mm.instance_count = g["xfs"].size()
		for i in g["xfs"].size():
			mm.set_instance_transform(i, g["xfs"][i])
			if placa:
				mm.set_instance_custom_data(i, g["cor"][i])
		var mmi := MultiMeshInstance3D.new()
		mmi.multimesh = mm
		mmi.visibility_range_begin = g["ini"]
		mmi.visibility_range_end = g["fim"]
		mmi.visibility_range_begin_margin = 4.0 if g["ini"] > 0.0 else 0.0
		mmi.visibility_range_end_margin = 4.0 if g["fim"] > 0.0 else 0.0
		mmi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON if g["sombra"] else GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		if placa:
			mmi.material_override = mat_placa
			# a caixa da placa é a de uma árvore em pé em qualquer giro (o shader vira a placa para a câmera)
			mmi.extra_cull_margin = 16.0
		add_child(mmi)
		grupos[id] = {"mmi": mmi, "xfs": g["xfs"], "ini": g["ini"], "fim": g["fim"]}
	_pend.clear()


func esconder(r: Dictionary) -> void:
	if r.has("inst"):
		for par in r["inst"]:
			var g: Dictionary = grupos[par[0]]
			(g["mmi"] as MultiMeshInstance3D).multimesh.set_instance_transform(par[1], Transform3D(Basis().scaled(Vector3.ZERO), g["xfs"][par[1]].origin))
	elif r.has("no"):
		(r["no"] as Node3D).visible = false


func mostrar(r: Dictionary) -> void:
	if r.has("inst"):
		for par in r["inst"]:
			var g: Dictionary = grupos[par[0]]
			(g["mmi"] as MultiMeshInstance3D).multimesh.set_instance_transform(par[1], g["xfs"][par[1]])
	elif r.has("no"):
		(r["no"] as Node3D).visible = true


## até onde a mata, as pedras e os troncos aparecem (gráficos baixo/médio/alto)
func alcance(k: float) -> void:
	for id in grupos:
		var g: Dictionary = grupos[id]
		var mmi: MultiMeshInstance3D = g["mmi"]
		mmi.visibility_range_begin = float(g["ini"]) * k
		mmi.visibility_range_end = float(g["fim"]) * k
	for par in _alcances:
		(par[0] as GeometryInstance3D).visibility_range_begin = float(par[1]) * k
		(par[0] as GeometryInstance3D).visibility_range_end = float(par[2]) * k


func montar(col: ColisaoMapa = null) -> void:
	var v: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://dados/mapa/vegetacao.json"))
	var me: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://dados/mapa/mata_especies.json"))
	var o: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://dados/mapa/objetos.json"))
	var ant: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://dados/jogo/antigo_itens.json"))
	loot = ant.get("LOOT", {})
	loot_cid = ant.get("CID_LOOT", {})
	zspawn = o.get("zspawn", {})
	for p in v.get("places", []):
		lugares.append({"id": str(p["id"]), "nome": str(p.get("nome", p["id"])), "x": float(p["x"]), "z": float(p["z"]), "r": float(p.get("r", 14.0))})
	_especies(me)
	_arvores(v, me)
	_pedras(v["rocks"])
	_plantas(v)
	_troncos(v["troncos"])
	_soltos(v["picks"])
	var pp: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://dados/mapa/pedras_plantas.json"))
	_serra_velha(pp, col)
	_folhagem(pp)
	if col != null:
		_brenha(col.brenha)
		_serra(col.serra, pp.get("soltas", []))
	_fechar_grupos()
	_caixas(o)


# ---------------------------------------------------------------- árvores
func _especies(me: Dictionary) -> void:
	_mat_placa()
	var n := (me["esp"] as Array).size()
	for i in n:
		var e: Dictionary = me["esp"][i]
		var id := str(e["id"])
		var cam: String = ESPECIES.get(id, "res://assets/mata/ilha1.glb")
		var m0 := malha(cam, Color(0.78, 0.72, 0.64), Color(0.82, 1.0, 0.78))
		var aabb := m0.get_aabb()
		# altura da espécie no jogo antigo (tamanho 1): a malha daqui é esticada para ficar igual
		var alt := float(e["lim"]["hi"][1])
		var k := alt / maxf(aabb.end.y, 0.1)
		malhas["arv:%s:0" % id] = m0
		malhas["arv:%s:1" % id] = _meia_distancia(m0)
		esp.append({"id": id, "k": k, "cx": float(e["tronco"]["cx"]), "cz": float(e["tronco"]["cz"]), "aabb": aabb, "cela": i, "m0": m0})
	malhas["placa"] = _placa()


## a transformação de uma árvore: o modelo gira, cresce e anda para o pé do tronco ficar no ponto da árvore
func _xf_arvore(e: Dictionary, pos: Vector3, giro: float, s: float) -> Transform3D:
	var gira := Basis(Vector3.UP, giro)
	return Transform3D(gira.scaled(Vector3.ONE * s * float(e["k"])), pos - gira * (Vector3(float(e["cx"]), 0, float(e["cz"])) * s))


## a placa de longe: um quadrado em pé com a foto da espécie (o tronco no meio de baixo)
func _xf_placa(e: Dictionary, pos: Vector3, s: float) -> Transform3D:
	var a: AABB = e["aabb"]
	var lado := _lado_foto(e) * float(e["k"]) * s
	return Transform3D(Basis().scaled(Vector3(lado, lado, lado)), pos + Vector3(0, a.position.y * float(e["k"]) * s, 0))


func _lado_foto(e: Dictionary) -> float:
	var a: AABB = e["aabb"]
	var cx := float(e["cx"]) / float(e["k"])
	var cz := float(e["cz"]) / float(e["k"])
	var r := 0.0
	for x in [a.position.x, a.end.x]:
		for z in [a.position.z, a.end.z]:
			r = maxf(r, Vector2(x - cx, z - cz).length())
	return maxf(a.size.y, r * 2.0) * 1.04


func _arvores(v: Dictionary, me: Dictionary) -> void:
	var k_pinho := float(me.get("kPinho", 1.0))
	var arv: Array = v["trees"]
	var info: Array = me["arv"]
	for i in arv.size():
		var t: Array = arv[i]
		var e_i := int(info[i][0]) if i < info.size() else 1
		var raio := float(info[i][1]) if i < info.size() else 0.35
		var e: Dictionary = esp[clampi(e_i, 0, esp.size() - 1)]
		var s := float(t[3]) * (k_pinho if int(t[5]) == 0 else 1.0)
		var pos := Vector3(float(t[0]), float(t[1]), float(t[2]))
		var inst := _tres_versoes(e, pos, float(t[4]), s, 1.0)
		var corpo := _corpo_arvore(pos, maxf(0.15, raio))
		var rec := {"tipo": "arvore", "item": "madeira", "pos": pos, "vida": 100.0, "max": 100.0, "rend": 10.0 + s * 4.0,
			"inst": inst, "corpo": corpo, "volta": 0.0}
		corpo.set_meta("recurso", recursos.size())
		recursos.append(rec)
	# árvores gigantes: a madeira, os galhos andáveis e a colisão vêm prontos (malhas e colisão do mapa); aqui vai a copa
	# de jacarandá do tamanho delas (como no jogo antigo)
	var jac: Dictionary = esp[0]
	for e2 in esp:
		if e2["id"] == "jacaranda":
			jac = e2
	var alt_j := float(jac["aabb"].end.y) * float(jac["k"])
	var gig: Array = v["gigantes"]
	for i in gig.size():
		var g: Array = gig[i]
		var gp := Vector3(float(g[0]), float(g[1]) - 0.3, float(g[2]))
		var sg := float(g[4]) * 1.12 / alt_j
		_tres_versoes(jac, gp, float(i) * 2.39, sg, 2.2)


## as três versões de uma árvore no mesmo pedaço (perto, meia distância e placa); "longe" estica as distâncias (gigantes)
func _tres_versoes(e: Dictionary, pos: Vector3, giro: float, s: float, longe: float) -> Array:
	var xf := _xf_arvore(e, pos, giro, s)
	var id: String = e["id"]
	return [
		_instancia("arv:%s:0" % id, xf, 0.0, ARV_PERTO * longe, true, PEDACO_ARV, Color(0, 0, 0, 0), pos),
		_instancia("arv:%s:1" % id, xf, ARV_PERTO * longe, ARV_MEIO * longe, false, PEDACO_ARV, Color(0, 0, 0, 0), pos),
		_instancia("placa", _xf_placa(e, pos, s), ARV_MEIO * longe, 0.0, false, PEDACO_ARV, Color(float(e["cela"]), 0, 0, 0), pos),
	]


## colisão do tronco: um corpo por árvore (a forma é dividida entre árvores do mesmo tamanho)
func _corpo_arvore(p: Vector3, raio: float) -> StaticBody3D:
	var chave := "c%.2f" % snappedf(raio, 0.05)
	if not _formas.has(chave):
		var c := CylinderShape3D.new()
		c.radius = snappedf(raio, 0.05)
		c.height = 5.0
		_formas[chave] = c
	var corpo := StaticBody3D.new()
	var cs := CollisionShape3D.new()
	cs.shape = _formas[chave]
	cs.position.y = 2.5
	corpo.add_child(cs)
	corpo.position = p
	add_child(corpo)
	return corpo


## versão de meia distância: o tronco inteiro, sem os galhos finos (ficam dentro da copa), e 35% das folhas (cada folha
## que fica, 40% maior)
func _meia_distancia(m0: Mesh) -> ArrayMesh:
	var m1 := ArrayMesh.new()
	for s in m0.get_surface_count():
		var mat := m0.surface_get_material(s)
		var folha := mat is ShaderMaterial or (mat is BaseMaterial3D and (mat as BaseMaterial3D).transparency != BaseMaterial3D.TRANSPARENCY_DISABLED)
		var nome := (m0 as ArrayMesh).surface_get_name(s) + " " + (mat.resource_name if mat else "")
		if not folha and nome.to_lower().contains("branch"):
			continue
		var arr := m0.surface_get_arrays(s)
		if folha:
			arr = _desbastar(arr, 0.35, 1.4)
		m1.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arr)
		m1.surface_set_material(m1.get_surface_count() - 1, mat)
	return m1


func _raiz(pai: PackedInt32Array, i: int) -> int:
	while pai[i] != i:
		pai[i] = pai[pai[i]]
		i = pai[i]
	return i


## fica só uma parte das folhas (cada folha ou cacho é um pedaço ligado da malha) e cada uma cresce em volta do meio dela
func _desbastar(arr: Array, fracao: float, cresce: float) -> Array:
	var vs: PackedVector3Array = arr[Mesh.ARRAY_VERTEX]
	var ids: PackedInt32Array = arr[Mesh.ARRAY_INDEX] if arr[Mesh.ARRAY_INDEX] != null else PackedInt32Array()
	var n := vs.size()
	if ids.is_empty():
		ids.resize(n)
		for i in n:
			ids[i] = i
	var pai := PackedInt32Array()
	pai.resize(n)
	for i in n:
		pai[i] = i
	for t in range(0, ids.size(), 3):
		var a := _raiz(pai, ids[t])
		var b := _raiz(pai, ids[t + 1])
		if a != b:
			pai[b] = a
		var c := _raiz(pai, ids[t + 2])
		if c != a:
			pai[c] = a
	var soma := {}
	var raiz := PackedInt32Array()
	raiz.resize(n)
	for i in n:
		var r := _raiz(pai, i)
		raiz[i] = r
		if soma.has(r):
			soma[r] += Vector4(vs[i].x, vs[i].y, vs[i].z, 1.0)
		else:
			soma[r] = Vector4(vs[i].x, vs[i].y, vs[i].z, 1.0)
	var fica := {}
	for r in soma:
		if float((int(r) * 2654435761) % 1000) / 1000.0 < fracao:
			var q: Vector4 = soma[r]
			fica[r] = Vector3(q.x, q.y, q.z) / q.w
	var nvs := vs.duplicate()
	for i in n:
		var r := raiz[i]
		if fica.has(r):
			var c: Vector3 = fica[r]
			nvs[i] = c + (vs[i] - c) * cresce
	var nids := PackedInt32Array()
	for t in range(0, ids.size(), 3):
		if fica.has(raiz[ids[t]]):
			nids.append_array(PackedInt32Array([ids[t], ids[t + 1], ids[t + 2]]))
	var novo := arr.duplicate()
	novo[Mesh.ARRAY_VERTEX] = nvs
	novo[Mesh.ARRAY_INDEX] = nids
	return novo


## o quadrado da placa de longe (de -0,5 a 0,5 de lado e de 0 a 1 de altura; o shader vira para a câmera)
func _placa() -> ArrayMesh:
	var arr := []
	arr.resize(Mesh.ARRAY_MAX)
	arr[Mesh.ARRAY_VERTEX] = PackedVector3Array([Vector3(-0.5, 0, 0), Vector3(0.5, 0, 0), Vector3(0.5, 1, 0), Vector3(-0.5, 1, 0)])
	arr[Mesh.ARRAY_NORMAL] = PackedVector3Array([Vector3.BACK, Vector3.BACK, Vector3.BACK, Vector3.BACK])
	arr[Mesh.ARRAY_TEX_UV] = PackedVector2Array([Vector2(0, 1), Vector2(1, 1), Vector2(1, 0), Vector2(0, 0)])
	arr[Mesh.ARRAY_INDEX] = PackedInt32Array([0, 2, 1, 0, 3, 2])
	var m := ArrayMesh.new()
	m.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arr)
	m.custom_aabb = AABB(Vector3(-0.8, 0, -0.8), Vector3(1.6, 1.0, 1.6))
	return m


func _mat_placa() -> void:
	var sh := Shader.new()
	sh.code = """
shader_type spatial;
render_mode skip_vertex_transform, cull_disabled, diffuse_burley, specular_disabled;
uniform sampler2D fotos : source_color, filter_linear_mipmap, repeat_disable;
uniform float celas = 4.0;
varying float cela;
varying float alto;

void vertex() {
	vec3 o = MODEL_MATRIX[3].xyz;
	float sx = length(MODEL_MATRIX[0].xyz);
	float sy = length(MODEL_MATRIX[1].xyz);
	vec3 para = CAMERA_POSITION_WORLD - o;
	para.y = 0.0;
	para = normalize(para + vec3(0.0001, 0.0, 0.0));
	vec3 lado = vec3(para.z, 0.0, -para.x);
	vec3 w = o + lado * VERTEX.x * sx + vec3(0.0, VERTEX.y * sy, 0.0);
	VERTEX = (VIEW_MATRIX * vec4(w, 1.0)).xyz;
	// a luz pega a copa como um volume: meio de frente, meio de cima
	NORMAL = normalize((VIEW_MATRIX * vec4(normalize(para * 0.55 + vec3(0.0, 0.85, 0.0)), 0.0)).xyz);
	cela = INSTANCE_CUSTOM.x;
	alto = UV.y;
}

void fragment() {
	vec2 uv = vec2((UV.x + cela) / celas, UV.y);
	vec4 c = texture(fotos, uv);
	// a foto é a cor sem luz: de longe a copa tem sombra dentro dela, então fica mais escura; o miolo de baixo mais ainda
	ALBEDO = c.rgb * 0.62 * mix(1.0, 0.75, alto);
	ALPHA = c.a;
	ALPHA_SCISSOR_THRESHOLD = 0.4;
	ROUGHNESS = 0.95;
}
"""
	mat_placa = ShaderMaterial.new()
	mat_placa.shader = sh
	var img := Image.create_empty(4, 1, false, Image.FORMAT_RGBA8)
	img.fill(Color(0.16, 0.24, 0.1, 0.0))
	mat_placa.set_shader_parameter("fotos", ImageTexture.create_from_image(img))


## tira a foto de cada espécie (de lado, sem luz, fundo transparente) e junta numa tira para as placas de longe
func tirar_fotos() -> void:
	if DisplayServer.get_name() == "headless":
		return
	var lado := 256
	var vps := []
	for e in esp:
		var vp := SubViewport.new()
		vp.size = Vector2i(lado, lado)
		vp.transparent_bg = true
		vp.own_world_3d = true
		vp.msaa_3d = Viewport.MSAA_DISABLED
		vp.render_target_update_mode = SubViewport.UPDATE_ONCE
		var mi := MeshInstance3D.new()
		var m0: Mesh = e["m0"]
		mi.mesh = m0
		for s in m0.get_surface_count():
			var ms := m0.surface_get_material(s)
			var mt: BaseMaterial3D = _folha_orig.get(ms, ms as BaseMaterial3D)
			if mt == null:
				continue
			var plano := mt.duplicate() as BaseMaterial3D
			plano.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
			if _folha_orig.has(ms):
				plano.albedo_color = (ms as ShaderMaterial).get_shader_parameter("cor")
			mi.set_surface_override_material(s, plano)
		vp.add_child(mi)
		var a: AABB = e["aabb"]
		var tam := _lado_foto(e)
		var cam := Camera3D.new()
		cam.projection = Camera3D.PROJECTION_ORTHOGONAL
		cam.size = tam
		cam.near = 0.05
		cam.far = 200.0
		cam.position = Vector3(float(e["cx"]) / float(e["k"]), a.position.y + tam * 0.5, a.end.z + 50.0)
		vp.add_child(cam)
		cam.current = true
		add_child(vp)
		vps.append(vp)
	for i in 3:
		await RenderingServer.frame_post_draw
	var tira := Image.create_empty(lado * vps.size(), lado, false, Image.FORMAT_RGBA8)
	var ok := true
	for i in vps.size():
		var img: Image = (vps[i] as SubViewport).get_texture().get_image()
		if img == null or img.is_empty():
			ok = false
			break
		img.convert(Image.FORMAT_RGBA8)
		tira.blit_rect(img, Rect2i(0, 0, lado, lado), Vector2i(lado * i, 0))
	for vp in vps:
		(vp as Node).queue_free()
	if not ok:
		return
	# a borda transparente pega a cor da folha do lado (senão a mipmap escurece o contorno da copa)
	tira.fix_alpha_edges()
	tira.generate_mipmaps()
	mat_placa.set_shader_parameter("fotos", ImageTexture.create_from_image(tira))
	mat_placa.set_shader_parameter("celas", float(vps.size()))
	fotos_prontas = true


# ---------------------------------------------------------------- pedras, plantas, troncos
func _pedras(lista: Array) -> void:
	for m in PEDRAS:
		malha(m, Color(0.8, 0.78, 0.76))
	for r in lista:
		var rp := Vector3(float(r[0]), float(r[1]), float(r[2]))
		var esc := float(r[3]) * 1.05
		var mp: String = PEDRAS[absi(int(rp.x * 7.0 + rp.z * 13.0)) % PEDRAS.size()]
		var no := MeshInstance3D.new()
		no.mesh = malha(mp)
		no.transform = Transform3D(Basis(Vector3.UP, float(r[4])).scaled(Vector3.ONE * esc), rp)
		no.visibility_range_end = 220.0
		_alcances.append([no, 0.0, 220.0])
		add_child(no)
		if not _formas.has(mp):
			_formas[mp] = no.mesh.create_convex_shape(true, true)
		var corpo := StaticBody3D.new()
		var cs := CollisionShape3D.new()
		cs.shape = _formas[mp]
		corpo.add_child(cs)
		corpo.transform = no.transform
		add_child(corpo)
		var rec := {"tipo": "pedra", "item": "pedra", "pos": rp, "vida": 100.0 * esc, "max": 100.0 * esc, "rend": 8.0 + 4.0 * esc,
			"no": no, "corpo": corpo, "volta": 0.0}
		corpo.set_meta("recurso", recursos.size())
		recursos.append(rec)


func _plantas(v: Dictionary) -> void:
	# as folhas das moitas e samambaias com o shader de folhagem (como as das árvores)
	for mb in MOITAS:
		malha(mb[0], Color(0.85, 0.82, 0.78), Color(0.88, 1.0, 0.86))
	for ms in SAMAMBAIAS:
		malha(ms, Color(1, 1, 1), Color(0.9, 1.0, 0.88))
	# moitas: dão fibra; as que têm fruto dão frutinha
	for b in v["bushes"]:
		var bp := Vector3(float(b[0]), float(b[1]), float(b[2]))
		var mb: Array = MOITAS[absi(int(bp.x * 3.0 + bp.z * 5.0)) % MOITAS.size()]
		var esc := float(b[3]) * float(mb[1]) / maxf(malha(mb[0]).get_aabb().end.y, 0.1)
		var ins := _instancia(mb[0], Transform3D(Basis(Vector3.UP, float(b[4])).scaled(Vector3.ONE * esc), bp), 0.0, 130.0, true)
		var corpo := _esfera(bp + Vector3(0, 0.45, 0), 0.6)
		var rec := {"tipo": "planta", "item": "fibra", "pos": bp, "vida": 1.0, "max": 1.0, "rend": 6.0, "fruta": int(b[5]) == 1,
			"inst": [ins], "corpo": corpo, "volta": 0.0}
		corpo.set_meta("recurso", recursos.size())
		recursos.append(rec)
	# samambaias e flores: enfeite (as que ficaram dentro de um lugar do jogo antigo vêm com altura -999 e não entram)
	for sm in v["samambaias"]:
		if float(sm[1]) < -100.0:
			continue
		var spp := Vector3(float(sm[0]), float(sm[1]), float(sm[2]))
		var ms: String = SAMAMBAIAS[absi(int(spp.x * 11.0 + spp.z * 3.0)) % SAMAMBAIAS.size()]
		_instancia(ms, Transform3D(Basis(Vector3.UP, float(sm[4])).scaled(Vector3.ONE * float(sm[3]) * 1.6), spp), 0.0, 70.0, false, 32.0)
	for fl in v["flores"]:
		if float(fl[1]) < -100.0:
			continue
		var fp := Vector3(float(fl[0]), float(fl[1]), float(fl[2]))
		var mf: String = FLORES[absi(int(fp.x * 5.0 + fp.z * 7.0)) % FLORES.size()]
		_instancia(mf, Transform3D(Basis(Vector3.UP, float(fl[4])).scaled(Vector3.ONE * float(fl[3]) * 0.9), fp), 0.0, 60.0, false, 32.0)


## a parede de mato da borda do mapa (o limite: ninguém passa): moitas altas e fechadas, samambaia na frente
func _brenha(lista: Array) -> void:
	var altas := ["res://assets/mata/monguba_0.glb", "res://assets/mata/monguba_2.glb"]
	for i in lista.size():
		var b: Array = lista[i]
		var x := float(b[0])
		var z := float(b[1])
		var y := terreno.h(x, z) - 0.1
		var h1 := 0.5 + 0.5 * sin(x * 12.9898 + z * 78.233)
		var m: String = altas[i % 2]
		var hm := malha(m).get_aabb().end.y
		_instancia(m, Transform3D(Basis(Vector3.UP, x * 1.7 + z).scaled(Vector3.ONE * (1.9 + 0.8 * h1) / hm), Vector3(x, y, z)), 0.0, 150.0, true)
		var a := float(i) * 2.4
		var p2 := Vector3(x + cos(a) * 0.9, 0, z + sin(a) * 0.9)
		p2.y = terreno.h(p2.x, p2.z) - 0.1
		var m2: String = altas[(i + 1) % 2]
		_instancia(m2, Transform3D(Basis(Vector3.UP, a).scaled(Vector3.ONE * (1.4 + 0.6 * (1.0 - h1)) / malha(m2).get_aabb().end.y), p2), 0.0, 150.0, true)
		if i % 2 == 0:
			var ms: String = SAMAMBAIAS[i % SAMAMBAIAS.size()]
			var p3 := Vector3(x - cos(a) * 1.2, 0, z - sin(a) * 1.2)
			p3.y = terreno.h(p3.x, p3.z) - 0.03
			_instancia(ms, Transform3D(Basis(Vector3.UP, a * 3.0).scaled(Vector3.ONE * 1.8), p3), 0.0, 70.0, false, 32.0)


## pedras grandes da serra que têm colisão no mapa e não estão entre as pedras soltas (essas já vêm desenhadas certas)
func _serra(lista: Array, soltas: Array) -> void:
	var musgo := ["res://assets/mata/pedras_musgo_0.glb", "res://assets/mata/pedras_musgo_1.glb", "res://assets/mata/pedras_musgo_3.glb"]
	for m in musgo:
		malha(m, Color(0.8, 0.78, 0.76))
	for i in lista.size():
		var b: Array = lista[i]
		var x := float(b[0])
		var z := float(b[1])
		if _tem_perto(soltas, x, z, 2.5):
			continue
		var esc := float(b[2]) / 0.65
		_instancia(musgo[i % musgo.size()], Transform3D(Basis(Vector3.UP, x * 0.9 + z * 1.3).scaled(Vector3.ONE * esc), Vector3(x, terreno.h(x, z) - 0.3 * esc, z)), 0.0, 260.0, true)


func _tem_perto(lista: Array, x: float, z: float, r: float) -> bool:
	for q in lista:
		if absf(float(q[0]) - x) < r and absf(float(q[2]) - z) < r:
			return true
	return false


## Serra Velha: paredões de rocha cravados nas encostas (virados para baixo do morro, como no jogo antigo) e as pedras que
## despencaram no pé deles. Os de dentro do mapa têm colisão; os de fora são paisagem.
func _serra_velha(d: Dictionary, col: ColisaoMapa) -> void:
	for m in PAREDOES:
		malha(m, Color(0.9, 0.88, 0.85))
	for a in d.get("paredoes", []):
		var m: String = PAREDOES[int(a[5]) % 2]
		var xf := Transform3D(Basis(Vector3.UP, float(a[3])).scaled(Vector3.ONE * float(a[4])), Vector3(float(a[0]), float(a[1]), float(a[2])))
		_instancia(m, xf, 0.0, 700.0, true, 96.0)
		serra["paredoes"] += 1
		if xf.origin.x > BORDA_OESTE:
			_corpo_convexo(m, xf)
			# para o teste: um que sai bem do chão (muitos ficam quase todo enterrados na encosta, como lá)
			var topo := xf.origin.y + malha(m).get_aabb().end.y * float(a[4])
			if serra["teste"] == Vector3.ZERO and topo > terreno.h(xf.origin.x, xf.origin.z) + 2.0:
				serra["teste"] = xf.origin
	var pedra := "res://assets/mata/pedra.glb"
	malha(pedra, Color(0.8, 0.78, 0.76))
	for m in MUSGO:
		malha(m, Color(0.8, 0.78, 0.76))
	var com_colisao: Array = col.serra if col != null else []
	for q in d.get("soltas", []):
		var v := int(q[5]) % 8
		# 0: o matacão no tamanho dele; 1-7: as pedras com musgo, com 1,6 m de largura no tamanho 1 (como lá)
		var m: String = pedra if v == 0 else MUSGO[(v - 1) % MUSGO.size()]
		var s := float(q[4])
		if v > 0:
			var bb := malha(m).get_aabb()
			s *= 1.6 / maxf(maxf(bb.size.x, bb.size.z), 0.05)
		var xf := Transform3D(Basis(Vector3.UP, float(q[3])).scaled(Vector3.ONE * s), Vector3(float(q[0]), float(q[1]), float(q[2])))
		_instancia(m, xf, 0.0, 240.0, true, 64.0)
		serra["soltas"] += 1
		# as de dentro do mapa que ainda não têm colisão (a do mapa é um cilindro no lugar de algumas delas)
		if xf.origin.x > BORDA_OESTE and not _tem_perto_col(com_colisao, xf.origin.x, xf.origin.z, 1.5):
			_corpo_convexo(m, xf)


func _tem_perto_col(lista: Array, x: float, z: float, r: float) -> bool:
	for q in lista:
		if absf(float(q[0]) - x) < r and absf(float(q[1]) - z) < r:
			return true
	return false


## colisão com o formato da pedra (casca convexa da malha, uma por modelo, no tamanho e giro de cada uma)
func _corpo_convexo(m: String, xf: Transform3D) -> void:
	var chave := "cv:" + m
	if not _formas.has(chave):
		_formas[chave] = malha(m).create_convex_shape(true, true)
	var corpo := StaticBody3D.new()
	var cs := CollisionShape3D.new()
	cs.shape = _formas[chave]
	corpo.add_child(cs)
	corpo.transform = xf
	add_child(corpo)
	serra["colisoes"] += 1


## a folhagem do chão da mata (só perto: some a 40 m, como no jogo antigo, que desenhava só em volta do jogador)
func _folhagem(d: Dictionary) -> void:
	var alturas: Array = d.get("alt_folhagem", [])
	for q in d.get("folhagem", []):
		var v := clampi(int(q[5]), 0, 14)
		var e := 0 if v < 5 else (1 if v < 11 else 2)
		var var_i: int = v - (0 if e == 0 else (5 if e == 1 else 11))
		var cam: String = FOLHAGEM[e] % (var_i % 3)
		var m := malha(cam, Color(0.85, 0.82, 0.78), Color(0.9, 1.0, 0.88))
		var alvo := (float(alturas[v]) if v < alturas.size() else 0.6) * float(q[4])
		var esc := alvo / maxf(m.get_aabb().end.y, 0.05)
		var xf := Transform3D(Basis(Vector3.UP, float(q[3])).scaled(Vector3.ONE * esc), Vector3(float(q[0]), float(q[1]), float(q[2])))
		_instancia(cam, xf, 0.0, 40.0, false, 32.0)
		serra["folhagem"] += 1


## troncos caídos (dão madeira): o modelo deitado de um ponto ao outro, da grossura de lá
func _troncos(lista: Array) -> void:
	var m_tronco := malha("res://assets/mata/tronco.glb")
	var aabb_t := m_tronco.get_aabb()
	var comp_t := aabb_t.size.x
	var meio_y := aabb_t.position.y + aabb_t.size.y * 0.5
	var grosso_t := maxf(aabb_t.size.y, aabb_t.size.z) * 0.5
	for tr in lista:
		var a := Vector3(float(tr[0]), float(tr[1]), float(tr[2]))
		var bb := Vector3(float(tr[3]), float(tr[4]), float(tr[5]))
		var L := a.distance_to(bb)
		if L < 0.3:
			continue
		var d := (bb - a) / L
		var lado := d.cross(Vector3.UP).normalized()
		var cima := lado.cross(d).normalized()
		var g := float(tr[6]) / grosso_t
		var bas := Basis(d * (L / comp_t), cima * g, lado * g)
		var meio := (a + bb) * 0.5
		var no := MeshInstance3D.new()
		no.mesh = m_tronco
		no.transform = Transform3D(bas, meio - cima * meio_y * g)
		no.visibility_range_end = 160.0
		_alcances.append([no, 0.0, 160.0])
		add_child(no)
		var corpo := StaticBody3D.new()
		var cs := CollisionShape3D.new()
		var cil := CylinderShape3D.new()
		cil.radius = maxf(0.15, float(tr[6]))
		cil.height = L
		cs.shape = cil
		corpo.add_child(cs)
		corpo.transform = Transform3D(Basis(Quaternion(Vector3.UP, d)), meio)
		add_child(corpo)
		var rec := {"tipo": "tronco", "item": "madeira", "pos": meio, "vida": 70.0, "max": 70.0, "rend": 14.0, "no": no, "corpo": corpo, "volta": 0.0}
		corpo.set_meta("recurso", recursos.size())
		recursos.append(rec)


func _esfera(p: Vector3, raio: float) -> StaticBody3D:
	var chave := "e%.2f" % raio
	if not _formas.has(chave):
		var s := SphereShape3D.new()
		s.radius = raio
		_formas[chave] = s
	var corpo := StaticBody3D.new()
	corpo.collision_layer = 2   # a mira pega, o corpo passa
	corpo.collision_mask = 0
	var cs := CollisionShape3D.new()
	cs.shape = _formas[chave]
	corpo.add_child(cs)
	corpo.position = p
	add_child(corpo)
	return corpo


## coisas soltas no chão (E pega): pedra, galho, cogumelo e tufo de fibra, cada tipo com uma malhinha feita aqui
func _soltos(lista: Array) -> void:
	var cores := {"pedra": Color(0.42, 0.4, 0.37), "galho": Color(0.36, 0.25, 0.15), "cogumelo": Color(0.78, 0.7, 0.58), "fibra": Color(0.42, 0.52, 0.24)}
	for k in cores:
		var m: PrimitiveMesh
		match k:
			"pedra":
				var sm := SphereMesh.new()
				sm.radius = 0.16
				sm.height = 0.2
				sm.radial_segments = 8
				sm.rings = 4
				m = sm
			"galho":
				var cm := CylinderMesh.new()
				cm.top_radius = 0.025
				cm.bottom_radius = 0.035
				cm.height = 0.9
				cm.radial_segments = 5
				cm.rings = 1
				m = cm
			"cogumelo":
				var cm2 := CylinderMesh.new()
				cm2.top_radius = 0.09
				cm2.bottom_radius = 0.03
				cm2.height = 0.12
				cm2.radial_segments = 8
				cm2.rings = 1
				m = cm2
			_:
				var cm3 := CylinderMesh.new()
				cm3.top_radius = 0.12
				cm3.bottom_radius = 0.02
				cm3.height = 0.35
				cm3.radial_segments = 6
				cm3.rings = 1
				m = cm3
		var mt := StandardMaterial3D.new()
		mt.albedo_color = cores[k]
		mt.roughness = 0.95
		m.material = mt
		malhas["solto:" + k] = m
	var item := {"pedra": "pedra", "galho": "madeira", "cogumelo": "cogumelo", "fibra": "fibra"}
	var qtd := {"pedra": 3, "galho": 4, "cogumelo": 1, "fibra": 4}
	for p in lista:
		var k: String = str(p[5])
		if not cores.has(k):
			continue
		var pp := Vector3(float(p[0]), float(p[1]), float(p[2]))
		var bas := Basis(Vector3.UP, float(p[4]))
		var y := 0.07
		if k == "galho":
			bas = bas * Basis(Vector3.RIGHT, PI / 2.0)
			y = 0.04
		elif k == "fibra":
			y = 0.17
		var ins := _instancia("solto:" + k, Transform3D(bas.scaled(Vector3.ONE * clampf(float(p[3]), 0.7, 1.4)), pp + Vector3(0, y, 0)), 0.0, 60.0, false, 32.0)
		var corpo := _esfera(pp + Vector3(0, 0.15, 0), 0.4)
		var rec := {"tipo": "solto", "nome": k, "item": item[k], "pos": pp, "vida": 1.0, "max": 1.0, "rend": float(qtd[k]),
			"inst": [ins], "corpo": corpo, "volta": 0.0}
		corpo.set_meta("recurso", recursos.size())
		recursos.append(rec)


# ---------------------------------------------------------------- saque
## gavetas, armários, geladeiras, cofres e baús das casas, prédios, vila, sítios e porto (os mesmos do jogo antigo)
func _caixas(o: Dictionary) -> void:
	var nomes := {"gaveta": "as gavetas", "guardaRoupa": "o guarda-roupa", "armario": "o armário", "arquivo": "o arquivo",
		"caixas": "as caixas", "geladeira": "a geladeira", "prateleira": "a prateleira", "mala": "a mala", "cofre": "o cofre",
		"balcao": "o balcão", "caixaFerr": "a caixa de ferramentas", "freezer": "o freezer", "armarioMed": "o armário de remédios",
		"bolsa": "a bolsa", "carrinho": "o carrinho", "portaMalas": "o porta-malas", "armarioArmas": "o armário de armas",
		"armarioMetal": "o armário de metal", "painel": "o painel", "mesa": "a mesa"}
	for c in o.get("conts", []):
		var p := Vector3(float(c["x"]), float(c["y"]), float(c["z"]))
		var hw := float(c.get("hw", 0.4))
		var hd := float(c.get("hd", 0.3))
		var hh := float(c.get("h", 0.8))
		_caixa_nova(p, Vector3(hw * 2.0 + 0.1, hh + 0.05, hd * 2.0 + 0.1), float(c.get("yaw", 0.0)),
			"Revistar " + str(nomes.get(str(c["tipo"]), "o móvel")), str(c.get("tabela", "")))
	for it in o.get("inter", []):
		var p2 := Vector3(float(it["x"]), float(it["y"]), float(it["z"]))
		match str(it["kind"]):
			"bau":
				_caixa_nova(p2, Vector3(1.2, 1.2, 1.2), 0.0, str(it.get("label", "Revistar")), str(it.get("tabela", "")))
			"agua":
				var corpo := StaticBody3D.new()
				corpo.collision_layer = 2
				corpo.collision_mask = 0
				var cs := CollisionShape3D.new()
				var bs := BoxShape3D.new()
				bs.size = Vector3(1.6, 1.4, 1.6)
				cs.shape = bs
				cs.position.y = 0.7
				corpo.add_child(cs)
				corpo.position = p2
				add_child(corpo)
				corpo.set_meta("agua", aguas.size())
				aguas.append({"pos": p2, "nome": str(it.get("label", "Água"))})


func _caixa_nova(p: Vector3, tam: Vector3, yaw: float, nome: String, tabela: String) -> void:
	var corpo := StaticBody3D.new()
	corpo.collision_layer = 2
	corpo.collision_mask = 0
	var cs := CollisionShape3D.new()
	var bs := BoxShape3D.new()
	bs.size = tam
	cs.shape = bs
	cs.position.y = tam.y * 0.5
	corpo.add_child(cs)
	corpo.transform = Transform3D(Basis(Vector3.UP, yaw), p)
	add_child(corpo)
	corpo.set_meta("caixa", caixas.size())
	caixas.append({"corpo": corpo, "pos": p, "volta": 0.0, "cheia": true, "nome": nome, "tabela": tabela})


## um golpe num recurso: devolve [item, quantidade] (vazio se nada)
func bater(i: int, dano: float, fator: float) -> Array:
	var r: Dictionary = recursos[i]
	if r["vida"] <= 0.0:
		return []
	r["vida"] -= dano * fator
	var q := int(round(r["rend"] * fator))
	if r["tipo"] == "planta" or r["tipo"] == "solto":
		q = int(r["rend"])
		r["vida"] = 0.0
	if r["vida"] <= 0.0:
		if r["tipo"] != "planta" and r["tipo"] != "solto":
			q += int(r["rend"])
		_acabou(i)
	return [r["item"], maxi(q, 1)]


func _acabou(i: int) -> void:
	var r: Dictionary = recursos[i]
	r["volta"] = 300.0 if r["tipo"] == "planta" or r["tipo"] == "solto" else 600.0
	var corpo: StaticBody3D = r["corpo"]
	corpo.process_mode = Node.PROCESS_MODE_DISABLED
	for c in corpo.get_children():
		(c as CollisionShape3D).disabled = true
	esconder(r)
	_voltando.append(i)


## revista um móvel: o que tem dentro sai da tabela de saque dele no jogo antigo
func revistar(i: int) -> Array:
	var c: Dictionary = caixas[i]
	if not c["cheia"]:
		return []
	c["cheia"] = false
	c["volta"] = 900.0
	_vazias.append(i)
	var achou := {}
	var tab: String = c["tabela"]
	if loot_cid.has(tab):
		for e in loot_cid[tab]:
			if rng.randf() < float(e[1]):
				_juntar(achou, str(e[0]), rng.randi_range(int(e[2]), int(e[3])))
	elif loot.has(tab):
		for e in loot[tab]:
			if rng.randf() < float(e[3]):
				_juntar(achou, str(e[0]), rng.randi_range(int(e[1]), int(e[2])))
	else:
		for e in [["pano", 1, 3, 0.5], ["sucata", 1, 3, 0.5], ["lata", 1, 1, 0.25], ["agua", 1, 1, 0.25], ["bandagem", 1, 1, 0.15]]:
			if rng.randf() < float(e[3]):
				_juntar(achou, str(e[0]), rng.randi_range(int(e[1]), int(e[2])))
	var L := []
	for k in achou:
		L.append([k, achou[k]])
	return L


func _juntar(achou: Dictionary, item: String, n: int) -> void:
	var id: String = PARECIDO.get(item, item)
	if not Dados.ITENS.has(id) or n <= 0:
		return
	achou[id] = achou.get(id, 0) + n


## o que acabou volta depois de um tempo (árvore e pedra em 10 min, planta e coisa do chão em 5, móvel revistado em 15)
func _process(dt: float) -> void:
	if not _voltando.is_empty():
		var fica := []
		for i in _voltando:
			var r: Dictionary = recursos[i]
			r["volta"] -= dt
			if r["volta"] > 0.0:
				fica.append(i)
				continue
			r["vida"] = r["max"]
			var corpo: StaticBody3D = r["corpo"]
			for c in corpo.get_children():
				(c as CollisionShape3D).disabled = false
			corpo.process_mode = Node.PROCESS_MODE_INHERIT
			mostrar(r)
		_voltando = fica
	if not _vazias.is_empty():
		var fica2 := []
		for i in _vazias:
			var c: Dictionary = caixas[i]
			c["volta"] -= dt
			if c["volta"] > 0.0:
				fica2.append(i)
			else:
				c["cheia"] = true
		_vazias = fica2
