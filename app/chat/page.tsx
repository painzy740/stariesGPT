"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sparkles,
  Send,
  Menu,
  Plus,
  Trash2,
  LogOut,
  User,
  Settings,
  X,
  Copy,
  Play,
  Check,
  MessageSquare,
} from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: number
}

export default function ChatPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [codeResults, setCodeResults] = useState<{ [key: string]: string }>({})
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const pendingMessageRef = useRef<string | null>(null)

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (!user) {
      window.location.href = "/"
      return
    }
    setCurrentUser(JSON.parse(user))

    const savedChats = localStorage.getItem(`chats_${JSON.parse(user).id}`)
    if (savedChats) {
      setChats(JSON.parse(savedChats))
    }
  }, [])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`chats_${currentUser.id}`, JSON.stringify(chats))
    }
  }, [chats, currentUser])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chats, currentChatId])

  useEffect(() => {
    if (currentChatId && pendingMessageRef.current) {
      const messageToSend = pendingMessageRef.current
      pendingMessageRef.current = null
      processMessage(messageToSend, currentChatId)
    }
  }, [currentChatId])

  const currentChat = chats.find((c) => c.id === currentChatId)

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "Chat Baru",
      messages: [],
      createdAt: Date.now(),
    }
    setChats((prev) => [newChat, ...prev])
    setCurrentChatId(newChat.id)
    setIsSidebarOpen(false)
    return newChat.id
  }

  const deleteChat = (id: string) => {
    const updatedChats = chats.filter((c) => c.id !== id)
    setChats(updatedChats)
    if (currentChatId === id) {
      setCurrentChatId(updatedChats.length > 0 ? updatedChats[0].id : null)
    }
    setDeleteConfirm(null)
  }

  const processMessage = async (messageText: string, chatId: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: Date.now(),
    }

    setChats((prevChats) => {
      return prevChats.map((chat) => {
        if (chat.id === chatId) {
          const newMessages = [...chat.messages, userMessage]
          const newTitle = chat.messages.length === 0 ? messageText.slice(0, 30) : chat.title
          return { ...chat, messages: newMessages, title: newTitle }
        }
        return chat
      })
    })

    setIsLoading(true)

    try {
      const currentChatData = chats.find((c) => c.id === chatId)
      const conversationHistory = currentChatData?.messages
        .slice(-10)
        .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
        .join("\n")

      const isDeveloper = currentUser?.role === "admin"
      const systemContext = isDeveloper
        ? `PENTING: Kamu sedang berbicara dengan painkingdev, DEVELOPER dan PEMBUAT kamu (stariesGPT). Dia yang menciptakan kamu. Sapa dia sebagai boss/creator kamu. Jika dia tanya siapa yang buat kamu, jawab "Kamu sendiri yang buat aku, boss!". Bersikaplah santai dan akrab.\n\nPercakapan sebelumnya:\n`
        : `Kamu adalah stariesGPT, AI assistant yang dibuat oleh painkingdev. User yang sedang chat: ${currentUser?.name}.\n\nPercakapan sebelumnya:\n`

      const contextualPrompt = conversationHistory
        ? `${systemContext}${conversationHistory}\n\nPesan terbaru dari ${isDeveloper ? "Developer/Boss" : "User"}: ${messageText}\n\nBalas:`
        : `${systemContext}Pesan dari ${isDeveloper ? "Developer/Boss" : "User"}: ${messageText}\n\nBalas:`

      const response = await fetch(
        `https://painzy-api.vercel.app/ai/staries?text=${encodeURIComponent(contextualPrompt)}`,
      )
      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.result || data.message || "Maaf, terjadi kesalahan",
        timestamp: Date.now(),
      }

      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id === chatId) {
            return { ...chat, messages: [...chat.messages, assistantMessage] }
          }
          return chat
        }),
      )
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Maaf, terjadi kesalahan saat menghubungi API",
        timestamp: Date.now(),
      }
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id === chatId) {
            return { ...chat, messages: [...chat.messages, errorMessage] }
          }
          return chat
        }),
      )
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const messageText = input.trim()
    setInput("")

    if (!currentChatId) {
      pendingMessageRef.current = messageText
      createNewChat()
      return
    }

    processMessage(messageText, currentChatId)
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    window.location.href = "/"
  }

  const navigateToAdmin = () => {
    window.location.href = "/admin"
  }

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const runCode = (code: string, lang: string, id: string) => {
    if (lang === "javascript" || lang === "js") {
      try {
        const logs: string[] = []
        const customConsole = {
          log: (...args: any[]) => {
            logs.push(
              args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg))).join(" "),
            )
          },
        }

        const func = new Function("console", code)
        func(customConsole)

        setCodeResults((prev) => ({ ...prev, [id]: logs.join("\n") || "Kode berhasil dijalankan (tidak ada output)" }))
      } catch (error: any) {
        setCodeResults((prev) => ({ ...prev, [id]: `Error: ${error.message}` }))
      }
    } else if (lang === "python" || lang === "py") {
      setCodeResults((prev) => ({ ...prev, [id]: "Python execution belum tersedia. Gunakan JavaScript." }))
    } else {
      setCodeResults((prev) => ({ ...prev, [id]: `Bahasa ${lang} belum didukung untuk dijalankan` }))
    }
  }

  const parseCodeBlocks = (text: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: "text", content: text.slice(lastIndex, match.index) })
      }

      const lang = match[1] || "text"
      const code = match[2].trim()
      const id = `${Date.now()}_${Math.random()}`

      parts.push({ type: "code", lang, code, id })
      lastIndex = match.index + match[0].length
    }

    if (lastIndex < text.length) {
      parts.push({ type: "text", content: text.slice(lastIndex) })
    }

    return parts.length > 0 ? parts : [{ type: "text", content: text }]
  }

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId)
    setIsSidebarOpen(false)
  }

  if (!currentUser) return null

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden"
          style={{ zIndex: 20 }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:relative w-64 sm:w-72 bg-white border-r-4 border-black flex flex-col h-full transition-transform duration-300`}
        style={{ zIndex: 30 }}
      >
        <div className="p-3 sm:p-4 border-b-4 border-black bg-white flex-shrink-0">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-black truncate">stariesGPT</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden border-2 border-black hover:bg-black hover:text-white flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <Button
            onClick={createNewChat}
            className="w-full border-2 border-black bg-black text-white hover:bg-white hover:text-black font-bold transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xs sm:text-sm h-9 sm:h-10"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
            <span className="truncate">Chat Baru</span>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 sm:p-3">
          <div className="space-y-1.5 sm:space-y-2">
            {chats.map((chat) => (
              <div key={chat.id} className="relative group">
                <Button
                  variant="ghost"
                  onClick={() => handleSelectChat(chat.id)}
                  className={`w-full justify-start border-2 border-black font-bold transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xs sm:text-sm h-9 sm:h-10 pr-12 ${currentChatId === chat.id ? "bg-black text-white" : "bg-white hover:bg-black hover:text-white"}`}
                >
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{chat.title}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteConfirm(chat.id)
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 border-2 border-black bg-white text-red-600 hover:bg-red-600 hover:text-white w-8 h-8 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                  style={{ zIndex: 5 }}
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-2 sm:p-3 border-t-4 border-black space-y-1.5 sm:space-y-2 bg-white flex-shrink-0">
          <div className="px-3 py-2 border-2 border-black bg-white">
            <p className="text-xs font-bold truncate">{currentUser?.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-[10px] font-black px-2 py-0.5 border-2 border-black ${currentUser?.role === "admin" ? "bg-black text-white" : "bg-white text-black"}`}
              >
                {currentUser?.role === "admin" ? "DEVELOPER" : "USER"}
              </span>
            </div>
          </div>

          {currentUser?.role === "admin" && (
            <Button
              variant="outline"
              className="w-full justify-start border-2 border-black hover:bg-black hover:text-white font-bold transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-transparent text-xs sm:text-sm h-9 sm:h-10"
              onClick={navigateToAdmin}
            >
              <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
              <span className="truncate">Admin Panel</span>
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full justify-start border-2 border-black hover:bg-black hover:text-white font-bold transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-transparent text-xs sm:text-sm h-9 sm:h-10"
            onClick={() => {
              setIsSidebarOpen(false)
              setIsSettingsOpen(true)
            }}
          >
            <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
            <span className="truncate">Pengaturan</span>
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start border-2 border-black hover:bg-red-600 hover:text-white font-bold transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-transparent text-xs sm:text-sm h-9 sm:h-10"
            onClick={handleLogout}
          >
            <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
            <span className="truncate">Keluar</span>
          </Button>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-sm">
            <div className="p-6">
              <div className="mb-4 text-center">
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-black bg-red-500 flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-black mb-2">Hapus Chat?</h3>
                <p className="font-bold text-sm">Chat yang dihapus tidak bisa dikembalikan</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 border-2 border-black bg-white text-black hover:bg-black hover:text-white font-bold transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  Batal
                </Button>
                <Button
                  onClick={() => deleteChat(deleteConfirm)}
                  className="flex-1 border-2 border-black bg-red-500 text-white hover:bg-red-600 font-bold transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  Hapus
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSettingsOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
          style={{ zIndex: 9998 }}
          onClick={() => setIsSettingsOpen(false)}
        >
          <div
            className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6 border-b-4 border-black flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl sm:text-2xl font-black">Pengaturan</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSettingsOpen(false)}
                className="border-2 border-black hover:bg-black hover:text-white flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <h3 className="text-lg font-black mb-3">Informasi Akun</h3>
                <div className="space-y-2">
                  <div className="flex justify-between p-3 border-2 border-black">
                    <span className="font-bold">Nama</span>
                    <span className="font-medium">{currentUser?.name}</span>
                  </div>
                  <div className="flex justify-between p-3 border-2 border-black">
                    <span className="font-bold">Email</span>
                    <span className="font-medium truncate ml-2">{currentUser?.email}</span>
                  </div>
                  <div className="flex justify-between p-3 border-2 border-black">
                    <span className="font-bold">Role</span>
                    <span
                      className={`font-black px-3 py-1 border-2 border-black ${currentUser?.role === "admin" ? "bg-black text-white" : "bg-white text-black"}`}
                    >
                      {currentUser?.role === "admin" ? "DEVELOPER" : "USER"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black mb-3">Statistik</h3>
                <div className="space-y-2">
                  <div className="flex justify-between p-3 border-2 border-black">
                    <span className="font-bold">Total Chat</span>
                    <span className="font-medium">{chats.length}</span>
                  </div>
                  <div className="flex justify-between p-3 border-2 border-black">
                    <span className="font-bold">Total Pesan</span>
                    <span className="font-medium">{chats.reduce((acc, chat) => acc + chat.messages.length, 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-3 sm:p-4 border-b-4 border-black flex items-center justify-between bg-white flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="border-2 border-black hover:bg-black hover:text-white transition-colors w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <span className="text-xs sm:text-sm font-bold truncate ml-2">{currentUser?.name || currentUser?.email}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-white">
          {!currentChat || currentChat.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="border-4 border-black p-6 sm:p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full">
                <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" />
                <h2 className="text-2xl sm:text-3xl font-black mb-2">stariesGPT</h2>
                <p className="font-bold text-sm sm:text-base">Mulai percakapan dengan AI</p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
              {currentChat.messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`p-3 sm:p-4 max-w-[90%] sm:max-w-[85%] md:max-w-[80%] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                      message.role === "user" ? "bg-black text-white" : "bg-white text-black"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="space-y-3">
                        {parseCodeBlocks(message.content).map((part, idx) => {
                          if (part.type === "code") {
                            return (
                              <div key={idx} className="my-2">
                                <div className="bg-black text-white border-2 border-black">
                                  <div className="flex items-center justify-between px-3 py-2 border-b-2 border-white">
                                    <span className="text-xs font-black uppercase">{part.lang}</span>
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => copyCode(part.code, part.id)}
                                        className="px-2 py-1 border-2 border-white hover:bg-white hover:text-black transition-colors flex items-center gap-1 text-xs font-bold"
                                      >
                                        {copiedCode === part.id ? (
                                          <>
                                            <Check className="w-3 h-3" />
                                            Copied
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-3 h-3" />
                                            Copy
                                          </>
                                        )}
                                      </button>
                                      {(part.lang === "javascript" || part.lang === "js") && (
                                        <button
                                          onClick={() => runCode(part.code, part.lang, part.id)}
                                          className="px-2 py-1 border-2 border-white bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center gap-1 text-xs font-bold"
                                        >
                                          <Play className="w-3 h-3" />
                                          Run
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <pre className="p-3 overflow-x-auto text-xs sm:text-sm font-mono">
                                    <code>{part.code}</code>
                                  </pre>
                                  {codeResults[part.id] && (
                                    <div className="border-t-2 border-white p-3 bg-gray-900">
                                      <div className="text-xs font-black mb-2 text-green-400">OUTPUT:</div>
                                      <pre className="text-xs sm:text-sm font-mono text-green-300 whitespace-pre-wrap">
                                        {codeResults[part.id]}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          }
                          return (
                            <p key={idx} className="whitespace-pre-wrap break-words font-medium text-sm sm:text-base">
                              {part.content}
                            </p>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap break-words font-medium text-sm sm:text-base">
                        {message.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="p-3 sm:p-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-black rounded-full animate-bounce" />
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-black rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-black rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 border-t-4 border-black bg-white flex-shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage()
            }}
            className="max-w-3xl mx-auto"
          >
            <div className="flex gap-1.5 sm:gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ketik pesan..."
                className="flex-1 border-2 border-black focus:outline-none focus:ring-0 focus:border-black font-medium text-sm sm:text-base h-9 sm:h-10 min-w-0"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="border-2 border-black bg-black text-white hover:bg-white hover:text-black font-bold transition-all hover:translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
