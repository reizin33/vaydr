class_name Zumbi
extends CharacterBody3D
## Zumbi com o modelo e as animações do Mixamo (convertidos do VAYDR antigo): vaga mancando, caça quem vê ou ouve,
## corre à noite (os corredores), bate de perto e cai quando morre. Não sobe em fundação nem passa por parede.

const CENA := "res://assets/personagens/zumbi.glb"
var main: Node
var modelo: Node3D
var anim: AnimationPlayer
var vida := 100.0
var estado := "vaga"
var alvo_vaga := Vector3.ZERO
var tempo := 0.0
var golpe_t := -1.0
var corredor := false
var morto_t := 0.0
var gemido := 0.0
var preso_t := 0.0
var ultima := Vector3.ZERO
var alvo_peca := -1        # peça da base que está no caminho (o zumbi bate nela)
var ponto_peca := Vector3.ZERO
var desvio := 0.0          # preso numa árvore ou pedra: anda de lado um pouco
var lado := 1.0


func _init(m: Node, corre: bool) -> void:
	main = m
	corredor = corre


func _ready() -> void:
	var cs := CollisionShape3D.new()
	var cap := CapsuleShape3D.new()
	cap.radius = 0.32
	cap.height = 1.75
	cs.shape = cap
	cs.position.y = 0.875
	add_child(cs)
	set_meta("zumbi", self)
	modelo = (load(CENA) as PackedScene).instantiate()
	modelo.rotation.y = PI   # o Mixamo olha para +z; aqui a frente é -z
	add_child(modelo)
	var achados := modelo.find_children("*", "AnimationPlayer", true, false)
	if achados.size() > 0:
		anim = achados[0]
		for n in ["sFeridoAnda", "sCorre", "sFeridoParado", "sParado", "sAnda"]:
			if anim.has_animation(n):
				anim.get_animation(n).loop_mode = Animation.LOOP_LINEAR
	floor_snap_length = 0.5
	gemido = randf_range(2.0, 9.0)
	_tocar("sFeridoParado")


## o que está entre o zumbi e o jogador (parede, porta, árvore...): vazio se nada
func _bloqueio(j) -> Dictionary:
	var a := global_position + Vector3(0, 1.3, 0)
	var b: Vector3 = j.global_position + Vector3(0, 1.3, 0)
	var fora: Array[RID] = [get_rid(), (j as CollisionObject3D).get_rid()]
	var q := PhysicsRayQueryParameters3D.create(a, b, 1, fora)
	return get_world_3d().direct_space_state.intersect_ray(q)


func _tocar(n: String, vel := 1.0) -> void:
	if anim and anim.has_animation(n) and (anim.current_animation != n or not anim.is_playing()):
		anim.play(n, 0.25, vel)


func ferir(dano: float, de: Vector3) -> void:
	if estado == "morto":
		return
	vida -= dano
	estado = "caca"
	velocity += (global_position - de).normalized() * 2.0
	if vida <= 0.0:
		morrer()


func morrer() -> void:
	estado = "morto"
	morto_t = 25.0
	_tocar("sQueda")
	collision_layer = 0
	main.sons.tocar("morte_z", global_position, 0.0)
	main.zumbi_morreu(self)


func _physics_process(dt: float) -> void:
	if estado == "morto":
		morto_t -= dt
		velocity.x = 0
		velocity.z = 0
		if not is_on_floor():
			velocity.y -= 20.0 * dt
		move_and_slide()
		if morto_t <= 0.0:
			queue_free()
		return
	var j = main.jogador
	var para: Vector3 = j.global_position - global_position
	var dist := Vector2(para.x, para.z).length()
	var noite: bool = main.noite()
	var ve := 24.0 if not noite else 34.0
	if j.vivo and (dist < ve * (0.55 if j.agachado else 1.0)) and estado != "caca":
		estado = "caca"
		main.sons.tocar("grito_z", global_position, 2.0)
	if estado == "caca" and (not j.vivo or dist > 60.0):
		estado = "vaga"
	var vel := 0.0
	var dir := Vector3.ZERO
	if estado == "caca":
		dir = Vector3(para.x, 0, para.z).normalized()
		var bl := {}
		if dist < 7.0:
			bl = _bloqueio(j)
		var peca := -1
		if not bl.is_empty() and (bl["collider"] as Object).has_meta("peca") and global_position.distance_to(bl["position"]) < 1.9:
			peca = (bl["collider"] as Object).get_meta("peca")
		if peca >= 0 and main.construcao.peca_viva(peca):
			# parede ou porta no caminho: bate nela até cair
			vel = 0.0
			alvo_peca = peca
			ponto_peca = bl["position"]
			if golpe_t < 0.0:
				golpe_t = 0.0
				_tocar("sGolpe", 1.1)
		elif dist < 1.5 and bl.is_empty():
			vel = 0.0
			alvo_peca = -1
			if golpe_t < 0.0:
				golpe_t = 0.0
				_tocar("sGolpe", 1.3)
		else:
			alvo_peca = -1
			vel = 4.4 if (corredor and noite) else 1.55
			if desvio > 0.0:
				desvio -= dt
				dir = (dir + Vector3(-dir.z, 0, dir.x) * lado * 1.3).normalized()
	else:
		tempo -= dt
		if tempo <= 0.0 or global_position.distance_to(alvo_vaga) < 1.5:
			tempo = randf_range(6.0, 14.0)
			alvo_vaga = global_position + Vector3(randf_range(-12, 12), 0, randf_range(-12, 12))
		var d2 := alvo_vaga - global_position
		dir = Vector3(d2.x, 0, d2.z).normalized()
		vel = 0.9
	# golpe: o dano sai no meio do movimento
	if golpe_t >= 0.0:
		golpe_t += dt
		vel = 0.0
		if golpe_t > 0.55 and golpe_t - dt <= 0.55:
			if alvo_peca >= 0:
				main.construcao.ferir_peca(alvo_peca, 4.0 if corredor else 3.0, ponto_peca)
			elif dist < 1.9 and j.vivo and _bloqueio(j).is_empty():
				j.ferir(11.0 if not corredor else 9.0)
		if golpe_t > 1.2:
			golpe_t = -1.0
	velocity.x = dir.x * vel
	velocity.z = dir.z * vel
	if not is_on_floor():
		velocity.y -= 20.0 * dt
	move_and_slide()
	if dir.length() > 0.1 and (vel > 0.05 or estado == "caca"):
		var giro := atan2(-dir.x, -dir.z)
		rotation.y = lerp_angle(rotation.y, giro, 1.0 - exp(-8.0 * dt))
	if golpe_t < 0.0:
		if vel > 3.0:
			_tocar("sCorre", 1.0)
		elif vel > 0.05:
			_tocar("sFeridoAnda", vel / 1.1)
		else:
			_tocar("sFeridoParado")
	# preso em parede: desvia um pouco
	if vel > 0.5 and global_position.distance_to(ultima) < vel * dt * 0.2:
		preso_t += dt
		if preso_t > 1.2:
			alvo_vaga = global_position + Vector3(randf_range(-6, 6), 0, randf_range(-6, 6))
			preso_t = 0.0
			desvio = 1.2
			lado = 1.0 if randf() < 0.5 else -1.0
	else:
		preso_t = 0.0
	ultima = global_position
	gemido -= dt
	if gemido <= 0.0:
		gemido = randf_range(5.0, 12.0)
		if dist < 40.0:
			main.sons.tocar("gemido", global_position, -4.0)
