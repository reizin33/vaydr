class_name RedeLan
extends Node
## A partida em rede local (LAN), como a do jogo antigo (63_lan.js e desktop/lan.js, v10.4 a v10.7): um abre a partida e os
## amigos entram com o IP dele, na mesma rede ou pelo Radmin VPN (ou escolhem na lista das partidas achadas na rede). O que é
## de todos:
## · todo mundo se vê: cada um com o personagem que criou e a roupa que está vestindo, o nome em cima, a lanterna acesa e as
##   animações do sobrevivente (andando, correndo, agachado, pulando, golpeando, comendo);
## · a hora do dia é a de quem abriu;
## · os zumbis são os mesmos para todos: o jogo de quem abriu decide (nascem perto de qualquer um, caçam quem estiver mais
##   perto e batem em quem estiver do lado); nos convidados eles são bonecos que repetem o que chega, e o golpe de qualquer um
##   (e as armadilhas da base dele) vai para quem abriu, que aplica. Quem mata leva o que o zumbi deixa. A base de cada um
##   segura os zumbis no mundo dele: o zumbi fica batendo na parede em vez de morder;
## · bate-papo: Enter abre a caixa de texto; /ir vai até quem abriu (ou até alguém pelo nome).
## O que ainda é de cada um: a mochila, a base, os baús, as portas, o que foi colhido e revistado, e o dia (cada mundo salva
## normal). Com amigos na partida, a pausa, o mapa e a mochila não param o mundo.
## Rede: ENet (UDP) na porta 47811 para o jogo; TCP na mesma porta só para quem vai entrar saber antes se a partida está aberta
## e se a versão é a mesma (o motivo certo quando não dá); UDP 47812 para achar as partidas da rede sem digitar o IP.
## Mensagens: oi, bemvindo, recusa, lista (quem está), eu (10 por segundo: onde está e o que faz), visual (o personagem e a
## roupa), mundo (de quem abriu: a hora e os zumbis perto de alguém), dano (o zumbi bateu num convidado), hitZ e efeitoZ (o
## golpe ou a armadilha de um convidado num zumbi), matouZ (o saque vai para quem matou), chat.

const PORTA := 47811
const PORTA_ACHAR := 47812
const MAX_JOGADORES := 8
const REGRA_FW := "VAYDR (partida em rede)"
const ALCANCE_MUNDO := 150.0   # os zumbis que vão para os convidados: os que estão a até 150 m de alguém

signal mudou                   # a tela do Multiplayer e o HUD se atualizam
signal falou                   # chegou mensagem no bate-papo
signal controle(de: int, txt: String)   # os sinais dos testes da nuvem (os dois jogos combinam o que fazer; o jogo não usa)

var main = null                # o jogo (main.gd) da cena de agora
var on := false                # dentro de uma partida (aberta, ou recebeu o bem-vindo)
var papel := ""                # "anfitriao" ou "convidado" ("" fora de partida)
var meu_id := 0
var nome := ""
var status := ""
var erro := ""
var ips: Array = []
var host_nome := ""
var jog := {}                  # os outros da partida: id -> {"id", "nome", "anf"}
var bonecos := {}              # id -> Remoto (na cena do jogo)
var visuais := {}              # id -> [ap, roupa] (para montar o boneco de novo depois de trocar de mundo)
var chat: Array = []           # {"nome", "txt", "t"} ("nome" vazio: aviso da partida)
var achados := {}              # partidas achadas na rede: chave -> {"nome", "ip", "porta", "n", "max", "versao", "t"}
var procurando := false        # a tela do Multiplayer está aberta: procura as partidas da rede
var fw := ""                   # Firewall do Windows: "", "ok", "pedindo", "falta"
var digitando := false         # a caixa do bate-papo está aberta
var versao := ""               # a versão que este jogo diz ter (os testes trocam para ver a recusa)
var info := {"enviados": 0, "recebidos": 0, "hits": 0, "danos": 0, "mortes": 0, "efeitos": 0, "recusas": 0}

var _peer: ENetMultiplayerPeer = null
var _tcp: TCPServer = null
var _tcp_cons: Array = []
var _udp_anf: PacketPeerUDP = null    # quem abriu: responde a quem procura partida
var _udp_proc: PacketPeerUDP = null   # quem procura (na tela do Multiplayer)
var _proc_t := 0.0
var _rede_t := 0.0
var _visual_t := 0.0
var _visual_k := ""
var _mundo_t := 0.0
var _espera := {}                     # conectou e ainda não disse oi: id -> quando
var _conectando := false
var _tentativa := 0
var _token := ""
var _hits := {}                       # golpes nos zumbis de quem abriu, juntos até mandar: uid -> [dano, de]
var _efeitos := {}                    # armadilhas: uid -> {tipo: segundos}
var _uid := 0
var _chat_fechou := -1                # o quadro em que a caixa do bate-papo fechou (o Esc e o Enter dela não valem para o jogo)
var _msg_falha := ""                  # o motivo para mostrar se a conexão do jogo não acontecer


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	versao = Telas.VERSAO
	_token = "%x%x" % [randi(), Time.get_ticks_usec()]
	multiplayer.peer_connected.connect(_conectou)
	multiplayer.peer_disconnected.connect(_desconectou)
	multiplayer.connected_to_server.connect(_ao_servidor)
	multiplayer.connection_failed.connect(_falhou)
	multiplayer.server_disconnected.connect(_caiu)


## o jogo da cena de agora (cada vez que o mundo é montado de novo, a cena é outra)
func ligar(m) -> void:
	main = m
	bonecos.clear()


func soltar(m) -> void:
	if main == m:
		main = null
		bonecos.clear()


func anfitriao() -> bool:
	return on and papel == "anfitriao"


func convidado() -> bool:
	return papel == "convidado"


## tem mais alguém na partida (aí o mundo não para na pausa, no mapa e na mochila)
func em_partida() -> bool:
	return on and not jog.is_empty()


## o número de cada zumbi (o mesmo nos dois jogos; continua contando quando o mundo é montado de novo)
func novo_uid() -> int:
	_uid += 1
	return _uid


func nome_jogo() -> String:
	if nome.strip_edges() == "":
		nome = _nome_limpo(str(Ajustes.v.get("lan_nome", "")))
	if nome == "" or nome == "Jogador":
		var pn := _nome_limpo(str(Perfis.atual.get("nome", "")))
		if pn != "" and pn != "Jogador":
			nome = pn
	return nome if nome != "" else "Jogador"


static func _nome_limpo(t: String) -> String:
	var s := t.replace("<", "").replace(">", "").replace("[", "(").replace("]", ")").strip_edges()
	while s.contains("  "):
		s = s.replace("  ", " ")
	return s.left(20) if s != "" else "Jogador"


func _jogador():
	if main == null or not is_instance_valid(main) or not main.pronto or not main.em_jogo or main.jogador == null:
		return null
	return main.jogador


# ======================================================================== abrir, entrar e sair
## abrir a partida: este jogo vira o servidor (o mundo dele é o da partida)
func hospedar() -> void:
	if on or _conectando:
		return
	desligar(true)
	erro = ""
	nome = nome_jogo()
	_conectando = true   # (os botões ficam parados enquanto abre)
	# Windows: a regra do Firewall (sem ela os amigos ficam em "procurando"); pede o administrador só na primeira vez
	if OS.get_name() == "Windows" and not _fw_existe():
		await liberar(true)
	elif OS.get_name() == "Windows":
		fw = "ok"
	status = "Abrindo a partida…"
	mudou.emit()
	var p := ENetMultiplayerPeer.new()
	var e := p.create_server(PORTA, MAX_JOGADORES - 1)
	_conectando = false
	if e != OK:
		status = ""
		erro = "Não deu para abrir a partida: a porta %d já está em uso (outro VAYDR aberto neste computador?)." % PORTA
		mudou.emit()
		return
	_peer = p
	multiplayer.multiplayer_peer = p
	on = true
	papel = "anfitriao"
	meu_id = 1
	host_nome = nome
	jog.clear()
	_tcp = TCPServer.new()
	if _tcp.listen(PORTA) != OK:
		_tcp = null
	_udp_anf = PacketPeerUDP.new()
	if _udp_anf.bind(PORTA_ACHAR) != OK:
		_udp_anf = null
	ips = ips_locais()
	status = "Partida aberta"
	_som()
	mudou.emit()


## entrar na partida de um amigo pelo IP (ou nome do computador), com ou sem a porta
func entrar(txt: String) -> void:
	if on or _conectando:
		return
	txt = txt.strip_edges().trim_prefix("ws://").trim_prefix("http://")
	if txt.contains("/"):
		txt = txt.split("/")[0]
	var m := RegEx.create_from_string("^([A-Za-z0-9_.-]{1,253})(?::(\\d{2,5}))?$").search(txt)
	if m == null:
		erro = "Digite o IP que aparece na tela de quem abriu a partida (por exemplo 192.168.0.12)."
		status = ""
		mudou.emit()
		return
	var ip := m.get_string(1)
	var porta := int(m.get_string(2)) if m.get_string(2) != "" else PORTA
	if porta < 1 or porta > 65535:
		porta = PORTA
	Ajustes.mudar("lan_ip", txt)
	desligar(true)
	nome = nome_jogo()
	erro = ""
	_conectando = true
	_tentativa += 1
	var tent := _tentativa
	status = "Procurando a partida em %s…" % ip
	mudou.emit()
	# antes do jogo, a pergunta pelo TCP: a partida está aberta? a versão é a mesma? (dá o motivo certo quando não dá)
	var r: Dictionary = await _sondar(ip, porta)
	if tent != _tentativa:
		return
	if not r["ok"] and str(r["codigo"]) != "SEM_RESPOSTA":
		_conectando = false
		status = ""
		erro = _motivo(str(r["codigo"]), ip, r.get("info", {}))
		mudou.emit()
		return
	var sem_tcp := not r["ok"]
	status = "Conectando…" if not sem_tcp else "Procurando a partida em %s…" % ip
	mudou.emit()
	var p := ENetMultiplayerPeer.new()
	if p.create_client(ip, porta) != OK:
		_conectando = false
		status = ""
		erro = _motivo("ENDERECO", ip, {})
		mudou.emit()
		return
	_msg_falha = _motivo("SEM_RESPOSTA", ip, {})
	_peer = p
	multiplayer.multiplayer_peer = p
	papel = "convidado"
	# sem resposta em 12 s (8 s quando nem o TCP respondeu): desiste com o motivo
	await get_tree().create_timer(8.0 if sem_tcp else 12.0, true).timeout
	if tent == _tentativa and _conectando and not on:
		var msg := _motivo("SEM_RESPOSTA", ip, {})
		desligar(true)
		erro = msg
		status = ""
		mudou.emit()


## entra na partida com a versão dita (só para o teste: a recusa de versão diferente pelo próprio jogo, sem a pergunta do TCP)
func entrar_direto(ip: String, porta := PORTA) -> void:
	desligar(true)
	nome = nome_jogo()
	_conectando = true
	_tentativa += 1
	_msg_falha = ""
	var p := ENetMultiplayerPeer.new()
	if p.create_client(ip, porta) != OK:
		_conectando = false
		return
	_peer = p
	multiplayer.multiplayer_peer = p
	papel = "convidado"
	status = "Conectando…"
	mudou.emit()


func _motivo(c: String, ip: String, inf: Dictionary) -> String:
	match c:
		"RECUSOU":
			return "O computador %s respondeu, mas a partida não está aberta nele. Peça para quem vai receber clicar em \"Abrir a partida\" e tente de novo." % ip
		"SEM_RESPOSTA":
			return "Nenhuma resposta de %s. O mais comum é o Firewall do Windows de quem abriu a partida: lá, em Jogar junto, clique em \"Liberar no Firewall\" e depois em Sim no aviso do Windows. Confira também o IP e se vocês estão na mesma rede (ou os dois no Radmin VPN)." % ip
		"ENDERECO":
			return "Esse endereço não existe. Digite o IP que aparece na tela de quem abriu (por exemplo 192.168.0.12)."
		"VERSAO":
			return "Versões diferentes: %s está na %s e você na %s. Atualizem os dois para a mesma versão." % [_nome_limpo(str(inf.get("nome", "quem abriu"))), str(inf.get("vaydr", "?")).left(20), versao]
		"CHEIA":
			return "A partida está cheia (%d jogadores)." % MAX_JOGADORES
		"OUTRO":
			return "Em %s tem outro programa na porta %d, não uma partida do VAYDR. Confira o IP." % [ip, PORTA]
	return "Não deu para chegar em %s (%s). Confira o IP e se vocês estão na mesma rede." % [ip, c]


## a pergunta pelo TCP (o mesmo número de porta): quem abriu responde uma linha com a versão, o nome e quantos estão jogando
func _sondar(ip: String, porta: int) -> Dictionary:
	var s := StreamPeerTCP.new()
	if s.connect_to_host(ip, porta) != OK:
		return {"ok": false, "codigo": "ENDERECO"}
	var t0 := Time.get_ticks_msec()
	var buf := PackedByteArray()
	while true:
		await get_tree().process_frame
		s.poll()
		var st := s.get_status()
		var t := Time.get_ticks_msec() - t0
		if st == StreamPeerTCP.STATUS_CONNECTED:
			var n := s.get_available_bytes()
			if n > 0:
				var r: Array = s.get_partial_data(n)
				if int(r[0]) == OK:
					buf.append_array(r[1])
				var txt := buf.get_string_from_utf8()
				if txt.contains("\n") or buf.size() > 4096:
					s.disconnect_from_host()
					var d = JSON.parse_string(txt.split("\n")[0])
					if not (d is Dictionary) or not d.has("vaydr"):
						return {"ok": false, "codigo": "OUTRO"}
					if str(d["vaydr"]) != versao:
						return {"ok": false, "codigo": "VERSAO", "info": d}
					if int(d.get("n", 0)) >= int(d.get("max", MAX_JOGADORES)):
						return {"ok": false, "codigo": "CHEIA", "info": d}
					return {"ok": true, "info": d}
			elif t > 4000:
				s.disconnect_from_host()
				return {"ok": false, "codigo": "OUTRO"}
		elif st == StreamPeerTCP.STATUS_ERROR or st == StreamPeerTCP.STATUS_NONE:
			return {"ok": false, "codigo": "RECUSOU" if t < 3000 else "SEM_RESPOSTA"}
		if t > 6000:
			s.disconnect_from_host()
			return {"ok": false, "codigo": "SEM_RESPOSTA"}
	return {"ok": false, "codigo": "SEM_RESPOSTA"}


## sai da partida (quieto: sem mexer no texto de estado)
func desligar(quieto := false) -> void:
	_tentativa += 1   # cancela uma conexão em andamento
	var era_on := on
	# primeiro os estados (fechar a conexão avisa "caiu" na hora, e o aviso não pode achar a partida ainda ligada)
	on = false
	papel = ""
	meu_id = 0
	host_nome = ""
	_conectando = false
	var p := _peer
	_peer = null
	if p != null:
		p.close()
	multiplayer.multiplayer_peer = null
	if _tcp != null:
		_tcp.stop()
		_tcp = null
	for e in _tcp_cons:
		(e["c"] as StreamPeerTCP).disconnect_from_host()
	_tcp_cons.clear()
	if _udp_anf != null:
		_udp_anf.close()
		_udp_anf = null
	jog.clear()
	visuais.clear()
	_espera.clear()
	_hits.clear()
	_efeitos.clear()
	for b in bonecos.values():
		if is_instance_valid(b):
			b.queue_free()
	bonecos.clear()
	if digitando:
		digitando = false
		_chat_fechou = Engine.get_process_frames()
	if era_on and main != null and is_instance_valid(main) and main.pronto:
		main.rede_desligou()
	if not quieto:
		status = ""
		erro = ""
	mudou.emit()


func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_CLOSE_REQUEST and (on or _conectando):
		desligar(true)


func _exit_tree() -> void:
	if _peer != null:
		_peer.close()


# ======================================================================== conexões
func _conectou(id: int) -> void:
	if papel == "anfitriao":
		_espera[id] = Time.get_ticks_msec()


func _desconectou(id: int) -> void:
	_espera.erase(id)
	if papel != "anfitriao" or not jog.has(id):
		return
	var nm := str(jog[id]["nome"])
	jog.erase(id)
	visuais.erase(id)
	_tirar_boneco(id)
	_mandar_lista()
	_sistema("%s saiu." % nm)
	mudou.emit()


func _ao_servidor() -> void:
	if papel == "convidado":
		_oi.rpc_id(1, nome_jogo(), versao)


func _falhou() -> void:
	if papel != "convidado" or on:
		return
	var msg := _msg_falha if _msg_falha != "" else "Não deu para conectar na partida. Confira o IP e se vocês estão na mesma rede (ou os dois no Radmin VPN)."
	desligar(true)
	erro = msg
	status = ""
	mudou.emit()


func _caiu() -> void:
	if papel != "convidado":
		return
	var era := on
	var hn := host_nome
	desligar(true)
	if era:
		status = ""
		erro = ""
		var txt := "%s fechou a partida. Seu mundo segue sozinho." % (hn if hn != "" else "Quem abriu")
		_sistema(txt)
		if main != null and is_instance_valid(main) and main.ui != null:
			main.ui.aviso(txt, 6.0)
	else:
		status = ""
		erro = "A partida fechou a conexão."
	mudou.emit()


func _tirar(id: int) -> void:
	# a recusa chega antes de cortar (a saída espera o que já foi mandado)
	await get_tree().create_timer(0.4, true).timeout
	if _peer != null and papel == "anfitriao":
		_peer.disconnect_peer(id)


# ======================================================================== o que chega
@rpc("any_peer", "call_remote", "reliable")
func _oi(n: String, v: String) -> void:
	if papel != "anfitriao":
		return
	var de := multiplayer.get_remote_sender_id()
	if jog.has(de):
		return
	_espera.erase(de)
	if str(v) != versao:
		info["recusas"] += 1
		_recusa.rpc_id(de, "Versões diferentes: %s está na %s e você na %s. Atualizem os dois para a mesma versão." % [nome, versao, str(v).left(20)])
		_tirar(de)
		return
	if jog.size() + 1 >= MAX_JOGADORES:
		info["recusas"] += 1
		_recusa.rpc_id(de, "A partida está cheia (%d jogadores)." % MAX_JOGADORES)
		_tirar(de)
		return
	var nm := _nome_limpo(n)
	var usados := [nome]
	for q in jog.values():
		usados.append(q["nome"])
	var base := nm
	var k := 2
	while nm in usados:
		nm = "%s %d" % [base.left(17), k]
		k += 1
	jog[de] = {"id": de, "nome": nm, "anf": false}
	_bemvindo.rpc_id(de, de, nome)
	_mandar_lista()
	_sistema("%s entrou na partida." % nm)
	_visual_t = 0.0
	_som()
	mudou.emit()


@rpc("authority", "call_remote", "reliable")
func _recusa(motivo: String) -> void:
	if papel != "convidado":
		return
	var msg := str(motivo).left(300)
	desligar(true)
	erro = msg
	status = ""
	mudou.emit()


@rpc("authority", "call_remote", "reliable")
func _bemvindo(id: int, anf_nome: String) -> void:
	if papel != "convidado":
		return
	on = true
	_conectando = false
	meu_id = id
	host_nome = _nome_limpo(anf_nome)
	status = "Conectado"
	erro = ""
	_visual_t = 0.0
	_sistema("Você entrou na partida de %s." % host_nome)
	if main != null and is_instance_valid(main) and main.pronto:
		main.rede_entrou()
	_som()
	mudou.emit()


@rpc("authority", "call_remote", "reliable")
func _lista(L: Array) -> void:
	if papel != "convidado":
		return
	var vistos := {}
	var primeira := jog.is_empty()
	for e in L:
		if not (e is Array) or (e as Array).size() < 3:
			continue
		var id := int(e[0])
		if id == meu_id or id <= 0:
			continue
		vistos[id] = true
		var nm := _nome_limpo(str(e[1]))
		var anf := bool(e[2])
		if not jog.has(id):
			jog[id] = {"id": id, "nome": nm, "anf": anf}
			if not (primeira and anf):
				_sistema("%s entrou na partida." % nm)
		jog[id]["nome"] = nm
		jog[id]["anf"] = anf
		if anf:
			host_nome = nm
		var b = bonecos.get(id)
		if b != null and is_instance_valid(b):
			b.renomear(nm, anf)
	for id in jog.keys():
		if not vistos.has(id):
			_sistema("%s saiu." % jog[id]["nome"])
			_tirar_boneco(id)
			jog.erase(id)
			visuais.erase(id)
	_visual_t = 0.0
	mudou.emit()


func _mandar_lista() -> void:
	if papel != "anfitriao":
		return
	var L := [[1, nome, true]]
	for id in jog:
		L.append([id, jog[id]["nome"], false])
	_lista.rpc(L)


## onde cada um está e o que está fazendo (10 vezes por segundo; vazio: está no lobby, fora de um mundo)
@rpc("any_peer", "call_remote", "unreliable_ordered", 1)
func _eu(d: PackedFloat32Array, item: String) -> void:
	var de := multiplayer.get_remote_sender_id()
	if not jog.has(de):
		return
	info["recebidos"] += 1
	for x in d:
		if is_nan(x) or is_inf(x):
			return
	var b = _boneco(de)
	if b != null:
		b.estado(d, str(item).left(40))


## o personagem que a pessoa criou e a roupa que está vestindo (quando muda e de 5 em 5 s)
@rpc("any_peer", "call_remote", "reliable")
func _visual(ap: Dictionary, roupa: Dictionary) -> void:
	var de := multiplayer.get_remote_sender_id()
	if not jog.has(de):
		return
	var r := {}
	for lugar in roupa:
		var id := str(roupa[lugar]).left(40)
		if Dados.item(id).is_empty():
			continue
		r[str(lugar).left(20)] = id
	visuais[de] = [Corpo.limpa(ap), r]
	var b = _boneco(de)
	if b != null:
		b.visual(visuais[de][0], r)


## de quem abriu: a hora e os zumbis perto de alguém (h < 0: quem abriu está no lobby, sem mundo)
@rpc("authority", "call_remote", "unreliable_ordered", 2)
func _mundo(h: float, L: PackedFloat32Array) -> void:
	if papel != "convidado" or not on:
		return
	if main == null or not is_instance_valid(main) or not main.pronto or not main.em_jogo:
		return
	main.mundo_rede(h, L)


## o zumbi de quem abriu bateu em você
@rpc("authority", "call_remote", "reliable")
func _dano(d: float, de: Vector3) -> void:
	if papel != "convidado":
		return
	var j = _jogador()
	if j == null or not j.vivo:
		return
	info["danos"] += 1
	main.dano_rede(clampf(d, 0.0, 100.0), de)


## o golpe de um convidado num zumbi (quem abriu aplica)
@rpc("any_peer", "call_remote", "reliable")
func _hit_z(uid: int, d: float, de: Vector3) -> void:
	if papel != "anfitriao" or main == null or not is_instance_valid(main):
		return
	var quem := multiplayer.get_remote_sender_id()
	if not jog.has(quem):
		return
	info["hits"] += 1
	main.hit_rede(uid, clampf(d, 0.0, 500.0), de, quem)


## a armadilha da base de um convidado prendeu ou atrasou o zumbi (0: atrasa, 1: prende)
@rpc("any_peer", "call_remote", "reliable")
func _efeito_z(uid: int, tipo: int, t: float) -> void:
	if papel != "anfitriao" or main == null or not is_instance_valid(main):
		return
	if not jog.has(multiplayer.get_remote_sender_id()):
		return
	info["efeitos"] += 1
	main.efeito_rede(uid, tipo, clampf(t, 0.0, 10.0))


## o zumbi que você matou caiu: o que ele deixa vai para o seu mundo
@rpc("authority", "call_remote", "reliable")
func _matou_z(p: Vector3) -> void:
	if papel != "convidado" or main == null or not is_instance_valid(main) or not main.em_jogo:
		return
	info["mortes"] += 1
	main.zumbi_morreu_rede(p)


## os testes da nuvem: um jogo avisa o outro do que fazer (abrir, vir para tal lugar, golpear...)
func mandar_controle(txt: String) -> void:
	if on and _peer != null:
		_controle.rpc(txt)


@rpc("any_peer", "call_remote", "reliable")
func _controle(txt: String) -> void:
	controle.emit(multiplayer.get_remote_sender_id(), str(txt).left(300))


@rpc("any_peer", "call_remote", "reliable")
func _chat(txt: String) -> void:
	var de := multiplayer.get_remote_sender_id()
	if not jog.has(de):
		return
	_falou(str(jog[de]["nome"]), str(txt).strip_edges().left(160))
	_som()


# ======================================================================== o que este jogo manda
func _process(dt: float) -> void:
	_procurar(dt)
	if _udp_anf != null:
		_responder_procura()
	if _tcp != null:
		_servir_sonda()
	if not on:
		return
	# quem conectou e não disse oi em 10 s sai
	if papel == "anfitriao" and not _espera.is_empty():
		var agora := Time.get_ticks_msec()
		for id in _espera.keys():
			if agora - int(_espera[id]) > 10000:
				_espera.erase(id)
				if _peer != null:
					_peer.disconnect_peer(id)
	_rede_t -= dt
	if _rede_t > 0.0:
		return
	_rede_t = 0.1
	if jog.is_empty():
		return
	var j = _jogador()
	_mandar_eu(j)
	if j != null:
		_mandar_visual(j)
	if papel == "anfitriao":
		_mundo_t -= 0.1
		if j != null or _mundo_t <= 0.0:
			_mundo_t = 1.0
			_mandar_mundo(j)
	else:
		_mandar_golpes()


func _mandar_eu(j) -> void:
	info["enviados"] += 1
	if j == null:
		_eu.rpc(PackedFloat32Array(), "")
		return
	var p: Vector3 = j.global_position
	var v: Vector3 = j.velocity
	var fl := (1 if j.vivo else 0) | (2 if j.agachado else 0) | (4 if j._corre else 0) | (8 if j.is_on_floor() else 0) \
		| (16 if j.vida < 28.0 else 0) | (32 if j.luz_mao.visible else 0)
	var d := PackedFloat32Array([p.x, p.y, p.z, v.x, v.y, v.z, j.corpo.yaw, j.cabeca.rotation.x, fl, j.golpe_n, j.golpe_dur, j.uso_n, j.energia])
	_eu.rpc(d, str(j.item_mao().get("id", "")))


func _mandar_visual(j) -> void:
	_visual_t -= 0.1
	var ap := Corpo.limpa(Perfis.atual.get("ap", {}))
	var roupa := {}
	for lugar in j.inv.roupa:
		var s = j.inv.roupa[lugar]
		if s is Dictionary and s.has("id"):
			roupa[str(lugar)] = str(s["id"])
	var k := JSON.stringify([ap, roupa])
	if k == _visual_k and _visual_t > 0.0:
		return
	_visual_k = k
	_visual_t = 5.0
	_visual.rpc(ap, roupa)


func _mandar_mundo(j) -> void:
	if j == null:
		_mundo.rpc(-1.0, PackedFloat32Array())
		return
	var perto: Array = [j.global_position]
	for b in bonecos.values():
		if is_instance_valid(b) and b.no_mundo and b.ok:
			perto.append(b.alvo)
	var L := PackedFloat32Array()
	for z in main.zumbis:
		if not is_instance_valid(z) or z.lan:
			continue
		var zp: Vector3 = z.global_position
		var ok := false
		for p in perto:
			if absf(p.x - zp.x) < ALCANCE_MUNDO and absf(p.z - zp.z) < ALCANCE_MUNDO:
				ok = true
				break
		if ok:
			L.append_array(z.para_rede())
	_mundo.rpc(main.hora, L)


## o zumbi de quem abriu bateu num convidado (o boneco dele aqui): o golpe vai para o jogo dele
func dano_para(id: int, d: float, de: Vector3) -> void:
	if papel != "anfitriao" or not jog.has(id):
		return
	info["danos"] += 1
	_dano.rpc_id(id, d, de)


## convidado: o golpe (ou a armadilha) num zumbi de quem abriu; junta e manda 10 vezes por segundo
func hit_z(uid: int, d: float, de: Vector3) -> void:
	if papel != "convidado" or not on or d <= 0.0:
		return
	if _hits.has(uid):
		_hits[uid][0] = float(_hits[uid][0]) + d
		_hits[uid][1] = de
	else:
		_hits[uid] = [d, de]


func efeito_z(uid: int, tipo: int, t: float) -> void:
	if papel != "convidado" or not on:
		return
	if not _efeitos.has(uid):
		_efeitos[uid] = {}
	_efeitos[uid][tipo] = maxf(float(_efeitos[uid].get(tipo, 0.0)), t)


func _mandar_golpes() -> void:
	for uid in _hits:
		_hit_z.rpc_id(1, uid, float(_hits[uid][0]), _hits[uid][1])
		info["hits"] += 1
	_hits.clear()
	for uid in _efeitos:
		for tipo in _efeitos[uid]:
			_efeito_z.rpc_id(1, uid, int(tipo), float(_efeitos[uid][tipo]))
	_efeitos.clear()


## quem abriu: o zumbi que um convidado matou caiu (o saque vai para o mundo dele)
func matou_z(quem: int, p: Vector3) -> void:
	if papel == "anfitriao" and jog.has(quem):
		info["mortes"] += 1
		_matou_z.rpc_id(quem, p)


# ======================================================================== os bonecos dos outros
func _boneco(id: int):
	var b = bonecos.get(id)
	if b != null and is_instance_valid(b):
		return b
	if main == null or not is_instance_valid(main) or not main.pronto or not main.em_jogo or not jog.has(id):
		return null
	b = Remoto.new(id, str(jog[id]["nome"]), bool(jog[id]["anf"]))
	main.add_child(b)
	bonecos[id] = b
	if visuais.has(id):
		b.visual(visuais[id][0], visuais[id][1])
	return b


func _tirar_boneco(id: int) -> void:
	var b = bonecos.get(id)
	if b != null and is_instance_valid(b):
		b.queue_free()
	bonecos.erase(id)


## os outros que estão num mundo agora (vivos ou não)
func no_mundo() -> Array:
	var L := []
	for b in bonecos.values():
		if is_instance_valid(b) and b.no_mundo and b.ok and b.recente():
			L.append(b)
	return L


# ======================================================================== bate-papo
func _falou(n: String, txt: String) -> void:
	if txt == "":
		return
	chat.append({"nome": n, "txt": txt, "t": Time.get_ticks_msec()})
	while chat.size() > 40:
		chat.pop_front()
	falou.emit()


func _sistema(txt: String) -> void:
	_falou("", txt)


func mandar_chat(txt: String) -> void:
	txt = txt.strip_edges().left(160)
	if txt == "":
		return
	if txt.begins_with("/"):
		comando(txt)
		return
	if not on:
		return
	_chat.rpc(txt)
	_falou(nome_jogo(), txt)


## comandos do bate-papo: /ir (vai para o lado de quem abriu, no seu mundo) e /ir Nome (para o lado de quem tem esse nome)
func comando(t: String) -> void:
	var partes := t.substr(1).strip_edges().split(" ", false)
	var c := str(partes[0]).to_lower() if partes.size() > 0 else ""
	var arg := " ".join(partes.slice(1)).strip_edges().to_lower()
	if c == "ir":
		var j = _jogador()
		if j == null or not j.vivo:
			_sistema("Entre num mundo (e esteja de pé) para usar /ir.")
			return
		var L := no_mundo()
		var alvo = null
		if arg != "":
			for b in L:
				if str(b.nome).to_lower().begins_with(arg):
					alvo = b
					break
		else:
			for b in L:
				if b.anf:
					alvo = b
					break
			if alvo == null and not L.is_empty():
				alvo = L[0]
		if alvo == null:
			_sistema("Ninguém com esse nome no mundo agora." if arg != "" else "Ninguém da partida está num mundo agora.")
			return
		main.ir_para(alvo.alvo)
		_sistema("Você foi para o lado de %s." % alvo.nome)
		return
	_sistema("Comandos: /ir (vai até quem abriu) · /ir Nome (vai até essa pessoa)")


func chat_aberto(on_: bool) -> void:
	digitando = on_
	if not on_:
		_chat_fechou = Engine.get_process_frames()


## a caixa do bate-papo acabou de fechar neste quadro (o Esc e o Enter dela não valem para o jogo)
func chat_acabou_de_fechar() -> bool:
	return Engine.get_process_frames() - _chat_fechou <= 1


func _som() -> void:
	if main != null and is_instance_valid(main) and main.sons != null and main.jogador != null and main.em_jogo:
		main.sons.tocar("aviso", main.jogador.global_position, -6.0)


# ======================================================================== achar as partidas da rede
## quem procura manda "VAYDR?" para a rede (e para este computador); quem abriu responde com o nome, a versão e quantos jogam
func _procurar(dt: float) -> void:
	if not procurando or on or _conectando:
		if _udp_proc != null:
			_udp_proc.close()
			_udp_proc = null
		return
	if _udp_proc == null:
		_udp_proc = PacketPeerUDP.new()
		_udp_proc.set_broadcast_enabled(true)
		if _udp_proc.bind(0) != OK:
			_udp_proc = null
			return
		_proc_t = 0.0
	_proc_t -= dt
	if _proc_t <= 0.0:
		_proc_t = 1.5
		for a in _difusoes():
			_udp_proc.set_dest_address(a, PORTA_ACHAR)
			_udp_proc.put_packet("VAYDR?".to_utf8_buffer())
		# as que pararam de responder saem da lista
		var agora := Time.get_ticks_msec()
		var mudou_lista := false
		for k in achados.keys():
			if agora - int(achados[k]["t"]) > 5000:
				achados.erase(k)
				mudou_lista = true
		if mudou_lista:
			mudou.emit()
	while _udp_proc != null and _udp_proc.get_available_packet_count() > 0:
		var pk := _udp_proc.get_packet()
		var ip := _udp_proc.get_packet_ip()
		var d = JSON.parse_string(pk.get_string_from_utf8())
		if not (d is Dictionary) or not d.has("vaydr") or ip == "":
			continue
		var k := str(d.get("id", ip)).left(40)
		var velho: Dictionary = achados.get(k, {})
		var ip_usar := ip
		# o mesmo computador responde por 127.0.0.1 e pelo IP da rede: fica o da rede
		if velho.has("ip") and ip.begins_with("127.") and not str(velho["ip"]).begins_with("127."):
			ip_usar = str(velho["ip"])
		var novo := {"nome": _nome_limpo(str(d.get("nome", ""))), "ip": ip_usar, "porta": clampi(int(d.get("porta", PORTA)), 1, 65535),
			"n": int(d.get("n", 1)), "max": int(d.get("max", MAX_JOGADORES)), "versao": str(d["vaydr"]).left(20), "t": Time.get_ticks_msec()}
		var antes := velho.duplicate()
		antes.erase("t")
		var depois := novo.duplicate()
		depois.erase("t")
		achados[k] = novo
		if antes != depois:
			mudou.emit()


func _responder_procura() -> void:
	while _udp_anf.get_available_packet_count() > 0:
		var pk := _udp_anf.get_packet()
		var ip := _udp_anf.get_packet_ip()
		var porta := _udp_anf.get_packet_port()
		if pk.get_string_from_utf8() != "VAYDR?" or ip == "" or porta <= 0:
			continue
		_udp_anf.set_dest_address(ip, porta)
		_udp_anf.put_packet(JSON.stringify({"vaydr": versao, "nome": nome, "n": jog.size() + 1, "max": MAX_JOGADORES, "porta": PORTA, "id": _token}).to_utf8_buffer())


## para onde mandar a procura: a rede toda (255.255.255.255), a rede de cada placa (a de casa e a do Radmin) e este computador
func _difusoes() -> Array:
	var L := ["255.255.255.255", "127.0.0.1"]
	for ip in ips_locais():
		var p := str(ip).split(".")
		if p.size() != 4:
			continue
		var a := "%s.%s.%s.255" % [p[0], p[1], p[2]]
		if not L.has(a):
			L.append(a)
		if p[0] == "26" or p[0] == "10":
			var b := "%s.255.255.255" % p[0]
			if not L.has(b):
				L.append(b)
	return L


func _servir_sonda() -> void:
	while _tcp != null and _tcp.is_connection_available():
		var c := _tcp.take_connection()
		if c == null:
			break
		c.set_no_delay(true)
		var txt := JSON.stringify({"vaydr": versao, "nome": nome, "n": jog.size() + 1, "max": MAX_JOGADORES}) + "\n"
		c.put_data(txt.to_utf8_buffer())
		_tcp_cons.append({"c": c, "t": Time.get_ticks_msec()})
	for i in range(_tcp_cons.size() - 1, -1, -1):
		var e: Dictionary = _tcp_cons[i]
		(e["c"] as StreamPeerTCP).poll()
		if Time.get_ticks_msec() - int(e["t"]) > 1500:
			(e["c"] as StreamPeerTCP).disconnect_from_host()
			_tcp_cons.remove_at(i)


## os IPs deste computador que os amigos digitam: o do Radmin (26.x) e o da rede de casa primeiro, os das placas virtuais por último
static func ips_locais() -> Array:
	var L := []
	for itf in IP.get_local_interfaces():
		var nm := str(itf.get("friendly", itf.get("name", "")))
		for a in itf.get("addresses", []):
			var ip := str(a)
			if ip.contains(":") or ip.begins_with("127.") or ip.begins_with("169.254.") or ip == "0.0.0.0":
				continue
			L.append({"ip": ip, "nome": nm})
	L.sort_custom(func(a, b): return _peso_ip(a) < _peso_ip(b))
	var so := []
	for q in L:
		if not so.has(q["ip"]):
			so.append(q["ip"])
	return so


static func _peso_ip(q: Dictionary) -> int:
	var ip := str(q["ip"])
	if ip.begins_with("26."):
		return 0
	var virt := RegEx.create_from_string("(?i)vEthernet|VirtualBox|VMware|WSL|Hyper-V|docker|veth|br-|virbr").search(str(q["nome"])) != null
	var p := ip.split(".")
	var privado := ip.begins_with("192.168.") or ip.begins_with("10.") or (p.size() == 4 and p[0] == "172" and int(p[1]) >= 16 and int(p[1]) <= 31)
	return 1 if privado and not virt else 2


# ======================================================================== Firewall do Windows
## a regra "VAYDR (partida em rede)" já está lá? (ler não precisa de administrador)
func _fw_existe() -> bool:
	if OS.get_name() != "Windows":
		return true
	var out := []
	var r := OS.execute("netsh", ["advfirewall", "firewall", "show", "rule", "name=" + REGRA_FW], out, true)
	return r == 0 and "".join(out).contains(REGRA_FW)


## apaga as regras do Windows para o VAYDR.exe (as de bloqueio ganham das de liberação) e cria uma que libera a entrada em todo
## tipo de rede; precisa de administrador: o Windows mostra o aviso e a pessoa clica em Sim
func liberar(antes_de_abrir := false) -> bool:
	if OS.get_name() != "Windows":
		return true
	fw = "pedindo"
	erro = ""
	status = "O Windows vai perguntar se o VAYDR pode fazer alterações: clique em Sim. É para liberar o jogo no Firewall e os amigos conseguirem entrar."
	mudou.emit()
	var exe := OS.get_executable_path().replace("\"", "")
	var cmd := "netsh advfirewall firewall delete rule name=all program=\"%s\" & netsh advfirewall firewall add rule name=\"%s\" dir=in action=allow program=\"%s\" enable=yes profile=any" % [exe, REGRA_FW, exe]
	var ps := "$p = Start-Process -FilePath 'cmd.exe' -ArgumentList '/d /s /c \"%s\"' -Verb RunAs -Wait -WindowStyle Hidden -PassThru; exit $p.ExitCode" % cmd.replace("'", "''")
	var b64 := Marshalls.raw_to_base64(ps.to_utf16_buffer())
	var pid := OS.create_process("powershell.exe", ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-EncodedCommand", b64])
	if pid > 0:
		var t0 := Time.get_ticks_msec()
		while OS.is_process_running(pid) and Time.get_ticks_msec() - t0 < 120000:
			await get_tree().create_timer(0.5, true).timeout
	var ok := _fw_existe()
	fw = "ok" if ok else "falta"
	status = ""
	if not antes_de_abrir:
		status = "Pronto: o VAYDR está liberado no Firewall do Windows. Peça para o amigo tentar de novo." if ok else ""
		if not ok:
			erro = "O Firewall não foi liberado (o aviso do Windows foi cancelado?). Sem isso, os amigos podem não conseguir entrar."
	mudou.emit()
	return ok


# ======================================================================== textos para as telas
## quem está na partida (você primeiro)
func nomes() -> Array:
	var L := [nome_jogo() + (" (você, abriu)" if papel == "anfitriao" else " (você)")]
	for q in jog.values():
		L.append(str(q["nome"]) + (" (abriu)" if q["anf"] else ""))
	return L


## o painel do lobby
func resumo() -> String:
	if on:
		var n := jog.size() + 1
		return "Partida aberta · %d jogando" % n if papel == "anfitriao" else "Na partida de %s · %d jogando" % [host_nome, n]
	if _conectando:
		return "Conectando…"
	if not achados.is_empty():
		return "%d partida%s na sua rede" % [achados.size(), "" if achados.size() == 1 else "s"]
	return "Abra a partida ou entre na de um amigo"
