"""p230a: a tela de criação como está (antes da reforma visual), para comparar: PC 1280×720 e 1920×1080, celular em pé."""
import sys, os, json; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
def passos(nome):
    return [["wait", 2], ["js", "(()=>{const c=JSON.parse(localStorage.getItem('nnc_cfg_v1')||'{}');c.graf='medio';localStorage.setItem('nnc_cfg_v1',JSON.stringify(c));})()"], ["reload"], ["wait", 2.5], js("for(const k of[X('SAVE_KEY'),X('SAVE_BAK'),X('SAVE_DIA'),X('SAVE_RUIM')])localStorage.removeItem(k);X('mostrarMenu')();"), ["wait", 0.3],
            ["click", "#m-novo"], ["wait", 0.8], js("window.__semRender=false;window.__turbo=1;"), ["wait", 8], ["shot", nome]]
plan = [["pc", {"viewport": {"width": 1280, "height": 720}}, passos("630_cria_antes_pc.png")],
        ["hd", {"viewport": {"width": 1920, "height": 1080}}, passos("631_cria_antes_hd.png")],
        ["cel", {"viewport": {"width": 390, "height": 844}, "is_mobile": True, "has_touch": True, "device_scale_factor": 2}, passos("632_cria_antes_cel.png")]]
json.dump(plan, open('tools/p230a_criacao_antes.json', 'w')); print('ok')
