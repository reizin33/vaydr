class_name Palco
extends Node3D
## O palco da criação do personagem, como o do jogo antigo (48z_criacao.js): o começo da noite na clareira, a fogueira atrás e à
## esquerda (luz de recorte, a câmera de costas não cai nela) e uma luz de frente que acompanha a câmera. O personagem respira
## parado, só de roupa de baixo; a câmera gira em volta (arrastando com o mouse ou sozinha), chega perto do rosto (rosto e
## cabelo) e mostra frente, costas e lado. O retrato (o rosto, a três quartos) sai de uma segunda câmera e vai para o perfil.

const PONTO := Vector2(3.25, 3.25)   # perto da fogueira da clareira (que fica no meio dela)
const YAW := 1.31                    # para onde ele olha (o ângulo do jogo antigo: frente = (sen, cos))
const HORA := 18.2                   # o fim da tarde (no jogo antigo era 19h15, que lá ainda tinha o céu laranja)
const FOV := 0.6                     # altura do quadro, em radianos (34°)

var main
var corpo: Corpo
var cam: Camera3D
var fogo: OmniLight3D
var frente: OmniLight3D
var retrato_vp: SubViewport
var retrato_cam: Camera3D
var ang := 0.0
var ang_alvo := 0.0
var zoom := 0.0
var zoom_alvo := 0.0
var girar := false
var foco := Rect2(0, 0, 0, 0)        # a parte da tela onde o personagem tem que caber (entre os painéis)
var _t := 0.0
var _hora_antes := 7.0
var _chao := 0.0


func _init(m) -> void:
	main = m


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	visible = false
	_chao = main.terreno.h(PONTO.x, PONTO.y)
	position = Vector3(PONTO.x, _chao, PONTO.y)
	corpo = Corpo.new(null)
	corpo.process_mode = Node.PROCESS_MODE_ALWAYS
	add_child(corpo)
	corpo.montar({})
	corpo.vestir({})
	corpo.yaw = atan2(-sin(YAW), -cos(YAW))
	cam = Camera3D.new()
	cam.fov = rad_to_deg(FOV)
	cam.near = 0.05
	cam.far = 600.0
	add_child(cam)
	# a fogueira da clareira (no meio dela): fogo de verdade e a luz que pisca
	var fg := Node3D.new()
	fg.position = Vector3(-PONTO.x, main.terreno.h(0, 0) - _chao, -PONTO.y)
	add_child(fg)
	fogo = OmniLight3D.new()
	fogo.light_color = Color(1.0, 0.58, 0.26)
	fogo.light_energy = 2.6
	fogo.omni_range = 10.0
	fogo.position = Vector3(0, 0.6, 0)
	fogo.shadow_enabled = true
	fg.add_child(fogo)
	if main.construcao != null and main.construcao.has_method("_fogo"):
		main.construcao._fogo(fg)
	# a luz de frente (acompanha a câmera, fraca e morna: o rosto não fica no escuro)
	frente = OmniLight3D.new()
	frente.light_color = Color(1.0, 0.9, 0.78)
	frente.light_energy = 0.7
	frente.omni_range = 9.0
	add_child(frente)
	# o retrato: outra câmera no mesmo mundo, numa tela pequena
	retrato_vp = SubViewport.new()
	retrato_vp.size = Vector2i(192, 192)
	retrato_vp.render_target_update_mode = SubViewport.UPDATE_DISABLED
	retrato_vp.msaa_3d = Viewport.MSAA_2X
	add_child(retrato_vp)
	retrato_cam = Camera3D.new()
	retrato_cam.fov = rad_to_deg(FOV)
	retrato_cam.near = 0.05
	retrato_vp.add_child(retrato_cam)


## abre o palco: a hora do começo da noite, a câmera dele vira a da tela
func abrir(ap: Dictionary) -> void:
	visible = true
	retrato_vp.world_3d = get_viewport().find_world_3d()
	_hora_antes = main.hora
	main.hora = HORA
	main._ciclo()
	if main.grama != null:
		main.grama.process_mode = Node.PROCESS_MODE_ALWAYS
	corpo.montar(ap)
	corpo.vestir({})
	ang = 0.0
	ang_alvo = 0.0
	zoom = 0.0
	zoom_alvo = 0.0
	girar = false
	cam.current = true
	retrato_vp.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	_quadro(0.0)


func fechar() -> void:
	visible = false
	cam.current = false
	if main.jogador != null:
		main.jogador.cam.current = true
	retrato_vp.render_target_update_mode = SubViewport.UPDATE_DISABLED
	main.hora = _hora_antes
	main._ciclo()
	if main.grama != null:
		main.grama.process_mode = Node.PROCESS_MODE_INHERIT


func trocar(ap: Dictionary) -> void:
	corpo.montar(ap)
	corpo.vestir({})


func _process(dt: float) -> void:
	if not visible:
		return
	_quadro(dt)


func _quadro(dt: float) -> void:
	_t += dt
	if girar:
		ang_alvo += dt * 0.55
	ang += (ang_alvo - ang) * minf(1.0, dt * 7.0)
	zoom += (zoom_alvo - zoom) * minf(1.0, dt * 6.0)
	corpo.animar(dt, {"vel": Vector3.ZERO, "chao": true, "vivo": true, "primeira": true, "yaw": corpo.yaw, "energia": 100.0})
	fogo.light_energy = 2.4 + sin(_t * 9.1) * 0.18 + sin(_t * 23.7 + 1.3) * 0.1
	# a câmera do palco: o corpo inteiro na área do personagem (de perto: cabeça e ombros)
	var vp := get_viewport().get_visible_rect().size
	var r := foco if foco.size.x > 20.0 and foco.size.y > 20.0 else Rect2(Vector2.ZERO, vp)
	var nx := (r.position.x + r.size.x / 2.0) / vp.x * 2.0 - 1.0
	var ny := 1.0 - (r.position.y + r.size.y / 2.0) / vp.y * 2.0
	var h_n := 2.0 * r.size.y / vp.y * 0.97
	_mirar(cam, ang, h_n, nx, ny, vp.x / vp.y, false)
	frente.global_position = cam.global_position + Vector3(0, 0.4, 0)
	_mirar(retrato_cam, 0.42, 1.9, 0.0, 0.0, 1.0, true)


## a conta da câmera do jogo antigo (criaCamera): a altura do quadro, a distância pelo campo de visão e o desvio para o
## personagem cair no meio da área dele
func _mirar(c: Camera3D, a: float, h_n: float, nx: float, ny: float, asp: float, retrato: bool) -> void:
	var s := corpo.escala
	var pe := _chao
	var topo := pe + corpo.altura_total()
	var cab := topo - 0.16 * s
	var th := tan(FOV / 2.0)
	var hc: float
	var cy: float
	if retrato:
		hc = 0.47 * s
		cy = cab - 0.06 * s
	else:
		hc = lerpf(topo - pe + 0.06, 0.8 * s, zoom)
		cy = lerpf((topo + pe) / 2.0, cab - 0.13 * s, zoom)
	var d := hc / (h_n * th)
	var b := YAW + a
	var alt := 0.03 if retrato else minf(0.3, d * 0.045)
	var p := Vector3(PONTO.x + sin(b) * d, cy + alt, PONTO.y + cos(b) * d)
	var alvo := Vector3(PONTO.x, cy, PONTO.y)
	c.look_at_from_position(p, alvo, Vector3.UP)
	if nx != 0.0 or ny != 0.0:
		var ax := nx * d * th * asp
		var ay := ny * d * th
		alvo = alvo - c.global_basis.x * ax - c.global_basis.y * ay
		c.look_at_from_position(p, alvo, Vector3.UP)


## frente, costas e lado: gira até lá pelo caminho mais curto
func vista(v: String) -> void:
	var alvo := 0.0
	match v:
		"costas":
			alvo = PI
		"lado":
			alvo = PI / 2.0
	var base := roundf((ang_alvo - alvo) / TAU) * TAU
	ang_alvo = base + alvo
	girar = false


## o retrato do jeito que está agora (para o perfil)
func foto_retrato() -> Image:
	var img := retrato_vp.get_texture().get_image()
	return img
