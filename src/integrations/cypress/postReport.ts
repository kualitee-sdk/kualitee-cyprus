import * as fs from 'fs';
import { readReportDirectory } from './readReportDirectory';

export const postReport = async () => {
  try {
    const fileContent = fs.readFileSync(`${process.cwd()}/package.json`, 'utf8');
    const kualiteeJson = JSON.parse(fileContent);
    const config = {
      user_token: kualiteeJson.kualiteeConfigs.token,
      project_id: kualiteeJson.kualiteeConfigs.projectId,
      build_id: kualiteeJson.kualiteeConfigs?.build,
      start_date: kualiteeJson.kualiteeConfigs?.start_date,
      end_date: kualiteeJson.kualiteeConfigs?.end_date,
      directoryPath: kualiteeJson.kualiteeConfigs.reportPath,
      base_url: 'https://apiss.kualitee.com/api/v2/'
    };

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
          return { data: response[0].data.data };
        }
        console.log(
          '\x1b[32m%s\x1b[0m',
          `\n
            <=============================================================>
                      Report Generated Successfully on Kualitee
            <=============================================================>\n`
        );
        return { data: response[0].data.data };
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
