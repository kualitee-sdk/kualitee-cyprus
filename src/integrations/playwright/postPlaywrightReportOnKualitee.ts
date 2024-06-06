import * as fs from 'fs';

export const postPlaywrightReportOnKualitee = (reportPath: string, body: any) => {
    const base_url = body.base_URL;
    const endPoint = `${base_url}test_case_execution/execute_automatic`;
    // const files = fs.readdirSync(reportPath);
    const promises: Promise<any>[] = [];

    try {
        const fileContent = fs.readFileSync(reportPath, 'utf8');
        const jsonReport = JSON.parse(fileContent);
        const finalReport = reportParser(jsonReport);
    } catch (error) {
        throw error;
    }
}

const reportParser = (jsonReport:any) => {
    console.log("this is report json in report parser := ", jsonReport);
 
}