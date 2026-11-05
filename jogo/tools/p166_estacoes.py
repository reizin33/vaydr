"""p166: clima e estações (Etapa 8). Estação pelo dia; temperatura ao longo do dia em cada estação; frio à noite (verão não,
inverno sim, e inverno de dia com frente fria); horta, arbusto, peixe, filhotes e predadores por estação; o tempo sorteado muda
com a estação (calorão no verão, frente fria e céu fechado no inverno, ventania no outono) e tem períodos de vários dias; fases
da lua (nome, parte acesa, céu mais claro na cheia e mais escuro na nova); eclipse do sol (dia, escuridão, frio e zumbis) e da
lua; copas mudando de cor no outono; folhas mais rápidas no outono; neve na serra no inverno; relógio com estação, °C e lua;
salvar e carregar mantém o dia, a estação e o período de tempo."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const est=d=>X('estacao')(d).id,T=()=>Math.round(X('temperatura')()),hud=()=>{for(let i=0;i<22;i++)for(const f of X('HUDS'))f();return document.getElementById('dia-est').textContent;},frio=()=>{X('computeEnv')();return X('comFrio')();},"
     "dia=(d,h)=>{G.dia=d;if(h!==undefined)G.hora=h;G.clima.dia=d;G.clima.segs=[];G.clima.atual='limpo';G.clima.k=1;};")
LIMPA = "window.__cadaPasso=()=>{const n=__nnc;for(const z of n.Z)if(!z.eclipse)z.vivo=false;P.vida=100;};"
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [j("vivo();Z.length=0;" + LIMPA),
      e("estacoesPorDia", "return[1,7,8,14,15,21,22,28,29,57].map(d=>d+':'+est(d)+'('+X('estacaoDiaN')(d)+')').join(' ');"),
      e("temperaturas", "const r={},g0=[G.dia,G.hora];for(const d of[2,9,16,23]){const L=[];for(const h of[3,8,13,17,22]){dia(d,h);L.push(h+'h:'+T());}r[est(d)]=L.join(' ');}[G.dia,G.hora]=g0;G.clima.dia=G.dia;return r;"),
      e("frioNoite", "const r={},g0=[G.dia,G.hora];for(const d of[2,9,16,23]){dia(d,23);r[est(d)]={temp:T(),frio:frio()};}dia(23,10);r.invernoDia={temp:T(),frio:frio()};"
                     "G.clima.segs=[[6,30,'frio']];G.clima.atual='frio';G.clima.k=1;r.invernoDiaFrenteFria={temp:T(),frio:frio()};[G.dia,G.hora]=g0;dia(G.dia);return r;"),
      e("comida", "const r={},g0=G.dia;for(const d of[2,9,16,23]){G.dia=d;const b=X('BUSHES').find(q=>!q.agua);r[est(d)]={horta:r2(X('climaHorta')()),arbustoDias:X('estacao')().arbusto,peixe:r2(X('peixeMult')()),filhotes:X('estacaoFaunaK')(),predador:X('estacaoPredador')(),cogumelo:X('estacao')().cogu,folhas:r2(X('folhaRitmo')())};}G.dia=g0;return r;"),
      e("arbustoColhido", "const r={},g0=G.dia;for(const d of[9,23]){G.dia=d;const b=X('BUSHES').find(q=>!q.agua);b.frutas=true;n.alvo={k:'bush',o:b};X('interagir')(true);r[est(d)]=b.cresce-G.dia;}G.dia=g0;return r;"),
      e("tempoPorEstacao", "const r={},g0=G.dia,per=G.clima.periodo;for(const d of[9,16,23,30]){const c={};G.dia=d;for(let k=0;k<400;k++){G.clima.periodo=null;for(const s of X('climaSortear')(d))c[s[2]]=(c[s[2]]||0)+1;}r[est(d)]=c;}"
                            "G.dia=g0;G.clima.periodo=per;return r;"),
      e("periodos", "const r={},g0=G.dia;for(const d of[9,23]){const c={};for(let k=0;k<300;k++){G.clima.periodo=null;X('climaSortear')(d);const p=G.clima.periodo;if(p)c[p.tipo]=(c[p.tipo]||0)+1;}r[est(d)]=c;}G.clima.periodo=null;G.dia=g0;return r;"),
      e("lua", "const L=[];for(let d=1;d<=16;d++)L.push(d+':'+X('luaNome')(d)+'('+r2(X('luaIlum')(d))+')');return L.join(' · ');"),
      e("luaCeu", "const r={},g0=[G.dia,G.hora];for(const d of[3,5,7]){dia(d,23.5);X('computeEnv')();const e2=X('E');r[X('luaNome')(d)]={moonV:r2(e2.moonV),luz:r2(e2.dc[2]),lua:e2.lua.map(r2),visao:r2(X('climaVisao')())};}[G.dia,G.hora]=g0;dia(G.dia);return r;"),
      e("eclipsesDias", "const s=[],l=[];for(let d=1;d<=60;d++){if(X('eclipseSolarDia')(d))s.push(d);if(X('eclipseLunarDia')(d))l.push(d);}return{sol:s,lua:l};")]
# eclipse do sol de verdade no dia 7
s += [j("vivo();dia(7,12.2);vai(F[0]+2,F[2]+2);Z.length=0;"), ["gwait", 12],
      e("eclipseSol", "X('computeEnv')();const e2=X('E');return{hora:r2(G.hora),k:r2(X('eclipseSolarK')()),n:r2(e2.n),sol:r2(e2.sunV),luz:r2(e2.dc[0]),temp:T(),zumbisDoEclipse:Z.filter(z=>z.vivo&&z.eclipse).length,diario:!!G.eclSol};"),
      j("for(const z of Z)z.vivo=false;Z.length=0;dia(7,15);"), ["gwait", 1],
      e("depoisEclipse", "X('computeEnv')();const e2=X('E');return{k:r2(X('eclipseSolarK')()),n:r2(e2.n),sol:r2(e2.sunV)};"),
      # copas no outono, neve na serra no inverno, relógio
      j("dia(16,10);"), ["gwait", 1.5],
      e("copasOutono", "const t=X('TREES').find(q=>q.kind===1&&q.alive&&q.b0===null),p=X('TREES').find(q=>q.kind===0&&q.alive);return{redonda:[r2(t.tr),r2(t.tg),r2(t.tb),'base '+r2(t.t)],pinheiro:[r2(p.tr),r2(p.tg),r2(p.tb)],hud:hud()};"),
      j("dia(23,10);G.clima.segs=[[6,30,'frio']];G.clima.atual='frio';G.clima.k=1;const S=X('SERRA');vai(S.x+3,S.z+3);window.__p0=X('PART').length;"), ["gwait", 2],
      e("neveSerra", "return{nevando:X('nevando')(),temp:T(),particulas:X('PART').length-window.__p0,hud:hud()};"),
      j("vai(F[0]+2,F[2]+2);dia(5,23);"), ["gwait", 0.5],
      e("relogioNoite", "return{hud:hud(),titulo:document.getElementById('dia-est').title};"),
      # salvar e carregar: dia, estação e período
      j("dia(23,10);G.clima.periodo={tipo:'frio',ate:24};X('salvarJogo')();")]
s += [["reload"], ["wait", 3], ["click", "#m-continuar"], ["wait", 2], js("window.__turbo=6;window.__semRender=true;" + LIMPA), ["gwait", 0.5]]
s += [e("carregou", "return{dia:G.dia,estacao:est(),periodo:G.clima.periodo,hud:hud()};")]
# fotos do visual novo: copas no outono de dia e a lua em quarto crescente
s += [j("vivo();dia(16,10.5);vai(F[0]-30,F[2]+20);P.yaw=2.4;P.body=2.4;P.pitch=0.05;n.cfg.cam='1';")]
s += foto('p166_outono.png', "", 1.0, 4.0)
s += [j("dia(5,22.5);vai(F[0]+2,F[2]+2);const m=X('MOON_DIR');P.yaw=Math.atan2(m[0],m[2]);P.body=P.yaw;P.pitch=Math.asin(m[1])-0.02;n.cfg.cam='1';")]
s += foto('p166_lua.png', "", 1.0, 4.0)
salvar('p166.json', s)
