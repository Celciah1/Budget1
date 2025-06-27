import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6">
      {/* Outer Glowing Box */}
      <div className="w-full max-w-6xl h-[90vh] border-4 border-cyan-400 rounded-2xl p-10 shadow-[0_0_80px_rgba(0,255,255,0.4)] flex flex-col items-center justify-center">

        <h1 className="text-5xl font-bold mb-10 text-cyan-300 text-center drop-shadow-[0_0_10px_cyan]">
          Family Budget Planner
        </h1>

        {/* Image */}
        <div className="relative w-180 h-100 mb-10 rounded-xl border-4 border-cyan-400 shadow-[0_0_40px_rgba(0,255,255,0.5)]">
          <Image
            src="/family_life.jpg"
            alt="Family Budget"
            layout="fill"
            objectFit="cover"
            className="rounded-xl"
          />
        </div>

        {/* Description */}
        <p className="text-xl text-gray-300 text-center drop-shadow-md max-w-3xl mb-8">
          Plan, track, and save with our Family Budget Planner. Keep your household expenses under control with a
          simple, effective, and visual approach to monthly budgeting.
        </p>

        {/* Buttons */}
        <div className="flex gap-6">
          <Link href="/signin">
            <button className="px-6 py-3 text-cyan-300 border-2 border-cyan-400 rounded-full hover:bg-cyan-400 hover:text-black transition-all shadow-[0_0_20px_rgba(0,255,255,0.6)]">
              Sign In
            </button>
          </Link>
          <Link href="/login">
            <button className="px-6 py-3 text-cyan-300 border-2 border-cyan-400 rounded-full hover:bg-cyan-400 hover:text-black transition-all shadow-[0_0_20px_rgba(0,255,255,0.6)]">
              Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
