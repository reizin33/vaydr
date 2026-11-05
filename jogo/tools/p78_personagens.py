"""p78: fotos dos personagens novos (Akai e zumbi Yaku): parado, andando, zumbis em grupo."""
import json, os
A = ("const n=__nnc,C=n.CID,P=n.P,G=n.G;"
     "const cam=(dx,dy,dz,tx,ty,tz)=>{G.camFix={pos:[P.x+dx,P.y+dy,P.z+dz],tgt:[P.x+tx,P.y+ty,P.z+tz]};};")
def js(c): return ["js", "(()=>{" + A + c + "})()"]
def ev(nome, c): return ["eval", nome, "(()=>{" + A + c + "})()"]
def foto(nome, c, antes=0.3):
    return [js(c), ["gwait", antes], js("window.__turbo=1;window.__semRender=false;"), ["wait", 3], ["shot", nome], ["js", "window.__semRender=true;window.__turbo=6;"]]
steps = [["wait", 2], ["click", "#m-novo"], ["wait", 1.5],
         js("G.hora=11;n.Z.length=0;P.x=n.FIRE[0]+4;P.z=n.FIRE[2]-5;P.y=n.chaoEm(P.x,P.z,1);P.vy=0;document.getElementById('teclas')&&(document.getElementById('teclas').hidden=true);n.cfg.cam='3';"), ["gwait", 0.5],
         ev("sk", "return{akai:!!(P.ch.sk&&P.ch.sk.t.pronto),mesh:P.ch.sk&&P.ch.sk.t.mesh.count};")]
steps += foto("220_akai_frente.png", "P.yaw=0;P.body=0;n.Z.length=0;cam(0.2,1.3,3.2,0,1.0,0);")
steps += foto("221_akai_costas.png", "cam(-1.2,1.6,-3.0,0,1.0,0);")
steps += [js("P.yaw=Math.PI/2;P.body=Math.PI/2;"), ["down", "w"], ["gwait", 0.6]]
steps += foto("222_akai_andando.png", "cam(0.0,1.2,3.6,0,1.0,0);", antes=0.4)
steps += [["up", "w"]]
steps += foto("223_zumbis.png", "n.Z.length=0;P.yaw=0;P.body=0;const t=['walker','runner','brute','walker'];for(let i=0;i<4;i++){const z=n.criarZ(t[i],P.x-3+i*2,P.z+6+(i%2)*1.5,{});if(z){z.st='vaga';}}cam(0,1.7,-1.5,0,1.0,6);", antes=1.0)
steps += [js("G.camFix=null;")]
plan = [["desk", {"viewport": {"width": 960, "height": 540}}, steps]]
json.dump(plan, open(os.path.join(os.path.dirname(__file__), '..', 'p78.json'), 'w'), ensure_ascii=False)
print('ok', len(steps))
