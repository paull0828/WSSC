const API_URL = "http://localhost:4000"; // Replace with your backend URL

// Handle price update
document.getElementById("priceForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const plan = document.getElementById("plan").value;
  const newPrice = document.getElementById("newPrice").value;

  try {
    const response = await fetch(`${API_URL}/admin/update-price`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, newPrice }),
    });

    const data = await response.json();
    document.getElementById("priceMessage").textContent = data.message;
  } catch (error) {
    console.error("Error updating price:", error);
    document.getElementById("priceMessage").textContent =
      "Error updating price.";
  }
});

// Fetch and display users
async function fetchUsers() {
  try {
    const response = await fetch(`${API_URL}/admin/users`);
    const users = await response.json();

    const userTableBody = document
      .getElementById("userTable")
      .querySelector("tbody");
    userTableBody.innerHTML = ""; // Clear existing rows

    users.forEach((user) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>
          <button class="delete-btn" data-id="${user._id}">Delete</button>
        </td>
      `;
      userTableBody.appendChild(row);
    });

    // Add event listeners to delete buttons
    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", async (e) => {
        const userId = e.target.dataset.id;
        try {
          const response = await fetch(
            `${API_URL}/admin/delete-user/${userId}`,
            {
              method: "DELETE",
            }
          );
          const data = await response.json();
          alert(data.message);
          fetchUsers(); // Refresh the user list
        } catch (error) {
          console.error("Error deleting user:", error);
        }
      });
    });
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

// Fetch users on page load
fetchUsers();

// Fetch and display booking details
async function fetchBookings() {
  try {
    const response = await fetch(`${API_URL}/admin/bookings`);
    const bookings = await response.json();

    const bookingTableBody = document
      .getElementById("bookingTable")
      .querySelector("tbody");
    bookingTableBody.innerHTML = ""; // Clear existing rows

    bookings.forEach((booking) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${booking.user?.name || "N/A"}</td>
        <td>${booking.user?.email || "N/A"}</td>
        <td>${booking.seatNumber}</td>
        <td>${booking.timeSlot}</td>
        <td>${new Date(booking.date).toLocaleDateString()}</td>
      `;
      bookingTableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
  }
}

// Fetch bookings on page load
fetchBookings();
