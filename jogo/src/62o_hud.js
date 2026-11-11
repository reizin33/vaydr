/* ================= HUD no estilo do DayZ (11/11, pedido do dono) — só no PC =================
   Embaixo à direita, ícones de contorno sem painel: sede, fome, temperatura | sono, vida. Cada ícone enche de baixo para
   cima conforme o nível e muda de cor (branco bem, amarelo baixo, vermelho crítico; termômetro azul no frio e laranja no
   calor). Setas embaixo mostram se o valor está subindo ou caindo (duas setas quando rápido). Embaixo à esquerda, a barra
   fina de fôlego (a energia de correr, rolar e nadar), que fica fraca quando está cheia. O nível (anel de XP) e os avisos
   (sangrando, molhado, com frio...) continuam, sem o painel escuro. No celular fica o HUD de antes. */
{const st=document.createElement('style');st.textContent=`
body[data-tela="pc"] .vitais .vit{background:none;border:0;box-shadow:none;padding:0;gap:10px;backdrop-filter:none;-webkit-backdrop-filter:none}
body[data-tela="pc"] .vitais .vit .vida,body[data-tela="pc"] .vitais .vit .gauges{display:none}
body[data-tela="pc"] .vitais .nivel{width:42px;height:42px}
body[data-tela="pc"] .vitais .nivel b{font-size:16px;margin-top:-5px;text-shadow:0 1px 3px #000}
body[data-tela="pc"] .vitais .nivel small{bottom:6px;font-size:6px}
body[data-tela="pc"] .vitais .chip-v{background:none;border:0;padding:0 2px;font-size:12px;text-shadow:0 1px 2px #000,0 0 6px rgba(0,0,0,.6)}
.dz{display:flex;align-items:flex-end;gap:17px;padding:0 2px 2px;filter:drop-shadow(0 1px 1.5px rgba(0,0,0,.85)) drop-shadow(0 0 5px rgba(0,0,0,.45))}
.dz-ic{position:relative;width:31px;display:grid;justify-items:center;gap:3px;color:#f2efe8;--cor:#f2efe8}
.dz-ic svg.f{width:31px;height:31px;overflow:visible}
.dz-ic .lin{fill:none;stroke:var(--cor);stroke-width:1.7;stroke-linejoin:round;stroke-linecap:round}
.dz-ic .enc{fill:var(--cor);opacity:.9}
.dz-ic.baixo{--cor:#e9c54a}.dz-ic.critico{--cor:#e2493a}.dz-ic.frio{--cor:#5fb0ee}.dz-ic.calor{--cor:#ef8a3c}
.dz-ic.critico svg.f{animation:pulso 1s ease-in-out infinite}
.dz-seta{height:9px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0}
.dz-seta svg{width:11px;height:5.5px;fill:none;stroke:var(--cor);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.dz-sep{width:2px;height:28px;background:#f2efe8;opacity:.8;margin:0 -4px 13px;border-radius:1px}
.dz-folego{display:flex;align-items:center;gap:8px;margin:10px 0 3px 2px;
  color:#f2efe8;filter:drop-shadow(0 1px 1.5px rgba(0,0,0,.85));transition:opacity .6s;pointer-events:none}
.dz-folego .ico{width:17px;height:17px}
.dz-fb{width:180px;height:3px;background:rgba(255,255,255,.18);border-radius:2px;overflow:hidden}
.dz-fb i{display:block;height:100%;width:100%;background:#f2efe8;transform-origin:left;transition:transform .15s linear}
.dz-folego.baixo .dz-fb i{background:#e9c54a}.dz-folego.critico .dz-fb i{background:#e2493a}
.dz-folego.cheio{opacity:.35}
.hud.oculto .dz-folego{display:none}
@media (prefers-reduced-motion:reduce){.dz-ic.critico svg.f{animation:none}}`;document.head.appendChild(st);}
/* desenhos (contorno; o mesmo desenho, recortado de baixo para cima, é o enchimento) */
const DZ_ICONES={
  sede:'M10 2.5h4v2.2l1.6 2.6c.3.5.4 1 .4 1.5V20a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 8 20V8.8c0-.5.1-1 .4-1.5L10 4.7z',
  fome:'M12 7.6c-1.2-1.1-2.6-1.6-3.9-1.3C5.6 6.8 4.6 9.1 5 12c.6 4.4 3.3 8.6 5.5 8.6.6 0 1-.3 1.5-.3s.9.3 1.5.3c2.2 0 4.9-4.2 5.5-8.6.4-2.9-.6-5.2-3.1-5.7-1.3-.3-2.7.2-3.9 1.3zM12 7.4c0-1.9.9-3.6 2.6-4.6',
  temp:'M10 4.2a2 2 0 0 1 4 0v9.6a4.2 4.2 0 1 1-4 0z',
  sono:'M16.8 3.4a8.4 8.4 0 1 0 3.8 14.1A7 7 0 0 1 16.8 3.4z',
  vida:'M9.2 3h5.6v6.2H21v5.6h-6.2V21H9.2v-6.2H3V9.2h6.2z'};
const DZ_SETA={up:'M1.5 4.5 5 1.5l3.5 3',dn:'M1.5 1.5 5 4.5l3.5-3'};
{const hud=$('hud'),vit=$('vitais');
  if(hud&&vit&&!$('dz')){
    const ic=(k,t)=>`<div class="dz-ic" id="dz-${k}" title="${t}"><svg class="f" viewBox="0 0 24 24" aria-hidden="true"><defs><clipPath id="dz-c-${k}"><rect x="-2" y="0" width="28" height="24"/></clipPath></defs>`+
      `<path class="enc" clip-path="url(#dz-c-${k})" d="${DZ_ICONES[k].split('M').slice(0,2).join('M')}"/><path class="lin" d="${DZ_ICONES[k]}"/></svg><span class="dz-seta"></span></div>`;
    vit.insertAdjacentHTML('beforeend','<div class="dz so-pc" id="dz" aria-label="Estado do sobrevivente">'+ic('sede','Sede')+ic('fome','Fome')+ic('temp','Temperatura')+
      '<span class="dz-sep" aria-hidden="true"></span>'+ic('sono','Sono')+ic('vida','Vida')+'</div>');
    /* fôlego no canto de baixo à esquerda, embaixo do quadro de comandos (assim um não cobre o outro nos primeiros minutos) */
    const fol='<div class="dz-folego so-pc" id="dz-folego" title="Fôlego"><svg class="ico" aria-hidden="true"><use href="#i-correr"/></svg><span class="dz-fb"><i></i></span></div>';
    const tk=$('teclas'),esq=hud.querySelector('.esq');if(tk)tk.insertAdjacentHTML('afterend',fol);else(esq||hud).insertAdjacentHTML('beforeend',fol);}}
const DZ={ult:{},taxa:{},cheioT:0};
function dzEstado(k,f){return f<0.15?'critico':f<0.35?'baixo':'';}
function dzIcone(k,f,cls,titulo,dt,v){const el=$('dz-'+k);if(!el)return;f=clamp(f,0,1);
  const r=el.querySelector('clipPath rect');const y=(24*(1-f)).toFixed(2);if(r.getAttribute('y')!==y){r.setAttribute('y',y);r.setAttribute('height',(24*f+0.01).toFixed(2));}
  const c='dz-ic'+(cls?' '+cls:'');if(el.className!==c)el.className=c;if(el.title!==titulo)el.title=titulo;
  /* tendência: média do quanto o valor mudou por segundo nos últimos segundos */
  /* conta no tempo do jogo (não no do quadro) e corta saltos grandes (comeu de uma vez, carregou o jogo) para a seta não travar */
  if(dt>0&&v!==undefined){const u=DZ.ult[k];DZ.ult[k]=v;if(u!==undefined){const tx=clamp((v-u)/dt,-12,12);DZ.taxa[k]=(DZ.taxa[k]||0)+(tx-(DZ.taxa[k]||0))*Math.min(1,dt*0.9);}}
  /* gasto normal (fome 0,065/s, sede 0,09/s) não mostra seta; correndo, sarando, passando fome ou comendo, mostra */
  const t=DZ.taxa[k]||0,a=Math.abs(t),n=a>2.0?2:a>0.12?1:0,dir=t>0?'up':'dn',chave=n+dir;
  const s=el.querySelector('.dz-seta');if(s.dataset.k!==chave){s.dataset.k=chave;s.innerHTML=n?('<svg viewBox="0 0 10 6"><path d="'+DZ_SETA[dir]+'"/></svg>').repeat(n):'';}}
HUDS.push(function hudDayZ(){if(cfg.tela!=='pc'||!P||!$('dz'))return;const dt=DZ.t0===undefined?0:clamp(G.t-DZ.t0,0,1);DZ.t0=G.t;
  const vm=vidaMax?vidaMax():100,fv=P.vida/vm;
  dzIcone('sede',P.sede/100,dzEstado('sede',P.sede/100),'Sede: '+Math.round(P.sede)+'/100',dt,P.sede);
  dzIcone('fome',P.fome/100,dzEstado('fome',P.fome/100),'Fome: '+Math.round(P.fome)+'/100',dt,P.fome);
  dzIcone('sono',P.sono/100,dzEstado('sono',P.sono/100),'Sono: '+Math.round(P.sono)+'/100',dt,P.sono);
  dzIcone('vida',fv,dzEstado('vida',fv),'Vida: '+Math.round(P.vida)+'/'+Math.round(vm),dt,P.vida);
  {const tc=typeof temperatura==='function'?temperatura(P.x,P.z):22,frio=typeof comFrio==='function'&&comFrio(),calor=!frio&&tc>=33;
    const cls=frio?'frio':calor?'calor':'',txt=frio?'Com frio':calor?'Calor':'Confortável';
    dzIcone('temp',clamp((tc+5)/45,0.08,1),cls,'Temperatura: '+Math.round(tc)+' °C · '+txt,dt,frio?-1:calor?1:0);DZ.taxa.temp=0;}
  /* fôlego */
  {const el=$('dz-folego');if(!el)return;const e=clamp((P.energia||0)/100,0,1);el.querySelector('.dz-fb i').style.transform='scaleX('+e.toFixed(3)+')';
    DZ.cheioT=e>=0.995?DZ.cheioT+dt:0;el.classList.toggle('cheio',DZ.cheioT>2.5);el.classList.toggle('baixo',e<0.35&&e>=0.15);el.classList.toggle('critico',e<0.15);}});
/* ---------- painel de Estado na mochila (barras, no estilo do exemplo do dono): vida, fôlego, fome, sede, sono e
   temperatura com a faixa de conforto no meio. Fica embaixo da roupa, na coluna da esquerda, e atualiza com a mochila aberta.
   Cabe na largura da coluna (min-width:0 e textos que cortam): antes alargava a coluna e empurrava a roupa para fora da caixa. ---------- */
{const st=document.createElement('style');st.textContent=`
.est{margin-top:8px;padding:8px 7px 7px;display:grid;gap:6px;min-width:0;overflow:hidden;background:
  repeating-linear-gradient(115deg,rgba(255,255,255,.012) 0 2px,transparent 2px 5px),linear-gradient(#1b1a19,#141312);
  border:1px solid #3a2a24;box-shadow:inset 0 0 0 1px rgba(0,0,0,.6),inset 0 0 18px rgba(0,0,0,.55);border-radius:3px}
.est-t{font:800 9px/1 var(--f-ui);letter-spacing:.18em;text-transform:uppercase;color:#9b958c}
.est-l{display:grid;gap:3px;min-width:0}
.est-c{display:flex;align-items:center;gap:5px;min-width:0;font:800 9.5px/1.15 var(--f-ui);letter-spacing:.05em;text-transform:uppercase;color:#d9d4cb}
.est-c .ico{width:12px;height:12px;color:var(--ec);flex:none}
.est-c .n{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.est-c b{margin-left:auto;flex:none;font:800 10.5px/1 var(--f-ui);color:var(--ec);font-variant-numeric:tabular-nums;letter-spacing:0;white-space:nowrap}
.est-c b small{font-size:8.5px;color:#8d877e;font-weight:700}
.est-b{position:relative;height:6px;background:#2a2826;box-shadow:inset 0 1px 2px rgba(0,0,0,.7);overflow:hidden;border-radius:1px}
.est-b i{position:absolute;inset:0 auto 0 0;width:100%;background:var(--ec);transform-origin:left;transition:transform .3s;
  -webkit-mask:repeating-linear-gradient(100deg,#000 0 3px,rgba(0,0,0,.82) 3px 4px,#000 4px 9px);mask:repeating-linear-gradient(100deg,#000 0 3px,rgba(0,0,0,.82) 3px 4px,#000 4px 9px)}
.est-b::after{content:"";position:absolute;inset:auto 0 0 0;height:2px;background:repeating-linear-gradient(90deg,rgba(0,0,0,.55) 0 1px,transparent 1px 10%)}
.est-temp .est-b{height:7px;overflow:visible;background:linear-gradient(90deg,#2b5b96,#46627f 30%,#6d6b67 50%,#8a5a3a 72%,#a8371f)}
.est-temp .est-b::after{display:none}
.est-temp .est-m{position:absolute;top:-2px;bottom:-2px;width:2px;background:#f4f1ea;box-shadow:0 0 3px #000;translate:-1px 0;transition:left .4s}
.est-z{display:flex;justify-content:space-between;gap:2px;min-width:0;font:800 7.5px/1 var(--f-ui);letter-spacing:.06em;text-transform:uppercase;color:#77716a}
.est-z span{white-space:nowrap;opacity:.6}
.est-z span.on{opacity:1}.est-z .f.on{color:#6fb0f0}.est-z .m.on{color:#8fca78}.est-z .q.on{color:#e07a48}
@media (max-height:520px){.est-c b small{display:none}.est-z .m{display:none}}`;document.head.appendChild(st);}
const EST_LIN=[['vida','Vida','#c23b2f','i-coracao'],['energia','Fôlego','#e3b422','i-energia'],['fome','Fome','#e2661d','i-fome'],['sede','Sede','#3d84d6','i-sede'],['sono','Sono','#8f88dc','i-lua']];
function estadoHTML(){let h='<div class="est so-pc" id="est"><span class="est-t">Estado</span>';
  for(const[k,n,c,ic]of EST_LIN)h+='<div class="est-l" id="est-'+k+'-l" style="--ec:'+c+'"><span class="est-c"><svg class="ico" aria-hidden="true"><use href="#'+ic+'"/></svg><span class="n">'+n+'</span><b id="est-'+k+'-v"></b></span><span class="est-b"><i id="est-'+k+'"></i></span></div>';
  h+='<div class="est-l est-temp" id="est-temp-l" style="--ec:#d9d4cb"><span class="est-c"><svg class="ico" aria-hidden="true"><use href="#i-frio"/></svg><span class="n">Temp.</span><b id="est-temp-v"></b></span><span class="est-b"><span class="est-m" id="est-temp-m"></span></span>'+
    '<span class="est-z"><span class="f" id="est-z-f">Frio</span><span class="m" id="est-z-m">Conforto</span><span class="q" id="est-z-q">Calor</span></span></div></div>';return h;}
function estadoAtualiza(){if(!$('est'))return;const vm=vidaMax?vidaMax():100;
  for(const[k,n]of EST_LIN){const mx=k==='vida'?vm:100,v=clamp(P[k]||0,0,mx),vr=Math.round(v),mr=Math.round(mx);$('est-'+k).style.transform='scaleX('+(v/mx).toFixed(3)+')';
    const vb=$('est-'+k+'-v'),t=vr+'<small>/'+mr+'</small>';if(vb.innerHTML!==t)vb.innerHTML=t;$('est-'+k+'-l').title=n+': '+vr+' de '+mr;}
  const tc=typeof temperatura==='function'?temperatura(P.x,P.z):22,frio=typeof comFrio==='function'&&comFrio(),calor=!frio&&tc>=33;
  const pos=frio?0.16:calor?0.86:0.36+0.28*clamp((tc-15)/15,0,1);$('est-temp-m').style.left=(pos*100).toFixed(1)+'%';
  const tv=$('est-temp-v');tv.textContent=Math.round(tc)+' °C';tv.style.color=frio?'#6fb0f0':calor?'#e07a48':'#8fca78';
  $('est-z-f').classList.toggle('on',frio);$('est-z-m').classList.toggle('on',!frio&&!calor);$('est-z-q').classList.toggle('on',calor);
  $('est-temp-l').title='Temperatura: '+Math.round(tc)+' °C · '+(frio?'Com frio':calor?'Calor':'Confortável');}
{const _mr=mochilaRender;mochilaRender=function(){const r=_mr.apply(this,arguments);const eq=$('inv-equip');if(eq&&!$('est')){eq.insertAdjacentHTML('beforeend',estadoHTML());}estadoAtualiza();return r;};}
HUDS.push(function estadoNaMochila(){if(!$('inv').hidden&&$('est'))estadoAtualiza();});
