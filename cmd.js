#!/usr/bin/env node

process.argv.splice(1, 2, process.argv[2]);
var v8f = require('v8-flags-object-proxy')();
var argv = require('minimist')(
  process.argv
  .slice(1)
  .filter(Boolean)
);
var extend = require('extend-object');

extend(v8f, argv);

var fs = require('fs');
var path = require('path');
var Module = require('module');
var spawn = require('child_process').spawn;

var pack = require('./package.json');

var type = argv.type || argv.t;
var stackSize = argv.stackSize || argv.stacksize || argv.s;

function delegate() {
  return spawn('node', process.argv
    .slice(1)
    .filter(Boolean), {
    stdio: 'inherit',
    env: process.env,
    cwd: process.cwd()
  }) 
}

function prefixEval(letter) {
  argv[letter] = 'require("' + __dirname + '/")('+type+','+stackSize+');' + argv[letter];
  process.argv[process.argv.indexOf('-'+letter)+1] = argv[letter];
}

function evalArg(arg) {
  prefixEval(arg);
  delegate();
}

function version () {
  process.stdout.write('Cute: ' + pack.version);
  process.stdout.write('\nNode: ')
  delegate();
}
function help() {
  delegate();
  setTimeout(function () {
    console.log('\n=============================\n')
    fs.createReadStream('./usage.txt').pipe(process.stdout);  
  }, 100);
}

function unsupported(flag) {
  console.log('--' + flag + ' is currently unsupported. PR\'s welcome!');
}

function load() {
  require('./')(type, stackSize);
  process.argv[1] = require.resolve('./' + path.relative(process.cwd(), process.argv[1]));
  Module.runMain();
}

switch (true) {

  default: return load();

  case 
    !!
    argv.p: return evalArg('p');

  case 
    !!
    argv.e: return evalArg('e');

  case
    !!
    (argv.v || argv.version): return version();

  case
    !!
    (argv.help || argv.h): return help();

  case
    !!
    argv['no-deprecation']:
      return unsupported('no-deprecation');
  
  case 
    !!
    argv['trace-deprecation']: 
      return unsupported('trace-deprecation'); 

  case
    !!
    argv['max-stack-size']: 
      return unsupported('max-stack-size');

  case
    !!
    argv['enable-ssl2']: 
      return unsupported('enable-ssl2');

  case
    !!
    argv['enable-ssl3']: 
      return unsupported('enable-ssl3');

  case
    !!
    (argv.i || argv['v8-options'] || !argv._.length):
      return delegate();
}

