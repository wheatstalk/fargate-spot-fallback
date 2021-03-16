import * as cdk from '@aws-cdk/core';
import { IntegPairedServices } from './integ-paired-services';

const app = new cdk.App();
new IntegPairedServices(app, 'integ-paired-services2');

app.synth();

/**
 * To manually test:
 *
 * Deploy the stack:
 * cdk --app 'ts-node src/integ/integ-paired-services.run.ts' deploy
 *
 * Simulate task placement error through restoration to steady state:
 * yarn ts-node --project tsconfig.jest.json test/integ-paired-services.e2e.ts
 */