"""p218c: zumbis não atravessam porta fechada. Porta da frente de um prédio fechada (e reforçada para não quebrar no teste),
o jogador de um lado e um bando de zumbis do outro, caçando. Conta quantos aparecem do lado do jogador com a porta inteira,
em 3 rodadas (andando, correndo e multidão apertada). Rodar na versão antiga e na nova para comparar."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();Z.length=0;G.hora=11;"
         "window.__cadaPasso=()=>{const n=__nnc;for(let i=n.Z.length-1;i>=0;i--)if(!n.Z[i].__nosso)n.Z.splice(i,1);n.P.vida=100;for(const z of n.Z){if(!z.vivo)continue;if(z.st!=='quebra'&&z.st!=='golpe')z.st='caca';z.viu=0.2;z.lx=n.P.x;z.lz=n.P.z;z.ly=n.P.y;}const d=window.__d;if(d){const nx=Math.sin(d.yaw),nz=Math.cos(d.yaw),tx=Math.cos(d.yaw),tz=-Math.sin(d.yaw);for(const z of n.Z){if(!z.vivo)continue;const sd=(z.x-d.x)*nx+(z.z-d.z)*nz,lt=(z.x-d.x)*tx+(z.z-d.z)*tz;if(z.__sd!==undefined&&Math.sign(sd)!==Math.sign(z.__sd)&&Math.abs(lt)<d.larg/2+0.4&&Math.abs(sd)<1.2&&Math.abs(z.__sd)<1.2&&(d.estado!=='aberta'&&d.estado!=='quebrada'))window.__atravessou=(window.__atravessou||0)+1;z.__sd=sd;}}};"
         "const D=X('CID').portas.filter(d=>d.estado!=='quebrada'&&d.tipo!=='elevador'&&d.f===0&&d.larg<1.4);const pb=X('pointBlocked');"
         "let esc=null;for(const d of D){const nx=Math.sin(d.yaw),nz=Math.cos(d.yaw);const a=[d.x+nx*2.2,d.z+nz*2.2],b=[d.x-nx*2.2,d.z-nz*2.2];"
         "if(!pb(a[0],a[1],0.35)&&!pb(b[0],b[1],0.35)&&!pb(d.x-nx*1.4,d.z-nz*1.4,0.35)){esc=d;break;}}window.__d=esc;"
         "X('portaEstado')(esc,'fechada');esc.hp=esc.hpMax=1e9;")]
def rodada(nome, tipo, n, espaco):
    return [js("const d=window.__d,nx=Math.sin(d.yaw),nz=Math.cos(d.yaw),tx=Math.cos(d.yaw),tz=-Math.sin(d.yaw);for(const z of Z)z.vivo=false;Z.length=0;"
               "vai(d.x+nx*2.2,d.z+nz*2.2,d.y);P.yaw=Math.atan2(-nx,-nz);P.body=P.yaw;window.__lado=1;window.__atravessou=0;"
               "for(let i=0;i<" + str(n) + ";i++){const l=(i%4-1.5)*" + str(espaco) + ",f=1.2+Math.floor(i/4)*" + str(espaco) + ";"
               "const z=ZZ('" + tipo + "',d.x-nx*f+tx*l,d.z-nz*f+tz*l);if(z){z.__nosso=true;z.st='caca';z.viu=1;z.t=0;}}"),
            ["gwait", 14.0],
            ev(nome, "const d=window.__d,nx=Math.sin(d.yaw),nz=Math.cos(d.yaw);let lado=0,perto=0;"
                     "for(const z of Z){if(!z.vivo)continue;const sd=(z.x-d.x)*nx+(z.z-d.z)*nz;if(sd>0.05)lado++;if(Math.abs(sd)<0.6)perto++;}"
                     "return{zumbis:Z.filter(z=>z.vivo).length,passaramPelaPorta:window.__atravessou,doLadoDoJogador:lado,colados:perto,porta:d.estado,quebrando:Z.filter(z=>z.st==='quebra').length};")]
s += rodada("andando", "walker", 8, 0.55)
s += rodada("correndo", "runner", 8, 0.55)
s += rodada("apertados", "walker", 12, 0.3)
s += rodada("rastejantes", "rastejante", 8, 0.45)
# o mecanismo, direto na colisão: alguém andando contra a porta fechada em passos de 0,3 / 0,5 / 0,7 m (jogo lento ou empurrão da multidão)
s += [ev("colisao", "const d=window.__d,nx=Math.sin(d.yaw),nz=Math.cos(d.yaw),col=X('collide'),o={};"
         "for(const passo of [0.3,0.5,0.7]){const e={x:d.x-nx*0.9,z:d.z-nz*0.9,y:d.y};for(let i=0;i<14;i++){e.x+=nx*passo;e.z+=nz*passo;col(e,0.34,c=>c.solid);}"
         "o['passo'+passo]=Math.round(((e.x-d.x)*nx+(e.z-d.z)*nz)*100)/100;}return{ladoFinal:o,porta:d.estado};")]
salvar('p218c_portas.json', s, vp=(640, 360))
