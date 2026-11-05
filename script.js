const API_BASE = "http://localhost:8005";

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
searchBtn.addEventListener("hover", searchBtnOnHover)

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

function searchBtnOnHover(){
  searchBtn.textContent = "Hovering"
}


function showError(msg) { document.getElementById("error").textContent = msg; }
function clearError() { document.getElementById("error").textContent = ""; }

async function registerSection(sectionId) {
  if (await apiPost("/register", { section_id: sectionId })) {
    renderAll();
  }
}

async function dropSection(sectionId) {
  if (await apiPost("/drop", { section_id: sectionId })) {
    renderAll();
  }
}

function el(tag, text) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  return node;
}

async function renderSections() {
  const container = document.getElementById("sections");
  const sections = await apiGet("/sections");
  container.replaceChildren();

  for (const s of sections) {
    const row = el("div");
    row.className = "row";
    row.appendChild(el("span",
      `${s.code} - ${s.title} - ${s.instructor} - ${s.meets} - ${s.seats_open}/${s.capacity} seats open`));

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
  renderSections();
  renderCurEnrollments();
}

renderAll();
renderAnnouncements();