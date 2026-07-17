import { Sheet } from "react-modal-sheet";
import "./BottomSheet.css";
import {
  MdApartment,
  MdSchool,
  MdScience,
  MdLocalCafe,
  MdLocalLibrary,
  MdArrowForwardIos,
} from "react-icons/md";
import { memo } from "react";
import { useEffect } from "react";
function getIcon(title) {
  switch (title.toLowerCase()) {
    case "departments":
    case "department":
    case "faculty":
      return <MdSchool size={24} />;

    case "buildings":
      return <MdApartment size={24} />;

    case "labs":
      return <MdScience size={24} />;

    case "cafeteria":
      return <MdLocalCafe size={24} />;

    case "library":
      return <MdLocalLibrary size={24} />;

    default:
      return <MdApartment size={24} />;
  }
}



function BottomSheet({
  open,
  onClose,
  onBack,
  title,
  data,
  selectedDepartment,
  setSelectedDepartment,
  onNavigate,
}) {
  return (
    <Sheet isOpen={open} onClose={onClose} snapPoints={[0, 0.25, 0.55, 0.9, 1]}>
      <Sheet.Container>
        <Sheet.Header />

        <Sheet.Content>
          <div className="sheet-content">

            <h2>{title}</h2>

            {/* Department List */}

            {Array.isArray(data) &&
              title === "Faculty" &&
              !selectedDepartment &&

              data.map((dept) => (
                <div
                  key={dept.id}
                  className="sheet-card clickable"
                  onClick={() => setSelectedDepartment(dept)}
                >
                  <div className="sheet-item-left">
                    <MdSchool className="sheet-icon" />
                    <div>
                      <h4>{dept.name}</h4>
                      <small>{dept.faculties.length} Faculty Members</small>
                    </div>
                  </div>

                  <MdArrowForwardIos size={16} className="sheet-arrow" />
                </div>
              ))}

            {/* Faculty List */}

            {selectedDepartment && (
              <>
                <button
                  className="back-button"
                  onClick={() => setSelectedDepartment(null)}
                >
                  ← Back
                </button>

                <h3>{selectedDepartment.name}</h3>

                {selectedDepartment.faculties.map((faculty, index) => (
                  <div className="sheet-card" key={index}>

                    <h4>{faculty.name}</h4>

                    <p>{faculty.designation}</p>

                    <small>Room: {faculty.room}</small>

                    <button
                      className="route-button"
                      onClick={() => {

                        const facultyLocation = {
                          id: faculty.indoorNode || faculty.room,
                          name: faculty.name,
                          type: "faculty",

                          designation: faculty.designation,
                          department: selectedDepartment.name,

                          room: faculty.room,
                          floor: faculty.floor,

                          building: faculty.building,
                          location: faculty.building,

                          routeNode: faculty.routeNode,
                          indoorNode: faculty.indoorNode,
                          hasIndoorNavigation: faculty.hasIndoorNavigation,
                        };


                        onNavigate(facultyLocation);

                        onClose();

                      }}
                    >
                      Show Route
                    </button>

                  </div>
                ))}
              </>
            )}
            {/* Department List */}
            {Array.isArray(data) && title === "Department" && data.map((department) => {
              const destination = department.faculties[0];
              return <div className="sheet-card" key={department.id}>
                <h4>{department.name}</h4>
                <p>{destination?.routeNode === "chavara" ? "St Chavara Block" : "St Mary's Block"}</p>
                <small>{destination?.floor ? `Floor: ${destination.floor}` : "Department office"}</small>
                <button className="route-button" onClick={() => {
                  if (!destination) return;
                  onNavigate({
                    id: destination.indoorNode || destination.routeNode,
                    name: department.name,
                    type: "faculty",
                    category: "department",
                    department: department.name,
                    floor: destination.floor,
                    building: destination.building,
                    location: destination.building,
                    routeNode: destination.routeNode,
                    indoorNode: destination.indoorNode,
                    hasIndoorNavigation: destination.hasIndoorNavigation,
                  });
                  onClose();
                }}>Show Route</button>
              </div>;
            })}

            {/* Buildings */}

            {title === "Buildings" &&
              data?.map((building, index) => (

                <div className="sheet-card" key={index}>

                  <div className="card-content">

                    <h4>{building.name}</h4>

                    <p>{building.description}</p>

                    <button
                      className="route-button"
                      onClick={() => {
                        console.log("Building:", building);
                        onNavigate(building);
                        onClose();
                      }}
                    >
                      Show Route
                    </button>

                  </div>

                </div>

              ))}

            {/* Labs */}

            {title === "Labs" &&
              data?.map((lab, index) => (

                <div className="sheet-card" key={index}>

                  <h4>{lab.name}</h4>

                  <small>{lab.room}</small>


                  <button
                    className="route-button"
                    onClick={() => {
                      console.log("Navigating to:", lab);
                      onNavigate(lab);
                      onClose();
                    }}
                  >
                    Show Route
                  </button>


                </div>

              ))}

            {/* Library / Cafeteria */}

            {!Array.isArray(data) && data && (
              <div className="sheet-card">

                <h4>{data.title}</h4>

                <p>{data.description}</p>

                <button
                  className="route-button"
                  onClick={() => {
                    console.log("Library:", data);
                    onNavigate(data);
                    onClose();
                  }}
                >
                  Show Route
                </button>

              </div>
            )}
            {/* Cafeteria & Library */}

            {(title === "Cafeteria" || title === "Library") &&
              Array.isArray(data) &&
              data.map((item, index) => (

                <div className="sheet-card" key={index}>

                  <h4>{item.title}</h4>

                  <p>{item.description}</p>

                  <button
                    className="route-button"
                    onClick={() => {

                      console.log("Cafeteria:", item);

                      onNavigate(item);

                      onClose();

                    }}
                  >
                    Show Route
                  </button>

                </div>

              ))
            }

          </div>
        </Sheet.Content>
      </Sheet.Container>

      <Sheet.Backdrop />
    </Sheet>
  );
}

export default memo(BottomSheet);