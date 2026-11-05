"""p232c (Parte 1, teste geral): sessão longa passando por todas as regiões, de dia e de noite, com zumbis e bichos, salvando e
carregando no fim. Em cada parada confere se nada ficou com número inválido (NaN), se ninguém ficou enterrado e quanto o jogo
pesa (zumbis, bichos, obras, partículas). Erros do console ficam no registro do teste."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
INV = ("const fin=v=>Number.isFinite(v),bad=[];"
       "if(![P.x,P.y,P.z,P.vida,P.fome,P.sede,P.yaw].every(fin))bad.push('P:'+[P.x,P.y,P.z,P.vida].map(v=>String(v).slice(0,6)).join(','));"
       "{const g=n.chaoEm(P.x,P.z,P.y+0.5);if(fin(g)&&P.y<g-1.5&&!P.nada&&!X('CARRO').ativo)bad.push('P_abaixo:'+(P.y-g).toFixed(2));}"
       "for(const z of Z){if(!fin(z.x)||!fin(z.y)||!fin(z.z)||!fin(z.hp))bad.push('Znan:'+z.tipo);else if(z.vivo&&z.y>-19){const gz=n.chaoEm(z.x,z.z,z.y+1);if(fin(gz)&&z.y<gz-1.2)bad.push('Zabaixo:'+z.tipo+':'+(z.y-gz).toFixed(1));}}"
       "for(const b of X('BICHOS'))if(b.vivo&&(!fin(b.x)||!fin(b.y)||!fin(b.z)||!fin(b.hp)))bad.push('Bnan:'+b.tipo);"
       "for(const o of X('OB'))if(!fin(o.x)||!fin(o.y)||!fin(o.z)||!fin(o.hp))bad.push('Onan:'+o.tipo);"
       "const reg=(()=>{try{const r=X('regiaoEm')(P.x,P.z);return r&&r.id||r||'-';}catch(e){return'?';}})();")
RES = ("return{bad:bad.slice(0,10),reg,x:Math.round(P.x),z:Math.round(P.z),zumbis:Z.filter(z=>z.vivo).length,bichos:X('BICHOS').filter(b=>b.vivo).length,"
       "obras:X('OB').length,part:(X('PARTS')||[]).length,hora:+G.hora.toFixed(1),dia:G.dia,vida:Math.round(P.vida)};")
s = inicio("X('FAUNA_POP').ativosMax=34;")
s += [js("vivo();window.__cadaPasso=()=>{const P=__nnc.P;if(P.vida<60)P.vida=60;P.fome=100;P.sede=100;};"
         "for(const[k,q]of[['pistola',1],['municao',60],['molotov',4],['bandagem',10],['tabuas',30],['pregos',20]])X('invAdd')(k,q);")]
s += [ev("regioes", "return X('REGIOES').map(r=>({id:r.id,x:Math.round(r.x),z:Math.round(r.z)}));")]
for k in range(14):
    noite = k % 3 == 2
    s += [js("const R=X('REGIOES'),r=R[" + str(k) + "%R.length];vai(r.x+6,r.z+6);P.yaw=" + str(0.7 * k) + ";G.hora=" + ("22.5" if noite else "10") + ";"
             + ("for(let i=0;i<4;i++){const a=i*1.6;ZZ(i%2?'runner':'walker',P.x+Math.cos(a)*14,P.z+Math.sin(a)*14);}" if noite else "")),
          ["gwait", 40]]
    s += [ev("parada" + str(k), INV + RES)]
    if k == 5:
        s += [js("sel('pistola');const z=Z.find(z=>z.vivo);if(z){mira(z.x,z.y+1.5,z.z);}"), ["down", "Mouse"] if False else ["gwait", 0.1]]
s += [js("G.hora=10;vai(F[0]+5,F[2]+5);"), ["gwait", 2]]
s += [ev("antesSalvar", INV + "window.__k=X('serializar')();" + RES)]
s += [ev("salvou", "return{ok:X('salvarJogo')()!==false};")]
s += [js("X('novoJogo')();"), ["gwait", 0.5], js("X('carregarJogo')();"), ["gwait", 2]]
s += [ev("depoisCarregar", INV + "const a=window.__k,b=X('serializar')(),dif=[];for(const q in a){if(['tm','salvoEm','sv','x8'].includes(q))continue;if(JSON.stringify(a[q])!==JSON.stringify(b[q]))dif.push(q);}"
       "const r=(()=>{" + RES.replace("return", "return ") + "})();r.diferencas=dif.slice(0,12);return r;")]
s += [["gwait", 30], ev("final", INV + RES)]
salvar('tools/p232c_soak.json', s, vp=(800, 450))
