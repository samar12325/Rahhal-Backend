export declare const CONTACT_TYPES: readonly ["suggestion", "complaint", "inquiry", "partnership"];
export type ContactType = (typeof CONTACT_TYPES)[number];
export declare class CreateContactDto {
    name: string;
    email: string;
    type: ContactType;
    message: string;
}
