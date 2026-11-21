class_name Perfis
extends RefCounted
## Quem joga neste computador (como no jogo antigo, versão 10): cada pessoa tem o seu perfil, só com o nome (sem senha),
## e nele ficam os mundos. Cada mundo é uma partida separada (o mapa é o mesmo; o dia, a base e as coisas são de cada
## um), salva no seu próprio arquivo. O jogo salvo das versões de antes (user://vaydr_mundo1.json) vira o "Mundo 1" do
## primeiro perfil, e continua de onde parou.

const ARQ := "user://perfis.json"
const ANTIGO := "user://vaydr_mundo1.json"
const PASTA := "user://mundos"
const MAX_PERFIS := 8
const MAX_MUNDOS := 10

static var dados := {}
static var atual := {}      # o perfil de quem está jogando


static func carregar() -> void:
	dados = {"v": 1, "ultimo": "", "lista": []}
	if FileAccess.file_exists(ARQ):
		var d = JSON.parse_string(FileAccess.get_file_as_string(ARQ))
		if d is Dictionary and d.get("lista") is Array:
			dados = d
	if (dados["lista"] as Array).is_empty() and FileAccess.file_exists(ANTIGO):
		var p := novo_perfil("Sobrevivente")
		var m := _mundo_obj("Mundo 1", ANTIGO)
		(p["mundos"] as Array).append(m)
		p["ultimo_mundo"] = m["id"]
		salvar()
	var ult := perfil(str(dados.get("ultimo", "")))
	if not ult.is_empty():
		atual = ult


static func salvar() -> void:
	var f := FileAccess.open(ARQ, FileAccess.WRITE)
	if f:
		f.store_string(JSON.stringify(dados, "\t"))
		f.close()


static func lista() -> Array:
	if dados.is_empty():
		carregar()
	return dados["lista"]


static func perfil(id: String) -> Dictionary:
	for p in lista():
		if str(p["id"]) == id:
			return p
	return {}


static func limpar_nome(t: String, n := 20) -> String:
	var s := t.strip_edges().replace("\n", " ").replace("\t", " ")
	while s.find("  ") >= 0:
		s = s.replace("  ", " ")
	return s.substr(0, n)


static func novo_perfil(nome: String) -> Dictionary:
	var p := {"id": _id("p"), "nome": limpar_nome(nome), "criado": _agora(), "usado": _agora(), "mundos": [], "ultimo_mundo": ""}
	lista().append(p)
	dados["ultimo"] = p["id"]
	atual = p
	salvar()
	return p


static func escolher(p: Dictionary) -> void:
	atual = p
	p["usado"] = _agora()
	dados["ultimo"] = p["id"]
	salvar()


static func renomear_perfil(p: Dictionary, nome: String) -> void:
	var n := limpar_nome(nome)
	if n != "":
		p["nome"] = n
		salvar()


## apaga o perfil e os mundos dele (os arquivos também)
static func apagar_perfil(p: Dictionary) -> void:
	for m in (p["mundos"] as Array).duplicate():
		_apagar_arquivo(str(m["arq"]))
	lista().erase(p)
	if str(dados.get("ultimo", "")) == str(p["id"]):
		dados["ultimo"] = ""
	if atual == p:
		atual = {}
	salvar()


static func _mundo_obj(nome: String, arq := "") -> Dictionary:
	var id := _id("m")
	return {"id": id, "nome": limpar_nome(nome, 24), "arq": arq if arq != "" else "%s/%s.json" % [PASTA, id],
		"criado": _agora(), "usado": _agora(), "dia": 1, "hora": 7.0, "tempo": 0.0}


static func novo_mundo(p: Dictionary, nome := "") -> Dictionary:
	DirAccess.make_dir_recursive_absolute(PASTA)
	var ms: Array = p["mundos"]
	var n := limpar_nome(nome, 24)
	if n == "":
		var k := ms.size() + 1
		while _tem_nome(ms, "Mundo %d" % k):
			k += 1
		n = "Mundo %d" % k
	var m := _mundo_obj(n)
	ms.append(m)
	p["ultimo_mundo"] = m["id"]
	salvar()
	return m


static func _tem_nome(ms: Array, n: String) -> bool:
	for m in ms:
		if str(m["nome"]) == n:
			return true
	return false


static func mundo(p: Dictionary, id: String) -> Dictionary:
	for m in p.get("mundos", []):
		if str(m["id"]) == id:
			return m
	return {}


static func renomear_mundo(p: Dictionary, m: Dictionary, nome: String) -> void:
	var n := limpar_nome(nome, 24)
	if n != "":
		m["nome"] = n
		salvar()


static func apagar_mundo(p: Dictionary, m: Dictionary) -> void:
	_apagar_arquivo(str(m["arq"]))
	(p["mundos"] as Array).erase(m)
	if str(p.get("ultimo_mundo", "")) == str(m["id"]):
		p["ultimo_mundo"] = ""
	salvar()


static func tem_jogo(m: Dictionary) -> bool:
	return FileAccess.file_exists(str(m.get("arq", "")))


## o jogo salvou: guarda o dia, a hora e o tempo jogado no mundo (aparecem na lista de mundos)
static func anotar(m: Dictionary, dia: int, hora: float, tempo: float) -> void:
	if m.is_empty():
		return
	m["dia"] = dia
	m["hora"] = hora
	m["tempo"] = tempo
	m["usado"] = _agora()
	if not atual.is_empty():
		atual["ultimo_mundo"] = m["id"]
	salvar()


static func _apagar_arquivo(arq: String) -> void:
	if arq != "" and FileAccess.file_exists(arq):
		DirAccess.remove_absolute(ProjectSettings.globalize_path(arq))


static func _id(prefixo: String) -> String:
	return "%s%x%04x" % [prefixo, int(Time.get_unix_time_from_system() * 1000.0), randi() % 65536]


static func _agora() -> float:
	return Time.get_unix_time_from_system()


## "agora há pouco", "há 3 horas", "ontem", "há 5 dias"
static func quando(t: float) -> String:
	var d := _agora() - t
	if d < 120.0:
		return "agora há pouco"
	if d < 3600.0:
		return "há %d minutos" % int(d / 60.0)
	if d < 7200.0:
		return "há 1 hora"
	if d < 86400.0:
		return "há %d horas" % int(d / 3600.0)
	if d < 172800.0:
		return "ontem"
	return "há %d dias" % int(d / 86400.0)


## tempo jogado: "35 min", "2 h 10 min"
static func duracao(seg: float) -> String:
	var m := int(seg / 60.0)
	if m < 60:
		return "%d min" % m
	return "%d h %02d min" % [m / 60, m % 60]
