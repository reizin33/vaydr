class_name TesteRede
extends Node
## O teste da partida em rede na nuvem, com dois jogos de verdade neste computador (main.gd: "-- --teste-rede anfitriao" e
## "-- --teste-rede convidado"): quem abriu e quem entrou conferem, cada um do seu lado, o que o outro faz chegar — entrar,
## a lista, ver o outro no lugar certo com o personagem e a roupa dele, a hora, os zumbis de quem abriu caçando o convidado e
## mordendo no jogo dele, o golpe do convidado derrubando o zumbi de lá (e o saque indo para quem matou), o bate-papo, o /ir,
## a pausa que não para o mundo, a versão diferente recusada (pela pergunta do TCP e pelo próprio jogo) e quem abriu fechando.
## Também as fotos da partida em rede: "-- --fotos-rede convidado" é o amigo (sem tela) que entra na partida do jogo das fotos,
## faz o que ele pede, e depois abre a partida dele para o jogo das fotos entrar como convidado.

const AP_ANF := {"corpo": "mh", "mh": {"g": "mulher", "pele": "m_adulta_negra", "olhos": "castanho", "sobr": "sobr5", "cabelo": "afro", "barba": ""},
	"altura": 2, "nome": "Ana"}
const AP_CONV := {"corpo": "mh", "mh": {"g": "homem", "pele": "h_adulto_clara", "olhos": "azul", "sobr": "sobr3", "cabelo": "curto_escuro", "barba": "barba_cheia"},
	"altura": 3, "nome": "Beto"}

var main
var papel := ""
var fotos := false
var erros: Array = []
var sinais: Array = []
var cuidar := false     # convidado: não deixa morrer durante o teste (os zumbis batem de verdade)


func _init(m, p: String, f: bool) -> void:
	main = m
	papel = p
	fotos = f


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	Rede.controle.connect(func(_de: int, txt: String): sinais.append(txt))
	if fotos and papel == "convidado":
		fotos_amigo.call_deferred()
	elif not fotos and papel in ["anfitriao", "convidado"]:
		_comecar.call_deferred()


func _process(_dt: float) -> void:
	if cuidar and main.jogador != null and main.jogador.vivo and main.jogador.vida < 60.0:
		main.jogador.vida = 100.0


func _confere(ok: bool, txt: String) -> void:
	print(("ok    " if ok else "FALHA ") + txt)
	if not ok:
		erros.append(txt)


func _quadros(n: int) -> void:
	for i in n:
		await get_tree().physics_frame


func _esperar(cond: Callable, seg: float) -> bool:
	var t0 := Time.get_ticks_msec()
	while not cond.call():
		if Time.get_ticks_msec() - t0 > int(seg * 1000.0):
			return false
		await get_tree().process_frame
	return true


func _sinal(txt: String) -> bool:
	for s in sinais:
		if str(s) == txt or str(s).begins_with(txt + " "):
			return true
	return false


func _tirar_sinal(txt: String) -> String:
	for i in sinais.size():
		var s := str(sinais[i])
		if s == txt or s.begins_with(txt + " "):
			sinais.remove_at(i)
			return s
	return ""


func _por(p: Vector3, yaw: float) -> void:
	var y: float = main.chao_em(p.x, p.z, main.terreno.h(p.x, p.z) + 2.5)["y"]
	main.jogador.global_position = Vector3(p.x, y + 0.2, p.z)
	main.jogador.velocity = Vector3.ZERO
	main.jogador.rotation.y = yaw
	main.jogador.cabeca.rotation.x = 0.0


func _vestir(ids: Array) -> void:
	var j = main.jogador
	for id in ids:
		j.inv.por(id, 1)
		for i in j.inv.limite:
			var s = j.inv.slots[i]
			if s != null and s["id"] == id:
				j.inv.vestir(i)
				break


func _zumbis_lan() -> Array:
	return main.zumbis.filter(func(z): return is_instance_valid(z) and z.lan)


func _perto_lan(p: Vector3, alcance: float):
	var melhor = null
	var bd := alcance
	for z in _zumbis_lan():
		if z.estado == "morto":
			continue
		var d: float = z.global_position.distance_to(p)
		if d < bd:
			bd = d
			melhor = z
	return melhor


func _fim() -> void:
	var nome := "ANFITRIAO" if papel == "anfitriao" else "CONVIDADO"
	if erros.is_empty():
		print("TESTE REDE %s OK" % nome)
	else:
		print("TESTE REDE %s FALHOU: %d conferência(s)" % [nome, erros.size()])
	await get_tree().create_timer(0.5).timeout
	Rede.desligar(true)
	get_tree().quit(0 if erros.is_empty() else 1)


func _comecar() -> void:
	Engine.max_fps = 60
	main._vigia(440.0, "TESTE REDE %s" % papel.to_upper())
	await _quadros(10)
	main.spawn_t = 99999.0
	for z in main.zumbis:
		if is_instance_valid(z):
			z.queue_free()
	# os dois jogos acham o mesmo lugar (o mapa é o mesmo): quem abriu fica nele, o convidado 6 m a leste, um olhando o outro
	var p0: Vector3 = main._lugar_livre(Vector2(-35, 45), 16.0)
	print("TESTE REDE %s: começo (lugar %s)" % [papel, p0])
	if papel == "anfitriao":
		await _anfitriao(p0)
	else:
		await _convidado(p0)
	await _fim()


# ================================================================ quem abre
func _anfitriao(p0: Vector3) -> void:
	main.hora = 10.0
	Perfis.atual = {"id": "teste_rede_anf", "nome": "Anfitrião", "mundos": [], "ap": AP_ANF}
	main.jogador.aparencia(AP_ANF)
	_por(p0, -PI * 0.5)
	Rede.nome = "Anfitrião"
	await Rede.hospedar()
	_confere(Rede.on and Rede.anfitriao(), "abriu a partida (porta %d; IPs para os amigos: %s)" % [RedeLan.PORTA, ", ".join(Rede.ips) if not Rede.ips.is_empty() else "nenhum"])
	var r: Dictionary = await Rede._sondar("127.0.0.1", RedeLan.PORTA)
	_confere(r["ok"] and str(r["info"].get("vaydr", "")) == Rede.versao and int(r["info"].get("n", 0)) == 1,
		"responde a pergunta pelo TCP antes do jogo (versão %s, %s jogando)" % [str(r.get("info", {}).get("vaydr", "?")), str(r.get("info", {}).get("n", "?"))])
	var u := PacketPeerUDP.new()
	u.bind(0)
	u.set_dest_address("127.0.0.1", RedeLan.PORTA_ACHAR)
	u.put_packet("VAYDR?".to_utf8_buffer())
	await _esperar(func(): return u.get_available_packet_count() > 0, 3.0)
	var achou = JSON.parse_string(u.get_packet().get_string_from_utf8()) if u.get_available_packet_count() > 0 else null
	u.close()
	_confere(achou is Dictionary and str(achou.get("nome", "")) == "Anfitrião" and int(achou.get("porta", 0)) == RedeLan.PORTA,
		"aparece para quem procura partida na rede (%s)" % str(achou))
	# o convidado entra (o jogo dele pode estar montando o mapa ainda)
	var entrou := await _esperar(func(): return not Rede.jog.is_empty(), 200.0)
	_confere(entrou, "o convidado entrou na partida (%s)" % ", ".join(Rede.nomes()))
	if not entrou:
		return
	var cid: int = Rede.jog.keys()[0]
	var pc := p0 + Vector3(6, 0, 0)
	var ve_conv := func():
		var bb = Rede.bonecos.get(cid)
		return bb != null and is_instance_valid(bb) and bb.no_mundo and bb.ok and Vector2(bb.alvo.x - pc.x, bb.alvo.z - pc.z).length() < 2.0
	var viu := await _esperar(ve_conv, 90.0)
	var b = Rede.bonecos.get(cid)
	_confere(viu, "vê o convidado no lugar dele (a %.1f m de onde ele ficou)" % (Vector2(b.alvo.x - pc.x, b.alvo.z - pc.z).length() if b != null and is_instance_valid(b) else -1.0))
	if b == null or not is_instance_valid(b):
		return
	var vestido := func():
		return b.corpo.g == "homem" and (b.corpo.nos["peca_barba_cheia"] as MeshInstance3D).visible and (b.corpo.nos["roupa_camiseta"] as MeshInstance3D).visible
	var roupa := await _esperar(vestido, 20.0)
	_confere(roupa, "o convidado aparece com o personagem dele (homem de barba) e a roupa que está vestindo (camiseta)")
	await _quadros(30)
	_confere(b.visible and b.corpo.estado != "", "o boneco do convidado anda com as animações (%s)" % b.corpo.estado)
	# zumbis perto do convidado: caçam ele (o mais perto) e a mordida vai para o jogo dele
	var z1: Zumbi = main._nascer(pc + Vector3(0, 0, 4.0), false)
	var z2: Zumbi = main._nascer(pc + Vector3(3.0, 0, -10.0), false)
	Rede.mandar_controle("zumbis")
	var bateu := await _esperar(func(): return int(Rede.info["danos"]) > 0, 45.0)
	_confere(bateu, "o zumbi caça o convidado (o mais perto) e a mordida vai para o jogo dele (%d)" % int(Rede.info["danos"]))
	var caiu := await _esperar(func(): return not is_instance_valid(z1) or z1.estado == "morto", 80.0)
	_confere(int(Rede.info["hits"]) > 0 and caiu, "o golpe do convidado vale aqui: o zumbi caiu (%d golpes chegaram)" % int(Rede.info["hits"]))
	await _esperar(func(): return int(Rede.info["mortes"]) > 0, 5.0)
	_confere(int(Rede.info["mortes"]) > 0 and int(main.stats["zumbis"]) == 0, "quem matou leva: o saque foi para o mundo do convidado (aqui não contou)")
	# um bicho perto do convidado (etapa 6a): o boneco aparece lá, o golpe dele vale aqui e o esfolar leva o que a carcaça tinha
	var pb: Vector3 = b.alvo if is_instance_valid(b) else pc
	var ov: Bicho = main.fauna.criar("ovelha", pb + Vector3(3.0, 0, 0), "", null, "")
	ov.set_physics_process(false)
	ov.global_position.y = main.terreno.h(ov.global_position.x, ov.global_position.z)
	Rede.mandar_controle("bicho")
	var morreu_b := await _esperar(func(): return not ov.vivo, 70.0)
	_confere(morreu_b, "o golpe do convidado no bicho vale aqui: a ovelha caiu")
	var esfolada := await _esperar(func(): return bool(ov.carc.get("vazia", false)), 45.0)
	_confere(esfolada, "o convidado esfolou a ovelha: a carcaça daqui ficou vazia (o que ela tinha foi para ele)")
	main.fauna.limpar()
	# o Caramelo de quem abriu (etapa 6e): vigiando perto do convidado, o boneco dele aparece lá
	main.cao.iniciar()
	main.cao.ativo = true
	main.cao.st = "fica"
	main.cao.modo = "fica"
	main.cao._no_chao(pb + Vector3(-2.0, 0, 2.0))
	main.cao.fica = main.cao.global_position
	Rede.mandar_controle("cao")
	var viu_c := await _esperar(func(): return _sinal("cao_ok"), 60.0)
	_confere(viu_c, "o Caramelo daqui apareceu para quem entrou")
	main.cao.iniciar()
	# os veículos de quem abriu (etapa 6j): a caminhonete perto do convidado, o boneco dela aparece lá; ele pede, dirige e desce
	var cam_v: Veiculo = main.veiculos.por_id("caminhonete")
	var p_v := Vector3.ZERO
	if cam_v != null:
		cam_v.global_position = Vector3(pb.x + 3.5, main.terreno.h(pb.x + 3.5, pb.z), pb.z)
		cam_v.rotation.y = 0.0
		cam_v.comb = 50.0
		cam_v.assentar()
		p_v = cam_v.global_position
	Rede.mandar_controle("veic")
	var viu_v := await _esperar(func(): return _sinal("veic_ok"), 60.0)
	_confere(viu_v, "a caminhonete daqui apareceu para quem entrou")
	var pegou_v := false
	if cam_v != null:
		pegou_v = await _esperar(func(): return cam_v.motorista != 0, 30.0)
	var dirigiu_v := await _esperar(func(): return _sinal("dirigiu"), 60.0)
	await _quadros(10)
	var andou_v := cam_v.global_position.distance_to(p_v) if cam_v != null else 0.0
	_confere(pegou_v and dirigiu_v and cam_v != null and andou_v > 3.0 and cam_v.motorista == 0 and not cam_v.ativo,
		"o convidado pediu e dirigiu a caminhonete daqui: ela andou %.1f m aqui também e ficou parada onde ele desceu" % andou_v)
	main.veiculos.novo()
	# bate-papo
	var msg_conv := func():
		for c in Rede.chat:
			if str(c["nome"]) == "Convidado" and str(c["txt"]) == "Oi! Aqui é o convidado.":
				return true
		return false
	var falou := await _esperar(msg_conv, 60.0)
	_confere(falou, "bate-papo: chegou a mensagem do convidado")
	Rede.mandar_chat("Oi, convidado! Aqui é quem abriu.")
	# com amigo na partida, a pausa não para o mundo
	main.telas.pausa()
	await _quadros(3)
	var h0: float = main.hora
	await get_tree().create_timer(1.5).timeout
	_confere(not get_tree().paused and main.telas.atual == "pausa" and main.hora > h0 and main.telas.pz_titulo.text == "MENU" and main.jogador.preso,
		"com amigo na partida a pausa não para o mundo (a hora andou; o jogador fica parado)")
	main.telas.voltar_ao_jogo()
	await _quadros(3)
	_confere(not main.jogador.preso, "voltou da pausa: o jogador anda de novo")
	if is_instance_valid(z2):
		z2.queue_free()
	# a versão diferente (o convidado sai e tenta entrar com outra versão) e a volta dele
	var r0 := int(Rede.info["recusas"])
	Rede.mandar_controle("versao")
	var recusou := await _esperar(func(): return int(Rede.info["recusas"]) > r0, 90.0)
	_confere(recusou, "versão diferente: recusou quem tentou entrar com outra versão")
	var voltou := await _esperar(func(): return not Rede.jog.is_empty() and _sinal("voltei"), 90.0)
	_confere(voltou, "o convidado voltou para a partida")
	# fecha a partida: o convidado volta a jogar sozinho
	Rede.mandar_controle("fim")
	await get_tree().create_timer(1.0).timeout
	Rede.desligar(false)
	_confere(not Rede.on and Rede.papel == "" and Rede.bonecos.is_empty(), "fechou a partida (os bonecos dos outros saem)")
	await get_tree().create_timer(5.0).timeout


# ================================================================ quem entra
func _convidado(p0: Vector3) -> void:
	main.hora = 3.0
	var pc := p0 + Vector3(6, 0, 0)
	Perfis.atual = {"id": "teste_rede_conv", "nome": "Convidado", "mundos": [], "ap": AP_CONV}
	main.jogador.aparencia(AP_CONV)
	_vestir(["camiseta", "calcaCargo"])
	_por(pc, PI * 0.5)
	cuidar = true
	Rede.nome = "Convidado"
	# quem abriu ainda pode estar montando o mundo: tenta de novo até entrar
	var t0 := Time.get_ticks_msec()
	var tentativas := 0
	while not Rede.on and Time.get_ticks_msec() - t0 < 210000:
		tentativas += 1
		Rede.entrar("127.0.0.1")
		await _esperar(func(): return Rede.on or not Rede._conectando, 25.0)
		if not Rede.on:
			await get_tree().create_timer(3.0).timeout
	_confere(Rede.on and Rede.convidado(), "entrou na partida de %s (%d tentativa%s)" % [Rede.host_nome, tentativas, "" if tentativas == 1 else "s"])
	if not Rede.on:
		return
	_confere(Rede.host_nome == "Anfitrião" and Rede.jog.size() == 1 and bool(Rede.jog.values()[0]["anf"]), "a lista tem quem abriu (%s)" % ", ".join(Rede.nomes()))
	var ve_anf := func():
		for q in Rede.no_mundo():
			if q.anf and Vector2(q.alvo.x - p0.x, q.alvo.z - p0.z).length() < 2.0:
				return true
		return false
	var viu := await _esperar(ve_anf, 60.0)
	_confere(viu, "vê quem abriu no lugar dele")
	var hb = Rede.no_mundo()[0] if not Rede.no_mundo().is_empty() else null
	var ap_ok := false
	if hb != null:
		ap_ok = await _esperar(func(): return hb.corpo.g == "mulher" and (hb.corpo.nos["peca_afro"] as MeshInstance3D).visible, 20.0)
	_confere(ap_ok, "quem abriu aparece com o personagem dela (mulher, cabelo afro)")
	var hora_ok := await _esperar(func(): return main.hora >= 9.9 and main.hora < 16.0, 10.0)
	_confere(hora_ok, "a hora é a de quem abriu (aqui era 3h, agora %s)" % main.hora_txt())
	var proprios: Array = main.zumbis.filter(func(z): return is_instance_valid(z) and not z.lan and z.estado != "morto")
	_confere(proprios.is_empty(), "os zumbis daqui somem: na partida eles vêm de quem abriu")
	# os zumbis de quem abriu
	var chegou := await _esperar(func(): return _sinal("zumbis"), 150.0)
	var vieram := false
	if chegou:
		vieram = await _esperar(func(): return _zumbis_lan().size() >= 2, 15.0)
	_confere(vieram, "os zumbis de quem abriu aparecem aqui (%d bonecos)" % _zumbis_lan().size())
	main.jogador.vida = 100.0
	var mordeu := await _esperar(func(): return int(Rede.info["danos"]) > 0, 45.0)
	_confere(mordeu, "o zumbi de quem abriu morde aqui (%d)" % int(Rede.info["danos"]))
	# o golpe aqui vai para quem abriu
	main.jogador.inv.por("machado", 1)
	main._na_mao("machado")
	var alvo = null
	var t1 := Time.get_ticks_msec()
	while Time.get_ticks_msec() - t1 < 70000:
		alvo = _perto_lan(main.jogador.global_position, 2.3)
		if alvo != null:
			break
		await _quadros(5)
	var derrubou := false
	if alvo != null:
		var t2 := Time.get_ticks_msec()
		while Time.get_ticks_msec() - t2 < 40000 and is_instance_valid(alvo) and alvo.estado != "morto":
			main._olhar(alvo.global_position + Vector3(0, 1.1, 0))
			main.jogador.cd = 0.0
			main.jogador.atacar()
			await get_tree().create_timer(0.5).timeout
		derrubou = is_instance_valid(alvo) and alvo.estado == "morto"
	_confere(derrubou, "o golpe aqui derrubou o zumbi de quem abriu (%d golpes mandados)" % int(Rede.info["hits"]))
	var levou := await _esperar(func(): return int(Rede.info["mortes"]) > 0 and int(main.stats["zumbis"]) >= 1, 10.0)
	_confere(levou, "quem matou leva: o saque caiu aqui (zumbis mortos: %d)" % int(main.stats["zumbis"]))
	# o bicho de quem abriu (etapa 6a): aparece aqui, o golpe vale lá e o esfolar traz o que ele tinha
	var veio_b := await _esperar(func(): return _sinal("bicho"), 150.0)
	var bb = null
	if veio_b:
		await _esperar(func(): return not main.fauna.b_rede.is_empty(), 15.0)
		for k in main.fauna.b_rede:
			if is_instance_valid(main.fauna.b_rede[k]):
				bb = main.fauna.b_rede[k]
	_confere(bb != null, "o bicho de quem abriu aparece aqui (%s)" % (str(bb.tipo) if bb != null else "nenhum"))
	if bb != null:
		main.jogador.inv.por("machado", 1)
		main._na_mao("machado")
		var tb := Time.get_ticks_msec()
		while Time.get_ticks_msec() - tb < 45000 and is_instance_valid(bb) and bb.vivo:
			var alvo_b: Vector3 = bb.global_position
			main._por_em(Vector3(alvo_b.x - 1.6, main.terreno.h(alvo_b.x - 1.6, alvo_b.z) + 0.15, alvo_b.z))
			await _quadros(2)
			main._olhar(bb.centro())
			main.jogador.cd = 0.0
			main.jogador.atacar()
			await get_tree().create_timer(0.5).timeout
		_confere(is_instance_valid(bb) and not bb.vivo, "o golpe aqui derrubou o bicho de quem abriu")
		main.jogador.inv.por("faca", 1)
		var antes_carne: int = main.jogador.inv.conta("carneCrua")
		await _quadros(10)
		if is_instance_valid(bb):
			main._olhar(bb.centro())
			main.jogador.acao = {}
			main.jogador.esfolar(bb)
			Input.action_press("usar")
			await get_tree().create_timer(float(bb.S.get("esfola", 2.0)) + 0.6).timeout
			Input.action_release("usar")
		var veio := await _esperar(func(): return main.jogador.inv.conta("carneCrua") > antes_carne, 12.0)
		_confere(veio, "esfolou o bicho de quem abriu: a carne e o couro vieram para cá (%d carnes)" % (main.jogador.inv.conta("carneCrua") - antes_carne))
	# o Caramelo de quem abriu (etapa 6e): o boneco dele aparece aqui
	var veio_c := await _esperar(func(): return _sinal("cao"), 120.0)
	var viu_cao := false
	if veio_c:
		viu_cao = await _esperar(func(): return main.cao.lan and main.cao.ativo and main.cao.corpo.visible, 20.0)
	_confere(viu_cao, "o Caramelo de quem abriu aparece aqui (o boneco, a %.0f m de você)" % main.cao.global_position.distance_to(main.jogador.global_position))
	Rede.mandar_controle("cao_ok")
	# a caminhonete de quem abriu (etapa 6j): o boneco dela aparece aqui; pede para dirigir, anda e desce
	var veio_v := await _esperar(func(): return _sinal("veic"), 90.0)
	var cv: Veiculo = main.veiculos.por_id("caminhonete")
	var viu_veic := false
	if veio_v and cv != null:
		viu_veic = await _esperar(func(): return cv.lan and cv.global_position.distance_to(main.jogador.global_position) < 12.0, 20.0)
	_confere(viu_veic, "a caminhonete de quem abriu aparece aqui (o boneco, a %.0f m de você)" % (
		cv.global_position.distance_to(main.jogador.global_position) if cv != null else -1.0))
	Rede.mandar_controle("veic_ok")
	var dirigiu := false
	var andou_c := 0.0
	var de_volta := false
	if cv != null and viu_veic:
		var clar: Array = main._clareira_teste(cv.global_position, 24.0)
		main._por_em(cv.global_position + Vector3(2.8, 0.2, 0))
		await _quadros(3)
		main.veiculos.usar(cv, main.jogador, false)
		var entrou_c := await _esperar(func(): return main.jogador.veiculo == cv, 15.0)
		if entrou_c:
			var p0c := cv.global_position
			Input.action_press("frente")
			await get_tree().create_timer(2.0).timeout
			Input.action_release("frente")
			Input.action_press("pular")
			await get_tree().create_timer(1.8).timeout
			Input.action_release("pular")
			andou_c = cv.global_position.distance_to(p0c)
			dirigiu = main.veiculos.sair(main.jogador)
			de_volta = cv.lan and not cv.dono_rede
		main._devolver_clareira(clar)
	_confere(dirigiu and andou_c > 3.0 and de_volta,
		"pediu para dirigir a caminhonete de quem abriu: andou %.1f m e desceu (ela voltou a ser o boneco de lá)" % andou_c)
	await get_tree().create_timer(0.6).timeout
	Rede.mandar_controle("dirigiu")
	# bate-papo
	Rede.mandar_chat("Oi! Aqui é o convidado.")
	var msg_anf := func():
		for c in Rede.chat:
			if str(c["nome"]) == "Anfitrião" and str(c["txt"]) == "Oi, convidado! Aqui é quem abriu.":
				return true
		return false
	var resposta := await _esperar(msg_anf, 60.0)
	_confere(resposta, "bate-papo: chegou a resposta de quem abriu")
	# /ir: longe dela, o comando leva para o lado
	_por(pc + Vector3(30, 0, 30), 0.0)
	await _quadros(20)
	Rede.comando("/ir")
	await _quadros(5)
	var d_ir: float = main.jogador.global_position.distance_to(hb.alvo) if hb != null else 99.0
	_confere(d_ir < 3.5, "/ir leva até quem abriu (ficou a %.1f m)" % d_ir)
	# a versão diferente: sai, tenta com outra versão (a pergunta pelo TCP já diz; e quem abriu recusa) e volta
	var pediu := await _esperar(func(): return _sinal("versao"), 120.0)
	_confere(pediu, "chegou o pedido do teste da versão")
	cuidar = false
	Rede.desligar(false)
	await _quadros(5)
	_confere(not Rede.on and _zumbis_lan().is_empty() and main.z_rede.is_empty(), "saiu da partida: os bonecos dos zumbis de lá somem")
	Rede.versao = "0.0.0-teste"
	Rede.entrar("127.0.0.1")
	await _esperar(func(): return not Rede._conectando, 20.0)
	_confere(Rede.erro.begins_with("Versões diferentes"), "versão diferente: a pergunta pelo TCP já diz o motivo (%s)" % Rede.erro)
	Rede.erro = ""
	Rede.entrar_direto("127.0.0.1")
	await _esperar(func(): return not Rede._conectando and Rede.erro != "", 20.0)
	_confere(not Rede.on and Rede.erro.begins_with("Versões diferentes"), "versão diferente: quem abriu recusa (%s)" % Rede.erro)
	Rede.versao = Telas.VERSAO
	Rede.erro = ""
	Rede.entrar("127.0.0.1")
	var de_novo := await _esperar(func(): return Rede.on, 30.0)
	_confere(de_novo, "entrou de novo com a versão certa")
	await _quadros(10)
	Rede.mandar_controle("voltei")
	# quem abriu fecha: o seu mundo segue sozinho
	var fim := await _esperar(func(): return _sinal("fim"), 120.0)
	var caiu := false
	if fim:
		caiu = await _esperar(func(): return not Rede.on, 30.0)
	var aviso := false
	for c in Rede.chat:
		if str(c["nome"]) == "" and str(c["txt"]).contains("fechou a partida"):
			aviso = true
	_confere(caiu and aviso and Rede.papel == "", "quem abriu fechou: o aviso aparece e o jogo segue sozinho")
	_confere(_zumbis_lan().is_empty() and Rede.bonecos.is_empty(), "sem partida: os bonecos (dos zumbis e de quem abriu) saem")


# ================================================================ fotos
## o jogo das fotos (com tela): abre a partida, o amigo (o outro jogo, sem tela) entra; fotografa a tela do Multiplayer, os
## dois jogando juntos e um zumbi caçando o amigo; depois o amigo abre a partida dele e este jogo entra como convidado
func fotos_principal() -> void:
	var j = main.jogador
	main.spawn_t = 99999.0
	for z in main.zumbis:
		if is_instance_valid(z):
			z.queue_free()
	Rede.nome = "Sobrevivente"
	main.telas.mostrar("multi")
	await Rede.hospedar()
	print("fotos da rede: partida aberta, esperando o amigo")
	var entrou := await _esperar(func(): return not Rede.jog.is_empty(), 420.0)
	if not entrou:
		print("fotos da rede: o amigo não entrou")
		Rede.desligar(true)
		return
	var cid: int = Rede.jog.keys()[0]
	await _quadros(20)
	await main._foto("20_multiplayer_partida_aberta")
	main.telas.esconder()
	main.hora = 15.6
	var s: Vector3 = main._lugar_livre(Vector2(10, 12), 12.0)
	var yaw0 := atan2(s.x - 0.0, s.z - 0.0) + 0.5
	_por(s, yaw0)
	var fr := Vector3(-sin(yaw0), 0, -cos(yaw0))
	var pv := s + fr * 4.2
	Rede.mandar_controle("vem %f %f %f %f" % [pv.x, pv.y, pv.z, yaw0 + PI])
	await get_tree().create_timer(1.0).timeout
	Rede.mandar_controle("fala Cheguei! Tô vendo você.")
	var amigo_la := func():
		var b = Rede.bonecos.get(cid)
		return b != null and is_instance_valid(b) and b.ok and b.global_position.distance_to(pv) < 1.5
	var chegou := await _esperar(amigo_la, 60.0)
	print("fotos da rede: o amigo chegou: ", chegou)
	await _quadros(20)
	main._olhar(pv + Vector3(0, 1.25, 0))
	j.cabeca.rotation.x -= 0.05
	await _quadros(10)
	await main._foto("21_jogando_junto")
	# terceira pessoa: os dois no quadro
	j.alternar_camera(true)
	j.rotation.y += 0.42
	j.cabeca.rotation.x = -0.1
	await _quadros(40)
	await main._foto("22_jogando_junto_terceira")
	j.rotation.y -= 0.42
	# um zumbi caça o amigo (aqui ele é de verdade; no jogo do amigo é um boneco)
	var lado := Vector3(fr.z, 0, -fr.x)
	var z: Zumbi = main._nascer(pv + fr * 5.0 + lado * 1.5, false)
	await _esperar(func(): return not is_instance_valid(z) or z.global_position.distance_to(pv) < 2.6, 25.0)
	Rede.mandar_controle("luta")
	await _quadros(4)
	main._olhar(pv + fr * 1.0 + Vector3(0, 1.0, 0))
	await _quadros(6)
	await main._foto("23_zumbi_caca_o_amigo")
	j.alternar_camera(false)
	if is_instance_valid(z):
		z.queue_free()
	# a troca: o amigo sai, abre a partida dele e este jogo entra como convidado
	Rede.mandar_controle("abre")
	await get_tree().create_timer(1.5).timeout
	Rede.desligar(true)
	var t0 := Time.get_ticks_msec()
	var tentativas := 0
	while not Rede.on and Time.get_ticks_msec() - t0 < 120000:
		await get_tree().create_timer(2.0).timeout
		tentativas += 1
		Rede.entrar("127.0.0.1")
		await _esperar(func(): return Rede.on or not Rede._conectando, 20.0)
		if not Rede.on:
			print("fotos da rede: tentativa %d (%.0f s): %s" % [tentativas, (Time.get_ticks_msec() - t0) / 1000.0, Rede.erro.left(60)])
	if not Rede.on:
		print("fotos da rede: não entrou na partida do amigo (%s)" % Rede.erro)
		return
	print("fotos da rede: entrou na partida do amigo (%d tentativas)" % tentativas)
	main.telas.mostrar("multi")
	await _quadros(20)
	await main._foto("24_multiplayer_entrou_na_partida")
	main.telas.esconder()
	var tem := await _esperar(func(): return not Rede.no_mundo().is_empty(), 30.0)
	if not tem:
		print("fotos da rede: quem abriu não apareceu")
		return
	var hb = Rede.no_mundo()[0]
	Rede.comando("/ir")
	await _quadros(10)
	# um passo para trás para ver quem abriu (e um zumbi dela chegando perto)
	var a: Vector3 = hb.alvo
	var yb: float = hb.yaw_r
	var fb := Vector3(-sin(yb), 0, -cos(yb))
	var olho := a + fb * 4.5
	_por(olho, atan2(olho.x - a.x, olho.z - a.z))
	Rede.mandar_controle("zumbi %f %f %f" % [a.x - fb.x * 4.0 + fb.z * 2.0, a.y, a.z - fb.z * 4.0 - fb.x * 2.0])
	await _esperar(func(): return not _zumbis_lan().is_empty(), 15.0)
	await _quadros(25)
	main._olhar(a + Vector3(0, 1.2, 0))
	await _quadros(6)
	await main._foto("25_convidado_ve_quem_abriu")
	Rede.mandar_controle("fim")
	await get_tree().create_timer(1.0).timeout
	Rede.desligar(true)


## o amigo das fotos (sem tela): entra na partida do jogo das fotos, vai para onde pedem, fala, luta, abre a partida dele
func fotos_amigo() -> void:
	Engine.max_fps = 30
	await _quadros(10)
	main.spawn_t = 99999.0
	for z in main.zumbis:
		if is_instance_valid(z):
			z.queue_free()
	var ap := {"corpo": "mh", "mh": {"g": "homem", "pele": "h_jovem_negra", "olhos": "castanho", "sobr": "sobr2", "cabelo": "afro", "barba": "cavanhaque"},
		"altura": 3, "nome": "Vizinho"}
	Perfis.atual = {"id": "fotos_amigo", "nome": "Vizinho", "mundos": [], "ap": ap}
	main.jogador.aparencia(ap)
	_vestir(["camisaLeve", "calcaCargo", "botasTrilha"])
	main.jogador.inv.por("machado", 1)
	main._na_mao("machado")
	cuidar = true
	Rede.nome = "Vizinho"
	var t0 := Time.get_ticks_msec()
	while not Rede.on and Time.get_ticks_msec() - t0 < 2700000:
		if not Rede._conectando:
			Rede.entrar("127.0.0.1")
		await get_tree().create_timer(10.0).timeout
	print("amigo das fotos: entrou na partida")
	while Time.get_ticks_msec() - t0 < 2700000:
		await get_tree().create_timer(0.2).timeout
		if sinais.is_empty():
			continue
		var s := str(sinais.pop_front())
		var p := s.split(" ")
		match p[0]:
			"vem":
				_por(Vector3(float(p[1]), float(p[2]), float(p[3])), float(p[4]))
			"fala":
				Rede.mandar_chat(s.substr(5))
			"luta":
				for k in 6:
					var z = _perto_lan(main.jogador.global_position, 3.5)
					if z != null:
						main._olhar(z.global_position + Vector3(0, 1.1, 0))
						main.jogador.cd = 0.0
						main.jogador.atacar()
					await get_tree().create_timer(0.7).timeout
			"abre":
				# sai da partida de lá (sem esperar o aviso de que ela fechou) e abre a dele
				Rede.desligar(true)
				await get_tree().create_timer(3.0).timeout
				main.hora = 15.8
				for k in 5:
					await Rede.hospedar()
					if Rede.on:
						break
					print("amigo das fotos: não abriu (%s); de novo" % Rede.erro)
					await get_tree().create_timer(2.0).timeout
				print("amigo das fotos: abriu a partida dele (%s, pergunta pelo TCP %s)" % [Rede.on, "sim" if Rede._tcp != null else "não"])
			"zumbi":
				main._nascer(Vector3(float(p[1]), float(p[2]), float(p[3])), false)
			"fim":
				print("amigo das fotos: fim")
				Rede.desligar(true)
				get_tree().quit(0)
				return
