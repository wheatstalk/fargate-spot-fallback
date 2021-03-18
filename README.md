# Fargate Spot Fallback Construct

[![Release](https://github.com/wheatstalk/fargate-spot-fallback/actions/workflows/release.yml/badge.svg)](https://github.com/wheatstalk/fargate-spot-fallback/actions/workflows/release.yml)
[![npm](https://img.shields.io/npm/v/@wheatstalk/fargate-spot-fallback)](https://www.npmjs.com/package/@wheatstalk/fargate-spot-fallback)

This construct links a fallback ECS service to your Fargate Spot service so
that if ECS cannot acquire any Fargate Spot capacity, the fallback service's
`desiredCount` is increased to your primary service's desired count. When
your primary service returns to a steady state, the construct will return the
fallback service to zero desired count.

## Example

```ts
// Define your task
const taskDefinition = new ecs.FargateTaskDefinition(this, 'Primary');
taskDefinition.addContainer('web', {
  image: ecs.ContainerImage.fromRegistry('nginx:1'),
  portMappings: [{ containerPort: 80 }],
});

// Create your primary service with Fargate Spot
const primaryService = new ecs.FargateService(this, 'PrimaryService', {
  cluster,
  taskDefinition,
  capacityProviderStrategies: [{ capacityProvider: 'FARGATE_SPOT', weight: 1 }],
  desiredCount: 10,
});

// Create a fallback service with on-demand Fargate and a desired count of
// zero. This service should be the same as your primary service, except
// with a different capacity provider and an initial desired count of zero.
const fallbackService = new ecs.FargateService(this, 'FallbackService', {
  cluster,
  taskDefinition,
  capacityProviderStrategies: [{ capacityProvider: 'FARGATE', weight: 1 }],
  desiredCount: 0,
});

// Create the fallback policy which increases the fallback service's desired
// count when the primary service can't provision tasks.
const policy = new FallbackPolicy(this, 'FallbackPolicy', {
  primaryService,
  fallbackService,
});
```
