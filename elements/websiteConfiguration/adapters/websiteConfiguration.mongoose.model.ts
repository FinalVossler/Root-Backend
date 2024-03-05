import mongoose from "mongoose";

import translatedTextSchema from "../../translatedText/adapters/translatedText.mongooseSchema";
import IWebsiteConfiguration from "../ports/interfaces/IWebsiteConfiguration";

interface IWebsiteConfigurationModel
  extends mongoose.Model<IWebsiteConfiguration> {}

const WebsiteConfigurationSchema = new mongoose.Schema<IWebsiteConfiguration>(
  {
    title: {
      type: mongoose.SchemaTypes.String,
    },
    description: translatedTextSchema,
    email: {
      type: mongoose.SchemaTypes.String,
    },
    phoneNumber: {
      type: mongoose.SchemaTypes.String,
    },
    tabTitle: {
      type: mongoose.SchemaTypes.String,
    },
    mainLanguages: [
      {
        type: mongoose.SchemaTypes.String,
      },
    ],
    withChat: {
      type: mongoose.SchemaTypes.Boolean,
    },
    withRegistration: {
      type: mongoose.SchemaTypes.Boolean,
      default: true,
    },
    withTaskManagement: {
      type: mongoose.SchemaTypes.Boolean,
      default: true,
    },
    theme: {
      type: {
        darkTextColor: mongoose.SchemaTypes.String,
        lightTextColor: mongoose.SchemaTypes.String,
        primary: mongoose.SchemaTypes.String,
        darkerPrimary: mongoose.SchemaTypes.String,
        lighterPrimary: mongoose.SchemaTypes.String,
        secondary: mongoose.SchemaTypes.String,
        errorColor: mongoose.SchemaTypes.String,
        borderColor: mongoose.SchemaTypes.String,
        formMaxWidth: mongoose.SchemaTypes.String,
        backgroundColor: mongoose.SchemaTypes.String,
        contentBackgroundColor: mongoose.SchemaTypes.String,
        boxColor: mongoose.SchemaTypes.String,
        transparentBackground: mongoose.SchemaTypes.String,
        subContentBackgroundColor: mongoose.SchemaTypes.String,
        boxShadow: mongoose.SchemaTypes.String,
      },
      default: {
        darkTextColor: "#4c4c4d",
        lightTextColor: "white",
        primary: "#9885ec",
        darkerPrimary: "#795ef0",
        lighterPrimary: "#b0a2f1",
        secondary: "#27125e",
        errorColor: "red",
        borderColor: "#e0e0e0",
        formMaxWidth: "400px",
        transparentBackground: "#0a0b1399",
        backgroundColor: "#131222",
        contentBackgroundColor: "#0a0b13",
        subContentBackgroundColor: "#08041e",
        boxColor: "#3f3c51",
        boxShadow: "1px 2px 5px 4px black",
      },
    },
    staticText: {
      type: mongoose.SchemaTypes.Mixed,
    },
    tabIcon: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "file",
    },
    logo1: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "file",
    },
    logo2: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "file",
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
