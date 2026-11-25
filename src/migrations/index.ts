import * as migration_20261124_103657_init from './20261124_103657_init';
import * as migration_20261125_081916_certificates from './20261125_081916_certificates';

export const migrations = [
  {
    up: migration_20261124_103657_init.up,
    down: migration_20261124_103657_init.down,
    name: '20261124_103657_init',
  },
  {
    up: migration_20261125_081916_certificates.up,
    down: migration_20261125_081916_certificates.down,
    name: '20261125_081916_certificates'
  },
];
