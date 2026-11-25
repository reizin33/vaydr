class_name Pesca
extends Node3D
## A pesca (etapa 6d), como no jogo antigo (48l_agua.js e 61h_peixes.js): com a vara na mão, E na água joga a linha (até uns
## 9 m na frente). A boia fica balançando; quando o peixe morde ela afunda e treme: aperte E na hora (o peixe grande puxa forte
## e a janela é menor). O que morde depende do lugar (rio, lago ou mar), da hora (o mandi e o bagre mordem mais de noite, a
## traíra no fim da tarde), da chuva (o dourado sobe o rio com chuva) e da estação (no verão morde mais rápido, no inverno mais
## devagar). Cada peixe tem peso: o pequeno rende 1 peixe cru, o grande até 5. Às vezes vem lixo no anzol. Na água perto de
## você, de vez em quando um peixe pula. O jogo guarda as espécies pescadas, quantas e o maior de cada.

var main
var P := {}                # a pescaria agora: {"p": ponto da boia, "t", "morde", "mordeu", "janela", "de": onde você está, "esp", "kg"}
var registro := {}         # espécie -> {"n": quantos, "max": o maior (kg)}
var PEIXES := {}
var _boia: Node3D
var _linha: MeshInstance3D
var _im: ImmediateMesh
var _pulos: Array = []
var _pulo_t := 6.0
var _malhas := {}
var _aneis: Array = []


func _init(m) -> void:
	main = m
	var d = JSON.parse_string(FileAccess.get_file_as_string("res://dados/jogo/antigo_itens.json"))
	PEIXES = d.get("PEIXES", {}) if d is Dictionary else {}


func _ready() -> void:
	# a boia (vermelha embaixo, branca em cima)
	_boia = Node3D.new()
	add_child(_boia)
	for e in [[0.06, Color(0.85, 0.15, 0.12), 0.0], [0.04, Color(0.95, 0.95, 0.92), 0.06]]:
		var mi := MeshInstance3D.new()
		var sm := SphereMesh.new()
		sm.radius = e[0]
		sm.height = float(e[0]) * 2.0
		mi.mesh = sm
		var m := StandardMaterial3D.new()
		m.albedo_color = e[1]
		m.roughness = 0.6
		mi.material_override = m
		mi.position.y = e[2]
		_boia.add_child(mi)
	_boia.visible = false
	# a linha (da ponta da vara até a boia)
	_im = ImmediateMesh.new()
	_linha = MeshInstance3D.new()
	_linha.mesh = _im
	var ml := StandardMaterial3D.new()
	ml.albedo_color = Color(0.9, 0.9, 0.85, 0.7)
	ml.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	ml.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	_linha.material_override = ml
	_linha.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	add_child(_linha)


func ativa() -> bool:
	return not P.is_empty()


## o lugar da água: rio (perto do Rio Claro), lago ou mar
func local(x: float, z: float) -> String:
	var t: int = main.terreno.tipo_agua(x, z)
	if t == 2:
		return "mar"
	if main.fauna != null and main.fauna.rio_perto(x, z).x < 14.0:
		return "rio"
	return "lago"


## a água para onde você está olhando (até 9 m): o ponto da boia
func agua_na_frente(j) -> Vector3:
	var o: Vector3 = j.olho()
	var d: Vector3 = -j.cam.global_transform.basis.z
	var dh := Vector3(d.x, 0, d.z).normalized()
	for k in 18:
		var dist := 1.0 + k * 0.5
		var p: Vector3 = o + dh * dist
		var n: float = main.terreno.nivel_agua(p.x, p.z)
		if n < -900.0 or absf(n - j.global_position.y) > 2.5:
			continue
		if n - main.terreno.h(p.x, p.z) < 0.15:
			continue
		return Vector3(p.x, n, p.z)
	return Vector3.INF


## o tempo de espera até morder (a estação muda: no verão morde mais rápido, no inverno mais devagar)
func _espera(p: Vector3) -> float:
	var lg := local(p.x, p.z) != "rio"
	var noite: bool = main.noite_k() > 0.5
	var chuva: bool = main.clima != null and main.clima.chuva_k > 0.4
	var base := (4.0 if lg else 7.0) + randf() * (8.0 if lg else 12.0) * (1.4 if noite else 1.0) * (0.7 if chuva else 1.0)
	var est := 1.0
	if main.clima != null:
		est = [0.9, 0.75, 1.0, 1.2][main.clima.estacao_idx()]
	return base * est


func comecar(j) -> bool:
	if ativa():
		return false
	var p := agua_na_frente(j)
	if p == Vector3.INF:
		main.ui.aviso("Jogue a linha na água (olhe para o rio, o lago ou o mar)")
		return false
	P = {"p": p, "t": 0.0, "morde": _espera(p), "mordeu": false, "janela": 0.0, "de": j.global_position, "esp": "", "kg": 0.0}
	_boia.global_position = p
	_boia.visible = true
	main.sons.tocar("lancar", p, -2.0)
	_anel(p)
	main.ui.aviso("Linha na água. Espere morder e aperte E.", 3.0)
	return true


## qual peixe morde aqui e agora
func sorteia(x: float, z: float) -> String:
	var L := local(x, z)
	var noite: bool = main.noite_k() > 0.5
	var tarde := float(main.hora) >= 17.0 and float(main.hora) < 19.5
	var chuva: bool = main.clima != null and main.clima.chuva_k > 0.4
	var inv: bool = main.clima != null and main.clima.estacao_idx() == 3
	var W: Array = []
	var tot := 0.0
	for k in PEIXES:
		var F: Dictionary = PEIXES[k]
		var w := float(F["onde"].get(L, 0.0))
		if w <= 0.0:
			continue
		w *= float(F.get("noite", 1.0)) if noite else float(F.get("dia", 1.0))
		if tarde and k == "traira":
			w *= 1.6
		if chuva and F.has("chuva"):
			w *= float(F["chuva"])
		if inv and k != "lambari" and k != "bagre":
			w *= 0.8
		W.append([k, w])
		tot += w
	if W.is_empty():
		return "lambari"
	var r := randf() * tot
	for e in W:
		r -= float(e[1])
		if r <= 0.0:
			return e[0]
	return W[0][0]


func kg(id: String) -> float:
	var F: Dictionary = PEIXES[id]
	var u := randf()
	return snappedf(lerpf(float(F["kg"][0]), float(F["kg"][1]), u * u * (0.6 + 0.4 * u)), 0.01)


static func rende(kgs: float) -> int:
	return clampi(roundi(kgs / 0.75), 1, 5)


static func kg_txt(kgs: float) -> String:
	if kgs < 1.0:
		return "%d g" % roundi(kgs * 1000.0)
	return ("%.1f kg" % kgs).replace(".", ",")


func texto() -> String:
	if not ativa():
		return ""
	if bool(P["mordeu"]):
		return "E  Puxar o peixe! (agora!%s)" % (" Peixe grande puxando" if float(P["kg"]) >= 1.5 else "")
	return "E  Pescando... (recolher a linha)"


## E com a linha na água: na hora da mordida puxa o peixe; antes, recolhe a linha
func puxar(j) -> String:
	if not ativa():
		return ""
	var p: Vector3 = P["p"]
	var txt := "Recolheu a linha"
	if bool(P["mordeu"]) and float(P["janela"]) > 0.0:
		main.sons.tocar("puxar", p, 0.0)
		var s: Dictionary = j.item_mao()
		if str(s.get("id", "")) == "vara" and s.has("dur"):
			s["dur"] = float(s["dur"]) - 1.0
		var r := randf()
		if r < 0.84:
			var id: String = P["esp"] if str(P["esp"]) != "" else sorteia(p.x, p.z)
			var k: float = float(P["kg"]) if float(P["kg"]) > 0.0 else kg(id)
			var n := rende(k)
			j._ganhar("peixeCru", n)
			var e: Dictionary = registro.get(id, {"n": 0, "max": 0.0})
			e["n"] = int(e["n"]) + 1
			var recorde := k > float(e["max"]) and int(e["n"]) > 1
			e["max"] = maxf(float(e["max"]), k)
			registro[id] = e
			var nm := str(PEIXES[id]["nome"])
			txt = "Pegou %s %s de %s%s%s" % ["uma" if id in ["traira", "tilapia", "piau", "tainha", "sardinha", "corvina", "pescada", "cavala", "garoupa"] else "um",
				nm.to_lower(), kg_txt(k), (" (%d peixes crus)" % n) if n > 1 else "", (" · seu maior %s!" % nm.to_lower()) if recorde else ""]
			_pulo(p, id, k, true)
		else:
			var it := "sucata" if r < 0.93 else "garrafa"
			j._ganhar(it, 1)
			txt = "Veio lixo no anzol"
	P = {}
	_boia.visible = false
	_im.clear_surfaces()
	return txt


func parar() -> void:
	P = {}
	if _boia != null:
		_boia.visible = false
	if _im != null:
		_im.clear_surfaces()


func _physics_process(dt: float) -> void:
	_passo_pulos(dt)
	if not ativa():
		return
	var j = main.jogador
	var de: Vector3 = P["de"]
	if j == null or not j.vivo or str(j.item_mao().get("id", "")) != "vara" or Vector2(j.global_position.x - de.x, j.global_position.z - de.z).length() > 1.5:
		parar()
		return
	P["t"] = float(P["t"]) + dt
	var p: Vector3 = P["p"]
	if not bool(P["mordeu"]) and float(P["t"]) >= float(P["morde"]):
		P["mordeu"] = true
		var id := sorteia(p.x, p.z)
		var k := kg(id)
		P["esp"] = id
		P["kg"] = k
		P["janela"] = float(PEIXES[id].get("janela", 1.2)) * (0.85 if k > 2.0 else 1.0)
		main.sons.tocar("morde_peixe", p, 2.0)
		_anel(p)
		main.ui.aviso("Peixe grande! Puxa forte: aperte E já!" if k >= 1.5 else "Mordeu! Aperte E!", 1.5)
	if bool(P["mordeu"]):
		P["janela"] = float(P["janela"]) - dt
		if float(P["janela"]) <= 0.0:
			main.ui.aviso("O peixe escapou")
			parar()
			return
	# a boia balança (e afunda tremendo quando morde) e a linha vai da ponta da vara até ela
	var tt := float(P["t"])
	var bob := (sin(tt * 30.0) * 0.05 - 0.05) if bool(P["mordeu"]) else sin(tt * 2.5) * 0.015
	_boia.global_position = p + Vector3(0, 0.02 + bob, 0)
	var ponta: Vector3 = j.olho() + (-j.cam.global_transform.basis.z) * 0.9 + j.cam.global_transform.basis.x * 0.25 + Vector3(0, 0.25, 0)
	_im.clear_surfaces()
	_im.surface_begin(Mesh.PRIMITIVE_LINE_STRIP)
	for i in 9:
		var u := i / 8.0
		var q := ponta.lerp(_boia.global_position + Vector3(0, 0.08, 0), u)
		q.y -= sin(u * PI) * 0.35
		_im.surface_add_vertex(q)
	_im.surface_end()


# ======================================================================== os peixes pulando e as ondinhas
func _malha(id: String) -> ArrayMesh:
	if _malhas.has(id):
		return _malhas[id]
	var F: Dictionary = PEIXES.get(id, {})
	var ci := int(F.get("cor", 0xc8ccc4))
	var pecas: Array = [[]]
	ModelosBichos._jit = 0.05
	ModelosBichos._put(pecas, 0, ModelosBichos._elipse(0.035, 0.06, 0.15, 9, 6), Transform3D(), ci)
	ModelosBichos._put(pecas, 0, ModelosBichos._elipse(0.03, 0.035, 0.12, 8, 5), ModelosBichos._m(0, -0.022, 0.01), 0xe8e4d8)
	ModelosBichos._put(pecas, 0, ModelosBichos._caixa(0.006, 0.075, 0.06, 1.6, 1.0), ModelosBichos._m(0, 0, -0.17), ci)
	ModelosBichos._put(pecas, 0, ModelosBichos._caixa(0.005, 0.035, 0.06), ModelosBichos._m(0, 0.06, -0.01, 0.3, 0, 0), ci)
	for s in [1.0, -1.0]:
		ModelosBichos._put(pecas, 0, ModelosBichos._elipse(0.008, 0.008, 0.006, 5, 4), ModelosBichos._m(s * 0.026, 0.015, 0.11), 0x0a0a08, 0.0)
	var m := ModelosBichos._juntar(pecas[0])
	_malhas[id] = m
	return m


func _pulo(p: Vector3, id: String, k: float, saida: bool) -> void:
	var F: Dictionary = PEIXES.get(id, PEIXES.get("lambari", {}))
	var s := clampf(0.6 + k * 0.35, 0.5, 1.9) * float(F.get("tam", 1.0))
	var mi := MeshInstance3D.new()
	mi.mesh = _malha(id)
	mi.material_override = ModelosBichos._mat()
	mi.scale = Vector3.ONE * s
	add_child(mi)
	var j = main.jogador
	var dx: float = (j.global_position.x - p.x) * 0.6 if saida else randf_range(-0.7, 0.7)
	var dz: float = (j.global_position.z - p.z) * 0.6 if saida else randf_range(-0.7, 0.7)
	_pulos.append({"no": mi, "p": p, "t": 0.0, "dur": 0.5 if saida else 0.55 + randf() * 0.35, "h": 0.9 if saida else 0.35 + randf() * 0.45, "d": Vector2(dx, dz)})
	_anel(p)
	if p.distance_to(j.global_position) < 35.0:
		main.sons.tocar("nado", p, -6.0)


func _anel(p: Vector3) -> void:
	var mi := MeshInstance3D.new()
	var tm := TorusMesh.new()
	tm.inner_radius = 0.16
	tm.outer_radius = 0.2
	tm.rings = 24
	tm.ring_segments = 4
	mi.mesh = tm
	var m := StandardMaterial3D.new()
	m.albedo_color = Color(0.9, 0.95, 1.0, 0.55)
	m.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	m.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mi.material_override = m
	mi.scale = Vector3(1.0, 0.08, 1.0)
	add_child(mi)
	mi.global_position = p + Vector3(0, 0.02, 0)
	_aneis.append({"no": mi, "t": 0.0, "m": m})


func _passo_pulos(dt: float) -> void:
	for i in range(_aneis.size() - 1, -1, -1):
		var a: Dictionary = _aneis[i]
		a["t"] = float(a["t"]) + dt
		var t := float(a["t"])
		var no: Node3D = a["no"]
		no.scale = Vector3(1.0 + t * 4.0, 0.08, 1.0 + t * 4.0)
		(a["m"] as StandardMaterial3D).albedo_color.a = maxf(0.0, 0.55 * (1.0 - t / 1.2))
		if t >= 1.2:
			no.queue_free()
			_aneis.remove_at(i)
	for i in range(_pulos.size() - 1, -1, -1):
		var q: Dictionary = _pulos[i]
		q["t"] = float(q["t"]) + dt
		var u := float(q["t"]) / float(q["dur"])
		var no: Node3D = q["no"]
		if u >= 1.0:
			var dd: Vector2 = q["d"]
			_anel((q["p"] as Vector3) + Vector3(dd.x, 0, dd.y))
			no.queue_free()
			_pulos.remove_at(i)
			continue
		var p0: Vector3 = q["p"]
		var dv: Vector2 = q["d"]
		no.global_position = p0 + Vector3(dv.x * u, sin(u * PI) * float(q["h"]), dv.y * u)
		no.rotation = Vector3(-cos(u * PI) * 1.0, atan2(dv.x, dv.y), sin(float(q["t"]) * 20.0) * 0.25)
	# de vez em quando um peixe pula na água perto de você
	_pulo_t -= dt
	if _pulo_t > 0.0:
		return
	_pulo_t = 5.0 + randf() * 9.0
	var j = main.jogador
	if j == null or not j.vivo:
		return
	for k in 10:
		var a := randf() * TAU
		var d := 7.0 + randf() * 24.0
		var x: float = j.global_position.x + sin(a) * d
		var z: float = j.global_position.z + cos(a) * d
		var n: float = main.terreno.nivel_agua(x, z)
		if n < -900.0 or n - main.terreno.h(x, z) < 0.6:
			continue
		var id := sorteia(x, z)
		_pulo(Vector3(x, n, z), id, kg(id) * 0.7, false)
		break


func salvar() -> Dictionary:
	return {"registro": registro}


func carregar(d: Dictionary) -> void:
	parar()
	registro = {}
	var r = d.get("registro", {})
	if r is Dictionary:
		for k in r:
			if PEIXES.has(k) and r[k] is Dictionary:
				registro[k] = {"n": int(r[k].get("n", 0)), "max": float(r[k].get("max", 0.0))}
