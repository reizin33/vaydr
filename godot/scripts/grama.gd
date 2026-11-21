class_name Grama
extends MultiMeshInstance3D
## Capim denso em volta de quem joga: uma grade de touceiras que anda junto com a câmera (sempre "encaixada" na grade,
## para nada escorregar). Cada touceira sorteia o próprio lugar, giro e tamanho pela posição no mundo, então o capim
## fica sempre igual no mesmo lugar. A altura vem da textura do relevo do mapa. Onde o capim pode nascer vem de
## dados/mapa/grama.u8 (tools/exportar/mascara_grama.py: nada de capim na água, na areia, na estrada, na rua, na calçada
## e dentro das casas); dentro da mata ele fica ralo, em manchas, e some nas encostas de pedra. 6 triângulos por touceira.

var terreno: Terreno
var lado := 100           # touceiras por lado da grade
var passo_g := 0.8        # distância entre touceiras (m)
var mat_g: ShaderMaterial


func _init(t: Terreno) -> void:
	terreno = t


func _ready() -> void:
	name = "Grama"
	cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	mat_g = ShaderMaterial.new()
	mat_g.shader = _shader()
	mat_g.set_shader_parameter("folhas", _textura_folhas())
	mat_g.set_shader_parameter("altura", terreno.tex_altura)
	mat_g.set_shader_parameter("mapa_mata", terreno.tex_mata)
	mat_g.set_shader_parameter("pode", _textura_pode())
	mat_g.set_shader_parameter("ruido", terreno.mat.get_shader_parameter("ruido"))
	mat_g.set_shader_parameter("mapa_ret", Vector4(terreno.X0 - 0.5 * terreno.P, terreno.Z0 - 0.5 * terreno.P, terreno.W * terreno.P, terreno.H * terreno.P))
	mat_g.set_shader_parameter("passo_alt", terreno.P)
	material_override = mat_g
	densidade(lado, passo_g)


## gráficos: baixo usa grade menor (capim só bem perto), alto usa maior
func densidade(n: int, p: float) -> void:
	lado = n
	passo_g = p
	var mm := MultiMesh.new()
	mm.transform_format = MultiMesh.TRANSFORM_3D
	mm.mesh = _touceira()
	mm.instance_count = n * n
	var meio := float(n / 2) * p   # múltiplo exato do passo: cada touceira cai sempre na mesma cela do mundo
	for j in n:
		for i in n:
			mm.set_instance_transform(j * n + i, Transform3D(Basis(), Vector3(i * p - meio, 0, j * p - meio)))
	multimesh = mm
	var r := meio + 2.0
	custom_aabb = AABB(Vector3(-r, -20.0, -r), Vector3(r * 2.0, 120.0, r * 2.0))
	mat_g.set_shader_parameter("passo", p)
	mat_g.set_shader_parameter("raio", meio - 2.0)


func _process(_dt: float) -> void:
	var cam := get_viewport().get_camera_3d()
	if cam == null:
		return
	var c := cam.global_position
	global_position = Vector3(snappedf(c.x, passo_g), 0.0, snappedf(c.z, passo_g))


## três folhas de 0,7 m cruzadas (60° entre elas); a normal aponta para cima para o capim pegar a luz como o chão
func _touceira() -> ArrayMesh:
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	var w := 0.36
	var alt := 0.5
	for k in 3:
		var a := k * PI / 3.0
		var d := Vector3(cos(a), 0, sin(a)) * w
		var v := [Vector3(-d.x, 0, -d.z), Vector3(d.x, 0, d.z), Vector3(d.x, alt, d.z), Vector3(-d.x, alt, -d.z)]
		var uv := [Vector2(0, 1), Vector2(1, 1), Vector2(1, 0), Vector2(0, 0)]
		for idx in [0, 1, 2, 0, 2, 3]:
			st.set_normal(Vector3.UP)
			st.set_uv(uv[idx])
			st.add_vertex(v[idx])
	return st.commit()


## folhas de capim desenhadas por código (verde escuro embaixo, mais claro e amarelado na ponta)
func _textura_folhas() -> ImageTexture:
	var t := 128
	var img := Image.create_empty(t, t, false, Image.FORMAT_RGBA8)
	img.fill(Color(0.2, 0.3, 0.1, 0.0))
	var rng := RandomNumberGenerator.new()
	rng.seed = 42
	for b in 16:
		var x0 := rng.randf_range(10.0, t - 10.0)
		var curva := rng.randf_range(-22.0, 22.0)
		var topo := rng.randf_range(t * 0.05, t * 0.45)
		var larg := rng.randf_range(2.0, 3.6)
		var tom := rng.randf_range(0.0, 1.0)
		var y := float(t - 1)
		while y > topo:
			var f := (float(t - 1) - y) / (float(t - 1) - topo)   # 0 na base, 1 na ponta
			var x := x0 + curva * f * f
			var meia := larg * (1.0 - f * 0.85)
			var cor := Color(0.12, 0.2, 0.06).lerp(Color(0.36, 0.42, 0.16), f * 0.8 + tom * 0.2)
			for px in range(int(x - meia), int(x + meia) + 1):
				if px >= 0 and px < t:
					img.set_pixel(px, int(y), cor)
			y -= 1.0
	img.generate_mipmaps()
	return ImageTexture.create_from_image(img)


## onde o capim pode nascer (uma célula por metro do mapa)
func _textura_pode() -> ImageTexture:
	var dados := FileAccess.get_file_as_bytes("res://dados/mapa/grama.u8")
	if dados.size() != terreno.W * terreno.H:
		dados = PackedByteArray()
		dados.resize(terreno.W * terreno.H)
		dados.fill(255)
	return ImageTexture.create_from_image(Image.create_from_data(terreno.W, terreno.H, false, Image.FORMAT_L8, dados))


func _shader() -> Shader:
	var sh := Shader.new()
	sh.code = """
shader_type spatial;
render_mode cull_disabled, diffuse_burley, specular_disabled;
uniform sampler2D folhas : source_color, filter_linear_mipmap, repeat_disable;
uniform sampler2D altura : filter_linear, repeat_disable;
uniform sampler2D mapa_mata : filter_linear, repeat_disable;
uniform sampler2D pode : filter_linear, repeat_disable;
uniform sampler2D ruido : filter_linear_mipmap, repeat_enable;
uniform vec4 mapa_ret;
uniform float passo_alt = 1.0;
uniform float passo = 0.8;
uniform float raio = 38.0;
varying float tom;

float sorte(vec2 p) {
	return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

vec2 no_mapa(vec2 w) {
	return (w - mapa_ret.xy) / mapa_ret.zw;
}

float h_em(vec2 w) {
	return texture(altura, no_mapa(w)).r;
}

void vertex() {
	vec3 base = (MODEL_MATRIX * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
	vec2 cel = floor(base.xz / passo + 0.5);
	float r1 = sorte(cel);
	float r2 = sorte(cel + 17.3);
	float r3 = sorte(cel + 41.9);
	float r4 = sorte(cel + 73.1);
	vec2 w = cel * passo + (vec2(r1, r2) - 0.5) * passo;
	// onde tem capim: o mapa diz onde pode; na mata, ralo e em manchas; nada nas encostas de pedra
	float h = h_em(w);
	float hx = h_em(w + vec2(passo_alt, 0.0)) - h_em(w - vec2(passo_alt, 0.0));
	float hz = h_em(w + vec2(0.0, passo_alt)) - h_em(w - vec2(0.0, passo_alt));
	float inc = 1.0 - normalize(vec3(-hx, 2.0 * passo_alt, -hz)).y;
	float n1 = texture(ruido, w * 0.0035).r;
	float n2 = texture(ruido, w * 0.027 + 0.5).r;
	float mata = texture(mapa_mata, no_mapa(w)).r;
	float mancha = smoothstep(0.42, 0.62, n1 + (n2 - 0.5) * 0.3);
	float wf = smoothstep(0.58, 0.74, n2) * mata;
	float wr = smoothstep(0.12, 0.24, inc);
	float livre = smoothstep(0.55, 0.95, texture(pode, no_mapa(w)).r);
	float dens = livre * (1.0 - wr) * (1.0 - wf * 0.8) * mix(1.0, 0.12 + 0.6 * mancha, mata);
	float dist = distance(w, CAMERA_POSITION_WORLD.xz);
	float some = 1.0 - smoothstep(raio * 0.7, raio, dist);
	float esc = mix(0.6, 1.15, r4) * some * step(r3 * 0.9 + 0.05, dens);
	float a = r3 * 6.2831;
	vec3 v = VERTEX;
	v.xz = mat2(vec2(cos(a), sin(a)), vec2(-sin(a), cos(a))) * v.xz;
	v *= esc;
	// vento: só a ponta mexe
	float ponta = 1.0 - UV.y;
	v.x += sin(TIME * 1.7 + w.x * 0.35 + w.y * 0.2) * 0.07 * ponta * esc;
	v.z += cos(TIME * 1.3 + w.y * 0.31) * 0.05 * ponta * esc;
	v.xz += w - base.xz;
	v.y += h - base.y - 0.04;
	VERTEX = v;
	tom = r1;
}

void fragment() {
	vec4 c = texture(folhas, UV);
	ALBEDO = c.rgb * mix(vec3(0.8, 0.88, 0.72), vec3(1.08, 1.0, 0.78), tom);
	ALPHA = c.a;
	ALPHA_SCISSOR_THRESHOLD = 0.5;
	ROUGHNESS = 0.95;
	// os dois lados da folha pegam a luz de cima, como o chão (sem lado escuro)
	NORMAL = normalize((VIEW_MATRIX * vec4(0.0, 1.0, 0.0, 0.0)).xyz);
}
"""
	return sh
