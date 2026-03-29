'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Bell } from 'lucide-react'
import { useCurrentUser } from '@/hooks/use-current-user'
import { LogoutButton } from '@/components/auth/LogoutButton'
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

type EducatorHeaderProps = {
  currentPage?: 'home' | 'profile' | 'courses' | null
}

export default function EducatorHeader({ currentPage = null }: EducatorHeaderProps) {
  const { user } = useCurrentUser()

  const [notifications, setNotifications] = useState<Notification[]>([
    { 
      id: '1', 
      title: 'New Student Enrollment', 
      message: 'A student has enrolled in your Maternal Health Basics course', 
      time: '2 hours ago', 
      read: false 
    },
    { 
      id: '2', 
      title: 'Course Milestone Completed', 
      message: '5 students completed the first milestone in Infant Nutrition', 
      time: '1 day ago', 
      read: false 
    },
    { 
      id: '3', 
      title: 'Welcome to MamaPlus Educators', 
      message: 'Thank you for joining our educator community', 
      time: '3 days ago', 
      read: true 
    },
  ])

  const unreadCount = notifications.filter(n => !n.read).length
  
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const getLinkClasses = (page: string) => {
    return currentPage === page
      ? 'text-sm font-semibold text-primary border-b-2 border-primary'
      : 'text-sm text-muted-foreground hover:text-primary'
  }

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard/educator" className="flex items-center gap-2">
            <Image src="/logo.png" alt="MamaPlus" width={160} height={54} className="object-contain" />
          </Link>
          <Link href="/dashboard/educator" className={getLinkClasses('home')}>
            Dashboard
          </Link>
          <Link href="/courses" className={getLinkClasses('courses')}>
            Browse Courses
          </Link>
          <Link href="/dashboard/educator/profile" className={getLinkClasses('profile')}>
            My Profile
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="relative p-2 text-gray-700 hover:text-primary transition rounded-full hover:bg-gray-100 border border-gray-200">
                <Bell className="w-5 h-5 stroke-2" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3 border-2 border-white animate-pulse" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold text-lg">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">
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
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {user && (
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user.name || user.email}
            </span>
          )}
          <LogoutButton variant="ghost" size="sm" />
        </div>
      </div>
    </nav>
  )
}
