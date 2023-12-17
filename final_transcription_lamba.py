import boto3
from datetime import datetime
import time
import json

transcribe_client = boto3.client('transcribe')
lambda_client = boto3.client('lambda')
s3_client = boto3.client('s3', aws_access_key_id='*',
                         aws_secret_access_key='*')


def lambda_handler(event, context):
    print(event)
    record = event['Records'][0]
    message = record['body']
    message_data = json.loads(message)

    bucket = message_data['bucket_name']
    key = f"{message_data['audio_key']}.mp3"
    record_user_key = message_data['record_user_key']
    db_audio_key = message_data['db_audio_key']

    print(f'Starting transcription process for object s3://{bucket}/{key}')

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    output_transcribe_file = f"transcription/{key.split('/')[-1].split('.')[0]}_{timestamp}.txt"

    # Retrieve the object from S3
    response = s3_client.get_object(Bucket=bucket, Key=key)
    print(response)

    job_name = f'Transcribe_{key}_{timestamp}'
    transcribe_response = transcribe_client.start_transcription_job(
        TranscriptionJobName=job_name,
        LanguageCode='en-US',
        MediaFormat='mp3',
        Media={
            'MediaFileUri': f"s3://{bucket}/{key}"
        },
        OutputBucketName='transcription.results.bucket',
        OutputKey=output_transcribe_file
    )

    # Wait for the transcription job to complete
    while True:
        status = transcribe_client.get_transcription_job(
            TranscriptionJobName=job_name
        )['TranscriptionJob']['TranscriptionJobStatus']

        if status in ['COMPLETED', 'FAILED']:
            break

        time.sleep(3)

    if status == 'COMPLETED':
        # Retrieve the transcription file content from S3
        s3 = boto3.client('s3')
        response = s3.get_object(Bucket='transcription.results.bucket', Key=output_transcribe_file)
        transcription_text = json.loads(response['Body'].read().decode('utf-8'))['results']['transcripts'][0][
            'transcript']

        print(f'Transcribed text: {transcription_text}')

        # Upload transcription result to S3
        result_bucket = 'transcription.results.bucket'
        result_key = f"transcription_results/{job_name}.txt"  # Modify the path and file name as needed
        s3.put_object(
            Bucket=result_bucket,
            Key=result_key,
            Body=transcription_text.encode('utf-8')
        )

        # Trigger the other Lambda function asynchronously using S3 as an event source
        lambda_client.invoke(
            FunctionName='Translation',  # Replace with the name of your second Lambda function
            InvocationType='Event',
            Payload=json.dumps(
                {'bucket': result_bucket, 'key': result_key, 'audio_name': key, 'record_user_key': record_user_key,
                 'db_audio_key': db_audio_key})
        )

        return {
            'statusCode': 200,
            'body': 'Transcription completed and triggered processing of the result!'
        }
    else:
        return {
            'statusCode': 500,
            'body': 'Transcription job failed!'
        }
