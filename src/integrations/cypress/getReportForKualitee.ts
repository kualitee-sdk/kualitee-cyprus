import { Response } from "express";
import { spawn } from "child_process";
import { readReportDirectory } from "./readReportDirectory";
let isExecutionRunning = false;
export async function fetchReportForKualitee(body: any, reportPath: string, res: Response) {
    // const runningProcesses = await psList();
    // const cypressRunning = runningProcesses.some(p =>
    //     p.name.toLowerCase().includes("cypress")
    // );

    if (isExecutionRunning) {
        return res
            .status(503)
            .send({
                status: false,
                message: "Cypress execution already in progress. Please try again later."
            });
    }
    isExecutionRunning = true; // 🔒 lock execution

    const config = {
        user_token: body.token,
        project_id: body.project_id,
        build_id: body?.build,
        start_date: body?.start_date,
        end_date: body?.end_date,
        directoryPath: reportPath,
        base_url: body?.base_URL
    };

    // 5. Build command for Cypress
    const cmd = `npx cypress run`;

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
        isExecutionRunning = false;
        try {
            return await readReportDirectory(config)
                .then((response) => {
                    if (response.length && response.length > 0) {
                        const responseObject = response[0].data;
                        console.log(
                            '\x1b[32m%s\x1b[0m',
                            `\n
                        <=============================================================>
                                  ${responseObject.message} on Kualitee Tool
                        <=============================================================>\n`
                        );
                        return res.status(200).send({
                            status: true,
                            data: responseObject.data
                        });
                    }
                    console.log(
                        '\x1b[32m%s\x1b[0m',
                        `\n
                        <=============================================================>
                                  Report Generated Successfully on Kualitee
                        <=============================================================>\n`
                    );
                    return res.status(200).send({
                        status: true,
                        message: "Report generated successfully",
                        data: []
                    });
                })
                .catch((error) => {
                    console.log(
                        '\x1b[41m\x1b[37m%s\x1b[0m',
                        `\n
                        <=====================================================================================>
                                  ${error.response.data.errors}, Report cannot be generated on Kualitee Tool
                        <=====================================================================================>\n`
                    );
                    return res.status(500).send({
                        status: false,
                        message: error?.response?.data?.errors || "Report generation failed"
                    });
                });
        } catch (error: any) {
        }


    });
}