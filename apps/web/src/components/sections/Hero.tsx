"use client";
import SlideCommit from '../externals/SlideCommit';

export function Hero() {
  return (
    <section
      aria-label="Roomie"
      className="fixed inset-0 z-0 h-[100svh] w-full overflow-hidden"
      style={{
        backgroundImage: "url('/Images/Hero  BG.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "contain",
      }}
    >

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pb-8 text-center">
        <span className="block font-bricolage text-2xl font-medium text-[#1A1A1A] sm:text-3xl md:text-4xl">The <span className="text-red-500 text-3xl sm:text-4xl md:text-5xl" style={{ fontFamily: "'Dancing Script', cursive" }}>Trusted</span> Solution to</span>
          <span className="font-bricolage text-[#E07A5F] font-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl">Shared Housing.</span>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#1A1A1A]/80 sm:text-xl">
          built for Nigerian students and young professionals.
        </p>
        <div className="mt-8">
          <SlideCommit
            label="Slide to Watch Demo"
            doneLabel="Done"
            errorLabel="Preview failed"
            onConfirm={() =>
              new Promise((resolve) => setTimeout(resolve, 1200))
            }
            onDone={() =>
              window.open(
                "https://youtu.be/cjbqy4a8j00?si=uYfJCYWav2tZrE3n",
                "_blank"
              )
            }
            onError={(reason) => console.log(reason)}
            trackColor="#3D9B8F"
            handleColor="#F8F4EE"
            successColor="#3D9B8F"
            dangerColor="#e5484d"
            width={280}
            height={56}
            radius={28}
            speed={50}
            returnBounce={0.38}
            landingDip={0.026}
            holdMs={1500}
            disabled={false}
          />
        </div>
      </div>
    </section>
  );
}