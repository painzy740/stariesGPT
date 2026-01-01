"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, MessageSquare, Trash2 } from "lucide-react"

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [allChats, setAllChats] = useState<any[]>([])

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (!user) {
      window.location.href = "/"
      return
    }

    const parsedUser = JSON.parse(user)
    if (parsedUser.role !== "admin") {
      window.location.href = "/chat"
      return
    }

    setCurrentUser(parsedUser)

    const savedUsers = JSON.parse(localStorage.getItem("users") || "[]")
    setUsers(savedUsers)

    const chatsData = savedUsers.map((u: any) => {
      const userChats = JSON.parse(localStorage.getItem(`chats_${u.id}`) || "[]")
      return {
        user: u,
        chats: userChats,
      }
    })
    setAllChats(chatsData)
  }, [])

  const deleteUser = (userId: string) => {
    if (!confirm("Hapus user ini?")) return

    const updatedUsers = users.filter((u) => u.id !== userId)
    localStorage.setItem("users", JSON.stringify(updatedUsers))
    localStorage.removeItem(`chats_${userId}`)
    setUsers(updatedUsers)
    setAllChats(allChats.filter((c) => c.user.id !== userId))
  }

  const deleteUserChat = (userId: string, chatId: string) => {
    if (!confirm("Hapus chat ini?")) return

    const userChats = JSON.parse(localStorage.getItem(`chats_${userId}`) || "[]")
    const updatedChats = userChats.filter((c: any) => c.id !== chatId)
    localStorage.setItem(`chats_${userId}`, JSON.stringify(updatedChats))

    setAllChats(
      allChats.map((c) => {
        if (c.user.id === userId) {
          return { ...c, chats: updatedChats }
        }
        return c
      }),
    )
  }

  if (!currentUser) return null

  const totalMessages = allChats.reduce((acc, c) => {
    return acc + c.chats.reduce((sum: number, chat: any) => sum + chat.messages.length, 0)
  }, 0)

  return (
    <div className="min-h-screen bg-white p-3 sm:p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8 flex-wrap gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/chat")}
              className="border-2 border-black hover:bg-black hover:text-white font-bold transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4 flex-shrink-0"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Kembali</span>
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-4xl font-black truncate">Developer Panel</h1>
              <p className="text-xs sm:text-sm font-bold text-gray-600">Hanya untuk Developer</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="p-4 sm:p-6 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold mb-1 truncate">Total Users</p>
                <p className="text-3xl sm:text-4xl font-black">{users.length}</p>
              </div>
              <Users className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0" />
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold mb-1 truncate">Total Chats</p>
                <p className="text-3xl sm:text-4xl font-black">
                  {allChats.reduce((acc, c) => acc + c.chats.length, 0)}
                </p>
              </div>
              <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0" />
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold mb-1 truncate">Total Messages</p>
                <p className="text-3xl sm:text-4xl font-black">{totalMessages}</p>
              </div>
              <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0" />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4 sm:mb-6 overflow-hidden">
          <h2 className="text-xl sm:text-2xl font-black mb-3 sm:mb-4">Daftar Users</h2>
          <div className="space-y-2 sm:space-y-3 overflow-x-auto">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 sm:p-4 bg-white border-2 border-black min-w-max sm:min-w-0"
              >
                <div className="flex-1 min-w-0 mr-3 sm:mr-4">
                  <div className="flex items-center gap-2">
                    <p className="font-bold truncate text-sm sm:text-base">{user.name}</p>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 border-2 border-black ${user.role === "admin" ? "bg-black text-white" : "bg-white text-black"}`}
                    >
                      {user.role === "admin" ? "DEV" : "USER"}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium truncate">{user.email}</p>
                  <p className="text-[10px] sm:text-xs font-bold mt-1">
                    {new Date(user.createdAt).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => deleteUser(user.id)}
                  className="border-2 border-black bg-white text-black hover:bg-red-500 hover:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <h2 className="text-xl sm:text-2xl font-black mb-3 sm:mb-4">Semua Chat History</h2>
          <div className="space-y-4 sm:space-y-6 overflow-x-auto">
            {allChats.map(({ user, chats }) => (
              <div key={user.id} className="border-l-4 border-black pl-3 sm:pl-4 min-w-max sm:min-w-0">
                <h3 className="font-black mb-2 text-sm sm:text-base truncate">
                  {user.name} ({user.email})
                </h3>
                <div className="space-y-2">
                  {chats.length === 0 ? (
                    <p className="text-xs sm:text-sm font-bold">Belum ada chat</p>
                  ) : (
                    chats.map((chat: any) => (
                      <div
                        key={chat.id}
                        className="flex items-center justify-between p-2 sm:p-3 bg-white border-2 border-black min-w-max sm:min-w-0"
                      >
                        <div className="flex-1 min-w-0 mr-3 sm:mr-4">
                          <p className="font-bold truncate text-sm sm:text-base">{chat.title}</p>
                          <p className="text-[10px] sm:text-xs font-medium">
                            {chat.messages.length} pesan | {new Date(chat.createdAt).toLocaleString("id-ID")}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteUserChat(user.id, chat.id)}
                          className="border-2 border-black hover:bg-red-500 hover:text-white flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
