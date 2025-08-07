import axios from './axios'
import { customAlert } from '../utils/alertUtils'

// Load Account Info
export async function loadAccountInfo() {
  const localUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = localUser.userId;
  if (!userId) return customAlert("User not found in local storage.");

  try {
    const { data: user } = await axios.get(`/users/${userId}`);

    document.getElementById("UserName").value = user.name;
    document.getElementById("userEmail").value = user.email;
    document.getElementById("userPhone").value = user.phone;
    document.getElementById("UserRole").value = user.role;

    UfetchAvatar(userId);
    localStorage.setItem("user", JSON.stringify(user));
  } catch (error) {
    customAlert("Error loading user info.");
  }
}

export function enableEdit() {
  setReadOnlyMode(false);

  // Safely access DOM elements with null checks
  const editBtn = document.querySelector(".edit-btn");
  const saveBtn = document.querySelector(".save-btn");
  const roleContainer = document.getElementById("roleContainer");

  if (editBtn) editBtn.style.display = "none";
  if (saveBtn) saveBtn.style.display = "inline-block";
  if (roleContainer) roleContainer.style.display = "none";
}

export function setReadOnlyMode(isReadOnly) {
  ["UserName", "userEmail", "userPhone"].forEach((id) => {
    const input = document.getElementById(id);
    if (input) input.readOnly = isReadOnly;
  });

  const roleContainer = document.getElementById("roleContainer");
  if (roleContainer) roleContainer.style.display = isReadOnly ? "block" : "none";
}

export async function saveAccount(event) {
  event.preventDefault();

  const localUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = localUser.userId;
  if (!userId) return;

  const name = document.getElementById("UserName")?.value;
  const email = document.getElementById("userEmail")?.value;
  const phone = document.getElementById("userPhone")?.value;

  if (!name || !email || !phone) {
    return customAlert("Please fill in all fields.");
  }

  const data = { name, email, phone, role: localUser.role };

  try {
    const res = await axios.put(`/users/update-profile/${userId}`, data);
    customAlert(res.data.message || "Account updated successfully!");
    setReadOnlyMode(true);

    // Safely access DOM elements with null checks
    const editBtn = document.querySelector(".edit-btn");
    const saveBtn = document.querySelector(".save-btn");

    if (editBtn) editBtn.style.display = "inline-block";
    if (saveBtn) saveBtn.style.display = "none";

    loadAccountInfo();
  } catch (error) {
    const msg = error?.response?.data?.message || "An error occurred while saving.";
    customAlert(msg);
  }
}

export async function UfetchAvatar(userId) {
  try {
    const res = await axios.get(`/users/${userId}/avatar`, { responseType: 'blob' });
    const imageUrl = URL.createObjectURL(res.data);
    const avatarPreview = document.getElementById("UavatarPreview");
    if (avatarPreview) avatarPreview.src = imageUrl;
  } catch (error) {
    const avatarPreview = document.getElementById("UavatarPreview");
    if (avatarPreview) avatarPreview.src = "assets/default-avatar.png";
  }
}

export function setupAvatarUploadListener() {
  const avatarInput = document.getElementById("avatarInput");
  const avatarPreview = document.getElementById("UavatarPreview");

  avatarInput.addEventListener("change", async function () {
    const file = this.files[0];
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user?.userId) return customAlert("Please log in to upload your avatar.");

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => avatarPreview.src = e.target.result;
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append("avatar", file);
      formData.append("avatarName", file.name);

      try {
        avatarPreview.src = "assets/uploading.gif";

        const uploadRes = await axios.post(`/users/${user.userId}/upload-avatar`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        customAlert(uploadRes.data || "Avatar uploaded successfully!");

        const { data: updatedUser } = await axios.get(`/users/${user.userId}`);
        UfetchAvatar(updatedUser.userId);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch (error) {
        customAlert("Error uploading avatar: " + error.message);
        avatarPreview.src = "assets/default-avatar.png";
      }
    } else {
      avatarPreview.src = "assets/default-avatar.png";
    }
  });
}
