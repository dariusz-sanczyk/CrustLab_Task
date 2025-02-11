import { Currency } from "../types/Currency.enum";
import { Operation } from "../types/Operation";
import { OperationType } from "../types/OperationType";
import { generateID } from "../utils/generateID";

export class Account {
    currency: Currency;
    balance: number;
    operations: Operation[];

    constructor(currency: Currency) {
        this.currency = currency;
        this.balance = 0;
        this.operations = [];
    };

    deposit(
        amount: number,
        commissionValue: number,
        opType: OperationType = OperationType.DEPOSIT
    ): Operation {
        const totalDeposit = amount - commissionValue;
        this.balance += totalDeposit;
        const op: Operation = {
            id: generateID(),
            type: opType,
            currency: this.currency,
            amount,
            commissionValue,
            date: new Date()
        };
        this.operations.push(op);
        return op;
    };

    withdraw(
        amount: number,
        commissionValue: number,
        opType: OperationType = OperationType.WITHDRAWAL
    ): Operation {
        const totalWithdraw = amount + commissionValue;
        if (totalWithdraw > this.balance) {
            throw new Error("Insufficient funds in the account.");
        }
        this.balance -= totalWithdraw;
        const op: Operation = {
            id: generateID(),
            type: opType,
            currency: this.currency,
            amount,
            commissionValue,
            date: new Date()
        };
        this.operations.push(op);
        return op;
    };
}