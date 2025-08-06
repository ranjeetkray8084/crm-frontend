import { useEffect, useState } from "react";
import { useUsers } from '../../../../core/hooks';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import { customAlert } from '../../../../core/utils/alertUtils';

const UpdateUserModal = ({ user, onClose }) => {
  const { user: currentUser } = useAuth();
  const { updateUser } = useUsers(currentUser?.companyId);
  const [formData, setFormData] = useState({
    userId: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "USER",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        userId: user.userId || "",
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "",
        role: user.role || "USER",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      customAlert('❌ Please fill in all required fields.');
      return;
    }

    setLoading(true);
    
    const userData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
    };

    // Only include password if it's provided
    if (formData.password) {
      userData.password = formData.password;
    }

    const result = await updateUser(formData.userId, userData);
    if (result.success) {
      onClose();
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 modal">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative animate-fadeIn modal-content1">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-red-600 text-2xl font-bold"
          aria-label="Close"
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-800">Update User</h2>

        <form onSubmit={handleSubmit} id="updateUserForm" className="space-y-4">
          <input type="hidden" id="updateUserId" />

          <input
            id="updateName"
            type="text"
            placeholder="Name"
            className="w-full border px-3 py-2 rounded"
            required
          />

          <input
            id="updateEmail"
            type="email"
            placeholder="Email"
            className="w-full border px-3 py-2 rounded"
            required
          />

          <input
            id="updatePhone"
            type="text"
            placeholder="Phone"
            className="w-full border px-3 py-2 rounded"
            required
          />

          <input
            id="updatePassword"
            type="password"
            placeholder="New Password (optional)"
            className="w-full border px-3 py-2 rounded"
          />

          <div>
            <label htmlFor="updateRole" className="block font-medium mb-1">
              Role:
            </label>
            <select
              id="updateRole"
              className="w-full border px-3 py-2 rounded"
              required
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
          >
            Update
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateUserModal;
