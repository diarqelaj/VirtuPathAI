'use client'

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  CSSProperties,
} from 'react'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import './hide-scrollbar.css'

// your emoji JSON groups (filenames)
const GROUP_FILES = [
  'activities',
  'animals_&_nature',
  'component',
  'flags',
  'food_&_drink',
  'objects',
  'people_&_body',
  'smileys_&_emotion',
  'symbols',
  'travel_&_places',
]

// force these two first in the tab bar & listing
const DISPLAY_ORDER = [
  'smileys_&_emotion',
  'people_&_body',
  ...GROUP_FILES.filter(
    (g) => !['smileys_&_emotion', 'people_&_body'].includes(g)
  ),
]

// Fitzpatrick skin-tone modifiers
const FITZ_MODS = [
  '\u{1F3FB}', // light
  '\u{1F3FC}', // medium-light
  '\u{1F3FD}', // medium
  '\u{1F3FE}', // medium-dark
  '\u{1F3FF}', // dark
]

// detect if an emoji should show skin-tone variants
function isSkinnable(group: string, subgroup: string) {
  return (
    group === 'people_&_body' ||
    subgroup.startsWith('hand-') ||
    subgroup === 'hand-single-finger'
  )
}

interface Emoji {
  codepoints: string[]
  status: string
  glyph: string
  name: string
  subgroup: string
  group: string
}

interface EmojiGridProps {
  onSelect: (emoji: string) => void
  mostUsedOverride?: string[]
  width?: number
  height?: number
}

export default function EmojiGrid({
  onSelect,
  mostUsedOverride,
  width = 320,
  height = 360,
}: EmojiGridProps) {
  const [allEmojis, setAllEmojis] = useState<Emoji[]>([])
  const [search, setSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(300)
  const [showSkinPicker, setShowSkinPicker] = useState(false)
  const [skinBase, setSkinBase] = useState<Emoji | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)

  // track active tab
  const [activeTab, setActiveTab] = useState(DISPLAY_ORDER[0])

  // compute number of columns (for capping recent to one row)
  const CELL_SIZE = 40 // px (2.5rem)
  const cols = Math.floor(width / CELL_SIZE)
  const maxRecent = cols

  // load & flatten JSON + inject `group`
  useEffect(() => {
    ;(async () => {
      const modules = await Promise.all(
        GROUP_FILES.map((g) =>
          import(`@/data/emojis/${g}.json`).then((m) =>
            (m.default as Omit<Emoji, 'group'>[]).map((e) => ({
              ...e,
              group: g,
            }))
          )
        )
      )
      setAllEmojis(modules.flat())
    })()
  }, [])

  // filter on name or glyph
  const filtered = useMemo(() => {
    if (!search.trim()) return allEmojis
    const lc = search.toLowerCase()
    return allEmojis.filter(
      (e) => e.name.toLowerCase().includes(lc) || e.glyph === search
    )
  }, [allEmojis, search])

  // infinite-scroll “load more”
  const onScroll = useCallback(() => {
    const c = containerRef.current
    if (!c) return
    if (c.scrollTop + c.clientHeight >= c.scrollHeight - 100) {
      setVisibleCount((v) => Math.min(v + 300, filtered.length))
    }
  }, [filtered.length])

  useEffect(() => {
    const c = containerRef.current
    c?.addEventListener('scroll', onScroll)
    return () => c?.removeEventListener('scroll', onScroll)
  }, [onScroll])

  // most-used emojis
  const mostUsed: string[] = useMemo(() => {
    if (mostUsedOverride) return mostUsedOverride
    try {
      return JSON.parse(localStorage.getItem('emoji-used') || '[]')
    } catch {
      return []
    }
  }, [mostUsedOverride])

  // track & call onSelect
  function pick(glyph: string) {
    try {
      const prev = JSON.parse(localStorage.getItem('emoji-used') || '[]')
      const updated = [glyph, ...prev.filter((g: string) => g !== glyph)].slice(
        0,
        20
      )
      localStorage.setItem('emoji-used', JSON.stringify(updated))
    } catch {}
    onSelect(glyph)
  }

  // group filtered emojis by their filename-group
  const byGroup = useMemo(() => {
    const map: Record<string, Emoji[]> = {}
    filtered.forEach((e) => {
      ;(map[e.group] ??= []).push(e)
    })
    return map
  }, [filtered])

  // scroll tabs by delta
  const scrollTabsBy = (delta: number) => {
    if (!tabsRef.current) return
    tabsRef.current.scrollBy({ left: delta, behavior: 'smooth' })
  }

  // handle tab click
  const onTabClick = (grp: string) => {
    setActiveTab(grp)
    document
      .getElementById(`emoji-sec-${grp}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const rootStyle: CSSProperties = { width, height }

  return (
    <div
      className="flex flex-col bg-black-100 rounded-2xl border-white/10 shadow-[0_0_10px_2px_rgba(255,255,255,0.1)] p-4"
      style={rootStyle}
    >
      {/* Search bar */}
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setVisibleCount(300)
        }}
        placeholder="Search emojis…"
        className="mb-4 px-2 py-1 bg-black-100 border border-white/10 rounded-xl text-white focus:outline-none"
      />

      {/* Tabs + chevrons */}
      <div className="relative flex items-center mb-2">
        <button
          onClick={() => scrollTabsBy(-width * 0.5)}
          className="absolute left-0 z-10 p-1 bg-black-200 hover:bg-black-300 rounded-full"
        >
          <HiChevronLeft className="text-white text-xl" />
        </button>

        <div
          ref={tabsRef}
          className="flex-1 flex gap-2 hide-scrollbar px-10"
        >
          {DISPLAY_ORDER.map((grp) => {
            const icon = byGroup[grp]?.[0]?.glyph || '▪️'
            const isActive = grp === activeTab
            return (
              <button
                key={grp}
                onClick={() => onTabClick(grp)}
                className={`
                  flex-none p-1 border-b-2
                  ${isActive ? 'border-purple-500' : 'border-transparent'}
                  hover:bg-white/10 rounded-t
                `}
                title={grp.replace(/_/g, ' ')}
              >
                <span
                  className="text-xl"
                  style={{ opacity: isActive ? 1 : 0.4 }}
                >
                  {icon}
                </span>
              </button>
            )
          })}
        </div>

        <button
          onClick={() => scrollTabsBy(width * 0.5)}
          className="absolute right-0 z-10 p-1 bg-black-200 hover:bg-black-300 rounded-full"
        >
          <HiChevronRight className="text-white text-xl" />
        </button>
      </div>

      {/* Emoji list */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* Recent */}
        {mostUsed.length > 0 && !search && (
          <>
            <h3 className="text-sm font-semibold text-white mb-2">Recent</h3>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-1 mb-4">
              {mostUsed.slice(0, maxRecent).map((g) => (
                <button
                  key={g}
                  onClick={() => pick(g)}
                  className="bg-black-100 p-2 text-xl rounded hover:bg-white/10"
                >
                  {g}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Groups */}
        {DISPLAY_ORDER.map((groupName) => {
          const list = byGroup[groupName] || []
          if (!list.length) return null
          return (
            <section
              key={groupName}
              id={`emoji-sec-${groupName}`}
              className="mb-6 scroll-mt-8"
            >
              <h3 className="text-sm font-semibold mb-2 text-white capitalize">
                {groupName.replace(/_/g, ' ')}
              </h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-1">
                {list.slice(0, visibleCount).map((e, i) => {
                  const skinnable = isSkinnable(e.group, e.subgroup)
                  return (
                    <div key={`${e.glyph}-${i}`} className="relative">
                      <button
                        onClick={() => {
                          if (skinnable) {
                            setSkinBase(e)
                            setShowSkinPicker(true)
                          } else {
                            pick(e.glyph)
                          }
                        }}
                        className="bg-black-100 p-2 text-xl rounded hover:bg-white/10"
                      >
                        {e.glyph}
                      </button>
                      {showSkinPicker && skinBase?.glyph === e.glyph && (
                        <div className="absolute z-20 top-0 left-0 flex bg-black-100 border border-white/10 rounded shadow-lg ">
                          {FITZ_MODS.map((mod) => (
                            <button
                              key={mod}
                              className="p-1 text-xl"
                              onClick={() => {
                                pick(e.glyph + mod)
                                setShowSkinPicker(false)
                              }}
                            >
                              {e.glyph + mod}
                            </button>
                          ))}
                          <button
                            className="p-1 ml-1 text-gray-400 hover:text-white"
                            onClick={() => setShowSkinPicker(false)}
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
