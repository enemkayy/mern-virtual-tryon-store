// This file is for configuring Cloudinary, a cloud-based image and video management service.
// It allows you to upload, store, and manage media assets in the cloud.
// The configuration typically includes setting up your Cloudinary credentials (cloud name, API key, and API secret) to enable your application to interact with the Cloudinary API for media management tasks.

import { v2 as cloudinary } from "cloudinary";

const connectCloudinary = async () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
 };

export default connectCloudinary;
