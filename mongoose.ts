import mongoose from "mongoose";

const connect = async (connectionUri: string = "") => {
  mongoose.set("strictQuery", true);

  // @ts-ignore
  await mongoose.connect(connectionUri || process.env.MONGO_URI, {});
};

export default connect;
