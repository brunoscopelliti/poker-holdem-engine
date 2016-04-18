
'use strict';

exports = module.exports = function get(obj, symb){
  return Object.getOwnPropertySymbols(obj)
    .find(x => x.toString() == `Symbol(${symb})`);
}
