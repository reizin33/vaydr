"""p182: Etapa 17, rede elétrica: peças novas (aba Energia, receitas de fio e alicate), fios (custo por distância, saídas e entrada
limitadas, alcance), gerador com fio (só gasta quando puxam energia, gasolina acaba), banco de baterias (carrega com a sobra, segura a
rede quando o gerador para), interruptor (toque E), temporizador (horário), sensor de movimento (zumbi chegando liga a lâmpada),
divisor (3 saídas), falta de energia (pede mais do que tem: todos ficam sem), geladeira e freezer (comida envelhece a 10% e não
envelhece; sem energia volta a 50%), ligação automática ao construir, cortar fio devolve, salvar e carregar mantém os fios."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const C=window.__C,g=(x,z)=>X('ground')(x,z),ob=t=>X('OB').filter(o=>o.tipo===t),E=()=>X('ENER'),"
     "cria=(t,dx,dz,yaw)=>X('criarObra')(t,C[0]+dx,C[1]+dz,yaw||0,undefined,undefined,g(C[0]+dx,C[1]+dz)),"
     "W=()=>{X('energiaResolver')(0);X('energiaEfeitos')(0);},st=o=>({energ:!!o.energ,rodando:!!o.rodando,aceso:!!o.aceso}),"
     "dar=o=>{for(const k in o)n.invAdd(k,o[k]);},ult=()=>{const f=document.getElementById('feed');return f&&f.lastElementChild?f.lastElementChild.textContent:'';},"
     "luz=o=>X('FIRES').some(f=>f.obra===o&&f.eletrica);")
def e(nome, c): return ev(nome, H + c)
def j(c): return js(H + c)
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__turbo=6;window.__semRender=true;vivo();Z.length=0;G.hora=10;window.__cadaPasso=()=>{if(!window.__zumbisOk)for(const z of __nnc.Z)z.vivo=false;P.vida=100;P.fome=100;P.sede=100;};"),
      # lugar plano e livre perto do acampamento
      ev("lugar", "const livre=(x,z,g0)=>Math.abs(X('ground')(x,z)-g0)<1.2&&!X('pointBlocked')(x,z,0.5)&&!(X('RIO').ok&&X('aguaPerto')(x,z,1.0));let C=null;"
         "for(let r=16;r<70&&!C;r+=4)for(let a=0;a<6.28&&!C;a+=0.35){const x=F[0]+Math.cos(a)*r,z=F[2]+Math.sin(a)*r;if(!X('dentroMapa')(x,z,22))continue;const g0=X('ground')(x,z);let ok=true;"
         "for(let i=-6;i<=6&&ok;i+=2)for(let k=-10;k<=8&&ok;k+=2)if(!livre(x+i,z+k,g0))ok=false;if(ok)C=[x,z];}window.__C=C;return{achou:!!C,longe:C?Math.round(Math.hypot(C[0]-F[0],C[1]-F[2])):null};"),
      # peças e receitas novas
      e("pecas", "const cat=X('OBRA_CATS').find(c=>c.id==='energia'),R=X('RECIPES'),base=X('OBRA_CATS').find(c=>c.id==='base');"
        "return{aba:cat?cat.t:null,baseSemGerador:!!base&&!base.t.includes('gerador'),fio:!!R.find(r=>r.faz==='fio'),alicate:!!R.find(r=>r.faz==='alicate'),"
        "itens:['fio','alicate'].every(k=>!!X('ITEMS')[k]),malhas:cat.t.filter(t=>!X('MESH').obra[t]),consumo:{geladeira:X('ELET').geladeira.w,freezer:X('ELET').freezer.w,luminaria:X('ELET').luminaria.w},prod:X('ELET').gerador.prod};"),
      j("dar({fio:60,alicate:1,gasolina:4,carneCrua:6});vai(C[0]+1,C[1]+6);"
        "const pe={};pe.ger=cria('gerador',0,0);pe.ger.ext.comb=1;pe.ger.ext.ligado=true;pe.bat=cria('bateriaBase',-3,0);pe.itr=cria('interruptor',2,-2);pe.lum1=cria('luminaria',4,-2);"
        "pe.tmp=cria('temporizador',2,2);pe.lum2=cria('luminaria',4,2);pe.sen=cria('sensor',-3,4);pe.lum3=cria('luminaria',-5,6);pe.div=cria('divisor',0,-4);"
        "pe.gel=cria('geladeira',2,-6);pe.fre=cria('freezer',-2,-6);pe.bau=cria('bau',0,-9);window.__pe=pe;"),
      # fios: custo por distância e as regras
      e("ligar", "const p=window.__pe,f0=conta('fio'),L=X('ligarFio'),r={};r.gerBat=L(p.ger,p.bat);r.custo=f0-conta('fio');r.esperado=X('fioCusto')(p.ger,p.bat);"
        "r.batItr=L(p.bat,p.itr);r.itrLum=L(p.itr,p.lum1);r.gerTmp=L(p.ger,p.tmp);r.tmpLum=L(p.tmp,p.lum2);r.gerDiv=L(p.ger,p.div);r.divGel=L(p.div,p.gel);r.divFre=L(p.div,p.fre);r.batSen=L(p.bat,p.sen);r.senLum=L(p.sen,p.lum3);"
        "r.repetido=L(p.ger,p.bat);r.contrario=L(p.bat,p.ger);r.semSaida=L(p.lum1,p.lum2);r.entradaOcupada=L(p.div,p.lum1);r.gerCheio=L(p.ger,p.lum1);"
        "const lx=X('criarObra')('luminaria',C[0]+40,C[1],0,undefined,undefined,g(C[0]+40,C[1]));r.longe=L(p.div,lx);X('OB').splice(X('OB').indexOf(lx),1);"
        "r.fios=E().fios.length;r.gastou=f0-conta('fio');return r;"),
      ["gwait", 3.0],
      e("rede", "const p=window.__pe,R=E().redes;return{redes:R.length,pecas:R[0]&&R[0].L.length,gerador:st(p.ger),bateria:Math.round(p.bat.ext.carga||0),lum1:st(p.lum1),luz1:luz(p.lum1),"
        "lum2DeDia:st(p.lum2),lum3SemMovimento:st(p.lum3),geladeira:st(p.gel),freezer:st(p.fre),pede:R[0]&&R[0].D,falta:R[0]&&R[0].falta,comb:r2(p.ger.ext.comb)};"),
      # interruptor: toque E (curto) liga e desliga a lâmpada depois dele
      e("interruptor", "const p=window.__pe,K=X('INTER_K').eletr,t=K.texto(p.itr);K.curto(p.itr);const off={on:p.itr.ext.on,lum:st(p.lum1),luz:luz(p.lum1)};K.curto(p.itr);"
        "return{texto:t.t,alt:!!t.alt,desligado:off,ligadoDeNovo:{on:p.itr.ext.on,lum:st(p.lum1),luz:luz(p.lum1)}};"),
      # temporizador: de dia fechado; às 20h deixa passar
      j("G.hora=20;"), ["gwait", 1.0],
      e("temporizador", "const p=window.__pe;const noite=st(p.lum2);G.hora=12;W();const dia=st(p.lum2);p.tmp.ext.h0=6;p.tmp.ext.h1=18;W();const diaOn=st(p.lum2);p.tmp.ext.h0=18;p.tmp.ext.h1=6;W();"
        "return{noite,dia,horarioDeDia:diaOn};"),
      # sensor: zumbi chegando a menos de 10 m liga a lâmpada; sem ninguém, desliga depois de uns segundos
      j("window.__zumbisOk=true;const p=window.__pe;const z=ZZ('walker',p.sen.x+7,p.sen.z+1);if(z){z.st='parado';z.alvo=null;z.vel=0;window.__zs=z;}"), ["gwait", 1.0],
      e("sensorViu", "const p=window.__pe,z=window.__zs;return{zumbi:!!z,dist:z?r2(Math.hypot(z.x-p.sen.x,z.z-p.sen.z)):null,sensor:X('logicaLigada')(p.sen),lum3:st(p.lum3),luz3:luz(p.lum3)};"),
      j("window.__zumbisOk=false;for(const z of Z)z.vivo=false;Z.length=0;"), ["gwait", 8.0],
      e("sensorApagou", "const p=window.__pe;return{sensor:X('logicaLigada')(p.sen),lum3:st(p.lum3)};"),
      e("sensorGente", "const p=window.__pe;p.sen.ext.modo='gente';const px=P.x,pz=P.z;vai(p.sen.x+3,p.sen.z);return{modo:p.sen.ext.modo};"), ["gwait", 1.0],
      e("sensorGenteViu", "const p=window.__pe;const r={sensor:X('logicaLigada')(p.sen),lum3:st(p.lum3)};p.sen.ext.modo='zumbi';vai(C[0]+1,C[1]+6);return r;"),
      # divisor: 3 saídas no máximo
      e("divisor", "const p=window.__pe,L=X('ligarFio'),a=cria('luminaria',-2,-3),b=cria('luminaria',3,-4);const r={terceira:L(p.div,a),quarta:L(p.div,b)};W();r.terceiraAcesa=st(a).energ;"
        "const f=E().fios.find(f=>f.b===a.ext.eid);X('cortarFio')(f);X('OB').splice(X('OB').indexOf(a),1);X('OB').splice(X('OB').indexOf(b),1);X('eletMapa')();W();return r;"),
      # bateria: gerador desligado, as baterias seguram a rede (e a carga desce)
      e("bateria", "const p=window.__pe;p.bat.ext.carga=3000;p.ger.ext.ligado=false;W();return{gerador:st(p.ger),lum1:st(p.lum1),geladeira:st(p.gel),carga0:Math.round(p.bat.ext.carga)};"), ["gwait", 4.0],
      e("bateriaGasta", "const p=window.__pe,R=E().redes[0];return{lum1:st(p.lum1),geladeira:st(p.gel),carga:Math.round(p.bat.ext.carga),gerador:st(p.ger),pedeW:R&&R.D};"),
      e("bateriaAcabou", "const p=window.__pe;p.bat.ext.carga=0;W();const r={lum1:st(p.lum1),geladeira:st(p.gel)};p.ger.ext.ligado=true;W();r.voltou={lum1:st(p.lum1),geladeira:st(p.gel),gerador:st(p.ger)};return r;"),
      # falta de energia: pede mais do que produz (gerador fraco só neste teste) e todos ficam sem
      e("falta", "const p=window.__pe,El=X('ELET'),p0=El.gerador.prod;p.bat.ext.carga=0;El.gerador.prod=100;W();const R=E().redes[0];const r={falta:R.falta,pede:R.D,tem:R.Pg,geladeira:st(p.gel),freezer:st(p.fre)};"
        "El.gerador.prod=p0;W();r.depois={falta:E().redes[0].falta,geladeira:st(p.gel)};return r;"),
      # gasolina: gasta conforme a carga; acabando, o gerador para
      e("gasolina", "const p=window.__pe;p.ger.ext.comb=0.004;return{comb:p.ger.ext.comb};"), ["gwait", 3.0],
      e("semGasolina", "const p=window.__pe;const r={comb:r2(p.ger.ext.comb),gerador:st(p.ger),freezer:st(p.fre),aviso:ult()};p.ger.ext.comb=1;W();r.abasteceu=st(p.ger);return r;"),
      # geladeira e freezer: comida envelhece a 10% e não envelhece; o baú comum envelhece a 50%
      e("comida", "const p=window.__pe;for(const o of[p.gel,p.fre,p.bau]){o.itens[0]={id:'carneCrua',n:2,v:Math.round(G.tm+1440)};}W();const ant=[p.gel,p.fre,p.bau].map(o=>o.itens[0].v-G.tm);"
        "X('validadePasso')();G.tm+=600;X('validadePasso')();const dep=[p.gel,p.fre,p.bau].map(o=>o.itens[0]?o.itens[0].v-G.tm:null);"
        "return{conservaK:[p.gel.conservaK,p.fre.conservaK,p.bau.conservaK??null],envelheceu:{geladeira:Math.round(ant[0]-dep[0]),freezer:Math.round(ant[1]-dep[1]),bau:Math.round(ant[2]-dep[2])}};"),
      e("comidaSemEnergia", "const p=window.__pe;const f=E().fios.find(f=>f.b===p.gel.ext.eid);X('cortarFio')(f);W();const a=p.gel.itens[0].v-G.tm;X('validadePasso')();G.tm+=600;X('validadePasso')();"
        "const r={energ:!!p.gel.energ,fiada:X('energiaFiado')(p.gel),conservaK:p.gel.conservaK??null,envelheceu:Math.round(a-(p.gel.itens[0].v-G.tm))};X('ligarFio')(p.div,p.gel);W();r.religou=st(p.gel);return r;"),
      # cortar devolve o fio
      e("cortar", "const p=window.__pe,f=E().fios.find(f=>f.a===p.itr.ext.eid&&f.b===p.lum1.ext.eid),n0=conta('fio');X('cortarFio')(f);W();const r={devolveu:conta('fio')-n0,custo:f.n,lum1:st(p.lum1),luz:luz(p.lum1)};"
        "X('ligarFio')(p.itr,p.lum1);W();r.religou=st(p.lum1);return r;"),
      # ligação automática ao construir: lâmpada nova perto do divisor sai ligada
      e("auto", "const p=window.__pe,n0=E().fios.length,f0=conta('fio');const cam=X('cam'),O=()=>X('OBRA');n.cfg.cam='1';const yaw=Math.PI;vai(p.div.x-1,p.div.z+1.5);P.yaw=yaw;P.body=yaw;P.pitch=-0.35;"
        "cam.pos=[P.x,P.y+1.62,P.z];cam.fwd=[Math.sin(yaw)*0.9,-0.42,Math.cos(yaw)*0.9];dar({sucata:4});X('modoObra')(true);O().tipo='luminaria';O().rot=0;X('obraAlvo')();const ok=O().ok,mot=O().motivo;"
        "const k=X('OB').length;X('colocarObra')();X('modoObra')(false);n.cfg.cam='3';const nova=X('OB').length>k?X('OB')[X('OB').length-1]:null;W();"
        "const f=nova&&E().fios.find(f=>f.b===nova.ext.eid),de=f&&X('eletPorEid')(f.a);return{alvoOk:ok,motivo:mot,feita:!!nova,fios:E().fios.length-n0,gastou:f0-conta('fio'),de:de&&de.tipo,acesa:nova&&st(nova),aviso:ult()};"),
      # salvar e carregar
      e("antesSalvar", "const p=window.__pe;p.itr.ext.on=false;p.tmp.ext.h0=7;p.sen.ext.modo='todos';W();window.__nf=E().fios.length;X('salvarJogo')();return{fios:E().fios.length,eids:Object.keys(p).filter(k=>p[k].ext&&p[k].ext.eid).length};"),
      j("X('carregarJogo')();"), ["gwait", 1.5],
      e("carregou", "const ob2=t=>X('OB').filter(o=>o.tipo===t);const ger=ob2('gerador')[0],itr=ob2('interruptor')[0],tmp=ob2('temporizador')[0],sen=ob2('sensor')[0],fre=ob2('freezer')[0];"
        "return{fios:E().fios.length,iguais:E().fios.length===window.__nf,fiados:X('OB').filter(o=>X('energiaFiado')(o)).length,interruptor:itr&&itr.ext.on,temporizador:tmp&&tmp.ext.h0,sensor:sen&&sen.ext.modo,"
        "gerador:ger&&st(ger),freezer:fre&&st(fre),conservaK:fre&&fre.conservaK};")]
salvar('p182.json', s)
