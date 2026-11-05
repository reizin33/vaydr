"""p210: Etapa 25, pedras da cachoeira na encosta: monta a peça da cachoeira como o jogo monta e, para cada pedra (cada uma é
um bloco de triângulos seguido), mede quanto o ponto mais baixo dela fica acima ou abaixo do chão (negativo: enterrada, encostada
no chão; positivo: no ar) e quanto da pedra fica abaixo do chão. Mede também a encosta (desnível do chão em volta da pedra)."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;"),
      ev("pedras", "const q=X('ARC_PECAS').find(p=>p.id==='cachoeira'),d=q.f(),gr=X('ground'),st=11,nv=d.length/st,out=[];"
         "const L=X('ARC_LAY').cachoeira.pedras;let ini=0;"
         "const bloco=(n0,n1)=>{let mnh=1e9,mxh=-1e9,abaixo=0,cx=0,cz=0,ymin=1e9,ymax=-1e9;for(let v=n0;v<n1;v++){const x=d[v*st],y=d[v*st+1],z=d[v*st+2],h=y-gr(x,z);if(h<mnh)mnh=h;if(h>mxh)mxh=h;if(h<0)abaixo++;cx+=x;cz+=z;if(y<ymin)ymin=y;if(y>ymax)ymax=y;}"
         "cx/=(n1-n0);cz/=(n1-n0);let gmn=1e9,gmx=-1e9;for(let k=0;k<12;k++){const a=k/12*6.2832,g=gr(cx+Math.cos(a)*1.5,cz+Math.sin(a)*1.5);if(g<gmn)gmn=g;if(g>gmx)gmx=g;}"
         "return{x:Math.round(cx*10)/10,z:Math.round(cz*10)/10,baixoAcimaDoChao:Math.round(mnh*100)/100,altoAcimaDoChao:Math.round(mxh*100)/100,pctEnterrada:Math.round(abaixo/(n1-n0)*100),altura:Math.round((ymax-ymin)*100)/100,desnivel:Math.round((gmx-gmn)*100)/100};};"
         "const porPedra=Math.round(nv/16);for(let k=0;k<16;k++)out.push(bloco(k*porPedra,Math.min(nv,(k+1)*porPedra)));"
         "return{vertices:nv,porPedra,noAr:out.filter(p=>p.baixoAcimaDoChao>0.05).length,pedras:out};")]
salvar('p210.json', s, vp=(640, 360))
