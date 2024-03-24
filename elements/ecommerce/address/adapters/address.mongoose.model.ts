import mongoose from "mongoose";

import IAddress from "../ports/interfaces/IAddress";

const AddressSchema = new mongoose.Schema<IAddress>({
  country: { type: mongoose.SchemaTypes.String },
  postalCode: { type: mongoose.SchemaTypes.String },
  addressLine1: { type: mongoose.SchemaTypes.String },
  addressLine2: { type: mongoose.SchemaTypes.String },
  region: { type: mongoose.SchemaTypes.String },
  city: { type: mongoose.SchemaTypes.String },
  user: { type: mongoose.SchemaTypes.ObjectId, ref: "user" },
  isDefault: { type: mongoose.SchemaTypes.Boolean },
});

const Address = mongoose.model("address", AddressSchema);

export default Address;
