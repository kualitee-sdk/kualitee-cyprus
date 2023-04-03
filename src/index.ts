import * as fs from 'fs';
import * as path from 'path';
import FormData from 'form-data'
import axios from 'axios';
const kualiteeJson = require(`${process.cwd()}/package.json`);

const endPoint = 'https://apiss.kualiteestaging.com/api/v2/test_case/automation_testcase_report_execution'

function readCucumberJsonDirectory(): Promise<any[]> {

  const user_token = kualiteeJson.kualiteeConfigs.token;
  const project_id = kualiteeJson.kualiteeConfigs.projectId;
  const directoryPath = kualiteeJson.kualiteeConfigs.reportPath;

  const promises: Promise<any>[] = [];
  const files = fs.readdirSync(directoryPath);
  files.forEach(file => {
    const filePath = path.join(directoryPath, file);

    if (fs.statSync(filePath).isFile() && path.extname(filePath) === '.json') {
      const arr = file.split('.')
      const type = arr[arr.length - 2]

      const fileForm = new FormData();
      fileForm.append('token', user_token);
      fileForm.append('project_id', project_id)
      fileForm.append('type', type)
      fileForm.append('userfile[]', fs.createReadStream(filePath) as never);

      const promise = axios.post(endPoint, fileForm, {
        headers: {
          'content-type': 'multipart/form-data'
        }
      });
        promises.push(promise);
    }
  });
  return Promise.all(promises);
}

export const postResult = async () => {
  try {
    return await readCucumberJsonDirectory().then((response) => {
      if(response.length && response.length > 0) {
        const responseObject = response[0].data;
        console.log('\x1b[32m%s\x1b[0m',`${responseObject.message} on Kualitee Tool`);
        return;
    }
      console.log('\x1b[32m%s\x1b[0m',"Report generated Successfully on Kualitee Tool")
    }).catch ((error) => {
      console.log('\x1b[41m\x1b[37m%s\x1b[0m',`${error.response.data.errors}, Report cannot be generated on Kualitee Tool` || "failed with errors to generate report on Kualitee Tool ")
  });
  } catch (error) {
    console.error(error);
  }
}
