class_name ColisaoMapa
extends Node3D
## As paredes, móveis, cercas e pisos do mapa, com a mesma colisão do jogo antigo: caixas e cilindros (com faixa de altura
## quando têm), pisos planos ("ret"), lances de escada ("ram", rampa) e galhos/troncos andáveis ("seg"). Fica tudo em
## corpos estáticos de 64 m (um por pedaço do mapa) para a física não carregar milhares de corpos soltos.
## Colisor sem desenho no Godot (tools/exportar/colisao_marcar.py marca) não entra: nada de parede invisível. As exceções
## são a parede de mato da borda do mapa e as pedras da serra, que o Mundo desenha (listas "brenha" e "serra").

const PEDACO := 64.0
# colisores que outra parte já faz (árvore, pedra e tronco caído: o Mundo) ou que ainda não têm desenho no Godot
const PULAR := ["tree", "rock", "tronco", "lugar", "kit", "sub", "lugar,sub", "portaSub,sub", "gruta", "carro,veic"]
var terreno: Terreno
var corpos := {}      # chave do pedaço -> StaticBody3D
var n_formas := 0
var n_sem_desenho := 0
var brenha := []      # [x, z, raio]: a parede de mato da borda do mapa
var serra := []       # [x, z, raio]: pedras grandes da serra


func _init(t: Terreno) -> void:
	terreno = t


func montar() -> void:
	var c: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://dados/mapa/colisao.json"))
	for x in c["coll"]:
		var extra: String = str(x[9])
		if extra in PULAR or extra.find("sub") >= 0:
			continue
		if extra == "brenha":
			brenha.append([float(x[1]), float(x[2]), float(x[3])])
		elif extra == "rock,serraPedra":
			serra.append([float(x[1]), float(x[2]), float(x[3])])
		elif x.size() > 10 and int(x[10]) == 0:
			n_sem_desenho += 1
			continue
		var t := int(x[0])
		var px := float(x[1])
		var pz := float(x[2])
		var y0: float
		var y1: float
		if x[6] == null:
			var g := terreno.h(px, pz)
			y0 = g - 1.0
			y1 = g + 5.0
		else:
			y0 = float(x[6])
			y1 = float(x[7])
		if y1 - y0 < 0.02:
			continue
		var ym := (y0 + y1) * 0.5
		if t == 0:
			var cil := CylinderShape3D.new()
			cil.radius = maxf(0.05, float(x[3]))
			cil.height = y1 - y0
			_forma(cil, Transform3D(Basis(), Vector3(px, ym, pz)))
		else:
			var cx := BoxShape3D.new()
			cx.size = Vector3(maxf(0.04, float(x[3]) * 2.0), y1 - y0, maxf(0.04, float(x[4]) * 2.0))
			_forma(cx, Transform3D(Basis(Vector3.UP, float(x[5])), Vector3(px, ym, pz)))
	for s in c["sups"]:
		var tipo: String = s[0]
		if tipo == "ret":
			var cx2 := BoxShape3D.new()
			cx2.size = Vector3(float(s[3]) * 2.0, 0.24, float(s[4]) * 2.0)
			_forma(cx2, Transform3D(Basis(Vector3.UP, float(s[5])), Vector3(float(s[1]), float(s[6]) - 0.12, float(s[2]))))
		elif tipo == "ram":
			var hw := float(s[3])
			var hd := float(s[4])
			var ya := float(s[6])
			var yb := float(s[7])
			var ang := atan2(yb - ya, hd * 2.0)
			var comp := Vector2(hd * 2.0, yb - ya).length()
			var cx3 := BoxShape3D.new()
			cx3.size = Vector3(hw * 2.0, 0.2, comp)
			var b := Basis(Vector3.UP, float(s[5])) * Basis(Vector3.RIGHT, -ang)
			var centro := Vector3(float(s[1]), (ya + yb) * 0.5, float(s[2])) - b.y * 0.1
			_forma(cx3, Transform3D(b, centro))
	var o: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://dados/mapa/objetos.json"))
	for g in o.get("seg", []):
		var a := Vector3(float(g[0]), float(g[1]), float(g[2]))
		var bb := Vector3(float(g[3]), float(g[4]), float(g[5]))
		var r := (float(g[6]) + float(g[7])) * 0.5
		var dv := bb - a
		var L := dv.length()
		if L < 0.05 or r < 0.02:
			continue
		var cap := CylinderShape3D.new()
		cap.radius = r
		cap.height = L
		var eixo := dv / L
		var bs := Basis(Quaternion(Vector3.UP, eixo))
		_forma(cap, Transform3D(bs, (a + bb) * 0.5))


func _forma(sh: Shape3D, xf: Transform3D) -> void:
	var k := Vector2i(floori(xf.origin.x / PEDACO), floori(xf.origin.z / PEDACO))
	var corpo: StaticBody3D = corpos.get(k)
	if corpo == null:
		corpo = StaticBody3D.new()
		corpo.name = "Col_%d_%d" % [k.x, k.y]
		add_child(corpo)
		corpos[k] = corpo
	var cs := CollisionShape3D.new()
	cs.shape = sh
	cs.transform = xf
	corpo.add_child(cs)
	n_formas += 1
