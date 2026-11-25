class_name Sons
extends Node3D
## Sons feitos por código (ruído filtrado e tons): passo, golpe, madeira, pedra, planta, acerto, zumbi, porta, construir...
## Cada som nasce uma vez (AudioStreamWAV) e toca num AudioStreamPlayer3D livre perto de onde aconteceu.
## Os mais ouvidos tocam gravações de verdade (as mesmas do jogo antigo, v10.1; licença CC0, domínio público: ver
## assets/sons/CREDITOS.txt): passos na grama, no chão duro e na água, golpe no ar e acertando, machado na madeira,
## picareta na pedra, vidro e madeira quebrando, martelo, zumbi gemendo, atacando e morrendo, o rugido, a dor, os tiros, a
## explosão, a arma vazia, a recarga, o latido, o uivo, a tosse, o trovão, o baú e pegar item. Cada som tem várias gravações,
## nunca toca a mesma duas vezes seguidas e cada vez sai com o tom um pouco diferente; o volume foi medido para ficar no
## nível dos sons por código (o pico de 100 ms), e um limitador no som geral segura os estouros.

const HZ := 22050
## o banco -> [o nome das gravações, quantas, o ganho em dB]
const GRAVADOS := {
	"passo": ["passo_grama", 5, 0.7], "passo_asf": ["passo_asf", 5, 2.1], "passo_agua": ["passo_agua", 3, 0.6],
	"golpe": ["golpe", 6, 4.0], "acerto": ["acerto", 8, 0.9], "madeira": ["madeira", 6, 4.0], "pedra": ["pedra", 5, 3.7],
	"quebrar": ["quebrar", 5, 4.0], "vidro": ["vidro", 6, 4.0], "construir": ["construir", 6, 4.0],
	"gemido": ["gemido", 7, -3.1], "grito_z": ["ataqueZ", 5, -3.7], "morte_z": ["morteZ", 4, -5.1], "bicho_rugido": ["rugido", 5, 4.0],
	"dor": ["dor", 4, -0.5], "tiro": ["tiro", 3, 4.0], "espingarda": ["espingarda", 3, 4.0], "rifle": ["rifle", 2, 4.0],
	"explosao": ["explosao", 4, 4.0], "vazio": ["vazio", 1, -10.8], "recarga": ["recarga", 2, 4.0], "latido": ["latido", 6, -4.3],
	"tosse": ["tosse", 3, 1.2], "trovao": ["trovao", 1, 4.0], "caixa": ["bau", 4, 1.7],
	"pegar": ["pegar", 6, 0.0]}
## sem a gravação, o som parecido feito por código
const RESERVA := {"passo_asf": "passo", "passo_agua": "passo", "quebrar": "construir", "pegar": "caixa"}
var bancos := {}
var ganho := {}               # o ganho em dB de cada banco gravado
var _ult := {}                # a última gravação de cada banco (para não repetir)
var gravados := 0             # quantas gravações carregaram
var tocadores: Array[AudioStreamPlayer3D] = []
var prox := 0
var rng := RandomNumberGenerator.new()


func _ready() -> void:
	rng.seed = 99
	_limitador()
	for i in 16:
		var a := AudioStreamPlayer3D.new()
		a.max_distance = 60.0
		a.unit_size = 6.0
		add_child(a)
		tocadores.append(a)
	bancos["passo"] = [_ruido(0.11, 900.0, 0.55, 30.0), _ruido(0.12, 700.0, 0.55, 28.0), _ruido(0.1, 1100.0, 0.5, 32.0)]
	bancos["golpe"] = [_varrida(0.22, 300.0, 2200.0, 0.35)]
	bancos["madeira"] = [_mistura(_tom(0.18, 150.0, 70.0, 0.9, 18.0), _ruido(0.08, 2500.0, 0.6, 40.0))]
	bancos["pedra"] = [_mistura(_tom(0.09, 900.0, 600.0, 0.4, 40.0), _ruido(0.12, 4000.0, 0.7, 30.0))]
	bancos["planta"] = [_ruido(0.25, 3000.0, 0.35, 10.0)]
	bancos["acerto"] = [_mistura(_tom(0.12, 110.0, 60.0, 0.9, 25.0), _ruido(0.1, 800.0, 0.6, 30.0))]
	bancos["gemido"] = [_gemido(1.3, 95.0), _gemido(1.6, 80.0), _gemido(1.1, 110.0)]
	bancos["grito_z"] = [_gemido(0.9, 170.0)]
	bancos["morte_z"] = [_gemido(1.4, 70.0)]
	bancos["porta"] = [_mistura(_tom(0.3, 220.0, 180.0, 0.3, 6.0), _ruido(0.3, 1200.0, 0.3, 8.0))]
	bancos["construir"] = [_mistura(_tom(0.15, 180.0, 90.0, 0.9, 22.0), _ruido(0.1, 1800.0, 0.5, 35.0))]
	bancos["caixa"] = [_mistura(_tom(0.25, 140.0, 120.0, 0.5, 10.0), _ruido(0.2, 1500.0, 0.4, 12.0))]
	bancos["dor"] = [_mistura(_tom(0.2, 260.0, 160.0, 0.6, 12.0), _ruido(0.12, 900.0, 0.4, 20.0))]
	bancos["comer"] = [_ruido(0.35, 1500.0, 0.3, 6.0)]
	bancos["agua"] = [_ruido(0.5, 900.0, 0.35, 4.0)]
	bancos["clique"] = [_tom(0.05, 1200.0, 1100.0, 0.3, 60.0)]
	# os zumbis (etapa 5): o capacete do policial, o tranco no chão, o inchado estourando, o gritador e a tosse no gás
	bancos["metal"] = [_mistura(_tom(0.22, 1850.0, 1760.0, 0.32, 14.0), _tom(0.3, 2720.0, 2680.0, 0.2, 10.0))]
	bancos["impacto"] = [_mistura(_tom(0.2, 95.0, 48.0, 0.9, 16.0), _ruido(0.14, 650.0, 0.55, 22.0))]
	bancos["estouro"] = [_mistura(_ruido(0.55, 950.0, 0.85, 6.0), _tom(0.45, 75.0, 38.0, 0.75, 7.0))]
	bancos["grito"] = [_mistura(_gemido(1.3, 360.0), _ruido(1.1, 3200.0, 0.22, 2.2)), _mistura(_gemido(1.1, 420.0), _ruido(0.9, 2800.0, 0.2, 2.6))]
	bancos["tosse"] = [_mistura(_ruido(0.22, 1300.0, 0.55, 13.0), _tom(0.18, 180.0, 120.0, 0.35, 16.0))]
	# as armas (etapa 5): tiros, a besta e o arco, recarga, o clique de vazio, a flecha cravando, o vidro do molotov, o fogo,
	# a explosão e o bipe da isca
	bancos["tiro"] = [_mistura(_ruido(0.32, 5200.0, 1.0, 16.0), _tom(0.16, 160.0, 60.0, 0.9, 24.0))]
	bancos["espingarda"] = [_mistura(_ruido(0.55, 3400.0, 1.0, 9.0), _tom(0.3, 110.0, 40.0, 1.0, 12.0))]
	bancos["rifle"] = [_mistura(_ruido(0.7, 6200.0, 1.0, 7.5), _tom(0.24, 140.0, 45.0, 1.0, 14.0))]
	bancos["besta"] = [_mistura(_tom(0.18, 420.0, 180.0, 0.5, 18.0), _ruido(0.1, 2600.0, 0.4, 40.0))]
	bancos["arco"] = [_mistura(_tom(0.22, 300.0, 140.0, 0.45, 14.0), _ruido(0.12, 1800.0, 0.3, 30.0))]
	bancos["puxar"] = [_varrida(0.35, 400.0, 1400.0, 0.12)]
	bancos["recarga"] = [_mistura(_tom(0.06, 2200.0, 1800.0, 0.4, 60.0), _ruido(0.25, 2800.0, 0.35, 14.0))]
	bancos["vazio"] = [_tom(0.04, 1600.0, 1500.0, 0.35, 80.0)]
	bancos["flecha"] = [_mistura(_tom(0.1, 240.0, 120.0, 0.6, 30.0), _ruido(0.08, 1500.0, 0.5, 40.0))]
	bancos["vidro"] = [_mistura(_ruido(0.3, 9000.0, 0.7, 12.0), _tom(0.25, 3100.0, 2900.0, 0.2, 15.0))]
	bancos["fogo"] = [_ruido(0.9, 1200.0, 0.55, 2.5)]
	bancos["explosao"] = [_mistura(_ruido(1.6, 1600.0, 1.0, 3.2), _tom(0.9, 70.0, 28.0, 1.0, 4.5))]
	bancos["isca"] = [_mistura(_tom(0.12, 1760.0, 1760.0, 0.4, 10.0), _tom(0.12, 2640.0, 2640.0, 0.15, 10.0))]
	# os bichos (etapa 6a): cada espécie com a sua voz, o rosnado, o rugido, o grunhido, o guincho e o mato mexendo na fuga
	bancos["bicho_coelho"] = [_mistura(_tom(0.09, 1500.0, 1100.0, 0.25, 30.0), _ruido(0.08, 4200.0, 0.2, 40.0))]
	bancos["bicho_raposa"] = [_mistura(_tom(0.16, 780.0, 1150.0, 0.32, 14.0), _ruido(0.1, 2600.0, 0.18, 30.0))]
	bancos["bicho_ovelha"] = [_bale(0.75, 330.0, 9.0), _bale(0.6, 350.0, 10.0)]
	bancos["bicho_cabra"] = [_bale(0.55, 430.0, 13.0), _bale(0.5, 460.0, 12.0)]
	bancos["bicho_cervo"] = [_mistura(_tom(0.32, 520.0, 380.0, 0.32, 7.0), _ruido(0.18, 1600.0, 0.15, 14.0))]
	bancos["bicho_vaca"] = [_bale(1.5, 118.0, 3.0), _bale(1.2, 132.0, 3.5)]
	bancos["bicho_javali"] = [_mistura(_ruido(0.3, 650.0, 0.55, 9.0), _tom(0.26, 105.0, 80.0, 0.5, 9.0))]
	bancos["bicho_lobo"] = [_uivo(2.4, 420.0, 720.0), _uivo(2.0, 460.0, 680.0)]
	bancos["bicho_urso"] = [_mistura(_ruido(0.9, 420.0, 0.8, 3.0), _tom(0.8, 95.0, 70.0, 0.7, 3.5))]
	bancos["bicho_onca"] = [_mistura(_ruido(0.7, 700.0, 0.6, 4.0), _tom(0.6, 150.0, 110.0, 0.55, 4.5))]
	bancos["bicho_rosnado"] = [_mistura(_ruido(0.8, 380.0, 0.7, 3.5), _tom(0.7, 90.0, 85.0, 0.45, 4.0))]
	bancos["bicho_rugido"] = [_mistura(_ruido(1.2, 520.0, 1.0, 2.6), _tom(1.0, 120.0, 70.0, 0.9, 3.0))]
	bancos["bicho_grunhido"] = [_mistura(_ruido(0.45, 800.0, 0.7, 6.0), _tom(0.35, 120.0, 90.0, 0.6, 7.0))]
	bancos["bicho_guincho"] = [_tom(0.18, 2100.0, 1500.0, 0.35, 16.0)]
	bancos["trovao"] = [_mistura(_ruido(3.2, 260.0, 1.0, 1.0), _tom(2.6, 52.0, 32.0, 0.75, 1.2)), _mistura(_ruido(2.6, 340.0, 1.0, 1.3), _tom(2.0, 60.0, 36.0, 0.7, 1.5))]
	# a pesca (etapa 6d): a linha voando, o peixe mordendo, o carretel puxando e o peixe pulando na água
	bancos["lancar"] = [_varrida(0.32, 1800.0, 600.0, 0.18)]
	bancos["morde_peixe"] = [_mistura(_tom(0.12, 420.0, 260.0, 0.35, 22.0), _ruido(0.16, 1600.0, 0.3, 18.0))]
	bancos["puxar"] = [_mistura(_ruido(0.45, 2600.0, 0.3, 6.0), _tom(0.4, 900.0, 1300.0, 0.12, 6.0))]
	bancos["nado"] = [_ruido(0.35, 1300.0, 0.35, 9.0)]
	bancos["bicho_fuga"] = [_ruido(0.45, 2400.0, 0.32, 5.0), _ruido(0.5, 1900.0, 0.3, 4.5)]
	# o Caramelo (etapa 6e): o latido (dois "au" curtos), o ganido fino e a mordida
	bancos["latido"] = [_latido(2, 620.0), _latido(2, 560.0), _latido(3, 660.0)]
	bancos["ganido"] = [_ganido(0.55, 1150.0), _ganido(0.45, 1050.0)]
	bancos["bolhas"] = [_bolhas(), _bolhas()]
	bancos["mordida"] = [_mistura(_ruido(0.12, 1800.0, 0.6, 30.0), _tom(0.1, 240.0, 140.0, 0.4, 30.0))]
	# partida em rede: alguém entrou, mensagem no bate-papo (dois tons subindo, curtos)
	bancos["aviso"] = [_mistura(_tom(0.14, 620.0, 640.0, 0.28, 16.0), _tom(0.3, 930.0, 940.0, 0.22, 9.0))]
	# os veículos (etapa 6j): a buzina (dois tons juntos, rachados), a partida do motor (o arranque e o ronco subindo)
	bancos["buzina"] = [_buzina()]
	bancos["partida"] = [_mistura(_ruido(0.7, 520.0, 0.5, 3.6), _tom(0.65, 34.0, 58.0, 0.75, 2.2))]
	_gravacoes()


var _motor: AudioStreamWAV = null


## o ronco do motor, 1 s em loop (o veículo toca e muda o tom com a velocidade): a nota de 46 Hz com os harmônicos, pulsando
## como os cilindros, e o chiado do escapamento (sem estalo na emenda do loop)
func motor_loop() -> AudioStreamWAV:
	if _motor != null:
		return _motor
	var n := HZ
	var m := 2000
	var r := RandomNumberGenerator.new()
	r.seed = 46
	var ru := PackedFloat32Array()
	ru.resize(n + m)
	var y := 0.0
	for i in n + m:
		y += (r.randf_range(-1.0, 1.0) - y) * 0.12
		ru[i] = y
	var a := PackedFloat32Array()
	a.resize(n)
	for i in n:
		var t := float(i) / HZ
		var fase := TAU * 46.0 * t
		var base := sin(fase) * 0.45 + sin(fase * 2.0) * 0.25 + sin(fase * 3.0) * 0.14 + sin(fase * 4.0 + 0.5) * 0.08
		var puls := 0.65 + 0.35 * sin(fase * 0.5)
		var nz: float = ru[i]
		if i < m:
			var k := float(i) / m
			nz = ru[i] * k + ru[n + i] * (1.0 - k)
		a[i] = (base * puls + nz * 0.35) * 0.55
	_motor = _wav(a)
	_motor.loop_mode = AudioStreamWAV.LOOP_FORWARD
	_motor.loop_begin = 0
	_motor.loop_end = n
	return _motor


func _buzina() -> AudioStreamWAV:
	var dur := 0.55
	var n := int(dur * HZ)
	var a := PackedFloat32Array()
	a.resize(n)
	for i in n:
		var t := float(i) / HZ
		var env := minf(1.0, t * 60.0) * minf(1.0, (dur - t) * 30.0)
		var q := clampf((sin(TAU * 415.0 * t) + sin(TAU * 520.0 * t)) * 1.6, -1.0, 1.0)
		a[i] = q * 0.42 * env
	return _wav(a)


## as gravações de verdade: onde carregam, ficam no lugar do som por código (se faltar alguma, fica o som por código)
func _gravacoes() -> void:
	for b in GRAVADOS:
		var g: Array = GRAVADOS[b]
		var L: Array = []
		for i in int(g[1]):
			var cam := "res://assets/sons/%s_%d.mp3" % [str(g[0]), i]
			if ResourceLoader.exists(cam):
				var s = load(cam)
				if s is AudioStream:
					L.append(s)
		if not L.is_empty():
			bancos[b] = L
			ganho[b] = float(g[2])
			gravados += L.size()


## o limitador no som geral: os tiros e a explosão de perto não estouram (como o compressor do jogo antigo)
func _limitador() -> void:
	for i in AudioServer.get_bus_effect_count(0):
		if AudioServer.get_bus_effect(0, i) is AudioEffectHardLimiter:
			return
	var lim := AudioEffectHardLimiter.new()
	lim.ceiling_db = -0.5
	lim.pre_gain_db = 0.0
	AudioServer.add_bus_effect(0, lim)


## toca o som nome em onde (db: mais alto ou mais baixo; tom: mais grave ou mais agudo, como a voz de cada zumbi)
func tocar(nome: String, onde: Vector3, db := 0.0, tom := 1.0) -> void:
	if not bancos.has(nome):
		nome = str(RESERVA.get(nome, ""))
		if not bancos.has(nome):
			return
	var L: Array = bancos[nome]
	var a := tocadores[prox]
	prox = (prox + 1) % tocadores.size()
	var i := rng.randi() % L.size()
	if L.size() > 1 and i == int(_ult.get(nome, -1)):
		i = (i + 1) % L.size()
	_ult[nome] = i
	a.stream = L[i]
	a.global_position = onde
	a.volume_db = db + float(ganho.get(nome, 0.0))
	a.pitch_scale = tom * rng.randf_range(0.95, 1.05) if ganho.has(nome) else tom * rng.randf_range(0.92, 1.08)
	a.play()


func _wav(amostras: PackedFloat32Array) -> AudioStreamWAV:
	var b := PackedByteArray()
	b.resize(amostras.size() * 2)
	for i in amostras.size():
		b.encode_s16(i * 2, int(clampf(amostras[i], -1.0, 1.0) * 32000.0))
	var w := AudioStreamWAV.new()
	w.format = AudioStreamWAV.FORMAT_16_BITS
	w.mix_rate = HZ
	w.stereo = false
	w.data = b
	return w


## ruído com filtro passa-baixa simples e decaimento exponencial
func _ruido(dur: float, corte: float, vol: float, queda: float) -> AudioStreamWAV:
	return _wav(_ruido_a(dur, corte, vol, queda))


func _ruido_a(dur: float, corte: float, vol: float, queda: float) -> PackedFloat32Array:
	var n := int(dur * HZ)
	var a := PackedFloat32Array()
	a.resize(n)
	var k := clampf(corte / HZ * 6.28, 0.0, 1.0)
	var y := 0.0
	for i in n:
		y += (rng.randf_range(-1.0, 1.0) - y) * k
		var t := float(i) / HZ
		a[i] = y * vol * 3.0 * exp(-t * queda) * minf(1.0, t * 400.0)
	return a


func _tom_a(dur: float, f0: float, f1: float, vol: float, queda: float) -> PackedFloat32Array:
	var n := int(dur * HZ)
	var a := PackedFloat32Array()
	a.resize(n)
	var fase := 0.0
	for i in n:
		var t := float(i) / HZ
		var f := lerpf(f0, f1, t / dur)
		fase += TAU * f / HZ
		a[i] = sin(fase) * vol * exp(-t * queda) * minf(1.0, t * 300.0)
	return a


func _tom(dur: float, f0: float, f1: float, vol: float, queda: float) -> AudioStreamWAV:
	return _wav(_tom_a(dur, f0, f1, vol, queda))


func _mistura(a: AudioStreamWAV, b: AudioStreamWAV) -> AudioStreamWAV:
	var da := a.data
	var db := b.data
	var n: int = maxi(da.size(), db.size()) / 2
	var s := PackedFloat32Array()
	s.resize(n)
	for i in n:
		var x := 0.0
		if i * 2 < da.size():
			x += da.decode_s16(i * 2) / 32000.0
		if i * 2 < db.size():
			x += db.decode_s16(i * 2) / 32000.0
		s[i] = x * 0.8
	return _wav(s)


func _varrida(dur: float, f0: float, f1: float, vol: float) -> AudioStreamWAV:
	var n := int(dur * HZ)
	var a := PackedFloat32Array()
	a.resize(n)
	var y := 0.0
	for i in n:
		var t := float(i) / HZ
		var k := clampf(lerpf(f0, f1, sin(t / dur * PI)) / HZ * 6.28, 0.0, 1.0)
		y += (rng.randf_range(-1.0, 1.0) - y) * k
		a[i] = y * vol * 3.0 * sin(t / dur * PI)
	return _wav(a)


## gemido de zumbi: tom grave com vibrato e um pouco de ruído rouco
## o balido (ovelha, cabra) e o mugido (vaca): o tom tremido com o "a" aberto no meio
func _bale(dur: float, f: float, tremido: float) -> AudioStreamWAV:
	var n := int(dur * HZ)
	var a := PackedFloat32Array()
	a.resize(n)
	var fase := 0.0
	for i in n:
		var t := float(i) / HZ
		var env := sin(t / dur * PI) * (0.7 + 0.3 * sin(t / dur * PI * 2.0))
		var ff := f * (1.0 + 0.05 * sin(t * TAU * tremido) + 0.08 * sin(t / dur * PI))
		fase += TAU * ff / HZ
		var v := sin(fase) * 0.45 + sin(fase * 2.0) * 0.3 + sin(fase * 3.0) * 0.18 + sin(fase * 4.0) * 0.08
		a[i] = v * env * 0.45
	return _wav(a)


## o latido: n "au" curtos (o tom cai rápido, com o rouco do ruído), um atrás do outro
func _latido(n: int, f: float) -> AudioStreamWAV:
	var dur := n * 0.21 + 0.1
	var tot := int(dur * HZ)
	var a := PackedFloat32Array()
	a.resize(tot)
	var y := 0.0
	for k in n:
		var ini := int((k * 0.21 + rng.randf() * 0.03) * HZ)
		var fase := 0.0
		var fk := f * rng.randf_range(0.94, 1.06)
		for i in int(0.13 * HZ):
			var idx: int = ini + i
			if idx >= tot:
				break
			var t := float(i) / HZ
			var env := minf(1.0, t * 220.0) * exp(-t * 26.0)
			var ff := lerpf(fk, fk * 0.48, minf(1.0, t / 0.13))
			fase += TAU * ff / HZ
			y += (rng.randf_range(-1.0, 1.0) - y) * 0.35
			var v := sin(fase) * 0.55 + sin(fase * 2.0) * 0.25 + sin(fase * 3.0) * 0.12 + y * 0.45
			a[idx] += v * env * 0.6
	return _wav(a)


## as bolhas (afogando): uns "blup" curtos subindo de tom
func _bolhas() -> AudioStreamWAV:
	var dur := 0.7
	var tot := int(dur * HZ)
	var a := PackedFloat32Array()
	a.resize(tot)
	for k in 6:
		var ini := int(rng.randf() * (dur - 0.08) * HZ)
		var f0 := rng.randf_range(300.0, 700.0)
		var fase := 0.0
		for i in int(0.07 * HZ):
			var idx: int = ini + i
			if idx >= tot:
				break
			var t := float(i) / HZ
			fase += TAU * f0 * (1.0 + t * 14.0) / HZ
			a[idx] += sin(fase) * exp(-t * 45.0) * minf(1.0, t * 600.0) * 0.4
	return _wav(a)


## o ganido: um choro fino que sobe e desce
func _ganido(dur: float, f: float) -> AudioStreamWAV:
	var n := int(dur * HZ)
	var a := PackedFloat32Array()
	a.resize(n)
	var fase := 0.0
	for i in n:
		var t := float(i) / HZ
		var u := t / dur
		var env := sin(u * PI) * 0.8
		var ff := f * (1.0 + 0.3 * sin(u * PI) - 0.25 * u) * (1.0 + 0.02 * sin(t * 40.0))
		fase += TAU * ff / HZ
		a[i] = (sin(fase) * 0.7 + sin(fase * 2.0) * 0.12) * env * 0.3
	return _wav(a)


## o uivo do lobo: sobe devagar, fica e desce
func _uivo(dur: float, f0: float, f1: float) -> AudioStreamWAV:
	var n := int(dur * HZ)
	var a := PackedFloat32Array()
	a.resize(n)
	var fase := 0.0
	for i in n:
		var t := float(i) / HZ
		var u := t / dur
		var env := smoothstep(0.0, 0.15, u) * (1.0 - smoothstep(0.75, 1.0, u))
		var ff := lerpf(f0, f1, sin(minf(1.0, u * 1.6) * PI * 0.5)) * (1.0 - 0.25 * smoothstep(0.7, 1.0, u)) * (1.0 + 0.01 * sin(t * 30.0))
		fase += TAU * ff / HZ
		a[i] = (sin(fase) * 0.6 + sin(fase * 2.0) * 0.12) * env * 0.4
	return _wav(a)


func _gemido(dur: float, f: float) -> AudioStreamWAV:
	var n := int(dur * HZ)
	var a := PackedFloat32Array()
	a.resize(n)
	var fase := 0.0
	var y := 0.0
	for i in n:
		var t := float(i) / HZ
		var env := sin(t / dur * PI)
		var ff := f * (1.0 + 0.12 * sin(t * 7.0) + 0.25 * t / dur)
		fase += TAU * ff / HZ
		y += (rng.randf_range(-1.0, 1.0) - y) * 0.08
		var v := sin(fase) * 0.5 + sin(fase * 2.03) * 0.25 + sin(fase * 3.1) * 0.12
		a[i] = (v * 0.6 + y * 1.4) * env * 0.5
	return _wav(a)
