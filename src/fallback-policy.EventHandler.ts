import * as ecsSdk from '@aws-sdk/client-ecs';
import { FallbackController } from './fallback-controller';

/** @internal */
export const PRIMARY_SERVICE_ARN_ENV = 'PRIMARY_SERVICE_ARN';
/** @internal */
export const FALLBACK_SERVICE_ARN_ENV = 'FALLBACK_SERVICE_ARN';

/** @internal */
export async function handler(event: any) {
  console.info(`Creating ECS client for ${process.env.AWS_REGION}`);
  const ecsClient = new ecsSdk.ECSClient({
    region: process.env.AWS_REGION,
  });

  const eventName = getEventName(event);

  const primaryServiceArn = process.env[PRIMARY_SERVICE_ARN_ENV];
  const fallbackServiceArn = process.env[FALLBACK_SERVICE_ARN_ENV];

  if (!primaryServiceArn) {
    throw new Error('Primary Service ARN environment variable not set');
  }

  if (!fallbackServiceArn) {
    throw new Error('Fallback Service ARN environment variable not set');
  }

  console.info('Creating FallbackController for services:');
  console.info(`Primary Service ARN: ${primaryServiceArn}`);
  console.info(`Fallback Service ARN: ${primaryServiceArn}`);
  const fallbackController = new FallbackController({
    ecsClient,
    primaryServiceArn,
    fallbackServiceArn,
  });

  switch (eventName) {
    case 'SERVICE_TASK_PLACEMENT_FAILURE':
      console.info('Service task failed to be placed. Initiating fallback');
      await fallbackController.fallback();
      break;
    case 'SERVICE_STEADY_STATE':
      console.info('The primary service reached steady state.');
      await fallbackController.restore();
      break;
    default:
      console.warn(`Received an unsupported event: ${eventName}`);
  }
}

export function getEventName(event: any) {
  if (event && event.detail && event.detail.eventName) {
    return event.detail.eventName;
  } else {
    return undefined;
  }
}