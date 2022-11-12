var JoyToken = artifacts.require("JoyToken");

contract('JoyToken', function(accounts) {
    let joyToken = null;
    before(async () => {
        joyToken = await JoyToken.deployed();
    });


    it('initializes the contract with the correct values', async () => {
        var name = await joyToken.name();
        assert.equal(name, 'JoyCoin', 'has the correct name');
        var symbol = await joyToken.symbol();
        assert.equal(symbol, 'JC', 'has the correct symbol');
        var standard = await joyToken.standard();
        assert.equal(standard, 'JoyCoin v1.0', 'has the correct standard');
    });


    it('allocates the total supply upon deployment', async () => {
        const total = await joyToken.totalSupply();
        assert.equal(total.toNumber(), 1000000, 'sets the total supply to 1,000,000');
        const balance = await joyToken.balanceOf(accounts[0]);
        assert.equal(balance.toNumber(), 1000000, 'allocates the inital supply to the admin account');
    });


    it('handles the transfer function for insufficient balance', async () => {
        try{
            await joyToken.transfer(accounts[1], 999999999);
        } catch(error) {
            assert(error.message.includes('revert'));
            return;
        }
        assert(false);
    });


    it('handles the transfer function for sufficient balance', async () => {
        let success = await joyToken.transfer.call(accounts[1], 250000, { from: accounts[0] });
        assert.equal(success, true, 'it retunrs true');
        let receipt = await joyToken.transfer(accounts[1], 250000, { from: accounts[0] }); 
        assert.equal(receipt.logs.length, 1, 'triggers one event');
        assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
        assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
        assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
        assert.equal(receipt.logs[0].args._value, 250000, 'logs the transfer amount');
        let To_balance = await joyToken.balanceOf(accounts[1]);
        assert.equal(To_balance.toNumber(), 250000, 'adds the amount to the receiving account');
        let From_balance = await joyToken.balanceOf(accounts[0]);
        assert.equal(From_balance.toNumber(), 750000, 'deducts the amount from the sending account');
    });


    it('approves tokens for delegated transfer', async () => {
        let success = await joyToken.approve.call(accounts[1], 100);
        assert.equal(success, true, 'it retunrs true');
        let receipt = await joyToken.approve(accounts[1], 100);
        assert.equal(receipt.logs.length, 1, 'triggers one event');
        assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event');
        assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokens are authorized by');
        assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account the tokens are authorized to');
        assert.equal(receipt.logs[0].args._value, 100, 'logs the authorized transfer amount');
        const allowance = await joyToken.allowance(accounts[0], accounts[1]);
        assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated transfer');
    });

    
    it('handles delegated token transfers', async () => {
        fromAccount = accounts[2];
        toAccount = accounts[3];
        spendingAccount = accounts[4];

        // transfer some tokens to fromAccount
        await joyToken.transfer(fromAccount, 100, { from: accounts[0] });

        // Approve spendingAccount to spend 10 tokens from fromAccount
        await joyToken.approve(spendingAccount, 10, { from: fromAccount });

        // Try transferring something larger than the sender's balance
        try{
            await joyToken.transferFrom(fromAccount, toAccount, 9999, { from: spendingAccount });
        } catch(error) {
            assert(error.message.includes('revert'));
            return;
        }
        assert(false, 'cannot transfer value larger than balance');

        // Try transferring something larger than the approved amount
        try{
            await joyToken.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount });
        } catch(error) {
            assert(error.message.includes('revert'));
            return;
        }
        assert(false, 'cannot transfer value more than the approved amount');

        // Success case
        let success = await joyToken.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
        assert.equal(success, true, 'it retunrs true');
        let receipt = await joyToken.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });
        assert.equal(receipt.logs.length, 1, 'triggers one event');
        assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
        assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account the tokens are transferred from');
        assert.equal(receipt.logs[0].args._to, toAccount, 'logs the account the tokens are transferred to');
        assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');
        let FromBalance = await joyToken.balanceOf(fromAccount);
        assert.equal(FromBalance.toNumber(), 90, 'deducts the amount from the fromAccount');
        let ToBalance = await joyToken.balanceOf(toAccount);
        assert.equal(ToBalance.toNumber(), 10, 'adds the amount to the toAccount');
        let allowance = await joyToken.allowance(fromAccount, spendingAccount);
        assert.equal(allowance.toNumber(), 0, 'updates the allowance');
    });
});