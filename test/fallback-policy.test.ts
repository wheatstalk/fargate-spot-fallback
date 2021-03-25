import { expect as expectCDK, haveResourceLike } from '@aws-cdk/assert';
import * as ecs from '@aws-cdk/aws-ecs';
import * as cdk from '@aws-cdk/core';
import { FallbackPolicy } from '../src';

test('the policy handles the right events with a lambda', () => {
  // GIVEN
  const stack = new cdk.Stack();
  const cluster = new ecs.Cluster(stack, 'Cluster');
  const taskDefinition = new ecs.FargateTaskDefinition(stack, 'TaskDefinition');
  taskDefinition.addContainer('main', {
    image: ecs.ContainerImage.fromRegistry('nginx'),
    portMappings: [{ containerPort: 80 }],
  });
  const primaryService = new ecs.FargateService(stack, 'PrimaryService', {
    cluster,
    taskDefinition,
  });
  const fallbackService = new ecs.FargateService(stack, 'FallbackService', {
    cluster,
    taskDefinition,
  });

  // WHEN
  new FallbackPolicy(stack, 'FallbackPolicy', {
    primaryService,
    fallbackService,
  });

  // THEN
  expectCDK(stack).to(haveResourceLike('AWS::Lambda::Function', {
    Environment: {
      Variables: {
        PRIMARY_SERVICE_ARN: { Ref: 'PrimaryService89B7B602' },
        FALLBACK_SERVICE_ARN: { Ref: 'FallbackServiceA6253FBD' },
      },
    },
  }));
  expectCDK(stack).to(haveResourceLike('AWS::Events::Rule', {
    EventPattern: {
      'source': ['aws.ecs'],
      'detail-type': ['ECS Service Action'],
      'resources': [{ Ref: 'PrimaryService89B7B602' }],
      'detail': {
        eventName: [
          'SERVICE_STEADY_STATE',
          'SERVICE_TASK_PLACEMENT_FAILURE',
        ],
      },
    },
    Targets: [
      {},
      {
        Arn: { 'Fn::GetAtt': ['FallbackPolicyEventHandlerE3D90B5E', 'Arn'] },
        Id: 'Target1',
      },
    ],
  }));
});