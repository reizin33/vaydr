class_name ModelosCarros
## Os veículos desenhados por código, como no jogo antigo (47_carro.js: carroGeometry e veicGeometrias): a caminhonete, o
## carro, a moto e o triciclo, peça por peça (caixas chanfradas, cilindros), com a ferrugem e as cores de lá. Cada um tem a
## carroceria, a cabine (some na primeira pessoa, para você ver a estrada por cima do capô) e as luzes: os faróis e as
## lanternas são superfícies à parte, que acendem de noite. As rodas são outra malha (giram, viram e murcham furadas).

static var _cache := {}
const VINCO := 0.55        # as normais se juntam entre faces com menos de ~57 graus (quina de verdade continua quina)
const SUPS := ["corpo", "vidro", "farol", "lanterna"]


## {"base": ArrayMesh, "cabine": ArrayMesh ou null, "roda": ArrayMesh, "sup_base": [nomes das superfícies], "sup_cabine": [...]}
static func malhas(tipo: String) -> Dictionary:
	if _cache.has(tipo):
		return _cache[tipo]
	var P := {"base": [], "cabine": []}
	var R := RandomNumberGenerator.new()
	R.seed = 808 + tipo.length()
	match tipo:
		"caminhonete":
			_caminhonete(P, R)
		"sedan":
			_sedan(P, R)
		"moto":
			_moto(P)
		"triciclo":
			_triciclo(P)
	var b := _montar(P["base"])
	var c := _montar(P["cabine"]) if not (P["cabine"] as Array).is_empty() else {}
	var r := {"base": b.get("malha"), "sup_base": b.get("sups", []), "cabine": c.get("malha"), "sup_cabine": c.get("sups", []), "roda": _roda()}
	_cache[tipo] = r
	return r


# ---------------------------------------------------------------- formas (como no jogo antigo: 00_core.js e 20_chars.js)
## caixa com as quinas chanfradas (bevelTris): tx/tz estreitam o topo, bx/bz a base
static func _chanfro(w: float, h: float, d: float, b: float, tx := 1.0, tz := 1.0, bx := 1.0, bz := 1.0) -> PackedVector3Array:
	var hx := w / 2.0
	var hy := h / 2.0
	var hz := d / 2.0
	b = minf(b, minf(hx * 0.45, minf(hy * 0.45, hz * 0.45)))
	var K := [hx, hy, hz, b, tx, tz, bx, bz]
	var T: Array = []
	for s in [1.0, -1.0]:
		_quad(T, _cv(K, 0, s, -1.0, -1.0), _cv(K, 0, s, 1.0, -1.0), _cv(K, 0, s, 1.0, 1.0), _cv(K, 0, s, -1.0, 1.0))
		_quad(T, _cv(K, 1, -1.0, s, -1.0), _cv(K, 1, 1.0, s, -1.0), _cv(K, 1, 1.0, s, 1.0), _cv(K, 1, -1.0, s, 1.0))
		_quad(T, _cv(K, 2, -1.0, -1.0, s), _cv(K, 2, 1.0, -1.0, s), _cv(K, 2, 1.0, 1.0, s), _cv(K, 2, -1.0, 1.0, s))
	for sx in [1.0, -1.0]:
		for sy in [1.0, -1.0]:
			_quad(T, _cv(K, 0, sx, sy, -1.0), _cv(K, 1, sx, sy, -1.0), _cv(K, 1, sx, sy, 1.0), _cv(K, 0, sx, sy, 1.0))
	for sx in [1.0, -1.0]:
		for sz in [1.0, -1.0]:
			_quad(T, _cv(K, 0, sx, -1.0, sz), _cv(K, 2, sx, -1.0, sz), _cv(K, 2, sx, 1.0, sz), _cv(K, 0, sx, 1.0, sz))
	for sy in [1.0, -1.0]:
		for sz in [1.0, -1.0]:
			_quad(T, _cv(K, 1, -1.0, sy, sz), _cv(K, 2, -1.0, sy, sz), _cv(K, 2, 1.0, sy, sz), _cv(K, 1, 1.0, sy, sz))
	for sx in [1.0, -1.0]:
		for sy in [1.0, -1.0]:
			for sz in [1.0, -1.0]:
				T.append(_cv(K, 0, sx, sy, sz))
				T.append(_cv(K, 1, sx, sy, sz))
				T.append(_cv(K, 2, sx, sy, sz))
	return PackedVector3Array(T)


## um canto da caixa chanfrada: "a" diz qual eixo vai até a face (os outros dois param antes do chanfro)
static func _cv(K: Array, a: int, sx: float, sy: float, sz: float) -> Vector3:
	var hx: float = K[0]
	var hy: float = K[1]
	var hz: float = K[2]
	var b: float = K[3]
	var kx: float = K[4] if sy > 0.0 else K[6]
	var kz: float = K[5] if sy > 0.0 else K[7]
	return Vector3(sx * (hx if a == 0 else hx - b) * kx, sy * (hy if a == 1 else hy - b), sz * (hz if a == 2 else hz - b) * kz)


static func _quad(T: Array, p: Vector3, q: Vector3, r: Vector3, s: Vector3) -> void:
	T.append_array([p, q, r, p, r, s])


static func _caixa(w: float, h: float, d: float, tz := 1.0) -> PackedVector3Array:
	return ModelosBichos._caixa(w, h, d, 1.0, tz)


## cilindro deitado no eixo X, centrado (as duas tampas)
static func _cil_x(r: float, larg: float, seg: int) -> PackedVector3Array:
	var t := PackedVector3Array()
	var hx := larg / 2.0
	for i in seg:
		var a0 := i / float(seg) * TAU
		var a1 := (i + 1) / float(seg) * TAU
		var p0 := Vector3(0, cos(a0) * r, sin(a0) * r)
		var p1 := Vector3(0, cos(a1) * r, sin(a1) * r)
		var e0 := p0 + Vector3(-hx, 0, 0)
		var e1 := p1 + Vector3(-hx, 0, 0)
		var d0 := p0 + Vector3(hx, 0, 0)
		var d1 := p1 + Vector3(hx, 0, 0)
		t.append_array(PackedVector3Array([e0, d0, d1, e0, d1, e1]))
		t.append_array(PackedVector3Array([Vector3(hx, 0, 0), d1, d0, Vector3(-hx, 0, 0), e0, e1]))
	return t


## cilindro de pé (y de 0 a h) com as duas tampas
static func _cil(rt: float, rb: float, h: float, seg: int) -> PackedVector3Array:
	var t := ModelosBichos._cil(rt, rb, h, seg)
	for i in seg:
		var a0 := i / float(seg) * TAU
		var a1 := (i + 1) / float(seg) * TAU
		t.append_array(PackedVector3Array([Vector3.ZERO, Vector3(rb * cos(a1), 0, rb * sin(a1)), Vector3(rb * cos(a0), 0, rb * sin(a0))]))
	return t


static func _m(px := 0.0, py := 0.0, pz := 0.0, rx := 0.0, ry := 0.0, rz := 0.0) -> Transform3D:
	return ModelosBichos._m(px, py, pz, rx, ry, rz)


static func _A(L: Array, tris: PackedVector3Array, m: Transform3D, cor: int, sup := "corpo", j := 0.04) -> void:
	L.append([tris, m, ModelosBichos._cor(cor), j, sup])


# ---------------------------------------------------------------- a caminhonete (carroGeometry)
static func _caminhonete(P: Dictionary, R: RandomNumberGenerator) -> void:
	var B: Array = P["base"]
	var C: Array = P["cabine"]
	var paint := 0x4f6b4a
	var paint2 := 0x445d40
	var dark := 0x1d2124
	var glass := 0x18232b
	var trim := 0x5a5f63
	var rust := 0x6e4a2c
	_A(B, _chanfro(1.95, 0.52, 4.8, 0.08), _m(0, 0.72, 0), paint)
	_A(B, _chanfro(1.9, 0.3, 1.55, 0.08, 1.0, 0.92), _m(0, 1.1, 1.55), paint)
	_A(C, _chanfro(1.86, 0.82, 1.75, 0.1, 0.94, 0.82), _m(0, 1.38, 0.12), paint2)
	_A(C, _caixa(1.62, 0.5, 0.06), _m(0, 1.44, 0.93, -0.55), glass, "vidro", 0.0)
	_A(C, _caixa(1.5, 0.44, 0.06), _m(0, 1.48, -0.72), glass, "vidro", 0.0)
	for s in [1.0, -1.0]:
		_A(C, _caixa(0.06, 0.42, 1.2), _m(s * 0.93, 1.48, 0.05), glass, "vidro", 0.0)
	for s in [1.0, -1.0]:
		_A(B, _chanfro(0.12, 0.46, 2.05, 0.03), _m(s * 0.92, 1.16, -1.4), paint)
	_A(B, _chanfro(1.95, 0.46, 0.12, 0.03), _m(0, 1.16, -2.4), paint)
	_A(B, _caixa(1.75, 0.05, 2.0), _m(0, 0.98, -1.4), dark, "corpo", 0.0)
	_A(B, _cil(0.36, 0.36, 0.24, 12), _m(0.15, 1.0, -1.5, 0, 0, 0.25), 0x161616)
	_A(B, _chanfro(2.05, 0.22, 0.2, 0.05), _m(0, 0.62, 2.45), trim)
	_A(B, _chanfro(2.05, 0.22, 0.2, 0.05), _m(0, 0.62, -2.45), trim)
	_A(B, _caixa(1.0, 0.26, 0.05), _m(0, 0.98, 2.42), dark, "corpo", 0.0)
	for s in [1.0, -1.0]:
		_A(B, _caixa(0.34, 0.16, 0.06), _m(s * 0.68, 0.98, 2.43), 0xfff1c8, "farol", 0.0)
		_A(B, _caixa(0.22, 0.14, 0.05), _m(s * 0.8, 1.08, -2.47), 0x9a1a14, "lanterna", 0.0)
		for z in [1.55, -1.55]:
			_A(B, _chanfro(0.12, 0.5, 1.0, 0.04), _m(s * 0.99, 0.76, z), 0x2a2d2f)
		_A(C, _caixa(0.05, 0.12, 0.18), _m(s * 1.0, 1.45, 0.75), dark, "corpo", 0.0)
	for i in 5:
		_A(B, _caixa(0.25 + R.randf() * 0.3, 0.02, 0.2 + R.randf() * 0.3), _m((R.randf() - 0.5) * 1.4, 1.255, 1.2 + R.randf() * 0.6), rust, "corpo", 0.08)
	for i in 4:
		var s := 1.0 if R.randf() < 0.5 else -1.0
		_A(B, _caixa(0.02, 0.15 + R.randf() * 0.2, 0.2 + R.randf() * 0.4), _m(s * 0.985, 0.65 + R.randf() * 0.3, (R.randf() - 0.5) * 3.5), rust, "corpo", 0.08)


# ---------------------------------------------------------------- o carro (v_sedan)
static func _sedan(P: Dictionary, R: RandomNumberGenerator) -> void:
	var B: Array = P["base"]
	var C: Array = P["cabine"]
	var p := 0x7a2e2a
	var p2 := 0x652522
	var dark := 0x1c1f22
	var glass := 0x1a252d
	var trim := 0x5c6166
	var rust := 0x6e4a2c
	_A(B, _chanfro(1.78, 0.5, 4.25, 0.12, 0.97, 0.97), _m(0, 0.62, 0), p)
	_A(C, _chanfro(1.6, 0.55, 2.1, 0.12, 0.82, 0.7), _m(0, 1.13, -0.3), p2)
	_A(C, _caixa(1.5, 0.44, 0.05), _m(0, 1.13, 0.72, -0.75), glass, "vidro", 0.0)
	_A(C, _caixa(1.4, 0.4, 0.05), _m(0, 1.12, -1.32, 0.7), glass, "vidro", 0.0)
	for s in [1.0, -1.0]:
		_A(C, _caixa(0.05, 0.36, 1.5), _m(s * 0.79, 1.15, -0.3), glass, "vidro", 0.0)
	_A(B, _chanfro(1.84, 0.18, 0.16, 0.04), _m(0, 0.45, 2.12), trim)
	_A(B, _chanfro(1.84, 0.18, 0.16, 0.04), _m(0, 0.45, -2.12), trim)
	for s in [1.0, -1.0]:
		_A(B, _caixa(0.32, 0.12, 0.05), _m(s * 0.6, 0.72, 2.13), 0xfff1c8, "farol", 0.0)
		_A(B, _caixa(0.3, 0.1, 0.05), _m(s * 0.62, 0.78, -2.13), 0x9a1a14, "lanterna", 0.0)
		for z in [1.3, -1.35]:
			_A(B, _chanfro(0.1, 0.42, 0.9, 0.04), _m(s * 0.9, 0.55, z), dark)
	for i in 6:
		_A(B, _caixa(0.2 + R.randf() * 0.3, 0.02, 0.2 + R.randf() * 0.3), _m((R.randf() - 0.5) * 1.3, 0.875, (R.randf() - 0.5) * 3.4), rust, "corpo", 0.08)


# ---------------------------------------------------------------- a moto (v_moto)
static func _moto(P: Dictionary) -> void:
	var B: Array = P["base"]
	var p := 0x2b3a52
	var cr := 0x8a9096
	var dark := 0x1c1f22
	var trim := 0x5c6166
	_A(B, _chanfro(0.3, 0.32, 0.75, 0.08), _m(0, 0.9, 0.15), p)
	_A(B, _chanfro(0.26, 0.12, 0.7, 0.05), _m(0, 1.08, -0.35), dark)
	_A(B, _caixa(0.22, 0.28, 0.4), _m(0, 0.6, 0), trim)
	_A(B, _cil(0.03, 0.03, 0.8, 6), _m(0, 0.35, 0.72, -0.45), cr)
	# o guidão (no jogo antigo ele saía só para um lado: aqui fica no meio)
	_A(B, _cil(0.025, 0.025, 0.6, 6), _m(0.3, 1.15, 0.6, 0, 0, PI / 2.0), cr)
	_A(B, _cil(0.07, 0.06, 0.12, 8), _m(0, 1.0, 0.85, PI / 2.0), 0xfff1c8, "farol", 0.0)
	_A(B, _cil(0.03, 0.03, 0.85, 6), _m(0, 0.35, -0.72, 0.6), cr)
	_A(B, _cil(0.05, 0.05, 0.5, 6), _m(0.14, 0.45, -0.55, PI / 2.4), cr)
	_A(B, _caixa(0.12, 0.06, 0.04), _m(0, 0.75, -1.0), 0x9a1a14, "lanterna", 0.0)


# ---------------------------------------------------------------- o triciclo (v_tri)
static func _triciclo(P: Dictionary) -> void:
	var B: Array = P["base"]
	var p := 0x8a6a2a
	var p2 := 0x6f5420
	var dark := 0x1c1f22
	var trim := 0x5c6166
	_A(B, _chanfro(0.5, 0.35, 1.2, 0.08), _m(0, 0.75, 0.25), p)
	_A(B, _chanfro(1.25, 0.3, 0.8, 0.08), _m(0, 0.72, -0.55), p2)
	_A(B, _chanfro(0.45, 0.14, 0.7, 0.05), _m(0, 1.02, -0.2), dark)
	_A(B, _cil(0.03, 0.03, 0.85, 6), _m(0, 0.36, 0.98, -0.5), trim)
	_A(B, _cil(0.025, 0.025, 0.7, 6), _m(0.35, 1.12, 0.6, 0, 0, PI / 2.0), trim)
	_A(B, _cil(0.08, 0.07, 0.12, 8), _m(0, 0.95, 1.08, PI / 2.0), 0xfff1c8, "farol", 0.0)
	_A(B, _caixa(1.1, 0.35, 0.5), _m(0, 1.05, -0.75), 0x3f3f3a)
	for s in [1.0, -1.0]:
		_A(B, _caixa(0.1, 0.06, 0.04), _m(s * 0.5, 0.8, -1.0), 0x9a1a14, "lanterna", 0.0)


# ---------------------------------------------------------------- a roda (pneu, aro e os raios)
static func _roda() -> ArrayMesh:
	var L: Array = []
	_A(L, _cil_x(0.42, 0.3, 16), Transform3D.IDENTITY, 0x161616, "corpo", 0.03)
	_A(L, _cil_x(0.2, 0.32, 10), Transform3D.IDENTITY, 0x6d7276, "corpo", 0.02)
	for i in 5:
		var a := i / 5.0 * TAU
		_A(L, _caixa(0.04, 0.17, 0.05), _m(0.155, cos(a) * 0.29, sin(a) * 0.29, a), 0x3a3d40, "corpo", 0.0)
	return _montar(L).get("malha")


# ---------------------------------------------------------------- juntar as peças (normais com vinco, cor variando)
## uma superfície por tipo (corpo, vidro, farol, lanterna); devolve {"malha", "sups": nomes na ordem das superfícies}
static func _montar(L: Array) -> Dictionary:
	var por := {}
	for pc in L:
		var s := str(pc[4])
		if not por.has(s):
			por[s] = []
		(por[s] as Array).append(pc)
	var malha := ArrayMesh.new()
	var sups: Array = []
	for s in SUPS:
		if not por.has(s):
			continue
		var st := SurfaceTool.new()
		st.begin(Mesh.PRIMITIVE_TRIANGLES)
		for pc in por[s]:
			_peca(st, pc[0], pc[1], pc[2], pc[3])
		st.commit(malha)
		sups.append(s)
	return {"malha": malha, "sups": sups}


static func _peca(st: SurfaceTool, tris: PackedVector3Array, m: Transform3D, cor: Color, j: float) -> void:
	var n := tris.size()
	var P := PackedVector3Array()
	P.resize(n)
	var centro := Vector3.ZERO
	for i in n:
		P[i] = m * tris[i]
		centro += P[i]
	centro /= maxf(1.0, float(n))
	var nt := n / 3
	var FN := PackedVector3Array()
	FN.resize(nt)
	var vira := PackedByteArray()
	vira.resize(nt)
	var junto := {}
	for k in nt:
		var a: Vector3 = P[k * 3]
		var b: Vector3 = P[k * 3 + 1]
		var c: Vector3 = P[k * 3 + 2]
		var nn := (b - a).cross(c - a)
		var l := nn.length()
		nn = nn / l if l > 1e-12 else Vector3.UP
		# a face aponta para fora da peça (as peças são convexas)
		if nn.dot((a + b + c) / 3.0 - centro) < 0.0:
			nn = -nn
			vira[k] = 1
		FN[k] = nn
		for v in 3:
			var pv: Vector3 = P[k * 3 + v]
			var key := (pv * 2000.0).round()
			if not junto.has(key):
				junto[key] = PackedInt32Array()
			var lst: PackedInt32Array = junto[key]
			lst.append(k)
			junto[key] = lst
	for k in nt:
		var ordem: Array = [0, 2, 1] if vira[k] == 0 else [0, 1, 2]
		for v in ordem:
			var p: Vector3 = P[k * 3 + int(v)]
			var key := (p * 2000.0).round()
			var soma := Vector3.ZERO
			for g in (junto[key] as PackedInt32Array):
				if FN[g].dot(FN[k]) >= VINCO:
					soma += FN[g]
			var fk: Vector3 = FN[k]
			var nv: Vector3 = soma.normalized() if soma.length() > 1e-6 else fk
			var hh := ModelosBichos._hash(key)
			var k2 := 1.0 + (hh - 0.5) * 2.0 * j
			st.set_normal(nv)
			st.set_color(Color(clampf(cor.r * k2, 0.0, 1.0), clampf(cor.g * k2, 0.0, 1.0), clampf(cor.b * k2, 0.0, 1.0)))
			st.add_vertex(p)
