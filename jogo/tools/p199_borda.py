"""p199: Etapa 22, borda do mapa: a faixa de mata fechada cobre todo o limite (círculo da mata, corredor do vale, planalto do
Alto do Rio Claro e as margens da estrada de entrada); andando para fora em qualquer ponto do limite você para no mato antes da
parede invisível; os pontos do círculo sem nada a menos de 3 m (a medida antiga dos 62 trechos) zeram."""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
H = ("const B=X('BORDA_PTS'),dm=X('dentroMapa'),col=X('collide'),gr=X('ground'),"
     "anda=(x,z,nx,nz,dist)=>{let o0=0;for(const o of[3.2,2.0,1.2]){if(dm(x-nx*o,z-nz*o)){o0=o;break;}}if(!o0)return{parede:false,fora:true,falta:0};const e={x:x-nx*o0,z:z-nz*o0};e.y=gr(e.x,e.z);let parede=false,i=0;for(;i<Math.round((o0+dist)/0.08);i++){const ox=e.x,oz=e.z;e.x+=nx*0.08;e.z+=nz*0.08;e.y=gr(e.x,e.z);col(e,0.3,c=>!c.portao);"
     "if(!dm(e.x,e.z)){parede=true;break;}if(Math.hypot(e.x-ox,e.z-oz)<0.004)break;}return{parede,x:e.x,z:e.z,falta:(e.x-x)*nx+(e.z-z)*nz};},"
     "perto=(x,z,d)=>{for(const t of X('TREES'))if(t.alive&&(t.x-x)**2+(t.z-z)**2<d*d)return true;for(const b of X('BRENHA'))if((b.x-x)**2+(b.z-z)**2<d*d)return true;for(const b of X('BRENHA_PEDRAS'))if((b.x-x)**2+(b.z-z)**2<d*d)return true;for(const r of X('ROCKS'))if(r.alive&&(r.x-x)**2+(r.z-z)**2<d*d)return true;return false;};")
def e(nome, c): return ev(nome, H + c)
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("window.__semRender=true;"),
      e("contas", "const tipos={circulo:0,planalto:0,corredor:0,estrada:0,praia:0,agua:0};for(const[x,z]of B){const r=Math.hypot(x,z),ra=Math.hypot(x-50,z+244);if(x>210&&gr(x,z)<0.3)tipos.agua++;else if(x>210)tipos.praia++;else if(Math.abs(r-150)<0.2)tipos.circulo++;else if(Math.abs(ra-64)<0.2)tipos.planalto++;else if(x>130&&Math.abs(z)<30)tipos.estrada++;else tipos.corredor++;}"
        "return{pontos:B.length,tipos,moitas:X('BRENHA').length,pedras:X('BRENHA_PEDRAS').length};"),
      e("trechos62", "let sem=0,abertos=0;const R=X('MAP_R'),L=[];for(let i=0;i<628;i++){const a=i/628*Math.PI*2,x=Math.cos(a)*R,z=Math.sin(a)*R;if(dm(x*1.01,z*1.01)){abertos++;continue;}if(!perto(x,z,3)){sem++;L.push(Math.round(a*100)/100);}}return{semNada3m:sem,aberturas:abertos,lista:L.slice(0,20)};"),
      e("caminhada", "let parede=0,cnt=0,fora=0;const L=[];let fMin=9,fMax=-9;for(let i=0;i<B.length;i++){const[x,z,nx,nz]=B[i];if(x>210&&gr(x,z)<0.3)continue;const r=anda(x,z,nx,nz,2.5);if(r.fora){fora++;continue;}cnt++;if(r.parede){parede++;if(L.length<25)L.push([Math.round(x),Math.round(z)]);}else{fMin=Math.min(fMin,r.falta);fMax=Math.max(fMax,r.falta);}}"
        "return{testados:cnt,cantoSemComeco:fora,chegouNaParede:parede,onde:L,paraAntes:[Math.round(fMin*100)/100,Math.round(fMax*100)/100]};"),
      e("diagonal", "let parede=0,cnt=0,fora=0;const L=[];for(let i=0;i<B.length;i+=2){const[x,z,nx,nz]=B[i];if(x>210&&gr(x,z)<0.3)continue;for(const s of[-1,1]){const a=0.6*s,c=Math.cos(a),sn=Math.sin(a),dx=nx*c-nz*sn,dz=nx*sn+nz*c;const r=anda(x,z,dx,dz,3);if(r.fora){fora++;continue;}cnt++;if(r.parede){parede++;if(L.length<25)L.push([Math.round(x),Math.round(z)]);}}}return{testados:cnt,cantoSemComeco:fora,chegouNaParede:parede,onde:L};")]
salvar('p199.json', s, vp=(640, 360))
