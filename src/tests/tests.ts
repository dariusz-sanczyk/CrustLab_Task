import { ExchangeRates } from "../types/ExchangeRates";
import { MoneyPlatform } from "../services/MoneyPlatform.service";
import { Currency } from "../types/Currency.enum";
import { OperationType } from "../types/OperationType";

function runTests() {
    // Initialize platform with 2% commission and exchange rates.
    const commissionRate = 0.02;
    const exchangeRates: ExchangeRates = {
        [Currency.PLN]: 1,
        [Currency.EUR]: 4.2,
        [Currency.USD]: 4.0
    };

    const platform = new MoneyPlatform(commissionRate, exchangeRates);

    platform.createUser("user1");
    platform.createUser("user2");

    // User1 deposit 500 PLN – the commission is 10 PLN, net amount is 490 PLN
    const depositOp = platform.deposit("user1", Currency.PLN, 500);
    console.log("Deposit operation:", depositOp);
    console.log("User1 PLN balance after deposit:", platform.getAccountBalance("user1", Currency.PLN));
    console.log("--------------------------------------------------");

    // User1 withdraw 100 PLN – the commission is 2 PLN, amount taken from account is 102 PLN
    const withdrawOp = platform.withdraw("user1", Currency.PLN, 100);
    console.log("Withdrawal operation:", withdrawOp);
    console.log("User1 PLN balance after withdrawal:", platform.getAccountBalance("user1", Currency.PLN));
    console.log("--------------------------------------------------");

    // User1 trasnfer 100 PLN to User2.
    // The commission is 2 PLN, amount taken from User1 account is 102 PLN. 
    // User2 recieves 100 PLN
    const { fromOperation: transferOut, toOperation: transferIn } = platform.transfer(
        "user1",
        "user2",
        Currency.PLN,
        100
    );
    console.log("Transfer Out operation:", transferOut);
    console.log("Transfer In operation:", transferIn);
    console.log("User1 PLN balance after transfer:", platform.getAccountBalance("user1", Currency.PLN));
    console.log("User2 PLN balance after receiving transfer:", platform.getAccountBalance("user2", Currency.PLN));
    console.log("--------------------------------------------------");

    // User1 exchange 50 EUR to USD.
    // The commission will be taken from the USD amount after exchange.
    // After conversion amount is 52,5 USD - the commission will be 1,05, User1 recieves 51,45 USD.
    platform.deposit("user1", Currency.EUR, 100);
    const { exchangeFrom: exchangeOut, exchangeTo: exchangeIn } = platform.exchange(
        "user1",
        Currency.EUR,
        Currency.USD,
        50
    );
    console.log("Exchange Out operation:", exchangeOut);
    console.log("Exchange In operation:", exchangeIn);
    console.log("User1 EUR balance after exchange:", platform.getAccountBalance("user1", Currency.EUR));
    console.log("User1 USD balance after exchange:", platform.getAccountBalance("user1", Currency.USD));
    console.log("--------------------------------------------------");

    // Retrieving global history for deposits.
    const depositHistory = platform.getglobalHistory({
        type: OperationType.DEPOSIT
    });
    console.log("Global deposit history:", depositHistory);
    console.log("--------------------------------------------------");

    // Retrieving user history for withdraws in PLN.
    const userWithdrawHistory = platform.getUserOperationsHistory("user1", Currency.PLN, {
        type: OperationType.WITHDRAWAL
    });
    console.log("User PLN withdraw history:", userWithdrawHistory);
    console.log("--------------------------------------------------");

    // Retrieving profit information.
    const profit = platform.getProfit();
    console.log("Platform profit:", profit);
    console.log("--------------------------------------------------");
};

runTests();