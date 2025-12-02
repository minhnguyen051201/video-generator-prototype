import React, { useRef, useState, useEffect, forwardRef } from "react";
import { Play, Pause, RotateCcw, RotateCw } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  onDurationChange?: (duration: number) => void;
  onTimeUpdate?: (currentTime: number) => void;
}

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ src, onDurationChange, onTimeUpdate }, ref) => {
    const internalRef = useRef<HTMLVideoElement>(null);
    const videoRef = (ref as React.RefObject<HTMLVideoElement>) || internalRef;

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const handlePlayPause = () => {
      if (!videoRef.current) return;
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    };

    const handleRewind = () => {
      if (videoRef.current) {
        videoRef.current.currentTime = Math.max(
          0,
          videoRef.current.currentTime - 5,
        );
      }
    };

    const handleForward = () => {
      if (videoRef.current) {
        videoRef.current.currentTime = Math.min(
          duration,
          videoRef.current.currentTime + 5,
        );
      }
    };

    // Update currentTime and duration
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const updateTime = () => {
        const current = Math.floor(video.currentTime);
        setCurrentTime(current);
        onTimeUpdate?.(current);
      };

      const setMeta = () => {
        const videoDuration = Math.floor(video.duration || 0);
        setDuration(videoDuration);
        onDurationChange?.(videoDuration);
      };

      video.addEventListener("timeupdate", updateTime);
      video.addEventListener("loadedmetadata", setMeta);

      return () => {
        video.removeEventListener("timeupdate", updateTime);
        video.removeEventListener("loadedmetadata", setMeta);
      };
    }, [onDurationChange, onTimeUpdate]);

    // Sync external currentTime changes from parent
    useEffect(() => {
      if (
        videoRef.current &&
        Math.abs(videoRef.current.currentTime - currentTime) > 0.1
      ) {
        videoRef.current.currentTime = currentTime;
      }
    }, [currentTime]);

    const formatTime = (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
    };

    const progress = duration ? (currentTime / duration) * 100 : 0;

    return (
      <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl flex-grow flex items-center justify-center">
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-cover"
          onEnded={() => setIsPlaying(false)}
        />

        {/* Overlay Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="h-1 bg-gray-600 rounded-full mb-4">
            <div
              className="h-1 bg-[#FF6633] rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-center items-center text-white space-x-6">
            <span className="text-xs text-gray-400">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <button
              onClick={handleRewind}
              title="Rewind 5s"
              className="hover:text-[#FF6633]"
            >
              <RotateCcw size={20} />
            </button>

            <button
              onClick={handlePlayPause}
              title={isPlaying ? "Pause" : "Play"}
              className="hover:text-[#FF6633]"
            >
              {isPlaying ? <Pause size={22} /> : <Play size={22} />}
            </button>

            <button
              onClick={handleForward}
              title="Forward 5s"
              className="hover:text-[#FF6633]"
            >
              <RotateCw size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  },
);

VideoPlayer.displayName = "VideoPlayer";
