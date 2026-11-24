import * as migration_20261124_103657_init from './20261124_103657_init';

export const migrations = [
  {
    up: migration_20261124_103657_init.up,
    down: migration_20261124_103657_init.down,
    name: '20261124_103657_init'
  },
];
