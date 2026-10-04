import random
from portfolio import score, print_result, check_constraints

def generate_random_valid():
    # To sum to 10000 with max 2500, we need at least 4 assets.
    # Max holdings is 5.
    k = random.choice([4, 5])
    assets = random.sample(range(8), k)
    w = [0] * 8
    
    # Initialize with minimum
    for a in assets:
        w[a] = 500
        
    remaining = 10000 - 500 * k
    
    # Distribute remaining
    while remaining > 0:
        a = random.choice(assets)
        if w[a] < 2500:
            add = min(random.randint(100, 500), 2500 - w[a], remaining)
            w[a] += add
            remaining -= add
            
    return w

def mutate(w):
    new_w = list(w)
    if random.random() < 0.1:
        return generate_random_valid()
        
    nonzero = [i for i in range(8) if new_w[i] > 0]
    zero = [i for i in range(8) if new_w[i] == 0]
    
    if random.random() < 0.3 and len(nonzero) > 4 and len(zero) > 0:
        # Drop one, add one
        drop = random.choice(nonzero)
        add = random.choice(zero)
        new_w[add] = new_w[drop]
        new_w[drop] = 0
    else:
        # Shift weight
        if len(nonzero) >= 2:
            a, b = random.sample(nonzero, 2)
            amount = random.randint(100, 500)
            if new_w[a] - amount >= 500 and new_w[b] + amount <= 2500:
                new_w[a] -= amount
                new_w[b] += amount
                
    if check_constraints(new_w):
        return new_w
    return w

def crossover(w1, w2):
    # Mixing exact sum arrays is hard without repair, 
    # we'll use a simple selection mechanism instead.
    return list(random.choice([w1, w2]))

def run_ga(generations=200, pop_size=100):
    pop = [generate_random_valid() for _ in range(pop_size)]
    
    for gen in range(generations):
        pop.sort(key=score, reverse=True)
        next_gen = pop[:pop_size//4] # Elitism
        
        while len(next_gen) < pop_size:
            p1 = random.choice(pop[:20])
            p2 = random.choice(pop[:20])
            child = crossover(p1, p2)
            child = mutate(child)
            next_gen.append(child)
            
        pop = next_gen
        
    pop.sort(key=score, reverse=True)
    best = pop[0]
    print_result("Genetic Algorithm", best)
    return best

if __name__ == "__main__":
    run_ga()
