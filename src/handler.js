"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startExecution = void 0;
const child_process_1 = require("child_process");
const startExecution = async (event) => {
    await copyBucketToBucket(event.sourcetPath, event.targetPath, event.options);
};
exports.startExecution = startExecution;
async function copyBucketToBucket(sourcetPath, targetPath, options) {
    const sse = options.sse
        ? `--sse ${options.sse}`
        : "";
    const aclBucket = options.aclBucket
        ? "--acl bucket-owner-full-control"
        : "";
    const region = options.region
        ? `--region ${options.region}`
        : "eu-central-1";
    const command = `aws s3 cp s3://${sourcetPath} s3://${targetPath} --recursive ${sse} ${aclBucket} ${region}`;
    await execute(command);
}
async function execute(command) {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(command, { maxBuffer: 50 * 1024 * 1024 }, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            if (stderr) {
                return;
            }
            resolve();
        });
    });
}
//# sourceMappingURL=handler.js.map