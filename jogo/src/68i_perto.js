/* ================= Atividades por perto: o aviso e a bússola (v10.8.5) =================
   Himalaia (19/11/2026): "faltam coisas para fazer". As atividades já existem (abrigos, corridas, posições, caçadas,
   territórios, destroços, desafios e eventos), mas só apareciam no mapa grande, na lista "O que fazer". Agora:
   · a bússola mostra as atividades por fazer a até 140 m (a letra e a cor de cada tipo, como no mapa; "?" se o lugar ainda
     não foi explorado), as 4 mais perto, além da rastreada;
   · chegando a 55 m de uma atividade pela primeira vez, um aviso diz o que é, o que falta e o prêmio (uma vez por atividade). */
const ATIV_PERTO={r:140,aviso:55,max:4,t:0,ids:[]};
KIND.ativ=['Por perto','#7fd3ff','i-mapa'];
function ativVistas(){const D=ativD();if(!D.vistas||typeof D.vistas!=='object')D.vistas={};return D.vistas;}
function ativPertoLista(){const id=ativD().rastreio,L=[];
  for(const a of ativTodas()){if(a.feito||a.id===id)continue;const d=Math.hypot(a.x-P.x,a.z-P.z);if(d<ATIV_PERTO.r)L.push({a,d});}
  return L.sort((p,q)=>p.d-q.d).slice(0,ATIV_PERTO.max);}
PASSOS.push(function ativPertoPasso(dt){if(G.modo!=='jogo'||!P.alive)return;ATIV_PERTO.t-=dt;if(ATIV_PERTO.t>0)return;ATIV_PERTO.t=0.8;
  const L=ativPertoLista();ATIV_PERTO.ids=L;if(CORR.ativa||(typeof RES!=='undefined'&&RES.ativo))return;
  const V=ativVistas();
  for(const{a,d}of L){if(V[a.id]||d>ATIV_PERTO.aviso||!ativConhecida(a))continue;V[a.id]=1;const T=ATIV_TIPOS[a.tipo]||ATIV_TIPOS.evento;
    const f=String(a.falta||'').replace(/\s*\(onde achar:[\s\S]*$/,'').trim();   // o aviso fica curto: o resto está no mapa
    toast('ativ',T.nome+' a '+Math.round(d)+' m ('+ativRumo(a.x-P.x,a.z-P.z)+'): '+a.nome+(f?' — '+(f.length>90?f.slice(0,88)+'…':f):'')+'. Mapa (M) → O que fazer.');break;}});
function ativPertoMarca(a){const key='ap-'+a.id;let m=BUSM[key];const T=ATIV_TIPOS[a.tipo]||ATIV_TIPOS.evento,con=ativConhecida(a),l=con?T.l:'?',cor=con?T.cor:'#3a3f3a';
  if(!m){const el=document.createElement('span');el.className='bus-m bus-at';el.innerHTML='<i></i><b></b>';busFita.append(el);m=BUSM[key]={el,b:el.querySelector('b'),i:el.querySelector('i'),v:null};}
  if(m.l!==l||m.c!==cor){m.l=l;m.c=cor;m.i.textContent=l;m.i.style.background=cor;m.i.style.color=con?'#101410':'#d8dcd8';}return m;}
{const _hb=hudBussola;hudBussola=function(){_hb.apply(this,arguments);try{if(!busFita.offsetParent||CORR.ativa)return;const W2=busFita.clientWidth/2,lim=Math.PI*0.55,k=W2/lim,yaw=Math.atan2(cam.fwd[0],-cam.fwd[2]);
    for(const{a}of ATIV_PERTO.ids){if(a.feito)continue;const m=ativPertoMarca(a),dx=a.x-P.x,dz=a.z-P.z,d=angDiff(yaw,Math.atan2(dx,-dz)),vis=Math.abs(d)<lim;
      if(vis!==m.v){m.v=vis;m.el.style.visibility=vis?'visible':'hidden';}if(vis)m.el.style.transform='translateX('+(W2+d*k).toFixed(1)+'px)';
      const dd=Math.round(Math.hypot(dx,dz));if(m.d!==dd){m.d=dd;m.b.textContent=dd+' m';}}}catch(e){}};}
{const st=document.createElement('style');st.textContent=`.bus-at i{display:grid;place-items:center;width:13px;height:13px;border-radius:50%;font:800 9px/1 system-ui,sans-serif;font-style:normal;box-shadow:0 0 0 1px #070a09,0 1px 2px #000}
.bus-at b{opacity:.85;font-size:8.5px}`;document.head.appendChild(st);}
