
'use strict';

//
// safeSum
exports.safeSum = (a, b) => {
  let res = (a * 100 + b * 100) / 100;
  return Number.parseFloat(res.toFixed(2));
};


//
// safeDiff
exports.safeDiff = (a, b) => {
  let res = (a * 100 - b * 100) / 100;
  return Number.parseFloat(res.toFixed(2));
}
