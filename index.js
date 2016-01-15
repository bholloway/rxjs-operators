/*
 * MIT License http://opensource.org/licenses/MIT
 * Author: Ben Holloway @bholloway
 */

module.exports = {
  cold: {
    behaviorSubject  : require('cold/behavior-subject'),
    disposableSubject: require('cold/disposable-subject'),
    refCountSubject  : require('cold/ref-count-subject')
  }
};