import { User } from "../entities/User";
import { Currency } from "../types/Currency.enum";
import { Operation } from "../types/Operation";
import { OperationType } from "../types/OperationType";
export class MoneyPlatform {

    private users: Map<string, User>;
    private commissionRate: number;
    private profit: Record<OperationType, Record<Currency, number>>;
    private allOperations: Operation[];

    constructor(commissionRate: number) {
        if (commissionRate < 0) {
            throw new Error("Commission rate should be greater then 0.");
        };
        this.users = new Map<string, User>();
        this.commissionRate = commissionRate;
        this.allOperations = [];
        this.profit = {
            [OperationType.DEPOSIT]: { PLN: 0, EUR: 0, USD: 0 },
            [OperationType.WITHDRAWAL]: { PLN: 0, EUR: 0, USD: 0 },
            [OperationType.TRANSFER]: { PLN: 0, EUR: 0, USD: 0 },
            [OperationType.EXCHANGE]: { PLN: 0, EUR: 0, USD: 0 }
        };
    };

    public createUser(userId: string): User {
        if (this.users.has(userId)) {
            throw new Error(`User with ID ${userId} already exists.`);
        };
        const user = new User(userId);
        this.users.set(userId, user);
        return user;
    };

    private getUser(userId: string): User {
        const user = this.users.get(userId);
        if (!user) {
            throw new Error(`Could not find user with ID ${userId}`);
        };
        return user;
    };

    public getAccountBalance(userId: string, currency: Currency): number {
        const user = this.getUser(userId);
        return user.getAccount(currency).balance;
    };

    private addProfit(opType: OperationType, curr: Currency, commision: number) {
        if (!this.profit[opType]) {
            this.profit[opType] = { PLN: 0, EUR: 0, USD: 0 };
        };
        this.profit[opType][curr] += commision;
    };

    public getProfit(): Record<OperationType, Record<Currency, number>> {
        return this.profit;
    };

    public deposit(userId: string, currency: Currency, amount: number): Operation {
        if (amount <= 0) {
            throw new Error("The deposit value must be greater then 0.");
        };
        const user = this.getUser(userId);
        const account = user.getAccount(currency);
        const commission = amount * this.commissionRate;
        const operation = account.deposit(amount, commission, OperationType.DEPOSIT);
        this.addProfit(OperationType.DEPOSIT, currency, commission);
        this.allOperations.push(operation);
        return operation;
    };

    public withdraw(userId: string, currency: Currency, amount: number): Operation {
        if (amount <= 0) {
            throw new Error("The withdraw value must be greater then 0.");
        };
        const user = this.getUser(userId);
        const account = user.getAccount(currency);
        const commission = amount * this.commissionRate;
        const operation = account.withdraw(amount, commission, OperationType.WITHDRAWAL);
        this.addProfit(OperationType.WITHDRAWAL, currency, commission);
        this.allOperations.push(operation);
        return operation;
    };
};