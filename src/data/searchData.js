import { LOCATIONS } from "./locations";
import { FLOORS } from "./floors";
import { bottomSheetData } from "./bottomSheetData";


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