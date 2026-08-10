import { School, Users, BookOpen, Coffee, Car, Bath, TestTube, LayoutGrid } from "lucide-react";

const CATEGORIES = [
  { id: "departments", label: "Department", icon: School },
  { id: "faculty", label: "Faculty", icon: Users },
  { id: "library", label: "Library", icon: BookOpen },
  { id: "cafeteria", label: "Cafeteria", icon: Coffee },
  { id: "labs", label: "Labs", icon: TestTube },
];

function SearchChips({ onSelectCategory, activeCategory = "all" }) {
  return (
    <div className="w-full mx-auto overflow-x-auto custom-scrollbar pointer-events-auto mt-3 pb-2 -mb-2 hide-scrollbar">
      <div className="flex items-center gap-3 px-4 pb-2">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory?.(cat.id)}
              className={`flex items-center gap-2 shrink-0 px-4 py-2.5 rounded-[20px] text-[14px] font-semibold transition-all duration-200 border whitespace-nowrap cursor-pointer
                ${isActive 
                  ? "bg-primary border-primary text-white shadow-[0_4px_12px_rgb(37,99,235,0.4)]" 
                  : "bg-white border-gray-100 text-gray-700 hover:bg-gray-50 shadow-[0_2px_8px_rgb(0,0,0,0.06)]"
                }`}
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SearchChips;
