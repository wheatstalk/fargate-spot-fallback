import * as path from 'path';
import * as ecs from '@aws-cdk/aws-ecs';
import * as events from '@aws-cdk/aws-events';
import * as events_targets from '@aws-cdk/aws-events-targets';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as logs from '@aws-cdk/aws-logs';
import * as cdk from '@aws-cdk/core';
import { FALLBACK_SERVICE_ARN_ENV, PRIMARY_SERVICE_ARN_ENV } from './fallback-policy.EventHandler';

/**
 * Props for `FallbackPolicy`
 */
export interface FallbackPolicyProps {
  /**
   * The primary service on which to watch for capacity provisioning errors.
   */
  readonly primaryService: ecs.IService;

  /**
   * The fallback service on which to increase the desired count when
   * the primary service can't provision tasks.
   */
  readonly fallbackService: ecs.IService;
}

/**
 * Add a fallback policy for fargate capacity provisioning errors.
 */
export class FallbackPolicy extends cdk.Construct {
  /**
   * The event handler function so we can simulate capacity unavailable in
   * the integration tests.
   * @internal
   */
  public readonly _eventHandler: lambda.IFunction;

  constructor(scope: cdk.Construct, id: string, props: FallbackPolicyProps) {
    super(scope, id);

    const logRetention = logs.RetentionDays.ONE_MONTH;
    const eventLog = new logs.LogGroup(this, 'ServiceEventLog', {
      retention: logRetention,
    });

    const handler = new lambda.Function(this, 'EventHandler', {
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda')),
      handler: 'handler.handler',
      runtime: lambda.Runtime.NODEJS_12_X,
      environment: {
        [PRIMARY_SERVICE_ARN_ENV]: props.primaryService.serviceArn,
        [FALLBACK_SERVICE_ARN_ENV]: props.fallbackService.serviceArn,
      },
      logRetention: logRetention,
      initialPolicy: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['ecs:DescribeServices'],
          resources: [props.primaryService.serviceArn],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'ecs:DescribeServices',
            'ecs:UpdateService',
          ],
          resources: [props.fallbackService.serviceArn],
        }),
      ],
    });

    this._eventHandler = handler;

    new events.Rule(this, 'ServiceEventRule', {
      eventPattern: {
        source: ['aws.ecs'],
        detailType: ['ECS Service Action'],
        resources: [props.primaryService.serviceArn],
        detail: {
          eventName: ['SERVICE_STEADY_STATE', 'SERVICE_TASK_PLACEMENT_FAILURE'],
        },
      },
      targets: [
        new events_targets.CloudWatchLogGroup(eventLog),
        new events_targets.LambdaFunction(handler),
      ],
    });
  }
}