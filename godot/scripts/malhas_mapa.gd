class_name MalhasMapa
extends Node3D
## Os prédios e tudo o que é fixo no mapa (casas da cidade, da vila e dos sítios com o lado de dentro, os quarteirões do
## Morro do Sabiá e da Cidade Alta, ruas e calçadas da cidade, objetos da rua, metrô, ferrovia, trem, pontes, cais, torre,
## Base Militar e as árvores gigantes) e as peças do kit nas fachadas e nos telhados da cidade (calhas, ar-condicionado,
## caixas d'água, antenas, barracos, portas de enrolar, tambores, caçambas e os fios), tirados do jogo antigo
## (tools/exportar). Cada malha vem com a cor de cada vértice, o quanto aquele ponto é "lado de dentro" (some a luz do céu)
## e o brilho; sem textura, o shader põe uma textura de detalhe por cima para não ficar liso. Prédio tem duas versões:
## perto (com o lado de dentro) e longe (só a casca).

const PASTA := "res://dados/mapa/malhas/"
var mat: ShaderMaterial
var nos := []          # {mi, grupo, lod, alc}
var n_vertices := 0
static var _mats := {}
static var _detalhe: Array = []


func montar() -> void:
	mat = material("", false, false, Color(1, 1, 1), 0.0)
	for g in ["estaticos", "predios", "bairros", "kit"]:
		_grupo(g)


## lê uma malha do arquivo (posição, cor + lado de dentro, normal, UV quando tem, brilho quando acende, índices)
static func ler_malha(f: FileAccess, r: Dictionary) -> ArrayMesh:
	f.seek(int(r["off"]))
	var z := f.get_buffer(int(r["tz"]))
	var bruto := z.decompress(int(r["t"]), FileAccess.COMPRESSION_DEFLATE)
	var nu := int(r["nu"])
	var ni := int(r["ni"])
	var o := 0
	var arr := []
	arr.resize(Mesh.ARRAY_MAX)
	arr[Mesh.ARRAY_VERTEX] = _como(TYPE_PACKED_VECTOR3_ARRAY, bruto.slice(o, o + nu * 12), 12)
	o += nu * 12
	arr[Mesh.ARRAY_COLOR] = _cores(bruto.slice(o, o + nu * 4), nu)
	o += nu * 4
	arr[Mesh.ARRAY_NORMAL] = _como(TYPE_PACKED_VECTOR3_ARRAY, bruto.slice(o, o + nu * 12), 12)
	o += nu * 12
	if bool(r["uv"]):
		arr[Mesh.ARRAY_TEX_UV] = _como(TYPE_PACKED_VECTOR2_ARRAY, bruto.slice(o, o + nu * 8), 8)
		o += nu * 8
	if bool(r.get("br", false)):
		arr[Mesh.ARRAY_TEX_UV2] = _como(TYPE_PACKED_VECTOR2_ARRAY, bruto.slice(o, o + nu * 8), 8)
		o += nu * 8
	arr[Mesh.ARRAY_INDEX] = bruto.slice(o, o + ni * 4).to_int32_array()
	var m := ArrayMesh.new()
	m.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arr)
	return m


## bytes crus (float32) viram PackedVector3Array/PackedVector2Array/PackedColorArray sem laço: monta o cabeçalho do
## formato do Godot (tipo + quantidade) e decodifica
static func _como(tipo: int, dados: PackedByteArray, tam: int) -> Variant:
	var cab := PackedByteArray()
	cab.resize(8)
	cab.encode_u32(0, tipo)
	cab.encode_u32(4, dados.size() / tam)
	cab.append_array(dados)
	return bytes_to_var(cab)


## cores de 8 bits (RGBA) viram PackedColorArray sem laço: uma imagem RGBA8 convertida para RGBA em float
static func _cores(b: PackedByteArray, n: int) -> Variant:
	var w := mini(n, 4096)
	var h := (n + w - 1) / w
	if b.size() < w * h * 4:
		b.resize(w * h * 4)
	var img := Image.create_from_data(w, h, false, Image.FORMAT_RGBA8, b)
	img.convert(Image.FORMAT_RGBAF)
	return _como(TYPE_PACKED_COLOR_ARRAY, img.get_data().slice(0, n * 16), 16)


func _grupo(nome: String) -> void:
	var idx_txt := FileAccess.get_file_as_string(PASTA + nome + ".json")
	if idx_txt == "":
		push_warning("malhas do mapa: falta " + nome)
		return
	var indice: Array = JSON.parse_string(idx_txt)
	var f := FileAccess.open(PASTA + nome + ".bin", FileAccess.READ)
	for r in indice:
		var mi := MeshInstance3D.new()
		mi.mesh = ler_malha(f, r)
		var tex := str(r.get("tex", ""))
		mi.material_override = mat if tex == "" else material(tex, false, false, Color(1, 1, 1), 0.0)
		n_vertices += int(r["nu"])
		if r.has("xf"):
			var xf: Array = r["xf"]
			mi.transform = Transform3D(Basis(Vector3.UP, float(xf[2])), Vector3(float(xf[0]), 0.0, float(xf[1])))
		elif r.has("pos"):
			var pp: Array = r["pos"]
			mi.position = Vector3(float(pp[0]), float(pp[1]), float(pp[2]))
		# perto e longe (os prédios), base, detalhe e longe (morro e Cidade Alta), peças grandes e pequenas do kit
		var lod: String = str(r.get("lod", ""))
		var alc := Vector2(0, 0)
		match lod:
			"perto":
				alc = Vector2(0, 80)
			"longe":
				alc = Vector2(80, 0)
			"base":
				alc = Vector2(0, 170)
			"detalhe":
				alc = Vector2(0, 100)
			"kit":
				alc = Vector2(0, 150)
			"kit_peq":
				alc = Vector2(0, 70)
		if nome == "bairros" and lod == "longe":
			alc = Vector2(170, 0)
		if str(r.get("nome", "")).begins_with("gigante"):
			alc = Vector2(0, 260)
		mi.visibility_range_begin = alc.x
		mi.visibility_range_end = alc.y
		mi.visibility_range_begin_margin = 6.0
		mi.visibility_range_end_margin = 6.0
		if lod == "detalhe" or lod == "kit_peq":
			mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		add_child(mi)
		nos.append({"mi": mi, "grupo": nome, "lod": lod, "alc": alc})


## gráficos baixo/médio/alto: o "perto" dos prédios e o detalhe dos bairros vão mais longe ou mais perto
func alcance(k: float) -> void:
	for n in nos:
		var mi: MeshInstance3D = n["mi"]
		var a: Vector2 = n["alc"]
		mi.visibility_range_begin = a.x * k
		mi.visibility_range_end = a.y * k


## o material das malhas do mapa e dos objetos 3D: cor de cada vértice (em sRGB) vezes a textura (quando tem) e a cor da
## peça; "lado de dentro" tira a luz do céu; brilho acende (luminária, letreiro). Sem textura, um detalhe de reboco e
## sujeira nos três eixos tira a cara de caixa lisa. "lote": nos objetos em MultiMesh, o escuro de dentro vem de cada um.
static func material(tex: String, repete: bool, dois_lados: bool, cor: Color, brilho: float, lote := false) -> ShaderMaterial:
	var chave := "%s|%s|%s|%s|%.2f|%s" % [tex, repete, dois_lados, cor.to_html(false), brilho, lote]
	if _mats.has(chave):
		return _mats[chave]
	var com_tex := tex != "" and ResourceLoader.exists(tex)
	var codigo := "shader_type spatial;\nrender_mode diffuse_burley, specular_schlick_ggx%s;\n" % (", cull_disabled" if dois_lados else "")
	if com_tex:
		codigo += "uniform sampler2D tex : source_color, filter_linear_mipmap_anisotropic, %s;\n" % ("repeat_enable" if repete else "repeat_disable")
	else:
		codigo += "uniform sampler2D detalhe : filter_linear_mipmap, repeat_enable;\nuniform sampler2D detalhe2 : filter_linear_mipmap, repeat_enable;\n"
	codigo += """uniform vec3 cor = vec3(1.0);
uniform float brilho_extra = 0.0;
varying vec3 wpos;
varying vec3 wnrm;
varying float interior;
varying float brilho;

vec3 srgb_lin(vec3 c) {
	return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(vec3(0.04045), c));
}

void vertex() {
	brilho = UV2.x + brilho_extra;
	interior = COLOR.a;
	%s
	wpos = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
	wnrm = normalize((MODEL_MATRIX * vec4(NORMAL, 0.0)).xyz);
}

void fragment() {
	vec3 c = srgb_lin(COLOR.rgb) * cor;
	%s
	ALBEDO = c;
	ROUGHNESS = 0.88;
	SPECULAR = 0.35;
	// lado de dentro: o céu não ilumina (fica escuro como numa sala fechada)
	AO = 1.0 - 0.82 * interior;
	AO_LIGHT_AFFECT = 0.15 * interior;
	EMISSION = c * brilho * 1.5;
}
""" % ["interior = max(interior, INSTANCE_CUSTOM.x);" if lote else "",
		"c *= texture(tex, UV).rgb;" if com_tex else """vec3 bw = pow(abs(wnrm), vec3(4.0));
	bw /= max(bw.x + bw.y + bw.z, 0.001);
	float d = texture(detalhe, wpos.zy * 0.45).r * bw.x + texture(detalhe, wpos.xz * 0.45).r * bw.y + texture(detalhe, wpos.xy * 0.45).r * bw.z;
	float d2 = texture(detalhe2, wpos.zy * 0.08).r * bw.x + texture(detalhe2, wpos.xz * 0.08).r * bw.y + texture(detalhe2, wpos.xy * 0.08).r * bw.z;
	c *= mix(0.78, 1.12, d) * mix(0.85, 1.08, d2);"""]
	var sh := Shader.new()
	sh.code = codigo
	var m := ShaderMaterial.new()
	m.shader = sh
	m.set_shader_parameter("cor", Vector3(cor.r, cor.g, cor.b))
	m.set_shader_parameter("brilho_extra", brilho)
	if com_tex:
		m.set_shader_parameter("tex", load(tex))
	else:
		if _detalhe.is_empty():
			_detalhe = [_ruido(11, 0.08, 3), _ruido(23, 0.02, 4)]
		m.set_shader_parameter("detalhe", _detalhe[0])
		m.set_shader_parameter("detalhe2", _detalhe[1])
	_mats[chave] = m
	return m


static func _ruido(semente: int, freq: float, oitavas: int) -> NoiseTexture2D:
	var nt := NoiseTexture2D.new()
	nt.width = 256
	nt.height = 256
	nt.seamless = true
	nt.generate_mipmaps = true
	var fn := FastNoiseLite.new()
	fn.seed = semente
	fn.frequency = freq
	fn.fractal_octaves = oitavas
	nt.noise = fn
	return nt
