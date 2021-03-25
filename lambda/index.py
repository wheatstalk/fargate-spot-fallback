import boto3
import os
import re
import logging


def handler(event, context):
    logging.getLogger().setLevel(logging.INFO)
    logging.info('Creating ECS client')
    ecs_client = boto3.client('ecs')

    primary_service_arn = os.environ['PRIMARY_SERVICE_ARN']
    fallback_service_arn = os.environ['FALLBACK_SERVICE_ARN']

    logging.info(f'Primary Service ARN: {primary_service_arn}')
    logging.info(f'Fallback Service ARN: {fallback_service_arn}')

    event_name = get_event_name(event)

    if event_name == 'SERVICE_TASK_PLACEMENT_FAILURE':
        logging.info('Service task failed to be placed. Initiating fallback.')
        primary_cluster_arn = extract_cluster_from_service_arn(primary_service_arn)

        logging.info(f'Describing {primary_service_arn} in cluster {primary_cluster_arn}')
        result = ecs_client.describe_services(cluster=primary_cluster_arn, services=[primary_service_arn])
        primary_service_desired_count = result['services'][0]['desiredCount']

        logging.info(f'Setting desired count of {fallback_service_arn} to {primary_service_desired_count}')
        fallback_cluster_arn = extract_cluster_from_service_arn(fallback_service_arn)
        ecs_client.update_service(cluster=fallback_cluster_arn, service=fallback_service_arn, desiredCount=primary_service_desired_count)

    elif event_name == 'SERVICE_STEADY_STATE':
        logging.info('The primary service reached steady state.')

        logging.info(f'Setting desired count of {fallback_service_arn} to 0')
        fallback_cluster_arn = extract_cluster_from_service_arn(fallback_service_arn)
        ecs_client.update_service(cluster=fallback_cluster_arn, service=fallback_service_arn, desiredCount=0)

    else:
        logging.warn(f'Received an unsupported event {event_name}')


def get_event_name(event):
    return event['detail']['eventName'] \
        if event and event['detail'] and event['detail']['eventName'] \
            else None


SERVICE_REGEX = re.compile('(^arn:.*?):service/(.*?)/')


def extract_cluster_from_service_arn(service_arn: str):
    if match := SERVICE_REGEX.match(service_arn):
        return f'{match.group(1)}:cluster/{match.group(2)}'
    else:
        raise Exception(f'Could not extract the cluster arn from the service {service_arn}')