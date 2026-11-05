/* ================= missões iniciais: da bancada até a casa de dois andares (Etapa 5) =================
   Um guia em passos, no quadro da missão, que ensina a sair do nada e chegar à primeira casa de dois andares:
   juntar o básico → machado improvisado → madeira → bancada → tábuas → pregos e cordas → pilares e plataforma →
   paredes e porta → escada → telhado. Cada passo conta sozinho quando a condição aparece (quem já tem a coisa pula o passo).
   O prêmio é experiência (não dá itens). Fica salvo; jogos antigos começam o guia já nos passos que cumpriram, sem prêmio. */
const GUIA_PASSOS=[
  {id:'material',t:'Junte o básico: 4 gravetos, 2 pedras e 5 fibras',d:'Gravetos e pedras ficam no chão da mata; fibras, nas touceiras (aperte E).',ok:()=>invCount('graveto')>=4&&invCount('pedra')>=2&&invCount('fibra')>=5},
  {id:'machado',t:'Faça um machado improvisado',d:'Mochila (Tab) → Fabricar: 1 pedra, 2 gravetos e 3 fibras.',ok:()=>invCount('machadoPedra')+invCount('machado')>0},
  {id:'madeira',t:'Corte 10 madeiras',d:'Com o machado na mão, golpeie as árvores.',ok:()=>invCount('madeira')>=10},
  {id:'bancada',t:'Construa a bancada de trabalho',d:'B abre a construção, aba Oficina: 6 madeiras, 4 pedras e 2 cordas. Perto da fogueira é o melhor lugar.',ok:()=>guiaObras('bancadaTrab')>=1},
  {id:'tabuas',t:'Faça 12 tábuas na bancada',d:'Perto da bancada, aba Fabricar: 2 madeiras viram 3 tábuas.',ok:()=>invCount('tabuas')>=12},
  {id:'pregos',t:'Arranje 10 pregos e 3 cordas',d:'Pregos: sucata na bancada (1 sucata → 3 pregos) ou nas casas e oficinas. Corda: 5 fibras, na mão.',ok:()=>invCount('pregos')>=10&&invCount('corda')>=3},
  {id:'piso',t:'Levante 4 pilares e a plataforma',d:'B, aba Casa: um pilar em cada canto e a plataforma em cima deles. Ela vira o piso de cima.',ok:()=>guiaObras('pilar')>=4&&guiaObras('plataforma')>=1},
  {id:'paredes',t:'Feche o térreo com paredes e porta',d:'B, aba Casa: parede de tábuas e porta de madeira entre os pilares.',ok:()=>guiaObras('paredeCasa')>=2&&guiaObras('portaMadeira')>=1},
  {id:'escada',t:'Ponha uma escada para o andar de cima',d:'Escada de madeira por fora, ou escada interna: entre na casa e mire uma parede.',ok:()=>guiaObras('escadaMadeira')+guiaObras('escadaInterna')+guiaObras('escadaCorda')>=1},
  {id:'telhado',t:'Cubra a casa com o telhado',d:'B, aba Casa: telhado em cima da plataforma.',ok:()=>guiaObras('telhado')>=1}];
function guiaObras(tipo){let n=0;for(const o of OB)if(o.tipo===tipo)n++;return n;}
function guiaNovo(){return{passo:0,feito:false};}
function guiaD(){return G.guia||(G.guia=guiaNovo());}
/* avança enquanto o passo atual já estiver cumprido; com premio=false (jogo antigo carregando) não comemora */
function guiaConferir(premio){const g=guiaD();if(g.feito)return;let andou=false;
  while(g.passo<GUIA_PASSOS.length&&GUIA_PASSOS[g.passo].ok()){g.passo++;andou=true;if(premio)ganharXP(15);}
  if(g.passo>=GUIA_PASSOS.length){g.feito=true;if(premio){ganharXP(150);sfx('missao');toast('corpo','Primeira casa pronta! Agora é a sua base: bancadas em volta, muros e plantação.');
      if(typeof diarioEvento==='function')diarioEvento('Primeira casa de dois andares pronta','missao');}}
  else if(andou&&premio){const p=GUIA_PASSOS[g.passo];toast('corpo','Próximo: '+p.t.charAt(0).toLowerCase()+p.t.slice(1)+'. '+p.d);}
  if(andou)hudGuia();}
function hudGuia(){const el=$('missao-guia');if(!el)return;const g=guiaD();if(g.feito||!P.alive){el.hidden=true;return;}const p=GUIA_PASSOS[g.passo];
  el.hidden=false;el.textContent='Primeira casa '+(g.passo+1)+'/'+GUIA_PASSOS.length+': '+p.t;el.title=p.d;}
let guiaT=0;
PASSOS.push(function guiaPasso(dt){if(G.modo!=='jogo')return;guiaT-=dt;if(guiaT>0)return;guiaT=1;guiaConferir(true);});
HUDS.push(function guiaHud(){const el=$('missao-guia');if(el&&el.hidden!==(guiaD().feito||!P.alive))hudGuia();});
V8.novo.guia=()=>{G.guia=guiaNovo();hudGuia();};
V8.salvar.guia=()=>G.guia;
V8.carregar.guia=s=>{if(s&&typeof s==='object'&&Number.isFinite(s.passo))G.guia={passo:clamp(Math.floor(s.passo),0,GUIA_PASSOS.length),feito:!!s.feito};
  else{G.guia=guiaNovo();guiaConferir(false);}   // jogo de antes do guia: pula o que já está feito, sem prêmio
  hudGuia();};
