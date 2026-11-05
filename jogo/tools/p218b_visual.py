"""p218b: conferências com foto das correções: lanterna de mão na mão à noite (3ª pessoa de perto e 1ª pessoa, a luz saindo
da ponta dela), barra de progresso do kit médico na tela, e a janela quebrada que agora se pula com Espaço (o aviso mostra Espaço e
segurar E não pula mais)."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
from p217b_fotos3p import CAM
def foto_mao(nome, dx, fr, alt=0.25):
    # desenha alguns quadros antes (o esqueleto do personagem só é atualizado desenhando), depois para e põe a câmera
    return [js("n.cfg.cam='3';window.__turbo=1;window.__semRender=false;"), ["wait", 4.0],
            js("G.modo='pausa';" + CAM.replace("const mao=X('xf')(P.ch.m.subarray(11*16,12*16),0,0,0.2)","const mao0=X('xf')(P.ch.m.subarray(11*16,12*16),0,0,0.2),mao=Math.hypot(mao0[0]-P.x,mao0[2]-P.z)<1.5?mao0:[P.x,P.y+1.0,P.z]") +
               "cf([mao[0]+fw[0]*" + str(fr) + "+rt[0]*" + str(dx) + ",mao[1]+" + str(alt) + ",mao[2]+fw[2]*" + str(fr) + "+rt[2]*" + str(dx) + "],[mao[0]+fw[0]*0.6,mao[1],mao[2]+fw[2]*0.6]);"),
            ["wait", 3.0], ["shot", nome], js("window.__semRender=true;window.__turbo=6;G.modo='jogo';")]
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();Z.length=0;window.__cadaPasso=()=>{__nnc.Z.length=0;P.vida=Math.max(P.vida,1);};G.hora=22;X('invAdd')('lanterna',1);P.bat=100;sel('lanterna');P.lanterna=true;P.yaw=0.6;P.body=0.6;"),
      ["gwait", 1.0],
      ev("lanterna", "const h=P.ch.m.subarray(11*16,12*16),T=X('LANT_PONTA'),p=X('xf')(h,T[0],T[1],T[2]),sp=X('spotP');"
         "return{naMao:X('lanternaNaMao')(),bracoFrente:r2(P.lantK||0),malha:!!X('MESH').arma.lanterna,luzNaPonta:r2(Math.hypot(sp[0]-p[0],sp[1]-p[1],sp[2]-p[2])),hora:Math.round(G.hora)};")]
s += foto_mao("e26_lanterna_3p.png", 0.9, 1.4, 0.3)
s += foto("e26_lanterna_1p.png", "n.cfg.cam='1';P.pitch=-0.05;")
s += [js("n.cfg.cam='3';G.hora=11;")]
# barra do kit médico (foto com o jogo parado no meio da ação)
s += [js("X('invAdd')('kit',1);P.vida=40;sel('kit');P.acao=null;P.cd=0;X('atacar')();P.acao.t=0.35;X('updateHUD')(0.016,0);G.modo='pausa';window.__turbo=1;window.__semRender=false;"),
      ["wait", 2.5], ["shot", "e26_kit_barra.png"],
      ev("kit", "const b=document.querySelector('.uso-barra');return{barra:!b.hidden,texto:b.firstChild.textContent,p:+getComputedStyle(b).getPropertyValue('--p')};"),
      js("window.__semRender=true;window.__turbo=6;G.modo='jogo';"), ["gwait", 1.0]]
# janela quebrada do térreo: Espaço pula, E não
s += [js("const J=X('CID').janelas.filter(j=>j.quebrada&&j.f===0&&!X('janelaTapada')(j));const pb=X('pointBlocked');let jj=null;"
         "for(const j of J){const nx=Math.sin(j.yaw),nz=Math.cos(j.yaw);if(!pb(j.x+nx*1.0,j.z+nz*1.0,0.3)&&X('janelaPouso')(j,true)){jj=j;break;}}window.__j=jj;"
         "if(jj){const nx=Math.sin(jj.yaw),nz=Math.cos(jj.yaw);vai(jj.x+nx*1.0,jj.z+nz*1.0);P.yaw=Math.atan2(-nx,-nz);P.body=P.yaw;}"), ["gwait", 0.4],
      ev("janela_antes", "const j=window.__j;if(!j)return{semJanela:true};const a=X('interAtual')(),t=a&&X('textoInter')(a);const nx=Math.sin(j.yaw),nz=Math.cos(j.yaw);"
         "return{alvo:a&&a.k,texto:t&&t.t,tecla:t&&t.tecla,segura:!!(t&&t.hold),lado:Math.sign((P.x-j.x)*nx+(P.z-j.z)*nz),kbd:document.querySelector('#prompt kbd').textContent};"),
      js("const a=X('interAtual')();window.__a=a;n.ev('alvoInter=window.__a');X('usarPress')();"), ["gwait", 0.8], js("X('usarSolta')();"),
      ev("janela_E", "const j=window.__j;if(!j)return null;const nx=Math.sin(j.yaw),nz=Math.cos(j.yaw);return{lado:Math.sign((P.x-j.x)*nx+(P.z-j.z)*nz)};"),
      js("X('pular')();"), ["gwait", 0.5],
      ev("janela_espaco", "const j=window.__j;if(!j)return null;const nx=Math.sin(j.yaw),nz=Math.cos(j.yaw);return{lado:Math.sign((P.x-j.x)*nx+(P.z-j.z)*nz)};")]
salvar('p218b_visual.json', s, vp=(960, 540))
