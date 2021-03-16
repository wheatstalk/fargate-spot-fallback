import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as cdk from '@aws-cdk/core';
import { FallbackPolicy } from '../fallback-policy';

export class IntegPairedServices extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps = {}) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'Vpc', {
      subnetConfiguration: [{
        name: 'public',
        subnetType: ec2.SubnetType.PUBLIC,
      }],
    });

    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc,
      capacityProviders: ['FARGATE_SPOT', 'FARGATE'],
    });

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'Primary');

    taskDefinition.addContainer('web', {
      image: ecs.ContainerImage.fromRegistry('nginx:1'),
      portMappings: [{ containerPort: 80 }],
    });

    const primaryService = new ecs.FargateService(this, 'PrimaryService', {
      cluster,
      taskDefinition,
      capacityProviderStrategies: [{ capacityProvider: 'FARGATE_SPOT', weight: 1 }],
      assignPublicIp: true,
      desiredCount: 10,
    });

    const fallbackService = new ecs.FargateService(this, 'FallbackService', {
      cluster,
      taskDefinition,
      capacityProviderStrategies: [{ capacityProvider: 'FARGATE', weight: 1 }],
      assignPublicIp: true,
      desiredCount: 0,
    });

    const policy = new FallbackPolicy(this, 'FallbackPolicy', {
      primaryService,
      fallbackService,
    });

    // Outputs for the fallback simulation.
    new cdk.CfnOutput(this, 'PrimaryServiceArn', { value: primaryService.serviceArn });
    new cdk.CfnOutput(this, 'FallbackServiceArn', { value: fallbackService.serviceArn });
    new cdk.CfnOutput(this, 'EventHandler', { value: policy._eventHandler.functionName });
  }
}
