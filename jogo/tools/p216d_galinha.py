"""p216d: depuração do p175 — pegar galinha solta: sem cachorro por perto, sem zumbi e sem barulho, chega agachado a 1,4 m de
uma galinha que está no chão e segura E. Confere se ela fica calma, se o alvo é a galinha e se ela vai para a mochila (no p175
a galinha escolhida já estava correndo e o alvo era uma vaca perto)."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const W=window,olha=(x,z)=>{P.yaw=Math.atan2(x-P.x,z-P.z);P.body=P.yaw;},"
     "alvo=()=>{const a=X('interAtual')();return{k:a&&a.k,txt:a&&X('textoInter')(a)};},"
     "segura=()=>{const a=X('interAtual')();n.alvo=a;W.__ak=a&&a.k;n.interagir(false);return W.__ak;},"
     "_dm=X('dentroMapa'),_pb=X('pointBlocked');")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [j("vivo();Z.length=0;const C=X('CAO');C.ativo=false;window.__cadaPasso=()=>{__nnc.Z.length=0;X('NOISE').length=0;P.vida=100;};G.hora=10;"),
      j("const f=X('PLACES').find(p=>p.id==='fazenda');let p=null;for(let k=0;k<24&&!p;k++){const a=k/24*6.283,x=f.x+Math.cos(a)*25,z=f.z+Math.sin(a)*25;if(_dm(x,z,4)&&!_pb(x,z,0.6))p={x,z};}vai(p.x,p.z);"),
      ["gwait", 4.0],   # as galinhas soltas aparecem quando você chega perto dos sítios
      j("const L=X('AVES').filter(b=>b.sp==='galinha'&&b.sitio&&b.st==='chao');"
        "const bichos=[...(X('BICHOS')||[]),...(X('CRIACAO')||[])];const longe=b=>!bichos.some(q=>q&&q.x!==undefined&&Math.hypot(q.x-b.x,q.z-b.z)<7);"
        "const b=L.find(longe)||L[0];W.__gb=b;W.__n=L.length;let x=b.x+1.4,z=b.z;for(let k=0;k<12;k++){const a=k*0.52;x=b.x+Math.cos(a)*1.4;z=b.z+Math.sin(a)*1.4;if(!_pb(x,z,0.4)&&_dm(x,z,2))break;}"
        "vai(x,z);P.agachado=true;P.agK=1;olha(b.x,b.z);"), ["gwait", 0.6],
      e("calma", "const b=W.__gb;return Object.assign(alvo(),{galinhasNoChao:W.__n,st:b.st,dist:Math.round(Math.hypot(b.x-P.x,b.z-P.z)*100)/100,sitio:b.sitio&&b.sitio.id});"),
      j("const b=W.__gb;olha(b.x,b.z);P.agachado=true;P.agK=1;segura();"), ["gwait", 1.6],
      e("pegou", "return{alvo:W.__ak,galinha:conta('galinha'),naLista:X('AVES').includes(W.__gb)};"),
      # de pé e chegando, ela foge correndo
      j("P.agachado=false;P.agK=0;const L=X('AVES').filter(b=>b.sp==='galinha'&&b.sitio&&b.st==='chao');const b=L[0];W.__gb2=b;if(b){W.__gp=[b.x,b.z];vai(b.x+1.8,b.z);}"), ["gwait", 0.6],
      e("foge", "const b=W.__gb2;if(!b)return{semGalinha:true};return{st:b.st,andou:Math.round(Math.hypot(b.x-W.__gp[0],b.z-W.__gp[1])*100)/100};")]
salvar('p216d.json', s, vp=(640, 360))
