"use client";

// react
import React, { useEffect, useRef, useState } from "react";

// icon
import { Home } from "lucide-react";
import { CloudDownload } from "lucide-react";

// functions
import {
  getCurrentUserId,
  generateVideo,
} from "../../services/video/videoService";

// Types
import {
  GenerateVideoRequest,
  GeneratedVideo,
} from "../../services/video/videoService";

export default function Page() {
  const data = {
    input_image: "man_playing_guitar.png",
    positive_prompt:
      "A moody black-and-white scene of an older man sitting with an acoustic guitar in a dimly lit room. He gently strums the guitar, his fingers moving across the strings with subtle, realistic motion. His expression shifts slightly with emotion as he plays, eyes narrowing and relaxing. The cigarette in his raised hand releases a slow trail of smoke that curls upward in soft, drifting patterns. The camera performs a slow, intimate push-in, capturing the texture of the guitar wood, the movement of his hands, and the cinematic shadows across his face. Film grain, soft contrast, and classic Americana music-club atmosphere remain consistent",
    negative_prompt:
      "No modern instruments, no color, no digital artifacts, no jittery finger movement, no warped strings, no glitching smoke, no cartoon effects, no incorrect lighting flicker, no duplicated hands or guitar parts",
    duration: 4.041666666666667,
    resolution: "448x448",
    width: 448,
    height: 448,
    fps: 24,
    filename: "ltxv-base_000010.mp4",
    format: "video/h264-mp4",
    created_at: "2025-12-01T22:34:28",
    id: 1,
    user_id: 1,
  };
  // refs
  const imageInputRef = useRef<HTMLInputElement>(null);

  // states
  // input state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [positivePrompt, setPositivePrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  // generation tracking state
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  // generated video output
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(data);
  const [videoSource, setVideoSource] = useState("");

  // functions
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
      setError("You must be logged in to generate a video.");
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
      setVideoSource(response.source_video);
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

  console.log({ generatedVideo });

  // Get user id
  useEffect(() => {
    async function loadUser() {
      const id = await getCurrentUserId(); // returns Promise<number>
      setUserId(id); // ✔ now a number
    }
    loadUser();
  }, []);

  return (
    <div className="min-h-screen bg-[#111111] text-white p-4 md:p-8 font-inter">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
        <div className="text-xl font-bold tracking-wider">VIDEO STUDIO</div>
        <div className="text-2xl font-bold tracking-wider text-gray-500">
          VIDEO GENERATOR
        </div>
        <Home className="w-8 h-8 text-[#D89F5C] cursor-pointer hover:opacity-80" />
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Left Column: Metadata */}

        <div className="p-4 bg-[#222222] rounded-xl md:col-span-1">
          <h3 className="text-gray-300 font-semibold text-lg mb-4 text-center">
            Metadata
          </h3>

          {/* Duration */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-gray-400 font-semibold uppercase text-xs tracking-wider">
              Duration
            </h3>
            <span className="text-white">
              {generateVideo ? generatedVideo.duration.toFixed() : ""}
            </span>
          </div>

          {/* Resolution */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-gray-400 font-semibold uppercase text-xs tracking-wider">
              Resolution
            </h3>
            <span className="text-white">{generateVideo ? generatedVideo.resolution : ""}</span>
          </div>

          {/* Width */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-gray-400 font-semibold uppercase text-xs tracking-wider">
              Width
            </h3>
            <span className="text-white">{generateVideo ? generatedVideo.width : ""}</span>
          </div>

          {/* Height */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-gray-400 font-semibold uppercase text-xs tracking-wider">
              Resolution
            </h3>
            <span className="text-white">{generateVideo ? generatedVideo.height : ""}</span>
          </div>

          {/* fps */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-gray-400 font-semibold uppercase text-xs tracking-wider">
              Fps
            </h3>
            <span className="text-white">{generateVideo ? generatedVideo.fps : ""}fps</span>
          </div>

          {/* Format */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-gray-400 font-semibold uppercase text-xs tracking-wider">
              Format
            </h3>
            <span className="text-white">{generateVideo ? generatedVideo.format : ""}</span>
          </div>

          {/* Created at */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-gray-400 font-semibold uppercase text-xs tracking-wider">
              Created at
            </h3>
            <span className="text-white">{generateVideo ? generatedVideo.created_at : ""}</span>
          </div>
        </div>

        {/* Center Column */}
        <div className="col-span-1 md:col-span-3 flex flex-col space-y-4">
          {/* Prompt input */}
          <div className="space-y-3 bg-[#222222] p-4 rounded-xl text-black">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2">
              <input
                type="text"
                style={{ color: "black" }}
                className="flex-grow bg-transparent text-white border border-gray-700 rounded-md focus:ring-1 focus:ring-[#FF6633] focus:outline-none placeholder-gray-500 py-2 px-3"
                placeholder="Describe the scene you want to generate"
                value={positivePrompt}
                onChange={(event) => setPositivePrompt(event.target.value)}
              />
              <input
                type="text"
                style={{ color: "black" }}
                className="flex-grow bg-transparent text-white border border-gray-700 rounded-md focus:ring-1 focus:ring-[#FF6633] focus:outline-none placeholder-gray-500 py-2 px-3"
                placeholder="(Optional) What should be avoided?"
                value={negativePrompt}
                onChange={(event) => setNegativePrompt(event.target.value)}
              />
            </div>

            <div className="flex justify-center items-center">
              <button
                className="py-2.5 px-6 bg-brand-muted rounded-xl"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? "GENERATING..." : "GENERATE"}
              </button>
            </div>
            {error ? <p className="text-red-400 text-sm">{error}</p> : null}
            {statusMessage ? (
              <p className="text-green-400 text-sm">{statusMessage}</p>
            ) : null}
            {generatedVideo ? (
              <div className="text-xs text-gray-400 space-y-0.5">
                <p>
                  Request ID:{" "}
                  <span className="text-white">{generatedVideo.id}</span>
                </p>
                {generatedVideo.filename ? (
                  <p>
                    Filename:{" "}
                    <span className="text-white">
                      {generatedVideo.filename}
                    </span>
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Video generation */}

          {videoSource ? (
            <div className="space-y-3 bg-[#222222] p-4 rounded-xl w-full h-full flex justify-center items-center">
              <video width="448" height="448" controls preload="none" autoPlay>
                <source
                  key={videoSource} // 👈 forces React render
                  src={videoSource}
                  type="video/mp4"
                />
              </video>
            </div>
          ) : <div></div>}
        </div>

        {/* Right Column */}
        <div className="p-4 bg-[#222222] rounded-xl md:col-span-1 flex flex-col gap-4">
          <h3 className="text-gray-300 font-semibold text-lg mb-4">
            Output & Assets
          </h3>

          {/* Upload Files */}
          <div
            onClick={() => imageInputRef.current?.click()}
            className="flex flex-col items-center justify-center py-6 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-[#FF6633] cursor-pointer transition-colors"
          >
            <CloudDownload />
            <span className="mt-2 text-sm">Upload Image</span>
            <span className="mt-2 text-sm">
              {selectedImage ? selectedImage.name : "Upload files"}
            </span>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
