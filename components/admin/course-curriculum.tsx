'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Lesson = { id: string; title: string; duration: number; order: number }
type Module = { id: string; title: string; order: number; lessons: Lesson[] }

type CourseCurriculumProps = {
  courseId: string | null
}

export function CourseCurriculum({ courseId }: CourseCurriculumProps) {
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(false)
  const [moduleTitle, setModuleTitle] = useState('')
  const [lessonTitles, setLessonTitles] = useState<Record<string, string>>({})

  const loadCourse = useCallback(async () => {
    if (!courseId) {
      setModules([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/courses/${courseId}`)
      const data = await res.json()
      if (data.success && data.data?.modules) {
        setModules(data.data.modules)
      }
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    loadCourse()
  }, [loadCourse])

  const addModule = async () => {
    if (!courseId || !moduleTitle.trim()) return
    const res = await fetch(`/api/courses/${courseId}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: moduleTitle.trim() }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success('Module added')
      setModuleTitle('')
      loadCourse()
    } else {
      toast.error(data.message || 'Failed to add module')
    }
  }

  const addLesson = async (moduleId: string) => {
    if (!courseId) return
    const title = lessonTitles[moduleId]?.trim()
    if (!title) return
    const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, duration: 10 }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success('Lesson added')
      setLessonTitles((prev) => ({ ...prev, [moduleId]: '' }))
      loadCourse()
    } else {
      toast.error(data.message || 'Failed to add lesson')
    }
  }

  const deleteModule = async (moduleId: string) => {
    if (!courseId) return
    const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      toast.success('Module deleted')
      loadCourse()
    } else {
      toast.error(data.message || 'Failed')
    }
  }

  if (!courseId) {
    return (
      <Card className="border-border/60 shadow-sm">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Select a course to manage its curriculum
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Curriculum Builder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="New module title"
            value={moduleTitle}
            onChange={(e) => setModuleTitle(e.target.value)}
          />
          <Button onClick={addModule} disabled={!moduleTitle.trim()}>
            <Plus className="mr-1 h-4 w-4" /> Add Module
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : modules.length === 0 ? (
          <p className="text-sm text-muted-foreground">No modules yet. Add your first module above.</p>
        ) : (
          <ul className="space-y-4">
            {modules.map((mod) => (
              <li key={mod.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{mod.title}</p>
                  <Button variant="ghost" size="icon" onClick={() => deleteModule(mod.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <ul className="mt-2 space-y-1 pl-4">
                  {mod.lessons?.map((lesson) => (
                    <li key={lesson.id} className="text-sm text-muted-foreground">
                      • {lesson.title} ({lesson.duration} min)
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex gap-2">
                  <Input
                    placeholder="New lesson title"
                    value={lessonTitles[mod.id] || ''}
                    onChange={(e) =>
                      setLessonTitles((prev) => ({ ...prev, [mod.id]: e.target.value }))
                    }
                    className="h-8 text-sm"
                  />
                  <Button size="sm" variant="outline" onClick={() => addLesson(mod.id)}>
                    Add Lesson
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
