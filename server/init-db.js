const pool = require('./db');
require('dotenv').config();

const createTables = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_picture TEXT DEFAULT '',
    description TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS snippets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    code TEXT NOT NULL,
    language VARCHAR(100) NOT NULL,
    description TEXT DEFAULT '',
    source VARCHAR(500) DEFAULT '',
    is_favorite BOOLEAN DEFAULT FALSE,
    visibility VARCHAR(20) DEFAULT 'private',
    copy_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)
  );

  CREATE TABLE IF NOT EXISTS snippet_tags (
    snippet_id INTEGER REFERENCES snippets(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (snippet_id, tag_id)
  );

  CREATE TABLE IF NOT EXISTS collections (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)
  );

  CREATE TABLE IF NOT EXISTS snippet_collections (
    snippet_id INTEGER REFERENCES snippets(id) ON DELETE CASCADE,
    collection_id INTEGER REFERENCES collections(id) ON DELETE CASCADE,
    PRIMARY KEY (snippet_id, collection_id)
  );

  CREATE TABLE IF NOT EXISTS snippet_history (
    id SERIAL PRIMARY KEY,
    snippet_id INTEGER REFERENCES snippets(id) ON DELETE CASCADE,
    title VARCHAR(500),
    code TEXT,
    language VARCHAR(100),
    description TEXT,
    version_number INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const demoSnippets = [
  {
    title: 'useDebounce Hook',
    language: 'javascript',
    description: 'Custom React hook that debounces a value by a specified delay. Useful for search inputs and API calls.',
    source: 'https://usehooks.com/useDebounce',
    code: `import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Usage example:
// const [searchTerm, setSearchTerm] = useState('');
// const debouncedSearchTerm = useDebounce(searchTerm, 300);
//
// useEffect(() => {
//   if (debouncedSearchTerm) {
//     fetchSearchResults(debouncedSearchTerm);
//   }
// }, [debouncedSearchTerm]);`,
    tags: ['react', 'hooks', 'performance']
  },
  {
    title: 'Deep Clone Object',
    language: 'javascript',
    description: 'Creates a deep copy of an object, handling nested objects, arrays, dates, and special cases.',
    source: '',
    code: `export function deepClone(obj, seen = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags);
  }

  if (seen.has(obj)) {
    return seen.get(obj);
  }

  if (Array.isArray(obj)) {
    const arrCopy = [];
    seen.set(obj, arrCopy);
    obj.forEach((item, index) => {
      arrCopy[index] = deepClone(item, seen);
    });
    return arrCopy;
  }

  const objCopy = {};
  seen.set(obj, objCopy);

  for (const key of Object.keys(obj)) {
    objCopy[key] = deepClone(obj[key], seen);
  }

  return objCopy;
}

// Usage:
// const original = { a: 1, b: { c: 2 }, d: [1, 2, 3] };
// const cloned = deepClone(original);
// cloned.b.c = 99;
// console.log(original.b.c); // 2 (unchanged)`,
    tags: ['javascript', 'utility']
  },
  {
    title: 'Group Array By Property',
    language: 'javascript',
    description: 'Groups an array of objects by a specified property key, returning an object with grouped arrays.',
    source: '',
    code: `export function groupBy(arr, keyFn) {
  if (!Array.isArray(arr)) {
    throw new TypeError('Expected an array as the first argument');
  }

  const getKey = typeof keyFn === 'function' ? keyFn : (item) => item[keyFn];

  return arr.reduce((groups, item) => {
    const key = getKey(item);
    const normalizedKey = String(key);

    if (!groups[normalizedKey]) {
      groups[normalizedKey] = [];
    }

    groups[normalizedKey].push(item);
    return groups;
  }, {});
}

// Usage:
// const users = [
//   { name: 'Alice', department: 'Engineering' },
//   { name: 'Bob', department: 'Marketing' },
//   { name: 'Charlie', department: 'Engineering' },
//   { name: 'Diana', department: 'Marketing' },
// ];
//
// const byDepartment = groupBy(users, 'department');
// // {
// //   Engineering: [{ name: 'Alice', ... }, { name: 'Charlie', ... }],
// //   Marketing: [{ name: 'Bob', ... }, { name: 'Diana', ... }]
// // }
//
// // Using a function key:
// const byFirstLetter = groupBy(users, (u) => u.name[0]);`,
    tags: ['javascript', 'utility']
  },
  {
    title: 'Decorator Pattern',
    language: 'python',
    description: 'Implementation of the Decorator design pattern for dynamically adding responsibilities to objects.',
    source: 'https://python-course.design-patterns/decorator',
    code: `from abc import ABC, abstractmethod


class DataSource(ABC):
    @abstractmethod
    def write_data(self, data):
        pass

    @abstractmethod
    def read_data(self):
        pass


class FileDataSource(DataSource):
    def __init__(self, filename):
        self.filename = filename
        self._data = ""

    def write_data(self, data):
        with open(self.filename, "w") as f:
            f.write(data)
        self._data = data

    def read_data(self):
        try:
            with open(self.filename, "r") as f:
                return f.read()
        except FileNotFoundError:
            return ""


class DataSourceDecorator(DataSource):
    def __init__(self, source):
        self._wrappee = source

    def write_data(self, data):
        self._wrappee.write_data(data)

    def read_data(self):
        return self._wrappee.read_data()


class EncryptionDecorator(DataSourceDecorator):
    def __init__(self, source, key=3):
        super().__init__(source)
        self.key = key

    def _encrypt(self, text):
        result = ""
        for char in text:
            if char.isalpha():
                base = ord('a') if char.islower() else ord('A')
                result += chr((ord(char) - base + self.key) % 26 + base)
            else:
                result += char
        return result

    def write_data(self, data):
        encrypted = self._encrypt(data)
        super().write_data(encrypted)

    def read_data(self):
        data = super().read_data()
        return self._encrypt(data)


class CompressionDecorator(DataSourceDecorator):
    def write_data(self, data):
        compressed = f"COMPRESSED[{len(data)}]:: {data}"
        super().write_data(compressed)

    def read_data(self):
        data = super().read_data()
        if data.startswith("COMPRESSED["):
            return data.split(":: ", 1)[1]
        return data


# Usage:
# source = FileDataSource("data.txt")
# encrypted = EncryptionDecorator(source, key=5)
# encrypted.write_data("Hello, World!")
# print(encrypted.read_data())  # "Khoor, Zruog!"
#
# compressed_encrypted = CompressionDecorator(EncryptionDecorator(source))
# compressed_encrypted.write_data("Hello, World!")`,
    tags: ['python', 'oop']
  },
  {
    title: 'Flatten Nested List',
    language: 'python',
    description: 'Recursively flattens arbitrarily nested lists/tuples into a single flat list.',
    source: '',
    code: `from collections.abc import Iterable


def flatten(lst, max_depth=None, _current_depth=0):
    """
    Recursively flatten a nested list/tuple structure.

    Args:
        lst: The nested iterable to flatten.
        max_depth: Maximum depth to flatten. None means unlimited.
        _current_depth: Internal tracking of recursion depth.

    Returns:
        A flat list containing all non-iterable elements.

    Examples:
        >>> flatten([1, [2, 3], [4, [5, 6]]])
        [1, 2, 3, 4, 5, 6]
        >>> flatten([1, [2, [3, [4, [5]]]]], max_depth=2)
        [1, 2, 3, [4, [5]]]
    """
    result = []

    for item in lst:
        if (
            isinstance(item, Iterable)
            and not isinstance(item, (str, bytes))
            and (max_depth is None or _current_depth < max_depth)
        ):
            result.extend(flatten(item, max_depth, _current_depth + 1))
        else:
            result.append(item)

    return result


def flatten_dict(d, parent_key="", sep="."):
    """
    Flatten a nested dictionary into a single-level dictionary.

    Args:
        d: The dictionary to flatten.
        parent_key: The base key for nested keys.
        sep: Separator between nested keys.

    Returns:
        A flat dictionary with dot-separated keys.

    Examples:
        >>> flatten_dict({"a": 1, "b": {"c": 2, "d": {"e": 3}}})
        {"a": 1, "b.c": 2, "b.d.e": 3}
    """
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep).items())
        else:
            items.append((new_key, v))
    return dict(items)


# Usage:
# nested = [1, [2, 3], [[4, 5], [6, [7, 8]]]]
# print(flatten(nested))
# # [1, 2, 3, 4, 5, 6, 7, 8]
#
# nested_dict = {"user": {"name": "Alice", "address": {"city": "NYC"}}}
# print(flatten_dict(nested_dict))
# # {"user.name": "Alice", "user.address.city": "NYC"}`,
    tags: ['python', 'utility']
  },
  {
    title: 'Read File Async',
    language: 'javascript',
    description: 'Utility functions for reading and writing files asynchronously with proper error handling.',
    source: '',
    code: `const fs = require('fs').promises;
const path = require('path');

async function readFileAsync(filePath, encoding = 'utf-8') {
  try {
    const absolutePath = path.resolve(filePath);
    const content = await fs.readFile(absolutePath, encoding);
    return { success: true, data: content, error: null };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: { message: error.message, code: error.code }
    };
  }
}

async function writeFileAsync(filePath, content, encoding = 'utf-8') {
  try {
    const absolutePath = path.resolve(filePath);
    const dir = path.dirname(absolutePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(absolutePath, content, encoding);
    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: { message: error.message, code: error.code }
    };
  }
}

async function readJsonFile(filePath) {
  const result = await readFileAsync(filePath);
  if (!result.success) return result;

  try {
    result.data = JSON.parse(result.data);
    return result;
  } catch (error) {
    return {
      success: false,
      data: null,
      error: { message: 'JSON parse error: ' + error.message, code: 'PARSE_ERROR' }
    };
  }
}

async function writeJsonFile(filePath, data, indent = 2) {
  try {
    const content = JSON.stringify(data, null, indent);
    return await writeFileAsync(filePath, content);
  } catch (error) {
    return {
      success: false,
      error: { message: 'JSON stringify error: ' + error.message, code: 'STRINGIFY_ERROR' }
    };
  }
}

module.exports = { readFileAsync, writeFileAsync, readJsonFile, writeJsonFile };

// Usage:
// const { data, success } = await readFileAsync('./config.json');
// if (success) console.log(data);
//
// const { success } = await writeJsonFile('./output.json', { key: 'value' });
// if (success) console.log('File written successfully');`,
    tags: ['nodejs', 'filesystem']
  },
  {
    title: 'Express Error Handler',
    language: 'javascript',
    description: 'Centralized error handling middleware for Express applications with custom error classes.',
    source: '',
    code: `class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details) {
    super(message, 400, details);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(\`\${resource} not found\`, 404);
    this.name = 'NotFoundError';
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

function notFoundHandler(req, res, next) {
  next(new NotFoundError(\`Route \${req.originalUrl}\`));
}

function errorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;

  console.error('Error:', {
    name: err.name,
    message: err.message,
    statusCode: err.statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: err.message,
      errors: err.details
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry. Resource already exists.'
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Referenced resource does not exist.'
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.isOperational ? err.message : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  notFoundHandler,
  errorHandler
};

// Usage in routes:
// router.post('/items', async (req, res, next) => {
//   try {
//     const { name } = req.body;
//     if (!name) throw new ValidationError('Name is required');
//     const item = await createItem(name);
//     res.json({ success: true, data: item });
//   } catch (err) {
//     next(err);
//   }
// });`,
    tags: ['nodejs', 'express']
  },
  {
    title: 'Top N Records Per Group',
    language: 'sql',
    description: 'SQL query to retrieve the top N records within each group using window functions.',
    source: '',
    code: `-- Method 1: Using ROW_NUMBER() window function (most flexible)
WITH ranked AS (
  SELECT
    *,
    ROW_NUMBER() OVER (
      PARTITION BY department
      ORDER BY salary DESC
    ) AS rank
  FROM employees
)
SELECT *
FROM ranked
WHERE rank <= 3
ORDER BY department, rank;


-- Method 2: Using LATERAL JOIN (PostgreSQL specific, efficient)
SELECT d.name AS department, e.*
FROM departments d
CROSS JOIN LATERAL (
  SELECT employee_id, name, salary
  FROM employees
  WHERE department_id = d.id
  ORDER BY salary DESC
  LIMIT 3
) e
ORDER BY d.name, e.salary DESC;


-- Method 3: Using a subquery with IN and correlated conditions
SELECT *
FROM employees e1
WHERE (
  SELECT COUNT(*)
  FROM employees e2
  WHERE e2.department_id = e1.department_id
    AND e2.salary > e1.salary
) < 3
ORDER BY department_id, salary DESC;


-- Method 4: Top N per group for orders per customer (common e-commerce use case)
WITH customer_orders AS (
  SELECT
    customer_id,
    order_id,
    order_date,
    total_amount,
    ROW_NUMBER() OVER (
      PARTITION BY customer_id
      ORDER BY order_date DESC
    ) AS rn
  FROM orders
)
SELECT
  c.name AS customer_name,
  co.order_id,
  co.order_date,
  co.total_amount
FROM customer_orders co
JOIN customers c ON c.id = co.customer_id
WHERE co.rn <= 5
ORDER BY c.name, co.order_date DESC;


-- Method 5: Using PERCENT_RANK for relative ranking
WITH ranked_products AS (
  SELECT
    category_id,
    product_name,
    price,
    PERCENT_RANK() OVER (
      PARTITION BY category_id
      ORDER BY price DESC
    ) AS price_percentile
  FROM products
)
SELECT *
FROM ranked_products
WHERE price_percentile <= 0.1  -- Top 10% most expensive per category
ORDER BY category_id, price DESC;`,
    tags: ['sql', 'query']
  },
  {
    title: 'Find Duplicate Records',
    language: 'sql',
    description: 'SQL queries to find and manage duplicate records in a database table.',
    source: '',
    code: `-- Method 1: Find duplicates using GROUP BY and HAVING
SELECT
  email,
  COUNT(*) AS duplicate_count
FROM users
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;


-- Method 2: Get full duplicate rows with all columns
SELECT *
FROM users
WHERE email IN (
  SELECT email
  FROM users
  GROUP BY email
  HAVING COUNT(*) > 1
)
ORDER BY email, id;


-- Method 3: Find duplicates based on multiple columns
SELECT
  first_name,
  last_name,
  DATEOfBirth,
  COUNT(*) AS occurrences
FROM contacts
GROUP BY first_name, last_name, DATEOfBirth
HAVING COUNT(*) > 1;


-- Method 4: Delete duplicates keeping the one with the lowest ID
DELETE FROM users
WHERE id NOT IN (
  SELECT MIN(id)
  FROM users
  GROUP BY email
);


-- Method 5: Keep the most recent record (by ID) and delete the rest
DELETE FROM users
WHERE id NOT IN (
  SELECT MAX(id)
  FROM users
  GROUP BY email
);


-- Method 6: Find and report near-duplicates (fuzzy matching)
-- Useful for finding similar names/emails
WITH potential_duplicates AS (
  SELECT
    a.id AS id_a,
    b.id AS id_b,
    a.name AS name_a,
    b.name AS name_b,
    a.email AS email_a,
    b.email AS email_b,
    LEVENSHTEIN(LOWER(a.name), LOWER(b.name)) AS name_similarity
  FROM users a
  JOIN users b ON a.id < b.id
    AND (
      a.email = b.email
      OR LEVENSHTEIN(LOWER(a.name), LOWER(b.name)) <= 3
    )
)
SELECT * FROM potential_duplicates
WHERE name_similarity <= 3
ORDER BY name_similarity;


-- Method 7: Find duplicates in a specific time window
SELECT
  user_id,
  action_type,
  COUNT(*) AS action_count
FROM user_actions
WHERE created_at >= NOW() - INTERVAL '1 hour'
GROUP BY user_id, action_type
HAVING COUNT(*) > 5  -- Flag if same action done more than 5 times in an hour
ORDER BY action_count DESC;`,
    tags: ['sql', 'query']
  },
  {
    title: 'Glassmorphism Effect',
    language: 'css',
    description: 'Modern glassmorphism UI effect with frosted glass appearance using CSS backdrop-filter.',
    source: 'https://ui.glass/generator/',
    code: `/* Glassmorphism Card Effect */
.glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  padding: 24px;
  color: #ffffff;
}

/* Dark glass variant */
.glass-dark {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  padding: 24px;
}

/* Glass button */
.glass-button {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px 24px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.glass-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

/* Glass input */
.glass-input {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 12px 16px;
  color: white;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s ease;
}

.glass-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.glass-input:focus {
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

/* Background with gradient for glassmorphism */
.glass-background {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* Container layout */
.glass-container {
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
}

/* Usage:
<div class="glass-background">
  <div class="glass-container">
    <div class="glass-card">
      <h2>Glass Card</h2>
      <input class="glass-input" placeholder="Enter text..." />
      <button class="glass-button">Submit</button>
    </div>
  </div>
</div> */`,
    tags: ['css', 'ui']
  },
  {
    title: 'Binary Search',
    language: 'java',
    description: 'Efficient binary search algorithm implementations for sorted arrays with both iterative and recursive approaches.',
    source: '',
    code: `public class BinarySearch {

    // Iterative approach - O(log n) time, O(1) space
    public static <T extends Comparable<T>> int search(T[] arr, T target) {
        int left = 0;
        int right = arr.length - 1;

        while (left <= right) {
            int mid = left + (right - left) / 2;
            int comparison = arr[mid].compareTo(target);

            if (comparison == 0) {
                return mid;
            } else if (comparison < 0) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        return -1;
    }

    // Recursive approach - O(log n) time, O(log n) space
    public static <T extends Comparable<T>> int searchRecursive(T[] arr, T target) {
        return binarySearch(arr, target, 0, arr.length - 1);
    }

    private static <T extends Comparable<T>> int binarySearch(T[] arr, T target, int left, int right) {
        if (left > right) {
            return -1;
        }

        int mid = left + (right - left) / 2;
        int comparison = arr[mid].compareTo(target);

        if (comparison == 0) {
            return mid;
        } else if (comparison < 0) {
            return binarySearch(arr, target, mid + 1, right);
        } else {
            return binarySearch(arr, target, left, mid - 1);
        }
    }

    // Find first occurrence - useful for arrays with duplicates
    public static <T extends Comparable<T>> int findFirst(T[] arr, T target) {
        int left = 0;
        int right = arr.length - 1;
        int result = -1;

        while (left <= right) {
            int mid = left + (right - left) / 2;
            int comparison = arr[mid].compareTo(target);

            if (comparison == 0) {
                result = mid;
                right = mid - 1;  // Continue searching left
            } else if (comparison < 0) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        return result;
    }

    // Find last occurrence
    public static <T extends Comparable<T>> int findLast(T[] arr, T target) {
        int left = 0;
        int right = arr.length - 1;
        int result = -1;

        while (left <= right) {
            int mid = left + (right - left) / 2;
            int comparison = arr[mid].compareTo(target);

            if (comparison == 0) {
                result = mid;
                left = mid + 1;  // Continue searching right
            } else if (comparison < 0) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        return result;
    }

    // Find insertion point (where element should be inserted to maintain order)
    public static <T extends Comparable<T>> int findInsertionPoint(T[] arr, T target) {
        int left = 0;
        int right = arr.length;

        while (left < right) {
            int mid = left + (right - left) / 2;
            if (arr[mid].compareTo(target) < 0) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }

        return left;
    }

    public static void main(String[] args) {
        Integer[] numbers = {1, 3, 5, 7, 9, 11, 13, 15, 17, 19};

        System.out.println("Search for 7: " + search(numbers, 7));           // 3
        System.out.println("Search for 8: " + search(numbers, 8));           // -1
        System.out.println("Recursive search for 15: " + searchRecursive(numbers, 15)); // 7

        String[] words = {"apple", "banana", "cherry", "date", "fig", "grape"};
        System.out.println("Search for cherry: " + search(words, "cherry"));  // 2
    }
}`,
    tags: ['java', 'algorithm']
  },
  {
    title: 'Aggregation Pipeline',
    language: 'javascript',
    description: 'MongoDB aggregation pipeline patterns for common data analysis and reporting tasks.',
    source: '',
    code: `// MongoDB Aggregation Pipeline Examples

// 1. Monthly Revenue Report
const monthlyRevenue = await db.orders.aggregate([
  {
    $match: {
      status: "completed",
      createdAt: {
        $gte: new Date("2024-01-01"),
        $lt: new Date("2025-01-01")
      }
    }
  },
  {
    $group: {
      _id: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" }
      },
      totalRevenue: { $sum: "$total" },
      orderCount: { $sum: 1 },
      avgOrderValue: { $avg: "$total" },
      uniqueCustomers: { $addToSet: "$customerId" }
    }
  },
  {
    $addFields: {
      uniqueCustomerCount: { $size: "$uniqueCustomers" },
      monthName: {
        $switch: {
          branches: [
            { case: { $eq: ["$_id.month", 1] }, then: "January" },
            { case: { $eq: ["$_id.month", 2] }, then: "February" },
            { case: { $eq: ["$_id.month", 3] }, then: "March" },
            { case: { $eq: ["$_id.month", 4] }, then: "April" },
            { case: { $eq: ["$_id.month", 5] }, then: "May" },
            { case: { $eq: ["$_id.month", 6] }, then: "June" },
            { case: { $eq: ["$_id.month", 7] }, then: "July" },
            { case: { $eq: ["$_id.month", 8] }, then: "August" },
            { case: { $eq: ["$_id.month", 9] }, then: "September" },
            { case: { $eq: ["$_id.month", 10] }, then: "October" },
            { case: { $eq: ["$_id.month", 11] }, then: "November" },
            { case: { $eq: ["$_id.month", 12] }, then: "December" }
          ],
          default: "Unknown"
        }
      }
    }
  },
  { $sort: { "_id.year": 1, "_id.month": 1 } }
]);

// 2. Top Products by Category with Sales Stats
const topProductsByCategory = await db.products.aggregate([
  {
    $lookup: {
      from: "sales",
      localField: "_id",
      foreignField: "productId",
      as: "salesData"
    }
  },
  {
    $unwind: "$salesData"
  },
  {
    $group: {
      _id: { category: "$category", product: "$name" },
      totalSold: { $sum: "$salesData.quantity" },
      revenue: { $sum: { $multiply: ["$salesData.quantity", "$salesData.price"] } },
      avgPrice: { $avg: "$salesData.price" },
      saleDates: { $addToSet: "$salesData.date" }
    }
  },
  {
    $sort: { "_id.category": 1, revenue: -1 }
  },
  {
    $group: {
      _id: "$_id.category",
      products: {
        $push: {
          name: "$_id.product",
          totalSold: "$totalSold",
          revenue: "$revenue",
          avgPrice: { $round: ["$avgPrice", 2] },
          saleCount: { $size: "$saleDates" }
        }
      },
      categoryRevenue: { $sum: "$revenue" }
    }
  },
  {
    $addFields: {
      products: { $slice: ["$products", 5] }
    }
  },
  { $sort: { categoryRevenue: -1 } }
]);

// 3. User Activity Analysis with Session Tracking
const userActivity = await db.events.aggregate([
  {
    $match: {
      eventType: { $in: ["pageview", "click", "purchase", "signup"] },
      timestamp: { $gte: ISODate("2024-01-01") }
    }
  },
  {
    $group: {
      _id: "$userId",
      totalEvents: { $sum: 1 },
      eventTypes: { $addToSet: "$eventType" },
      firstActivity: { $min: "$timestamp" },
      lastActivity: { $max: "$timestamp" },
      sessions: {
        $addToSet: {
          $cond: [
            { $eq: ["$eventType", "pageview"] },
            { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            "$$REMOVE"
          ]
        }
      }
    }
  },
  {
    $addFields: {
      sessionDays: { $size: "$sessions" },
      activitySpanDays: {
        $divide: [
          { $subtract: ["$lastActivity", "$firstActivity"] },
          86400000
        ]
      },
      isPowerUser: {
        $and: [
          { $gte: ["$totalEvents", 100] },
          { $gte: [{ $size: "$sessions" }, 10] }
        ]
      }
    }
  },
  { $sort: { totalEvents: -1 } },
  { $limit: 50 }
]);

// 4. Product Recommendation Engine
const recommendations = await db.purchases.aggregate([
  {
    $match: {
      userId: "user123",
      createdAt: { $gte: ISODate("2024-01-01") }
    }
  },
  {
    $lookup: {
      from: "purchases",
      localField: "productId",
      foreignField: "productId",
      as: "otherBuyers"
    }
  },
  { $unwind: "$otherBuyers" },
  {
    $match: {
      "otherBuyers.userId": { $ne: "user123" }
    }
  },
  {
    $lookup: {
      from: "purchases",
      localField: "otherBuyers.userId",
      foreignField: "userId",
      as: "alsoBought"
    }
  },
  { $unwind: "$alsoBought" },
  {
    $match: {
      "alsoBought.productId": { $ne: "$productId" }
    }
  },
  {
    $group: {
      _id: "$alsoBought.productId",
      score: { $sum: 1 },
      uniqueBuyers: { $addToSet: "$otherBuyers.userId" }
    }
  },
  {
    $addFields: {
      recommendationScore: {
        $divide: ["$score", { $size: "$uniqueBuyers" }]
      }
    }
  },
  { $sort: { recommendationScore: -1 } },
  { $limit: 10 },
  {
    $lookup: {
      from: "products",
      localField: "_id",
      foreignField: "_id",
      as: "product"
    }
  },
  { $unwind: "$product" },
  {
    $project: {
      productId: "$_id",
      name: "$product.name",
      price: "$product.price",
      category: "$product.category",
      recommendationScore: 1
    }
  }
]);

module.exports = {
  monthlyRevenue,
  topProductsByCategory,
  userActivity,
  recommendations
};`,
    tags: ['mongodb', 'query']
  }
];

async function initDatabase() {
  const client = await pool.connect();
  try {
    console.log('Connected to PostgreSQL database');
    console.log('Creating tables...');
    await client.query(createTables);
    console.log('Tables created successfully');

    const demoEmail = process.env.DEMO_USER_EMAIL || 'demo@snippetbox.dev';
    const demoPassword = process.env.DEMO_USER_PASSWORD || 'demo123';

    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [demoEmail]
    );

    if (existingUser.rows.length > 0) {
      console.log('Demo user already exists, skipping seed data');
      return;
    }

    console.log('Seeding demo data...');
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(demoPassword, 10);

    const userResult = await client.query(
      `INSERT INTO users (name, email, password_hash, description)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [
        'Demo User',
        demoEmail,
        passwordHash,
        'Full-stack developer passionate about clean code and efficient solutions.'
      ]
    );
    const userId = userResult.rows[0].id;

    const tagMap = {};
    const allTags = [...new Set(demoSnippets.flatMap(s => s.tags))];

    for (const tagName of allTags) {
      const tagResult = await client.query(
        `INSERT INTO tags (user_id, name) VALUES ($1, $2) RETURNING id`,
        [userId, tagName]
      );
      tagMap[tagName] = tagResult.rows[0].id;
    }

    for (const snippet of demoSnippets) {
      const snippetResult = await client.query(
        `INSERT INTO snippets (user_id, title, code, language, description, source, is_favorite, visibility)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          userId,
          snippet.title,
          snippet.code,
          snippet.language,
          snippet.description,
          snippet.source || '',
          Math.random() > 0.5,
          'public'
        ]
      );
      const snippetId = snippetResult.rows[0].id;

      for (const tagName of snippet.tags) {
        const tagId = tagMap[tagName];
        await client.query(
          `INSERT INTO snippet_tags (snippet_id, tag_id) VALUES ($1, $2)`,
          [snippetId, tagId]
        );
      }
    }

    const collectionResult = await client.query(
      `INSERT INTO collections (user_id, name, description)
       VALUES ($1, $2, $3), ($1, $4, $5), ($1, $6, $7)
       RETURNING id`,
      [
        userId,
        'React Hooks',
        'Collection of useful React hooks for various use cases',
        'JavaScript Utilities',
        'General-purpose JavaScript utility functions',
        'Database Queries',
        'SQL and NoSQL query patterns and examples'
      ]
    );

    const collectionIds = collectionResult.rows.map(r => r.id);
    const snippetsResult = await client.query(
      'SELECT id, title FROM snippets WHERE user_id = $1',
      [userId]
    );
    const snippetsByTitle = {};
    snippetsResult.rows.forEach(s => { snippetsByTitle[s.title] = s.id; });

    const collectionMappings = [
      { collection: 0, titles: ['useDebounce Hook'] },
      { collection: 1, titles: ['Deep Clone Object', 'Group Array By Property', 'Flatten Nested List'] },
      { collection: 2, titles: ['Top N Records Per Group', 'Find Duplicate Records', 'Aggregation Pipeline'] }
    ];

    for (const mapping of collectionMappings) {
      for (const title of mapping.titles) {
        const snippetId = snippetsByTitle[title];
        if (snippetId) {
          await client.query(
            `INSERT INTO snippet_collections (snippet_id, collection_id) VALUES ($1, $2)`,
            [snippetId, collectionIds[mapping.collection]]
          );
        }
      }
    }

    console.log('Demo data seeded successfully!');
    console.log(`Demo user: ${demoEmail} / ${demoPassword}`);
    console.log(`Created ${demoSnippets.length} snippets`);
    console.log(`Created ${allTags.length} tags`);
    console.log('Created 3 collections');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('Database initialization complete');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Failed to initialize database:', err);
      process.exit(1);
    });
}

module.exports = initDatabase;
