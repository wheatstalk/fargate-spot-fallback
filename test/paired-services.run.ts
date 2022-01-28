import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import * as cloudformation from '@aws-sdk/client-cloudformation';
import * as ecsSdk from '@aws-sdk/client-ecs';
import * as lambdaSdk from '@aws-sdk/client-lambda';
import * as stsSdk from '@aws-sdk/client-sts';
import * as credentialProviderIni from '@aws-sdk/credential-provider-ini';
import * as sdkTypes from '@aws-sdk/types';

// Ridiculous credential getter for aws sdk v3 feature regression. This lets
// you use assumed roles from your ~/.aws/config and credentials file.
const roleAssumer = async (
  credentials: sdkTypes.Credentials,
  params: credentialProviderIni.AssumeRoleParams,
): Promise<sdkTypes.Credentials> => {
  const client = new stsSdk.STSClient({ credentials });
  const result = await client.send(new stsSdk.AssumeRoleCommand(params));
  return {
    secretAccessKey: result.Credentials!.SecretAccessKey!,
    accessKeyId: result.Credentials!.AccessKeyId!,
    sessionToken: result.Credentials!.SessionToken!,
    expiration: result.Credentials!.Expiration!,
  };
};

const credentials = credentialProviderIni.fromIni({ roleAssumer });
const CLOUDFORMATIONV3 = new cloudformation.CloudFormationClient({ credentials });
const ECSV3 = new ecsSdk.ECSClient({ credentials });
const LAMBDAV3 = new lambdaSdk.LambdaClient({ credentials });

const STACK_NAME = 'integ-paired-services2';
const STEADY_STATE_EVENT = fs.readFileSync(path.join(__dirname, 'events', 'steady-state.json')).toString();
const TASK_PLACEMENT_FAILURE_EVENT = fs.readFileSync(path.join(__dirname, 'events', 'task-placement-failure.json')).toString();

async function main() {
  const outputs = await getStackOutputs();
  await updateDesiredCount(ECSV3, outputs.fallbackServiceArn, 0);
  await checkDesiredCount(outputs.fallbackServiceArn, 0);
  await simulateError(outputs);
  await checkDesiredCount(outputs.fallbackServiceArn, 10);
  await simulateSteadyState(outputs);
  await checkDesiredCount(outputs.fallbackServiceArn, 0);
}

async function simulateError(outputs: StackOutputs) {
  console.info(`Invoking ${outputs.eventHandler}`);
  const result = await LAMBDAV3.send(new lambdaSdk.InvokeCommand({
    FunctionName: outputs.eventHandler,
    Payload: Buffer.from(TASK_PLACEMENT_FAILURE_EVENT),
    LogType: 'Tail',
  }));

  console.info(`Log output:\n${Buffer.from(result.LogResult!, 'base64').toString()}`);
}

async function simulateSteadyState(outputs: StackOutputs) {
  console.info(`Invoking ${outputs.eventHandler}`);

  const result = await LAMBDAV3.send(new lambdaSdk.InvokeCommand({
    FunctionName: outputs.eventHandler,
    Payload: Buffer.from(STEADY_STATE_EVENT),
    LogType: 'Tail',
  }));

  console.info(`Log output:\n${Buffer.from(result.LogResult!, 'base64').toString()}`);
}

async function checkDesiredCount(serviceArn: string, desiredCount: number) {
  const service = await describeService(ECSV3, serviceArn);
  if (service.desiredCount === desiredCount) {
    console.info(`Desired count is ${service.desiredCount}`);
  } else {
    throw new Error(`The desired count is ${service.desiredCount} but we expected ${desiredCount}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });


interface StackOutputs {
  readonly primaryServiceArn: string;
  readonly fallbackServiceArn: string;
  readonly eventHandler: string;
}

async function getStackOutputs(): Promise<StackOutputs> {
  console.info(`Looking up stack outputs from ${STACK_NAME}`);
  const stacks = await CLOUDFORMATIONV3.send(new cloudformation.DescribeStacksCommand({
    StackName: STACK_NAME,
  }));

  if (!stacks.Stacks || stacks.Stacks.length === 0) {
    throw new Error('Cannot find stack. Did you deploy?');
  }
  const stackOutputs = stacks.Stacks[0].Outputs;

  const primaryServiceArn = stackOutputs?.find(o => o.OutputKey === 'PrimaryServiceArn')!.OutputValue!;
  const fallbackServiceArn = stackOutputs?.find(o => o.OutputKey === 'FallbackServiceArn')!.OutputValue!;
  const eventHandler = stackOutputs?.find(o => o.OutputKey === 'EventHandler')!.OutputValue!;

  return {
    primaryServiceArn,
    fallbackServiceArn,
    eventHandler,
  };
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