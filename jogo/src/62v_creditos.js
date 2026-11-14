/* ================= Créditos (v10.1) =================
   O que entra no jogo feito por outras pessoas. Os modelos com licença CC BY 4.0 pedem o nome do autor, o nome da obra, o
   link da obra e da licença e o aviso de que foram modificados: está tudo aqui, numa tela aberta pelo rodapé do menu.
   Os de licença Standard (Fab e Sketchfab) e os CC0 (Poly Haven, sons) não pedem crédito, mas entram também. */
const CREDITOS=[
  {tit:'Lugares (modelos 3D)',itens:[
    {obra:'Abandoned building',autor:'Federico Paredes',link:'sketchfab.com/3d-models/abandoned-building-1aa481727ca54c59834a4f311b43e0cd',lic:'CC BY 4.0',licLink:'creativecommons.org/licenses/by/4.0',mod:'simplificado e convertido para o jogo'},
    {obra:'Abandoned House',autor:'AspectStudios',link:'sketchfab.com/3d-models/abandoned-house-c876fa6c530f4946a5234666752803ce',lic:'CC BY 4.0',licLink:'creativecommons.org/licenses/by/4.0',mod:'escala ajustada e convertido para o jogo'},
    {obra:'Forest house ruin',autor:'matousekfoto',link:'sketchfab.com/3d-models/forest-house-ruin-d19549af2c6c45638cedaa70f805414b',lic:'CC BY 4.0',licLink:'creativecommons.org/licenses/by/4.0',mod:'simplificado e convertido para o jogo'},
    {obra:'Destroyed Car 03 / Backrooms Car (Gameready ver)',autor:'Renafox',link:'sketchfab.com/3d-models/destroyed-car-03-backrooms-car-gameready-ver-efc4dfe2c7284a64bc9281eb4f61d402',lic:'CC BY 4.0',licLink:'creativecommons.org/licenses/by/4.0',mod:'escala ajustada e convertido para o jogo'},
    {obra:'Destroyed Building 02',autor:'Prince Obrymec',link:'sketchfab.com/3d-models/destroyed-building-02-13875c4f2a3d46e4a110aded70e7d466',lic:'Sketchfab Standard',mod:'cores aplicadas no jogo'},
    {obra:'Decayed concrete train shed with graffiti',autor:'',link:'fab.com',lic:'Fab Standard'},
    {obra:'Old Concrete Bunker PBR Scan',autor:'',link:'fab.com',lic:'Fab Standard'},
    {obra:'Corroded subway tunnel',autor:'',link:'fab.com',lic:'Fab Standard',mod:'escala ajustada e convertido para o jogo'},
    /* v10.2.2: a Base Militar destruída e o prédio em ruína (créditos tirados do license.txt de cada download) */
    {obra:'Crashed helicopter',autor:'J1G4R',link:'sketchfab.com/3d-models/crashed-helicopter-1ad46b04f23d43dbb2730c9435c1a7cc',lic:'CC BY 4.0',licLink:'creativecommons.org/licenses/by/4.0',mod:'simplificado e convertido para o jogo'},
    {obra:'Abandoned Soviet BTR - 80',autor:'GameDev Nick',link:'sketchfab.com/3d-models/abandoned-soviet-btr-80-32145d6303e5487e9d92097b9845ef02',lic:'CC BY 4.0',licLink:'creativecommons.org/licenses/by/4.0',mod:'simplificado e convertido para o jogo'},
    {obra:'Abandoned soviet military body-van KUNG',autor:'Mikhail Volkov',link:'sketchfab.com/3d-models/abandoned-soviet-military-body-van-kung-ed8dd9fe963347b1bedf3a46fc3aa42c',lic:'CC BY 4.0',licLink:'creativecommons.org/licenses/by/4.0',mod:'simplificado e convertido para o jogo'},
    {obra:'Abandoned Garage Block Rusty Ruined Game-Ready',autor:'olegolegperepelica',link:'sketchfab.com/3d-models/abandoned-garage-block-rusty-ruined-game-ready-a1959927a98e4752bdb01b6e1f7f7d26',lic:'CC BY 4.0',licLink:'creativecommons.org/licenses/by/4.0',mod:'simplificado e convertido para o jogo'},
    {obra:'Sandbag Barrier (Ready for Unreal Engine)',autor:'G4AGamingLabs',link:'sketchfab.com/3d-models/sandbag-barrier-ready-for-unreal-engine-593800671c8e45eca93b8b7c765c0f77',lic:'CC BY 4.0',licLink:'creativecommons.org/licenses/by/4.0',mod:'simplificado e convertido para o jogo'},
    {obra:'Ruin Building',autor:'nermin',link:'sketchfab.com/3d-models/ruin-building-184d70cc473540749206cc7d8f9917b8',lic:'CC BY 4.0',licLink:'creativecommons.org/licenses/by/4.0',mod:'simplificado e convertido para o jogo'}]},
  {tit:'Personagem',itens:[
    {obra:'Corpos, peles, olhos, sobrancelhas, cabelos, barbas, roupas e sapatos do Personalizado, e o braço da 1ª pessoa',autor:'MakeHuman',link:'makehumancommunity.org',lic:'CC0',mod:'ajustado ao esqueleto do jogo'}]},
  {tit:'Texturas e modelos',itens:[
    {obra:'Grama, chão da mata, folhas, rocha, tábuas, capim, ferramentas, baú, galhos, pinheiro, móveis e objetos do mapa (barreira, tambor, caixa militar)',autor:'Poly Haven',link:'polyhaven.com',lic:'CC0'}]},
  {tit:'Sons gravados',itens:[
    {obra:'Impact Sounds e RPG Audio',autor:'Kenney',link:'kenney.nl',lic:'CC0'},
    {obra:'Pacotes de efeitos CC0 (madeira, metal, quebra, criaturas, tiros)',autor:'rubberduck',link:'opengameart.org',lic:'CC0'},
    {obra:'Micro Pack "Organic Wooshes"',autor:'Ben Burnes',lic:'CC0'},
    {obra:'Armas e vozes do Warfork',autor:'Team Forbidden',lic:'CC0'},
    {obra:'Reunidos na coleção CC0-Public-Domain-Sounds',autor:'lavenderdotpet',link:'github.com/lavenderdotpet/CC0-Public-Domain-Sounds',lic:'CC0'}]},
  {tit:'Animações',itens:[{obra:'Animações do personagem',autor:'Mixamo (Adobe)',link:'mixamo.com',lic:'licença do Mixamo'}]}];
function creditosHTML(){const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  let h='<h2>Créditos</h2><p class="cd-intro">VAYDR usa modelos, texturas e sons feitos por outras pessoas. Obrigado a todas elas.</p>';
  for(const g of CREDITOS){h+='<h3>'+esc(g.tit)+'</h3><ul class="cd-lista">';
    for(const c of g.itens)h+='<li><span><b>'+(c.obra.startsWith('Reunidos')||g.tit!=='Lugares (modelos 3D)'?esc(c.obra):'“'+esc(c.obra)+'”')+'</b>'+(c.autor?', de '+esc(c.autor):'')+'</span>'+
      (c.link?'<small>'+esc(c.link)+'</small>':'')+'<small>Licença: '+esc(c.lic)+(c.licLink?' ('+esc(c.licLink)+')':'')+(c.mod?' · '+esc(c.mod):'')+'</small></li>';
    h+='</ul>';}
  return h;}
{const css=document.createElement('style');css.textContent=
  '#t-creditos .cartao{width:min(620px,100%)}#cd-corpo{display:grid;gap:12px;max-height:min(70vh,620px);overflow:auto;overscroll-behavior:contain;padding-right:6px}'+
  '#cd-corpo h2{margin:0}'+
  '#t-creditos h3{margin:6px 0 0;font-size:13px;letter-spacing:.08em;text-transform:uppercase;opacity:.75}'+
  '.cd-intro{margin:0;opacity:.85}.cd-lista{list-style:none;margin:0;padding:0;display:grid;gap:9px}'+
  '.cd-lista li{display:grid;gap:2px;line-height:1.35}.cd-lista small{opacity:.68;overflow-wrap:anywhere}';
  document.head.append(css);
  const t=document.createElement('div');t.className='tela';t.id='t-creditos';t.hidden=true;
  t.innerHTML='<div class="cartao" role="dialog" aria-modal="true" aria-label="Créditos"><div id="cd-corpo">'+creditosHTML()+'</div><button type="button" class="btn" id="cd-voltar">Voltar</button></div>';
  const ref=document.getElementById('t-ajuda');(ref&&ref.parentNode||document.body).insertBefore(t,ref?ref.nextSibling:null);
  if(typeof TELAS!=='undefined'&&!TELAS.includes('t-creditos'))TELAS.push('t-creditos');
  const b=document.createElement('button');b.type='button';b.className='btn';b.id='m-creditos';b.textContent='Créditos';
  const lugar=document.querySelector('#t-menu .vl-links')||document.querySelector('#t-menu .m-sec')||document.querySelector('#t-menu .menu-col');
  if(lugar){const sair=lugar.querySelector('#m-sair');lugar.insertBefore(b,sair||null);}
  b.addEventListener('click',()=>{try{sfx('clique');}catch(_){}tela('t-creditos');const c=document.getElementById('cd-corpo');if(c)c.scrollTop=0;});
  document.getElementById('cd-voltar').addEventListener('click',()=>{try{sfx('clique');}catch(_){}tela('t-menu');});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!t.hidden){e.stopPropagation();tela('t-menu');}},true);}
