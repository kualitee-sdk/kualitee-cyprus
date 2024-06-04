import fs from 'fs';
import path from 'path';

export const bulkExecute = (body: any) => {
  const folderPath = 'cypress/reports';
  const files = fs.readdirSync(folderPath);

  let test_cases = body.test_cases;
  let updated_test_cases: any[] = [];

  files.forEach((file) => {
    if (file.endsWith('cucumber.json')) {
      const filePath = path.join(folderPath, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const report = JSON.parse(fileContent);

      report[0].elements.forEach((scenario: { tags: { name: string }[]; steps: any[] }) => {
        scenario.tags.forEach((tag: { name: string }) => {
          const index = test_cases.findIndex(
            (testCase: { tag: string }) => testCase.tag === tag.name
          );
          if (index !== -1) {
            const status = scenario.steps.some(
              (step: { result: { status: string } }) => step.result.status === 'failed'
            )
              ? 'Failed'
              : scenario.steps.every(
                  (step: { result: { status: string } }) => step.result.status === 'passed'
                )
              ? 'Passed'
              : scenario.steps.some(
                  (step: { result: { status: string } }) => step.result.status === 'not run'
                )
              ? 'Not Run'
              : '';

            updated_test_cases.push({
              ...test_cases[index],
              status,
            });

            test_cases.splice(index, 1); // Remove the found object from test_cases
          }
        });
      });
    }
  });

  console.log('this is updated test cases ::: ', updated_test_cases);
  return updated_test_cases;
};
