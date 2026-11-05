import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [ev("armas", "const I=X('ITEMS'),o={};for(const k in I){const d=I[k];if(d.tipo==='arma'||(d.dano&&(d.mun!==undefined||d.cad!==undefined||d.alcance!==undefined))){const r={};for(const f in d){const v=d[f];if(typeof v==='number'||typeof v==='boolean'||(typeof v==='string'&&f!=='desc'&&f!=='icon'))r[f]=v;}o[k]=r;}}return o;"),
      ev("zumbis", "const S=X('ZS'),o={};for(const k in S){const d=S[k],r={};for(const f in d){const v=d[f];if(typeof v!=='object'||v===null)r[f]=v;}o[k]=r;}return o;"),
      ev("dif", "return X('DIF');"),
      ev("perks", "return{mira:X('perk')('mira'),forca:X('perk')('forca')};")]
salvar('tools/p226_analise.json', s, vp=(640, 360))
