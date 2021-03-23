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

  workflowContainerImage: 'wheatstalk/jsii-superchain:working',

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

  bundledDeps: [
    '@aws-sdk/client-ecs@3',
  ],

  devDeps: [
    'esbuild@^0.9.3',
    'ts-node@9',
    '@types/node@14',
    '@aws-sdk/client-cloudformation@3',
    '@aws-sdk/client-lambda@3',
    '@aws-sdk/client-sts@3',
    '@aws-sdk/credential-provider-ini@3',
    '@aws-sdk/types@3',
  ],

  dependabot: false,
  releaseEveryCommit: true,
  releaseToNpm: true,
});

project.gitignore.exclude('cdk.out');

project.buildTask.prependExec('esbuild --bundle src/fallback-policy.EventHandler.ts --platform=node --outfile=lambda/handler.js');
project.buildTask.prependSay('rm -fr lambda');
project.buildTask.prependSay('Building lambda');
project.npmignore.include('!/lambda', '!/lambda/*.js');
project.gitignore.exclude('/lambda');

const yarnUp = project.github.addWorkflow('yarn-upgrade');

yarnUp.on({
  schedule: [{ cron: '0 4 * * *' }],
  workflow_dispatch: {},
});

yarnUp.addJobs({
  upgrade: {
    'name': 'Yarn Upgrade',
    'runs-on': 'ubuntu-latest',
    'steps': [
      { uses: 'actions/checkout@v2' },
      { run: 'yarn upgrade' },
      { run: 'git diff' },
      { run: 'CI="" npx projen' },
      { run: 'yarn build' },
      {
        name: 'Create Pull Request',
        uses: 'peter-evans/create-pull-request@v3',
        with: {
          'title': 'chore: automatic yarn upgrade',
          'commit-message': 'chore: automatic yarn upgrade',
          'token': '${{ secrets.YARN_UPGRADE_TOKEN }}',
          'labels': 'auto-merge',
        },
      },
    ],
  },
});

project.synth();
