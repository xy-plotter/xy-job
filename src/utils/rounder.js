// From lodash createRound function
const rounder = (precision = 2) => (number = 0) => {
  let pair = (number + 'e').split('e')
  let value = Math.round(pair[0] + 'e' + (+pair[1] + precision))
  pair = (value + 'e').split('e')
  return +(pair[0] + 'e' + (+pair[1] - precision))
}
export default rounder
