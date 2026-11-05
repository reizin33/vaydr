"""p89: zumbis novos (rastejante, policial, inchado, cachorro) e chefes de região."""
import json, os
A = ("const n=__nnc,P=n.P,G=n.G,Z=n.Z,F=n.FIRE,"
     "vai=(x,z,y)=>{P.x=x;P.z=z;P.y=(y===undefined?n.chaoEm(x,z,5):y);P.vy=0;P.vx=P.vz=0;P.escala=null;P.muro=null;P.noChao=true;},"
     "vivo=()=>{if(!P.alive){n.renascer();}G.modo='jogo';P.vida=100;},"
     "r2=v=>Math.round(v*100)/100,ZZ=(t,x,z,o)=>{const q=n.criarZ(t,x,z,Object.assign({y:n.chaoEm(x,z,50)},o||{}));return q;};")
def js(c): return ["js", "(()=>{" + A + c + "})()"]
def ev(nome, c): return ["eval", nome, "(()=>{" + A + c + "})()"]
def foto(nome, c, antes=0.3):
    return [js(c), ["gwait", antes] if antes else ["wait", 0.01], js("G.modo=G.modo==='jogo'?'pausa':G.modo;window.__turbo=1;window.__semRender=false;"), ["wait", 3.0], ["shot", nome], js("window.__semRender=true;window.__turbo=6;if(G.modo==='pausa')G.modo='jogo';")]
def ao_vivo(nome, c, antes=0.3):
    return [js(c), ["gwait", antes], js("window.__turbo=1;window.__semRender=false;"), ["wait", 2.2], ["shot", nome], js("window.__semRender=true;window.__turbo=6;")]
steps = [["wait", 2], ["click", "#m-novo"], ["wait", 1.5],
         js("n.cfg.graf='alto';n.aplicarCfg&&n.aplicarCfg();document.getElementById('teclas')&&(document.getElementById('teclas').hidden=true);n.cfg.cam='3';G.hora=10;Z.length=0;P.vida=100;G.chuva=0;G.chuvaAlvo=0;"),
         ["gwait", 0.3]]
# 1) vitrine: cada tipo parado numa estrada aberta (o jogador fica longe, fora da vista)
VX, VZ = "n.FIRE[0]+40", "n.FIRE[2]+2"
steps += [js(f"Z.length=0;const x0={VX},z0={VZ};vai(x0-70,z0);window.__q={{}};for(const[t,dx]of[['rastejante',-3.2],['policial',-1.1],['inchado',1.1],['caoZ',3.0]]){{const q=ZZ(t,x0+dx,z0);q.st='vaga';q.idleT=999;q.ch.yaw=Math.PI;q.ax=q.x;q.az=q.z;window.__q[t]=q;}}"),
          ["gwait", 0.5],
          ev("tipos", "const o={};for(const t in window.__q){const q=window.__q[t];o[t]={hp:q.hp,s:r2(q.ch.s),roupas:(q.ch.roupas||[]).length,cap:q.capacete||0,sk:!!q.ch.sk,st:q.st,pitch:r2(q.ch.pitch),y:r2(q.ch.y-q.y)};}return o;")]
steps += foto("280_zumbis_novos.png", f"const x0={VX},z0={VZ},y0=n.chaoEm(x0,z0,50);G.camFix={{pos:[x0+0.4,y0+1.6,z0-5.2],tgt:[x0,y0+0.8,z0]}};", 0.1)
steps += foto("281_rastejante.png", "const q=window.__q.rastejante;q.ch.yaw=Math.PI/2;G.camFix={pos:[q.x+0.6,q.y+0.9,q.z-2.6],tgt:[q.x,q.y+0.25,q.z]};", 0.2)
steps += foto("282_policial.png", "const q=window.__q.policial;q.ch.yaw=Math.PI;G.camFix={pos:[q.x-0.35,q.y+1.7,q.z-1.9],tgt:[q.x,q.y+1.35,q.z]};", 0.1)
steps += foto("282b_cachorro.png", "const q=window.__q.caoZ;q.ch.yaw=Math.PI+0.6;G.camFix={pos:[q.x-0.9,q.y+0.8,q.z-1.6],tgt:[q.x,q.y+0.4,q.z]};", 0.1)
steps += foto("282c_inchado.png", "const q=window.__q.inchado;q.ch.yaw=Math.PI;G.camFix={pos:[q.x+0.2,q.y+1.5,q.z-2.1],tgt:[q.x,q.y+1.1,q.z]};", 0.1)
# 2) mira: corpo baixo do rastejante e do cachorro
steps += [ev("corpo_baixo", "const q=window.__q.rastejante,C=n.zCorpo(q),fx=Math.sin(q.ch.yaw),fz=Math.cos(q.ch.yaw);"
             "const alvoCab=[q.x+fx*0.72,q.y+0.3,q.z+fz*0.72],o=[q.x+fx*6,q.y+1.6,q.z+fz*6],d=[alvoCab[0]-o[0],alvoCab[1]-o[1],alvoCab[2]-o[2]],L=Math.hypot(...d);d[0]/=L;d[1]/=L;d[2]/=L;"
             "const r=n.raySeg(o,d,C.a,C.b);const o2=[q.x+fx*6,q.y+1.5,q.z+fz*6],d2=[-fx,0,-fz],r2_=n.raySeg(o2,d2,C.a,C.b);"
             "const c=window.__q.caoZ,Cc=n.zCorpo(c),rc=n.raySeg([c.x,c.y+1.5,c.z-6],[0,0,1],Cc.a,Cc.b);"
             "return{cabeca:r.dist<C.r&&r.u>C.cab,tiroAlto:r2_.dist<C.r,altoDist:r2(r2_.dist),caoAlto:rc.dist<Cc.r};")]
# 3) policial: colete e capacete (2 tiros); depois o capacete cai no chão
steps += [ev("policial", "const q=window.__q.policial,h0=q.hp;n.ZHIT={k:'bala',head:false,arma:'pistola'};n.ferirZ(q,30,0,0,0);const peito=r2(h0-q.hp);"
             "const h1=q.hp;n.ZHIT={k:'bala',head:true,arma:'pistola'};n.ferirZ(q,30*2.6,0,0,1);const cab1=r2(h1-q.hp),cap1=q.capacete;"
             "n.ZHIT={k:'bala',head:true,arma:'pistola'};n.ferirZ(q,30*2.6,0,0,1);const cap2=q.capacete;"
             "const h3=q.hp;n.ZHIT={k:'bala',head:true,arma:'pistola'};n.ferirZ(q,10*2.6,0,0,1);"
             "const q2=ZZ('policial',q.x+1,q.z+1);q2.st='vaga';q2.idleT=999;const h4=q2.hp;n.ZHIT={k:'bala',head:true,arma:'espingarda'};n.ferirZ(q2,20,0,0,1);"
             "return{peito,cab1,cap1,cap2,cabSem:r2(h3-q.hp),vivo:q.vivo,espingardaCap:q2.capacete,espingardaDano:r2(h4-q2.hp)};"),
          ["gwait", 2.0], ev("capacete_chao", "return{n:n.CAPACETES?n.CAPACETES.length:-1};")]
steps += foto("282d_capacete_caiu.png", "const q=window.__q.policial;G.camFix={pos:[q.x-1.6,q.y+1.6,q.z-2.4],tgt:[q.x,q.y+0.6,q.z]};", 0.1)
# 4) inchado: tiro de longe vira nuvem; dentro dela você tosse e perde vida; fogo explode
steps += [js("G.camFix=null;const q=window.__q.inchado;n.ZHIT={k:'bala',head:false,arma:'pistola'};n.ferirZ(q,999,0,0,1);"), ["gwait", 0.4],
          ev("inchado_morreu", "const g=n.GAS[0];return{nuvens:n.GAS.length,r:g&&g.r,vivo:window.__q.inchado.vivo};"),
          js("for(const q of Z)if(q.vivo&&q!==window.__q.inchado)q.vivo=false;Z.length=0;const g=n.GAS[0];vai(g.x+0.5,g.z+0.3);vivo();"), ["gwait", 3.0],
          ev("dentro_gas", "return{vida:Math.round(P.vida),vivo:P.alive,gas:r2(P.gas),tela:!document.getElementById('gas-tela').hidden};")]
steps += ao_vivo("283_gas.png", "const g=n.GAS[0];vai(g.x+6,g.z-6);P.vida=100;G.camFix={pos:[g.x+4.5,g.y+2.2,g.z-5.5],tgt:[g.x,g.y+0.8,g.z]};", 0.2)
steps += [js("G.camFix=null;vivo();const g=n.GAS[0];vai(g.x+12,g.z+12);window.__zg=ZZ('walker',g.x+0.8,g.z+0.5);window.__zg.st='vaga';window.__zg.idleT=999;window.__zgh=window.__zg.hp;n.CHAMAS.push({x:g.x-0.5,y:g.y,z:g.z,r:1.5,t:0,dur:4,rr:1.5,k:1});"),
          ["gwait", 0.5],
          ev("gas_explode", "const g=n.GAS[0];return{explodiu:!g||!!g.explodiu,zumbi:Math.round(window.__zgh-window.__zg.hp),vivo:window.__zg.vivo,jogador:Math.round(P.vida)};")]
# 5) inchado que chega perto estufa e estoura sozinho
steps += [js("n.GAS.length=0;n.CHAMAS.length=0;Z.length=0;vai(F[0]+30,F[2]+30);vivo();const q=ZZ('inchado',P.x+3.5,P.z);q.st='caca';q.viu=0;q.lx=P.x;q.lz=P.z;q.ly=P.y;window.__inc=q;"),
          ["gwait", 4.0],
          ev("inchado_perto", "const q=window.__inc;return{estourou:!!q.estourou,vivo:q.vivo,nuvens:n.GAS.length,vida:Math.round(P.vida)};")]
# 6) matilha: corre, morde e recua
steps += [js("n.GAS.length=0;Z.length=0;vai(F[0]-30,F[2]+30);vivo();window.__rec=0;window.__cadaPasso=dt=>{for(const q of n.Z)if(q.tipo==='caoZ'&&q.recua>0)window.__rec+=dt;};"
             "for(let k=0;k<3;k++){const q=ZZ('caoZ',P.x+9+k,P.z+7);q.st='caca';q.viu=0;q.lx=P.x;q.lz=P.z;q.ly=P.y;}"),
          ["gwait", 4.0],
          ev("matilha", "const c=Z.filter(q=>q.tipo==='caoZ');return{caes:c.length,vida:Math.round(P.vida),recuou:r2(window.__rec),perto:c.filter(q=>Math.hypot(q.x-P.x,q.z-P.z)<4).length};"),
          js("window.__cadaPasso=null;")]
steps += ao_vivo("284_matilha.png", "vivo();G.camFix={pos:[P.x+3.5,P.y+1.4,P.z-3.5],tgt:[P.x,P.y+0.4,P.z+1]};", 0.1)
steps += [js("G.camFix=null;Z.length=0;vivo();"), ev("onda_caes", "n.ondaCaes(5);return{novos:Z.filter(q=>q.tipo==='caoZ').length};"),
          ev("cidade_tipos", "const c={};const a={p:{nome:'Delegacia do 4º Distrito'}};for(let i=0;i<400;i++){const t=n.tipoCidade2('walker',false,true,a);c[t]=(c[t]||0)+1;}const b={};for(let i=0;i<400;i++){const t=n.tipoCidade2('walker',true,false,{});b[t]=(b[t]||0)+1;}return{delegacia:c,rua:b};"),
          js("Z.length=0;")]
# 7) chefes de região: cada um no seu lugar (fotos com o chefe parado)
for i, cid in enumerate(["acougueiro", "sargento", "pacienteZero", "maquinista", "fazendeiro"]):
    steps += [js(f"Z.length=0;vivo();const d=n.CHEFE_R_DEF('{cid}'),L=n.lugarChefeR(d);window.__L=L;if(L){{vai(L.x+5,L.z+5,L.y);}}"), ["gwait", 1.6],
              ev(f"chefe_{cid}", f"const L=window.__L,q=Z.find(z=>z.chefeId==='{cid}');return{{lugar:L?[r2(L.x),r2(L.y),r2(L.z)]:null,nasceu:!!q,nome:q&&q.nomeChefe,hp:q&&q.hp,s:q&&r2(q.ch.s),roupas:q&&(q.ch.roupas||[]).length,st:q&&q.st,cap:q&&q.capacete}};")]
    steps += foto(f"29{i}_chefe_{cid}.png",
                  f"const q=Z.find(z=>z.chefeId==='{cid}');for(const o of Z)if(o!==q)o.vivo=false;if(q){{q.st='vaga';q.idleT=999;q.ax=q.x;q.az=q.z;const a=Math.atan2(P.x-q.x,P.z-q.z);q.ch.yaw=a;const s=q.ch.s||1;G.camFix={{pos:[q.x+Math.sin(a)*3.0*s,q.y+1.5*s,q.z+Math.cos(a)*3.0*s],tgt:[q.x,q.y+1.1*s,q.z]}};}}", 0.1)
    steps += [js("G.camFix=null;")]
# barra de chefe com o nome; golpe giratório do Açougueiro; morte e espólio
steps += [js("Z.length=0;vivo();const d=n.CHEFE_R_DEF('acougueiro'),L=n.lugarChefeR(d);vai(L.x+5,L.z,L.y);"), ["gwait", 1.6],
          js("const q=Z.find(z=>z.chefeId==='acougueiro');vai(q.x+2.2,q.z,q.y);q.st='caca';q.viu=0;q.lx=P.x;q.lz=P.z;q.ly=P.y;q.chefeR.cd1=0;vivo();window.__giro=0;window.__cadaPasso=dt=>{if(q.chefeR.fase==='giro')window.__giro+=dt;};"), ["gwait", 2.2],
          ev("acougueiro_giro", "const q=Z.find(z=>z.chefeId==='acougueiro');const b=document.getElementById('chefe');return{barra:!b.hidden,nome:b.querySelector('.chefe-n').textContent,vida:Math.round(P.vida),giro:r2(window.__giro),cd:r2(q.chefeR.cd1)};"),
          js("window.__cadaPasso=null;vivo();const q=Z.find(z=>z.chefeId==='acougueiro');window.__d0=n.DROPS.length;n.ferirZ(q,99999,0,0,1);"), ["gwait", 0.5],
          ev("acougueiro_morto", "return{st:G.chefesR.acougueiro.st,drops:n.DROPS.length-window.__d0,itens:n.DROPS.slice(window.__d0).map(d=>d.itens.map(i=>i[0]+'x'+i[1]).join(',')).join(' | ')};"),
          js("vivo();n.salvarJogo();n.carregarJogo();"), ["gwait", 0.3],
          ev("salvo", "return{acougueiro:G.chefesR.acougueiro.st,sargento:G.chefesR.sargento.st,visto:G.chefesR.sargento.visto};")]
plan = [["desk", {"viewport": {"width": 1280, "height": 720}}, steps]]
json.dump(plan, open(os.path.join(os.path.dirname(__file__), '..', 'p89.json'), 'w'), ensure_ascii=False)
print('ok', len(steps))
