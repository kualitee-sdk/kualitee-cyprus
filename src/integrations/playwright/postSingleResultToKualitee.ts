import axios from "axios";

export const postSingleReportToKualitee = async (jsonReport: any, body: any, currentTestCase: any): Promise<void> => {
    const base_url = body.base_URL;
    const endPoint = `${base_url}cycle/update_bdd_tc_status`;

    // Process JSON directly from memory without relying on the file system
    const parsedData: any = [];

    if (Array.isArray(jsonReport)) {
        for (const feature of jsonReport) {
            if (!feature.elements) continue;

            for (const element of feature.elements) {
                // Only process Scenario elements
                if (element.type !== "scenario") continue;

                let overallStatus = "Passed";
                let failureLog = "";

                // Look through steps and hooks (Before/After) for failures
                if (element.steps) {
                    for (const step of element.steps) {
                        if (step.result?.status === "failed") {
                            overallStatus = "Failed";
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
                    kualitee_tc_id: currentTestCase.id
                };

                // Inject failure logs specifically if the scenario didn't pass
                if (overallStatus === "failed") {
                    testCaseDetail.failure_reason = failureLog;
                }

                parsedData.push(testCaseDetail);
            }
        }
    }

    // Prepare multipart payload structure
    const fileForm = new FormData();
    fileForm.append("token", body.token);
    fileForm.append("project_id", body.project_id);
    fileForm.append("cycle_id", body.cycle_id);
    fileForm.append("test_cases_detail", JSON.stringify(parsedData[0]));

    try {
        const response = await axios.post(endPoint, fileForm, {
            headers: { 
                "content-type": "multipart/form-data",
                'Token': `${body.token}`,
                'user-agent':`Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36`
             }
        });
        console.log(`[Kualitee Sync] Successfully updated test case: ${currentTestCase.tc_tag}`);
        return response.data;
    } catch (error: any) {
        console.error(`[Axios Exception] Failed sending to Kualitee for case ${currentTestCase.tc_tag}:`, error.data);
        throw error;
    }
};