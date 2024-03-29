#!/usr/bin/node --unhandled-rejections=strict
// https://developers.notion.com/reference/
const people = require('./people');
const projects = require('./projects');
const assignments = require('./assignments');
const actuals = require('./actuals');
const report = require('./report');
const projection = require('./projection');
const teams = require('./teams');
const cronFunction = require('./cronFunction');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


process.on('uncaughtException', (error) => {
  console.log('uncaughtException');
  console.error(error);
});

const fs = require('fs');
const { get } = require('lodash');
const readline = require('readline');
const { Command } = require('commander');

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
  .option('--config <file>', 'Provide config file which contains api key')
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
  .option('--value', 'Get value of project by id')
  .option('--byteam <string>', 'Get value of projects by team id')
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

program
  .command('assignments [id...]')
  .option('--get', 'Get assignments')
  .option('--post', 'Post assignments')
  .option('--delete', 'Delete assignments')
  .option('--allpages', 'Fetch all pages.', false)
  .option('--page <offset>', 'Page offset to fetch. Default value: 1', 0)
  .option('--project_id <projectId>', 'Identifier for the project')
  .option('--person_id <personId>', 'Identifier for the person or team member')
  .option('--role_id <roleId>', 'Identifier for the role')
  .option('--start_date <startDate>', 'Starting date of the task or project phase')
  .option('--end_date <endDate>', 'Ending date of the task or project phase')
  .option('--minutes_per_day <minutesPerDay>', 'Number of minutes allocated per day', 0)
  .option('--totaldays <totaldays>', 'Number of days allocated for the task or project phase', 0)
  .option('--is-billable <isBillable>', 'Indicates if task is billable', /^(true|false)$/i, true)
  .option('--note <note>', 'Additional notes or comments')
  .option('--phase_id <phaseId>', 'Identifier for a specific phase')
  .option('--non_working_day', 'Set to true for non-working day', /^(true|false)$/i, false)
  .action(async (id, options) => {
    runner(assignments, id, options)
  });

program
  .command('report [id...]')
  .option('--sendwarning', 'Send warning email to people who have not filled their timesheet')
  .option('--reportManager', 'Send report to manager')
  .action(async (id, options) => {
    runner(report, id, options)
  });

program
  .command('projection [id...]')
  .option('--byteam', 'Projection by team')
  .option('--start <string>', 'Include only Assignments + Actuals on or after date (YYYY-MM-DD)')
  .option('--end <string>', 'Include only Assignments + Actuals on or before date (YYYY-MM-DD)')
  .option('--months <number>', 'Number of months to project', 3)
  .action(async (id, options) => {
    runner(projection, id, options)
  });

program
 .command('teams [id...]')
 .description('List of teams. Access to GET /v0/teams and GET /v0/teams/id')
 .action(async (id, options) => {
    runner(teams, id, options)
  });


program
  .command('cron')
  .action(async (id, options) => {
    runner(cronFunction, id, options)
  });




const globaloptions = program.opts();
program.parse(process.argv);
if (globaloptions.debug) console.log("arguments=" + JSON.stringify({
  globaloptions: globaloptions
}, null, 2))

async function runner(fn, id, options) {

  try {
    const CONF = globaloptions.configfile ? globaloptions.configfile : CONFIG_FILE;
    if (!fs.existsSync(CONF)) {
      console.error('No config file found at', CONF);
      throw error;
    }
    const configData = await fs.promises.readFile(CONF, 'utf8');
    const config = JSON.parse(configData);
  } catch (error) {
    console.error('An error occurred in reading the config:', error);
    throw error;
  }

  try {
    const data = await fn(id, options, config);
    console.log("data :", data);
    //print data in file.json 
    fs.writeFileSync('file.json', JSON.stringify(data, null, 2));

    // console.log("assignements :", data[0].assignments);

    if (globaloptions.csv) {


      let csvWriter = null;
      let stringifiedData = data;
      if (fn.name == "report") {
        csvWriter = createCsvWriter({
          path: `${fn.name}.csv`,
          header: [
            { id: 'name', title: 'Name' },
            { id: 'hours', title: 'hours' }
          ]
        });

        const records = [];
        for (const name in data) {
          records.push({ name, hours: data[name] });
        }
        stringifiedData = records
      }
      else {

        csvWriter = createCsvWriter({
          path: `${fn.name}.csv`,
          header: Object.keys(data[0]).map(key => ({ id: key, title: key }))
        });
        stringifiedData = data.map(obj => {
          const stringifiedObj = {};
          for (const key in obj) {
            if (typeof obj[key] === 'object') {
              stringifiedObj[key] = JSON.stringify(obj[key]);
            } else {
              stringifiedObj[key] = obj[key];
            }
          }
          return stringifiedObj;
        });
      }

      csvWriter
        .writeRecords(stringifiedData)
        .then(() => console.log('CSV file was written successfully.'));
    }
  }
  catch (error) {
    console.error(error);
  }
}

