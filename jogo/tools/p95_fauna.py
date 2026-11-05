"""p95: fauna — modelos e poses das 10 espécies (fotos de perto)."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
F = "const B=X('BICHOS'),cria=(t,x,z,o)=>X('criarBicho')(t,x,z,o||{}),limpa=()=>{B.length=0;},cong=b=>{b.congelado=true;return b;},gr=X('ground');"
s = inicio("X('FAUNA_POP').ativosMax=0;document.querySelector('.hud')&&(document.querySelector('.hud').style.opacity='0');")
def fila(nome, lista, st='explora', dist=5.2, alt=1.1, yaw=1.5708, esp=2.2, extra=""):
    cod = F+"limpa();vivo();vai(0,26);"
    n=len(lista)
    for i,(tp,var) in enumerate(lista):
        x = (i-(n-1)/2)*esp
        cod += f"{{const b=cong(cria('{tp}',{x:.2f},15,{{var:'{var}',s:1,yaw:{yaw}}}));if(b){{b.st='{st}';b.t=99;{extra}}}}}"
    cod += f"G.camFix={{pos:[0,{alt}+gr(0,{15+dist}),{15+dist}],tgt:[0,0.5+gr(0,15),15]}};"
    return foto(nome, cod, 0.5)
s += fila("350_fauna_a.png", [('coelho',''),('raposa',''),('ovelha','')], esp=1.6, dist=3.6, alt=0.9)
s += fila("351_fauna_b.png", [('cabra',''),('cabra','B'),('javali','')])
s += fila("352_fauna_c.png", [('cervo',''),('cervo','F'),('lobo','')], esp=2.6, dist=6, alt=1.3)
s += fila("353_fauna_d.png", [('onca',''),('urso','')], esp=3.2, dist=6, alt=1.3)
s += fila("354_fauna_e.png", [('vaca',''),('vaca','B')], esp=3.4, dist=6.5, alt=1.5)
s += fila("355_fauna_frente.png", [('lobo',''),('urso',''),('onca',''),('javali','')], yaw=0.0, esp=2.4, dist=6, alt=1.2)
s += fila("356_poses_deitado.png", [('cervo',''),('lobo',''),('vaca','')], st='repouso', esp=2.8, dist=6)
s += fila("357_poses_come.png", [('cervo',''),('javali',''),('ovelha','')], st='come', esp=2.6, dist=6)
s += fila("358_poses_defende.png", [('urso',''),('javali',''),('lobo','')], st='defende', esp=3.0, dist=7, alt=1.5)
s += fila("359_poses_morto.png", [('cervo',''),('lobo',''),('vaca','')], st='explora', esp=2.8, dist=6, extra="b.vivo=false;b.st='morto';b.carc={rest:{},t0:G.tm,vazia:false,coletas:[]};b.lado=1;")
s += [ev("contagem", F+"return{malhas:Object.keys(n.ev('ZMESH')).filter(k=>k.startsWith('bicho_')),n:B.length};"), js("G.camFix=null;")]
salvar('p95.json', s)
