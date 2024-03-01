import { useAuthContext } from "../../context/AuthContext";

import { extractTime } from "../../utils/extractTime";
import useConversation from "../../zustand/useConversation";

const Message = ({ message, sentiment }) => {
  const { authUser } = useAuthContext();
  const { selectedConversation } = useConversation();
  const fromMe = message.senderId === authUser._id;
  const formattedTime = extractTime(message.createdAt);
  const chatClassName = fromMe ? "chat-end" : "chat-start";
  const profilePic = fromMe
    ? authUser.profilePic
    : selectedConversation?.profilePic;
  const bubbleBgColor = fromMe ? "bg-blue-500" : "";

  const shakeClass = message.shouldShake ? "shake" : "";
  const prediction = sentiment?.predictions[0]?.prediction;
  console.log(prediction);
  let borderColor;
  if (prediction === "positive") {
    borderColor = "green";
  } else if (prediction === "negative") {
    borderColor = "red";
  } else {
    borderColor = "yellow";
  }
  console.log(borderColor);
  const border = `border-2 border-${borderColor}-500`;
  return (
    <div className={`chat ${chatClassName}`}>
      <div className="chat-image avatar">
        <div className="w-10 rounded-full">
          <img alt="Tailwind CSS chat bubble component" src={profilePic} />
        </div>
      </div>
      {border && (
        <div
          className={`chat-bubble text-white  ${shakeClass} pb-2`}
          style={{
            backgroundColor: `${borderColor}`,
          }}
        >
          {message.message}
        </div>
      )}
      <div className="chat-footer opacity-50 text-xs flex gap-1 items-center">
        {formattedTime}
      </div>
    </div>
  );
};
export default Message;
