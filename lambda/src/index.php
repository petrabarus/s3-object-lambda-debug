<?php declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Aws\S3\S3Client;
use GuzzleHttp\Client as GuzzleClient;

return function ($event, $context) {
    $getObjectContext = $event['getObjectContext'];
    $url = $getObjectContext['inputS3Url'];
    $client = new GuzzleClient();
    $response = $client->get($url);
    $contents = (string) $response->getBody();
    
    $region = $_ENV['AWS_REGION'];
    $s3Client = new S3Client([
        'version' => '2006-03-01',
        'region' => $region,
        //S3 Object Lambda workaround
        //https://stackoverflow.com/a/66800385/688954
        // 'endpoint' => "s3-object-lambda.{$region}.amazonaws.com",
        // 'api' => [
        //     'metadata' => [
        //         'endpointPrefix' => 's3-object-lambda',
        //     ]
        // ]
        //
    ]);
    $requestRoute = $getObjectContext['outputRoute'];
    $requestToken = $getObjectContext['outputToken'];
    $newBody = strtoupper($contents);
    var_dump($newBody);
    try {
         $response = $s3Client->writeGetObjectResponse([
            'Body' => $newBody,
            'RequestRoute' => $requestRoute,
            'RequestToken' => $requestToken,
        ]);   
    } catch (\Exception $ex) {
        var_dump($ex->getMessage);
    }
    var_dump($response);
    
    return [
        'statusCode' => 200,
    ];
};
