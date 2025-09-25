import mongoose, { Schema } from "mongoose";

const productSummarySchema = new mongoose.Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: false },
    input: {
      title: String,
      description: String,
      price: Schema.Types.Mixed,
      features: [String],
      specs: Schema.Types.Mixed,
      sourceUrl: String,
    },
    bullets: [String],
  },
  { timestamps: true }
);
const ProductSummary = mongoose.model("ProductSummary", productSummarySchema);
export default ProductSummary;
