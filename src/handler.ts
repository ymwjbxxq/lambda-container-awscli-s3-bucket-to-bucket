import { exec } from "child_process";

export const startExecution: any = async (event: any): Promise<any> => {
  await copyBucketToBucket(event.inputPath, event.targetPath, event.options);
};

async function copyBucketToBucket(inputPath: string, targetPath: string, options: any): Promise<void> {
  const sse: string = options.sse ? `--sse ${options.sse}` : "";
  const aclBucket: string = options.aclBucket ? "--acl bucket-owner-full-control" : "";
  const region: string = options.region ? `--region ${options.region}` : "eu-central-1";
  const command = `aws s3 cp s3://${process.env.INPUT_BUCKET}/${inputPath} s3://${targetPath} --recursive ${sse} ${aclBucket} ${region}`;
  await execute(command);
}

async function execute (command: string): Promise<void> {
  return new Promise((resolve: any, reject: any) => {
    exec(command, { maxBuffer: 50 * 1024 * 1024 }, (error, stdout, stderr) => {
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

