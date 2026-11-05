import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [ev("dbg", "const livre=(px,pz,g0,t)=>!(Math.abs(X('ground')(px,pz)-g0)>t||X('pointBlocked')(px,pz,0.5)||(X('RIO').ok&&X('aguaPerto')(px,pz,1.0)));"
         "const casa=(x,z)=>{if(!X('dentroMapa')(x,z,20))return false;const g0=X('ground')(x,z);for(let i=-2;i<=5;i++)for(let k=-2;k<=5;k++)if(!livre(x+i*1.5,z+k*1.5,g0,0.8))return false;return true;};"
         "const S=[[2,-5],[2,-8.4],[0.2,-8.2],[2.2,-1.6],[5.5,-6.2],[10,-3],[10,-6.4],[7,-3],[9.5,1],[16,-3],[16,-6.4],[9,-9],[9,-12.4],[-2.6,-2.6],[4.4,-3.6]];const falha={};let nc=0,tot=0;"
         "for(let r=18;r<170;r+=2)for(let k=0;k<48;k++){const a=k/48*6.283,x=Math.round(F[0]+Math.cos(a)*r),z=Math.round(F[2]+Math.sin(a)*r);tot++;if(!casa(x,z))continue;nc++;const g0=X('ground')(x,z);"
         "for(const[dx,dz]of S){let ok=true;for(const[ex,ez]of[[0,0],[0.9,0],[-0.9,0],[0,0.9],[0,-0.9]])if(!livre(x+dx+ex,z+dz+ez,g0,1.6))ok=false;if(!ok)falha[dx+','+dz]=(falha[dx+','+dz]||0)+1;}}"
         "return{tot,nc,falha,F:[F[0],F[2]],rio:X('RIO').ok};")]
salvar('p177d.json', s)
