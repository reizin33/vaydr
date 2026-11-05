"""p217: ferramentas com modelo de verdade (Poly Haven): pistola, machado de incêndio, picareta, pá e corta-cadeado entram
com textura no lugar das feitas de caixinha. Confere no jogo rodando: as malhas novas (triângulos, textura carregada), a pá que
passa a aparecer na mão, a ponta do cano da pistola (clarão do tiro sai dela), a peça largada no chão com o modelo novo e as
fotos de cada uma na mão em 3ª e em 1ª pessoa."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
IDS = ['pistola', 'machado', 'picareta', 'pa', 'cortaCadeado']
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();Z.length=0;window.__cadaPasso=()=>{__nnc.Z.length=0;P.vida=100;};G.hora=11;"
         "for(const id of ['pistola','machado','picareta','pa'])X('invAdd')(id,1);X('invAdd')('municao9',16);"), ["gwait", 0.5],
      ["until", "(()=>{const n=__nnc;const T=n.ev('MOD3D_TEX');return Object.keys(T).length>=5&&Object.values(T).every(t=>t.pronta);})()", 30],
      ev("malhas", "const M=X('MESH').arma,I=X('MOD3D_INFO');const o={};for(const id of " + str(IDS) + "){const m=M[id];"
         "o[id]={novo:!!(m&&m.mod3d),tri:m&&m.count/3,textura:!!(m&&m.tex&&m.tex.pronta),caixa:I[id]&&[I[id].min.map(r2),I[id].max.map(r2)]};}"
         "o.bocaPistola=X('WGRIP').pistola.map(v=>Math.round(v*1000)/1000);o.paNaMao=!!X('ITEMS').pa.mao;return o;")]
# na mão: 3ª pessoa de perto e 1ª pessoa
for id in ['pistola', 'machado', 'picareta', 'pa']:
    s += [js("sel('" + id + "');")]
    s += [ev("sel_" + id, "const it=X('selItem')();return{selecionado:it&&it.id,desenha:!!(X('MESH').arma[it.id]&&(X('ITEMS')[it.id].tipo==='arma'||X('ITEMS')[it.id].mao))};")]
    s += foto("e26_" + id + "_3p.png", "n.cfg.cam='3';n.cfg.camDist=0.42;P.yaw=0.6;P.body=0.6;P.pitch=-0.15;")
    s += foto("e26_" + id + "_1p.png", "n.cfg.cam='1';P.pitch=-0.1;")
# tiro: o clarão sai da ponta do cano do modelo novo (3ª pessoa)
s += [js("n.cfg.cam='3';n.cfg.camDist=1;sel('pistola');const it=X('selItem')();it.mun=8;P.cd=0;P.acao=null;X('atacar')();"), ["gwait", 0.05],
      ev("tiro", "const h=P.ch.m.subarray(11*16,12*16),W=X('WGRIP').pistola,e=X('xf')(h,W[0],W[1],W[2]),m=P.muzzle;"
          "return{temBoca:!!m,igual:!!m&&Math.hypot(m[0]-e[0],m[1]-e[1],m[2]-e[2])<0.25,mun:X('selItem')().mun};")]
# largada no chão: aparece com o modelo novo
s += [js("sel('pa');const ch=X('chaoVis')('pa');window.__cv=ch&&ch.m&&ch.m.mod3d;"),
      ev("chao", "return{pa:window.__cv||null,pistola:(X('chaoVis')('pistola')||{}).m?.mod3d||null};")]
salvar('p217_ferramentas.json', s, vp=(960, 540))
