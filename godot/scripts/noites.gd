class_name Noites
extends Node
## As noites (etapa 5c), como no jogo antigo (40_game.js e 42b_chefe.js):
## · cada noite que cai conta (a 1ª, a 2ª...); de noite a horda vem em ondas, em horas marcadas, de longe para onde vocês
##   estão (a primeira noite com 3 ondas, as outras com 4, cada noite um pouco maior; da 2ª em diante vêm corredores e
##   gritadores; da 3ª em diante cada onda traz um brutamontes na frente);
## · a lua de sangue: na 3ª noite e depois a cada 4 (3ª, 7ª, 11ª...) o céu fica vermelho, a horda vem maior (mais duas ondas)
##   e o Colosso aparece uma vez, a uns 35 m de você, num lugar aberto: um zumbi gigante (uns 4 m), lento, que não cambaleia,
##   com o pisão (levanta os braços e bate no chão: pule na hora), a investida (ruge, abaixa e corre reto; se bater em parede
##   ou árvore fica tonto) e o rugido que chama os de perto. O fogo machuca mais. Derrubado, deixa suprimentos no chão;
## · quem aguenta a lua de sangue ganha, de manhã (7h12), uma caixa de suprimentos largada perto, com fumaça vermelha para
##   achar (e uns zumbis em volta).
## Na partida em rede quem manda é quem abriu (o convidado vê o céu vermelho, que vem junto com a hora, e os bonecos).

const MAX_ZUMBIS := 48     # a horda não passa disso (contando os que já estão andando)

var main
var noite_n := 0
var lua_sangue := false
var colosso_veio := false
var ondas: Array = []        # as horas das ondas que ainda faltam nesta noite
var caixa_h := -1.0          # a hora da caixa de suprimentos da manhã (depois da lua de sangue); -1: não tem
var marcha: Array = []       # os zumbis da horda desta noite (vão atrás de quem estiver mais perto)
var _marcha_t := 0.0
var _hora_antes := -1.0


func _init(m) -> void:
	main = m


## a hora passou de "a" para "b" (o relógio de 24 h dá a volta)
static func passou(a: float, b: float, h: float) -> bool:
	if a <= b:
		return a < h and b >= h
	return a < h or b >= h


## a lua de sangue cai na 3ª noite e depois a cada 4
static func e_lua_sangue(n: int) -> bool:
	return n >= 3 and n % 4 == 3


## as horas das ondas da noite n (como no jogo antigo)
static func horas_ondas(n: int, sangue: bool) -> Array:
	var L: Array = [20.8, 23.0, 1.6] if n <= 1 else [20.6, 22.4, 0.6, 2.8]
	if sangue:
		L.append(21.5)
		L.append(3.6)
	return L


## quantos zumbis vêm numa onda (cada noite um pouco mais; na lua de sangue, metade a mais)
static func qtd_onda(n: int, sangue: bool) -> int:
	return roundi((2.0 + n * 1.8) * (1.5 if sangue else 1.0))


## o tipo do zumbi i da onda da noite n
static func tipo_onda(n: int, i: int, r: float, cidade: bool) -> String:
	if i == 0 and n >= 3:
		return "brute"
	if n >= 2 and r < 0.2:
		return "runner"
	if n >= 2 and r < 0.28:
		return "screamer"
	if n >= 4 and r < 0.34:
		return "inchado"
	if cidade and r > 0.85:
		return "policial"
	return "walker"


func passo(dt: float) -> void:
	var h: float = main.hora
	if _hora_antes < 0.0:
		_hora_antes = h
		return
	var a := _hora_antes
	_hora_antes = h
	if passou(a, h, 19.0):
		inicio_noite()
	if passou(a, h, 6.0):
		fim_noite()
	if caixa_h >= 0.0 and passou(a, h, caixa_h):
		caixa_h = -1.0
		caixa_suprimentos()
	_marchar(dt)
	if not main.noite():
		return
	for o in ondas.duplicate():
		if passou(a, h, float(o)):
			ondas.erase(o)
			onda()
	# o Colosso: uma vez por lua de sangue, entre 21h36 e 4h
	if lua_sangue and not colosso_veio and (h >= 21.6 or h < 4.0):
		colosso()


func inicio_noite() -> void:
	noite_n += 1
	colosso_veio = false
	lua_sangue = e_lua_sangue(noite_n)
	ondas = horas_ondas(noite_n, lua_sangue)
	marcha.clear()
	if lua_sangue:
		main.ui.aviso("Lua de sangue! Esta noite a horda vem maior e tem algo enorme andando com ela. Quem aguentar até o sol nascer ganha uma recompensa.", 9.0)
		main.sons.tocar("grito", main.jogador.global_position + Vector3(0, 25, 0), 4.0)
	else:
		main.ui.aviso("Noite %d: a horda vem em ondas, de longe. Fique perto da base, de uma fogueira ou entre paredes fechadas." % noite_n, 6.0)


func fim_noite() -> void:
	var era := lua_sangue
	lua_sangue = false
	ondas.clear()
	marcha.clear()
	if era and main.jogador.vivo:
		caixa_h = 7.2
		main.ui.aviso("Vocês aguentaram a lua de sangue! De manhã um avião vai largar uma caixa de suprimentos perto daí.", 8.0)


## um ponto aberto para nascer: no chão de terra ou da rua (nem telhado, nem água, nem fora do mapa) e longe de todo mundo
func _ponto_livre(p: Vector3, longe: float) -> bool:
	if not main.terreno.dentro(p.x, p.z) or main.terreno.tipo_agua(p.x, p.z) != 0:
		return false
	var c: Dictionary = main.chao_em(p.x, p.z)
	if absf(float(c["y"]) - main.terreno.h(p.x, p.z)) > 0.6:
		return false
	for q in main.jogadores_vivos():
		var pq: Vector3 = q["p"]
		if Vector2(pq.x - p.x, pq.z - p.z).length() < longe:
			return false
	return true


func _vivos() -> int:
	var n := 0
	for z in main.zumbis:
		if is_instance_valid(z) and z.estado != "morto":
			n += 1
	return n


## uma onda: de 42 a 56 m de cada um que está vivo, e todos vão para onde ele está
func onda() -> int:
	if Rede.convidado():
		return 0
	var feitos := 0
	for q in main.jogadores_vivos():
		var p: Vector3 = q["p"]
		var cheia: bool = main.clima != null and not lua_sangue and main.clima.lua_fase() == 4
		var n := mini(roundi(qtd_onda(noite_n, lua_sangue) * (1.15 if cheia else 1.0)), MAX_ZUMBIS - _vivos())
		var i := 0
		for t in n * 4:
			if i >= n:
				break
			var a := randf() * TAU
			var pz := p + Vector3(cos(a), 0, sin(a)) * randf_range(42.0, 56.0)
			if not _ponto_livre(pz, 22.0):
				continue
			var z: Zumbi = main._nascer(pz, tipo_onda(noite_n, i, randf(), main.na_cidade(pz)))
			z.ouvir(p, randf_range(0.2, 1.6))
			marcha.append(z)
			i += 1
			feitos += 1
	if feitos > 0:
		main.ui.aviso("A horda da lua de sangue está vindo!" if lua_sangue else "A horda está vindo!", 4.0)
		main.sons.tocar("gemido", main.jogador.global_position + Vector3(24, 0, -24), 6.0)
	return feitos


## a horda vai atrás de quem estiver mais perto (a cada 4 s quem ainda não te viu ouve de novo onde você está)
func _marchar(dt: float) -> void:
	if marcha.is_empty():
		return
	_marcha_t -= dt
	if _marcha_t > 0.0:
		return
	_marcha_t = 4.0
	var vivos: Array = main.jogadores_vivos()
	var fica: Array = []
	for z in marcha:
		if not is_instance_valid(z) or z.estado == "morto":
			continue
		fica.append(z)
		var melhor := Vector3.INF
		var bd := INF
		for q in vivos:
			var pq: Vector3 = q["p"]
			var d: float = pq.distance_to(z.global_position)
			if d < bd:
				bd = d
				melhor = pq
		if melhor != Vector3.INF and bd > 10.0:
			z.ouvir(melhor, randf_range(0.1, 0.8))
	marcha = fica


## o Colosso aparece a uns 35 m de quem abriu, num lugar aberto e no mesmo nível; devolve ele (ou null)
func colosso() -> Zumbi:
	if Rede.convidado():
		colosso_veio = true
		return null
	var j = main.jogador
	if not j.vivo:
		return null
	var p: Vector3 = j.global_position
	for k in 40:
		var a := randf() * TAU
		var pz := p + Vector3(cos(a), 0, sin(a)) * randf_range(30.0, 42.0)
		if not _ponto_livre(pz, 24.0):
			continue
		var c: Dictionary = main.chao_em(pz.x, pz.z)
		if absf(float(c["y"]) - p.y) > 6.0:
			continue
		colosso_veio = true
		var z: Zumbi = main._nascer(pz, "colosso")
		z.estado = "caca"
		z.visto_em = p
		var d: Vector3 = p - pz
		z.rotation.y = atan2(-d.x, -d.z)
		marcha.append(z)
		main.ui.aviso("O Colosso chegou com a lua de sangue. É lento, mas o pisão e a investida derrubam: pule na hora do pisão e saia da frente da investida. Fogo machuca mais.", 10.0)
		main.sons.tocar("grito", pz, 12.0)
		return z
	return null


## o que o Colosso deixa quando cai (como no jogo antigo: um kit médico, molotovs, flechas e os suprimentos)
func deixou_suprimentos(p: Vector3) -> void:
	var inv := Inventario.new(20, false)
	inv.por("kit", 1)
	inv.por("molotov", 2)
	inv.por("flecha", 10)
	for e in main.mundo.sortear("suprimentos"):
		inv.por(str(e[0]), int(e[1]), e[2] if e.size() > 2 and e[2] is Dictionary else {})
	main.construcao.por_mochila(p, inv, "O que o Colosso deixou")
	main.ui.aviso("Vocês derrubaram o Colosso? Que coisa... Ele deixou suprimentos no chão. Corram pegar antes do amanhecer.", 7.0)


const RUMOS := ["ao norte", "a nordeste", "a leste", "a sudeste", "ao sul", "a sudoeste", "a oeste", "a noroeste"]


## a caixa de suprimentos da manhã: cai de 30 a 60 m de você, solta fumaça vermelha e tem uns zumbis em volta
func caixa_suprimentos() -> Vector3:
	if Rede.convidado() or not main.jogador.vivo:
		return Vector3.INF
	var p0: Vector3 = main.jogador.global_position
	for t in 40:
		var a := randf() * TAU
		var p := p0 + Vector3(cos(a), 0, sin(a)) * randf_range(30.0, 60.0)
		if not _ponto_livre(p, 20.0):
			continue
		p.y = float(main.chao_em(p.x, p.z)["y"])
		var inv := Inventario.new(20, false)
		for e in main.mundo.sortear("suprimentos"):
			inv.por(str(e[0]), int(e[1]), e[2] if e.size() > 2 and e[2] is Dictionary else {})
		inv.por("municao9", randi_range(6, 12))
		main.construcao.por_mochila(p, inv, "Caixa de suprimentos", true)
		main.efeitos.fumaca(p + Vector3(0, 0.5, 0), Color(0.85, 0.16, 0.12), 240.0)
		for k in 3:
			var b := randf() * TAU
			var pz := p + Vector3(cos(b), 0, sin(b)) * 8.0
			if _ponto_livre(pz, 12.0):
				main._nascer(pz, "walker" if randf() < 0.8 else "runner")
		var ang := fposmod(rad_to_deg(atan2(p.x - p0.x, -(p.z - p0.z))), 360.0)
		var rumo: String = RUMOS[int(roundf(ang / 45.0)) % 8]
		main.ui.aviso("Caixa de suprimentos largada %s de você, a uns %d m. Siga a fumaça vermelha, mas vai ter visita." % [rumo, int(p.distance_to(p0))], 9.0)
		return p
	return Vector3.INF


func salvar() -> Dictionary:
	return {"n": noite_n, "sangue": lua_sangue, "colosso": colosso_veio, "ondas": ondas, "caixa": caixa_h}


func carregar(d: Dictionary) -> void:
	noite_n = int(d.get("n", 0))
	lua_sangue = bool(d.get("sangue", false))
	colosso_veio = bool(d.get("colosso", false))
	caixa_h = float(d.get("caixa", -1.0))
	ondas = []
	for o in d.get("ondas", []):
		ondas.append(float(o))
	marcha.clear()
	_hora_antes = -1.0
