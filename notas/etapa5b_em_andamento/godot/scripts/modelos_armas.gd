class_name ModelosArmas
## As armas que não têm modelo 3D do jogo antigo (espingarda, rifle com luneta, besta, arco, coquetel molotov, bomba caseira e
## isca), montadas com peças simples no espaço da mão das ferramentas (o mesmo da pistola: o cano para -y, o cabo para +z e
## o "em cima" da arma para -z), para a mão da primeira pessoa e para a mão do corpo.

const IDS := ["espingarda", "rifle", "besta", "arco", "molotov", "bombaCaseira", "isca"]

static var _mats := {}


static func tem(id: String) -> bool:
	return id in IDS


static func _mat(cor: Color, rug := 0.7, met := 0.0, brilho := 0.0) -> StandardMaterial3D:
	var k := "%s|%s|%s|%s" % [cor.to_html(), rug, met, brilho]
	if _mats.has(k):
		return _mats[k]
	var m := StandardMaterial3D.new()
	m.albedo_color = cor
	m.roughness = rug
	m.metallic = met
	if brilho > 0.0:
		m.emission_enabled = true
		m.emission = cor
		m.emission_energy_multiplier = brilho
	_mats[k] = m
	return m


## caixa do ponto a ao b (cantos opostos)
static func _caixa(pai: Node3D, a: Vector3, b: Vector3, mat: Material) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	var bm := BoxMesh.new()
	bm.size = (b - a).abs()
	mi.mesh = bm
	mi.material_override = mat
	mi.position = (a + b) * 0.5
	pai.add_child(mi)
	return mi


## cilindro ao longo de y, de y0 a y1, no ponto (x, z)
static func _tubo(pai: Node3D, x: float, z: float, y0: float, y1: float, r: float, mat: Material, lados := 10) -> MeshInstance3D:
	var mi := MeshInstance3D.new()
	var cm := CylinderMesh.new()
	cm.top_radius = r
	cm.bottom_radius = r
	cm.height = absf(y1 - y0)
	cm.radial_segments = lados
	cm.rings = 1
	mi.mesh = cm
	mi.material_override = mat
	mi.position = Vector3(x, (y0 + y1) * 0.5, z)
	pai.add_child(mi)
	return mi


static func criar(id: String) -> Node3D:
	var no := Node3D.new()
	no.name = id
	var aco := _mat(Color(0.13, 0.135, 0.14), 0.35, 0.75)
	var aco2 := _mat(Color(0.22, 0.22, 0.23), 0.45, 0.6)
	var madeira := _mat(Color(0.36, 0.22, 0.12), 0.65)
	var madeira2 := _mat(Color(0.27, 0.16, 0.08), 0.7)
	var preto := _mat(Color(0.06, 0.06, 0.065), 0.55, 0.2)
	match id:
		"espingarda":
			# espingarda de bomba: cano e tubo do carregador, a telha de madeira que corre, a coronha
			_tubo(no, 0, -0.045, -0.78, -0.1, 0.012, aco)
			_tubo(no, 0, -0.02, -0.66, -0.1, 0.011, aco2)
			_caixa(no, Vector3(-0.022, -0.5, -0.04), Vector3(0.022, -0.33, 0.0), madeira)
			_caixa(no, Vector3(-0.022, -0.12, -0.065), Vector3(0.022, 0.06, -0.005), aco2)
			_caixa(no, Vector3(-0.017, -0.02, -0.01), Vector3(0.017, 0.035, 0.085), madeira2)
			_caixa(no, Vector3(-0.02, 0.05, -0.06), Vector3(0.02, 0.36, 0.02), madeira)
			_caixa(no, Vector3(-0.022, 0.33, -0.07), Vector3(0.022, 0.37, 0.05), preto)
			_tubo(no, 0, -0.072, -0.76, -0.74, 0.004, aco2, 6)
		"rifle":
			# rifle de ferrolho com luneta
			_tubo(no, 0, -0.045, -0.86, -0.12, 0.01, aco)
			_caixa(no, Vector3(-0.02, -0.18, -0.065), Vector3(0.02, 0.07, -0.01), aco2)
			_caixa(no, Vector3(-0.024, -0.55, -0.045), Vector3(0.024, -0.12, 0.012), madeira)
			_caixa(no, Vector3(-0.017, -0.02, -0.01), Vector3(0.017, 0.035, 0.085), madeira2)
			_caixa(no, Vector3(-0.021, 0.06, -0.06), Vector3(0.021, 0.38, 0.03), madeira)
			_caixa(no, Vector3(-0.022, 0.35, -0.07), Vector3(0.022, 0.39, 0.06), preto)
			_caixa(no, Vector3(-0.012, -0.1, 0.0), Vector3(0.012, -0.03, 0.05), preto)
			# a luneta e os anéis
			_tubo(no, 0, -0.1, -0.26, 0.02, 0.016, preto)
			_tubo(no, 0, -0.1, -0.3, -0.24, 0.022, preto)
			_tubo(no, 0, -0.1, 0.0, 0.05, 0.02, preto)
			_caixa(no, Vector3(-0.008, -0.21, -0.088), Vector3(0.008, -0.19, -0.06), aco2)
			_caixa(no, Vector3(-0.008, -0.04, -0.088), Vector3(0.008, -0.02, -0.06), aco2)
			# o ferrolho
			var fe := _tubo(no, 0.03, -0.05, 0.0, 0.04, 0.006, aco2, 6)
			fe.rotation.z = PI / 2.0
		"besta":
			# a coronha, o arco atravessado na frente e a corda
			_caixa(no, Vector3(-0.022, -0.42, -0.05), Vector3(0.022, 0.3, -0.005), madeira)
			_caixa(no, Vector3(-0.017, -0.02, -0.01), Vector3(0.017, 0.035, 0.085), madeira2)
			_caixa(no, Vector3(-0.012, -0.4, -0.07), Vector3(0.012, 0.02, -0.05), aco2)
			var arco := Node3D.new()
			arco.position = Vector3(0, -0.4, -0.055)
			no.add_child(arco)
			for lado in [-1.0, 1.0]:
				var b := _caixa(arco, Vector3(0.0, -0.012, -0.01), Vector3(0.32 * lado, 0.012, 0.01), preto)
				b.rotation.z = -0.22 * lado
			_caixa(no, Vector3(-0.3, -0.31, -0.058), Vector3(0.3, -0.302, -0.054), _mat(Color(0.8, 0.78, 0.7), 0.9))
			_tubo(no, 0, -0.075, -0.36, -0.1, 0.005, aco2, 6)
		"arco":
			# o arco de caça em pé (os braços para cima e para baixo da mão) e a corda
			_caixa(no, Vector3(-0.016, -0.03, -0.06), Vector3(0.016, 0.03, 0.06), madeira2)
			for lado in [-1.0, 1.0]:
				var pe := Node3D.new()
				pe.position = Vector3(0, 0, 0.05 * lado)
				no.add_child(pe)
				var b := _caixa(pe, Vector3(-0.01, -0.012, 0.0), Vector3(0.01, 0.012, 0.6 * lado), madeira)
				b.rotation.x = -0.26 * lado
			_caixa(no, Vector3(-0.0015, 0.11, -0.66), Vector3(0.0015, 0.113, 0.66), _mat(Color(0.85, 0.83, 0.75), 0.9))
		"molotov":
			var vidro := StandardMaterial3D.new()
			vidro.albedo_color = Color(0.32, 0.42, 0.18, 0.8)
			vidro.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
			vidro.roughness = 0.12
			_tubo(no, 0, 0.0, -0.13, 0.04, 0.038, vidro)
			_tubo(no, 0, 0.0, -0.19, -0.13, 0.014, vidro)
			_caixa(no, Vector3(-0.02, -0.25, -0.02), Vector3(0.02, -0.18, 0.02), _mat(Color(0.75, 0.68, 0.55), 0.95))
			_caixa(no, Vector3(-0.012, -0.28, -0.012), Vector3(0.012, -0.25, 0.012), _mat(Color(1.0, 0.55, 0.15), 0.9, 0.0, 2.5))
		"bombaCaseira":
			_tubo(no, 0, 0.0, -0.11, 0.07, 0.033, aco2)
			_tubo(no, 0, 0.0, -0.13, -0.11, 0.04, aco)
			_tubo(no, 0, 0.0, 0.07, 0.09, 0.04, aco)
			_caixa(no, Vector3(-0.004, -0.19, -0.004), Vector3(0.004, -0.13, 0.004), _mat(Color(0.55, 0.45, 0.3), 0.9))
			_caixa(no, Vector3(-0.034, -0.04, -0.034), Vector3(0.034, 0.0, 0.034), _mat(Color(0.5, 0.42, 0.2), 0.9))
		"isca":
			_caixa(no, Vector3(-0.035, -0.06, -0.025), Vector3(0.035, 0.06, 0.025), _mat(Color(0.72, 0.58, 0.12), 0.6))
			_caixa(no, Vector3(-0.01, -0.07, -0.03), Vector3(0.01, -0.05, -0.02), _mat(Color(1.0, 0.15, 0.1), 0.5, 0.0, 3.0))
			_tubo(no, 0.02, -0.01, -0.12, -0.06, 0.003, preto, 6)
	for mi in no.find_children("*", "MeshInstance3D", true, false):
		(mi as MeshInstance3D).cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_ON
	return no
