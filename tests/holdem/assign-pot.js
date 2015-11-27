
'use strict';

const config = require('../../config');
const status = require('../../domain/player-status');
const createPlayer = require('../../holdem/player-factory');

const sut = require('../../holdem/assign-pot');

const tape = require('tape');
const chalk = require('chalk');
const sinon = require('sinon');

const isAllin = Symbol.for('allin');

tape('assign-pot', t => t.end());

tape('only one player at the showdown', function(t) {

  const gamestate = {
    pot: 100,
    players: [{ name: 'bud' }, { name: 'terence' }, { name: 'chuck' }, { name: 'silvester' }].map(createPlayer)
  };

  const winner = gamestate.players.slice(1,2); // terence
  winner[0].detail = {};
  const expectedChips = gamestate.pot + config.BUYIN;

  sut(gamestate, winner);

  t.equal(gamestate.pot, 0, 'pot is assigned');
  t.equal(gamestate.players[1].chips, expectedChips, 'winner received the chips from the pot');

  t.end();

});

tape('winner is not all-in, and there are not ex-equo', function(t) {

  const gamestate = {
    pot: 100,
    players: [{ name: 'bud' }, { name: 'terence' }, { name: 'chuck' }, { name: 'silvester' }].map(createPlayer)
  };

  const winner = gamestate.players.slice(1,4); // terence, chuck, silvester

  winner[0].detail = winner[1].detail = winner[2].detail = {};
  const expectedChips = gamestate.pot + config.BUYIN;

  sut(gamestate, winner);

  t.equal(gamestate.pot, 0, 'pot is assigned');
  t.equal(gamestate.players[1].chips, expectedChips, 'winner received the chips from the pot');

  t.end();

});

tape('winner is not all-in, and ex-equo dont change anything', function(t) {

  const gamestate = {
    pot: 100,
    players: [{ name: 'bud' }, { name: 'terence' }, { name: 'chuck' }, { name: 'silvester' }].map(createPlayer)
  };

  const winner = gamestate.players.slice(1,4); // terence, chuck, silvester

  winner[0].detail = {};
  winner[1].detail = winner[2].detail = { exequo: '#0'};
  const expectedChips = gamestate.pot + config.BUYIN;

  sut(gamestate, winner);

  t.equal(gamestate.pot, 0, 'pot is assigned');
  t.equal(gamestate.players[1].chips, expectedChips, 'winner received the chips from the pot');
  t.equal(gamestate.players[2].chips, config.BUYIN, 'nothing changes');
  t.equal(gamestate.players[3].chips, config.BUYIN, 'nothing changes');

  t.end();

});

tape('winner is all-in, second winner no', function(t) {

  const gamestate = {
    pot: 2600,
    players: [{ name: 'bud' }, { name: 'terence' }, { name: 'chuck' }, { name: 'silvester' }].map(createPlayer)
  };

  gamestate.players[0].chipsBet = 200;
  gamestate.players[1].chipsBet = 1000;
  gamestate.players[2].chipsBet = 600;
  gamestate.players[3].chipsBet = 800;

  const winner = gamestate.players.slice(0); // bud, terence, chuck, silvester

  winner[0].detail = winner[1].detail = winner[2].detail = winner[3].detail = {};
  winner[0][isAllin] = true;
  winner[2][isAllin] = true;
  winner[3][isAllin] = true;

  const mainPot = 800;
  const sidePot = 1800;

  sut(gamestate, winner);

  t.equal(gamestate.pot, 0, 'pot is assigned');
  t.equal(gamestate.players[0].chips, config.BUYIN + mainPot, 'winner received the chips from the pot');
  t.equal(gamestate.players[1].chips, config.BUYIN + sidePot, 'terence, as second player, wins the side pot');
  t.equal(gamestate.players[2].chips, config.BUYIN, 'chuck wins nothing');
  t.equal(gamestate.players[3].chips, config.BUYIN, 'silvester wins nothing');

  t.end();

});

tape('winner is all-in, some players folded', function(t) {

  const gamestate = {
    pot: 2000,
    players: [{ name: 'bud' }, { name: 'terence' }, { name: 'chuck' }, { name: 'silvester' }].map(createPlayer)
  };

  gamestate.players[0].chipsBet = 200;
  gamestate.players[1].chipsBet = 400;
  gamestate.players[0].status = gamestate.players[1].status = status.folded;
  gamestate.players[2].chipsBet = 600;
  gamestate.players[3].chipsBet = 800;

  const winner = gamestate.players.slice(2); // chuck, silvester

  winner[0].detail = winner[1].detail = {};
  winner[0][isAllin] = true;

  const mainPot = 1800;
  const back = 200;

  sut(gamestate, winner);

  t.equal(gamestate.pot, 0, 'pot is assigned');
  t.equal(gamestate.players[0].chips, config.BUYIN, 'bud folded');
  t.equal(gamestate.players[1].chips, config.BUYIN, 'terence folded');
  t.equal(gamestate.players[2].chips, config.BUYIN + mainPot, 'chuck wins the pot');
  t.equal(gamestate.players[3].chips, config.BUYIN + back, 'silvester receive back the extra amount');

  t.end();

});

tape('winner is all-in, some players folded (one bet more than the winner)', function(t) {

  const gamestate = {
    pot: 2800,
    players: [{ name: 'bud' }, { name: 'terence' }, { name: 'chuck' }, { name: 'silvester' }].map(createPlayer)
  };

  gamestate.players[0].chipsBet = 200;
  gamestate.players[1].chipsBet = 800;
  gamestate.players[0].status = gamestate.players[1].status = status.folded;
  gamestate.players[2].chipsBet = 600;
  gamestate.players[3].chipsBet = 1200;

  const winner = gamestate.players.slice(2); // chuck, silvester

  winner[0].detail = winner[1].detail = {};
  winner[0][isAllin] = true;

  const mainPot = 2000;
  const back = 800;

  sut(gamestate, winner);

  t.equal(gamestate.pot, 0, 'pot is assigned');
  t.equal(gamestate.players[0].chips, config.BUYIN, 'bud folded');
  t.equal(gamestate.players[1].chips, config.BUYIN, 'terence folded');
  t.equal(gamestate.players[2].chips, config.BUYIN + mainPot, 'chuck wins the pot');
  t.equal(gamestate.players[3].chips, config.BUYIN + back, 'silvester receive back the extra amount');

  t.end();

});

tape('all in all-in', function(t) {

  const gamestate = {
    pot: 2000,
    players: [{ name: 'bud' }, { name: 'terence' }, { name: 'chuck' }, { name: 'silvester' }].map(createPlayer)
  };

  gamestate.players[0].chipsBet = 200;
  gamestate.players[1].chipsBet = 400;
  gamestate.players[2].chipsBet = 600;
  gamestate.players[3].chipsBet = 800;

  const winner = gamestate.players.slice(0); // bud, terence, chuck, silvester

  winner[0].detail = winner[1].detail = winner[2].detail = winner[3].detail = {};
  winner[0][isAllin] = true;
  winner[1][isAllin] = true;
  winner[2][isAllin] = true;

  const mainPot = 800;
  const sidePot = 600;
  const sidePot2 = 400;
  const back = 200;

  sut(gamestate, winner);

  t.equal(gamestate.pot, 0, 'pot is assigned');
  t.equal(gamestate.players[0].chips, config.BUYIN + mainPot, 'winner received the chips from the pot');
  t.equal(gamestate.players[1].chips, config.BUYIN + sidePot, 'terence, as second player, wins the side pot');
  t.equal(gamestate.players[2].chips, config.BUYIN + sidePot2, 'chuck, as third player, wins the other side pot');
  t.equal(gamestate.players[3].chips, config.BUYIN + back, 'silvester receive back the extra amount');

  t.end();

});

tape('all in all-in, case two', function(t) {

  const gamestate = {
    pot: 2600,
    players: [{ name: 'bud' }, { name: 'terence' }, { name: 'chuck' }, { name: 'silvester' }].map(createPlayer)
  };

  gamestate.players[0].chipsBet = 200;
  gamestate.players[1].chipsBet = 800;
  gamestate.players[2].chipsBet = 600;
  gamestate.players[3].chipsBet = 1000;

  const winner = gamestate.players.slice(0); // bud, terence, chuck, silvester

  winner[0].detail = winner[1].detail = winner[2].detail = winner[3].detail = {};
  winner[0][isAllin] = true;
  winner[1][isAllin] = true;
  winner[2][isAllin] = true;

  const mainPot = 800;
  const sidePot = 1200;
  const sidePot2 = 400;
  const back = 200;

  sut(gamestate, winner);

  t.equal(gamestate.pot, 0, 'pot is assigned');
  t.equal(gamestate.players[0].chips, config.BUYIN + mainPot, 'winner received the chips from the pot');
  t.equal(gamestate.players[1].chips, config.BUYIN + sidePot + sidePot2, 'terence, as second player, wins the side pot');
  t.equal(gamestate.players[2].chips, config.BUYIN, 'chuck wins nothing');
  t.equal(gamestate.players[3].chips, config.BUYIN + back, 'silvester receive back the extra amount');

  t.end();

});







tape('ex-equo winners', function(t) {

  const gamestate = {
    pot: 100,
    players: [{ name: 'bud' }, { name: 'terence' }, { name: 'chuck' }, { name: 'silvester' }].map(createPlayer)
  };

  const winner = gamestate.players.slice(1,4); // terence, chuck, silvester

  winner[0].detail = winner[1].detail = { exequo: '#0' };
  const expectedChips = gamestate.pot/2 + config.BUYIN;

  sut(gamestate, winner);

  t.equal(gamestate.pot, 0, 'pot is assigned');
  t.equal(gamestate.players[1].chips, expectedChips, 'terence wins half pot');
  t.equal(gamestate.players[2].chips, expectedChips, 'chuck wins half pot');

  t.end();

});

tape('three ex-equo winners', function(t) {

  const gamestate = {
    pot: 100,
    players: [{ name: 'bud' }, { name: 'terence' }, { name: 'chuck' }, { name: 'silvester' }].map(createPlayer)
  };

  const winner = gamestate.players.slice(1,4); // terence, chuck, silvester

  winner[0].detail = winner[1].detail = winner[2].detail = { exequo: '#0' };
  const expectedChips = gamestate.pot/3 + config.BUYIN;

  sut(gamestate, winner);

  t.equal(gamestate.pot, 0, 'pot is assigned');
  t.equal(gamestate.players[1].chips, expectedChips, 'terence wins part of the pot');
  t.equal(gamestate.players[2].chips, expectedChips, 'chuck wins part of the pot');
  t.equal(gamestate.players[3].chips, expectedChips, 'silvester wins part of the pot');

  t.end();

});

tape('winner is all-in, exequo seconds', function(t) {

  const gamestate = {
    pot: 2000,
    players: [{ name: 'bud' }, { name: 'terence' }, { name: 'chuck' }, { name: 'silvester' }].map(createPlayer)
  };

  gamestate.players[0].chipsBet = 200;
  gamestate.players[1].chipsBet = 600;
  gamestate.players[2].chipsBet = 600;
  gamestate.players[3].chipsBet = 600;

  const winner = gamestate.players.slice(0); // bud, terence, chuck, silvester

  winner[0].detail = winner[3].detail = {};
  winner[1].detail = winner[2].detail = { exequo: '#0' }
  winner[0][isAllin] = true;

  const mainPot = 800;
  const halfSidePot = 600;

  sut(gamestate, winner);

  t.equal(gamestate.pot, 0, 'pot is assigned');
  t.equal(gamestate.players[0].chips, config.BUYIN + mainPot, 'winner received the chips from the pot');
  t.equal(gamestate.players[1].chips, config.BUYIN + halfSidePot, 'terence and chuck win half sidepot');
  t.equal(gamestate.players[2].chips, config.BUYIN + halfSidePot, 'terence and chuck win half sidepot');
  t.equal(gamestate.players[3].chips, config.BUYIN, 'silvester wins nothing');

  t.end();

});

tape('winner is all-in, one of the exequo seconds too', function(t) {

  const gamestate = {
    pot: 3300,
    players: [{ name: 'bud' }, { name: 'terence' }, { name: 'chuck' }, { name: 'silvester' }].map(createPlayer)
  };

  gamestate.players[0].chipsBet = 200;
  gamestate.players[1].chipsBet = 600;
  gamestate.players[2].chipsBet = 1000;
  gamestate.players[3].chipsBet = 1500;

  const winner = gamestate.players.slice(0); // bud, terence, chuck, silvester

  winner[0].detail = winner[3].detail = {};
  winner[1].detail = winner[2].detail = { exequo: '#0' };
  winner[0][isAllin] = true;

  const mainPot = 800;
  const commonPot = 1200;
  const chuckWin = 800;
  const back = 500;

  sut(gamestate, winner);

  t.equal(gamestate.pot, 0, 'pot is assigned');
  t.equal(gamestate.players[0].chips, config.BUYIN + mainPot, 'winner received the chips from the pot');
  t.equal(gamestate.players[1].chips, config.BUYIN + commonPot/2, 'terence divide part of the pot with chuck');
  t.equal(gamestate.players[2].chips, config.BUYIN + chuckWin + commonPot/2, 'chuck divide with terence, and win more from silvester');
  t.equal(gamestate.players[3].chips, config.BUYIN + back, 'silvester has back the extra chips');

  t.end();

});
