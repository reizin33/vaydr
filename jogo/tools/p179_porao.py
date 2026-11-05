"""p179: Etapa 16, serrote e pá; alçapão com escada de mão (precisa de serrote, abre o piso, sobe empurrando a tampa, tampa fechada
segura quem pisa, cadeado com senha: de baixo só com a senha); porão (precisa de pá, desce pelo alçapão do chão, cômodo lá embaixo
escuro, cava mais um cômodo, baú lá dentro impede desmontar, cadeado com senha de baixo, tapete esconde); tudo salvo."""
import sys, os, io, contextlib; sys.path.insert(0, os.path.dirname(__file__))
with contextlib.redirect_stdout(io.StringIO()):
    import p177_mover as m
from vt import *
k = next(i for i, st in enumerate(m.s) if st[0] == 'eval' and st[1] == 'casa')
s = m.s[:k + 1]
H = m.H + ("const W=(o,lx,lz)=>X('localW')(o,lx,lz),alc=()=>X('OB').find(o=>o.tipo==='escadaInterna'),por=()=>X('OB').find(o=>o.tipo==='porao'),"
           "mirarChao=(tipo,ox,oz,tx,tz)=>{const p=plat(),a=W(p,ox,oz),t=W(p,tx,tz);vai(a[0],a[1],g(a[0],a[1]));const ey=P.y+1.62,dx=t[0]-P.x,dz=t[1]-P.z,ty=g(t[0],t[1]),d=Math.hypot(dx,ty-ey,dz);"
           "P.yaw=Math.atan2(dx,dz);P.body=P.yaw;P.pitch=0;cam.pos=[P.x,ey,P.z];cam.fwd=[dx/d,(ty-ey)/d,dz/d];n.cfg.cam='1';X('modoObra')(true);O().tipo=tipo;O().rot=0;X('obraAlvo')();const Q=O();return{ok:Q.ok,motivo:Q.motivo};},"
           "tecla=t=>{for(const c of t)X('tecladoTecla')(c);X('tecladoTecla')('ok');},"
           "durDe=id=>{const q=P.inv.find(z=>z&&z.id===id);return q?q.dur:null;};")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s += [j("const b=ob('bau')[0];if(b)X('destruirObraSilenciosa')(b);window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;P.fome=100;P.sede=100;P.energia=100;};"),
      e("receitas", "const R=X('RECIPES');return{serrote:!!R.find(r=>r.faz==='serrote'),pa:!!R.find(r=>r.faz==='pa'),itens:[X('ITEMS').serrote.nome,X('ITEMS').pa.nome],menu:X('OBRA_CATS').find(c=>c.id==='casa').t.filter(t=>/escada|alcapao|porao/.test(t))};"),
      # ---- alçapão: sem serrote recusa; com serrote abre o piso ----
      e("alcSemSerrote", "const r=mirarChao('alcapao',-1.2,-1.2,0.3,0.3);X('modoObra')(false);return r;"),
      e("alcPoe", "n.invAdd('serrote',1);const d0=durDe('serrote');const r=mirarChao('alcapao',-1.2,-1.2,0.3,0.3);X('colocarObra')();X('modoObra')(false);const o=alc(),p=plat();"
        "if(o)Object.assign(r,{mod:o.ext.mod,centro:[o.ext.cu,o.ext.cv],escada:[o.ext.lu,o.ext.lv],furo:p.furo&&p.furo.map(r2),tampa:!!o.ext.aberta,pisoTampa:o.sups&&o.sups.length,via:!!o.via});r.serrote=[d0,durDe('serrote')];return r;"),
      # sobe pela escada de mão: a tampa fechada abre empurrando
      e("alcSobe0", "const o=alc(),v=o.via;vai(v.base.x,v.base.z,g(v.base.x,v.base.z));P.yaw=v.yaw;P.body=P.yaw;const vp=X('viaPerto')();X('comecarEscalada')(vp);return{perto:!!vp,u:vp&&vp.u,escalando:!!P.escala};"),
      ["down", "KeyW"], ["gwait", 4.0], ["up", "KeyW"], ["gwait", 0.4],
      e("alcSubiu", "const o=alc(),p=plat(),sp=X('supEm')(P.x,P.z,P.y,0.3);return{y:r2(P.y-p.y),escalando:!!P.escala,noPiso:!!(sp&&sp.dono===p),tampa:!!o.ext.aberta,msg:ult()};"),
      # de cima: fecha a tampa e pisa em cima dela
      e("alcFecha", "const o=alc(),p=plat(),e=o.ext,w=W(o,-(e.lv||0)*1.0,(e.lu||0)*1.0);vai(w[0],w[1],p.y);const it=X('interAtual')();window.__k=it&&it.k;if(it&&it.k==='alcTampa'){n.alvo=it;n.interagir(false);X('usarSolta')();}const r={alvo:window.__k,tampa:!!o.ext.aberta};"
        "vai(o.x,o.z,p.y+0.05);return r;"),
      ["gwait", 0.8],
      e("alcPisa", "const o=alc(),p=plat();return{y:r2(P.y-p.y),tampa:!!o.ext.aberta};"),
      # cadeado com senha (de cima): 1234
      e("alcCadeado", "const o=alc();n.invAdd('sucata',4);n.invAdd('pregos',4);o.estTipo='escadaInt';X('abrirEstacao')(o);const b=q=>{const el=document.querySelector('#es-acoes [data-ea='+q+']');if(!el||el.disabled)return'x';el.click();return(document.getElementById('es-msg')||{}).textContent||'';};"
        "const r={painel:document.getElementById('es-nome').textContent,acoes:[...document.querySelectorAll('#es-acoes [data-ea]')].map(x=>x.dataset.ea)};r.por=b('cadPor');r.modo=G.modo;tecla('1234');r.senha=o.ext.senha;r.cad=o.ext.cad;r.modo2=G.modo;return r;"),
      # desce, fecha por baixo? não: sobe de novo por baixo com a tampa trancada: o teclado aparece
      j("const o=alc(),p=plat();X('alcTampa')(o,false,true);const v=o.via;vai(v.base.x,v.base.z,g(v.base.x,v.base.z));P.yaw=v.yaw;P.body=P.yaw;X('comecarEscalada')(X('viaPerto')());"),
      ["down", "KeyW"], ["gwait", 2.5], ["up", "KeyW"], ["gwait", 0.3],
      e("alcTrancado", "const o=alc();const r={modo:G.modo,tampa:!!o.ext.aberta,msg:ult()};if(G.modo==='teclado'){tecla('9999');r.errado=document.getElementById('tc-msg').textContent;r.tampaErr=!!o.ext.aberta;tecla('1234');}r.tampaCerta=!!o.ext.aberta;r.modo2=G.modo;return r;"),
      ["down", "KeyW"], ["gwait", 2.5], ["up", "KeyW"], ["gwait", 0.3],
      e("alcPassou", "const o=alc(),p=plat();return{y:r2(P.y-p.y),escalando:!!P.escala};"),
      j("P.escala=null;")]
# ---- porão: sem pá recusa; com pá cava; desce; cava mais um cômodo; baú lá dentro; cadeado de baixo; tapete ----
s += [e("porSemPa", "const r=mirarChao('porao',1.0,-1.6,-0.9,-1.2);X('modoObra')(false);return r;"),
      e("porPoe", "n.invAdd('pa',1);const d0=durDe('pa');const r=mirarChao('porao',1.0,-1.6,-0.9,-1.2);X('colocarObra')();X('modoObra')(false);const o=por();"
        "if(o)Object.assign(r,{salas:o.ext.salas.length,sub:!!o.sub,noSub:o.sub&&X('SUB').salas.includes(o.sub.salas[0]),cols:o.cols&&o.cols.length,y:r2(o.sub.salas[0].y)});r.pa=[d0,durDe('pa')];return r;"),
      e("porDesce", "const o=por(),w=W(plat(),0.2,-1.7);vai(w[0],w[1],g(w[0],w[1]));P.yaw=Math.atan2(o.x-P.x,o.z-P.z);P.body=P.yaw;const it=X('interAtual')();window.__k=it&&it.k;window.__t=it&&X('textoInter')(it);if(it&&it.k==='poraoCasa'){n.alvo=it;n.interagir(false);X('usarSolta')();}return{alvo:window.__k,txt:window.__t};"),
      ["wait", 1.3],
      e("porDentro", "const o=por(),sl=X('salaSubEm')(P.x,P.y+0.3,P.z);return{y:r2(P.y),noSubsolo:X('noSubsolo')(),sala:sl&&sl.nome,escura:sl&&sl.escura};"),
      e("porCava", "const o=por();P.energia=100;o.estTipo='porao';X('abrirEstacao')(o);const b=q=>{const el=document.querySelector('#es-acoes [data-ea='+q+']');if(!el)return'(sem)';if(el.disabled)return'(desligado)';el.click();return(document.getElementById('es-msg')||{}).textContent||'';};"
        "const r={acoes:[...document.querySelectorAll('#es-acoes [data-ea]')].map(x=>x.dataset.ea+(x.disabled?'-':''))};r.cavou=b('cavar_l');r.salas=o.ext.salas.length;r.sub=X('SUB').salas.filter(s=>s.c&&s.c.dono===o).length;X('fecharEstacao')();return r;"),
      j("const o=por();P.yaw=Math.PI/2;P.body=P.yaw;n.cfg.cam='1';"), ["down", "KeyW"], ["gwait", 2.0], ["up", "KeyW"], ["gwait", 0.3],
      e("porAnda", "const o=por(),sl=X('salaSubEm')(P.x,P.y+0.3,P.z);return{sala:sl&&sl.nome,dx:r2(P.x-o.x),y:r2(P.y)};"),
      e("porBau", "const o=por();P.yaw=-Math.PI/2;P.body=P.yaw;X('modoObra')(true);O().tipo='bau';O().rot=0;cam.pos=[P.x,P.y+1.62,P.z];cam.fwd=[Math.sin(P.yaw),-0.35,Math.cos(P.yaw)];X('obraAlvo')();const r={ctx:X('contextoObra')(),ok:O().ok,motivo:O().motivo};"
        "const k0=X('OB').length;X('colocarObra')();X('modoObra')(false);r.feito=X('OB').length>k0;const b=X('OB')[X('OB').length-1];r.bauY=b&&r2(b.y);return r;"),
      # cadeado por dentro (lá embaixo), senha 4321; sobe; de cima pede a senha
      e("porCadeado", "const o=por(),q=X('porBaixo')(o);vai(q[0],q[1],-30);o.estTipo='porao';X('abrirEstacao')(o);const b=x=>{const el=document.querySelector('#es-acoes [data-ea='+x+']');if(!el||el.disabled)return'x';el.click();return'';};"
        "const r={por:b('cadPor'),modo:G.modo};tecla('4321');r.senha=o.ext.senha;return r;"),
      e("porSobe", "const o=por(),q=X('porBaixo')(o);vai(q[0],q[1],-30);const it=X('interAtual')();window.__k=it&&it.k;if(it&&it.k==='poraoCasaSobe'){n.alvo=it;n.interagir(false);X('usarSolta')();}return{alvo:window.__k};"),
      ["wait", 1.3],
      e("porEmCima", "const o=por();return{y:r2(P.y-g(P.x,P.z)),dist:r2(Math.hypot(P.x-o.x,P.z-o.z)),noSubsolo:X('noSubsolo')()};"),
      e("porDesmontaCheio", "const o=por(),w=W(plat(),1.2,-1.4);vai(w[0],w[1],g(w[0],w[1]));const m=mirar(o,0.05);const ok=X('podeMexer')(o,'desmontar');X('modoObra')(false);return{mirou:m===o,pode:ok.ok,motivo:ok.motivo};"),
      e("porTrancado", "const o=por(),w=W(plat(),0.2,-1.7);vai(w[0],w[1],g(w[0],w[1]));P.yaw=Math.atan2(o.x-P.x,o.z-P.z);P.body=P.yaw;const it=X('interAtual')();const t=it&&X('textoInter')(it);if(it&&it.k==='poraoCasa'){n.alvo=it;n.interagir(false);X('usarSolta')();}"
        "const r={txt:t,modo:G.modo};if(G.modo==='teclado'){tecla('1111');r.errado=document.getElementById('tc-msg').textContent;tecla('4321');}r.modo2=G.modo;return r;"),
      ["wait", 1.3],
      e("porDesceuSenha", "return{y:r2(P.y),noSubsolo:X('noSubsolo')()};"),
      e("porTapete", "const o=por(),q=X('porBaixo')(o);vai(q[0],q[1],-30);X('porSubir')(o);return 1;"),
      ["wait", 1.3],
      e("porTapete2", "const o=por();n.invAdd('pano',3);o.estTipo='porao';X('abrirEstacao')(o);const el=document.querySelector('#es-acoes [data-ea=tapetePor]');const ok=!!el&&!el.disabled;if(ok)el.click();X('fecharEstacao')();"
        "const w=W(plat(),0.2,-1.7);vai(w[0],w[1],g(w[0],w[1]));P.yaw=Math.atan2(o.x-P.x,o.z-P.z);P.body=P.yaw;const it=X('interAtual')();return{botao:ok,tapete:!!o.ext.tapete,txt:it&&X('textoInter')(it)};"),
      # salvar e carregar: alçapão com cadeado e porão com 2 cômodos, cadeado e tapete
      e("salvo", "X('salvarJogo')();X('carregarJogo')();const a=alc(),o=por(),p=plat();return{alc:a&&[a.ext.mod,a.ext.senha,a.ext.cad,!!a.via],furo:!!(p&&p.furo),por:o&&[o.ext.salas.length,o.ext.senha,!!o.ext.tapete,!!o.sub,o.sub&&X('SUB').salas.filter(s=>s.c&&s.c.dono===o).length]};")]
salvar('p179.json', s)
