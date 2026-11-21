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
