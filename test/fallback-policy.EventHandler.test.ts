import * as fs from 'fs';
import * as path from 'path';

import { getEventName } from '../src/fallback-policy.EventHandler';

test('parsing the steady state event', () => {
  // GIVEN
  const event = JSON.parse(fs.readFileSync(path.join(__dirname, 'events', 'steady-state.json')).toString());

  // WHEN
  const eventName = getEventName(event);

  // THEN
  expect(eventName).toEqual('SERVICE_STEADY_STATE');
});

test('parsing task placement failure event', () => {
  // GIVEN
  const event = JSON.parse(fs.readFileSync(path.join(__dirname, 'events', 'task-placement-failure.json')).toString());

  // WHEN
  const eventName = getEventName(event);

  // THEN
  expect(eventName).toEqual('SERVICE_TASK_PLACEMENT_FAILURE');
});

test('parsing unknown event', () => {
  // GIVEN
  const event = JSON.parse(fs.readFileSync(path.join(__dirname, 'events', 'unknown.json')).toString());

  // WHEN
  const eventName = getEventName(event);

  // THEN
  expect(eventName).toBeUndefined();
});