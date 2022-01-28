const { awscdk } = require('projen');

const project = new awscdk.AwsCdkConstructLibrary({
  name: '@wheatstalk/fargate-spot-fallback',
  author: 'Josh Kellendonk',
  authorAddress: 'joshkellendonk@gmail.com',
  repositoryUrl: 'https://github.com/wheatstalk/fargate-spot-fallback.git',
  description: 'A CDK construct that brings a fallback ECS service online when ECS cannnot acquire Fargate spot capacity.',

  cdkVersion: '1.73.0',
  defaultReleaseBranch: 'master',

  keywords: [
    'ecs',
    'fargate',
    'fargate spot',
  ],

  cdkDependencies: [
    '@aws-cdk/core',
    '@aws-cdk/aws-ecs',
    '@aws-cdk/aws-ec2',
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-events',
    '@aws-cdk/aws-events-targets',
    '@aws-cdk/aws-logs',
    '@aws-cdk/aws-iam',
  ],

  cdkTestDependencies: [
    '@aws-cdk/assert',
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

  releaseEveryCommit: false,
  releaseToNpm: true,

  // gitignore: [
  //   'cdk.out',
  // ],
});

project.synth();
