import { Request, Response } from 'express';
import ps from 'ps-node';
import { spawn } from 'child_process';
import { postPlaywrightReportOnKualitee } from './postPlaywrightReportOnKualitee';

export const playwrightToKualitee = (req: Request, res: Response, reportPath: string) => {
    try {
        const response = res;

        if (req.body.ping) {
            res.send({ status: true, message: 'Server is up!' })
        } else {
            ps.lookup({ command: 'playwright' }, (err, resultList) => {
                // If there are any running processes, send an error response
                if (resultList.length > 0) {
                    response.status(503).send({ status: false, message: 'Execution is already in process.Please try in while..' })
                } else {
                    const { body } = req;
                    const npxCmd = /^win/.test(process.platform) ? 'npx.cmd' : 'npx';
                    const playwrightArgs = ['playwright', 'test'];

                    const playwright = spawn(npxCmd, playwrightArgs);

                    playwright.stdout.on('data', (data) => {
                        console.log(data.toString());
                    });

                    playwright.stderr.on('data', (data) => {
                        console.log(data.toString());
                    });

                    playwright.on('close', async (code) => {
                        const onCloseResponse = res;
                        const promises = postPlaywrightReportOnKualitee(reportPath, body);
                        
                        try {
                            await Promise.all(promises);
                            console.log(
                              '\x1b[32m%s\x1b[0m',
                              `\n
                               <=====================================================================================>
                                                           Report Generated on Kualitee
                               <=====================================================================================>\n`
                            );
                            onCloseResponse.status(200).send({ status: true, message: `Executed successfully. ` });
                          } catch (error: any) {
                            console.log(
                              '\x1b[41m\x1b[37m%s\x1b[0m',
                              `\n
                               <=====================================================================================>
                               ${JSON.stringify(error.errors)}, error occured while updating status on Kualitee Tool
                               <=====================================================================================>\n`
                            );
                            onCloseResponse.status(400).send({ status: false, message: error.errors });
                          }
                    });
                }
            })
        }
    } catch (error) {
        console.error(error)
    }
}