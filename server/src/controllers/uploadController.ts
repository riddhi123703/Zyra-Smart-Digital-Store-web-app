import { Request, Response } from "express";
import { cloudinary } from "../config/cloudinary";
import { Readable } from "stream";

const uploadToCloudinary = (buffer: Buffer, folder: string): Promise<any> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    Readable.from(buffer).pipe(stream);
  });

export const uploadImage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file provided" });
      return;
    }
    const result = await uploadToCloudinary(req.file.buffer, "zyra/products");
    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteImage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { publicId } = req.body;
    await cloudinary.uploader.destroy(publicId);
    res.json({ success: true, message: "Image deleted" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
