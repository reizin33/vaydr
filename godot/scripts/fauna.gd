class_name Fauna
extends Node3D
## A fauna (etapa 6a), como no jogo antigo (46_animais.js): dez espécies (coelho, raposa, ovelha, cabra, cervo, vaca, javali,
## lobo, urso e onça) que vivem em regiões do mapa (pastos da fazenda, mata da clareira, vale do Rio Claro, serra, mata do
## norte, margens do lago...). Cada região guarda quantos bichos tem de cada espécie; só os que estão perto de alguém viram
## bichos de verdade (longe, o número fica guardado). Caçar baixa o número e ele volta devagar (casal tem filhote, região vazia
## recebe das vizinhas), nunca passa do limite e nunca zera para sempre; de vez em quando uma espécie muda de região.
## Na partida em rede quem abriu cuida dos bichos; quem entrou vê os bonecos, e o golpe e o esfolar vão para quem abriu.

const TIPOS := ["coelho", "raposa", "ovelha", "cabra", "cervo", "vaca", "javali", "lobo", "urso", "onca"]
## o Rio Claro (o mesmo do mapa): a região do vale vai ao longo dele
const RIO := [Vector2(44, -178), Vector2(36, -150), Vector2(26, -124), Vector2(18, -98), Vector2(16, -70), Vector2(14, -45),
	Vector2(16, -22), Vector2(24, -2), Vector2(31, 9), Vector2(34, 26), Vector2(30, 46), Vector2(37, 70), Vector2(52, 95)]

var main
var POP: Dictionary
var ZONAS: Array
var FAUNA: Dictionary
var bichos: Array = []
var pop := {}                 # região -> espécie -> {"n": quantos, "rec": a volta}
var mortos := {}              # espécie -> quantos foram caçados
var _pop_tm := -1.0
var migra := -1.0
var _t := 1.0
var b_rede := {}              # convidado: uid -> boneco
var _dicas := {}
var _rio_cum: Array = []
var _rio_L := 0.0
var lacos: Array = []         # os laços armados: {"p", "yaw", "armado", "tc" (minutos), "pego", "no"}
var _laco_t := 0.0


func _init(m) -> void:
	main = m
	var D := ModelosBichos.dados()
	POP = D["fauna_pop"]
	ZONAS = D["zonas_fauna"]
	FAUNA = D["fauna"]
	_rio_cum = [0.0]
	for i in range(1, RIO.size()):
		_rio_L += (RIO[i] as Vector2).distance_to(RIO[i - 1])
		_rio_cum.append(_rio_L)
	pop = _novo()


func minutos() -> float:
	return (float(main.dia) * 24.0 + float(main.hora)) * 60.0


func _novo() -> Dictionary:
	var z := {}
	for Z in ZONAS:
		var e := {}
		for sp in Z["f"]:
			e[sp] = {"n": int(Z["f"][sp]), "rec": 0.0}
		z[Z["id"]] = e
	return z


# ======================================================================== regiões e lugares
func zona(id: String) -> Dictionary:
	for Z in ZONAS:
		if str(Z["id"]) == id:
			return Z
	return {}


## a distância até o Rio Claro e o ponto (s de 0 a 1 ao longo dele)
func rio_perto(x: float, z: float) -> Vector2:
	var p := Vector2(x, z)
	var bd := 1e9
	var bs := 0.0
	for i in RIO.size() - 1:
		var a: Vector2 = RIO[i]
		var b: Vector2 = RIO[i + 1]
		var ab := b - a
		var u := clampf((p - a).dot(ab) / maxf(ab.length_squared(), 1e-6), 0.0, 1.0)
		var d := p.distance_to(a + ab * u)
		if d < bd:
			bd = d
			bs = (float(_rio_cum[i]) + ab.length() * u) / _rio_L
	return Vector2(bd, bs)


## um ponto do rio (s de 0 a 1): [posição, direção]
func rio_ponto(s: float) -> Array:
	var d := clampf(s, 0.0, 1.0) * _rio_L
	var i := 0
	while i < RIO.size() - 2 and float(_rio_cum[i + 1]) < d:
		i += 1
	var a: Vector2 = RIO[i]
	var b: Vector2 = RIO[i + 1]
	var l := maxf(float(_rio_cum[i + 1]) - float(_rio_cum[i]), 0.001)
	var u := (d - float(_rio_cum[i])) / l
	return [a.lerp(b, u), (b - a).normalized()]


func dentro_zona(Z: Dictionary, x: float, z: float) -> bool:
	if bool(Z.get("rio", false)):
		if z < -112.0 or z > 72.0:
			return false
		return rio_perto(x, z).x < float(Z["r"])
	var d := Vector2(x - float(Z["x"]), z - float(Z["z"])).length()
	return d < float(Z["r"]) and d >= float(Z.get("r0", 0.0))


func dist_zona(Z: Dictionary, x: float, z: float) -> float:
	if bool(Z.get("rio", false)):
		if z < -172.0 or z > 132.0:
			return 1e9
		return maxf(0.0, rio_perto(x, z).x - float(Z["r"]))
	return maxf(0.0, Vector2(x - float(Z["x"]), z - float(Z["z"])).length() - float(Z["r"]))


func zona_em(x: float, z: float) -> Dictionary:
	for Z in ZONAS:
		if dentro_zona(Z, x, z):
			return Z
	return {}


## dá para andar ali: dentro do mapa (com a borda), fora da cidade (com a folga) e sem água funda
func ponto_livre(x: float, z: float, borda: float, folga_cidade: float) -> bool:
	if not main.terreno.dentro(x, z):
		return false
	if not main.terreno.dentro(x + borda, z) or not main.terreno.dentro(x - borda, z) or not main.terreno.dentro(x, z + borda) or not main.terreno.dentro(x, z - borda):
		return false
	if Terreno.CIDADE.grow(folga_cidade).has_point(Vector2(x, z)):
		return false
	return not agua_funda(x, z, 0.5)


func agua_funda(x: float, z: float, prof: float) -> bool:
	if main.terreno.tipo_agua(x, z) == 0:
		return false
	var n: float = main.terreno.nivel_agua(x, z)
	return n > -900.0 and n - main.terreno.h(x, z) > prof


## quantas árvores há a até 6 m (a mata fechada)
func mata(x: float, z: float) -> int:
	var sp := get_world_3d().direct_space_state
	var q := PhysicsShapeQueryParameters3D.new()
	var s := SphereShape3D.new()
	s.radius = 6.0
	q.shape = s
	q.transform = Transform3D(Basis(), Vector3(x, main.terreno.h(x, z) + 1.5, z))
	q.collision_mask = 1
	var n := 0
	for r in sp.intersect_shape(q, 24):
		var c: Object = r["collider"]
		if c != null and c.has_meta("recurso"):
			var rec: Dictionary = main.mundo.recursos[c.get_meta("recurso")]
			if str(rec.get("tipo", "")) == "arvore":
				n += 1
	return n


## um lugar bom para a espécie nascer (como faunaPontoOk do jogo antigo)
func ponto_ok(x: float, z: float, sp_id: String, rigor: bool) -> bool:
	var S: Dictionary = FAUNA[sp_id]
	if not ponto_livre(x, z, 5.0, 25.0):
		return false
	if main.terreno.tipo_agua(x, z) != 0 or main.terreno.tipo_agua(x + 1.5, z) != 0 or main.terreno.tipo_agua(x - 1.5, z) != 0 \
			or main.terreno.tipo_agua(x, z + 1.5) != 0 or main.terreno.tipo_agua(x, z - 1.5) != 0:
		return false
	# o chão de verdade (não em cima de casa, pedra ou árvore)
	var c: Dictionary = main.chao_em(x, z)
	if absf(float(c["y"]) - main.terreno.h(x, z)) > 0.5:
		return false
	var sp := get_world_3d().direct_space_state
	var q := PhysicsShapeQueryParameters3D.new()
	var s := SphereShape3D.new()
	s.radius = float(S["r"]) + 0.4
	q.shape = s
	q.transform = Transform3D(Basis(), Vector3(x, main.terreno.h(x, z) + s.radius + 0.35, z))
	q.collision_mask = 1
	var fora: Array[RID] = [main.terreno.corpo_chao.get_rid()]
	q.exclude = fora
	if not sp.intersect_shape(q, 1).is_empty():
		return false
	# longe da base de alguém e dos lugares com nome (menos a fazenda)
	if main.construcao.base_perto(Vector3(x, 0, z), 16.0):
		return false
	for L in main.mundo.lugares_nome:
		if str(L.get("nome", "")).contains("Fazenda"):
			continue
		if Vector2(x - float(L["x"]), z - float(L["z"])).length() < 18.0:
			return false
	if rigor:
		var dm := mata(x, z)
		if sp_id in ["javali", "onca", "urso", "lobo"] and dm < 2:
			return false
		if sp_id in ["vaca", "ovelha"] and dm > 2:
			return false
	return true


func _ponto(Z: Dictionary, sp_id: String, perto: Array) -> Vector3:
	for k in 16:
		var x := 0.0
		var z := 0.0
		if bool(Z.get("rio", false)):
			var s := 0.18 + randf() * 0.66
			var rp := rio_ponto(s)
			var lw := lerpf(3.6, 5.4, s)
			var w := lw + 3.0 + randf() * maxf(1.0, float(Z["r"]) - lw - 6.0)
			var lado := -1.0 if randf() < 0.5 else 1.0
			var dir: Vector2 = rp[1]
			x = (rp[0] as Vector2).x + dir.y * w * lado
			z = (rp[0] as Vector2).y - dir.x * w * lado
		else:
			var a := randf() * TAU
			var r0 := float(Z.get("r0", 0.0))
			var r := r0 + sqrt(randf()) * (float(Z["r"]) - r0)
			x = float(Z["x"]) + cos(a) * r
			z = float(Z["z"]) + sin(a) * r
		var ok := true
		for q in perto:
			var pq: Vector3 = q["p"]
			var dp := Vector2(x - pq.x, z - pq.z).length()
			if dp < float(POP["spawnMin"]):
				ok = false
				break
			# nunca nasce na frente de quem está olhando: à vista só bem longe
			if dp < (45.0 if int(Z.get("falhas", 0)) > 6 else 75.0):
				var fr: Vector3 = q["frente"]
				var vv := Vector2(x - pq.x, z - pq.z).normalized()
				if vv.dot(Vector2(fr.x, fr.z).normalized()) > 0.3:
					ok = false
					break
		if not ok:
			continue
		if ponto_ok(x, z, sp_id, k < 11):
			Z["falhas"] = 0
			return Vector3(x, main.terreno.h(x, z), z)
	Z["falhas"] = int(Z.get("falhas", 0)) + 1
	return Vector3.INF


# ======================================================================== os bichos
func ativos() -> int:
	var n := 0
	for b in bichos:
		if is_instance_valid(b) and b.vivo:
			n += 1
	return n


func criar(sp_id: String, p: Vector3, zona_id := "", lider: Bicho = null, vd := "") -> Bicho:
	var b := Bicho.new(main, self, sp_id, vd)
	b.uid = Rede.novo_uid()
	b.zona = zona_id
	b.lider = lider
	b.off_a = randf() * TAU
	b.off_r = 1.6 + randf() * 2.4
	b.st = "repouso" if randf() < 0.35 else "explora"
	add_child(b)
	b.global_position = Vector3(p.x, main.terreno.h(p.x, p.z) + 0.15, p.z)
	bichos.append(b)
	return b


## um grupo da espécie (o primeiro é o líder; a cerva sem galhada, a cabra e a vaca às vezes marrons)
func grupo(sp_id: String, p: Vector3, q: int, zona_id: String) -> int:
	var lider: Bicho = null
	var n := 0
	for i in q:
		var a := randf() * TAU
		var r := 0.0 if i == 0 else 1.5 + randf() * 2.5
		var pp := p + Vector3(cos(a), 0, sin(a)) * r
		if i > 0 and not ponto_ok(pp.x, pp.z, sp_id, false):
			continue
		var vd := ""
		if sp_id == "cervo":
			vd = "" if (i == 0 or randf() < 0.25) else "F"
		elif sp_id == "cabra" or sp_id == "vaca":
			vd = "B" if randf() < 0.4 else ""
		var b := criar(sp_id, pp, zona_id, lider, vd)
		if lider == null:
			lider = b
		n += 1
	return n


func tirar(b) -> void:
	bichos.erase(b)
	if is_instance_valid(b):
		b.queue_free()


## o bicho morreu: a população da região baixa um
func baixa(b: Bicho) -> void:
	if b.zona != "" and pop.has(b.zona) and pop[b.zona].has(b.tipo):
		var e: Dictionary = pop[b.zona][b.tipo]
		e["n"] = maxi(0, int(e["n"]) - 1)
	mortos[b.tipo] = int(mortos.get(b.tipo, 0)) + 1


## alguém caçou: a dica de esfolar (uma vez)
func cacou(b: Bicho, _quem: int) -> void:
	main.stats["cacados"] = int(main.stats.get("cacados", 0)) + 1
	if not _dicas.has("esfolar"):
		_dicas["esfolar"] = true
		main.ui.aviso("Bicho abatido! Com uma faca (ou outra lâmina) na mochila, segure E perto da carcaça para esfolar: sai couro, carne e o que a espécie tiver.", 7.0)


func dica_ataque(b: Bicho) -> void:
	var k := "ataque_" + b.tipo
	if _dicas.has(k):
		return
	_dicas[k] = true
	var txt := "O %s revidou! Bicho encurralado ou ferido ataca." % b.nome().to_lower()
	match b.tipo:
		"urso":
			txt = "Urso! Ele defende o espaço dele: afaste-se devagar. Se ele investir, corra para longe ou suba num lugar alto. Caçar urso pede preparo: arco forte, arma de fogo ou armadilha."
		"lobo":
			txt = "Lobos atacam em grupo quando você está ferido, sozinho ou no escuro. Fogo e a base afastam a matilha. Derrube um e o resto costuma recuar."
		"onca":
			txt = "A onça chega escondida pelo mato e dá o bote. Olhar na direção dela faz ela parar; luz e fogo também afastam."
	main.ui.aviso(txt, 8.0)


## a voz de cada espécie (o banco de sons "bicho_...")
func voz(tp: String, ev: String) -> String:
	if ev == "fuga":
		return "fuga"
	if ev == "ataque":
		match tp:
			"lobo", "raposa":
				return "rosnado"
			"urso", "onca":
				return "rugido"
			"javali":
				return "grunhido"
	if ev == "dor" and tp in ["coelho", "raposa"]:
		return "guincho"
	return tp


## barulho: os bichos perto ouvem (tiro, golpe, explosão, isca)
func ouvir(p: Vector3, r: float) -> void:
	for b in bichos:
		if is_instance_valid(b) and b.vivo:
			b.ouvir(p, r)


# ======================================================================== o passo (quem abriu ou sozinho)
func passo(dt: float) -> void:
	_laco_t -= dt
	if _laco_t <= 0.0:
		_laco_t = 0.25
		_passo_lacos()
	_t -= dt
	if _t > 0.0:
		return
	_t = float(POP["checaS"])
	_pop_tick()
	var perto: Array = main.jogadores_vivos()
	if perto.is_empty():
		return
	# os longe de todo mundo voltam para a população (a carcaça longe some)
	for b in bichos.duplicate():
		if not is_instance_valid(b):
			bichos.erase(b)
			continue
		var bd := 1e9
		for q in perto:
			var pq: Vector3 = q["p"]
			bd = minf(bd, Vector2(pq.x - b.global_position.x, pq.z - b.global_position.z).length())
		if bd > float(POP["raioSome"]):
			tirar(b)
	_materializar(perto)


## liga as regiões perto de alguém: cria os bichos que faltam (até o número que a região tem), as mais perto primeiro
func _materializar(perto: Array) -> void:
	var n_ativos := ativos()
	var limite := int(POP["ativosMax"])
	var zs: Array = []
	for Z in ZONAS:
		var bd := 1e9
		var bc := 1e9
		for q in perto:
			var pq: Vector3 = q["p"]
			bd = minf(bd, dist_zona(Z, pq.x, pq.z))
			if not bool(Z.get("rio", false)):
				bc = minf(bc, Vector2(pq.x - float(Z["x"]), pq.z - float(Z["z"])).length() / float(Z["r"]))
			else:
				bc = 0.0
		if bd <= float(POP["raioAtiva"]):
			zs.append([bd, Z, bc])
	zs.sort_custom(func(a, b): return a[0] < b[0] or (a[0] == b[0] and a[2] < b[2]))
	for zi in zs.size():
		var dz: float = zs[zi][0]
		var Z: Dictionary = zs[zi][1]
		var falta := {}
		var soma := 0
		for sp_id in Z["f"]:
			var e: Dictionary = pop[Z["id"]].get(sp_id, {})
			if e.is_empty():
				continue
			var tem := 0
			for b in bichos:
				if is_instance_valid(b) and b.vivo and b.zona == str(Z["id"]) and b.tipo == sp_id:
					tem += 1
			falta[sp_id] = maxi(0, int(e["n"]) - tem)
			soma += int(falta[sp_id])
		if zi == 0 and dz <= 0.0 and soma > 0 and n_ativos + soma > int(POP["ativosMax"]):
			n_ativos -= _liberar(mini(soma, n_ativos + soma - int(POP["ativosMax"])), str(Z["id"]), perto)
		var rodou := true
		var sem_lugar := 0
		while rodou and n_ativos < limite:
			rodou = false
			for sp_id in falta:
				if int(falta[sp_id]) <= 0 or n_ativos >= limite:
					continue
				var S: Dictionary = FAUNA[sp_id]
				var gq: Array = S["grupo"]
				var q := mini(int(falta[sp_id]), randi_range(int(gq[0]), int(gq[1])))
				var pt := _ponto(Z, sp_id, perto)
				if pt == Vector3.INF:
					sem_lugar += int(falta[sp_id])
					falta[sp_id] = 0
					continue
				var g := grupo(sp_id, pt, q, str(Z["id"]))
				if g <= 0:
					sem_lugar += int(falta[sp_id])
					falta[sp_id] = 0
					continue
				falta[sp_id] = int(falta[sp_id]) - g
				n_ativos += g
				rodou = true
		if zi == 0 and dz <= 0.0 and sem_lugar > 0:
			limite = maxi(n_ativos, int(POP["ativosMax"]) - mini(sem_lugar, int(POP["ativosMax"]) - n_ativos))


## devolve à população os bichos de outras regiões que estão longe e calmos (os mais longe primeiro)
func _liberar(n: int, zona_id: String, perto: Array) -> int:
	var c: Array = []
	for b in bichos:
		if not is_instance_valid(b) or not b.vivo or b.zona == "" or b.zona == zona_id or b.st == "persegue" or b.hp < b.hp_max:
			continue
		var bd := 1e9
		for q in perto:
			var pq: Vector3 = q["p"]
			bd = minf(bd, pq.distance_to(b.global_position))
		if bd < float(POP["raioLento"]):
			continue
		c.append([bd, b])
	c.sort_custom(func(a, b): return a[0] > b[0])
	var k := 0
	for e in c:
		if k >= n:
			break
		tirar(e[1])
		k += 1
	return k


## o tempo da população (em horas de jogo): filhotes, vindos das vizinhas e as migrações
func _pop_tick() -> void:
	var tm := minutos()
	if _pop_tm < 0.0:
		_pop_tm = tm
	if migra < 0.0:
		migra = tm + 1440.0 * randi_range(int(POP["migraDias"][0]), int(POP["migraDias"][1]))
	var dth := (tm - _pop_tm) / 60.0
	if dth < 0.25:
		if dth < 0.0:
			_pop_tm = tm
		return
	_pop_tm = tm
	for Z in ZONAS:
		var zz: Dictionary = pop[Z["id"]]
		for sp_id in Z["f"]:
			if not zz.has(sp_id):
				zz[sp_id] = {"n": int(Z["f"][sp_id]), "rec": 0.0}
			var e: Dictionary = zz[sp_id]
			var cap := int(Z["f"][sp_id])
			if int(e["n"]) >= cap:
				e["rec"] = 0.0
				continue
			var taxa := float(FAUNA[sp_id]["pop"])
			if int(e["n"]) >= 2:
				taxa *= float(POP["casal"])
			elif int(e["n"]) == 0:
				taxa *= float(POP["vizinhoZerada"])
			e["rec"] = float(e["rec"]) + taxa * minf(dth, 72.0)
			while float(e["rec"]) >= 1.0 and int(e["n"]) < cap:
				e["rec"] = float(e["rec"]) - 1.0
				e["n"] = int(e["n"]) + 1
	if tm >= migra:
		migra = tm + 1440.0 * randi_range(int(POP["migraDias"][0]), int(POP["migraDias"][1]))
		_migracao()


func _migracao() -> void:
	var cands: Array = []
	for A in ZONAS:
		for sp_id in A["f"]:
			if not sp_id in ["cervo", "ovelha", "cabra", "javali", "lobo"]:
				continue
			var ea: Dictionary = pop[A["id"]][sp_id]
			if int(ea["n"]) < 2:
				continue
			for B in ZONAS:
				if B == A or not B["f"].has(sp_id):
					continue
				if int(pop[B["id"]][sp_id]["n"]) < int(B["f"][sp_id]):
					cands.append([A, B, sp_id])
	if cands.is_empty():
		return
	var c: Array = cands[randi() % cands.size()]
	var A2: Dictionary = c[0]
	var B2: Dictionary = c[1]
	var sp2: String = c[2]
	var k := mini(2, mini(int(pop[A2["id"]][sp2]["n"]) - 1, int(B2["f"][sp2]) - int(pop[B2["id"]][sp2]["n"])))
	if k <= 0:
		return
	pop[A2["id"]][sp2]["n"] = int(pop[A2["id"]][sp2]["n"]) - k
	pop[B2["id"]][sp2]["n"] = int(pop[B2["id"]][sp2]["n"]) + k
	if int(main.dia) > 1:
		main.ui.aviso("Rádio: andaram vendo %s mudando de lugar, de %s para %s. Quem caça, fica de olho." % [str(FAUNA[sp2]["pl"]), str(A2["nome"]), str(B2["nome"])], 7.0)


# ======================================================================== o laço de caça (como no jogo antigo)
## arma um laço 1,2 m na frente de quem está usando (coelhos e raposas que passarem ficam presos)
func armar_laco(j) -> String:
	var fr: Vector3 = -j.global_transform.basis.z
	fr.y = 0.0
	fr = fr.normalized()
	var p: Vector3 = j.global_position + fr * 1.2
	p.y = main.terreno.h(p.x, p.z)
	var c: Dictionary = main.chao_em(p.x, p.z, j.global_position.y + 1.0)
	if absf(float(c["y"]) - p.y) > 0.4 or main.terreno.tipo_agua(p.x, p.z) != 0 or Terreno.CIDADE.grow(2.0).has_point(Vector2(p.x, p.z)):
		return "Não dá para armar aqui (precisa de chão de terra)"
	if lacos.size() >= 12:
		return "Você já armou laços demais (12)"
	var L := {"p": p, "yaw": atan2(fr.x, fr.z), "armado": true, "tc": minutos(), "pego": ""}
	lacos.append(L)
	_desenhar_laco(L)
	main.sons.tocar("construir", p, -4.0)
	return "Laço armado. Volte depois: coelhos e raposas que passarem caem nele."


func _desenhar_laco(L: Dictionary) -> void:
	var no := Node3D.new()
	add_child(no)
	no.global_position = L["p"]
	no.rotation.y = float(L["yaw"])
	var corda := StandardMaterial3D.new()
	corda.albedo_color = Color(0.72, 0.65, 0.48)
	corda.roughness = 1.0
	var pau := StandardMaterial3D.new()
	pau.albedo_color = Color(0.35, 0.26, 0.17)
	pau.roughness = 1.0
	# o laço (um anel de corda em pé) preso em dois gravetos fincados
	var anel := MeshInstance3D.new()
	var tm := TorusMesh.new()
	tm.inner_radius = 0.11
	tm.outer_radius = 0.125
	tm.rings = 18
	tm.ring_segments = 6
	anel.mesh = tm
	anel.material_override = corda
	anel.rotation.x = PI / 2.0
	anel.position = Vector3(0, 0.15, 0)
	no.add_child(anel)
	for s in [-1.0, 1.0]:
		var g := MeshInstance3D.new()
		var cm := CylinderMesh.new()
		cm.top_radius = 0.008
		cm.bottom_radius = 0.012
		cm.height = 0.36
		g.mesh = cm
		g.material_override = pau
		g.position = Vector3(s * 0.15, 0.16, 0)
		g.rotation.z = s * 0.12
		no.add_child(g)
	var corpo := StaticBody3D.new()
	corpo.collision_layer = 2   # a mira pega (E), ninguém tropeça
	corpo.collision_mask = 0
	var cs := CollisionShape3D.new()
	var bx := BoxShape3D.new()
	bx.size = Vector3(0.5, 0.4, 0.4)
	cs.shape = bx
	cs.position.y = 0.18
	corpo.add_child(cs)
	corpo.set_meta("laco", L)
	no.add_child(corpo)
	L["no"] = no
	L["anel"] = anel


func texto_laco(L: Dictionary) -> String:
	if bool(L["armado"]):
		return "E  Recolher o laço (armado)"
	var pego := str(L.get("pego", ""))
	return "E  Armar o laço de novo" + ("  pegou: %s" % str(FAUNA[pego]["nome"]).to_lower() if pego != "" else "")


## E no laço: armado, recolhe; desarmado, arma de novo
func usar_laco(L: Dictionary, j) -> void:
	if bool(L["armado"]):
		lacos.erase(L)
		if is_instance_valid(L.get("no")):
			(L["no"] as Node3D).queue_free()
		j._ganhar("laco", 1)
		main.sons.tocar("clique", L["p"], -4.0)
		return
	L["armado"] = true
	L["pego"] = ""
	L["tc"] = minutos()
	if is_instance_valid(L.get("anel")):
		(L["anel"] as Node3D).position.y = 0.15
	main.sons.tocar("clique", L["p"], -4.0)
	main.ui.aviso("Laço armado de novo")


func _pegou(L: Dictionary, sp_id: String) -> void:
	L["armado"] = false
	L["pego"] = sp_id
	L["tc"] = minutos()
	if is_instance_valid(L.get("anel")):
		(L["anel"] as Node3D).position.y = 0.06


func _passo_lacos() -> void:
	if lacos.is_empty() or Rede.convidado():
		return
	var tm := minutos()
	var j = main.jogador
	for L in lacos:
		if not bool(L["armado"]):
			continue
		var p: Vector3 = L["p"]
		var pegou := false
		for b in bichos:
			if not is_instance_valid(b) or not b.vivo or b.lan or not b.tipo in ["coelho", "raposa"]:
				continue
			if Vector2(b.global_position.x - p.x, b.global_position.z - p.z).length() < 0.85:
				b.global_position = Vector3(p.x, b.global_position.y, p.z)
				b.morrer("laco", b.hp)
				_pegou(L, b.tipo)
				pegou = true
				break
		if pegou:
			continue
		# longe de você: a cada hora de jogo há chance de pegar algo, se a região tem bicho pequeno
		if j.global_position.distance_to(p) > 55.0 and tm - float(L["tc"]) >= 60.0:
			L["tc"] = tm
			var Z := zona_em(p.x, p.z)
			if Z.is_empty():
				continue
			for sp_id in ["coelho", "raposa"]:
				var e: Dictionary = pop[Z["id"]].get(sp_id, {})
				if e.is_empty() or int(e["n"]) <= 0:
					continue
				if randf() < (0.1 if sp_id == "coelho" else 0.03):
					var b := criar(sp_id, p, str(Z["id"]))
					b.morrer("laco", b.hp)
					_pegou(L, sp_id)
				break


# ======================================================================== esfolar
## a lâmina da mochila (faca, facão, cutelo, machado): a melhor para o couro
func lamina(inv: Inventario) -> Dictionary:
	var melhor := {}
	var mq := -99
	for s in inv.slots:
		if s == null:
			continue
		var d := Dados.item(str(s["id"]))
		if bool(d.get("esfola", false)) and int(d.get("esfolaQ", 0)) > mq:
			mq = int(d.get("esfolaQ", 0))
			melhor = s
	return melhor


## esfola (ou recolhe o resto): o que couber vai para a mochila, o resto fica na carcaça. Devolve o texto do que saiu
func esfolar(b: Bicho, j) -> String:
	if b.vivo or b.carc.is_empty() or bool(b.carc.get("vazia", false)):
		return ""
	var s := lamina(j.inv)
	if s.is_empty():
		return "Precisa de uma faca (ou outra lâmina) para esfolar"
	if int(b.carc.get("q", -1)) < 0:
		b.carc["q"] = b.qualidade(s)
	var q := int(b.carc["q"])
	var ganhos := PackedStringArray()
	var sobrou := PackedStringArray()
	var rest: Dictionary = b.carc["rest"]
	for id in rest.keys():
		var n := int(rest[id])
		if n <= 0 or not Dados.ITENS.has(id):
			continue
		var extra := {"q": q} if bool(Dados.item(id).get("qual", false)) else {}
		var antes: int = j.inv.conta(id)
		j.inv.por(id, n, extra)
		var ok: int = j.inv.conta(id) - antes
		rest[id] = n - ok
		if ok > 0:
			ganhos.append("%d %s%s" % [ok, Dados.nome(id).to_lower(), (" (%s)" % Armas.QUAL_NOME[q].to_lower()) if not extra.is_empty() else ""])
		if n - ok > 0:
			sobrou.append("%d %s" % [n - ok, Dados.nome(id).to_lower()])
	if not ganhos.is_empty():
		main.efeitos.sangue(b.centro(), Vector3.UP)
		main.sons.tocar("comer", b.global_position, 0.0)
		if j.has_method("gastar_lamina"):
			j.gastar_lamina(s, 4 if str(b.S["porte"]) == "grande" else 2)
	b.carc["esfolada"] = true
	if sobrou.is_empty():
		b.carc["vazia"] = true
		b.carc["tv"] = minutos()
		return "Esfolou: " + ", ".join(ganhos)
	return ("Esfolou: " + ", ".join(ganhos) + ". " if not ganhos.is_empty() else "") + "Mochila cheia: ficou na carcaça " + ", ".join(sobrou)


## o texto da mira na carcaça
func texto(b: Bicho, j) -> String:
	if b.vivo:
		return b.nome()
	if b.lan:
		return "E  Esfolar o %s (segure)" % b.nome().to_lower()
	if bool(b.carc.get("vazia", false)):
		return "Restos de %s" % b.nome().to_lower()
	var res := b.resumo()
	if lamina(j.inv).is_empty():
		return "Precisa de faca para esfolar  %s%s" % [b.nome(), (" · " + res) if res != "" else ""]
	return "E  %s o %s (segure)  %s" % ["Recolher o resto do" if bool(b.carc.get("esfolada", false)) else "Esfolar", b.nome().to_lower(), res]


func tempo_esfolar(b: Bicho) -> float:
	return float(b.S.get("esfola", 2.0))


# ======================================================================== salvar e carregar (a população; os bichos de agora não)
func salvar() -> Dictionary:
	var ls: Array = []
	for L in lacos:
		var p: Vector3 = L["p"]
		ls.append([p.x, p.y, p.z, float(L["yaw"]), bool(L["armado"]), float(L["tc"]), str(L.get("pego", ""))])
	return {"pop": pop, "mortos": mortos, "migra": migra, "dicas": _dicas.keys(), "lacos": ls}


func carregar(d: Dictionary) -> void:
	pop = _novo()
	var p = d.get("pop", {})
	if p is Dictionary:
		for zid in p:
			if not pop.has(zid):
				continue
			for sp_id in p[zid]:
				if pop[zid].has(sp_id) and p[zid][sp_id] is Dictionary:
					pop[zid][sp_id]["n"] = int(p[zid][sp_id].get("n", pop[zid][sp_id]["n"]))
					pop[zid][sp_id]["rec"] = float(p[zid][sp_id].get("rec", 0.0))
	mortos = d.get("mortos", {}) if d.get("mortos", {}) is Dictionary else {}
	migra = float(d.get("migra", -1.0))
	_dicas = {}
	for k in d.get("dicas", []):
		_dicas[str(k)] = true
	_pop_tm = -1.0
	limpar()
	for L in lacos:
		if is_instance_valid(L.get("no")):
			(L["no"] as Node3D).queue_free()
	lacos.clear()
	for e in d.get("lacos", []):
		if e is Array and e.size() >= 7:
			var L := {"p": Vector3(float(e[0]), float(e[1]), float(e[2])), "yaw": float(e[3]), "armado": bool(e[4]), "tc": float(e[5]), "pego": str(e[6])}
			lacos.append(L)
			_desenhar_laco(L)
			if not bool(L["armado"]):
				(L["anel"] as Node3D).position.y = 0.06


func limpar() -> void:
	for b in bichos:
		if is_instance_valid(b):
			b.queue_free()
	bichos.clear()
	b_rede.clear()


# ======================================================================== partida em rede
## quem abriu: os bichos perto de alguém (uid, posição, giro, estado, vida, velocidade, tipo, escala, lado da carcaça)
func para_rede(perto: Array, alcance: float) -> PackedFloat32Array:
	var L := PackedFloat32Array()
	for b in bichos:
		if not is_instance_valid(b):
			continue
		var bp: Vector3 = b.global_position
		for p in perto:
			if absf(p.x - bp.x) < alcance and absf(p.z - bp.z) < alcance:
				L.append_array(b.para_rede())
				break
	return L


## quem entrou: os bonecos seguem o que veio
func rede(L: PackedFloat32Array) -> void:
	var vistos := {}
	var N := 11
	for i in int(L.size() / float(N)):
		var k := i * N
		var uid := int(L[k])
		var p := Vector3(L[k + 1], L[k + 2], L[k + 3])
		if not (is_finite(p.x) and is_finite(p.y) and is_finite(p.z)):
			continue
		vistos[uid] = true
		var b = b_rede.get(uid)
		if b != null and not is_instance_valid(b):
			b = null
		if b == null:
			var ti := clampi(int(L[k + 8]), 0, TIPOS.size() - 1)
			var tp: String = TIPOS[ti]
			var vd := ""
			if fposmod(L[k + 8], 1.0) >= 0.45:
				vd = "F" if tp == "cervo" else "B"
			b = Bicho.new(main, self, tp, vd)
			b.lan = true
			b.uid = uid
			add_child(b)
			b.global_position = p
			b._lan_alvo = p
			b.yaw = L[k + 4]
			bichos.append(b)
			b_rede[uid] = b
		b.rede(p, L[k + 4], int(L[k + 5]), L[k + 6], L[k + 7], L[k + 9], L[k + 10])
	for uid in b_rede.keys():
		if not vistos.has(uid):
			var b = b_rede[uid]
			if is_instance_valid(b):
				bichos.erase(b)
				b.queue_free()
			b_rede.erase(uid)


func por_uid(uid: int) -> Bicho:
	for b in bichos:
		if is_instance_valid(b) and b.uid == uid:
			return b
	return null
