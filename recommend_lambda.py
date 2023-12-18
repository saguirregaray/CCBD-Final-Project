import simplejson as json
from botocore.exceptions import ClientError
import logging
import boto3

logger = logging.getLogger(__name__)

'''
def generate_presigned_url(s3_client, client_method, method_parameters, expires_in):
    url = ""
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
'''
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

def get_audio_file_complete(username, filename):
    db = boto3.resource('dynamodb')
    table = db.Table('audio_translation_user')

    # retrieve data from dynamodb by username
    response = table.get_item(
        Key = {
            'username': username
        }
    )
    # user must exist
    current_data = response['Item']
    audio_files = current_data['audio_data'][filename]
    
    s3_client = boto3.client('s3')
    client_method = 'get_object'
    # generate pre-signed URL
    file_format = audio_files['original_file_name'].split('.')[-1]
    hash_filename = audio_files['file_name'] + '.' + file_format
    method_parameters = {"Bucket": 'audio-before-translation', "Key": hash_filename}
    url = generate_presigned_url(s3_client, client_method, method_parameters, 60*60*24*7)
    audio_files['presigned_url'] = url
    #print(audio_file)
    return audio_files

def get_user_preference(username):
    db = boto3.resource('dynamodb')
    table = db.Table('user_preference')
    try:
        response = table.get_item(
            Key = {
                'username': username
            }
        )
        if 'Item' in response:
            current_data = response['Item']
            return current_data['perference']
        else:
            return []
    except Exception as e:
        print(f'Error trying to get user {username} preference data {str(e)}')

def mark_audio_as_seen(username, audio_files):
    db = boto3.resource('dynamodb')
    table = db.Table('user_seen_audio')
    try:
        response = table.get_item(
            Key = {
                'username': username
            }
        )
        if 'Item' in response:
            current_data = response['Item']
            for audio in audio_files:
                current_data['audio_data'][audio] = 1
            table.put_item(Item = current_data)
        else:
            new_entry = {
                'username': username,
                'audio_data': {}
            }
            for audio in audio_files:
                new_entry['audio_data'][audio] = 1
            table.put_item(Item = new_entry)
    except Exception as e:
        print(f'Error trying to get user {username} seen audio files {str(e)}')

def get_audio_file_for_label(label):
    db = boto3.resource('dynamodb')
    table = db.Table('label_to_filenames')
    try:
        response = table.get_item(
            Key = {
                'label': label
            }
        )
        if 'Item' in response:
            current_data = response['Item']
            return current_data['audio_data']
        else:
            return {}

    except Exception as e:
        print(f'Fail to get audio files related to {label} label, {str(e)}')

def get_seen_audio_file(username):
    db = boto3.resource('dynamodb')
    table = db.Table('user_seen_audio')
    try:
        response = table.get_item(
            Key = {
                'username': username
            }
        )
        if 'Item' in response:
            current_data = response['Item']
            return current_data['audio_data']
        else:
            return {}
    except Exception as e:
        print(f'Error trying to get user {username} seen audio files {str(e)}')

def lambda_handler(event, context):
    # This lambda function is for recommendating user audio files according to their preference
    username = event['queryStringParameters']['username']
    # firstly, we get the this user's preference labels'
    labels = get_user_preference(username)
    # # if this is a first time user, recommend a fix set of things
    three_unseen_audio = []
    if len(labels) == 0:
        target_username = "1e73d012-8223-4f42-a2a7-5cb5f732614f/"
        three_unseen_audio = [target_username+"blockchain.mp3", target_username+"Mississippi-State-Still-growing-while-growing-older-the-story-of-agricultural-producers-in-the-US.mp3", target_username+"Discrimination-as-a-social-determinant-of-obesity.mp3"]
    else:
        # secondly, get all audio files related to each labels
        all_audio_files = []
        for label in labels:
            all_audio_files.extend(get_audio_file_for_label(label))
        print("all_audio_files", all_audio_files)
        # thirdly, get all the files that this user have seen
        all_seen_audio = get_seen_audio_file(username)
        print("all_seen_audio", all_seen_audio)
        # fourthly, exclude all audios that the user have seen before
        recommend_audio = []
        for audio in all_audio_files:
            if audio not in all_seen_audio:
                recommend_audio.append(audio)
        # lastly, recommend the first three audio files to the user
        three_unseen_audio = [recommend_audio[0], recommend_audio[1], recommend_audio[2]]
    # mark these three files as seen
    mark_audio_as_seen(username, three_unseen_audio)
    # recommend the files back to the user
    recommendation = []
    for audio_file in three_unseen_audio:
        username, filename = audio_file.split('/')
        recommendation.append(get_audio_file_complete(username, filename))
    
    send_format = {
        "isBase64Encoded": False,
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin" : "*", "Access-Control-Allow-Credentials" : True},
        "body": json.dumps({'list': recommendation})
    }
    return send_format
