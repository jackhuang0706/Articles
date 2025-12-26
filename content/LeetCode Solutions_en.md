---
title: Some Solutions of LeetCode problems
tags: [LeetCode, New Language, Algorithm]

---

## Minimum Penalty for a Shop (2025/12/26 Daily)
My initial idea is using brute force and prefix sum. First, calculate how many `Y` in the first $i$th charactars and form a prefix sum array. Then for each possible close time, calculate how many `N` before and `Y` after the close time seperately. Last, for each possibility, we can get the minimum value.

```cpp []
class Solution {
public:
    int bestClosingTime(string customers) {
        int n = customers.length();
        vector<int> pre(n, 0);
        pre[0] = (customers[0] == 'Y') ? 1 : 0;
        for (int i = 1; i < n; i++) {
            pre[i] = pre[i - 1] + ((customers[i] == 'Y') ? 1 : 0);
        }
        int res = 0, minV = pre[n - 1];
        for (int i = 1; i < n; i++) {
            int curr = i + pre[n - 1] - 2 * pre[i - 1];
            if (curr < minV) {
                minV = curr;
                res = i;
            }
        }
        if (n - pre[n - 1] < minV) res = n;
        return res;
    }
};
```

```python []
class Solution:
    def bestClosingTime(self, customers: str) -> int:
        sz = len(customers)
        pre = [0] * sz
        pre[0] = 1 if customers[0] == 'Y' else 0
        for i in range(1, sz):
            pre[i] = pre[i - 1] + (1 if customers[i] == 'Y' else 0)
        res, minV = 0, pre[sz - 1]
        for i in range(1, sz):
            curr = i + pre[sz - 1] - 2 * pre[i - 1]
            if curr < minV:
                minV = curr
                res = i
        if sz - pre[sz-1] < minV: res = sz
        return res
```

But after submitting, I get AC but the runtime is inefficient. Supposed that the number of `Y` in the given string is $k$, and before close time there are $a$ `Y`, $b$ `N`. We can concluded that the `penalty` is $b + (k - a)$, but since $k$ is a constant independent to the close time, we only need to search the index where $b - a$ has a minimum. As a result, I use `diff` to store the difference between $a$ and $b$ (relative, not absolute difference). 

```cpp []
class Solution {
public:
    int bestClosingTime(string customers) {
        int sz = customers.length();
        int diff = 0, res = 0, minV = 0;
        for (int i = 0; i < sz; i++) {
            diff += ((customers[i] == 'Y') ? -1 : 1);
            if (diff < minV) {
                minV = diff;
                res = i + 1;
            }
        }
        return res;
    }
};
```

```python []
class Solution:
    def bestClosingTime(self, customers: str) -> int:
        diff = 0
        res, minV = 0, 0
        for i in range(len(customers)):
            diff += (-1 if customers[i] == 'Y' else 1)
            if diff < minV:
                minV = diff
                res = i + 1
        return res
```

```rust []
impl Solution {
    pub fn best_closing_time(customers: String) -> i32 {
        let (mut diff, mut res, mut minV) = (0, 0, 0);
        for (i, b) in customers.bytes().enumerate() { // .bytes() the result of this function is a Iterator<Item = u8>
            diff += (if b == b'Y' {-1} else {1});
            if diff < minV {
                minV = diff;
                res = i + 1;
            }
        }
        res as i32
    }
}
```

The original code of Rust is shown below:
```rust
impl Solution {
    pub fn best_closing_time(customers: String) -> i32 {
        let (mut diff, mut res, mut minV): (i32, i32, i32) = (0, 0, 0);
        let sz = customers.len();
        for i in (0..sz) {
            diff += (if customers.chars().nth(i) == Some('Y') {-1} else {1});
            if diff < minV {
                minV = diff;
                res = (i + 1) as i32;
            }
        }
        res
    }
}
```

But since `.chars().nth(i)` is a inefficient function, which costs $O(n)$ in each call. It makes the time complexity become $O(n^2)$ and as a result, `TLE`.