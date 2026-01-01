"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, Github } from "lucide-react"

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const users = JSON.parse(localStorage.getItem("users") || "[]")

    if (isLogin) {
      const ADMIN_USERNAME = "painkingdev"
      const ADMIN_PASSWORD = "painzy0901"

      if (email === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const adminUser = {
          id: "admin",
          name: "Admin",
          email: ADMIN_USERNAME,
          password: ADMIN_PASSWORD,
          role: "admin",
          createdAt: new Date().toISOString(),
        }
        localStorage.setItem("currentUser", JSON.stringify(adminUser))
        window.location.href = "/chat"
        return
      }

      const user = users.find((u: any) => (u.email === email || u.name === email) && u.password === password)
      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user))
        window.location.href = "/chat"
      } else {
        alert("Email/username atau password salah")
      }
    } else {
      const existingUser = users.find((u: any) => u.email === email)
      if (existingUser) {
        alert("Email sudah terdaftar")
        return
      }
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        role: "user",
        createdAt: new Date().toISOString(),
      }
      users.push(newUser)
      localStorage.setItem("users", JSON.stringify(users))
      localStorage.setItem("currentUser", JSON.stringify(newUser))
      window.location.href = "/chat"
    }
  }

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault()
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const user = users.find((u: any) => u.email === resetEmail)

    if (user) {
      alert(`Password Anda: ${user.password}`)
      setShowForgotPassword(false)
      setResetEmail("")
    } else {
      alert("Email tidak ditemukan")
    }
  }

  const handleOAuthLogin = (provider: string) => {
    const mockUser = {
      id: Date.now().toString(),
      name: `User ${provider}`,
      email: `user@${provider}.com`,
      password: "",
      role: "user",
      provider,
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem("currentUser", JSON.stringify(mockUser))
    window.location.href = "/chat"
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-sm sm:max-w-md p-6 sm:p-8 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl sm:text-3xl font-black mb-4 sm:mb-6">Lupa Password</h2>

          <form onSubmit={handleForgotPassword} className="space-y-3 sm:space-y-4">
            <div>
              <label className="text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 block">Email</label>
              <Input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                placeholder="Masukkan email Anda"
                className="border-2 border-black focus:outline-none focus:ring-0 focus:border-black font-medium text-sm sm:text-base h-9 sm:h-10"
              />
            </div>

            <Button
              type="submit"
              className="w-full border-2 border-black bg-black text-white hover:bg-white hover:text-black font-bold transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm sm:text-base h-9 sm:h-10"
            >
              Reset Password
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForgotPassword(false)}
              className="w-full border-2 border-black bg-white text-black hover:bg-black hover:text-white font-bold transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm sm:text-base h-9 sm:h-10"
            >
              Kembali
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm sm:max-w-md p-6 sm:p-8 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-center mb-6 sm:mb-8">
          <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3 flex-shrink-0" />
          <h1 className="text-3xl sm:text-4xl font-black">stariesGPT</h1>
        </div>

        <div className="flex gap-2 mb-4 sm:mb-6">
          <Button
            variant={isLogin ? "default" : "outline"}
            className={`flex-1 border-2 border-black font-bold transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm sm:text-base h-9 sm:h-10 ${isLogin ? "bg-black text-white" : "bg-white text-black hover:bg-black hover:text-white"}`}
            onClick={() => setIsLogin(true)}
          >
            Masuk
          </Button>
          <Button
            variant={!isLogin ? "default" : "outline"}
            className={`flex-1 border-2 border-black font-bold transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm sm:text-base h-9 sm:h-10 ${!isLogin ? "bg-black text-white" : "bg-white text-black hover:bg-black hover:text-white"}`}
            onClick={() => setIsLogin(false)}
          >
            Daftar
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {!isLogin && (
            <div>
              <label className="text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 block">Nama</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Masukkan nama Anda"
                className="border-2 border-black focus:outline-none focus:ring-0 focus:border-black font-medium text-sm sm:text-base h-9 sm:h-10"
              />
            </div>
          )}

          <div>
            <label className="text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 block">
              {isLogin ? "Username atau Email" : "Email"}
            </label>
            <Input
              type={isLogin ? "text" : "email"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={isLogin ? "Username atau email" : "Masukkan email"}
              className="border-2 border-black focus:outline-none focus:ring-0 focus:border-black font-medium text-sm sm:text-base h-9 sm:h-10"
            />
          </div>

          <div>
            <label className="text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 block">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Masukkan password"
              className="border-2 border-black focus:outline-none focus:ring-0 focus:border-black font-medium text-sm sm:text-base h-9 sm:h-10"
            />
          </div>

          {isLogin && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-xs sm:text-sm font-bold hover:underline"
              >
                Lupa Password?
              </button>
            </div>
          )}

          <Button
            type="submit"
            className="w-full border-2 border-black bg-black text-white hover:bg-white hover:text-black font-bold transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm sm:text-base h-9 sm:h-10"
          >
            {isLogin ? "Masuk" : "Daftar"}
          </Button>
        </form>

        <div className="mt-4 sm:mt-6">
          <div className="relative mb-3 sm:mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-black" />
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="bg-white px-2 font-bold">Atau masuk dengan</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuthLogin("google")}
              className="w-full border-2 border-black bg-white hover:bg-black hover:text-white font-bold transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm sm:text-base h-9 sm:h-10"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuthLogin("github")}
              className="w-full border-2 border-black bg-white hover:bg-black hover:text-white font-bold transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm sm:text-base h-9 sm:h-10"
            >
              <Github className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              GitHub
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
