LAMBDA_VAL = 5000

mu = [100, 200, 300, 400, 150, 250, 350, 450]
cov = [[0 for _ in range(8)] for _ in range(8)]
for i in range(8):
    cov[i][i] = 1000

def check_constraints(w):
    if sum(w) != 10000:
        return False
    
    held = 0
    for wi in w:
        if wi > 0:
            if wi < 500 or wi > 2500:
                return False
            held += 1
            
    if held > 5:
        return False
        
    return True

def score(w):
    if not check_constraints(w):
        return -999999999999

    ret = sum(w[i] * mu[i] for i in range(8))
    
    varianceRaw = 0
    for i in range(8):
        for j in range(8):
            varianceRaw += w[i] * w[j] * cov[i][j]
            
    # Solidity truncates towards zero for division
    return int((ret * 100000000 - LAMBDA_VAL * varianceRaw) / 1000000000000)

def print_result(algorithm, w):
    s = score(w)
    held = sum(1 for wi in w if wi > 0)
    print(f"Algorithm: {algorithm}")
    print(f"Weights: {w}")
    print(f"Total Weight: {sum(w)}")
    print(f"Holdings: {held}")
    print(f"Score: {s}")
    print("-" * 30)
