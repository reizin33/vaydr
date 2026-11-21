class_name Dados
## O catálogo do jogo (dados/jogo/catalogo.json, montado por tools/gerar_catalogo.py a partir do VAYDR antigo): os 213 itens
## com nome, descrição, ícone e os números de lá, as 100 receitas (aba, etapa, estação e o que desbloqueia cada uma), as
## construções (as peças da casa na grade e as obras livres: muros, defesas, móveis, base e oficinas) e o que a fogueira faz.

static var ITENS := {}
static var RECEITAS: Array = []
static var CATS: Array = []
static var SLOTS: Array = []
static var OBRAS := {}
static var ABAS_OBRA: Array = []
static var COZINHA: Array = []
static var ESTACOES := {}
static var MELHORA_BANCADA := {}
static var BAU_N := 16
static var _icones := {}

## soco (mão vazia ou item que não é arma)
const MAO := {"nome": "Mão", "dano": 9.0, "tempo": 0.55, "alcance": 1.9}
## tamanho do módulo da casa (3 m, como no Rust)
const MODULO := 3.0
## modelo 3D na mão (os que existem; o resto aparece sem modelo)
const MODELOS := {"machado": "machado", "machadoPedra": "machado", "picareta": "picareta", "faca": "faca", "facaPedra": "faca",
	"facaCaca": "faca", "cutelo": "faca", "facao": "facao", "foice": "facao", "taco": "taco", "tacoCravado": "taco", "porrete": "taco",
	"lanca": "taco", "peDeCabra": "peDeCabra", "martelo": "peDeCabra", "marreta": "peDeCabra", "chaveRoda": "peDeCabra",
	"canoFerro": "taco", "lanterna": "lanterna", "pistola": "pistola", "pa": "pa", "cortaCadeado": "cortaCadeado"}
## os tipos que ficam na barra de atalhos (o resto vai primeiro para os bolsos e a mochila)
const NA_BARRA := ["arma", "plano"]


static func carregar() -> void:
	if not ITENS.is_empty():
		return
	var c: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://dados/jogo/catalogo.json"))
	ITENS = c["itens"]
	RECEITAS = c["receitas"]
	CATS = c["cats"]
	SLOTS = c["slots"]
	OBRAS = c["obras"]
	ABAS_OBRA = c["abas_obra"]
	COZINHA = c["cozinha"]
	ESTACOES = c["estacoes"]
	MELHORA_BANCADA = c["melhora_bancada"]
	BAU_N = int(c.get("bau_n", 16))


static func item(id: String) -> Dictionary:
	return ITENS.get(id, {})


static func nome(id: String) -> String:
	return str(ITENS[id]["nome"]) if ITENS.has(id) else (str(OBRAS[id]["nome"]) if OBRAS.has(id) else id)


static func tipo(id: String) -> String:
	return str(ITENS[id].get("tipo", "")) if ITENS.has(id) else ""


static func max_pilha(id: String) -> int:
	return maxi(1, int(ITENS[id].get("max", 1))) if ITENS.has(id) else 1


static func na_barra(id: String) -> bool:
	var d := item(id)
	return str(d.get("tipo", "")) in NA_BARRA or bool(d.get("mao", false)) or id == "sacoDormir"


static func modelo(id: String) -> String:
	return "res://assets/ferramentas/%s.glb" % MODELOS[id] if MODELOS.has(id) else ""


## ícone (assets/icones/<nome>.webp), guardado depois da primeira vez
static func icone(nome_ic: String) -> Texture2D:
	if nome_ic == "":
		return null
	if not _icones.has(nome_ic):
		var cam := "res://assets/icones/%s.webp" % nome_ic
		_icones[nome_ic] = load(cam) if ResourceLoader.exists(cam) else null
	return _icones[nome_ic]


static func icone_item(id: String) -> Texture2D:
	if ITENS.has(id):
		return icone(str(ITENS[id].get("icone", "")))
	if OBRAS.has(id):
		return icone(str(OBRAS[id].get("icone", "")))
	return null


static func obra(id: String) -> Dictionary:
	return OBRAS.get(id, {})


## compatível com o nome antigo: as peças de construção são as obras
static func peca(id: String) -> Dictionary:
	return OBRAS.get(id, {})


## custo de uma receita ou obra como Dictionary de ints
static func custo(d: Dictionary) -> Dictionary:
	var c := {}
	var src: Dictionary = d.get("custo", {})
	for k in src:
		c[k] = int(src[k])
	return c


static func custo_txt(c: Dictionary) -> String:
	var p := []
	for k in c:
		p.append("%d %s" % [int(c[k]), nome(k)])
	return ", ".join(p)


## a estação que a receita pede ("" = feita na mão)
static func estacao(r: Dictionary) -> String:
	var e := str(r.get("est", 0))
	if e == "0" or e == "0.0":
		return ""
	if e.ends_with(".0"):
		e = e.substr(0, e.length() - 2)
	return e


static func nome_estacao(e: String) -> String:
	return str(ESTACOES[e][1]) if ESTACOES.has(e) else e


static func obra_da_estacao(e: String) -> String:
	return str(ESTACOES[e][0]) if ESTACOES.has(e) else ""
