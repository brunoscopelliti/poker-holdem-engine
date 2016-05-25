
'use strict';

exports = module.exports = function promisify(func, context, ...args){
  return function() {
    return new Promise(function(res, rej) {
      try{
        res(func.apply(context, args));
      }
      catch(e){
        rej(e);
      }
    });
  };
}
