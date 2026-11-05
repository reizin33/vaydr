"""p186: Etapa 17 com a Etapa 16: mover uma peça elétrica (os fios continuam enquanto ela está na mão; devolver mantém; posta a mais de
30 m o fio é cortado e volta) e desmontar uma peça elétrica (corta os fios dela e devolve o fio)."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const g=(x,z)=>X('ground')(x,z),E=()=>X('ENER'),O=()=>X('OBRA'),cam=X('cam'),pe=window.__pe||{},"
     "W=()=>{X('energiaResolver')(0);X('energiaEfeitos')(0);},dar=o=>{for(const k in o)n.invAdd(k,o[k]);},"
     "ult=()=>{const f=document.getElementById('feed');return f&&f.lastElementChild?f.lastElementChild.textContent:'';},"
     "olhaChao=(yaw)=>{n.cfg.cam='1';P.yaw=yaw;P.body=yaw;P.pitch=-0.35;cam.pos=[P.x,P.y+1.62,P.z];cam.fwd=[Math.sin(yaw)*0.9,-0.42,Math.cos(yaw)*0.9];};")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;window.__cadaPasso=()=>{for(const z of __nnc.Z)z.vivo=false;P.vida=100;P.fome=100;P.sede=100;};"),
      j("dar({fio:20,alicate:1,sucata:10});let C=null;for(let r=14;r<60&&!C;r+=3)for(let a=0;a<6.28&&!C;a+=0.4){const x=F[0]+Math.cos(a)*r,z=F[2]+Math.sin(a)*r;if(X('dentroMapa')(x,z,50)&&!(X('RIO').ok&&X('aguaPerto')(x,z,3))&&Math.abs(g(x,z)-g(x+6,z))<1)C=[x,z];}"
        "window.__C=C;pe.ger=X('criarObra')('gerador',C[0],C[1],0);pe.ger.ext.comb=1;pe.ger.ext.ligado=true;pe.lum=X('criarObra')('luminaria',C[0]+4,C[1],0);pe.itr=X('criarObra')('interruptor',C[0]+2,C[1]+2,0);"
        "X('ligarFio')(pe.ger,pe.lum);X('ligarFio')(pe.ger,pe.itr);window.__pe=pe;W();"),
      e("antes", "return{fios:E().fios.length,lum:!!pe.lum.energ};"),
      # mover: pega a lâmpada; o fio continua enquanto ela está na mão; devolver mantém
      e("pegou", "X('modoObra')(true);const ok=X('pegarPeca')(pe.lum);return{ok,naMao:!!O().mov,noMundo:X('OB').includes(pe.lum)};"), ["gwait", 1.5],
      e("naMao", "return{fios:E().fios.length,mov:!!O().mov};"),
      e("devolveu", "X('devolverPeca')();W();return{fios:E().fios.length,lum:!!pe.lum.energ,luz:X('FIRES').some(f=>f.obra===pe.lum)};"),
      # posta perto: o fio continua e a luz vai junto
      e("pertoPegou", "const ok=X('pegarPeca')(pe.lum);vai(window.__C[0]+6,window.__C[1]+4);olhaChao(Math.PI/2);return{ok};"),
      e("pertoPos", "X('porPecaMovida')();W();const f=E().fios.find(f=>f.b===pe.lum.ext.eid);const lz=X('FIRES').find(f=>f.obra===pe.lum);return{fio:!!f,lum:!!pe.lum.energ,dist:Math.round(Math.hypot(pe.lum.x-pe.ger.x,pe.lum.z-pe.ger.z)),luzNoLugar:lz?r2(Math.hypot(lz.x-pe.lum.x,lz.z-pe.lum.z)):null};"),
      # posta longe (mais de 30 m): o fio é cortado e volta para a mochila
      e("longePegou", "const f0=conta('fio');window.__f0=f0;const ok=X('pegarPeca')(pe.lum);let x=window.__C[0]+36,z=window.__C[1];if(!X('dentroMapa')(x,z,5)){x=window.__C[0]-36;}vai(x,z);olhaChao(Math.PI/2);return{ok,longe:Math.round(Math.hypot(x-pe.ger.x,z-pe.ger.z))};"),
      e("longePos", "X('porPecaMovida')();W();return{noMundo:X('OB').includes(pe.lum),dist:Math.round(Math.hypot(pe.lum.x-pe.ger.x,pe.lum.z-pe.ger.z)),fio:!!E().fios.find(f=>f.b===pe.lum.ext.eid),devolveu:conta('fio')-window.__f0,aviso:ult(),lum:!!pe.lum.energ};"),
      # desmontar o interruptor ligado: corta o fio dele e devolve
      e("desmontar", "const f0=conta('fio'),n0=E().fios.length;const ok=X('desmontarPeca')(pe.itr);W();return{ok:ok!==false,saiu:!X('OB').includes(pe.itr),fios:[n0,E().fios.length],fioVoltou:conta('fio')-f0};"),
      j("X('modoObra')(false);n.cfg.cam='3';")]
salvar('p186.json', s)
