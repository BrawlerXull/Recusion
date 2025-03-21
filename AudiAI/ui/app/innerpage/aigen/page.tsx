"use client";
import { useState } from "react";
import { useDisclosure } from "@nextui-org/modal";
import { Input } from "@nextui-org/input";
import { Divider } from "@nextui-org/divider";
import { Progress } from "@nextui-org/progress";
import { Code } from "@nextui-org/code";
import { Chip } from "@nextui-org/chip";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { subtitle, title } from "@/components/primitives";
import { ConfirmModal } from "@/components/modal";
import { defaultVideoOptions } from "@/config/options";
import { BACKEND_ENDPOINT } from "@/config/backend";
import { VideoGenerator } from "@/components/video";

// Keeping your original Button component
const Button = ({ children, className = "", ...props }) => (
  <button
    className={`px-4 py-2 rounded-md font-medium bg-pink-600 text-white hover:bg-pink-700 transition ${className}`}
    {...props}
  >
    {children}
  </button>
);

// Keeping your original CustomInput component for consistency
const CustomInput = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full px-4 py-2 border border-pink-300 rounded-md focus:outline-none focus:border-pink-500 bg-white text-black"
  />
);

export default function AIGen() {
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
    <div className="font-inter bg-gradient-to-br from-pink-50 via-white to-purple-50 min-h-screen py-16 px-4 text-gray-800">
      <div className="max-w-2xl mx-auto">
        <Card className=" overflow-hidden backdrop-blur-sm bg-white/80">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-100 rounded-full -ml-12 -mb-12 opacity-50"></div>
          
          <CardHeader className="flex flex-col items-center gap-2 pb-0 pt-8 relative z-10">
            <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-pink-600">
              Generate Video with AI!
            </h1>
            <p className="text-center text-gray-600 max-w-md mb-4">
              Enter a prompt for the AI to generate a custom video for you
            </p>
            <Divider className="w-20 h-1 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full" />
          </CardHeader>
          
          <CardBody className="px-8 py-6 relative z-10">
            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Your Video Prompt</label>
                <CustomInput
                  placeholder="Enter prompt..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <p className="text-xs text-gray-500">Be specific about what you want in your video</p>
              </div>
              
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-gray-700">Try one of these ideas:</p>
                <div className="grid grid-cols-3 gap-2">
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
              </div>
              
              <Divider className="my-2 bg-pink-300" />
              
              <Button 
                onClick={openModal}
                className={`w-full py-3 ${!prompt.trim() ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={!prompt.trim()}
              >
                {!prompt.trim() ? "Enter a prompt first" : "Render Video"}
              </Button>
            </div>
          </CardBody>
          
          <CardFooter className="flex flex-col gap-2 justify-center text-center text-xs text-gray-600 bg-gradient-to-r from-pink-50 to-purple-50 py-4 relative z-10">
            <p>Advanced options available in the next step</p>
            <p className="text-pink-400 text-xs">Create amazing AI videos in seconds!</p>
          </CardFooter>
        </Card>
        
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
  const goBack = () => window.location.reload();
  
  return (
    <div className="font-inter bg-gradient-to-br from-pink-50 via-white to-purple-50 min-h-screen py-16 px-4">
      {aiResponse ? (
        <div className="flex flex-col items-center justify-center gap-6 w-full">
          <Card className="w-full max-w-4xl border border-pink-100  bg-white/80">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-100 rounded-full -ml-12 -mb-12 opacity-50"></div>
            
            <CardHeader className="flex flex-col items-center gap-2 pb-2 pt-8 relative z-10">
              <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-pink-600">Your AI Generated Video</h1>
              <Divider className="w-20 h-1 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full mt-2" />
            </CardHeader>
            
            <CardBody className="relative z-10">
              <VideoGenerator isAI={true} json={aiResponse} options={options} />
            </CardBody>
            
            <CardFooter className="justify-center pb-6 relative z-10">
              <Button onClick={goBack}>
                Create Another Video
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : aiError ? (
        <div className="flex flex-col items-center justify-center gap-6 w-full max-w-2xl mx-auto">
          <Card className="border-pink-300 shadow-xl w-full overflow-hidden backdrop-blur-sm bg-white/80">
            <CardHeader className="flex flex-col items-center gap-2 pt-8 relative z-10">
              <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-pink-600">Error Generating Video</h1>
              <p className="text-center text-gray-600">
                An error occurred. Please check the message below.
              </p>
            </CardHeader>
            
            <CardBody className="items-center py-6 relative z-10">
              <Chip color="danger" variant="shadow" className="mb-4">
                {aiError}
              </Chip>
            </CardBody>
            
            <CardFooter className="justify-center pb-6 relative z-10">
              <Button onClick={goBack}>
                Go Back
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-6 w-full max-w-2xl mx-auto">
          <Card className="w-full shadow-xl border border-pink-100 overflow-hidden backdrop-blur-sm bg-white/80">
            <CardHeader className="flex flex-col items-center gap-2 pt-8 relative z-10">
              <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-pink-600">AI is generating the video script</h1>
              <p className="text-center text-gray-600">
                Please wait while the AI creates your custom video
              </p>
            </CardHeader>
            
            <CardBody className="items-center py-8 relative z-10">
              <Progress
                isIndeterminate
                aria-label="Loading..."
                className="max-w-md mb-6"
                color="secondary"
                size="md"
              />
              <Code className="bg-pink-100 text-pink-800">Loading...</Code>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}