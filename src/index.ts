import * as CypressIntegration from './integrations/cypress';

export const { 
    readReportDirectory, 
    postReport, 
    postResult, 
    executeTestCase, 
    bulkExecute 
  } = CypressIntegration;