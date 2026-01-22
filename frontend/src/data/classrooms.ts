// Mock classroom data with code - this would come from a database in production
export interface Classroom {
  id: string;
  name: string;
  role: "owner" | "member";
  participantCount: number;
  language: string;
  code: string;
}

export const classroomsData: Classroom[] = [
  {
    id: "1",
    name: "Python Fundamentals",
    role: "owner",
    participantCount: 24,
    language: "python",
    code: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Calculate first 10 numbers
for i in range(10):
    print(fibonacci(i))`,
  },
  {
    id: "2",
    name: "Data Structures & Algorithms",
    role: "member",
    participantCount: 18,
    language: "python",
    code: `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
    
    def append(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            return
        current = self.head
        while current.next:
            current = current.next
        current.next = new_node`,
  },
  {
    id: "3",
    name: "Web Development Bootcamp",
    role: "owner",
    participantCount: 32,
    language: "javascript",
    code: `const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/api/users', (req, res) => {
    res.json([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
    ]);
});

app.listen(3000);`,
  },
  {
    id: "4",
    name: "Machine Learning Study Group",
    role: "member",
    participantCount: 12,
    language: "python",
    code: `import numpy as np
from sklearn import datasets
from sklearn.model_selection import train_test_split

# Load iris dataset
iris = datasets.load_iris()
X, y = iris.data, iris.target

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)`,
  },
];

export const getClassroomById = (id: string): Classroom | undefined => {
  return classroomsData.find((c) => c.id === id);
};

export const getCodePreview = (code: string): string => {
  // Return first 8 lines for preview
  return code.split("\n").slice(0, 8).join("\n");
};
