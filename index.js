#!/usr/bin/node --unhandled-rejections=strict
// https://developers.notion.com/reference/

process.on('uncaughtException', (error) => {
  console.log('uncaughtException');
  console.error(error);
});

const fs = require('fs');
const readline = require('readline');
//const { Command } = require('commander');
//var _ = require('lodash');
//var { DateTime } = require('luxon');
//var Sugar = require('sugar');
//const { exec } = require("child_process");

const confdir = require('os').homedir() + "/.config/runnio-cli/"
const CONFIG_FILE = confdir + 'config.json';

const data = fs.readFileSync(CONFIG_FILE);
const config = JSON.parse(data);

const API_KEY = config.apikey;

const program = new Command();
program.version('0.0.1');

program
  .option('-d, --debug', 'debug')
  .option('--quiet', 'do not print output to command line')

// node index.js people --include_placeholders true|false --include_projects true|false --include_archived true|false --per_page X --page offset
// node index.js people --include_placeholders true|false --include_projects true|false --include_archived true|false --allpages
// node index.js people --format csv|json
program
  .command('people [id...]')
  .description('List of users')
  .option('-t, --template [file]', 'save properties of first result from output, suitable for template in using in create', 'template.json')
  .option('--exportdata <file>', 'save properties of first result from output, suitable for using with --data in "page --duplicate"')
  .option('--open', 'Open url(s) resulting from the calls via xdg-open')
  .action(async (id, options) => {
    runner(users, id, options)
  });

