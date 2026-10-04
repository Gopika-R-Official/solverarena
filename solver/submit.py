import os
import sys
from web3 import Web3
from dotenv import load_dotenv

def submit_weights(weights):
    load_dotenv(".env")
    
    rpc = os.getenv("MONAD_RPC_URL", "https://testnet-rpc.monad.xyz")
    pk = os.getenv("PRIVATE_KEY")
    
    if not pk:
        print("PRIVATE_KEY not found in environment.")
        return
        
    w3 = Web3(Web3.HTTPProvider(rpc))
    
    # Address from deployment
    arena_address = "0x1196D4f60FE0e3f7958706E62F7c7D456d17bB34"
    
    # Minimal ABI for createRound and submitSolution
    abi = [
        {
            "inputs": [{"internalType": "uint256", "name": "duration", "type": "uint256"}],
            "name": "createRound",
            "outputs": [{"internalType": "uint256", "name": "roundId", "type": "uint256"}],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [
                {"internalType": "uint256", "name": "roundId", "type": "uint256"},
                {"internalType": "uint16[8]", "name": "weights", "type": "uint16[8]"}
            ],
            "name": "submitSolution",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "nextRoundId",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        }
    ]
    
    account = w3.eth.account.from_key(pk)
    contract = w3.eth.contract(address=arena_address, abi=abi)
    
    # First, let's create a new round to make sure we can submit
    # Or just submit to round 0 if it is still active.
    # The deploy script created round 0 with duration 1 hour.
    # Let's just create a new round to be safe.
    
    print("Creating new round...")
    nonce = w3.eth.get_transaction_count(account.address)
    
    create_tx = contract.functions.createRound(3600).build_transaction({
        'chainId': 10143,
        'gas': 200000,
        'maxFeePerGas': w3.to_wei('150', 'gwei'),
        'maxPriorityFeePerGas': w3.to_wei('150', 'gwei'),
        'nonce': nonce,
        'value': w3.to_wei(0.001, 'ether')
    })
    
    signed_create = w3.eth.account.sign_transaction(create_tx, private_key=pk)
    tx_hash = w3.eth.send_raw_transaction(signed_create.raw_transaction)
    print(f"Create Round Tx Hash: {tx_hash.hex()}")
    
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    round_id = contract.functions.nextRoundId().call() - 1
    print(f"Submitting to Round ID: {round_id}")
    
    nonce = w3.eth.get_transaction_count(account.address)
    
    submit_tx = contract.functions.submitSolution(round_id, weights).build_transaction({
        'chainId': 10143,
        'gas': 350000,
        'maxFeePerGas': w3.to_wei('150', 'gwei'),
        'maxPriorityFeePerGas': w3.to_wei('150', 'gwei'),
        'nonce': nonce,
    })
    
    signed_submit = w3.eth.account.sign_transaction(submit_tx, private_key=pk)
    submit_hash = w3.eth.send_raw_transaction(signed_submit.raw_transaction)
    print(f"Submit Solution Tx Hash: {submit_hash.hex()}")
    
    submit_receipt = w3.eth.wait_for_transaction_receipt(submit_hash)
    print(f"Submission successful! Gas used: {submit_receipt['gasUsed']}")
    
if __name__ == "__main__":
    from ga_solver import run_ga
    best_weights = run_ga()
    submit_weights(best_weights)
