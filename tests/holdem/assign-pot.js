
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

  gamestate.players[0].detail = {};

  const winner = gamestate.players.slice(1,2); // terence

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

  gamestate.players[0].status = status.folded;
  gamestate.players[0].detail = gamestate.players[1].detail = gamestate.players[2].detail = {};

  const winner = gamestate.players.filter(p => p.status == status.active);

  const expectedChips = gamestate.pot + config.BUYIN;

  sut(gamestate, winner);

  t.equal(gamestate.pot, 0, 'pot is assigned');
  t.equal(gamestate.players[1].chips, expectedChips, 'winner received the chips from the pot');

  t.end();

});

tape('winner is not all-in, and ex-equo dont change anything', function(t) {

  const gamestate = {
    pot: 140,
    players: [{ name: 'bud' }, { name: 'terence' }, { name: 'chuck' }, { name: 'silvester' }].map(createPlayer)
  };

  gamestate.players[0].status = status.folded;

  gamestate.players[0].chipsBet = 20;
  gamestate.players[1].chipsBet = 40;
  gamestate.players[2].chipsBet = 40;
  gamestate.players[2].chipsBet = 40;

  gamestate.players[0].detail = gamestate.players[1].detail = {};
  gamestate.players[2].detail = gamestate.players[3].detail = { exequo: '#0'};

  const winner = gamestate.players.filter(p => p.status == status.active);

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

  gamestate.players[0].detail = gamestate.players[1].detail = gamestate.players[2].detail = gamestate.players[3].detail = {};
  gamestate.players[0][isAllin] = gamestate.players[2][isAllin] = gamestate.players[3][isAllin] = true;

  const winner = gamestate.players.filter(p => p.status == status.active);

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

  gamestate.players[0].status = gamestate.players[1].status = status.folded;

  gamestate.players[0].chipsBet = 200;
  gamestate.players[1].chipsBet = 400;
  gamestate.players[2].chipsBet = 600;
  gamestate.players[3].chipsBet = 800;

  gamestate.players[0].detail = gamestate.players[1].detail = gamestate.players[2].detail = gamestate.players[3].detail = {};
  gamestate.players[2][isAllin] = true;

  const winner = gamestate.players.filter(p => p.status == status.active);

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

  gamestate.players[0].status = gamestate.players[1].status = status.folded;

  gamestate.players[0].chipsBet = 200;
  gamestate.players[1].chipsBet = 800;
  gamestate.players[2].chipsBet = 600;
  gamestate.players[3].chipsBet = 1200;

  gamestate.players[0].detail = gamestate.players[1].detail = gamestate.players[2].detail = gamestate.players[3].detail = {};
  gamestate.players[2][isAllin] = true;

  const winner = gamestate.players.filter(p => p.status == status.active);

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

  gamestate.players[0].detail = gamestate.players[1].detail = gamestate.players[2].detail = gamestate.players[3].detail = {};
  gamestate.players[0][isAllin] = gamestate.players[1][isAllin] = gamestate.players[2][isAllin] = gamestate.players[3][isAllin] = true;

  const winner = gamestate.players.filter(p => p.status == status.active);

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

  gamestate.players[0].detail = gamestate.players[1].detail = gamestate.players[2].detail = gamestate.players[3].detail = {};
  gamestate.players[0][isAllin] = gamestate.players[1][isAllin] = gamestate.players[2][isAllin] = gamestate.players[3][isAllin] = true;

  const winner = gamestate.players.filter(p => p.status == status.active);

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

  gamestate.players[0].status = gamestate.players[3].status = status.folded;

  gamestate.players[0].chipsBet = 20;
  gamestate.players[1].chipsBet = 30;
  gamestate.players[2].chipsBet = 30;
  gamestate.players[3].chipsBet = 20;

  gamestate.players[0].detail = gamestate.players[3].detail = {};
  gamestate.players[1].detail = gamestate.players[2].detail = { exequo: '#0' };

  const winner = gamestate.players.filter(p => p.status == status.active);

  const expectedChips = gamestate.pot/2 + config.BUYIN;

  sut(gamestate, winner);

  t.equal(gamestate.pot, 0, 'pot is assigned');
  t.equal(gamestate.players[0].chips, config.BUYIN, 'bud wins nothing');
  t.equal(gamestate.players[1].chips, expectedChips, 'terence wins half pot');
  t.equal(gamestate.players[2].chips, expectedChips, 'chuck wins half pot');
  t.equal(gamestate.players[3].chips, config.BUYIN, 'silvester wins nothing');

  t.end();

});

tape('three ex-equo winners', function(t) {

  const gamestate = {
    pot: 210,
    players: [{ name: 'bud' }, { name: 'terence' }, { name: 'chuck' }, { name: 'silvester' }].map(createPlayer)
  };

  gamestate.players[0].status = status.folded;
  gamestate.players[0].chipsBet = 30;
  gamestate.players[1].chipsBet = 60;
  gamestate.players[2].chipsBet = 60;
  gamestate.players[3].chipsBet = 60;

  gamestate.players[0].detail = {};
  gamestate.players[1].detail = gamestate.players[2].detail = gamestate.players[3].detail = { exequo: '#0' };

  const winner = gamestate.players.filter(p => p.status == status.active);

  const expectedChips = gamestate.pot/3 + config.BUYIN;

  sut(gamestate, winner);

  t.equal(gamestate.pot, 0, 'pot is assigned');
  t.equal(gamestate.players[0].chips, config.BUYIN, 'bud wins nothing');
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

  gamestate.players[0].detail = gamestate.players[3].detail = {};
  gamestate.players[1].detail = gamestate.players[2].detail = { exequo: '#0' }

  gamestate.players[0][isAllin] = true;

  const winner = gamestate.players.filter(p => p.status == status.active);

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
    pot: 2800,
    players: [{ name: 'bud' }, { name: 'terence' }, { name: 'chuck' }, { name: 'silvester' }].map(createPlayer)
  };

  gamestate.players[0].chipsBet = 200;
  gamestate.players[1].chipsBet = 600;
  gamestate.players[2].chipsBet = 1000;
  gamestate.players[3].chipsBet = 1000;

  gamestate.players[0].detail = gamestate.players[3].detail = {};
  gamestate.players[1].detail = gamestate.players[2].detail = { exequo: '#0' };

  gamestate.players[0][isAllin] = gamestate.players[1][isAllin] = true;

  const winner = gamestate.players.filter(p => p.status == status.active);

  const mainPot = 800;
  const commonPot = 1200;
  const chuckWin = 800;

  sut(gamestate, winner);

  t.equal(gamestate.pot, 0, 'pot is assigned');
  t.equal(gamestate.players[0].chips, config.BUYIN + mainPot, 'winner received the chips from the pot');
  t.equal(gamestate.players[1].chips, config.BUYIN + commonPot/2, 'terence divide part of the pot with chuck');
  t.equal(gamestate.players[2].chips, config.BUYIN + chuckWin + commonPot/2, 'chuck divide with terence, and win more from silvester');
  t.equal(gamestate.players[3].chips, config.BUYIN, 'silvester wins nothing');

  t.end();

});

tape('winner is all-in, two exequo all-in seconds, third wins', function(t) {

  const gamestate = {
    pot: 5550,
    players: [{ name: 'bud' }, { name: 'terence' }, { name: 'chuck' }, { name: 'silvester' }, { name: 'jean-claude' }].map(createPlayer)
  };

  gamestate.players[0].chipsBet = 700;
  gamestate.players[1].chipsBet = 200;
  gamestate.players[2].chipsBet = 750;
  gamestate.players[3].chipsBet = 1800;
  gamestate.players[4].chipsBet = 2100;

  gamestate.players[0].detail = gamestate.players[3].detail = gamestate.players[4].detail = {};
  gamestate.players[1].detail = gamestate.players[2].detail = { exequo: '#0' };

  gamestate.players[0][isAllin] = gamestate.players[1][isAllin] = gamestate.players[2][isAllin] = gamestate.players[3][isAllin] = true;

  const winner = gamestate.players.filter(p => p.status == status.active);

  const mainPot = 3000;
  const commonPot = 150;
  const sidePot = 2100;
  const back = 300;

  sut(gamestate, winner);

  t.equal(gamestate.pot, 0, 'pot is assigned');
  t.equal(gamestate.players[0].chips, config.BUYIN + mainPot, 'winner received the chips from the pot');
  t.equal(gamestate.players[1].chips, config.BUYIN, 'terence wins nothing, cause he bet to few');
  t.equal(gamestate.players[2].chips, config.BUYIN + commonPot, 'chuck wins something');
  t.equal(gamestate.players[3].chips, config.BUYIN + sidePot, 'silvester wins the sidepot');
  t.equal(gamestate.players[4].chips, config.BUYIN + back, 'jean-claude has back the extra chips');

  t.end();

});

tape('winner is all-in, all is in exequo', function(t) {

  const gamestate = {
    pot: 4570,
    players: [{ name: 'bud' }, { name: 'terence' }, { name: 'chuck' }, { name: 'silvester' }, { name: 'jean-claude' }].map(createPlayer)
  };

  gamestate.players[0].chipsBet = 660;
  gamestate.players[1].chipsBet = 320;
  gamestate.players[2].chipsBet = 720;
  gamestate.players[3].chipsBet = 1980;
  gamestate.players[4].chipsBet = 890;

  gamestate.players[0].detail = gamestate.players[1].detail = gamestate.players[2].detail = gamestate.players[3].detail = gamestate.players[4].detail = { exequo: '#0' };
  gamestate.players[0][isAllin] = gamestate.players[1][isAllin] = gamestate.players[2][isAllin] = gamestate.players[3][isAllin] = true;

  const winner = gamestate.players.filter(p => p.status == status.active);

  const mainPot = 1600;
  const sidePot = 1360;
  const sidePot2 = 180;
  const sidePot3 = 340;
  const back = 1090;

  sut(gamestate, winner);

  t.equal(gamestate.pot, 0, 'pot is assigned');
  t.equal(gamestate.players[0].chips, config.BUYIN + mainPot/5 + sidePot/4, 'bud receives a part of the pot');
  t.equal(gamestate.players[1].chips, config.BUYIN + mainPot/5, 'terence receives a part of the pot');
  t.equal(gamestate.players[2].chips, config.BUYIN + mainPot/5 + sidePot/4 + sidePot2/3, 'chuck receives a part of the pot');
  t.equal(gamestate.players[3].chips, config.BUYIN + mainPot/5 + sidePot/4 + sidePot2/3 + sidePot3/2 + back, 'silvester receives a part of the pot');
  t.equal(gamestate.players[4].chips, config.BUYIN + mainPot/5 + sidePot/4 + sidePot2/3 + sidePot3/2, 'jean-claude receives a part of the pot');

  t.end();

});

tape('winner is all-in, pair of exequos', function(t) {

  const gamestate = {
    pot: 10000,
    players: [{ name: 'bud' }, { name: 'terence' }, { name: 'chuck' }, { name: 'silvester' }, { name: 'jean-claude' }].map(createPlayer)
  };

  gamestate.players[0].chipsBet = 400;
  gamestate.players[1].chipsBet = 600;
  gamestate.players[2].chipsBet = 1400;
  gamestate.players[3].chipsBet = 3800;
  gamestate.players[4].chipsBet = 3800;

  gamestate.players[0].detail = {};
  gamestate.players[1].detail = gamestate.players[2].detail = { exequo: '#0' };
  gamestate.players[3].detail = gamestate.players[4].detail = { exequo: '#1' }

  gamestate.players[0][isAllin] = gamestate.players[1][isAllin] = gamestate.players[2][isAllin] = true;

  const winner = gamestate.players.filter(p => p.status == status.active);

  const mainPot = 2000;
  const sidePot = 800;
  const sidePot2 = 2400;
  const sidePot3 = 4800;

  sut(gamestate, winner);

  t.equal(gamestate.pot, 0, 'pot is assigned');
  t.equal(gamestate.players[0].chips, config.BUYIN + mainPot, 'bud receives the main pot');
  t.equal(gamestate.players[1].chips, config.BUYIN + sidePot/2, 'terence splits with chuck sidePot');
  t.equal(gamestate.players[2].chips, config.BUYIN + sidePot/2 + sidePot2, 'chuck splits with terence sidePot, but takes all sidePot2');
  t.equal(gamestate.players[3].chips, config.BUYIN + sidePot3/2, 'silvester splits with jean-claude sidePot3');
  t.equal(gamestate.players[4].chips, config.BUYIN + sidePot3/2, 'jean-claude splits with silvester sidePot3');

  t.end();

});

tape('ex-equo winners, easy shit numbers', function(t) {

  const gamestate = {
    pot: 305,
    players: [{ name: 'bud' }, { name: 'terence' }, { name: 'chuck' }, { name: 'silvester' }].map(createPlayer)
  };

  gamestate.players[0].status = gamestate.players[3].status = status.folded;

  gamestate.players[0].chipsBet = 75;
  gamestate.players[1].chipsBet = 100;
  gamestate.players[2].chipsBet = 100;
  gamestate.players[3].chipsBet = 30;

  gamestate.players[0].detail = gamestate.players[3].detail = {};
  gamestate.players[1].detail = gamestate.players[2].detail = { exequo: '#0' };

  const winner = gamestate.players.filter(p => p.status == status.active);

  const expectedChips = gamestate.pot/2 + config.BUYIN;

  sut(gamestate, winner);

  t.equal(gamestate.pot, 0, 'pot is assigned');
  t.equal(gamestate.players[0].chips, config.BUYIN, 'bud wins nothing');
  t.equal(gamestate.players[1].chips, expectedChips, 'terence wins half pot');
  t.equal(gamestate.players[2].chips, expectedChips, 'chuck wins half pot');
  t.equal(gamestate.players[3].chips, config.BUYIN, 'silvester wins nothing');

  t.end();

});

tape('three ex-equo winners, shit numbers', function(t) {

  const gamestate = {
    pot: 215,
    players: [{ name: 'bud' }, { name: 'terence' }, { name: 'chuck' }, { name: 'silvester' }].map(createPlayer)
  };

  gamestate.players[0].chipsBet = 60;
  gamestate.players[1].chipsBet = 60;
  gamestate.players[2].chipsBet = 60;
  gamestate.players[3].chipsBet = 35;

  gamestate.players[0].detail = gamestate.players[1].detail = gamestate.players[2].detail = { exequo: '#0' };
  gamestate.players[3][isAllin] = true;
  gamestate.players[3].detail = {};

  const winner = gamestate.players.filter(p => p.status == status.active);

  const expectedChips = Number.parseFloat((gamestate.pot/3).toFixed(2))+ config.BUYIN;

  sut(gamestate, winner);

  t.ok(Math.abs(gamestate.pot)-0.01 < 0.009, 'pot is assigned');
  t.equal(gamestate.players[0].chips, expectedChips, 'bud wins part of the pot');
  t.equal(gamestate.players[1].chips, expectedChips, 'terence wins part of the pot');
  t.equal(gamestate.players[2].chips, expectedChips, 'chuck wins part of the pot');
  t.equal(gamestate.players[3].chips, config.BUYIN, 'silvester wins nothing');

  t.end();

});
