// Property Role-based Utility Functions
// Use these functions with your existing loadProperty function

/**
 * Get user role and ID from localStorage
 */
function getUserInfo() {
    const userRole = localStorage.getItem("userRole") ||
        JSON.parse(localStorage.getItem("user") || "{}")?.role;
    const userId = parseInt(localStorage.getItem("userId")) ||
        JSON.parse(localStorage.getItem("user") || "{}")?.userId ||
        JSON.parse(localStorage.getItem("user") || "{}")?.id;
    
    return { userRole, userId };
}

/**
 * Check if user can view a property based on role
 */
function canViewProperty(property, userRole, userId) {
    if (userRole === "DIRECTOR") {
        return true; // Director can see all properties
    }
    
    // Admin and User can only see properties they created
    const possibleCreatedByIds = [
        property.createdBy?.userId,
        property.createdBy?.id,
        property.createdById,
        property.createdBy,
        property.userId,
        property.createdByUserId
    ].filter(Boolean);
    
    return possibleCreatedByIds.some(id => id?.toString() === userId?.toString());
}

/**
 * Get display value for sensitive fields based on user role
 */
function getSensitiveFieldDisplay(value, userRole, fallback = "Hidden") {
    if (userRole === "DIRECTOR") {
        return value || "N/A";
    }
    return fallback;
}

/**
 * Filter properties based on user role
 */
function filterPropertiesByRole(properties, userRole, userId) {
    if (userRole === "DIRECTOR") {
        return properties; // Director can see all
    }
    
    return properties.filter(property => canViewProperty(property, userRole, userId));
}

// Export functions for use in your existing code
window.propertyRoleUtils = {
    getUserInfo,
    canViewProperty,
    getSensitiveFieldDisplay,
    filterPropertiesByRole
};