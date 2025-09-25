import { Schema, model } from "mongoose";

const productComparisonSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: false },
    inputs: [
      {
        title: String,
        description: String,
        price: Schema.Types.Mixed,
        features: [String],
        specs: Schema.Types.Mixed,
        sourceUrl: String,
      },
    ],
    criteria: {
      budget: Schema.Types.Mixed,
      quality: String,
      features: [String],
    },
    compared: [
      {
        title: String,
        description: String,
        price: Schema.Types.Mixed,
        features: [String],
        specs: Schema.Types.Mixed,
        sourceUrl: String,
        pros: [String],
        cons: [String],
        bullets: [String],
        score: Number,
      },
    ],
    summary: {
      priceSummary: String,
      best: {
        title: String,
        price: Schema.Types.Mixed,
        reason: String,
        score: Number,
      },
    },
  },
  { timestamps: true }
);

export default model("ProductComparison", productComparisonSchema);
