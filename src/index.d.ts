import { Request, Response } from 'express';
export declare const postReport: () => Promise<void>;
export declare const postResult: (user_token: string, project_id: string, directoryPath: string) => Promise<void>;
export declare const executeTestCase: (req: Request, res: Response, reportPath: string) => void;
//# sourceMappingURL=index.d.ts.map