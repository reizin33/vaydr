class_name Dados
## Itens, receitas e peças de construção do protótipo (o "cheio de coisa" do Rust começa aqui: tudo sai de coleta).

const ITENS := {
	"madeira": {"nome": "Madeira", "max": 1000, "tipo": "recurso", "cor": Color(0.55, 0.38, 0.22)},
	"pedra": {"nome": "Pedra", "max": 1000, "tipo": "recurso", "cor": Color(0.55, 0.55, 0.52)},
	"fibra": {"nome": "Fibra", "max": 500, "tipo": "recurso", "cor": Color(0.42, 0.55, 0.25)},
	"sucata": {"nome": "Sucata", "max": 500, "tipo": "recurso", "cor": Color(0.45, 0.42, 0.4)},
	"pano": {"nome": "Pano", "max": 200, "tipo": "recurso", "cor": Color(0.75, 0.72, 0.62)},
	"lata": {"nome": "Lata de feijão", "max": 10, "tipo": "comida", "fome": 30.0, "sede": -4.0, "cor": Color(0.7, 0.3, 0.2)},
	"agua": {"nome": "Garrafa d'água", "max": 10, "tipo": "comida", "sede": 35.0, "cor": Color(0.4, 0.6, 0.85)},
	"bandagem": {"nome": "Bandagem", "max": 10, "tipo": "cura", "vida": 20.0, "cor": Color(0.9, 0.9, 0.85)},
	"fruta": {"nome": "Frutinha do mato", "max": 30, "tipo": "comida", "fome": 9.0, "sede": 4.0, "cor": Color(0.62, 0.15, 0.3)},
	"cogumelo": {"nome": "Cogumelo", "max": 20, "tipo": "comida", "fome": 6.0, "sede": 1.0, "cor": Color(0.78, 0.7, 0.58)},
	"machado": {"nome": "Machado", "max": 1, "tipo": "ferramenta", "modelo": "res://assets/ferramentas/machado.glb", "dano": 22.0, "madeira": 1.0, "pedra": 0.25, "tempo": 0.75},
	"picareta": {"nome": "Picareta", "max": 1, "tipo": "ferramenta", "modelo": "res://assets/ferramentas/picareta.glb", "dano": 20.0, "madeira": 0.3, "pedra": 1.0, "tempo": 0.85},
	"facao": {"nome": "Facão", "max": 1, "tipo": "ferramenta", "modelo": "res://assets/ferramentas/facao.glb", "dano": 30.0, "madeira": 0.45, "pedra": 0.1, "tempo": 0.5},
	"taco": {"nome": "Taco", "max": 1, "tipo": "ferramenta", "modelo": "res://assets/ferramentas/taco.glb", "dano": 26.0, "madeira": 0.2, "pedra": 0.1, "tempo": 0.65},
	"plano": {"nome": "Plano de construção", "max": 1, "tipo": "plano", "cor": Color(0.3, 0.45, 0.75)},
	"martelo": {"nome": "Pé de cabra (conserta a base)", "max": 1, "tipo": "ferramenta", "modelo": "res://assets/ferramentas/peDeCabra.glb", "dano": 12.0, "madeira": 0.3, "pedra": 0.2, "tempo": 0.6, "conserta": true},
	"fogueira": {"nome": "Fogueira", "max": 5, "tipo": "colocavel", "cor": Color(0.85, 0.45, 0.15)},
	"saco": {"nome": "Saco de dormir", "max": 3, "tipo": "colocavel", "cor": Color(0.3, 0.42, 0.3)},
	"bau": {"nome": "Baú de madeira", "max": 3, "tipo": "colocavel", "cor": Color(0.5, 0.36, 0.2)},
	"lanterna": {"nome": "Lanterna", "max": 1, "tipo": "ferramenta", "modelo": "res://assets/ferramentas/lanterna.glb", "dano": 6.0, "madeira": 0.2, "pedra": 0.1, "tempo": 0.6, "luz": true},
}

## o que cada mão vazia ou ferramenta tira de cada recurso por golpe
const MAO := {"dano": 8.0, "madeira": 0.35, "pedra": 0.15, "tempo": 0.55}

const RECEITAS := [
	{"faz": "machado", "n": 1, "custo": {"madeira": 30, "pedra": 15}},
	{"faz": "picareta", "n": 1, "custo": {"madeira": 30, "pedra": 25}},
	{"faz": "taco", "n": 1, "custo": {"madeira": 40}},
	{"faz": "facao", "n": 1, "custo": {"sucata": 8, "madeira": 10}},
	{"faz": "plano", "n": 1, "custo": {"madeira": 20}},
	{"faz": "martelo", "n": 1, "custo": {"madeira": 25, "pedra": 5}},
	{"faz": "bandagem", "n": 1, "custo": {"pano": 3}},
	{"faz": "pano", "n": 1, "custo": {"fibra": 8}},
	{"faz": "fogueira", "n": 1, "custo": {"madeira": 50, "pedra": 10}},
	{"faz": "saco", "n": 1, "custo": {"pano": 10}},
	{"faz": "bau", "n": 1, "custo": {"madeira": 100}},
	{"faz": "lanterna", "n": 1, "custo": {"sucata": 12, "pano": 2}},
]

## peças de construção (tamanho do módulo: 3 m, como no Rust)
const MODULO := 3.0
const PECAS := [
	{"id": "fundacao", "nome": "Fundação", "custo": {"madeira": 50}, "vida": 400.0},
	{"id": "parede", "nome": "Parede", "custo": {"madeira": 40}, "vida": 300.0},
	{"id": "porta", "nome": "Parede com porta", "custo": {"madeira": 60}, "vida": 300.0},
	{"id": "janela", "nome": "Parede com janela", "custo": {"madeira": 40}, "vida": 250.0},
	{"id": "piso", "nome": "Piso / teto", "custo": {"madeira": 30}, "vida": 250.0},
	{"id": "escada", "nome": "Escada", "custo": {"madeira": 40}, "vida": 250.0},
]


static func nome(id: String) -> String:
	return ITENS[id]["nome"] if ITENS.has(id) else id


static func peca(id: String) -> Dictionary:
	for p in PECAS:
		if p["id"] == id:
			return p
	return {}
