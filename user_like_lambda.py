import simplejson as json
import boto3

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
    return audio_files

def change_user_preference(username, labels):
    db = boto3.resource('dynamodb')
    table = db.Table('user_preference')
    for label in labels:
        try:
            response = table.get_item(
                Key = {
                    'username': username
                }
            )
            if 'Item' in response:
                current_data = response['Item']
                for label in labels:
                    current_data['perference'][label] = 1
                table.put_item(Item = current_data)
            else:
                new_entry = {
                    'username': username,
                    'perference': {}
                }
                for label in labels:
                    new_entry['perference'][label] = 1
                table.put_item(Item = new_entry)
        except Exception as e:
            print(f'Error trying to get user {username} seen audio files {str(e)}')

def lambda_handler(event, context):
    # Update User Preference according to their likes
    
    # get file meta information
    current_user, file_owner, file_name = event['queryStringParameters']['like'].split('/')
    audio_file_info = get_audio_file_complete(file_owner, file_name)
    labels = audio_file_info['labels']
    # change user preference
    change_user_preference(current_user, labels)
        
    
    send_format = {
        "isBase64Encoded": False,
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin" : "*", "Access-Control-Allow-Credentials" : True},
        "body": json.dumps({'labels': labels, "behavor": current_user + " likes " + file_owner + "'s file: " + file_name}),
    }
    return send_format
