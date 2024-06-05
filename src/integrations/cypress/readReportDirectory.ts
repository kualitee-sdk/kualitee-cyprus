import * as fs from 'fs';
import * as path from 'path';
import FormData from 'form-data'
import axios from 'axios';

export async function readReportDirectory(user_token: string, project_id: string, directoryPath: string): Promise<any[]> {
  const endPoint = 'https://apiss.kualitee.com/api/v2/test_case/automation_testcase_report_execution';

  try {
    const promises: Promise<any>[] = [];
    const files = fs.readdirSync(directoryPath);
    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      try {
        if (fs.statSync(filePath).isFile() && path.extname(filePath) === '.json') {
          const arr = file.split('.');
          const type = arr[arr.length - 2];

          const fileForm = new FormData();
          fileForm.append('token', user_token);
          fileForm.append('project_id', project_id);
          fileForm.append('type', type);
          fileForm.append('userfile[]', fs.createReadStream(filePath) as never);

          const promise = axios.post(endPoint, fileForm, {
            headers: {
              'content-type': 'multipart/form-data',
            },
          });
          promises.push(promise);
        }
      } catch (error) {
        // Ignore unrequired directories
      }
    }
    return Promise.all(promises);
  } catch (error) {
    return Promise.all([]);
  }
}