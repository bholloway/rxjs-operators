/*
 * MIT License http://opensource.org/licenses/MIT
 * Author: Ben Holloway @bholloway
 */

module.exports = {
  utilty  : {
    subclassWith: require('./utility/subclass-with')
  },
  operator: {
    behavior    : require('./operator/behavior'),
    disposable  : require('./operator/disposable'),
    lifecycle   : require('./operator/lifecycle'),
    toObservable: require('./operator/to-observable')
  }
};