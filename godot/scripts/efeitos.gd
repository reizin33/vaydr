class_name Efeitos
extends Node3D
## Lascas de madeira, faíscas e pó de pedra, folhas e sangue: partículas curtas no ponto do golpe. E os efeitos dos zumbis (etapa
## 5): as faíscas do tiro no capacete, o anel do grito do gritador e a nuvem de gás do inchado (machuca e faz tossir quem está
## dentro; a máscara de gás protege).

var mats := {}


func _mat(cor: Color, brilho := false) -> StandardMaterial3D:
	var k := cor.to_html() + str(brilho)
	if mats.has(k):
		return mats[k]
	var m := StandardMaterial3D.new()
	m.albedo_color = cor
	m.roughness = 0.9
	if brilho:
		m.emission_enabled = true
		m.emission = cor
		m.emission_energy_multiplier = 2.0
	mats[k] = m
	return m


func _jato(p: Vector3, n: Vector3, cor: Color, qtd: int, tam: float, vel: float, grav: float, vida := 0.7) -> void:
	var c := CPUParticles3D.new()
	c.one_shot = true
	c.emitting = false
	c.amount = qtd
	c.lifetime = vida
	c.explosiveness = 0.95
	c.direction = n
	c.spread = 55.0
	c.initial_velocity_min = vel * 0.5
	c.initial_velocity_max = vel
	c.gravity = Vector3(0, -grav, 0)
	c.scale_amount_min = 0.6
	c.scale_amount_max = 1.2
	var bm := BoxMesh.new()
	bm.size = Vector3(tam, tam * 0.5, tam * 1.4)
	bm.material = _mat(cor)
	c.mesh = bm
	add_child(c)
	c.global_position = p + n * 0.05
	c.emitting = true
	get_tree().create_timer(vida + 0.5).timeout.connect(c.queue_free)


func lascas(p: Vector3, n: Vector3, item: String) -> void:
	match item:
		"madeira":
			_jato(p, n, Color(0.62, 0.45, 0.28), 10, 0.05, 3.2, 9.0)
		"pedra":
			_jato(p, n, Color(0.6, 0.58, 0.55), 12, 0.035, 3.8, 9.0)
		_:
			_jato(p, n, Color(0.3, 0.45, 0.18), 10, 0.04, 1.8, 4.0, 1.0)


func sangue(p: Vector3, n: Vector3) -> void:
	_jato(p, n, Color(0.35, 0.03, 0.02), 14, 0.03, 2.4, 9.0, 0.6)


func faiscas(p: Vector3) -> void:
	var c := CPUParticles3D.new()
	c.one_shot = true
	c.emitting = false
	c.amount = 12
	c.lifetime = 0.35
	c.explosiveness = 1.0
	c.direction = Vector3.UP
	c.spread = 80.0
	c.initial_velocity_min = 2.0
	c.initial_velocity_max = 4.5
	c.gravity = Vector3(0, -9.0, 0)
	var bm := BoxMesh.new()
	bm.size = Vector3(0.015, 0.015, 0.05)
	bm.material = _mat(Color(1.0, 0.78, 0.35), true)
	c.mesh = bm
	add_child(c)
	c.global_position = p
	c.emitting = true
	get_tree().create_timer(1.0).timeout.connect(c.queue_free)


## o clarão da boca da arma: uma luz rápida, faíscas para a frente e um pouco de fumaça (grande: espingarda e rifle)
func boca(p: Vector3, d: Vector3, grande := false) -> void:
	var luz := OmniLight3D.new()
	luz.light_color = Color(1.0, 0.78, 0.45)
	luz.light_energy = 4.0 if grande else 2.6
	luz.omni_range = 7.0 if grande else 5.0
	luz.shadow_enabled = false
	add_child(luz)
	luz.global_position = p
	get_tree().create_timer(0.06).timeout.connect(luz.queue_free)
	var c := CPUParticles3D.new()
	c.one_shot = true
	c.emitting = false
	c.amount = 12 if grande else 7
	c.lifetime = 0.12
	c.explosiveness = 1.0
	c.direction = d
	c.spread = 14.0
	c.initial_velocity_min = 3.0
	c.initial_velocity_max = 7.0
	c.gravity = Vector3.ZERO
	var bm := BoxMesh.new()
	bm.size = Vector3(0.03, 0.03, 0.09) * (1.4 if grande else 1.0)
	bm.material = _mat(Color(1.0, 0.72, 0.32), true)
	c.mesh = bm
	add_child(c)
	c.global_position = p
	c.emitting = true
	get_tree().create_timer(0.6).timeout.connect(c.queue_free)
	var f := CPUParticles3D.new()
	f.one_shot = true
	f.emitting = false
	f.amount = 5
	f.lifetime = 1.2
	f.explosiveness = 0.9
	f.direction = d + Vector3(0, 0.3, 0)
	f.spread = 25.0
	f.initial_velocity_min = 0.3
	f.initial_velocity_max = 0.9
	f.gravity = Vector3(0, 0.25, 0)
	f.scale_amount_min = 0.8
	f.scale_amount_max = 1.6
	var sm := SphereMesh.new()
	sm.radius = 0.06
	sm.height = 0.12
	sm.radial_segments = 6
	sm.rings = 3
	var mf := StandardMaterial3D.new()
	mf.albedo_color = Color(0.7, 0.7, 0.68, 0.25)
	mf.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mf.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	sm.material = mf
	f.mesh = sm
	add_child(f)
	f.global_position = p
	f.emitting = true
	get_tree().create_timer(1.8).timeout.connect(f.queue_free)


## o rastro da bala do rifle (some em um instante)
func rastro(a: Vector3, b: Vector3) -> void:
	var L := a.distance_to(b)
	if L < 1.0:
		return
	var mi := MeshInstance3D.new()
	var bm := BoxMesh.new()
	bm.size = Vector3(0.012, 0.012, L)
	var m := StandardMaterial3D.new()
	m.albedo_color = Color(1.0, 0.9, 0.6, 0.55)
	m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	bm.material = m
	mi.mesh = bm
	mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	add_child(mi)
	mi.global_position = (a + b) * 0.5
	mi.look_at(b, Vector3.UP if absf((b - a).normalized().y) < 0.98 else Vector3.RIGHT)
	var tw := create_tween()
	tw.tween_property(m, "albedo_color:a", 0.0, 0.15)
	tw.tween_callback(mi.queue_free)


## a explosão da bomba caseira: o clarão, a bola de fogo, a fumaça escura, pedrinhas e os anéis no chão
func explosao(p: Vector3) -> void:
	var luz := OmniLight3D.new()
	luz.light_color = Color(1.0, 0.62, 0.3)
	luz.light_energy = 9.0
	luz.omni_range = 22.0
	add_child(luz)
	luz.global_position = p + Vector3(0, 1.0, 0)
	var tl := create_tween()
	tl.tween_property(luz, "light_energy", 0.0, 0.45)
	tl.tween_callback(luz.queue_free)
	var fogo := CPUParticles3D.new()
	fogo.one_shot = true
	fogo.emitting = false
	fogo.amount = 46
	fogo.lifetime = 0.7
	fogo.explosiveness = 1.0
	fogo.direction = Vector3.UP
	fogo.spread = 85.0
	fogo.initial_velocity_min = 3.5
	fogo.initial_velocity_max = 10.0
	fogo.gravity = Vector3(0, -2.0, 0)
	fogo.scale_amount_min = 1.0
	fogo.scale_amount_max = 2.6
	var sm := SphereMesh.new()
	sm.radius = 0.16
	sm.height = 0.32
	sm.radial_segments = 8
	sm.rings = 4
	sm.material = _mat(Color(1.0, 0.55, 0.15), true)
	fogo.mesh = sm
	add_child(fogo)
	fogo.global_position = p + Vector3(0, 0.4, 0)
	fogo.emitting = true
	get_tree().create_timer(1.5).timeout.connect(fogo.queue_free)
	var fum := CPUParticles3D.new()
	fum.one_shot = true
	fum.emitting = false
	fum.amount = 22
	fum.lifetime = 2.6
	fum.explosiveness = 0.85
	fum.emission_shape = CPUParticles3D.EMISSION_SHAPE_SPHERE
	fum.emission_sphere_radius = 0.8
	fum.direction = Vector3.UP
	fum.spread = 40.0
	fum.initial_velocity_min = 1.0
	fum.initial_velocity_max = 3.0
	fum.gravity = Vector3(0, 0.3, 0)
	fum.scale_amount_min = 2.0
	fum.scale_amount_max = 4.0
	var sf := SphereMesh.new()
	sf.radius = 0.25
	sf.height = 0.5
	sf.radial_segments = 8
	sf.rings = 4
	var mf := StandardMaterial3D.new()
	mf.albedo_color = Color(0.16, 0.15, 0.14, 0.5)
	mf.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mf.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	sf.material = mf
	fum.mesh = sf
	add_child(fum)
	fum.global_position = p + Vector3(0, 0.6, 0)
	fum.emitting = true
	get_tree().create_timer(3.5).timeout.connect(fum.queue_free)
	_jato(p + Vector3(0, 0.2, 0), Vector3.UP, Color(0.3, 0.28, 0.26), 16, 0.06, 9.0, 9.8, 1.2)
	anel(p + Vector3(0, 0.3, 0))


## o anel do grito (sobe da cabeça do gritador e some)
func anel(p: Vector3) -> void:
	for k in 2:
		var mi := MeshInstance3D.new()
		var tm := TorusMesh.new()
		tm.inner_radius = 0.42
		tm.outer_radius = 0.5
		var m := StandardMaterial3D.new()
		m.albedo_color = Color(1.0, 0.85, 0.7, 0.55)
		m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		tm.material = m
		mi.mesh = tm
		mi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		add_child(mi)
		mi.global_position = p
		var tw := create_tween().set_parallel(true)
		tw.tween_interval(0.25 * k)
		tw.chain().tween_property(mi, "scale", Vector3.ONE * 4.0, 0.8)
		tw.parallel().tween_property(m, "albedo_color:a", 0.0, 0.8)
		tw.chain().tween_callback(mi.queue_free)


## a coluna de fumaça colorida (a caixa de suprimentos solta fumaça vermelha para dar para achar de longe)
func fumaca(p: Vector3, cor: Color, dur: float) -> Node3D:
	var no := Node3D.new()
	add_child(no)
	no.global_position = p
	var part := CPUParticles3D.new()
	part.amount = 56
	part.lifetime = 7.0
	part.emission_shape = CPUParticles3D.EMISSION_SHAPE_SPHERE
	part.emission_sphere_radius = 0.25
	part.direction = Vector3.UP
	part.spread = 12.0
	part.initial_velocity_min = 1.4
	part.initial_velocity_max = 2.4
	part.gravity = Vector3(0.35, 0.25, 0.1)
	part.damping_min = 0.15
	part.damping_max = 0.3
	part.scale_amount_min = 0.7
	part.scale_amount_max = 1.3
	var cv := Curve.new()
	cv.add_point(Vector2(0.0, 0.35))
	cv.add_point(Vector2(0.4, 1.4))
	cv.add_point(Vector2(1.0, 2.6))
	part.scale_amount_curve = cv
	var gr := Gradient.new()
	gr.set_color(0, Color(cor, 0.62))
	gr.set_color(1, Color(cor.lerp(Color(0.5, 0.45, 0.45), 0.6), 0.0))
	part.color_ramp = gr
	var sm := SphereMesh.new()
	sm.radius = 0.5
	sm.height = 1.0
	sm.radial_segments = 10
	sm.rings = 5
	var m := StandardMaterial3D.new()
	m.vertex_color_use_as_albedo = true
	m.albedo_color = Color(1, 1, 1, 1)
	m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	m.depth_draw_mode = BaseMaterial3D.DEPTH_DRAW_DISABLED
	sm.material = m
	part.mesh = sm
	part.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	no.add_child(part)
	part.emitting = true
	get_tree().create_timer(dur).timeout.connect(func():
		if is_instance_valid(part):
			part.emitting = false
		if is_instance_valid(no):
			get_tree().create_timer(7.5).timeout.connect(no.queue_free))
	return no


## a nuvem de gás do inchado
func gas(p: Vector3, r: float, dur: float) -> void:
	var n := Nuvem.new(get_parent(), r, dur)
	add_child(n)
	n.global_position = p


class Nuvem extends Node3D:
	var main
	var r := 3.4
	var dur := 9.0
	var t := 0.0
	var tick := 0.0
	var tick_cao := 0.0
	var tosse := 0.0
	var part: CPUParticles3D

	func _init(m, raio: float, d: float) -> void:
		main = m
		r = raio
		dur = d

	func _ready() -> void:
		add_to_group("gas")
		part = CPUParticles3D.new()
		part.amount = 44
		part.lifetime = 2.6
		part.emission_shape = CPUParticles3D.EMISSION_SHAPE_SPHERE
		part.emission_sphere_radius = r * 0.65
		part.direction = Vector3.UP
		part.spread = 180.0
		part.initial_velocity_min = 0.05
		part.initial_velocity_max = 0.35
		part.gravity = Vector3(0, 0.12, 0)
		part.scale_amount_min = 1.2
		part.scale_amount_max = 2.4
		var sm := SphereMesh.new()
		sm.radius = 0.5
		sm.height = 1.0
		sm.radial_segments = 10
		sm.rings = 5
		var m := StandardMaterial3D.new()
		m.albedo_color = Color(0.46, 0.56, 0.17, 0.22)
		m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		m.depth_draw_mode = BaseMaterial3D.DEPTH_DRAW_DISABLED
		sm.material = m
		part.mesh = sm
		part.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		add_child(part)
		part.emitting = true

	func _process(dt: float) -> void:
		t += dt
		if t > dur:
			part.emitting = false
			if t > dur + 2.8:
				queue_free()
			return
		tick -= dt
		tosse -= dt
		# o Caramelo dentro da nuvem também se machuca (como no jogo antigo)
		tick_cao -= dt
		if tick_cao <= 0.0:
			tick_cao = 0.8
			var cao = main.get("cao")
			if cao != null and cao.livre() and cao.global_position.distance_to(global_position) < r:
				cao.ferir(3.0, global_position)
		if tick > 0.0:
			return
		tick = 0.25
		var j = main.jogador
		if j == null or not j.vivo or j.global_position.distance_to(global_position) > r:
			return
		var mascara := false
		for lugar in j.inv.roupa:
			if str(j.inv.roupa[lugar].get("id", "")) == "mascaraGas":
				mascara = true
		if mascara:
			return
		j.ferir(1.6, false)
		if tosse <= 0.0:
			tosse = 1.8
			main.sons.tocar("tosse", j.global_position, -2.0)
			main.ui.aviso("Gás! Saia da nuvem verde (a máscara de gás protege)", 2.0)
