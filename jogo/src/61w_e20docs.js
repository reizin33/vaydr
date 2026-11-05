/* ================= Etapa 20: manual, ajuda e o guia dos peixes do mar ================= */
MANUAL_EXTRA.push(()=>{const G_=(id,sec,nome,icon,desc,est,ferr,proc,obs)=>({id,sec,nome,icon,trav:false,como:'desde o começo',desc,ing:{},est:{nome:est,icon,onde:''},ferr,proc,res:null,obs,tipo:'Guia'});
  const mar=Object.keys(PEIXES).filter(k=>PEIXES[k].onde.mar);
  return[
    G_('x:mar','barcos','O mar e a maré','i-mare','A leste da cidade ficam a praia e o mar. O nível da água sobe e desce.','Onde: a avenida do meio da cidade leva ao porto e à praia',['Nenhuma'],
      ['A maré sobe e desce duas vezes por dia (um ciclo de 12 h 24 min do jogo). Perto do mar, o relógio mostra se está enchendo, vazando, alta ou baixa, e quanto falta.',
       'Na lua cheia e na lua nova a maré é maior; nos quartos, menor.',
       'Na maré baixa a praia cresce e aparecem bancos de areia: dá para chegar andando no naufrágio do pesqueiro. Na alta, só nadando ou de barco.',
       'Barco encalha no banco de areia na maré baixa. Vento e chuva fazem ondas maiores.'],
      ['Água do mar não mata a sede: ferva a garrafa na fogueira para tirar o sal (fica o sal e a garrafa volta vazia).','Atrás das dunas da ponta norte, um alagado enche na maré alta.',
       'Na praia: rampa de barcos (bom para o reboque), um barco a motor abandonado na areia, quiosque, posto de salva-vidas e o farol velho na ponta norte.']),
    G_('x:porto','barcos','Porto e navio cargueiro','i-navio','O cargueiro Atlântico Sul encalhou ao lado do cais. Tem contêineres para saquear.','Onde: no fim da avenida do meio da cidade (leste)',['Pé de cabra (para os contêineres com cadeado)'],
      ['Suba pela prancha do cais até o convés.','Os contêineres de baixo têm a porta virada para o corredor: os abertos dá para revistar; os com cadeado abrem com pé de cabra (faz barulho).',
       'Na ponte de comando (no fundo do navio) fica o armário do comandante.','A guarita do cais e os contêineres do cais também têm o que revistar.'],
      ['A tripulação virou zumbi: tem zumbi no convés e no cais.','Os contêineres voltam a ter coisas depois de alguns dias (o armário do comandante, não).']),
    G_('x:naufragios','barcos','Naufrágios','i-ancora','Dois barcos afundados guardam recursos.','Onde: o pesqueiro no banco de areia a sudeste do cais; o veleiro mar adentro, a nordeste',['Máscara de mergulho ajuda'],
      ['Pesqueiro Esperança: na maré baixa vá andando (água pela cintura) e revista a cabine e o porão; na maré alta, nadando.',
       'Veleiro: afundado a uns 6 m, a nordeste do cais. Nade até em cima dele e segure C para mergulhar; o baú fica do lado do casco.'],
      ['Debaixo d\'água o fôlego acaba (30 s; com a máscara, 60 s). Espaço sobe.']),
    G_('x:peixesMar','comida','Peixes do mar e caranguejo','i-peixe','Sete espécies no mar, com a mesma vara. Caranguejo na areia molhada.','Onde: praia, cais, píer, convés ou barco parado',['Vara de pesca na mão'],
      mar.map(k=>{const F=PEIXES[k],M=F.mar||{};return F.nome+': de '+kgTxt(F.kg[0])+' a '+kgTxt(F.kg[1])+(M.inverno?'; muito mais no inverno':'')+(M.enchendo?'; maré enchendo e fim de tarde':'')+(M.fundo?'; só longe da praia, em água funda':'')+(M.estrutura>3?'; perto do naufrágio, das pedras e do cais':'')+(F.noite>1.5?'; de noite':'')+'.';})
        .concat(['Caranguejo: na areia molhada perto da água, mais na maré baixa e de noite. Agachado e devagar dá para pegar (E). Cozinhe na fogueira.']),
      ['Maré enchendo: o peixe morde mais rápido; na baixa, mais devagar.','Do cais, do píer e do convés dá para pescar com a água lá embaixo.','Gaivotas sobre a praia e golfinhos ao longe quando o mar está calmo.']),
    G_('x:mergulho','barcos','Nadar e mergulhar no mar','i-nadar','Nadando, dá para descer até o fundo.','Onde: no mar, no lago e no rio fundo',['Máscara de mergulho (opcional)'],
      ['Nadando, segure C para descer; Espaço sobe; solto, você volta devagar para a superfície.','A barra de fôlego aparece em cima da tela. Quando acaba, você começa a se afogar.',
       'Com a máscara de mergulho na mochila o fôlego dura o dobro (ache no navio, no posto de salva-vidas ou nos naufrágios).'],
      ['De noite, afogados nadam atrás de quem está na água (no mar também).']),
    G_('x:construcoesMar','construcoes','Deque e píer no mar','i-pier','Construa sobre a água salgada.','Onde: aba Água do modo de construção',['Nenhuma'],
      ['Deque: na beira, olhando para o mar; fica alto o bastante para a maré alta (com rampinha se a areia estiver baixa).',
       'Píer: comece na beira olhando para a água. Para emendar, vá até a ponta e olhe para a frente: até 12 trechos de 6 m.',
       'Na areia que a maré alta cobre só dá para construir as coisas de água (deque, píer, ponte).'],
      ['Da ponta de um píer comprido dá para pescar cavala e garoupa.','As estacas seguram o barco: dá para encostar o barco no píer.'])];});
{const p=document.querySelector('#t-ajuda [data-e19p]')||document.querySelector('#t-ajuda [data-e18p]');if(p&&!document.querySelector('#t-ajuda [data-e20p]'))p.insertAdjacentHTML('afterend','<p data-e20p>O mar: a avenida do meio da cidade leva ao porto, à praia e ao mar. A maré sobe e desce duas vezes por dia (o relógio mostra perto do mar): na baixa a praia cresce e dá para ir andando ao naufrágio do pesqueiro. No cais está o cargueiro encalhado: suba pela prancha e revista os contêineres (os com cadeado abrem com pé de cabra). Peixes do mar mordem a mesma vara; caranguejos na areia molhada. Nadando, segure C para mergulhar e Espaço para subir (olhe o fôlego). Água do mar não se bebe: ferva para tirar o sal. Na aba Água: deque e píer no mar.</p>');}
