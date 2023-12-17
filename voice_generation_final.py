import boto3
import json

s3 = boto3.client('s3')
client_method = 'get_object'
sns = boto3.client('sns')
dynamodb = boto3.resource('dynamodb', aws_access_key_id='AKIAQMMIZFZP2P42UUS5',
                          aws_secret_access_key='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')
table = dynamodb.Table('audio_translation_user')
polly = boto3.client('polly')


def get_presigned_url(output_bucket, output_audio_key):
    method_parameters = {"Bucket": output_bucket, "Key": output_audio_key}

    url = s3.generate_presigned_url(
        ClientMethod=client_method, Params=method_parameters, ExpiresIn=60 * 60 * 24 * 7
    )
    print("Got presigned URL: %s", url)
    return url


def lambda_handler(event, context):
    print(event)
    # Extracting data from the event received
    bucket = event['bucket']
    key = event['key']
    audio_key = event['audio_name']
    record_user_key = event['record_user_key']
    db_audio_key = event['db_audio_key']

    # Retrieve the transcription result from the specified S3 bucket
    response = s3.get_object(Bucket=bucket, Key=key)
    translated_text = response['Body'].read().decode('utf-8')

    # Generate an output speech from the translated text using Amazon Polly
    response = polly.synthesize_speech(
        Text=translated_text,
        OutputFormat='mp3',
        VoiceId='Joanna'
    )

    # Save the generated audio to S3
    output_bucket = 'output.audio.files.bucket'
    output_audio_key = f"output/path/custom_voice_{audio_key}"

    s3.put_object(
        Bucket=output_bucket,
        Key=output_audio_key,
        Body=response['AudioStream'].read()
    )

    response = table.get_item(
        Key={
            'username': record_user_key
        }
    )

    current_data = response['Item']
    current_data['audio_data'][db_audio_key]['s3_after_translation'] = get_presigned_url(output_bucket,
                                                                                         output_audio_key)
    table.put_item(Item=current_data)

    # Send notification to the frontend using SNS (mocking SNS call)
    sns_topic_arn = 'arn:aws:sns:us-east-1:303030779271:FrontEndNotification.fifo'
    message = f"Custom voice audio generated for {db_audio_key}."

    sns.publish(
        TopicArn=sns_topic_arn,
        Message=message,
        MessageGroupId='FinalTranslation'
    )

    return {
        'statusCode': 200,
        'body': 'Custom voice audio generated and SNS notification sent!'
    }
