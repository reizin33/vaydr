class_name Plantio
extends Node3D
## O plantio e o pomar (etapa 6g), como no jogo antigo (48ya_plantio.js e 48yb_pomar.js):
## · os canteiros: cada fileira de terra da plantação da fazenda (cada terço da fileira) e das hortas dos sítios. Seis
##   culturas: milho, batata, abóbora, tomate, cenoura e feijão verde. No canteiro vazio, com sementes na mochila: toque E
##   para escolher a cultura e segure E para plantar (gasta 1 semente). Cresce sozinho em mais ou menos um dia de jogo (a
##   chuva acelera; à noite, no frio do outono e no inverno cresce mais devagar; dormindo, o tempo passa e a roça cresce
##   junto). Pronto: segure E para colher; quase sempre volta uma semente (às vezes duas), então dá para manter a roça. Na
##   fazenda os canteiros começam vazios; nas hortas dos sítios a maioria ainda tem o que colher;
## · as árvores de fruta das casas da vila e dos sítios (laranja, manga e acerola): segure E perto do tronco para colher; a
##   fruta volta em uns 2 dias de jogo.
## A roça e as frutas ficam no jogo salvo. Na partida em rede cada um vê a roça do próprio jogo (ela não é dividida).

const CULT := [{"id": "milho", "nome": "milho", "min": 1, "max": 2}, {"id": "batata", "nome": "batata", "min": 1, "max": 2},
	{"id": "abobora", "nome": "abóbora", "min": 1, "max": 1}, {"id": "tomate", "nome": "tomate", "min": 2, "max": 3},
	{"id": "cenoura", "nome": "cenoura", "min": 1, "max": 3}, {"id": "feijaoVerde", "nome": "feijão verde", "min": 1, "max": 3}]
const HORAS := 24.0          # horas de jogo para o canteiro ficar pronto
const FRUTO_H := 48.0        # horas de jogo para a fruta voltar
const POMAR := {"laranja": {"folha": 0x3a6628, "cor": [0xe08a20, 0xe8962a, 0xd07a18], "r": 0.075, "n": 16, "plural": "laranjas"},
	"manga": {"folha": 0x2f5a24, "cor": [0xd8a030, 0xc8b040, 0xd07a30], "r": 0.085, "n": 14, "plural": "mangas"},
	"acerola": {"folha": 0x426e2c, "cor": [0xc0201c, 0xd0301c, 0xa81818], "r": 0.045, "n": 28, "plural": "acerolas"},
	"maca": {"folha": 0x3f6a2a, "cor": [0xb8322a, 0xa83026, 0xb0a038], "r": 0.075, "n": 16, "plural": "maçãs"}}

var main
var DEF: Array = []          # os canteiros: {"id", "a": Vector2, "b": Vector2, "y", "tipo"}
var S := {}                  # id -> -1 vazio, de 0 a 1 crescendo, 1 pronto
var C := {}                  # id -> a cultura plantada (índice em CULT)
var sel := 0                 # a cultura escolhida para plantar
var FR: Array = []           # as árvores de fruta: {"id", "p": Vector3, "fruta"}
var W := {}                  # id -> a fruta (1 madura)
var colhidos := 0            # quantas colheitas (para o teste)
var _nos := {}               # id -> a planta do canteiro (MeshInstance3D)
var _frutas := {}            # id -> as frutas da árvore (MeshInstance3D)
var _malhas := {}
var _vis_t := 0.0
var _dica := {}


func _init(m) -> void:
	main = m


func _ready() -> void:
	name = "Plantio"
	var d: Array = main.mundo.plantio_def
	for i in d.size():
		var e: Dictionary = d[i]
		var tipo := str(e.get("tipo", "fazenda"))
		DEF.append({"id": "%s%d" % ["faz" if tipo == "fazenda" else "sit", i], "a": Vector2(float(e["ax"]), float(e["az"])),
			"b": Vector2(float(e["bx"]), float(e["bz"])), "y": float(e.get("y", 0.0)), "tipo": tipo})
	var f: Array = main.mundo.fruteiras
	for i in f.size():
		var e: Dictionary = f[i]
		var p := Vector3(float(e["x"]), float(e.get("y", 0.0)), float(e["z"]))
		p.y = main.terreno.h(p.x, p.z) if absf(p.y) < 0.05 else p.y
		FR.append({"id": "fr%d" % i, "p": p, "fruta": str(e.get("fruta", "laranja"))})
	_montar_malhas()
	novo()
	for fr in FR:
		_arvore(fr)


## o começo de um mundo: a fazenda vazia, os sítios com quase tudo pronto, as árvores com fruta
func novo() -> void:
	S = {}
	C = {}
	sel = 0
	for i in DEF.size():
		var d: Dictionary = DEF[i]
		S[d["id"]] = 1.0 if (d["tipo"] == "sitio" and i % 3 != 2) else -1.0
	W = {}
	for fr in FR:
		W[fr["id"]] = 1.0
	_dica = {}
	_atualizar_tudo()


# ======================================================================== o crescimento
## o ritmo agora: a chuva ajuda, a noite atrasa e a estação manda (o inverno quase para)
func ritmo(chuva := 1.8) -> float:
	var r := 1.0
	var cl = main.get("clima")
	if cl != null:
		if float(cl.chuva_k) > 0.3:
			r *= chuva
		r *= float(cl.estacao()["horta"])
	var h: float = main.hora
	if h < 6.0 or h >= 20.0:
		r *= 0.7
	return r


func passo(dt: float) -> void:
	var turbo: float = main.sono.turbo() if main.get("sono") != null else 1.0
	var horas: float = dt * turbo / maxf(0.01, float(main.seg_hora()))
	var rt := ritmo()
	var r := horas / HORAS * rt
	for k in S:
		var c: float = S[k]
		if c >= 0.0 and c < 1.0:
			S[k] = minf(1.0, c + r)
	var rf := horas / FRUTO_H * ritmo(1.5)
	for k in W:
		var w: float = W[k]
		if w < 1.0:
			W[k] = minf(1.0, w + rf)
	# o desenho só muda de vez em quando (a planta cresce devagar)
	_vis_t -= dt
	if _vis_t <= 0.0:
		_vis_t = 1.0
		_atualizar_tudo()


# ======================================================================== o que está na sua frente
## o canteiro ou a árvore de fruta perto de você (o ponto da fileira mais perto, como no jogo antigo); {} se nada
func alvo(j) -> Dictionary:
	var p: Vector3 = j.global_position
	var fr: Vector3 = -j.global_transform.basis.z
	var melhor := {}
	var bd := 1e9
	for d in DEF:
		var a: Vector2 = d["a"]
		var b: Vector2 = d["b"]
		var meio := (a + b) * 0.5
		if absf(meio.x - p.x) > 8.0 or absf(meio.y - p.z) > 8.0:
			continue
		var v := b - a
		var t := clampf((Vector2(p.x, p.z) - a).dot(v) / maxf(v.length_squared(), 1e-6), 0.0, 1.0)
		var q := a + v * t
		var dist := Vector2(p.x, p.z).distance_to(q)
		if dist > 1.9 or absf(float(d["y"]) - p.y) > 1.6:
			continue
		# na frente (ou bem em cima)
		var para := Vector2(q.x - p.x, q.y - p.z)
		if dist > 0.6 and Vector2(fr.x, fr.z).normalized().dot(para.normalized()) < 0.2:
			continue
		if dist < bd:
			bd = dist
			melhor = {"k": "canteiro", "id": d["id"], "p": Vector3(q.x, float(d["y"]), q.y), "d": d}
	for f in FR:
		var fp: Vector3 = f["p"]
		var df := Vector2(fp.x - p.x, fp.z - p.z).length()
		if df > 2.1 or absf(fp.y - p.y) > 2.0:
			continue
		if df < bd:
			bd = df
			melhor = {"k": "fruteira", "id": f["id"], "p": fp, "f": f}
	return melhor


func texto(j) -> String:
	var a := alvo(j)
	if a.is_empty():
		return ""
	if a["k"] == "fruteira":
		var fruta := str(a["f"]["fruta"])
		var nm := Dados.nome(fruta).to_lower()
		var w: float = W.get(a["id"], 1.0)
		if w >= 1.0:
			return "E  Colher %s (segure · pé de %s)" % [str(POMAR.get(fruta, {}).get("plural", nm)), nm]
		return "Pé de %s sem fruta (volta em umas %d h)" % [nm, maxi(1, ceili((1.0 - w) * FRUTO_H / maxf(0.1, ritmo())))]
	var c: float = S.get(a["id"], -1.0)
	if c < 0.0:
		var n: int = j.inv.conta("sementes")
		if n <= 0:
			return "Canteiro vazio (precisa de sementes para plantar)"
		return "E  Plantar %s aqui (toque: trocar · segure: plantar · %d semente%s)" % [str(CULT[sel]["nome"]), n, "s" if n > 1 else ""]
	var cu: Dictionary = CULT[int(C.get(a["id"], _cult_padrao(str(a["id"]))))]
	if c < 1.0:
		var h := maxi(1, ceili((1.0 - c) * HORAS / maxf(0.1, ritmo())))
		var chove: bool = main.get("clima") != null and float(main.clima.chuva_k) > 0.3
		return "%s crescendo · %d%% (pronto em umas %d h%s)" % [_mai(str(cu["nome"])), floori(c * 100.0), h, " · a chuva ajuda" if chove else ""]
	return "E  Colher %s (segure)" % str(cu["nome"])


static func _mai(t: String) -> String:
	return t.substr(0, 1).to_upper() + t.substr(1)


## a cultura dos canteiros que já vêm plantados (sítios): milho, batata ou abóbora, sempre a mesma em cada um
func _cult_padrao(id: String) -> int:
	var h := 7
	for i in id.length():
		h = (h * 31 + id.unicode_at(i)) % 1000003
	var r := h % 5
	return 0 if r < 2 else (1 if r < 4 else 2)


## quanto tempo segurar E (0: não tem o que fazer)
func duracao(a: Dictionary, j) -> float:
	if a["k"] == "fruteira":
		return 1.0
	var c: float = S.get(a["id"], -1.0)
	if c < 0.0:
		return 1.0 if int(j.inv.conta("sementes")) > 0 else 0.0
	return 0.9 if c >= 1.0 else 0.0


## E rápido: no canteiro vazio troca a cultura que vai plantar
func toque(a: Dictionary, j) -> void:
	if a.get("k", "") != "canteiro":
		return
	if float(S.get(a["id"], -1.0)) >= 0.0:
		_por_que(a, j)
		return
	if int(j.inv.conta("sementes")) <= 0:
		_por_que(a, j)
		return
	sel = (sel + 1) % CULT.size()
	main.sons.tocar("clique", j.global_position, -6.0)
	main.ui.aviso("Vai plantar: %s" % str(CULT[sel]["nome"]), 2.0)


## E sem ter o que fazer: diz o porquê
func _por_que(a: Dictionary, j) -> void:
	if a["k"] == "fruteira":
		main.ui.aviso("Ainda sem fruta madura", 2.0)
		return
	var c: float = S.get(a["id"], -1.0)
	if c < 0.0:
		main.ui.aviso("Precisa de sementes: procure no celeiro, nas casas e no mercado", 4.0)
		main.sons.tocar("vazio", j.global_position, -6.0)
	elif c < 1.0:
		var cu: Dictionary = CULT[int(C.get(a["id"], _cult_padrao(str(a["id"]))))]
		main.ui.aviso("%s ainda crescendo (%d%%)" % [_mai(str(cu["nome"])), floori(c * 100.0)], 2.5)


## segurou E até o fim: planta ou colhe
func concluir(a: Dictionary, j) -> void:
	if a["k"] == "fruteira":
		var id := str(a["id"])
		if float(W.get(id, 1.0)) < 1.0:
			_por_que(a, j)
			return
		W[id] = 0.0
		var fruta := str(a["f"]["fruta"])
		var n := randi_range(5, 9) if fruta == "acerola" else randi_range(2, 4)
		j._ganhar(fruta, n)
		colhidos += 1
		main.sons.tocar("pegar", a["p"], -2.0)
		if not _dica.has("pomar"):
			_dica["pomar"] = true
			main.ui.aviso("A fruta volta em uns 2 dias de jogo.", 5.0)
		_atualizar_tudo()
		return
	var cid := str(a["id"])
	var c: float = S.get(cid, -1.0)
	if c < 0.0:
		if int(j.inv.conta("sementes")) <= 0:
			_por_que(a, j)
			return
		j.inv.tirar("sementes", 1)
		S[cid] = 0.0
		C[cid] = sel
		main.ui.atualizar()
		main.sons.tocar("pegar", a["p"], -4.0)
		main.ui.aviso("Plantou %s: fica pronto em mais ou menos um dia" % str(CULT[sel]["nome"]), 3.0)
		if not _dica.has("canteiro"):
			_dica["canteiro"] = true
			main.ui.aviso("O canteiro cresce sozinho em mais ou menos um dia (a chuva ajuda). No canteiro vazio, toque E para trocar o que vai plantar: milho, batata, abóbora, tomate, cenoura ou feijão.", 9.0)
		_atualizar_tudo()
		return
	if c < 1.0:
		_por_que(a, j)
		return
	var cu: Dictionary = CULT[int(C.get(cid, _cult_padrao(cid)))]
	j._ganhar(str(cu["id"]), randi_range(int(cu["min"]), int(cu["max"])))
	var sem := (1 if randf() < 0.8 else 0) + (1 if randf() < 0.2 else 0)
	if sem > 0:
		j._ganhar("sementes", sem)
	S[cid] = -1.0
	C.erase(cid)
	colhidos += 1
	main.sons.tocar("pegar", a["p"], -2.0)
	_atualizar_tudo()


# ======================================================================== o desenho
func _atualizar_tudo() -> void:
	if _malhas.is_empty():
		return
	for d in DEF:
		_canteiro(d)
	for f in FR:
		var fm = _frutas.get(f["id"])
		if fm != null and is_instance_valid(fm):
			(fm as Node3D).visible = float(W.get(f["id"], 1.0)) >= 1.0


## a planta do canteiro: a muda no começo e o pé de cada cultura depois, esticada no comprimento da fileira
func _canteiro(d: Dictionary) -> void:
	var id := str(d["id"])
	var c: float = S.get(id, -1.0)
	var mi = _nos.get(id)
	if c < 0.0:
		if mi != null and is_instance_valid(mi):
			(mi as Node3D).visible = false
		return
	if mi == null or not is_instance_valid(mi):
		mi = MeshInstance3D.new()
		(mi as MeshInstance3D).material_override = ModelosBichos._mat()
		(mi as MeshInstance3D).visibility_range_end = 90.0
		add_child(mi)
		_nos[id] = mi
	var nome_m := "broto" if c < 0.45 else str(CULT[int(C.get(id, _cult_padrao(id)))]["id"])
	(mi as MeshInstance3D).mesh = _malhas[nome_m]
	(mi as Node3D).visible = true
	var a: Vector2 = d["a"]
	var b: Vector2 = d["b"]
	var L := a.distance_to(b)
	var ry := atan2(-(b.y - a.y), b.x - a.x)
	var k := 1.0 if c >= 1.0 else (0.5 + c if c < 0.45 else 0.45 + 0.5 * c)
	var meio := (a + b) * 0.5
	(mi as Node3D).transform = Transform3D(Basis.from_euler(Vector3(0, ry, 0)) * Basis.from_scale(Vector3(L / 5.8, k, 1.0)), Vector3(meio.x, float(d["y"]), meio.y))


## a árvore de fruta: a copa (o tronco está no mapa) e as frutas, que somem quando você colhe
func _arvore(f: Dictionary) -> void:
	var fruta := str(f["fruta"])
	var copa := MeshInstance3D.new()
	copa.mesh = _malhas["copa_" + ("manga" if fruta == "manga" else "outra")]
	copa.material_override = ModelosBichos._mat()
	copa.visibility_range_end = 160.0
	add_child(copa)
	copa.position = f["p"]
	var fm := MeshInstance3D.new()
	fm.mesh = _malhas["fruta_" + fruta]
	fm.material_override = ModelosBichos._mat()
	fm.visibility_range_end = 90.0
	add_child(fm)
	fm.position = f["p"]
	_frutas[f["id"]] = fm


# ---------------------------------------------------------------- as malhas (como no jogo antigo)
static func _hex(a: int, b: int, t: float) -> int:
	var ca := ModelosBichos._cor(a)
	var cb := ModelosBichos._cor(b)
	var c := ca.lerp(cb, clampf(t, 0.0, 1.0))
	return (int(c.r * 255.0) << 16) | (int(c.g * 255.0) << 8) | int(c.b * 255.0)


func _montar_malhas() -> void:
	var R := RandomNumberGenerator.new()
	R.seed = 7171
	ModelosBichos._jit = 0.12
	# a folha: uma lâmina inclinada para fora
	var folha := func(pecas: Array, x: float, y: float, a: float, inc: float, l: float, w: float, cor: int) -> void:
		ModelosBichos._put(pecas, 0, ModelosBichos._caixa(0.03, l, w, 0.2, 1.0), ModelosBichos._m(x, y, 0, 0, a, 0) * ModelosBichos._m(0, l / 2.0, w * 0.35, -inc, 0, 0), cor, 0.15)
	var tufo := func(pecas: Array, x: float, y: float, z: float, r: float, cor: int, sy: float) -> void:
		ModelosBichos._put(pecas, 0, ModelosBichos._bola(r, 0.35, R), ModelosBichos._m(x, y, z, 0, R.randf() * 3.0, 0, 1, sy, 1), cor, 0.12)
	var verde := func(a: int, b: int) -> int:
		return Plantio._hex(a, b, R.randf())
	var feitas := {}
	# a muda
	var p: Array = [[]]
	for i in 9:
		var x := -2.6 + i * 0.65 + (R.randf() - 0.5) * 0.12
		for k in 4:
			folha.call(p, x, 0.0, k * 1.57 + R.randf() * 0.6, 0.4, 0.3, 0.1, verde.call(0x4a7a2c, 0x6a8a34))
	feitas["broto"] = p
	# o milho
	p = [[]]
	for i in 9:
		var x := -2.6 + i * 0.65 + (R.randf() - 0.5) * 0.12
		var h := 1.25 + R.randf() * 0.3
		ModelosBichos._put(p, 0, ModelosBichos._cil(0.018, 0.03, h, 5), ModelosBichos._m(x, 0, 0), 0x6a7a34)
		for k in 6:
			folha.call(p, x, 0.2 + k * 0.16, k * 1.9 + R.randf() * 0.5, 0.85, 0.55, 0.11, verde.call(0x5a7a2c, 0x7a8a38))
		ModelosBichos._put(p, 0, ModelosBichos._cil(0.035, 0.045, 0.24, 6), ModelosBichos._m(x + 0.05, 0.62, 0.03, 0.35, 0, 0.2), 0xd9b84a)
		ModelosBichos._put(p, 0, ModelosBichos._cil(0.004, 0.02, 0.2, 4), ModelosBichos._m(x, h, 0), 0xb89a4a)
	feitas["milho"] = p
	# a batata
	p = [[]]
	for i in 9:
		var x := -2.6 + i * 0.65 + (R.randf() - 0.5) * 0.12
		for k in 4:
			var a := k * 1.6 + R.randf() * 0.5
			var r := 0.1 if k > 0 else 0.0
			tufo.call(p, x + cos(a) * r, 0.13 + (0.0 if k > 0 else 0.08) + R.randf() * 0.04, sin(a) * r, 0.15 + R.randf() * 0.04, verde.call(0x46722a, 0x62883a), 0.65)
		for k in 3:
			folha.call(p, x + (R.randf() - 0.5) * 0.2, 0.05, R.randf() * TAU, 0.9, 0.22, 0.09, verde.call(0x4f7a2f, 0x6a8a3a))
		if i % 2 == 0:
			for k in 2:
				ModelosBichos._put(p, 0, ModelosBichos._bola(0.03, 0.2, R), ModelosBichos._m(x + (R.randf() - 0.5) * 0.16, 0.33 + R.randf() * 0.04, (R.randf() - 0.5) * 0.12), 0xe6e0ee if k > 0 else 0xc9b8e0, 0.05)
	feitas["batata"] = p
	# a abóbora
	p = [[]]
	for i in 5:
		var x := -2.4 + i * 1.2 + (R.randf() - 0.5) * 0.15
		for k in 5:
			var a := k * 1.26 + R.randf() * 0.5
			ModelosBichos._put(p, 0, ModelosBichos._caixa(0.26, 0.012, 0.24), ModelosBichos._m(x + cos(a) * 0.22, 0.12 + R.randf() * 0.05, sin(a) * 0.18, 0, a, 0.1), verde.call(0x4a7a2c, 0x5f8a34), 0.15)
		ModelosBichos._put(p, 0, ModelosBichos._caixa(1.0, 0.03, 0.04), ModelosBichos._m(x + 0.3, 0.03, 0.1, 0, 0.4, 0), 0x5a7a2c)
		ModelosBichos._put(p, 0, ModelosBichos._bola(0.17, 0.15, R), ModelosBichos._m(x + 0.05, 0.14, 0.04, 0, 0, 0, 1.25, 0.85, 1.25), 0xd9771e, 0.08)
		ModelosBichos._put(p, 0, ModelosBichos._cil(0.015, 0.02, 0.07, 5), ModelosBichos._m(x + 0.05, 0.27, 0.04), 0x6a5a2a)
	feitas["abobora"] = p
	# o tomate (com a estaca)
	p = [[]]
	for i in 7:
		var x := -2.55 + i * 0.85 + (R.randf() - 0.5) * 0.1
		ModelosBichos._put(p, 0, ModelosBichos._caixa(0.03, 1.15, 0.03), ModelosBichos._m(x + 0.1, 0.575, 0.02), 0x7a5a3a)
		for k in 4:
			tufo.call(p, x + (R.randf() - 0.5) * 0.12, 0.25 + k * 0.19, (R.randf() - 0.5) * 0.1, 0.14 + R.randf() * 0.04, verde.call(0x3f6a2a, 0x557a32), 0.8)
		for k in 5:
			var a := R.randf() * TAU
			ModelosBichos._put(p, 0, ModelosBichos._bola(0.045, 0.15, R), ModelosBichos._m(x + cos(a) * 0.15, 0.22 + R.randf() * 0.6, sin(a) * 0.15), 0xc8321e if k % 3 > 0 else 0xd85a24, 0.05)
	feitas["tomate"] = p
	# a cenoura
	p = [[]]
	for i in 12:
		var x := -2.7 + i * 0.49 + (R.randf() - 0.5) * 0.1
		for k in 7:
			folha.call(p, x, 0.02, k * 0.9 + R.randf() * 0.4, 0.3 + R.randf() * 0.3, 0.26 + R.randf() * 0.08, 0.06, verde.call(0x4a7a2c, 0x6a9a3a))
		ModelosBichos._put(p, 0, ModelosBichos._cil(0.025, 0.032, 0.05, 6), ModelosBichos._m(x, -0.02, 0), 0xd9771e)
	feitas["cenoura"] = p
	# o feijão (subindo na vara)
	p = [[]]
	for i in 6:
		var x := -2.5 + i * 1.0 + (R.randf() - 0.5) * 0.1
		ModelosBichos._put(p, 0, ModelosBichos._cil(0.014, 0.02, 1.45, 5), ModelosBichos._m(x, 0, 0), 0x7a5a3a)
		for k in 6:
			var a := k * 2.1 + R.randf() * 0.5
			tufo.call(p, x + cos(a) * 0.09, 0.2 + k * 0.2, sin(a) * 0.09, 0.1 + R.randf() * 0.03, verde.call(0x4a7a2c, 0x62903a), 0.6)
		for k in 6:
			var a := R.randf() * TAU
			ModelosBichos._put(p, 0, ModelosBichos._caixa(0.02, 0.17, 0.025), ModelosBichos._m(x + cos(a) * 0.14, 0.3 + R.randf() * 0.8, sin(a) * 0.14, 0.15, 0, 0.1), 0x7aa040)
	feitas["feijaoVerde"] = p
	# as copas das árvores de fruta (5 bolos de folha) e as frutas na beira da copa
	for qual in ["manga", "outra"]:
		p = [[]]
		var fo: int = 0x2f5a24 if qual == "manga" else 0x3f6a2a
		for i in 5:
			var a := i * 1.3
			var r := 0.65 if i > 0 else 0.0
			ModelosBichos._put(p, 0, ModelosBichos._bola(0.8 + R.randf() * 0.3, 0.3, R), ModelosBichos._m(cos(a) * r, 2.3 + (R.randf() * 0.4 if i > 0 else 0.5), sin(a) * r,
				R.randf(), R.randf() * 3.0, R.randf(), 1.1, 0.85, 1.1), Plantio._hex(fo, 0x4f7a2f, R.randf() * 0.5), 0.15)
		feitas["copa_" + qual] = p
	var B: Array = []
	for i in range(1, 5):
		var a := i * 1.3
		B.append(Vector3(cos(a) * 0.65, 2.5, sin(a) * 0.65))
	for fruta in POMAR:
		var P: Dictionary = POMAR[fruta]
		p = [[]]
		var cores: Array = P["cor"]
		for q in int(P["n"]):
			var b: Vector3 = B[q % 4]
			var ol := maxf(Vector2(b.x, b.z).length(), 1e-3)
			var dv := Vector3.ZERO
			for tt in 10:
				var a := R.randf() * TAU
				var ph := -0.95 + R.randf() * 1.2
				dv = Vector3(cos(a) * cos(ph), sin(ph), sin(a) * cos(ph))
				if (dv.x * b.x + dv.z * b.z) / ol > 0.05:
					break
			ModelosBichos._put(p, 0, ModelosBichos._bola(float(P["r"]), 0.15, R), ModelosBichos._m(b.x + dv.x * 1.0, b.y + dv.y * 0.78, b.z + dv.z * 1.0, 0, R.randf() * 3.0, 0,
				1, 1.35 if fruta == "manga" else 1.0, 1), int(cores[R.randi() % cores.size()]), 0.04)
		feitas["fruta_" + fruta] = p
	for nome in feitas:
		_malhas[nome] = ModelosBichos._juntar((feitas[nome] as Array)[0])
	ModelosBichos._jit = 0.05


# ======================================================================== jogo salvo
func salvar() -> Dictionary:
	var s := {}
	for k in S:
		s[k] = snappedf(float(S[k]), 0.001)
	var w := {}
	for k in W:
		w[k] = snappedf(float(W[k]), 0.001)
	return {"s": s, "c": C.duplicate(), "sel": sel, "w": w, "dica": _dica.keys()}


func carregar(d: Dictionary) -> void:
	novo()
	if d.is_empty():
		return
	var s = d.get("s", {})
	if s is Dictionary:
		for k in s:
			if S.has(k):
				S[k] = clampf(float(s[k]), -1.0, 1.0)
	var c = d.get("c", {})
	if c is Dictionary:
		for k in c:
			var v := int(c[k])
			if v >= 0 and v < CULT.size():
				C[k] = v
	sel = clampi(int(d.get("sel", 0)), 0, CULT.size() - 1)
	var w = d.get("w", {})
	if w is Dictionary:
		for k in w:
			if W.has(k):
				W[k] = clampf(float(w[k]), 0.0, 1.0)
	for k in d.get("dica", []):
		_dica[str(k)] = true
	_atualizar_tudo()
