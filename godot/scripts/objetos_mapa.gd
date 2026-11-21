class_name ObjetosMapa
extends Node3D
## Os objetos 3D do mapa do jogo antigo, cada um no lugar dele (dados/mapa/objetos3d.json):
## · os móveis de dentro das casas e dos prédios (camas, sofás, mesas, armários, geladeiras, prateleiras com caixas...);
## · os objetos da rua (postes, lixeiras, bancos, barreiras, hidrantes, carcaças de carro, ônibus, caminhão e ambulância,
##   sacos de lixo, pneus...) e do acampamento da clareira;
## · os lugares escaneados (galpão de trens, bunker, casa abandonada, prédios destruído e abandonado, ruína na mata,
##   carros destruídos, Base Militar com garagens, helicóptero, blindado, sacos de areia e barreiras, o posto da torre...).
## Os modelos (dados/mapa/malhas/modelos) são os do jogo antigo, com as texturas deles (assets/mapa). Cada modelo vai em
## lotes (MultiMesh) por pedaço de 64 m, e cada tipo some na distância que sumia lá: móveis de dentro a 40 m, tralha da rua a
## 40-60 m, postes e carros a 150 m, os lugares a 150-320 m.

const PASTA := "res://dados/mapa/"
const PEDACO := 64.0
var modelos := {}      # id -> [{mesh, mat}]
var grupos := []       # {mmi, ini, fim}
var n_objetos := 0
var _pend := {}


func montar() -> void:
	_modelos()
	var o: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(PASTA + "objetos3d.json"))
	for cat in ["interior", "rua", "mundo", "lugar"]:
		for q in o.get(cat, []):
			_objeto(cat, q)
	_fechar()


func _modelos() -> void:
	var indice: Array = JSON.parse_string(FileAccess.get_file_as_string(PASTA + "malhas/modelos.json"))
	var f := FileAccess.open(PASTA + "malhas/modelos.bin", FileAccess.READ)
	for r in indice:
		var m := MalhasMapa.ler_malha(f, r)
		var id: String = r["modelo"]
		var cor := Color(1, 1, 1)
		if r.has("cor"):
			cor = Color(float(r["cor"][0]), float(r["cor"][1]), float(r["cor"][2]))
		# os escaneados dos lugares não têm "lado de trás" confiável: desenha os dois lados (como no jogo antigo)
		var mat := MalhasMapa.material(str(r.get("tex", "")), bool(r.get("rep", false)), id.begins_with("L:"), cor, float(r.get("e", 0.0)), true)
		if not modelos.has(id):
			modelos[id] = []
		modelos[id].append({"mesh": m, "mat": mat})


func _objeto(cat: String, q: Dictionary) -> void:
	var partes: Array = modelos.get(str(q["m"]), [])
	if partes.is_empty():
		return
	var x: Array = q["xf"]
	var xf := Transform3D(Basis(Vector3(x[0], x[1], x[2]), Vector3(x[3], x[4], x[5]), Vector3(x[6], x[7], x[8])), Vector3(x[9], x[10], x[11]))
	var fim := 40.0
	var sombra := false
	var escuro := 0.0
	match cat:
		"interior":
			fim = 40.0
			escuro = float(q.get("k", 0.0))
		"lugar":
			fim = float(q.get("dist", 150.0))
			sombra = true
		_:
			var r := float(q.get("r", 0.6))
			var L := float(q.get("L", 0.0))
			fim = minf(L, 150.0) if L > 0.0 else (150.0 if r >= 1.0 else (90.0 if r >= 0.8 else 65.0))
			sombra = r >= 0.8
	var k := Vector2i(floori(xf.origin.x / PEDACO), floori(xf.origin.z / PEDACO))
	for i in partes.size():
		var id := "%s|%d|%s|%d|%d|%d" % [q["m"], i, cat, int(fim), k.x, k.y]
		if not _pend.has(id):
			_pend[id] = {"parte": partes[i], "xfs": [], "fim": fim, "sombra": sombra, "escuro": []}
		_pend[id]["xfs"].append(xf)
		_pend[id]["escuro"].append(escuro)
	n_objetos += 1


func _fechar() -> void:
	for id in _pend:
		var g: Dictionary = _pend[id]
		var mm := MultiMesh.new()
		mm.transform_format = MultiMesh.TRANSFORM_3D
		mm.use_custom_data = true
		mm.mesh = g["parte"]["mesh"]
		mm.instance_count = g["xfs"].size()
		for i in g["xfs"].size():
			mm.set_instance_transform(i, g["xfs"][i])
			# x: o quanto aquele móvel está "dentro" (o céu não ilumina), como as salas do prédio
			mm.set_instance_custom_data(i, Color(float(g["escuro"][i]), 0, 0, 0))
		var mmi := MultiMeshInstance3D.new()
		mmi.multimesh = mm
		mmi.material_override = g["parte"]["mat"]
		mmi.visibility_range_end = g["fim"]
		mmi.visibility_range_end_margin = 6.0
		mmi.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON if g["sombra"] else GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		add_child(mmi)
		grupos.append({"mmi": mmi, "fim": g["fim"]})
	_pend.clear()


## gráficos baixo/médio/alto: até onde os objetos aparecem
func alcance(k: float) -> void:
	for g in grupos:
		(g["mmi"] as MultiMeshInstance3D).visibility_range_end = float(g["fim"]) * k
