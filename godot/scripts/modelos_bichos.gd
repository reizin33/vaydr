class_name ModelosBichos
## Os bichos montados por código a partir das medidas de cada espécie (FAUNA_FORMA do jogo antigo, 46_animais.js): o corpo é
## uma revolução ao longo do comprimento (lombo na cor da espécie, barriga clara), o pescoço, a cabeça com focinho, olhos,
## nariz e orelhas, as quatro pernas em dois pedaços (com casco, pata ou garra), o rabo e o que faz cada espécie ser ela mesma
## (galhada do cervo, chifres, barba, presas do javali, úbere e manchas da vaca, rosetas da onça, lã da ovelha...).
## Cada pedaço fica num "osso" (um Node3D): 0 corpo, 1 pescoço, 2 cabeça, 3-10 as pernas (de cima e de baixo; 3/4 a da frente
## direita, 5/6 a da frente esquerda, 7/8 a de trás direita, 9/10 a de trás esquerda) e 11 o rabo. Girando os ossos o bicho anda,
## pasta, deita e cai. A frente do bicho é o +Z do nó.

static var _dados := {}
static var _cache := {}      # tipo+variante -> [malha de cada osso]
static var _mats := {}
static var _jit := 0.05


static func dados() -> Dictionary:
	if _dados.is_empty():
		_dados = JSON.parse_string(FileAccess.get_file_as_string("res://dados/jogo/fauna.json"))
	return _dados


static func forma(tipo: String, vid := "") -> Dictionary:
	var D := dados()
	var F0: Dictionary = D["fauna_forma"][tipo]
	var F := F0.duplicate(true)
	if vid != "" and D["fauna_var"].has(tipo + vid):
		var V: Dictionary = D["fauna_var"][tipo + vid]
		for k in V:
			if k == "cor":
				for c in V["cor"]:
					F["cor"][c] = V["cor"][c]
			else:
				F[k] = V[k]
	return F


## a altura do quadril (o osso do corpo) acima do chão
static func altura_corpo(F: Dictionary) -> float:
	return float(F["H"]) * 0.28 + float(F["pS"][0]) + float(F["pI"][0])


## onde fica cada osso em relação ao pai (como faunaOssos do jogo antigo)
static func ossos(F: Dictionary) -> Array:
	var H := float(F["H"])
	var Hc := altura_corpo(F)
	var yF := -H * 0.28
	var yB := -(Hc - float(F["pS"][1]) - float(F["pI"][1]))
	var pc: Dictionary = F["pesc"]
	var lx := float(F["legX"])
	var lz: Array = F["legZ"]
	var rb: Dictionary = F["rabo"]
	return [
		[-1, Vector3(0, Hc, 0)],
		[0, Vector3(0, float(pc["y"]), float(pc["z"]))],
		[1, Vector3(0, float(pc["len"]) * sin(float(pc["ang"])), float(pc["len"]) * cos(float(pc["ang"])))],
		[0, Vector3(lx, yF, float(lz[0]))], [3, Vector3(0, -float(F["pS"][0]), 0)],
		[0, Vector3(-lx, yF, float(lz[0]))], [5, Vector3(0, -float(F["pS"][0]), 0)],
		[0, Vector3(lx, yB, float(lz[1]))], [7, Vector3(0, -float(F["pS"][1]), 0)],
		[0, Vector3(-lx, yB, float(lz[1]))], [9, Vector3(0, -float(F["pS"][1]), 0)],
		[0, Vector3(0, float(rb.get("y", 0.04)), -float(F["L"]) * 0.47)],
	]


## monta o bicho: devolve {"raiz": Node3D (no chão), "ossos": [12 Node3D]}
static func montar(tipo: String, vid := "") -> Dictionary:
	var F := forma(tipo, vid)
	var chave := tipo + vid
	if not _cache.has(chave):
		_cache[chave] = _malhas(tipo, F)
	var malhas: Array = _cache[chave]
	var raiz := Node3D.new()
	var O: Array = []
	var base := ossos(F)
	for i in base.size():
		var no := Node3D.new()
		no.name = "osso%d" % i
		no.position = base[i][1]
		O.append(no)
		var pai: int = base[i][0]
		if pai < 0:
			raiz.add_child(no)
		else:
			(O[pai] as Node3D).add_child(no)
		if malhas[i] != null:
			var mi := MeshInstance3D.new()
			mi.mesh = malhas[i]
			mi.material_override = _mat()
			no.add_child(mi)
	return {"raiz": raiz, "ossos": O, "forma": F}


static func _mat() -> StandardMaterial3D:
	if not _mats.has("pele"):
		var m := StandardMaterial3D.new()
		m.vertex_color_use_as_albedo = true
		m.vertex_color_is_srgb = true
		m.roughness = 0.9
		m.cull_mode = BaseMaterial3D.CULL_DISABLED
		_mats["pele"] = m
	return _mats["pele"]


# ---------------------------------------------------------------- geometria (como no jogo antigo: 00_core.js e 20_chars.js)
## transformação: posição, giro (ordem Y, X, Z) e escala
static func _m(px := 0.0, py := 0.0, pz := 0.0, rx := 0.0, ry := 0.0, rz := 0.0, sx := 1.0, sy := -1.0, sz := -1.0) -> Transform3D:
	if sy < 0.0:
		sy = sx
	if sz < 0.0:
		sz = sx
	var b := Basis.from_euler(Vector3(rx, ry, rz), EULER_ORDER_YXZ) * Basis.from_scale(Vector3(sx, sy, sz))
	return Transform3D(b, Vector3(px, py, pz))


## alinha o eixo Y com a direção (dx, dy, dz) no ponto (para as manchas na pele)
static func _alinha(px: float, py: float, pz: float, dx: float, dy: float, dz: float) -> Transform3D:
	var l := maxf(Vector3(dx, dy, dz).length(), 1e-6)
	return _m(px, py, pz, acos(clampf(dy / l, -1.0, 1.0)), atan2(dx, dz), 0.0)


## revolução de um perfil [[r, y, dz, kx, kz], ...] em volta do eixo Y (a0/a1 recortam um arco)
static func _revol(prof: Array, seg: int, sx := 1.0, sz := 1.0, a0 := 0.0, a1 := TAU) -> PackedVector3Array:
	var aneis: Array = []
	for p in prof:
		var r: float = float(p[0]) if float(p[0]) > 1e-6 else 0.0
		var kx: float = float(p[3]) if p.size() > 3 and float(p[3]) != 0.0 else 1.0
		var kz: float = float(p[4]) if p.size() > 4 and float(p[4]) != 0.0 else 1.0
		var dz: float = float(p[2]) if p.size() > 2 else 0.0
		var a := PackedVector3Array()
		for i in seg + 1:
			var ang := a0 + (a1 - a0) * i / float(seg)
			a.append(Vector3(sin(ang) * r * sx * kx, float(p[1]), cos(ang) * r * sz * kz + dz))
		aneis.append(a)
	var t := PackedVector3Array()
	for k in prof.size() - 1:
		var A: PackedVector3Array = aneis[k]
		var B: PackedVector3Array = aneis[k + 1]
		var ra := float(prof[k][0]) > 1e-6
		var rb := float(prof[k + 1][0]) > 1e-6
		for i in seg:
			if ra and rb:
				t.append_array(PackedVector3Array([A[i], B[i + 1], B[i], A[i], A[i + 1], B[i + 1]]))
			elif rb:
				t.append_array(PackedVector3Array([A[i], B[i + 1], B[i]]))
			elif ra:
				t.append_array(PackedVector3Array([A[i], A[i + 1], B[i]]))
	return t


static func _elipse(rx: float, ry: float, rz: float, seg := 12, aneis := 8) -> PackedVector3Array:
	var pr: Array = []
	for i in aneis + 1:
		var th := PI * i / float(aneis)
		pr.append([sin(th), -cos(th) * ry])
	return _revol(pr, seg, rx, rz)


## tronco de cone de pé: raio rb embaixo (y = 0) e rt em cima (y = h)
static func _cil(rt: float, rb: float, h: float, seg: int) -> PackedVector3Array:
	var t := PackedVector3Array()
	for i in seg:
		var a0 := i / float(seg) * TAU
		var a1 := (i + 1) / float(seg) * TAU
		var b0 := Vector3(rb * cos(a0), 0, rb * sin(a0))
		var b1 := Vector3(rb * cos(a1), 0, rb * sin(a1))
		if rt <= 0.0:
			t.append_array(PackedVector3Array([b0, Vector3(0, h, 0), b1]))
		else:
			var t0 := Vector3(rt * cos(a0), h, rt * sin(a0))
			var t1 := Vector3(rt * cos(a1), h, rt * sin(a1))
			t.append_array(PackedVector3Array([b0, t0, t1, b0, t1, b1, Vector3(0, h, 0), t1, t0]))
	return t


static func _caixa(w: float, h: float, d: float, tx := 1.0, tz := 1.0) -> PackedVector3Array:
	var hx := w / 2.0
	var hy := h / 2.0
	var hz := d / 2.0
	var v := [Vector3(-hx, -hy, -hz), Vector3(hx, -hy, -hz), Vector3(hx, -hy, hz), Vector3(-hx, -hy, hz),
		Vector3(-hx * tx, hy, -hz * tz), Vector3(hx * tx, hy, -hz * tz), Vector3(hx * tx, hy, hz * tz), Vector3(-hx * tx, hy, hz * tz)]
	var q := [[7, 6, 5, 4], [0, 1, 2, 3], [3, 2, 6, 7], [1, 0, 4, 5], [2, 1, 5, 6], [0, 3, 7, 4]]
	var t := PackedVector3Array()
	for f in q:
		t.append_array(PackedVector3Array([v[f[0]], v[f[1]], v[f[2]], v[f[0]], v[f[2]], v[f[3]]]))
	return t


## bola de icosaedro dividido, com os vértices mexidos (lã, pompom do rabo)
static func _bola(r: float, mexe: float, rng: RandomNumberGenerator) -> PackedVector3Array:
	var g := (1.0 + sqrt(5.0)) / 2.0
	var V: Array = []
	for p in [[-1, g, 0], [1, g, 0], [-1, -g, 0], [1, -g, 0], [0, -1, g], [0, 1, g], [0, -1, -g], [0, 1, -g], [g, 0, -1], [g, 0, 1], [-g, 0, -1], [-g, 0, 1]]:
		V.append(Vector3(p[0], p[1], p[2]).normalized())
	var FF := [0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11, 1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8, 3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8,
		3, 8, 9, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1]
	var F: Array = []
	for i in range(0, 60, 3):
		F.append([FF[i], FF[i + 1], FF[i + 2]])
	var meio := {}
	var nf: Array = []
	for f in F:
		var m3: Array = []
		for e in [[f[0], f[1]], [f[1], f[2]], [f[2], f[0]]]:
			var a: int = e[0]
			var b: int = e[1]
			var k := mini(a, b) * 4096 + maxi(a, b)
			if not meio.has(k):
				V.append(((V[a] as Vector3) + (V[b] as Vector3)).normalized())
				meio[k] = V.size() - 1
			m3.append(meio[k])
		nf.append([f[0], m3[0], m3[2]])
		nf.append([f[1], m3[1], m3[0]])
		nf.append([f[2], m3[2], m3[1]])
		nf.append([m3[0], m3[1], m3[2]])
	var K: Array = []
	for i in V.size():
		K.append(r * (1.0 + (rng.randf() - 0.5) * mexe))
	var t := PackedVector3Array()
	for f in nf:
		for i in f:
			t.append((V[i] as Vector3) * float(K[i]))
	return t


# ---------------------------------------------------------------- montagem
## o perfil do corpo no ponto t (0 = anca, 1 = peito): [t, largura, altura, deslocamento vertical]
static func perfil(F: Dictionary, t: float) -> Array:
	var c: Array = F["corpo"]
	if t <= float(c[0][0]):
		return c[0]
	for i in c.size() - 1:
		var a: Array = c[i]
		var b: Array = c[i + 1]
		if t <= float(b[0]):
			var u := (t - float(a[0])) / (float(b[0]) - float(a[0]))
			return [t, lerpf(a[1], b[1], u), lerpf(a[2], b[2], u), lerpf(a[3], b[3], u)]
	return c[c.size() - 1]


## um ponto na pele do corpo (ang 0 = barriga, PI = lombo) e a normal: para pintar manchas, lã, crina
static func ponto_corpo(F: Dictionary, t: float, ang: float, fora := 0.0) -> Array:
	var p := perfil(F, t)
	var rx := float(F["W"]) / 2.0 * float(p[1])
	var ry := float(F["H"]) / 2.0 * float(p[2])
	var x := sin(ang) * rx
	var y := float(p[3]) - cos(ang) * ry
	var z := (t - 0.5) * float(F["L"])
	var n := Vector2(sin(ang) / rx, -cos(ang) / ry).normalized()
	return [x + n.x * fora, y + n.y * fora, z, n.x, n.y, 0.0]


## guarda uma peça no osso b (com a cor e quanto ela varia pela superfície)
static func _put(pecas: Array, b: int, tris: PackedVector3Array, m: Transform3D, cor, j := -1.0) -> void:
	(pecas[b] as Array).append([tris, m, _cor(cor), _jit if j < 0.0 else j])


static func _cor(v) -> Color:
	var h := int(v)
	return Color(((h >> 16) & 255) / 255.0, ((h >> 8) & 255) / 255.0, (h & 255) / 255.0)


## as malhas de cada osso (uma por osso, com as cores nos vértices)
static func _malhas(tipo: String, F: Dictionary) -> Array:
	var C: Dictionary = F["cor"]
	var rng := RandomNumberGenerator.new()
	rng.seed = tipo.length() * 977 + 7
	var pecas: Array = []
	for i in 12:
		pecas.append([])
	_jit = float(F.get("j", 0.05))
	var L := float(F["L"])
	var W := float(F["W"])
	var H := float(F["H"])
	var ROT := _m(0, 0, 0, PI / 2.0)
	# o corpo
	var N := 14
	var prof: Array = []
	for i in N + 1:
		var t := -0.04 + 1.08 * i / float(N)
		var p := perfil(F, clampf(t, 0.0, 1.0))
		var ponta := 0.35 if (t < 0.0 or t > 1.0) else 1.0
		prof.append([1.0, (t - 0.5) * L, -float(p[3]), W / 2.0 * float(p[1]) * ponta, H / 2.0 * float(p[2]) * ponta])
	prof[0][3] = 0.0001
	prof[0][4] = 0.0001
	prof[N][3] = 0.0001
	prof[N][4] = 0.0001
	_put(pecas, 0, _revol(prof, 14, 1.0, 1.0, -1.05, 1.05), ROT, C["barriga"])
	_put(pecas, 0, _revol(prof, 14, 1.0, 1.0, 1.05, TAU - 1.05), ROT, C["base"])
	# o pescoço
	var pc: Dictionary = F["pesc"]
	var r0 := float(pc["r0"])
	var r1 := float(pc["r1"])
	var pl := float(pc["len"])
	var rot_p := _m(0, 0, 0, PI / 2.0 - float(pc["ang"]))
	_put(pecas, 1, _revol([[r0 * 1.08, -r0 * 0.6], [r0, 0.0], [lerpf(r0, r1, 0.5), pl * 0.5], [r1, pl], [r1 * 0.8, pl + r1 * 0.4]], 10), rot_p, C["base"])
	if bool(F.get("la", false)):
		_put(pecas, 1, _revol([[r0 * 1.2, -r0 * 0.4], [r0 * 1.15, pl * 0.5], [r1 * 1.1, pl * 0.85]], 10), rot_p, C["base"], 0.08)
	# a cabeça: crânio, focinho, nariz, olhos e orelhas
	var cb: Dictionary = F["cab"]
	var cw := float(cb["w"])
	var ch := float(cb["h"])
	var cl := float(cb["len"])
	var fo := float(cb["foc"])
	var fw := float(cb["focW"])
	var fh := float(cb["focH"])
	var HM := _m(0, 0, 0, float(cb["ang"]))
	var cor_cab = C.get("cabeca", C["base"])
	_put(pecas, 2, _elipse(cw / 2.0, ch / 2.0, cl / 2.0, 12, 8), HM * _m(0, 0, cl * 0.18), cor_cab)
	_put(pecas, 2, _revol([[fw * 1.25, 0.0, 0.0, 1.0, fh / fw], [fw * 1.05, fo * 0.55, 0.0, 1.0, fh / fw], [fw * 0.82, fo, 0.0, 1.0, fh / fw], [0.0001, fo + fw * 0.35]], 10),
		HM * _m(0, -ch * 0.12, cl * 0.3, PI / 2.0), C.get("focinho", cor_cab))
	_put(pecas, 2, _elipse(fw * 0.55, fh * 0.45, fw * 0.3, 8, 5), HM * _m(0, -ch * 0.1, cl * 0.3 + fo + fw * 0.12), C["nariz"], 0.02)
	var o: Dictionary = F["ore"]
	var ol := float(o["len"])
	var ow := float(o["w"])
	for s in [1.0, -1.0]:
		_put(pecas, 2, _elipse(cw * 0.09, cw * 0.09, cw * 0.07, 7, 5), HM * _m(s * cw * 0.42, ch * 0.12, cl * 0.38), 0x0c0a08, 0.0)
		match str(o["tipo"]):
			"longa":
				_put(pecas, 2, _elipse(ow, ol / 2.0, ow * 0.45, 8, 6), HM * _m(s * cw * 0.22, ch * 0.4 + ol * 0.45, cl * 0.05, -0.25, 0, -s * 0.12), C["base"])
			"ponta":
				_put(pecas, 2, _cil(0.0, ow / 2.0, ol, 6), HM * _m(s * cw * 0.3, ch * 0.32, cl * 0.05, -0.15, 0, -s * 0.18, 1, 1, 0.45), C["base"])
				if tipo == "raposa":
					_put(pecas, 2, _cil(0.0, ow * 0.36, ol * 0.7, 5), HM * _m(s * cw * 0.3, ch * 0.33, cl * 0.05 + 0.008, -0.15, 0, -s * 0.18, 1, 1, 0.3), 0x1a1410)
			"redonda":
				_put(pecas, 2, _elipse(ow, ol, ow * 0.45, 8, 6), HM * _m(s * cw * 0.36, ch * 0.42, cl * 0.02), C["base"])
			_:
				var cima := float(o.get("cima", 0.0))
				_put(pecas, 2, _elipse(ol / 2.0, ow * 0.45, ow, 8, 6), HM * _m(s * (cw * 0.5 + ol * 0.38), ch * 0.28 + cima * ol * 0.3, cl * 0.02, 0, 0, s * (0.25 + cima)), cor_cab)
	# as pernas (coxa/braço e canela; casco, pata ou garra)
	var pR: Array = F["pR"]
	var q0 := float(pR[0])
	var q1 := float(pR[1])
	var q2 := float(pR[2])
	for k in 4:
		var tr := k >= 2
		var up := 3 + k * 2
		var lo := up + 1
		var Sx := float(F["pS"][1 if tr else 0])
		var Ix := float(F["pI"][1 if tr else 0])
		_put(pecas, up, _cil(q0, q1, Sx, 8), _m(0, -Sx, 0), C["base"])
		_put(pecas, up, _elipse(q0 * 1.45, Sx * 0.45, q0 * (1.9 if tr else 1.5), 8, 6), _m(0, -Sx * 0.22, -q0 * 0.3 if tr else q0 * 0.2), C["base"])
		_put(pecas, lo, _cil(q1 * 0.95, q2, Ix, 8), _m(0, -Ix, 0), C["pata"])
		match str(F.get("pata", "pata")):
			"casco":
				_put(pecas, lo, _cil(q2 * 1.05, q2 * 1.25, q2 * 1.6, 7), _m(0, -Ix, q2 * 0.15), 0x1a1612, 0.02)
			"garra":
				_put(pecas, lo, _elipse(q2 * 1.3, q2 * 0.55, q2 * 1.7, 8, 5), _m(0, -Ix + q2 * 0.3, q2 * 0.6), C["pata"])
				for c in [-1.0, 0.0, 1.0]:
					_put(pecas, lo, _cil(0.0, q2 * 0.18, q2 * 0.6, 4), _m(c * q2 * 0.5, -Ix + q2 * 0.12, q2 * 2.2, 1.45, 0, 0), 0xd8d0c0, 0.02)
			_:
				_put(pecas, lo, _elipse(q2 * 1.25, q2 * 0.6, q2 * 1.6, 8, 5), _m(0, -Ix + q2 * 0.35, q2 * 0.55), C["pata"])
	# o rabo
	var rb: Dictionary = F["rabo"]
	var rr0 := float(rb["r0"])
	var rr1 := float(rb.get("r1", 0.0))
	var rl := float(rb["len"])
	var rbM := _m(0, 0, 0, -PI / 2.0 + float(rb.get("ang", 0.0)))
	match str(rb["tipo"]):
		"bola":
			_put(pecas, 11, _bola(rr0, 0.25, rng), Transform3D(), C.get("claro", 0xf2eee6), 0.03)
		"peludo":
			_put(pecas, 11, _revol([[rr0, 0.0], [rr1, rl * 0.45], [rr1 * 0.95, rl * 0.75], [rr0 * 0.6, rl * 0.97], [0.0001, rl]], 10), rbM, C["base"], 0.1)
			_put(pecas, 11, _revol([[rr0 * 0.7, rl * 0.8], [rr0 * 0.4, rl], [0.0001, rl * 1.04]], 8), rbM, 0xf4f0e8 if tipo == "raposa" else C.get("escuro", C["base"]))
		"fino":
			var rf := rr1 if rr1 > 0.0 else rr0
			_put(pecas, 11, _revol([[rr0, 0.0], [rr1 if rr1 > 0.0 else rr0 * 0.8, rl * 0.7], [rf * 0.7, rl]], 7), rbM, C["base"])
			if bool(rb.get("tufo", false)):
				_put(pecas, 11, _elipse(rr0 * 2.2, rl * 0.1, rr0 * 2.2, 7, 5), rbM * _m(0, rl, 0), C.get("escuro", 0x1c1a18), 0.1)
			if tipo == "onca":
				_put(pecas, 11, _revol([[rf * 0.75, rl * 0.85], [rf * 0.72, rl], [0.0001, rl * 1.04]], 7), rbM, C["mancha"])
		_:
			_put(pecas, 11, _revol([[rr0, 0.0], [rr0 * 0.9, rl * 0.6], [0.0001, rl]], 8), rbM, C.get("claro", C["base"]))
	_extras(tipo, F, C, pecas, rng, HM)
	# junta as peças de cada osso numa malha
	var out: Array = []
	for b in 12:
		out.append(_juntar(pecas[b]) if not (pecas[b] as Array).is_empty() else null)
	return out


## os detalhes de cada espécie (como bichoExtras do jogo antigo)
static func _extras(tipo: String, F: Dictionary, C: Dictionary, pecas: Array, R: RandomNumberGenerator, HM: Transform3D) -> void:
	var cb: Dictionary = F["cab"]
	var cw := float(cb["w"])
	var ch := float(cb["h"])
	var cl := float(cb["len"])
	var W := float(F["W"])
	var H := float(F["H"])
	var L := float(F["L"])
	# a galhada do cervo (macho): galhos que se dividem
	if F.get("galhada", false) == true:
		for s in [1.0, -1.0]:
			var m: Transform3D = HM * _m(s * cw * 0.22, ch * 0.42, cl * 0.02)
			var seg := func(mm: Transform3D, r: float, l: float, rx: float, rz: float) -> Transform3D:
				var g := _m(0, 0, 0, rx, 0, rz)
				_put(pecas, 2, _cil(r * 0.7, r, l, 5), mm * g, C["chifre"], 0.03)
				return mm * g * _m(0, l, 0)
			m = seg.call(m, 0.018, 0.16, -0.3, -s * 0.35)
			seg.call(m, 0.012, 0.12, 0.6, -s * 0.1)
			m = seg.call(m, 0.016, 0.18, -0.45, -s * 0.15)
			seg.call(m, 0.01, 0.11, 0.7, s * 0.2)
			m = seg.call(m, 0.012, 0.14, -0.2, -s * 0.2)
			seg.call(m, 0.008, 0.09, 0.5, s * 0.3)
	if str(F.get("chifres", "")) == "cabra":
		for s in [1.0, -1.0]:
			var m: Transform3D = HM * _m(s * cw * 0.2, ch * 0.45, cl * 0.08)
			for i in 4:
				var r := 0.02 - i * 0.004
				var g := _m(0, 0, 0, -0.65 - i * 0.1, 0, -s * 0.12)
				_put(pecas, 2, _cil(r * 0.8, r, 0.07, 6), m * g, C["chifre"], 0.04)
				m = m * g * _m(0, 0.07, 0)
	if str(F.get("chifres", "")) == "vaca":
		for s in [1.0, -1.0]:
			_put(pecas, 2, _cil(0.008, 0.026, 0.15, 6), HM * _m(s * cw * 0.42, ch * 0.38, cl * 0.02, 0, 0, -s * 1.05), C["chifre"], 0.03)
	if bool(F.get("barba", false)):
		_put(pecas, 2, _cil(0.02, 0.0001, 0.09, 6), HM * _m(0, -ch * 0.42, cl * 0.42, PI, 0, 0), 0xd8d0c4, 0.08)
	if bool(F.get("presas", false)):
		var fw := float(cb["focW"])
		var fo := float(cb["foc"])
		for s in [1.0, -1.0]:
			_put(pecas, 2, _cil(0.0001, 0.012, 0.08, 5), HM * _m(s * fw * 0.9, -ch * 0.2, cl * 0.3 + fo * 0.6, -0.6, 0, -s * 0.5), C["presa"], 0.02)
	if bool(F.get("ubere", false)):
		_put(pecas, 0, _elipse(0.14, 0.09, 0.13, 10, 6), _m(0, -H * 0.45, -L * 0.25), 0xe0aaa0, 0.03)
		for s in [1.0, -1.0]:
			for t in [1.0, -1.0]:
				_put(pecas, 0, _cil(0.012, 0.016, 0.06, 5), _m(s * 0.05, -H * 0.45 - 0.13, -L * 0.25 + t * 0.05), 0xd09088, 0.02)
	if bool(F.get("manchas", false)):
		for i in 9:
			var t := 0.08 + R.randf() * 0.84
			var a := (1.0 if R.randf() < 0.5 else -1.0) * (1.2 + R.randf() * 1.6)
			var p := ponto_corpo(F, t, a, 0.006)
			_put(pecas, 0, _elipse(0.11 + R.randf() * 0.09, 0.012, 0.09 + R.randf() * 0.08, 9, 4), _alinha(p[0], p[1], p[2], p[3], p[4], p[5]), C["mancha"], 0.04)
		_put(pecas, 2, _elipse(cw * 0.3, 0.01, cl * 0.3, 8, 4), HM * _m(cw * 0.3, ch * 0.3, cl * 0.1, 0, 0, -0.6), C["mancha"], 0.04)
	if bool(F.get("rosetas", false)):
		for i in 70:
			var t := R.randf()
			var a := (1.0 if R.randf() < 0.5 else -1.0) * (0.7 + R.randf() * 2.3)
			var p := ponto_corpo(F, t, a, 0.004)
			var rr := 0.018 + R.randf() * 0.022
			var al := _alinha(p[0], p[1], p[2], p[3], p[4], p[5])
			if R.randf() < 0.55:
				for k in 5:
					var aa := k / 5.0 * TAU
					_put(pecas, 0, _elipse(rr * 0.45, 0.006, rr * 0.45, 6, 3), al * _m(cos(aa) * rr * 1.3, 0, sin(aa) * rr * 1.3), C["mancha"], 0.03)
			else:
				_put(pecas, 0, _elipse(rr, 0.006, rr * 1.2, 7, 3), al, C["mancha"], 0.03)
		for k in 4:
			for i in 6:
				var up := 3 + k * 2
				var Sx := float(F["pS"][1 if k >= 2 else 0])
				_put(pecas, up, _elipse(0.012, 0.006, 0.012, 6, 3), _m((R.randf() - 0.5) * 0.08, -Sx * (0.2 + R.randf() * 0.7), float(F["pR"][0]) * 0.95, PI / 2.0, 0, 0), C["mancha"], 0.03)
	if bool(F.get("sela", false)):
		var p := ponto_corpo(F, 0.55, PI, 0.01)
		_put(pecas, 0, _elipse(W * 0.42, 0.05, L * 0.32, 10, 6), _m(p[0], float(p[1]) - 0.03, p[2]), C["escuro"], 0.1)
	if bool(F.get("anca", false)):
		var p := ponto_corpo(F, 0.02, PI * 0.75, 0.005)
		_put(pecas, 0, _elipse(W * 0.32, H * 0.3, 0.04, 9, 6), _m(0, float(p[1]) - H * 0.12, -L * 0.48), C["claro"], 0.03)
	if bool(F.get("crina", false)):
		for i in 14:
			var p := ponto_corpo(F, minf(1.0, 0.35 + i * 0.045), PI, 0.0)
			_put(pecas, 0, _caixa(0.03, 0.07 + R.randf() * 0.04, 0.03, 0.2, 0.4), _m(p[0], float(p[1]) + 0.02, p[2], -0.3, 0, 0), 0x1a1410, 0.1)
	if bool(F.get("la", false)):
		for i in 46:
			var p := ponto_corpo(F, 0.03 + R.randf() * 0.94, (1.0 if R.randf() < 0.5 else -1.0) * (0.5 + R.randf() * 2.6), 0.005)
			_put(pecas, 0, _bola(0.075 + R.randf() * 0.05, 0.3, R), _m(p[0], p[1], p[2]), C["base"], 0.07)
	if tipo == "raposa":
		_put(pecas, 1, _elipse(0.06, 0.09, 0.05, 8, 6), _m(0, 0, 0.06, 0.5, 0, 0), C["barriga"])
	if tipo == "urso":
		var p := ponto_corpo(F, 0.78, PI, 0.0)
		_put(pecas, 0, _elipse(W * 0.35, 0.12, 0.22, 10, 6), _m(0, float(p[1]) - 0.06, p[2]), C["base"], 0.15)
	if tipo == "coelho":
		for s in [1.0, -1.0]:
			_put(pecas, 7 if s > 0.0 else 9, _elipse(0.045, 0.06, 0.075, 8, 6), _m(0, -0.03, -0.02), C["base"])


## junta as peças de um osso numa malha só: cada peça com as normais para fora do centro dela, suavizadas, e a cor variando
## um pouco pela superfície
static func _juntar(L: Array) -> ArrayMesh:
	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	for pc in L:
		var tris: PackedVector3Array = pc[0]
		var m: Transform3D = pc[1]
		var cor: Color = pc[2]
		var j: float = pc[3]
		var P := PackedVector3Array()
		P.resize(tris.size())
		var centro := Vector3.ZERO
		for i in tris.size():
			P[i] = m * tris[i]
			centro += P[i]
		centro /= maxf(1.0, float(tris.size()))
		# a normal de cada triângulo (virando os que apontam para dentro) e a soma em cada vértice
		var nt := tris.size() / 3
		var soma := {}
		var ordem := PackedInt32Array()
		ordem.resize(nt * 3)
		for k in nt:
			var a := P[k * 3]
			var b := P[k * 3 + 1]
			var c := P[k * 3 + 2]
			var n := (b - a).cross(c - a)
			var dentro := n.dot((a + b + c) / 3.0 - centro) < 0.0
			if dentro:
				n = -n
			# o Godot desenha a frente com os vértices no sentido do relógio
			if not dentro:
				ordem[k * 3] = k * 3
				ordem[k * 3 + 1] = k * 3 + 2
				ordem[k * 3 + 2] = k * 3 + 1
			else:
				ordem[k * 3] = k * 3
				ordem[k * 3 + 1] = k * 3 + 1
				ordem[k * 3 + 2] = k * 3 + 2
			for v in 3:
				var key := (P[k * 3 + v] * 2000.0).round()
				soma[key] = (soma.get(key, Vector3.ZERO) as Vector3) + n
		for i in ordem:
			var p := P[i]
			var key := (p * 2000.0).round()
			var n: Vector3 = (soma[key] as Vector3).normalized()
			var hh := _hash(key)
			var k2 := 1.0 + (hh - 0.5) * 2.0 * j
			st.set_normal(n)
			st.set_color(Color(clampf(cor.r * k2, 0.0, 1.0), clampf(cor.g * k2, 0.0, 1.0), clampf(cor.b * k2, 0.0, 1.0)))
			st.add_vertex(p)
	return st.commit()


static func _hash(v: Vector3) -> float:
	var h := int(v.x) * 374761393 ^ int(v.y) * 668265263 ^ int(v.z) * 2147483647
	h = (h ^ (h >> 13)) * 1274126177
	h = h ^ (h >> 16)
	return float(h & 0xffffff) / float(0xffffff)
