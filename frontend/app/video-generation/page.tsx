"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { VideoPlayer } from "../../components/VideoPlayer/VideoPlayer";
import { Home } from "lucide-react";
import {
  GeneratedVideo,
  GenerateVideoRequest,
  generateVideo,
} from "../../services/video/videoService";

// --- Icons ---
const IconDownload = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
    />
  </svg>
);

// --- Button Component ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "tag" | "action";
  isActive?: boolean;
}
const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  isActive = false,
  className,
  ...props
}) => {
  let styles =
    "transition-all duration-150 rounded-md font-medium text-sm disabled:opacity-50";

  const variantClasses: Record<string, string> = {
    primary: "bg-[#FF6633] text-black hover:bg-[#ff7a4c] py-2 px-6",
    secondary: "bg-gray-700 text-white hover:bg-gray-600 py-3 px-4",
    outline: "border border-gray-600 text-white hover:bg-gray-800 py-3 px-4",
    action:
      "border border-gray-600 text-white hover:bg-[#FF6633] hover:text-black flex items-center justify-center py-2.5 px-3 space-x-2",
    tag: isActive
      ? "px-3 py-1.5 bg-[#FF6633] text-black cursor-pointer"
      : "px-3 py-1.5 bg-[#333333] text-gray-300 hover:bg-[#444444] cursor-pointer",
  };

  styles += " " + (variantClasses[variant] || "");
  return (
    <button onClick={onClick} className={`${styles} ${className}`} {...props}>
      {children}
    </button>
  );
};

// --- Control Components ---
interface ControlGroupProps {
  title: string;
  children: React.ReactNode;
  isGrid?: boolean;
}
const ControlGroup: React.FC<ControlGroupProps> = ({
  title,
  children,
  isGrid = false,
}) => (
  <div className="mb-8">
    <h3 className="text-gray-400 font-semibold uppercase text-xs tracking-wider mb-3">
      {title}
    </h3>
    <div
      className={`${isGrid ? "grid grid-cols-3 gap-2" : "flex flex-wrap gap-2"}`}
    >
      {children}
    </div>
  </div>
);

interface AngleButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}
const AngleButton: React.FC<AngleButtonProps> = ({
  label,
  icon,
  isActive,
  onClick,
}) => {
  const activeClass = isActive
    ? "border-[#FF6633] bg-[#2d1b11] text-white"
    : "border-gray-700 bg-transparent text-gray-500 hover:border-gray-500";
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center p-3 border rounded-md w-16 h-16 transition-colors ${activeClass}`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};

const SliderControl: React.FC<{
  label: string;
  min: number;
  max: number;
  value: number;
  setValue: (v: number) => void;
  unit: string;
}> = ({ label, min, max, value, setValue, unit }) => (
  <div className="mb-8">
    <div className="flex justify-between items-baseline mb-2">
      <h3 className="text-gray-400 font-semibold uppercase text-xs tracking-wider">
        {label}
      </h3>
      <span className="text-white text-sm">
        {value}
        {unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => setValue(parseInt(e.target.value, 10))}
      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF6633]"
    />
  </div>
);

// --- Main Page ---
export default function Page() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const defaultVideoUrl =
    "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4";

  const [videoSource, setVideoSource] = useState(defaultVideoUrl);

  // const [cameraAngle, setCameraAngle] = useState('medium');
  const [activeStyles, setActiveStyles] = useState(["Vintage Americana"]);
  // const [lightingPreset, setLightingPreset] = useState('Studio');
  // const [trackingType, setTrackingType] = useState('Dolly');
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audiosEnabled, setAudiosEnabled] = useState(false);
  const [positivePrompt, setPositivePrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [userId, setUserId] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(
    null,
  );

  // const styleTags = ['Styles', 'Artistic', 'Moody', 'Vintage Americana', 'Studio', 'Retro VHS'];
  // const lightingTags = ['Tracking', 'Studio', 'Neon', 'Dramatic', 'Golden Hour', 'Shake'];
  // const trackingTags = ['Tracking', 'Dolly', 'Zoom'];

  const handleStyleToggle = (tag: string) => {
    setActiveStyles((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      setSelectedImage(null);
      return;
    }

    setSelectedImage(files[0]);
  };

  const handleGenerate = async () => {
    if (!positivePrompt.trim()) {
      setError("Please provide a positive prompt.");
      return;
    }

    if (!userId || Number.isNaN(userId)) {
      setError("Please provide a valid user ID.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setStatusMessage(null);

    const payload: GenerateVideoRequest = {
      userId,
      positivePrompt: positivePrompt.trim(),
    };

    if (negativePrompt.trim()) {
      payload.negativePrompt = negativePrompt.trim();
    }

    if (selectedImage) {
      payload.image = selectedImage;
    }

    try {
      const response = await generateVideo(payload);
      setGeneratedVideo(response);
      setStatusMessage("Video generation started successfully.");

      const nextSource = response.localpath || response.filename;
      if (nextSource) {
        setVideoSource(nextSource);
      }
    } catch (generationError) {
      if (generationError instanceof Error) {
        setError(generationError.message);
      } else {
        setError("An unexpected error occurred while generating the video.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (duration > 0 && currentTime > duration) {
      setCurrentTime(duration);
    }
  }, [duration, currentTime]);

  return (
    <div className="min-h-screen bg-[#111111] text-white p-4 md:p-8 font-inter">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
        <div className="text-xl font-bold tracking-wider">
          OMNI VIDEO STUDIO
        </div>
        <div className="text-2xl font-bold tracking-wider text-gray-500">
          VIDEO GENERATOR
        </div>
        <Home
          className="w-8 h-8 text-[#D89F5C] cursor-pointer hover:opacity-80"
          onClick={() => router.push("/")}
        />
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Left Column: Controls */}
        <div className="p-4 bg-[#222222] rounded-xl md:col-span-1">
          {/* Camera Angle, Tracking, Lighting Preset commented for time-being, may add it in future if required */}
          {/* <ControlGroup title="Camera Angle" isGrid>
            {['Low', 'High', 'Medium'].map(angle => (
              <AngleButton
                key={angle}
                label={angle}
                icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 16H8v-2h3v2zm0-4H8v-2h3v2zm0-4H8V8h3v2zm4 8h-3v-2h3v2zm0-4h-3v-2h3v2zm0-4h-3V8h3v2z"/></svg>}
                isActive={cameraAngle.toLowerCase() === angle.toLowerCase()}
                onClick={() => setCameraAngle(angle.toLowerCase())}
              />
            ))}
          </ControlGroup>

          <ControlGroup title="Tracking">
            {trackingTags.map(tag => (
              <Button key={tag} variant="tag" isActive={trackingType === tag} onClick={() => setTrackingType(tag)}>
                {tag}
              </Button>
            ))}
          </ControlGroup>

          <ControlGroup title="Lighting Preset" isGrid>
            {lightingTags.map(tag => (
              <Button key={tag} variant="tag" isActive={lightingPreset === tag} onClick={() => setLightingPreset(tag)} className="w-full text-center py-2 px-1">{tag}</Button>
            ))}
          </ControlGroup> */}

          <SliderControl
            label="Duration"
            min={0}
            max={duration}
            value={currentTime}
            setValue={(time) => {
              setCurrentTime(time);
              if (videoRef.current) videoRef.current.currentTime = time;
            }}
            unit="s"
          />
          {/* Resolution & Frame Rate */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-gray-400 font-semibold uppercase text-xs tracking-wider">
              Resolution
            </h3>
            <span className="text-white">1080p</span>
          </div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-gray-400 font-semibold uppercase text-xs tracking-wider">
              Frame Rate
            </h3>
            <span className="text-white">30 fps</span>
          </div>

          {/* Audios Toggle */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-gray-400 font-semibold uppercase text-xs tracking-wider">
              Audios
            </h3>
            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
              <input
                type="checkbox"
                checked={audiosEnabled}
                onChange={() => setAudiosEnabled((prev) => !prev)}
                className="absolute opacity-0 w-full h-full cursor-pointer peer"
              />
              <label
                className={`block h-6 rounded-full cursor-pointer transition-all duration-300 ease-in-out ${audiosEnabled ? "bg-[#FF6633]" : "bg-gray-700"}`}
              >
                <span
                  className={`absolute left-0 top-0 block w-6 h-6 rounded-full border-4 transition-transform duration-300 ease-in-out ${audiosEnabled ? "bg-white border-[#FF6633] translate-x-4" : "bg-white border-gray-700"}`}
                ></span>
              </label>
            </div>
          </div>
        </div>

        {/* Center Column */}
        <div className="col-span-1 md:col-span-3 flex flex-col space-y-4">
          <div className="space-y-3 bg-[#222222] p-4 rounded-xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2">
              <input
                type="text"
                value={positivePrompt}
                onChange={(event) => setPositivePrompt(event.target.value)}
                className="flex-grow bg-transparent text-white border border-gray-700 rounded-md focus:ring-1 focus:ring-[#FF6633] focus:outline-none placeholder-gray-500 py-2 px-3"
                placeholder="Describe the scene you want to generate"
              />
              <input
                type="text"
                value={negativePrompt}
                onChange={(event) => setNegativePrompt(event.target.value)}
                className="flex-grow bg-transparent text-white border border-gray-700 rounded-md focus:ring-1 focus:ring-[#FF6633] focus:outline-none placeholder-gray-500 py-2 px-3"
                placeholder="(Optional) What should be avoided?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">User ID</label>
                <input
                  type="number"
                  min={1}
                  value={userId ?? ""}
                  onChange={(event) => setUserId(Number(event.target.value))}
                  className="w-full bg-transparent text-white border border-gray-700 rounded-md focus:ring-1 focus:ring-[#FF6633] focus:outline-none placeholder-gray-500 py-2 px-3"
                  placeholder="e.g. 1"
                />
              </div>

              <div
                className="flex items-center justify-between gap-3 border border-dashed border-gray-600 rounded-lg px-3 py-2 cursor-pointer hover:border-[#FF6633]"
                onClick={() => imageInputRef.current?.click()}
              >
                <div className="flex flex-col text-sm text-gray-400">
                  <span className="font-medium text-white">Upload image (optional)</span>
                  <span className="text-xs text-gray-500">
                    {selectedImage ? selectedImage.name : "PNG, JPG, JPEG"}
                  </span>
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <IconDownload className="w-5 h-5 rotate-180 text-gray-400" />
              </div>

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  className="py-2.5 px-6"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? "GENERATING..." : "GENERATE"}
                </Button>
              </div>
            </div>

            {error ? (
              <p className="text-red-400 text-sm">{error}</p>
            ) : null}
            {statusMessage ? (
              <p className="text-green-400 text-sm">{statusMessage}</p>
            ) : null}
            {generatedVideo ? (
              <div className="text-xs text-gray-400 space-y-0.5">
                <p>
                  Request ID: <span className="text-white">{generatedVideo.id}</span>
                </p>
                {generatedVideo.filename ? (
                  <p>
                    Filename: <span className="text-white">{generatedVideo.filename}</span>
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {/* {styleTags.map(tag => (
              <Button key={tag} variant="tag" isActive={activeStyles.includes(tag)} onClick={() => handleStyleToggle(tag)}>
                {tag}
              </Button>
            ))} */}
          </div>

          <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl flex-grow flex items-center justify-center">
            <VideoPlayer
              ref={videoRef}
              src={videoSource}
              onDurationChange={(total) => setDuration(total)}
              onTimeUpdate={(time) => setCurrentTime(time)}
            />
          </div>

          {/* History */}
          <div className="mt-4">
            <h3 className="text-gray-300 font-semibold text-lg mb-3">
              History
            </h3>
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 border-transparent hover:border-[#FF6633] cursor-pointer"
                >
                  <img
                    src={`https://placehold.co/100x70/222/FFF?text=Clip+${i}`}
                    alt={`History clip ${i}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="p-4 bg-[#222222] rounded-xl md:col-span-1">
          <h3 className="text-gray-300 font-semibold text-lg mb-4">
            Output & Assets
          </h3>

          <div className="mb-6">
            <div className="w-full h-32 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src="https://placehold.co/150x100/333/FFF?text=Output+Preview"
                alt="Output Asset"
                className="w-full h-full object-cover"
                style={{ filter: "brightness(0.9)" }}
              />
            </div>
            <div className="flex justify-between items-center mt-2 text-sm text-gray-400">
              <span>Start Frame</span>
              <span>Replace</span>
            </div>
          </div>

          {/* Upload Files */}
          <div
            className="flex flex-col items-center justify-center py-6 border border-dashed border-gray-600 rounded-lg mb-6 text-gray-400 hover:border-[#FF6633] cursor-pointer transition-colors"
            onClick={() => imageInputRef.current?.click()}
          >
            <IconDownload className="w-6 h-6 rotate-180" />
            <span className="mt-2 text-sm">
              {selectedImage ? selectedImage.name : "Upload files"}
            </span>
          </div>

          {/* Export */}
          <div className="mb-6">
            <h4 className="text-gray-400 font-semibold uppercase text-xs tracking-wider mb-2">
              Export
            </h4>
            <div className="relative">
              <select className="appearance-none w-full bg-[#333333] border border-gray-700 text-white py-2 px-3 rounded-md pr-8 cursor-pointer focus:border-[#FF6633] focus:ring-1 focus:ring-[#FF6633]">
                <option>MP4</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.05 6.879 4.636 8.293 10 13.657z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              variant="action"
              className="w-full"
              onClick={() => {
                if (!videoRef.current) return;
                const a = document.createElement("a");
                a.href = videoRef.current.currentSrc;
                a.download = "video.mp4";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
            >
              DOWNLOAD
            </Button>

            <Button variant="action" className="w-full">
              SHARE
            </Button>
            <Button variant="action" className="w-full">
              REGENERATE
            </Button>
            <Button variant="action" className="w-full">
              SAVE
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
