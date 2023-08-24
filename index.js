#!/usr/bin/node --unhandled-rejections=strict
// https://developers.notion.com/reference/
const people = require('./people');
const projects = require('./projects');
const actuals = require('./actual');


process.on('uncaughtException', (error) => {
  console.log('uncaughtException');
  console.error(error);
});
// const axios = require('axios');

const fs = require('fs');
const { get } = require('lodash');
const readline = require('readline');
const { Command } = require('commander');
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
  .option('--apikey <string>', '')
  .option('--keyfile <file>', '')
  .option('--csv', 'Output as CSV')

program
  .command('people [id...]')
  .description('List of people. Access to GET /v0/people and GET /v0/people/id')
  .option('--include_placeholders', 'Include placeholders', false)
  .option('--include_projects', 'Include active projects person has assignments on.', false)
  .option('--no_include_archived', 'Default value : false', false)
  .option('--per_page <number>', 'Number of items to return per page. Maximum value: 200. Default: 200', 200)
  .option('--page <offset>', 'Page offset to fetch. Default value : 1', 1)
  .option('--allpages', 'Fetch all pages.', false)
  .option('--include_assignments', 'Include assignments. Only works if id is speccified.', false)
  .option('--include_actuals', 'Include actuals. Only works if id is speccified.', false)
  .option('--start <string>', 'Include only Assignments + Actuals on or after date (YYYY-MM-DD)')
  .option('--end  <string>', 'Include only Assignments + Actuals on or before date (YYYY-MM-DD)')
  .action(async (id, options) => {
    runner(people, id, options)
  });

  program
    .command('projects [id...]')
    .description('List of projects. Access to GET /v0/projects and GET /v0/projects/id')
    .option('--no_include_archived', 'Default value : false', false)
    .option('--per_page <number>', 'Number of items to return per page. Maximum value: 200. Default: 200', 200)
    .option('--page <offset>', 'Page offset to fetch. Default value : 1', 1)
    .option('--allpages', 'Fetch all pages.', false)
    .option('--include_assignments', 'Include assignments. Only works if id is speccified.', false)
    .option('--include_actuals', 'Include actuals. Only works if id is speccified.', false)
    .option('--start <string>', 'Include only Assignments + Actuals on or after date (YYYY-MM-DD)')
    .option('--end <string>', 'Include only Assignments + Actuals on or before date (YYYY-MM-DD)')
    .action(async (id, options) => {
      runner(projects, id, options)
    });
  
  program
    .command('actuals [id...]')
    .description('List of actuals. Access to GET /v0/actuals and GET /v0/actuals/id')
    .option('--per_page <number>', 'Number of items to return per page. Maximum value: 200. Default: 200', 200)
    .option('--page <offset>', 'Page offset to fetch. Default value: 1', 0)
    .option('--allpages', 'Fetch all pages.', false)
    .requiredOption('--start <string>', 'Include only actuals on or after date (YYYY-MM-DD)')
    .option('--end <string>', 'Include only actuals on or before date (YYYY-MM-DD)')
    .action(async (id, options) => {
      runner(actuals, id, options)
    });
  



program.parse(process.argv);

// actuals
// time_entry
/*
node index.js assignments --get
node index.js assignments --post
node index.js assignments --delete
node index.js assignments --post --project_id string --person_id string --role_id string --start_date string($date) --end_date string($date) --minutes_per_day integer($int32)
node index.js assignments --post --project_id string --person_id string --role_id string --start_date string($date) --end_date string($date) --totaldays integer($int32)

function assignments() {

let minutes_per_day = 0
if (option.minutes_per_day && options.totaldays) {
console.log("Warning: minutes_per_day and totaldays will be added")
}
if (opption.minutes_per_day) {
minutes_per_day = opption.minutes_per_day
}
if (options.totaldays) {
const durationInWorkingDays = numberOfWorkingDaysBetween(options.start_date, options.end_date)
const fractionPerWorkingDay = options.totaldays / durationInWorkingDays
minutes_per_day = minutes_per_day + fractionPerWorkingDay * 7.5 * 60
};

*/
/*
  program
   .command('report')
      option: --lastweek Provides total hours for each user in the last week.
      option: --project 
  crontab: every monday morning: Send email to uses who have not completed timesheet.
  crontab: every wednesday morning: Send email to Claire/Ruthie, with list of uses who have not completed timesheet.
      */

async function runner(fn, id, options) {
  try {
    const data = await fn(id, options);
    console.log(data.length);
  }
  catch (error) {
    console.error(error);
  }
}

