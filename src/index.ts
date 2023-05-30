import * as fs from 'fs';
import * as path from 'path';
import FormData from 'form-data'
import axios from 'axios';
import { spawn } from 'child_process';

import ps from 'ps-node';
import { Request, Response } from 'express';




function readReportDirectory(user_token: string, project_id: string, directoryPath: string): Promise<any[]> {
  const endPoint = 'https://apiss.kualiteestaging.com/api/v2/test_case/automation_testcase_report_execution'

  try {
    const promises: Promise<any>[] = [];
    const files = fs.readdirSync(directoryPath);
    files.forEach(file => {
      const filePath = path.join(directoryPath, file);
      try {
        if (fs.statSync(filePath).isFile() && path.extname(filePath) === '.json') {
          const arr = file.split('.')
          const type = arr[arr.length - 2]

          const fileForm = new FormData();
          fileForm.append('token', user_token);
          fileForm.append('project_id', project_id)
          fileForm.append('type', type)
          fileForm.append('userfile[]', fs.createReadStream(filePath) as never);

          const promise = axios.post(endPoint, fileForm, {
            headers: {
              'content-type': 'multipart/form-data'
            }
          });
          promises.push(promise);
        }
      } catch (error) {
        //ignore unrequired directories
      }
    });
    return Promise.all(promises);
  } catch (error) {
    const promises: Promise<any>[] = [];
    return Promise.all(promises);
  }
}

function updateStatusOnKualitee(reportPath: string, body: any) {
  let base_url = body.base_URL;
  const endPoint = `${base_url}test_case_execution/execute_automatic`;
  const promises: Promise<any>[] = [];

  const files = fs.readdirSync(reportPath);
  files.forEach(file => {
    const filePath = path.join(reportPath, file);
    const splitFile = file.split('.');

    try {
      if (fs.statSync(filePath).isFile() && splitFile.includes('cucumber') && path.extname(filePath) === '.json') {
        const fileForm = new FormData();
        fileForm.append('token', body.token);
        fileForm.append('project_id', body.project_id);
        fileForm.append('execute', body.execute);
        fileForm.append('cycle_id', body.cycle_id);
        fileForm.append('build_id', body.build_id);
        body.tc_ids.forEach((id: any) => {
          fileForm.append('tc_ids[]', id);
        });
        body.tc_tags.forEach((tag: any) => {
          fileForm.append('tc_tags[]', tag);
        });
        fileForm.append('report', fs.createReadStream(filePath));
        const promise = axios.post(endPoint, fileForm, {
          headers: {
            'content-type': 'multipart/form-data'
          }
        }).then(response => response.data);

        promises.push(promise);
      }
    } catch (error) {
      throw error;
    }
  });

  return promises;
}

export const postReport = async () => {
  try {
    const fileContent = fs.readFileSync(`${process.cwd()}/package.json`, 'utf8');
    const kualiteeJson = JSON.parse(fileContent);
    const user_token = kualiteeJson.kualiteeConfigs.token;
    const project_id = kualiteeJson.kualiteeConfigs.projectId;
    const directoryPath = kualiteeJson.kualiteeConfigs.reportPath;
    return await readReportDirectory(user_token, project_id, directoryPath).then((response) => {
      if (response.length && response.length > 0) {
        const responseObject = response[0].data;
        console.log(
          '\x1b[32m%s\x1b[0m',
          `\n
                <=====================================================================================>
                          ${responseObject.message} on Kualitee Tool
                <=====================================================================================>\n`
        );
        return;
      }
      console.log(
        '\x1b[32m%s\x1b[0m',
        `\n
                <=====================================================================================>
                            Report generated Successfully on Kualitee Tool
                <=====================================================================================>\n`
      );
    }).catch((error) => {
      console.log(
        '\x1b[41m\x1b[37m%s\x1b[0m',
        `\n
                <=====================================================================================>
                        ${error.response.data.errors}, Report cannot be generated on Kualitee Tool
                <=====================================================================================>\n`
      );
    });
  } catch (error) {
    console.error(error);
  }
}

export const postResult = async (user_token: string, project_id: string, directoryPath: string) => {
  try {
    return await readReportDirectory(user_token, project_id, directoryPath).then((response) => {
      if (response.length && response.length > 0) {
        const responseObject = response[0].data;
        console.log(
          '\x1b[32m%s\x1b[0m',
          `\n
                <=====================================================================================>
                                 ${responseObject.message} on Kualitee Tool
                <=====================================================================================>\n`
        );
        return;
      }
      console.log(
        '\x1b[32m%s\x1b[0m',
        `\n
                <=====================================================================================>
                                Report generated Successfully on Kualitee Tool
                <=====================================================================================>\n`
      );
    }).catch((error) => {
      console.log(
        '\x1b[41m\x1b[37m%s\x1b[0m',
        `\n
                <=====================================================================================>
                    ${error.response.data.errors}, Report cannot be generated on Kualitee Tool
                <=====================================================================================>\n`
      );
    });
  } catch (error) {
    console.error(error);
  }
}

export const executeTestCase = (req: Request, res: Response, reportPath: string) => {
  try {
    const response = res;
    if (req.body.ping) {
      res.send({ status: true, message: 'Server working properly...' })
    } else {
      ps.lookup({ command: 'cypress' }, (err, resultList) => {
        if (err) {
          throw err;
        }

        // If there are any running processes, send an error response
        if (resultList.length > 0) {
          response.status(503).send({ status: false, message: 'The execution of testing is already in process.Please try in while..' })
        } else {
          const { body } = req;
          let tag = '';
          if (body.tc_tags.length > 1) {
            tag = body.tc_tags.join(" or ");
          } else {
            tag = body.tc_tags[0];
          }

          const cypressArgs = ['cypress', 'run', '--env', `TAGS="${tag}"`];
          const cypress = spawn(/^win/.test(process.platform) ? 'npx.cmd' : 'npx', cypressArgs);

          // log Cypress output to console
          cypress.stdout.on('data', (data) => {
            console.log(data.toString());
          });

          // log Cypress errors to console
          cypress.stderr.on('data', (error) => {
            console.log(error.toString());
          });

          cypress.on('close', async (code) => {
            const onCloseResponse = res;
            const promises = updateStatusOnKualitee(reportPath, body);

            try {
              await Promise.all(promises);
              console.log(
                '\x1b[32m%s\x1b[0m',
                `\n
                <=====================================================================================>
                                            Status updated on kualitee
                <=====================================================================================>\n`
              );
              onCloseResponse.status(200).send({ status: true, message: `Test case with TAG ${body.tc_tags} executed successfully. ` });
            } catch (error: any) {
              console.log(
                '\x1b[41m\x1b[37m%s\x1b[0m',
                `\n
                <=====================================================================================>
                ${JSON.stringify(error.response.data.errors)}, error occured while updating status on Kualitee Tool
                <=====================================================================================>\n`
              );
            onCloseResponse.status(400).send({ status: false, message: error.response.data.errors });
            }
          });
        }
      });
    }
  } catch (error) {
    throw error;
  }
}
