var colors = require('cli-color');
var check = require('check-types');
var _ = require('lodash');

var colorAvailable = process.stdout.isTTY;

function report(updates, useColors) {
    check.verifyArray(updates, 'expected array of updates');

    console.log('next updates:');
    updates.forEach(function (moduleVersions) {
        reportModule(moduleVersions, useColors);
    });
}

function reportModule(moduleVersions, useColors) {
    check.verifyArray(moduleVersions, 'expected module / versions array');
    if (!moduleVersions.length) {
        return;
    }
    useColors = !!useColors && colorAvailable;
    var name = moduleVersions[0].name;
    check.verifyString(name, 'missing module name from ' + JSON.stringify(moduleVersions));
    if (useColors) {
        var colorVersions = moduleVersions.map(function (info, index) {
            return (info.works ? colors.greenBright : colors.redBright)(info.version);
        })
        var str = colorVersions.join(', ');
        console.log(name + ' ' + str);
    } else {
        console.log(name);
        moduleVersions.forEach(function (info) {
            console.log('  ' + info.version + ' ' + (info.works ? 'PASS' : 'FAIL'));
        });
    }
}

function reportSuccess(text) {
    if (colorAvailable) {
        console.log(colors.greenBright(text));
    } else {
        console.log('PASS', text);
    }
}

function reportFailure(text) {
    if (colorAvailable) {
        console.log(colors.redBright(text));
    } else {
        console.log('FAIL', text);
    }
}

module.exports = {
    report: report,
    reportSuccess: reportSuccess,
    reportFailure: reportFailure
};