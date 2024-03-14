import mongoose from "mongoose";

import ICart from "../ports/interfaces/ICart";

interface ICartModel extends mongoose.Model<ICart> {}

const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "user",
    required: true,
  },
  products: [
    {
      quantity: mongoose.SchemaTypes.Number,
      product: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "entity",
      },
    },
  ],
});

const Cart = mongoose.model<ICart, ICartModel>("cart", CartSchema);

export default Cart;
