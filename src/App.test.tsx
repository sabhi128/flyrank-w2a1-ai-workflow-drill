import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App'

// Mock matchMedia since jsdom does not support it by default
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

describe('Profile Settings Form - Round Two', () => {
  it('renders all form fields with default values', () => {
    render(<App />)
    expect(screen.getByLabelText(/username/i)).toHaveValue('johndoe')
    expect(screen.getByLabelText(/full name/i)).toHaveValue('John Doe')
    expect(screen.getByLabelText(/email address/i)).toHaveValue('john.doe@example.com')
    expect(screen.getByLabelText(/short biography/i)).toHaveValue('Software development intern at FlyRank AI.')
  })

  it('validates incorrect username formats', async () => {
    render(<App />)
    const usernameInput = screen.getByLabelText(/username/i)

    // Clear and enter invalid username
    fireEvent.change(usernameInput, { target: { value: '1invalid' } })
    fireEvent.blur(usernameInput)

    expect(await screen.findByText(/Username must start with a lowercase letter/)).toBeInTheDocument()

    // Too short
    fireEvent.change(usernameInput, { target: { value: 'ab' } })
    fireEvent.blur(usernameInput)
    expect(await screen.findByText(/Username must be at least 3 characters/)).toBeInTheDocument()
  })

  it('validates invalid email formats', async () => {
    render(<App />)
    const emailInput = screen.getByLabelText(/email address/i)

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.blur(emailInput)

    expect(await screen.findByText(/Please enter a valid RFC-compliant email address/)).toBeInTheDocument()
  })

  it('calculates remaining characters in biography live', async () => {
    render(<App />)
    const bioTextarea = screen.getByLabelText(/short biography/i)
    
    // Default bio is 42 chars, so 160 - 42 = 118
    expect(screen.getByText(/118 characters left/)).toBeInTheDocument()

    fireEvent.change(bioTextarea, { target: { value: 'Hello' } })
    expect(screen.getByText(/155 characters left/)).toBeInTheDocument()
  })

  it('supports interactive theme selection and changes html root classes', async () => {
    render(<App />)
    const darkThemeButton = screen.getByRole('button', { name: /dark/i })
    
    fireEvent.click(darkThemeButton)
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    const lightThemeButton = screen.getByRole('button', { name: /light/i })
    fireEvent.click(lightThemeButton)
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })

  it('simulates a successful form submission with a loading spinner and success toast', async () => {
    render(<App />)
    
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    
    // The form is clean (not dirty), so the submit button should be disabled initially
    expect(saveButton).toBeDisabled()

    // Modify a field to make it dirty
    const fullNameInput = screen.getByLabelText(/full name/i)
    fireEvent.change(fullNameInput, { target: { value: 'Jane Doe' } })
    
    expect(saveButton).not.toBeDisabled()

    fireEvent.click(saveButton)

    // Check loading state
    expect(screen.getByText(/saving changes.../i)).toBeInTheDocument()
    expect(fullNameInput).toBeDisabled()

    // Wait for simulated network delay (1500ms) to resolve and toast message to appear
    await waitFor(() => {
      expect(screen.getByText(/profile settings updated successfully!/i)).toBeInTheDocument()
    }, { timeout: 2000 })

    expect(fullNameInput).not.toBeDisabled()
    expect(saveButton).toBeDisabled() // reset form values, so dirty is false again
  })
})
