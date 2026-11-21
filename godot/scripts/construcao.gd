class_name Construcao
extends Node3D
## Construção da base. Com o plano de construção na mão (como no Rust): a aba Casa tem as peças que se encaixam numa grade
## de 3 m a partir da primeira fundação (fundação, parede, parede com porta, parede com janela, piso/teto e escada); as
## outras abas têm as construções do jogo antigo, que vão em qualquer lugar do chão: muros e portões, defesas (estacas,
## arame farpado, alarme de latas, armadilha de mandíbula, torre de vigia), móveis (camas, mesa, cadeira, estante, baú,
## despensa, armário, lamparinas), a base (fogueira, marco) e as oficinas (bancada de trabalho com nível 2, estação de couro,
## bancada de armas, fornalha, defumador, mesa de estudo, bancada de desmanche). Cada peça custa o material do jogo antigo,
## tem vida (zumbi bate até cair) e o martelo conserta.

const M := Dados.MODULO
const ALT := 3.0          # altura da parede
const FUND := 0.9         # altura da fundação acima do chão (o resto entra no chão)
const PERTO := 4.0        # distância para usar uma estação (bancada, fogueira...)
var main: Node
var ativo := false
var aba := 0
var peca := 0
var giro := 0.0
var fantasma: Node3D
var _fant_id := ""
var _fant_mat: Material = null
var mat_ok: StandardMaterial3D
var mat_nao: StandardMaterial3D
var mat_madeira: StandardMaterial3D
var mat_pedra: StandardMaterial3D
var mat_ferro: StandardMaterial3D
var mat_pano: StandardMaterial3D
var mat_couro: StandardMaterial3D
var pecas := []           # {id, xf, no, chave, vida, max, caiu?, bau?, porta?, luz?, nivel?, armada?}
var ocupado := {}         # chave -> true (celas e beiradas da grade)
var alvo := {}            # onde a peça vai (calculado a cada quadro)
var bases := []
var portas := []          # {dob, aberta, abre}
var sacos := []           # onde dá para renascer (saco de dormir e cama; vale o último)
var baus := []            # {no, inv, titulo, mochila?, chao?}
var armadilhas := []      # índices das peças que ferem zumbi
var _t_arm := 0.0
var _malhas := {}


func _init(m: Node) -> void:
	main = m


func _ready() -> void:
	mat_ok = StandardMaterial3D.new()
	mat_ok.albedo_color = Color(0.35, 0.85, 0.45, 0.35)
	mat_ok.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat_ok.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mat_nao = mat_ok.duplicate()
	mat_nao.albedo_color = Color(0.95, 0.3, 0.25, 0.35)
	mat_madeira = _mat_tex("tabua", 0.5)
	mat_pedra = _mat_tex("rocha", 0.6)
	mat_pedra.albedo_color = Color(0.85, 0.83, 0.8)
	mat_ferro = StandardMaterial3D.new()
	mat_ferro.albedo_color = Color(0.36, 0.37, 0.38)
	mat_ferro.metallic = 0.6
	mat_ferro.roughness = 0.55
	mat_pano = StandardMaterial3D.new()
	mat_pano.albedo_color = Color(0.55, 0.5, 0.42)
	mat_pano.roughness = 0.95
	mat_couro = StandardMaterial3D.new()
	mat_couro.albedo_color = Color(0.45, 0.3, 0.18)
	mat_couro.roughness = 0.9
	fantasma = Node3D.new()
	fantasma.visible = false
	add_child(fantasma)


func _mat_tex(nome: String, esc: float) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.albedo_texture = load("res://assets/tex/%s_cor.jpg" % nome)
	m.normal_enabled = true
	m.normal_texture = load("res://assets/tex/%s_nrm.jpg" % nome)
	m.uv1_triplanar = true
	m.uv1_scale = Vector3(esc, esc, esc)
	m.roughness = 0.88
	return m


func ativar(on: bool) -> void:
	ativo = on
	fantasma.visible = on
	if main.ui != null:
		main.ui.mostrar_obras(on)


# ---------------------------------------------------------------- escolha da peça
func id_atual() -> String:
	var t: Array = Dados.ABAS_OBRA[aba]["t"]
	return str(t[clampi(peca, 0, t.size() - 1)])


func peca_atual() -> Dictionary:
	return Dados.obra(id_atual())


## põe uma peça na mão do plano (usado pela interface e pelos testes)
func escolher(id: String) -> void:
	for a in Dados.ABAS_OBRA.size():
		var t: Array = Dados.ABAS_OBRA[a]["t"]
		if id in t:
			aba = a
			peca = t.find(id)
			if main.ui != null:
				main.ui.mostrar_obras(ativo)
			return


## a obra está liberada? ("" = sim; senão, o que falta)
func liberada(id: String) -> String:
	var ob := Dados.obra(id)
	var db := str(ob.get("desb", ""))
	match db:
		"", "<null>":
			return ""
		"noite1":
			return "" if main.dia >= 2 else "Libera depois de sobreviver à primeira noite"
		"oficina":
			return "" if nivel_bancada_perto(main.jogador.global_position, 40.0) >= 2 else "Precisa de uma bancada de trabalho nível 2 na base"
		_:
			return "" if main.jogador.aprendidas.has(db) else "Aprenda lendo: %s" % Dados.nome(db)


func _process(dt: float) -> void:
	_t_arm -= dt
	if _t_arm <= 0.0:
		_t_arm = 0.25
		_armadilhas(0.25)
	if not ativo or not main.jogador.vivo or main.jogador.preso:
		fantasma.visible = false
		return
	var t: Array = Dados.ABAS_OBRA[aba]["t"]
	if Input.is_action_just_pressed("mirar"):
		peca = (peca + 1) % t.size()
		main.sons.tocar("clique", main.jogador.global_position, -10.0)
		main.ui.mostrar_obras(true)
	if Input.is_action_just_pressed("aba_obra"):
		aba = (aba + 1) % Dados.ABAS_OBRA.size()
		peca = 0
		main.sons.tocar("clique", main.jogador.global_position, -10.0)
		main.ui.mostrar_obras(true)
	if Input.is_action_just_pressed("girar"):
		giro += PI / 2.0 if bool(peca_atual().get("grade", false)) else PI / 8.0
	var idp := id_atual()
	alvo = _calcular()
	fantasma.visible = not alvo.is_empty()
	if alvo.is_empty():
		return
	_fantasma(idp)
	fantasma.global_transform = alvo["xf"]
	var pode: bool = alvo["ok"] and main.jogador.inv.tem(Dados.custo(peca_atual())) and liberada(idp) == ""
	var mt: Material = mat_ok if pode else mat_nao
	if mt != _fant_mat:
		_fant_mat = mt
		for mi in fantasma.find_children("*", "MeshInstance3D", true, false):
			(mi as MeshInstance3D).material_override = mt
	if Input.is_action_just_pressed("atacar"):
		if pode:
			colocar(idp, alvo["xf"], alvo["chave"])
		elif liberada(idp) != "":
			main.ui.aviso(liberada(idp))
		elif not main.jogador.inv.tem(Dados.custo(peca_atual())):
			main.ui.aviso("Falta material: " + Dados.custo_txt(Dados.custo(peca_atual())))


## a prévia da peça: a própria peça (sem colisão), verde se dá para construir ali e vermelha se não
func _fantasma(id: String) -> void:
	if id == _fant_id:
		return
	_fant_id = id
	_fant_mat = null
	for c in fantasma.get_children():
		c.queue_free()
	var no := Node3D.new()
	fantasma.add_child(no)
	if bool(Dados.obra(id).get("grade", false)):
		var mi := MeshInstance3D.new()
		mi.mesh = _malha(id)
		mi.position = Vector3(0, _meio(id), 0)
		no.add_child(mi)
	else:
		_montar(id, no, false)
	for mi in no.find_children("*", "MeshInstance3D", true, false):
		(mi as MeshInstance3D).cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	for l in no.find_children("*", "Light3D", true, false):
		l.queue_free()
	for p in no.find_children("*", "CPUParticles3D", true, false):
		p.queue_free()


func _calcular() -> Dictionary:
	var id := id_atual()
	if bool(Dados.obra(id).get("grade", false)):
		return _calcular_grade(id)
	return _calcular_livre(id)


## obra livre: no chão (ou no piso da casa) onde a mira bate, virada para onde você olha (R gira)
func _calcular_livre(id: String) -> Dictionary:
	var j = main.jogador
	var h: Dictionary = j.mira(7.0, 1)
	if h.is_empty():
		return {}
	var p: Vector3 = h["position"]
	var n: Vector3 = h["normal"]
	var xf := Transform3D(Basis(Vector3.UP, j.rotation.y + PI + giro), p)
	var ok: bool = n.y > 0.55 and p.distance_to(j.global_position) < 7.0
	if ok and bool(Dados.obra(id).get("solid", false)):
		ok = _livre_sem_obstaculo(id, xf)
	return {"xf": xf, "ok": ok, "chave": ""}


func _tam(id: String) -> Vector3:
	var ob := Dados.obra(id)
	var h := float(ob.get("hCol", 0.0))
	if h <= 0.0:
		h = _altura_padrao(id)
	return Vector3(float(ob.get("hw", 0.5)) * 2.0, h, float(ob.get("hd", 0.5)) * 2.0)


func _altura_padrao(id: String) -> float:
	match id:
		"barricada":
			return 1.4
		"muro", "muroFerro", "portao", "portaoFerro":
			return 2.4
		"muroPedra":
			return 2.0
		"portaoGrande":
			return 3.0
		"tabuasPorta":
			return 2.1
		"tabuasJanela", "tabuasJanelaX":
			return 1.0
		"fogueira":
			return 0.5
		"bau":
			return 0.7
		"despensa":
			return 1.2
		"armarioFerro":
			return 1.9
		"prateleira":
			return 2.0
		"bancadaTrab", "bancadaArmas", "estacaoCouro":
			return 1.0
		"fornalha":
			return 1.5
		"defumador":
			return 1.1
	return 1.0


## não entra em árvore, pedra, parede nem em outra obra (o chão e o piso não contam)
func _livre_sem_obstaculo(id: String, xf: Transform3D) -> bool:
	var tam := _tam(id)
	var q := PhysicsShapeQueryParameters3D.new()
	var caixa := BoxShape3D.new()
	caixa.size = Vector3(maxf(tam.x - 0.15, 0.1), maxf(tam.y - 0.25, 0.1), maxf(tam.z - 0.15, 0.1))
	q.shape = caixa
	q.transform = xf * Transform3D(Basis(), Vector3(0, tam.y / 2.0 + 0.15, 0))
	q.collision_mask = 1
	var fora: Array[RID] = [main.terreno.corpo_chao.get_rid(), main.jogador.get_rid()]
	q.exclude = fora
	return get_world_3d().direct_space_state.intersect_shape(q, 1).is_empty()


## celas da base: cada fundação/piso tem posição (base, i, k, andar); beiradas entre celas
func _calcular_grade(id: String) -> Dictionary:
	var j = main.jogador
	var h: Dictionary = j.mira(9.0, 1)
	var p: Vector3
	if h.is_empty():
		p = j.olho() - j.cam.global_transform.basis.z * 4.0
	else:
		p = h["position"]
	var yaw: float = j.rotation.y + giro
	# a base mais perto manda na grade
	var base = _base_perto(p)
	if id == "fundacao":
		if base == null:
			var y: float = main.terreno.h(p.x, p.z)
			var xf := Transform3D(Basis(Vector3.UP, yaw), Vector3(p.x, y + FUND, p.z))
			return {"xf": xf, "ok": p.distance_to(j.global_position) < 10.0 and _plano(xf) and _sem_obstaculo(xf), "chave": "c|%d|%d|%d|0" % [pecas.size() + 1000, 0, 0], "nova": true}
		var c := _cela(base, p)
		var xf := _xf_cela(base, c.x, c.y, 0)
		var chave := "c|%d|%d|%d|0" % [base["id"], c.x, c.y]
		return {"xf": xf, "ok": not ocupado.has(chave) and _plano(xf) and _sem_obstaculo(xf), "chave": chave}
	if base == null:
		return {}
	# paredes, piso e escada: o ponto é onde a mira cruza a altura do andar em que você está (mais 1,2 m)
	var o: Vector3 = j.olho()
	var dv: Vector3 = -j.cam.global_transform.basis.z
	var nivel: float = base["y"] + maxf(0.0, round((j.global_position.y - base["y"]) / ALT)) * ALT + (1.2 if id != "piso" else ALT - 0.2)
	if absf(dv.y) > 0.04:
		var t: float = (nivel - o.y) / dv.y
		if t > 0.0 and t < 9.0:
			p = o + dv * t
	var andar := clampi(int(floor((p.y - base["y"] + 0.4) / ALT)), 0, 3)
	if id == "piso":
		var c2 := _cela(base, p)
		var xf2 := _xf_cela(base, c2.x, c2.y, maxi(andar, 1))
		var chave2 := "c|%d|%d|%d|%d" % [base["id"], c2.x, c2.y, maxi(andar, 1)]
		var sem_escada := not ocupado.has("e|%d|%d|%d|%d" % [base["id"], c2.x, c2.y, maxi(andar, 1) - 1])
		return {"xf": xf2, "ok": not ocupado.has(chave2) and sem_escada and _tem_apoio(base, c2, maxi(andar, 1)), "chave": chave2}
	if id == "escada":
		var c3 := _cela(base, p)
		var xf3 := _xf_cela(base, c3.x, c3.y, andar)
		xf3.basis = Basis(Vector3.UP, base["yaw"] + round(giro / (PI / 2.0)) * PI / 2.0)
		var chave3 := "e|%d|%d|%d|%d" % [base["id"], c3.x, c3.y, andar]
		return {"xf": xf3, "ok": not ocupado.has(chave3) and ocupado.has("c|%d|%d|%d|%d" % [base["id"], c3.x, c3.y, andar]), "chave": chave3}
	# paredes: a beirada mais perto de uma cela que existe
	var loc: Vector3 = base["inv"] * p
	var fi := loc.x / M
	var fk := loc.z / M
	var i := int(round(fi))
	var k := int(round(fk))
	var dx := fi - i
	var dk := fk - k
	var lado := ""
	var bi := i
	var bk := k
	if absf(dx) > absf(dk):
		lado = "x"
		bi = i if dx > 0 else i - 1
	else:
		lado = "z"
		bk = k if dk > 0 else k - 1
	var centro: Vector3
	var bas: Basis
	if lado == "x":
		centro = Vector3((bi + 0.5) * M, 0, k * M)
		bas = Basis(Vector3.UP, PI / 2.0)
	else:
		centro = Vector3(i * M, 0, (bk + 0.5) * M)
		bas = Basis()
	var chave4 := "b|%d|%s|%d|%d|%d" % [base["id"], lado, bi if lado == "x" else i, k if lado == "x" else bk, andar]
	var apoio := false
	for c4 in [Vector2i(bi, k), Vector2i(bi + 1, k)] if lado == "x" else [Vector2i(i, bk), Vector2i(i, bk + 1)]:
		if ocupado.has("c|%d|%d|%d|%d" % [base["id"], c4.x, c4.y, andar]):
			apoio = true
	var g: Transform3D = base["xf"] * Transform3D(bas, centro + Vector3(0, base["y_loc"] + andar * ALT, 0))
	return {"xf": g, "ok": apoio and not ocupado.has(chave4), "chave": chave4}


func _base_perto(p: Vector3):
	var melhor = null
	var md := 12.0
	for b in bases:
		var loc: Vector3 = b["inv"] * p
		var d: float = Vector2(loc.x, loc.z).length() - float(b["raio"])
		if d < md:
			md = d
			melhor = b
	return melhor


func _cela(base: Dictionary, p: Vector3) -> Vector2i:
	var loc: Vector3 = base["inv"] * p
	return Vector2i(int(round(loc.x / M)), int(round(loc.z / M)))


func _xf_cela(base: Dictionary, i: int, k: int, andar: int) -> Transform3D:
	return base["xf"] * Transform3D(Basis(), Vector3(i * M, base["y_loc"] + andar * ALT, k * M))


func _tem_apoio(base: Dictionary, c: Vector2i, andar: int) -> bool:
	var n := 0
	for lado in [["x", c.x, c.y], ["x", c.x - 1, c.y], ["z", c.x, c.y], ["z", c.x, c.y - 1]]:
		if ocupado.has("b|%d|%s|%d|%d|%d" % [base["id"], lado[0], lado[1], lado[2], andar - 1]):
			n += 1
	for v in [Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1)]:
		if ocupado.has("c|%d|%d|%d|%d" % [base["id"], c.x + v.x, c.y + v.y, andar]):
			n += 2
	return n >= 2


## a fundação precisa de chão mais ou menos plano embaixo (até 1,4 m de desnível entre os cantos)
func _plano(xf: Transform3D) -> bool:
	var ys := []
	for v in [Vector3(-1.4, 0, -1.4), Vector3(1.4, 0, -1.4), Vector3(-1.4, 0, 1.4), Vector3(1.4, 0, 1.4)]:
		var w: Vector3 = xf * (v as Vector3)
		ys.append(main.terreno.h(w.x, w.z))
	return ys.max() - ys.min() < 1.4


## a fundação não entra em árvore, pedra, tronco nem barraco (o chão não conta)
func _sem_obstaculo(xf: Transform3D) -> bool:
	var q := PhysicsShapeQueryParameters3D.new()
	var caixa := BoxShape3D.new()
	caixa.size = Vector3(M - 0.3, 1.6, M - 0.3)
	q.shape = caixa
	q.transform = xf * Transform3D(Basis(), Vector3(0, -0.9, 0))
	q.collision_mask = 1
	var fora: Array[RID] = [main.terreno.corpo_chao.get_rid()]
	q.exclude = fora
	return get_world_3d().direct_space_state.intersect_shape(q, 1).is_empty()


# ---------------------------------------------------------------- construir
func colocar(id: String, xf: Transform3D, chave: String) -> void:
	if not main.jogador.inv.pagar(Dados.custo(Dados.obra(id))):
		return
	var ob := Dados.obra(id)
	if bool(ob.get("grade", false)):
		if id == "fundacao" and alvo.get("nova", false):
			# base nova: a grade nasce desta fundação (no alto do chão, para não ficar enterrada)
			var b := {"id": bases.size(), "xf": Transform3D(xf.basis, xf.origin - Vector3(0, FUND, 0)), "y": xf.origin.y, "y_loc": FUND,
				"raio": M * 0.8, "yaw": xf.basis.get_euler().y}
			b["inv"] = b["xf"].affine_inverse()
			bases.append(b)
			chave = "c|%d|0|0|0" % b["id"]
			xf = _xf_cela(b, 0, 0, 0)
		elif id == "fundacao":
			var b2 = _base_perto(xf.origin)
			if b2:
				var loc: Vector3 = b2["inv"] * xf.origin
				b2["raio"] = maxf(b2["raio"], Vector2(loc.x, loc.z).length() + M * 0.8)
	_criar(id, xf, chave, float(ob.get("hp", 200.0)), {})
	main.sons.tocar("construir", xf.origin, 0.0)
	main.ui.aviso("Construiu: " + str(ob.get("nome", id)))


## monta a peça (ao construir e ao carregar o jogo salvo); devolve o índice dela
func _criar(id: String, xf: Transform3D, chave: String, vida: float, extra: Dictionary) -> int:
	var ob := Dados.obra(id)
	var idx := pecas.size()
	var pe := {"id": id, "xf": xf, "chave": chave, "vida": vida, "max": float(ob.get("hp", 200.0))}
	pecas.append(pe)
	var no: Node3D
	if bool(ob.get("grade", false)):
		if chave != "":
			ocupado[chave] = true
		no = _no(id, xf, idx)
	else:
		no = Node3D.new()
		no.transform = xf
		_montar(id, no, true, idx)
	add_child(no)
	pe["no"] = no
	for sb in no.find_children("*", "StaticBody3D", true, false):
		if not sb.has_meta("porta"):
			sb.set_meta("peca", idx)
	# o que cada uma faz
	if bool(ob.get("bau", false)):
		var inv := Inventario.new(Dados.BAU_N, false)
		if extra.has("inv"):
			inv.carregar(extra["inv"])
		pe["bau"] = baus.size()
		baus.append({"no": no, "inv": inv, "titulo": str(ob.get("nome", "Baú")), "peca": idx})
	if bool(ob.get("armadilha", false)) or bool(ob.get("latas", false)):
		armadilhas.append(idx)
		pe["armada"] = bool(extra.get("armada", true))
	if id == "bancadaTrab":
		pe["nivel"] = int(extra.get("nivel", 1))
		if int(pe["nivel"]) >= 2:
			_enfeite_nivel2(no)
	if bool(ob.get("cama", false)) or id == "camaMadeira":
		sacos.append(xf.origin)
	if extra.get("aberta", false) and pe.has("porta"):
		alternar_porta(int(pe["porta"]), true)
	if extra.has("luz") and pe.has("luz") and not bool(extra["luz"]):
		(pe["luz"] as Light3D).visible = false
	return idx


## zumbi batendo numa peça (a noite pode derrubar parede e porta); quando a vida acaba, a peça cai
func ferir_peca(i: int, dano: float, onde: Vector3) -> void:
	var pe: Dictionary = pecas[i]
	if pe.get("caiu", false):
		return
	pe["vida"] = float(pe["vida"]) - dano
	main.sons.tocar("madeira", onde, -2.0)
	main.efeitos.lascas(onde, Vector3.UP, "madeira")
	if float(pe["vida"]) <= 0.0:
		_cair(i)
		main.sons.tocar("construir", onde, 4.0)
		main.ui.aviso("Caiu: " + Dados.nome(str(pe["id"])) + "!")


func _cair(i: int) -> void:
	var pe: Dictionary = pecas[i]
	pe["caiu"] = true
	if str(pe.get("chave", "")) != "":
		ocupado.erase(pe["chave"])
	if pe.has("bau"):
		# o que estava guardado cai no chão
		var inv: Inventario = baus[int(pe["bau"])]["inv"]
		var p: Vector3 = (pe["xf"] as Transform3D).origin
		var tem := false
		for s in inv.slots:
			if s != null:
				tem = true
		if tem:
			por_mochila(p, inv, "O que estava guardado")
	(pe["no"] as Node3D).queue_free()


## martelo: conserta a peça inteira (gasta 30% do material que ela custou)
func consertar(i: int, inv: Inventario) -> String:
	var pe: Dictionary = pecas[i]
	if pe.get("caiu", false) or float(pe["vida"]) >= float(pe["max"]):
		return "Não precisa de conserto."
	var c := {}
	var custo := Dados.custo(Dados.obra(str(pe["id"])))
	for k in custo:
		c[k] = maxi(1, ceili(float(custo[k]) * 0.3))
	if not inv.pagar(c):
		return "Faltam materiais para consertar: " + Dados.custo_txt(c)
	pe["vida"] = pe["max"]
	main.sons.tocar("construir", (pe["no"] as Node3D).global_position, -4.0)
	main.ui.aviso("Consertou: %s (%s)" % [Dados.nome(str(pe["id"])), Dados.custo_txt(c)])
	return ""


func peca_viva(i: int) -> bool:
	return i >= 0 and i < pecas.size() and not pecas[i].get("caiu", false)


# ---------------------------------------------------------------- estações e uso (E)
## tem uma estação deste tipo ("1", "2", "couro", "forja", "fogo"...) a até 4 m?
func estacao_perto(e: String, p: Vector3) -> bool:
	var ob_id := Dados.obra_da_estacao(e)
	if ob_id == "":
		return false
	for pe in pecas:
		if pe.get("caiu", false) or str(pe["id"]) != ob_id:
			continue
		if (pe["xf"] as Transform3D).origin.distance_to(p) > PERTO:
			continue
		if e == "2" and int(pe.get("nivel", 1)) < 2:
			continue
		return true
	return false


func nivel_bancada_perto(p: Vector3, dist := PERTO) -> int:
	var n := 0
	for pe in pecas:
		if not pe.get("caiu", false) and str(pe["id"]) == "bancadaTrab" and (pe["xf"] as Transform3D).origin.distance_to(p) <= dist:
			n = maxi(n, int(pe.get("nivel", 1)))
	return n


## melhora a bancada mais perto para o nível 2 (receitas de oficina)
func melhorar_bancada(inv: Inventario, p: Vector3) -> String:
	var alvo_i := -1
	for i in pecas.size():
		var pe: Dictionary = pecas[i]
		if not pe.get("caiu", false) and str(pe["id"]) == "bancadaTrab" and (pe["xf"] as Transform3D).origin.distance_to(p) <= PERTO:
			if int(pe.get("nivel", 1)) < 2:
				alvo_i = i
	if alvo_i < 0:
		return "Precisa estar perto de uma bancada de trabalho nível 1"
	var c := Dados.custo(Dados.MELHORA_BANCADA)
	if not inv.pagar(c):
		return "Falta material: " + Dados.custo_txt(c)
	pecas[alvo_i]["nivel"] = 2
	_enfeite_nivel2(pecas[alvo_i]["no"])
	main.sons.tocar("construir", p, 0.0)
	return ""


func interagir(i: int, j) -> void:
	if not peca_viva(i):
		return
	var pe: Dictionary = pecas[i]
	var id: String = pe["id"]
	var ob := Dados.obra(id)
	if pe.has("bau"):
		main.ui.abrir_bau(baus[int(pe["bau"])]["inv"], str(ob.get("nome", "Baú")))
		return
	if pe.has("porta"):
		alternar_porta(int(pe["porta"]))
		return
	match id:
		"fogueira":
			cozinhar(j)
		"cama", "camaMadeira":
			sacos.erase((pe["xf"] as Transform3D).origin)
			sacos.append((pe["xf"] as Transform3D).origin)
			main.ui.aviso("Se morrer, você renasce nesta cama")
		"armadilhaUrso":
			if not pe.get("armada", true):
				pe["armada"] = true
				main.ui.aviso("Armadilha armada de novo")
			else:
				main.ui.aviso("A armadilha está armada")
		"lamparina", "lampParede":
			if pe.has("luz"):
				var l: Light3D = pe["luz"]
				l.visible = not l.visible
		"marcoBase":
			main.ui.aviso("Marco da base: %d construções a até 34 m" % _pecas_perto((pe["xf"] as Transform3D).origin, 34.0), 4.0)
		_:
			if ob.has("estacao") or id == "bancadaTrab":
				main.ui.abrir(true)
			else:
				main.ui.aviso(str(ob.get("nome", id)))


func _pecas_perto(p: Vector3, r: float) -> int:
	var n := 0
	for pe in pecas:
		if not pe.get("caiu", false) and (pe["xf"] as Transform3D).origin.distance_to(p) <= r:
			n += 1
	return n


## fogueira: assa carne e peixe, cozinha ovo e caranguejo, ferve a água suja e tira sal da água do mar (como no jogo antigo)
func cozinhar(j) -> void:
	var feitos := []
	for c in Dados.COZINHA:
		var de := str(c["de"])
		var n: int = j.inv.conta(de)
		if n <= 0 or not Dados.ITENS.has(str(c["para"])):
			continue
		j.inv.tirar(de, n)
		j._ganhar(str(c["para"]), n)
		feitos.append("%d %s" % [n, str(c["nn"]) if n > 1 else str(c["n1"])])
	if feitos.is_empty():
		main.ui.aviso("Nada para a fogueira (carne crua, peixe, ovo, caranguejo, água suja ou água do mar)")
	else:
		main.ui.aviso("Na fogueira: " + ", ".join(feitos), 3.5)
		main.sons.tocar("comer", j.global_position, -6.0)


# ---------------------------------------------------------------- armadilhas
func _armadilhas(dt: float) -> void:
	if armadilhas.is_empty():
		return
	for i in armadilhas:
		var pe: Dictionary = pecas[i]
		if pe.get("caiu", false):
			continue
		var id: String = pe["id"]
		var tam := _tam(id)
		var inv_xf: Transform3D = (pe["xf"] as Transform3D).affine_inverse()
		pe["tocou"] = maxf(0.0, float(pe.get("tocou", 0.0)) - dt)
		for z in main.zumbis:
			if not is_instance_valid(z) or z.estado == "morto":
				continue
			var zp: Vector3 = z.global_position
			var loc: Vector3 = inv_xf * zp
			if absf(loc.x) > tam.x / 2.0 + 0.3 or absf(loc.z) > tam.z / 2.0 + 0.3 or absf(loc.y) > 1.6:
				continue
			var c: Vector3 = (pe["xf"] as Transform3D).origin
			match id:
				"estacas":
					z.ferir(14.0 * dt, c, 0, {"k": "armadilha"})
					z.atrasar(0.6)
					pe["vida"] = float(pe["vida"]) - 3.0 * dt
				"espetosFerro":
					z.ferir(26.0 * dt, c, 0, {"k": "armadilha"})
					z.atrasar(0.6)
					pe["vida"] = float(pe["vida"]) - 1.5 * dt
				"arame":
					z.ferir(8.0 * dt, c, 0, {"k": "armadilha"})
					z.atrasar(0.9)
					pe["vida"] = float(pe["vida"]) - 2.0 * dt
				"armadilhaUrso":
					if pe.get("armada", true):
						pe["armada"] = false
						z.ferir(45.0, c, 0, {"k": "armadilha"})
						z.prender(5.0)
						main.sons.tocar("acerto", c, 2.0)
				"latas":
					if float(pe["tocou"]) <= 0.0:
						pe["tocou"] = 8.0
						main.sons.tocar("porta", c, 6.0)
						main.ui.aviso("O alarme de latas tocou!", 3.0)
			if float(pe["vida"]) <= 0.0:
				_cair(i)
				break


# ---------------------------------------------------------------- desenho das peças da grade
func _meio(id: String) -> float:
	match id:
		"fundacao":
			return -(FUND + 1.5) / 2.0
		"piso":
			return -0.1
	return ALT / 2.0


func _malha(id: String) -> Mesh:
	if _malhas.has(id):
		return _malhas[id]
	var bm := BoxMesh.new()
	_malhas[id] = bm
	match id:
		"fundacao":
			bm.size = Vector3(M, FUND + 1.5, M)
		"piso":
			bm.size = Vector3(M, 0.2, M)
		"escada":
			bm.size = Vector3(M - 0.1, ALT, M - 0.1)
		_:
			bm.size = Vector3(M, ALT, 0.22)
	return bm


## o nó da peça da grade: madeira com textura, colisão de verdade (porta com vão e folha que abre, janela com vão)
func _no(id: String, xf: Transform3D, idx := -1) -> Node3D:
	var no := Node3D.new()
	no.transform = xf
	match id:
		"fundacao":
			_bloco(no, Vector3(M, FUND + 1.5, M), Vector3(0, -(FUND + 1.5) / 2.0, 0))
		"piso":
			_bloco(no, Vector3(M, 0.2, M), Vector3(0, -0.1, 0))
		"parede":
			_bloco(no, Vector3(M, ALT, 0.22), Vector3(0, ALT / 2.0, 0))
		"janela":
			_bloco(no, Vector3(M, 1.0, 0.22), Vector3(0, 0.5, 0))
			_bloco(no, Vector3(M, 0.9, 0.22), Vector3(0, ALT - 0.45, 0))
			_bloco(no, Vector3(0.9, 1.1, 0.22), Vector3(-1.05, 1.55, 0))
			_bloco(no, Vector3(0.9, 1.1, 0.22), Vector3(1.05, 1.55, 0))
		"porta":
			_bloco(no, Vector3(0.95, ALT, 0.22), Vector3(-1.025, ALT / 2.0, 0))
			_bloco(no, Vector3(0.95, ALT, 0.22), Vector3(1.025, ALT / 2.0, 0))
			_bloco(no, Vector3(1.1, ALT - 2.2, 0.22), Vector3(0, 2.2 + (ALT - 2.2) / 2.0, 0))
			_folha(no, idx, Vector3(-0.55, 0, 0), Vector3(1.08, 2.18, 0.08), mat_madeira)
		"escada":
			# escada em U dentro da cela: sobe pela esquerda até o patamar do fundo e volta pela direita até o andar de
			# cima. Os degraus são só desenho; quem segura o pé são duas rampas lisas (sobem a 37°, dá para andar).
			var meia := ALT / 2.0
			var deg := 8
			var passo_z := 2.0 / deg
			var alt_d := meia / deg
			for s in deg:
				var topo_a := (s + 1) * alt_d
				_visual(no, Vector3(1.4, topo_a, passo_z), Vector3(-0.75, topo_a / 2.0, 1.45 - (s + 0.5) * passo_z))
				var topo_b := meia + (s + 1) * alt_d
				_visual(no, Vector3(1.4, topo_b, passo_z), Vector3(0.75, topo_b / 2.0, -0.55 + (s + 0.5) * passo_z))
			_bloco(no, Vector3(2.9, meia, 0.9), Vector3(0, meia / 2.0, -1.0))
			var ang := atan2(meia, 2.0)
			var comp := Vector2(2.0, meia).length()
			_rampa(no, Vector3(1.4, 0.1, comp), Transform3D(Basis(Vector3.RIGHT, ang), Vector3(-0.75, meia / 2.0 - 0.05, 0.45)))
			_rampa(no, Vector3(1.4, 0.1, comp), Transform3D(Basis(Vector3.RIGHT, -ang), Vector3(0.75, meia + meia / 2.0 - 0.05, 0.45)))
			_rampa(no, Vector3(1.4, meia, 2.0), Transform3D(Basis(), Vector3(0.75, meia / 2.0, 0.45)))   # embaixo do lance de cima
	return no


## a folha da porta ou do portão: gira na dobradiça com E
func _folha(no: Node3D, idx: int, dobradica: Vector3, tam: Vector3, mat: Material, abre := -1.0) -> void:
	var dob := Node3D.new()
	dob.position = dobradica
	no.add_child(dob)
	var folha: StaticBody3D = _bloco(dob, tam, Vector3(tam.x / 2.0 * (1.0 if abre < 0.0 else -1.0), tam.y / 2.0, 0), mat)
	folha.set_meta("porta", portas.size())
	if idx >= 0:
		folha.set_meta("peca", idx)
		pecas[idx]["porta"] = portas.size()
	portas.append({"dob": dob, "aberta": false, "abre": abre})


## só o desenho (sem colisão)
func _visual(pai: Node3D, tam: Vector3, pos: Vector3, mat: Material = null) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	var bm := BoxMesh.new()
	bm.size = tam
	mi.mesh = bm
	mi.material_override = mat if mat != null else mat_madeira
	mi.position = pos
	pai.add_child(mi)
	return mi


## só a colisão (rampa da escada)
func _rampa(pai: Node3D, tam: Vector3, xf: Transform3D) -> void:
	var sb := StaticBody3D.new()
	var cs := CollisionShape3D.new()
	var bs := BoxShape3D.new()
	bs.size = tam
	cs.shape = bs
	sb.add_child(cs)
	sb.transform = xf
	pai.add_child(sb)


func _bloco(pai: Node3D, tam: Vector3, pos: Vector3, mat: Material = null) -> StaticBody3D:
	_visual(pai, tam, pos, mat)
	var sb := StaticBody3D.new()
	var cs := CollisionShape3D.new()
	var bs := BoxShape3D.new()
	bs.size = tam
	cs.shape = bs
	sb.add_child(cs)
	sb.position = pos
	pai.add_child(sb)
	return sb


func alternar_porta(i: int, sem_som := false) -> void:
	var p: Dictionary = portas[i]
	p["aberta"] = not p["aberta"]
	var tw := create_tween()
	tw.tween_property(p["dob"], "rotation:y", float(p["abre"]) * PI / 2.0 if p["aberta"] else 0.0, 0.35).set_trans(Tween.TRANS_SINE)
	if not sem_som:
		main.sons.tocar("porta", (p["dob"] as Node3D).global_position, 0.0)


# ---------------------------------------------------------------- desenho das obras livres
## monta a obra no nó (desenho e, se "colide", a colisão; quem não segura passagem fica só na mira, para o E e o martelo)
func _montar(id: String, no: Node3D, colide: bool, idx := -1) -> void:
	var ob := Dados.obra(id)
	var tam := _tam(id)
	var solido: bool = bool(ob.get("solid", false))
	var hw := tam.x / 2.0
	var h := tam.y
	match id:
		"barricada":
			for s in [-1.0, 1.0]:
				_visual(no, Vector3(0.14, 1.4, 0.14), Vector3(s * 1.3, 0.7, 0))
			for k in 4:
				var pl := _visual(no, Vector3(2.9, 0.22, 0.06), Vector3(0, 0.3 + k * 0.32, 0.09 * (1 if k % 2 == 0 else -1)))
				pl.rotation.z = (0.18 if k % 2 == 0 else -0.14)
		"muro", "muroFerro":
			var mt: Material = mat_ferro if id == "muroFerro" else mat_madeira
			for k in 8:
				_visual(no, Vector3(0.36, 2.4, 0.08 + 0.04 * (k % 2)), Vector3(-1.31 + k * 0.375, 1.2, 0), mt)
			_visual(no, Vector3(3.0, 0.14, 0.18), Vector3(0, 0.5, -0.1), mat_madeira)
			_visual(no, Vector3(3.0, 0.14, 0.18), Vector3(0, 1.9, -0.1), mat_madeira)
		"muroPedra":
			_visual(no, Vector3(3.0, 2.0, 0.52), Vector3(0, 1.0, 0), mat_pedra)
			_visual(no, Vector3(3.1, 0.16, 0.6), Vector3(0, 2.05, 0), mat_pedra)
		"muralha":
			_visual(no, Vector3(3.0, 3.1, 0.84), Vector3(0, 1.55, 0), mat_pedra)
			for k in 3:
				_visual(no, Vector3(0.6, 0.5, 0.84), Vector3(-1.0 + k * 1.0, 3.35, 0), mat_pedra)
		"palicada":
			for k in 9:
				var tr := MeshInstance3D.new()
				var cm := CylinderMesh.new()
				cm.top_radius = 0.16
				cm.bottom_radius = 0.17
				cm.height = 3.0
				cm.radial_segments = 8
				tr.mesh = cm
				tr.material_override = mat_madeira
				tr.position = Vector3(-1.33 + k * 0.333, 1.5, 0)
				no.add_child(tr)
				var ponta := MeshInstance3D.new()
				var pm := CylinderMesh.new()
				pm.top_radius = 0.0
				pm.bottom_radius = 0.16
				pm.height = 0.4
				pm.radial_segments = 8
				ponta.mesh = pm
				ponta.material_override = mat_madeira
				ponta.position = Vector3(-1.33 + k * 0.333, 3.2, 0)
				no.add_child(ponta)
		"portao", "portaoFerro", "portaoGrande":
			var mt2: Material = mat_ferro if id == "portaoFerro" else mat_madeira
			var larg := tam.x
			for s in [-1.0, 1.0]:
				var pp := Vector3(s * (larg / 2.0 - 0.11), (h + 0.2) / 2.0, 0)
				if colide:
					_bloco(no, Vector3(0.22, h + 0.2, 0.22), pp)
				else:
					_visual(no, Vector3(0.22, h + 0.2, 0.22), pp)
			if id == "portaoGrande":
				if colide:
					_folha(no, idx, Vector3(-larg / 2.0 + 0.22, 0, 0), Vector3(larg / 2.0 - 0.24, h - 0.1, 0.1), mt2)
					_folha(no, idx, Vector3(larg / 2.0 - 0.22, 0, 0), Vector3(larg / 2.0 - 0.24, h - 0.1, 0.1), mt2, 1.0)
				else:
					_visual(no, Vector3(larg - 0.5, h - 0.1, 0.1), Vector3(0, h / 2.0, 0), mt2)
			else:
				if colide:
					_folha(no, idx, Vector3(-larg / 2.0 + 0.22, 0, 0), Vector3(larg - 0.46, h - 0.1, 0.1), mt2)
				else:
					_visual(no, Vector3(larg - 0.46, h - 0.1, 0.1), Vector3(0, h / 2.0, 0), mt2)
			solido = false   # a colisão já está nos postes e na folha
		"estacas", "espetosFerro":
			var mt3: Material = mat_ferro if id == "espetosFerro" else mat_madeira
			for k in 6:
				var st := MeshInstance3D.new()
				var sm := CylinderMesh.new()
				sm.top_radius = 0.0
				sm.bottom_radius = 0.06
				sm.height = 1.3
				sm.radial_segments = 6
				st.mesh = sm
				st.material_override = mt3
				st.transform = Transform3D(Basis(Vector3.RIGHT, -0.7 if k % 2 == 0 else 0.7), Vector3(-0.85 + k * 0.34, 0.45, 0))
				no.add_child(st)
			_visual(no, Vector3(2.0, 0.12, 0.12), Vector3(0, 0.12, 0), mat_madeira)
		"arame":
			for s in [-1.0, 1.0]:
				_visual(no, Vector3(0.1, 1.1, 0.1), Vector3(s * 1.3, 0.55, 0))
			for k in 3:
				_visual(no, Vector3(2.6, 0.02, 0.02), Vector3(0, 0.3 + k * 0.32, 0), mat_ferro)
		"latas":
			for s in [-1.0, 1.0]:
				_visual(no, Vector3(0.08, 0.7, 0.08), Vector3(s * 1.4, 0.35, 0))
			_visual(no, Vector3(2.8, 0.015, 0.015), Vector3(0, 0.55, 0), mat_pano)
			for k in 4:
				var lt := MeshInstance3D.new()
				var lm := CylinderMesh.new()
				lm.top_radius = 0.04
				lm.bottom_radius = 0.04
				lm.height = 0.11
				lt.mesh = lm
				lt.material_override = mat_ferro
				lt.position = Vector3(-0.9 + k * 0.6, 0.47, 0)
				no.add_child(lt)
		"armadilhaUrso":
			var tor := MeshInstance3D.new()
			var tm := TorusMesh.new()
			tm.inner_radius = 0.22
			tm.outer_radius = 0.34
			tor.mesh = tm
			tor.material_override = mat_ferro
			tor.scale = Vector3(1, 0.4, 1)
			tor.position.y = 0.04
			no.add_child(tor)
			_visual(no, Vector3(0.5, 0.03, 0.06), Vector3(0, 0.05, 0), mat_ferro)
		"torreVigia":
			for sx in [-1.0, 1.0]:
				for sz in [-1.0, 1.0]:
					if colide:
						_bloco(no, Vector3(0.18, 3.2, 0.18), Vector3(sx * 1.2, 1.6, sz * 1.2))
					else:
						_visual(no, Vector3(0.18, 3.2, 0.18), Vector3(sx * 1.2, 1.6, sz * 1.2))
			if colide:
				_bloco(no, Vector3(2.7, 0.14, 2.7), Vector3(0, 3.1, 0))
				_bloco(no, Vector3(2.7, 0.9, 0.08), Vector3(0, 3.65, -1.3))
				_bloco(no, Vector3(0.08, 0.9, 2.7), Vector3(-1.3, 3.65, 0))
				_bloco(no, Vector3(0.08, 0.9, 2.7), Vector3(1.3, 3.65, 0))
				# a escada (rampa íngreme de tábuas) sobe pela frente
				var ang := atan2(3.1, 2.2)
				_rampa(no, Vector3(0.9, 0.1, Vector2(2.2, 3.1).length()), Transform3D(Basis(Vector3.RIGHT, -ang), Vector3(0, 1.55, 1.35 + 1.1)))
			else:
				_visual(no, Vector3(2.7, 0.14, 2.7), Vector3(0, 3.1, 0))
			for k in 7:
				_visual(no, Vector3(0.9, 0.06, 0.2), Vector3(0, 0.3 + k * 0.42, 2.45 - k * 0.3))
			solido = false
		"tabuasPorta":
			for k in 4:
				_visual(no, Vector3(0.28, 2.1, 0.05), Vector3(-0.45 + k * 0.3, 1.05, 0))
			_visual(no, Vector3(1.2, 0.14, 0.06), Vector3(0, 0.6, -0.05))
			_visual(no, Vector3(1.2, 0.14, 0.06), Vector3(0, 1.6, -0.05))
		"tabuasJanela":
			for k in 3:
				_visual(no, Vector3(1.4, 0.26, 0.05), Vector3(0, 0.25 + k * 0.32, 0))
		"tabuasJanelaX":
			var a1 := _visual(no, Vector3(1.6, 0.2, 0.05), Vector3(0, 0.5, 0))
			a1.rotation.z = 0.6
			var a2 := _visual(no, Vector3(1.6, 0.2, 0.05), Vector3(0, 0.5, 0.05))
			a2.rotation.z = -0.6
		"cama":
			_visual(no, Vector3(1.0, 0.18, 2.0), Vector3(0, 0.09, 0), mat_pano)
			_visual(no, Vector3(0.6, 0.1, 0.35), Vector3(0, 0.22, -0.75), mat_pano)
		"camaMadeira":
			_modelo(no, "camaFerro", Vector3(tam.x, -1, tam.z))
		"mesa":
			_modelo(no, "mesaJantar", Vector3(tam.x, -1, tam.z))
		"cadeira":
			_modelo(no, "cadeira", Vector3(-1, -1, -1))
		"prateleira":
			_modelo(no, "estante", Vector3(tam.x, -1, -1))
		"despensa":
			_modelo(no, "armario", Vector3(tam.x, -1, -1))
		"armarioFerro":
			_modelo(no, "gaveteiro", Vector3(tam.x, -1, -1))
		"bau":
			var m := MeshInstance3D.new()
			m.mesh = main.mundo.malha("res://assets/objetos/bau.glb")
			m.scale = Vector3.ONE * 0.8
			no.add_child(m)
		"lamparina", "lampParede":
			if id == "lampParede":
				_visual(no, Vector3(0.1, 1.7, 0.1), Vector3(0, 0.85, 0))
			var lp := _modelo(no, "lampiao", Vector3(-1, 0.45, -1))
			if lp != null and id == "lampParede":
				lp.position.y = 1.7
			_luz(no, idx, Vector3(0, 1.95 if id == "lampParede" else 0.35, 0), Color(1.0, 0.72, 0.42), 1.6, 8.0)
		"fogueira":
			_modelo(no, "fogueiraPedras", Vector3(1.2, -1, 1.2))
			for a in 4:
				var lenha := MeshInstance3D.new()
				var cm2 := CylinderMesh.new()
				cm2.top_radius = 0.05
				cm2.bottom_radius = 0.06
				cm2.height = 0.8
				lenha.mesh = cm2
				lenha.material_override = mat_madeira
				lenha.transform = Transform3D(Basis(Vector3.UP, a * PI / 2.0) * Basis(Vector3.RIGHT, 1.1), Vector3(0, 0.2, 0))
				no.add_child(lenha)
			_luz(no, idx, Vector3(0, 0.6, 0), Color(1.0, 0.62, 0.3), 2.2, 9.0)
			_fogo(no)
		"marcoBase":
			_visual(no, Vector3(0.9, 0.4, 0.9), Vector3(0, 0.2, 0), mat_pedra)
			_visual(no, Vector3(0.14, 2.4, 0.14), Vector3(0, 1.4, 0))
			_visual(no, Vector3(0.7, 0.45, 0.02), Vector3(0.38, 2.3, 0), mat_couro)
		"bancadaTrab":
			_modelo(no, "mesaEscritorio", Vector3(tam.x, 0.9, tam.z))
			var cx := _modelo(no, "caixaMadeira2", Vector3(-1, -1, -1))
			if cx != null:
				cx.position = Vector3(-0.45, 0.9, 0)
		"estacaoCouro":
			for s in [-1.0, 1.0]:
				_visual(no, Vector3(0.1, 1.6, 0.1), Vector3(s * 0.95, 0.8, 0))
			_visual(no, Vector3(2.0, 0.1, 0.1), Vector3(0, 1.55, 0))
			_visual(no, Vector3(1.5, 1.1, 0.03), Vector3(0, 0.95, 0), mat_couro)
		"bancadaArmas":
			_modelo(no, "carrinhoFerramentas", Vector3(tam.x, -1, -1))
		"fornalha":
			_visual(no, Vector3(1.5, 1.2, 1.5), Vector3(0, 0.6, 0), mat_pedra)
			_visual(no, Vector3(0.9, 0.5, 0.9), Vector3(0, 1.45, 0), mat_pedra)
			var boca := _visual(no, Vector3(0.5, 0.4, 0.05), Vector3(0, 0.45, 0.76))
			var brasa := StandardMaterial3D.new()
			brasa.albedo_color = Color(0.1, 0.05, 0.02)
			brasa.emission_enabled = true
			brasa.emission = Color(1.0, 0.4, 0.1)
			brasa.emission_energy_multiplier = 2.0
			boca.material_override = brasa
			_luz(no, idx, Vector3(0, 0.5, 1.0), Color(1.0, 0.5, 0.2), 1.4, 6.0)
		"defumador":
			_modelo(no, "tamborVelho", Vector3(-1, 1.0, -1))
			_visual(no, Vector3(0.12, 0.6, 0.12), Vector3(0, 1.2, 0), mat_ferro)
		"mesaEstudo":
			_modelo(no, "mesaEscritorio", Vector3(tam.x, -1, tam.z))
			var rd := _modelo(no, "radioVelho", Vector3(-1, -1, -1))
			if rd != null:
				rd.position = Vector3(0.4, 0.79, 0)
		"bancadaDesmanche":
			_modelo(no, "carrinhoSolda", Vector3(-1, -1, -1))
			var cp := _modelo(no, "compressor", Vector3(-1, -1, -1))
			if cp != null:
				cp.position = Vector3(1.0, 0, 0)
		_:
			_visual(no, tam, Vector3(0, tam.y / 2.0, 0))
	if not colide:
		return
	# colisão: as sólidas seguram passagem; as outras ficam só na mira (para o E e o martelo)
	var sb := StaticBody3D.new()
	var cs := CollisionShape3D.new()
	var bs := BoxShape3D.new()
	bs.size = tam
	cs.shape = bs
	cs.position = Vector3(0, tam.y / 2.0, 0)
	sb.add_child(cs)
	if not solido:
		sb.collision_layer = 2
		sb.collision_mask = 0
	sb.set_meta("obra", idx)
	no.add_child(sb)


## um modelo escaneado do jogo antigo (móveis e objetos do mapa), no tamanho pedido (-1: o dele)
func _modelo(no: Node3D, id_m: String, tam: Vector3) -> Node3D:
	var n: Node3D = main.objetos.modelo_no(id_m)
	if n == null:
		return null
	var aabb: AABB = n.get_meta("aabb")
	var esc := Vector3.ONE
	if tam.x > 0.0 and aabb.size.x > 0.01:
		esc = Vector3.ONE * (tam.x / aabb.size.x)
	if tam.y > 0.0 and aabb.size.y > 0.01 and tam.x <= 0.0:
		esc = Vector3.ONE * (tam.y / aabb.size.y)
	elif tam.y > 0.0 and aabb.size.y > 0.01:
		esc.y = tam.y / aabb.size.y
	n.scale = esc
	n.position = Vector3(-(aabb.position.x + aabb.size.x / 2.0) * esc.x, -aabb.position.y * esc.y, -(aabb.position.z + aabb.size.z / 2.0) * esc.z)
	no.add_child(n)
	return n


func _luz(no: Node3D, idx: int, pos: Vector3, cor: Color, energia: float, alcance: float) -> void:
	var luz := OmniLight3D.new()
	luz.light_color = cor
	luz.light_energy = energia
	luz.omni_range = alcance
	luz.position = pos
	luz.shadow_enabled = true
	no.add_child(luz)
	if idx >= 0:
		pecas[idx]["luz"] = luz


func _fogo(no: Node3D) -> void:
	var fogo := CPUParticles3D.new()
	fogo.amount = 40
	fogo.lifetime = 0.8
	fogo.emission_shape = CPUParticles3D.EMISSION_SHAPE_SPHERE
	fogo.emission_sphere_radius = 0.18
	fogo.direction = Vector3.UP
	fogo.spread = 12.0
	fogo.gravity = Vector3(0, 1.4, 0)
	fogo.initial_velocity_min = 0.3
	fogo.initial_velocity_max = 0.8
	fogo.scale_amount_min = 0.35
	fogo.scale_amount_max = 0.6
	var qm := QuadMesh.new()
	qm.size = Vector2(0.35, 0.35)
	var fm := StandardMaterial3D.new()
	fm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	fm.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	fm.blend_mode = BaseMaterial3D.BLEND_MODE_ADD
	fm.billboard_mode = BaseMaterial3D.BILLBOARD_PARTICLES
	fm.vertex_color_use_as_albedo = true
	qm.material = fm
	fogo.mesh = qm
	var gr := Gradient.new()
	gr.set_color(0, Color(1.0, 0.75, 0.3, 0.9))
	gr.set_color(1, Color(0.8, 0.15, 0.02, 0.0))
	fogo.color_ramp = gr
	fogo.position.y = 0.25
	no.add_child(fogo)


## bancada nível 2: ganha um torno e uma caixa de ferramentas em cima
func _enfeite_nivel2(no: Node3D) -> void:
	if no.has_node("nivel2"):
		return
	var n := Node3D.new()
	n.name = "nivel2"
	no.add_child(n)
	var t := _modelo(n, "baulFerramentas", Vector3(-1, -1, -1))
	if t != null:
		t.position += Vector3(0.45, 0.9, 0)
	_visual(n, Vector3(0.16, 0.18, 0.12), Vector3(0.85, 0.99, 0.25), mat_ferro)


# ---------------------------------------------------------------- saco de dormir, mochila caída e coisas no chão
## saco de dormir: no chão ou na fundação; quem morre pode renascer nele
func por_saco(j) -> void:
	var h: Dictionary = j.mira(4.0, 1)
	if h.is_empty() or not j.inv.tirar("sacoDormir", 1):
		return
	_saco_no(h["position"], j.rotation.y)
	main.ui.aviso("Saco de dormir no lugar: se morrer, dá para renascer aqui")


func _saco_no(p: Vector3, yaw: float) -> void:
	var no := Node3D.new()
	no.position = p
	no.rotation.y = yaw
	add_child(no)
	var pano := StandardMaterial3D.new()
	pano.albedo_color = Color(0.25, 0.36, 0.26)
	pano.roughness = 0.95
	var corpo := MeshInstance3D.new()
	var cm := CapsuleMesh.new()
	cm.radius = 0.4
	cm.height = 2.0
	corpo.mesh = cm
	corpo.material_override = pano
	corpo.transform = Transform3D(Basis(Vector3.RIGHT, PI / 2.0).scaled(Vector3(1.0, 0.3, 1.0)), Vector3(0, 0.11, 0))
	no.add_child(corpo)
	var trav := MeshInstance3D.new()
	var tb := BoxMesh.new()
	tb.size = Vector3(0.55, 0.12, 0.32)
	trav.mesh = tb
	var tm := StandardMaterial3D.new()
	tm.albedo_color = Color(0.78, 0.76, 0.68)
	trav.material_override = tm
	trav.position = Vector3(0, 0.22, -0.72)
	no.add_child(trav)
	sacos.append(p)
	no.set_meta("saco", [[p.x, p.y, p.z], yaw])


## mochila caída (quando o jogador morre, tudo o que ele tinha fica nela) e coisas soltas no chão: E abre e pega
func por_mochila(p: Vector3, inv: Inventario, titulo := "Sua mochila (caiu quando você morreu)") -> void:
	var sp := get_world_3d().direct_space_state
	var q := PhysicsRayQueryParameters3D.create(p + Vector3(0, 1.0, 0), p + Vector3(0, -6.0, 0), 1)
	var h := sp.intersect_ray(q)
	var no := Node3D.new()
	no.position = h["position"] if not h.is_empty() else p
	add_child(no)
	var m := MeshInstance3D.new()
	var cm := CapsuleMesh.new()
	cm.radius = 0.22
	cm.height = 0.62
	m.mesh = cm
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.34, 0.27, 0.18)
	mat.roughness = 0.95
	m.material_override = mat
	m.transform = Transform3D(Basis(Vector3.RIGHT, PI / 2.0).scaled(Vector3(1.0, 0.7, 1.0)), Vector3(0, 0.16, 0))
	no.add_child(m)
	var corpo := StaticBody3D.new()
	corpo.collision_layer = 2   # a mira pega, mas ninguém tropeça nela
	corpo.collision_mask = 0
	var cs := CollisionShape3D.new()
	var bs := BoxShape3D.new()
	bs.size = Vector3(0.7, 0.45, 0.7)
	cs.shape = bs
	cs.position.y = 0.2
	corpo.add_child(cs)
	no.add_child(corpo)
	corpo.set_meta("bau", baus.size())
	baus.append({"no": no, "inv": inv, "mochila": true, "titulo": titulo})


## o que não coube na mochila (ou o que o zumbi deixou) fica num saquinho no chão
func soltar_no_chao(p: Vector3, lista: Array) -> void:
	var inv := Inventario.new(12, false)
	var tem := false
	for e in lista:
		var ex: Dictionary = e[2] if e.size() > 2 and e[2] is Dictionary else {}
		if inv.por(str(e[0]), int(e[1]), ex) < int(e[1]):
			tem = true
	if tem:
		por_mochila(p, inv, "Coisas no chão")


## o baú ou a mochila caída fechou: a mochila caída vazia some
func fechou_bau(inv: Inventario) -> void:
	for b in baus:
		if b["inv"] == inv and b.get("mochila", false) and is_instance_valid(b["no"]):
			for s in inv.slots:
				if s != null:
					return
			(b["no"] as Node3D).queue_free()
			b["vazio"] = true


# ---------------------------------------------------------------- salvar e carregar
static func _xf_arr(xf: Transform3D) -> Array:
	var b := xf.basis
	return [b.x.x, b.x.y, b.x.z, b.y.x, b.y.y, b.y.z, b.z.x, b.z.y, b.z.z, xf.origin.x, xf.origin.y, xf.origin.z]


static func _arr_xf(a: Array) -> Transform3D:
	return Transform3D(Basis(Vector3(a[0], a[1], a[2]), Vector3(a[3], a[4], a[5]), Vector3(a[6], a[7], a[8])), Vector3(a[9], a[10], a[11]))


func salvar() -> Dictionary:
	var B := []
	for b in bases:
		B.append({"id": b["id"], "xf": _xf_arr(b["xf"]), "y": b["y"], "y_loc": b["y_loc"], "raio": b["raio"], "yaw": b["yaw"]})
	var L := []
	for pe in pecas:
		if pe.get("caiu", false):
			continue
		var e := {"id": pe["id"], "xf": _xf_arr(pe["xf"]), "chave": pe.get("chave", ""), "vida": pe["vida"]}
		if pe.has("bau"):
			e["inv"] = (baus[int(pe["bau"])]["inv"] as Inventario).salvar()
		if pe.has("porta"):
			e["aberta"] = portas[int(pe["porta"])]["aberta"]
		if pe.has("nivel"):
			e["nivel"] = pe["nivel"]
		if pe.has("armada"):
			e["armada"] = pe["armada"]
		if pe.has("luz"):
			e["luz"] = (pe["luz"] as Light3D).visible
		L.append(e)
	var S := []
	for c in get_children():
		if c.has_meta("saco"):
			S.append(c.get_meta("saco"))
	var Mo := []
	for b in baus:
		if b.get("mochila", false) and not b.get("vazio", false) and is_instance_valid(b["no"]):
			Mo.append({"pos": [(b["no"] as Node3D).position.x, (b["no"] as Node3D).position.y, (b["no"] as Node3D).position.z],
				"titulo": b.get("titulo", ""), "inv": (b["inv"] as Inventario).salvar()})
	return {"bases": B, "pecas": L, "sacos": S, "mochilas": Mo, "renasce": sacos.size() > 0}


func carregar(d: Dictionary) -> void:
	for c in get_children():
		if c != fantasma:
			c.queue_free()
	pecas.clear()
	ocupado.clear()
	bases.clear()
	portas.clear()
	sacos.clear()
	baus.clear()
	armadilhas.clear()
	for b in d.get("bases", []):
		var nb := {"id": int(b["id"]), "xf": _arr_xf(b["xf"]), "y": float(b["y"]), "y_loc": float(b["y_loc"]), "raio": float(b["raio"]), "yaw": float(b["yaw"])}
		nb["inv"] = (nb["xf"] as Transform3D).affine_inverse()
		bases.append(nb)
	for e in d.get("pecas", []):
		if Dados.OBRAS.has(str(e["id"])):
			_criar(str(e["id"]), _arr_xf(e["xf"]), str(e.get("chave", "")), float(e["vida"]), e)
	for s in d.get("sacos", []):
		var a: Array = s[0]
		_saco_no(Vector3(float(a[0]), float(a[1]), float(a[2])), float(s[1]))
	for mo in d.get("mochilas", []):
		var inv := Inventario.new(Inventario.MAXIMO, false)
		inv.carregar(mo["inv"])
		por_mochila(Vector3(mo["pos"][0], mo["pos"][1] + 0.5, mo["pos"][2]), inv, str(mo.get("titulo", "Coisas no chão")))
