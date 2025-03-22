"use client";

import { useState } from "react";

import CustomSelect from "./customselect";

const Button = ({ children, className = "", ...props }) => (
  <button
    className={`px-4 py-2 rounded-md font-medium bg-pink-600 text-white hover:bg-pink-700 transition ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default function Frame() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [aspectRatio, setAspectRatio] = useState("16:9");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setVideoFile(file);
    }
  };

  const aspectRatios: { [key: string]: string } = {
    "16:9": "aspect-[16/9]",
    "9:16": "aspect-[9/16]",
    "4:3": "aspect-[4/3]",
    "1:1": "aspect-[1/1]",
  };

  return (
    <div className="font-inter bg-white min-h-screen p-6 text-gray-800">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-pink-600">
          Upload & Resize Video
        </h1>

        {/* Upload Video */}
        <input
          accept="video/*"
          className="border border-pink-300 rounded-md px-4 py-2 w-full text-black"
          type="file"
          onChange={handleFileChange}
        />

        <CustomSelect value={aspectRatio} onChange={setAspectRatio} />

        {/* Video Preview */}
        {videoFile && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-600">Preview ({aspectRatio})</p>
            <div
              className={`w-full max-w-sm border border-gray-300 overflow-hidden bg-black ${aspectRatios[aspectRatio]}`}
            >
              <video
                controls
                className="w-full h-full object-cover"
                src={URL.createObjectURL(videoFile)}
              />
            </div>
          </div>
        )}

        {/* Process Video Button */}
        <Button onClick={() => alert("Processing Video...")}>
          Process Video
        </Button>
      </div>
    </div>
  );
}
