'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import {
	ArrowRightLeft,
	CalendarDays,
	Calculator,
	Check,
	ChevronLeft,
	ChevronRight,
	Clock3,
	Copy,
	Globe2,
	Pause,
	Play,
	RotateCcw,
	TimerReset
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToolTab = 'now' | 'timestamp' | 'diff' | 'offset' | 'timezone' | 'timer'
type TimestampUnit = 'auto' | 'seconds' | 'milliseconds'
type DurationFields = {
	years: string
	months: string
	days: string
	hours: string
	minutes: string
	seconds: string
}
type TimerMode = 'stopwatch' | 'countdown'

const DEFAULT_TIME_ZONE = 'Asia/Shanghai'
const COMMON_TIME_ZONES = [
	'Asia/Shanghai',
	'UTC',
	'Asia/Tokyo',
	'Asia/Seoul',
	'Asia/Singapore',
	'Europe/London',
	'Europe/Paris',
	'America/New_York',
	'America/Los_Angeles',
	'Australia/Sydney'
]

const tabs: { value: ToolTab; label: string; icon: LucideIcon }[] = [
	{ value: 'timer', label: '计时', icon: TimerReset },
	{ value: 'now', label: '当前时间', icon: Clock3 },
	{ value: 'timestamp', label: '时间戳', icon: ArrowRightLeft },
	{ value: 'diff', label: '日期差', icon: Calculator },
	{ value: 'offset', label: '日期加减', icon: CalendarDays },
	{ value: 'timezone', label: '时区换算', icon: Globe2 }
]

const emptyDuration: DurationFields = {
	years: '0',
	months: '0',
	days: '0',
	hours: '0',
	minutes: '0',
	seconds: '0'
}

const timerInputFields: { key: 'hours' | 'minutes' | 'seconds'; label: string }[] = [
	{ key: 'hours', label: '时' },
	{ key: 'minutes', label: '分' },
	{ key: 'seconds', label: '秒' }
]

function pad(value: number) {
	return String(value).padStart(2, '0')
}

function formatDateTimeInput(date: Date) {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function formatDateKey(date: Date) {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function formatLocal(date: Date) {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function formatUtc(date: Date) {
	return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())} UTC`
}

function formatTimer(ms: number) {
	const safe = Math.max(0, Math.floor(ms))
	const totalSeconds = Math.floor(safe / 1000)
	const hours = Math.floor(totalSeconds / 3600)
	const minutes = Math.floor((totalSeconds % 3600) / 60)
	const seconds = totalSeconds % 60
	const milliseconds = Math.floor((safe % 1000) / 10)
	return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(milliseconds)}`
}

function parseDateInput(value: string) {
	if (!value) return null
	const date = new Date(value)
	return Number.isNaN(date.getTime()) ? null : date
}

function parseTimestamp(value: string, unit: TimestampUnit) {
	const raw = value.trim().replace(/\s+/g, '')
	if (!raw) return { error: '请输入时间戳。', date: null, detectedUnit: null as TimestampUnit | null }
	if (!/^-?\d+(\.\d+)?$/.test(raw)) return { error: '时间戳只能包含数字、小数点或负号。', date: null, detectedUnit: null as TimestampUnit | null }

	const numeric = Number(raw)
	if (!Number.isFinite(numeric)) return { error: '时间戳超出可解析范围。', date: null, detectedUnit: null as TimestampUnit | null }

	const detectedUnit: TimestampUnit = unit === 'auto' ? (Math.abs(numeric) < 100000000000 ? 'seconds' : 'milliseconds') : unit
	const ms = detectedUnit === 'seconds' ? numeric * 1000 : numeric
	const date = new Date(ms)

	if (Number.isNaN(date.getTime())) return { error: '无法转换为有效日期。', date: null, detectedUnit }
	return { error: '', date, detectedUnit }
}

function parseDurationValue(value: string, max = 999999) {
	if (!value.trim()) return 0
	const numeric = Number(value)
	if (!Number.isFinite(numeric)) return 0
	return Math.min(max, Math.max(0, Math.trunc(numeric)))
}

function durationToMs(duration: DurationFields) {
	return (
		parseDurationValue(duration.hours, 99999) * 3600000 +
		parseDurationValue(duration.minutes, 99999) * 60000 +
		parseDurationValue(duration.seconds, 99999) * 1000
	)
}

function addDuration(date: Date, duration: DurationFields, mode: 'add' | 'subtract') {
	const result = new Date(date.getTime())
	const sign = mode === 'add' ? 1 : -1
	result.setFullYear(result.getFullYear() + sign * parseDurationValue(duration.years, 9999))
	result.setMonth(result.getMonth() + sign * parseDurationValue(duration.months, 99999))
	result.setDate(result.getDate() + sign * parseDurationValue(duration.days, 999999))
	result.setHours(result.getHours() + sign * parseDurationValue(duration.hours, 999999))
	result.setMinutes(result.getMinutes() + sign * parseDurationValue(duration.minutes, 999999))
	result.setSeconds(result.getSeconds() + sign * parseDurationValue(duration.seconds, 999999))
	return result
}

function describeDuration(ms: number) {
	const sign = ms < 0 ? '-' : ''
	let rest = Math.abs(Math.floor(ms / 1000))
	const days = Math.floor(rest / 86400)
	rest %= 86400
	const hours = Math.floor(rest / 3600)
	rest %= 3600
	const minutes = Math.floor(rest / 60)
	const seconds = rest % 60
	return {
		sign,
		days,
		hours,
		minutes,
		seconds,
		text: `${sign}${days} 天 ${hours} 小时 ${minutes} 分 ${seconds} 秒`
	}
}

function getTimeZoneParts(timeZone: string, timestamp: number) {
	const formatter = new Intl.DateTimeFormat('en-US', {
		timeZone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hourCycle: 'h23'
	})
	const parts = Object.fromEntries(formatter.formatToParts(new Date(timestamp)).map(part => [part.type, part.value]))
	return {
		year: Number(parts.year),
		month: Number(parts.month),
		day: Number(parts.day),
		hour: Number(parts.hour),
		minute: Number(parts.minute),
		second: Number(parts.second)
	}
}

function getTimeZoneOffsetMs(timeZone: string, timestamp: number) {
	const parts = getTimeZoneParts(timeZone, timestamp)
	const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
	return asUtc - timestamp
}

function parseDateTimeParts(value: string) {
	const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/)
	if (!match) return null
	return {
		year: Number(match[1]),
		month: Number(match[2]),
		day: Number(match[3]),
		hour: Number(match[4]),
		minute: Number(match[5]),
		second: Number(match[6] || 0)
	}
}

function zonedDateTimeToTimestamp(value: string, timeZone: string) {
	const parts = parseDateTimeParts(value)
	if (!parts) return null
	const utcGuess = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
	let timestamp = utcGuess - getTimeZoneOffsetMs(timeZone, utcGuess)
	const refined = utcGuess - getTimeZoneOffsetMs(timeZone, timestamp)
	if (Math.abs(refined - timestamp) > 1000) timestamp = refined
	const date = new Date(timestamp)
	return Number.isNaN(date.getTime()) ? null : timestamp
}

function formatInZone(timestamp: number, timeZone: string) {
	return new Intl.DateTimeFormat('zh-CN', {
		timeZone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hourCycle: 'h23'
	}).format(new Date(timestamp))
}

function setDurationField(duration: DurationFields, key: keyof DurationFields, value: string): DurationFields {
	const cleaned = value.replace(/[^\d]/g, '').replace(/^0+(\d)/, '$1')
	return { ...duration, [key]: cleaned || '0' }
}

export default function ClockPage() {
	const [activeTab, setActiveTab] = useState<ToolTab>('timer')
	const [now, setNow] = useState<Date | null>(null)
	const [copiedId, setCopiedId] = useState<string | null>(null)
	const [timestampInput, setTimestampInput] = useState('')
	const [timestampUnit, setTimestampUnit] = useState<TimestampUnit>('auto')
	const [dateInput, setDateInput] = useState('')
	const [diffStart, setDiffStart] = useState('')
	const [diffEnd, setDiffEnd] = useState('')
	const [offsetBase, setOffsetBase] = useState('')
	const [offsetMode, setOffsetMode] = useState<'add' | 'subtract'>('add')
	const [offsetDuration, setOffsetDuration] = useState<DurationFields>(emptyDuration)
	const [zoneDateTime, setZoneDateTime] = useState('')
	const [localTimeZone, setLocalTimeZone] = useState(DEFAULT_TIME_ZONE)
	const [sourceZone, setSourceZone] = useState(DEFAULT_TIME_ZONE)
	const [targetZone, setTargetZone] = useState('UTC')
	const [timerMode, setTimerMode] = useState<TimerMode>('stopwatch')
	const [timerRunning, setTimerRunning] = useState(false)
	const [stopwatchMs, setStopwatchMs] = useState(0)
	const [countdownMs, setCountdownMs] = useState(0)
	const [countdownInput, setCountdownInput] = useState<DurationFields>({ ...emptyDuration, minutes: '25' })
	const rafRef = useRef<number | null>(null)

	useEffect(() => {
		const current = new Date()
		const currentInput = formatDateTimeInput(current)
		const detectedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIME_ZONE
		setNow(current)
		setLocalTimeZone(detectedTimeZone)
		setSourceZone(current => (current === DEFAULT_TIME_ZONE ? detectedTimeZone : current))
		setTimestampInput(String(Math.floor(current.getTime() / 1000)))
		setDateInput(currentInput)
		setDiffStart(currentInput)
		setDiffEnd(formatDateTimeInput(new Date(current.getTime() + 86400000)))
		setOffsetBase(currentInput)
		setZoneDateTime(currentInput)

		const interval = window.setInterval(() => setNow(new Date()), 500)
		return () => window.clearInterval(interval)
	}, [])

	useEffect(() => {
		if (!timerRunning) return
		const start = performance.now()
		const base = timerMode === 'stopwatch' ? stopwatchMs : countdownMs

		const tick = () => {
			const elapsed = performance.now() - start
			if (timerMode === 'stopwatch') {
				setStopwatchMs(base + elapsed)
				rafRef.current = requestAnimationFrame(tick)
				return
			}

			const remaining = base - elapsed
			if (remaining <= 0) {
				setCountdownMs(0)
				setTimerRunning(false)
				return
			}
			setCountdownMs(remaining)
			rafRef.current = requestAnimationFrame(tick)
		}

		rafRef.current = requestAnimationFrame(tick)
		return () => {
			if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
		}
	}, [timerRunning, timerMode])

	const timestampResult = useMemo(() => parseTimestamp(timestampInput, timestampUnit), [timestampInput, timestampUnit])
	const parsedDate = useMemo(() => parseDateInput(dateInput), [dateInput])
	const diffStartDate = useMemo(() => parseDateInput(diffStart), [diffStart])
	const diffEndDate = useMemo(() => parseDateInput(diffEnd), [diffEnd])
	const offsetBaseDate = useMemo(() => parseDateInput(offsetBase), [offsetBase])
	const offsetResult = useMemo(() => (offsetBaseDate ? addDuration(offsetBaseDate, offsetDuration, offsetMode) : null), [offsetBaseDate, offsetDuration, offsetMode])
	const zoneTimestamp = useMemo(() => (zoneDateTime ? zonedDateTimeToTimestamp(zoneDateTime, sourceZone) : null), [zoneDateTime, sourceZone])
	const diffResult = diffStartDate && diffEndDate ? describeDuration(diffEndDate.getTime() - diffStartDate.getTime()) : null
	const countdownInputMs = durationToMs(countdownInput)
	const canStartTimer = timerMode === 'stopwatch' || countdownMs > 0 || countdownInputMs > 0
	const timeZones = useMemo(() => Array.from(new Set([localTimeZone, ...COMMON_TIME_ZONES])), [localTimeZone])

	const copyText = async (text: string, id: string) => {
		if (!text) return
		try {
			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(text)
			} else {
				const textarea = document.createElement('textarea')
				textarea.value = text
				textarea.style.position = 'fixed'
				textarea.style.opacity = '0'
				document.body.appendChild(textarea)
				textarea.select()
				document.execCommand('copy')
				textarea.remove()
			}
			setCopiedId(id)
			window.setTimeout(() => setCopiedId(current => (current === id ? null : current)), 1500)
		} catch (error) {
			console.error('Failed to copy:', error)
		}
	}

	const setAllToNow = () => {
		const current = new Date()
		const input = formatDateTimeInput(current)
		setTimestampInput(String(Math.floor(current.getTime() / 1000)))
		setDateInput(input)
		setDiffStart(input)
		setOffsetBase(input)
		setZoneDateTime(input)
	}

	const toggleTimer = () => {
		if (timerRunning) {
			setTimerRunning(false)
			return
		}
		if (timerMode === 'countdown' && countdownMs <= 0) {
			if (countdownInputMs <= 0) return
			setCountdownMs(countdownInputMs)
		}
		setTimerRunning(true)
	}

	const resetTimer = () => {
		setTimerRunning(false)
		setStopwatchMs(0)
		setCountdownMs(0)
	}

	return (
		<div className='relative px-6 pt-28 pb-12 text-sm max-sm:px-4 max-sm:pt-24'>
			<div className='mx-auto flex w-full max-w-5xl flex-col gap-6'>
				<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className='text-center'>
					<h1 className='text-3xl font-semibold'>时间工具</h1>
					<p className='text-secondary mt-3'>时间戳、日期差、时区换算、倒计时集中处理</p>
				</motion.div>

				<motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className='card relative mx-auto flex w-full max-w-4xl flex-wrap justify-center gap-2 p-2'>
					{tabs.map(item => {
						const Icon = item.icon
						return (
							<button
								key={item.value}
								type='button'
								onClick={() => setActiveTab(item.value)}
								className={cn(
									'btn-rounded flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
									activeTab === item.value ? 'bg-brand text-white shadow-sm' : 'text-secondary hover:text-brand hover:bg-white/70'
								)}>
								<Icon className='h-4 w-4' />
								{item.label}
							</button>
						)
					})}
				</motion.div>

				{activeTab === 'now' && (
					<div className='mx-auto w-full max-w-2xl'>
						<ToolCard title='当前时间' icon={Clock3} className='p-5'>
							<div className='grid gap-3 sm:grid-cols-2'>
								<OutputRow label='本地时间' value={now ? formatLocal(now) : '获取中'} copyId='now-local' copiedId={copiedId} onCopy={copyText} />
								<OutputRow label='UTC 时间' value={now ? formatUtc(now) : '获取中'} copyId='now-utc' copiedId={copiedId} onCopy={copyText} />
								<OutputRow label='Unix 秒' value={now ? String(Math.floor(now.getTime() / 1000)) : '获取中'} copyId='now-seconds' copiedId={copiedId} onCopy={copyText} />
								<OutputRow label='Unix 毫秒' value={now ? String(now.getTime()) : '获取中'} copyId='now-ms' copiedId={copiedId} onCopy={copyText} />
								<OutputRow label='ISO 8601' value={now ? now.toISOString() : '获取中'} copyId='now-iso' copiedId={copiedId} onCopy={copyText} />
								<OutputRow label='当前时区' value={localTimeZone} copyId='now-zone' copiedId={copiedId} onCopy={copyText} />
							</div>
							<div className='mt-4 flex flex-wrap gap-2'>
								<ActionButton onClick={setAllToNow}>填入当前时间</ActionButton>
							</div>
						</ToolCard>
					</div>
				)}

				{activeTab === 'timestamp' && (
					<div className='mx-auto grid w-full max-w-4xl gap-5 lg:grid-cols-2'>
						<ToolCard title='时间戳转日期' icon={ArrowRightLeft}>
							<div className='grid gap-4'>
								<Field label='时间戳'>
									<input
										value={timestampInput}
										onChange={event => setTimestampInput(event.target.value)}
										inputMode='decimal'
										className='w-full rounded-2xl border bg-white/60 px-4 py-3 font-mono text-sm'
										placeholder='例如 1764567890 或 1764567890000'
									/>
								</Field>
								<Field label='单位'>
									<div className='flex flex-wrap gap-2'>
										{[
											['auto', '自动识别'],
											['seconds', '秒'],
											['milliseconds', '毫秒']
										].map(([value, label]) => (
											<button
												key={value}
												type='button'
												onClick={() => setTimestampUnit(value as TimestampUnit)}
												className={cn(
													'btn-rounded px-4 py-2 text-sm font-medium transition-colors',
													timestampUnit === value ? 'bg-brand text-white' : 'bg-white/60 text-secondary hover:text-brand'
												)}>
												{label}
											</button>
										))}
									</div>
								</Field>
								{timestampResult.error && <ErrorText>{timestampResult.error}</ErrorText>}
							</div>
							<div className='mt-5 grid gap-3'>
								<OutputRow
									label='识别单位'
									value={timestampResult.detectedUnit === 'milliseconds' ? '毫秒' : timestampResult.detectedUnit === 'seconds' ? '秒' : '-'}
								/>
								<OutputRow
									label='本地时间'
									value={timestampResult.date ? formatLocal(timestampResult.date) : '-'}
									copyId='timestamp-local'
									copiedId={copiedId}
									onCopy={copyText}
								/>
								<OutputRow label='UTC 时间' value={timestampResult.date ? formatUtc(timestampResult.date) : '-'} copyId='timestamp-utc' copiedId={copiedId} onCopy={copyText} />
								<OutputRow label='ISO 8601' value={timestampResult.date ? timestampResult.date.toISOString() : '-'} copyId='timestamp-iso' copiedId={copiedId} onCopy={copyText} />
							</div>
						</ToolCard>

						<ToolCard title='日期转时间戳' icon={CalendarDays}>
							<Field label='本地日期时间'>
								<DateTimePicker value={dateInput} onChange={setDateInput} />
							</Field>
							{!parsedDate && <ErrorText>请选择有效日期时间。</ErrorText>}
							<div className='mt-5 grid gap-3'>
								<OutputRow label='Unix 秒' value={parsedDate ? String(Math.floor(parsedDate.getTime() / 1000)) : '-'} copyId='date-seconds' copiedId={copiedId} onCopy={copyText} />
								<OutputRow label='Unix 毫秒' value={parsedDate ? String(parsedDate.getTime()) : '-'} copyId='date-ms' copiedId={copiedId} onCopy={copyText} />
								<OutputRow label='UTC 时间' value={parsedDate ? formatUtc(parsedDate) : '-'} copyId='date-utc' copiedId={copiedId} onCopy={copyText} />
							</div>
							<div className='mt-4'>
								<ActionButton onClick={() => setDateInput(formatDateTimeInput(new Date()))}>使用当前时间</ActionButton>
							</div>
						</ToolCard>
					</div>
				)}

				{activeTab === 'diff' && (
					<div className='mx-auto w-full max-w-3xl'>
					<ToolCard title='日期差计算' icon={Calculator}>
						<div className='grid gap-4 md:grid-cols-2'>
							<Field label='开始时间'>
								<DateTimePicker value={diffStart} onChange={setDiffStart} />
							</Field>
							<Field label='结束时间'>
								<DateTimePicker value={diffEnd} onChange={setDiffEnd} />
							</Field>
						</div>
						{(!diffStartDate || !diffEndDate) && <ErrorText>开始和结束时间都需要有效。</ErrorText>}
						<div className='mt-5 grid gap-3 md:grid-cols-2'>
							<OutputRow label='相差' value={diffResult?.text ?? '-'} copyId='diff-text' copiedId={copiedId} onCopy={copyText} />
							<OutputRow label='总天数' value={diffStartDate && diffEndDate ? `${((diffEndDate.getTime() - diffStartDate.getTime()) / 86400000).toFixed(6)} 天` : '-'} />
							<OutputRow label='总小时' value={diffStartDate && diffEndDate ? `${((diffEndDate.getTime() - diffStartDate.getTime()) / 3600000).toFixed(4)} 小时` : '-'} />
							<OutputRow label='总秒数' value={diffStartDate && diffEndDate ? `${Math.trunc((diffEndDate.getTime() - diffStartDate.getTime()) / 1000)} 秒` : '-'} />
						</div>
						<div className='mt-4 flex flex-wrap gap-2'>
							<ActionButton onClick={() => setDiffStart(formatDateTimeInput(new Date()))}>开始设为现在</ActionButton>
							<ActionButton onClick={() => setDiffEnd(formatDateTimeInput(new Date()))}>结束设为现在</ActionButton>
							<ActionButton
								onClick={() => {
									setDiffStart(diffEnd)
									setDiffEnd(diffStart)
								}}>
								交换
							</ActionButton>
						</div>
					</ToolCard>
					</div>
				)}

				{activeTab === 'offset' && (
					<div className='mx-auto w-full max-w-2xl'>
						<ToolCard title='日期加减' icon={CalendarDays}>
							<div className='grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end'>
								<Field label='基准时间'>
									<DateTimePicker value={offsetBase} onChange={setOffsetBase} />
								</Field>
								<Field label='运算'>
									<div className='grid grid-cols-2 gap-1 rounded-2xl border bg-white/40 p-1'>
										<button
											type='button'
											onClick={() => setOffsetMode('add')}
											className={cn('btn-rounded h-11 min-w-14 px-4 font-medium', offsetMode === 'add' ? 'bg-brand text-white' : 'text-secondary hover:bg-white/70')}>
											加
										</button>
										<button
											type='button'
											onClick={() => setOffsetMode('subtract')}
											className={cn('btn-rounded h-11 min-w-14 px-4 font-medium', offsetMode === 'subtract' ? 'bg-brand text-white' : 'text-secondary hover:bg-white/70')}>
											减
										</button>
									</div>
								</Field>
							</div>

							<div className='mt-5 rounded-[28px] border bg-white/30 p-4'>
								<div className='grid grid-cols-3 gap-3'>
									{(['years', 'months', 'days', 'hours', 'minutes', 'seconds'] as (keyof DurationFields)[]).map(key => (
										<Field key={key} label={{ years: '年', months: '月', days: '日', hours: '时', minutes: '分', seconds: '秒' }[key]}>
											<input
												value={offsetDuration[key]}
												onChange={event => setOffsetDuration(current => setDurationField(current, key, event.target.value))}
												inputMode='numeric'
												className='no-spinner w-full rounded-2xl border bg-white/70 px-3 py-3 text-center font-mono text-sm'
											/>
										</Field>
									))}
								</div>
							</div>

							{!offsetBaseDate && <ErrorText>请选择有效的基准时间。</ErrorText>}
							<div className='mt-5 grid gap-3 sm:grid-cols-2'>
								<OutputRow label='计算结果' value={offsetResult ? formatLocal(offsetResult) : '-'} copyId='offset-local' copiedId={copiedId} onCopy={copyText} />
								<OutputRow label='结果时间戳' value={offsetResult ? String(offsetResult.getTime()) : '-'} copyId='offset-ms' copiedId={copiedId} onCopy={copyText} />
							</div>
							<div className='mt-4 flex flex-wrap justify-end gap-2'>
								<ActionButton onClick={() => setOffsetBase(formatDateTimeInput(new Date()))}>基准设为现在</ActionButton>
								<ActionButton onClick={() => setOffsetDuration(emptyDuration)}>清零</ActionButton>
							</div>
						</ToolCard>
					</div>
				)}

				{activeTab === 'timezone' && (
					<div className='mx-auto w-full max-w-2xl'>
						<ToolCard title='时区换算' icon={Globe2}>
							<div className='grid gap-4'>
								<Field label='源时间'>
									<DateTimePicker value={zoneDateTime} onChange={setZoneDateTime} />
								</Field>
								<div className='grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end'>
									<Field label='源时区'>
										<TimeZoneSelect value={sourceZone} zones={timeZones} onChange={setSourceZone} />
									</Field>
									<button
										type='button'
										onClick={() => {
											setSourceZone(targetZone)
											setTargetZone(sourceZone)
										}}
										className='btn-rounded flex h-11 items-center justify-center gap-2 border bg-white/60 px-4 text-sm font-medium text-secondary transition hover:text-brand sm:mb-0'>
										<ArrowRightLeft className='h-4 w-4' />
										交换
									</button>
									<Field label='目标时区'>
										<TimeZoneSelect value={targetZone} zones={timeZones} onChange={setTargetZone} />
									</Field>
								</div>
							</div>

							{zoneTimestamp === null && <ErrorText>请选择有效的源时间。</ErrorText>}
							<div className='mt-5 grid gap-3'>
								<OutputRow label='目标时间' value={zoneTimestamp !== null ? formatInZone(zoneTimestamp, targetZone) : '-'} copyId='zone-target' copiedId={copiedId} onCopy={copyText} />
								<div className='grid gap-3 sm:grid-cols-2'>
									<OutputRow label='UTC 时间' value={zoneTimestamp !== null ? formatUtc(new Date(zoneTimestamp)) : '-'} copyId='zone-utc' copiedId={copiedId} onCopy={copyText} />
									<OutputRow label='Unix 毫秒' value={zoneTimestamp !== null ? String(zoneTimestamp) : '-'} copyId='zone-ms' copiedId={copiedId} onCopy={copyText} />
								</div>
							</div>
							<div className='mt-4 flex justify-end'>
								<ActionButton onClick={() => setZoneDateTime(formatDateTimeInput(new Date()))}>源时间设为现在</ActionButton>
							</div>
						</ToolCard>
					</div>
				)}

				{activeTab === 'timer' && (
					<div className='mx-auto w-full max-w-2xl'>
					<ToolCard title='秒表 / 倒计时' icon={TimerReset}>
						<div className='flex flex-wrap justify-center gap-2'>
							<button type='button' onClick={() => setTimerMode('stopwatch')} className={cn('btn-rounded px-4 py-2 font-medium', timerMode === 'stopwatch' ? 'bg-brand text-white' : 'bg-white/60 text-secondary')}>
								秒表
							</button>
							<button type='button' onClick={() => setTimerMode('countdown')} className={cn('btn-rounded px-4 py-2 font-medium', timerMode === 'countdown' ? 'bg-brand text-white' : 'bg-white/60 text-secondary')}>
								倒计时
							</button>
						</div>
						<div className='my-8 text-center font-mono text-5xl font-semibold tracking-normal max-sm:text-3xl'>
							{timerMode === 'stopwatch' ? formatTimer(stopwatchMs) : formatTimer(countdownMs > 0 ? countdownMs : countdownInputMs)}
						</div>
						{timerMode === 'countdown' && (
							<div className='mx-auto grid max-w-xl grid-cols-3 gap-3'>
								{timerInputFields.map(({ key, label }) => (
									<Field key={key} label={label}>
										<input
											value={countdownInput[key]}
											disabled={timerRunning}
											onChange={event => setCountdownInput(current => setDurationField(current, key, event.target.value))}
											inputMode='numeric'
											className='no-spinner w-full rounded-2xl border bg-white/60 px-3 py-3 text-center font-mono text-sm disabled:opacity-60'
										/>
									</Field>
								))}
							</div>
						)}
						<div className='mt-6 flex justify-center gap-3'>
							<button
								type='button'
								onClick={toggleTimer}
								disabled={!canStartTimer}
								className='bg-brand btn-rounded flex h-14 min-w-28 items-center justify-center gap-2 px-5 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50'>
								{timerRunning ? <Pause className='h-5 w-5' /> : <Play className='h-5 w-5' />}
								{timerRunning ? '暂停' : '开始'}
							</button>
							<button type='button' onClick={resetTimer} className='btn-rounded flex h-14 min-w-28 items-center justify-center gap-2 border bg-white/60 px-5 font-medium'>
								<RotateCcw className='h-5 w-5' />
								重置
							</button>
						</div>
						{timerMode === 'countdown' && countdownInputMs <= 0 && countdownMs <= 0 && <ErrorText>倒计时时长需要大于 0。</ErrorText>}
					</ToolCard>
					</div>
				)}
			</div>
		</div>
	)
}

function DateTimePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
	const wrapperRef = useRef<HTMLDivElement>(null)
	const parsed = parseDateInput(value)
	const selected = parsed ?? new Date()
	const selectedYear = selected.getFullYear()
	const selectedMonth = selected.getMonth()
	const [open, setOpen] = useState(false)
	const [viewMonth, setViewMonth] = useState(() => new Date(selectedYear, selectedMonth, 1))

	useEffect(() => {
		if (!open) return
		setViewMonth(new Date(selectedYear, selectedMonth, 1))
	}, [open, selectedYear, selectedMonth])

	useEffect(() => {
		if (!open) return
		const handlePointerDown = (event: PointerEvent) => {
			if (!wrapperRef.current?.contains(event.target as Node)) {
				setOpen(false)
			}
		}
		document.addEventListener('pointerdown', handlePointerDown)
		return () => document.removeEventListener('pointerdown', handlePointerDown)
	}, [open])

	const commit = (next: Date) => {
		onChange(formatDateTimeInput(next))
	}

	const days = useMemo(() => {
		const start = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1)
		const mondayOffset = (start.getDay() + 6) % 7
		const gridStart = new Date(start)
		gridStart.setDate(start.getDate() - mondayOffset)
		return Array.from({ length: 42 }, (_, index) => {
			const day = new Date(gridStart)
			day.setDate(gridStart.getDate() + index)
			return day
		})
	}, [viewMonth])

	const updateDay = (day: Date) => {
		const next = new Date(selected)
		next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate())
		commit(next)
	}

	const updateTime = (part: 'hours' | 'minutes' | 'seconds', nextValue: number) => {
		const next = new Date(selected)
		if (part === 'hours') next.setHours(nextValue)
		if (part === 'minutes') next.setMinutes(nextValue)
		if (part === 'seconds') next.setSeconds(nextValue)
		commit(next)
	}

	const selectedKey = parsed ? formatDateKey(parsed) : ''
	const todayKey = formatDateKey(new Date())

	return (
		<div ref={wrapperRef} className='relative'>
			<button
				type='button'
				onClick={() => setOpen(current => !current)}
				className={cn(
					'btn-rounded flex w-full items-center justify-between gap-3 border bg-white/60 px-4 py-3 text-left text-sm transition hover:bg-white/80',
					!parsed && 'text-secondary'
				)}>
				<span className='font-mono tracking-normal'>{parsed ? formatLocal(parsed) : '请选择日期时间'}</span>
				<CalendarDays className='text-brand h-4 w-4 shrink-0' />
			</button>

			{open && (
				<div className='absolute right-0 z-40 mt-2 w-[min(560px,calc(100vw-2rem))] rounded-[32px] border bg-card p-4 shadow-lg backdrop-blur-sm max-sm:left-1/2 max-sm:right-auto max-sm:-translate-x-1/2'>
					<div className='grid gap-4 md:grid-cols-[1fr_auto]'>
						<div>
							<div className='mb-3 flex items-center justify-between'>
								<button
									type='button'
									onClick={() => setViewMonth(current => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
									className='btn-rounded flex h-9 w-9 items-center justify-center border bg-white/60 text-secondary hover:text-brand'>
									<ChevronLeft className='h-4 w-4' />
								</button>
								<div className='font-medium'>{viewMonth.getFullYear()}年 {viewMonth.getMonth() + 1}月</div>
								<button
									type='button'
									onClick={() => setViewMonth(current => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
									className='btn-rounded flex h-9 w-9 items-center justify-center border bg-white/60 text-secondary hover:text-brand'>
									<ChevronRight className='h-4 w-4' />
								</button>
							</div>
							<div className='grid grid-cols-7 gap-1 text-center text-xs text-secondary'>
								{['一', '二', '三', '四', '五', '六', '日'].map(item => (
									<div key={item} className='py-1'>
										{item}
									</div>
								))}
							</div>
							<div className='mt-1 grid grid-cols-7 gap-1'>
								{days.map(day => {
									const key = formatDateKey(day)
									const inMonth = day.getMonth() === viewMonth.getMonth()
									const isSelected = key === selectedKey
									const isToday = key === todayKey
									return (
										<button
											key={key}
											type='button'
											onClick={() => updateDay(day)}
											className={cn(
												'btn-rounded h-9 text-sm transition-colors',
												inMonth ? 'text-primary' : 'text-secondary/40',
												isSelected ? 'bg-brand text-white shadow-sm' : 'hover:bg-white/80',
												isToday && !isSelected && 'text-brand font-semibold'
											)}>
											{day.getDate()}
										</button>
									)
								})}
							</div>
							<div className='mt-3 flex flex-wrap gap-2'>
								<ActionButton onClick={() => commit(new Date())}>现在</ActionButton>
								<ActionButton
									onClick={() => {
										const next = new Date()
										next.setHours(selected.getHours(), selected.getMinutes(), selected.getSeconds(), 0)
										commit(next)
									}}>
									今天
								</ActionButton>
							</div>
						</div>

						<div className='rounded-3xl border bg-white/40 p-3'>
							<div className='mb-2 grid grid-cols-3 gap-2 text-center text-xs text-secondary'>
								<span>时</span>
								<span>分</span>
								<span>秒</span>
							</div>
							<div className='grid grid-cols-3 gap-2'>
								<TimeColumn max={23} value={selected.getHours()} onChange={next => updateTime('hours', next)} />
								<TimeColumn max={59} value={selected.getMinutes()} onChange={next => updateTime('minutes', next)} />
								<TimeColumn max={59} value={selected.getSeconds()} onChange={next => updateTime('seconds', next)} />
							</div>
						</div>
					</div>
					<div className='mt-4 flex justify-end'>
						<button type='button' onClick={() => setOpen(false)} className='brand-btn justify-center px-5'>
							完成
						</button>
					</div>
				</div>
			)}
		</div>
	)
}

function TimeColumn({ max, value, onChange }: { max: number; value: number; onChange: (value: number) => void }) {
	const ref = useRef<HTMLDivElement>(null)
	const timerRef = useRef<number | null>(null)
	const itemHeight = 36
	const fadeMask = 'linear-gradient(to bottom, transparent, black 24%, black 76%, transparent)'

	useEffect(() => {
		ref.current?.scrollTo({ top: value * itemHeight, behavior: 'smooth' })
	}, [value])

	const handleScroll = () => {
		if (timerRef.current !== null) window.clearTimeout(timerRef.current)
		timerRef.current = window.setTimeout(() => {
			const next = Math.max(0, Math.min(max, Math.round((ref.current?.scrollTop ?? 0) / itemHeight)))
			if (next !== value) onChange(next)
		}, 100)
	}

	return (
		<div className='relative h-40 w-16 overflow-hidden rounded-2xl border bg-white/60'>
			<div className='pointer-events-none absolute inset-x-2 top-1/2 z-10 h-9 -translate-y-1/2 rounded-xl border border-brand/20 bg-brand/10' />
			<div
				ref={ref}
				onScroll={handleScroll}
				className='scrollbar-none h-full snap-y snap-mandatory overflow-y-auto py-[62px]'
				style={{ maskImage: fadeMask, WebkitMaskImage: fadeMask }}>
				{Array.from({ length: max + 1 }, (_, index) => (
					<button
						key={index}
						type='button'
						onClick={() => onChange(index)}
						className={cn('relative z-20 flex h-9 w-full snap-center items-center justify-center font-mono text-sm transition', value === index ? 'text-brand font-semibold' : 'text-secondary')}>
						{pad(index)}
					</button>
				))}
			</div>
		</div>
	)
}

function ToolCard({ title, icon: Icon, className, children }: { title: string; icon: LucideIcon; className?: string; children: ReactNode }) {
	return (
		<motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={cn('card relative', className)}>
			<div className='mb-5 flex items-center gap-3'>
				<div className='bg-brand/10 text-brand flex h-10 w-10 items-center justify-center rounded-full'>
					<Icon className='h-5 w-5' />
				</div>
				<h2 className='text-lg font-semibold'>{title}</h2>
			</div>
			{children}
		</motion.section>
	)
}

function Field({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div className='block'>
			<span className='text-secondary mb-2 block text-xs font-medium'>{label}</span>
			{children}
		</div>
	)
}

function OutputRow({ label, value, copyId, copiedId, onCopy }: { label: string; value: string; copyId?: string; copiedId?: string | null; onCopy?: (text: string, id: string) => void }) {
	const canCopy = !!copyId && !!onCopy && value !== '-' && value !== '获取中'
	const copied = copiedId === copyId
	return (
		<div className='flex min-h-14 items-center justify-between gap-3 rounded-2xl border bg-white/50 px-4 py-3'>
			<div className='min-w-0'>
				<p className='text-secondary text-xs'>{label}</p>
				<p className='truncate font-mono text-sm tracking-normal'>{value}</p>
			</div>
			{copyId && onCopy && (
				<button
					type='button'
					disabled={!canCopy}
					onClick={() => onCopy(value, copyId)}
					className='btn-rounded flex h-9 w-9 shrink-0 items-center justify-center border bg-white/60 text-secondary transition hover:text-brand disabled:cursor-not-allowed disabled:opacity-40'
					aria-label={`复制${label}`}>
					{copied ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
				</button>
			)}
		</div>
	)
}

function TimeZoneSelect({ value, zones, onChange }: { value: string; zones: string[]; onChange: (value: string) => void }) {
	return (
		<select value={value} onChange={event => onChange(event.target.value)} className='w-full rounded-2xl border bg-white/60 px-4 py-3 text-sm'>
			{zones.map(zone => (
				<option key={zone} value={zone}>
					{zone}
				</option>
			))}
		</select>
	)
}

function ActionButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
	return (
		<button type='button' onClick={onClick} className='btn-rounded border bg-white/60 px-4 py-2 text-sm font-medium text-secondary transition hover:text-brand'>
			{children}
		</button>
	)
}

function ErrorText({ children }: { children: ReactNode }) {
	return <p className='mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500'>{children}</p>
}
