import mongoose from "mongoose";

const keywordSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    keywords: [String],
  },
  { timestamps: true }
);

const Keyword = mongoose.model("Keyword", keywordSchema);

export default Keyword;
