/* ================= Menu de pausa (v10.2.6, 17/11/2026) =================
   Himalaia: "muda esse esc, torne algo padrão bonito, inovador, único". A tela continua com os mesmos botões (os mesmos ids e as
   mesmas funções de 60_ui.js); o desenho novo está em page.html (.pz-*). Aqui entra o que muda a cada pausa:
   · onde e quando você está (dia ou noite, hora, quanto falta para virar, região);
   · o relógio do dia e da noite: o arco claro é o dia (6h às 20h), o azul é a noite, o ponto é a hora de agora;
   · o nível com a barra até o próximo, o objetivo da vez (o mesmo do painel da missão) e as teclas de atalho que o jogador
     escolheu em Ajustes > Teclas;
   · a ordem da animação de entrada (cada linha entra um pouco depois da outra).
   Abre por qualquer caminho (Esc, botão de pausa, volta do modo foto): o observador vê a tela aparecer. */
const pzEsc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function pausaRelogio(h,noite){const C=60,R=46,ang=x=>(x/24)*Math.PI*2-Math.PI/2,pt=(x,r)=>[C+Math.cos(ang(x))*r,C+Math.sin(ang(x))*r],f=n=>n.toFixed(1);
  const arco=(a,b,r)=>{const[x0,y0]=pt(a,r),[x1,y1]=pt(b,r),g=((b-a+24)%24)>12?1:0;return'M'+f(x0)+' '+f(y0)+'A'+r+' '+r+' 0 '+g+' 1 '+f(x1)+' '+f(y1);};
  let tr='';for(let i=0;i<24;i++){const[a,b]=pt(i,R+7),[c,d]=pt(i,R+(i%6===0?13:10));tr+='<line x1="'+f(a)+'" y1="'+f(b)+'" x2="'+f(c)+'" y2="'+f(d)+'"/>';}
  const[mx,my]=pt(h,R),rot=[['0',0],['6',6],['12',12],['18',18]].map(([t,x])=>{const[a,b]=pt(x,R-15);return'<text x="'+f(a)+'" y="'+f(b+3.5)+'">'+t+'</text>';}).join('');
  return'<circle cx="60" cy="60" r="'+R+'" fill="none" stroke="rgba(236,228,210,.07)" stroke-width="9"/>'+
    '<path d="'+arco(6,20,R)+'" fill="none" stroke="rgba(232,171,67,.6)" stroke-width="9"/>'+
    '<path d="'+arco(20,6,R)+'" fill="none" stroke="rgba(110,150,255,.5)" stroke-width="9"/>'+
    '<g stroke="rgba(236,228,210,.32)" stroke-width="1.2">'+tr+'</g>'+
    '<g fill="rgba(236,228,210,.45)" font-size="8.5" font-weight="700" text-anchor="middle" font-family="Sofia Sans Condensed,Arial Narrow,sans-serif">'+rot+'</g>'+
    '<circle cx="'+f(mx)+'" cy="'+f(my)+'" r="8.5" fill="'+(noite?'#d6defc':'#ffcf8a')+'" stroke="#0b0f0d" stroke-width="2.5"/>'+
    '<use href="#'+(noite?'i-lua':'i-sol')+'" x="49" y="49" width="22" height="22" style="color:'+(noite?'#c9d4ff':'#ffcf8a')+'"/>';}
function pausaInfo(){const h=G.hora,noite=!!G.noite,reg=typeof regiaoEm==='function'?regiaoEm(P.x,P.z):null,dt=$('dia-tempo')?$('dia-tempo').textContent:'',
    fase=noite?'Noite '+G.noiteN:'Dia '+G.dia;
  $('pz-onde').innerHTML='<b>'+pzEsc(fase)+'</b> · '+fmtHora(h)+(dt?' · '+pzEsc(dt):'')+(reg&&reg.nome?' · '+pzEsc(reg.nome):'');
  $('pz-hora').textContent=fmtHora(h);$('pz-fase').textContent=fase+(dt?' · '+dt:'');$('pz-relogio').innerHTML=pausaRelogio(h,noite);
  const k=G.nivel&&typeof xpProx==='function'?clamp(G.xp/xpProx(),0,1):0;
  $('pz-xp-t').textContent='Nível '+G.nivel+' · '+Math.round(k*100)+'% até o '+(G.nivel+1);$('pz-xp-b').style.width=(k*100).toFixed(1)+'%';
  const mt=$('missao-t'),mn=$('missao-n'),o=$('pz-obj');
  o.innerHTML=mt&&mt.textContent?'<small>'+pzEsc(mn&&mn.textContent?mn.textContent:'Objetivo')+'</small>'+pzEsc(mt.textContent):'';
  document.querySelectorAll('#t-pausa kbd[data-tecla]').forEach(el=>{const c=typeof teclaDe==='function'?teclaDe(el.dataset.tecla):'';el.textContent=c&&typeof nomeTecla==='function'?nomeTecla(c):'';});
  let i=0;document.querySelectorAll('#t-pausa .pz-col>:not(.pz-menu),#t-pausa .pz-it:not([hidden]),#t-pausa .pz-ficha').forEach(el=>el.style.setProperty('--i',String(i++)));}
{const el=document.getElementById('t-pausa');if(el)new MutationObserver(()=>{if(!el.hidden)try{pausaInfo();}catch(e){console.error('pausa',e);}}).observe(el,{attributes:true,attributeFilter:['hidden']});}
