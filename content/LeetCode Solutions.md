---
title: LeetCode 一些算法紀錄與語法學習
tags: [LeetCode, 語法學習, 演算法]
---

## Minimum Penalty for a Shop (2025/12/26 Daily)
本來的想法是用前綴和把前 $i$ 個字元中有多少個 `Y` 算出來，然後對每一個可能的切法（close time）分別算出 **左邊有多少個 `N`** 和 **右邊有多少個 `Y`**，把這個結果算出來再取最小值。

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

但看完解答發現其實一個一個算出來太慢了，如果考慮到原本的字串裡有 $k$ 個 `Y`，而在每個切點之前有 $a$ 個 `Y`, $b$ 個 `N`，可以算出這時的 `penalty` 是 $b + (k - a)$，但因為 $k$ 是常數，會變動的實際上只有 $a,b$，而需要紀錄的也只是相對值，不用把真正的值算出來（題目只問 close time 應該在哪）。因此考慮一個變數 `diff` 紀錄這兩個的差值，並在迴圈時取得 `diff` 最小的時刻的索引值。

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

原本 Rust 我是這樣寫的：
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

但 `.chars().nth(i)` 是一個很花時間的東西，他並不是直接拿索引值，而是從頭開始跑 $i$ 次，因此每跑一次都需要 $O(n)$，造成總複雜度 $O(n^2)$，故 `TLE`。