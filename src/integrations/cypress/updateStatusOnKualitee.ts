import * as fs from 'fs';
import * as path from 'path';
import FormData from 'form-data'
import axios from 'axios';

export async function updateStatusOnKualitee(reportPath: string, body: any): Promise<any[]> {
  const base_url = body.base_URL;
  const endPoint = `${base_url}test_case_execution/execute_automatic`;
  const files = fs.readdirSync(reportPath);

  const promises: Promise<any>[] = [];

  for (let i = 0; i < body.tc_tags.length; i++) {
    files.forEach(file => {
      const filePath = path.join(reportPath, file);

      try {
        if (fs.statSync(filePath).isFile() && file.endsWith('cucumber.json')) {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          // Check if the tag exists
          const tagExists = fileContent.includes(body.tc_tags[i]);
          if (tagExists) {
            const fileForm = new FormData();
            fileForm.append('token', body.token);
            fileForm.append('project_id', body.project_id);
            fileForm.append('execute', body.execute);
            fileForm.append('cycle_id', body.cycle_id);
            fileForm.append('build_id', body.build_id);
            fileForm.append('tc_ids[]', body.tc_tags[i]); // Might be a typo, should it be body.tc_ids[i]?
            fileForm.append('tc_tags[]', body.tc_tags[i]);
            fileForm.append('report', fs.createReadStream(filePath));
            const promise = axios.post(endPoint, fileForm, {
              headers: {
                'content-type': 'multipart/form-data'
              }
            }).then(response => response.data);

            promises.push(promise);
          }
        }
      } catch (error) {
        throw error;
      }
    });
  }

  return promises;
}
