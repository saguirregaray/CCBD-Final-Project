import json
import boto3

def insert_label_data(labels, filename, db=None, table="label_to_filenames"):
    if not db:
        db = boto3.resource('dynamodb')
    table = db.Table(table)
    for label in labels:
        try:
            response = table.get_item(
                Key = {
                    'label': label
                }
            )
            if 'Item' in response:
                current_data = response['Item']
                current_data['audio_data'].append(filename)
                table.put_item(Item = current_data)
            else:
                new_label_data = {
                    'label': label,
                    'audio_data': [filename]
                }
                table.put_item(Item = new_label_data)
            
            print(f'Audio data inserted for label {label}')
        
        except Exception as e:
            print(f'Error inserting label {label} data {str(e)}')

def get_lex_results(query):
    
    # create lex runtime
    lex_runtime = boto3.client('lex-runtime')
    
    bot_name = 'AudioLabel'
    bot_alias = 'test'
    
    # send the user input to lex and get response
    response = lex_runtime.post_text(
            botName = bot_name,
            botAlias = bot_alias,
            userId = '200',
            inputText = query
        )
    
    # parse slot from the response
    slots = response.get('slots', '')
    
    # if slot not exist... hope this works
    if not slots:
        return []
        
    keywords = []
    
    # find all keywords lex have detected in slots
    for value in slots.values():
        keywords.append(value)
        
    return keywords

def insert_data(username, audio_item = None, db=None, table='audio_translation_user'):
    if not db:
        db = boto3.resource('dynamodb')

    table = db.Table(table)
    
    try:
        response = table.get_item(
            Key = {
                'username': username
            }
        )
        
        # if user exists, append the new audio data to the users audio item list
        if 'Item' in response:
            current_data = response['Item']
            current_data['audio_data'][audio_item['original_file_name']] = audio_item
            table.put_item(Item = current_data)
        else:
            # if user doesn't exist, create a new user entry with the audio data
            new_user_data = {
                'username': username,
                'audio_data': {audio_item['original_file_name']: audio_item}
            }
            table.put_item(Item = new_user_data)
        
        print(f'Audio data inserted for user {username}')
    
    except Exception as e:
        print(f'Error inserting user {username} data {str(e)}')

def lambda_handler(event, context):
    
    s3 = boto3.client('s3')
    
    # bucket name and the image name that triggered the event
    # key is the file name that was created in the s3
    
    bucket_name = event['Records'][0]['s3']['bucket']['name']
    audio_name = event['Records'][0]['s3']['object']['key']
    
    # bucket_name = 'audio-before-translation'
    # audio_name = '7461523245bf64f5bcff1b29210b853efd79d7fbdf497e99dfa94dc7b5c9bbd8'
    
    # get metadata from the audio file stored in s3
    audio_metadata = s3.head_object(Bucket = bucket_name, Key = audio_name)
    
    md_description = audio_metadata.get('ResponseMetadata', {}).get('HTTPHeaders', {}).get('x-amz-meta-description', '')
    md_isPublic = audio_metadata.get('ResponseMetadata', {}).get('HTTPHeaders', {}).get('x-amz-meta-ispublic', '')
    md_sourcelang = audio_metadata.get('ResponseMetadata', {}).get('HTTPHeaders', {}).get('x-amz-meta-sourcelanguage', '')
    md_targetlang = audio_metadata.get('ResponseMetadata', {}).get('HTTPHeaders', {}).get('x-amz-meta-targetlanguage', '')
    md_userEmail = audio_metadata.get('ResponseMetadata', {}).get('HTTPHeaders', {}).get('x-amz-meta-useremail', '')
    md_fileSize = audio_metadata.get('ContentLength', 0)
    md_originalFileName = audio_metadata.get('ResponseMetadata', {}).get('HTTPHeaders', {}).get('x-amz-meta-originalfilename', '')
    md_hashFileName = audio_metadata.get('ResponseMetadata', {}).get('HTTPHeaders', {}).get('x-amz-meta-hashfilename', '')
    md_username = audio_metadata.get('ResponseMetadata', {}).get('HTTPHeaders', {}).get('x-amz-meta-username', '')

    # print(md_description)
    # print(md_isPublic)
    # print(md_sourcelang)
    # print(md_targetlang)
    # print(md_userEmail)
    # print(md_fileSize)
    # print(md_originalFileName)
    # print(md_hashFileName)
    # print(md_username)
    
    # md_description = 'audio used for math'
    # md_isPublic = True
    # md_sourcelang = 'English'
    # md_targetlang = 'Spanish'
    # md_userEmail = 'temporary@gmail.com'
    # md_fileSize = 32
    # md_originalFileName = 'audio1.wav'
    # md_hashFileName = 'RANDOM_HASHED_NAME'
    # md_username = 'temp_user'
    
    # get audio labels from user inputted description from frontend
    # the format is a list of strings, in which strings are keywords
    #audio_labels_lex = get_lex_results(md_description)
    audio_labels_lex = md_description.split(',')
    for i in range(len(audio_labels_lex)):
        audio_labels_lex[i] = audio_labels_lex[i].strip()
    insert_label_data(audio_labels_lex, md_username+'/'+md_originalFileName)
    
    audio_item = {'before_path': f'http://audio-before-translation.s3-website-us-east-1.amazonaws.com/{audio_name}',
                'file_name': md_hashFileName,
                'email': md_userEmail,
                'original_file_name': md_originalFileName,
                'file_size': md_fileSize,
                'description': md_description,
                'labels': audio_labels_lex,
                'is_public': True,
                'source_language': md_sourcelang,
                'target_language': md_targetlang,
                'username': md_username
                }
                
    
    # inserting data into dynamodb
    insert_data(md_username, audio_item)
    
    # sending message through sqs that store is done
    sqs_client = boto3.client('sqs')
    queue_url = "https://sqs.us-east-1.amazonaws.com/303030779271/InitialQueue"
    
    message_body = {
        "bucket_name": bucket_name,
        "audio_key": md_originalFileName,
        "dynamodb_table_name": "audio_translation_user",
        "record_user_key": md_username
    }
    
    response = sqs_client.send_message(
        QueueUrl = queue_url,
        MessageBody = json.dumps(message_body)
    )
    
    return {
        'statusCode': 200,
        'body': response
    }