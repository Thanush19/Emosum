import axios from "axios";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import Keyword from "../models/keyword.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const extractKeywords = async (message) => {
  try {
    const response = await axios.post(
      "https://api.edenai.run/v2/text/keyword_extraction",
      {
        providers: "microsoft, amazon",
        text: message,
        language: "en",
        fallback_providers: "",
      },
      {
        headers: {
          authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYmMzNmYyYzEtOTlhYy00MTI1LWEyYWEtN2I0MWUyNjQ3MzM3IiwidHlwZSI6ImFwaV90b2tlbiJ9.pX6C9IyvIYnpy6SSwbcA7m5ozegYLFhAvknq_OVTb0w",
        },
      }
    );

    return response.data.keywords;
  } catch (error) {
    console.error("Error extracting keywords: ", error.message);
    return [];
  }
};
