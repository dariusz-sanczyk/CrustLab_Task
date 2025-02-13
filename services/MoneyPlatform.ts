import { User } from "../entities/User";
import { Currency } from "../types/Currency.enum";
import { Operation } from "../types/Operation";
import { OperationType } from "../types/OperationType";
import { ExchangeRates } from "../types/ExchangeRates";
export class MoneyPlatform {

    private users: Map<string, User>;
    private commissionRate: number;
    private profit: Record<OperationType, Record<Currency, number>>;
    private allOperations: Operation[];
    private exchangeRates: ExchangeRates;

    constructor(commissionRate: number, exchangeRates: ExchangeRates) {
        if (commissionRate < 0) {
            throw new Error("Commission rate should be greater then 0.");
        };
        this.users = new Map<string, User>();
        this.commissionRate = commissionRate;
        this.allOperations = [];
        this.profit = {
            [OperationType.DEPOSIT]: { PLN: 0, EUR: 0, USD: 0 },
            [OperationType.WITHDRAWAL]: { PLN: 0, EUR: 0, USD: 0 },
            [OperationType.TRANSFER_OUT]: { PLN: 0, EUR: 0, USD: 0 },
            [OperationType.TRANSFER_IN]: { PLN: 0, EUR: 0, USD: 0 },
            [OperationType.EXCHANGE_OUT]: { PLN: 0, EUR: 0, USD: 0 },
            [OperationType.EXCHANGE_IN]: { PLN: 0, EUR: 0, USD: 0 },
        };
        this.exchangeRates = exchangeRates;
    };

    // User methods

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

    //  Profit methods

    private addProfit(opType: OperationType, curr: Currency, commision: number) {
        if (!this.profit[opType]) {
            this.profit[opType] = { PLN: 0, EUR: 0, USD: 0 };
        };
        this.profit[opType][curr] += commision;
    };

    public getProfit(): Record<OperationType, Record<Currency, number>> {
        return this.profit;
    };

    //  Operations methods

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

    public transfer(
        sourceUserId: string,
        targetUserId: string,
        currency: Currency,
        amount: number
    ): { fromOperation: Operation; toOperation: Operation } {
        if (amount <= 0) {
            throw new Error("transfer value must be greater then 0.");
        };
        const sourceUser = this.getUser(sourceUserId);
        const targetUser = this.getUser(targetUserId);
        const sourceAccount = sourceUser.getAccount(currency);
        const targetAccount = targetUser.getAccount(currency);
        const commission = amount * this.commissionRate;
        const fromOperation = sourceAccount.withdraw(
            amount,
            commission,
            OperationType.TRANSFER_OUT,
            { targetUser: targetUserId }
        );
        const toOperation = targetAccount.deposit(
            amount,
            0,
            OperationType.TRANSFER_IN,
            { sourceUser: sourceUserId }
        );
        this.allOperations.push(fromOperation, toOperation);
        this.addProfit(OperationType.TRANSFER_OUT, currency, commission);
        return { fromOperation, toOperation };
    };

    public exchange(
        userId: string,
        fromCurrency: Currency,
        toCurrency: Currency,
        amount: number
    ): { exchangeFrom: Operation; exchangeTo: Operation } {
        if (amount <= 0) {
            throw new Error("Exchange value must be greater then 0.");
        };
        if (fromCurrency === toCurrency) {
            throw new Error("Currencies to exchange must differ.");
        };

        const user = this.getUser(userId);
        const sourceAccount = user.getAccount(fromCurrency);
        if (amount > sourceAccount.balance) {
            throw new Error("Insufficient funds in the account.");
        };

        const targetAccount = user.getAccount(toCurrency);
        const exchangeFrom = sourceAccount.withdraw(
            amount,
            0,
            OperationType.EXCHANGE_OUT,
            { targetCurrency: toCurrency }
        );
        const convertedAmount = this.convertCurrencies(fromCurrency, toCurrency, amount);
        const commission = convertedAmount * this.commissionRate;
        this.addProfit(OperationType.EXCHANGE_IN, toCurrency, commission);
        const netAmount = convertedAmount - commission;
        const exchangeTo = targetAccount.deposit(
            netAmount,
            0,
            OperationType.EXCHANGE_IN,
            {
                sourceCurrency: fromCurrency,
                originalAmount: amount,
                commission,
                netAmount: netAmount
            }
        );
        this.allOperations.push(exchangeFrom, exchangeTo);
        return { exchangeFrom, exchangeTo };
    };

    private convertCurrencies(from: Currency, to: Currency, amount: number): number {
        const valueInPLN = amount * this.exchangeRates[from];
        return valueInPLN / this.exchangeRates[to];
    };
};