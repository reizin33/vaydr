"""p91: história depois do resgate — Base Militar Serra Velha, laboratório, centrífuga, noite de defesa e vacina; e o caso de falha."""
import json, os
A = ("const n=__nnc,P=n.P,G=n.G,Z=n.Z,F=n.FIRE,B=n.BASEM,"
     "vai=(x,z,y)=>{P.x=x;P.z=z;P.y=(y===undefined?n.chaoEm(x,z,5):y);P.vy=0;P.vx=P.vz=0;P.escala=null;P.muro=null;P.noChao=true;},"
     "vivo=()=>{if(!P.alive){n.renascer();}G.modo='jogo';P.vida=100;},r2=v=>Math.round(v*100)/100;")
def js(c): return ["js", "(()=>{" + A + c + "})()"]
def ev(nome, c): return ["eval", nome, "(()=>{" + A + c + "})()"]
def foto(nome, c, antes=0.3):
    return [js(c), ["gwait", antes] if antes else ["wait", 0.01], js("G.modo=G.modo==='jogo'?'pausa':G.modo;window.__turbo=1;window.__semRender=false;"), ["wait", 3.0], ["shot", nome], js("window.__semRender=true;window.__turbo=6;if(G.modo==='pausa')G.modo='jogo';")]
steps = [["wait", 2], ["click", "#m-novo"], ["wait", 1.5],
         js("n.cfg.graf='alto';n.aplicarCfg&&n.aplicarCfg();document.getElementById('teclas')&&(document.getElementById('teclas').hidden=true);n.cfg.cam='3';G.hora=10;Z.length=0;P.vida=100;G.chuva=0;G.chuvaAlvo=0;"),
         ["gwait", 0.3],
         ev("base_existe", "const ob=n.OB.filter(o=>Math.hypot(o.x-B.x,o.z-B.z)<25).map(o=>o.tipo);return{malha:!!n.MESH.baseMil,obras:ob.join(','),caixas:n.INTER.filter(i=>/^base-/.test(i.id)).length,chao:r2(n.chaoEm(B.x,B.z,50)),arvoresDentro:n.TREES.filter(t=>t.alive&&Math.hypot(t.x-B.x,t.z-B.z)<18).length,hist:G.hist};")]
steps += foto("310_base_militar.png", "vai(B.x+30,B.z+4);P.yaw=-Math.PI/2;P.body=P.yaw;const y=n.chaoEm(B.x,B.z,50);G.camFix={pos:[B.x+30,y+14,B.z+26],tgt:[B.x,y+1,B.z]};", 0.6)
steps += foto("311_base_portao.png", "const y=n.chaoEm(B.x,B.z,50);G.camFix={pos:[B.x+27,y+2.2,B.z+3],tgt:[B.x+8,y+1.6,B.z]};", 0.1)
steps += foto("312_base_tenda.png", "const y=n.chaoEm(B.x,B.z,50);G.camFix={pos:[B.x+7,y+2.0,B.z+1.2],tgt:[B.x+4.5,y+1.1,B.z+9]};", 0.1)
steps += [js("G.camFix=null;vai(B.x-12.9,B.z-4);"), js("n.revistar('base-caixa0');"), ev("caixa_militar", "return{itens:n.P.inv.filter(Boolean).map(s=>s.id+'x'+s.n).join(',')};")]
# capítulo 2 começa depois do resgate
steps += [js("vivo();G.m.etapa=4;G.m.fim=true;"), ["gwait", 27.0],
          ev("cap2", "const m=n.missaoInfoT?n.missaoInfoT():null;const h=n.histInfo();return{cap:G.hist.cap,titulo:h&&h.n,texto:h&&h.t,alvo:!!(h&&h.alvo),lab:n.histLab()};")]
# laboratório: caderno
steps += [js("const L=n.histLab();vai(L.x+0.6,L.z-0.9,L.y);P.yaw=0;P.body=0;Z.length=0;n.histMontarPontos();window.__alvo=n.interAtual();const q=n.HIST_PONTOS.find(q=>q.id==='caderno');n.alvo={k:'hist',o:q};n.interagir(true);"),
          ev("caderno", "return{alvo:window.__alvo&&window.__alvo.k,caderno:n.invCount('caderno'),flag:G.hist.caderno};")]
steps += foto("313_laboratorio.png", "const L=n.histLab();G.camFix={pos:[L.x+2.6,L.y+2.0,L.z-2.4],tgt:[L.x,L.y+0.9,L.z]};", 0.1)
# Paciente Zero dá a amostra no capítulo 2
steps += [js("G.camFix=null;vivo();Z.length=0;const L=n.histLab();const q=n.criarZ('pacienteZero',L.x+3,L.z+3,{y:L.y,cidade:true});q.chefeId='pacienteZero';n.ferirZ(q,99999,0,0,1);"), ["gwait", 3.0],
          ev("amostra", "return{amostra:n.invCount('amostra'),cap:G.hist.cap,h:n.histInfo().n};")]
# capítulo 3: gerador com 2 galões (dois toques curtos no E; desde a Etapa 17, segurar abre o painel de energia) e centrífuga
steps += [js("vivo();Z.length=0;n.GAS.length=0;vai(B.x+5,B.z-10.5);n.invAdd('gasolina',2);const g=n.geradorBaseObra();n.ev('INTER_K.baseObra.curto')(g);n.ev('INTER_K.baseObra.curto')(g);"),
          ev("gerador_cheio", "const g=n.geradorBaseObra();return{comb:r2(g.ext.comb),gas:n.invCount('gasolina'),info:n.histInfo().t};"),
          js("vai(B.x+4.2,B.z+7.4);P.yaw=0;P.body=0;const q=n.HIST_PONTOS.find(q=>q.id==='centrifuga');window.__txt=q.texto().t;n.alvo={k:'hist',o:q};n.interagir(true);"),
          ev("centrifuga", "return{antes:window.__txt,sint:G.hist.sint,cap:G.hist.cap,caderno:n.invCount('caderno'),amostra:n.invCount('amostra'),info:n.histInfo().n};")]
# noite da centrífuga: ondas vão para o gerador
steps += [js("vivo();G.hora=19.95;"), ["gwait", 6.0],
          ev("noite_base", "const g=n.geradorBaseObra();return{noite:G.noite,alvoBase:Z.filter(z=>z.vivo&&z.alvoBase).length,hud:!document.getElementById('gerador-base').hidden,gerHp:Math.round(g.hp),info:n.histInfo().t};")]
steps += foto("314_noite_base.png", "vivo();const y=n.chaoEm(B.x,B.z,50);G.camFix={pos:[B.x+20,y+9,B.z-16],tgt:[B.x+3,y+1,B.z-3]};", 0.2)
steps += [js("G.camFix=null;"), ["gwait", 20.0],
          ev("ataque_gerador", "const g=n.geradorBaseObra();return{gerHp:g?Math.round(g.hp):'caiu',quebra:Z.filter(z=>z.vivo&&z.st==='quebra'&&z.obra===g).length,sint:G.hist.sint};"),
          js("for(const z of Z)z.vivo=false;Z.length=0;const g=n.geradorBaseObra();if(g)g.hp=g.hpMax;vivo();G.hora=5.95;"), ["gwait", 4.0],
          ev("amanheceu", "return{noite:G.noite,pronta:G.hist.vacinaPronta,sint:G.hist.sint,info:n.histInfo().t};")]
# vacina: pega, toma, fica imune e vê o segundo final
steps += [js("vivo();vai(B.x+3.6,B.z+7.5);const q=n.HIST_PONTOS.find(q=>q.id==='vacina');n.alvo={k:'hist',o:q};n.interagir(true);"),
          ev("vacinas", "return{vacinas:n.invCount('vacina')};"),
          js("const i=P.inv.findIndex(q=>q&&q.id==='vacina');n.usarItem(i);"), ["wait", 6.5],
          ev("fim2", "const t=document.getElementById('t-fim');return{vacinado:!!P.lesoes.vacinado,fim2:G.hist.fim2,tela:!t.hidden,titulo:t.querySelector('h2').textContent,texto:document.getElementById('fim-t').textContent,conq:!!n.CQ.f.vacina};"),
          js("document.getElementById('fim-ok').click();"), ["wait", 0.5],
          js("vivo();let v=0;for(let k=0;k<80;k++){n.lesaoMordida({tipo:'rastejante'});v=Math.max(v,P.lesoes.virus);}window.__vimune=v;"),
          ev("imune", "return{virus:window.__vimune,modo:G.modo};")]
steps += foto("315_fim2.png", "", 0.01)
# falha: gerador cai na noite da centrífuga
steps += [js("vivo();G.modo='jogo';G.hist.cap=4;G.hist.sint=true;G.hist.rodou=false;G.hist.vacinaPronta=false;G.hora=22;G.noite=true;const g=n.geradorBaseObra();n.destruirObra(g);"), ["gwait", 1.0],
          ev("falha", "const g=n.geradorBaseObra();return{cap:G.hist.cap,sint:G.hist.sint,novoGerador:!!g,hp:g&&Math.round(g.hp),max:g&&g.hpMax,caderno:n.invCount('caderno'),amostra:n.invCount('amostra')};"),
          js("n.salvarJogo();n.carregarJogo();"), ["gwait", 0.4],
          ev("salvo", "return{hist:G.hist,base:n.OB.filter(o=>Math.hypot(o.x-B.x,o.z-B.z)<25).map(o=>o.tipo).join(',')};")]
plan = [["desk", {"viewport": {"width": 1280, "height": 720}}, steps]]
json.dump(plan, open(os.path.join(os.path.dirname(__file__), '..', 'p91.json'), 'w'), ensure_ascii=False)
print('ok', len(steps))
