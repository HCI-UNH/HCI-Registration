const API_BASE = "http://localhost:8005";
let selectedWishlistCourses = [];

async function apiGet(path) {
  try {
    const resp = await fetch(API_BASE + path);
    if (!resp.ok) throw new Error(resp.status + " " + resp.statusText);
    return await resp.json();
  } catch (e) {
    showError("Could not reach API: " + e.message);
    return [];
  }
}


async function apiPost(path, body) {
  try {
    const resp = await fetch(API_BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      let detail = "";
      try { detail = (await resp.json()).detail; } catch (_) {}
      showError(detail || "Request failed: " + resp.status);
      return false;
    }
    clearError();
    return true;
  } catch (e) {
    showError("Could not reach API: " + e.message);
    return false;
  }
}

//Create event listeners for search button
const searchBtn = document.getElementById("search-button");
searchBtn.addEventListener("click", searchBtnOnClick)
//searchBtn.addEventListener("hover", searchBtnOnHover)

//Search button onclick
async function searchBtnOnClick(){
  //debug
  console.log("Search button was clicked")

  //container to fill with list of elements
  const container = document.getElementById("resultsFromSearch");
  //api call to get sections currently available
  const sections = await apiGet("/sections");

  //idk what this does its in the starter code tho
  container.replaceChildren();

  //for each section in the list of dictionaries we create a div and a span element
  
  for (const s of sections) {
    const row = el("div");
    row.className = "row";
    //display each section based on there attributes
    row.appendChild(el("span",
      `${s.department} - ${s.title} - ${s.instructor} - ${s.meets} - ${s.seats_open}/${s.capacity} seats open`))
    if (s.you_enrolled) {
      const btn = el("button", "Drop");
      btn.onclick = () => dropSection(s.id);
      row.appendChild(btn);
    } else {
      const btn = el("button", "Register");
      btn.onclick = () => registerSection(s.id);
      row.appendChild(btn);
    }
    container.appendChild(row);

  }
}



function showError(msg) { document.getElementById("error").textContent = msg; }
function clearError() { document.getElementById("error").textContent = ""; }

async function registerSection(sectionId) {
  //console.log(sectionId)
  if (await apiPost("/register", [Number(sectionId)])) {
    renderAll()
    searchBtnOnClick();
  }
}

async function dropSection(sectionId) {
  if (await apiPost("/drop", [Number(sectionId)])) {
    renderAll()
    searchBtnOnClick();
  }
}

function el(tag, text) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  return node;
}

// async function renderSections() {
//   const container = document.getElementById("sections");
//   const sections = await apiGet("/sections");
//   container.replaceChildren();

//   for (const s of sections) {
//     const row = el("div");
//     row.className = "row";
//     row.appendChild(el("span",
//       `${s.code} - ${s.title} - ${s.instructor} - ${s.meets} - ${s.seats_open}/${s.capacity} seats open`));

//     if (s.you_enrolled) {
//       const btn = el("button", "Drop");
//       btn.onclick = () => dropSection(s.id);
//       row.appendChild(btn);
//     } else {
//       const btn = el("button", "Register");
//       btn.onclick = () => registerSection(s.id);
//       row.appendChild(btn);
//     }
//     container.appendChild(row);
//   }
// }

async function renderCurEnrollments() {
  const container = document.getElementById("cur-enrolls");
  const enrolled = await apiGet("/enrollments");
  container.replaceChildren();

  if (!enrolled.length) {
    container.appendChild(el("div", "You aren't registered for anything yet."));
    return;
  }
  for (const s of enrolled) {
    container.appendChild(el("div", `${s.course.department} - ${s.course.title} - ${s.course.instructor} - ${s.course.meets} - ${s.course.seats_open}/${s.course.capacity} seats open`));
  }
}

function renderSearchResults(courses) {
  const container = document.getElementById("results-course-list");
  // Clear previous results
  container.replaceChildren();

  if (!courses || course.length === 0) {
    container.appendChild(el("p", "No courses found."));
    return;
  }

  for (const s of courses) {
    const row = el("div");
    row.className = "row";

    //Display course information
    const courseInfo = el(
      "span",
      `${s.department} ${s.course_num}.${s.section_num} - ${s.title} - ${s.instructor}`
    );

    row.appendChild(courseInfo);
  }
}

async function getWishLists() {
  const wishlists = await apiGet("/wishlists");
  return wishlists
}
// get wish list from API and render it
async function loadWishLists() {
  const select = document.getElementById("wishlist-search-select");
  const wishlists = await getWishLists();

  select.innerHTML = '<option value="default">No Wishlist Selected</option>';
  
  for (const w of wishlists) {
    const opt = document.createElement("option");

    opt.value = w.wishlist_id;
    opt.textContent = w.wishlist_name || `Wishlist ${w.wishlist_id}`;

    select.appendChild(opt);
  }
  console.log(wishlists)

  select.addEventListener("change", async (event) => {
    const wishlistID = event.target.value;

    if (wishlistID === "default") {
      selectedWishlistCourses = [];
      return;
    }

    selectedWishlistCourses = await apiGet(`/wishlist/${wishlistID}`);
    console.log(selectedWishlistCourses)

    renderSearchResults(selectedWishlistCourses);
  });
}

function renderSearchResults(courses) {
  const container = document.getElementById("results-course-list");

  container.replaceChildren();

  if(!courses || courses.length === 0) {
    container.appendChild(el("p", "No courses found."));
    return;
  }

  for (const course of courses) {
    const row = el("div");
    row.className = "row";

    row.appendChild(el(
      "span",
      `${course.department} ${course.course_num}.${course.section_num} - ${course.title} - ${course.instructor}`
    ));

    if (course.you_enrolled) {
      const btn = el("button", "Drop");
      btn.onclick = () => dropSection(course.id);
      row.appendChild(btn);
    } else {
      const btn = el("button", "Register");
      btn.onclick = () => registerSection(course.id);
      row.appendChild(btn);
    }

    container.appendChild(row);
  }
}
// async function renderAnnouncements() {
//   const container = document.getElementById("announcements");
//   const announcements = await apiGet("/announcements");
//   container.replaceChildren();

//   for (const a of announcements) {
//     container.appendChild(el("div", a.title));
//     container.appendChild(el("div", a.body));
//     container.appendChild(document.createElement("hr"));
//   }
// }

function renderAll() {
 // renderSections();
  renderCurEnrollments();
  loadWishLists();
}

renderAll();