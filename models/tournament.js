const { db } = require('../firebase/config');
const { collection, getDocs, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where } = require('firebase/firestore');

const tournamentsCollection = collection(db, 'tournaments');

class Tournament {
  static async getAll() {
    const snapshot = await getDocs(tournamentsCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  static async getById(id) {
    const tournamentDoc = await getDoc(doc(db, 'tournaments', id));
    if (!tournamentDoc.exists()) {
      return null;
    }
    return {
      id: tournamentDoc.id,
      ...tournamentDoc.data()
    };
  }

  static async create(tournamentData) {
    const result = await addDoc(tournamentsCollection, {
      name: tournamentData.name,
      location: tournamentData.location,
      startDate: tournamentData.startDate,
      endDate: tournamentData.endDate,
      rounds: parseInt(tournamentData.rounds) || 5,
      players: [],
      currentRound: 0,
      pairings: [],
      results: [],
      createdAt: new Date().toISOString()
    });
    return result.id;
  }

  static async update(id, tournamentData) {
    const tournamentRef = doc(db, 'tournaments', id);
    await updateDoc(tournamentRef, {
      name: tournamentData.name,
      location: tournamentData.location,
      startDate: tournamentData.startDate,
      endDate: tournamentData.endDate,
      rounds: parseInt(tournamentData.rounds) || 5,
      updatedAt: new Date().toISOString()
    });
    return id;
  }

  static async delete(id) {
    await deleteDoc(doc(db, 'tournaments', id));
    return id;
  }

  static async addPlayer(tournamentId, playerId) {
    const tournamentRef = doc(db, 'tournaments', tournamentId);
    const tournamentDoc = await getDoc(tournamentRef);
    const tournament = tournamentDoc.data();

    // Verificar se o jogador já está no torneio
    if (!tournament.players.includes(playerId)) {
      tournament.players.push(playerId);
      await updateDoc(tournamentRef, { players: tournament.players });
    }

    return tournamentId;
  }

  static async removePlayer(tournamentId, playerId) {
    const tournamentRef = doc(db, 'tournaments', tournamentId);
    const tournamentDoc = await getDoc(tournamentRef);
    const tournament = tournamentDoc.data();

    tournament.players = tournament.players.filter(id => id !== playerId);
    await updateDoc(tournamentRef, { players: tournament.players });

    return tournamentId;
  }

  static async generatePairings(tournamentId) {
    const tournamentRef = doc(db, 'tournaments', tournamentId);
    const tournamentDoc = await getDoc(tournamentRef);
    const tournament = tournamentDoc.data();

    // Incrementar a rodada atual
    const currentRound = tournament.currentRound + 1;

    if (currentRound > tournament.rounds) {
      throw new Error('O torneio já atingiu o número máximo de rodadas');
    }

    // Obter informações de todos os jogadores
    const playerIds = tournament.players;
    const players = [];

    for (const playerId of playerIds) {
      const playerDoc = await getDoc(doc(db, 'players', playerId));
      players.push({
        id: playerId,
        ...playerDoc.data(),
        score: 0,
        opponents: []
      });
    }

    // Calcular pontuação atual de cada jogador com base em resultados anteriores
    if (tournament.results && tournament.results.length > 0) {
      tournament.results.forEach(result => {
        const whitePlayer = players.find(p => p.id === result.white);
        const blackPlayer = players.find(p => p.id === result.black);

        if (whitePlayer && blackPlayer) {
          // Registrar oponentes
          whitePlayer.opponents.push(result.black);
          blackPlayer.opponents.push(result.white);

          // Atualizar pontuações
          if (result.result === '1-0') {
            whitePlayer.score += 1;
          } else if (result.result === '0-1') {
            blackPlayer.score += 1;
          } else if (result.result === '0.5-0.5') {
            whitePlayer.score += 0.5;
            blackPlayer.score += 0.5;
          }
        }
      });
    }

    // Ordenar jogadores por pontuação e depois por rating
    players.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.rating - a.rating;
    });

    // Algoritmo de emparelhamento suíço básico
    const pairings = [];
    const pairedPlayers = new Set();

    for (let i = 0; i < players.length; i++) {
      const player = players[i];

      if (pairedPlayers.has(player.id)) {
        continue;
      }

      // Encontrar o próximo jogador disponível com pontuação similar que ainda não enfrentou
      for (let j = i + 1; j < players.length; j++) {
        const opponent = players[j];

        if (!pairedPlayers.has(opponent.id) && !player.opponents.includes(opponent.id)) {
          pairings.push({
            white: player.id,
            black: opponent.id,
            result: null,
            round: currentRound
          });

          pairedPlayers.add(player.id);
          pairedPlayers.add(opponent.id);
          break;
        }
      }
    }

    // Se sobrar algum jogador, ele recebe bye (vitória sem jogar)
    for (const player of players) {
      if (!pairedPlayers.has(player.id)) {
        pairings.push({
          white: player.id,
          black: 'bye',
          result: '1-0',  // Vitória automática
          round: currentRound
        });
        pairedPlayers.add(player.id);
      }
    }

    // Atualizar o torneio com os novos emparelhamentos
    tournament.pairings = [...tournament.pairings || [], ...pairings];
    tournament.currentRound = currentRound;

    await updateDoc(tournamentRef, {
      pairings: tournament.pairings,
      currentRound: currentRound
    });

    return pairings.filter(p => p.round === currentRound);
  }

  static async updateResult(tournamentId, roundNumber, whiteId, blackId, result) {
    const tournamentRef = doc(db, 'tournaments', tournamentId);
    const tournamentDoc = await getDoc(tournamentRef);
    const tournament = tournamentDoc.data();

    // Encontrar o emparelhamento correspondente
    const pairingIndex = tournament.pairings.findIndex(p =>
      p.round === parseInt(roundNumber) &&
      p.white === whiteId &&
      p.black === blackId
    );

    if (pairingIndex === -1) {
      throw new Error('Emparelhamento não encontrado');
    }

    // Atualizar o resultado
    tournament.pairings[pairingIndex].result = result;

    // Atualizar a lista de resultados para facilitar cálculos
    const updatedResult = {
      white: whiteId,
      black: blackId,
      result: result,
      round: parseInt(roundNumber)
    };

    // Verificar se já existe este resultado
    const resultIndex = tournament.results ?
      tournament.results.findIndex(r =>
        r.round === parseInt(roundNumber) &&
        r.white === whiteId &&
        r.black === blackId
      ) : -1;

    if (resultIndex === -1) {
      if (!tournament.results) {
        tournament.results = [];
      }
      tournament.results.push(updatedResult);
    } else {
      tournament.results[resultIndex] = updatedResult;
    }

    await updateDoc(tournamentRef, {
      pairings: tournament.pairings,
      results: tournament.results
    });

    return updatedResult;
  }

  static async getStandings(tournamentId) {
    const tournament = await this.getById(tournamentId);
    if (!tournament) {
      return null;
    }

    // Obter informações de todos os jogadores
    const playerIds = tournament.players;
    const standings = [];

    for (const playerId of playerIds) {
      const playerDoc = await getDoc(doc(db, 'players', playerId));

      standings.push({
        id: playerId,
        name: playerDoc.data().name,
        rating: playerDoc.data().rating,
        score: 0,
        gamesPlayed: 0,
        opponents: []
      });
    }

    // Calcular pontuação para cada jogador
    if (tournament.results && tournament.results.length > 0) {
      tournament.results.forEach(result => {
        // Pontuação para o jogador de brancas
        const whitePlayer = standings.find(p => p.id === result.white);
        if (whitePlayer) {
          whitePlayer.gamesPlayed += 1;
          whitePlayer.opponents.push(result.black);

          if (result.result === '1-0') {
            whitePlayer.score += 1;
          } else if (result.result === '0.5-0.5') {
            whitePlayer.score += 0.5;
          }
        }

        // Pontuação para o jogador de negras (exceto bye)
        if (result.black !== 'bye') {
          const blackPlayer = standings.find(p => p.id === result.black);
          if (blackPlayer) {
            blackPlayer.gamesPlayed += 1;
            blackPlayer.opponents.push(result.white);

            if (result.result === '0-1') {
              blackPlayer.score += 1;
            } else if (result.result === '0.5-0.5') {
              blackPlayer.score += 0.5;
            }
          }
        }
      });
    }

    // Ordenar por pontuação e desempate por rating
    standings.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.rating - a.rating;
    });

    // Adicionar posição
    standings.forEach((player, index) => {
      player.position = index + 1;
    });

    return standings;
  }
}

module.exports = Tournament;