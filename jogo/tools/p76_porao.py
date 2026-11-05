"""p76: porão das casas (alçapão, escada, caixa), piso fraco no 2º andar das casas, silhueta de longe."""
import json, os
A = ("const n=__nnc,C=n.CID,P=n.P,G=n.G,W=(p,u,v)=>[p.ox+u*p.c+v*p.s,p.oz-u*p.s+v*p.c],"
     "alvo=()=>{const a=n.alvo;return a?{k:a.k,t:(n.textoInter(a)||{}).t||null}:null;},r2=v=>Math.round(v*100)/100;")
def ev(nome, corpo): return ["eval", nome, "(()=>{" + A + corpo + "})()"]
def js(corpo): return ["js", "(()=>{" + A + corpo + "})()"]
fechar = ["js", "(()=>{const b=document.getElementById('inv-x');if(b)b.click();})()"]
sobe = lambda tecla: [["press", "e"], ["js", "window.__turbo=2;"], ["down", tecla], ["until", "!__nnc.P.escala", 90], ["up", tecla], ["js", "window.__turbo=6;"], ["gwait", 0.3]]
steps = [["wait", 2], ["click", "#m-novo"], ["wait", 1.5], js("G.hora=10;n.Z.length=0;for(const[k,q]of[['tabuas',20],['pregos',20]])n.invAdd(k,q);"), ["gwait", 0.3],
 ev("poroes", "return C.poroes.map(a=>a.p.nome);"),
 js("const a=C.poroes[0];window.__a=a;const t=a.via.topo;P.x=t.x;P.z=t.z;P.y=t.y;P.vy=0;const ang=Math.atan2(a.x-P.x,a.z-P.z);P.yaw=ang;P.body=ang;n.Z.length=0;"),
 ["gwait", 0.3],
 ev("alvoAlcapao", "return{alvo:alvo(),via:window.__a.via.recolhida};"),
 js("n.interagir(false);n.Z.length=0;"),
 ev("aberto", "const a=window.__a;return{aberto:a.aberto,sup:!!a.sup,via:a.via.recolhida};"),
 js("const t=window.__a.via.topo;P.x=t.x;P.z=t.z;P.y=t.y+0.02;P.vy=0;P.yaw=t.rumo+Math.PI;P.body=P.yaw;n.Z.length=0;"), ["gwait", 0.3],
 ev("alvoDesce", "return alvo();"),
 *sobe("s"),
 ev("noPorao", "const s=n.salaEm(P.x,P.y+0.3,P.z),a=window.__a;return{y:r2(P.y),yC:r2(a.sala.y),sala:s&&s.tipo,int:r2(n.interiorEm(P.x,P.y+0.3,P.z)),teto:n.tetoEm(P.x,P.y+0.3,P.z)};"),
 ev("caixa", "const c=window.__a.cont;n.abrirCont(c);const b=n.bau;return{estado:c.estado,itens:b?b.itens.filter(Boolean).map(i=>i.id+'x'+i.n):null};"),
 fechar, ["gwait", 0.2],
 js("const b=window.__a.via.base;P.x=b.x;P.z=b.z;P.y=b.y;P.vy=0;n.Z.length=0;"), ["gwait", 0.3],
 *sobe("w"),
 ev("voltou", "return{y:r2(P.y),y0:r2(window.__a.p.y0)};"),
 # piso fraco: muro no 2º andar de uma casa
 js("n.Z.length=0;const p=C.predios.find(q=>q.casa&&q.andares===2);const s=p.salas[1].find(q=>q.tipo==='quarto');const w=W(p,(s.u0+s.u1)/2,(s.v0+s.v1)/2);P.x=w[0];P.z=w[1];P.y=s.y;P.vy=0;P.yaw=0;P.body=0;"),
 ["gwait", 0.3],
 ev("pisoFraco", "n.modoObra(true);n.OBRA.tipo='muro';n.OBRA.ctx=n.contextoObra();n.obraAlvo();const r={ctx:n.OBRA.ctx,ok:n.OBRA.ok,motivo:n.OBRA.motivo};n.OBRA.tipo='bau';n.obraAlvo();r.bau=n.OBRA.ok||n.OBRA.motivo;n.modoObra(false);return r;"),
 js("n.salvarJogo();"), ["reload"], ["wait", 2.5], ["click", "#m-continuar"], ["wait", 1.5], ["gwait", 0.4],
 ev("carregado", "const a=C.poroes[0];return{aberto:a.aberto,sup:!!a.sup,via:a.via.recolhida,caixa:a.cont.estado};"),
]
plan = [["desk", {"viewport": {"width": 960, "height": 540}}, steps]]
json.dump(plan, open(os.path.join(os.path.dirname(__file__), '..', 'p76.json'), 'w'), ensure_ascii=False)
print('ok', len(steps))
