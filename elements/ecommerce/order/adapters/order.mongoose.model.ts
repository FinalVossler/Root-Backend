import mongoose from "mongoose";

import IOrder from "../ports/interfaces/IOrder";

interface IOrderModel extends mongoose.Model<IOrder> {}

const OrderSchema = new mongoose.Schema<IOrder>({
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "user",
  },
  date: {
    type: mongoose.SchemaTypes.String,
    required: true,
  },
  total: {
    type: mongoose.SchemaTypes.Number,
    required: true,
  },
  shippingMethod: {
    type: mongoose.SchemaTypes.String,
    required: true,
  },
  checkoutSessionId: {
    type: mongoose.SchemaTypes.String,
  },
  products: [
    {
      product: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "entity",
      },
      quantity: {
        type: mongoose.SchemaTypes.Number,
      },
    },
  ],
  shippingAddress: {
    country: { type: mongoose.SchemaTypes.String },
    postalCode: { type: mongoose.SchemaTypes.String },
    addressLine1: { type: mongoose.SchemaTypes.String },
    addressLine2: { type: mongoose.SchemaTypes.String },
    region: { type: mongoose.SchemaTypes.String },
    city: { type: mongoose.SchemaTypes.String },
  },
  status: {
    type: mongoose.SchemaTypes.String,
    required: true,
  },
});

const Order = mongoose.model<IOrder, IOrderModel>("order", OrderSchema);

export default Order;
