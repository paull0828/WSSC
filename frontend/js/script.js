document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const bookSeatBtn = document.getElementById("book-seat-btn");
  const statusMessage = document.getElementById("status-message");

  // Check if user is logged in
  fetch("http://localhost:4000/api/auth/check-session", {
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.loggedIn) {
        loginBtn.style.display = "none";
        logoutBtn.style.display = "block";
      } else {
        loginBtn.style.display = "block";
        logoutBtn.style.display = "none";
      }
    });

  // Logout functionality
  logoutBtn.addEventListener("click", () => {
    fetch("http://localhost:4000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    }).then(() => {
      window.location.reload();
    });
  });

  // Book seat functionality
  bookSeatBtn.addEventListener("click", () => {
    fetch("http://localhost:4000/api/bookings/book-seat", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ seatNumber: 1, date: "2025-03-12" }), // Example data
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          statusMessage.innerText = "Seat booked successfully!";
        } else {
          statusMessage.innerText = data.message;
        }
      });
  });
});
