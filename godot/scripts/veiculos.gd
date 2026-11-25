class_name Veiculos
extends Node3D
## Os veículos do mundo (etapa 6j), como no jogo antigo (47_carro.js, veicPadrao): a caminhonete perto da fazenda (sem
## gasolina), o carro da vila (sem bateria, com um pneu furado e o motor cansado), a moto da cidade (com o motor quebrado) e o
## triciclo da fazenda (com um pouco de gasolina e um pneu furado). Toque E entra (se der); segure E abre a oficina do veículo
## (o estado das peças, os consertos, abastecer e o porta-malas). O barco, a jangada e o helicóptero vêm depois.
## As estradas: fora delas (e fora da cidade) os veículos andam mais devagar, menos o triciclo.
## Na partida em rede os veículos são de quem abriu: o convidado vê eles andando e pode pedir para dirigir um (quem abriu
## deixa se ninguém estiver nele e se ele andar); dirigindo, o jogo do convidado diz onde o veículo está e quem abriu mostra para
## todo mundo. A oficina e o porta-malas ficam com quem abriu.

## [tipo, id, x, z, giro, o estado de como foi achado]
const PADRAO := [
	["caminhonete", "caminhonete", -57.0, 49.0, 2.28, {"comb": 0.0, "motor": 100.0, "oleo": 70.0}],
	["sedan", "sedanVila", 57.5, -48.0, 0.35, {"comb": 0.0, "bateria": false, "pneus": [100.0, 0.0, 100.0, 100.0], "motor": 70.0, "oleo": 35.0, "hp": 75.0}],
	["moto", "motoCidade", 186.0, 15.5, 1.2, {"comb": 0.0, "motor": 0.0, "oleo": 50.0, "hp": 80.0}],
	["triciclo", "triFazenda", -79.0, 63.0, -2.4, {"comb": 15.0, "pneus": [100.0, 0.0, 100.0], "oleo": 20.0, "hp": 85.0}]]
const CEL := 16.0

var main
var lista: Array = []
var _grade := {}             # célula de 16 m -> [[a, b, meia largura + 1 m]] dos pedaços de estrada
var _dicas := {}


func _init(m) -> void:
	main = m
	name = "Veiculos"


func _ready() -> void:
	_montar_grade()
	novo()


## os veículos como o jogo antigo começa
func novo() -> void:
	for v in lista:
		if is_instance_valid(v):
			(v as Node).queue_free()
	lista = []
	for d in PADRAO:
		var v := Veiculo.new(main, str(d[0]), str(d[1]))
		add_child(v)
		var yaw: float = d[4]
		v.global_position = _lugar(str(d[0]), Vector3(float(d[2]), 0, float(d[3])), yaw)
		v.rotation.y = yaw
		var o: Dictionary = d[5]
		v.comb = float(o.get("comb", 0.0))
		v.hp = float(o.get("hp", 100.0))
		v.pecas["motor"] = float(o.get("motor", 100.0))
		v.pecas["oleo"] = float(o.get("oleo", 80.0))
		v.pecas["bateria"] = bool(o.get("bateria", true))
		if o.has("pneus"):
			v.pecas["pneus"] = (o["pneus"] as Array).duplicate()
		v.assentar()
		lista.append(v)


## um lugar livre para o veículo perto do ponto do jogo antigo (o mapa daqui pode ter uma árvore ou um muro bem ali)
func _lugar(tipo: String, p: Vector3, yaw: float) -> Vector3:
	var T: Dictionary = Veiculo.TIPOS[tipo]
	var bx := BoxShape3D.new()
	bx.size = Vector3(float(T["hw"]) * 2.0 + 0.2, float(T["alt"]) - 0.5, float(T["hd"]) * 2.0 + 0.2)
	var q := PhysicsShapeQueryParameters3D.new()
	q.shape = bx
	q.collision_mask = 1
	if main.terreno.corpo_chao != null:
		var fora: Array[RID] = [main.terreno.corpo_chao.get_rid()]
		q.exclude = fora
	var sp := get_world_3d().direct_space_state
	for r in [0.0, 1.5, 3.0, 4.5, 6.0, 8.0, 10.0]:
		var rr: float = r
		var n := 1 if rr == 0.0 else 12
		for k in n:
			var a := k / 12.0 * TAU
			var c := p + Vector3(cos(a), 0, sin(a)) * rr
			if not main.terreno.dentro(c.x, c.z):
				continue
			var n_a: float = main.terreno.nivel_agua(c.x, c.z)
			if n_a > -900.0 and n_a - main.terreno.h(c.x, c.z) > 0.3:
				continue
			var y: float = main.chao_em(c.x, c.z, main.terreno.h(c.x, c.z) + 3.0)["y"]
			q.transform = Transform3D(Basis(Vector3.UP, yaw), Vector3(c.x, y + 0.5 + bx.size.y / 2.0, c.z))
			if sp.intersect_shape(q, 1).is_empty():
				return Vector3(c.x, y, c.z)
	return Vector3(p.x, main.terreno.h(p.x, p.z), p.z)


func por_id(id: String) -> Veiculo:
	for v in lista:
		if is_instance_valid(v) and (v as Veiculo).uid == id:
			return v
	return null


# ================================================================ as estradas
func _montar_grade() -> void:
	_grade = {}
	if main.mundo == null:
		return
	for r in main.mundo.ruas:
		var pts: PackedVector2Array = r["pts"]
		var mw: float = float(r["w"]) / 2.0 + 1.0
		for i in pts.size() - 1:
			var a: Vector2 = pts[i]
			var b: Vector2 = pts[i + 1]
			var x0 := floori((minf(a.x, b.x) - mw) / CEL)
			var x1 := floori((maxf(a.x, b.x) + mw) / CEL)
			var z0 := floori((minf(a.y, b.y) - mw) / CEL)
			var z1 := floori((maxf(a.y, b.y) + mw) / CEL)
			for cx in range(x0, x1 + 1):
				for cz in range(z0, z1 + 1):
					var k := Vector2i(cx, cz)
					if not _grade.has(k):
						_grade[k] = []
					(_grade[k] as Array).append([a, b, mw])


## o ponto está numa estrada (ou na cidade)?
func na_estrada(p: Vector3) -> bool:
	if main.na_cidade(p):
		return true
	var L = _grade.get(Vector2i(floori(p.x / CEL), floori(p.z / CEL)))
	if L == null:
		return false
	var q := Vector2(p.x, p.z)
	for s in L:
		var a: Vector2 = s[0]
		var b: Vector2 = s[1]
		var ab := b - a
		var t := clampf((q - a).dot(ab) / maxf(ab.length_squared(), 1e-6), 0.0, 1.0)
		if q.distance_to(a + ab * t) < float(s[2]):
			return true
	return false


# ================================================================ entrar, sair, a oficina
## E no veículo parado: o toque entra (se der; senão diz o que falta e abre a oficina); segurar abre a oficina
func usar(v: Veiculo, j, segurou: bool) -> void:
	if v.lan:
		if segurou:
			main.ui.aviso("Na partida em rede a oficina e o porta-malas dos veículos ficam com quem abriu a partida", 4.0)
		else:
			pedir(v)
		return
	if v.motorista != 0:
		main.ui.aviso("Tem alguém da partida dirigindo %s %s" % [v.o_a(), v.nome().to_lower()], 3.0)
		return
	var nao := v.pode()
	if segurou or nao != "":
		if not segurou:
			main.ui.aviso("%s: %s" % [v.nome(), nao.to_lower()], 4.0)
			main.sons.tocar("vazio", v.global_position, 0.0)
		main.ui.abrir_veiculo(v)
		return
	entrar(v, j)


func entrar(v: Veiculo, j) -> bool:
	if v.lan:
		return false
	var nao := v.pode()
	if nao != "":
		main.ui.aviso(nao, 3.0)
		main.sons.tocar("vazio", v.global_position, 0.0)
		return false
	if v.ativo:
		return false
	if v.motorista != 0:
		return false
	v.ativo = true
	v.visto = true
	j.entrar_veiculo(v)
	main.sons.tocar("clique", v.global_position, -4.0)
	main.sons.tocar("partida", v.global_position, 0.0)
	if not _dicas.has(v.tipo) and not main.modo_teste:
		_dicas[v.tipo] = true
		main.ui.aviso("W acelera, S freia e dá ré, A e D viram, Espaço é o freio de mão, clique buzina, F acende os faróis e E desce. Segure E perto do veículo para a oficina e o porta-malas.", 10.0)
	if main.get("cao") != null:
		main.cao.entrou_veiculo(v)
	return true


## E dirigindo: desce (devagar e com lugar do lado)
func sair(j) -> bool:
	var v = j.veiculo
	if v == null or not is_instance_valid(v):
		return false
	if absf(float(v.v)) > 4.0:
		main.ui.aviso("Diminua a velocidade para descer", 2.5)
		return false
	var p: Vector3 = v.saida()
	if p == Vector3.INF:
		main.ui.aviso("Sem espaço para descer", 2.5)
		return false
	_desligar(v)
	_devolver(v)
	j.sair_veiculo(p)
	main.sons.tocar("clique", v.global_position, -4.0)
	if main.get("cao") != null:
		main.cao.saiu_veiculo(v)
	return true


## sai na marra (morreu dirigindo, carregou o jogo, a partida em rede tomou o veículo): fica no assento de fora
func expulsar(j) -> void:
	var v = j.veiculo
	if v == null or not is_instance_valid(v):
		j.veiculo = null
		return
	var p: Vector3 = v.saida()
	if p == Vector3.INF:
		p = v.global_position + Vector3(0, float(v.T["alt"]) + 0.3, 0)
	_desligar(v)
	_devolver(v)
	j.sair_veiculo(p)
	if main.get("cao") != null:
		main.cao.saiu_veiculo(v)


## o convidado desceu do veículo de quem abriu: avisa onde ele ficou e ele volta a ser o boneco do de lá
func _devolver(v) -> void:
	if not bool(v.dono_rede):
		return
	v.dono_rede = false
	var k := lista.find(v)
	if k >= 0:
		Rede.sair_veic(k, v.estado_rede())
	v.lan = true


func _desligar(v) -> void:
	v.ativo = false
	v.v = 0.0
	v.acel = 0.0
	v.freando = false
	v.mostrar_cabine(true)


## o veículo mais perto (até r metros)
func perto(p: Vector3, r: float) -> Veiculo:
	var melhor: Veiculo = null
	var bd := r
	for v in lista:
		if not is_instance_valid(v):
			continue
		var d: float = (v as Veiculo).global_position.distance_to(p)
		if d < bd:
			bd = d
			melhor = v
	return melhor


# ================================================================ a partida em rede
## de quem abriu: todos os veículos (são poucos), [índice, ...12 números de Veiculo.para_rede]
func para_rede() -> PackedFloat32Array:
	var L := PackedFloat32Array()
	for i in lista.size():
		var v = lista[i]
		if not is_instance_valid(v):
			continue
		L.append(float(i))
		L.append_array((v as Veiculo).para_rede())
	return L


## no convidado: os veículos daqui viram os bonecos dos de quem abriu
func rede(L: PackedFloat32Array) -> void:
	var n := 13
	var i := 0
	var j = main.jogador
	while i + n <= L.size():
		var k := int(L[i])
		if k >= 0 and k < lista.size() and is_instance_valid(lista[k]):
			var v: Veiculo = lista[k]
			# o que você está dirigindo: quem manda onde ele está é você
			if v.dono_rede and j != null and j.veiculo == v:
				i += n
				continue
			if j != null and j.veiculo == v:
				expulsar(j)
			v.rede(L, i + 1)
		i += n


func soltar_rede() -> void:
	var j = main.jogador
	if j != null and j.veiculo != null and is_instance_valid(j.veiculo) and bool(j.veiculo.dono_rede):
		expulsar(j)
	for v in lista:
		if is_instance_valid(v):
			(v as Veiculo).dono_rede = false
			(v as Veiculo).motorista = 0
			(v as Veiculo).soltar_rede()


## convidado: pede para dirigir o veículo de quem abriu (quem abriu responde)
func pedir(v: Veiculo) -> void:
	var k := lista.find(v)
	if k < 0:
		return
	Rede.pedir_veic(k)
	main.ui.aviso("Pedindo para dirigir %s %s..." % [v.o_a(), v.nome().to_lower()], 2.0)


## convidado: quem abriu deixou dirigir (com o estado das peças de lá) ou disse por que não
func resposta(k: int, ok: bool, motivo: String, estado: Dictionary) -> void:
	if k < 0 or k >= lista.size() or not is_instance_valid(lista[k]):
		return
	var v: Veiculo = lista[k]
	if not ok:
		main.ui.aviso(motivo, 3.5)
		main.sons.tocar("vazio", v.global_position, 0.0)
		return
	var j = main.jogador
	if j == null or j.veiculo != null or not j.vivo or j.global_position.distance_to(v.global_position) > 8.0:
		# já não dá (entrou em outro, morreu, se afastou): devolve
		Rede.sair_veic(k, v.estado_rede())
		return
	v.receber_estado(estado, true)
	v.lan = false
	v.dono_rede = true
	v.ativo = true
	v.v = 0.0
	v.assentar()
	j.entrar_veiculo(v)
	main.sons.tocar("clique", v.global_position, -4.0)
	main.sons.tocar("partida", v.global_position, 0.0)


## quem abriu: um convidado pediu para dirigir; devolve [deixou, o motivo, o estado das peças]
func pedido(k: int, quem: int) -> Array:
	if k < 0 or k >= lista.size() or not is_instance_valid(lista[k]):
		return [false, "Esse veículo não existe aqui", {}]
	var v: Veiculo = lista[k]
	if v.ativo or v.motorista != 0:
		return [false, "Alguém já está dirigindo %s %s" % [v.o_a(), v.nome().to_lower()], {}]
	var nao := v.pode()
	if nao != "":
		return [false, "%s: %s (quem abriu a partida conserta na oficina)" % [v.nome(), nao.to_lower()], {}]
	v.motorista = quem
	v._lan_p = v.global_position
	v._lan_yaw = v.rotation.y
	v._lan_pr = Vector2(v.pitch, v.roll)
	v.set_meta("lan_ativo", true)
	return [true, "", v.estado_rede()]


## quem abriu: onde o convidado que dirige diz que o veículo está
func do_convidado(k: int, quem: int, L: PackedFloat32Array) -> void:
	if k < 0 or k >= lista.size() or not is_instance_valid(lista[k]):
		return
	var v: Veiculo = lista[k]
	if v.motorista == quem:
		v.do_motorista(L)


## quem abriu: o convidado desceu (onde o veículo ficou e o estado das peças)
func desceu(k: int, quem: int, d: Dictionary) -> void:
	if k < 0 or k >= lista.size() or not is_instance_valid(lista[k]):
		return
	var v: Veiculo = lista[k]
	if v.motorista != quem:
		return
	v.motorista = 0
	v.ativo = false
	v.v = 0.0
	v.acel = 0.0
	v.set_meta("lan_ativo", false)
	v.receber_estado(d, true)
	v.assentar()


## quem abriu: o convidado saiu da partida dirigindo: o veículo fica onde estava
func soltou(quem: int) -> void:
	for v in lista:
		if is_instance_valid(v) and (v as Veiculo).motorista == quem:
			(v as Veiculo).motorista = 0
			(v as Veiculo).ativo = false
			(v as Veiculo).v = 0.0
			(v as Veiculo).set_meta("lan_ativo", false)
			(v as Veiculo).assentar()


## quem abriu: o veículo que um convidado está dirigindo (para os zumbis acharem ele lá dentro)
func do_motorista(quem: int) -> Veiculo:
	for v in lista:
		if is_instance_valid(v) and (v as Veiculo).motorista == quem:
			return v
	return null


# ================================================================ jogo salvo
func salvar() -> Array:
	var L: Array = []
	for v in lista:
		if is_instance_valid(v):
			L.append((v as Veiculo).salvar())
	return L


func carregar(d) -> void:
	novo()
	if not (d is Array):
		return
	for s in d:
		if not (s is Dictionary):
			continue
		var v := por_id(str(s.get("id", "")))
		if v == null:
			var t := str(s.get("tipo", ""))
			if not Veiculo.TIPOS.has(t):
				continue
			v = Veiculo.new(main, t, str(s.get("id", t)))
			add_child(v)
			lista.append(v)
		v.carregar(s)
