document.addEventListener("DOMContentLoaded", async () => {
  const seatsContainer = document.querySelector(".seats-container");
  const timeSelection = document.querySelector(".time-selection");
  const planDropdown = document.getElementById("plan-selection");
  const timeSlotDropdown = document.getElementById("time-slot");
  const priceDisplay = document.getElementById("price-display");
  const datePicker = document.getElementById("date-picker");
  const confirmBookingBtn = document.getElementById("confirmBooking");
  const notification = document.getElementById("notification");
  const notificationMessage = document.getElementById("notification-message");
  const backHomeBtn = document.getElementById("backHome");

  let selectedSeat = null;

  // Backend API URL
  const API_URL = "http://localhost:5000"; // Change as needed

  // Set minimum date to today
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  datePicker.value = formattedDate;
  datePicker.min = formattedDate;

  // Fetch booked seats from backend
  async function fetchBookedSeats(date) {
    try {
      const response = await fetch(`${API_URL}/bookings/${date}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const bookedSeats = await response.json();
      console.log("Booked Seats:", bookedSeats);

      document.querySelectorAll(".seat").forEach((seat) => {
        seat.classList.remove("booked", "selected");
      });

      bookedSeats.forEach(({ seatNumber }) => {
        const seat = document.querySelector(`.seat[data-seat="${seatNumber}"]`);
        if (seat) seat.classList.add("booked");
      });
    } catch (error) {
      console.error("Error fetching booked seats:", error);
    }
  }

  // Time slots with pricing
  const timeSlots = {
    "3-hours": [
      { time: "8 AM - 11 AM", price: 700 },
      { time: "12 PM - 3 PM", price: 800 },
      { time: "3 PM - 6 PM", price: 800 },
      { time: "7 PM - 10 PM", price: 700 },
    ],
    "4-hours": [
      { time: "8 AM - 12 PM", price: 900 },
      { time: "11 AM - 3 PM", price: 1000 },
      { time: "3 PM - 7 PM", price: 1000 },
      { time: "6 PM - 10 PM", price: 900 },
    ],
    "7-hours": [
      { time: "8 AM - 3 PM", price: 1200 },
      { time: "11 AM - 6 PM", price: 1400 },
      { time: "12 PM - 7 PM", price: 1400 },
      { time: "3 PM - 10 PM", price: 1200 },
    ],
    "10-hours": [
      { time: "8 AM - 6 PM", price: 1500 },
      { time: "9 AM - 7 PM", price: 1500 },
      { time: "11 AM - 9 PM", price: 1750 },
      { time: "12 PM - 10 PM", price: 1750 },
    ],
    "full-day": [{ time: "8 AM - 10 PM", price: 2000 }],
  };

  // Generate 40 seats dynamically
  for (let i = 1; i <= 40; i++) {
    const seat = document.createElement("div");
    seat.classList.add("seat");
    seat.textContent = i;
    seat.dataset.seat = i;

    seat.addEventListener("click", () => {
      if (seat.classList.contains("booked")) {
        showNotification("This seat is already booked!", "error");
        return;
      }

      if (selectedSeat) {
        selectedSeat.classList.remove("selected");
      }

      selectedSeat = seat;
      seat.classList.add("selected");

      if (window.innerWidth < 768) {
        timeSelection.scrollIntoView({ behavior: "smooth" });
      }

      resetSelections();
      timeSelection.style.display = "block";
    });

    seatsContainer.appendChild(seat);
  }

  // Fetch booked seats after rendering
  await fetchBookedSeats(formattedDate);

  // Reset all selections when date is changed
  datePicker.addEventListener("change", () => {
    fetchBookedSeats(datePicker.value);
  });

  function resetSelections() {
    planDropdown.value = "";
    timeSlotDropdown.innerHTML =
      '<option value="" disabled selected>Select a Time Slot</option>';
    priceDisplay.innerHTML = "Price: <span>₹0</span>";
  }

  planDropdown.addEventListener("change", () => {
    const selectedPlan = planDropdown.value;
    timeSlotDropdown.innerHTML =
      '<option value="" disabled selected>Select a Time Slot</option>';

    if (selectedPlan) {
      timeSlots[selectedPlan].forEach((slot) => {
        const option = document.createElement("option");
        option.value = slot.time;
        option.textContent = `${slot.time}`;
        option.dataset.price = slot.price;
        timeSlotDropdown.appendChild(option);
      });
    }
  });

  timeSlotDropdown.addEventListener("change", () => {
    const selectedOption =
      timeSlotDropdown.options[timeSlotDropdown.selectedIndex];
    const price = selectedOption.dataset.price;
    priceDisplay.innerHTML = `Price: <span>₹${price}</span>`;
  });

  function showNotification(message, type = "success") {
    notificationMessage.textContent = message;
    notification.style.backgroundColor =
      type === "success" ? "var(--success)" : "var(--danger)";
    notification.classList.add("show");

    setTimeout(() => {
      notification.classList.remove("show");
    }, 3000);
  }

  confirmBookingBtn.addEventListener("click", async () => {
    if (!selectedSeat) {
      showNotification("Please select a seat first!", "error");
      return;
    }

    if (!timeSlotDropdown.value) {
      showNotification("Please select a time slot!", "error");
      return;
    }

    const seatNumber = selectedSeat.dataset.seat;
    const date = datePicker.value;
    const timeSlot = timeSlotDropdown.value;
    const plan = planDropdown.value;
    const selectedOption =
      timeSlotDropdown.options[timeSlotDropdown.selectedIndex];
    const price = selectedOption.dataset.price;



    try {
      const response = await fetch(`${API_URL}/bookings/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seatNumber, date, timeSlot, plan, price }),
      });

      if (!response.ok) throw new Error("Failed to book the seat.");

      showNotification(`Seat ${seatNumber} booked for ${timeSlot}!`);
      selectedSeat.classList.add("booked");
      selectedSeat.classList.remove("selected");
      selectedSeat = null;

      resetSelections();
      timeSelection.style.display = "none";
    } catch (error) {
      showNotification("Booking failed. Please try again.", "error");
    }
  });

  backHomeBtn.addEventListener("click", () => {
    showNotification("Returning to home page...");
    window.location.href = "index2.html";
  });
});
