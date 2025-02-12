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
        amount: number,
        commission: number,
        opType: OperationType = OperationType.DEPOSIT
    ): Operation {
        const totalDeposit = amount - commission;
        this.balance += totalDeposit;
        const op: Operation = {
            id: generateID(),
            type: opType,
            currency: this.currency,
            amount,
            commission,
            date: new Date()
        };
        this.operations.push(op);
        return op;
    };

    public withdraw(
        amount: number,
        commission: number,
        opType: OperationType = OperationType.WITHDRAWAL
    ): Operation {
        const totalWithdraw = amount + commission;
        if (totalWithdraw > this.balance) {
            throw new Error("Insufficient funds in the account.");
        };
        this.balance -= totalWithdraw;
        const op: Operation = {
            id: generateID(),
            type: opType,
            currency: this.currency,
            amount,
            commission,
            date: new Date()
        };
        this.operations.push(op);
        return op;
    };
}