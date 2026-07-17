export const NODES = {
  entrance: [10.354064, 76.212318],

  p1: [10.354525, 76.212260],

  p2: [10.355475, 76.212330],

  cafe: [10.355757, 76.212182],

  roadTop: [10.357752, 76.213043],

  roadMiddle: [10.357547, 76.212807],

  roadBottom: [10.357627, 76.212893],

  chavara: [10.355941, 76.212414],

  p3: [10.356395, 76.212414],

  auditorium: [10.356370, 76.212721],

  junction: [10.357167, 76.212795],

  canteen: [10.357400, 76.212602],

  b2: [10.357562, 76.212645],

  b1: [10.357630,76.212802],

  g: [10.357903, 76.212941],

  amphi: [10.358006, 76.213215],

  j: [10.357907, 76.213079],

  j1: [10.358109, 76.212873],

  j2: [10.358188, 76.212900],

  j3: [10.358531, 76.213291],

  j4: [10.358691, 76.213735],

  entrance1: [10.358868, 76.214408],




  joseph: [10.358837, 76.213000],

  // Alias used by the Buildings sheet for "St Mary's Block"
  "st-marys-block": [10.357903, 76.212941],
};
export const EDGES = [
  ["entrance", "p1"],
  ["p2", "cafe"],
  ["p1", "p2"],
  ["p2", "chavara"],
  ["chavara", "p3"],
  ["p3", "auditorium"],

  ["junction", "canteen"],
  ["roadMiddle", "b1"],
  ["roadMiddle", "roadTop"],
  ["roadTop", "g"],
  ["roadTop", "amphi"],
  ["roadTop", "amphi"],


  ["junction", "b2"],
  ["junction", "roadMiddle"],
  ["p1", "entrance"],
  ["chavara", "p1"],
  // ["auditorium", "chavara"],
  ["junction", "auditorium"],

  ["roadMiddle", "junction"],
  ["roadTop", "roadMiddle"],
  ["b1", "roadMiddle"],
  ["b1", "roadTop"],
  ["b2", "junction"],
  ["g", "roadTop"],
  ["g", "st-marys-block"],
  ["j", "roadTop"],
  ["j", "j1"],
  ["j2", "j1"],
  ["j2", "j3"],
  ["joseph", "j3"],
  ["j4", "j3"],
  ["j4", "entrance1"],

];