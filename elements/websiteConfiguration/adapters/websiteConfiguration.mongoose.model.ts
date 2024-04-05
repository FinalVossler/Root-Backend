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
    withEcommerce: {
      type: mongoose.SchemaTypes.Boolean,
      default: false,
    },
    theme: {
      type: {
        darkTextColor: mongoose.SchemaTypes.String,
        lightTextColor: mongoose.SchemaTypes.String,
        primary: mongoose.SchemaTypes.String,
        darkerPrimary: mongoose.SchemaTypes.String,
        lighterPrimary: mongoose.SchemaTypes.String,
        secondary: mongoose.SchemaTypes.String,
        disabledColor: mongoose.SchemaTypes.String,
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
        lightTextColor: "#FFFFFF",

        primary: "#09bf96",
        darkerPrimary: "#2DB39E",
        lighterPrimary: "#ecf2f0",
        secondary: "#7aeaaf",
        disabledColor: "#efefef",
        errorColor: "red",
        borderColor: "#9f9f9f",
        formMaxWidth: "470px",
        transparentBackground: "#FFFFFF",
        backgroundColor: "#F7F8FB",
        contentBackgroundColor: "#d3f8eb",
        subContentBackgroundColor: "#FFFFFF",
        boxColor: "#FFFFFF",
        boxShadow: "0px 1px 4px rgb(165 165 165 / 25%)",
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
    automaticallyAssignedRoleAtRegistration: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "role",
    },
    isSideMenuOpenByDefault: {
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
