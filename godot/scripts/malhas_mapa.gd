class_name MalhasMapa
extends Node3D
## Os prédios e tudo o que é fixo no mapa (casas da cidade, da vila e dos sítios com o lado de dentro, os quarteirões do
## Morro do Sabiá e da Cidade Alta, ruas e calçadas da cidade, objetos da rua, metrô, ferrovia, trem, pontes, cais, torre,
## Base Militar e as árvores gigantes), tirados do jogo antigo (tools/exportar). Cada malha vem com a cor de cada vértice,
## o quanto aquele ponto é "lado de dentro" (some a luz do céu) e o brilho; o shader põe uma textura de detalhe por cima
## para não ficar liso. Prédio tem duas versões: perto (com o lado de dentro) e longe (só a casca).

const PASTA := "res://dados/mapa/malhas/"
const FLAGS := (Mesh.ARRAY_CUSTOM_RGBA8_UNORM << Mesh.ARRAY_FORMAT_CUSTOM0_SHIFT) | (Mesh.ARRAY_CUSTOM_RGBA8_SNORM << Mesh.ARRAY_FORMAT_CUSTOM1_SHIFT)
var mat: ShaderMaterial
var nos := []          # {mi, grupo, lod, alc}
var n_vertices := 0


func montar() -> void:
	mat = _material()
	for g in ["estaticos", "predios", "bairros"]:
		_grupo(g)


func _grupo(nome: String) -> void:
	var idx_txt := FileAccess.get_file_as_string(PASTA + nome + ".json")
	if idx_txt == "":
		push_warning("malhas do mapa: falta " + nome)
		return
	var indice: Array = JSON.parse_string(idx_txt)
	var f := FileAccess.open(PASTA + nome + ".bin", FileAccess.READ)
	for r in indice:
		f.seek(int(r["off"]))
		var z := f.get_buffer(int(r["tz"]))
		var bruto := z.decompress(int(r["t"]), FileAccess.COMPRESSION_DEFLATE)
		var nu := int(r["nu"])
		var ni := int(r["ni"])
		var o := 0
		var pos := bruto.slice(o, o + nu * 12).to_vector3_array()
		o += nu * 12
		var c0 := bruto.slice(o, o + nu * 4)
		o += nu * 4
		var c1 := bruto.slice(o, o + nu * 4)
		o += nu * 4
		if bool(r["uv"]):
			o += nu * 8
		var ids := bruto.slice(o, o + ni * 4).to_int32_array()
		var arr := []
		arr.resize(Mesh.ARRAY_MAX)
		arr[Mesh.ARRAY_VERTEX] = pos
		arr[Mesh.ARRAY_CUSTOM0] = c0
		arr[Mesh.ARRAY_CUSTOM1] = c1
		arr[Mesh.ARRAY_INDEX] = ids
		var m := ArrayMesh.new()
		m.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arr, [], {}, FLAGS)
		var mi := MeshInstance3D.new()
		mi.mesh = m
		mi.material_override = mat
		n_vertices += nu
		if r.has("xf"):
			var xf: Array = r["xf"]
			mi.transform = Transform3D(Basis(Vector3.UP, float(xf[2])), Vector3(float(xf[0]), 0.0, float(xf[1])))
		elif r.has("pos"):
			var pp: Array = r["pos"]
			mi.position = Vector3(float(pp[0]), float(pp[1]), float(pp[2]))
		# perto e longe (os prédios), base, detalhe e longe (morro e Cidade Alta)
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
		if nome == "bairros" and lod == "longe":
			alc = Vector2(170, 0)
		if str(r.get("nome", "")).begins_with("gigante"):
			alc = Vector2(0, 260)
		mi.visibility_range_begin = alc.x
		mi.visibility_range_end = alc.y
		mi.visibility_range_begin_margin = 6.0
		mi.visibility_range_end_margin = 6.0
		if lod == "detalhe":
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


func _material() -> ShaderMaterial:
	var sh := Shader.new()
	sh.code = """
shader_type spatial;
render_mode cull_disabled, diffuse_burley, specular_schlick_ggx;
uniform sampler2D detalhe : filter_linear_mipmap, repeat_enable;
uniform sampler2D detalhe2 : filter_linear_mipmap, repeat_enable;
varying vec3 wpos;
varying vec3 wnrm;
varying float interior;
varying float brilho;

vec3 srgb_lin(vec3 c) {
	return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(vec3(0.04045), c));
}

void vertex() {
	NORMAL = normalize(CUSTOM1.xyz);
	brilho = max(CUSTOM1.w, 0.0) * 127.0 / 40.0;
	interior = CUSTOM0.a;
	COLOR = vec4(CUSTOM0.rgb, 1.0);
	wpos = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
	wnrm = normalize((MODEL_MATRIX * vec4(NORMAL, 0.0)).xyz);
}

void fragment() {
	vec3 c = srgb_lin(COLOR.rgb);
	// textura de detalhe nos três eixos (reboco, sujeira): tira a cara de caixa lisa
	vec3 bw = pow(abs(wnrm), vec3(4.0));
	bw /= max(bw.x + bw.y + bw.z, 0.001);
	float d = texture(detalhe, wpos.zy * 0.45).r * bw.x + texture(detalhe, wpos.xz * 0.45).r * bw.y + texture(detalhe, wpos.xy * 0.45).r * bw.z;
	float d2 = texture(detalhe2, wpos.zy * 0.08).r * bw.x + texture(detalhe2, wpos.xz * 0.08).r * bw.y + texture(detalhe2, wpos.xy * 0.08).r * bw.z;
	c *= mix(0.78, 1.12, d) * mix(0.85, 1.08, d2);
	ALBEDO = c;
	ROUGHNESS = 0.9;
	SPECULAR = 0.35;
	// lado de dentro: o céu não ilumina (fica escuro como numa sala fechada)
	AO = 1.0 - 0.82 * interior;
	AO_LIGHT_AFFECT = 0.15 * interior;
	EMISSION = c * brilho * 1.5;
}
"""
	var m := ShaderMaterial.new()
	m.shader = sh
	m.set_shader_parameter("detalhe", _ruido(11, 0.08, 3))
	m.set_shader_parameter("detalhe2", _ruido(23, 0.02, 4))
	return m


func _ruido(semente: int, freq: float, oitavas: int) -> NoiseTexture2D:
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
