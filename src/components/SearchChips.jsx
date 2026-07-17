import "./SearchChip.css";

function SearchChips({
    onDepartmentClick,
    onFacultyClick,
    onLibraryClick,
    onCafeteriaClick,
    onBuildingsClick,
    onLabsClick
}) {
    return (
        <div className="search-chips">
            <button className="chip" onClick={onDepartmentClick}>
                Department
            </button>

            <button className="chip" onClick={onFacultyClick}>
                Faculty
            </button>

            <button className="chip" onClick={onLibraryClick}>
                Library
            </button>

            <button className="chip" onClick={onCafeteriaClick}>
                Cafeteria
            </button>

            {/* <button className="chip" onClick={onBuildingsClick}>
                Buildings
            </button>
             */}

    </div >
  );
}

export default SearchChips;
