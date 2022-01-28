const { awscdk } = require('projen');

const project = new awscdk.AwsCdkConstructLibrary({
  name: '@wheatstalk/fargate-spot-fallback',
  author: 'Josh Kellendonk',
  authorAddress: 'joshkellendonk@gmail.com',
  repositoryUrl: 'https://github.com/wheatstalk/fargate-spot-fallback.git',
  description: 'A CDK construct that brings a fallback ECS service online when ECS cannnot acquire Fargate spot capacity.',

  cdkVersion: '2.0.0',
  defaultReleaseBranch: 'main',

  keywords: [
    'ecs',
    'fargate',
    'fargate spot',
  ],

  devDeps: [
    'ts-node@9',
    '@aws-sdk/client-cloudformation@3',
    '@aws-sdk/client-lambda@3',
    '@aws-sdk/client-sts@3',
    '@aws-sdk/client-ecs@3',
    '@aws-sdk/credential-provider-ini@3',
    '@aws-sdk/types@3',
  ],

  autoApproveUpgrades: true,
  autoApproveOptions: {
    allowedUsernames: ['github-actions', 'github-actions[bot]', 'misterjoshua'],
  },

  releaseToNpm: true,
});

project.addTask('integ:paired-services:test', {
  exec: 'ts-node --project tsconfig.dev.json test/paired-services.run.ts',
});

project.upgradeWorkflow.postUpgradeTask.spawn(
  project.tasks.tryFind('integ:snapshot-all'),
);

project.synth();
