import { Request, Response } from "express";
import { spawn } from "child_process";
import { postPlaywrightReportOnKualitee } from "./postPlaywrightReportOnKualitee";

let isExecutionRunning = false;

export const playwrightToKualitee = async (
    req: Request,
    res: Response,
    reportPath: string
) => {
    try {
        // 1. Health check
        if (req.body?.ping) {
            return res.send({ status: true, message: "Server is up!" });
        }

        // 2. Prevent parallel Playwright execution
        // const processes = await psList();
        // const playwrightRunning = processes.some(p =>
        //     p.name.toLowerCase().includes("playwright")
        // );

        if (isExecutionRunning) {
            return res.status(503).send({
                status: false,
                message: "Execution already in progress. Please try again later."
            });
        }

        isExecutionRunning = true; // 🔒 lock execution

        // 3. Prepare Playwright command
        const command = "npx playwright test";

        console.log("\nExecuting:", command);

        // 4. Universal spawn (Node 14 → 24+ safe)
        const playwrightProcess = spawn(command, {
            shell: true,
            stdio: "pipe"
        });

        // 5. Capture Playwright output
        playwrightProcess.stdout.on("data", data => {
            console.log(data.toString());
        });

        playwrightProcess.stderr.on("data", data => {
            console.error(data.toString());
        });

        // 6. After Playwright completes → post report to Kualitee
        playwrightProcess.on("close", async () => {
            isExecutionRunning = false;
            try {
                await Promise.all(
                    postPlaywrightReportOnKualitee(reportPath, req.body)
                );

                console.log(
                    "\x1b[32m%s\x1b[0m",
                    `
                    <=============================================================>
                                Report Generated on Kualitee
                    <=============================================================>`
                );

                res.status(200).send({
                    status: true,
                    message: "Report generated successfully."
                });
            } catch (error: any) {
                console.error(error);

                res.status(400).send({
                    status: false,
                    message: error?.errors || "Error while updating Kualitee"
                });
            }
        });
    } catch (error: any) {
        isExecutionRunning = false;
        console.error(error);
        res.status(500).send({
            status: false,
            message: error.message || "Internal server error"
        });
    }
};
