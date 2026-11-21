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
