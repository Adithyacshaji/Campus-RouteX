export const BUILDING_ENTRANCES = {
  "st-marys": "st-marys",
  "main-block": "main-block",
  "library": "library",
  "canteen": "canteen",
  "admin-block": "admin-block",
};
export const INDOOR_EDGES = [


  //G
  // entrance connections
  ["entrance_G", "stairsA_G"],
  // ["entrance_G", "co_5_G"],
  ["entrance_G", "co_7_G"],
  // ["entrance_G", "N301"],
  ["entrance_G", "co_8_G"],


  // stairsA – lobby side
  // ["stairsA_G", "co_5_G"],
  ["stairsA_G", "co_7_G"],


  // stairsB – top-left, connects to top corridor
  ["stairsB_G", "co_1_G"],

  // lift – connects to co_3_G (mid top corridor) and co_7_G
  ["lift_G", "co_3_G"],
  ["lift_G", "co_6_G"],

  // ── Top corridor (left → right): co_1 ↔️ co_2 ↔️ co_3 ↔️ co_4 ──
  ["co_1_G", "co_2_G"],
  ["co_2_G", "co_3_G"],
  ["co_3_G", "co_4_G"],
  ["co_8_G", "co_5_G"],
  ["co_8_G", "co_7_G"],
  ["co_8_G", "N301"],

  // ── Top-corridor room spurs ──
  ["co_1_G", "N312"],
  ["co_2_G", "N312"],
  ["co_1_G", "N311"],
  ["co_2_G", "N313"],
  ["co_2_G", "N314"],
  ["co_2_G", "N311"],
  // ["co_2_G", "N316"],
  // ["co_2_G", "N318"],
  // ["co_7_G", "N310"],
  ["co_3_G", "N308"],
  ["co_3_G", "co_6_G"],   // vertical corridor down-left

  // ── Right corridor (top → bottom): co_4 ──
  ["co_4_G", "N307"],
  ["co_4_G", "N306"],
  ["co_4_G", "N305"],
  ["co_4_G", "N303"],
  ["co_5_G", "N303"],
  ["co_4_G", "N304"],
   ["co_4_G", "N308"],
  ["N304", "N305"],     // N305 accessible through N304

  // ── co_4 down to co_5 (right-side vertical corridor) ──
  ["co_4_G", "co_5_G"],
  ["co_5_G", "N302"],
  ["co_5_G", "N301"],
  ["co_5_G", "N320"],
  ["co_9_G", "N320"],
  ["co_9_G", "N319"],

  // ── Left vertical corridor: co_6 ──
  ["co_6_G", "N319"],
  ["co_7_G", "N319"],
  // ["co_6_G", "co_5_G"],
  ["co_7_G", "co_6_G"],
  ["co_7_G", "co_9_G"],
  ["co_9_G", "co_6_G"],
  ["co_3_G", "co_7_G"],
  // ["stairsA_G", "co_6_G"],



  //B2
  // ── Entrance connections ──
  ["entrance_B2", "stairsB_B2"],
  ["entrance_B2", "co_1_B2"],

  // ── stairs connects to top corridor ──
  ["stairsB_B2", "co_1_B2"],

  // ── lift connects to mid corridor ──
  ["lift_B2", "co_2_B2"],

  // ── Main corridor spine (top → bottom): co_1 ↔️ co_2 ↔️ co_3 ──
  ["co_1_B2", "co_2_B2"],
  ["co_2_B2", "co_3_B2"],

  // ── co_1 room spurs (top section) ──
  ["co_1_B2", "N101"],
  ["co_1_B2", "N102"],
  ["co_1_B2", "N106"],

  // ── co_2 room spurs (middle section) ──
  ["co_2_B2", "N101"],
  ["co_2_B2", "N102"],
  ["co_2_B2", "N103"],

  // ── co_3 room spurs (right/bottom section) ──
  ["co_3_B2", "N105"],
  ["co_3_B2", "N104"],



  //B1
  // ── Entrance → RIGHT along bottom corridor ──
  // ["entrance_B1", "co_6_B1"],

  // ── Entrance → LEFT for left-side rooms ──
  ["entrance_B1", "co_5_B1"],
  ["entrance_B1", "co_8_B1"],

  ["co_5_B1", "co_10_B1"],
  ["co_4_B1", "co_10_B1"],
  ["co_4_B1", "co_2_B1"],
  ["co_8_B1", "co_6_B1"],
  ["co_6_B1", "co_7_B1"],
  ["co_3_B1", "co_7_B1"],
  ["co_2_B1", "co_3_B1"],
  ["co_2_B1", "co_1_B1"],
  ["co_9_B1", "co_3_B1"],


  ["stairsA_B1", "co_8_B1"],
  ["stairsA_B1", "N201"],
  ["co_5_B1", "stairsA_B1"],

  ["lift_B1", "co_4_B1"],
  ["lift_B1", "co_2_B1"],



  ["co_8_B1", "N202"],
  ["co_6_B1", "N203"],
  ["co_6_B1", "N204"],

  ["N206", "co_7_B1"],

  ["N206", "co_3_B1"],

  ["co_2_B1", "N211"],
  ["co_2_B1", "N212"],

  ["co_1_B1", "N212"],
  ["co_2_B1", "N210"],

  ["N209", "co_3_B1"],
  ["N208", "co_3_B1"],

  ["N208", "co_9_B1"],
  ["N207", "co_9_B1"],

  ["co_5_B1", "N205"],
  ["co_10_B1", "N216"],
  ["co_5_B1", "N201"],

  ["co_4_B1", "N214"],
  ["N205", "co_5_B1"],



  //F1

  // ─────────────────────────────────────────
  // Stair / Lift Connections
  // ─────────────────────────────────────────
  ["stairsA_F1", "co_4_F1"],
  ["stairsA_F1", "co_5_F1"],

  ["stairsB_F1", "co_1_F1"],

  ["lift_F1", "co_2_F1"],

  // ─────────────────────────────────────────
  // Main Upper Corridor
  // co_1 → co_2 → co_7
  // ─────────────────────────────────────────
  ["co_1_F1", "co_10_F1"],
  ["co_2_F1", "co_10_F1"],

  // ─────────────────────────────────────────
  // Main Lower Corridor
  // co_4 → co_5 → co_6 → co_7
  // ─────────────────────────────────────────
  ["co_4_F1", "co_5_F1"],
  ["co_4_F1", "co_3_F1"],
  ["co_5_F1", "co_6_F1"],
  ["co_6_F1", "co_7_F1"],

  // Vertical Corridor (left side)
  ["co_2_F1", "co_3_F1"],

  // Vertical Corridor (right side)
  // ["co_7_F1", "co_6_F1"],

  ["co_8_F1", "co_7_F1"],
  ["co_8_F1", "co_2_F1"],

  ["co_9_F1", "co_7_F1"],


  // ─────────────────────────────────────────
  // Top Row Rooms
  // ─────────────────────────────────────────
  ["co_1_F1", "N402"],
  ["co_2_F1", "N403"],
  ["co_8_F1", "N403"],
  ["co_8_F1", "N404"],
  ["co_2_F1", "N404"],
  // ["co_2_F1", "N405"],
  ["co_7_F1", "N405"],
  // ["co_2_F1", "N412"],

  // ─────────────────────────────────────────
  // Left Wing Rooms
  // ─────────────────────────────────────────
  ["co_3_F1", "N401"],
  ["co_3_F1", "N400"],
  // ["co_3_F1", "N411"],


  ["co_4_F1", "N411"],

  ["co_5_F1", "N410"],
  ["co_5_F1", "N409"],


  // ─────────────────────────────────────────
  // Right Wing Rooms
  // ─────────────────────────────────────────
  ["co_6_F1", "N408"],
  ["co_6_F1", "N409"],
  ["co_6_F1", "N410"],
  // ["co_6_F1", "N412"],

  // ["co_7_F1", "N412"],
  ["co_7_F1", "N407"],
  ["co_6_F1", "N407"],
  ["co_7_F1", "N408"],

  ["co_8_F1", "N401"],

  ["co_9_F1", "N405"],
  ["co_9_F1", "N406"],
  ["co_9_F1", "N413"],
  ["co_9_F1", "N412"],
  ["co_10_F1", "N402"],
  ["co_10_F1", "N403"],


  // STAIRS A
  ["stairsA_B1", "stairsA_G"],
  ["stairsA_G", "stairsA_F1"],
  ["stairsA_F1", "stairsA_F2"],

  // STAIRS B
  ["stairsB_B2", "stairsB_B1"],
  ["stairsB_B1", "stairsB_G"],
  ["stairsB_G", "stairsB_F1"],
  ["stairsB_F1", "stairsB_F2"],

  // LIFT
  ["lift_B2", "lift_B1"],
  ["lift_B1", "lift_G"],
  ["lift_G", "lift_F1"],
  ["lift_F1", "lift_F2"],

  //floor2

  ["stairsA_F2", "co_5_F2"],
  ["stairsA_F2", "co_6_F2"],
  ["stairsB_F2", "co_1_F2"],
  ["lift_F2", "co_3_F2"],
  ["lift_F2", "co_2_F2"],

  ["co_1_F2", "co_2_F2"],
  ["co_2_F2", "co_8_F2"],
  ["co_8_F2", "co_9_F2"],

  ["co_4_F2", "co_5_F2"],
  ["co_6_F2", "co_7_F2"],

  ["co_2_F2", "co_3_F2"],
  ["co_3_F2", "co_4_F2"],

  ["co_8_F2", "co_7_F2"],

  ["co_1_F2", "N504"],
  ["co_2_F2", "N505"],
  ["co_2_F2", "N506"],
  ["co_8_F2", "N507"],
  ["co_8_F2", "N508"],
  ["co_9_F2", "N509"],

  ["co_3_F2", "N503"],
  ["co_3_F2", "N502"],
  ["co_4_F2", "N502"],
  ["co_5_F2", "N501"],

  ["co_7_F2", "N513"],
  ["co_7_F2", "N514"],
  ["co_6_F2", "N515"],
  ["co_8_F2", "N511"],
  ["co_8_F2", "N512"],
  ["co_7_F2", "N512"],
  ["co_6_F2", "N514"],
  ["co_6_F2", "N515"],

];