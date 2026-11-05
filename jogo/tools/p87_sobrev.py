"""p87: sobreviventes — achar, resgatar (falar, comida, curativo, cerco), levar ao acampamento, tarefas, comida dos baús, ataque e levantar."""
import json, os
A = ("const n=__nnc,C=n.CID,P=n.P,G=n.G,Z=n.Z,S=id=>n.SOBREV.find(s=>s.id===id),"
     "vai=(x,z,y)=>{P.x=x;P.z=z;P.y=(y===undefined?n.chaoEm(x,z,5):y);P.vy=0;P.vx=P.vz=0;P.escala=null;P.muro=null;P.noChao=true;},"
     "r2=v=>Math.round(v*100)/100;")
def js(c): return ["js", "(()=>{" + A + c + "})()"]
def ev(nome, c): return ["eval", nome, "(()=>{" + A + c + "})()"]
def foto(nome, c, antes=0.3):
    return [js(c), ["gwait", antes] if antes else ["wait", 0.01], js("G.modo=G.modo==='jogo'?'pausa':G.modo;window.__turbo=1;window.__semRender=false;"), ["wait", 3.0], ["shot", nome], js("window.__semRender=true;window.__turbo=6;if(G.modo==='pausa')G.modo='jogo';")]
estado = "return n.SOBREV.map(s=>s.id+':'+s.st+(s.st==='base'?'/'+s.tarefa:'')).join(' ');"
steps = [["wait", 2], ["click", "#m-novo"], ["wait", 1.5],
         js("n.cfg.graf='alto';n.aplicarCfg&&n.aplicarCfg();document.getElementById('teclas')&&(document.getElementById('teclas').hidden=true);n.cfg.cam='3';G.hora=9;Z.length=0;P.vida=100;"),
         ["gwait", 0.3],
         ev("lista", "return n.SOBREV.map(s=>({id:s.id,st:s.st,x:r2(s.x),y:r2(s.y),z:r2(s.z)}));")]
# 1) Rafa na fazenda: só falar
steps += [js("const s=S('rafa');vai(s.x+2.5,s.z+1.5,s.y);P.yaw=Math.atan2(s.x-P.x,s.z-P.z);P.body=P.yaw;"), ["gwait", 0.5],
          ev("rafa_achou", "const s=S('rafa');return{st:s.st,vis:s.ch.vis,alvo:n.alvo&&n.alvo.k,txt:n.alvo&&(n.textoInter(n.alvo)||{}).t};")]
steps += foto("260_rafa_acena.png", "const s=S('rafa');G.camFix={pos:[s.x+3.2,s.y+1.7,s.z+2.6],tgt:[s.x,s.y+1.2,s.z]};", 0.05)
steps += [js("G.camFix=null;n.sobrevFalar(S('rafa'));"), ["gwait", 0.3], ev("rafa_segue", "return{st:S('rafa').st};")]
# leva até a clareira (teleporta o jogador; ele vem junto)
steps += [js("vai(n.FIRE[0]+6,n.FIRE[2]+16);"), ["gwait", 1.5], ev("rafa_base", "const s=S('rafa');return{st:s.st,d:r2(Math.hypot(s.x-n.FIRE[0],s.z-n.FIRE[2]))};")]
# 2) Dona Cida no mercado: pede comida
steps += [js("const s=S('cida');vai(s.x+2,s.z,s.y);P.inv.fill(null);"), ["gwait", 0.4],
          js("n.sobrevFalar(S('cida'));"), ev("cida_semcomida", "return{st:S('cida').st};"),
          js("n.invAdd('feijao',2);n.sobrevFalar(S('cida'));"), ev("cida_comida", "return{st:S('cida').st,feijao:n.invCount('feijao')};")]
# 3) Seu Jorge na oficina: cercado
steps += [js("const s=S('jorge');vai(s.x+2.5,s.z,s.y);"), ["gwait", 0.4],
          ev("jorge_cerco", "const z=Z.filter(q=>q.vivo&&q.cerco==='jorge');return{st:S('jorge').st,cerco:z.length,txt:(n.textoInter({k:'sobrev',o:S('jorge')})||{}).t};"),
          js("n.sobrevFalar(S('jorge'));"), ev("jorge_aindacerco", "return{st:S('jorge').st};"),
          js("for(const z of Z)if(z.cerco==='jorge')n.ferirZ(z,999,0,0,1);"), ["gwait", 0.3],
          js("n.sobrevFalar(S('jorge'));"), ev("jorge_livre", "return{st:S('jorge').st,cerco:Z.filter(q=>q.vivo&&q.cerco==='jorge').length};")]
# 4) Professor Pedro na vila: curativo
steps += [js("const s=S('pedro');vai(s.x+2,s.z,s.y);"), ["gwait", 0.3], js("n.sobrevFalar(S('pedro'));"), ev("pedro_sem", "return{st:S('pedro').st};"),
          js("n.invAdd('bandagem',1);n.sobrevFalar(S('pedro'));"), ev("pedro_com", "return{st:S('pedro').st,band:n.invCount('bandagem')};")]
# todos com você: volta para a clareira
steps += [js("Z.length=0;vai(n.FIRE[0]+4,n.FIRE[2]+12);"), ["gwait", 2.0], ev("chegaram", estado)]
# 5) baú do acampamento com comida; tarefas
steps += [js("const o=n.criarObraT('bau',n.FIRE[0]+3.2,n.FIRE[2]-3.4,0);o.itens[0]={id:'carneCrua',n:3};o.itens[1]={id:'frutas',n:6};o.itens[2]={id:'milho',n:2};o.itens[3]={id:'batata',n:2};"),
          js("S('cida').tarefa='cozinhar';S('jorge').tarefa='consertar';S('pedro').tarefa='curar';S('rafa').tarefa='buscar';"),
          js("n.sobrevAmanhece();"), ["gwait", 0.2],
          ev("comeu", "const b=n.bausBase()[0];return{fome:n.SOBREV.filter(s=>s.st==='base').map(s=>s.id+':'+s.fome).join(' '),bau:b.itens.filter(Boolean).map(i=>i.id+'x'+i.n).join(',')};")]
# 6) painel do grupo
steps += [js("n.abrirGrupo(S('jorge'));"), ["wait", 0.5],
          ev("painel", "const t=document.getElementById('t-grupo');return{vis:!t.hidden,botoes:t.querySelectorAll('.g-tar').length,nome:document.getElementById('g-nome').textContent,lista:document.getElementById('g-lista').textContent.slice(0,120),modo:G.modo};"),
          js("document.querySelector('.g-tar[data-t=\\'vigiar\\']').click();"), ev("painel_tarefa", "return{tarefa:S('jorge').tarefa,on:document.querySelector('.g-tar.on').dataset.t};"),
          ["js", "window.__semRender=false;"], ["wait", 2.5], ["shot", "261_painel_grupo.png"], ["js", "window.__semRender=true;"],
          js("n.fecharGrupo();S('jorge').tarefa='consertar';"), ev("painel_fechou", "return{vis:!document.getElementById('t-grupo').hidden,modo:G.modo};")]
# 7) buscar material: sai e volta com coisas
steps += [js("n.sobrevSaem();"), ev("saiu", "return{st:S('rafa').st,vis:S('rafa').ch.vis};"),
          js("window.__antes=n.contarBase(()=>true);n.sobrevVoltam();"), ev("voltou", "return{st:S('rafa').st,ganhou:n.contarBase(()=>true)-window.__antes};")]
# 8) consertar: barricada danificada
steps += [js("const o=n.OB.find(q=>q.tipo==='barricada');o.hp=60;window.__ob=o;"), ["gwait", 6.0], ev("consertou", "const o=window.__ob;return{hp:Math.round(o.hp),max:o.hpMax,jorge:S('jorge').st};")]
# 9) zumbi ataca o acampamento: luta, cai, levanta
steps += [js("const s=S('cida');const z=n.criarZ('walker',s.x+1.0,s.z+1.0,{st:'caca'});z.hp=60;window.__zc=z;"), ["gwait", 4.0],
          ev("luta", "const z=window.__zc,s=S('cida');return{zv:z.vivo,zhp:Math.round(z.hp),cidaHp:Math.round(s.hp),cidaSt:s.st};"),
          js("n.ferirSobrev(S('cida'),999);"), ev("caiu", "const s=S('cida');return{st:s.st,t:Math.round(s.caidoT)};"),
          js("n.sobrevFalar(S('cida'));"), ev("levantou", "const s=S('cida');return{st:s.st,hp:Math.round(s.hp)};")]
# 10) fotos: acampamento de dia e de noite
steps += foto("262_acampamento_dia.png", "G.hora=10;Z.length=0;vai(n.FIRE[0]+6,n.FIRE[2]+9);G.camFix={pos:[n.FIRE[0]+7,n.FIRE[1]+3.2,n.FIRE[2]+8],tgt:[n.FIRE[0],n.FIRE[1]+1,n.FIRE[2]]};", 3.0)
steps += foto("263_acampamento_noite.png", "G.hora=21.5;G.noite=true;G.ondas=[];G.camFix={pos:[n.FIRE[0]+5,n.FIRE[1]+2.4,n.FIRE[2]+5],tgt:[n.FIRE[0],n.FIRE[1]+0.8,n.FIRE[2]]};", 4.0)
steps += [js("G.camFix=null;"), ev("noite", estado), ev("salvo", "const s=n.serializar();return{sob:s.sob.length,amostra:s.sob.slice(0,3)};")]
plan = [["desk", {"viewport": {"width": 1280, "height": 720}}, steps]]
json.dump(plan, open(os.path.join(os.path.dirname(__file__), '..', 'p87.json'), 'w'), ensure_ascii=False)
print('ok', len(steps))
