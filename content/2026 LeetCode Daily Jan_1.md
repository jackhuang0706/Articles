---
title: LeetCode Daily 紀錄 2026 Jan_1
tags: [LeetCode]

---


## [2026/01/01 (N/A)](https://leetcode.com/problems/plus-one/description/?envType=daily-question&envId=2026-01-01)

- **Rating: N/A (Easy)**
```cpp []
class Solution {
public:
    vector<int> plusOne(vector<int>& digits) {
        reverse(digits.begin(), digits.end());
        vector<int> res;
        int past = 1;
        for (auto &v : digits) {
            res.push_back((v + past) % 10);
            past = (v + past) / 10;
        }
        if (past > 0) res.push_back(past);
        reverse(res.begin(), res.end());
        return res;
    }
};
```

```python []
class Solution:
    def plusOne(self, digits: List[int]) -> List[int]:
        res = []
        past = 1
        for v in reversed(digits):
            res.append((v + past) % 10)
            past = (v + past) // 10
        if past > 0 : res.append(past)
        res.reverse()
        return res

```

```rust []
impl Solution {
    pub fn plus_one(digits: Vec<i32>) -> Vec<i32> {
        let mut res = Vec::new();
        let mut past = 1;
        for v in digits.iter().rev() { // reverse iteration to avoid any change to "digits"
            res.push((v + past) % 10);
            past = (v + past) / 10;
        }
        if past > 0 {
            res.push(past);
        }
        res.reverse();
        res
    }
}
```



## [2026/01/02 (1161)](https://leetcode.com/problems/n-repeated-element-in-size-2n-array/description/?envType=daily-question&envId=2026-01-02)

- **Rating: 1161 (Easy)**
```cpp []
class Solution {
public:
    int repeatedNTimes(vector<int>& nums) {
        int n = nums.size();
        for (int i = 0; i < n - 2; i++) {
            if (nums[i] == nums[i + 1] || nums[i] == nums[i + 2]) return nums[i];
        }
        return nums[n - 1];
    }
};
```

```python []
class Solution:
    def repeatedNTimes(self, nums: List[int]) -> int:
        n = len(nums)
        for i in range(n - 2) :
            if nums[i] == nums[i + 1] or nums[i] == nums[i + 2] :
                return nums[i]
        return nums[n - 1]
```

```rust []
impl Solution {
    pub fn repeated_n_times(nums: Vec<i32>) -> i32 {
        let n = nums.len();
        for i in (0 .. n - 2) {
            if nums[i] == nums[i + 1] || nums[i] == nums[i + 2] {
                return nums[i];
            }
        }
        nums[n - 1]
    }
}
```

## [2026/01/03 (1844)](https://leetcode.com/problems/number-of-ways-to-paint-n-3-grid/description/?envType=daily-question&envId=2026-01-03)

- **Rating: 1844 (Hard)**
```cpp []
class Solution {
    const int p = 1000000007;
public:
    int numOfWays(int n) {
        long long aba = 6, abc = 6;
        for (int i = 0; i < n - 1; i++) {
            long long taba = (aba * 3 % p) + (abc * 2 % p), tabc = (aba * 2 % p) + (abc * 2 % p);
            taba %= p, tabc %= p;
            aba = taba, abc = tabc;
        }
        int res = (aba + abc) % p;
        return res;
    }
};
```

```python []
class Solution:
    def numOfWays(self, n: int) -> int:
        p = 1000000007
        aba, abc = 6, 6
        for i in range(n - 1) :
            taba = 3 * aba + 2 * abc
            tabc = 2 * aba + 2 * abc
            aba, abc = taba % p, tabc % p
        return (aba + abc) % p
```

```rust []
impl Solution {
    pub fn num_of_ways(n: i32) -> i32 {
        let mut aba : u64 = 6;
        let mut abc : u64 = 6;
        let p = 1000000007;
        for i in (0 .. n - 1) {
            let taba : u64 = 3 * aba + 2 * abc;
            let tabc : u64 = 2 * aba + 2 * abc;
            (aba, abc) = (taba % p, tabc % p);
        }
        let res = (aba + abc) % p;
        res as _
    }
}
```

## [2026/01/04 (1478)](https://leetcode.com/problems/four-divisors/description/?envType=daily-question&envId=2026-01-04)

- **Rating: 1478 (Medium)**
```cpp []
class Solution {
public:
    int sumFourDivisors(vector<int>& nums) {
        int res = 0;
        for (auto &v : nums) {
            int cnt = 0, sum = 0;
            for (int i = 1; i * i <= v; i++) {
                if (v % i == 0) {
                    if (i * i < v) {
                        cnt += 2;
                        sum += i, sum += v / i;
                    }
                    else {
                        cnt++;
                        sum += i;
                    }
                }
                if (cnt > 4) break;
            }
            res += (cnt == 4 ? sum : 0);
        }
        return res;
    }
};
```

```python []
class Solution:
    def sumFourDivisors(self, nums: List[int]) -> int:
        res = 0

        for i in nums :
            cnt, sum = 0, 0
            for j in range(1, floor(math.sqrt(i)) + 1) :
                if i % j == 0 :
                    if j * j < i :
                        cnt += 2
                        sum += j + i // j
                    else :
                        cnt += 1
                        sum += j
                if cnt > 4 : break
            res += sum if cnt == 4 else 0
        
        return res
```

```rust []
impl Solution {
    pub fn sum_four_divisors(nums: Vec<i32>) -> i32 {
        let mut res = 0;
        for i in nums {
            let (mut cnt, mut sum) = (0, 0);
            for j in (1 .. i.isqrt() + 1) {
                if i % j == 0 {
                    if j * j < i {
                        cnt += 2;
                        sum += j + i / j;
                    }
                    else {
                        cnt += 1;
                        sum += j;
                    }
                }
                if cnt > 4 {
                    break;
                }
            }
            res += if cnt == 4 {sum} else {0};
        }
        res as _
    }
}
```

## [2026/01/05 (1648)](https://leetcode.com/problems/maximum-matrix-sum/description/?envType=daily-question&envId=2026-01-05)

- **Rating: 1648 (Medium)**
```cpp []
class Solution {
public:
    long long maxMatrixSum(vector<vector<int>>& matrix) {
        int n = matrix.size();
        long long res = 0;
        int cnt = 0, minV = 0x3f3f3f3f;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                int curr = abs(matrix[i][j]);
                res += curr;
                if (matrix[i][j] < 0) cnt++;
                if (curr < minV) minV = curr;
            }
        }
        return res - (cnt & 1 ? 2 * minV : 0);
    }
};
```

```python []
class Solution:
    def maxMatrixSum(self, matrix: List[List[int]]) -> int:
        res, cnt, minV = 0, 0, 0x3f3f3f3f
        for i in matrix :
            for j in i :
                curr = abs(j)
                res += curr
                if j < 0 : cnt += 1
                if curr < minV : minV = curr
        return res - (2 * minV if cnt & 1 else 0)
```

```rust []
impl Solution {
    pub fn max_matrix_sum(matrix: Vec<Vec<i32>>) -> i64 {
        let mut res : i64 = 0;
        let (mut cnt, mut minV) = (0, 0x3f3f3f3f);
        for i in matrix {
            for j in i {
                let curr = j.abs();
                res += curr as i64;
                if j < 0 {cnt += 1};
                if curr < minV {minV = curr};
            }
        }
        if cnt % 2 == 1 {res -= 2 * minV as i64};
        res
    }
}
```

## [2026/01/06 (1249)](https://leetcode.com/problems/maximum-level-sum-of-a-binary-tree/description/?envType=daily-question&envId=2026-01-06)

- **Rating: 1249 (Medium)**
```cpp []
/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */
class Solution {
private:
    void dfs(TreeNode* root, int level, vector<int> &sums) {
        if (root == nullptr) return;
        if (level == sums.size()) sums.push_back(0);
        sums[level] += root -> val;
        dfs(root -> left, level + 1, sums);
        dfs(root -> right, level + 1, sums);
    }
public:
    int maxLevelSum(TreeNode* root) {
        vector<int> sums;
        dfs(root, 0, sums);
        return max_element(sums.begin(), sums.end()) - sums.begin() + 1;
    }
};
```

```python []
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def maxLevelSum(self, root: Optional[TreeNode]) -> int:
        sums = []

        def dfs(root, level) :
            if not root : return
            if level == len(sums) : sums.append(0)
            sums[level] += root.val
            dfs(root.left, level + 1)
            dfs(root.right, level + 1)
        
        dfs(root, 0)
        return sums.index(max(sums)) + 1
        
```

```rust []
// Definition for a binary tree node.
// #[derive(Debug, PartialEq, Eq)]
// pub struct TreeNode {
//   pub val: i32,
//   pub left: Option<Rc<RefCell<TreeNode>>>,
//   pub right: Option<Rc<RefCell<TreeNode>>>,
// }
// 
// impl TreeNode {
//   #[inline]
//   pub fn new(val: i32) -> Self {
//     TreeNode {
//       val,
//       left: None,
//       right: None
//     }
//   }
// }
use std::rc::Rc;
use std::cell::RefCell;
impl Solution {
    fn dfs(root : Option<Rc<RefCell<TreeNode>>>, level : usize, sums : &mut Vec<i32>) {
        if let Some(curr) = root {
            let curr = curr.borrow();
            if level == sums.len() {sums.push(0);}
            sums[level] += curr.val;
            Self::dfs(curr.left.clone(), level + 1, sums);
            Self::dfs(curr.right.clone(), level + 1, sums);
        }
    }
    pub fn max_level_sum(root: Option<Rc<RefCell<TreeNode>>>) -> i32 {
        let mut sums : Vec<i32> = Vec::new();
        Self::dfs(root, 0, &mut sums);
        let (mut res, mut maxV) = (0, i32::MIN);
        for (i, &v) in sums.iter().enumerate() {
            if v > maxV {
                maxV = v;
                res = i + 1;
            }
        }
        res as _
    }
}
```

## [2026/01/07 (1674)](https://leetcode.com/problems/maximum-product-of-splitted-binary-tree/description/?envType=daily-question&envId=2026-01-07)

- **Rating: 1674 (Medium)**
```cpp []
/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */
class Solution {
private:
    long long res = 0, total = 0;

    void cal(TreeNode* root) {
        if (!root) return;
        total += root -> val;
        cal(root -> left);
        cal(root -> right);
    }

    int dfs(TreeNode* root) {
        if (!root) return 0;
        int curr = dfs(root -> left) + dfs(root -> right) + root -> val;
        res = max(res, curr * (total - curr));
        return curr;
    }

public:
    int maxProduct(TreeNode* root) {
        cal(root);
        dfs(root);
        return res % 1000000007;
    }
};
```

```python []
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def maxProduct(self, root: Optional[TreeNode]) -> int:
        res, total = 0, 0

        def cal(root) :
            nonlocal total
            if not root : return
            total += root.val
            cal(root.left)
            cal(root.right)

        def dfs(root) :
            nonlocal res
            if not root : return 0
            curr = dfs(root.left) + dfs(root.right) + root.val
            res = max(res, curr * (total - curr))
            return curr
        
        cal(root)
        dfs(root)

        return res % 1000000007
```

```rust []
// Definition for a binary tree node.
// #[derive(Debug, PartialEq, Eq)]
// pub struct TreeNode {
//   pub val: i32,
//   pub left: Option<Rc<RefCell<TreeNode>>>,
//   pub right: Option<Rc<RefCell<TreeNode>>>,
// }
// 
// impl TreeNode {
//   #[inline]
//   pub fn new(val: i32) -> Self {
//     TreeNode {
//       val,
//       left: None,
//       right: None
//     }
//   }
// }
use std::rc::Rc;
use std::cell::RefCell;
use std::cmp::max;
impl Solution {
    fn cal(root: Option<Rc<RefCell<TreeNode>>>) -> i32 {
        if let Some(curr) = root {
            let curr = curr.borrow();
            return curr.val + Self::cal(curr.left.clone()) + Self::cal(curr.right.clone());
        }
        0
    }

    fn dfs(root: Option<Rc<RefCell<TreeNode>>>, total: i32, res: &mut i64) -> i32 {
        if let Some(curr) = root {
            let curr = curr.borrow();
            let sum = Self::dfs(curr.left.clone(), total, res) + Self::dfs(curr.right.clone(), total, res) + curr.val;
            *res = max(*res, (sum as i64) * ((total - sum) as i64));
            return sum;
        }
        0
    }

    pub fn max_product(root: Option<Rc<RefCell<TreeNode>>>) -> i32 {
        let total = Self::cal(root.clone());
        let mut res = 0;
        Self::dfs(root, total, &mut res);
        (res % 1000000007) as i32
    }
}
```

## [2026/01/08 (1823)](https://leetcode.com/problems/max-dot-product-of-two-subsequences/description/?envType=daily-question&envId=2026-01-08)

- **Rating: 1823 (Hard)**
```cpp []
class Solution {
public:
    int maxDotProduct(vector<int>& nums1, vector<int>& nums2) {
        int m = nums1.size(), n = nums2.size();
        vector<vector<int>> dp(m, vector<int> (n, 0));
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                int curr = nums1[i] * nums2[j];
                if (i > 0 && j > 0 && dp[i - 1][j - 1] > 0) curr += dp[i - 1][j - 1];
                if (i > 0) curr = max(curr, dp[i - 1][j]);
                if (j > 0) curr = max(curr, dp[i][j - 1]);
                dp[i][j] = curr;
            }
        }
        return dp[m - 1][n - 1];
    }
};
```

```python []
class Solution:
    def maxDotProduct(self, nums1: List[int], nums2: List[int]) -> int:
        m, n = len(nums1), len(nums2)
        dp = [[0] * n for i in range(m)]
        for i in range(m) :
            for j in range(n) :
                curr = nums1[i] * nums2[j]
                if i > 0 and j > 0 and dp[i - 1][j - 1] > 0 : curr += dp[i - 1][j - 1]
                if i > 0 : curr = max(curr, dp[i - 1][j])
                if j > 0 : curr = max(curr, dp[i][j - 1])
                dp[i][j] = curr
        return dp[m - 1][n - 1]
```

```rust []
use std::cmp::max;
impl Solution {
    pub fn max_dot_product(nums1: Vec<i32>, nums2: Vec<i32>) -> i32 {
        let m = nums1.len();
        let n = nums2.len();
        let mut dp = vec![0; m * n];
        for i in (0 .. m) {
            for j in (0 .. n) {
                let mut curr = nums1[i] * nums2[j];
                if i > 0 && j > 0 && dp[(i - 1) * n + (j - 1)] > 0 {curr += dp[(i - 1) * n + (j - 1)]};
                if i > 0 {curr = max(curr, dp[(i - 1) * n + j])};
                if j > 0 {curr = max(curr, dp[i * n + (j - 1)])};
                dp[i * n + j] = curr;
            }
        }
        return dp[m * n - 1];
    }
}
```