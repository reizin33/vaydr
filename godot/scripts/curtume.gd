class_name Curtume
extends Node3D
## O curtimento do couro (etapa 6h), como no jogo antigo (48m_couro.js): na estação de couro, o couro bruto vai para o varal
## com 1 gordura (ou 1 sal) e curte sozinho com o passar das horas de jogo, mesmo com você longe: o comum em 4 horas, o
## grande (vaca, urso) em 6 e o resistente (onça) em 8. Cabem 4 no varal de cada estação. O curtido guarda a qualidade do
## couro (baixa, comum, boa, excepcional) e é o que pedem a jaqueta e a calça de couro, a mochila reforçada, o casaco
## grande, as botas de trilha e o equipamento de exploração. As receitas de curtir ficam na aba Materiais (na estação de
## couro); E na estação recolhe o que ficou pronto. Os couros aparecem pendurados no varal, mais escuros quando curtidos.

const VAGAS := 4
## o couro bruto -> [o curtido, as horas no varal]
const CURTIR := {"couro": ["couroCurtido", 4.0], "couroGrande": ["couroGrandeCurtido", 6.0], "couroResistente": ["couroResistenteCurtido", 8.0]}
const ITENS := {
	"couroCurtido": {"nome": "Couro comum curtido", "icone": "couroCurtido", "max": 12, "tipo": "material", "qual": true,
		"desc": "Couro comum preparado na estação de couro. Vira jaqueta, calça e mochila reforçada."},
	"couroGrandeCurtido": {"nome": "Couro grande curtido", "icone": "couroGrandeCurtido", "max": 8, "tipo": "material", "qual": true,
		"desc": "Couro grande preparado. Peças grandes e exigentes: o casaco grande e a mochila de expedição."},
	"couroResistenteCurtido": {"nome": "Couro resistente curtido", "icone": "couroResistenteCurtido", "max": 8, "tipo": "material", "qual": true,
		"desc": "Couro de onça preparado. O equipamento de exploração reforçado."}}

var main
var varais := {}             # a chave da estação (a posição) -> [{"id": o curtido, "q", "fim": minutos de jogo}]
var _nos := {}               # a chave -> o nó com os couros pendurados


func _init(m) -> void:
	main = m
	name = "Curtume"
	registrar()


## os couros curtidos e as receitas de curtir (o catálogo do jogo antigo tinha só as roupas que pedem o curtido)
static func registrar() -> void:
	for id in ITENS:
		if not Dados.ITENS.has(id):
			Dados.ITENS[id] = (ITENS[id] as Dictionary).duplicate(true)
	for bruto in CURTIR:
		var para := str(CURTIR[bruto][0])
		var ja := false
		for r in Dados.RECEITAS:
			if str(r.get("faz", "")) == para and r.has("varal"):
				ja = true
		if ja:
			continue
		var h := float(CURTIR[bruto][1])
		Dados.RECEITAS.append({"faz": para, "n": 1, "custo": {bruto: 1, "gordura": 1}, "alt": {"gordura": ["sal", 1]}, "cat": "materiais",
			"est": "couro", "varal": h, "nome": "Curtir %s (%d h no varal)" % [Dados.nome(bruto).to_lower(), int(h)]})


func minutos() -> float:
	return (float(main.dia) * 24.0 + float(main.hora)) * 60.0


static func chave(p: Vector3) -> String:
	return "%d_%d" % [roundi(p.x * 10.0), roundi(p.z * 10.0)]


## a estação de couro mais perto de p (o índice da peça, ou -1)
func estacao_perto(p: Vector3) -> int:
	var c = main.construcao
	var melhor := -1
	var bd := 1e9
	for i in c.pecas.size():
		var pe: Dictionary = c.pecas[i]
		if pe.get("caiu", false) or str(pe["id"]) != "estacaoCouro":
			continue
		var d: float = (pe["xf"] as Transform3D).origin.distance_to(p)
		if d <= float(c.PERTO) and d < bd:
			bd = d
			melhor = i
	return melhor


func _xf(i: int) -> Transform3D:
	return main.construcao.pecas[i]["xf"]


## a receita de curtir: põe o couro no varal da estação mais perto (gasta o couro e a gordura ou o sal)
func pendurar(r: Dictionary, j) -> String:
	var m := Fabricacao.pode(r, j)
	if m != "":
		return m
	var i := estacao_perto(j.global_position)
	if i < 0:
		return "Precisa estar perto de uma estação de couro"
	var k := chave(_xf(i).origin)
	var L: Array = varais.get(k, [])
	if L.size() >= VAGAS:
		return "O varal está cheio (cabem %d). Recolha o que ficou pronto com E na estação." % VAGAS
	var c := Fabricacao.custo_real(r, j.inv)
	var bruto := ""
	for b in CURTIR:
		if str(CURTIR[b][0]) == str(r["faz"]):
			bruto = b
	var q := _melhor_qual(j.inv, bruto)
	if not j.inv.pagar(c):
		return "Falta material"
	L.append({"id": str(r["faz"]), "q": q, "fim": minutos() + float(r["varal"]) * 60.0})
	varais[k] = L
	_desenhar(i)
	main.sons.tocar("construir", _xf(i).origin, -4.0)
	return "%s no varal: pronto em %d horas de jogo (curte sozinho, mesmo com você longe)" % [Dados.nome(bruto), int(r["varal"])]


func _melhor_qual(inv, id: String) -> int:
	var q := -1
	for s in inv.slots:
		if s != null and str(s["id"]) == id:
			q = maxi(q, int(s.get("q", -1)))
	return q


## E na estação: recolhe o couro que ficou pronto (o resto continua no varal); devolve quantos
func recolher(i: int, j) -> int:
	var k := chave(_xf(i).origin)
	var L: Array = varais.get(k, [])
	if L.is_empty():
		return 0
	var agora := minutos()
	var fica: Array = []
	var n := 0
	for e in L:
		if float(e["fim"]) <= agora:
			var extra := {"q": int(e["q"])} if int(e["q"]) >= 0 else {}
			j._ganhar(str(e["id"]), 1, extra)
			n += 1
		else:
			fica.append(e)
	varais[k] = fica
	if n > 0:
		main.sons.tocar("pegar", _xf(i).origin, -2.0)
		main.ui.aviso("Recolheu %d couro%s curtido%s do varal" % [n, "s" if n > 1 else "", "s" if n > 1 else ""], 4.0)
		_desenhar(i)
	return n


## o que está no varal (para o texto da mira): "" se vazio
func resumo(i: int) -> String:
	var L: Array = varais.get(chave(_xf(i).origin), [])
	if L.is_empty():
		return ""
	var agora := minutos()
	var prontos := 0
	var falta := 1e9
	for e in L:
		if float(e["fim"]) <= agora:
			prontos += 1
		else:
			falta = minf(falta, float(e["fim"]) - agora)
	var t := "varal: %d de %d" % [L.size(), VAGAS]
	if prontos > 0:
		t += " · %d pronto%s (E recolhe)" % [prontos, "s" if prontos > 1 else ""]
	else:
		t += " · o próximo em %d h" % maxi(1, ceili(falta / 60.0))
	return t


# ======================================================================== os couros pendurados
func _desenhar(i: int) -> void:
	var xf := _xf(i)
	var k := chave(xf.origin)
	var no = _nos.get(k)
	if no != null and is_instance_valid(no):
		(no as Node).queue_free()
	_nos.erase(k)
	var L: Array = varais.get(k, [])
	if L.is_empty():
		return
	var raiz := Node3D.new()
	add_child(raiz)
	raiz.global_transform = xf
	var agora := minutos()
	for n in L.size():
		var e: Dictionary = L[n]
		var pronto := float(e["fim"]) <= agora
		var mi := MeshInstance3D.new()
		var bm := BoxMesh.new()
		bm.size = Vector3(0.42, 0.62, 0.02)
		mi.mesh = bm
		var m := StandardMaterial3D.new()
		m.albedo_color = Color(0.36, 0.22, 0.12) if pronto else Color(0.62, 0.45, 0.32)
		m.roughness = 0.85
		mi.material_override = m
		raiz.add_child(mi)
		mi.position = Vector3(-0.75 + n * 0.5, 1.05, -0.45)
		mi.rotation = Vector3(0.08, 0.0, (n % 2) * 0.05 - 0.025)
	_nos[k] = raiz


func _process(_dt: float) -> void:
	# quando um fica pronto, o desenho muda de cor (olha de vez em quando)
	if Engine.get_process_frames() % 120 != 0:
		return
	var agora := minutos()
	for k in varais:
		for e in varais[k]:
			if float(e["fim"]) <= agora and not bool(e.get("visto", false)):
				e["visto"] = true
				var i := _indice(str(k))
				if i >= 0:
					_desenhar(i)


func _indice(k: String) -> int:
	var c = main.construcao
	for i in c.pecas.size():
		var pe: Dictionary = c.pecas[i]
		if not pe.get("caiu", false) and str(pe["id"]) == "estacaoCouro" and chave((pe["xf"] as Transform3D).origin) == k:
			return i
	return -1


# ======================================================================== jogo salvo
func salvar() -> Dictionary:
	var v := {}
	for k in varais:
		var L: Array = []
		for e in varais[k]:
			L.append({"id": e["id"], "q": e["q"], "fim": snappedf(float(e["fim"]), 0.1)})
		v[k] = L
	return {"varais": v}


func carregar(d: Dictionary) -> void:
	for k in _nos:
		if is_instance_valid(_nos[k]):
			(_nos[k] as Node).queue_free()
	_nos = {}
	varais = {}
	var v = d.get("varais", {})
	if v is Dictionary:
		for k in v:
			var L: Array = []
			for e in v[k]:
				if e is Dictionary and ITENS.has(str(e.get("id", ""))):
					L.append({"id": str(e["id"]), "q": int(e.get("q", -1)), "fim": float(e.get("fim", 0.0))})
			if not L.is_empty():
				varais[str(k)] = L
	for k in varais:
		var i := _indice(str(k))
		if i >= 0:
			_desenhar(i)
