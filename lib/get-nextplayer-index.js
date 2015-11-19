
'use strict';

exports = module.exports = function getNextPlayerIndex(currentPlayerIndex, playersNumber){

  let next = currentPlayerIndex + 1;

  if (currentPlayerIndex >= playersNumber-1){
    return next % playersNumber;
  }

  return next;

}
