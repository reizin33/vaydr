class_name Inventario
extends RefCounted
## Mochila como no jogo antigo: 6 espaços na barra de atalhos (teclas 1 a 6) e 6 bolsos; a mochila nas costas abre mais
## espaços (a simples de couro dá 18, a de expedição 32). Cada espaço guarda {id, n} e, quando o item tem, o desgaste
## ("dur", que acaba e o item quebra). A roupa vestida fica nos lugares do corpo (cabeça, rosto, camiseta, tronco, mãos,
## cintura, pernas, pés e costas). O baú usa o mesmo, sem barra e sem roupa.

signal mudou
signal chegou(id: String)

const BARRA := 6
const BOLSOS := 6
const MAXIMO := 44        # 6 + 6 + a maior mochila (32)
var slots: Array = []
var com_barra := true     # a do jogador tem barra de atalhos; o baú não
var roupa := {}           # lugar do corpo -> {id, n, dur}
var limite := BARRA + BOLSOS


func _init(n := MAXIMO, barra := true) -> void:
	com_barra = barra
	slots.resize(n)
	for i in n:
		slots[i] = null
	limite = BARRA + BOLSOS if barra else n


## um item novo do jeito que ele nasce (com o desgaste cheio, se tiver)
static func novo(id: String, n: int, extra := {}) -> Dictionary:
	var s := {"id": id, "n": n}
	var d := Dados.item(id)
	if d.has("durMax"):
		s["dur"] = float(extra.get("dur", d["durMax"]))
	return s


func conta(id: String) -> int:
	var n := 0
	for i in limite:
		var s = slots[i]
		if s != null and s["id"] == id:
			n += int(s["n"])
	return n


func livres() -> int:
	var n := 0
	for i in limite:
		if slots[i] == null:
			n += 1
	return n


## põe na mochila (primeiro nas pilhas que já existem); devolve o que não coube
func por(id: String, n: int, extra := {}) -> int:
	if n <= 0 or not Dados.ITENS.has(id):
		return n
	chegou.emit(id)
	var mx := Dados.max_pilha(id)
	var com_dur := Dados.item(id).has("durMax")
	if mx > 1 and not com_dur:
		for i in limite:
			if n <= 0:
				break
			var s = slots[i]
			if s != null and s["id"] == id and int(s["n"]) < mx:
				var k := mini(n, mx - int(s["n"]))
				s["n"] = int(s["n"]) + k
				n -= k
	# armas e o plano vão primeiro para a barra; o resto vai para os bolsos e a mochila e depois para a barra
	var ordem: Array = []
	if not com_barra or Dados.na_barra(id):
		for i in limite:
			ordem.append(i)
	else:
		for i in range(BARRA, limite):
			ordem.append(i)
		for i in BARRA:
			ordem.append(i)
	for i in ordem:
		if n <= 0:
			break
		if slots[i] == null:
			var k := mini(n, mx)
			slots[i] = Inventario.novo(id, k, extra)
			n -= k
	mudou.emit()
	return n


## põe uma pilha inteira (com desgaste e tudo) no primeiro lugar livre; devolve false se não coube
func por_pilha(s: Dictionary) -> bool:
	if not s.has("dur"):
		var sobra := por(str(s["id"]), int(s["n"]))
		if sobra > 0:
			s["n"] = sobra
			return false
		return true
	for i in limite:
		if slots[i] == null:
			slots[i] = s
			chegou.emit(str(s["id"]))
			mudou.emit()
			return true
	return false


func tirar(id: String, n: int) -> bool:
	if conta(id) < n:
		return false
	for i in range(limite - 1, -1, -1):
		var s = slots[i]
		if n <= 0:
			break
		if s != null and s["id"] == id:
			var k := mini(n, int(s["n"]))
			s["n"] = int(s["n"]) - k
			n -= k
			if int(s["n"]) <= 0:
				slots[i] = null
	mudou.emit()
	return true


func tem(custo: Dictionary) -> bool:
	for k in custo:
		if conta(k) < int(custo[k]):
			return false
	return true


func pagar(custo: Dictionary) -> bool:
	if not tem(custo):
		return false
	for k in custo:
		tirar(k, int(custo[k]))
	return true


func trocar(a: int, b: int) -> void:
	var t = slots[a]
	slots[a] = slots[b]
	slots[b] = t
	mudou.emit()


func usar_um(i: int) -> void:
	var s = slots[i]
	if s == null:
		return
	s["n"] = int(s["n"]) - 1
	if int(s["n"]) <= 0:
		slots[i] = null
	mudou.emit()


## tira um espaço inteiro (para levar a outro inventário)
func pegar(i: int):
	var s = slots[i]
	slots[i] = null
	mudou.emit()
	return s


## desgaste: o item do espaço i gasta n; devolve true se quebrou
func gastar(i: int, n := 1.0) -> bool:
	var s = slots[i]
	if s == null or not s.has("dur"):
		return false
	s["dur"] = float(s["dur"]) - n
	if float(s["dur"]) <= 0.0:
		slots[i] = null
		mudou.emit()
		return true
	mudou.emit()
	return false


# ---------------------------------------------------------------- roupa
## quanto a roupa protege (soma, no máximo 60% do dano)
func protecao() -> float:
	var p := 0.0
	for k in roupa:
		p += float(Dados.item(str(roupa[k]["id"])).get("prot", 0.0))
	return minf(p, 0.6)


func quente() -> float:
	var q := 0.0
	for k in roupa:
		q += float(Dados.item(str(roupa[k]["id"])).get("quente", 0.0))
	return q


func _espaco_mochila() -> int:
	return int(Dados.item(str(roupa["costas"]["id"])).get("espaco", 0)) if roupa.has("costas") else 0


func _ajustar_limite() -> void:
	limite = mini(BARRA + BOLSOS + _espaco_mochila(), slots.size())


## veste o que está no espaço i (troca com o que estava naquele lugar do corpo); devolve um aviso ("" se deu certo)
func vestir(i: int) -> String:
	var s = slots[i]
	if s == null:
		return ""
	var lugar := str(Dados.item(str(s["id"])).get("slot", ""))
	if lugar == "":
		return "Isso não se veste."
	var antes = roupa.get(lugar)
	slots[i] = antes
	roupa[lugar] = s
	if lugar == "costas":
		var aviso := _encolher(antes)
		if aviso != "":
			roupa[lugar] = antes
			slots[i] = s
			_ajustar_limite()
			return aviso
	_ajustar_limite()
	mudou.emit()
	return ""


## tira a roupa de um lugar do corpo e põe na mochila
func despir(lugar: String) -> String:
	if not roupa.has(lugar):
		return ""
	var s: Dictionary = roupa[lugar]
	roupa.erase(lugar)
	if lugar == "costas":
		var aviso := _encolher(null)
		if aviso != "":
			roupa[lugar] = s
			_ajustar_limite()
			return aviso
	_ajustar_limite()
	for i in limite:
		if slots[i] == null:
			slots[i] = s
			mudou.emit()
			return ""
	roupa[lugar] = s
	_ajustar_limite()
	return "Sem espaço para guardar."


## a mochila mudou: o que estava nos espaços que somem vai para os que ficam (se não couber, não deixa trocar)
func _encolher(_antes) -> String:
	var novo_lim := mini(BARRA + BOLSOS + _espaco_mochila(), slots.size())
	var fora := []
	for i in range(novo_lim, slots.size()):
		if slots[i] != null:
			fora.append(i)
	var livres_dentro := []
	for i in novo_lim:
		if slots[i] == null:
			livres_dentro.append(i)
	if fora.size() > livres_dentro.size():
		return "A mochila está cheia: tire umas coisas antes de trocar."
	for k in fora.size():
		slots[livres_dentro[k]] = slots[fora[k]]
		slots[fora[k]] = null
	limite = novo_lim
	return ""


## para guardar no arquivo de salvamento
func salvar() -> Dictionary:
	var L := []
	for i in slots.size():
		if slots[i] != null:
			L.append([i, slots[i]])
	return {"slots": L, "roupa": roupa.duplicate(true)}


func carregar(d: Dictionary) -> void:
	for i in slots.size():
		slots[i] = null
	for par in d.get("slots", []):
		var i := int(par[0])
		var s: Dictionary = par[1]
		s["n"] = int(s["n"])
		if i < slots.size() and Dados.ITENS.has(str(s["id"])):
			slots[i] = s
	roupa = {}
	var r: Dictionary = d.get("roupa", {})
	for k in r:
		if Dados.ITENS.has(str(r[k]["id"])):
			roupa[k] = r[k]
	if com_barra:
		_ajustar_limite()
	mudou.emit()
