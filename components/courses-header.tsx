'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Bell, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type Notification = {
  id: string
  title: string
  message: string
  time: string
  read: boolean
}

export default function CoursesHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Course Available',
      message: 'Maternal Health Basics course is now available',
      time: '2 hours ago',
      read: false
    },
    {
      id: '2',
      title: 'Certificate Ready',
      message: 'Your certificate for Infant Nutrition is ready to download',
      time: '1 day ago',
      read: false
    },
    {
      id: '3',
      title: 'Welcome to MamaPlus',
      message: 'Thank you for joining our caregiving community',
      time: '3 days ago',
      read: true
    }
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
        <Link href="/" className="flex items-center hover:opacity-80 transition">
          <Image
            src="/logo.png"
            alt="MamaPlus"
            width={120}
            height={40}
            priority
            className="object-contain sm:w-[240px] sm:h-[80px]"
          />
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications Bell */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="relative p-2.5 text-gray-700 hover:text-primary transition rounded-full hover:bg-gray-100 border border-gray-200">
                <Bell className="w-6 h-6 stroke-2" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 border-2 border-white animate-pulse"></span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold text-lg">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition cursor-pointer ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground mb-1">{notification.message}</p>
                            <p className="text-xs text-muted-foreground">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <div className="hidden sm:flex items-center gap-2">
            <Link href="/login">
              <Button variant="outline" className="text-primary border-primary hover:bg-primary/10 bg-transparent">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Get Started
              </Button>
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="sm:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t bg-white">
          <div className="px-4 py-4 space-y-2">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full text-primary border-primary hover:bg-primary/10 bg-transparent">
                Sign In
              </Button>
            </Link>
            <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
