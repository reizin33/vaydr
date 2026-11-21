class_name Fabricacao
## As 100 receitas do jogo antigo: onde cada uma se faz (na mão, na bancada de trabalho nível 1 ou 2, na estação de couro,
## na fornalha, na bancada de desmanche ou na fogueira), o que desbloqueia cada uma (ter visto um item, ler uma folha de
## receita, a bancada nível 2...), os ingredientes que podem ser trocados (3 fibras ou 1 corda...) e as que pedem uma lâmina
## na mochila.

const LAMINAS := ["faca", "facaPedra", "facaCaca", "facao", "cutelo", "machado", "machadoPedra"]


## a receita está liberada para este jogador?
static func desbloqueada(r: Dictionary, j) -> bool:
	return motivo_trancada(r, j) == ""


## o que falta para liberar ("" = liberada)
static func motivo_trancada(r: Dictionary, j) -> String:
	if j.aprendidas.has(str(r["faz"])):
		return ""
	var db = r.get("desb")
	if typeof(db) != TYPE_DICTIONARY:
		return ""
	var d: Dictionary = db
	if d.has("item"):
		return "" if j.vistos.has(str(d["item"])) else "Libera quando você achar: %s" % Dados.nome(str(d["item"]))
	if d.has("estudo"):
		return "" if j.vistos.has(str(d["estudo"])) else "Libera estudando um(a) %s" % Dados.nome(str(d["estudo"]))
	if d.has("manual"):
		return "Libera lendo uma folha de receita"
	if d.has("oficina"):
		return "" if j.main.construcao.nivel_bancada_perto(j.global_position, 40.0) >= 2 else "Libera com a bancada de trabalho nível 2"
	if d.has("prog"):
		return "" if j.consertos >= 3 else "Libera depois de consertar 3 vezes"
	if d.has("fauna"):
		return "Libera com o %s (os bichos chegam na etapa 6)" % str(d["fauna"])
	return ""


## a estação está perto? ("" = sim; senão, qual falta)
static func falta_estacao(r: Dictionary, j) -> String:
	var e := Dados.estacao(r)
	if e == "":
		return ""
	if j.main.construcao.estacao_perto(e, j.global_position):
		return ""
	return "Precisa estar perto de: " + Dados.nome_estacao(e)


## "ferramenta" no jogo antigo: true ou "lamina" pede uma lâmina na mochila; false ou nada, não
static func precisa_lamina(r: Dictionary) -> bool:
	var f = r.get("ferramenta")
	if f is bool:
		return f
	return f != null and str(f) != ""


static func tem_lamina(inv: Inventario) -> bool:
	for l in LAMINAS:
		if inv.conta(l) > 0:
			return true
	return false


## o custo de verdade: troca o ingrediente que falta pelo alternativo quando dá (3 fibras -> 1 corda, como lá)
static func custo_real(r: Dictionary, inv: Inventario) -> Dictionary:
	var c := Dados.custo(r)
	var alt = r.get("alt")
	if typeof(alt) != TYPE_DICTIONARY:
		return c
	for k in (alt as Dictionary):
		if c.has(k) and inv.conta(k) < int(c[k]):
			var troca: Array = alt[k]
			var novo := str(troca[0])
			if inv.conta(novo) >= int(troca[1]):
				c.erase(k)
				c[novo] = int(c.get(novo, 0)) + int(troca[1])
	return c


## dá para fazer agora? ("" = sim; senão, o motivo)
static func pode(r: Dictionary, j) -> String:
	var m := motivo_trancada(r, j)
	if m != "":
		return m
	m = falta_estacao(r, j)
	if m != "":
		return m
	if precisa_lamina(r) and not tem_lamina(j.inv):
		return "Precisa de uma lâmina na mochila (faca, facão ou machado)"
	var c := custo_real(r, j.inv)
	if not j.inv.tem(c):
		return "Falta material"
	return ""


## faz a receita (gasta o material e põe o item na mochila; o que não couber fica no chão)
static func fazer(r: Dictionary, j) -> String:
	var m := pode(r, j)
	if m != "":
		return m
	var c := custo_real(r, j.inv)
	if not j.inv.pagar(c):
		return "Falta material"
	j._ganhar(str(r["faz"]), int(r.get("n", 1)))
	return ""


static func nome(r: Dictionary) -> String:
	return str(r.get("nome", Dados.nome(str(r["faz"]))))


## conserto na bancada (ferramenta, arma e roupa gastas): um terço do que a receita pede (sem receita: sucata e madeira)
static func custo_conserto(id: String) -> Dictionary:
	for r in Dados.RECEITAS:
		if str(r["faz"]) == id:
			var c := {}
			var base := Dados.custo(r)
			for k in base:
				c[k] = maxi(1, ceili(float(base[k]) / 3.0))
			return c
	return {"sucata": 1, "madeira": 1}


static func consertar_item(j, i: int) -> String:
	var s = j.inv.slots[i]
	if s == null or not s.has("dur"):
		return "Isso não gasta"
	var mx := float(Dados.item(str(s["id"])).get("durMax", 1.0))
	if float(s["dur"]) >= mx:
		return "Já está inteiro"
	if j.main.construcao.nivel_bancada_perto(j.global_position) <= 0:
		return "Conserto só perto de uma bancada de trabalho"
	var c := custo_conserto(str(s["id"]))
	if not j.inv.pagar(c):
		return "Falta material para consertar: " + Dados.custo_txt(c)
	s["dur"] = mx
	j.consertos += 1
	j.inv.mudou.emit()
	return ""

