/**
 * @name formatPoint
 * @param {Object} point
 * @return {String}
 */
const formatPoint =
  (point) => {
    return `${point.name} of ${point.rank}`;
  };

module.exports = formatPoint;
