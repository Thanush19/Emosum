import axios from "axios";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const DashBoard = () => {
  const [score, setScore] = useState(null);
  const [authUser, setAuthUser] = useState(
    JSON.parse(localStorage.getItem("chat-user")) || null
  );
  const user_id = authUser ? authUser._id : null;

  useEffect(() => {
    const getSentimentScore = async () => {
      try {
        if (user_id) {
          const response = await axios.get(`/api/sentiment-score/${user_id}`);
          setScore(response.data);
        }
      } catch (err) {
        toast.error(err.message);
      }
    };

    getSentimentScore(); // Call the function when the component mounts or when user_id changes
  }, [user_id]);

  return (
    <div>
      <p>Sentiment Score:</p>
      {score ? (
        <ul>
          {score.map((item) => (
            <li key={item.id}>
              Probability: {item.predictions[0].probability}
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default DashBoard;
