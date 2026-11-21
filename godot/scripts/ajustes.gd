class_name Ajustes
extends RefCounted
## As configurações do jogo (gráficos, tela, som, mouse e mira), guardadas em user://opcoes.cfg e valendo para todos os
## perfis deste computador (como os gráficos do jogo antigo). O arquivo é o mesmo das versões de antes: quem já tinha
## mexido nos gráficos e no mouse continua com o que escolheu.

const ARQ := "user://opcoes.cfg"
const QUALIDADES := ["Baixo", "Médio", "Alto"]
const DESC_QUALIDADE := "Baixo: menos mato, vista mais curta e resolução menor (para PC fraco). Médio: sombra e brilho. Alto: sombras maiores e mais nítidas, mais mato e mais longe."
const CORES_MIRA := [Color(0.925, 0.894, 0.824), Color(0.55, 0.95, 0.45), Color(1.0, 0.84, 0.3), Color(1.0, 0.38, 0.32), Color(0.45, 0.85, 1.0)]
const NOMES_CORES := ["Clara", "Verde", "Amarela", "Vermelha", "Azul"]

static var v := {"qualidade": 1, "escala": 100, "fps": false, "fov": 75, "tela_cheia": true, "comandos": true,
	"volume": 80, "sens": 1.0, "inverter_y": false, "mira_cor": 0, "mira_tam": 3, "terceira": false, "corpo_anda": false,
	"lan_nome": "", "lan_ip": ""}


static func carregar() -> void:
	var cf := ConfigFile.new()
	if cf.load(ARQ) == OK:
		for k in v:
			v[k] = cf.get_value("opcoes", k, v[k])


static func salvar() -> void:
	var cf := ConfigFile.new()
	for k in v:
		cf.set_value("opcoes", k, v[k])
	cf.save(ARQ)


static func mudar(k: String, valor, main = null) -> void:
	v[k] = valor
	salvar()
	if main != null:
		aplicar(main)


## põe tudo em uso: gráficos, resolução 3D, campo de visão, mouse, volume, o que aparece no HUD e a janela
static func aplicar(main) -> void:
	if main.jogador == null:
		return
	main.aplicar_qualidade(int(v["qualidade"]))
	var vp: Viewport = main.get_viewport()
	vp.scaling_3d_scale = vp.scaling_3d_scale * clampf(float(v["escala"]) / 100.0, 0.5, 1.0)
	main.jogador.cam.fov = clampf(float(v["fov"]), 60.0, 100.0)
	main.jogador.sens = 0.0022 * clampf(float(v["sens"]), 0.2, 3.0)
	main.jogador.inverter_y = bool(v["inverter_y"])
	if main.jogador.terceira != bool(v["terceira"]):
		main.jogador.alternar_camera(bool(v["terceira"]))
	AudioServer.set_bus_volume_db(0, linear_to_db(maxf(0.0001, float(v["volume"]) / 100.0)))
	AudioServer.set_bus_mute(0, int(v["volume"]) <= 0)
	if main.ui != null and main.ui.hud != null:
		main.ui.hud.fps_lbl.visible = bool(v["fps"])
		main.ui.hud.mostrar_comandos(bool(v["comandos"]))
	if not main.modo_teste:
		tela_cheia(bool(v["tela_cheia"]))


static func tela_cheia(on: bool) -> void:
	var modo := DisplayServer.WINDOW_MODE_FULLSCREEN if on else DisplayServer.WINDOW_MODE_MAXIMIZED
	if DisplayServer.window_get_mode() != modo:
		DisplayServer.window_set_mode(modo)


static func cor_mira() -> Color:
	return CORES_MIRA[clampi(int(v["mira_cor"]), 0, CORES_MIRA.size() - 1)]
