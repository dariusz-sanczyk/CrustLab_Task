import { User } from "../entities/User";
import { Currency } from "../types/Currency.enum";
import { Operation } from "../types/Operation";
import { OperationType } from "../types/OperationType";
export class MoneyPlatform {

    private users: Map<string, User>;
    private commissionRate: number = 0.05;
    private profit: Record<OperationType, Record<Currency, number>>;

    createUser(userId: string): User {
        if (this.users.has(userId)) {
            throw new Error(`User with ID ${userId} already exists.`);
        }
        const user = new User(userId);
        this.users.set(userId, user);
        return user;
    };

    getUser(userId: string): User {
        const user = this.users.get(userId);
        if (!user) {
            throw new Error(`Could not find user with ID ${userId}`);
        }
        return user;
    };

    addProfit(opType: OperationType, curr: Currency, commision: number) {
        if (!this.profit[opType]) {
            this.profit[opType] = { PLN: 0, EUR: 0, USD: 0 };
        };
        this.profit[opType][curr] += commision;
    };

    deposit(userId: string, currency: Currency, amount: number): Operation {
        if (amount <= 0) {
            throw new Error("The deposit value must be greater then 0.");
        }
        const user = this.getUser(userId);
        const account = user.getAccount(currency);
        const commission = amount * this.commissionRate;
        const operation = account.deposit(amount, commission, OperationType.DEPOSIT);
        this.addProfit(OperationType.DEPOSIT, currency, commission);
        return operation;
    };

    withdraw(userId: string, currency: Currency, amount: number): Operation {
        if (amount <= 0) {
            throw new Error("The withdraw value must be greater then 0.");
        }
        const user = this.getUser(userId);
        const account = user.getAccount(currency);
        const commission = amount * this.commissionRate;
        const operation = account.withdraw(amount, commission, OperationType.WITHDRAWAL);
        this.addProfit(OperationType.WITHDRAWAL, currency, commission);
        return operation;
    };
};