from portfolio import score, print_result

def run_baseline():
    # A simple valid portfolio: 4 assets with 2500 weight each
    # This sums to 10000, min 500 max 2500, max 5 holdings.
    w = [2500, 2500, 2500, 2500, 0, 0, 0, 0]
    print_result("Baseline (Manual)", w)
    return w

if __name__ == "__main__":
    run_baseline()
