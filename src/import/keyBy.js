module.exports = (collection, iteratee) =>
  collection.reduce((p, c) => {
    const key = iteratee(c);
    if (typeof key !== "undefined" && key !== null) {
      p[key] = c;
    }
    return p;
  }, {});
