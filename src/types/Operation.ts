import { Currency } from "./Currency.enum";
import { OperationType } from "./OperationType";

export interface Operation {
    id: string;
    userID: string;
    type: OperationType;
    currency: Currency;
    amount: number;
    commission: number;
    date: Date;
    additionalInfo?: any;
};