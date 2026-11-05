"""auxiliares comuns dos testes novos (prompt mestre e expansões): os passos usam o gancho __nnc e n.ev(...) para ler o escopo interno do jogo."""
import json
A = ("const n=__nnc,P=n.P,G=n.G,Z=n.Z,F=n.FIRE,X=s=>n.ev(s),"
     "vai=(x,z,y)=>{P.x=x;P.z=z;P.y=(y===undefined?n.chaoEm(x,z,5):y);P.vy=0;P.vx=P.vz=0;P.escala=null;P.muro=null;P.noChao=true;},"
     "vivo=()=>{if(!P.alive){n.renascer();}G.modo='jogo';P.vida=100;},"
     "r2=v=>Math.round(v*100)/100,ZZ=(t,x,z,o)=>n.criarZ(t,x,z,Object.assign({y:n.chaoEm(x,z,50)},o||{})),"
     "sel=id=>{const i=P.inv.findIndex(q=>q&&q.id===id);if(i>=0&&i>5){const j=P.inv.slice(0,6).findIndex(q=>!q);const k=j>=0?j:0;const t=P.inv[k];P.inv[k]=P.inv[i];P.inv[i]=t;n.selecionar(k);return P.inv[k];}if(i>=0){n.selecionar(i);return P.inv[i];}return null;},"
     "conta=id=>X('invCount')(id),"
     "mira=(x,y,z)=>{const dx=x-P.x,dz=z-P.z;P.yaw=Math.atan2(dx,dz);P.body=P.yaw;const hy=P.y+1.55;P.pitch=Math.atan2(y-hy,Math.hypot(dx,dz));};")
def js(c): return ["js", "(()=>{" + A + c + "})()"]
def ev(nome, c): return ["eval", nome, "(()=>{" + A + c + "})()"]
def foto(nome, c, antes=0.3, esp=3.0):
    return [js(c), ["gwait", antes] if antes else ["wait", 0.01], js("G.modo=G.modo==='jogo'?'pausa':G.modo;window.__turbo=1;window.__semRender=false;"), ["wait", esp], ["shot", nome], js("window.__semRender=true;window.__turbo=6;if(G.modo==='pausa')G.modo='jogo';")]
def inicio(extra=""):
    return [["wait", 2], ["click", "#m-novo"], ["wait", 1.5],
            js("n.cfg.graf='alto';n.aplicarCfg&&n.aplicarCfg();document.getElementById('teclas')&&(document.getElementById('teclas').hidden=true);n.cfg.cam='3';G.hora=10;Z.length=0;P.vida=100;" + extra),
            ["gwait", 0.3]]
def salvar(nome, steps, vp=(1280, 720)):
    plan = [["desk", {"viewport": {"width": vp[0], "height": vp[1]}}, steps]]
    json.dump(plan, open(nome, 'w'))
    print('ok', len(steps))
