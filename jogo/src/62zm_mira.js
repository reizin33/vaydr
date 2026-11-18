/* ================= Mira personalizável (v10.2.6, 17/11/2026) =================
   Himalaia: "muda essa mira, coloca o ponto" e logo depois "coloca uma opção para customizar a mira". A mira de fábrica virou um
   ponto claro com contorno escuro; em Ajustes > Mira dá para escolher:
   · formato: ponto, cruz, cruz e ponto, círculo, círculo e ponto ou T (a cruz sem o braço de cima);
   · cor (osso, verde, amarelo, ciano, vermelho, rosa), tamanho (60% a 200%), espessura das linhas, abertura no meio da cruz,
     opacidade e contorno escuro (para aparecer no céu e na parede clara);
   · "Voltar a mira de fábrica".
   Com uma prévia em cima (a mira sobre céu, mata e parede clara) que muda na hora. Tudo fica nos ajustes (cfg.mira) e vale para
   todos os mundos. O resto continua igual: quando a mira aparece (60_ui.js), o vermelho e o pulo no acerto e o anel do arco
   girando em volta dela. */
const MIRA_PADRAO={estilo:'ponto',cor:'#efe9da',tam:1,esp:2,abre:3,opac:1,cont:1};
const MIRA_CORES=[['#efe9da','Osso'],['#6dff7a','Verde'],['#ffe14d','Amarelo'],['#56e6ff','Ciano'],['#ff5a4d','Vermelho'],['#ff6fd8','Rosa']];
const MIRA_ESTILOS=['ponto','cruz','cruzPonto','circulo','circuloPonto','t'];
function miraCfg(){const m=Object.assign({},MIRA_PADRAO,cfg.mira||{}),n=(v,a,b,d)=>{v=+v;return isFinite(v)?clamp(v,a,b):d;};
  if(!MIRA_ESTILOS.includes(m.estilo))m.estilo=MIRA_PADRAO.estilo;if(!/^#[0-9a-f]{6}$/i.test(m.cor))m.cor=MIRA_PADRAO.cor;
  m.tam=n(m.tam,0.6,2,1);m.esp=n(m.esp,1,4,2);m.abre=n(m.abre,0,10,3);m.opac=n(m.opac,0.3,1,1);m.cont=m.cont?1:0;return m;}
/* o desenho: SVG em pixels, com o meio da mira no meio da caixa; o contorno vem antes (embaixo) */
function miraSVG(m){const k=m.tam,t=m.esp,g=m.abre,L=Math.round(6*k*2)/2,rD=Math.max(1.6,2.6*k*(0.75+t*0.125)),R=Math.round((7.5*k+g*0.4)*2)/2,
    cruz=/cruz|^t$/.test(m.estilo),circ=/circulo/.test(m.estilo),ponto=/[pP]onto/.test(m.estilo),
    ext=Math.ceil(Math.max(cruz?g+L:0,circ?R+t/2:0,ponto?rD:0)+3),W=ext*2,c=ext,o=m.cont,f=v=>+v.toFixed(2);
  let s='<svg viewBox="0 0 '+W+' '+W+'" width="'+W+'" height="'+W+'" aria-hidden="true" style="opacity:'+m.opac+'">';
  if(cruz){const braco=[[c-t/2,c-g-L,t,L],[c-t/2,c+g,t,L],[c-g-L,c-t/2,L,t],[c+g,c-t/2,L,t]];if(m.estilo==='t')braco.shift();
    for(const[x,y,w,h]of braco){if(o)s+='<rect class="of" x="'+f(x-1)+'" y="'+f(y-1)+'" width="'+f(w+2)+'" height="'+f(h+2)+'" rx="1"/>';s+='<rect class="f" x="'+f(x)+'" y="'+f(y)+'" width="'+f(w)+'" height="'+f(h)+'" rx="'+f(Math.min(t,L)/2.5)+'"/>';}}
  if(circ){if(o)s+='<circle class="o" cx="'+c+'" cy="'+c+'" r="'+f(R)+'" stroke-width="'+f(t+2)+'"/>';s+='<circle class="s" cx="'+c+'" cy="'+c+'" r="'+f(R)+'" stroke-width="'+f(t)+'"/>';}
  if(ponto){if(o)s+='<circle class="of" cx="'+c+'" cy="'+c+'" r="'+f(rD+1.4)+'"/>';s+='<circle class="f" cx="'+c+'" cy="'+c+'" r="'+f(rD)+'"/>';}
  return{svg:s+'</svg>',W};}
function miraMontar(el,m){if(!el)return;const d=miraSVG(m);el.classList.add('svg');el.style.width=el.style.height=d.W+'px';el.style.margin=(-d.W/2)+'px 0 0 '+(-d.W/2)+'px';
  el.style.setProperty('--mc',m.cor);const anel=el.querySelector('.mira-anel');el.innerHTML=d.svg;if(el.id==='mira')el.append(anel||Object.assign(document.createElement('i'),{className:'mira-anel'}));}
function miraAplicar(){try{const m=miraCfg();miraMontar($('mira'),m);miraMontar($('aj-mira-demo'),m);miraUI(m);}catch(e){console.error('mira',e);}}
/* ---------- Ajustes > Mira ---------- */
{const cor=$('aj-mira-cor');if(cor)cor.innerHTML=MIRA_CORES.map(([v,n])=>'<button type="button" data-v="'+v+'"><i class="aj-cor" style="background:'+v+'"></i>'+n+'</button>').join('');}
function miraUI(m){m=m||miraCfg();const marca=(id,v)=>{const el=$(id);if(el)el.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===String(v))));};
  marca('aj-mira-estilo',m.estilo);marca('aj-mira-cor',m.cor);marca('aj-mira-cont',m.cont);
  for(const[k,id,fmt]of[['tam','aj-mira-tam',v=>Math.round(v*100)+'%'],['esp','aj-mira-esp',v=>String(v)],['abre','aj-mira-abre',v=>String(v)],['opac','aj-mira-opac',v=>Math.round(v*100)+'%']]){
    const el=$(id);if(el&&document.activeElement!==el)el.value=m[k];const t=$(id+'-v');if(t)t.textContent=fmt(m[k]);}
  const cruz=/cruz|^t$/.test(m.estilo),linhas=cruz||/circulo/.test(m.estilo);for(const[id,on]of[['aj-mira-abre',cruz],['aj-mira-esp',linhas]]){const el=$(id);if(el){el.disabled=!on;const r=el.closest('.opcao');if(r)r.style.opacity=on?'':'0.45';}}}
function miraMuda(k,v){cfg.mira=Object.assign(miraCfg(),{[k]:v});saveCfg();miraAplicar();}
for(const[id,k]of[['aj-mira-estilo','estilo'],['aj-mira-cor','cor'],['aj-mira-cont','cont']]){const el=$(id);if(el)el.addEventListener('click',e=>{const b=e.target.closest('button[data-v]');if(!b)return;sfx('clique');miraMuda(k,k==='cont'?+b.dataset.v:b.dataset.v);});}
for(const[id,k]of[['aj-mira-tam','tam'],['aj-mira-esp','esp'],['aj-mira-abre','abre'],['aj-mira-opac','opac']]){const el=$(id);if(el)el.addEventListener('input',()=>miraMuda(k,+el.value));}
{const b=$('aj-mira-padrao');if(b)b.addEventListener('click',()=>{sfx('clique');cfg.mira=Object.assign({},MIRA_PADRAO);saveCfg();miraAplicar();});}
{const _a=ajustesUI;ajustesUI=function(){const r=_a.apply(this,arguments);try{miraUI();}catch(e){}return r;};}
miraAplicar();
