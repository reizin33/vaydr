class_name Armas
## As armas de fogo, o arco, a besta e as de arremesso (etapa 5), com os números do balanço do jogo antigo (62l_balanco.js,
## 40_game.js, 42_armas2.js e 48d_armas3.js):
## · pistola: 26 no tronco, 2x na cabeça, pente de 8, recarga 1,3 s, perde força depois de 20 m;
## · espingarda: 8 bagos de 14, abre bastante (mirando abre menos), recarrega um cartucho por vez;
## · rifle com luneta: 125, 3x na cabeça, atravessa até 2 zumbis (o segundo leva 65%); sem a luneta o tiro espalha;
## · besta: virote de 80 que voa (cai um pouco), silenciosa, arma sozinha depois do tiro;
## · arco: segure para puxar e solte; puxado até o fim vai longe e mata mais; flechas e virotes dá para recolher;
## · coquetel molotov (fogo no chão por 10 s; o zumbi que passa pega fogo e passa para o do lado), bomba caseira (explode
##   2,5 s depois de cair) e isca de barulho (chama os zumbis por 12 s).
## O dano de um acerto = dano-base x região do corpo x distância x variação (±8%); a resistência e a armadura de cada zumbi
## entram depois (Zumbi.ferir). A cabeça vale 2,5x (a pistola 2x, o chumbo 1,6x, o rifle 3x), os braços 0,6 e as pernas 0,7.

const REGIOES := {"cabeca": 2.5, "tronco": 1.0, "bracos": 0.6, "pernas": 0.7}
const REGIOES_CAT := {"pistola": {"cabeca": 2.0}, "espingarda": {"cabeca": 1.6, "bracos": 0.7, "pernas": 0.75}, "precisao": {"cabeca": 3.0}}
const VARIACAO := 0.08
const CORRENDO := 1.6        # o tiro abre mais correndo
const FOGO := {
	"pistola": {"cat": "pistola", "dano": 26.0, "tempo": 0.3, "pente": 8, "recarga": 1.3, "municao": "municao9", "alcance": 20.0,
		"alcance_max": 50.0, "min_k": 0.55, "abre": 0.012, "abre_mira": 0.004, "barulho": 55.0, "som": "tiro", "recuo": 0.035},
	"espingarda": {"cat": "espingarda", "dano": 14.0, "chumbo": 8, "tempo": 0.9, "pente": 5, "por_cartucho": true, "municao": "cartucho",
		"alcance": 5.0, "alcance_max": 25.0, "min_k": 0.15, "abre": 0.075, "abre_mira": 0.06, "barulho": 80.0, "som": "espingarda", "recuo": 0.09},
	"rifle": {"cat": "precisao", "dano": 125.0, "tempo": 1.15, "pente": 5, "recarga": 2.0, "municao": "balaRifle", "alcance": 80.0,
		"alcance_max": 140.0, "min_k": 0.8, "abre": 0.03, "abre_mira": 0.0, "atravessa": 2, "atravessa_k": 0.65, "barulho": 95.0,
		"som": "rifle", "recuo": 0.07, "luneta": true},
	"besta": {"cat": "projetil", "dano": 80.0, "tempo": 0.25, "pente": 1, "recarga": 1.5, "municao": "virote", "barulho": 4.0,
		"som": "besta", "recuo": 0.02, "vel": 62.0},
}
const ARCO := {"dano": 45.0, "puxa": 0.72, "v_min": 15.0, "v_max": 50.0, "g": 7.0, "energia": 2.2, "municao": "flecha"}
const ARREMESSO := {"v": 15.5, "g": 9.8, "alcance": 26.0, "raio_fogo": 3.1, "fogo_dur": 10.0, "pavio": 2.5, "raio_bomba": 5.2,
	"dano_bomba": 170.0, "isca_dur": 12.0, "isca_raio": 34.0}
## a qualidade das armas achadas (65_armas_variedade.js): baixa, comum, boa, excepcional (o dano e a durabilidade)
const QUAL_DANO := [0.88, 1.0, 1.12, 1.25]
const QUAL_DUR := [0.75, 1.0, 1.25, 1.5]
const QUAL_NOME := ["baixa", "", "boa", "excepcional"]


## a durabilidade máxima do item com a qualidade dele
static func dur_max(id: String, q = 1) -> float:
	var d := Dados.item(id)
	var k: float = QUAL_DUR[clampi(int(q), 0, 3)] if bool(d.get("qual", false)) else 1.0
	return float(d.get("durMax", 1.0)) * k


## o multiplicador do dano pela qualidade (1 sem qualidade)
static func qual_dano(s: Dictionary) -> float:
	if not s.has("q"):
		return 1.0
	return float(QUAL_DANO[clampi(int(s["q"]), 0, 3)])


static func de_fogo(id: String) -> bool:
	return FOGO.has(id)


static func dados(id: String) -> Dictionary:
	return FOGO.get(id, {})


static func mult_regiao(cat: String, reg: String) -> float:
	var o: Dictionary = REGIOES_CAT.get(cat, {})
	if o.has(reg):
		return float(o[reg])
	return float(REGIOES.get(reg, 1.0))


## o tiro perde força depois do alcance (até min_k no alcance máximo)
static func queda(B: Dictionary, dist: float) -> float:
	var a := float(B.get("alcance", 0.0))
	if a <= 0.0 or dist <= a:
		return 1.0
	var am := float(B.get("alcance_max", a * 2.0))
	return lerpf(1.0, float(B.get("min_k", 1.0)), clampf((dist - a) / maxf(1.0, am - a), 0.0, 1.0))


static func variacao() -> float:
	return 1.0 - VARIACAO + randf() * 2.0 * VARIACAO


## quanto o tiro abre agora (mirando, correndo), em radianos
static func abre(id: String, mirando: bool, correndo: bool) -> float:
	var B := dados(id)
	if B.is_empty():
		return 0.0
	return float(B["abre_mira"] if mirando else B["abre"]) * (CORRENDO if correndo else 1.0)


## o dano de um acerto (sem a resistência e a armadura do zumbi, que entram no Zumbi.ferir)
static func dano_tiro(id: String, reg: String, dist: float, q := 1) -> float:
	var B := dados(id)
	return float(B.get("dano", 0.0)) * float(QUAL_DANO[clampi(q, 0, 3)]) * mult_regiao(str(B.get("cat", "")), reg) * queda(B, dist) * variacao()


## a direção espalhada num cone de abertura a (como o espalhar do jogo antigo: mais no meio)
static func espalhar(d: Vector3, a: float) -> Vector3:
	if a <= 0.0:
		return d
	var u := Vector3.UP if absf(d.y) < 0.95 else Vector3.RIGHT
	var r := d.cross(u).normalized()
	var s := d.cross(r).normalized()
	var ang := randf() * TAU
	var m := sqrt(randf()) * a
	return (d + r * cos(ang) * m + s * sin(ang) * m).normalized()


## a direção de lançamento para cair em "alvo" com velocidade v e gravidade g (o arco baixo; sem alcance, 45 graus)
static func balistica(o: Vector3, alvo: Vector3, v: float, g: float) -> Vector3:
	var dx := alvo.x - o.x
	var dz := alvo.z - o.z
	var dy := alvo.y - o.y
	var dh := maxf(1e-3, Vector2(dx, dz).length())
	var v2 := v * v
	var disc := v2 * v2 - g * (g * dh * dh + 2.0 * dy * v2)
	var th := PI / 4.0 if disc < 0.0 else atan2(v2 - sqrt(disc), g * dh)
	var c := cos(th)
	return Vector3(dx / dh * c, sin(th), dz / dh * c)


## onde o tiro pegou no zumbi: cabeça acima de 1,5 m (vezes o tamanho dele), pernas abaixo de 0,9 m, braços dos lados (o ponto de
## entrada a mais de 62% do raio, de lado em relação a para onde ele olha); o resto é o tronco
static func regiao(z, p: Vector3) -> String:
	var lp: Vector3 = (z as Node3D).global_transform.affine_inverse() * p
	var esc: float = z.escala
	if lp.y > 1.48 * esc:
		return "cabeca"
	if lp.y < 0.9 * esc:
		return "pernas"
	var r: float = float(z.S["r"]) * minf(esc, 1.15)
	if absf(lp.x) > r * 0.62:
		return "bracos"
	return "tronco"


## o nome com a qualidade (a comum fica só com o nome)
static func nome_q(id: String, q) -> String:
	var n := Dados.nome(id)
	if q == null:
		return n
	var qn: String = QUAL_NOME[clampi(int(q), 0, 3)]
	return n if qn == "" else "%s (%s)" % [n, qn]
