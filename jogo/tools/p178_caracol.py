"""p178: Etapa 16, escada caracol (modelo novo da escada interna): mira num canto da casa de 4 m, fantasma, abertura quadrada no piso,
subir andando em volta do poste e sair pela passagem, guarda-corpo segura quem anda no andar de cima, descer, painel (segurar E) que
troca para reta e de volta para caracol e inverte o sentido, e o modelo fica salvo."""
import sys, os, io, contextlib; sys.path.insert(0, os.path.dirname(__file__))
with contextlib.redirect_stdout(io.StringIO()):
    import p177_mover as m
from vt import *
k = next(i for i, st in enumerate(m.s) if st[0] == 'eval' and st[1] == 'casa')
s = m.s[:k + 1]
H = m.H + ("const loc=(o,x,z)=>{const dx=x-o.x,dz=z-o.z,c=Math.cos(o.yaw),sn=Math.sin(o.yaw);return[dx*c-dz*sn,dx*sn+dz*c];},"
           "W=(o,lx,lz)=>X('localW')(o,lx,lz),esc=()=>X('OB').find(o=>o.tipo==='escadaInterna');")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
# guia do passo a passo: segue o giro da escada (sobe ou desce) a ~0,62 m do poste e sai pela passagem
GUIA = ("window.__guia=(modo)=>{const o=esc(),e=o.ext,A=X('carAng')(e),s=A.s,l=loc(o,P.x,P.z),r=Math.hypot(l[0],l[1]),th=Math.atan2(l[1],l[0]);"
        "let dx,dz;const sg=modo==='desce'?-s:s;dx=-Math.sin(th)*sg;dz=Math.cos(th)*sg;const er=r-0.62;dx-=Math.cos(th)*er*1.2;dz-=Math.sin(th)*er*1.2;"
        "if(modo==='sai'){dx=Math.cos(A.fL);dz=Math.sin(A.fL);}if(modo==='entra'){dx=-Math.cos(A.fL);dz=-Math.sin(A.fL);}"
        "const c=Math.cos(o.yaw),sn=Math.sin(o.yaw),wx=dx*c+dz*sn,wz=-dx*sn+dz*c;P.yaw=Math.atan2(wx,wz);P.body=P.yaw;P.pitch=0;};")
s += [j("const p=plat();window.__p=p;"),
      # ---- pôr a caracol: dentro da casa, mirando o canto (+x,+z) da plataforma ----
      e("poe", "const p=plat(),c0=n.cfg.cam;n.cfg.cam='1';const a=W(p,-0.9,-0.9),t=W(p,1.3,1.3);vai(a[0],a[1],g(a[0],a[1]));const ey=P.y+1.62,dx=t[0]-P.x,dz=t[1]-P.z,ty=g(t[0],t[1]),d=Math.hypot(dx,ty-ey,dz);"
        "P.yaw=Math.atan2(dx,dz);P.body=P.yaw;P.pitch=0;cam.pos=[P.x,ey,P.z];cam.fwd=[dx/d,(ty-ey)/d,dz/d];X('modoObra')(true);O().tipo='escadaCaracol';O().rot=0;X('obraAlvo')();"
        "const Q=O(),r={ok:Q.ok,motivo:Q.motivo,ext:Q.ext&&{mod:Q.ext.mod,cu:Q.ext.cu,cv:Q.ext.cv,s:Q.ext.s,h:Q.ext.h},fantasma:!!X('fantasmaAlto')()};const t0=conta('tabuas');X('colocarObra')();X('modoObra')(false);n.cfg.cam=c0;"
        "const o=esc();r.feito=!!o;if(o){r.mod=o.ext.mod;r.centro=loc(p,o.x,o.z).map(r2);r.furo=p.furo&&p.furo.map(r2);r.pisos=p.sups?p.sups.length:0;r.rampas=o.sups.length;r.cols=o.cols.length;r.malha=!!o.mesh;r.esc=X('obraEsc')(o);}"
        "r.gastou=t0-conta('tabuas');return r;"),
      e("recusas", "const p=plat(),c0=n.cfg.cam;n.cfg.cam='1';const a=W(p,-1.2,1.2),t=W(p,-1.4,-1.4);vai(a[0],a[1],g(a[0],a[1]));const ey=P.y+1.62,dx=t[0]-P.x,dz=t[1]-P.z,ty=g(t[0],t[1]),d=Math.hypot(dx,ty-ey,dz);"
        "P.yaw=Math.atan2(dx,dz);cam.pos=[P.x,ey,P.z];cam.fwd=[dx/d,(ty-ey)/d,dz/d];X('modoObra')(true);O().tipo='escadaCaracol';X('obraAlvo')();const m1=O().motivo;O().tipo='escadaInterna';X('obraAlvo')();const m2=O().motivo;"
        "const b=W(p,0,0);vai(b[0]+40,b[1]+40);O().tipo='escadaCaracol';X('obraAlvo')();const m3=O().motivo;X('modoObra')(false);n.cfg.cam=c0;return{outraCaracol:m1,outraReta:m2,foraDaCasa:m3};")]
# ---- subir andando: entra pelo vão de baixo, gira em volta do poste e sai pela passagem lá em cima ----
s += [j(GUIA + "const o=esc(),q=X('escadaPontos')(o)[0];vai(q[0],q[1],g(q[0],q[1]));n.cfg.cam='1';window.__fase='sobe';window.__maxY=P.y;window.__minR=9;window.__maxR=0;"
        "window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;const o=esc(),l=loc(o,P.x,P.z),rr=Math.hypot(l[0],l[1]);window.__maxY=Math.max(window.__maxY,P.y);"
        "if(window.__fase==='sobe'){window.__minR=Math.min(window.__minR,rr);window.__maxR=Math.max(window.__maxR,rr);}"
        "if(window.__fase==='sobe'&&P.y>o.y-0.04){const A=X('carAng')(o.ext),th=Math.atan2(l[1],l[0]);let df=th-A.fL;df=Math.atan2(Math.sin(df),Math.cos(df));if(Math.abs(df)<0.3)window.__fase='sai';}"
        "window.__guia(window.__fase);};"),
      ["down", "KeyW"], ["gwait", 9.0], ["up", "KeyW"], ["gwait", 0.3],
      e("subiu", "const o=esc(),p=plat(),sp=X('supEm')(P.x,P.z,P.y,0.3),l=loc(p,P.x,P.z);return{fase:window.__fase,y:r2(P.y-p.y),noPiso:!!(sp&&sp.dono===p),maxY:r2(window.__maxY-p.y),raio:[r2(window.__minR),r2(window.__maxR)],"
        "pos:l.map(r2),vida:Math.round(P.vida)};"),
      # o guarda-corpo segura quem anda no andar de cima em direção à abertura
      j("const p=plat(),o=esc(),e=o.ext,co=1.5*X('modK')(p)-0.2-1.1;const a=W(p,e.cu*co,e.cv*co-e.cv*1.75);vai(a[0],a[1],p.y);n.cfg.cam='1';const t=W(p,e.cu*co,e.cv*co);P.yaw=Math.atan2(t[0]-P.x,t[1]-P.z);P.body=P.yaw;P.pitch=0;"
        "window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;};"),
      ["down", "KeyW"], ["gwait", 1.6], ["up", "KeyW"], ["gwait", 0.4],
      e("guardaCorpo", "const p=plat(),o=esc(),e=o.ext,co=1.5*X('modK')(p)-0.2-1.1,l=loc(p,P.x,P.z);return{y:r2(P.y-p.y),dentroDoVao:r2((l[1]-e.cv*co)*e.cv),borda:r2(-1.1)};"),
      # descer: entra pela passagem, desce girando e sai embaixo
      j(GUIA + "const o=esc(),p=plat(),A=X('carAng')(o.ext),pt=W(o,Math.cos(A.fL)*1.6,Math.sin(A.fL)*1.6);vai(pt[0],pt[1],p.y);n.cfg.cam='1';window.__fase='entra';window.__minY=P.y;window.__vyMin=0;window.__alt=[];window.__tq=0;"
        "window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;const o=esc(),l=loc(o,P.x,P.z),rr=Math.hypot(l[0],l[1]);window.__minY=Math.min(window.__minY,P.y);if(window.__fase==='desce'){window.__vyMin=Math.min(window.__vyMin,P.vy||0);if(G.t-window.__tq>=0.3){window.__tq=G.t;window.__alt.push(r2(P.y-(o.y-o.ext.h)));}}"
        "if(window.__fase==='entra'&&rr<0.75)window.__fase='desce';if(window.__fase==='desce'&&P.y<o.y-o.ext.h+0.12){const A=X('carAng')(o.ext),th=Math.atan2(l[1],l[0]);window.__fase='fora';window.__saiDir=th;window.__saiu=[r2(Math.hypot(l[0],l[1])),r2(P.y-(o.y-o.ext.h))];}"
        "if(window.__fase==='fora'){const c=Math.cos(o.yaw),sn=Math.sin(o.yaw),dx=Math.cos(window.__saiDir),dz=Math.sin(window.__saiDir);P.yaw=Math.atan2(dx*c+dz*sn,-dx*sn+dz*c);P.body=P.yaw;return;}window.__guia(window.__fase);};"),
      ["down", "KeyW"], ["gwait", 9.0], ["up", "KeyW"], ["gwait", 0.3],
      e("desceu", "const o=esc(),fg=o.y-o.ext.h;return{fase:window.__fase,saiu:window.__saiu,vyMin:r2(window.__vyMin),alturas:window.__alt.slice(0,30),chao:r2(P.y-g(P.x,P.z))};"),
      j("window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;};")]
# ---- painel: segurar E perto da escada; troca para reta, volta para caracol, inverte ----
s += [e("painel", "const p=plat(),a=W(p,-0.5,-0.4);vai(a[0],a[1],g(a[0],a[1]));const o=esc(),q=X('escadaPontos')(o)[0];P.yaw=Math.atan2(q[0]-P.x,q[1]-P.z);P.body=P.yaw;"
        "const it=X('interAtual')();n.alvo=it;window.__ak=it&&it.k;n.interagir(false);return{alvo:window.__ak,txt:it&&X('textoInter')(it),dist:r2(Math.hypot(q[0]-P.x,q[1]-P.z))};"),
      ["gwait", 0.9],
      e("troca", "const o=esc(),p=plat(),b=q=>{const el=document.querySelector('#es-acoes [data-ea='+q+']');if(!el)return'(sem botão)';if(el.disabled)return'(desligado)';el.click();return document.getElementById('es-msg').textContent;};"
        "const r={modo:G.modo,nome:document.getElementById('es-nome').textContent,botoes:[...document.querySelectorAll('#es-acoes [data-ea]')].map(x=>x.dataset.ea+(x.disabled?'-':'+'))};"
        "r.reta=b('m_reta');r.mod1=o.ext.mod||'reta';r.furo1=p.furo&&p.furo.map(r2);r.mesmo=esc()===o;r.inv=b('inv');r.d=o.ext.d;r.caracol=b('m_caracol');r.mod2=o.ext.mod;r.s1=o.ext.s;r.inv2=b('inv');r.s2=o.ext.s;"
        "r.furo2=p.furo&&p.furo.map(r2);r.n=X('OB').filter(q=>q.tipo==='escadaInterna').length;X('fecharEstacao')();return r;"),
      e("salvo", "X('salvarJogo')();const sv=JSON.parse(localStorage.getItem(X('SAVE_KEY')));const q=sv.obras.find(o=>o[0]==='escadaInterna');X('carregarJogo')();const o=esc(),p=plat();"
        "return{noSave:q&&q[8]&&q[8].mod,depois:o&&o.ext.mod,furo:!!(p&&p.furo),rampas:o&&o.sups&&o.sups.length};")]
salvar('p178.json', s)
