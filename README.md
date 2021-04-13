# S3 Object Lambda Debug

## How To

1. In the directory `cdk`, execute

```bash
npm install
cdk deploy
```
It will output the CDK result including the name of the S3 Bucket, Lambda function, and ARN of the S3 Object Lambda.

2. To test execute S3 get object using AWS CLI with the S3 Object Lambda access point name as bucket parameter. E.g.

```bash
aws s3api get-object \
    --bucket arn:aws:s3-object-lambda:ap-southeast-1:12345678:accesspoint/accesspointname \
    --key data.txt data.txt
```

3. It will show error.

```text
An error occurred (LambdaRuntimeError) when calling the GetObject operation (reached max retries: 4): Lambda function failed during execution.
```

If you go to the CloudWatch monitoring, it will show.

```text
Invoke Error	
{
    "errorType": "Aws\\S3\\Exception\\S3Exception",
    "errorMessage": "Error executing \"WriteGetObjectResponse\" on \"https://io-cell001.s3-object-lambda.ap-southeast-1.amazonaws.com/WriteGetObjectResponse\"; AWS HTTP error: Client error: `POST https://io-cell001.s3-object-lambda.ap-southeast-1.amazonaws.com/WriteGetObjectResponse` resulted in a `400 Bad Request` response:\n<?xml version=\"1.0\" encoding=\"UTF-8\"?><Error xmlns=\"\"><Code>InvalidSignature</Code><Message>Invalid signature.</Message> (truncated...)\n  (client):  - <?xml version=\"1.0\" encoding=\"UTF-8\"?><Error xmlns=\"\"><Code>InvalidSignature</Code><Message>Invalid signature.</Message><RequestId>9fe6da15-xxxx-4bff-bef5-xxxxxxxx</RequestId><HostId>{host-id}</HostId></Error>",
    "stack": [
        "#0 /var/task/vendor/aws/aws-sdk-php/src/WrappedHttpHandler.php(97): Aws\\WrappedHttpHandler->parseError()",
        "#1 /var/task/vendor/guzzlehttp/promises/src/Promise.php(204): Aws\\WrappedHttpHandler->Aws\\{closure}()",
        "#2 /var/task/vendor/guzzlehttp/promises/src/Promise.php(169): GuzzleHttp\\Promise\\Promise::callHandler()",
        "#3 /var/task/vendor/guzzlehttp/promises/src/RejectedPromise.php(42): GuzzleHttp\\Promise\\Promise::GuzzleHttp\\Promise\\{closure}()",
        "#4 /var/task/vendor/guzzlehttp/promises/src/TaskQueue.php(48): GuzzleHttp\\Promise\\RejectedPromise::GuzzleHttp\\Promise\\{closure}()",
        "#5 /var/task/vendor/guzzlehttp/guzzle/src/Handler/CurlMultiHandler.php(158): GuzzleHttp\\Promise\\TaskQueue->run()",
        "#6 /var/task/vendor/guzzlehttp/guzzle/src/Handler/CurlMultiHandler.php(183): GuzzleHttp\\Handler\\CurlMultiHandler->tick()",
        "#7 /var/task/vendor/guzzlehttp/promises/src/Promise.php(248): GuzzleHttp\\Handler\\CurlMultiHandler->execute()",
        "#8 /var/task/vendor/guzzlehttp/promises/src/Promise.php(224): GuzzleHttp\\Promise\\Promise->invokeWaitFn()",
        "#9 /var/task/vendor/guzzlehttp/promises/src/Promise.php(269): GuzzleHttp\\Promise\\Promise->waitIfPending()",
        "#10 /var/task/vendor/guzzlehttp/promises/src/Promise.php(226): GuzzleHttp\\Promise\\Promise->invokeWaitList()",
        "#11 /var/task/vendor/guzzlehttp/promises/src/Promise.php(269): GuzzleHttp\\Promise\\Promise->waitIfPending()",
        "#12 /var/task/vendor/guzzlehttp/promises/src/Promise.php(226): GuzzleHttp\\Promise\\Promise->invokeWaitList()",
        "#13 /var/task/vendor/guzzlehttp/promises/src/Promise.php(62): GuzzleHttp\\Promise\\Promise->waitIfPending()",
        "#14 /var/task/vendor/aws/aws-sdk-php/src/AwsClientTrait.php(58): GuzzleHttp\\Promise\\Promise->wait()",
        "#15 /var/task/vendor/aws/aws-sdk-php/src/AwsClientTrait.php(86): Aws\\AwsClient->execute()",
        "#16 /var/task/src/index.php(24): Aws\\AwsClient->__call()",
        "#17 /var/task/vendor/bref/bref/src/Runtime/LambdaRuntime.php(110): Bref\\Runtime\\FileHandlerLocator->{closure}()",
        "#18 /opt/bref/bootstrap.php(35): Bref\\Runtime\\LambdaRuntime->processNextEvent()",
        "#19 {main}"
    ]
}
```