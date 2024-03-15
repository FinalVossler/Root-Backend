import mongoose from "mongoose";

import translatedTextSchema from "../../../translatedText/adapters/translatedText.mongooseSchema";
import IPaymentMethod from "../ports/interfaces/IPaymentMethod";

const PaymentMethodSchema = new mongoose.Schema<IPaymentMethod>({
  name: {
    type: translatedTextSchema,
    required: true,
  },
  slug: {
    type: mongoose.SchemaTypes.String,
    required: true,
  },
});

const PaymentMethod = mongoose.model("paymentMethod", PaymentMethodSchema);

export default PaymentMethod;
