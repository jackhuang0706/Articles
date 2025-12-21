---
title: LeetCode Weekly Contest 480
tags: [Algorithm, LeetCode, Segment Tree]

---

This is the first time I got AK in LeetCode Weekly Contest, and I felt accomplished with that. As a result, I'd like to record it as my first article. 

- **Rank: 598 / 30007**
- **Rating: 1752 -> 1824 (+72)**

### Absolute Difference Between Maximum and Minimum K Elements

First sort `nums`, then simply find the difference between the sum of the $k_{th}$ largest elements and the $k_{th}$ smallest elements.

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

We can solve the problem by Brute Force. What's worth mentioned is that I **append a space character to `s`** first so that the last word can be processed without adding similar code outside the `for` loop. But after the loop we have to delete that space. 


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

In this problem, we have to move some numbers to make all elements in `balance` is non-negative. First step is to check if the only negative number is exist. ( if it is exist, find its index in `balance` ) If there's no negative number in `balance`, the answer is obviously $0$ because we don't need to move any number. When we move the number, we'd like to **get number from the element that is closer to the negative number**. (based on Greedy algorithm) Considered that the farthest distance in a circular array whose length is $n$ is $n/2$, we can use `for` loop from $1$ to $n/2$ to get numbers. There are always two elements which is $i_{th}$ (the range of $i$ is in $\left[1, n/2 \right]$ ) farther from the index of the negative number. But there's an exception **when $n$ is even and $i = n/2$**, there will be **only ONE element**. We should avoid calculating twice when faced the special case.

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

When I saw "range query" in the problem statement, I'm sured that this problem has to do with Segment Tree. First Considered a string consist of `A` and `B`, we need to calculate the times of deletion to make all neighbor elements is different. Noticed that the answer of a string can be split into two part: the **sum of the answer of the left substring and the right substring** and **$1$ if the last element of the left substring is same as the first element of the right substring**. So what we need to do is to add a selecting statement after dividing manipulation in the template of Segment Tree.

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