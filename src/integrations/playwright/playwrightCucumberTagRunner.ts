import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { postSingleReportToKualitee } from "./postSingleResultToKualitee";

interface TestCasePayload {
    tc_tag: string;
    tc_name: string;
    id: number;
}

export const runSequentiallyByTags = async (body: any): Promise<any[]> => {
    const testCases: TestCasePayload[] = body.cycle_testCases || [];
    const executionSummary: any[] = [];

    for (const tc of testCases) {
        console.log(`\n[Runner] Executing TestCase: ${tc.tc_name} with tag: ${tc.tc_tag}`);

        // 1. Generate unique dynamic path for this iteration
        const uniqueReportName = `report_${tc.tc_tag}_${Date.now()}.json`;
        const tempReportPath = path.join(process.cwd(), uniqueReportName);

        // 2. FIXED: Feed the unique file path directly into the cucumber-js formatter option
        const command = `npx cucumber-js --tags "${tc.tc_tag}" --format json:"${tempReportPath}"`;
        
        try {
            // Execute the specific tag
            await runCommand(command);

            // 3. Code now successfully finds the file at tempReportPath
            if (fs.existsSync(tempReportPath)) {
                const fileContent = fs.readFileSync(tempReportPath, "utf-8");
                const parsedJson = JSON.parse(fileContent);

                await postSingleReportToKualitee(parsedJson, body, tc);
                
                executionSummary.push({ tag: tc.tc_tag, name: tc.tc_name, status: "Success" });
            } else {
                throw new Error(`Report file was not generated for tag: ${tc.tc_tag}`);
            }

        } catch (error: any) {
            console.error(`[Error] Failed processing tag ${tc.tc_tag}:`, error.message);
            executionSummary.push({ tag: tc.tc_tag, name: tc.tc_name, status: "Failed", error: error.message });
        } finally {
            // Self-cleaning hook
            if (fs.existsSync(tempReportPath)) {
                try {
                    fs.unlinkSync(tempReportPath);
                    // console.log(`[Cleanup] Securely deleted temporary file: ${uniqueReportName}`);
                } catch (cleanupErr) {
                    console.error(`[Cleanup Error] Could not delete ${uniqueReportName}:`, cleanupErr);
                }
            }
        }
    }

    return executionSummary;
};

// Simplified helper utility since env properties are no longer required
const runCommand = (command: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        console.log(`Executing isolated command: ${command}`);

        const child = spawn(command, {
            shell: true,
            stdio: "pipe"
        });

        child.stdout.on("data", data => console.log(data.toString()));
        child.stderr.on("data", data => console.error(data.toString()));

        child.on("close", () => {
            resolve();
        });
        child.on("error", (err) => reject(err));
    });
};