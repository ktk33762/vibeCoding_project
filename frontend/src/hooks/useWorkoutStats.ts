import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { WorkoutLog, WorkoutLogItem } from '../types/workout'

export interface WeeklyDataPoint { week: string; count: number }
export interface BodyPartDataPoint { part: string; count: number }
export interface MonthlyVolumeDataPoint { month: string; volume: number }
export interface WeekdayDataPoint { day: string; count: number; isTop: boolean }
export interface WorkoutStatsData {
  weeklyData: WeeklyDataPoint[]
  bodyPartData: BodyPartDataPoint[]
  monthlyVolumeData: MonthlyVolumeDataPoint[]
  weekdayData: WeekdayDataPoint[]
}

function classifyBodyPart(name: string): string {
  if (/스쿼트|레그\s*(프레스|컬|익스텐션)|런지|카프|힙\s*(브릿지|어브덕션|스러스트)|글루트|불가리안|루마니안|박스\s*점프|점프\s*스쿼트|런지\s*점프|스텝업/.test(name)) return '하체'
  if (/벤치|인클라인|딥스|푸시업|크로스오버|펙덱|체스트/.test(name)) return '가슴'
  if (/데드리프트|로우|풀업|랫|풀다운|친업|수퍼맨|시티드/.test(name)) return '등'
  if (/오버헤드\s*프레스|레터럴\s*레이즈|프론트\s*레이즈|페이스\s*풀|숄더/.test(name)) return '어깨'
  if (/바벨\s*컬|덤벨\s*컬|해머\s*컬|이두|바이셉|삼두|트라이셉/.test(name)) return '팔'
  if (/플랭크|싯업|크런치|트위스트|버드독|데드버그|레그.{0,1}레이즈|브이\s*싯업|캣카우|고양이/.test(name)) return '코어'
  if (/버피|배틀로프|점프\s*로프|메디신볼|슬램|케틀벨|스윙|배틀/.test(name)) return '전신'
  if (/스트레칭|포즈|요가|다운독|업독|전사|차일드|선\s*자세/.test(name)) return '스트레칭'
  return '기타'
}

function getMondayOf(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

function buildWeeklyData(logs: WorkoutLog[]): WeeklyDataPoint[] {
  const today = new Date()
  const result: WeeklyDataPoint[] = []
  for (let i = 7; i >= 0; i--) {
    const monday = getMondayOf(today)
    monday.setDate(monday.getDate() - i * 7)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    const weekStart = monday.toISOString().slice(0, 10)
    const weekEnd = sunday.toISOString().slice(0, 10)
    const count = logs.filter(l => l.logged_date >= weekStart && l.logged_date <= weekEnd).length
    result.push({ week: `${monday.getMonth() + 1}/${monday.getDate()}`, count })
  }
  return result
}

// 루틴 이름으로 부위 분류, 불명확하면 종목 구성으로 폴백
function classifyRoutine(routineName: string, logItems: WorkoutLogItem[]): string {
  const n = routineName
  if (/가슴|chest|벤치/.test(n)) return '가슴'
  if (/등[^록]|back|풀업/.test(n)) return '등'
  if (/하체|다리|레그|leg|스쿼트/.test(n)) return '하체'
  if (/어깨|shoulder/.test(n)) return '어깨'
  if (/팔|이두|삼두|arm/.test(n)) return '팔'
  if (/코어|복근|core/.test(n)) return '코어'
  if (/전신|서킷|인터벌|크로스핏|full/.test(n)) return '전신'
  if (/요가|yoga|스트레칭|stretch|유연|필라테스/.test(n)) return '스트레칭'
  if (/러너|러닝|달리기|run/.test(n)) return '하체'

  // 종목 구성 중 가장 많은 부위로 폴백
  if (logItems.length > 0) {
    const partCounts: Record<string, number> = {}
    logItems.forEach(item => {
      const part = classifyBodyPart(item.exercise_name)
      partCounts[part] = (partCounts[part] ?? 0) + 1
    })
    return Object.entries(partCounts).sort((a, b) => b[1] - a[1])[0][0]
  }

  return '기타'
}

function buildBodyPartData(logs: WorkoutLog[], items: WorkoutLogItem[]): BodyPartDataPoint[] {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const start = thirtyDaysAgo.toISOString().slice(0, 10)
  const recentLogs = logs.filter(l => l.logged_date >= start)

  // log_id → items 맵 (루틴 이름으로 분류 안 될 때 폴백용)
  const itemsByLog: Record<string, WorkoutLogItem[]> = {}
  items.forEach(item => {
    if (!itemsByLog[item.log_id]) itemsByLog[item.log_id] = []
    itemsByLog[item.log_id].push(item)
  })

  // 로그 1개 = 1회로 카운트
  const map: Record<string, number> = {}
  recentLogs.forEach(log => {
    const part = classifyRoutine(log.routine_name ?? '', itemsByLog[log.id] ?? [])
    map[part] = (map[part] ?? 0) + 1
  })

  return Object.entries(map)
    .map(([part, count]) => ({ part, count }))
    .sort((a, b) => b.count - a.count)
}

function buildMonthlyVolumeData(logs: WorkoutLog[], items: WorkoutLogItem[]): MonthlyVolumeDataPoint[] {
  const logDateMap: Record<string, string> = {}
  logs.forEach(l => { logDateMap[l.id] = l.logged_date })

  const monthMap: Record<string, number> = {}
  items.forEach(item => {
    const date = logDateMap[item.log_id]
    if (!date) return
    const month = date.slice(0, 7)
    if (item.weight_kg !== null && item.reps !== null && item.completed_sets !== null && item.completed_sets > 0) {
      monthMap[month] = (monthMap[month] ?? 0) + item.weight_kg * item.reps * item.completed_sets
    }
  })

  const result: MonthlyVolumeDataPoint[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    const key = d.toISOString().slice(0, 7)
    result.push({ month: `${d.getMonth() + 1}월`, volume: Math.round(monthMap[key] ?? 0) })
  }
  return result
}

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

function buildWeekdayData(logs: WorkoutLog[]): WeekdayDataPoint[] {
  const counts = [0, 0, 0, 0, 0, 0, 0]
  logs.forEach(log => {
    // logged_date는 'YYYY-MM-DD' 문자열 → UTC로 파싱하면 요일 오차 발생하므로 로컬 파싱
    const [y, m, d] = log.logged_date.split('-').map(Number)
    counts[new Date(y, m - 1, d).getDay()]++
  })

  // 월~일 순서로 재배열
  const ordered = [1, 2, 3, 4, 5, 6, 0].map(i => ({
    day: WEEKDAY_LABELS[i],
    count: counts[i],
  }))
  const maxCount = Math.max(...ordered.map(d => d.count))
  return ordered.map(d => ({ ...d, isTop: maxCount > 0 && d.count === maxCount }))
}

export function useWorkoutStats() {
  const [data, setData] = useState<WorkoutStatsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const startDate = sixMonthsAgo.toISOString().slice(0, 10)

    const { data: logs } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_date', startDate)
      .order('logged_date', { ascending: true })

    const logList = (logs ?? []) as WorkoutLog[]

    let itemList: WorkoutLogItem[] = []
    if (logList.length > 0) {
      const { data: items } = await supabase
        .from('workout_log_items')
        .select('*')
        .in('log_id', logList.map(l => l.id))
      itemList = (items ?? []) as WorkoutLogItem[]
    }

    setData({
      weeklyData: buildWeeklyData(logList),
      bodyPartData: buildBodyPartData(logList, itemList),
      monthlyVolumeData: buildMonthlyVolumeData(logList, itemList),
      weekdayData: buildWeekdayData(logList),
    })
    setLoading(false)
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  return { data, loading }
}
