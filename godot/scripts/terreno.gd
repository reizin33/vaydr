class_name Terreno
extends Node3D
## O chão do mapa do VAYDR: o mesmo mapa do jogo antigo, tirado de lá pelos tools/exportar (relevo de 1 m em 961 x 721 m,
## com a Serra Velha a noroeste, a cor do chão de cada lugar, os pisos de asfalto, terra e concreto perto da clareira, o
## quanto cada ponto é mata, o rio, o lago e o mar). As contas de cor dos shaders são em sRGB, como o modo leve
## (Compatibility) espera (ele converte o ALBEDO para luz linear no fim); no modo completo (Forward+) a textura chega em luz
## linear: ela volta para sRGB antes das contas e o resultado vai para luz linear (em_srgb e de_srgb). A malha vai em pedaços de 64 m com quatro níveis de detalhe (1, 2, 4 e 8 m), cada um com uma "saia" na
## borda para não abrir fresta entre pedaços de nível diferente. A colisão é um campo de alturas só.

const PASTA := "res://dados/mapa/"
const PEDACO := 64
const AGUA := -0.9        # nível médio do mar
# lugares do mapa (os mesmos do jogo antigo)
const CLAREIRA := Vector2(0, 0)
const VILA := Vector2(62, -72)
const LAGO := Vector2(66, 104)
const INICIO := Vector2(8, 44)          # onde o jogo começa: no meio da mata, ao sul da clareira
const CIDADE := Rect2(172, -84, 164, 178)

var X0 := -200.0
var Z0 := -340.0
var W := 801
var H := 681
var P := 1.0
var alturas := PackedFloat32Array()
var agua_nivel := PackedFloat32Array()
var agua_tipo := PackedByteArray()
var mar_base := -0.9
var mar_amp := 0.72
var mar_periodo := 12.4   # horas do jogo
var splat_h := 180.0
var mat: ShaderMaterial
var corpo_chao: StaticBody3D
var tex_altura: ImageTexture
var tex_cor: ImageTexture
var tex_mata: ImageTexture
var tex_pisos: ImageTexture
var tex_agua: ImageTexture    # tipo de água em cada metro (0 nada, 1 rio ou lago, 2 mar): minimapa e mapa
var mar: MeshInstance3D
var nivel_mar := -0.9
var normais := PackedVector3Array()


func montar() -> void:
	_carregar()
	_normais()
	mat = _material()
	_malhas()
	_colisao()
	_agua_doce()
	_mar()


func _carregar() -> void:
	var meta: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(PASTA + "mapa.json"))
	X0 = float(meta["X0"])
	Z0 = float(meta["Z0"])
	W = int(meta["W"])
	H = int(meta["H"])
	P = float(meta["P"])
	mar_base = float(meta["mar"]["base"])
	mar_amp = float(meta["mar"]["amp"])
	mar_periodo = float(meta["mar"]["periodo"])
	splat_h = float(meta["splat"]["H"])
	alturas = FileAccess.get_file_as_bytes(PASTA + "relevo.f32").to_float32_array()
	agua_nivel = FileAccess.get_file_as_bytes(PASTA + "agua.f32").to_float32_array()
	agua_tipo = FileAccess.get_file_as_bytes(PASTA + "agua_tipo.u8")
	tex_cor = ImageTexture.create_from_image(Image.create_from_data(W, H, false, Image.FORMAT_RGBA8, FileAccess.get_file_as_bytes(PASTA + "cor.rgba8")))
	tex_mata = ImageTexture.create_from_image(Image.create_from_data(W, H, false, Image.FORMAT_L8, FileAccess.get_file_as_bytes(PASTA + "mata.u8")))
	tex_agua = ImageTexture.create_from_image(Image.create_from_data(W, H, false, Image.FORMAT_L8, agua_tipo))
	var sp := int(meta["splat"]["S"])
	var img_p := Image.create_from_data(sp, sp, false, Image.FORMAT_RGBA8, FileAccess.get_file_as_bytes(PASTA + "pisos.rgba8"))
	img_p.generate_mipmaps()
	tex_pisos = ImageTexture.create_from_image(img_p)
	var img_h := Image.create_from_data(W, H, false, Image.FORMAT_RF, alturas.to_byte_array())
	img_h.convert(Image.FORMAT_RH)
	tex_altura = ImageTexture.create_from_image(img_h)


## altura do chão (a mesma divisão em triângulos da malha: diagonal do canto (i, j) ao (i+1, j+1))
func h(x: float, z: float) -> float:
	var fx := (x - X0) / P
	var fz := (z - Z0) / P
	if fx <= 0.0 or fz <= 0.0 or fx >= W - 1 or fz >= H - 1:
		return alturas[clampi(int(fz), 0, H - 1) * W + clampi(int(fx), 0, W - 1)]
	var i := int(fx)
	var j := int(fz)
	var u := fx - i
	var v := fz - j
	var a := alturas[j * W + i]
	var b := alturas[j * W + i + 1]
	var c := alturas[(j + 1) * W + i]
	var d := alturas[(j + 1) * W + i + 1]
	if v >= u:
		return a + (d - c) * u + (c - a) * v
	return a + (b - a) * u + (d - b) * v


func dentro(x: float, z: float) -> bool:
	return x > X0 + 2.0 and z > Z0 + 2.0 and x < X0 + (W - 3) * P and z < Z0 + (H - 3) * P


## tipo de água no ponto: 0 nada, 1 rio ou lago, 2 mar
func tipo_agua(x: float, z: float) -> int:
	var i := clampi(int(round((x - X0) / P)), 0, W - 1)
	var j := clampi(int(round((z - Z0) / P)), 0, H - 1)
	return agua_tipo[j * W + i]


## nível da água no ponto (ou -999 se não tem água)
func nivel_agua(x: float, z: float) -> float:
	var t := tipo_agua(x, z)
	if t == 2:
		return nivel_mar
	if t == 1:
		var i := clampi(int(round((x - X0) / P)), 0, W - 1)
		var j := clampi(int(round((z - Z0) / P)), 0, H - 1)
		return agua_nivel[j * W + i]
	return -999.0


## o ponto está dentro da água (rio, lago ou mar)?
func na_agua(p: Vector3) -> bool:
	var n := nivel_agua(p.x, p.z)
	return n > -900.0 and p.y < n + 0.2 and h(p.x, p.z) < n


func _normais() -> void:
	normais.resize(W * H)
	for j in H:
		var j0 := maxi(j - 1, 0)
		var j1 := mini(j + 1, H - 1)
		for i in W:
			var i0 := maxi(i - 1, 0)
			var i1 := mini(i + 1, W - 1)
			var dx := (alturas[j * W + i1] - alturas[j * W + i0]) / ((i1 - i0) * P)
			var dz := (alturas[j1 * W + i] - alturas[j0 * W + i]) / ((j1 - j0) * P)
			normais[j * W + i] = Vector3(-dx, 1.0, -dz).normalized()


## malha em pedaços de 64 m, cada um com 4 níveis de detalhe (passo 1, 2, 4 e 8 m)
func _malhas() -> void:
	var niveis := [[1, 0.0, 110.0], [2, 110.0, 230.0], [4, 230.0, 470.0], [8, 470.0, 0.0]]
	var cj := 0
	while cj < H - 1:
		var ci := 0
		while ci < W - 1:
			for nv in niveis:
				var mi := MeshInstance3D.new()
				mi.mesh = _pedaco(ci, cj, int(nv[0]))
				mi.material_override = mat
				mi.visibility_range_begin = nv[1]
				mi.visibility_range_end = nv[2]
				mi.visibility_range_begin_margin = 4.0
				mi.visibility_range_end_margin = 4.0
				mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON if int(nv[0]) <= 2 else GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
				add_child(mi)
			ci += PEDACO
		cj += PEDACO


func _pedaco(ci: int, cj: int, passo: int) -> ArrayMesh:
	var i1 := mini(ci + PEDACO, W - 1)
	var j1 := mini(cj + PEDACO, H - 1)
	var xs := []
	var i := ci
	while i < i1:
		xs.append(i)
		i += passo
	xs.append(i1)
	var zs := []
	var j := cj
	while j < j1:
		zs.append(j)
		j += passo
	zs.append(j1)
	var nx := xs.size()
	var nz := zs.size()
	var vs := PackedVector3Array()
	var ns := PackedVector3Array()
	var ids := PackedInt32Array()
	vs.resize(nx * nz)
	ns.resize(nx * nz)
	for b in nz:
		var jj: int = zs[b]
		for a in nx:
			var ii: int = xs[a]
			vs[b * nx + a] = Vector3(X0 + ii * P, alturas[jj * W + ii], Z0 + jj * P)
			ns[b * nx + a] = normais[jj * W + ii]
	ids.resize((nx - 1) * (nz - 1) * 6)
	var q := 0
	for b in nz - 1:
		for a in nx - 1:
			var p00 := b * nx + a
			var p01 := p00 + nx
			ids[q] = p00
			ids[q + 1] = p01 + 1
			ids[q + 2] = p01
			ids[q + 3] = p00
			ids[q + 4] = p00 + 1
			ids[q + 5] = p01 + 1
			q += 6
	# saia: uma tira para baixo em volta do pedaço (esconde a fresta entre níveis de detalhe)
	if passo > 1:
		var bordas := []
		for a in nx:
			bordas.append(a)
		for b in range(1, nz):
			bordas.append(b * nx + nx - 1)
		for a in range(nx - 2, -1, -1):
			bordas.append((nz - 1) * nx + a)
		for b in range(nz - 2, 0, -1):
			bordas.append(b * nx)
		bordas.append(0)
		var base := vs.size()
		for k in bordas.size():
			var qb: int = bordas[k]
			vs.append(vs[qb] - Vector3(0, 1.5 * passo, 0))
			ns.append(ns[qb])
		for k in bordas.size() - 1:
			var q0: int = bordas[k]
			var q1: int = bordas[k + 1]
			var s0 := base + k
			var s1 := base + k + 1
			ids.append_array(PackedInt32Array([q0, s1, q1, q0, s0, s1, q0, q1, s1, q0, s1, s0]))
	var arr := []
	arr.resize(Mesh.ARRAY_MAX)
	arr[Mesh.ARRAY_VERTEX] = vs
	arr[Mesh.ARRAY_NORMAL] = ns
	arr[Mesh.ARRAY_INDEX] = ids
	var m := ArrayMesh.new()
	m.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arr)
	return m


func _colisao() -> void:
	var corpo := StaticBody3D.new()
	corpo.name = "ChaoColisao"
	corpo.set_meta("chao", true)
	var cs := CollisionShape3D.new()
	var hm := HeightMapShape3D.new()
	hm.map_width = W
	hm.map_depth = H
	var d := PackedFloat32Array()
	d.resize(W * H)
	for k in W * H:
		d[k] = alturas[k] / P
	hm.map_data = d
	cs.shape = hm
	cs.scale = Vector3(P, P, P)
	# o campo de alturas fica centrado na origem do nó: põe o centro no meio do mapa
	cs.position = Vector3(X0 + (W - 1) * P * 0.5, 0.0, Z0 + (H - 1) * P * 0.5)
	corpo.add_child(cs)
	add_child(corpo)
	corpo_chao = corpo


func _material() -> ShaderMaterial:
	var sh := Shader.new()
	sh.code = """
shader_type spatial;
render_mode diffuse_burley, specular_schlick_ggx;
uniform sampler2D mapa_cor : source_color, filter_linear;
uniform sampler2D mapa_mata : filter_linear;
uniform sampler2D mapa_pisos : filter_linear_mipmap;
uniform vec4 mapa_ret;
uniform float pisos_h = 180.0;
uniform sampler2D t_grama : source_color, filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2D n_grama : hint_normal, filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2D t_mata : source_color, filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2D n_mata : hint_normal, filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2D t_folhas : source_color, filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2D t_rocha : source_color, filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2D n_rocha : hint_normal, filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2D ruido : filter_linear_mipmap, repeat_enable;
// cor média de cada textura (lida do mesmo jeito que a textura: o desenho dela fica em volta de 1)
uniform vec3 med_grama : source_color;
uniform vec3 med_mata : source_color;
varying vec3 wpos;
varying vec3 wn;

void vertex() {
	wpos = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
	wn = NORMAL;
}

// as contas de cor deste chão foram acertadas no modo leve, onde a textura chega em sRGB e o ALBEDO é lido em sRGB; no modo
// completo (Forward+) a textura chega em luz linear e o ALBEDO é lido em luz linear: a textura volta para sRGB antes das
// contas e o resultado vai para luz linear no fim (sem isso o asfalto e o concreto saíam quase brancos)
vec3 em_srgb(vec3 c) {
	if (OUTPUT_IS_SRGB) {
		return c;
	}
	c = max(c, vec3(0.0));
	return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c));
}

vec3 de_srgb(vec3 c) {
	if (OUTPUT_IS_SRGB) {
		return c;
	}
	c = max(c, vec3(0.0));
	return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(vec3(0.04045), c));
}

vec3 duas(sampler2D t, vec2 uv, float tam) {
	return mix(em_srgb(texture(t, uv / tam).rgb), em_srgb(texture(t, uv / (tam * 3.7) + 0.37).rgb), 0.35);
}

float lum(vec3 c) {
	return dot(c, vec3(0.3, 0.5, 0.2));
}

void fragment() {
	vec2 w = wpos.xz;
	vec2 um = (w - mapa_ret.xy) / mapa_ret.zw;
	vec4 base = texture(mapa_cor, um);
	base.rgb = em_srgb(base.rgb);
	float mata = texture(mapa_mata, um).r;
	vec4 pis = vec4(0.0);
	if (abs(w.x) < pisos_h && abs(w.y) < pisos_h) {
		pis = texture(mapa_pisos, (w + pisos_h) / (2.0 * pisos_h));
	}
	float n1 = texture(ruido, w * 0.0035).r;
	float n2 = texture(ruido, w * 0.027 + 0.5).r;
	float inc = 1.0 - normalize(wn).y;
	float wr = smoothstep(0.2, 0.42, inc + (n2 - 0.5) * 0.1);
	vec3 tg = duas(t_grama, w, 2.0);
	vec3 tm = duas(t_mata, w, 3.2);
	vec3 tf = duas(t_folhas, w, 2.4);
	vec3 tr = duas(t_rocha, w, 1.8);
	float km = smoothstep(0.35, 0.75, mata);
	// a cor é a do chão do jogo antigo (grama no aberto, chão de mata dentro da mata); a textura dá só o desenho
	float dm = lum(tm) / lum(em_srgb(med_mata));
	float d = mix(lum(tg) / lum(em_srgb(med_grama)), dm, km);
	vec3 c = base.rgb * clamp(mix(1.0, d, 0.6), 0.7, 1.35);
	// manchas de folha seca no chão da mata
	float wf = smoothstep(0.55, 0.75, n2) * mata;
	c = mix(c, tf * 0.7, wf * 0.55);
	// terra batida (estradas de terra, terreiros, a terra que o jogo antigo marcava no chão)
	float terra = max(pis.g, base.a);
	c = mix(c, tm * 0.65, terra);
	// asfalto e concreto (o mapa de pisos do jogo antigo)
	c = mix(c, vec3(0.3 + 0.06 * n2) * (0.85 + 0.15 * dm), pis.r);
	c = mix(c, vec3(0.56 + 0.05 * n2) * (0.9 + 0.1 * dm), pis.b);
	// pedra nas encostas, com a cor dela
	c = mix(c, tr * 0.6, wr * 0.85);
	vec3 nm = mix(texture(n_grama, w / 2.0).rgb, texture(n_mata, w / 3.2).rgb, km);
	nm = mix(nm, texture(n_rocha, w / 1.8).rgb, wr);
	ALBEDO = de_srgb(c * (0.95 + 0.1 * n1));
	NORMAL_MAP = nm;
	NORMAL_MAP_DEPTH = 1.0;
	ROUGHNESS = mix(0.95, 0.85, wr);
}
"""
	var m := ShaderMaterial.new()
	m.shader = sh
	m.set_shader_parameter("mapa_cor", tex_cor)
	m.set_shader_parameter("mapa_mata", tex_mata)
	m.set_shader_parameter("mapa_pisos", tex_pisos)
	m.set_shader_parameter("mapa_ret", Vector4(X0 - 0.5 * P, Z0 - 0.5 * P, W * P, H * P))
	m.set_shader_parameter("pisos_h", splat_h)
	for k in ["grama", "mata", "folhas", "rocha"]:
		m.set_shader_parameter("t_" + k, load("res://assets/tex/%s_cor.jpg" % k))
	# cor média das texturas (medida nos arquivos, em sRGB; lida pela placa de vídeo dá erro em textura comprimida)
	m.set_shader_parameter("med_grama", Color(0.3113, 0.2407, 0.0828))
	m.set_shader_parameter("med_mata", Color(0.4158, 0.3511, 0.2639))
	for k in ["grama", "mata", "rocha"]:
		m.set_shader_parameter("n_" + k, load("res://assets/tex/%s_nrm.jpg" % k))
	var nt := NoiseTexture2D.new()
	nt.width = 256
	nt.height = 256
	nt.seamless = true
	nt.generate_mipmaps = true
	var fn := FastNoiseLite.new()
	fn.seed = 7
	fn.frequency = 0.02
	fn.fractal_octaves = 3
	nt.noise = fn
	m.set_shader_parameter("ruido", nt)
	return m


## rio e lago: um quadrado por célula de água na altura dela (as do lado se encostam; um pouco maiores para cobrir a margem)
func _agua_doce() -> void:
	var vs := PackedVector3Array()
	var ids := PackedInt32Array()
	for j in H:
		for i in W:
			var k := j * W + i
			if agua_tipo[k] != 1:
				continue
			var y := agua_nivel[k]
			var x := X0 + i * P
			var z := Z0 + j * P
			var e := P * 0.5 + 0.35
			var b := vs.size()
			vs.append_array(PackedVector3Array([Vector3(x - e, y, z - e), Vector3(x + e, y, z - e), Vector3(x + e, y, z + e), Vector3(x - e, y, z + e)]))
			ids.append_array(PackedInt32Array([b, b + 1, b + 2, b, b + 2, b + 3]))
	if vs.is_empty():
		return
	var arr := []
	arr.resize(Mesh.ARRAY_MAX)
	arr[Mesh.ARRAY_VERTEX] = vs
	arr[Mesh.ARRAY_INDEX] = ids
	var m := ArrayMesh.new()
	m.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES, arr)
	var mi := MeshInstance3D.new()
	mi.name = "RioLago"
	mi.mesh = m
	mi.material_override = _mat_agua(Color(0.1, 0.2, 0.18), 0.82)
	mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	add_child(mi)


## o mar: um plano grande a leste (até o horizonte) que sobe e desce com a maré; dentro do mapa ele só aparece onde o
## mapa diz que é mar (no rio, no lago e embaixo da terra ele some)
func _mar() -> void:
	var pm := PlaneMesh.new()
	pm.size = Vector2(6000, 6000)
	pm.subdivide_width = 120
	pm.subdivide_depth = 120
	mar = MeshInstance3D.new()
	mar.name = "Mar"
	mar.mesh = pm
	mar.position = Vector3(180.0 + 3000.0, mar_base, 0.0)
	var m := _mat_agua(Color(0.05, 0.16, 0.2), 0.9, true)
	var tipos := agua_tipo.duplicate()
	for k in tipos.size():
		tipos[k] = 255 if tipos[k] == 2 else 0
	m.set_shader_parameter("so_mar", ImageTexture.create_from_image(Image.create_from_data(W, H, false, Image.FORMAT_L8, tipos)))
	m.set_shader_parameter("mapa_ret", Vector4(X0 - 0.5 * P, Z0 - 0.5 * P, W * P, H * P))
	mar.material_override = m
	mar.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	add_child(mar)


func _mat_agua(cor: Color, alfa: float, mar := false) -> ShaderMaterial:
	var sh := Shader.new()
	sh.code = """
shader_type spatial;
render_mode blend_mix, depth_draw_always, cull_disabled, specular_schlick_ggx;
uniform vec3 cor : source_color = vec3(0.08, 0.18, 0.2);
uniform float alfa = 0.85;
uniform sampler2D so_mar : filter_nearest, repeat_disable;
uniform vec4 mapa_ret = vec4(0.0);
uniform bool e_mar = false;
varying vec3 wp;
// a cor acertada no modo leve (sRGB): no modo completo a conta volta para sRGB e o resultado vai para luz linear
vec3 em_srgb(vec3 c) {
	if (OUTPUT_IS_SRGB) {
		return c;
	}
	c = max(c, vec3(0.0));
	return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c));
}
vec3 de_srgb(vec3 c) {
	if (OUTPUT_IS_SRGB) {
		return c;
	}
	c = max(c, vec3(0.0));
	return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(vec3(0.04045), c));
}
void vertex() {
	wp = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
	VERTEX.y += sin(wp.x * 0.11 + wp.z * 0.03 - TIME * 1.1) * 0.06 + sin(wp.x * 0.05 - wp.z * 0.07 - TIME * 0.7) * 0.05;
}
void fragment() {
	if (e_mar) {
		vec2 um = (wp.xz - mapa_ret.xy) / mapa_ret.zw;
		if (um.x > 0.0 && um.y > 0.0 && um.x < 1.0 && um.y < 1.0 && texture(so_mar, um).r < 0.5) {
			discard;
		}
	}
	float fr = pow(1.0 - clamp(dot(NORMAL, VIEW), 0.0, 1.0), 4.0);
	float r = sin(wp.x * 1.7 + TIME * 1.3) * sin(wp.z * 1.9 - TIME * 1.1);
	NORMAL_MAP = normalize(vec3(0.5 + 0.06 * r, 0.5 + 0.06 * cos(wp.x * 1.3 - TIME), 1.0));
	ALBEDO = de_srgb(em_srgb(cor) + fr * 0.2);
	ROUGHNESS = 0.05;
	METALLIC = 0.0;
	SPECULAR = 0.65;
	ALPHA = mix(alfa, 0.97, fr);
}
"""
	var m := ShaderMaterial.new()
	m.shader = sh
	m.set_shader_parameter("cor", cor)
	m.set_shader_parameter("alfa", alfa)
	m.set_shader_parameter("e_mar", mar)
	return m


## maré: o mar sobe e desce (ciclo de ~12 horas do jogo, como no jogo antigo)
func mare(hora: float) -> void:
	nivel_mar = mar_base + mar_amp * sin(TAU * hora / mar_periodo)
	if mar:
		mar.position.y = nivel_mar
