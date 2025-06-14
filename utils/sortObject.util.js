function sortObject(obj) {
  let sorted = {};
  let keys = Object.keys(obj);
  keys.sort();
  keys.forEach((key) => {
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
  });
  return sorted;
}

module.exports = { sortObject };