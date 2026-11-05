"""p77: fotos de conferência — letreiros (HOTEL/IMPERIAL, POLICIA, FARMACIA, ARMAZEM, LOJA), porão, sala de uma casa, prancha de lado."""
import json, os
A = ("const n=__nnc,C=n.CID,P=n.P,G=n.G,W=(p,u,v)=>[p.ox+u*p.c+v*p.s,p.oz-u*p.s+v*p.c],"
     "por=(p,u,v,y)=>{const w=W(p,u,v);P.x=w[0];P.z=w[1];P.y=y;P.vy=0;P.vx=P.vz=0;P.escala=null;P.noChao=true;},"
     "mira=(x,z,pit)=>{const a=Math.atan2(x-P.x,z-P.z);P.yaw=a;P.body=a;P.pitch=pit||0;},"
     "fach=(p,du,dist,yc,yt)=>{const c=W(p,p.W/2+du,-dist),t=W(p,p.W/2+du,0);por(p,p.W/2+du,-dist+1,n.chaoEm(c[0],c[1],1));G.camFix={pos:[c[0],p.y0+yc,c[1]],tgt:[t[0],p.y0+yt,t[1]]};},"
     "B=f=>C.predios.find(f);")
def js(c): return ["js", "(()=>{" + A + c + "})()"]
def foto(nome, c, antes=0.3):
    return [js(c), ["gwait", antes], js("n.Z.length=0;window.__turbo=0;window.__semRender=false;"), ["wait", 3], ["shot", nome], ["js", "window.__semRender=true;window.__turbo=6;"]]
steps = [["wait", 2], ["click", "#m-novo"], ["wait", 1.5],
         js("G.hora=10;n.Z.length=0;for(const[k,q]of[['tabuas',20],['pregos',20],['corda',4]])n.invAdd(k,q);document.getElementById('teclas')&&(document.getElementById('teclas').hidden=true);"), ["gwait", 0.3]]
steps += foto("212_hotel.png", "n.cfg.cam='3';fach(B(q=>q.tipo==='hotel'),-3,17,4.5,6.5);")
steps += foto("213_policia.png", "fach(B(q=>q.tipo==='policia'),0,10,2.6,3.3);")
steps += foto("214_farmacia.png", "fach(B(q=>q.tipo==='farmacia'),0,8,2.4,3.0);")
steps += foto("215_armazem.png", "fach(B(q=>q.nome==='Armazém Sul'),0,11,2.8,3.2);")
steps += foto("216_loja.png", "fach(B(q=>q.placa==='LOJA'),0,7,2.4,3.1);")
steps += [js("G.camFix=null;")]
steps += foto("217_porao.png", "n.cfg.cam='1';const a=C.poroes[0],s=a.sala,p=a.p;por(p,(s.u0+s.u1)/2+0.2,s.v1-0.5,s.y);const c=a.cont;mira(c.x,c.z,-0.28);P.lanterna=true;")
steps += foto("218_casa.png", "const p=B(q=>q.casa&&q.andares===2),s=p.salas[0].find(q=>q.tipo==='sala_casa');por(p,s.u0+0.5,s.v0+0.5,p.y0);const w=W(p,s.u1,s.v1);mira(w[0],w[1],-0.1);P.lanterna=false;")
steps += [js("const ce=C.predios[1];n.cfg.cam='3';P.x=241.5;P.z=33.4;P.y=ce.yTopo;P.vy=0;P.yaw=0;P.body=0;n.modoObra(true);n.OBRA.tipo='prancha';n.OBRA.ctx=n.contextoObra();n.obraAlvo();n.colocarObra();n.modoObra(false);"), ["gwait", 0.3]]
steps += foto("219_prancha_lado.png", "P.x=241.5;P.z=31.5;P.y=C.predios[1].yTopo;P.vy=0;G.camFix={pos:[234.6,15.1,36.75],tgt:[241.5,13.9,36.75]};")
steps += [js("G.camFix=null;")]
plan = [["desk", {"viewport": {"width": 960, "height": 540}}, steps]]
json.dump(plan, open(os.path.join(os.path.dirname(__file__), '..', 'p77.json'), 'w'), ensure_ascii=False)
print('ok', len(steps))
