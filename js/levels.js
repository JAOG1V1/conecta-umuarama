/* Metas de gasto e percurso são desafios alcançáveis, não provas de ótimo global. */
const LEVELS = [
  {
    "id": 1,
    "title": "Primeiro caminho",
    "story": "Lia terminou seu primeiro jogo e quer mostrá-lo na feira da escola. Falta um caminho entre sua casa e a sala onde os amigos estão esperando.",
    "efficiencyCost": 3,
    "description": "Ajude Lia a chegar à escola. Construa uma calçada e teste a rota.",
    "hint": "Selecione Calçada e complete as três células livres entre Lia e a escola.",
    "budget": 5,
    "map": [
      "ttttttt",
      "t..t..t",
      "tA...Xt",
      "t..t..t",
      "t.....t",
      "t..~..t",
      "ttttttt"
    ],
    "people": [
      {
        "name": "Lia",
        "from": "A",
        "to": "X",
        "stairs": true,
        "color": "#006b63",
        "arrival": "Cheguei à feira! Agora posso mostrar o jogo que preparei.",
        "portrait": "lia",
        "movement": "pedestrian",
        "stepGoal": 4
      }
    ],
    "destinations": {
      "X": "Escola"
    },
    "solution": {
      "2,2": "path",
      "2,3": "path",
      "2,4": "path"
    },
    "destinationTypes": {
      "X": "school"
    },
    "tutorial": true
  },
  {
    "id": 2,
    "title": "Caminhos compartilhados",
    "story": "Depois de ajudar na feira, Caio vai encontrar os amigos na praça. Lia segue para a escola. Será que uma mesma calçada pode servir aos dois?",
    "efficiencyCost": 9,
    "description": "Lia e Caio têm destinos diferentes. Uma rede compartilhada ajuda a economizar.",
    "hint": "As árvores deixam uma abertura no centro. Os moradores podem compartilhar o mesmo trecho.",
    "budget": 11,
    "map": [
      "ttttttt",
      "tA.t.Xt",
      "t..t..t",
      "t.....t",
      "t..t..t",
      "tB.t.Yt",
      "ttttttt"
    ],
    "people": [
      {
        "name": "Lia",
        "from": "A",
        "to": "X",
        "stairs": true,
        "color": "#006b63",
        "arrival": "Bom estudo para mim e um bom encontro para o Caio!",
        "portrait": "lia",
        "movement": "pedestrian",
        "stepGoal": 8
      },
      {
        "name": "Caio",
        "from": "B",
        "to": "Y",
        "stairs": false,
        "color": "#9e3e12",
        "arrival": "Já vejo meus amigos na praça. Essa calçada serviu para nós dois.",
        "portrait": "caio",
        "movement": "wheelchair",
        "stepGoal": 8
      }
    ],
    "destinations": {
      "X": "Escola",
      "Y": "Praça"
    },
    "solution": {
      "2,1": "path",
      "3,1": "path",
      "4,1": "path",
      "3,2": "path",
      "3,3": "path",
      "3,4": "path",
      "2,5": "path",
      "3,5": "path",
      "4,5": "path"
    },
    "destinationTypes": {
      "X": "school",
      "Y": "park"
    }
  },
  {
    "id": 3,
    "title": "Uma cidade para todos",
    "story": "Lia leva um trabalho para a escola, enquanto Caio vai à sua consulta de rotina. Uma escolha no mapa pode encurtar o trajeto de um e alongar o do outro.",
    "efficiencyCost": 8,
    "description": "Uma escada divide o bairro. Caio usa cadeira de rodas e precisa de uma rota sem degraus.",
    "hint": "Compare a passagem lateral com a rampa central: o mesmo investimento pode mudar a distância de cada morador.",
    "budget": 10,
    "map": [
      "ttttttt",
      "tA...Bt",
      "t..p..t",
      "tptsttt",
      "t..p..t",
      "tX...Yt",
      "ttttttt"
    ],
    "people": [
      {
        "name": "Lia",
        "from": "A",
        "to": "X",
        "stairs": true,
        "color": "#006b63",
        "arrival": "Meu trabalho chegou comigo. Até amanhã!",
        "portrait": "lia",
        "movement": "pedestrian",
        "stepGoal": 8,
        "reactions": {
          "short": "Cheguei à escola. Veja também quantos passos o Caio precisou percorrer.",
          "detour": "Meu caminho ficou mais longo. Será que outra ligação encurta a viagem?"
        }
      },
      {
        "name": "Caio",
        "from": "B",
        "to": "Y",
        "stairs": false,
        "color": "#9e3e12",
        "arrival": "Cheguei à consulta por um caminho sem degraus.",
        "portrait": "caio",
        "movement": "wheelchair",
        "stepGoal": 8,
        "reactions": {
          "ramp": "Passei pela rampa central. Um caminho direto também faz diferença no meu dia.",
          "detour": "A passagem lateral funcionou. Precisei dar uma volta maior até a consulta.",
          "short": "Cheguei por um caminho curto e sem degraus."
        }
      }
    ],
    "destinations": {
      "X": "Escola",
      "Y": "Unidade de saúde"
    },
    "alternatives": [
      {
        "1,4": "path",
        "1,3": "path",
        "2,2": "path",
        "2,1": "path",
        "4,1": "path",
        "4,2": "path",
        "5,3": "path",
        "5,4": "path"
      }
    ],
    "solution": {
      "1,2": "path",
      "1,3": "path",
      "1,4": "path",
      "3,3": "ramp",
      "5,2": "path",
      "5,3": "path",
      "5,4": "path"
    },
    "destinationTypes": {
      "X": "school",
      "Y": "health"
    }
  },
  {
    "id": 4,
    "title": "Travessia segura",
    "story": "Hoje tem encontro de jogos de tabuleiro na praça. Caio quer chegar por um caminho sem degraus. Você decide como usar o orçamento do bairro.",
    "efficiencyCost": 7,
    "description": "Um atalho com faixa e rampa ou um passeio mais longo? Ajude Caio a chegar à praça.",
    "hint": "O passeio existente na borda direita contorna a rua. Compare seu custo e distância com uma travessia e uma rampa à esquerda.",
    "budget": 13,
    "map": [
      "tttttttt",
      "tA.....t",
      "tp.~...p",
      "t==~===p",
      "t..~...p",
      "ttstttpt",
      "t.....Xt",
      "tttttttt"
    ],
    "people": [
      {
        "name": "Caio",
        "from": "A",
        "to": "X",
        "stairs": false,
        "color": "#9e3e12",
        "arrival": "Cheguei! Quem vai jogar a primeira partida comigo?",
        "portrait": "caio",
        "movement": "wheelchair",
        "stepGoal": 10,
        "reactions": {
          "ramp": "A faixa e a rampa me levaram por um caminho mais curto. Hora de jogar!",
          "detour": "Usei o passeio do contorno. A obra custou menos, e meu percurso foi um pouco maior.",
          "short": "Cheguei à praça por um caminho curto. Quem joga comigo?"
        }
      }
    ],
    "destinations": {
      "X": "Praça"
    },
    "alternatives": [
      {
        "1,2": "path",
        "1,3": "path",
        "1,4": "path",
        "1,5": "path",
        "1,6": "path",
        "2,6": "path",
        "4,6": "path"
      }
    ],
    "solution": {
      "3,1": "crossing",
      "4,1": "path",
      "4,2": "path",
      "5,2": "ramp",
      "6,2": "path",
      "6,3": "path",
      "6,4": "path",
      "6,5": "path"
    },
    "destinationTypes": {
      "X": "park"
    }
  },
  {
    "id": 5,
    "title": "Bairro conectado",
    "story": "É dia de movimento no bairro: Lia participa da feira, Caio tem uma consulta e Rosa leva livros para uma roda de leitura na praça. Sua rede precisa acolher os três.",
    "efficiencyCost": 20,
    "description": "Conecte os três destinos. Aqui é possível conquistar os dois selos juntos.",
    "hint": "A escada aceita uma rampa; há também uma passagem na margem direita. Compare os caminhos e compartilhe trechos.",
    "budget": 25,
    "map": [
      "ttttttttt",
      "tA..=..Xt",
      "t.t.=.t.t",
      "tB.p=p..t",
      "t~s~~~p~t",
      "t..p=p..t",
      "t.t.=.t.t",
      "tC..=Y.Zt",
      "ttttttttt"
    ],
    "people": [
      {
        "name": "Lia",
        "from": "A",
        "to": "X",
        "stairs": true,
        "color": "#006b63",
        "arrival": "A feira já começou. Vou apresentar meu projeto!",
        "portrait": "lia",
        "movement": "pedestrian",
        "stepGoal": 10
      },
      {
        "name": "Caio",
        "from": "B",
        "to": "Y",
        "stairs": false,
        "color": "#9e3e12",
        "arrival": "Consulta em dia. Depois vou encontrar o pessoal na praça.",
        "portrait": "caio",
        "movement": "wheelchair",
        "stepGoal": 8,
        "reactions": {
          "ramp": "A rampa entrou no meu trajeto e encurtou a ida à consulta.",
          "detour": "Consegui chegar pela passagem existente. Dei uma volta maior até a consulta.",
          "short": "Cheguei à consulta por um caminho curto e sem degraus."
        }
      },
      {
        "name": "Rosa",
        "from": "C",
        "to": "Z",
        "stairs": true,
        "color": "#5b43a6",
        "arrival": "Os livros chegaram! Podemos começar nossa roda de leitura.",
        "portrait": "rosa",
        "movement": "pedestrian",
        "stepGoal": 10
      }
    ],
    "destinations": {
      "X": "Escola",
      "Y": "Unidade de saúde",
      "Z": "Praça"
    },
    "solution": {
      "1,2": "path",
      "1,3": "path",
      "2,3": "path",
      "3,2": "path",
      "3,4": "crossing",
      "3,6": "path",
      "3,7": "path",
      "2,7": "path",
      "4,2": "ramp",
      "5,2": "path",
      "5,4": "crossing",
      "6,5": "path",
      "6,1": "path",
      "5,1": "path",
      "5,6": "path",
      "5,7": "path",
      "6,7": "path"
    },
    "alternatives": [
      {
        "1,2": "path",
        "1,3": "path",
        "2,3": "path",
        "3,2": "path",
        "3,4": "crossing",
        "3,6": "path",
        "3,7": "path",
        "2,7": "path",
        "5,2": "path",
        "5,4": "crossing",
        "6,5": "path",
        "6,1": "path",
        "5,1": "path",
        "5,6": "path",
        "5,7": "path",
        "6,7": "path"
      },
      {
        "1,2": "path",
        "1,3": "path",
        "1,4": "crossing",
        "1,5": "path",
        "1,6": "path",
        "3,2": "path",
        "4,2": "ramp",
        "5,1": "path",
        "5,2": "path",
        "5,4": "crossing",
        "5,6": "path",
        "5,7": "path",
        "6,1": "path",
        "6,5": "path",
        "6,7": "path"
      }
    ],
    "destinationTypes": {
      "X": "school",
      "Y": "health",
      "Z": "park"
    }
  }
];
