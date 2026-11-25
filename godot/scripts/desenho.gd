class_name Desenho
extends RefCounted
## O modo de desenho do jogo. O completo (Forward+, o padrão) tem sombra nos cantos (oclusão de ambiente), luz que rebate
## entre as coisas, neblina com volume (o facho da lanterna, os raios de sol entrando na mata), antisserrilhado melhor e a
## resolução menor ampliada com FSR; precisa de placa com Vulkan (ou DirectX 12). O leve (Compatibility) é o desenho de
## antes, mais simples: para PC fraco e placa antiga.
##
## O modo é escolhido antes de a janela abrir, então a troca só vale quando o jogo abre de novo: o leve fica escrito em
## user://desenho.cfg, que o Godot lê junto com o project.godot (application/config/project_settings_override). Sem o
## arquivo vale o completo. Placa sem Vulkan e sem DirectX 12: o próprio Godot abre no leve sozinho.
##
## A guarda da abertura: o jogo deixa uma marca quando abre e tira quando já desenhou o mundo uns segundos (ou quando fecha
## direito). Se ao abrir a marca ainda está lá, da última vez ele fechou sozinho (travou) abrindo no completo: passa para o
## leve e abre de novo, e avisa (dá para voltar ao completo nas configurações).

const ARQ := "user://desenho.cfg"
const MARCA := "user://abrindo.txt"
const MODOS := ["Completo", "Leve"]
const DESC := "Completo: sombra nos cantos, luz que rebate e neblina com volume (precisa de placa de vídeo com Vulkan ou DirectX 12). Leve: o desenho mais simples, para PC fraco ou placa antiga. A troca vale quando o jogo abre de novo."
## segundos desenhando o mundo até a abertura contar como boa
const ABRIU_SEG := 6.0

static var _marcou := false
static var _no_inicio := ""


## o modo desenhando agora: "completo" (Forward+) ou "leve" (Compatibility)
static func atual() -> String:
	return "leve" if RenderingServer.get_current_rendering_method() == "gl_compatibility" else "completo"


## o modo escolhido: o que vale quando o jogo abrir de novo
static func escolhido() -> String:
	var cf := ConfigFile.new()
	if cf.load(ARQ) == OK and str(cf.get_value("rendering", "renderer/rendering_method", "")) == "gl_compatibility":
		return "leve"
	return "completo"


## escolhe o modo da próxima abertura (o completo é o padrão: só apaga o arquivo)
static func escolher(modo: String, motivo := "") -> void:
	if modo == "leve":
		var cf := ConfigFile.new()
		cf.set_value("rendering", "renderer/rendering_method", "gl_compatibility")
		if motivo != "":
			cf.set_value("vaydr", "motivo", motivo)
		cf.save(ARQ)
	elif FileAccess.file_exists(ARQ):
		DirAccess.remove_absolute(ProjectSettings.globalize_path(ARQ))


static func motivo() -> String:
	var cf := ConfigFile.new()
	if cf.load(ARQ) != OK:
		return ""
	return str(cf.get_value("vaydr", "motivo", ""))


## ao abrir (uma vez só por execução): confere a marca da abertura de antes e deixa a desta. Devolve true quando o jogo vai
## abrir de novo no leve (da última vez fechou sozinho abrindo no completo); "reabrir" falso é para o teste
static func abrindo(reabrir := true) -> bool:
	if _marcou:
		return false
	_marcou = true
	_no_inicio = escolhido()
	if FileAccess.file_exists(MARCA) and atual() == "completo":
		var f := FileAccess.open(MARCA, FileAccess.READ)
		var antes := f.get_as_text().strip_edges() if f != null else ""
		f = null
		_tirar_marca()
		if antes == "completo":
			escolher("leve", "caiu")
			_no_inicio = "leve"
			if reabrir:
				OS.set_restart_on_exit(true, OS.get_cmdline_args())
			return true
	var fw := FileAccess.open(MARCA, FileAccess.WRITE)
	if fw != null:
		fw.store_string(atual())
	return false


## a abertura deu certo (o mundo já foi desenhado uns segundos) ou o jogo está fechando direito
static func abriu() -> void:
	_tirar_marca()


static func _tirar_marca() -> void:
	if FileAccess.file_exists(MARCA):
		DirAccess.remove_absolute(ProjectSettings.globalize_path(MARCA))


## o aviso de que o jogo passou para o leve sozinho (uma vez só)
static func aviso_queda() -> bool:
	var cf := ConfigFile.new()
	if cf.load(ARQ) != OK or str(cf.get_value("vaydr", "motivo", "")) != "caiu":
		return false
	cf.set_value("vaydr", "motivo", "caiu_avisado")
	cf.save(ARQ)
	return true


static func nome_driver() -> String:
	var d := RenderingServer.get_current_rendering_driver_name()
	match d:
		"vulkan":
			return "Vulkan"
		"d3d12":
			return "DirectX 12"
		"metal":
			return "Metal"
		"opengl3", "opengl3_es":
			return "OpenGL"
		"opengl3_angle":
			return "OpenGL pelo ANGLE"
		"dummy", "":
			return "sem tela"
	return d


## o que mostrar nas configurações embaixo da escolha: o modo de agora, a placa e por que está diferente do escolhido
static func situacao() -> String:
	var agora := atual()
	var txt := "Desenhando agora: %s (%s)" % [agora, nome_driver()]
	var placa := RenderingServer.get_video_adapter_name()
	if placa != "":
		txt += " · " + placa
	var esc := escolhido()
	if _no_inicio == "":
		_no_inicio = esc
	var linha := OS.get_cmdline_args()
	if "--rendering-driver" in linha or "--rendering-method" in linha:
		txt += ". O modo veio da linha de comando (como nas fotos automáticas)."
	elif esc == "leve" and motivo().begins_with("caiu"):
		txt += ". Da última vez o jogo fechou sozinho abrindo no completo, então passou para o leve."
	elif esc != _no_inicio:
		txt += ". Vale quando o jogo abrir de novo."
	elif agora == "leve" and esc == "completo":
		txt += ". A sua placa não abriu o modo completo (sem Vulkan e sem DirectX 12), então o jogo abriu no leve sozinho."
	return txt


## precisa abrir de novo para valer o modo escolhido?
static func pendente() -> bool:
	return escolhido() != atual() and (_no_inicio == "" or escolhido() != _no_inicio)


## abre o jogo de novo no modo escolhido: salva o mundo, sai da partida em rede e fecha (o Godot abre de novo sozinho)
static func reiniciar(main) -> void:
	if main == null:
		return
	if not bool(main.get("modo_teste")) and bool(main.get("em_jogo")) and main.jogador != null and main.jogador.vivo:
		main.salvar_jogo()
	if Rede.on:
		Rede.desligar(true)
	abriu()
	OS.set_restart_on_exit(true, OS.get_cmdline_args())
	main.get_tree().quit()
