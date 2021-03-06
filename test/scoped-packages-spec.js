'use strict'

var la = require('lazy-ass')
var is = require('check-more-types')
var pause = 30 * 1000
var chdir = require('chdir-promise')
var join = require('path').join
var testFolder = join(__dirname, 'test-scoped-names')

/* global describe, it */
describe('scoped packages', function () {
  var nextUpdate = require('../src/next-update')

  it('is an object', function () {
    la(is.object(nextUpdate))
  })

  it('has available method', function () {
    la(is.fn(nextUpdate.available))
  })

  it('handles scoped package names', function () {
    this.timeout(pause)
    return chdir
      .to(testFolder)
      .then(function () {
        return nextUpdate.available('@bahmutov/csv@1.1.0')
      })
      .then(function (available) {
        la(is.array(available), 'returns an array', available)
        la(is.not.empty(available), 'there should be a new version', available)
        var first = available[0]
        la(first.name === '@bahmutov/csv', 'wrong name', first)
        var versions = first.versions
        la(is.array(versions), 'expected list of new versions', first)
        la(versions[0] === '1.2.0', 'first available version', versions)
      })
      .then(chdir.back)
  })
})
