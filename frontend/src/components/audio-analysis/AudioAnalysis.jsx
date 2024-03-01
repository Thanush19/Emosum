import React, { useState } from "react";

const API_KEY_NLP = "AIzaSyBMX_ZaUPUUE5wqUDZ-UId0PSsnw94aoHU";
const API_KEY_ASSEMBLYAI = "2a91e62981a84432be2b19486ee4bdf9";

const AudioAnalysis = () => {
  const [transcript, setTranscript] = useState("");
  const [chivalryScore, setChivalryScore] = useState(0);
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");

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
      .then((data) => {
        let analysis = "";
        for (let i = 0; i < data.sentences.length; i++) {
          analysis +=
            data.sentences[i].text.content +
            "\n\tSentiment: " +
            data.sentences[i].sentiment.score +
            "\n";
        }

        document.getElementById("AudioAnalysis").innerHTML = analysis;
        let chivalryScore = parseInt(
          (data.documentSentiment.score *
            data.documentSentiment.magnitude *
            100) |
            0
        );
        setChivalryScore(chivalryScore);

        if (chivalryScore >= 0) {
          setMessage("How chivalrous of you!");
          setMessageColor("rgb(152, 255, 152)");
        } else {
          setMessage("An honorable knight should not behave in such a way!");
          setMessageColor("rgb(255, 56, 0)");
        }
      });
  };

  return (
    <div>
      <input type="file" id="file" onChange={fileValidation} />
      <div className="file-name" style={{ display: "none" }}></div>
      <div id="TranscriptLoading" style={{ display: "none" }}></div>
      <div id="AudioAnalysis"></div>
      <div id="main-sentiment-output">Chivalry Score: {chivalryScore}</div>
      <div id="ChivalryMessage" style={{ color: messageColor }}>
        {message}
      </div>
      <textarea
        id="transcript"
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
      ></textarea>
      <button onClick={AnalyzeSentiment}>Analyze Sentiment</button>
    </div>
  );
};

export default AudioAnalysis;
