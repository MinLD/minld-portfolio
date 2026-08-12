import { cloudinaryAdapter, type UploadedMedia } from './cloudinary.adapter.js'

export const mediaService = {
  uploadImage(file: Express.Multer.File, folder: string): Promise<UploadedMedia> {
    return cloudinaryAdapter.uploadBuffer(file.buffer, folder)
  },

  deleteImage(publicId: string) {
    return cloudinaryAdapter.delete(publicId)
  },
}
