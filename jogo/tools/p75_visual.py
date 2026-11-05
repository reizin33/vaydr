"""p75: fotos da cidade ampliada (hotel e torre, delegacia, casas, posto, armazém por dentro, distrito industrial, praça, vista de longe)."""
import json, os
def js(c): return ["js", "(()=>{const n=__nnc,P=n.P,G=n.G,C=n.CID;" + c + "})()"]
def foto(nome, pos, tgt, extra="", antes=0.3):
    return [js("n.Z.length=0;G.camFix={pos:%s,tgt:%s};%s" % (json.dumps(pos), json.dumps(tgt), extra)), ["gwait", antes],
            js("n.Z.length=0;window.__turbo=0;window.__semRender=false;"), ["wait", 3], ["shot", nome], ["js", "window.__semRender=true;window.__turbo=6;"]]
steps = [["wait", 2], ["click", "#m-novo"], ["wait", 1.5], js("G.hora=9.5;n.Z.length=0;const t=document.getElementById('teclas');if(t)t.hidden=true;"), ["gwait", 0.3]]
steps += foto("204_hotel_torre.png", [255.5, 2.6, 5.5], [282, 12.5, 27], "P.x=255;P.z=4;P.y=0;")
steps += foto("205_delegacia.png", [276, 3.2, -3.5], [270, 3.0, -24], "P.x=276;P.z=-3;P.y=n.chaoEm(276,-3,1);")
steps += foto("206_casas.png", [203, 3.0, -45.5], [184, 3.4, -58.5], "P.x=203;P.z=-45;P.y=0;")
steps += foto("207_posto.png", [197, 3.6, 1.5], [181, 2.2, -15], "P.x=197;P.z=1;P.y=0;")
steps += foto("208_armazem.png", [316.5, 2.4, 21.2], [327, 1.2, 30.5], "P.x=316.5;P.z=21.2;P.y=0.27;P.lanterna=true;")
steps += foto("209_industrial.png", [299, 3.2, 62], [325, 9, 44], "P.lanterna=false;P.x=299;P.z=62;P.y=0;")
steps += foto("210_praca.png", [262.5, 3.4, -49.5], [280, 1.4, -64], "P.x=262.5;P.z=-49.5;P.y=0;")
steps += foto("211_cidade_longe.png", [138, 9, 12], [262, 13, 16], "P.x=138;P.z=12;P.y=n.ground(138,12);")
steps += [js("G.camFix=null;")]
plan = [["desk", {"viewport": {"width": 960, "height": 540}}, steps]]
json.dump(plan, open(os.path.join(os.path.dirname(__file__), '..', 'p75.json'), 'w'), ensure_ascii=False)
print('ok', len(steps))
