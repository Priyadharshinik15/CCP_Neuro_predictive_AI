const API_URL = "http://localhost:5000/api/auth";

// Register user
export async function register(name: string, email: string, password: string) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });
  if (!response.ok) throw new Error("Registration failed");
  return response.json();
}

// Login user
export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) throw new Error("Invalid credentials");
  return response.json();
}

// Update Profile
export async function updateUser(userData: any) {
  const response = await fetch(`${API_URL}/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify(userData)
  });

  if (!response.ok) throw new Error("Failed to update profile");
  return response.json();
}
