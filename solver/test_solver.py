import unittest
import os
from web3 import Web3
from portfolio import score, check_constraints

class TestSolverConstraints(unittest.TestCase):
    
    def test_weight_sum(self):
        w1 = [1000] * 8
        self.assertFalse(check_constraints(w1)) # sum=8000, not 10000
        w2 = [2500, 2500, 2500, 2500, 0, 0, 0, 0]
        self.assertTrue(check_constraints(w2))
        
    def test_minimum_position(self):
        w = [9000, 400, 600, 0, 0, 0, 0, 0]
        self.assertFalse(check_constraints(w)) # 400 < 500
        
    def test_maximum_position(self):
        w = [2600, 2400, 2500, 2500, 0, 0, 0, 0]
        self.assertFalse(check_constraints(w)) # 2600 > 2500
        
    def test_maximum_holdings(self):
        w = [1666, 1666, 1666, 1666, 1668, 1668, 0, 0]
        self.assertFalse(check_constraints(w)) # 6 holdings > 5

class TestSolidityMatch(unittest.TestCase):
    def test_python_matches_solidity(self):
        # We can use web3 to call the live testnet contract
        from dotenv import load_dotenv
        load_dotenv("../.env")
        
        rpc = os.getenv("MONAD_RPC_URL", "https://testnet-rpc.monad.xyz")
        w3 = Web3(Web3.HTTPProvider(rpc))
        
        # Address from deployment
        address = "0x36e9fA3beBea57Da0867Dba2BD3773a12c95ED69"
        
        # Minimal ABI for score function
        abi = [{
            "inputs": [{"internalType": "uint16[8]", "name": "w", "type": "uint16[8]"}],
            "name": "score",
            "outputs": [{"internalType": "int256", "name": "", "type": "int256"}],
            "stateMutability": "view",
            "type": "function"
        }]
        
        contract = w3.eth.contract(address=address, abi=abi)
        
        # Test a valid portfolio
        w = [2500, 1500, 2000, 1500, 2500, 0, 0, 0]
        
        py_score = score(w)
        sol_score = contract.functions.score(w).call()
        
        self.assertEqual(py_score, sol_score, f"Python: {py_score} != Solidity: {sol_score}")

if __name__ == "__main__":
    unittest.main()
