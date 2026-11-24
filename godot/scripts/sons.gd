class_name Sons
extends Node3D
## Sons feitos por código (ruído filtrado e tons): passo, golpe, madeira, pedra, planta, acerto, zumbi, porta, construir...
## Cada som nasce uma vez (AudioStreamWAV) e toca num AudioStreamPlayer3D livre perto de onde aconteceu.

const HZ := 22050
var bancos := {}
var tocadores: Array[AudioStreamPlayer3D] = []
var prox := 0
var rng := RandomNumberGenerator.new()


func _ready() -> void:
	rng.seed = 99
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
	bancos["bicho_fuga"] = [_ruido(0.45, 2400.0, 0.32, 5.0), _ruido(0.5, 1900.0, 0.3, 4.5)]
	# partida em rede: alguém entrou, mensagem no bate-papo (dois tons subindo, curtos)
	bancos["aviso"] = [_mistura(_tom(0.14, 620.0, 640.0, 0.28, 16.0), _tom(0.3, 930.0, 940.0, 0.22, 9.0))]


func tocar(nome: String, onde: Vector3, db := 0.0) -> void:
	if not bancos.has(nome):
		return
	var L: Array = bancos[nome]
	var a := tocadores[prox]
	prox = (prox + 1) % tocadores.size()
	a.stream = L[rng.randi() % L.size()]
	a.global_position = onde
	a.volume_db = db
	a.pitch_scale = rng.randf_range(0.92, 1.08)
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
