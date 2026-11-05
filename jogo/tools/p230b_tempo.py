"""p230b: quanto leva um quadro da tela de criação (para saber por que a foto não sai) — no modo rápido, sem desenhar sozinho."""
import sys, os, json; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
MED = ("const med=(g)=>{n.cfg.graf=g;n.aplicarCfg&&n.aplicarCfg();const t=[];for(let i=0;i<3;i++){const a=performance.now();X('criaCamera')('palco');X('render')();const gl=X('gl'),px=new Uint8Array(4);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);t.push(Math.round(performance.now()-a));}return t;};")
s = [["wait", 2], js("for(const k of[X('SAVE_KEY'),X('SAVE_BAK'),X('SAVE_DIA'),X('SAVE_RUIM')])localStorage.removeItem(k);X('mostrarMenu')();"), ["wait", 0.3],
     ["click", "#m-novo", "criacao"], ["wait", 1.5],
     ev("tempos", MED + "const r={modo:G.modo,W:X('W'),H:X('H'),canvas:[X('canvas').width,X('canvas').height]};for(const g of['baixo','medio','alto'])r[g]=med(g);"
        "const a=performance.now();X('criaCapturar')('retrato');{const gl=X('gl'),px=new Uint8Array(4);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);}r.retrato=Math.round(performance.now()-a);return r;")]
plan = [["pc", {"viewport": {"width": 1280, "height": 720}}, s]]
json.dump(plan, open('tools/p230b_tempo.json', 'w')); print('ok')
