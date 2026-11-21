class_name Zumbi
extends CharacterBody3D
## Os zumbis do jogo antigo (40_game.js, 42d_zumbis2.js, 47c_cidade_zumbis.js, 64b_combate.js e o balanço 62l_balanco.js), com o
## corpo e as animações do Mixamo convertidos do VAYDR antigo. Os tipos:
## · comum: vaga mancando, caça quem vê ou ouve, bate de perto;
## · corredor: corre (de noite eles são muitos);
## · brutamontes: grandão, muita vida, bate forte e derruba parede; golpe fraco não faz ele cambalear;
## · gritador: quando te vê, grita e chama os de perto (mate ele primeiro);
## · policial: farda, colete (o tiro no peito perde força) e capacete (o tiro na cabeça bate nele até ele voar; espingarda e
##   rifle atravessam);
## · inchado: estufado de gás; quando chega perto ou morre, estoura numa nuvem verde que machuca e faz tossir;
## · emboscada: dorme no escuro das casas e acorda com barulho, com quem chega perto ou com um golpe; levanta e corre.
## Os sentidos: vê de frente (de dia 24 m, de noite 11 m; a lanterna acesa ajuda a te ver; agachado, menos), não vê através de
## parede, e ouve o barulho (tiro, explosão, golpe, corrida): vai ver o que foi. Golpe forte faz cambalear para trás; a voadora e
## as armas pesadas derrubam (no chão leva mais dano e o pisão acaba com ele); pelas costas, agachado, o golpe dobra.
## Na partida em rede: no jogo de quem abriu ele caça quem estiver mais perto (você ou um amigo); no jogo dos convidados ele é
## um boneco (lan) que repete o que chega, e o golpe nele vai para quem abriu.

const CENA := "res://assets/personagens/zumbi.glb"
const TIPOS := {
	"walker": {"nome": "Zumbi", "hp": 100.0, "vaga": 0.7, "caca": 1.75, "dano": 12.0, "alcance": 1.55, "r": 0.34, "esc": [0.95, 1.07]},
	"runner": {"nome": "Corredor", "hp": 65.0, "vaga": 1.0, "caca": 4.3, "dano": 9.0, "alcance": 1.5, "r": 0.3, "esc": [0.92, 1.0]},
	"brute": {"nome": "Brutamontes", "hp": 420.0, "vaga": 0.6, "caca": 1.6, "dano": 30.0, "alcance": 2.1, "r": 0.5, "esc": [1.3, 1.3],
		"obra": 3.0, "resist": 0.9, "pesado": true},
	"screamer": {"nome": "Gritador", "hp": 70.0, "vaga": 0.6, "caca": 1.45, "dano": 8.0, "alcance": 1.45, "r": 0.3, "esc": [0.92, 0.98], "grita": true},
	"policial": {"nome": "Policial", "hp": 150.0, "vaga": 0.65, "caca": 1.95, "dano": 14.0, "alcance": 1.6, "r": 0.36, "esc": [0.98, 1.06],
		"colete": 0.6, "capacete": 2},
	"inchado": {"nome": "Inchado", "hp": 85.0, "vaga": 0.45, "caca": 1.35, "dano": 8.0, "alcance": 1.4, "r": 0.42, "esc": [1.08, 1.08],
		"obra": 0.6, "gas": 3.4},
	"emboscada": {"nome": "Emboscada", "hp": 90.0, "vaga": 0.5, "caca": 3.3, "dano": 15.0, "alcance": 1.5, "r": 0.32, "esc": [0.95, 1.04]},
}
## as roupas de cada tipo (cascas: a região do corpo inflada pela normal e pintada), como o ZVISUAL do jogo antigo
const ROUPAS := {
	"policial": [["troncoLongo", 0.014, 0x3e5170], ["troncoCurto", 0.036, 0x15181d], ["pernas", 0.008, 0x1c2433], ["pes", 0.012, 0x111111]],
	"inchado": [["troncoCurto", 0.075, 0x7b8562], ["pernas", 0.009, 0x3a3a30]],
	"brute": [["troncoCurto", 0.02, 0x2a2622], ["pernas", 0.012, 0x2b2f38], ["pes", 0.014, 0x1a1714]],
}
const TONS := {"walker": Color(1, 1, 1), "runner": Color(0.9, 0.92, 0.96), "brute": Color(0.92, 0.84, 0.8), "screamer": Color(1.06, 1.02, 0.95),
	"policial": Color(0.86, 0.9, 0.98), "inchado": Color(0.98, 1.02, 0.86), "emboscada": Color(0.82, 0.82, 0.78)}
const TRAPOS := [0x4a3f35, 0x2f3a46, 0x5a4a3a, 0x3d4a3a, 0x6a5a4a, 0x2a2a2e, 0x7a6a55, 0x4a2f2a, 0x55504a, 0x3a2e28]
const DERRUBADO_T := 2.4    # no chão depois da voadora ou do golpe pesado
const LEVANTA_T := 1.35

var main: Node
var tipo := "walker"
var S: Dictionary = {}
var uid := 0               # o número dele (o mesmo nos jogos da partida em rede)
var lan := false           # boneco de um zumbi de quem abriu a partida (no jogo de um convidado)
var lan_alvo := Vector3.ZERO
var lan_yaw := 0.0
var lan_st := -1           # 0 vaga, 1 caça, 2 golpe, 3 morto, 4 derrubado, 5 dorme, 6 grito
var lan_v := 0.0
var lan_barrado := 0.0     # boneco segurado pela base de quem joga aqui (fica batendo na parede)
var modelo: Node3D
var anim: AnimationPlayer
var esq: Skeleton3D
var malha: MeshInstance3D
var mat: StandardMaterial3D   # a pele dele (o tom do tipo e o vermelho do golpe)
var tom := Color(1, 1, 1)
var cascas: Array = []
var forma: CollisionShape3D
var escala := 1.0
var vida := 100.0
var vida_max := 100.0
var estado := "vaga"       # vaga, alerta, caca, atordoado, derrubado, levanta, dorme, grito, morto
var alvo_vaga := Vector3.ZERO
var casa := Vector3.ZERO   # em volta de onde ele vaga
var tempo := 0.0
var golpe_t := -1.0
var morto_t := 0.0
var gemido := 0.0
var preso_t := 0.0
var ultima := Vector3.ZERO
var alvo_peca := -1        # peça da base que está no caminho (o zumbi bate nela)
var ponto_peca := Vector3.ZERO
var lento := 0.0           # estaca ou arame farpado: anda devagar por um tempo
var preso_arm := 0.0       # armadilha de mandíbula: parado por um tempo
var desvio := 0.0          # preso numa árvore ou pedra: anda de lado um pouco
var lado := 1.0
var viu := 99.0            # quanto tempo faz que viu o alvo
var visto_em := Vector3.ZERO
var ouvir_t := -1.0        # ouviu um barulho: daqui a pouco vai ver o que foi
var ouvir_p := Vector3.ZERO
var alerta_p := Vector3.ZERO
var st_t := 0.0            # tempo no estado (cambaleando, no chão, levantando, gritando)
var tranco := Vector3.ZERO # o empurrão do golpe (ele anda para trás)
var empurrado_t := 99.0    # quanto tempo faz que levou o empurrão (golpe logo depois derruba)
var gritou := false
var capacete := 0
var capacete_no: Node3D = null
var estourou := false
var flash := 0.0
var _ve_t := 0.0
var _ve := false
var _depois := ""          # o estado depois de levantar
var _parado_no_chao := false
var _casa_ok := false
var dist_alvo := 0.0
var parado := false        # de guarda: não vaga, fica onde está até ver ou ouvir alguém


func _init(m: Node, t = "walker") -> void:
	main = m
	if t is bool:
		t = "runner" if t else "walker"
	tipo = str(t) if TIPOS.has(str(t)) else "walker"
	S = TIPOS[tipo]


## o corredor de antes (os outros jogos e os testes perguntam)
var corredor: bool:
	get:
		return tipo == "runner"


func _ready() -> void:
	vida_max = float(S["hp"])
	vida = vida_max
	var e: Array = S["esc"]
	escala = randf_range(float(e[0]), float(e[1]))
	forma = CollisionShape3D.new()
	var cap := CapsuleShape3D.new()
	cap.radius = float(S["r"]) * minf(escala, 1.15)
	cap.height = 1.75 * escala
	forma.shape = cap
	forma.position.y = 0.875 * escala
	add_child(forma)
	set_meta("zumbi", self)
	modelo = (load(CENA) as PackedScene).instantiate()
	modelo.rotation.y = PI   # o Mixamo olha para +z; aqui a frente é -z
	modelo.scale = Vector3.ONE * escala
	add_child(modelo)
	var achados := modelo.find_children("*", "AnimationPlayer", true, false)
	if achados.size() > 0:
		anim = achados[0]
		for n in ["sFeridoAnda", "sCorre", "sDispara", "sFeridoParado", "sParado", "sAnda"]:
			if anim.has_animation(n):
				anim.get_animation(n).loop_mode = Animation.LOOP_LINEAR
	var sk := modelo.find_children("*", "Skeleton3D", true, false)
	if sk.size() > 0:
		esq = sk[0]
	_vestir()
	floor_snap_length = 0.5
	gemido = randf_range(2.0, 9.0)
	if estado == "dorme":
		_deitado()
	else:
		_tocar("sFeridoParado")


## o tom da pele do tipo, as roupas (cascas) e o capacete do policial
func _vestir() -> void:
	for no in modelo.find_children("*", "MeshInstance3D", true, false):
		var mi := no as MeshInstance3D
		if str(mi.name) == "zumbi_malha":
			malha = mi
		elif str(mi.name).begins_with("casca_"):
			mi.visible = false
	if malha == null:
		return
	var base := malha.get_active_material(0)
	mat = (base.duplicate() if base is StandardMaterial3D else StandardMaterial3D.new()) as StandardMaterial3D
	tom = TONS.get(tipo, Color(1, 1, 1))
	if tipo == "walker" or tipo == "emboscada":
		var v := randf_range(0.88, 1.04)
		tom = Color(tom.r * v, tom.g * v * randf_range(0.97, 1.03), tom.b * v)
	mat.albedo_color = tom
	malha.material_override = mat
	var roupa: Array = ROUPAS.get(tipo, [])
	if tipo in ["walker", "runner", "emboscada"]:
		# os comuns: trapos de cores diferentes (camisa e calça rasgadas)
		roupa = []
		if randf() < 0.55:
			roupa.append(["troncoLongo" if randf() < 0.5 else "troncoCurto", 0.012, TRAPOS[randi() % TRAPOS.size()]])
		if randf() < 0.7:
			roupa.append(["pernas", 0.008, TRAPOS[randi() % TRAPOS.size()]])
		if randf() < 0.5:
			roupa.append(["pes", 0.012, 0x1a1714])
	for r in roupa:
		var base_c := modelo.find_child("casca_" + str(r[0]), true, false) as MeshInstance3D
		if base_c == null:
			continue
		var mi := MeshInstance3D.new()
		mi.mesh = base_c.mesh
		mi.skin = base_c.skin
		var m := StandardMaterial3D.new()
		var c := int(r[2])
		m.albedo_color = Color8((c >> 16) & 255, (c >> 8) & 255, c & 255) * randf_range(0.85, 1.1)
		m.roughness = 0.92
		m.grow = true
		m.grow_amount = float(r[1])
		mi.material_override = m
		base_c.get_parent().add_child(mi)
		mi.skeleton = mi.get_path_to(esq)
		cascas.append(mi)
	if tipo == "policial" and esq != null:
		capacete = int(S["capacete"])
		var ba := BoneAttachment3D.new()
		ba.bone_name = "Head"
		esq.add_child(ba)
		var cm := SphereMesh.new()
		cm.radius = 0.135
		cm.height = 0.15
		cm.is_hemisphere = true
		var mc := StandardMaterial3D.new()
		mc.albedo_color = Color(0.07, 0.08, 0.1)
		mc.roughness = 0.35
		mc.metallic = 0.4
		cm.material = mc
		var mi := MeshInstance3D.new()
		mi.mesh = cm
		mi.position = Vector3(0, 0.12, 0.012)
		ba.add_child(mi)
		capacete_no = mi


## o que está entre o zumbi e o jogador (parede, porta, árvore...): vazio se nada
func _bloqueio(j) -> Dictionary:
	var a := global_position + Vector3(0, 1.3, 0)
	var b: Vector3 = j.pos_alvo() + Vector3(0, 1.3, 0)
	var fora: Array[RID] = [get_rid()]
	if j is CollisionObject3D:
		fora.append((j as CollisionObject3D).get_rid())
	var q := PhysicsRayQueryParameters3D.create(a, b, 1, fora)
	return get_world_3d().direct_space_state.intersect_ray(q)


## enxerga o alvo (nenhuma parede, árvore ou pedra no meio; outro zumbi não tapa)
func _enxerga(j) -> bool:
	var sp := get_world_3d().direct_space_state
	var a := global_position + Vector3(0, 1.6 * escala, 0)
	var b: Vector3 = j.pos_alvo() + Vector3(0, 1.4 if not j.agachado else 0.9, 0)
	var fora: Array[RID] = [get_rid()]
	if j is CollisionObject3D:
		fora.append((j as CollisionObject3D).get_rid())
	for k in 3:
		var h := sp.intersect_ray(PhysicsRayQueryParameters3D.create(a, b, 1, fora))
		if h.is_empty():
			return true
		var c: Object = h["collider"]
		# outro zumbi não tapa; a base também não (eles sentem quem está lá dentro e batem na parede até cair)
		if (c.has_meta("zumbi") or c.has_meta("peca")) and c is CollisionObject3D:
			fora.append((c as CollisionObject3D).get_rid())
			continue
		return false
	return true


func _tocar(n: String, vel := 1.0, mistura := 0.25) -> void:
	if anim and anim.has_animation(n) and (anim.current_animation != n or not anim.is_playing() or _parado_no_chao):
		_parado_no_chao = false
		anim.play(n, mistura, vel)


## deitado no chão (dormindo ou derrubado): o primeiro quadro do levantar, parado
func _deitado(mistura := 0.3) -> void:
	if anim and anim.has_animation("zLevantar"):
		anim.play("zLevantar", mistura, 0.0)
		anim.seek(0.0, true)
		_parado_no_chao = true


func _levantar(dur: float, depois: String) -> void:
	estado = "levanta"
	st_t = dur
	_depois = depois
	_parado_no_chao = false
	if anim and anim.has_animation("zLevantar"):
		anim.play("zLevantar", 0.15, anim.get_animation("zLevantar").length / dur)
		anim.seek(0.0, true)


# ======================================================================== golpes e dano
## quem: o id de quem bateu na partida em rede (0: aqui mesmo); quem mata leva o que o zumbi deixa.
## info: o tipo do golpe ("k": golpe, bala, flecha, fogo, explosao, voadora, pisao, empurrao), "head" (na cabeça), "reg" (cabeça,
## tronco, braços, pernas), "arma" e "forte" (cambaleia até o brutamontes); "derruba": derruba se der
func ferir(dano: float, de: Vector3, quem := 0, info := {}) -> void:
	if lan:
		# boneco: quem abriu a partida aplica o golpe (ou a armadilha)
		if estado != "morto":
			Rede.hit_z(uid, dano, de, info)
			flash = 0.15
		return
	if estado == "morto":
		return
	var k := str(info.get("k", "golpe"))
	dano = _armadura(dano, info)
	if estado == "derrubado" and dano > 0.0:
		dano *= 1.5
	dano *= float(S.get("resist", 1.0))
	vida -= dano
	flash = 0.15
	if vida <= 0.0:
		morrer(quem)
		return
	if estado == "dorme":
		_levantar(LEVANTA_T * 0.75, "caca")
	visto_em = de
	viu = 0.0
	if estado == "derrubado":
		st_t = maxf(st_t, 0.6)
		return
	if estado == "levanta":
		return
	var forte: bool = bool(info.get("forte", false))
	var dir := global_position - de
	dir.y = 0.0
	dir = dir.normalized() if dir.length() > 0.01 else -global_basis.z
	# derruba: a voadora, o golpe logo depois do empurrão, as armas pesadas às vezes
	var derr: float = float(info.get("derruba", 0.0))
	if k == "golpe" and empurrado_t < 1.3:
		derr = 1.0
	if derr > 0.0 and randf() < derr and derrubar(dir * 3.0):
		return
	if k in ["fogo", "armadilha", "gas"] or dano < 4.0:
		if estado in ["vaga", "alerta"]:
			estado = "caca"
		return
	if not bool(S.get("pesado", false)) or forte:
		estado = "atordoado"
		st_t = 0.2 if bool(S.get("pesado", false)) else 0.3 + (0.3 if forte else 0.0)
		tranco = dir * float(info.get("empurra", 1.0)) * 3.0
		golpe_t = -1.0
		_tocar("sCaindo", 2.2, 0.08)
	elif estado != "caca":
		estado = "caca"


## o colete cobre o tronco (o tiro perde força); o capacete segura o tiro na cabeça até voar (espingarda e rifle atravessam)
func _armadura(dano: float, info: Dictionary) -> float:
	var k := str(info.get("k", "golpe"))
	var arma := str(info.get("arma", ""))
	var forte_arma := arma in ["espingarda", "rifle"]
	if bool(info.get("head", false)) and capacete > 0 and k != "golpe":
		if forte_arma:
			_capacete_voa()
			return dano
		capacete -= 1
		main.efeitos.faiscas(global_position + Vector3(0, 1.75 * escala, 0))
		main.sons.tocar("metal", global_position, 2.0)
		if capacete <= 0:
			_capacete_voa()
		return dano / float(info.get("mult", 2.5)) * 0.45
	if S.has("colete") and not bool(info.get("head", false)) and k not in ["fogo", "explosao"] and str(info.get("reg", "tronco")) == "tronco":
		if forte_arma:
			return dano * 0.9
		return dano * (minf(1.0, float(S["colete"]) + 0.25) if k == "golpe" else float(S["colete"]))
	return dano


func _capacete_voa() -> void:
	capacete = 0
	if capacete_no == null or not is_instance_valid(capacete_no):
		return
	var xf := capacete_no.global_transform
	capacete_no.get_parent().remove_child(capacete_no)
	var rb := RigidBody3D.new()
	rb.collision_layer = 0
	rb.collision_mask = 1
	var cs := CollisionShape3D.new()
	var sh := SphereShape3D.new()
	sh.radius = 0.12
	cs.shape = sh
	rb.add_child(cs)
	capacete_no.transform = Transform3D.IDENTITY
	rb.add_child(capacete_no)
	main.add_child(rb)
	rb.global_transform = xf
	rb.linear_velocity = Vector3(randf_range(-1.5, 1.5), 3.5, randf_range(-1.5, 1.5))
	rb.angular_velocity = Vector3(randf_range(-9, 9), randf_range(-4, 4), randf_range(-9, 9))
	main.get_tree().create_timer(30.0).timeout.connect(rb.queue_free)
	capacete_no = null
	main.ui.aviso("O capacete voou!")


## derruba (voadora, golpe pesado, explosão): cai de costas, fica no chão uns segundos e levanta. O brutamontes não cai
func derrubar(empurrao: Vector3, t := DERRUBADO_T) -> bool:
	if lan or estado in ["morto", "dorme"] or bool(S.get("pesado", false)):
		return false
	estado = "derrubado"
	st_t = t
	tranco = empurrao
	golpe_t = -1.0
	_deitado(0.18)
	main.sons.tocar("impacto", global_position, 0.0)
	return true


## o empurrão (Q): cambaleia para trás (o brutamontes quase não sai do lugar); golpe logo depois derruba
func empurrar(dir: Vector3) -> void:
	if lan:
		Rede.hit_z(uid, 0.0, global_position - dir, {"k": "empurrao"})
		return
	if estado in ["morto", "derrubado", "levanta"]:
		return
	empurrado_t = 0.0
	if estado == "dorme":
		_levantar(LEVANTA_T, "caca")
		return
	estado = "atordoado"
	st_t = 0.35 if bool(S.get("pesado", false)) else 0.9
	tranco = dir.normalized() * (1.5 if bool(S.get("pesado", false)) else 4.8)
	golpe_t = -1.0
	_tocar("sCaindo", 2.2, 0.08)


func atrasar(t: float) -> void:
	if lan:
		Rede.efeito_z(uid, 0, t)
		return
	lento = maxf(lento, t)


func prender(t: float) -> void:
	if lan:
		Rede.efeito_z(uid, 1, t)
		return
	preso_arm = maxf(preso_arm, t)


## ouviu um barulho em p (ainda vai levar um instante para reagir)
func ouvir(p: Vector3, atraso: float) -> void:
	if lan or estado in ["morto", "caca", "atordoado", "derrubado", "levanta", "grito"] or golpe_t >= 0.0:
		return
	if ouvir_t < 0.0 or atraso < ouvir_t:
		ouvir_t = atraso
		ouvir_p = p


func morrer(quem := 0) -> void:
	estado = "morto"
	morto_t = 25.0
	golpe_t = -1.0
	_tocar("sQueda")
	collision_layer = 0
	main.sons.tocar("morte_z", global_position, 0.0)
	if S.has("gas") and not estourou:
		_estourar()
	main.zumbi_morreu(self, quem)


## o inchado estoura: nuvem de gás verde que machuca e faz tossir
func _estourar() -> void:
	estourou = true
	main.efeitos.gas(global_position + Vector3(0, 0.9, 0), float(S["gas"]), 9.0)
	main.efeitos.sangue(global_position + Vector3(0, 1.1, 0), Vector3.UP)
	main.sons.tocar("estouro", global_position, 2.0)
	main.barulho(global_position, 18.0)


# ======================================================================== partida em rede
## quem abriu manda: número, posição, para onde olha, estado, vida, velocidade e o tipo
func para_rede() -> PackedFloat32Array:
	var st := 0
	match estado:
		"morto":
			st = 3
		"derrubado", "levanta":
			st = 4
		"dorme":
			st = 5
		"grito":
			st = 6
		_:
			st = 2 if golpe_t >= 0.0 else (1 if estado in ["caca", "atordoado"] else 0)
	var p := global_position
	return PackedFloat32Array([uid, p.x, p.y, p.z, rotation.y, st, clampf(vida / vida_max, 0.0, 1.0),
		Vector2(velocity.x, velocity.z).length(), float(TIPOS.keys().find(tipo)) + (0.5 if capacete > 0 else 0.0)])


## o boneco recebe o que chegou de quem abriu (cap: o capacete ainda está na cabeça)
func rede(p: Vector3, yaw: float, st: int, hp: float, v: float, cap := true) -> void:
	if capacete > 0 and not cap:
		_capacete_voa()
	lan_alvo = p
	lan_yaw = yaw
	lan_v = v
	vida = hp * vida_max
	if st == 3:
		if estado != "morto":
			estado = "morto"
			golpe_t = -1.0
			_tocar("sQueda")
			collision_layer = 0
			main.sons.tocar("morte_z", global_position, 0.0)
		lan_st = st
		return
	if st == 4 and lan_st != 4:
		estado = "derrubado"
		_deitado(0.18)
	elif st != 4 and lan_st == 4:
		_levantar(LEVANTA_T, "caca")
	if st == 5 and lan_st != 5:
		estado = "dorme"
		_deitado(0.0)
	elif st != 5 and lan_st == 5:
		_levantar(LEVANTA_T, "caca")
	if st == 2 and lan_st != 2:
		golpe_t = 0.0
		_tocar("sGolpe", 1.3)
	if st == 6 and lan_st != 6:
		main.sons.tocar("grito", global_position, 6.0)
		main.efeitos.anel(global_position + Vector3(0, 1.9 * escala, 0))
	if st in [1, 2, 6] and lan_st in [0, 5]:
		main.sons.tocar("grito_z", global_position, 2.0)
	if st in [0, 1, 2, 6]:
		estado = "caca" if st >= 1 else "vaga"
	lan_st = st


## o boneco anda até onde quem abriu diz; a base de quem joga aqui segura (ele fica batendo na parede)
func _boneco(dt: float) -> void:
	_piscar(dt)
	if estado == "morto":
		global_position = global_position.lerp(lan_alvo, minf(1.0, dt * 6.0))
		return
	var d := lan_alvo - global_position
	var dh := Vector2(d.x, d.z).length()
	var passo := d * minf(1.0, dt * 8.0)
	if estado in ["derrubado", "dorme", "levanta"]:
		global_position += passo
		if estado == "levanta":
			st_t -= dt
			if st_t <= 0.0:
				estado = _depois
		return
	var barrado := dh > 0.02 and dh < 25.0 and _parede_base(Vector3(passo.x, 0, passo.z))
	lan_barrado = maxf(0.0, lan_barrado - dt)
	if barrado:
		lan_barrado = 1.5
		global_position.y += passo.y
	elif lan_barrado <= 0.0 and (dh > 5.0 or (golpe_t >= 0.0 and dh > 1.2)):
		global_position = lan_alvo
	else:
		global_position += passo
	rotation.y = lerp_angle(rotation.y, lan_yaw, 1.0 - exp(-10.0 * dt))
	if golpe_t >= 0.0:
		golpe_t += dt
		if golpe_t > 1.2:
			golpe_t = -1.0
	if golpe_t < 0.0:
		_andar_anim(0.0 if barrado else lan_v)
	gemido -= dt
	if gemido <= 0.0:
		gemido = randf_range(5.0, 12.0)
		if main.jogador != null and global_position.distance_to(main.jogador.global_position) < 40.0:
			main.sons.tocar("gemido", global_position, -4.0)


## uma peça da base de quem joga aqui no caminho do boneco (a parede, a porta fechada)
func _parede_base(passo: Vector3) -> bool:
	if main.construcao == null or main.construcao.pecas.is_empty():
		return false
	var a := global_position + Vector3(0, 0.9, 0)
	var b := a + passo.normalized() * (passo.length() + 0.35)
	var q := PhysicsRayQueryParameters3D.create(a, b, 1, [get_rid()])
	var h := get_world_3d().direct_space_state.intersect_ray(q)
	if h.is_empty():
		return false
	var c: Object = h["collider"]
	return c.has_meta("peca") and main.construcao.peca_viva(int(c.get_meta("peca")))


func _andar_anim(vel: float) -> void:
	if vel > 4.0:
		_tocar("sDispara" if anim and anim.has_animation("sDispara") else "sCorre", vel / 5.2)
	elif vel > 2.6:
		_tocar("sCorre", vel / 4.0)
	elif vel > 0.05:
		_tocar("sFeridoAnda", vel / 1.1)
	else:
		_tocar("sFeridoParado")


func _piscar(dt: float) -> void:
	if flash > 0.0 and mat != null:
		flash = maxf(0.0, flash - dt)
		mat.albedo_color = tom.lerp(Color(2.2, 1.3, 1.3), clampf(flash / 0.15, 0.0, 1.0))


# ======================================================================== o passo de cada quadro
func _physics_process(dt: float) -> void:
	if lan:
		_boneco(dt)
		return
	_piscar(dt)
	empurrado_t += dt
	if not _casa_ok:
		_casa_ok = true
		casa = global_position
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
	# o alvo: quem estiver mais perto (você ou, na partida em rede, um amigo que está no mundo)
	var j = main.alvo_zumbi(self)
	var jp: Vector3 = j.pos_alvo()
	var para: Vector3 = jp - global_position
	var dist := Vector2(para.x, para.z).length()
	dist_alvo = dist
	var noite_k: float = main.noite_k() if main.has_method("noite_k") else (1.0 if main.noite() else 0.0)
	var mult_noite := lerpf(1.0, 1.18, noite_k)
	# longe de todo mundo: fica parado (não gasta)
	if dist > 140.0 and estado not in ["caca", "alerta"]:
		velocity = Vector3.ZERO
		return
	# os estados que não andam sozinhos
	match estado:
		"dorme":
			_dormindo(j, dist, dt)
			return
		"levanta":
			st_t -= dt
			_gravidade_parado(dt)
			if st_t <= 0.0:
				estado = _depois
				viu = 0.0
				visto_em = jp
			return
		"derrubado":
			st_t -= dt
			_arrastar(dt)
			if st_t <= 0.0:
				_levantar(LEVANTA_T, "caca")
			return
		"atordoado":
			st_t -= dt
			_arrastar(dt)
			if st_t <= 0.0:
				estado = "caca"
				viu = minf(viu, 1.0)
			return
		"grito":
			st_t += dt
			velocity.x = 0.0
			velocity.z = 0.0
			_gravidade_parado(dt)
			rotation.y = lerp_angle(rotation.y, atan2(-para.x, -para.z), 1.0 - exp(-6.0 * dt))
			if st_t > 0.4 and not gritou:
				gritou = true
				main.sons.tocar("grito", global_position, 8.0)
				main.efeitos.anel(global_position + Vector3(0, 1.9 * escala, 0))
				# chama os de perto para onde você está
				main.barulho(global_position, 60.0, jp)
				main.ui.aviso("Um gritador te viu e chamou os de perto!", 3.0)
			if st_t > 1.8:
				estado = "caca"
				_tocar("sFeridoParado")
			return
	# percepção: vê de frente (mais longe de dia), ouve barulho
	_perceber(j, para, dist, noite_k, dt)
	if ouvir_t >= 0.0:
		ouvir_t -= dt
		if ouvir_t < 0.0 and estado in ["vaga", "alerta"]:
			estado = "alerta"
			alerta_p = ouvir_p
	var vel := 0.0
	var dir := Vector3.ZERO
	match estado:
		"caca":
			var alvo_p: Vector3 = jp if viu < 0.5 else visto_em
			var pa := alvo_p - global_position
			dir = Vector3(pa.x, 0, pa.z).normalized()
			var bl := {}
			if dist < 7.0:
				bl = _bloqueio(j)
			var peca := -1
			if not bl.is_empty() and (bl["collider"] as Object).has_meta("peca") and global_position.distance_to(bl["position"]) < 1.9 + float(S["r"]):
				peca = (bl["collider"] as Object).get_meta("peca")
			var alcance: float = float(S["alcance"]) * maxf(1.0, escala * 0.9)
			if peca >= 0 and main.construcao.peca_viva(peca):
				# parede ou porta no caminho: bate nela até cair
				vel = 0.0
				alvo_peca = peca
				ponto_peca = bl["position"]
				if golpe_t < 0.0:
					golpe_t = 0.0
					_tocar("sGolpe", 1.1)
			elif dist < alcance and bl.is_empty() and j.vivo and absf(para.y) < 2.0:
				vel = 0.0
				alvo_peca = -1
				# o inchado estoura quando chega perto
				if S.has("gas") and not estourou:
					_estourar()
					morrer()
					return
				if golpe_t < 0.0:
					golpe_t = 0.0
					_tocar("sGolpe", 1.3)
					if randf() < 0.7:
						main.sons.tocar("grito_z", global_position, -2.0)
			else:
				alvo_peca = -1
				vel = float(S["caca"]) * mult_noite
				if desvio > 0.0:
					desvio -= dt
					dir = (dir * 0.35 + Vector3(-dir.z, 0, dir.x) * lado).normalized()
			if viu > 6.0:
				estado = "alerta"
				alerta_p = visto_em
			if not j.vivo and viu > 1.0:
				estado = "vaga"
				casa = global_position
		"alerta":
			var pa := alerta_p - global_position
			dir = Vector3(pa.x, 0, pa.z).normalized()
			vel = float(S["caca"]) * 0.8 * mult_noite
			if Vector2(pa.x, pa.z).length() < 2.0:
				estado = "vaga"
				casa = global_position
				tempo = 2.0
		_:
			tempo -= dt
			if parado:
				tempo = 1.0
			elif tempo <= 0.0 or global_position.distance_to(alvo_vaga) < 1.2:
				tempo = randf_range(4.0, 11.0)
				var a := randf() * TAU
				alvo_vaga = casa + Vector3(cos(a), 0, sin(a)) * randf_range(0.0, 7.0)
			var d2 := alvo_vaga - global_position
			if not parado and Vector2(d2.x, d2.z).length() > 0.6:
				dir = Vector3(d2.x, 0, d2.z).normalized()
				vel = float(S["vaga"])
	# golpe: o dano sai no meio do movimento
	if golpe_t >= 0.0:
		golpe_t += dt
		vel = 0.0
		if golpe_t > 0.55 and golpe_t - dt <= 0.55:
			if alvo_peca >= 0:
				main.construcao.ferir_peca(alvo_peca, 3.0 * float(S.get("obra", 1.0)) * (1.3 if tipo == "runner" else 1.0), ponto_peca)
			elif dist < float(S["alcance"]) * maxf(1.0, escala * 0.9) + 0.35 and j.vivo and _bloqueio(j).is_empty():
				j.ferir(float(S["dano"]) * randf_range(0.85, 1.1), true, global_position)
		if golpe_t > 1.05:
			golpe_t = -1.0
	# armadilhas da base
	if preso_arm > 0.0:
		preso_arm -= dt
		vel = 0.0
	elif lento > 0.0:
		lento -= dt
		vel *= 0.35
	velocity.x = dir.x * vel
	velocity.z = dir.z * vel
	if not is_on_floor():
		velocity.y -= 20.0 * dt
	move_and_slide()
	if vel > 0.05 and is_on_wall() and is_on_floor():
		Jogador.degrau(self, dir * vel * dt)
	if estado == "caca" and dist < 4.0 and vel <= 0.05:
		dir = Vector3(para.x, 0, para.z).normalized()
	if dir.length() > 0.1 and (vel > 0.05 or estado == "caca"):
		var giro := atan2(-dir.x, -dir.z)
		rotation.y = lerp_angle(rotation.y, giro, 1.0 - exp(-8.0 * dt))
	if golpe_t < 0.0:
		_andar_anim(vel)
	# preso em parede: desvia um pouco
	if vel > 0.5 and global_position.distance_to(ultima) < vel * dt * 0.2:
		preso_t += dt
		if preso_t > 1.2:
			alvo_vaga = global_position + Vector3(randf_range(-6, 6), 0, randf_range(-6, 6))
			preso_t = 0.0
			desvio = 0.9
			lado = 1.0 if randf() < 0.5 else -1.0
	else:
		preso_t = 0.0
	ultima = global_position
	gemido -= dt
	if gemido <= 0.0:
		gemido = randf_range(5.0, 12.0)
		if dist < 40.0:
			main.sons.tocar("gemido", global_position, -4.0)


## vê o alvo? de frente até a distância da visão (de dia mais longe; a lanterna acesa no escuro ajuda a te ver; agachado, menos),
## de perto em qualquer direção; nunca através de parede
func _perceber(j, para: Vector3, dist: float, noite_k: float, dt: float) -> void:
	viu += dt
	if not j.vivo:
		return
	var ag: bool = j.agachado
	var vis := lerpf(24.0, 11.0, noite_k)
	if bool(j.lanterna_acesa) and noite_k > 0.3:
		vis += 14.0
	if ag:
		vis *= 0.6
	var fr := -global_basis.z
	var ang := (fr.x * para.x + fr.z * para.z) / maxf(dist, 0.01)
	var perto := dist < (1.3 if ag else 3.5)
	var talvez := perto or (dist < vis and ang > -0.35) or (not ag and dist < vis * 0.5)
	if absf(para.y) > 8.0:
		talvez = false
	if not talvez:
		_ve = false
		return
	_ve_t -= dt
	if _ve_t <= 0.0:
		_ve_t = randf_range(0.2, 0.3)
		_ve = _enxerga(j)
	if not _ve:
		return
	viu = 0.0
	visto_em = j.pos_alvo()
	if estado in ["vaga", "alerta"]:
		if bool(S.get("grita", false)) and not gritou:
			estado = "grito"
			st_t = 0.0
			_tocar("sGolpe", 0.55)
		else:
			estado = "caca"
			main.sons.tocar("grito_z", global_position, 2.0)


## dormindo no escuro: acorda com quem chega perto (agachado, mais perto), com barulho ou com golpe
func _dormindo(j, dist: float, dt: float) -> void:
	_gravidade_parado(dt)
	if ouvir_t >= 0.0:
		ouvir_t -= dt
		if ouvir_t < 0.0:
			alerta_p = ouvir_p
			_levantar(LEVANTA_T, "alerta")
			return
	var perto := 2.0 if j.agachado else 3.6
	if j.vivo and dist < perto and absf(j.pos_alvo().y - global_position.y) < 2.0:
		_levantar(LEVANTA_T * 0.8, "caca")
		visto_em = j.pos_alvo()
		viu = 0.0
		main.sons.tocar("grito_z", global_position, 4.0)


func _gravidade_parado(dt: float) -> void:
	velocity.x = 0.0
	velocity.z = 0.0
	if not is_on_floor():
		velocity.y -= 20.0 * dt
	else:
		velocity.y = 0.0
	move_and_slide()


## o tranco do golpe (cambaleando ou derrubado, ele escorrega para trás até parar)
func _arrastar(dt: float) -> void:
	velocity.x = tranco.x
	velocity.z = tranco.z
	tranco *= exp(-dt * 5.0)
	if not is_on_floor():
		velocity.y -= 20.0 * dt
	move_and_slide()
