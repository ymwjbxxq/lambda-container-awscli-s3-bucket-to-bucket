# Lambda container - Bucket to Bucket transfer

In this post, I show you how you can create a Lambda container with [awscli](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html) installed to do bucket to bucket transfer.

### Background ###

Imagine you need to transfer GB and GB of files in one go, you will end up using AWS Batch, for example, and the simple way to transfer N files in one operation is to use awscli, like in this repository.

Using AWS Batch for smaller files is a waste because you need to spin up a machine (spot instance). In addition, it is all time inside the VPC, and the egress data transfer costs more at scale than transferring the same files through the internet gateway.

### Solution ###

 Assuming that you have some orchestration, you can now decide to use a Lambda function to transfer smaller files instead of AWS Batch.

In this repository, you will find

* [template-ecr.yml](https://github.com/ymwjbxxq/lambda-container-awscli-s3-bucket-to-bucket/blob/main/template-ecr.yml)
* [template-lambda.yaml](https://github.com/ymwjbxxq/lambda-container-awscli-s3-bucket-to-bucket/blob/main/template-lambda.yaml)
* [Dockerfile](https://github.com/ymwjbxxq/lambda-container-awscli-s3-bucket-to-bucket/blob/main/Dockerfile)
* [handler.ts](https://github.com/ymwjbxxq/lambda-container-awscli-s3-bucket-to-bucket/blob/main/src/handler.ts)

Even if I was convinced that AWS SAM was already supporting ECR auto-creation, it turned out that AWS read my mind and few hours before 

![picture](https://github.com/ymwjbxxq/lambda-container-awscli-s3-bucket-to-bucket/blob/main/awssam-edjgeek.jpeg)

Until then, we must create our ECR, and I report a snippet from GitLab:

```javaScript
# Setup Docker repository only for first time
    - ECR_EXISTS=$(aws ecr describe-repositories | grep $S3_DOCKER_ECR_NAME || true)
    - (if [ -z "$ECR_EXISTS" ]; then
          aws cloudformation deploy 
                          --template template-ecr.yml
                          --stack-name ${YOUR_STACK_NAME_ECR}
                          --s3-bucket ${YOUR_CI_BUCKET}
                          --capabilities CAPABILITY_NAMED_IAM
                          --region ${YOUR_AWS_REGION} 
                          --parameter-overrides awsAdminRole=${YOUR_AWS_ROLE_ARN} stage=${STAGE} ecrRepoName=${YOUR_DOCKER_ECR_NAME}
                          --force-upload
                          --no-fail-on-empty-changeset
                          --debug ;
      fi);
    #upload docker
    - $(aws ecr get-login --no-include-email --region YOUR_AWS_REGION)
    - docker build -t $YOUR_AWS_REGION_DOCKER_ECR_NAME .
    - docker tag $YOUR_AWS_REGION_DOCKER_ECR_NAME:latest $YOUR_AWS_REGION_PACKAGE_IMAGE_URI
    - docker push $YOUR_AWS_REGION_PACKAGE_IMAGE_URI
```
Once you have your image uploaded, it is time for the Lambda:

```javaScript
 - sam build --template-file template-lambda.yaml 
    - sam deploy --template-file template-lambda.yaml 
                 --stack-name ${YOUR_STACK_NAME_LAMBDA}
                 --s3-bucket ${YOUR_CI_BUCKET}
                 --capabilities CAPABILITY_NAMED_IAM 
                 --image-repository ${YOUR_PACKAGE_IMAGE_URI}
                 --region ${YOUR_AWS_REGION} 
                 --parameter-overrides awsAdminRole=${YOUR_AWS_ROLE_ARN} stage=${STAGE} 
imageUri=${YOUR_PACKAGE_IMAGE_URI}
                 --force-upload
                 --no-fail-on-empty-changeset
                 --debug
```
In the template-lambda.yaml template, I have added two Lambda functions:
One that uses the internet gateway
It is inside the VPC, which you can use if your destination requires whitelisting IPs.

### Dockerfile ###
```javaScript
FROM public.ecr.aws/lambda/nodejs:14
RUN yum install -y awscli
COPY bucket-to-bucket.js ./

CMD ["bucket-to-bucket.startExecution"]
```
I am using the AWS official image because the container **must** implement the [Lambda Runtime API](https://docs.aws.amazon.com/lambda/latest/dg/runtimes-api.html).
If you want to bring your image, you need to use the [Runtime interface clients](https://docs.aws.amazon.com/lambda/latest/dg/runtimes-images.html#runtimes-api-client) plus, there are other [requirements](https://docs.aws.amazon.com/lambda/latest/dg/images-create.html), but with this in mind, you will not have any issue.

Another thing to be noted on this file is that I point to the minified version of my app "bucket-to-bucket.js", so there is no need to run "npm install"

### Alternatives ###

An alternative to the Lambda container is the Lambda layer, but I am working on it because it is not straightforward.

### Performances ###

Coming soon.
