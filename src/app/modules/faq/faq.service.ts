import { QueryBuilder } from "../../utils/QueryBuilder";
import { IFaq } from "./faq.interface";
import { Faq } from "./faq.model";

const createFaq = async (payload: IFaq) => {
    const result = await Faq.create(payload);
    return result;
};

const getAllFaqs = async (query: Record<string, string>) => {
    // Allows searching for specific keywords in the questions or answers
    const searchableFields = ['title', 'description'];

    const queryBuilder = new QueryBuilder(Faq.find(), query)
        .search(searchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        queryBuilder.build(),
        queryBuilder.getMeta()
    ]);

    return { data, meta };
};

const getSingleFaq = async (id: string) => {
    const result = await Faq.findById(id);
    if (!result) {
        throw new Error("FAQ not found");
    }
    return result;
};

const updateFaq = async (id: string, payload: Partial<IFaq>) => {
    const result = await Faq.findByIdAndUpdate(id, payload, { 
        new: true, 
        runValidators: true 
    });
    if (!result) {
        throw new Error("FAQ not found");
    }
    return result;
};

const deleteFaq = async (id: string) => {
    const result = await Faq.findByIdAndDelete(id);
    if (!result) {
        throw new Error("FAQ not found");
    }
    return null;
};

export const FaqService = {
    createFaq,
    getAllFaqs,
    getSingleFaq,
    updateFaq,
    deleteFaq
};