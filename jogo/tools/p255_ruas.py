"""p255 (v10.8.3, Himalaia 19/11: "aproxime o máximo do real... está muito sintético" — ruas, calçadas e chão; lixo e abandono):
1 o chão da cidade ganhou detalhe (placas da calçada, remendos, óleo, sujeira do meio-fio, tinta gasta) e o lixo (papel, folhas,
  papelão, sacolas, latas, garrafas) em pedaços; nada disso tem colisão (a rua continua livre)
2 as manchas de terra e queimado do caos têm a borda na cor do chão em volta (asfalto, calçada ou lote)
3 a chuva molha e faz poça (o desenho com chuva roda sem erro)"""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from vt import *
s = inicio("X('FAUNA_POP').ativosMax=0;")
s += [js("vivo();X('BICHOS').length=0;Z.length=0;G.hora=10;")]
s += [ev("chao", "const R=X('RUAS3');return{erro:R.erro||null,chao:!!R.chao,info:R.info,lixo:R.lixo_info,pedacos:R.lixo?R.lixo.length:0,"
         "livre:[[230,8],[255,30],[205,-20],[280,58]].map(([x,z])=>!X('pointBlocked')(x,z,0.4))};")]
s += [ev("borda", "const f=X('r3CorChao');const c=(x,z)=>f(x,z).map(v=>Math.round(v*1000)/1000);return{rua:c(230,8),calcada:c(230,15.2),lote:c(230,30)};")]
s += [js("G.chuva=1;G.chuvaAlvo=1;window.__semRender=false;"), ["gwait", 1.0], js("window.__semRender=true;"),
      ev("chuva", "return{chuva:G.chuva,wet:X('E').wet,modo:G.modo};")]
salvar('tools/p255_ruas.json', s)
