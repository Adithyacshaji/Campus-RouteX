import { LOCATIONS } from "./locations";
import { FLOORS } from "./floors";
import { bottomSheetData } from "./bottomSheetData";
import { CHAVARA_FLOORS } from "./chavaraFloors";


const roomItems = [];

Object.entries(FLOORS).forEach(([floor, data]) => {
  data.rooms.forEach((room) => {
    const roomId = typeof room === "string" ? room : room.id;
    const roomName = typeof room === "string" ? room : room.name;

    roomItems.push({
      id: roomId,
      name: roomName,
      type: "room",
      floor,
      routeNode: data.entrance,
      building: "St Mary's Block",
    });
  });
});
Object.entries(CHAVARA_FLOORS).forEach(([floor, data]) => {
  data.rooms.forEach((room) => {
    const roomId = typeof room === "string" ? room : room.id;
    const roomName = typeof room === "string" ? room : room.name;

    roomItems.push({
      id: roomId,
      name: roomName,
      type: "room",
      floor,
      routeNode: "chavara",
      building: "chavara",
    });
  });
});

// Create faculty search items from BottomSheet data
const facultyItems = [];

bottomSheetData.departments.forEach((department) => {

  department.faculties.forEach((faculty) => {

    facultyItems.push({
      id: faculty.name,
      name: faculty.name,
      type: "faculty",
      department: department.name,
      room: faculty.room || null,
      floor: faculty.floor || null,
      building: faculty.building || (faculty.room ? "stmarys" : "chavara"),
      routeNode: faculty.routeNode || (faculty.room ? "g" : "chavara"),
      indoorNode: faculty.indoorNode || (faculty.room ? faculty.room : "chavara"),
      designation: faculty.designation,

      // if no room, it is in Chavara Block
      locationType: faculty.room ? "ROOM" : "chavara",
    });

  });

});


export const SEARCH_ITEMS = [
  ...LOCATIONS,
  ...roomItems,
  ...facultyItems,
];