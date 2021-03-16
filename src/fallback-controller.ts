import * as ecsSdk from '@aws-sdk/client-ecs';

/** @internal */
export interface FallbackControllerOptions {
  readonly ecsClient: ecsSdk.ECSClient;
  readonly primaryServiceArn: string;
  readonly fallbackServiceArn: string;
}

/** @internal */
export class FallbackController {
  private readonly ecsClient: ecsSdk.ECSClient;
  private readonly primaryServiceArn: string;
  private readonly fallbackServiceArn: string;

  constructor(options: FallbackControllerOptions) {
    this.ecsClient = options.ecsClient;
    this.primaryServiceArn = options.primaryServiceArn;
    this.fallbackServiceArn = options.fallbackServiceArn;
  }

  async fallback() {
    console.info(`Describing service ${this.fallbackServiceArn}`);
    const primaryService = await describeService(this.ecsClient, this.primaryServiceArn);
    const primaryServiceDesiredCount = primaryService.desiredCount!;

    console.info(`Setting desired count of ${this.fallbackServiceArn} to ${primaryServiceDesiredCount}`);
    await updateDesiredCount(this.ecsClient, this.fallbackServiceArn, primaryServiceDesiredCount);
  }

  async restore() {
    console.info(`Setting ${this.fallbackServiceArn} desiredCount to 0`);
    await updateDesiredCount(this.ecsClient, this.fallbackServiceArn, 0);
  }
}

/** @internal */
export async function describeService(ecsClient: ecsSdk.ECSClient, serviceArn: string) {
  const clusterArn = extractClusterFromServiceArn(serviceArn);
  console.info(`Describing service ${serviceArn} in cluster ${clusterArn}`);
  const serviceDescriptions = await ecsClient.send(new ecsSdk.DescribeServicesCommand({
    cluster: clusterArn,
    services: [serviceArn],
  }));

  if (!serviceDescriptions.services || serviceDescriptions.services.length === 0) {
    throw new Error(`Failed to look up the service ${serviceArn}`);
  }

  return serviceDescriptions.services[0];
}

/** @internal */
export async function updateDesiredCount(ecsClient: ecsSdk.ECSClient, serviceArn: string, desiredCount: number) {
  await ecsClient.send(new ecsSdk.UpdateServiceCommand({
    cluster: extractClusterFromServiceArn(serviceArn),
    service: serviceArn,
    desiredCount: desiredCount,
  }));
}

const SERVICE_REGEX = new RegExp('(^arn:.*?):service/(.*?)/');

/** @internal */
export function extractClusterFromServiceArn(serviceArn: string) {
  const result = SERVICE_REGEX.exec(serviceArn);

  if (result) {
    return `${result[1]}:cluster/${result[2]}`;
    // return `${result[2]}`;
  } else {
    throw new Error(`Could not extract the cluster arn from the service ${serviceArn}`);
  }
}