import axios from "axios";

export const postSingleReportToKualitee = async (jsonReport: any, body: any, currentTestCase: any): Promise<void> => {
    const base_url = body.base_URL;
    const endPoint = `${base_url}test_case/automation_testcase_report_execution`;

    // Process JSON directly from memory without relying on the file system
    const parsedData: any = [];

    if (Array.isArray(jsonReport)) {
        for (const feature of jsonReport) {
            if (!feature.elements) continue;

            for (const element of feature.elements) {
                // Only process Scenario elements
                if (element.type !== "scenario") continue;

                let overallStatus = "passed";
                let failureLog = "";

                // Look through steps and hooks (Before/After) for failures
                if (element.steps) {
                    for (const step of element.steps) {
                        if (step.result?.status === "failed") {
                            overallStatus = "failed";
                            // Extract failure details or crash stack traces safely
                            failureLog = step.result.error_message || "Step execution failed.";
                            break; // Stop parsing steps once a failure is found
                        }
                    }
                }

                const testCaseDetail: any = {
                    tc_name: element.name || currentTestCase.tc_name,
                    tc_description: element.id,
                    status: overallStatus,
                    kualitee_id: currentTestCase.id
                };

                // Inject failure logs specifically if the scenario didn't pass
                if (overallStatus === "failed") {
                    testCaseDetail.failure_reason = failureLog;
                }

                parsedData.push(testCaseDetail);
            }
        }
    }

    console.log("parsed test case := ", JSON.stringify(parsedData))

    // Prepare multipart payload structure
    const fileForm = new FormData();
    fileForm.append("token", body.token);
    fileForm.append("project_id", body.project_id);
    fileForm.append("type", "playwright");
    fileForm.append("test_cases_detail", JSON.stringify(parsedData));

    try {
        const response = await axios.post(endPoint, fileForm, {
            headers: { "content-type": "multipart/form-data" }
        });
        console.log(`[Kualitee Sync] Successfully updated case ID: ${currentTestCase.id}`);
        return response.data;
    } catch (error: any) {
        console.error(`[Axios Exception] Failed sending to Kualitee for case ${currentTestCase.id}:`, error?.message);
        throw error;
    }
};