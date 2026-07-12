import "./SearchChip.css";

function SearchChips({
    onDepartmentsClick,
    onLibraryClick,
    onCafeteriaClick,
    onBuildingsClick,
    onLabsClick
}) {
    return (
        <div className="search-chips">
            <button className="chip" onClick={onDepartmentsClick}>
                Departments
            </button>

            <button className="chip" onClick={onLibraryClick}>
                Library
            </button>

            <button className="chip" onClick={onCafeteriaClick}>
                Cafeteria
            </button>

            <button className="chip" onClick={onBuildingsClick}>
                Buildings
            </button>
            

    </div >
  );
}

export default SearchChips;