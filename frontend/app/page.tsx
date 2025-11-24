"use client";
import Slider from "../components/Slider/Slider";

export default function Page() {
  return (
    <div className="flex flex-col items-center px-[100px] py-[100px] gap-8 font-sans w-full h-full">
      {/* quote */}
      <div className="text-7xl text-center">
        <h1>
          Generate videos with camera control, style and story{" "}
          <span className="text-[#D5A253]">- all in one click</span>{" "}
        </h1>
      </div>
      {/* second quote */}
      <div className="flex flex-col gap-4 items-center justify-center">
        <p className="text-2xl">
          From stills to stories - bring every frame to life.
        </p>
        <button className="w-fit rounded-2xl px-6 py-2 bg-[#C66B3D] shadow-xl">
          Start Creating
        </button>
        <p>Sign up for free</p>
      </div>
      {/* Video slider */}
      <Slider />
    </div>
  );
}
