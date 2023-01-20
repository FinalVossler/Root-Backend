import mongoose from "mongoose";

const connect = async () => {
  mongoose.set("strictQuery", true);

  // @ts-ignore
  await mongoose.connect(process.env.MONGO_URI, {});

  console.log("connected to mongoose");
};

export default connect;
