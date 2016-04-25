
'use strict';

//
// safeSum
exports.safeSum = function safeSum(a, b) {
  let res = (a * 100 + b * 100) / 100;
  return Number.parseFloat(res.toFixed(2));
};


//
// safeDiff
exports.safeDiff = function safeDiff(a, b) {
  let res = (a * 100 - b * 100) / 100;
  return Number.parseFloat(res.toFixed(2));
}


//
// safeRound
exports.safeRound = function safeRound(val) {
  return Number.isInteger(val) ? val : Math.round(val * 100) / 100;
}
