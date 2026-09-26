'use client'
import { useRef } from "react"
import { useScroll, motion, useTransform, type MotionValue } from "framer-motion";

export default function Word({ value }: { value?: string }) {
    const element = useRef(null)
    const { scrollYProgress } = useScroll({
        target: element,
        offset: ["start 0.8", "start 0.1"]
    })

    const texts = value?.split(" ")

    return (
        <section className="flex items-center justify-center px-6 sm:px-12 md:px-24">
            <p
                className="text-white text-2xl sm:text-3xl md:text-4xl text-center font-medium max-w-4xl"
                style={{ fontFamily: "'Poppins', sans-serif" }}
                ref={element}
            >
                {texts?.map((text, i) => {
                    const start = i / texts.length
                    const end = start + (1 / texts.length)

                    return (
                        <Word_ key={i} range={[start, end]} progress={scrollYProgress}>
                            {text}
                        </Word_>
                    )
                })}
            </p>
        </section>
    );
}

interface WordsProps {
    children: string
    range: [number, number]
    progress: MotionValue<number>
}

const Word_ = ({ children, range, progress }: WordsProps) => {
    const opacity = useTransform(progress, range, [0, 1])
    return (
        <span className="mr-[10px] mt-[10px] inline-block relative">
            <span className="absolute opacity-[0.1]">{children}</span>
            <motion.span style={{ opacity }} >
                {children}
            </motion.span>
        </span>
    )
}