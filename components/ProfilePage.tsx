import React, { useState } from "react";
import axios from "axios";

const ProfilePage: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("astralex_token");

  const [formData, setFormData] = useState({
    name: user.name || "",
    username: user.username || "",
    email: user.email || "",
    phone: user.phone || "",
    location: user.location || "",
    bio: user.bio || "",
    role: user.role || "Student",
  });

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState(user.profilePhoto ? `http://localhost:5000/uploads/${user.profilePhoto}` : "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    setProfilePhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value as string));
    if (profilePhoto) data.append("profilePhoto", profilePhoto);

    try {
      const res = await axios.put("http://localhost:5000/api/auth/update-profile", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.setItem("user", JSON.stringify(res.data.user));
      alert("Profile updated successfully!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-16 animate-fade-in">
      <h2 className="text-3xl font-bold text-white text-center mb-6">Edit Profile</h2>
      <div className="bg-gray-800 p-6 rounded-lg space-y-4">
        <div className="flex flex-col items-center">
          <img
            src={preview || "https://via.placeholder.com/150"}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-2 border-orange-500"
          />
          <label className="mt-2 bg-orange-500 text-white px-4 py-1 rounded cursor-pointer hover:bg-orange-600">
            Change Photo
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </label>
        </div>

        {["name", "username", "email", "phone", "location"].map(field => (
          <input
            key={field}
            name={field}
            value={(formData as any)[field]}
            onChange={handleChange}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
        ))}

        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Short bio"
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
        >
          <option value="Student">Student</option>
          <option value="Working">Working</option>
        </select>

        <button
          onClick={handleSubmit}
          className="w-full py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
