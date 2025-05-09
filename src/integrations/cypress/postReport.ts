import * as fs from 'fs';
import { readReportDirectory } from './readReportDirectory';

export const postReport = async () => {
  try {
    const fileContent = fs.readFileSync(`${process.cwd()}/package.json`, 'utf8');
    const kualiteeJson = JSON.parse(fileContent);
    const user_token = kualiteeJson.kualiteeConfigs.token;
    const project_id = kualiteeJson.kualiteeConfigs.projectId;
    const directoryPath = kualiteeJson.kualiteeConfigs.reportPath;

    return await readReportDirectory(user_token, project_id, directoryPath)
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
          return;
        }
        console.log(
          '\x1b[32m%s\x1b[0m',
          `\n
            <=============================================================>
                      Report Generated Successfully on Kualitee
            <=============================================================>\n`
        );
      })
      .catch((error) => {
        console.log(
          '\x1b[41m\x1b[37m%s\x1b[0m',
          `\n
            <=====================================================================================>
                      ${error.response.data.errors}, Report cannot be generated on Kualitee Tool
            <=====================================================================================>\n`
        );
      });
  } catch (error) {
    console.error(error);
  }
};
