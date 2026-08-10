import { Sheet } from "react-modal-sheet";
import { memo } from "react";
import { ChevronRight, School, Layers, TestTube, Car, Bath, Library, Users, Coffee, Navigation } from "lucide-react";

const getIcon = (title) => {
  switch (title.toLowerCase()) {
    case "departments":
    case "department":
    case "faculty":
      return <School size={24} />;
    case "buildings":
      return <School size={24} />;
    case "labs":
      return <TestTube size={24} />;
    case "cafeteria":
      return <Coffee size={24} />;
    case "library":
      return <Library size={24} />;
    default:
      return <School size={24} />;
  }
};

function BottomSheet({
  open,
  onClose,
  title,
  data,
  selectedDepartment,
  setSelectedDepartment,
  onNavigate,
  onSelectCategory,
  onLocateUser,
}) {
  const renderDefaultExplore = () => (
    <div className="pt-3 animate-[fadeIn_0.4s_ease-out]">
      <div className="flex items-center justify-between mb-10 px-5">
        <h3 className="text-[18px] font-bold text-gray-900 tracking-tight">Explore Campus</h3>
        {/* <button className="text-[13px] font-semibold text-primary hover:text-primary-hover flex items-center gap-1">
          View All <ChevronRight size={14} />
        </button> */}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { id: "departments", label: "Departments", count: "24", icon: School, color: "text-blue-600", bg: "bg-blue-50" },
          { id: "classrooms", label: "Classrooms", count: "120", icon: Layers, color: "text-green-600", bg: "bg-green-50" },
          { id: "labs", label: "Labs", count: "48", icon: TestTube, color: "text-purple-600", bg: "bg-purple-50" },
          { id: "parking", label: "Parking", count: "3 Zones", icon: Car, color: "text-blue-600", bg: "bg-blue-50" },
          // { id: "washrooms", label: "Washrooms", count: "18", icon: Bath, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectCategory(item.id)}
            className="flex flex-col items-center justify-center bg-gray-50/50 border border-gray-100 rounded-2xl p-4 gap-4 hover:bg-white hover:shadow-[0_4px_12px_rgb(0,0,0,0.05)] hover:border-gray-200 transition-all text-center group cursor-pointer"
          >
            <div className={`w-10 h-10 ${item.bg} rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform`}>
              <item.icon size={30} className={item.color} />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-gray-800 leading-tight">{item.label}</span>
              <span className="text-[11px] font-medium text-gray-500 mt-0.5">{item.count}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4 px-1">
        {/* <h3 className="text-[17px] font-bold text-gray-900 tracking-tight">Popular Places</h3> */}
        {/* <button className="text-[13px] font-semibold text-primary hover:text-primary-hover flex items-center gap-1">
          See All <ChevronRight size={14} />
        </button> */}
      </div>

      {/* <div className="flex gap-3 overflow-x-auto pb-4 -mx-5 px-5 hide-scrollbar snap-x">
        {[
          { name: "Library", img: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=400&q=80", icon: Library, time: "2 min walk", color: "bg-purple-600" },
          { name: "St. Mary's Block", img: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=400&q=80", icon: School, time: "1 min walk", color: "bg-blue-600" },
          { name: "CSE Department", img: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=400&q=80", icon: Users, time: "3 min walk", color: "bg-green-600" },
          { name: "Canteen", img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80", icon: Coffee, time: "2 min walk", color: "bg-orange-600" },
        ].map((place, idx) => (
          <div key={idx} className="w-40 shrink-0 bg-white border border-gray-100 rounded-2xl shadow-[0_4px_12px_rgb(0,0,0,0.04)] overflow-hidden snap-start cursor-pointer hover:shadow-[0_8px_24px_rgb(0,0,0,0.08)] transition-shadow">
            <div className="h-22.5 w-full bg-gray-200 relative">
               <img src={place.img} alt={place.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-5 h-5 ${place.color} rounded flex items-center justify-center shrink-0`}>
                  <place.icon size={12} className="text-white" />
                </div>
                <h4 className="text-[13px] font-bold text-gray-900 truncate">{place.name}</h4>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <Navigation size={12} />
                <span className="text-[11px] font-medium">{place.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div> */}
    </div>
  );

  return (
    <Sheet isOpen={open} onClose={onClose} snapPoints={[200, 500, 0]}>
      <Sheet.Container className="rounded-t-[28px]! shadow-[0_-8px_40px_rgb(0,0,0,0.12)]!">
        <Sheet.Header />

        <Sheet.Content>
          <div className="px-5 py-4 pb-[calc(24px+env(safe-area-inset-bottom,0px))] flex flex-col h-full bg-white text-gray-900">
            {title && <h2 className="text-[22px] font-bold tracking-tight mb-5">{title}</h2>}

            <div className="flex-1 overflow-y-auto custom-scrollbar -mx-5 px-5 hide-scrollbar">
              {/* Fallback Explore Campus view if no specific data */}
              {!data && !title && renderDefaultExplore()}

              {/* Department List */}
              {Array.isArray(data) && title === "Faculty" && !selectedDepartment && data.map((dept) => (
                <div key={dept.id} className="flex items-center justify-between p-4 mb-3 bg-white rounded-[20px] shadow-[0_2px_10px_rgb(0,0,0,0.05)] border border-gray-100 cursor-pointer hover:shadow-[0_4px_16px_rgb(0,0,0,0.08)] transition-all" onClick={() => setSelectedDepartment(dept)}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
                      <School size={24} />
                    </div>
                    <div>
                      <h4 className="text-[16px] font-semibold text-gray-900 leading-tight mb-1">{dept.name}</h4>
                      <p className="text-[13px] text-gray-500">{dept.faculties.length} Faculty Members</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              ))}

              {/* Faculty List inside Department */}
              {selectedDepartment && (
                <div className="flex flex-col">
                  <button className="self-start text-[15px] font-semibold text-primary mb-4 flex items-center gap-1 hover:opacity-80" onClick={() => setSelectedDepartment(null)}>
                    ← Back
                  </button>
                  <h3 className="text-[18px] font-bold mb-4">{selectedDepartment.name}</h3>
                  {selectedDepartment.faculties.map((faculty, index) => (
                    <div className="p-4 mb-3 bg-white rounded-[20px] shadow-[0_2px_10px_rgb(0,0,0,0.05)] border border-gray-100 flex flex-col gap-1" key={index}>
                      <h4 className="text-[16px] font-semibold">{faculty.name}</h4>
                      <p className="text-[14px] text-gray-600">{faculty.designation}</p>
                      <span className="text-[12px] text-gray-500 mb-2">Room: {faculty.room}</span>
                      <button className="mt-2 h-10 w-full bg-blue-50 hover:bg-blue-100 text-primary font-semibold rounded-full transition-colors text-[14px]" onClick={() => {
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
                      }}>
                        Show Route
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Standard List (Departments, Buildings, Labs, Cafeteria, Library, Parking, Washrooms, Classrooms) */}
              {title !== "Faculty" && Array.isArray(data) && data.map((item, index) => {
                const destination = (title === "Department" || title === "Departments") ? item.faculties?.[0] : null;
                return (
                  <div className="p-4 mb-3 bg-white rounded-[20px] shadow-[0_2px_10px_rgb(0,0,0,0.05)] border border-gray-100 flex flex-col gap-2" key={item.id || index}>
                    <h4 className="text-[16px] font-semibold text-gray-900 leading-tight">{item.name || item.title}</h4>
                    {item.description && <p className="text-[13px] text-gray-600">{item.description}</p>}
                    {(title === "Department" || title === "Departments") && <p className="text-[13px] text-gray-600">{destination?.routeNode === "chavara" ? "St Chavara Block" : "St Mary's Block"}</p>}
                    {(title === "Department" || title === "Departments") && <span className="text-[12px] text-gray-500">{destination?.floor ? `Floor: ${destination.floor}` : "Department office"}</span>}
                    {item.room && <span className="text-[12px] text-gray-500">{item.room}</span>}
                    <button className="mt-2 h-10 w-full bg-primary hover:bg-primary-hover text-white font-semibold rounded-full transition-colors shadow-[0_2px_8px_rgb(37,99,235,0.3)] text-[14px]" onClick={() => {
                      if (title === "Department" || title === "Departments") {
                        if (!destination) return;
                        onNavigate({
                          id: destination.indoorNode || destination.routeNode,
                          name: item.name,
                          type: "faculty",
                          category: "department",
                          department: item.name,
                          floor: destination.floor,
                          building: destination.building,
                          location: destination.building,
                          routeNode: destination.routeNode,
                          indoorNode: destination.indoorNode,
                          hasIndoorNavigation: destination.hasIndoorNavigation,
                        });
                      } else {
                        onNavigate(item);
                      }
                      onClose();
                    }}>
                      Show Route
                    </button>
                  </div>
                );
              })}

              {/* Single item display (e.g. non-array Library) */}
              {!Array.isArray(data) && data && (
                <div className="p-5 mb-4 bg-white rounded-3xl border border-gray-100 flex flex-col gap-2">
                  <h4 className="text-[18px] font-bold text-gray-900">{data.title || data.name}</h4>
                  <p className="text-[14px] text-gray-600 mb-3">{data.description}</p>
                  <button className="h-11.5 w-full bg-primary hover:bg-primary-hover text-white font-semibold rounded-full transition-colors shadow-[0_2px_8px_rgb(37,99,235,0.3)] text-[14px]" onClick={() => {
                    onNavigate(data);
                    onClose();
                  }}>
                    Start Navigation
                  </button>
                </div>
              )}
            </div>
          </div>
        </Sheet.Content>
      </Sheet.Container>

      <Sheet.Backdrop />
    </Sheet>
  );
}

export default memo(BottomSheet);