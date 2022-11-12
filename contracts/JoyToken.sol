// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

// Smart contract that handles the ERC20 standard creation
contract JoyToken{   

    string public name = "JoyCoin";
    string public symbol = "JC";
    string public standard = "JoyCoin v1.0";   
    uint256 public totalSupply; // Public visibility for our Solidity state variable

    event Transfer(
        // account that send and receive, along with the amount
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Approval(
        // The owner account approves the spender account to spend value amount of JoyTokens
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance; // Nested mapping

    constructor(uint256 _initialSupply) public {
        // We need to allocate this inital supply to a default admin account
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    // Transfer function
    function transfer(address _to, uint256 _value) public returns (bool success) {
        // If the require condiion is satisfied, then only further part of the function is executed. Else not
        require(balanceOf[msg.sender] >= _value);
        
        // Balance increment-decrement for the receiver-sender
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        // Transfer event
        emit Transfer(msg.sender, _to, _value);

        // Return a boolean denoting true for a successful transaction
        return true;
    }
    // Delegated Transfer
    function approve(address _spender, uint256 _value) public returns (bool success) {
        // allowance
        allowance[msg.sender][_spender] = _value;

        // Approval event
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {

        require(balanceOf[_from] >= _value);
        require(allowance[_from][msg.sender] >= _value);
        
        // update balance
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        // update allowance
        allowance[_from][msg.sender] -= _value;

        emit Transfer(_from, _to, _value);
        return true;
    }
}