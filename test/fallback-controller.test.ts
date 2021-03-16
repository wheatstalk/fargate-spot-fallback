import * as controller from '../src/fallback-controller';

test('extracting the cluster arn', () => {
  // GIVEN
  const serviceArn = 'arn:aws:ecs:us-west-2:111122223333:service/somecluster/primary-service';

  // WHEN
  const clusterArn = controller.extractClusterFromServiceArn(serviceArn);

  // THEN
  expect(clusterArn).toEqual('arn:aws:ecs:us-west-2:111122223333:cluster/somecluster');
});
