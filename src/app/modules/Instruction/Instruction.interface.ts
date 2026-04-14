export interface IInstruction {
    name: string;
    slug?: string;
    thumbnail?: string; // Optional image
    pdfFile: string;    // Required PDF URL
}