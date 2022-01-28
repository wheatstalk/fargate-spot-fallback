import * as fs from 'fs';
import * as path from 'path';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as events from 'aws-cdk-lib/aws-events';
import * as events_targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

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
export class FallbackPolicy extends Construct {
  /**
   * The event handler function so we can simulate capacity unavailable in
   * the integration tests.
   * @internal
   */
  public readonly _eventHandler: lambda.IFunction;

  constructor(scope: Construct, id: string, props: FallbackPolicyProps) {
    super(scope, id);

    const logRetention = logs.RetentionDays.ONE_MONTH;
    const eventLog = new logs.LogGroup(this, 'ServiceEventLog', {
      retention: logRetention,
    });

    const handlerCode = fs.readFileSync(path.join(__dirname, '..', 'lambda', 'index.py')).toString();
    const handler = new lambda.Function(this, 'EventHandler', {
      code: lambda.Code.fromInline(handlerCode),
      handler: 'index.handler',
      runtime: lambda.Runtime.PYTHON_3_8,
      environment: {
        PRIMARY_SERVICE_ARN: props.primaryService.serviceArn,
        FALLBACK_SERVICE_ARN: props.fallbackService.serviceArn,
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