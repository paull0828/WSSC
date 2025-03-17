document.addEventListener("DOMContentLoaded", async () => {
  const userEmailElement = document.getElementById("user-email");
  const bookingsListElement = document.getElementById("bookings-list");

  // Backend API URL
  const API_URL = "http://localhost:4000"; // Ensure this matches your backend route

  // Fetch user data from backend
  async function fetchUserData() {
    try {
      const email = localStorage.getItem("userEmail");
      const response = await fetch(`${API_URL}/users/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${email}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const userData = await response.json();

      // Display user email
      userEmailElement.textContent =
        userData.firstname + " (" + userData.email + ")";

      // Display user bookings
      userData.bookings.forEach((booking) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${booking.seatNumber}</td>
          <td>${booking.date}</td>
          <td>${booking.timeSlot}</td>
          <td>${booking.plan}</td>
          <td>${booking.price}</td>
          <td>${booking.status}</td>
        `;
        bookingsListElement.appendChild(row);
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  // Fetch and display user data
  await fetchUserData();
});
