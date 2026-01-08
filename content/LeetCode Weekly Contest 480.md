---
title: LeetCode Weekly Contest 480
tags: [演算法, LeetCode, 線段樹]
---

這是我第一次在 LeetCode 週賽 AK，寫完非常地開心，雖然我覺得第四題 Hard 只是在線段樹的模板上加一些修改，有點水，但還是想說來記錄一下。

- **Rank: 598 / 30007**
- **Rating: 1752 -> 1824 (+72)**
### Absolute Difference Between Maximum and Minimum K Elements

排序後把最大 $k$ 個數字總和減掉最小 $k$ 個數字總和就結束。

```cpp
// 0 ms, Beats 100 %
class Solution {
public:
    int absDifference(vector<int>& nums, int k) {
        int n = nums.size(), large = 0, small = 0;
        sort(nums.begin(), nums.end());
        for (int i = 0; i < k; i++) {
            small += nums[i];
            large += nums[n - i - 1];
        }
        return large - small;
    }
};
```

### Reverse Words With Same Vowel Count

一樣是暴力題，只是我為了讓字串最後一個字也能正確判到，因此在實作上先**把 s 最後面加上一個 space**，做完再把它刪除掉。

```cpp
// 19 ms, Beats 87.99 %
class Solution {
public:
    string reverseWords(string s) {
        s += ' ';
        int n = s.length();
        int check = -1, past = -1, cnt = 0;
        for (int i = 0; i < n; i++) {
            if (s[i] == ' ') {
                if (check == -1) {
                    check = cnt;
                }
                else if (cnt == check) {
                    reverse(s.begin() + past + 1, s.begin() + i);
                }
                past = i, cnt = 0;
                continue;
            }
            if (s[i] == 'a' || s[i] == 'e' || s[i] == 'i' || s[i] == 'o' || s[i] == 'u') ++cnt;
        }
        s.pop_back();
        return s;
    }
};
```

### Minimum Moves to Balance Circular Array

這題要挪動數字直到所有數字都是非負，且最多存在一個負數。首先要先嘗試把這個負數找出來，如果陣列中不存在任何負數（找不到），那當然不需要挪動，答案是 $0$。在挪動時因為挪一格就算一步，因此理所當然**優先拿離負數較近的**。考量到長度為 $n$ 的環形陣列，離每一個 index 最遠的距離會是 $n/2$ ，因此從距離 $1$ 到距離 $n/2$ 的順序拿元素來補，值得一提的是在每個距離都會有 $2$ 個元素可以拿，但在 $n$ 是偶數的狀況下，距離 $n/2$ 的元素只會有一個，因此在計算時要避免重複計算到。

```cpp
// 0 ms, Beats 100 %
class Solution {
public:
    long long minMoves(vector<int>& balance) {
        int n = balance.size(), minus = -1;
        for (int i = 0; i < n; i++) {
            if (balance[i] < 0) {
                minus = i;
                break;
            }
        }
        if (minus == -1) return 0;
        int steps = -balance[minus];
        long long res = 0;
        for (int i = 1; i <= n>>1 ; i++) {
            int curr = min(steps, balance[(minus + i) % n]);
            res += 1LL * curr * i;
            steps -= curr;
            if (i == n >> 1 && !(n & 1)) break;
            curr = min(steps, balance[(minus - i + n) % n]);
            res += 1LL * curr * i;
            steps -= curr;
            if (steps == 0) break;
        }
        if (steps > 0) return -1;
        return res;
    }
};
```

### Minimum Deletions to Make Alternating Substring

這題一看到區間查詢我就覺得應該是線段樹了，一個由 `A` 和 `B` 組成的字串，要花多少次刪除操作才能使得字串中相鄰字元皆不相同。考慮到一個字串的答案可以分成 **前半子字串的答案** 加上 **後半子字串的答案**，如果在前**半子字串最後一個字元與後半子字串第一個字元一樣**的狀況下，答案還要加上 1，這題只需要在線段樹的分治後在加上一個判斷式就可以維護好每個區間的答案了。

```cpp
// 116 ms, Beats 62.36 %
class SegmentTree {
private:
    #define lc 2 * id + 1
    #define rc 2 * id + 2
    string arr;
    int n;
    vector<int> seg;
    void build(int left, int right, int id){
        if(left == right){
            seg[id] = 0;
            return;
        }
        int mid = (left + right) >> 1;
        build(left, mid, lc);
        build(mid + 1, right, rc);
        seg[id] = seg[lc] + seg[rc];
        if(arr[mid] == arr[mid + 1]) ++seg[id];
    }
    void modify(int idx, int left, int right, int id){
        if(left == right){
            arr[left] = 'B' - arr[left] + 'A';
            return;
        }
        int mid = (left + right) >> 1;
        if(idx <= mid){
            modify(idx, left, mid, lc);
        }
        else{
            modify(idx, mid + 1, right, rc);
        }
        seg[id] = seg[lc] + seg[rc];
        if(arr[mid] == arr[mid + 1]) ++seg[id];
    }
    int query(int left, int right, int l, int r, int id){
        if(l <= left && right <= r){
            return seg[id];
        }
        int mid = (left + right) >> 1;
        if(r <= mid){
            return query(left, mid, l, r, lc);
        }
        else if(l > mid){
            return query(mid + 1, right, l, r, rc);
        }
        else{
            return query(left, mid, l, r, lc) + query(mid + 1, right, l, r, rc) + ((arr[mid] == arr[mid + 1]) ? 1 : 0);
        }
    }
public:
    SegmentTree(string s){
        arr = s;
        n = s.length();
        seg.resize(4 * n + 1, 0);
        build(0, n - 1, 0);
    }
    void flip(int idx){
        modify(idx, 0, n - 1, 0);
    }
    int compute(int l, int r){
        return query(0, n - 1, l, r, 0);
    }
};
class Solution {
public:
    vector<int> minDeletions(string s, vector<vector<int>>& queries) {
        SegmentTree tree(s);
        vector<int> res;
        for(auto &v : queries){
            if(v[0] == 1){
                tree.flip(v[1]);
            }
            else{
                res.push_back(tree.compute(v[1], v[2]));
            }
        }
        return res;
    }
};
```