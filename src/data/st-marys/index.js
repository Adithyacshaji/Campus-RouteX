import { ST_MARYS_B2_NODES } from './B2-nodes';
import { ST_MARYS_B1_NODES } from './B1-nodes';
import { ST_MARYS_G_NODES } from './G-nodes';
import { ST_MARYS_1_NODES } from './1-nodes';
import { ST_MARYS_2_NODES } from './2-nodes';

import { ST_MARYS_B2_EDGES } from './B2-edges';
import { ST_MARYS_B1_EDGES } from './B1-edges';
import { ST_MARYS_G_EDGES } from './G-edges';
import { ST_MARYS_1_EDGES } from './1-edges';
import { ST_MARYS_2_EDGES } from './2-edges';

import { ST_MARYS_VERTICAL } from './verticalConnections';

export const ST_MARYS_NODES = {
    ...ST_MARYS_B2_NODES,
    ...ST_MARYS_B1_NODES,
    ...ST_MARYS_G_NODES,
    ...ST_MARYS_1_NODES,
    ...ST_MARYS_2_NODES,
};

export const ST_MARYS_EDGES = [
    ...(ST_MARYS_B2_EDGES || []),
    ...(ST_MARYS_B1_EDGES || []),
    ...(ST_MARYS_G_EDGES || []),
    ...(ST_MARYS_1_EDGES || []),
    ...(ST_MARYS_2_EDGES || []),
];

export { ST_MARYS_VERTICAL };
