document.getElementById("authForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  const formData = {
    firstname: document.getElementById("firstname").value,
    lastname: document.getElementById("lastname").value,
    age: document.getElementById("age").value,
    gender: document.getElementById("gender").value,
    mobileno: document.getElementById("mobileno").value,
    email: document.getElementById("email").value,
    password,
    confirmPassword,
  };

  console.log("📤 Sending Data:", formData);

  try {
    const response = await fetch("http://localhost:4000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    console.log("📩 Response Received:", result);

    if (response.ok) {
      alert(result.message);
      document.getElementById("authForm").reset();
      window.location.replace("/frontend/login/login.html");
    } else {
      alert(result.error || "Registration failed");
    }
  } catch (error) {
    console.error("❌ Error:", error);
    alert("An error occurred. Please try again.");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const userDisplay = document.getElementById("userDisplay");
  const logoutButton = document.getElementById("logoutButton");

  const token = localStorage.getItem("jwtToken");
  if (token) {
    try {
      const user = parseJwt(token);
      userDisplay.innerHTML = `Welcome, ${user.name}`;
      logoutButton.style.display = "block";
    } catch (error) {
      console.error("Invalid token", error);
      localStorage.removeItem("jwtToken");
    }
  }

  logoutButton.addEventListener("click", function () {
    localStorage.removeItem("jwtToken");
    window.location.reload();
  });
});

// Function to decode JWT token
function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(base64));
}
