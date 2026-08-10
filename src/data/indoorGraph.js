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
  ["entrance_G", "co_13_G"],
  ["stairsA_G", "co_13_G"],
  ["stairsB_G", "co_1_G"],
  ["lift_G", "co_9_G"],


  ["co_13_G", "co_12_G"],
  ["co_13_G", "co_14_G"],
  ["co_12_G", "co_11_G"],
  ["co_11_G", "co_10_G"],
  ["co_10_G", "co_9_G"],
  ["co_9_G", "co_19_G"],
  ["co_3_G", "co_19_G"],
  ["co_3_G", "co_2_G"],
  ["co_1_G", "co_2_G"],
  ["co_4_G", "co_19_G"],
  ["co_4_G", "co_20_G"],
  ["co_5_G", "co_20_G"],
  ["co_5_G", "co_6_G"],
  ["co_7_G", "co_6_G"],
  ["co_7_G", "co_8_G"],
  ["co_18_G", "co_20_G"],
  ["co_18_G", "co_17_G"],
  ["co_16_G", "co_17_G"],
  ["co_16_G", "co_15_G"],
  ["co_15_G", "co_14_G"],



  ["co_11_G", "N319"],
  ["co_10_G", "N320"],
  ["co_2_G", "N312"],
  ["N311", "N312"],
  ["co_3_G", "N314"],
  ["co_2_G", "N311"],
  ["co_4_G", "N308"],
  ["co_5_G", "N307"],
  ["co_6_G", "N306"],
  ["co_7_G", "N304"],

  ["co_8_G", "N305"],
  ["co_18_G", "N303"],
  ["co_16_G", "N302"],
  ["co_17_G", "N320"],
  ["co_15_G", "N301"],



  //B2
  // ── Entrance connections ──
  // ["entrance_B2", "stairsB_B2"],
  ["entrance_B2", "co_1_B2"],

  // ── stairs connects to top corridor ──
  ["stairsB_B2", "co_1_B2"],

  // ── lift connects to mid corridor ──
  ["lift_B2", "co_4_B2"],

  // ── Main corridor spine (top → bottom): co_1 ↔️ co_2 ↔️ co_3 ──
  ["co_1_B2", "co_2_B2"],
  ["co_2_B2", "co_3_B2"],
  ["co_4_B2", "co_3_B2"],
  ["co_4_B2", "co_5_B2"],
  ["co_5_B2", "co_6_B2"],

  // ── co_2 room spurs (middle section) ──
  ["co_2_B2", "N106"],
  ["co_3_B2", "N101"],
  ["co_4_B2", "N102"],

  // ── co_3 room spurs (right/bottom section) ──
  ["co_5_B2", "N103"],
  ["co_6_B2", "N104"],
  ["co_6_B2", "N105"],



  //B1
  ["entrance_B1", "co_11_B1"],
  ["lift_B1", "co_8_B1"],
  ["stairsB_B1", "co_1_B1"],
  ["stairsA_B1", "co_13_B1"],


  ["co_11_B1", "co_12_B1"],
  ["co_11_B1", "co_10_B1"],
  ["co_9_B1", "co_10_B1"],
  ["co_8_B1", "co_9_B1"],
  ["co_8_B1", "co_19_B1"],
  ["co_19_B1", "co_2_B1"],
  ["co_19_B1", "co_3_B1"],
  ["co_1_B1", "co_2_B1"],
  ["co_2_B1", "co_1_B1"],
  ["co_4_B1", "co_3_B1"],
  ["co_4_B1", "co_20_B1"],
  ["co_5_B1", "co_20_B1"],
  ["co_5_B1", "co_6_B1"],
  ["co_6_B1", "co_7_B1"],
  ["co_18_B1", "co_20_B1"],
  ["co_18_B1", "co_17_B1"],
  ["co_16_B1", "co_17_B1"],
  ["co_16_B1", "co_15_B1"],
  ["co_14_B1", "co_15_B1"],
  ["co_14_B1", "co_13_B1"],
  ["co_12_B1", "co_13_B1"],

  ["co_2_B1", "N212"],
  ["co_3_B1", "N211"],
  ["co_4_B1", "N210"],
  ["co_5_B1", "N209"],
  ["co_6_B1", "N208"],
  ["co_7_B1", "N207"],
  ["co_18_B1", "N206"],
  ["co_17_B1", "N204"],
  ["co_16_B1", "N203"],
  ["co_15_B1", "N202"],
  ["co_13_B1", "N201"],
  ["co_12_B1", "N205"],
  ["co_10_B1", "N216"],
  
   ["co_10_B1","co_21_B1"],
  ["co_21_B1","co_22_B1"],
  ["co_21_B1","co_4_B1"],
 ["co_21_B1","co_22_B1"],
 ["co_22_B1","CSQ"],
  //F1

  ["stairsB_1", "co_1_1"],
  ["stairsA_1", "co_11_1"],
  ["lift_1", "co_4_1"],

  ["co_1_1", "co_2_1"],
  ["co_2_1", "co_3_1"],
  ["co_3_1", "co_17_1"],
  ["co_4_1", "co_3_1"],
  ["co_4_1", "co_5_1"],
  ["co_5_1", "co_6_1"],
  ["co_6_1", "co_7_1"],
  ["co_8_1", "co_7_1"],
  ["co_8_1", "co_9_1"],
  ["co_9_1", "co_10_1"],
  ["co_11_1", "co_10_1"],
  ["co_11_1", "co_12_1"],
  ["co_13_1", "co_12_1"],
  ["co_13_1", "co_14_1"],
  ["co_14_1", "co_15_1"],
  ["co_15_1", "co_16_1"],
  ["co_18_1", "co_16_1"],
  ["co_18_1", "co_19_1"],
  ["co_19_1", "co_20_1"],
  ["co_20_1", "co_21_1"],
  ["co_18_1", "co_17_1"],
  ["co_3_1", "co_17_1"],


  ["co_2_1", "N402"],
  ["co_3_1", "N403"],
  ["co_17_1", "N404"],
  ["co_5_1", "N401"],
  ["co_6_1", "N400"],
  ["co_9_1", "N411"],
  ["co_13_1", "N410"],
  ["co_14_1", "N409"],
  ["co_15_1", "N408"],
  ["co_16_1", "N407"],
  ["co_19_1", "N405"],
  ["co_20_1", "N406"],
  ["co_21_1", "N413"],
  ["co_21_1", "N412"],


  // STAIRS A
  ["stairsA_B1", "stairsA_G"],
  ["stairsA_G", "stairsA_1"],
  ["stairsA_1", "stairsA_2"],

  // STAIRS B
  ["stairsB_B2", "stairsB_B1"],
  ["stairsB_B1", "stairsB_G"],
  ["stairsB_G", "stairsB_1"],
  ["stairsB_1", "stairsB_2"],

  // LIFT
  ["lift_B2", "lift_B1"],
  ["lift_B1", "lift_G"],
  ["lift_G", "lift_1"],
  ["lift_1", "lift_2"],


  //F2

  ["stairsA_2", "co_10_2"],
  ["stairsA_2", "co_11_2"],
  ["stairsB_2", "co_1_2"],
  ["lift_2", "co_5_2"],
  // ["lift_2", "co_2_2"],

  ["co_1_2", "co_2_2"],
  ["co_2_2", "co_3_2"],
  ["co_3_2", "co_4_2"],
  ["co_3_2", "co_5_2"],
  ["co_21_2", "co_5_2"],
  ["co_21_2", "co_6_2"],
  ["co_6_2", "co_7_2"],
  ["co_8_2", "co_7_2"],
  ["co_8_2", "co_9_2"],
  ["co_10_2", "co_9_2"],
  ["co_11_2", "co_12_2"],
  ["co_13_2", "co_12_2"],
  ["co_13_2", "co_14_2"],
  ["co_15_2", "co_14_2"],
  ["co_15_2", "co_17_2"],
  ["co_16_2", "co_4_2"],
  ["co_16_2", "co_17_2"],
  ["co_18_2", "co_17_2"],
  ["co_18_2", "co_19_2"],
  ["co_19_2", "co_20_2"],

  ["co_2_2", "N504"],
  ["co_4_2", "N505"],
  ["co_6_2", "N502"],
  ["co_9_2", "N501"],
  ["co_21_2", "N503"],
  ["co_12_2", "N515"],
  ["co_13_2", "N514"],
  ["co_14_2", "N513"],
  ["co_15_2", "N512"],
  ["co_16_2", "N506"],
  ["co_18_2", "N507"],
  ["co_19_2", "N508"],
  ["co_20_2", "N509"],
  ["co_20_2", "N511"],


];