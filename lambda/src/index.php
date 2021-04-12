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
    
    $s3Client = new S3Client([
        'version' => '2006-03-01',
        'region' => $_ENV['AWS_REGION'],
    ]);
    $requestRoute = $getObjectContext['outputRoute'];
    $requestToken = $getObjectContext['outputToken'];
    $s3Client->writeGetObjectResponse([
        'Body' => strtoupper($contents),
        'RequestRoute' => $requestRoute,
        'RequestToken' => $requestToken,
    ]);
    
    var_dump($contents);
    
    return [
        'statusCode' => 200,
    ];
};
