import { Currency } from "../types/Currency.enum";
import { Operation } from "../types/Operation";
import { OperationType } from "../types/OperationType";
import { generateID } from "../utils/generateID";

export class Account {
    public currency: Currency;
    public balance: number;
    public operations: Operation[];

    constructor(currency: Currency) {
        this.currency = currency;
        this.balance = 0;
        this.operations = [];
    };

    public deposit(
        userID: string,
        amount: number,
        commission: number,
        opType: OperationType = OperationType.DEPOSIT,
        additionalInfo?: any
    ): Operation {
        const totalDeposit = amount - commission;
        this.balance += totalDeposit;
        const op: Operation = {
            id: generateID(),
            userID,
            type: opType,
            currency: this.currency,
            amount,
            commission,
            date: new Date(),
            additionalInfo: additionalInfo || {}
        };
        this.operations.push(op);
        return op;
    };

    public withdraw(
        userID: string,
        amount: number,
        commission: number,
        opType: OperationType = OperationType.WITHDRAWAL,
        additionalInfo?: any
    ): Operation {
        const totalWithdraw = amount + commission;
        if (totalWithdraw > this.balance) {
            throw new Error("Insufficient funds in the account.");
        };
        this.balance -= totalWithdraw;
        const op: Operation = {
            id: generateID(),
            userID,
            type: opType,
            currency: this.currency,
            amount,
            commission,
            date: new Date(),
            additionalInfo: additionalInfo || {}
        };
        this.operations.push(op);
        return op;
    };

    public getOperations(filter?: {
        type?: OperationType;
        fromDate?: Date;
        toDate?: Date;
    }): Operation[] {
        return this.operations.filter((op) => {
            if (filter?.type && op.type !== filter.type) {
                return false;
            };
            if (filter?.fromDate && op.date < filter.fromDate) {
                return false;
            };
            if (filter?.toDate && op.date > filter.toDate) {
                return false;
            };
            return true;
        });
    };
};