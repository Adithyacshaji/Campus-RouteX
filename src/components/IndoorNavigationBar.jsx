// import "./IndoorNavigationBar.css";

// function IndoorNavigationBar({
//     indoorStart,
//     indoorDestination,
//     onStart,
//     onEditStart,
//     onEditDestination,
// }) {
//     console.log("IndoorNavigationBar:", indoorStart);
//     return (
//         <div className="indoor-nav-bar">
//             <div className="nav-box" onClick={onEditStart}>
//                 <span className="icon">📍</span>
//                 <span>
//                     {indoorStart?.name || "Your location"}
//                 </span>
//             </div>

//             <div className="divider"></div>

//             <div className="nav-box" onClick={onEditDestination}>
//                 <span className="icon">🎯</span>
//                 <span>
//                     {indoorDestination?.name || "Destination"}
//                 </span>
//             </div>
//             <button
//                 className="primary-action"
//                 onClick={() => {
//                     console.log("BUTTON CLICKED");
//                     console.log("typeof onStart:", typeof onStart);
//                     console.log("onStart:", onStart);

//                     if (typeof onStart === "function") {
//                         onStart();
//                     } else {
//                         console.error("onStart is not a function!");
//                     }
//                 }}
//             >
//                 START TEST 123
//             </button>
//         </div>
//     );
// }

// export default IndoorNavigationBar;