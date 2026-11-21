/* consulta do servidor de exportação (servidor.py): paredões e pedras soltas da Serra Velha (SVP, 62yb_serra_pedras.js)
   e a folhagem do chão da mata (MCH_PL, 62ya_mata_chao.js), cada um com x, y, z, giro, tamanho e variante.
   O resultado vai para pedras_plantas_converter.py. */
(function(){const R={aflor:SVP.aflor.map(a=>[+a.x.toFixed(2),+a.y.toFixed(2),+a.z.toFixed(2),+a.r.toFixed(3),+a.s.toFixed(3),a.tipo]),
 soltas:SVP.soltas.map(q=>[+q.x.toFixed(2),+q.y.toFixed(2),+q.z.toFixed(2),+q.r.toFixed(3),+q.s.toFixed(3),q.v]),
 pl:MCH_PL.filter(q=>q.y>-900).map(q=>[+q.x.toFixed(2),+q.y.toFixed(2),+q.z.toFixed(2),+q.r.toFixed(3),+q.s.toFixed(3),q.v])};
return JSON.stringify(R);})()
