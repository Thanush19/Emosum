import React, { useState } from "react";

const API_KEY_NLP = "AIzaSyBMX_ZaUPUUE5wqUDZ-UId0PSsnw94aoHU";
const API_KEY_ASSEMBLYAI = "2a91e62981a84432be2b19486ee4bdf9";

const AudioAnalysis = () => {
  const [transcript, setTranscript] = useState("");
  const [chivalryScore, setChivalryScore] = useState(0);
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");
  const [prediction, setPrediction] = useState("");
  const [probability, setProbability] = useState(null);

  const fileValidation = () => {
    const fileInput = document.getElementById("file");
    const { name: fileName, size } = fileInput.files[0];
    const fileSize = (size / 1000).toFixed(2);
    const fileNameAndSize = `${fileName} - ${fileSize}KB`;
    document.querySelector(".file-name").textContent = fileNameAndSize;
    document.querySelector(".file-name").style.display = "block";
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      fetch("https://api.assemblyai.com/v2/upload", {
        method: "POST",
        headers: {
          authorization: API_KEY_ASSEMBLYAI,
          "content-type": "application/json",
          "transfer-encoding": "chunked",
        },
        body: text,
      })
        .then((res) => res.json())
        .then((data) => {
          Transcribe(data.upload_url);
        });
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
  };

  const Transcribe = (audioURL) => {
    let soundData = {
      audio_url: audioURL,
    };
    document.getElementById("TranscriptLoading").style.display = "block";

    fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        authorization: API_KEY_ASSEMBLYAI,
        "content-type": "application/json",
      },
      body: JSON.stringify(soundData),
    })
      .then((res) => res.json())
      .then((data) => {
        const interval = setInterval(() => {
          if (typeof data.id !== "undefined") {
            AwaitStatus(data.id);
          } else {
            clearInterval(interval);
          }
        }, 2000);
      });
  };

  const AwaitStatus = (id) => {
    fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
      method: "GET",
      headers: {
        authorization: API_KEY_ASSEMBLYAI,
        "content-type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "completed" || data.status === "error") {
          if (data.status === "error") {
            document.getElementById("transcript").value =
              "Error Generating Transcript. Ensure link is valid";
          } else {
            document.getElementById("transcript").value = data.text;
          }
          document.getElementById("TranscriptLoading").style.display = "none";
        }
      });
  };

  const AnalyzeSentiment = () => {
    let textToProcess = document.getElementById("transcript").value;
    const data = {
      document: {
        type: 1,
        language: "en",
        content: textToProcess,
      },
      encodingType: 1,
    };

    fetch(
      "https://language.googleapis.com/v1beta2/documents:analyzeSentiment?key=" +
        API_KEY_NLP,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    )
      .then((res) => res.json())
      .then((dataArray) => {
        if (dataArray.length > 0) {
          const firstItem = dataArray[0];
          if (firstItem.predictions && firstItem.predictions.length > 0) {
            const { prediction, probability } = firstItem.predictions[0];
            setPrediction(prediction);
            setProbability(probability);
          } else {
            setPrediction("No prediction available");
            setProbability(null);
          }
        } else {
          setPrediction("No data available");
          setProbability(null);
        }
      })
      .catch((error) => {
        console.error("Error analyzing sentiment:", error);
        setPrediction("Error occurred");
        setProbability(null);
      });
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-gray-100 rounded-lg shadow-lg">
      <input type="file" id="file" className="mb-4" onChange={fileValidation} />
      <div className="file-name hidden"></div>
      <div id="TranscriptLoading" className="hidden"></div>
      <div id="main-sentiment-output" className="mb-4">
        Politeness meter: {chivalryScore}
      </div>
      <div id="ChivalryMessage" className={`mb-4 ${messageColor}`}>
        {message}
      </div>
      <div id="prediction" className="mb-4">
        Prediction: {prediction}, Probability: {probability}
      </div>
      <textarea
        id="transcript"
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        className="w-full h-32 mb-4 p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
      ></textarea>
      <button
        onClick={AnalyzeSentiment}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Analyze Sentiment
      </button>
    </div>
  );
};

export default AudioAnalysis;
