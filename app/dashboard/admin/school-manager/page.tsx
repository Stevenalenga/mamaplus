'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type School = {
  id: string
  name: string
  location: string | null
  county: string | null
  studentCount: number
  isActive: boolean
  _count: { educators: number }
}

type Educator = {
  id: string
  name: string
  email: string | null
  phone: string | null
  subject: string | null
  schoolId: string | null
  isActive: boolean
  school: { id: string; name: string } | null
}

const emptySchool = { name: '', location: '', county: '', studentCount: '0' }
const emptyEducator = { name: '', email: '', phone: '', subject: '', schoolId: '' }

export default function SchoolManagerPage() {
  const [schools, setSchools] = useState<School[]>([])
  const [educators, setEducators] = useState<Educator[]>([])
  const [loading, setLoading] = useState(true)
  const [schoolDialog, setSchoolDialog] = useState(false)
  const [educatorDialog, setEducatorDialog] = useState(false)
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null)
  const [editingEducatorId, setEditingEducatorId] = useState<string | null>(null)
  const [schoolForm, setSchoolForm] = useState(emptySchool)
  const [educatorForm, setEducatorForm] = useState(emptyEducator)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'school' | 'educator'; id: string } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [schoolsRes, educatorsRes] = await Promise.all([
        fetch('/api/admin/schools'),
        fetch('/api/admin/educators'),
      ])
      const schoolsData = await schoolsRes.json()
      const educatorsData = await educatorsRes.json()
      if (schoolsData.success) setSchools(schoolsData.data)
      if (educatorsData.success) setEducators(educatorsData.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const openSchoolDialog = (school?: School) => {
    if (school) {
      setEditingSchoolId(school.id)
      setSchoolForm({
        name: school.name,
        location: school.location || '',
        county: school.county || '',
        studentCount: String(school.studentCount),
      })
    } else {
      setEditingSchoolId(null)
      setSchoolForm(emptySchool)
    }
    setSchoolDialog(true)
  }

  const saveSchool = async () => {
    if (!schoolForm.name.trim()) {
      toast.error('School name is required')
      return
    }
    const body = {
      name: schoolForm.name,
      location: schoolForm.location,
      county: schoolForm.county,
      studentCount: Number(schoolForm.studentCount) || 0,
    }
    const res = await fetch(
      editingSchoolId ? `/api/admin/schools/${editingSchoolId}` : '/api/admin/schools',
      {
        method: editingSchoolId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    )
    const data = await res.json()
    if (data.success) {
      toast.success(editingSchoolId ? 'School updated' : 'School created')
      setSchoolDialog(false)
      load()
    } else {
      toast.error(data.message || 'Failed')
    }
  }

  const openEducatorDialog = (educator?: Educator) => {
    if (educator) {
      setEditingEducatorId(educator.id)
      setEducatorForm({
        name: educator.name,
        email: educator.email || '',
        phone: educator.phone || '',
        subject: educator.subject || '',
        schoolId: educator.schoolId || '',
      })
    } else {
      setEditingEducatorId(null)
      setEducatorForm(emptyEducator)
    }
    setEducatorDialog(true)
  }

  const saveEducator = async () => {
    if (!educatorForm.name.trim()) {
      toast.error('Educator name is required')
      return
    }
    const body = {
      ...educatorForm,
      schoolId: educatorForm.schoolId || null,
      ...(editingEducatorId && { id: editingEducatorId }),
    }
    const res = await fetch('/api/admin/educators', {
      method: editingEducatorId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (data.success) {
      toast.success(editingEducatorId ? 'Educator updated' : 'Educator created')
      setEducatorDialog(false)
      load()
    } else {
      toast.error(data.message || 'Failed')
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const url =
      deleteTarget.type === 'school'
        ? `/api/admin/schools/${deleteTarget.id}`
        : '/api/admin/educators'
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: deleteTarget.type === 'educator' ? JSON.stringify({ id: deleteTarget.id }) : undefined,
    })
    const data = await res.json()
    if (data.success) {
      toast.success('Deleted')
      load()
    } else {
      toast.error(data.message || 'Failed')
    }
    setDeleteTarget(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">School Manager</h2>
        <p className="text-sm text-muted-foreground">Manage schools and educators across the platform</p>
      </div>

      <Tabs defaultValue="schools">
        <TabsList>
          <TabsTrigger value="schools">Schools ({schools.length})</TabsTrigger>
          <TabsTrigger value="educators">Educators ({educators.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="schools" className="mt-4">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Schools</CardTitle>
              <Button size="sm" onClick={() => openSchoolDialog()}>
                <Plus className="mr-1 h-4 w-4" /> Add School
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Educators</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schools.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                          No schools yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      schools.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {[s.location, s.county].filter(Boolean).join(', ') || '—'}
                          </TableCell>
                          <TableCell>{s.studentCount}</TableCell>
                          <TableCell>{s._count.educators}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => openSchoolDialog(s)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteTarget({ type: 'school', id: s.id })}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="educators" className="mt-4">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Educators</CardTitle>
              <Button size="sm" onClick={() => openEducatorDialog()}>
                <Plus className="mr-1 h-4 w-4" /> Add Educator
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {educators.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                          No educators yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      educators.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell className="font-medium">{e.name}</TableCell>
                          <TableCell className="text-sm">{e.school?.name || '—'}</TableCell>
                          <TableCell className="text-sm">{e.subject || '—'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{e.email || e.phone || '—'}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => openEducatorDialog(e)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteTarget({ type: 'educator', id: e.id })}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={schoolDialog} onOpenChange={setSchoolDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingSchoolId ? 'Edit School' : 'Add School'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={schoolForm.name} onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })} /></div>
            <div><Label>Location</Label><Input value={schoolForm.location} onChange={(e) => setSchoolForm({ ...schoolForm, location: e.target.value })} /></div>
            <div><Label>County</Label><Input value={schoolForm.county} onChange={(e) => setSchoolForm({ ...schoolForm, county: e.target.value })} /></div>
            <div><Label>Student Count</Label><Input type="number" value={schoolForm.studentCount} onChange={(e) => setSchoolForm({ ...schoolForm, studentCount: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSchoolDialog(false)}>Cancel</Button>
            <Button onClick={saveSchool}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={educatorDialog} onOpenChange={setEducatorDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingEducatorId ? 'Edit Educator' : 'Add Educator'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={educatorForm.name} onChange={(e) => setEducatorForm({ ...educatorForm, name: e.target.value })} /></div>
            <div><Label>Email</Label><Input value={educatorForm.email} onChange={(e) => setEducatorForm({ ...educatorForm, email: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={educatorForm.phone} onChange={(e) => setEducatorForm({ ...educatorForm, phone: e.target.value })} /></div>
            <div><Label>Subject</Label><Input value={educatorForm.subject} onChange={(e) => setEducatorForm({ ...educatorForm, subject: e.target.value })} /></div>
            <div>
              <Label>School</Label>
              <Select value={educatorForm.schoolId || 'none'} onValueChange={(v) => setEducatorForm({ ...educatorForm, schoolId: v === 'none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No school</SelectItem>
                  {schools.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEducatorDialog(false)}>Cancel</Button>
            <Button onClick={saveEducator}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.type}?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
