import { readReportDirectory } from './index';

export const postResult = async (user_token: string, project_id: string, directoryPath: string) => {
  try {
    const config = {
      user_token: user_token,
      project_id: project_id,
      directoryPath: directoryPath
    }
    return await readReportDirectory(config)
      .then((response) => {
        if (response.length && response.length > 0) {
          const responseObject = response[0].data;
          console.log(
            '\x1b[32m%s\x1b[0m',
            `\n
            <=====================================================================================>
                         ${responseObject.message} on Kualitee Tool
            <=====================================================================================>\n`
          );
          return;
        }
        console.log(
          '\x1b[32m%s\x1b[0m',
          `\n
            <=====================================================================================>
                         Report generated Successfully on Kualitee Tool
            <=====================================================================================>\n`
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
