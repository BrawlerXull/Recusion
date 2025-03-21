"use client";
import { useState } from "react";
import { useDisclosure } from "@nextui-org/modal";
import { Input } from "@nextui-org/input";
import { Divider } from "@nextui-org/divider";
import { Progress } from "@nextui-org/progress";
import { Code } from "@nextui-org/code";
import { Chip } from "@nextui-org/chip";

const Button = ({ children, className = "", ...props }) => (
  <button
    className={`px-4 py-2 rounded-md font-medium bg-pink-300 text-white hover:bg-pink-400 transition ${className}`}
    {...props}
  >
    {children}
  </button>
);

const CustomInput = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full px-4 py-2 border border-pink-300 rounded-md focus:outline-none focus:border-pink-500 bg-white text-black"
  />
);

import { subtitle, title } from "@/components/primitives";
import { ConfirmModal } from "@/components/modal";
import { defaultVideoOptions } from "@/config/options";
import { BACKEND_ENDPOINT } from "@/config/backend";
import { VideoGenerator } from "@/components/video";

export default function Minimize() {
  const confirmModal = useDisclosure();

  const [prompt, setPrompt] = useState("");
  const [advancedOptions, setAdvancedOptions] = useState(defaultVideoOptions);
  const [usedDefaultOptions, setUsedDefaultOptions] = useState(false);
  const [isAIRunning, setIsAIRunning] = useState(false);
  const [aiResponse, setAIResponse] = useState(null);
  const [aiError, setAIError] = useState(null);

  async function fetchAI() {
    console.log("Fetching AI response...");
    setAIError(null);

    try {
      let json = { ...advancedOptions, aiPrompt: prompt };

      const res = await fetch(`${BACKEND_ENDPOINT}/generateAIJSON`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });

      const data = await res.json();

      if (!res.ok) {
        setAIError(
          "Failed to fetch AI models: " + (data.error ?? data.toString()),
        );

        return;
      }
      setAIResponse(data.result);
    } catch (e) {
      setAIError(
        "Failed to fetch AI models due to internal error: " + e.message,
      );
    }
  }

  function openModal() {
    if (advancedOptions === defaultVideoOptions) setUsedDefaultOptions(true);
    confirmModal.onOpen();
  }

  function renderVideo() {
    setIsAIRunning(true);
    fetchAI();
  }

  const promptSuggestions = [
    "news topic about the world",
    "quiz about country capitals",
    "text message between two friends",
    "rank fast food",
    "would you rather about food",
  ];

  return isAIRunning ? (
    <AIOutput
      aiError={aiError}
      aiResponse={aiResponse}
      options={advancedOptions}
    />
  ) : (
    <div className="font-inter bg-white min-h-screen p-6 text-gray-800">
      <div className="flex flex-col gap-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-pink-600">
          Generate Video with AI!
        </h1>
        <p className={subtitle({ size: "sm" })}>
          Enter a prompt for the AI to generate a video.
        </p>
        <CustomInput

          placeholder="Enter prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <div className="grid grid-cols-3 gap-2 max-w-full">
          {promptSuggestions.map((suggestion) => (
            <Chip
              key={suggestion}
              className="text-xs cursor-pointer text-pink-600 border border-pink-300 hover:bg-pink-100"
              variant="bordered"
              onClick={() => setPrompt(suggestion)}
            >
              {suggestion}
            </Chip>
          ))}
        </div>
        <Divider className="bg-pink-300" />
        <Button onClick={openModal}>Render Video</Button>
        <ConfirmModal
          advancedOptions={advancedOptions}
          confirmModal={confirmModal}
          renderVideo={renderVideo}
          usedDefaultOptions={usedDefaultOptions}
        />
      </div>
    </div>
  );
}

export const AIOutput = ({ aiResponse, aiError, options }) => {
  return aiResponse ? (
    <div className="flex flex-col items-center justify-center gap-4 w-full">
      <VideoGenerator isAI={true} json={aiResponse} options={options} />
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-4 w-full">
      {aiError ? (
        <>
          <p className="text-pink-600">Error generating video with AI</p>
          <p className={subtitle({ size: "sm" })}>
            An error occurred. Please check the message below.
          </p>
          <Chip color="danger" variant="shadow">
            {aiError}
          </Chip>
          <Button onClick={() => window.location.reload()}>Go Back</Button>
        </>
      ) : (
        <>
          <p className={title()}>AI is generating the video script</p>
          <p className={subtitle({ size: "sm" })}>
            Please wait while the AI generates the video script.
          </p>
          <Progress
            isIndeterminate
            aria-label="Loading..."
            className="max-w-md"
            size="md"
          />
          <Code>Loading...</Code>
        </>
      )}
    </div>
  );
};
