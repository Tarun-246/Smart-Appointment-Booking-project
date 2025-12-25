const API = "http://localhost:3000";

/* =========================
   LOGIN
========================= */
function login() {
  fetch(API + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: username.value,
      password: password.value
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.role === "admin") {
        localStorage.setItem("username", username.value);
        localStorage.setItem("role", "admin");
        window.location = "admin-dashboard.html";
      } 
      else if (data.role === "user") {
        localStorage.setItem("username", username.value);
        localStorage.setItem("role", "user");
        window.location = "user-dashboard.html";
      } 
      else {
        alert("Invalid login");
      }
    });
}

/* =========================
   SIGNUP
========================= */
function signup() {
  fetch(API + "/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: su_username.value,
      password: su_password.value
    })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("msg").innerText = data.message;
    });
}

/* =========================
   BOOK APPOINTMENT
========================= */
function bookAppointment() {
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;

  if (!date || !time) {
    alert("Please select date and time");
    return;
  }

  fetch(API + "/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: localStorage.getItem("username"),
      date: date,
      time: time
    })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      loadMyBookings();
    });
}

/* =========================
   MY APPOINTMENTS
========================= */
function loadMyBookings() {
  const list = document.getElementById("myBookings");
  if (!list) return;

  list.innerHTML = "";

  fetch(API + "/my-bookings/" + localStorage.getItem("username"))
    .then(res => res.json())
    .then(bookings => {
      bookings.forEach(b => {
        const li = document.createElement("li");
        li.innerText = `${b.date} at ${b.time}`;
        list.appendChild(li);
      });
    });
}

loadMyBookings();

/* =========================
   ADMIN USERS
========================= */
const userList = document.getElementById("userList");
if (userList) {
  fetch(API + "/admin/users")
    .then(res => res.json())
    .then(users => {
      users.forEach(u => {
        const li = document.createElement("li");
        li.innerText =
          `Username: ${u.username} | Password: ${u.password} | Role: ${u.role}`;
        userList.appendChild(li);
      });
    });
}

/* =========================
   ADMIN BOOKINGS
========================= */
const bookingList = document.getElementById("bookingList");
if (bookingList) {
  fetch(API + "/admin/bookings")
    .then(res => res.json())
    .then(bookings => {
      bookings.forEach(b => {
        const li = document.createElement("li");
        li.innerText = `${b.username} | ${b.date} | ${b.time}`;
        bookingList.appendChild(li);
      });
    });
}

/* =========================
   LOGOUT
========================= */
function logout() {
  localStorage.clear();
  window.location = "login.html";
}
