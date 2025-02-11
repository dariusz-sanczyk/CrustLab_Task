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
        fee: number,
        opType: OperationType = OperationType.DEPOSIT
    ): Operation {
        if (amount <= 0) {
            throw new Error("The deposit value must be greater then 0.");
        };
        const totalDeposit = amount - (amount * fee);
        this.balance += totalDeposit;
        const op: Operation = {
            id: generateID(),
            type: opType,
            currency: this.currency,
            amount,
            fee,
            date: new Date()
        };
        this.operations.push(op);
        return op;
    };

    withdraw(
        amount: number,
        fee: number,
        opType: OperationType = OperationType.WITHDRAWAL
    ): Operation {
        if (amount <= 0) {
            throw new Error("The withdraw value must be greater then 0.");
        }
        const totalWithdraw = amount + (amount * fee);
        if (totalWithdraw > this.balance) {
            throw new Error("Insufficient funds in the account.");
        }
        this.balance -= totalWithdraw;
        const op: Operation = {
            id: generateID(),
            type: opType,
            currency: this.currency,
            amount,
            fee,
            date: new Date()
        };
        this.operations.push(op);
        return op;
    };
}