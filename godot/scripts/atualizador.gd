class_name AtualizadorJogo
extends Node
## A atualização automática (como a do .exe antigo, que usava as versões publicadas no GitHub): ao abrir, o jogo procura a
## versão nova do VAYDR no Godot (as versões "godot-vX.Y.Z" do repositório), baixa o .exe sozinho, sem parar o jogo, e troca o
## arquivo: na próxima vez que abrir já é a versão nova (ou "Reiniciar agora" no lobby e na pausa). Procura de novo a cada
## meia hora com o jogo aberto. Só no .exe do Windows; no editor e nos testes fica desligada (a da Steam vai ser montada sem
## ela, porque a Steam atualiza sozinha).
## A troca: o Windows deixa renomear o .exe aberto (o aberto vira "<nome>.velho" e o novo fica com o mesmo nome, os atalhos
## continuam valendo), mas às vezes o jogo está lendo o pacote de dentro dele e a troca não deixa; aí o novo fica do lado
## ("<nome>.novo") e, quando o jogo fecha, um ajudante do Windows (PowerShell) espera ele sair, põe o novo no lugar e, no
## "Reiniciar agora", abre de novo. Se nem assim der, na próxima vez que abrir o jogo tenta de novo uma vez.

signal mudou

const API := "https://api.github.com/repos/reizin33/vaydr/releases?per_page=30"
const PREFIXO := "godot-v"
const DE_NOVO := 1800.0     # com o jogo aberto, procura de novo a cada meia hora

var ligada := false
var estado := "desligada"   # desligada, procurando, em_dia, baixando, pronta, sem_internet, erro
var versao_nova := ""
var pct := 0.0
var erro := ""
var exe_novo := ""          # o .exe da versão nova (no lugar do antigo, ou o .novo do lado dele)
var trocou := false         # o .exe que abre já é o novo (na próxima vez que abrir, entra a versão nova)
var pendente := false       # o novo ficou do lado (.novo): entra quando o jogo fechar
var _ajudante_ok := false
var _req: HTTPRequest = null
var _baixa: HTTPRequest = null
var _url := ""
var _tam := 0
var _tmp := ""
var _t := 0.0
var _pct_avisado := -1


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	var args := OS.get_cmdline_user_args()
	var teste := false
	for a in args:
		if a.begins_with("--teste") or a.begins_with("--fotos"):
			teste = true
	ligada = OS.has_feature("template") and OS.get_name() == "Windows" and not teste
	if ligada:
		var exe := OS.get_executable_path()
		limpar(exe)
		if _novo_pendente_ao_abrir(exe):
			return
		procurar.call_deferred()


## ao abrir: ficou uma versão nova do lado (.novo) da vez passada (o ajudante não conseguiu trocar)? tenta de novo uma vez:
## o ajudante espera este jogo fechar, troca e abre a versão nova (com --atualizou, para não tentar de novo se falhar)
func _novo_pendente_ao_abrir(exe: String) -> bool:
	var novo := exe + ".novo"
	if not FileAccess.file_exists(novo):
		return false
	var args := OS.get_cmdline_args() + OS.get_cmdline_user_args()
	if "--atualizou" in args:
		DirAccess.remove_absolute(novo)
		return false
	exe_novo = novo
	pendente = true
	if _ajudante(exe, novo, true):
		get_tree().quit()
		return true
	DirAccess.remove_absolute(novo)
	pendente = false
	return false


func _process(dt: float) -> void:
	if not ligada:
		return
	if estado == "baixando" and _baixa != null:
		var tot := _baixa.get_body_size()
		if tot <= 0:
			tot = _tam
		if tot > 0:
			pct = clampf(100.0 * _baixa.get_downloaded_bytes() / float(tot), 0.0, 100.0)
			if int(pct) != _pct_avisado:
				_pct_avisado = int(pct)
				mudou.emit()
	_t += dt
	if _t >= DE_NOVO and estado in ["em_dia", "sem_internet", "erro"]:
		_t = 0.0
		procurar()


## o texto curto para o rodapé (lobby, carregamento e pausa)
func texto() -> String:
	match estado:
		"procurando":
			return "PROCURANDO VERSÃO NOVA…"
		"em_dia":
			return "ATUALIZADO"
		"baixando":
			return "BAIXANDO A %s · %d%%" % [versao_nova, int(pct)]
		"pronta":
			return "VERSÃO %s BAIXADA: ENTRA AO ABRIR DE NOVO" % versao_nova
		"sem_internet":
			return "SEM INTERNET PARA PROCURAR ATUALIZAÇÃO"
		"erro":
			return "NÃO DEU PARA ATUALIZAR AGORA"
	return ""


# ================================================================ procurar
func procurar() -> void:
	if _req != null or estado in ["baixando", "pronta"]:
		return
	estado = "procurando"
	erro = ""
	mudou.emit()
	_req = HTTPRequest.new()
	_req.timeout = 25.0
	add_child(_req)
	_req.request_completed.connect(_respondeu)
	var e := _req.request(API, _cabecalhos())
	if e != OK:
		_req.queue_free()
		_req = null
		estado = "erro"
		erro = "pedido não saiu (%d)" % e
		mudou.emit()


func _cabecalhos() -> PackedStringArray:
	return PackedStringArray(["Accept: application/vnd.github+json", "User-Agent: VAYDR-Godot/" + Telas.VERSAO])


func _respondeu(result: int, code: int, _h: PackedStringArray, body: PackedByteArray) -> void:
	if _req != null:
		_req.queue_free()
		_req = null
	if result != HTTPRequest.RESULT_SUCCESS:
		estado = "sem_internet"
		mudou.emit()
		return
	if code != 200:
		estado = "erro"
		erro = "o GitHub respondeu %d" % code
		mudou.emit()
		return
	var r := escolher(JSON.parse_string(body.get_string_from_utf8()), Telas.VERSAO)
	if r.is_empty():
		estado = "em_dia"
		mudou.emit()
		return
	versao_nova = str(r["versao"])
	_url = str(r["url"])
	_tam = int(r["tam"])
	_baixar()


## a versão publicada mais nova que a atual (com o .exe); vazio se a atual já é a mais nova
static func escolher(lista, atual: String) -> Dictionary:
	var melhor := {}
	if not (lista is Array):
		return melhor
	for r in lista:
		if not (r is Dictionary) or bool(r.get("draft", false)):
			continue
		var tag := str(r.get("tag_name", ""))
		if not tag.begins_with(PREFIXO):
			continue
		var v := tag.substr(PREFIXO.length())
		if not valida(v) or comparar(v, atual) <= 0:
			continue
		if not melhor.is_empty() and comparar(v, str(melhor["versao"])) <= 0:
			continue
		for a in r.get("assets", []):
			if a is Dictionary and str(a.get("name", "")).ends_with(".exe") and str(a.get("browser_download_url", "")).begins_with("https://github.com/"):
				melhor = {"versao": v, "url": str(a["browser_download_url"]), "tam": int(a.get("size", 0)), "nome": str(a["name"])}
				break
	return melhor


static func valida(v: String) -> bool:
	return RegEx.create_from_string("^\\d{1,4}\\.\\d{1,4}\\.\\d{1,4}$").search(v) != null


## a > b: 1; iguais: 0; a < b: -1 (versões x.y.z; uma versão que não é x.y.z conta como 0.0.0)
static func comparar(a: String, b: String) -> int:
	var pa := a.split(".") if valida(a) else PackedStringArray(["0", "0", "0"])
	var pb := b.split(".") if valida(b) else PackedStringArray(["0", "0", "0"])
	for i in 3:
		var x := int(pa[i])
		var y := int(pb[i])
		if x != y:
			return 1 if x > y else -1
	return 0


# ================================================================ baixar e trocar o .exe
func _baixar() -> void:
	var exe := OS.get_executable_path()
	var pasta := exe.get_base_dir()
	_tmp = pasta.path_join("VAYDR-Godot-%s.exe.baixando" % versao_nova)
	if not _pode_escrever(pasta):
		# a pasta do jogo não deixa escrever (Arquivos de Programas?): baixa nos dados do jogo e abre de lá
		_tmp = OS.get_user_data_dir().path_join("VAYDR-Godot-%s.exe.baixando" % versao_nova)
	if FileAccess.file_exists(_tmp):
		DirAccess.remove_absolute(_tmp)
	_baixa = HTTPRequest.new()
	_baixa.use_threads = true
	_baixa.download_file = _tmp
	_baixa.body_size_limit = -1
	_baixa.download_chunk_size = 1 << 20
	_baixa.timeout = 0.0
	add_child(_baixa)
	_baixa.request_completed.connect(_baixou)
	pct = 0.0
	_pct_avisado = -1
	var e := _baixa.request(_url, _cabecalhos())
	if e != OK:
		_baixa.queue_free()
		_baixa = null
		estado = "erro"
		erro = "o download não começou (%d)" % e
		mudou.emit()
		return
	estado = "baixando"
	mudou.emit()


func _pode_escrever(pasta: String) -> bool:
	var t := pasta.path_join(".vaydr_escreve")
	var f := FileAccess.open(t, FileAccess.WRITE)
	if f == null:
		return false
	f.close()
	DirAccess.remove_absolute(t)
	return true


func _baixou(result: int, code: int, _h: PackedStringArray, _b: PackedByteArray) -> void:
	if _baixa != null:
		_baixa.queue_free()
		_baixa = null
	var tam := 0
	if FileAccess.file_exists(_tmp):
		var f := FileAccess.open(_tmp, FileAccess.READ)
		if f != null:
			tam = f.get_length()
			f.close()
	if result != HTTPRequest.RESULT_SUCCESS or code != 200 or tam < 1000000 or (_tam > 0 and tam != _tam):
		if FileAccess.file_exists(_tmp):
			DirAccess.remove_absolute(_tmp)
		estado = "sem_internet" if result in [HTTPRequest.RESULT_CANT_CONNECT, HTTPRequest.RESULT_CANT_RESOLVE, HTTPRequest.RESULT_CONNECTION_ERROR, HTTPRequest.RESULT_TIMEOUT] else "erro"
		erro = "download incompleto (%d de %d bytes, resposta %d)" % [tam, _tam, code]
		mudou.emit()
		return
	var r := trocar(OS.get_executable_path(), _tmp, versao_nova)
	if not bool(r["ok"]):
		estado = "erro"
		erro = str(r["erro"])
		mudou.emit()
		return
	exe_novo = str(r["exe"])
	trocou = bool(r["trocou"])
	pendente = bool(r.get("pendente", false))
	estado = "pronta"
	mudou.emit()


## troca o .exe: o que está aberto vira "<nome>.velho" (o Windows deixa renomear o programa aberto, só não deixa apagar) e o
## baixado fica no lugar dele, com o mesmo nome (os atalhos continuam valendo). Sem poder renomear agora, o novo fica do lado
## ("<nome>.novo") e entra quando o jogo fechar (pendente). Baixado em outra pasta (a do jogo não deixa escrever), fica lá com o
## nome da versão. Devolve {ok, exe, trocou, pendente, erro}
static func trocar(exe: String, baixado: String, versao: String) -> Dictionary:
	var velho := exe + ".velho"
	if FileAccess.file_exists(velho):
		DirAccess.remove_absolute(velho)
	if exe.get_base_dir() == baixado.get_base_dir():
		if DirAccess.rename_absolute(exe, velho) == OK:
			if DirAccess.rename_absolute(baixado, exe) == OK:
				return {"ok": true, "exe": exe, "trocou": true, "pendente": false, "erro": ""}
			DirAccess.rename_absolute(velho, exe)
		var novo := exe + ".novo"
		if FileAccess.file_exists(novo):
			DirAccess.remove_absolute(novo)
		if DirAccess.rename_absolute(baixado, novo) == OK:
			return {"ok": true, "exe": novo, "trocou": false, "pendente": true, "erro": ""}
	# outra pasta: fica lá com o nome da versão (abre por "Reiniciar agora")
	var lado := baixado.get_base_dir().path_join("VAYDR-Godot-%s.exe" % versao)
	if FileAccess.file_exists(lado):
		DirAccess.remove_absolute(lado)
	if DirAccess.rename_absolute(baixado, lado) == OK:
		return {"ok": true, "exe": lado, "trocou": false, "pendente": false, "erro": ""}
	return {"ok": false, "exe": "", "trocou": false, "pendente": false, "erro": "não deu para gravar o .exe novo"}


## o ajudante (PowerShell, sem janela): espera este jogo fechar, põe o .novo no lugar do .exe (tenta por uns 20 s, o antivírus
## às vezes segura o arquivo novo um pouco) e, se "abrir", abre o jogo de novo com --atualizou
static func script_ajudante(pid: int, exe: String, novo: String, abrir: bool) -> String:
	var e := exe.replace("/", "\\").replace("'", "''")
	var n := novo.replace("/", "\\").replace("'", "''")
	var ps := "$p = %d; $exe = '%s'; $novo = '%s'; " % [pid, e, n]
	ps += "try { Wait-Process -Id $p -Timeout 180 -ErrorAction SilentlyContinue } catch {}; Start-Sleep -Milliseconds 500; "
	ps += "for ($i = 0; $i -lt 40; $i++) { try { Move-Item -LiteralPath $novo -Destination $exe -Force -ErrorAction Stop; break } catch { Start-Sleep -Milliseconds 500 } }; "
	if abrir:
		ps += "Start-Process -FilePath $exe -ArgumentList '--', '--atualizou'"
	return ps


func _ajudante(exe: String, novo: String, abrir: bool) -> bool:
	if _ajudante_ok or OS.get_name() != "Windows":
		return _ajudante_ok
	var ps := script_ajudante(OS.get_process_id(), exe, novo, abrir)
	var b64 := Marshalls.raw_to_base64(ps.to_utf16_buffer())
	var pid := OS.create_process("powershell.exe", ["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-ExecutionPolicy", "Bypass", "-EncodedCommand", b64])
	_ajudante_ok = pid > 0
	return _ajudante_ok


## o jogo está fechando com a versão nova do lado: o ajudante troca depois que ele sair
func _exit_tree() -> void:
	if ligada and pendente and estado == "pronta" and exe_novo != "":
		_ajudante(OS.get_executable_path(), exe_novo, false)


## ao abrir: apaga o .exe velho da troca e os downloads que pararam no meio (só os que este jogo criou)
static func limpar(exe: String) -> void:
	var velho := exe + ".velho"
	if FileAccess.file_exists(velho):
		DirAccess.remove_absolute(velho)
	for pasta in [exe.get_base_dir(), OS.get_user_data_dir()]:
		var d := DirAccess.open(pasta)
		if d == null:
			continue
		for f in d.get_files():
			if f.begins_with("VAYDR-Godot-") and f.ends_with(".exe.baixando"):
				DirAccess.remove_absolute(pasta.path_join(f))


## para o teste: pergunta ao GitHub qual a versão publicada mais nova que "atual" (sem baixar nada)
func consultar(atual: String) -> Dictionary:
	var rq := HTTPRequest.new()
	rq.timeout = 25.0
	add_child(rq)
	if rq.request(API, _cabecalhos()) != OK:
		rq.queue_free()
		return {"erro": "o pedido não saiu"}
	var r: Array = await rq.request_completed
	rq.queue_free()
	if int(r[0]) != HTTPRequest.RESULT_SUCCESS:
		return {"erro": "sem internet (%d)" % int(r[0])}
	if int(r[1]) != 200:
		return {"erro": "o GitHub respondeu %d" % int(r[1]), "codigo": int(r[1])}
	return escolher(JSON.parse_string((r[3] as PackedByteArray).get_string_from_utf8()), atual)


## "Reiniciar agora": salva o jogo, abre a versão nova e fecha esta
func reiniciar() -> void:
	if estado != "pronta" or exe_novo == "":
		return
	var main = get_tree().current_scene
	if main != null and main.has_method("salvar_jogo") and bool(main.get("em_jogo")) and main.jogador != null and main.jogador.vivo:
		main.salvar_jogo()
	if Rede.on:
		Rede.desligar(true)
	if pendente:
		# o ajudante espera este fechar, troca e abre o novo
		if not _ajudante(OS.get_executable_path(), exe_novo, true):
			return
		pendente = false
	else:
		OS.create_process(exe_novo, ["--", "--atualizou"])
	get_tree().quit()
