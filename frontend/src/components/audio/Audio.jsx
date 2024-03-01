import React, { useState } from "react";
import { AssemblyAI } from "assemblyai";
import { ReactMic } from "react-mic";

const Audio = () => {
  const [transcript, setTranscript] = useState("");
  const [sentimentResults, setSentimentResults] = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);

  const handleFileChange = (event) => {
    setAudioFile(event.target.files[0]);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handleTranscribe = async () => {
    if (!audioFile && !recordedBlob) {
      console.error("Please select an audio file or record one.");
      return;
    }

    const client = new AssemblyAI({
      apiKey: "e11533533e7c415293b8754e8fd8ad2f",
    });

    const formData = new FormData();
    if (audioFile) {
      formData.append("file", audioFile);
    } else if (recordedBlob) {
      const blob = new Blob([recordedBlob.blob], { type: "audio/wav" });
      formData.append("file", blob);
    }

    const params = {
      audio_file: formData,
      sentiment_analysis: true, // Enable sentiment analysis
    };

    try {
      const { data } = await client.transcribe(params);
      setTranscript(data.text);
      setSentimentResults(data.sentiment_analysis_results);
    } catch (error) {
      console.error("Error transcribing audio:", error);
    }
  };

  const onData = (recordedBlob) => {
    setRecordedBlob(recordedBlob);
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Upload Audio File:</h2>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <button
        onClick={handleTranscribe}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
      >
        Transcribe
      </button>

      <h2 className="text-xl font-bold mt-8 mb-4">Or Record Audio:</h2>
      <ReactMic
        record={isRecording}
        className="sound-wave"
        onStop={handleStopRecording}
        onData={onData}
      />
      <div className="flex justify-center mt-4">
        <button
          onClick={handleStartRecording}
          disabled={isRecording}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-4"
        >
          Start Recording
        </button>
        <button
          onClick={handleStopRecording}
          disabled={!isRecording}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Stop Recording
        </button>
      </div>

      {recordedBlob && (
        <div className="mt-4">
          <audio controls>
            <source src={recordedBlob.blobURL} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {transcript && (
        <div>
          <h2 className="text-xl font-bold mt-8 mb-4">Transcript:</h2>
          <p>{transcript}</p>
        </div>
      )}

      {sentimentResults.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mt-8 mb-4">Sentiment Analysis:</h2>
          {sentimentResults.map((result, index) => (
            <div key={index}>
              <p>{result.text}</p>
              <p>Sentiment: {result.sentiment}</p>
              <p>Confidence: {result.confidence}</p>
              <p>
                Timestamp: {result.start} - {result.end}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Audio;
