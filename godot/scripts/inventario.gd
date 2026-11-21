class_name Inventario
extends RefCounted
## Mochila: 30 espaços; os 6 primeiros são a barra de atalhos (teclas 1 a 6).

signal mudou

const ESPACOS := 30
const BARRA := 6
var slots: Array = []
var com_barra := true     # a mochila tem barra de atalhos; o baú não


func _init(n := ESPACOS, barra := true) -> void:
	com_barra = barra
	slots.resize(n)
	for i in n:
		slots[i] = null


func conta(id: String) -> int:
	var n := 0
	for s in slots:
		if s != null and s["id"] == id:
			n += int(s["n"])
	return n


## põe na mochila (primeiro nas pilhas que já existem); devolve o que não coube
func por(id: String, n: int) -> int:
	var mx: int = int(Dados.ITENS[id]["max"]) if Dados.ITENS.has(id) else 1
	for s in slots:
		if n <= 0:
			break
		if s != null and s["id"] == id and int(s["n"]) < mx:
			var k := mini(n, mx - int(s["n"]))
			s["n"] = int(s["n"]) + k
			n -= k
	# ferramentas e plano vão primeiro para a barra; recurso vai para a mochila depois da barra
	var ordem: Array = []
	var tipo: String = Dados.ITENS[id]["tipo"] if Dados.ITENS.has(id) else ""
	if not com_barra or tipo in ["ferramenta", "plano", "colocavel", "cura", "comida"]:
		for i in slots.size():
			ordem.append(i)
	else:
		for i in range(BARRA, slots.size()):
			ordem.append(i)
		for i in BARRA:
			ordem.append(i)
	for i in ordem:
		if n <= 0:
			break
		if slots[i] == null:
			var k := mini(n, mx)
			slots[i] = {"id": id, "n": k}
			n -= k
	mudou.emit()
	return n


func tirar(id: String, n: int) -> bool:
	if conta(id) < n:
		return false
	for i in range(slots.size() - 1, -1, -1):
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
