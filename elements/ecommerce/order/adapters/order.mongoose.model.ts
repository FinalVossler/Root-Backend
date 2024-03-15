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
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
  },
  status: {
    type: mongoose.SchemaTypes.String,
    required: true,
  },
});

const Order = mongoose.model<IOrder, IOrderModel>("order", OrderSchema);

export default Order;
