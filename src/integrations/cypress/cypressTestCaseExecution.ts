import { Request, Response } from 'express';
import ps from 'ps-node';
// import { spawn } from 'child_process';
import { updateStatusOnKualitee } from './index';
import { spawn } from "child_process";
import psList from "ps-list";             // modern alternative to ps-node

export async function cypressTestCaseExecution(req: Request, res: Response, reportPath: string) {
  try {
    // 1. If ping request → return simple response
    if (req.body.ping) {
      return res.send({ status: true, message: "Server working properly..." });
    }

    // 2. Check if any Cypress process is already running
    const runningProcesses = await psList();
    const cypressRunning = runningProcesses.some(p =>
      p.name.toLowerCase().includes("cypress")
    );

    if (cypressRunning) {
      return res
        .status(503)
        .send({
          status: false,
          message: "Cypress execution already in progress. Please try again later."
        });
    }

    // 3. Merge token (from body or headers)
    const token = req.body?.token || req.headers?.token;
    if (!token) throw new Error("Invalid payload: Token missing.");

    // 4. Prepare tags for Cypress
    const tags = req.body.tc_tags;
    const tagExpression = Array.isArray(tags) ? tags.join(" or ") : tags;

    // 5. Build command for Cypress
    const cmd = `npx cypress run --env TAGS="${tagExpression}"`;

    console.log("\nExecuting command:", cmd);

    // 6. Spawn command (universal for all Node versions + Windows)
    const cypressProcess = spawn(cmd, {
      shell: true,
      stdio: "pipe"
    });

    // 7. Log real-time output from Cypress
    cypressProcess.stdout.on("data", data => {
      console.log(data.toString());
    });

    // 8. Log real-time errors
    cypressProcess.stderr.on("data", err => {
      console.error(err.toString());
    });

    // 9. After Cypress completes → update status on Kualitee
    cypressProcess.on("close", async () => {
      try {
        await Promise.all(
          updateStatusOnKualitee(reportPath, req.body)
        );

        console.log(
          "\x1b[32m%s\x1b[0m",
          `
<=====================================================================================>
                             Status updated on Kualitee
<=====================================================================================>`
        );

        res.status(200).send({
          status: true,
          message: `Test cases with TAG "${tags}" executed successfully.`
        });
      } catch (error: any) {
        console.log(
          '\x1b[41m\x1b[37m%s\x1b[0m',
          `\n
                 <=====================================================================================>
                 ${JSON.stringify(error.response.data.errors)}, error occured while updating status on Kualitee Tool
                 <=====================================================================================>\n`
        );
        res.status(400).send({ status: false, message: error.response.data.errors });
      }


    });
  } catch (error) {
    throw error;
  }
}

