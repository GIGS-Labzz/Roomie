'use client'
import { useCallback, useEffect, useRef, useState } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import TextType from "./Texttype"
import { useWaitlist } from "@/context/waitlist"

interface RoommateProfile {
    id: number
    name: string
    image: string
    role: string
    religion: string
    location: string
    budget: string
    verified: boolean
    online: boolean
    matchPercent: number
}

const profiles: RoommateProfile[] = [
    {
        id: 1,
        name: "Tunde Adeyemi",
        image: "/profiles/profile_1.jpg",
        role: "Student",
        religion: "Christian",
        location: "Lekki, Lagos",
        budget: "₦250k/mo",
        verified: true,
        online: true,
        matchPercent: 94,
    },
    {
        id: 2,
        name: "Amina Ibrahim",
        image: "/profiles/profile_2.jpg",
        role: "Student",
        religion: "Muslim",
        location: "Wuse, Abuja",
        budget: "₦180k/mo",
        verified: true,
        online: false,
        matchPercent: 87,
    },
    {
        id: 3,
        name: "Chidi Okafor",
        image: "/profiles/profile_3.jpg",
        role: "Corper",
        religion: "Christian",
        location: "Ikeja, Lagos",
        budget: "₦150k/mo",
        verified: true,
        online: true,
        matchPercent: 91,
    },
    {
        id: 4,
        name: "Folake Balogun",
        image: "/profiles/profile_4.jpg",
        role: "Professional",
        religion: "Christian",
        location: "VI, Lagos",
        budget: "₦350k/mo",
        verified: true,
        online: false,
        matchPercent: 78,
    },
    {
        id: 5,
        name: "Emeka Nwosu",
        image: "/profiles/profile_5.jpg",
        role: "Student",
        religion: "Christian",
        location: "Bodija, Ibadan",
        budget: "₦120k/mo",
        verified: false,
        online: true,
        matchPercent: 85,
    },
    {
        id: 6,
        name: "Halima Yusuf",
        image: "/profiles/profile_6.jpg",
        role: "Corper",
        religion: "Muslim",
        location: "GRA, Port Harcourt",
        budget: "₦200k/mo",
        verified: true,
        online: true,
        matchPercent: 92,
    },
]

const testimonials = [
    { text: "My mum was so relieved I found a verified roommate through Roomie", name: "Tunde", school: "UNILAG" },
    { text: "Moved in 3 days after matching. Best decision ever.", name: "Amina", school: "Abuja" },
    { text: "No more horror stories. Roomie just works.", name: "Chidi", school: "OAU" },
    { text: "I was scared of sharing with a stranger. Roomie made it safe.", name: "Folake", school: "LASU" },
    { text: "Found someone who matches my budget AND my vibe. Unreal.", name: "Emeka", school: "UI" },
]

// Predefined tilt angles for each visible card position
const TILT_ANGLES = [-8, -3, 0, 3, 8]
const CARD_COUNT = profiles.length

function getRoleBadgeColor(role: string) {
    switch (role) {
        case "Student":
            return "bg-emerald-400/20 text-emerald-300 border-emerald-400/30"
        case "Corper":
            return "bg-amber-400/20 text-amber-300 border-amber-400/30"
        case "Professional":
            return "bg-violet-400/20 text-violet-300 border-violet-400/30"
        default:
            return "bg-white/10 text-white/70 border-white/20"
    }
}

interface ProfileCardProps {
    profile: RoommateProfile
    tilt: number
    blur: number
    scale: number
    offsetX: number
    zIndex: number
    scrollSpread: import("framer-motion").MotionValue<number>
}

function ProfileCard({ profile, tilt, blur, scale, offsetX, zIndex, scrollSpread }: ProfileCardProps) {
    const spreadX = useTransform(scrollSpread, (v) => offsetX * v)
    const spreadRotate = useTransform(scrollSpread, (v) => tilt * v)
    const spreadScale = useTransform(scrollSpread, (v) => {
        // When collapsed (v=0), all cards same size; when spread (v=1), use position scale
        return 1 - (1 - scale) * v
    })

    return (
        <motion.div
            className="absolute flex-shrink-0"
            style={{
                fontFamily: "'Poppins', sans-serif",
                zIndex,
                x: spreadX,
                rotate: spreadRotate,
                scale: spreadScale,
            }}
            animate={{
                filter: `blur(${blur}px)`,
                opacity: blur > 2 ? 0.6 : 1,
            }}
            transition={{
                type: "spring",
                stiffness: 200,
                damping: 22,
                mass: 0.4,
            }}
        >
            <div className="w-[280px] sm:w-[300px] md:w-[320px] rounded-3xl overflow-hidden bg-[#1a1a2e] border border-white/[0.08] shadow-2xl shadow-black/50">
                {/* Profile image */}
                <div className="relative mx-3 mt-1 rounded-2xl overflow-hidden aspect-[3/4]">
                    <img
                        src={profile.image}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-transparent to-transparent" />

                    {/* Verified badge — top-right of image */}
                    {profile.verified && (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/90 backdrop-blur-sm shadow-lg">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                            <span className="text-white text-[10px] font-bold tracking-wide uppercase">Verified</span>
                        </div>
                    )}

                    {/* Compatibility tag — top-left of image */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <span className="text-white/90 text-[10px] font-bold">{profile.matchPercent}% match</span>
                    </div>

                    {/* Name overlay on image */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-white font-bold text-lg tracking-tight leading-tight">
                                {profile.name}
                            </h3>
                            {/* Online indicator dot */}
                            {profile.online && (
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                            <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-semibold tracking-wide uppercase ${getRoleBadgeColor(profile.role)}`}>
                                {profile.role}
                            </div>
                            {profile.online && (
                                <span className="text-emerald-400/80 text-[10px] font-medium">Active now</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Details section */}
                <div className="px-4 pt-3 pb-4 space-y-2.5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                        </div>
                        <span className="text-white/50 text-xs font-medium">{profile.location}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                <path d="M2 17l10 5 10-5" />
                                <path d="M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <span className="text-white/50 text-xs font-medium">{profile.religion}</span>
                    </div>

                    <div className="h-px bg-white/[0.06] my-1" />

                    <div className="flex items-center justify-between">
                        <span className="text-white/30 text-[10px] font-semibold tracking-wider uppercase">Budget</span>
                        <span className="text-white/80 text-sm font-bold tracking-tight">{profile.budget}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default function Cards() {
    const { openWaitlist } = useWaitlist()
    const [activeIndex, setActiveIndex] = useState(0)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const isPaused = useRef(false)
    const sectionRef = useRef<HTMLElement>(null)

    // Scroll-driven animation
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    })

    // Cards fan-in: stacked → spread when entering, spread → stacked when leaving
    const scrollScale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.6, 1, 1, 0.6])
    const scrollOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0])
    const scrollY = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [120, 0, 0, -120])
    const scrollSpread = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 1, 1, 0])
    const scrollRotateX = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [15, 0, 0, -15])

    const advance = useCallback(() => {
        if (!isPaused.current) {
            setActiveIndex((prev) => (prev + 1) % CARD_COUNT)
        }
    }, [])

    useEffect(() => {
        intervalRef.current = setInterval(advance, 2000)
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [advance])

    const handleMouseEnter = () => {
        isPaused.current = true
    }

    const handleMouseLeave = () => {
        isPaused.current = false
    }

    // Build the 5 visible positions: [far-left, left, center, right, far-right]
    const visibleCards = []
    for (let pos = 0; pos < 5; pos++) {
        const offset = pos - 2 // -2, -1, 0, 1, 2
        const profileIndex = ((activeIndex + offset) % CARD_COUNT + CARD_COUNT) % CARD_COUNT
        const profile = profiles[profileIndex]

        const tilt = TILT_ANGLES[pos]
        const absOffset = Math.abs(offset)
        const blur = absOffset === 2 ? 4 : absOffset === 1 ? 1.5 : 0
        const scale = absOffset === 2 ? 0.82 : absOffset === 1 ? 0.92 : 1
        const spacing = 340
        const offsetX = offset * spacing

        visibleCards.push({
            key: profile.id,
            profile,
            tilt,
            blur,
            scale,
            offsetX,
            zIndex: 10 - absOffset,
        })
    }

    return (
        <section
            ref={sectionRef}
            className="relative w-full overflow-hidden py-16 sm:py-24"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <motion.div
                className="flex flex-col items-center justify-center px-6 sm:px-12 md:px-24 mb-12 sm:mb-16"
                style={{ opacity: scrollOpacity, y: scrollY }}
            >
                <h2
                    className="text-white text-2xl sm:text-3xl md:text-4xl text-center font-medium max-w-4xl"
                    style={{ fontFamily: "'Poppins', sans-serif", lineHeight: 1.75 }}
                >
                    Stop gambling on{" "}
                    <TextType
                        text={["strangers", "random flatmates", "bad roommates"]}
                        as="span"
                        typingSpeed={75}
                        pauseDuration={1500}
                        deletingSpeed={50}
                        cursorBlinkDuration={0.5}
                    />
                    <br />
                    <span className="relative inline-block font-bricolage font-bold text-3xl sm:text-4xl md:text-7xl text-red-500">
                        Find Your Person
                        <svg
                            className="absolute -bottom-1 left-0 w-full"
                            viewBox="0 0 200 12"
                            fill="none"
                            preserveAspectRatio="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M2 8.5C20 3 40 5 60 4.5C80 4 100 7 130 5C155 3.5 175 6 198 4"
                                stroke="#E07A5F"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                opacity="0.7"
                            />
                            <path
                                d="M5 10C30 6 55 8 85 6.5C115 5 145 8.5 175 6C190 5 195 7 198 6.5"
                                stroke="#E07A5F"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                opacity="0.4"
                            />
                        </svg>
                    </span>
                </h2>
                <p className="text-white/50 text-sm sm:text-base mt-4 max-w-xl text-center" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Verified roommates who actually match your lifestyle, budget, and vibe.
                </p>
            </motion.div>

            {/* Cards carousel with scroll-driven animation */}
            <motion.div
                className="relative flex items-center justify-center h-[520px] sm:h-[560px] md:h-[580px]"
                style={{
                    scale: scrollScale,
                    opacity: scrollOpacity,
                    y: scrollY,
                    rotateX: scrollRotateX,
                    perspective: 1000,
                }}
            >
                <AnimatePresence mode="popLayout">
                    {visibleCards.map((card) => (
                        <ProfileCard
                            key={card.key}
                            profile={card.profile}
                            tilt={card.tilt}
                            blur={card.blur}
                            scale={card.scale}
                            offsetX={card.offsetX}
                            zIndex={card.zIndex}
                            scrollSpread={scrollSpread}
                        />
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* CTA Block — Social proof + action */}
            <motion.div
                className="relative z-30 flex flex-col items-center justify-center mt-8 sm:mt-12 px-6"
                style={{ opacity: scrollOpacity }}
            >
                {/* Social proof counter */}
                <div className="flex items-center gap-2 mb-5">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                    </span>
                    <span className="text-white/60 text-sm font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        <span className="text-white font-bold">127</span> people joined this week
                    </span>
                </div>

                {/* CTA button */}
                <button
                    onClick={openWaitlist}
                    className="group relative inline-flex items-center gap-3 px-10 py-4 bg-[#E07A5F] hover:bg-[#d4694f] text-white font-bold text-base sm:text-lg rounded-2xl transition-all duration-200 shadow-lg shadow-[#E07A5F]/25 hover:shadow-xl hover:shadow-[#E07A5F]/30 hover:translate-y-[-2px] active:translate-y-0"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                    Find Your Roommate — It&apos;s Free
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                    </svg>
                </button>

                {/* Risk remover */}
                <p className="text-white/40 text-xs mt-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    No payment until you&apos;re both ready. No subscriptions. Ever.
                </p>
            </motion.div>

            {/* Testimonial strip */}
            <motion.div
                className="relative z-30 mt-12 sm:mt-16 overflow-hidden"
                style={{ opacity: scrollOpacity }}
            >
                <div className="flex animate-marquee gap-8 w-max">
                    {[...testimonials, ...testimonials].map((t, i) => (
                        <div
                            key={i}
                            className="flex-shrink-0 flex items-center gap-4 px-6 py-4 rounded-2xl bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm max-w-sm"
                        >
                            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                                <span className="text-white/70 text-sm font-bold">{t.name[0]}</span>
                            </div>
                            <div>
                                <p className="text-white/70 text-sm leading-snug" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                    &ldquo;{t.text}&rdquo;
                                </p>
                                <p className="text-white/30 text-[11px] mt-1 font-medium">
                                    — {t.name}, {t.school}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Subtle edge gradient overlays */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-32 sm:w-48 bg-gradient-to-r from-[#24685f] to-transparent z-20" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-32 sm:w-48 bg-gradient-to-l from-[#24685f] to-transparent z-20" />
        </section>
    )
}