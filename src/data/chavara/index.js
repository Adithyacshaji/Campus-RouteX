import { CHAVARA_G_NODES } from './G-nodes';
import { CHAVARA_1_NODES } from './1-nodes';
import { CHAVARA_2_NODES } from './2-nodes';
import { CHAVARA_3_NODES } from './3-nodes';
import { CHAVARA_4_NODES } from './4-nodes';
import { CHAVARA_5_NODES } from './5-nodes';
import { CHAVARA_6_NODES } from './6-nodes';

import { CHAVARA_G_EDGES } from './G-edges';
import { CHAVARA_1_EDGES } from './1-edges';
import { CHAVARA_2_EDGES } from './2-edges';
import { CHAVARA_3_EDGES } from './3-edges';
import { CHAVARA_4_EDGES } from './4-edges';
import { CHAVARA_5_EDGES } from './5-edges';
import { CHAVARA_6_EDGES } from './6-edges';

import { CHAVARA_VERTICAL } from './verticalConnections';

export const CHAVARA_NODES = {
    ...CHAVARA_G_NODES,
    ...CHAVARA_1_NODES,
    ...CHAVARA_2_NODES,
    ...CHAVARA_3_NODES,
    ...CHAVARA_4_NODES,
    ...CHAVARA_5_NODES,
    ...CHAVARA_6_NODES,
};

export const CHAVARA_EDGES = [
    ...(CHAVARA_G_EDGES || []),
    ...(CHAVARA_1_EDGES || []),
    ...(CHAVARA_2_EDGES || []),
    ...(CHAVARA_3_EDGES || []),
    ...(CHAVARA_4_EDGES || []),
    ...(CHAVARA_5_EDGES || []),
    ...(CHAVARA_6_EDGES || []),
];

export { CHAVARA_VERTICAL };
