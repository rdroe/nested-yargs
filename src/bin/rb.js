#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var yargs_1 = __importDefault(require("yargs"));
var http = require('http');
var argv = yargs_1["default"]
    .usage('Usage: $0 <command> [options]')
    .command('hello', 'Prints an option (default "hello world"')
    .options({
    option: {
        alias: 'o',
        description: 'Option',
        "default": 'hello world'
    }
})
    .argv;
var call = function (snt) {
    var arg = snt.split(' ').join('-');
    console.log('requesting for sentence ', arg);
    var options = {
        hostname: 'localhost',
        port: 8080,
        path: "/brackets?snt=" + arg,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    console.log('sending req', options);
    var req = http.request(options, function (res) {
        console.log("statusCode: " + res.statusCode);
        res.on('data', function (d) {
            process.stdout.write(d);
        });
    });
    req.on('error', function (error) {
        console.error(error);
    });
    req.write('{}');
    req.end();
};
if (argv && argv.option) {
    call(argv.option);
}
//# sourceMappingURL=rb.js.map