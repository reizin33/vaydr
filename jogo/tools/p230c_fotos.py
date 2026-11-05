"""p230c: fotos da criação do personagem (só para conferir o visual novo): PC 1280×720 (corpo inteiro, rosto de perto, costas),
celular em pé e deitado; e a versão de antes no PC, para comparar."""
import sys, os, json; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
ABRE = [["wait", 2], ["js", "(()=>{const c=JSON.parse(localStorage.getItem('nnc_cfg_v1')||'{}');c.graf='alto';localStorage.setItem('nnc_cfg_v1',JSON.stringify(c));})()"], ["reload"], ["wait", 2.5],
        js("for(const k of[X('SAVE_KEY'),X('SAVE_BAK'),X('SAVE_DIA'),X('SAVE_RUIM')])localStorage.removeItem(k);X('mostrarMenu')();"), ["wait", 0.3],
        ["click", "#m-novo", "criacao"], ["wait", 1.0]]
FIXA = ("const C=X('CRIA');C.zoom=C.zoomAlvo;C.ang=C.angAlvo;C.sujo=null;C.fila=[];X('criaPose')();X('criaCapturar')('retrato');X('criaCamera')('palco');X('render')();"
        "{const gl=X('gl'),px=new Uint8Array(4);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);}")   # um quadro desenhado na hora (no modo rápido o laço não desenha); a foto pega esse quadro   # câmera já no lugar (no computador sem placa de vídeo cada quadro leva segundos)
def foto(nome, c, esp=0.5):
    return [js(c), ["wait", 0.3], js(FIXA), ["wait", esp], ["shot", nome]]
pc = ABRE + foto("640_cria_pc.png", "") + \
     foto("641_cria_pc_rosto.png", "document.querySelector('#cr-nav [data-aba=\"cabelo\"]').click();") + \
     foto("642_cria_pc_costas.png", "document.querySelector('#cr-nav [data-aba=\"corpo\"]').click();document.querySelector('#cr-vistas [data-vista=\"costas\"]').click();")
cel = ABRE + foto("643_cria_cel.png", "")
dei = ABRE + foto("644_cria_deitado.png", "")
plan = [["pc", {"viewport": {"width": 1280, "height": 720}}, pc],
        ["cel", {"viewport": {"width": 390, "height": 844}, "is_mobile": True, "has_touch": True, "device_scale_factor": 2}, cel],
        ["deitado", {"viewport": {"width": 844, "height": 390}, "is_mobile": True, "has_touch": True, "device_scale_factor": 2}, dei]]
json.dump(plan, open('tools/p230c_fotos.json', 'w'))
antes = [["pc", {"viewport": {"width": 1280, "height": 720}}, ABRE + foto("645_cria_pc_antes.png", "")]]
json.dump(antes, open('tools/p230c_antes.json', 'w')); print('ok')
