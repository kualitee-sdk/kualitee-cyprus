import { Request, Response } from 'express';
import ps from 'ps-node';
import { spawn } from 'child_process';
import { updateStatusOnKualitee } from './index';

export const cypressTestCaseExecution = (req: Request, res: Response, reportPath: string) => {
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
          const { body,headers } = req;
          body.token = body?.token || headers?.token || null;

          if(!body?.token){
            throw new Error('Invalid payload');
          }
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
};
