"""p152: por que o urso comendo não percebe o jogador a 11 m (p96 urso_ataca)."""
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
LOG = ("const u=window.__u||{};window.__L=window.__L||[];"
       "window.__L.push({t:r2(G.t),st:u.st,alerta:r2(u.alerta||0),d:r2(Math.hypot(u.x-P.x,u.z-P.z)),veg:!!P.vegOculto,calls:window.__calls||0,iaCalls:window.__iaCalls||0,lento:window.__lento,dp:window.__dp&&r2(window.__dp),"
       "py:r2(P.y),gy:r2(X('ground')(P.x,P.z)),uy:r2(u.y||0),noChao:P.noChao,alive:P.alive});")
s += [js("n.ev('window.__fp0=faunaPercebe;faunaPercebe=function(b,S,dt,dp){if(b===window.__u){window.__calls=(window.__calls||0)+1;window.__dp=dp;}return window.__fp0(b,S,dt,dp);};window.__ia0=faunaIA;faunaIA=function(b,dt,dp,l){if(b===window.__u){window.__iaCalls=(window.__iaCalls||0)+1;window.__lento=l;}return window.__ia0(b,dt,dp,l);};');"),
      js("vivo();X('BICHOS').length=0;G.hora=11;P.vida=100;vai(-100,-84);P.yaw=0;P.body=0;const uu=X('criarBicho')('urso',-100,-73,{yaw:Math.PI});uu.st='come';uu.t=30;window.__u=uu;" + LOG)]
for k in range(4):
    s += [["gwait", 1.0], js(LOG)]
s += [ev("urso", "return window.__L;")]
salvar('p152.json', s)
