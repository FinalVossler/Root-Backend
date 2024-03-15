import mongoose from "mongoose";

import IShippingMethod from "../ports/interfaces/IShippingMethod";
import translatedTextSchema from "../../../translatedText/adapters/translatedText.mongooseSchema";

const ShippingMethodSchema = new mongoose.Schema<IShippingMethod>({
  name: {
    type: translatedTextSchema,
    required: true,
  },
  price: {
    type: mongoose.SchemaTypes.Number,
    required: true,
  },
});

const ShippingMethod = mongoose.model("shippingMethod", ShippingMethodSchema);

export default ShippingMethod;
