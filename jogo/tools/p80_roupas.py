"""p80: roupas de couro/pele no Akai (casco sobre o corpo) e mochila nas costas."""
import json, os
A = ("const n=__nnc,C=n.CID,P=n.P,G=n.G;"
     "const cam=(dx,dy,dz,tx,ty,tz)=>{G.camFix={pos:[P.x+dx,P.y+dy,P.z+dz],tgt:[P.x+tx,P.y+ty,P.z+tz]};};")
def js(c): return ["js", "(()=>{" + A + c + "})()"]
def foto(nome, c, antes=0.3):
    return [js(c), ["gwait", antes], js("window.__turbo=1;window.__semRender=false;"), ["wait", 3], ["shot", nome], ["js", "window.__semRender=true;window.__turbo=6;"]]
steps = [["wait", 2], ["click", "#m-novo"], ["wait", 1.5],
         js("G.hora=11;G.chuva=0;n.Z.length=0;P.x=n.FIRE[0]+4;P.z=n.FIRE[2]-5;P.y=n.chaoEm(P.x,P.z,1);P.vy=0;P.yaw=0;P.body=0;document.getElementById('teclas')&&(document.getElementById('teclas').hidden=true);n.cfg.cam='3';"
            "P.roupa.cabeca='gorroPele';P.roupa.tronco='casacoPele';P.roupa.pernas='calcaCouro';P.roupa.pes='botasCouro';P.roupa.costas='mochilaRef';"), ["gwait", 0.5]]
steps += foto("227_roupa_frente.png", "P.yaw=0;P.body=0;cam(0.6,1.3,2.6,0,1.0,0);")
steps += foto("228_roupa_costas.png", "cam(-1.0,1.5,-2.6,0,1.1,0);")
steps += foto("229_camisa.png", "P.roupa.tronco='camisaCouro';P.roupa.cabeca=null;P.roupa.costas='mochila';cam(1.6,1.3,2.0,0,1.0,0);")
steps += [js("G.camFix=null;")]
plan = [["desk", {"viewport": {"width": 960, "height": 540}}, steps]]
json.dump(plan, open(os.path.join(os.path.dirname(__file__), '..', 'p80.json'), 'w'), ensure_ascii=False)
print('ok', len(steps))
