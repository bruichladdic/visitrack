'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { format, parseISO, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Activity, CalendarCheck, Building2, CheckCircle2, Clock, MapPin,
  Plus, RefreshCcw, Stethoscope, Store, Target, Users, AlertTriangle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

// ── Types ───────────────────────────────────────────────────────────────────
type VisitStatus = 'PLANIFIEE' | 'TERMINEE' | 'REPORTEE'
interface Visit {
  id: string
  client: string
  type: 'MEDECIN' | 'PHARMACIE' | 'CLINIQUE' | 'HOPITAL'
  quartier: string
  day: string
  slot: string
  objective: string
  status: VisitStatus
}

const STATUS_META: Record<VisitStatus, { label: string; badge: string; color: string }> = {
  PLANIFIEE: { label: 'Planifiée', badge: 'bg-teal-100 text-teal-800 border-teal-200', color: '#0d9488' },
  TERMINEE: { label: 'Terminée', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', color: '#059669' },
  REPORTEE: { label: 'Reportée', badge: 'bg-amber-100 text-amber-800 border-amber-200', color: '#d97706' },
}

const TYPE_META: Record<Visit['type'], { label: string; badge: string }> = {
  MEDECIN: { label: 'Médecin', badge: 'border-teal-300 text-teal-700 bg-teal-50' },
  PHARMACIE: { label: 'Pharmacie', badge: 'border-emerald-300 text-emerald-700 bg-emerald-50' },
  CLINIQUE: { label: 'Clinique', badge: 'border-rose-300 text-rose-700 bg-rose-50' },
  HOPITAL: { label: 'Hôpital', badge: 'border-orange-300 text-orange-700 bg-orange-50' },
}

const TYPE_ICONS = {
  MEDECIN: Stethoscope, PHARMACIE: Store, CLINIQUE: Building2, HOPITAL: Building2,
}

const PIE_COLORS = ['#0d9488', '#059669', '#e11d48', '#ea580c']
const WEEK_OBJECTIVE = 12

// ── Small components ────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, value, label, sub, progress }: {
  icon: React.ElementType; value: string; label: string; sub?: string; progress?: number
}) {
  return (
    <Card className="border-teal-100 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-teal-600 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="text-2xl font-bold text-slate-800 leading-tight">{value}</div>
            <div className="text-xs font-medium text-slate-500 truncate">{label}</div>
          </div>
        </div>
        {progress !== undefined && (
          <Progress value={progress} className="mt-3 h-1.5 [&>div]:bg-teal-600" aria-label={label} />
        )}
        {sub && <p className="text-[11px] text-slate-400 mt-2">{sub}</p>}
      </CardContent>
    </Card>
  )
}

function VisitCard({ visit, onStatus }: { visit: Visit; onStatus: (id: string, s: VisitStatus) => void }) {
  const TypeIcon = TYPE_ICONS[visit.type] ?? Building2
  const st = STATUS_META[visit.status]
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-teal-300 transition-colors"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
            <TypeIcon className="h-4.5 w-4.5 text-teal-700" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 truncate">{visit.client}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-0.5">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" aria-hidden="true" />{visit.quartier}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden="true" />{visit.slot}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant="outline" className={`text-[11px] ${TYPE_META[visit.type].badge}`}>
            {TYPE_META[visit.type].label}
          </Badge>
          <Badge variant="outline" className={`text-[11px] ${st.badge}`}>{st.label}</Badge>
        </div>
      </div>
      <p className="text-sm text-slate-500 mt-2.5 italic">« {visit.objective} »</p>
      <div className="flex flex-wrap gap-2 mt-3">
        {visit.status !== 'TERMINEE' && (
          <Button size="sm" className="h-8 bg-teal-600 hover:bg-teal-700 text-white"
            onClick={() => onStatus(visit.id, 'TERMINEE')}>
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" aria-hidden="true" /> Marquer terminée
          </Button>
        )}
        {visit.status === 'PLANIFIEE' && (
          <Button size="sm" variant="outline"
            className="h-8 border-amber-300 text-amber-700 hover:bg-amber-50"
            onClick={() => onStatus(visit.id, 'REPORTEE')}>
            <RefreshCcw className="h-3.5 w-3.5 mr-1" aria-hidden="true" /> Reporter
          </Button>
        )}
        {visit.status === 'REPORTEE' && (
          <Button size="sm" variant="outline"
            className="h-8 border-teal-300 text-teal-700 hover:bg-teal-50"
            onClick={() => onStatus(visit.id, 'PLANIFIEE')}>
            <CalendarCheck className="h-3.5 w-3.5 mr-1" aria-hidden="true" /> Replanifier
          </Button>
        )}
      </div>
    </motion.div>
  )
}

// ── Add-visit dialog ────────────────────────────────────────────────────────
function AddVisitDialog({ onAdded }: { onAdded: () => void }) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    client: '', type: 'MEDECIN', quartier: '', day: '', slot: '', objective: '',
  })

  const submit = async () => {
    if (!form.client || !form.quartier || !form.day || !form.slot || !form.objective) {
      toast({ title: 'Champs manquants', description: 'Merci de remplir tous les champs.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur')
      toast({ title: 'Visite planifiée ✓', description: `${form.client} — ${form.day}` })
      setOpen(false)
      setForm({ client: '', type: 'MEDECIN', quartier: '', day: '', slot: '', objective: '' })
      onAdded()
    } catch (e) {
      toast({ title: 'Échec', description: e instanceof Error ? e.message : 'Erreur inconnue', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white">
          <Plus className="h-4 w-4 mr-1" aria-hidden="true" /> Planifier une visite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-teal-800">Nouvelle visite médicale</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3.5 py-1">
          <div className="grid gap-1.5">
            <Label htmlFor="client">Client (médecin, pharmacie…)</Label>
            <Input id="client" value={form.client} placeholder="Dr. Awa Ndiaye"
              onChange={e => setForm({ ...form, client: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEDECIN">Médecin</SelectItem>
                  <SelectItem value="PHARMACIE">Pharmacie</SelectItem>
                  <SelectItem value="CLINIQUE">Clinique</SelectItem>
                  <SelectItem value="HOPITAL">Hôpital</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="quartier">Quartier</Label>
              <Input id="quartier" value={form.quartier} placeholder="Médina"
                onChange={e => setForm({ ...form, quartier: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="day">Date</Label>
              <Input id="day" type="date" value={form.day}
                onChange={e => setForm({ ...form, day: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="slot">Créneau</Label>
              <Input id="slot" value={form.slot} placeholder="09:00 - 10:00"
                onChange={e => setForm({ ...form, slot: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="objective">Objectif de la visite</Label>
            <Input id="objective" value={form.objective} placeholder="Présentation nouvelle gamme…"
              onChange={e => setForm({ ...form, objective: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={submit} disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function Home() {
  const { toast } = useToast()
  const [visits, setVisits] = useState<Visit[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [tab, setTab] = useState<'today' | 'week'>('today')
  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])

  const load = useCallback(async () => {
    try {
      setFailed(false)
      const res = await fetch('/api/visits')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setVisits(data.visits as Visit[])
    } catch {
      setFailed(true)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const patchStatus = async (id: string, status: VisitStatus) => {
    setVisits(prev => prev ? prev.map(v => v.id === id ? { ...v, status } : v) : prev)
    try {
      const res = await fetch(`/api/visits/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      toast({ title: 'Statut mis à jour ✓', description: `Nouveau statut : ${STATUS_META[status].label}` })
    } catch {
      load()
      toast({ title: 'Erreur', description: 'Mise à jour impossible.', variant: 'destructive' })
    }
  }

  const weekRange = useMemo(() => {
    const now = new Date()
    return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) }
  }, [])

  const inWeek = (v: Visit) =>
    isWithinInterval(parseISO(v.day), { start: weekRange.start, end: weekRange.end })

  const stats = useMemo(() => {
    const all = visits ?? []
    const week = all.filter(inWeek)
    const done = week.filter(v => v.status === 'TERMINEE').length
    const todayVisits = all.filter(v => v.day === today)
    const clients = new Set(all.map(v => v.client)).size
    return {
      weekTotal: week.length,
      done,
      rate: week.length ? Math.round((done / week.length) * 100) : 0,
      objectiveRate: Math.min(100, Math.round((done / WEEK_OBJECTIVE) * 100)),
      todayVisits,
      todayDone: todayVisits.filter(v => v.status === 'TERMINEE').length,
      clients,
      week,
    }
  }, [visits, today, weekRange])

  const chartData = useMemo(() => {
    const map = new Map<string, { day: string; Terminées: number; Planifiées: number; Reportées: number }>()
    for (const v of visits ?? []) {
      const label = format(parseISO(v.day), 'EEE d', { locale: fr })
      const e = map.get(v.day) ?? { day: label, Terminées: 0, Planifiées: 0, Reportées: 0 }
      if (v.status === 'TERMINEE') e['Terminées']++
      else if (v.status === 'PLANIFIEE') e['Planifiées']++
      else e['Reportées']++
      map.set(v.day, e)
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v)
  }, [visits])

  const pieData = useMemo(() => {
    const counts = new Map<string, number>()
    for (const v of visits ?? []) counts.set(v.type, (counts.get(v.type) ?? 0) + 1)
    return [...counts.entries()].map(([type, value]) => ({
      name: TYPE_META[type as Visit['type']]?.label ?? type, value,
    }))
  }, [visits])

  const shown = tab === 'today' ? stats.todayVisits : stats.week

  return (
    <div className="min-h-screen flex flex-col bg-[#f4faf9]">
      {/* Header */}
      <header className="border-b border-teal-100 bg-white/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-teal-600 flex items-center justify-center shrink-0 shadow-sm">
              <Activity className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-slate-800 leading-tight">
                Visi<span className="text-teal-600">Track</span>
              </h1>
              <p className="text-xs text-slate-500 truncate">Suivi des visites médicales — Dakar</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:inline-flex border-teal-200 text-teal-700 bg-teal-50">
              Projet de Papa Cheikh Ndiaye
            </Badge>
            <AddVisitDialog onAdded={load} />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
        {failed && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4 flex items-center gap-3 text-amber-800">
              <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>Impossible de charger les visites.</span>
              <Button size="sm" variant="outline" className="ml-auto" onClick={load}>Réessayer</Button>
            </CardContent>
          </Card>
        )}

        {/* KPIs */}
        <section aria-label="Indicateurs clés" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visits === null ? (
            [...Array(4)].map((_, i) => <Skeleton key={i} className="h-[110px] rounded-xl" />)
          ) : (
            <>
              <KpiCard icon={CalendarCheck} value={String(stats.weekTotal)} label="Visites cette semaine"
                sub={`${stats.done} réalisées · ${stats.weekTotal - stats.done} à venir`} />
              <KpiCard icon={Target} value={`${stats.rate} %`} label="Taux de réalisation"
                progress={stats.rate} sub={`Objectif semaine : ${WEEK_OBJECTIVE} visites`} />
              <KpiCard icon={Clock} value={`${stats.todayDone}/${stats.todayVisits.length}`} label="Tournée du jour"
                sub={format(new Date(), 'EEEE d MMMM', { locale: fr })} />
              <KpiCard icon={Users} value={String(stats.clients)} label="Clients au portefeuille"
                sub="Médecins, pharmacies, cliniques" />
            </>
          )}
        </section>

        {/* Charts */}
        <section aria-label="Analyse de l'activité" className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <Card className="lg:col-span-3 border-teal-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-slate-800">Activité de la semaine</CardTitle>
              <CardDescription>Visites par jour et par statut</CardDescription>
            </CardHeader>
            <CardContent className="h-[260px]">
              {visits === null ? <Skeleton className="h-full w-full rounded-lg" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barCategoryGap="28%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2f0ee" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={24} />
                    <Tooltip cursor={{ fill: 'rgba(13,148,136,0.06)' }} contentStyle={{ borderRadius: 10, border: '1px solid #ccf3ec', fontSize: 13 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Terminées" stackId="a" fill="#059669" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Planifiées" stackId="a" fill="#0d9488" />
                    <Bar dataKey="Reportées" stackId="a" fill="#d97706" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-teal-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-slate-800">Portefeuille clients</CardTitle>
              <CardDescription>Répartition par type</CardDescription>
            </CardHeader>
            <CardContent className="h-[260px]">
              {visits === null ? <Skeleton className="h-full w-full rounded-lg" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%"
                      paddingAngle={3} stroke="none" label={{ fontSize: 12, fill: '#475569' }}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #ccf3ec', fontSize: 13 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Visit list */}
        <section aria-label="Planning des visites" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Planning des tournées</h2>
              <p className="text-sm text-slate-500">Suivi en temps réel — cliquez pour mettre à jour un statut</p>
            </div>
            <Tabs value={tab} onValueChange={v => setTab(v as 'today' | 'week')}>
              <TabsList className="bg-teal-50 border border-teal-100">
                <TabsTrigger value="today" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                  Aujourd&apos;hui
                </TabsTrigger>
                <TabsTrigger value="week" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                  Semaine
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {visits === null ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-[120px] rounded-xl" />)}</div>
          ) : shown.length === 0 ? (
            <Card className="border-dashed border-teal-200 bg-white">
              <CardContent className="p-8 text-center text-slate-500">
                <Stethoscope className="h-8 w-8 mx-auto mb-2 text-teal-300" aria-hidden="true" />
                Aucune visite {tab === 'today' ? "planifiée aujourd'hui" : 'cette semaine'}.
                <span className="block text-sm mt-1">Planifiez-en une avec le bouton « Planifier une visite ».</span>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {shown.map(v => <VisitCard key={v.id} visit={v} onStatus={patchStatus} />)}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-teal-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">VisiTrack</span> — Projet personnel de Papa Cheikh Ndiaye
            {' '}·{' '}
            <a
              href="/CV_Papa_Cheikh_Ndiaye.pdf"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
              aria-label="Télécharger le CV de Papa Cheikh Ndiaye (PDF)"
            >
              Télécharger mon CV (PDF)
            </a>
          </p>
          <Separator orientation="vertical" className="hidden sm:block h-4" />
          <p className="text-xs text-slate-400">Next.js · TypeScript · Prisma (SQLite) · Recharts · Tailwind CSS</p>
        </div>
      </footer>
    </div>
  )
}
