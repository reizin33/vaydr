import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const inv=(id,n)=>X('invAdd')(id,n),W=window,olha=(x,z)=>{P.yaw=Math.atan2(x-P.x,z-P.z);P.body=P.yaw;},"
     "segura=()=>{const a=X('interAtual')();n.alvo=a;W.__ak=a&&a.k;W.__at=a&&X('textoInter')(a);n.interagir(false);return W.__ak;};")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("window.__turbo=6;window.__semRender=true;")
s += [j("vivo();Z.length=0;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;};P.inv.fill(null);const c={x:-62,z:52};"
        "for(const b of X('BICHOS').slice())if(b.vivo&&Math.hypot(b.x-c.x,b.z-c.z)<120)X('BICHOS').splice(X('BICHOS').indexOf(b),1);"
        "const v=X('criarBicho')('vaca',c.x+4,c.z,{});W.__v=v;v.st='come';v.t=60;v.lider=null;inv('milho',6);inv('corda',1);vai(c.x+1.6,c.z);P.agachado=true;P.agK=1;olha(v.x,v.z);"
        "X('INTER_K').criaDomar.usar=(function(o){return function(b,seg){W.__chamou=(W.__chamou||[]).concat([[!!seg,!!b.vivo,!!b.domado,b.conf||0,X('criaComida')(b.tipo),P.agK]]);return o.apply(this,arguments);};})(X('INTER_K').criaDomar.usar);"), ["gwait", 1.0],
      j("segura();W.__acao=JSON.stringify({t:P.acao&&P.acao.tipo,dur:P.acao&&P.acao.dur,k:P.acao&&P.acao.alvo&&P.acao.alvo.k});"), ["gwait", 0.5],
      e("meio", "return{acao:W.__acao,agora:P.acao?{t:r2(P.acao.t),dur:P.acao.dur}:null,ak:W.__ak,agK:P.agK,agachado:P.agachado};"), ["gwait", 2.0],
      e("fim", "const v=W.__v;return{chamou:W.__chamou||null,conf:v.conf,milho:conta('milho'),st:v.st,acao:P.acao&&P.acao.tipo,agK:P.agK};")]
salvar('p175d.json', s)
