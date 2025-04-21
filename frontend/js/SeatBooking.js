document.addEventListener("DOMContentLoaded", async () => {
  // DOM Elements
  const seatsContainer = document.querySelector(".seats-container");
  const planDropdown = document.getElementById("plan-selection");
  const timeSlotDropdown = document.getElementById("time-slot");
  const priceDisplay = document.getElementById("price-display");
  const datePicker = document.getElementById("date-picker");
  const confirmBookingBtn = document.getElementById("confirmBooking");
  const notification = document.getElementById("notification");
  const notificationMessage = document.getElementById("notification-message");
  const backHomeBtn = document.getElementById("backHome");
  const selectedSeatInfo = document.getElementById("selectedSeatInfo");
  const loadingOverlay = document.getElementById("loadingOverlay");

  // State variables
  let selectedSeat = null;
  let currentBookings = [];

  // Backend API URL
  const API_URL = "http://localhost:4000";

  // Set minimum date to today
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  datePicker.min = formattedDate;
  datePicker.value = formattedDate;

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

  /**
   * Fetch available seats from backend
   */

  /**
   * Generate seats in the seating layout
   */
  function generateSeats() {
    seatsContainer.innerHTML = "";

    for (let i = 1; i <= 40; i++) {
      const seat = document.createElement("div");
      seat.classList.add("seat", "available");
      seat.textContent = i;
      seat.dataset.seat = i;

      seat.addEventListener("click", () => {
        if (seat.classList.contains("booked")) {
          showNotification("This seat is already booked!", "error");
          return;
        }

        // Deselect previous seat if any
        if (selectedSeat) {
          selectedSeat.classList.remove("selected");
        }

        // Select new seat
        selectedSeat = seat;
        seat.classList.add("selected");

        // Update selected seat info
        updateSelectedSeatInfo();

        // Update confirm button state
        updateConfirmButtonState();
      });

      seatsContainer.appendChild(seat);
    }
  }

  /**
   * Update the selected seat information display
   */
  function updateSelectedSeatInfo() {
    if (selectedSeat) {
      selectedSeatInfo.innerHTML = `
        <p>Selected Seat: <strong>${selectedSeat.dataset.seat}</strong></p>
      `;
    } else {
      selectedSeatInfo.innerHTML = `<p>No seat selected</p>`;
    }
  }

  /**
   * Update the state of the confirm button based on selections
   */
  function updateConfirmButtonState() {
    const hasSelectedSeat = selectedSeat !== null;
    const hasSelectedTimeSlot = timeSlotDropdown.value !== "";

    confirmBookingBtn.disabled = !(hasSelectedSeat && hasSelectedTimeSlot);
  }

  /**
   * Reset form selections
   */
  function resetSelections() {
    planDropdown.value = "";
    timeSlotDropdown.innerHTML =
      '<option value="" disabled selected>Select a Time Slot</option>';
    priceDisplay.textContent = "₹0";
    updateConfirmButtonState();
  }

  /**
   * Show notification message
   */
  function showNotification(message, type = "success") {
    notificationMessage.textContent = message;

    notification.className = `notification ${type}`;
    notification.classList.add("show");

    setTimeout(() => {
      notification.classList.remove("show");
    }, 3000);
  }

  /**
   * Show/hide loading overlay
   */
  function showLoading(show) {
    if (show) {
      loadingOverlay.classList.add("show");
    } else {
      loadingOverlay.classList.remove("show");
    }
  }

  /**
   * Initialize the booking page
   */
  async function initBookingPage() {
    // Generate seats
    generateSeats();

    // Set up event listeners
    datePicker.addEventListener("change", () => {
      if (timeSlotDropdown.value) {
        fetchAvailableSeats(datePicker.value, timeSlotDropdown.value);
      }
    });

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

      updateConfirmButtonState();
    });

    timeSlotDropdown.addEventListener("change", () => {
      if (timeSlotDropdown.selectedIndex > 0) {
        const selectedOption =
          timeSlotDropdown.options[timeSlotDropdown.selectedIndex];
        const price = selectedOption.dataset.price;
        priceDisplay.textContent = `₹${price}`;
      } else {
        priceDisplay.textContent = "₹0";
      }

      updateConfirmButtonState();
    });

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
      const email = localStorage.getItem("userEmail");

      try {
        const response = await fetch(`${API_URL}/bookings/book-seat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            seatNumber,
            email,
            date,
            timeSlot,
            plan,
            price,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to book the seat. Please try again."
          );
        }

        const data = await response.json();

        showNotification(
          `Seat ${seatNumber} booked successfully for ${timeSlot}!`,
          "success"
        );

        selectedSeat.classList.add("booked");
        selectedSeat.classList.remove("selected");
        selectedSeat = null;

        resetSelections();
        updateSelectedSeatInfo();
      } catch (error) {
        console.error("Booking error:", error);
        showNotification(
          error.message || "Failed to book seat. Please try again.",
          "error"
        );
      }
    });

    backHomeBtn.addEventListener("click", () => {
      window.location.href = "index2.html";
    });
  }

  // Initialize the booking page
  initBookingPage();
});
