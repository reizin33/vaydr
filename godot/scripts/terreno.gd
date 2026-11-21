class_name Terreno
extends Node3D
## Chão do mapa: uma grade de 2 em 2 m (512 x 512 m), com morros, a clareira do começo, a vila, o lago e as serras na borda.
## A malha é desenhada com um shader que mistura grama, chão de mata, folhas e pedra (texturas da Poly Haven, CC0).

const TAM := 512.0
const PASSO := 2.0
const N := 257
const AGUA := 0.35
const CLAREIRA := Vector2(0, 0)
const VILA := Vector2(70, -55)
const LAGO := Vector2(-80, 70)

var ruido := FastNoiseLite.new()
var ruido2 := FastNoiseLite.new()
var alturas := PackedFloat32Array()
var mat: ShaderMaterial
var corpo_chao: StaticBody3D
var sombra_img: Image     # chão mais escuro debaixo das árvores (sombra de mata, 1 ponto a cada 2 m)


func _init() -> void:
	ruido.seed = 1977
	ruido.noise_type = FastNoiseLite.TYPE_SIMPLEX_SMOOTH
	ruido.frequency = 0.006
	ruido.fractal_octaves = 4
	ruido2.seed = 51
	ruido2.frequency = 0.02
	ruido2.fractal_octaves = 3


## altura do chão (a mesma conta da malha e da colisão)
func h(x: float, z: float) -> float:
	var y := ruido.get_noise_2d(x, z) * 16.0 + ruido2.get_noise_2d(x, z) * 2.5 + 6.0
	# clareira do começo e vila: chão mais plano
	y = lerpf(y, 4.0, _plano(x, z, CLAREIRA, 26.0, 46.0))
	y = lerpf(y, 5.5, _plano(x, z, VILA, 34.0, 58.0))
	# lago: uma bacia abaixo do nível da água
	var dl := Vector2(x, z).distance_to(LAGO)
	y = lerpf(y, -3.0, 1.0 - smoothstep(18.0, 42.0, dl))
	# serras na borda (fecham o mapa)
	var b: float = maxf(absf(x), absf(z))
	y += smoothstep(200.0, 252.0, b) * 38.0
	return y


func _plano(x: float, z: float, c: Vector2, r0: float, r1: float) -> float:
	return 1.0 - smoothstep(r0, r1, Vector2(x, z).distance_to(c))


func montar() -> void:
	alturas.resize(N * N)
	for j in N:
		for i in N:
			var x := -TAM / 2.0 + i * PASSO
			var z := -TAM / 2.0 + j * PASSO
			alturas[j * N + i] = h(x, z)
	_malha()
	_colisao()
	_agua()


func _vtx(i: int, j: int) -> Vector3:
	return Vector3(-TAM / 2.0 + i * PASSO, alturas[j * N + i], -TAM / 2.0 + j * PASSO)


func _malha() -> void:
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	for j in N:
		for i in N:
			var p := _vtx(i, j)
			var hl := alturas[j * N + maxi(i - 1, 0)]
			var hr := alturas[j * N + mini(i + 1, N - 1)]
			var hd := alturas[maxi(j - 1, 0) * N + i]
			var hu := alturas[mini(j + 1, N - 1) * N + i]
			st.set_normal(Vector3(hl - hr, 2.0 * PASSO, hd - hu).normalized())
			st.set_uv(Vector2(p.x, p.z))
			st.add_vertex(p)
	for j in N - 1:
		for i in N - 1:
			var a := j * N + i
			st.add_index(a)
			st.add_index(a + 1)
			st.add_index(a + N)
			st.add_index(a + 1)
			st.add_index(a + N + 1)
			st.add_index(a + N)
	st.generate_tangents()
	var mi := MeshInstance3D.new()
	mi.name = "Chao"
	mi.mesh = st.commit()
	mat = _material()
	mi.material_override = mat
	add_child(mi)


func _material() -> ShaderMaterial:
	var sh := Shader.new()
	sh.code = """
shader_type spatial;
render_mode diffuse_burley, specular_schlick_ggx;
uniform sampler2D t_grama : source_color, filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2D n_grama : hint_normal, filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2D t_mata : source_color, filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2D n_mata : hint_normal, filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2D t_folhas : source_color, filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2D n_folhas : hint_normal, filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2D t_rocha : source_color, filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2D n_rocha : hint_normal, filter_linear_mipmap_anisotropic, repeat_enable;
uniform sampler2D ruido : filter_linear_mipmap, repeat_enable;
uniform sampler2D sombra_mata : filter_linear, repeat_disable;
uniform float agua = 0.35;
uniform float tam_mapa = 512.0;
varying vec3 wn;
varying float wy;
void vertex() {
	wn = NORMAL;
	wy = VERTEX.y;
}
vec3 duas(sampler2D t, vec2 uv, float tam) {
	return mix(texture(t, uv / tam).rgb, texture(t, uv / (tam * 3.7) + 0.37).rgb, 0.35);
}
void fragment() {
	vec2 uv = UV;
	float n1 = texture(ruido, uv * 0.0035).r;
	float n2 = texture(ruido, uv * 0.027 + 0.5).r;
	float inc = 1.0 - wn.y;
	float wr = smoothstep(0.16, 0.3, inc + (n2 - 0.5) * 0.12);
	float wm = smoothstep(0.45, 0.62, n1 + (n2 - 0.5) * 0.3);
	float wf = smoothstep(0.58, 0.74, n2) * (1.0 - wm * 0.5);
	float wb = 1.0 - smoothstep(agua + 0.1, agua + 1.2, wy);
	vec3 c = duas(t_grama, uv, 2.0) * vec3(0.92, 1.12, 0.78);
	vec3 nm = texture(n_grama, uv / 2.0).rgb;
	c = mix(c, duas(t_mata, uv, 3.2), wm);
	nm = mix(nm, texture(n_mata, uv / 3.2).rgb, wm);
	c = mix(c, duas(t_folhas, uv, 2.4) * 0.85, wf);
	nm = mix(nm, texture(n_folhas, uv / 2.4).rgb, wf);
	c = mix(c, duas(t_mata, uv, 3.2) * vec3(0.62, 0.58, 0.52), wb);
	c = mix(c, duas(t_rocha, uv, 1.8) * vec3(0.58, 0.56, 0.53), wr);
	nm = mix(nm, texture(n_rocha, uv / 1.8).rgb, wr);
	float sm = texture(sombra_mata, (uv + tam_mapa * 0.5) / tam_mapa).r;
	c = mix(c * vec3(0.55, 0.58, 0.5), c, sm);
	ALBEDO = c * (0.85 + 0.3 * n1);
	NORMAL_MAP = nm;
	NORMAL_MAP_DEPTH = 1.2;
	ROUGHNESS = mix(0.95, 0.8, wr);
}
"""
	var m := ShaderMaterial.new()
	m.shader = sh
	for k in ["grama", "mata", "folhas", "rocha"]:
		m.set_shader_parameter("t_" + k, load("res://assets/tex/%s_cor.jpg" % k))
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
	m.set_shader_parameter("agua", AGUA)
	m.set_shader_parameter("tam_mapa", TAM)
	sombra_img = Image.create_empty(N, N, false, Image.FORMAT_L8)
	sombra_img.fill(Color(1, 1, 1))
	m.set_shader_parameter("sombra_mata", ImageTexture.create_from_image(sombra_img))
	return m


## escurece o chão em volta de cada árvore (chamado pela mata depois de plantar tudo)
func sombrear(arvores: Array) -> void:
	for a in arvores:
		var p: Vector3 = a[0]
		var r: float = a[1]
		var ci := int(round((p.x + TAM / 2.0) / PASSO))
		var cj := int(round((p.z + TAM / 2.0) / PASSO))
		var n := int(ceil(r / PASSO))
		for dj in range(-n, n + 1):
			for di in range(-n, n + 1):
				var i := ci + di
				var j := cj + dj
				if i < 0 or j < 0 or i >= N or j >= N:
					continue
				var d := Vector2(di, dj).length() * PASSO / r
				if d >= 1.0:
					continue
				var v := sombra_img.get_pixel(i, j).r
				sombra_img.set_pixel(i, j, Color(v * (0.55 + 0.45 * d), 0, 0))
	mat.set_shader_parameter("sombra_mata", ImageTexture.create_from_image(sombra_img))


func _colisao() -> void:
	var corpo := StaticBody3D.new()
	corpo.name = "ChaoColisao"
	corpo.set_meta("chao", true)
	var cs := CollisionShape3D.new()
	var hm := HeightMapShape3D.new()
	hm.map_width = N
	hm.map_depth = N
	var d := PackedFloat32Array()
	d.resize(N * N)
	for k in N * N:
		d[k] = alturas[k] / PASSO
	hm.map_data = d
	cs.shape = hm
	cs.scale = Vector3(PASSO, PASSO, PASSO)
	corpo.add_child(cs)
	add_child(corpo)
	corpo_chao = corpo


func _agua() -> void:
	var mi := MeshInstance3D.new()
	mi.name = "Lago"
	var pm := PlaneMesh.new()
	pm.size = Vector2(110, 110)
	pm.subdivide_width = 20
	pm.subdivide_depth = 20
	mi.mesh = pm
	mi.position = Vector3(LAGO.x, AGUA, LAGO.y)
	var sh := Shader.new()
	sh.code = """
shader_type spatial;
render_mode blend_mix, depth_draw_always, cull_disabled, specular_schlick_ggx;
uniform vec3 cor_rasa : source_color = vec3(0.16, 0.28, 0.27);
uniform vec3 cor_funda : source_color = vec3(0.04, 0.09, 0.11);
void vertex() {
	VERTEX.y += sin(VERTEX.x * 0.6 + TIME * 1.1) * 0.03 + cos(VERTEX.z * 0.5 + TIME * 0.9) * 0.03;
}
void fragment() {
	float fr = pow(1.0 - clamp(dot(NORMAL, VIEW), 0.0, 1.0), 4.0);
	ALBEDO = mix(cor_funda, cor_rasa, 0.35) + fr * 0.25;
	ROUGHNESS = 0.06;
	METALLIC = 0.0;
	SPECULAR = 0.6;
	ALPHA = mix(0.78, 0.95, fr);
}
"""
	var m := ShaderMaterial.new()
	m.shader = sh
	mi.material_override = m
	add_child(mi)


## o ponto está na água do lago?
func na_agua(p: Vector3) -> bool:
	return Vector2(p.x, p.z).distance_to(LAGO) < 50.0 and p.y < AGUA + 0.2 and h(p.x, p.z) < AGUA
