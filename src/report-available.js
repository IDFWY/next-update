require('lazy-ass');
var check = require('check-more-types');
require('console.json');
var verify = check.verify;
var print = require('./print-modules-table');
var stats = require('./stats');
var clc = require('cli-color');
var getSuccess = stats.getSuccessStats;
var q = require('q');

function ignore() {}

function report(available, currentVersions, options) {
    la(check.array(available), 'expect an array of info objects', available);

    if (!available.length) {
        console.log('nothing new is available');
        return;
    }
    // console.log('current versions');
    // console.json(currentVersions);
    la(check.maybe.object(currentVersions),
        'expected current versions object', currentVersions);

    var chain = q();
    var updateStats = {};

    available.forEach(function (info) {
        la(check.unemptyString(info.name), 'missing module name', info);
        la(check.array(info.versions), 'missing module versions', info);

        var currentVersion = currentVersions && currentVersions[info.name] || null;
        // console.log('version for', info.name, currentVersion)
        if (currentVersion) {
            la(check.unemptyString(currentVersion.version), 'missing version', currentVersion);
            updateStats[info.name] = {
                name: info.name,
                from: currentVersion.version
            };
        }

        if (info.versions.length === 1) {
            if (currentVersion) {
                chain = chain.then(function () {
                    return getSuccess({
                        name: info.name,
                        from: currentVersion.version,
                        to: info.versions[0]
                    }).then(function (stats) {
                        updateStats[info.name] = stats;
                    }).catch(ignore);
                });
            }
        }
    });

    return chain.then(function () {
        var modules = [];

        available.forEach(function (info) {
            verify.string(info.name, 'missing module name ' + info);
            verify.array(info.versions, 'missing module versions ' + info);

            var sep = ', ', versions;

            if (info.versions.length < 5) {
                versions = info.versions.join(sep);
            } else {
                versions = info.versions.slice(0, 2)
                    .concat('...')
                    .concat(info.versions.slice(info.versions.length - 2))
                    .join(sep);
            }

            var stats = updateStats[info.name];
            if (!stats) {
                return;
            }
            la(check.object(stats), 'could not get stats for', info.name,
                'all', updateStats, 'available stats', info);
            modules.push({
                name: info.name,
                version: versions,
                from: stats.from,
                stats: stats
            });
        });
        console.log('\navailable updates:');
        if (modules.length) {
            print(modules, options);
            console.log('update stats from', clc.underline(stats.url));
        } else {
            console.log(available);
            console.log('no stats is available yet for these updates');
        }
    });
}

module.exports = report;
