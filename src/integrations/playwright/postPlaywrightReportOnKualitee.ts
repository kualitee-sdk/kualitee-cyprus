import * as fs from 'fs';
import axios from 'axios';

export const postPlaywrightReportOnKualitee = (reportPath: string, body: any) => {
    const base_url = body.base_URL;
    const endPoint = `${base_url}test_case/automation_testcase_report_execution`;
    const promises: Promise<any>[] = [];
    try {
        const fileContent = fs.readFileSync(reportPath, 'utf8');
        const jsonReport = JSON.parse(fileContent);
        const finalReport = reportParser(jsonReport);
        const fileForm = new FormData();
        fileForm.append('token', body.token);
        fileForm.append('project_id', body.project_id);
        fileForm.append('type', 'playwright');
        fileForm.append('test_cases_detail', finalReport);

        const promise = axios.post(endPoint, fileForm, {
            headers: {
                'content-type': 'multipart/form-data'
            }
        }).then(response => response.data).catch(
            (error) => {
                console.log(error)
            }
        );

        promises.push(promise);

    } catch (error) {
        throw error;
    }
    return promises;

}

const reportParser = (jsonReport: any): string => {
    const parrsedData: any = []

    for (const obj of jsonReport.suites) {
        for (const spec of obj.specs) {
            const testCaseDetail = {
                tc_name: spec.title + ' ' + spec.tests[0].projectName,
                tc_description: spec.file,
                status: spec.tests[0].results[0].status
            }
            parrsedData.push(testCaseDetail)
        }
    }
    return JSON.stringify(parrsedData);
}