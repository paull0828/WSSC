document.addEventListener("DOMContentLoaded", () => {
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

  // Set minimum date to today
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  datePicker.min = formattedDate;
  //datePicker.value = formattedDate //Removed as per update

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
      { time: "11 PM - 9 PM", price: 1750 },
      { time: "12 PM - 10 PM", price: 1750 },
    ],
    "full-day": [{ time: "8 AM - 10 PM", price: 2000 }],
  };

  // Generate 40 seats dynamically
  for (let i = 1; i <= 40; i++) {
    const seat = document.createElement("div");
    seat.classList.add("seat");
    seat.textContent = i;

    // Removed default booking logic as per update

    seat.addEventListener("click", () => {
      if (seat.classList.contains("booked")) return;

      if (selectedSeat) {
        selectedSeat.classList.remove("selected");
      }

      selectedSeat = seat;
      seat.classList.add("selected");

      // Smooth scroll to booking details on mobile
      if (window.innerWidth < 768) {
        timeSelection.scrollIntoView({ behavior: "smooth" });
      }

      resetSelections(); // Reset everything when a new seat is selected
      timeSelection.style.display = "block";
    });

    seatsContainer.appendChild(seat);
  }

  // Reset all selections when date is changed
  datePicker.addEventListener("change", resetSelections);

  // Reset function
  function resetSelections() {
    planDropdown.value = "";
    timeSlotDropdown.innerHTML =
      '<option value="" disabled selected>Select a Time Slot</option>';
    priceDisplay.innerHTML = "Price: <span>₹0</span>";
  }

  // Populate time slots based on selected plan
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

  // Update price when selecting a time slot
  timeSlotDropdown.addEventListener("change", () => {
    const selectedOption =
      timeSlotDropdown.options[timeSlotDropdown.selectedIndex];
    const price = selectedOption.dataset.price;
    priceDisplay.innerHTML = `Price: <span>₹${price}</span>`;
  });

  // Show notification
  function showNotification(message, type = "success") {
    notificationMessage.textContent = message;
    notification.style.backgroundColor =
      type === "success" ? "var(--success)" : "var(--danger)";
    notification.classList.add("show");

    setTimeout(() => {
      notification.classList.remove("show");
    }, 3000);
  }

  // Confirm Booking
  confirmBookingBtn.addEventListener("click", () => {
    if (!selectedSeat) {
      showNotification("Please select a seat first!", "error");
      return;
    }

    if (!timeSlotDropdown.value) {
      showNotification("Please select a time slot!", "error");
      return;
    }

    showNotification(
      `Seat ${selectedSeat.textContent} booked for ${timeSlotDropdown.value}!`
    );

    // Mark seat as booked
    selectedSeat.classList.add("booked");
    selectedSeat.classList.remove("selected");
    selectedSeat = null;

    // Reset selections for the next booking
    resetSelections();
    timeSelection.style.display = "none";
  });

  // Back to home button
  backHomeBtn.addEventListener("click", () => {
    showNotification("Returning to home page...");
    window.location.href = "index2.html";
  });
});
