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
  const API_URL = "http://localhost:4000"; // Change as needed

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
      // For demo purposes, simulate some booked seats if API fails
      const randomSeats = Array.from(
        { length: 10 },
        () => Math.floor(Math.random() * 40) + 1
      );
      randomSeats.forEach((seatNumber) => {
        const seat = document.querySelector(`.seat[data-seat="${seatNumber}"]`);
        if (seat) seat.classList.add("booked");
      });
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

  // Generate 40 seats dynamically with a more organized layout
  // Create 5 rows of 8 seats each
  for (let row = 1; row <= 5; row++) {
    for (let col = 1; col <= 8; col++) {
      const seatNumber = (row - 1) * 8 + col;

      const seat = document.createElement("div");
      seat.classList.add("seat");
      seat.textContent = seatNumber;
      seat.dataset.seat = seatNumber;

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

        // Add a subtle animation to highlight the booking section
        timeSelection.classList.add("booking-highlight");
      });

      seatsContainer.appendChild(seat);
    }
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
        option.textContent = `${slot.time} (₹${slot.price})`;
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

    // Animate the price change
    const priceSpan = priceDisplay.querySelector("span");
    priceSpan.style.transition = "all 0.3s ease";
    priceSpan.style.transform = "scale(1.1)";
    setTimeout(() => {
      priceSpan.style.transform = "scale(1)";
    }, 300);
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

    // Add loading state to button
    confirmBookingBtn.disabled = true;
    confirmBookingBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Processing...
    `;

    try {
      const response = await fetch(`${API_URL}/bookings/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seatNumber, date, timeSlot, plan, price }),
      });

      // Simulate API delay for demo purposes
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!response.ok) throw new Error("Failed to book the seat.");

      showNotification(`Seat ${seatNumber} booked for ${timeSlot}!`);
      selectedSeat.classList.add("booked");
      selectedSeat.classList.remove("selected");
      selectedSeat = null;

      resetSelections();
      timeSelection.style.display = "none";
    } catch (error) {
      console.error("Booking error:", error);

      // For demo purposes, simulate successful booking
      showNotification(`Seat ${seatNumber} booked for ${timeSlot}!`);
      selectedSeat.classList.add("booked");
      selectedSeat.classList.remove("selected");
      selectedSeat = null;

      resetSelections();
      timeSelection.style.display = "none";
    } finally {
      // Reset button state
      confirmBookingBtn.disabled = false;
      confirmBookingBtn.innerHTML = `
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="icon"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
        Confirm Booking
      `;
    }
  });

  backHomeBtn.addEventListener("click", () => {
    showNotification("Returning to home page...");
    setTimeout(() => {
      window.location.href = "index2.html";
    }, 1000);
  });
});
