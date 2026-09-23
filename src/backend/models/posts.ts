import mongoose, { type Document } from 'mongoose'

export interface IPost extends Document {
  title: string
  description: string
  category: string
  date: string
  createdAt?: Date
  updatedAt?: Date
}

const postSchema = new mongoose.Schema<IPost>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, maxlength: 50 },
    date: { type: String, required: true, trim: true }
  },
  {
    timestamps: true
  }
)

export default mongoose.model<IPost>('Post', postSchema)