"""p68: imagens das novidades da cidade (poço do elevador, cabine, entulho, térreo alagado, fumaça, painel solto, prancha) e o corredor de novo."""
import json, os
A = ("const n=__nnc,C=n.CID,P=n.P,G=n.G,W=(p,u,v)=>[p.ox+u*p.c+v*p.s,p.oz-u*p.s+v*p.c],"
     "por=(p,u,v,y)=>{const w=W(p,u,v);P.x=w[0];P.z=w[1];P.y=y;P.vy=0;P.vx=P.vz=0;P.escala=null;P.noChao=true;},"
     "olha=(p,du,dv,pit)=>{const x=du*p.c+dv*p.s,z=-du*p.s+dv*p.c,a=Math.atan2(x,z);P.yaw=a;P.body=a;P.pitch=pit||0;},"
     "au=C.predios[0],E=au.poco,bv=C.predios[5],of=C.predios[4],ce=C.predios[1];")
def js(c): return ["js", "(()=>{" + A + c + "})()"]
def foto(nome, c, antes=0.3):
    return [js(c), ["gwait", antes], js("n.Z.length=0;window.__turbo=0;window.__semRender=false;"), ["wait", 3], ["shot", nome], ["js", "window.__semRender=true;window.__turbo=6;"]]
steps = [["wait", 2], ["click", "#m-novo"], ["wait", 1.5],
         js("G.hora=10;n.Z.length=0;n.invAdd('peDeCabra',1);for(const[k,q]of[['tabuas',20],['pregos',20],['corda',4]])n.invAdd(k,q);"
            "n.portaUsar(E.portas[2],true);n.portaUsar(E.portas[1],true);n.Z.length=0;G.cid.elevZ[au.id]=1;"), ["gwait", 0.3]]
steps += foto("195_poco.png", "n.cfg.cam='1';por(au,au.uc+0.35,E.vD,au.y0+2*au.H);olha(au,1,0,-0.55);P.lanterna=true;")
steps += foto("196_cabine.png", "n.cfg.cam='1';por(au,E.uA+0.35,E.vD,E.yc);olha(au,1,0.25,-0.05);P.lanterna=true;")
steps += foto("197_entulho.png", "n.cfg.cam='1';por(bv,bv.uc-0.3,bv.vS+0.3,bv.y0+2*bv.H);olha(bv,-0.25,1,0.12);P.lanterna=true;")
steps += foto("198_alagado.png", "n.cfg.cam='3';por(bv,bv.uc,3.0,bv.y0);olha(bv,0,1,-0.08);P.lanterna=true;")
steps += foto("199_fumaca.png", "n.cfg.cam='3';const f=C.fumacas[0];por(of,f.u-0.3,f.v-2.4,of.y0);olha(of,0.1,1,0.05);P.lanterna=true;", antes=5)
steps += foto("200_painel.png", "n.cfg.cam='1';const c=au.esconderijoC;por(au,c.u-0.3,c.v-1.6,c.sala.y);olha(au,0.15,1,-0.18);P.lanterna=true;")
steps += [js("P.lanterna=false;n.cfg.cam='3';P.x=241.5;P.z=33.4;P.y=ce.yTopo;P.vy=0;P.yaw=0;P.body=0;n.modoObra(true);n.OBRA.tipo='prancha';n.OBRA.ctx=n.contextoObra();n.obraAlvo();n.colocarObra();n.modoObra(false);"), ["gwait", 0.3]]
steps += foto("201_prancha.png", "n.cfg.cam='3';P.x=239.6;P.z=31.6;P.y=ce.yTopo;P.vy=0;const a=Math.atan2(241.5-P.x,38-P.z);P.yaw=a;P.body=a;P.pitch=-0.1;")
steps += foto("202_corredor.png", "n.cfg.cam='1';P.lanterna=false;por(au,au.uc,4.5,au.y0);olha(au,0,1,-0.02);")
plan = [["desk", {"viewport": {"width": 960, "height": 540}}, steps]]
json.dump(plan, open(os.path.join(os.path.dirname(__file__), '..', 'p68.json'), 'w'), ensure_ascii=False)
print('ok', len(steps))
