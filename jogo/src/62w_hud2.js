/* ================= HUD v2 (12/11) — só as partes que o Himalaia aprovou =================
   Do protótipo do HUD novo, ele escolheu: o minimapa e a bússola novos ("mapa e bússola pode colocar esses") e a barra do
   meio no estilo novo, só que menor ("diminua essa barra do meio"). O resto (vitais no estilo DayZ, missão, comandos,
   botões de cima da barra) continua como estava. Tudo isso só no PC (body[data-tela="pc"]); com controles de toque fica
   o HUD de antes.
   · Minimapa: maior, verde-escuro, aro escuro com fio claro, dois anéis de distância, o N laranja dentro do círculo e,
     embaixo, o nome do lugar mais perto com a distância (CLAREIRA · 7 M). O desenho do mapa continua o mesmo (60_ui).
   · Bússola: sem caixa, só a fita, que some nas pontas; letras e graus em cima, tracinhos a cada 5° embaixo e um traço
     laranja no meio. Os marcadores (missão, fogueira, carro, cão...) continuam nela.
   · Barra rápida: painel escuro com os 6 espaços menores, número da tecla em cima, quantidade embaixo, o item da mão com
     cantos laranja; em cima, o nome do item em letra de título e, abaixo, o tipo e a durabilidade em tracinhos (%). */
{const st=document.createElement('style');st.textContent=`
body[data-tela="pc"]{--mapa:clamp(100px,10vw,140px);--slot:clamp(40px,3.6vw,50px)}
body[data-tela="pc"] .mapa{background:#1f3a24;border:5px solid rgba(16,18,18,.72);box-shadow:inset 0 0 0 1px rgba(236,228,210,.32),0 6px 18px rgba(0,0,0,.42)}
body[data-tela="pc"] .mapa-n{top:5px;padding:0;background:none;border-radius:0;font:700 12px/1 var(--f-display);color:var(--ember);text-shadow:0 1px 2px #000;pointer-events:none}
body[data-tela="pc"] .canto-linha{margin-bottom:18px}
.mapa-lugar{position:absolute;top:calc(100% + 8px);left:50%;translate:-50% 0;white-space:nowrap;pointer-events:none;
  font:800 10.5px/1 var(--f-ui);letter-spacing:.14em;text-transform:uppercase;color:rgba(236,228,210,.82);text-shadow:0 1px 2px #000,0 0 6px rgba(0,0,0,.6)}
body:not([data-tela="pc"]) .mapa-lugar{display:none}
body[data-tela="pc"] .bussola{height:36px;background:none;border:0;border-radius:0;box-shadow:none;backdrop-filter:none;-webkit-backdrop-filter:none;
  -webkit-mask-image:linear-gradient(90deg,transparent 0,#000 15%,#000 85%,transparent 100%);mask-image:linear-gradient(90deg,transparent 0,#000 15%,#000 85%,transparent 100%)}
body[data-tela="pc"] .bus-fita>span{text-shadow:0 1px 2px rgba(0,0,0,.9),0 0 6px rgba(0,0,0,.5)}
body[data-tela="pc"] .bus-fita>span.bus-c,body[data-tela="pc"] .bus-fita>span.bus-g{align-content:start;padding-top:1px}
body[data-tela="pc"] .bus-c{font:800 11.5px/1 var(--f-ui);color:rgba(236,228,210,.78);letter-spacing:.1em}
body[data-tela="pc"] .bus-c.bus-p{font:700 14px/1 var(--f-display);color:var(--bone)}
body[data-tela="pc"] .bus-c.bus-n{color:#fff}
.bus-g{font:700 10px/1 var(--f-ui);color:rgba(236,228,210,.55);letter-spacing:.06em;font-variant-numeric:tabular-nums}
body[data-tela="pc"] .bus-fita>span.bus-t{align-content:end;padding-bottom:2px;width:1px}
body[data-tela="pc"] .bus-t::before{width:1px;height:5px;background:rgba(236,228,210,.6);opacity:1;box-shadow:0 0 2px rgba(0,0,0,.8)}
body[data-tela="pc"] .bus-t.m15::before{height:8px;background:rgba(236,228,210,.8)}
body[data-tela="pc"] .bus-t.m45::before{height:10px;background:rgba(236,228,210,.95)}
body[data-tela="pc"] .bus-m{padding-top:0}
body[data-tela="pc"] .bus-seta{bottom:1px;width:2px;height:15px;border:0;background:var(--ember);border-radius:1px;box-shadow:0 0 4px rgba(0,0,0,.7)}
body:not([data-tela="pc"]) .bus-g,body:not([data-tela="pc"]) .bus-t.m5{display:none}
body[data-tela="pc"] .barra .slots{padding:5px;gap:5px;border-radius:8px;background:rgba(16,18,19,.8);border:1px solid rgba(236,228,210,.12);box-shadow:0 8px 22px rgba(0,0,0,.35)}
body[data-tela="pc"] .slots .slot{border-radius:4px;border:1px solid rgba(236,228,210,.07);background:linear-gradient(180deg,rgba(42,46,49,.92),rgba(26,29,31,.94))}
body[data-tela="pc"] .slots .slot .ico{width:56%;height:56%;color:var(--bone)}
body[data-tela="pc"] .slots .slot .k{top:4px;left:5px;font:700 9.5px/1 var(--f-display);color:rgba(236,228,210,.5)}
body[data-tela="pc"] .slots .slot .q{right:4px;bottom:3px;font:800 10.5px/1 var(--f-ui);color:var(--bone);text-shadow:0 1px 2px #000}
body[data-tela="pc"] .slots .slot[aria-pressed="true"]{transform:none;border-color:rgba(255,138,61,.25);box-shadow:none;background:linear-gradient(180deg,rgba(96,54,28,.62),rgba(54,33,20,.7))}
body[data-tela="pc"] .slots .slot[aria-pressed="true"]::before{content:"";position:absolute;inset:-2px;pointer-events:none;--c:var(--ember);
  background:linear-gradient(var(--c),var(--c)) top left/10px 2px no-repeat,linear-gradient(var(--c),var(--c)) top left/2px 10px no-repeat,
    linear-gradient(var(--c),var(--c)) top right/10px 2px no-repeat,linear-gradient(var(--c),var(--c)) top right/2px 10px no-repeat,
    linear-gradient(var(--c),var(--c)) bottom left/10px 2px no-repeat,linear-gradient(var(--c),var(--c)) bottom left/2px 10px no-repeat,
    linear-gradient(var(--c),var(--c)) bottom right/10px 2px no-repeat,linear-gradient(var(--c),var(--c)) bottom right/2px 10px no-repeat}
body[data-tela="pc"] .slots .slot .dur{left:6px;right:auto;width:46%;bottom:5px;height:3px;border-radius:0;background:repeating-linear-gradient(90deg,rgba(236,228,210,.2) 0 4px,transparent 4px 6px)}
body[data-tela="pc"] .slots .slot .dur i{background:repeating-linear-gradient(90deg,#7bc86c 0 4px,transparent 4px 6px)}
body[data-tela="pc"] .barra:not(.construindo) .item-nome{display:grid;justify-items:center;gap:5px;min-height:31px;text-shadow:0 1px 3px rgba(0,0,0,.9),0 0 8px rgba(0,0,0,.5)}
.in-n{font:700 16px/1 var(--f-display);letter-spacing:.14em;text-transform:uppercase;color:var(--bone)}
.in-n.vazio{font-size:13px;letter-spacing:.12em;opacity:.85}
.in-s{display:flex;align-items:center;gap:8px;font:800 9.5px/1 var(--f-ui);letter-spacing:.16em;text-transform:uppercase;color:rgba(236,228,210,.62)}
.in-d{display:inline-flex;gap:3px}.in-d i{width:9px;height:3px;border-radius:1px;background:rgba(236,228,210,.22)}
.in-d i.on{background:#7bc86c}.in-d.baixo i.on{background:#e9c54a}.in-d.critico i.on{background:#e2493a}
`;document.head.append(st);}
/* ---- bússola: refaz a fita (tracinho a cada 5°, grau a cada 15°, letra a cada 45°) ---- */
(function hud2Fita(){if(typeof busFita==='undefined'||!busFita)return;for(const b of BUS)b.el.remove();BUS.length=0;
  const nomes={0:'N',45:'NE',90:'L',135:'SE',180:'S',225:'SO',270:'O',315:'NO'},add=(cls,txt,a)=>{const el=document.createElement('span');el.className=cls;el.textContent=txt;busFita.prepend(el);BUS.push({el,a:a*Math.PI/180,v:null});};
  for(let a=0;a<360;a+=5){add('bus-t'+(a%45===0?' m45':a%15===0?' m15':' m5'),'',a);
    if(a%45===0)add('bus-c'+(a%90===0?' bus-p':'')+(a===0?' bus-n':''),nomes[a],a);else if(a%15===0)add('bus-g',String(a),a);}})();
/* ---- barra rápida: nome do item em cima, com o tipo e a durabilidade ---- */
function hud2Tipo(d){if(d.fogo)return'Arma de fogo';if(d.arco)return'Arco';if(d.arremesso)return'Arremesso';return TIPO_NOME[d.tipo]||'';}
function hud2ItemNome(){const el=$('item-nome');if(!el||OBRA.ativo)return;const s=selItem(),d=selDef();
  if(!d){const t=maosVaziasTxt(),i=t.indexOf(' · ');el.innerHTML='<span class="in-n vazio">'+(i<0?t:t.slice(0,i))+'</span>'+(i<0?'':'<span class="in-s">'+t.slice(i+3)+'</span>');return;}
  let info='';
  if(d.fogo)info='<span>'+s.mun+' no pente · '+invCount(d.municao)+' na mochila</span>';
  else if(d.durMax){const f=clamp(s.dur/d.durMax,0,1),n=Math.ceil(f*5-1e-6);let tr='';for(let k=0;k<5;k++)tr+='<i'+(k<n?' class="on"':'')+'></i>';
    info='<span class="in-d'+(f<0.15?' critico':f<0.35?' baixo':'')+'">'+tr+'</span><span>'+Math.round(f*100)+'%</span>';}
  else if(d.cantil)info='<span>'+cantilGoles(s)+' de '+d.cantil+' goles</span>';
  else if(s.n>1||d.max>1)info='<span>'+s.n+(d.max>1?' de '+d.max:'')+'</span>';
  const tipo=hud2Tipo(d);el.innerHTML='<span class="in-n">'+d.nome+'</span>'+(tipo||info?'<span class="in-s">'+(tipo?'<span>'+tipo+'</span>':'')+info+'</span>':'');}
{const _hb=hudBarra;hudBarra=function(){const r=_hb.apply(this,arguments);try{hud2ItemNome();}catch(e){console.error('hud2 barra',e);}return r;};}
{const _ho=hudObras;hudObras=function(){const r=_ho.apply(this,arguments);try{if(!OBRA.ativo)hud2ItemNome();}catch(e){console.error('hud2 obras',e);}return r;};}
/* ---- minimapa: nome do lugar mais perto e a distância, embaixo do círculo ---- */
const HUD2={lugarT:0,lugarTxt:''};
{const m=document.querySelector('#hud .mapa');if(m&&!m.querySelector('.mapa-lugar')){const s=document.createElement('span');s.className='mapa-lugar';s.id='mapa-lugar';m.append(s);}}
function hud2Lugar(x,z){if(typeof dentroCidade==='function'&&dentroCidade(x,z))return{nome:'Cidade',d:null};
  let best=null,bd=1e9;
  for(const p of PLACES){const d=Math.hypot(x-p.x,z-p.z);if(d<p.r+45&&d<bd){bd=d;best={nome:p.nome,d};}}
  if(typeof LUGARES!=='undefined')for(const L of LUGARES){if(L.semChao||L.sub)continue;const d=Math.hypot(x-L.x,z-L.z);if(d<45&&d<bd){bd=d;best={nome:L.nome,d};}}
  if(best)return best;const r=typeof regiaoEm==='function'?regiaoEm(x,z):null;return{nome:r?r.nome:'Mata',d:null};}
HUDS.push(function hud2LugarHUD(dt){HUD2.lugarT-=dt||0;if(HUD2.lugarT>0)return;HUD2.lugarT=0.4;const el=$('mapa-lugar');if(!el)return;
  const ss=P.y<SUB_FUNDO&&typeof salaSubEm==='function'?salaSubEm(P.x,P.y+0.3,P.z):null,l=P.y<SUB_FUNDO?{nome:ss?ss.nome:'Subsolo',d:null}:hud2Lugar(P.x,P.z),t=l.nome+(l.d!==null?' · '+Math.round(l.d)+' m':'');if(t!==HUD2.lugarTxt){HUD2.lugarTxt=t;el.textContent=t;}});
