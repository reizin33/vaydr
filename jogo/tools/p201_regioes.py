"""p201: Etapa 22, carregamento por distância e estado das regiões: níveis perto, longe e muito longe do Alto mudando com a
distância (com folga); malhas do Alto liberadas quando muito longe e remontadas uma por quadro quando volta (tempo de cada peça
e o maior quadro); zumbis da região aparecem perto, ficam guardados como número quando você vai embora e voltam; descobertas,
balão, mirante e o desafio do galpão salvos e carregados."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const RE=X('REG_ESTADO'),PC=X('ARC_PECAS'),D=()=>X('arcD')(),vivos=()=>Z.filter(z=>z.vivo&&z.arc).length,"
     "malhas=()=>PC.filter(q=>q.mesh).length,passo=()=>X('regPasso')(0.6,true),ir=(x,z)=>{vai(x,z,X('chaoEm')(x,z,X('ground')(x,z)+1));passo();};")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;window.__cadaPasso=()=>{P.vida=100;P.fome=100;P.sede=100;P.energia=100;};"),
      j("ir(0,0);"), ["gwait", 1.0],
      e("clareira", "return{nivel:RE.alto,malhas:malhas(),pecas:PC.length,zumbisAlto:vivos()};"),
      j("ir(370,8);"), ["gwait", 1.0],
      e("porto", "return{nivel:RE.alto,malhas:malhas(),fila:X('ARC_FILA').length};"),
      j("window.__perf={passo:0,veg:0,render:0,hud:0,n:0};window.__maxQ=0;const cp=window.__cadaPasso;window.__t0=performance.now();window.__cadaPasso=()=>{cp();const t=performance.now();window.__maxQ=Math.max(window.__maxQ,t-window.__t0);window.__t0=t;};"),
      j("ir(62,-100);"), ["gwait", 0.5],
      e("vila", "return{nivel:RE.alto,dist:Math.round(Math.hypot(P.x-50,P.z+244)-64)};"),
      ["gwait", 2.0],
      e("carregou", "const C=X('ARC_CARGA');return{malhas:malhas(),de:PC.length,pecas:C.slice(-PC.length),maiorPeca:Math.max(...C.slice(-PC.length).map(c=>c[1])),maiorQuadro:Math.round(window.__maxQ)};"),
      j("ir(50,-230);"), ["gwait", 1.5],
      e("chegou", "const d=D();return{nivel:RE.alto,zumbis:vivos(),guardados:d.zVivos,dia:d.zDia};"),
      j("let k=0;for(const z of Z)if(z.vivo&&z.arc&&k<4){z.vivo=false;z.st='morto';k++;}"), ["gwait", 1.5],
      e("matou4", "return{zumbis:vivos(),guardados:D().zVivos};"),
      j("ir(254,5);"), ["gwait", 1.0],
      e("foiEmbora", "return{nivel:RE.alto,zumbis:vivos(),guardados:D().zVivos};"),
      j("ir(50,-230);"), ["gwait", 1.5],
      e("voltou", "return{nivel:RE.alto,zumbis:vivos(),guardados:D().zVivos};"),
      j("ir(254,5);"), ["gwait", 0.5], j("G.dia+=3;ir(50,-230);"), ["gwait", 1.5],
      e("tresDias", "return{zumbis:vivos(),guardados:D().zVivos,dia:G.dia};"),
      # estado salvo: descobertas, mirante, balão e galpão
      j("const d=D();d.mapeada=true;d.balaoDesm=G.dia;d.vistos.mirante=1;d.vistos.balao=1;const g=X('pdsD')();g.fus=true;g.luz=true;X('pdsPortasConferir')();"),
      e("salvou", "X('salvarJogo')();return{regioes:Object.keys(X('regD')()).length,alto:JSON.stringify(D()).slice(0,160)};"),
      j("G.regioes=null;G.pds=null;X('regD')();X('pdsPortasConferir')();"),
      e("zerou", "return{mapeada:!!D().mapeada,portao:X('GALP').portao.estado};"),
      j("X('carregarJogo')();"), ["gwait", 1.5],
      e("carregou2", "const d=D();return{mapeada:!!d.mapeada,balao:!!d.balaoDesm,vistos:Object.keys(d.vistos).length,descoberta:!!d.descoberta,fus:X('pdsD')().fus,luz:X('pdsD')().luz,portao:X('GALP').portao.estado,nivel:RE.alto,zumbis:vivos()};")]
salvar('p201.json', s, vp=(640, 360))
