import simplejson as json
from botocore.exceptions import ClientError
import logging
import boto3

logger = logging.getLogger(__name__)

def generate_presigned_url(s3_client, client_method, method_parameters, expires_in):
    """
    Generate a presigned Amazon S3 URL that can be used to perform an action.

    :param s3_client: A Boto3 Amazon S3 client.
    :param client_method: The name of the client method that the URL performs.
    :param method_parameters: The parameters of the specified client method.
    :param expires_in: The number of seconds the presigned URL is valid for.
    :return: The presigned URL.
    """
    try:
        url = s3_client.generate_presigned_url(
            ClientMethod=client_method, Params=method_parameters, ExpiresIn=expires_in
        )
        logger.info("Got presigned URL: %s", url)
    except ClientError:
        logger.exception(
            "Couldn't get a presigned URL for client method '%s'.", client_method
        )
        raise
    return url

def lambda_handler(event, context):
    
    db = boto3.resource('dynamodb')
    
    s3_client = boto3.client('s3')
    client_method = 'get_object'
    
    table = db.Table('audio_translation_user')
    
    username = event['queryStringParameters']['username']
    
    try:
        # retrieve data from dynamodb by username
        response = table.get_item(
            Key = {
                'username': username
            }
        )
        
        # if user exists, return empty dict
        if 'Item' in response:
            current_data = response['Item']
            audio_files = current_data['audio_data']
            
            print(list(audio_files.values())[0])
            print(json.dumps({'list': list(audio_files.values())[0]}))
            
            all_files = []
            for file in audio_files.values():
                # get presigned url
                file_format = file['original_file_name'].split('.')[-1]
                hash_filename = file['file_name'] + '.' + file_format
                method_parameters = {"Bucket": 'audio-before-translation', "Key": hash_filename}
                url = generate_presigned_url(s3_client, client_method, method_parameters, 60*60*24*7)
                
                file['presigned_url'] = url
                
                all_files.append(file)
                
            send_format = {
                "isBase64Encoded": False,
                "statusCode": 200,
                "headers": {"Access-Control-Allow-Origin" : "*", "Access-Control-Allow-Credentials" : True},
                "body": json.dumps({'list': all_files})
            }
            
            return send_format
            
        else:
            # if user does not exist, return empty list
            send_format = {
                "isBase64Encoded": False,
                "statusCode": 200,
                "headers": {"Access-Control-Allow-Origin" : "*", "Access-Control-Allow-Credentials" : True},
                "body": json.dumps({'list': []})
            }
            return send_format
        
        print(f'Audio file list sent for {username}')
    
    except Exception as e:
        print(f'Error listing audio files for {username}. {str(e)}')
    
    
    