import { useState, useEffect } from 'react'
import { User, Camera, Edit3, Save, X } from 'lucide-react'
import { useAuth } from '../../../../shared/contexts/AuthContext'
import { UserService } from '../../../../core/services'
import { customAlert } from '../../../../core/utils/alertUtils'

const AccountSection = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('/assets/default-avatar.png')

  const loadAccountInfo = async () => {
    const localUser = JSON.parse(localStorage.getItem('user') || '{}')
    const userId = localUser.userId
    if (!userId) {
      customAlert('User not found in local storage.')
      return
    }

    try {
      const result = await UserService.getUserById(userId)
      if (result.success) {
        const userData = result.data
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          role: userData.role || '',
        })
        localStorage.setItem('user', JSON.stringify(userData))
        await fetchAvatar(userId)
      } else {
        // Display specific error message from backend
        const errorMessage = result.error || 'Failed to load user'
  
        customAlert('❌ Error loading user info: ' + errorMessage)
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Connection error'
      customAlert('❌ Error loading user info: ' + errorMessage)
    }
  }

  const fetchAvatar = async (userId) => {
    try {
      const result = await UserService.getAvatar(userId)
      if (result.success && result.data) {
        setAvatarUrl(result.data)
      } else {
        setAvatarUrl('/assets/default-avatar.png')
      }
    } catch (error) {
      setAvatarUrl('/assets/default-avatar.png')
    }
  }

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || '',
      })
    }

    loadAccountInfo()
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || '',
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.phone) {
      customAlert('Please fill in all fields.')
      return
    }

    setLoading(true)
    
    try {
      const localUser = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = localUser.userId
      
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role
      }

      const result = await UserService.updateProfile(userId, updateData)
      
      if (result.success) {
        customAlert('✅ Account updated successfully!')
        setIsEditing(false)
        
        // Get the updated user data from backend response
        const updatedUserData = result.data.user || result.data
        
        // Update local storage with new data from backend
        const updatedUser = { 
          ...localUser, 
          name: updatedUserData.name,
          email: updatedUserData.email,
          phone: updatedUserData.phone,
          role: updatedUserData.role
        }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        // Update form data with the new values
        setFormData({
          name: updatedUserData.name || updateData.name,
          email: updatedUserData.email || updateData.email,
          phone: updatedUserData.phone || updateData.phone,
          role: updatedUserData.role || updateData.role
        })
        
        // If token was updated (email changed), show additional message
        if (result.data.tokenUpdated) {
          customAlert('✅ Account and authentication updated successfully!')
        }
        
        // Try to reload account info, but don't fail if it doesn't work
        try {
          await loadAccountInfo()
        } catch (reloadError) {
    
        }
      } else {
        // Display specific error message from backend
        const errorMessage = result.error || 'Failed to update user'
        customAlert('❌ Error updating account: ' + errorMessage)
      }
    } catch (error) {
      const errorMessage = error.response?.data || error.message || 'An error occurred while saving.'
      customAlert('❌ ' + errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0]
    const localUser = JSON.parse(localStorage.getItem('user') || '{}')
    
    if (!localUser?.userId) {
      customAlert('Please log in to upload your avatar.')
      return
    }

    if (file) {
      // Show preview immediately
      const reader = new FileReader()
      reader.onload = (e) => setAvatarUrl(e.target.result)
      reader.readAsDataURL(file)

      try {
        setAvatarUrl('/assets/uploading.gif')
        
        const result = await UserService.uploadAvatar(localUser.userId, file)
        
        if (result.success) {
          customAlert('✅ Avatar uploaded successfully!')
          await fetchAvatar(localUser.userId)
          
          // Update user data in localStorage
          const userResult = await UserService.getUserById(localUser.userId)
          if (userResult.success) {
            localStorage.setItem('user', JSON.stringify(userResult.data))
          }
        } else {
          customAlert('❌ Error uploading avatar: ' + result.error)
          setAvatarUrl('/assets/default-avatar.png')
        }
      } catch (error) {
        customAlert('❌ Error uploading avatar: ' + error.message)
        setAvatarUrl('/assets/default-avatar.png')
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto relative">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
          <div className="flex items-center text-white">
            <User className="mr-3" size={24} />
            <h2 className="text-xl font-semibold">Account Settings</h2>
          </div>
        </div>

        <div className="p-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow-lg"
              />
              <label
                htmlFor="avatarInput"
                className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors cursor-pointer"
              >
                <Camera size={16} />
              </label>
              <input 
                id="avatarInput" 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleAvatarUpload}
              />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              {formData.name || 'User Name'}
            </h3>
            <p className="text-sm text-gray-500">{formData.role || 'User'}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    !isEditing
                      ? 'bg-gray-50 border-gray-200 text-gray-600'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    !isEditing
                      ? 'bg-gray-50 border-gray-200 text-gray-600'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    !isEditing
                      ? 'bg-gray-50 border-gray-200 text-gray-600'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              {!isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                >
                  <Edit3 size={18} className="mr-2" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                  >
                    <X size={18} className="mr-2" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors"
                  >
                    <Save size={18} className="mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        {/* ✅ Loading Spinner Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountSection
