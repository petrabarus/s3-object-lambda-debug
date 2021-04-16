import * as cdk from '@aws-cdk/core';
import * as path from 'path';
import * as s3 from '@aws-cdk/aws-s3';
import * as lambda from '@aws-cdk/aws-lambda';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import * as s3object from '@aws-cdk/aws-s3objectlambda';
import * as iam from '@aws-cdk/aws-iam';

export class CdkStack extends cdk.Stack {
  private bucket: s3.Bucket;
  private lambdaFunc: lambda.Function;
  
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.createBucket();
    this.populateBucket();
    this.createFunction();
    this.createS3ObjectLambdaAccessPoint();
  }
  
  createBucket() {
    this.bucket = new s3.Bucket(this, 'Bucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    new cdk.CfnOutput(this, 'BucketName', { value: this.bucket.bucketName });
    new cdk.CfnOutput(this, 'BucketArn', { value: this.bucket.bucketArn });
  }
  
  populateBucket() {
    const assetPath = path.join(__dirname, '../../data');
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [
        s3deploy.Source.asset(assetPath)
      ],
      destinationBucket: this.bucket,
    });
  }
  
  createFunction() {
    const region = cdk.Stack.of(this).region;
    //arn:aws:lambda:ap-southeast-1:209497400698:layer:php-74:18
    const brefLayerVersion = `arn:aws:lambda:${region}:209497400698:layer:php-80:8`;
    const assetPath = path.join(__dirname, '../../lambda');
    const asset = lambda.Code.fromAsset(assetPath);
    
    this.lambdaFunc = new lambda.Function(this, 'LambdaFunction', {
      runtime: lambda.Runtime.PROVIDED_AL2,
      handler: 'src/index.php',
      layers: [
        lambda.LayerVersion.fromLayerVersionArn(this, 'BrefPHPLayer', brefLayerVersion),
      ],
      code: asset,
    });
    
    this.lambdaFunc.role!.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ['*'],
      actions: [
        's3-object-lambda:WriteGetObjectResponse',
      ],
    }));
    
    new cdk.CfnOutput(this, 'LambdaFunctionArn', { value: this.lambdaFunc.functionArn });
  }
  
  createS3ObjectLambdaAccessPoint() {
    const accessPoint = new s3.CfnAccessPoint(this, 'BucketAccessPoint', {
      bucket: this.bucket.bucketName,
      name: 'accesspoint' + this.node.uniqueId.toLowerCase(),
    });
    new cdk.CfnOutput(this, 'AccessPointName', { value: accessPoint.name! });
    
    const objectLambdaAccessPoint = new s3object.CfnAccessPoint(this, 'S3ObjectLambdaAccessPoint', {
       name: 'accesspointlambda' + this.node.uniqueId.toLowerCase(),
       objectLambdaConfiguration: {
         supportingAccessPoint: cdk.Arn.format({
           service: 's3',
           resource: 'accesspoint/' + accessPoint.name!,
         }, cdk.Stack.of(this)),
         transformationConfigurations: [
           {
             actions: [
               'GetObject'
             ],
             contentTransformation: {
               AwsLambda: {
                FunctionArn: this.lambdaFunc.functionArn, 
               }
             }
           }
         ],
       }
    });
    
    new cdk.CfnOutput(this, 'S3ObjectLambdaAccessPointURI', { 
      value: cdk.Arn.format({
           service: 's3-object-lambda',
           resource: 'accesspoint/' + objectLambdaAccessPoint.name!,
      }, cdk.Stack.of(this))
    });
  }
}
