const form = document.getElementById("bookingForm");
const bookingList = document.getElementById("bookingList");
const searchInput = document.getElementById("searchInput");

const roomTypeSelect = document.getElementById("roomType");
const roomNumberSelect = document.getElementById("roomNumber");

// ===== Room Quotas =====
const roomQuotas = {
  "Study Room": 5,
  "Meeting Room": 3,
  "Soundproof Room": 2,
  "Research Room": 4,
};

// ===== Custom Time Picker =====
const timeInput = document.getElementById("time");
const timeDropdown = document.getElementById("timeDropdown");
const hourList = document.getElementById("hourList");
const minuteList = document.getElementById("minuteList");

let selectedHour = null;
let selectedMinute = null;

// Store bookings
let bookings = [];

// ===== Generate hours (09–17) =====
for (let i = 9; i <= 17; i++) {
  const li = document.createElement("li");
  li.textContent = i.toString().padStart(2, "0");
  li.addEventListener("click", () => selectHour(li.textContent));
  hourList.appendChild(li);
}

// ===== Generate minutes (00–55, step 5) =====
for (let i = 0; i < 60; i += 5) {
  const li = document.createElement("li");
  li.textContent = i.toString().padStart(2, "0");
  li.addEventListener("click", () => selectMinute(li.textContent));
  minuteList.appendChild(li);
}

// Toggle dropdown
timeInput.addEventListener("click", () => {
  timeDropdown.classList.toggle("active");
});

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  if (!e.target.closest(".custom-time-picker")) {
    timeDropdown.classList.remove("active");
  }
});

function selectHour(hour) {
  selectedHour = hour;
  updateActive(hourList, hour);
  updateTimeInput();
}

function selectMinute(minute) {
  selectedMinute = minute;
  updateActive(minuteList, minute);
  updateTimeInput();
}

function updateActive(list, value) {
  [...list.children].forEach((li) => {
    li.classList.toggle("active", li.textContent === value);
  });
}

function updateTimeInput() {
  if (selectedHour !== null && selectedMinute !== null) {
    timeInput.value = `${selectedHour}:${selectedMinute}`;
    timeDropdown.classList.remove("active");
  }
}

// ===== Room Number Handling =====
roomTypeSelect.addEventListener("change", () => {
  const selectedType = roomTypeSelect.value;
  roomNumberSelect.innerHTML = '<option value="">Select room number</option>';

  if (!selectedType) return;

  const totalRooms = roomQuotas[selectedType];
  for (let i = 1; i <= totalRooms; i++) {
    const option = document.createElement("option");
    option.value = `Room ${i}`;
    option.textContent = `Room ${i}`;
    roomNumberSelect.appendChild(option);
  }
});

// ===== Booking Logic =====
form.addEventListener("submit", function (e) {
  e.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const booking = {
    name: document.getElementById("name").value.trim(),
    idNumber: document.getElementById("idNumber").value.trim(),
    roomType: roomTypeSelect.value,
    roomNumber: roomNumberSelect.value,
    date: document.getElementById("date").value,
    time: timeInput.value,
    duration: parseInt(document.getElementById("duration").value),
    purpose: document.getElementById("purpose").value.trim(),
  };

  // Check conflict
  if (isRoomUnavailable(booking)) {
    alert(
      "❌ This room is already booked at the selected time. Please choose another room or time."
    );
    return;
  }

  bookings.push(booking);
  addBookingToList(booking, true);
  form.reset();
  roomNumberSelect.innerHTML = '<option value="">Select room number</option>';
  timeInput.value = "";
  selectedHour = null;
  selectedMinute = null;
});

// ===== Conflict Checker =====
function isRoomUnavailable(newBooking) {
  const newStart = new Date(`${newBooking.date}T${newBooking.time}`);
  const newEnd = new Date(
    newStart.getTime() + newBooking.duration * 60 * 60 * 1000
  );

  return bookings.some((existing) => {
    if (
      existing.roomType !== newBooking.roomType ||
      existing.roomNumber !== newBooking.roomNumber ||
      existing.date !== newBooking.date
    ) {
      return false;
    }

    const existingStart = new Date(`${existing.date}T${existing.time}`);
    const existingEnd = new Date(
      existingStart.getTime() + existing.duration * 60 * 60 * 1000
    );

    return newStart < existingEnd && newEnd > existingStart;
  });
}

// ===== Add booking item =====
function addBookingToList(booking, animate = false) {
  const li = document.createElement("li");
  li.innerHTML = `
    <strong>${booking.name}</strong> (${booking.idNumber})<br>
    Room: ${booking.roomType} - ${booking.roomNumber}<br>
    Date: ${booking.date}<br>
    Time: ${booking.time} (${booking.duration} hour${
    booking.duration > 1 ? "s" : ""
  })<br>
    ${booking.purpose ? "Purpose: " + booking.purpose : ""}
  `;

  if (animate) {
    li.style.opacity = "0";
    li.style.transform = "translateY(10px) scale(0.98)";
    setTimeout(() => {
      li.style.transition = "all 0.35s ease";
      li.style.opacity = "1";
      li.style.transform = "translateY(0) scale(1)";
    }, 10);
  }

  bookingList.appendChild(li);
}

// ===== Search filter =====
searchInput.addEventListener("input", function () {
  const query = this.value.toLowerCase();
  const items = bookingList.querySelectorAll("li");

  items.forEach((item) => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(query) ? "" : "none";
  });
});
