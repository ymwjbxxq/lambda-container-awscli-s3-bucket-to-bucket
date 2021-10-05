FROM public.ecr.aws/lambda/nodejs:14
RUN yum install -y awscli
COPY bucket-to-bucket.js ./

CMD ["bucket-to-bucket.startExecution"]