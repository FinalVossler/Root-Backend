import mongoose from "mongoose";

export interface IWebsiteConfiguration {
  _id?: mongoose.ObjectId;
  title?: string;
  email?: string;
  phoneNumber?: string;
  tabTitle?: string;
  withChat?: boolean;
  withRegistration?: boolean;
}

interface IWebsiteConfigurationModel
  extends mongoose.Model<IWebsiteConfiguration> {}

const WebsiteConfigurationSchema = new mongoose.Schema<IWebsiteConfiguration>(
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
    withChat: {
      type: mongoose.SchemaTypes.Boolean,
    },
    withRegistration: {
      type: mongoose.SchemaTypes.Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<
  IWebsiteConfiguration,
  IWebsiteConfigurationModel
>("websiteConfiguration", WebsiteConfigurationSchema);
