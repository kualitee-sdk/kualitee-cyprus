"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeTestCase = exports.postResult = exports.postReport = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const form_data_1 = __importDefault(require("form-data"));
const axios_1 = __importDefault(require("axios"));
const child_process_1 = require("child_process");
const ps_node_1 = __importDefault(require("ps-node"));
function readReportDirectory(user_token, project_id, directoryPath) {
    const endPoint = 'https://apiss.kualiteestaging.com/api/v2/test_case/automation_testcase_report_execution';
    try {
        const promises = [];
        const files = fs.readdirSync(directoryPath);
        files.forEach(file => {
            const filePath = path.join(directoryPath, file);
            try {
                if (fs.statSync(filePath).isFile() && path.extname(filePath) === '.json') {
                    const arr = file.split('.');
                    const type = arr[arr.length - 2];
                    const fileForm = new form_data_1.default();
                    fileForm.append('token', user_token);
                    fileForm.append('project_id', project_id);
                    fileForm.append('type', type);
                    fileForm.append('userfile[]', fs.createReadStream(filePath));
                    const promise = axios_1.default.post(endPoint, fileForm, {
                        headers: {
                            'content-type': 'multipart/form-data'
                        }
                    });
                    promises.push(promise);
                }
            }
            catch (error) {
                //ignore unrequired directories
            }
        });
        return Promise.all(promises);
    }
    catch (error) {
        const promises = [];
        return Promise.all(promises);
    }
}
function updateStatusOnKualitee(reportPath, body) {
    let base_url = body.base_URL;
    const endPoint = `${base_url}test_case_execution/execute_automatic`;
    // const endPoint = 'https://apiss.kualiteestaging.com/api/v2/test_case_execution/execute_automatic';
    const promises = [];
    const files = fs.readdirSync(reportPath);
    files.forEach(file => {
        const filePath = path.join(reportPath, file);
        const splitFile = file.split('.');
        try {
            if (fs.statSync(filePath).isFile() && splitFile.includes('cucumber') && path.extname(filePath) === '.json') {
                const fileForm = new form_data_1.default();
                fileForm.append('token', body.token);
                fileForm.append('project_id', body.project_id);
                fileForm.append('execute', body.execute);
                fileForm.append('cycle_id', body.cycle_id);
                fileForm.append('build_id', body.build_id);
                body.tc_ids.forEach((id) => {
                    fileForm.append('tc_ids[]', id);
                });
                body.tc_tags.forEach((tag) => {
                    fileForm.append('tc_tags[]', tag);
                });
                fileForm.append('report', fs.createReadStream(filePath));
                const promise = axios_1.default.post(endPoint, fileForm, {
                    headers: {
                        'content-type': 'multipart/form-data'
                    }
                }).then(response => response.data);
                promises.push(promise);
            }
        }
        catch (error) {
            throw error;
        }
    });
    return promises;
}
const postReport = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fileContent = fs.readFileSync(`${process.cwd()}/package.json`, 'utf8');
        const kualiteeJson = JSON.parse(fileContent);
        const user_token = kualiteeJson.kualiteeConfigs.token;
        const project_id = kualiteeJson.kualiteeConfigs.projectId;
        const directoryPath = kualiteeJson.kualiteeConfigs.reportPath;
        return yield readReportDirectory(user_token, project_id, directoryPath).then((response) => {
            if (response.length && response.length > 0) {
                const responseObject = response[0].data;
                console.log('\x1b[32m%s\x1b[0m', `\n
                <=====================================================================================>
                          ${responseObject.message} on Kualitee Tool
                <=====================================================================================>\n`);
                return;
            }
            console.log('\x1b[32m%s\x1b[0m', `\n
                <=====================================================================================>
                            Report generated Successfully on Kualitee Tool
                <=====================================================================================>\n`);
        }).catch((error) => {
            console.log('\x1b[41m\x1b[37m%s\x1b[0m', `\n
                <=====================================================================================>
                        ${error.response.data.errors}, Report cannot be generated on Kualitee Tool
                <=====================================================================================>\n`);
        });
    }
    catch (error) {
        console.error(error);
    }
});
exports.postReport = postReport;
const postResult = (user_token, project_id, directoryPath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield readReportDirectory(user_token, project_id, directoryPath).then((response) => {
            if (response.length && response.length > 0) {
                const responseObject = response[0].data;
                console.log('\x1b[32m%s\x1b[0m', `\n
                <=====================================================================================>
                                 ${responseObject.message} on Kualitee Tool
                <=====================================================================================>\n`);
                return;
            }
            console.log('\x1b[32m%s\x1b[0m', `\n
                <=====================================================================================>
                                Report generated Successfully on Kualitee Tool
                <=====================================================================================>\n`);
        }).catch((error) => {
            console.log('\x1b[41m\x1b[37m%s\x1b[0m', `\n
                <=====================================================================================>
                    ${error.response.data.errors}, Report cannot be generated on Kualitee Tool
                <=====================================================================================>\n`);
        });
    }
    catch (error) {
        console.error(error);
    }
});
exports.postResult = postResult;
const executeTestCase = (req, res, reportPath) => {
    try {
        const response = res;
        if (req.body.ping) {
            res.send({ status: true, message: 'Server working properly...' });
        }
        else {
            ps_node_1.default.lookup({ command: 'cypress' }, (err, resultList) => {
                if (err) {
                    throw err;
                }
                // If there are any running processes, send an error response
                if (resultList.length > 0) {
                    response.status(503).send({ status: false, message: 'The execution of testing is already in process.Please try in while..' });
                }
                else {
                    const { body } = req;
                    let tag = '';
                    if (body.tc_tags.length > 1) {
                        tag = body.tc_tags.join(" or ");
                    }
                    else {
                        tag = body.tc_tags[0];
                    }
                    const cypressArgs = ['cypress', 'run', '--env', `TAGS="${tag}"`];
                    const cypress = (0, child_process_1.spawn)(/^win/.test(process.platform) ? 'npx.cmd' : 'npx', cypressArgs);
                    // log Cypress output to console
                    cypress.stdout.on('data', (data) => {
                        console.log(data.toString());
                    });
                    // log Cypress errors to console
                    cypress.stderr.on('data', (error) => {
                        console.log(error.toString());
                    });
                    cypress.on('close', (code) => __awaiter(void 0, void 0, void 0, function* () {
                        const onCloseResponse = res;
                        const promises = updateStatusOnKualitee(reportPath, body);
                        try {
                            yield Promise.all(promises);
                            console.log('\x1b[32m%s\x1b[0m', `\n
                <=====================================================================================>
                                            Status updated on kualitee
                <=====================================================================================>\n`);
                            onCloseResponse.status(200).send({ status: true, message: `Test case with TAG ${body.tc_tags} executed successfully. ` });
                        }
                        catch (error) {
                            console.log('\x1b[41m\x1b[37m%s\x1b[0m', `\n
                <=====================================================================================>
                ${JSON.stringify(error.response.data.errors)}, error occured while updating status on Kualitee Tool
                <=====================================================================================>\n`);
                            onCloseResponse.status(400).send({ status: false, message: error.response.data.errors });
                        }
                    }));
                }
            });
        }
    }
    catch (error) {
        throw error;
    }
};
exports.executeTestCase = executeTestCase;
