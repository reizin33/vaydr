"""p202: Etapa 23, preparação para multijogador (só arquitetura): nenhuma conexão de rede; cada chave do salvamento tem escopo
(mundo, jogador ou fixo); estadoMundo() e estadoJogador() separam o salvamento e juntarEstado() devolve exatamente o salvamento
de sempre; carregar o estado juntado volta ao mesmo jogo; ids estáveis e únicos para o que um dia vai sincronizar; a fila de
ações registra construir, revistar, porta e interagir sem mudar o jogo; a lista de jogadores tem só você."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const DD=(x,y,p,o)=>{if(o.length>=5)return;if(JSON.stringify(x)===JSON.stringify(y))return;if(x&&y&&typeof x==='object'&&typeof y==='object'){for(const k of new Set([...Object.keys(x),...Object.keys(y)]))DD(x[k],y[k],p+'.'+k,o);}else o.push([p,String(JSON.stringify(x)).slice(0,90),String(JSON.stringify(y)).slice(0,90)]);},"
     "ord=o=>{if(Array.isArray(o))return o.map(ord);if(o&&typeof o==='object'){const r={};for(const k of Object.keys(o).sort())r[k]=ord(o[k]);return r;}return o;},J=o=>JSON.stringify(ord(o));")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;window.__cadaPasso=()=>{P.vida=100;P.fome=100;P.sede=100;};"),
      e("cfg", "const C=X('REDE_CFG');return{ativo:C.ativo,max:C.maxJogadores,chats:C.chats,jogadores:X('JOGADORES').length,local:X('jogadorLocal')().local,ws:typeof window.__wsAberto};"),
      j("n.invAdd('tabuas',20);n.invAdd('pregos',20);n.invAdd('madeira',20);X('modoObra')(true);X('OBRA').tipo='bau';X('obraAlvo')();X('colocarObra')();X('modoObra')(false);"),
      e("escopo", "const s=X('serializar')(),sem=[],cont={fixo:0,mundo:0,jogador:0};for(const k in s){const e=X('escopoDe')(k);if(!e)sem.push(k);else cont[e]++;}for(const k in s.x8){const e=X('escopoDe')(k);if(!e)sem.push('x8.'+k);else cont[e]++;}"
        "return{semEscopo:sem,cont,x8:Object.keys(s.x8).length};"),
      e("separa", "const m=X('estadoMundo')(),jg=X('estadoJogador')();const temP='P' in m,temObras='obras' in jg,inv=!!(jg.P&&jg.P.inv);return{mundoChaves:Object.keys(m).length,jogadorChaves:Object.keys(jg).length,pNoMundo:temP,obrasNoJogador:temObras,inventarioNoJogador:inv,"
        "kbMundo:Math.round(JSON.stringify(m).length/1024),kbJogador:Math.round(JSON.stringify(jg).length/1024)};"),
      e("junta", "const s=X('serializar')(),s2=X('juntarEstado')(X('estadoMundo')(),X('estadoJogador')());return{igual:J(s)===J(s2),tam:J(s).length};"),
      e("recarrega", "const s=X('serializar')(),s2=X('juntarEstado')(X('estadoMundo')(),X('estadoJogador')());const a=ord(JSON.parse(J(s)));X('carregarSave')(JSON.parse(JSON.stringify(s2)));const b=ord(X('serializar')());const dif=[];"
        "for(const k in a){if(k==='tm'||k==='x8')continue;if(JSON.stringify(a[k])!==JSON.stringify(b[k]))dif.push(k);}for(const k in a.x8)if(JSON.stringify(a.x8[k])!==JSON.stringify(b.x8[k]))dif.push('x8.'+k);const det={};for(const k of dif){const o=[];const ka=k.startsWith('x8.')?k.slice(3):k;DD(k.startsWith('x8.')?a.x8[ka]:a[k],k.startsWith('x8.')?b.x8[ka]:b[k],k,o);det[k]=o;}return{diferencas:dif,detalhe:det};"),
      e("uids", "const L=X('entidadesSync')(),ids=L.map(q=>q[0]),tipos={};for(const q of L)tipos[q[1]]=(tipos[q[1]]||0)+1;return{n:L.length,unicos:new Set(ids).size,tipos,estavel:X('entidadesSync')().map(q=>q[0]).join()===ids.join()};"),
      j("const d=X('CID').portas.find(q=>q.p&&q.p.rural&&q.estado==='fechada');window.__porta=d;if(d){vai(d.x+1,d.z+1);X('portaUsar')(d,false);}const it=X('INTER').find(i=>i.kind==='bau'&&i.id==='cabana-bau');if(it){vai(it.x,it.z);window.__a={k:'inter',o:it};X('alvoInter=window.__a');X('interagir')(true);}"),
      e("acoes", "const A=X('REDE').acoes;const tipos={};for(const a of A)tipos[a.tipo]=(tipos[a.tipo]||0)+1;return{n:A.length,tipos,ultima:A[A.length-1]||null};")]
salvar('p202.json', s, vp=(640, 360))
