"""p189: Etapa 19, animações: transições (inclina ao arrancar e ao frear, deita na curva, joelhos no pouso, agachado furtivo),
ações contextuais com o corpo (pegar do chão, baú, porta, interruptor, trabalhar na bancada depois de fabricar), veículo
(entra sentando, aparece sentado em terceira pessoa com as mãos no volante, sai levantando; moto com o corpo inclinado),
cavalo (monta passando a perna, desce pisando), pescando (vara na frente, puxa quando morde) e primeira pessoa (a mão acompanha)."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const V=id=>X('VEICS').find(v=>v.id===id),ch=P.ch,o=P.ch.r,r3=a=>Array.from(a).map(r2),"
     "alvo=a=>{window.__a=a;X('alvoInter=window.__a');},toque=a=>{alvo(a);X('interagir')(false);X('usarSolta')();},"
     "anim=()=>P.anim?P.anim.tipo:null,frente=d=>[P.x+Math.sin(P.body)*(d||1),P.z+Math.cos(P.body)*(d||1)];")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__animAtraso=true;window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;P.fome=100;P.sede=100;P.energia=100;"
         "const o=__nnc.P.ch.r;window.__max3=Math.max(window.__max3||-9,o[3]);window.__min3=Math.min(window.__min3||9,o[3]);window.__maxRoll=Math.max(window.__maxRoll||0,Math.abs(__nnc.P.ch.roll||0));};"),
      ev("lugar", "let C=null;for(let r=10;r<70&&!C;r+=4)for(let a=0;a<6.28&&!C;a+=0.4){const x=F[0]+Math.cos(a)*r,z=F[2]+Math.sin(a)*r;let ok=X('dentroMapa')(x,z,20)&&!X('aguaPerto')(x,z,4);"
         "for(let d=0;d<24&&ok;d+=2)if(X('pointBlocked')(x+d,z,1.2))ok=false;if(ok)C=[x,z];}window.__C=C;vai(C[0],C[1]);P.yaw=Math.PI/2;P.body=P.yaw;return{achou:!!C};"),
      # parado: postura de base
      ["gwait", 0.5], j("window.__max3=-9;window.__min3=9;window.__maxRoll=0;"), ["gwait", 0.5],
      e("parado", "return{tronco:[r2(window.__min3),r2(window.__max3)],anim:anim()};"),
      # arranca correndo: inclina para a frente; para de repente: inclina para trás
      j("window.__max3=-9;window.__min3=9;P.yaw=Math.PI/2;"), ["down", "ShiftLeft"], ["down", "KeyW"], ["gwait", 0.6],
      e("arrancando", "return{troncoMax:r2(window.__max3),acc:r2(P._acc||0),vel:r2(Math.hypot(P.vx,P.vz))};"),
      ["gwait", 1.0], j("window.__max3=-9;window.__min3=9;"), ["up", "KeyW"], ["up", "ShiftLeft"], ["gwait", 0.4],
      e("freando", "return{troncoMin:r2(window.__min3),acc:r2(P._acc||0)};"),
      # curva rápida: o corpo deita
      j("window.__maxRoll=0;"), ["down", "ShiftLeft"], ["down", "KeyW"], ["down", "KeyD"], ["gwait", 1.2], ["up", "KeyD"], ["up", "KeyW"], ["up", "ShiftLeft"],
      e("curva", "return{rollMax:r2(window.__maxRoll)};"),
      # pouso: cai de 3 m
      j("vai(window.__C[0],window.__C[1],X('ground')(window.__C[0],window.__C[1])+3.2);P.noChao=false;P.vy=0;"), ["gwait", 0.75],
      e("pouso", "return{pouso:r2(P.pouso||0),joelho:r2(o[24]),quadril:r2(ch.hipY||0)};"),
      # agachado andando: braços na frente
      j("vai(window.__C[0],window.__C[1]);P.agachado=true;"), ["down", "KeyW"], ["gwait", 0.8],
      e("furtivo", "return{agK:r2(P.agK||0),bracoEsq:r2(o[9]),bracoDir:r2(o[15]),antebraco:r2(o[18])};"),
      ["up", "KeyW"], j("P.agachado=false;"), ["gwait", 0.6]]
# ---- ações contextuais ----
s += [j("window.__turbo=1;"), ["gwait", 0.1],
      e("coletar", "const f=frente(1.0);const pk={kind:'pedra',x:f[0],z:f[1],alive:true};X('PICKS').push(pk);toque({k:'pick',o:pk});return{anim:anim(),pegou:!pk.alive};"),
      ["gwait", 0.32],
      e("coletarMeio", "return{anim:anim(),tronco:r2(o[3]),joelho:r2(o[24]),quadril:r2(ch.hipY||0),braco:r2(o[15])};"),
      ["gwait", 0.6], e("coletarFim", "return{anim:anim(),tronco:r2(o[3])};"),
      e("bau", "const f=frente(1.4);const b=X('criarObra')('bau',f[0],f[1],P.body+Math.PI);window.__bau=b;toque({k:'guarda',o:b});return{anim:anim(),modoNaHora:G.modo,esperando:!!(P.anim&&P.anim.depois)};"),
      ["gwait", 0.2], e("bauMeio", "return{anim:anim(),modo:G.modo,tronco:r2(o[3]),braco:r2(o[15]),quadril:r2(ch.hipY||0)};"),
      ["gwait", 0.3], e("bauAbriu", "const r={modo:G.modo,bau:X('bauAberto')===window.__bau};X('fecharMochila')();return r;"), ["gwait", 0.6],
      e("porta", "const f=frente(1.2);const d=X('criarObra')('portaMadeira',f[0],f[1],P.body+Math.PI);window.__porta=d;const t=X('textoInter')({k:'portaMad',o:d});if(t.alt)toque({k:'portaMad',o:d});else{alvo({k:'portaMad',o:d});X('interagir')(false);}return{anim:anim(),aberta:!!d.ext.aberta};"),
      ["gwait", 0.27], e("portaMeio", "return{anim:anim(),braco:r2(o[15]),antebraco:r2(o[18])};"), ["gwait", 0.5],
      e("botao", "const f=frente(1.0);const it=X('criarObra')('interruptor',f[0],f[1],P.body+Math.PI);toque({k:'eletr',o:it});return{anim:anim(),ligado:it.ext.on};"),
      ["gwait", 0.22], e("botaoMeio", "return{anim:anim(),braco:r2(o[15])};"), ["gwait", 0.5],
      e("fabricar", "const f=frente(1.6);X('criarObra')('bancadaTrab',f[0],f[1],P.body+Math.PI);n.invAdd('graveto',6);n.invAdd('pedra',4);n.invAdd('fibra',6);const R=X('RECIPES');"
        "let i=R.findIndex(r=>X('podeFabricar')(r));const ok=i>=0&&X('fabricar')(i,true);return{receita:i>=0?R[i].faz:null,fez:!!ok,pendente:P.animPend||null};"),
      ["gwait", 0.4], e("fabricarMeio", "return{anim:anim(),braco:r2(o[15]),cabeca:r2(o[6])};"), ["gwait", 1.2]]
# ---- veículo ----
s += [e("entrar", "const v=V('caminhonete');v.comb=60;v.x=P.x+Math.sin(P.body)*3.2;v.z=P.z+Math.cos(P.body)*3.2;v.yaw=P.body+Math.PI/2;v.y=X('chaoVeic')(v.x,v.z);X('veicColisor')(v);n.cfg.cam='3';"
        "X('entrarVeic')(v);return{ativo:v.ativo,anim:anim()};"),
      ["gwait", 0.8],
      e("dirigindo", "const v=V('caminhonete'),M=X('MOTORISTA').caminhonete,a=X('carroLocal')(M.h[0],M.h[1],M.h[2],v);return{visivel:X('motoristaVisivel')(),anim:anim(),coxa:r2(o[21]),joelho:r2(o[24]),bracoDir:r2(o[15]),"
        "noBanco:r2(Math.hypot(ch.x-a[0],ch.z-a[2])),yaw:r2(Math.abs(X('angDiff')(ch.yaw,v.yaw)))};"),
      e("sair", "const v=V('caminhonete');v.v=0;X('sairCarro')();return{ativo:v.ativo,anim:anim(),coxa:r2(o[21])};"),
      ["gwait", 0.2], e("sairMeio", "return{anim:anim(),coxa:r2(o[21])};"), ["gwait", 0.6], e("sairFim", "return{anim:anim(),coxa:r2(o[21]),longe:r2(Math.hypot(ch.x-P.x,ch.z-P.z))};"),
      e("moto", "const m=V('motoCidade');m.comb=60;m.pecas.motor=100;m.hp=100;m.x=P.x+Math.sin(P.body)*2;m.z=P.z+Math.cos(P.body)*2;m.yaw=P.body;m.y=X('chaoVeic')(m.x,m.z);X('veicColisor')(m);X('entrarVeic')(m);return{ativo:m.ativo};"),
      ["gwait", 0.9], e("motoPose", "return{visivel:X('motoristaVisivel')(),tronco:r2(o[3]),coxaAberta:r2(o[23]),bracoDir:r2(o[15])};"),
      j("X('sairCarro')();"), ["gwait", 0.8]]
# ---- cavalo ----
s += [e("montar", "const f=frente(2.2);const h=X('criarBicho')('cavalo',f[0],f[1],{zona:'leste'});X('domarCavalo')(h);h.sela=true;h.congelado=true;window.__h=h;X('montar')(h);return{montado:!!P.montado};"),
      ["gwait", 0.05], e("montando", "return{coxaDir:r2(o[27]),aberta:r2(o[29]),tempo:r2(P.mtT||0)};"),
      ["gwait", 0.8], e("montado", "return{coxaDir:r2(o[27]),tempo:r2(P.mtT||0)};"),
      e("descer", "X('descerDoCavalo')(false);return{montado:!!P.montado,anim:anim(),alturaPose:r2(ch.y-P.y)};"),
      ["gwait", 0.1], e("descendo", "return{anim:anim(),alturaPose:r2(ch.y-P.y),joelho:r2(o[24])};"), ["gwait", 0.7], e("desceu", "return{anim:anim(),alturaPose:r2(ch.y-P.y)};")]
# ---- pescando ----
s += [e("pesca", "P.pesca={x:P.x+Math.sin(P.body)*6,y:P.y,z:P.z+Math.cos(P.body)*6,t:2,morde:99,mordeu:false,janela:0,px:P.x,pz:P.z};X('animarJogador')(0.016);const a=o[15];P.pesca.mordeu=true;X('animarJogador')(0.016);const b=o[3];P.pesca=null;"
        "return{bracoVara:r2(a),troncoPuxando:r2(b)};")]
# ---- primeira pessoa: a mão acompanha ----
s += [e("primeiraPessoa", "n.cfg.cam='1';const M=new Float32Array(16);P.anim=null;X('viewModel')(M);const y0=M[13],z0=M[14];P.anim={tipo:'coletar',t:0.35,dur:0.7,alvo:null};X('viewModel')(M);const y1=M[13];"
        "P.anim={tipo:'porta',t:0.4,dur:0.55,alvo:null};X('viewModel')(M);const z1=M[14];P.anim=null;n.cfg.cam='3';return{coletarDesce:r2(y0-y1),portaEmpurra:r2(z0-z1)};")]
salvar('p189.json', s)
