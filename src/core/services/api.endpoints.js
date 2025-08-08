// API Endpoints based on Backend Controllers
// Controllers: AuthController, UserController, CompanyController, ContactController, 
// FollowUpController, LeadController, NoteController, NotificationController, PropertyController, TaskFileController

export const API_ENDPOINTS = {
  // Authentication Endpoints (AuthController)
  AUTH: {
    LOGIN: '/api/auth/login',
    SEND_OTP: '/api/auth/send-otp',
    VERIFY_OTP: '/api/auth/verify-otp',
    RESET_PASSWORD_WITH_OTP: '/api/auth/reset-password-with-otp',
    LOGOUT: '/api/auth/logout'
  },

  // User Management Endpoints (UserController)
  USERS: {
    GET_USERNAME: (id) => `/api/users/${id}/username`,
    GET_USER_ROLE: '/api/users/user-role',
    GET_DIRECTOR_ROLE: '/api/users/director-role',
    GET_ADMIN_ROLE: '/api/users/admin-role',
    GET_BY_ROLE: (role) => `/api/users/role/${role}`,
    GET_ALL_BY_COMPANY: (companyId) => `/api/users/all-users/${companyId}`,
    GET_USER_ROLE_BY_COMPANY: (companyId) => `/api/users/user-role/${companyId}`,
    GET_ADMIN_ROLE_BY_COMPANY: (companyId) => `/api/users/admin-role/${companyId}`,
    GET_BY_ROLE_AND_COMPANY: (companyId, role) => `/api/users/role/${companyId}/${role}`,
    GET_BY_ID: (id) => `/api/users/${id}`,
    CREATE: '/api/users',
    UPDATE_PROFILE: (id) => `/api/users/update-profile/${id}`,
    DELETE: (id) => `/api/users/${id}`,
    UPLOAD_AVATAR: (id) => `/api/users/${id}/upload-avatar`,
    GET_AVATAR: (id) => `/api/users/${id}/avatar`,
    GET_BY_COMPANY: (companyId) => `/api/users/company/${companyId}`,
    LOGOUT: '/api/users/logout',
    REVOKE: (id) => `/api/users/${id}/revoke`,
    UNREVOKE: (id) => `/api/users/${id}/unrevoke`,
    GET_BY_ADMIN: (adminId) => `/api/users/admin/${adminId}/users`,
    GET_USER_BY_ADMIN: (adminId, userId) => `/api/users/admin/${adminId}/user/${userId}`,
    GET_ADMINS_BY_COMPANY: (companyId) => `/api/users/company/${companyId}/admins`,
    GET_USERS_BY_COMPANY: (companyId) => `/api/users/company/${companyId}/users`,
    ASSIGN_ADMIN: (userId) => `/api/users/${userId}/assign-admin`,
    UNASSIGN_ADMIN: (userId) => `/api/users/${userId}/unassign-admin`,
    COUNT_BY_ADMIN: (adminId) => `/api/users/count-by-admin/${adminId}`,
    USERS_AND_ADMINS_OVERVIEW: (companyId) => `/api/users/count-summary/${companyId}`,
    CHECK_SESSION: '/api/users/check-session'
  },

  // Company Management Endpoints (CompanyController)
  COMPANIES: {
    ADD: '/api/companies/add',
    GET_ALL: '/api/companies/all',
    GET_MY: '/api/companies/my',
    DELETE: (id) => `/api/companies/delete/${id}`,
    REVOKE: (id) => `/api/companies/revoke/${id}`,
    UNREVOKE: (id) => `/api/companies/unrevoke/${id}`,
    GET_NAME: (id) => `/api/companies/name/${id}`
  },

  // Contact Management Endpoints (ContactController)
  CONTACT: {
    SEND_MESSAGE: '/api/contact'
  },

  // Follow-up Management Endpoints (FollowUpController)
  FOLLOWUPS: {
    GET_ALL: (companyId) => `/api/${companyId}/followups`,
    GET_BY_ID: (companyId, id) => `/api/${companyId}/followups/${id}`,
    GET_BY_LEAD_ID: (companyId, leadId) => `/api/${companyId}/followups/lead/${leadId}`,
    GET_TODAY: (companyId) => `/api/${companyId}/followups/today`,
    CREATE: (companyId) => `/api/${companyId}/followups`,
    UPDATE: (companyId) => `/api/${companyId}/followups`,
    DELETE: (companyId, id) => `/api/${companyId}/followups/${id}`
  },


  // Lead Management Endpoints (LeadController)
  LEADS: {
    // Basic CRUD Operations
    GET_ALL: (companyId) => `/api/companies/${companyId}/leads`,
    GET_BY_ID: (companyId, id) => `/api/companies/${companyId}/leads/${id}`,
    CREATE: (companyId) => `/api/companies/${companyId}/leads`,
    UPDATE: (companyId, leadId) => `/api/companies/${companyId}/leads/${leadId}`,
    DELETE: (companyId, id) => `/api/companies/${companyId}/leads/${id}`,

    // Status Management
    UPDATE_STATUS: (companyId, id) => `/api/companies/${companyId}/leads/${id}/status`,

    // Lead Filtering & Retrieval
    GET_BY_SOURCE: (companyId, source) => `/api/companies/${companyId}/leads/source/${source}`,
    GET_BY_ASSIGNED_USER: (companyId, userId) => `/api/companies/${companyId}/leads/assigned-to/${userId}`,
    GET_BY_CREATED_BY: (companyId, userId) => `/api/companies/${companyId}/leads/created-by/${userId}`,
    GET_CREATED_OR_ASSIGNED: (companyId, userId) => `/api/companies/${companyId}/leads/created-or-assigned/${userId}`,

    // Remarks Management
    ADD_REMARK: (leadId) => `/api/companies/{companyId}/leads/${leadId}/remarks`,
    GET_REMARKS: (leadId) => `/api/companies/{companyId}/leads/${leadId}/remarks`,

    // Lead Assignment
    ASSIGN: (companyId, leadId, userId) => `/api/companies/${companyId}/leads/${leadId}/assign/${userId}`,
    UNASSIGN: (companyId, leadId) => `/api/companies/${companyId}/leads/${leadId}/unassign`,

    // Lead Information
    GET_NAME: (companyId, id) => `/api/companies/${companyId}/leads/${id}/name`,

    // Counting & Analytics
    GET_COUNT: (companyId) => `/api/companies/${companyId}/leads/count`,
    GET_CLOSED_COUNT: (companyId) => `/api/companies/${companyId}/leads/count/closed`,
    COUNT_FOR_USER: (companyId, userId) => `/api/companies/${companyId}/leads/count-for-user/${userId}`,
    COUNT_VISIBLE_TO_ADMIN: (companyId, adminId) => `/api/companies/${companyId}/leads/count-visible-to-admin/${adminId}`,
    COUNT_CLOSED_BY_ADMIN: (companyId, adminId) => `/api/companies/${companyId}/leads/count/closed-droped?companyId=${companyId}&adminId=${adminId}`,
    COUNT_SUMMARY: (companyId, userId) => `/api/companies/${companyId}/leads/count/summary/${userId}`,

    // Search & Advanced Filtering
    SEARCH: (companyId) => `/api/companies/${companyId}/leads/search`,
    SEARCH_CREATED_OR_ASSIGNED: (companyId, userId) => `/api/companies/${companyId}/leads/created-or-assigned/${userId}/search`,
    SEARCH_VISIBLE_TO_ADMIN: (companyId, adminId) => `/api/companies/${companyId}/leads/visible-to-admin/${adminId}/search`,

    // Admin-specific Views
    GET_ADMIN_VISIBLE: (companyId, adminId) => `/api/companies/${companyId}/leads/admin-visible/${adminId}`
  },

  // Note Management Endpoints (NoteController)
  NOTES: {
    CREATE: (companyId) => `/api/companies/${companyId}/notes`,
    GET_VISIBLE_TO_USER: (companyId, userId) => `/api/companies/${companyId}/notes/visible-to/${userId}`,
    GET_BY_ID: (companyId, noteId) => `/api/companies/${companyId}/notes/${noteId}`,
    GET_BY_USER: (companyId, userId) => `/api/companies/${companyId}/notes/user/${userId}`,
    GET_PUBLIC: (companyId) => `/api/companies/${companyId}/notes/public`,
    GET_PUBLIC_AND_ADMIN: (companyId) => `/api/companies/${companyId}/notes/public-and-admin`,
    GET_DIRECTOR_VISIBLE: (companyId, directorId) => `/api/companies/${companyId}/notes/director-visible/${directorId}`,
    UPDATE: (companyId, noteId) => `/api/companies/${companyId}/notes/${noteId}`,
    DELETE: (companyId, noteId) => `/api/companies/${companyId}/notes/${noteId}`,
    UPDATE_STATUS: (companyId, noteId) => `/api/companies/${companyId}/notes/${noteId}/status`,
    GET_BY_STATUS: (companyId, status) => `/api/companies/${companyId}/notes/status/${status}`,
    GET_BY_USER_AND_STATUS: (companyId, userId, status) => `/api/companies/${companyId}/notes/user/${userId}/status/${status}`,
    GET_BY_STATUS_ONLY: (status) => `/api/companies/{companyId}/notes/status-only/${status}`,
    GET_BY_PRIORITY: (companyId, priority) => `/api/companies/${companyId}/notes/priority/${priority}`,
    GET_BY_USER_AND_PRIORITY: (companyId, userId, priority) => `/api/companies/${companyId}/notes/user/${userId}/priority/${priority}`,
    GET_BY_PRIORITY_AND_STATUS: (companyId, priority, status) => `/api/companies/${companyId}/notes/priority/${priority}/status/${status}`,
    GET_BY_USER_PRIORITY_STATUS: (companyId, userId, priority, status) => `/api/companies/${companyId}/notes/user/${userId}/priority/${priority}/status/${status}`,
    GET_SORTED_BY_PRIORITY_ASC: (companyId) => `/api/companies/${companyId}/notes/priority/sort/asc`,
    GET_SORTED_BY_PRIORITY_DESC: (companyId) => `/api/companies/${companyId}/notes/priority/sort/desc`,
    UPDATE_PRIORITY: (companyId, noteId) => `/api/companies/${companyId}/notes/${noteId}/priority`,
    ADD_REMARK: (companyId, noteId) => `/api/companies/${companyId}/notes/${noteId}/remarks`,
    GET_REMARKS: (companyId, noteId) => `/api/companies/${companyId}/notes/${noteId}/remarks`,
    GET_VISIBLE_USERS: (companyId, noteId) => `/api/companies/${companyId}/notes/${noteId}/visible-users`,
    GET_ALL_FOR_USER: (companyId, userId) => `/api/companies/${companyId}/notes/all/${userId}`
  },

  // Notification Endpoints (NotificationController)
  NOTIFICATIONS: {
    GET_UNREAD_BY_USER_COMPANY: (userId, companyId) => `/api/notifications/user/${userId}/company/${companyId}/unread`,
    GET_UNREAD_COUNT: (userId, companyId) => `/api/notifications/user/${userId}/company/${companyId}/unread-count`,
    GET_BY_USER_COMPANY: (userId, companyId) => `/api/notifications/user/${userId}/company/${companyId}`,
    MARK_ALL_AS_READ: (userId, companyId) => `/api/notifications/mark-all-as-read/user/${userId}/company/${companyId}`,
    MARK_AS_READ: (id) => `/api/notifications/mark-as-read/${id}`,
    SEND: '/api/notifications/send'
  },

  // Property Management Endpoints (PropertyController)
  PROPERTIES: {
    CREATE: (companyId) => `/api/companies/${companyId}/properties`,
    UPDATE: (companyId, propertyId) => `/api/companies/${companyId}/properties/${propertyId}`,
    ADD_REMARK: (companyId, propertyId) => `/api/companies/${companyId}/properties/${propertyId}/remarks`,
    GET_REMARKS: (companyId, propertyId) => `/api/companies/${companyId}/properties/${propertyId}/remarks`,
    UPDATE_GENERAL: (companyId) => `/api/companies/${companyId}/properties`,
    GET_PAGED: (companyId) => `/api/companies/${companyId}/properties/paged`,
    GET_BY_ID: (companyId, id) => `/api/companies/${companyId}/properties/${id}`,
    DELETE: (companyId, id) => `/api/companies/${companyId}/properties/${id}`,
    GET_BY_STATUS: (companyId, status) => `/api/companies/${companyId}/properties/status/${status}`,
    GET_BY_SECTOR: (companyId, sector) => `/api/companies/${companyId}/properties/sector/${sector}`,
    GET_BY_SOURCE: (companyId, source) => `/api/companies/${companyId}/properties/source/${source}`,
    SEARCH_BY_NAME: (companyId) => `/api/companies/${companyId}/properties/search`,
    GET_BY_TYPE: (companyId, type) => `/api/companies/${companyId}/properties/type/${type}`,
    GET_BY_BHK: (companyId, bhk) => `/api/companies/${companyId}/properties/bhk/${bhk}`,
    GET_BY_OWNER_CONTACT: (companyId, contact) => `/api/companies/${companyId}/properties/owner-contact/${contact}`,
    GET_BY_CREATED_BY: (companyId, userId) => `/api/companies/${companyId}/properties/created-by/${userId}`,
    GET_NAME: (companyId, propertyId) => `/api/companies/${companyId}/properties/${propertyId}/name`,
    GET_COUNT: (companyId) => `/api/companies/${companyId}/properties/count`,
    GET_OVERVIEW: (companyId) => `/api/companies/${companyId}/properties/overview`,
    COUNT_PROPERTY_OVERVIEW: (companyId) => `/api/companies/${companyId}/properties/count/overview`,
    COUNT_BY_USER: (companyId, userId) => `/api/companies/${companyId}/properties/created-by/${userId}/count`,
    SEARCH_PAGED: (companyId) => `/api/companies/${companyId}/properties/search-paged`,
    COUNT_PROPERTY_OVERVIEW: (companyId) => `/api/companies/${companyId}/properties/count/property-overview`
  },

  // Task File Management Endpoints (TaskFileController)
  TASKS: {
    GET_ALL: '/api/task-files',
    GET_ASSIGNED: '/api/task-files/assigned',
    GET_ADMIN_ALL: '/api/task-files/admin-all',
    GET_UPLOADED: '/api/task-files/uploaded',
    UPLOAD: '/api/task-files/upload',
    ASSIGN: (taskId) => `/api/task-files/${taskId}/assign`,
    PREVIEW: (taskId) => `/api/task-files/${taskId}/preview`,
    DOWNLOAD: (taskId) => `/api/task-files/${taskId}/download`,
    UPDATE_CELL: (taskId) => `/api/task-files/${taskId}/update-cell`,
    ADD_ROW: (taskId) => `/api/task-files/${taskId}/add-row`,
    ADD_COLUMN: (taskId) => `/api/task-files/${taskId}/add-column`,
    DELETE_COLUMN: (taskId) => `/api/task-files/${taskId}/delete-column`,
    DELETE: (taskId) => `/api/task-files/${taskId}`,
    UNDO: (taskId) => `/api/task-files/${taskId}/undo`
  }
};

// Helper function to build URL with query parameters
export const buildUrl = (endpoint, params = {}) => {
  const url = new URL(endpoint, window.location.origin);
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined) {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.pathname + url.search;
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH'
};

// Common query parameters
export const QUERY_PARAMS = {
  PAGE: 'page',
  SIZE: 'size',
  SORT: 'sort',
  SEARCH: 'search',
  FILTER: 'filter',
  START_DATE: 'startDate',
  END_DATE: 'endDate',
  COMPANY_ID: 'companyId',
  USER_ID: 'userId',
  ADMIN_ID: 'adminId',
  STATUS: 'status',
  PRIORITY: 'priority',
  IS_ADMIN: 'isAdmin',
  IS_DIRECTOR: 'isDirector'
};
