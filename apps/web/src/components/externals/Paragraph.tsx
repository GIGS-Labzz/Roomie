'use client'
import  {useEffect, useRef} from "react"
import { useScroll, motion } from "framer-motion";
export default function Word({ value }: { value?: string }) {
    const element =  useRef(null)
    const { scrollYProgress } = useScroll({
        target: element,
        offset: ["start 0.8", "start 0.1"]
    })

    useEffect(() => {
        scrollYProgress.on("change", e => console.log(e))
    }, [scrollYProgress])


    return (
        <section
            className="flex items-center justify-center px-6 sm:px-12 md:px-24"
        >
            <motion.p
                className="text-white text-2xl sm:text-3xl md:text-4xl text-center font-medium max-w-4xl"
                style={{ fontFamily: "'Poppins', sans-serif", lineHeight: 1.75, opacity: scrollYProgress}}
                ref={element}
            >
                {value}
            </motion.p>
        </section>
    );
}
