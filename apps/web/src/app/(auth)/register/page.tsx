'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import api from '@/lib/axios'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors({})
    setServerError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setServerError('')

    try {
      const res = await api.post('/auth/register', form)
      setAuth(res.data.user, res.data.token)
      router.push('/chat')
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: unknown } } })
        ?.response?.data

      if (data?.error && typeof data.error === 'object') {
        setErrors(data.error as Record<string, string[]>)
      } else if (typeof data?.error === 'string') {
        setServerError(data.error)
      } else {
        setServerError('Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  const getFieldError = (field: string) => errors[field]?.[0]

  return (
    <>
      <h2 className="text-[#aebac1] text-center text-sm mb-6">
        Create your account
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-xs text-[#aebac1] mb-1.5 ml-1">
            Username
          </label>
          <input
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            placeholder="john_doe"
            required
            className={cn(
              'w-full bg-[#2a3942] text-white placeholder-[#667781]',
              'rounded-lg px-4 py-3 text-sm outline-none',
              'border transition-colors duration-200',
              getFieldError('username')
                ? 'border-red-400'
                : 'border-transparent focus:border-[#00a884]'
            )}
          />
          {getFieldError('username') && (
            <p className="text-red-400 text-xs mt-1 ml-1">
              {getFieldError('username')}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs text-[#aebac1] mb-1.5 ml-1">
            Email
          </label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            className={cn(
              'w-full bg-[#2a3942] text-white placeholder-[#667781]',
              'rounded-lg px-4 py-3 text-sm outline-none',
              'border transition-colors duration-200',
              getFieldError('email')
                ? 'border-red-400'
                : 'border-transparent focus:border-[#00a884]'
            )}
          />
          {getFieldError('email') && (
            <p className="text-red-400 text-xs mt-1 ml-1">
              {getFieldError('email')}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs text-[#aebac1] mb-1.5 ml-1">
            Password
          </label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              required
              className={cn(
                'w-full bg-[#2a3942] text-white placeholder-[#667781]',
                'rounded-lg px-4 py-3 pr-11 text-sm outline-none',
                'border transition-colors duration-200',
                getFieldError('password')
                  ? 'border-red-400'
                  : 'border-transparent focus:border-[#00a884]'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667781] hover:text-[#aebac1] transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {getFieldError('password') && (
            <p className="text-red-400 text-xs mt-1 ml-1">
              {getFieldError('password')}
            </p>
          )}
        </div>

        {/* Server error */}
        {serverError && (
          <p className="text-red-400 text-xs text-center bg-red-400/10 py-2 px-3 rounded-lg">
            {serverError}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={cn(
            'w-full bg-[#00a884] hover:bg-[#06cf9c] text-white font-medium',
            'rounded-lg py-3 text-sm transition-colors duration-200',
            'flex items-center justify-center gap-2',
            'disabled:opacity-60 disabled:cursor-not-allowed'
          )}
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-xs text-[#667781] mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-[#00a884] hover:underline">
          Sign in
        </Link>
      </p>
    </>
  )
}