var Jasmine      = require('jasmine'),
    SpecReporter = require('jasmine-spec-reporter'),
    figures      = require('figures');

var jasmine = new Jasmine();

jasmine.loadConfig({
  spec_dir  : '.',
  spec_files: [
    'operator/**/*.spec.js'
  ],
  helpers   : [
    'helpers/**/*.js'
  ]
});

jasmine.addReporter(new SpecReporter({
  displayStacktrace     : 'all',
  displayFailuresSummary: true,
  displayPendingSummary : true,
  displaySuccessfulSpec : true,
  displayFailedSpec     : true,
  displayPendingSpec    : true,
  displaySpecDuration   : true,
  displaySuiteNumber    : true,
  colors                : {
    success: 'green',
    failure: 'red',
    pending: 'yellow'
  },
  prefixes              : {
    success: figures.tick + ' ',
    failure: figures.cross + ' ',
    pending: figures.circleDotted + ' '
  },
  customProcessors      : []
}));

jasmine.execute();