"""p187: Etapa 18, reboques: os dois reboques do mapa (cais e sítio); engatar na lança (caminhonete parada com a traseira perto);
dirigir com reboque (segue o engate; acelera, corre e freia menos e gasta mais que sem reboque); ré dobra e trava; desengatar;
guincho do reboque de barco (puxa o barco do lago), prender com corda, pôr o barco na água; plataforma: guincho puxa o carro
quebrado, carga solta cai numa freada forte, presa não cai, descer pela rampa; compatibilidade (moto sem engate, triciclo fraco,
carro com moto na plataforma); guincho da caminhonete; construir um reboque na aba Oficina; salvar e carregar sem perder nem
duplicar veículo."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const ob=t=>X('REBOQUES').filter(r=>r.tipo===t),V=id=>X('VEICS').find(v=>v.id===id),cam=X('cam'),O=()=>X('OBRA'),"
     "rb=id=>X('REBOQUES').find(r=>r.id===id),"
     "dar=o=>{for(const k in o)n.invAdd(k,o[k]);},ult=()=>{const f=document.getElementById('feed');return f&&f.lastElementChild?f.lastElementChild.textContent:'';},"
     "loc=(r,lx,ly,lz)=>X('rbLocal')(r,lx,ly,lz),hitch=v=>X('rbEngatePt')(v),lanca=r=>X('rbLancaPt')(r),"
     "estac=v=>{v.v=0;v.ativo=false;v.y=X('chaoVeic')(v.x,v.z);X('veicColisor')(v);},"
     "poeAtras=(v,r)=>{const T=X('RTIPOS')[r.tipo],E=X('ENGATE')[v.tipo],f=[Math.sin(v.yaw),Math.cos(v.yaw)],hz=E.z;r.yaw=v.yaw;r.x=v.x+f[0]*(hz-T.lanca);r.z=v.z+f[1]*(hz-T.lanca);X('rbPousar')(r);X('rbColisor')(r);},"
     "dirige=(v,mz,seg,frente)=>{const IN=X('IN');IN.mz=mz;IN.mx=0;let mx=0;for(let i=0;i<seg/0.05;i++){X('updateVeic')(v,0.05);mx=Math.max(mx,Math.abs(v.v));}IN.mz=0;return mx;},"
     "ang=(a,b)=>Math.abs(X('angDiff')(a,b));")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;P.fome=100;P.sede=100;};"),
      e("inicio", "const L=X('REBOQUES'),b=V('barcoCais'),t=V('triFazenda');return{n:L.length,tipos:L.map(r=>r.tipo+':'+r.id),cais:L[0]&&b?Math.round(Math.hypot(L[0].x-b.x,L[0].z-b.z)):null,"
        "sitio:L[1]&&t?Math.round(Math.hypot(L[1].x-t.x,L[1].z-t.z)):null,secos:L.map(r=>X('aguaNivel')(r.x,r.z)===null),veics:X('VEICS').length};"),
      # ---- lugar aberto e reto para dirigir (40 m sem nada no caminho) ----
      ev("pista", "let best=null;const ok=(x,z,g0)=>X('dentroMapa')(x,z,8)&&X('aguaNivel')(x,z)===null&&!X('aguaPerto')(x,z,3)&&!X('pointBlocked')(x,z,1.6)&&Math.abs(X('ground')(x,z)-g0)<2.5;"
         "for(let r=10;r<120&&!best;r+=6)for(let a=0;a<6.28&&!best;a+=0.5)for(let h=0;h<6.28&&!best;h+=0.8){const x=F[0]+Math.cos(a)*r,z=F[2]+Math.sin(a)*r,g0=X('ground')(x,z);let bom=true;"
         "for(let d=-12;d<=45&&bom;d+=1.5)if(!ok(x+Math.sin(h)*d,z+Math.cos(h)*d,g0))bom=false;if(bom)best={x,z,h};}window.__pista=best;return{achou:!!best};"),
      # ---- engatar: caminhonete parada com a traseira perto da lança; toque E na lança ----
      j("const p=window.__pista,v=V('caminhonete'),r=rb('plataformaSitio');v.comb=90;v.x=p.x;v.z=p.z;v.yaw=p.h;estac(v);poeAtras(v,r);r.x+=Math.sin(p.h)*-0.5;r.z+=Math.cos(p.h)*-0.5;X('rbPousar')(r);X('rbColisor')(r);"
        "const L=lanca(r);vai(L[0]+Math.cos(p.h)*1.2,L[2]-Math.sin(p.h)*1.2);"),
      e("engatar", "const r=rb('plataformaSitio'),v=V('caminhonete'),K=X('INTER_K').reboque,t=K.texto(r);K.curto(r);const H=hitch(v),L=lanca(r);"
        "return{texto:t.t,engatou:r.eng===v,lancaNoEngate:r2(Math.hypot(H[0]-L[0],H[2]-L[2])),aviso:ult()};"),
      # ---- dirigir: o reboque segue; com reboque acelera e corre menos e gasta mais ----
      e("dirigeCom", "const r=rb('plataformaSitio'),v=V('caminhonete');X('entrarVeic')(v);const c0=v.comb,x0=r.x,z0=r.z;const mx=dirige(v,1,3.0);const H=hitch(v),L=lanca(r);"
        "const res={vMax3s:r2(mx),gastou:r2(c0-v.comb),reboqueAndou:r2(Math.hypot(r.x-x0,r.z-z0)),lancaNoEngate:r2(Math.hypot(H[0]-L[0],H[2]-L[2])),alinhado:r2(ang(v.yaw,r.yaw))};"
        "const v0=v.v;let t=0;const IN=X('IN');IN.mz=-1;while(v.v>0.5&&t<8){X('updateVeic')(v,0.05);t+=0.05;}IN.mz=0;res.freouDe=r2(v0);res.tempoFreio=r2(t);v.v=0;window.__com=res;return res;"),
      e("dirigeSem", "const r=rb('plataformaSitio'),v=V('caminhonete');X('sairCarro')();X('rbDesengatar')(r);const p=window.__pista;r.x=p.x-Math.sin(p.h)*14;r.z=p.z-Math.cos(p.h)*14;r.yaw=p.h;X('rbPousar')(r);X('rbColisor')(r);v.x=p.x;v.z=p.z;v.yaw=p.h;estac(v);X('entrarVeic')(v);const c0=v.comb;const mx=dirige(v,1,3.0);"
        "const res={vMax3s:r2(mx),gastou:r2(c0-v.comb)};const v0=v.v;let t=0;const IN=X('IN');IN.mz=-1;while(v.v>0.5&&t<8){X('updateVeic')(v,0.05);t+=0.05;}IN.mz=0;res.freouDe=r2(v0);res.tempoFreio=r2(t);v.v=0;"
        "X('sairCarro')();return res;"),
      # com reboque, dirigindo de verdade (teclas): o reboque vem atrás
      j("const p=window.__pista,v=V('caminhonete'),r=rb('plataformaSitio');v.x=p.x;v.z=p.z;v.yaw=p.h;estac(v);poeAtras(v,r);X('rbEngatar')(r,v,true);X('entrarVeic')(v);window.__r0=[r.x,r.z];"),
      ["down", "KeyW"], ["gwait", 2.5], ["up", "KeyW"], ["gwait", 1.0],
      e("teclas", "const r=rb('plataformaSitio'),v=V('caminhonete'),H=hitch(v),L=lanca(r);return{andou:r2(Math.hypot(r.x-window.__r0[0],r.z-window.__r0[1])),lancaNoEngate:r2(Math.hypot(H[0]-L[0],H[2]-L[2])),alinhado:r2(ang(v.yaw,r.yaw)),"
        "hud:(document.getElementById('pc-extra')||{}).textContent};"),
      # ré com o reboque torto: dobra até o limite e trava
      e("re", "const r=rb('plataformaSitio'),v=V('caminhonete');v.v=0;r.yaw=v.yaw+0.9;const T=X('RTIPOS').plataformaReboque,H=hitch(v);r.x=H[0]-Math.sin(r.yaw)*T.lanca;r.z=H[2]-Math.cos(r.yaw)*T.lanca;"
        "const IN=X('IN');IN.mz=-1;IN.mx=0;let max=0;for(let i=0;i<80;i++){X('updateVeic')(v,0.05);max=Math.max(max,ang(v.yaw,r.yaw));}IN.mz=0;return{anguloMax:r2(max),parou:Math.abs(v.v)<0.6,aviso:ult()};"),
      e("desengatar", "const r=rb('plataformaSitio'),v=V('caminhonete');v.v=0;X('sairCarro')();const K=X('INTER_K').reboque;const L=lanca(r);vai(L[0]+1.2,L[2]);const t=K.texto(r);K.curto(r);return{texto:t.t,solto:!r.eng,aviso:ult(),colisor:!!r.col};")]
# ---- plataforma: guincho puxa o carro quebrado; carga solta cai; presa não cai; descer ----
s += [j("const p=window.__pista,r=rb('plataformaSitio'),v=V('caminhonete'),c=V('sedanVila');v.x=p.x;v.z=p.z;v.yaw=p.h;estac(v);poeAtras(v,r);window.__eng=X('rbEngatar')(r,v,true);const w=loc(r,2.5,0,-9);c.x=w[0];c.z=w[2];c.yaw=r.yaw+0.5;estac(c);vai(w[0]+2,w[2]);"),
      e("guinchoCarro", "const r=rb('plataformaSitio'),c=V('sedanVila'),engatou=window.__eng;X('rbAbrir')(r);const ac=[...document.querySelectorAll('#es-acoes [data-ea]')].map(b=>b.dataset.ea+(b.disabled?'(x)':''));"
        "document.querySelector('#es-acoes [data-ea=\"guincho\"]').click();return{engatou,acoes:ac,puxando:!!r.gu,quebrado:{bateria:c.pecas.bateria,pneus:c.pecas.pneus},modo:G.modo};"),
      ["gwait", 12.0],
      e("carroEmCima", "const r=rb('plataformaSitio'),c=V('sedanVila');return{carga:r.carga&&r.carga.id,sobre:c.sobre===r,colisor:!!c.col,altura:r2(c.y-r.y),veics:X('VEICS').length,aviso:ult()};"),
      e("freadaSolta", "const r=rb('plataformaSitio'),v=V('caminhonete'),c=V('sedanVila');X('entrarVeic')(v);const hp0=c.hp;dirige(v,1,3.0);const v0=v.v;const IN=X('IN');IN.mz=-1;for(let i=0;i<40;i++)X('updateVeic')(v,0.05);IN.mz=0;v.v=0;"
        "return{velocidade:r2(v0),caiu:!r.carga,noChao:!c.sobre,perdeu:r2(hp0-c.hp),colisor:!!c.col,aviso:ult()};"),
      e("prende", "const r=rb('plataformaSitio'),v=V('caminhonete'),c=V('sedanVila');X('sairCarro')();dar({corda:3});c.x=loc(r,0,0,-6)[0];c.z=loc(r,0,0,-6)[2];estac(c);const a=X('rbGuinchar')(r,c);return{ok:a===''};"),
      ["gwait", 10.0],
      e("presa", "const r=rb('plataformaSitio'),v=V('caminhonete'),c=V('sedanVila');const c0=conta('corda');X('rbAbrir')(r);document.querySelector('#es-acoes [data-ea=\"prender\"]').click();const msg=document.getElementById('es-msg').textContent;X('fecharEstacao')();"
        "const r1={carga:!!r.carga,presa:r.presa,cordas:c0-conta('corda'),msg};X('entrarVeic')(v);dirige(v,1,3.0);const IN=X('IN');IN.mz=-1;for(let i=0;i<40;i++)X('updateVeic')(v,0.05);IN.mz=0;v.v=0;r1.continua=r.carga===c;X('sairCarro')();return r1;"),
      e("descer", "const r=rb('plataformaSitio'),c=V('sedanVila');const c0=conta('corda');const m=X('rbDescarregar')(r);return{ok:m==='',msg:m,cordasVoltaram:conta('corda')-c0};"),
      ["gwait", 4.0],
      e("desceu", "const r=rb('plataformaSitio'),c=V('sedanVila'),T=X('RTIPOS').plataformaReboque,w=loc(r,0,0,T.rampa);return{carga:!!r.carga,sobre:!!c.sobre,colisor:!!c.col,atras:r2(Math.hypot(c.x-w[0],c.z-w[2])),noChao:r2(c.y-X('chaoVeic')(c.x,c.z))};")]
# ---- compatibilidade ----
s += [e("compat", "const R=X('REBOQUES'),pl=rb('plataformaSitio'),rbB=rb('reboqueCais'),P_=X('rbPodePuxar'),mo=V('motoCidade'),tri=V('triFazenda'),sed=V('sedanVila'),bar=V('barcoCais');"
        "return{moto:P_(mo,pl),triPlataformaComMoto:P_(tri,pl,mo),triPlataformaVazia:P_(tri,pl),carroPlataformaComTriciclo:P_(sed,pl,tri),carroReboqueComBarco:P_(sed,rbB,bar),triReboqueComBarco:P_(tri,rbB,bar)};")]
# ---- reboque de barco: guincho puxa o barco do lago, prende e põe de volta na água ----
s += [j("const r=rb('reboqueCais'),b=V('barcoCais');window.__b0=[b.x,b.z];const T=X('RTIPOS').reboqueBarco,w=loc(r,0,0,T.rampa);vai(w[0]+2,w[2]);"),
      e("barcoAntes", "const r=rb('reboqueCais'),b=V('barcoCais'),T=X('RTIPOS').reboqueBarco,w=loc(r,0,0,T.rampa);return{dist:r2(Math.hypot(b.x-w[0],b.z-w[2])),naAgua:X('aguaNivel')(b.x,b.z)!==null,candidato:(X('rbCandidatos')(r)[0]||{}).id};"),
      e("barcoGuincho", "const r=rb('reboqueCais');const m=X('rbGuinchar')(r,X('rbCandidatos')(r)[0]);return{ok:m==='',msg:m};"),
      ["gwait", 14.0],
      e("barcoEmCima", "const r=rb('reboqueCais'),b=V('barcoCais');dar({corda:2});X('rbAbrir')(r);document.querySelector('#es-acoes [data-ea=\"prender\"]').click();X('fecharEstacao')();return{carga:r.carga&&r.carga.id,sobre:b.sobre===r,presa:r.presa,altura:r2(b.y-r.y)};"),
      e("barcoAgua", "const r=rb('reboqueCais');const m=X('rbDescarregar')(r);return{ok:m==='',msg:m};"),
      ["gwait", 4.0],
      e("barcoNaAgua", "const r=rb('reboqueCais'),b=V('barcoCais'),na=X('aguaNivel')(b.x,b.z);return{carga:!!r.carga,sobre:!!b.sobre,naAgua:na!==null,flutua:na!==null?r2(b.y-na):null,presa:r.presa};"),
      ["gwait", 2.0],
      e("barcoAnda", "const b=V('barcoCais');const na=X('aguaNivel')(b.x,b.z);return{naAgua:na!==null,colisor:!!b.col};")]
# ---- guincho da caminhonete ----
s += [e("gcInstalar", "const v=V('caminhonete');dar({kitFerramentas:1,sucata:4,corda:2,pecaVeiculo:1});const L0=X('veicMelhorias')(v).map(a=>a.id+(a.ok?'':'(x)'));const m=X('veicMelhoriaAcao')(v,'gcInstalar');return{antes:L0,msg:m,guincho:!!v.guincho};"),
      e("gcPuxar", "const v=V('caminhonete'),mo=V('motoCidade'),f=[Math.sin(v.yaw),Math.cos(v.yaw)];mo.x=v.x+f[0]*12+f[1]*2;mo.z=v.z+f[1]*12-f[0]*2;estac(mo);const L=X('veicMelhorias')(v).find(a=>a.id==='gcPuxar');const m=X('veicMelhoriaAcao')(v,'gcPuxar');return{opcao:L&&L.s,ok:m==='',msg:m};"),
      ["gwait", 14.0],
      e("gcPuxou", "const v=V('caminhonete'),mo=V('motoCidade'),Fr=X('carroLocal')(0,0,X('VTIPOS').caminhonete.hd,v);return{naFrente:r2(Math.hypot(mo.x-Fr[0],mo.z-Fr[2])),guinchando:!!mo.guinchando,colisor:!!mo.col};")]
# ---- construir um reboque (aba Oficina) ----
s += [e("construir", "G.fab.nv=2;dar({sucata:10,tabuas:6,pneu:2,pregos:6});const p=window.__pista;vai(p.x+Math.cos(p.h)*8,p.z-Math.sin(p.h)*8);n.cfg.cam='1';const yaw=p.h;P.yaw=yaw;P.body=yaw;P.pitch=-0.3;"
        "cam.pos=[P.x,P.y+1.62,P.z];cam.fwd=[Math.sin(yaw)*0.92,-0.38,Math.cos(yaw)*0.92];X('modoObra')(true);O().tipo='reboqueBarco';O().rot=0;X('obraAlvo')();const ok=O().ok,mot=O().motivo,n0=X('REBOQUES').length;"
        "X('colocarObra')();X('modoObra')(false);n.cfg.cam='3';const L=X('REBOQUES');return{aba:X('OBRA_CATS').find(c=>c.id==='oficina').t.filter(t=>/reboque|plataforma/.test(t)),alvoOk:ok,motivo:mot,novos:L.length-n0,obraSobrou:X('OB').some(o=>o.tipo==='reboqueBarco'),aviso:ult()};")]
# ---- salvar e carregar: carro em cima da plataforma engatada na caminhonete ----
s += [e("antesSalvar", "const r=rb('plataformaSitio'),v=V('caminhonete'),c=V('sedanVila');v.v=0;if(!r.eng)X('rbEngatar')(r,v,true);if(!r.carga){c.x=loc(r,0,0,-6)[0];c.z=loc(r,0,0,-6)[2];estac(c);X('rbGuinchar')(r,c);}return{eng:!!r.eng};"),
      ["gwait", 10.0],
      e("salvou", "const r=rb('plataformaSitio');r.presa=true;window.__nv=X('VEICS').length;window.__nr=X('REBOQUES').length;X('salvarJogo')();return{carga:r.carga&&r.carga.id,eng:r.eng&&r.eng.id,presa:r.presa,veics:window.__nv,reboques:window.__nr,guincho:!!V('caminhonete').guincho};"),
      j("X('carregarJogo')();"), ["gwait", 1.5],
      e("carregou", "const r=rb('plataformaSitio'),c=V('sedanVila'),ids=X('VEICS').map(v=>v.id);return{veics:ids.length,iguais:ids.length===window.__nv,unicos:new Set(ids).size===ids.length,reboques:X('REBOQUES').length,"
        "carga:r&&r.carga&&r.carga.id,sobre:!!c&&c.sobre===r,presa:r&&r.presa,eng:r&&r.eng&&r.eng.id,emCima:r&&c?r2(Math.hypot(c.x-r.x,c.z-r.z)):null,colisorCarro:!!(c&&c.col),guincho:!!V('caminhonete').guincho};"),
      e("depoisDirige", "const r=rb('plataformaSitio'),v=V('caminhonete'),c=V('sedanVila');X('entrarVeic')(v);const x0=r.x,z0=r.z;dirige(v,1,2.0);const IN=X('IN');IN.mz=-1;for(let i=0;i<30;i++)X('updateVeic')(v,0.05);IN.mz=0;v.v=0;"
        "return{reboqueAndou:r2(Math.hypot(r.x-x0,r.z-z0)),carroJunto:r2(Math.hypot(c.x-r.x,c.z-r.z)),continua:r.carga===c};")]
salvar('p187.json', s)
