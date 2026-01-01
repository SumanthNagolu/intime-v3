'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Shield,
} from 'lucide-react'

interface InvitationData {
  email: string
  firstName: string
  lastName: string
  orgName: string
  roleName: string
  invitedBy: string
  expiresAt: string
}

function AcceptInvitationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [isValidating, setIsValidating] = useState(true)
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  // Password validation
  const passwordRequirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }
  const isPasswordValid = Object.values(passwordRequirements).every(Boolean)
  const doPasswordsMatch = password === confirmPassword && password.length > 0

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setValidationError('No invitation token provided. Please check your email for the correct link.')
      setIsValidating(false)
      return
    }

    const validateToken = async () => {
      try {
        const response = await fetch(`/api/auth/validate-invitation?token=${token}`)
        const data = await response.json()

        if (!response.ok) {
          setValidationError(data.error || 'Invalid or expired invitation')
          setIsValidating(false)
          return
        }

        setInvitation(data.invitation)
        setIsValidating(false)
      } catch {
        setValidationError('Failed to validate invitation. Please try again.')
        setIsValidating(false)
      }
    }

    validateToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isPasswordValid) {
      setSubmitError('Please ensure your password meets all requirements')
      return
    }

    if (!doPasswordsMatch) {
      setSubmitError('Passwords do not match')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/auth/accept-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setSubmitError(data.error || 'Failed to set password')
        setIsSubmitting(false)
        return
      }

      setIsSuccess(true)

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch {
      setSubmitError('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-white to-charcoal-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="text-center mb-8">
            <h1 className="font-heading text-5xl text-forest-900 tracking-tight">
              In<span className="text-gold-600">Time</span>
            </h1>
          </div>
          <div className="bg-white rounded-2xl shadow-xl shadow-charcoal-900/5 border border-charcoal-100 p-8">
            <Loader2 className="h-8 w-8 animate-spin text-forest-600 mx-auto mb-4" />
            <p className="text-charcoal-600">Validating your invitation...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state - invalid/expired token
  if (validationError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-white to-charcoal-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-heading text-5xl text-forest-900 tracking-tight">
              In<span className="text-gold-600">Time</span>
            </h1>
          </div>
          <div className="bg-white rounded-2xl shadow-xl shadow-charcoal-900/5 border border-charcoal-100 p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-charcoal-900 mb-2">
                Invalid Invitation
              </h2>
              <p className="text-charcoal-600 mb-6">
                {validationError}
              </p>
              <p className="text-sm text-charcoal-500 mb-6">
                If you believe this is an error, please contact your administrator to resend the invitation.
              </p>
              <Link
                href="/login"
                className="px-6 py-2.5 bg-forest-600 hover:bg-forest-700 text-white rounded-xl font-medium transition-colors"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-white to-charcoal-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-heading text-5xl text-forest-900 tracking-tight">
              In<span className="text-gold-600">Time</span>
            </h1>
          </div>
          <div className="bg-white rounded-2xl shadow-xl shadow-charcoal-900/5 border border-charcoal-100 p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-charcoal-900 mb-2">
                Account Activated!
              </h2>
              <p className="text-charcoal-600 mb-4">
                Your password has been set successfully. Redirecting you to login...
              </p>
              <Loader2 className="h-5 w-5 animate-spin text-forest-600" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Password setup form
  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-white to-charcoal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-5xl text-forest-900 tracking-tight">
            In<span className="text-gold-600">Time</span>
          </h1>
          <p className="text-charcoal-500 mt-2 text-sm">
            Enterprise Staffing Platform
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-charcoal-900/5 border border-charcoal-100 overflow-hidden">
          {/* Header */}
          <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-5 border-b border-charcoal-100 bg-forest-50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-forest-100 text-forest-600">
                <Shield size={20} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-charcoal-900">
                  Set Your Password
                </h2>
                <p className="text-charcoal-600 text-sm">
                  Welcome to {invitation?.orgName}
                </p>
              </div>
            </div>
          </div>

          {/* Welcome message */}
          <div className="px-6 sm:px-8 py-4 bg-charcoal-50 border-b border-charcoal-100">
            <p className="text-sm text-charcoal-600">
              Hi <span className="font-medium text-charcoal-900">{invitation?.firstName}</span>,
              you&apos;ve been invited by <span className="font-medium text-charcoal-900">{invitation?.invitedBy}</span> to
              join as <span className="font-medium text-forest-600">{invitation?.roleName}</span>.
            </p>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8">
            {/* Error Message */}
            {submitError && (
              <div className="flex items-start gap-2 p-3 mb-5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email (read-only) */}
              <div>
                <label className="block text-charcoal-700 text-sm font-medium mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={invitation?.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 bg-charcoal-100 border border-charcoal-200 rounded-xl text-charcoal-600 text-sm cursor-not-allowed"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-charcoal-700 text-sm font-medium mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-charcoal-50 border border-charcoal-200 rounded-xl text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-charcoal-50 rounded-xl p-4">
                <p className="text-xs font-medium text-charcoal-600 mb-2">Password requirements:</p>
                <ul className="space-y-1">
                  {[
                    { key: 'minLength', label: 'At least 8 characters' },
                    { key: 'hasUppercase', label: 'One uppercase letter' },
                    { key: 'hasLowercase', label: 'One lowercase letter' },
                    { key: 'hasNumber', label: 'One number' },
                    { key: 'hasSpecial', label: 'One special character (!@#$%^&*)' },
                  ].map(({ key, label }) => (
                    <li key={key} className="flex items-center gap-2 text-xs">
                      {passwordRequirements[key as keyof typeof passwordRequirements] ? (
                        <CheckCircle2 size={14} className="text-green-600" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-charcoal-300" />
                      )}
                      <span className={passwordRequirements[key as keyof typeof passwordRequirements] ? 'text-green-700' : 'text-charcoal-500'}>
                        {label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-charcoal-700 text-sm font-medium mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400"
                  />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-charcoal-50 border border-charcoal-200 rounded-xl text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && !doPasswordsMatch && (
                  <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isPasswordValid || !doPasswordsMatch}
                className="w-full px-4 py-3 bg-forest-600 hover:bg-forest-700 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-6"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Setting up your account...</span>
                  </>
                ) : (
                  'Activate Account'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-charcoal-400">
            Already have an account?{' '}
            <Link href="/login" className="text-forest-600 hover:text-forest-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function AcceptInvitationFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-white to-charcoal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="text-center mb-8">
          <h1 className="font-heading text-5xl text-forest-900 tracking-tight">
            In<span className="text-gold-600">Time</span>
          </h1>
        </div>
        <div className="bg-white rounded-2xl shadow-xl shadow-charcoal-900/5 border border-charcoal-100 p-8">
          <Loader2 className="h-8 w-8 animate-spin text-forest-600 mx-auto" />
        </div>
      </div>
    </div>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<AcceptInvitationFallback />}>
      <AcceptInvitationContent />
    </Suspense>
  )
}
