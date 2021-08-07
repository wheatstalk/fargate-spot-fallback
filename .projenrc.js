const pj = require('projen');

const project = new pj.AwsCdkConstructLibrary({
  author: 'Josh Kellendonk',
  authorAddress: 'joshkellendonk@gmail.com',
  cdkVersion: '1.73.0',
  defaultReleaseBranch: 'master',
  jsiiFqn: 'projen.AwsCdkConstructLibrary',
  name: '@wheatstalk/fargate-spot-fallback',
  repositoryUrl: 'https://github.com/wheatstalk/fargate-spot-fallback.git',
  description: 'A CDK construct that brings a fallback ECS service online when ECS cannnot acquire Fargate spot capacity.',

  keywords: [
    'ecs',
    'fargate',
    'fargate spot',
  ],

  jestOptions: {
    typescriptConfig: {
      compilerOptions: {
        lib: ['es2018', 'dom'],
      },
    },
  },

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
    'esbuild@^0.9.3',
    'ts-node@9',
    '@types/node@14',
    '@aws-sdk/client-cloudformation@3',
    '@aws-sdk/client-lambda@3',
    '@aws-sdk/client-sts@3',
    '@aws-sdk/client-ecs@3',
    '@aws-sdk/credential-provider-ini@3',
    '@aws-sdk/types@3',
  ],

  dependabot: false,
  projenUpgradeSecret: 'YARN_UPGRADE_TOKEN',
  autoApproveUpgrades: true,
  autoApproveOptions: {
    secret: 'GITHUB_TOKEN',
    allowedUsernames: ['github-actions', 'github-actions[bot]', 'misterjoshua'],
  },

  releaseEveryCommit: true,
  releaseToNpm: true,

  gitignore: [
    'cdk.out',
  ],
});

project.synth();
