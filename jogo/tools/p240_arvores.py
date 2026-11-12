"""p240 (12/11): árvores de longe com a cara das de perto (fotos das árvores em placas cruzadas).
Mede as árvores em volta, confere as fotos (impostor) e tira fotos de antes/depois em primeira e terceira pessoa.
Uso: python3 tools/p240_arvores.py NOME [graf] [desl]   (desl = desliga as placas para comparar na mesma versão)
Fotos: shots/NOME_clareira_1p.png, NOME_clareira_3p.png, NOME_mata_1p.png, NOME_carro_1p.png e NOME_atlas.png (se houver)"""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
q = sys.argv[1] if len(sys.argv) > 1 else 'x'
graf = sys.argv[2] if len(sys.argv) > 2 else 'alto'
desl = 'true' if (len(sys.argv) > 3 and sys.argv[3] == 'desl') else 'false'
s = inicio("X('FAUNA_POP').ativosMax=0;n.cfg.graf='" + graf + "';n.aplicarCfg&&n.aplicarCfg();try{X('ARVL').desl=" + desl + ";}catch(e){}")
s += [["gwait", 1.0]]
s += [ev("mata", "const T=X('TREES').filter(t=>!t.agua&&t.alive);let best=null;"
         "for(let x=-420;x<=420;x+=30)for(let z=-420;z<=420;z+=30){let c=0;for(const t of T){const d=(t.x-x)**2+(t.z-z)**2;if(d<3600)c++;}if(!best||c>best.c)best={x,z,c};}"
         "window.__MATA=best;let A=null;try{const a=X('ARVL');A={ok:a.ok,erro:a.erro,info:a.info,desl:a.desl,n:a.ok?Object.fromEntries(Object.entries(a.m).map(([k,m])=>[k,m.n])):null};}catch(e){A='sem';}"
         "return{best,graf:n.cfg.graf,arvl:A,perto:X('GF')().arvPerto,longe:X('GF')().arvLonge};")]
s += [ev("atlas", "try{return X('arvlAtlasPNG')();}catch(e){return null;}")]
# clareira: perto da fogueira, olhando para a mata mais fechada
s += [js("vivo();Z.length=0;X('BICHOS').length=0;G.hora=10;const b=window.__MATA;const x=F[0]+6,z=F[2]+6;vai(x,z,n.ground(x,z));n.cfg.cam='1';P.yaw=Math.atan2(b.x-x,b.z-z);P.body=P.yaw;P.pitch=0.03;window.__YAW=P.yaw;"), ["gwait", 1.2]]
s += foto(q + "_clareira_1p.png", "n.cfg.cam='1';P.yaw=window.__YAW;P.pitch=0.03;", 0.4, 3.5)
s += foto(q + "_clareira_1p_b.png", "n.cfg.cam='1';P.yaw=window.__YAW+1.3;P.pitch=0.03;", 0.4, 3.5)
s += foto(q + "_clareira_3p.png", "n.cfg.cam='3';P.yaw=window.__YAW;P.body=P.yaw;P.pitch=-0.12;", 0.4, 3.5)
# dentro da mata mais fechada, no chão de verdade
s += [js("const b=window.__MATA;vai(b.x,b.z,n.ground(b.x,b.z));n.cfg.cam='1';P.yaw=0.8;P.pitch=0.03;"), ["gwait", 1.2]]
s += foto(q + "_mata_1p.png", "n.cfg.cam='1';P.yaw=0.8;P.pitch=0.03;", 0.4, 3.5)
# no carro, como na foto do Himalaia
s += [js("const t=X('VEICS').find(v=>v.id==='caminhonete'||v.tipo==='caminhonete');const x=F[0]+8,z=F[2]-12;t.x=x;t.z=z;t.y=n.ground(x,z);t.yaw=0.6;t.v=0;t.comb=80;t.hp=90;X('veicColisor')(t);"
         "vai(x+2,z+2);X('entrarVeic')(t);n.cfg.cam='1';P.yaw=t.yaw;P.pitch=-0.05;"), ["gwait", 1.0]]
s += foto(q + "_carro_1p.png", "P.yaw=X('CARRO').yaw;P.pitch=-0.05;", 0.3, 3.5)
s += foto(q + "_carro_1p_b.png", "P.yaw=X('CARRO').yaw+2.4;P.pitch=-0.03;", 0.3, 3.5)
s += [ev("erros", "return{arvl:(()=>{try{const a=X('ARVL');return{ok:a.ok,erro:a.erro,n:a.ok?Object.fromEntries(Object.entries(a.m).map(([k,m])=>[k,m.n])):null,resto:X('PINHO').resto&&X('PINHO').resto.n};}catch(e){return 'sem';}})()};")]
salvar('tools/p240_' + q + '.json', s, vp=(1280, 720))
