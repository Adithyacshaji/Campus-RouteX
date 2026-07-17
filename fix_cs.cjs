const fs = require("fs");
let data = fs.readFileSync("src/data/bottomSheetData.js", "utf8");
data = data.replace(
  /room: "N216", floor: "B1", building: "stmarys", hasIndoorNavigation: true, routeNode: "b1", indoorNode: "N216"/g,
  `room: "Chavara 5th Floor", floor: "5th Floor", building: "chavara", hasIndoorNavigation: false, routeNode: "chavara", indoorNode: "chavara"`
);
fs.writeFileSync("src/data/bottomSheetData.js", data);
