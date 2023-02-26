import mongoose from "mongoose";

export interface IWebsiteConfiguration {
  _id?: mongoose.ObjectId;
  title?: string;
  email?: string;
  phoneNumber?: string;
  tabTitle?: string;
}

interface IWebsiteConfigurationModel
  extends mongoose.Model<IWebsiteConfiguration> {}

const websiteConfigurationSchema = new mongoose.Schema<IWebsiteConfiguration>(
  {
    title: {
      type: mongoose.SchemaTypes.String,
    },
    email: {
      type: mongoose.SchemaTypes.String,
    },
    phoneNumber: {
      type: mongoose.SchemaTypes.String,
    },
    tabTitle: {
      type: mongoose.SchemaTypes.String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<
  IWebsiteConfiguration,
  IWebsiteConfigurationModel
>("websiteConfiguration", websiteConfigurationSchema);
