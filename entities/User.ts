import { Currency } from "../types/Currency.enum";
import { Account } from "./Account";

export class User {
    id: string;
    accounts: Map<Currency, Account>;

    constructor(id: string) {
        this.id = id;
        this.accounts = new Map<Currency, Account>();
        for (const currency of Object.values(Currency)) {
            this.accounts.set(currency, new Account(currency));
        };
    };

    getAccount(currency: Currency): Account {
        const account = this.accounts.get(currency);
        if (!account) {
            throw new Error(`Could not find ${currency} account.`);
        };
        return account;
    };
};