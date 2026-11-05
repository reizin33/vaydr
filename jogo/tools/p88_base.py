"""p88: base viva — menu de construção, horta, coletor de chuva, gerador + postes + arame farpado, alarme de latas, torre de vigia, cozinheira colhendo, vigia na torre, salvar e carregar."""
import json, os
A = ("const n=__nnc,P=n.P,G=n.G,Z=n.Z,F=n.FIRE,S=id=>n.SOBREV.find(s=>s.id===id),"
     "vai=(x,z,y)=>{P.x=x;P.z=z;P.y=(y===undefined?n.chaoEm(x,z,5):y);P.vy=0;P.vx=P.vz=0;P.escala=null;P.muro=null;P.noChao=true;},"
     "O=t=>n.OB.find(o=>o.tipo===t),r2=v=>Math.round(v*100)/100;")
def js(c): return ["js", "(()=>{" + A + c + "})()"]
def ev(nome, c): return ["eval", nome, "(()=>{" + A + c + "})()"]
def foto(nome, c, antes=0.3):
    return [js(c), ["gwait", antes] if antes else ["wait", 0.01], js("G.modo=G.modo==='jogo'?'pausa':G.modo;window.__turbo=1;window.__semRender=false;"), ["wait", 3.0], ["shot", nome], js("window.__semRender=true;window.__turbo=6;if(G.modo==='pausa')G.modo='jogo';")]
def tela(nome):
    return [js("window.__turbo=1;window.__semRender=false;"), ["wait", 2.5], ["shot", nome], js("window.__semRender=true;window.__turbo=6;")]
steps = [["wait", 2], ["click", "#m-novo"], ["wait", 1.5],
         js("n.cfg.graf='alto';n.aplicarCfg&&n.aplicarCfg();document.getElementById('teclas')&&(document.getElementById('teclas').hidden=true);n.cfg.cam='3';G.hora=9;Z.length=0;P.vida=100;G.chuva=0;G.chuvaAlvo=0;"),
         ["gwait", 0.3]]
# 1) menu de construção: as 7 peças novas aparecem; gerador e poste pedem oficina
steps += [js("for(const[k,q]of[['tabuas',40],['sementes',6],['pregos',30],['sucata',30],['corda',4],['pano',6]])n.invAdd(k,q);vai(F[0]+9,F[2]+2);P.yaw=0;P.body=0;n.modoObra(true);"),
          ev("menu", "const b=[...document.querySelectorAll('#obras .obra')];return{botoes:b.length,tipos:n.obrasVisiveis().join(','),ger:n.obraLiberada('gerador'),gerTxt:(b.find(x=>x.dataset.o==='gerador')||{}).title,"
                     "semIcone:['horta','coletor','torreVigia','arame','latas','gerador','poste'].map(k=>n.OBRAS[k].icon).concat(['sementes','milho','batata','abobora','sopa'].map(k=>n.ITEMS[k].icon)).filter(i=>!document.getElementById(i)).join(',')};")]
steps += tela("270_menu_base.png")
steps += [js("G.fab.nv=2;n.modoObra(false);n.modoObra(true);"), ev("menu_oficina", "return{ger:n.obraLiberada('gerador'),poste:n.obraLiberada('poste')};")]
# 2) horta e torre pelo fluxo normal de construção (gasta material)
steps += [js("n.OBRA.tipo='horta';n.OBRA.rot=0;n.cam.fwd=[0,0,1];n.cam.right=[0,0,0];n.obraAlvo();window.__s0=n.invCount('sementes');window.__ok=[n.OBRA.ok,n.OBRA.motivo];n.colocarObra();"),
          ev("horta_posta", "const o=O('horta');return{tem:!!o,ok:window.__ok,gastouSementes:window.__s0-n.invCount('sementes'),cresce:o&&r2(o.ext.cresce),txt:o&&n.baseTexto(o).t};"),
          js("vai(F[0]+15,F[2]-7);P.yaw=0;P.body=0;n.OBRA.tipo='torreVigia';n.cam.fwd=[0,0,1];n.cam.right=[0,0,0];n.obraAlvo();window.__ok=[n.OBRA.ok,n.OBRA.motivo];window.__t0=n.invCount('tabuas');n.colocarObra();n.modoObra(false);"),
          ev("torre_posta", "const t=O('torreVigia');if(!t)return{tem:false,ok:window.__ok};const top=n.chaoEm(t.x,t.z,t.y+3.3);"
                            "return{tem:true,ok:window.__ok,tabuas:window.__t0-n.invCount('tabuas'),plat:r2(top-t.y),via:!!t.via&&n.VIAS.includes(t.via),cols:t.cols.length,sup:!!t.sup};")]
# 3) as outras peças (colocação direta, para as fotos)
steps += [js("const c=(t,dx,dz,y)=>n.criarObraT(t,F[0]+dx,F[2]+dz,y||0);c('coletor',-6,6.5);c('gerador',7.5,8.5,0.4);c('poste',4.5,9.5,Math.PI);c('poste',-5.5,-5.5,0.8);c('arame',0,15);c('latas',-9,-11);c('bau',3.2,-3.4);"),
          ev("pecas", "return n.OB.map(o=>o.tipo).join(',');")]
# 4) horta cresce e é colhida
steps += [js("O('horta').ext.cresce=0.995;"), ["gwait", 6.0],
          ev("horta_madura", "const o=O('horta');return{cresce:r2(o.ext.cresce),txt:n.baseTexto(o).t};"),
          js("const o=O('horta');vai(o.x,o.z-2.6);P.yaw=0;P.body=0;window.__alvo=n.interAtual();window.__m0=n.invCount('milho');window.__b0=n.invCount('batata');n.alvo={k:'baseObra',o};n.interagir(true);"),
          ev("colheu", "const o=O('horta');return{alvo:window.__alvo&&window.__alvo.k,milho:n.invCount('milho')-window.__m0,batata:n.invCount('batata')-window.__b0,cresce:r2(o.ext.cresce)};")]
steps += [js("n.invAdd('milho',1);n.invAdd('batata',1);"), ev("sopa", "const r=n.RECIPES.find(r=>r.faz==='sopa');return{receita:!!r,pode:n.podeFabricar?n.podeFabricar(r):null};")]
# 5) coletor enche na chuva e enche garrafas
steps += [js("G.chuva=1;G.chuvaAlvo=1;"), ["gwait", 45.0],
          ev("coletor_chuva", "const o=O('coletor');return{agua:r2(o.ext.agua),chuva:r2(G.chuva),txt:n.baseTexto(o).t};"),
          js("n.invAdd('garrafa',2);window.__a0=n.invCount('agua');n.alvo={k:'baseObra',o:O('coletor')};n.interagir(true);"),
          ev("coletor_garrafas", "const o=O('coletor');return{agua:r2(o.ext.agua),encheu:n.invCount('agua')-window.__a0,garrafas:n.invCount('garrafa')};"),
          js("G.chuva=0;G.chuvaAlvo=0;")]
# 6) gerador: abastece (toque curto no E; desde a Etapa 17, segurar abre o painel de energia e fios); à noite acende postes e eletrifica o arame
steps += [js("n.invAdd('gasolina',1);const o=O('gerador');window.__gtxt=n.baseTexto(o).t;n.ev('INTER_K.baseObra.curto')(o);"),
          ev("gerador_abastecido", "const o=O('gerador');return{txt:window.__gtxt,comb:r2(o.ext.comb),ligado:o.ext.ligado,gasolina:n.invCount('gasolina')};"),
          js("G.hora=21.8;G.ondas=[];Z.length=0;"), ["gwait", 1.5],
          ev("noite_luz", "const g=O('gerador');return{ativo:g.ativo,postes:n.OB.filter(o=>o.tipo==='poste').map(o=>!!o.aceso).join(','),luzes:n.FIRES.filter(f=>f.eletrica).length,arame:!!O('arame').eletrico,n:r2(n.E().n||0)};")]
# 7) arame eletrificado: zumbi que atravessa toma choque, cai e perde vida
steps += [js("Z.length=0;G.ondas=[];const a=O('arame');vai(a.x+0.4,a.z-6);P.vida=100;const z=n.criarZ('walker',a.x+0.3,a.z+4.5,{st:'caca'});z.viu=0;z.lx=P.x;z.lz=P.z;z.ly=P.y;z.hp=100;window.__za=z;window.__zst={};"
             "window.__cadaPasso=dt=>{const z=window.__za;if(!z)return;window.__zst[z.st]=(window.__zst[z.st]||0)+dt;const a=n.OB.find(o=>o.tipo==='arame');if(a&&Math.abs(z.z-a.z)<0.65)window.__noArame=(window.__noArame||0)+dt;};"),
          ["gwait", 5.0],
          ev("arame_choque", "const z=window.__za;return{hp:Math.round(z.hp),vivo:z.vivo,st:z.st,estados:Object.fromEntries(Object.entries(window.__zst).map(([k,v])=>[k,r2(v)])),noArame:r2(window.__noArame||0),arameHp:Math.round(O('arame').hp)};"),
          js("window.__cadaPasso=null;Z.length=0;P.vida=100;")]
# 8) latas: zumbi passa e o alarme toca
steps += [js("Z.length=0;const l=O('latas');vai(l.x+0.3,l.z-7);const z=n.criarZ('walker',l.x+0.2,l.z+3.5,{st:'caca'});z.viu=0;z.lx=P.x;z.lz=P.z;z.ly=P.y;window.__zl=z;"),
          ["gwait", 4.0],
          ev("latas", "const l=O('latas'),z=window.__zl;return{tocou:(l.cd||0)>0,z:r2(Math.abs(z.z-l.z)),toast:[...document.querySelectorAll('.toast p')].map(p=>p.textContent).filter(t=>/Latas/.test(t)).length};"),
          js("Z.length=0;P.vida=100;")]
# fotos de noite: postes acesos, gerador, arame, torre
steps += foto("271_base_noite.png", "G.hora=22.2;G.ondas=[];Z.length=0;const g=O('gerador');vai(F[0]+2,F[2]-2);G.camFix={pos:[F[0]+13,F[1]+4.2,F[2]+16],tgt:[F[0]+2,F[1]+1.2,F[2]+5]};", 1.0)
steps += foto("272_poste_arame.png", "const a=O('arame');G.camFix={pos:[a.x+3.5,a.y+1.6,a.z-3.2],tgt:[a.x,a.y+0.7,a.z]};", 0.1)
# 9) torre: sobe pela escada e fica lá em cima
steps += [js("G.camFix=null;G.hora=10;Z.length=0;const t=O('torreVigia'),v=t.via;window.__via=v;vai(v.base.x,v.base.z);n.comecarEscalada({v,u:0});P.escala.u=0.9;"),
          ["down", "w"], ["gwait", 0.8], ["up", "w"], ["gwait", 2.5],
          ev("torre_subiu", "const t=O('torreVigia');return{y:r2(P.y-t.y),esc:!!P.escala,dentro:Math.hypot(P.x-t.x,P.z-t.z)<1.6,txtVia:(n.textoInter({k:'via',o:{u:0,v:t.via}})||{}).s};"),
          ["gwait", 1.0], ev("torre_firme", "const t=O('torreVigia');return{y:r2(P.y-t.y)};")]
steps += foto("273_torre_dia.png", "const t=O('torreVigia');G.camFix={pos:[t.x+8,t.y+5.5,t.z-8],tgt:[t.x,t.y+2.6,t.z]};", 0.1)
# 10) sobreviventes: vigia sobe na torre; cozinheira colhe a horta madura
steps += [js("G.camFix=null;vai(F[0]+3,F[2]+8);const b=S('bia');b.st='base';b.tarefa='vigiar';b.x=F[0]+4;b.z=F[2]+2;b.y=n.chaoEm(b.x,b.z,5);const c=S('cida');c.st='base';c.tarefa='cozinhar';c.x=F[0]-2;c.z=F[2]+2;c.y=n.chaoEm(c.x,c.z,5);O('horta').ext.cresce=1;"),
          js("const j=S('jorge');j.st='base';j.tarefa='consertar';j.x=F[0]+1;j.z=F[2]+3;j.y=n.chaoEm(j.x,j.z,5);const o=n.criarObraT('barricada',F[0]+7,F[2]-2,0.3);o.hp=50;window.__bar=o;"),
          ["gwait", 12.0],
          ev("conserto", "const o=window.__bar,j=S('jorge');return{hp:Math.round(o.hp),max:o.hpMax,jorge:j.st,d:r2(Math.hypot(j.x-o.x,j.z-o.z))};"),
          ev("grupo_base", "const b=S('bia'),c=S('cida'),t=O('torreVigia'),bau=n.bausBase();return{biaTorre:!!b.naTorre,biaY:r2(b.y-t.y),horta:r2(O('horta').ext.cresce),bau:bau.map(q=>q.itens.filter(Boolean).map(i=>i.id+'x'+i.n).join(',')).join(' | ')};")]
steps += foto("274_vigia_torre.png", "const t=O('torreVigia');G.camFix={pos:[t.x-6,t.y+4.6,t.z+6.5],tgt:[t.x,t.y+3.8,t.z]};", 0.1)
steps += foto("275_base_dia.png", "G.hora=15;G.camFix={pos:[F[0]-12,F[1]+7,F[2]-12],tgt:[F[0]+2,F[1],F[2]+4]};", 0.3)
# 11) salvar e carregar: o estado das peças volta igual
steps += [js("G.camFix=null;O('horta').ext.cresce=0.42;O('coletor').ext.agua=3.5;n.salvarJogo();"),
          js("n.carregarJogo();"), ["gwait", 0.5],
          ev("carregou", "const t=O('torreVigia');return{tipos:n.OB.map(o=>o.tipo).join(','),horta:r2(O('horta').ext.cresce),agua:r2(O('coletor').ext.agua),comb:r2(O('gerador').ext.comb),via:!!(t&&t.via&&n.VIAS.includes(t.via)),plat:t?r2(n.chaoEm(t.x,t.z,t.y+3.3)-t.y):null,cols:t&&t.cols.length};"),
          ev("destruir", "const t=O('torreVigia'),v=t.via;n.destruirObra(t);return{via:n.VIAS.includes(v),plat:r2(n.chaoEm(t.x,t.z,t.y+3.3)-t.y),colsSobrando:n.COLL.filter(c=>c.obra===t).length};")]
plan = [["desk", {"viewport": {"width": 1280, "height": 720}}, steps],
        ["cel", {"viewport": {"width": 844, "height": 390}, "is_mobile": True, "has_touch": True, "device_scale_factor": 2},
         [["wait", 2], ["click", "#m-novo"], ["wait", 1.5],
          js("G.hora=9;Z.length=0;G.fab.nv=2;vai(F[0]+9,F[2]+2);n.modoObra(true);"),
          ev("menu_cel", "const e=document.getElementById('obras'),r=e.getBoundingClientRect();return{w:Math.round(r.width),h:Math.round(r.height),rola:e.scrollWidth>e.clientWidth,botoes:e.children.length,top:Math.round(r.top)};")] + tela("276_menu_cel.png")]]
json.dump(plan, open(os.path.join(os.path.dirname(__file__), '..', 'p88.json'), 'w'), ensure_ascii=False)
print('ok', len(steps))
