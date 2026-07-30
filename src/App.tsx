import { useState, useEffect, useId } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  User, 
  Mail, 
  FileText, 
  Sun, 
  Moon, 
  Monitor, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Loader2 
} from 'lucide-react'
import './App.css'

// 1. Zod Schema Definition
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(15, 'Username cannot exceed 15 characters')
    .regex(/^[a-z][a-z0-9_]*$/, 'Username must start with a lowercase letter and contain only lowercase alphanumeric characters or underscores'),
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s]*$/, 'Full name must contain only letters and spaces'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid RFC-compliant email address'),
  bio: z
    .string()
    .max(160, 'Bio cannot exceed 160 characters')
    .optional()
    .or(z.literal('')),
  theme: z.enum(['light', 'dark', 'system']),
  notifications: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean(),
  }),
  avatar: z
    .any()
    .optional()
    .refine((files) => {
      if (!files || files.length === 0) return true // optional
      return files[0]?.size <= MAX_FILE_SIZE
    }, 'Max image size is 2MB')
    .refine((files) => {
      if (!files || files.length === 0) return true
      return ACCEPTED_IMAGE_TYPES.includes(files[0]?.type)
    }, 'Only .jpg, .jpeg, .png and .webp formats are supported'),
})

type ProfileFormData = z.infer<typeof profileSchema>

const DEFAULT_SETTINGS: ProfileFormData = {
  username: 'johndoe',
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  bio: 'Software development intern at FlyRank AI.',
  theme: 'system',
  notifications: {
    email: true,
    sms: false,
    push: true,
  },
}

const getInitialValues = (): ProfileFormData => {
  const saved = localStorage.getItem('flyrank_profile_settings')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        avatar: undefined, // Clear avatar FileList as files can't be stored in localStorage JSON
      }
    } catch (e) {
      // Fallback to defaults
    }
  }
  return DEFAULT_SETTINGS
}

function App() {
  // 2. React Hook Form Setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: getInitialValues(),
    mode: 'onBlur', // validate on field blur
  })

  // State for avatar preview, toast notification, and active theme
  const [avatarPreview, setAvatarPreview] = useState<string | null>(() => {
    return localStorage.getItem('flyrank_profile_avatar')
  })
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState('')

  // Generate stable, unique HTML IDs for form group accessibility
  const usernameId = useId()
  const fullNameId = useId()
  const emailId = useId()
  const bioId = useId()
  const themeId = useId()
  const avatarId = useId()

  const watchedTheme = watch('theme')
  const watchedBio = watch('bio') || ''
  const watchedAvatar = watch('avatar')

  // Handle avatar preview generation
  useEffect(() => {
    if (watchedAvatar && watchedAvatar.length > 0) {
      const file = watchedAvatar[0]
      if (file && file.size <= MAX_FILE_SIZE && ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        const fileReader = new FileReader()
        fileReader.onload = () => {
          setAvatarPreview(fileReader.result as string)
        };
        fileReader.readAsDataURL(file)
      }
    }
  }, [watchedAvatar])

  // System theme preference watcher
  useEffect(() => {
    const applyTheme = (themeName: 'light' | 'dark' | 'system') => {
      const root = window.document.documentElement
      root.classList.remove('light', 'dark')

      if (themeName === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        root.classList.add(systemTheme)
      } else {
        root.classList.add(themeName)
      }
    }

    applyTheme(watchedTheme)

    if (watchedTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const listener = () => applyTheme('system')
      mediaQuery.addEventListener('change', listener)
      return () => mediaQuery.removeEventListener('change', listener)
    }
  }, [watchedTheme])

  // Custom onSubmit handler simulating an API post request with delay
  const onSubmit = async (data: ProfileFormData) => {
    // Announce saving status to screen readers
    setScreenReaderAnnouncement('Saving settings changes, please wait...')

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      // Persist values in localStorage (excluding avatar file object)
      const dataToSave = { ...data, avatar: undefined }
      localStorage.setItem('flyrank_profile_settings', JSON.stringify(dataToSave))

      // Persist avatar base64 data URL if it exists
      if (avatarPreview) {
        localStorage.setItem('flyrank_profile_avatar', avatarPreview)
      } else {
        localStorage.removeItem('flyrank_profile_avatar')
      }

      // Save simulated success status
      setToast({ type: 'success', message: 'Profile settings updated successfully!' })
      setScreenReaderAnnouncement('Success. Profile settings updated successfully.')
      
      // Reset form dirty state with new values
      reset(data)
    } catch (e) {
      setToast({ type: 'error', message: 'Failed to update settings. Please try again.' })
      setScreenReaderAnnouncement('Error. Failed to update settings. Please try again.')
    }
  };

  // Toast self-dismiss timer
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  return (
    <div className="app-container">
      {/* 3. Screen Reader Live Announcement Area */}
      <div 
        className="sr-only" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {screenReaderAnnouncement}
      </div>

      {/* Toast alert component */}
      {toast && (
        <div 
          className={`toast-alert ${toast.type}`}
          role="alert"
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="toast-icon" size={20} />
          ) : (
            <AlertCircle className="toast-icon" size={20} />
          )}
          <span className="toast-message">{toast.message}</span>
        </div>
      )}

      <main className="settings-card">
        <header className="settings-header">
          <h1>Account Settings</h1>
          <p>Manage your public profile, appearance preferences, and system notification alerts.</p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="settings-form" noValidate>
          
          {/* Avatar / Profile Picture Upload Section */}
          <div className="avatar-section">
            <div className="avatar-preview-container">
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="Profile picture preview" 
                  className="avatar-image" 
                />
              ) : (
                <div className="avatar-placeholder" aria-hidden="true">
                  <User size={40} className="placeholder-icon" />
                </div>
              )}
            </div>
            <div className="avatar-upload-info">
              <label htmlFor={avatarId} className="upload-btn">
                <Upload size={16} />
                <span>Upload New Photo</span>
                <input 
                  type="file" 
                  id={avatarId}
                  className="sr-only"
                  accept="image/*"
                  onChange={(e) => {
                    const files = e.target.files
                    if (files) {
                      setValue('avatar', files, { shouldValidate: true })
                    }
                  }}
                />
              </label>
              <p className="upload-requirements">JPG, PNG, or WebP. Max size of 2MB.</p>
              {errors.avatar && (
                <span className="error-message" id="avatar-error" role="alert">
                  <AlertCircle size={14} />
                  {errors.avatar.message as string}
                </span>
              )}
            </div>
          </div>

          <hr className="divider" />

          {/* Form Fields Grid */}
          <div className="form-grid">
            
            {/* Username Input Field */}
            <div className="form-group">
              <label htmlFor={usernameId}>Username</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  id={usernameId}
                  autoComplete="username"
                  aria-invalid={!!errors.username}
                  aria-describedby={errors.username ? `${usernameId}-error` : undefined}
                  className={errors.username ? 'input-error' : ''}
                  disabled={isSubmitting}
                  {...register('username')}
                />
              </div>
              {errors.username && (
                <span className="error-message" id={`${usernameId}-error`} role="alert">
                  <AlertCircle size={14} />
                  {errors.username.message}
                </span>
              )}
            </div>

            {/* Full Name Input Field */}
            <div className="form-group">
              <label htmlFor={fullNameId}>Full Name</label>
              <div className="input-wrapper">
                <FileText className="input-icon" size={18} />
                <input
                  type="text"
                  id={fullNameId}
                  autoComplete="name"
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? `${fullNameId}-error` : undefined}
                  className={errors.fullName ? 'input-error' : ''}
                  disabled={isSubmitting}
                  {...register('fullName')}
                />
              </div>
              {errors.fullName && (
                <span className="error-message" id={`${fullNameId}-error`} role="alert">
                  <AlertCircle size={14} />
                  {errors.fullName.message}
                </span>
              )}
            </div>

            {/* Email Address Input Field */}
            <div className="form-group full-width">
              <label htmlFor={emailId}>Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  id={emailId}
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? `${emailId}-error` : undefined}
                  className={errors.email ? 'input-error' : ''}
                  disabled={isSubmitting}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <span className="error-message" id={`${emailId}-error`} role="alert">
                  <AlertCircle size={14} />
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Short Bio Text Area */}
            <div className="form-group full-width">
              <div className="label-row">
                <label htmlFor={bioId}>Short Biography</label>
                <span 
                  className={`char-count ${watchedBio.length > 150 ? 'limit-warning' : ''}`}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {160 - watchedBio.length} characters left
                </span>
              </div>
              <textarea
                id={bioId}
                rows={4}
                aria-invalid={!!errors.bio}
                aria-describedby={errors.bio ? `${bioId}-error` : undefined}
                className={errors.bio ? 'input-error' : ''}
                disabled={isSubmitting}
                placeholder="Write a short summary about yourself..."
                {...register('bio')}
              />
              {errors.bio && (
                <span className="error-message" id={`${bioId}-error`} role="alert">
                  <AlertCircle size={14} />
                  {errors.bio.message}
                </span>
              )}
            </div>

            {/* Theme Preferences Selector */}
            <div className="form-group">
              <label htmlFor={themeId}>Interface Appearance</label>
              <div className="theme-toggle-group">
                <button
                  type="button"
                  className={`theme-btn ${watchedTheme === 'light' ? 'active' : ''}`}
                  onClick={() => setValue('theme', 'light', { shouldDirty: true })}
                  aria-pressed={watchedTheme === 'light'}
                  title="Switch to light mode"
                  disabled={isSubmitting}
                >
                  <Sun size={18} />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  className={`theme-btn ${watchedTheme === 'dark' ? 'active' : ''}`}
                  onClick={() => setValue('theme', 'dark', { shouldDirty: true })}
                  aria-pressed={watchedTheme === 'dark'}
                  title="Switch to dark mode"
                  disabled={isSubmitting}
                >
                  <Moon size={18} />
                  <span>Dark</span>
                </button>
                <button
                  type="button"
                  className={`theme-btn ${watchedTheme === 'system' ? 'active' : ''}`}
                  onClick={() => setValue('theme', 'system', { shouldDirty: true })}
                  aria-pressed={watchedTheme === 'system'}
                  title="Switch to system defaults"
                  disabled={isSubmitting}
                >
                  <Monitor size={18} />
                  <span>System</span>
                </button>
              </div>
            </div>

            {/* Notification Subscription Toggles */}
            <div className="form-group">
              <label id="notifications-title">Alert & Notification Subscriptions</label>
              <div className="checkbox-stack" aria-labelledby="notifications-title">
                
                <label className="checkbox-control">
                  <input
                    type="checkbox"
                    disabled={isSubmitting}
                    {...register('notifications.email')}
                  />
                  <span className="checkbox-indicator"></span>
                  <div className="checkbox-labels">
                    <span className="checkbox-heading">Email Notifications</span>
                    <span className="checkbox-description">Receive digest summaries and service announcements.</span>
                  </div>
                </label>

                <label className="checkbox-control">
                  <input
                    type="checkbox"
                    disabled={isSubmitting}
                    {...register('notifications.sms')}
                  />
                  <span className="checkbox-indicator"></span>
                  <div className="checkbox-labels">
                    <span className="checkbox-heading">SMS Alerts</span>
                    <span className="checkbox-description">Receive security code verifications and immediate login notifications.</span>
                  </div>
                </label>

                <label className="checkbox-control">
                  <input
                    type="checkbox"
                    disabled={isSubmitting}
                    {...register('notifications.push')}
                  />
                  <span className="checkbox-indicator"></span>
                  <div className="checkbox-labels">
                    <span className="checkbox-heading">Desktop Push notifications</span>
                    <span className="checkbox-description">Receive direct inline browser activity notifications.</span>
                  </div>
                </label>

              </div>
            </div>

          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="save-changes-btn"
              disabled={isSubmitting || !isDirty}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="spinner-icon animate-spin" size={18} />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>

        </form>
      </main>
    </div>
  )
}

export default App
