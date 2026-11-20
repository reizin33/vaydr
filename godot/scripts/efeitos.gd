class_name Efeitos
extends Node3D
## Lascas de madeira, faíscas e pó de pedra, folhas e sangue: partículas curtas no ponto do golpe.

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
