import boto3
import json

translate_client = boto3.client('translate')
s3 = boto3.client('s3')
lambda_client = boto3.client('lambda')


def lambda_handler(event, context):
    print(f"Event: {event}")

    # Extract information from the event triggered by the transcription Lambda
    bucket = event['bucket']
    key = event['key']
    audio_name = event['audio_name']
    record_user_key = event['record_user_key']
    db_audio_key = event['db_audio_key']

    print(f'Starting translation for audio: {audio_name}')

    # Retrieve the transcription result from the specified S3 bucket
    response = s3.get_object(Bucket=bucket, Key=key)
    transcription_text = response['Body'].read().decode('utf-8')

    # Translate the retrieved transcription text
    translation_response = translate_client.translate_text(
        Text=transcription_text,
        SourceLanguageCode='en',
        TargetLanguageCode='es'
    )

    translated_text = translation_response['TranslatedText']

    print(f'Translated text: {translated_text}')

    # Save the translated text to an S3 bucket
    translation_bucket = 'translation.results.bucket'
    translation_key = f"translations/{audio_name.split('/')[-1].split('.')[0]}_translated.txt"

    s3.put_object(
        Bucket=translation_bucket,
        Key=translation_key,
        Body=translated_text.encode('utf-8')
    )

    # Invoke the third Lambda function with the translated text
    lambda_client.invoke(
        FunctionName='VoiceGeneration',
        InvocationType='Event',
        Payload=json.dumps({'bucket': translation_bucket, 'key': translation_key, 'audio_name': audio_name,
                            'record_user_key': record_user_key, 'db_audio_key': db_audio_key})
    )

    return {
        'statusCode': 200,
        'body': 'Translation completed and triggered the third Lambda function!'
    }
