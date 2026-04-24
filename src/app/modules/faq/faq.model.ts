import { model, Schema } from "mongoose";
import { IFaq } from "./faq.interface";

const FaqSchema = new Schema<IFaq>({
    title: { 
        type: String, 
        required: [true, "FAQ title is required"],
        trim: true
    },
    description: { 
        type: String, 
        required: [true, "FAQ description is required"],
        trim: true
    }
}, {
    timestamps: true
});

export const Faq = model<IFaq>("Faq", FaqSchema);