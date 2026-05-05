'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import api from '@/lib/axios'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await api.post('/auth/login', form)
      setAuth(res.data.user, res.data.token)
      router.push('/chat')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? 'Something went wrong'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h2 className="text-[#aebac1] text-center text-sm mb-6">
        Sign in to your account
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
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
              'border border-transparent focus:border-[#00a884]',
              'transition-colors duration-200'
            )}
          />
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
              placeholder="••••••"
              required
              className={cn(
                'w-full bg-[#2a3942] text-white placeholder-[#667781]',
                'rounded-lg px-4 py-3 pr-11 text-sm outline-none',
                'border border-transparent focus:border-[#00a884]',
                'transition-colors duration-200'
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
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-xs text-center bg-red-400/10 py-2 px-3 rounded-lg">
            {error}
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
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-xs text-[#667781] mt-6">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="text-[#00a884] hover:underline"
        >
          Create one
        </Link>
      </p>
    </>
  )
}