// src/actions/assignAdmin.js
import axios from '../api/axios';
import { customAlert } from '../utils/alertUtils';

/**
 * Fetch all available admins of a company
 * @param {number} companyId 
 * @returns {Promise<Array>} list of admins
 */
export async function fetchCompanyAdmins(companyId) {
    try {
        const response = await axios.get(`/users/admin-role/${companyId}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch admins:", error);
        throw new Error("Unable to load admins.");
    }
}

/**
 * Assign a selected admin to a user
 * @param {number} selectedAdminId 
 * @param {number} userId 
 * @returns {Promise<void>}
 */
export async function assignAdminToUser(selectedAdminId, userId) {
    try {
        // Use the correct endpoint format that matches confirmAssignAdmin
        await axios.put(`/users/${userId}/assign-admin`, {
            adminId: selectedAdminId
        });
        customAlert("✅ Admin assigned successfully.");
    } catch (error) {
        console.error("Error assigning admin:", error);

        // Handle 401 specifically to prevent automatic logout
        if (error.response?.status === 401) {
            customAlert("❌ Session expired. Please login again.");
            return;
        }

        const msg = error?.response?.data?.message || error?.response?.data || "Failed to assign admin.";
        customAlert(`❌ ${msg}`);
        throw new Error(msg);
    }
}

/**
 * Confirm and assign admin to user (DOM-based version)
 * @param {number} userId 
 */
export function confirmAssignAdmin(userId) {
    const selectedAdminId = parseInt(document.getElementById("selectedAdminId").value, 10);

    if (!selectedAdminId || isNaN(selectedAdminId)) {
        customAlert("Please select a valid admin.");
        return;
    }

    // Use axios instance instead of fetch
    axios.put(`/users/${userId}/assign-admin`, {
        adminId: selectedAdminId
    })
        .then(() => {
            customAlert("User assigned successfully!");
            // Call global functions if they exist
            if (window.loadUsers) window.loadUsers();
            if (window.closeAssignModal) window.closeAssignModal();
        })
        .catch(err => {
            console.error("Error assigning admin:", err);
            const message = err.response?.data?.message || err.message || "Error assigning admin.";
            customAlert(message);
        });
}

/**
 * Unassign admin from user
 * @param {number} userId 
 */
export async function unassignAdminFromUser(userId) {
    try {
        await axios.put(`/users/${userId}/unassign-admin`);
        customAlert("✅ Admin unassigned successfully.");
        // Reload users if function exists
        if (window.loadUsers) window.loadUsers();
    } catch (error) {
        console.error("Error unassigning admin:", error);

        // Handle 401 specifically to prevent automatic logout
        if (error.response?.status === 401) {
            customAlert("❌ Session expired. Please login again.");
            return;
        }

        const msg = error?.response?.data?.message || error?.response?.data || "Failed to unassign admin.";
        customAlert(`❌ ${msg}`);
    }
}
