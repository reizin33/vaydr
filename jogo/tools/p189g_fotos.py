"""p189f: fotos da Etapa 19 em terceira pessoa (de lado): pegando do chão, abrindo o baú, empurrando a porta, trabalhando na bancada,
montando no cavalo (perna por cima), na moto, na jangada remando e pescando."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const V=id=>X('VEICS').find(v=>v.id===id),ch=P.ch,frente=d=>[P.x+Math.sin(P.body)*(d||1),P.z+Math.cos(P.body)*(d||1)],"
     "lado=()=>{n.cfg.cam='3';P.yaw=P.body+Math.PI/2.2;P.pitch=-0.12;},fixa=(tipo,t,dur)=>{window.__fixa={tipo,t,dur:dur||1,alvo:null};P.anim={tipo,t,dur:dur||1,alvo:null};X('animarJogador')(0.001);};")
def j(c): return js(H + c)
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=11;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;P.fome=100;P.sede=100;P.energia=100;"
         "const f=window.__fixa;if(f){P.anim=Object.assign({},f);}if(window.__mtFixa!==undefined)P.mtT=window.__mtFixa;};"),
      ev("lugar", "let C=null;for(let r=10;r<70&&!C;r+=4)for(let a=0;a<6.28&&!C;a+=0.4){const x=F[0]+Math.cos(a)*r,z=F[2]+Math.sin(a)*r;let ok=X('dentroMapa')(x,z,20)&&!X('aguaPerto')(x,z,4);"
         "for(let dx=-4;dx<=4&&ok;dx+=2)for(let dz=-4;dz<=4&&ok;dz+=2)if(X('pointBlocked')(x+dx,z+dz,0.8))ok=false;if(ok)C=[x,z];}window.__C=C;vai(C[0],C[1]);P.body=0;P.yaw=0;return{achou:!!C};")]
s += foto("e19_coletar.png", H + "window.__semRender=false;lado();const f=frente(0.9);X('PICKS').push({kind:'pedra',x:f[0],z:f[1],alive:true});fixa('coletar',0.34,0.7);", antes=0.2, esp=2.0)
s += [j("window.__fixa=null;P.anim=null;")]
s += foto("e19_cavalo.png", H + "window.__semRender=false;const f=frente(2.2);const h=X('criarBicho')('cavalo',f[0]+6,f[1],{zona:'leste'});X('domarCavalo')(h);h.sela=true;h.congelado=true;h.yaw=0;X('montar')(h);window.__h=h;window.__mtFixa=0.3;lado();", antes=0.3, esp=2.0)
s += [j("window.__mtFixa=undefined;X('descerDoCavalo')(false);if(P.montado){P.montado=null;}P.anim=null;const h=window.__h;if(h){h.x+=8;}"), ["gwait", 0.6]]
s += foto("e19_pesca.png", H + "window.__semRender=false;n.invAdd('vara',1);sel('vara');P.pesca={x:P.x+Math.sin(P.body)*7,y:P.y,z:P.z+Math.cos(P.body)*7,t:3,morde:99,mordeu:false,janela:0,px:P.x,pz:P.z};lado();X('animarJogador')(0.001);", antes=0.0, esp=2.0)
salvar('p189g.json', s, vp=(960, 540))
