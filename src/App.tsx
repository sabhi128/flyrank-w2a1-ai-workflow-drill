import { useState } from 'react'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    theme: 'light',
    emailNotifications: false,
    smsNotifications: false,
    pushNotifications: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    // Vague/lazy validation
    if (!formData.username) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (formData.bio.length > 100) {
      newErrors.bio = 'Bio cannot exceed 100 characters'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
    } else {
      setErrors({})
      alert('Settings saved successfully!')
    }
  }

  return (
    <div className="container">
      <h2>Profile Settings</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
          {errors.username && <span className="error">{errors.username}</span>}
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
          />
          {errors.bio && <span className="error">{errors.bio}</span>}
        </div>

        <div className="form-group">
          <label>Theme</label>
          <select name="theme" value={formData.theme} onChange={handleChange}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>

        <div className="form-group checkbox-group">
          <label>Notifications</label>
          <div className="checkboxes">
            <label>
              <input
                type="checkbox"
                name="emailNotifications"
                checked={formData.emailNotifications}
                onChange={handleChange}
              />
              Email
            </label>
            <label>
              <input
                type="checkbox"
                name="smsNotifications"
                checked={formData.smsNotifications}
                onChange={handleChange}
              />
              SMS
            </label>
            <label>
              <input
                type="checkbox"
                name="pushNotifications"
                checked={formData.pushNotifications}
                onChange={handleChange}
              />
              Push
            </label>
          </div>
        </div>

        <button type="submit" className="save-btn">Save Settings</button>
      </form>
    </div>
  )
}

export default App
