// src/actions/userActions.js

import axios from '../api/axios';
import { customAlert } from '../utils/alertUtils';

/**
 * Update a user profile using the given payload.
 * @param {Object} user - User payload { userId, name, email, phone, role, password? }
 * @param {Function} [onSuccess] - Optional callback on success
 * @param {Function} [onError] - Optional callback on error
 */
export async function updateUserProfile(user, onSuccess, onError) {
    const { userId, name, email, phone, role, password } = user;

    if (!userId || !name || !email || !phone || !role) {
        customAlert("⚠️ Please fill in all required fields.");
        return;
    }

    const payload = { name, email, phone, role };
    if (password?.trim()) {
        payload.password = password;
    }

    try {
        const res = await axios.put(`/users/update-profile/${userId}`, payload);
        customAlert("✅ User updated successfully!");

        if (typeof onSuccess === 'function') onSuccess(res.data);

        // Optional fallback for legacy global refresh
        if (typeof window.loadUsers === 'function') {
            window.loadUsers();
        }

        // Auto-close any modal if still open
        document.querySelector(".modal")?.remove();
    } catch (error) {
        const message = error?.response?.data?.message || "Error updating user";
        customAlert(message);
        if (typeof onError === 'function') onError(error);
    }
}

/**
 * Submit updated user (alias for updateUserProfile for backward compatibility)
 * @param {Object} user - User payload { userId, name, email, phone, role, password? }
 * @param {Function} [onSuccess] - Optional callback on success
 * @param {Function} [onError] - Optional callback on error
 */
export async function submitUpdatedUser(user, onSuccess, onError) {
    return await updateUserProfile(user, onSuccess, onError);
}
