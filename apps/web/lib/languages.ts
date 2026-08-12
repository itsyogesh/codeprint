// Language data for all root-level /[language] pages
// Each language includes SEO metadata, sample code, use cases, and FAQ content

export interface LanguageFAQ {
  question: string
  answer: string
}

export interface LanguageUseCase {
  title: string
  description: string
}

export interface LanguageFeature {
  title: string
  description: string
}

export interface LanguageData {
  slug: string
  name: string
  hljsKey: string
  extension: string
  defaultFilename: string
  sampleCode: string
  // SEO
  title: string
  description: string
  h1: string
  subtitle: string
  keywords: string[]
  // Content
  features: LanguageFeature[]
  useCases: LanguageUseCase[]
  faq: LanguageFAQ[]
}

export const LANGUAGES: LanguageData[] = [
  {
    slug: "python",
    name: "Python",
    hljsKey: "python",
    extension: "py",
    defaultFilename: "app.py",
    sampleCode: `import json
from pathlib import Path
from dataclasses import dataclass

@dataclass
class Config:
    host: str = "localhost"
    port: int = 8080
    debug: bool = False

def load_config(path: str) -> Config:
    """Load configuration from a JSON file."""
    config_path = Path(path)
    if not config_path.exists():
        return Config()

    with open(config_path) as f:
        data = json.load(f)

    return Config(**data)

def main():
    config = load_config("config.json")
    print(f"Server running on {config.host}:{config.port}")

    if config.debug:
        print("Debug mode enabled")

if __name__ == "__main__":
    main()`,
    title: "Print Python Code with Syntax Highlighting for Free",
    description:
      "Print Python code with syntax highlighting, line numbers, and PDF export. Free online tool for formatting Python scripts, classes, and notebooks for review or documentation.",
    h1: "Print Python Code with Syntax Highlighting",
    subtitle: "Paste a script, pick your layout, export as PDF. Colors and line numbers included.",
    keywords: [
      "print python code",
      "python code to pdf",
      "python syntax highlighting",
      "python code printer",
      "format python code",
      "python pdf export",
    ],
    features: [
      {
        title: "Python Syntax Highlighting",
        description:
          "Full support for Python keywords, decorators, f-strings, type hints, and comprehensions with accurate colorized output.",
      },
      {
        title: "PDF Export",
        description:
          "Download your Python scripts as professionally formatted PDF documents with preserved syntax colors and line numbers.",
      },
      {
        title: "Customizable Layout",
        description:
          "Choose font size, page orientation, columns, and page size. Multi-column layout is ideal for dense Python scripts.",
      },
      {
        title: "Line Numbers",
        description:
          "Toggle line numbers on or off. Essential for code reviews where referencing specific lines matters.",
      },
    ],
    useCases: [
      {
        title: "Code Reviews",
        description:
          "Print Python code for offline desk checking. Many senior engineers prefer reviewing code on paper to catch logic errors that screens miss.",
      },
      {
        title: "Teaching & Workshops",
        description:
          "Create handouts for Python classes and workshops. Students follow along with printed code that includes line numbers for easy reference.",
      },
      {
        title: "Documentation",
        description:
          "Include formatted Python code snippets in technical documentation, architecture decision records, or project reports.",
      },
      {
        title: "Interview Prep",
        description:
          "Print algorithm implementations and data structure code for offline study. Annotate printed code with notes and corrections.",
      },
    ],
    faq: [
      {
        question: "How do I print Python code with syntax highlighting?",
        answer:
          "Paste your Python code into Codeprint, and it automatically applies syntax highlighting for keywords, strings, decorators, and comments. Click Print to send it to your printer, or click PDF to download a formatted document.",
      },
      {
        question: "Does Codeprint support Python type hints and f-strings?",
        answer:
          "Yes. Codeprint uses highlight.js which fully supports modern Python syntax including type annotations, f-strings, walrus operator (:=), match statements, and dataclasses.",
      },
      {
        question: "Can I export Python code to PDF?",
        answer:
          "Yes. Click the PDF button to generate a downloadable PDF with your Python code. The PDF preserves syntax highlighting, line numbers, and your chosen layout settings including font size and page orientation.",
      },
      {
        question: "Is Codeprint free to use?",
        answer:
          "Yes, Codeprint is completely free. There are no sign-ups, no watermarks, and no limits on file size. Your code stays in your browser and is never sent to a server.",
      },
      {
        question: "Can I print Python Jupyter notebook cells?",
        answer:
          "You can copy code cells from Jupyter notebooks and paste them into Codeprint for formatted printing. For full notebook rendering with markdown cells, use the Markdown Printer.",
      },
    ],
  },
  {
    slug: "javascript",
    name: "JavaScript",
    hljsKey: "javascript",
    extension: "js",
    defaultFilename: "app.js",
    sampleCode: `import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.findAll({
      limit: parseInt(req.query.limit) || 20,
      offset: parseInt(req.query.offset) || 0,
    });
    res.json({ data: users, count: users.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email required' });
  }

  const user = await User.create({ name, email });
  res.status(201).json(user);
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
    title: "Print JavaScript Code with Syntax Highlighting for Free",
    description:
      "Print JavaScript code with syntax highlighting, line numbers, and PDF export. Free tool for formatting JS files, React components, and Node.js scripts.",
    h1: "Print JavaScript Code with Syntax Highlighting",
    subtitle:
      "Format and export JavaScript files as PDF with colorized syntax, line numbers, and customizable layout. Works with ES6+, React, Node.js, and more.",
    keywords: [
      "print javascript code",
      "javascript code to pdf",
      "js syntax highlighting",
      "javascript code printer",
      "format javascript code",
      "js pdf export",
    ],
    features: [
      {
        title: "JavaScript Syntax Highlighting",
        description:
          "Full support for ES6+ features including arrow functions, template literals, destructuring, async/await, and optional chaining.",
      },
      {
        title: "PDF Export",
        description:
          "Download JavaScript files as professionally formatted PDF documents with syntax colors, line numbers, and clean typography.",
      },
      {
        title: "Customizable Layout",
        description:
          "Adjust font size, page orientation, and columns. Use landscape mode for long lines common in React JSX code.",
      },
      {
        title: "Line Numbers",
        description: "Toggle line numbers for easy reference during code reviews and debugging sessions.",
      },
    ],
    useCases: [
      {
        title: "Code Reviews",
        description:
          "Print JavaScript modules for offline review. Annotate printed code with comments about architecture, naming, and potential bugs.",
      },
      {
        title: "Teaching & Tutorials",
        description:
          "Create handouts for JavaScript bootcamps and workshops. Printed code with line numbers helps students follow along during live coding sessions.",
      },
      {
        title: "Documentation",
        description:
          "Include formatted JavaScript examples in API documentation, style guides, or technical specifications.",
      },
      {
        title: "Debugging",
        description:
          "Print complex JavaScript logic for whiteboard debugging. Trace execution flow on paper to find issues that are hard to spot on screen.",
      },
    ],
    faq: [
      {
        question: "How do I print JavaScript code with colors?",
        answer:
          "Paste your JavaScript code into Codeprint and syntax highlighting is applied automatically. Keywords, strings, numbers, and comments are colorized. Click Print or PDF to export the formatted output.",
      },
      {
        question: "Does it support JSX and React code?",
        answer:
          "Yes. Codeprint highlights JSX syntax within JavaScript files. For TypeScript React files (.tsx), select TypeScript as the language for the best highlighting.",
      },
      {
        question: "Can I print Node.js server code?",
        answer:
          "Absolutely. Browser-side JavaScript, Node.js, Deno, and Bun code is highlighted correctly. CommonJS require() and ES module import syntax are both supported.",
      },
      {
        question: "How do I handle long lines in JavaScript?",
        answer:
          "Long lines wrap automatically in the preview. You can also switch to landscape orientation or reduce the font size in settings for code with long lines like JSX templates.",
      },
      {
        question: "Is my JavaScript code sent to a server?",
        answer:
          "No. All processing happens in your browser. Your code never leaves your device. Codeprint works entirely client-side with no server uploads.",
      },
    ],
  },
  {
    slug: "typescript",
    name: "TypeScript",
    hljsKey: "typescript",
    extension: "ts",
    defaultFilename: "app.ts",
    sampleCode: `interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
}

type UserCreateInput = Omit<User, 'id' | 'createdAt'>;

class UserService {
  private users: Map<string, User> = new Map();

  async create(input: UserCreateInput): Promise<User> {
    const user: User = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async findByRole(role: User['role']): Promise<User[]> {
    return Array.from(this.users.values())
      .filter(user => user.role === role);
  }

  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
  }
}

export const userService = new UserService();`,
    title: "Print TypeScript Code with Syntax Highlighting for Free",
    description:
      "Print TypeScript code with syntax highlighting, line numbers, and PDF export. Free tool for formatting TS files, interfaces, generics, and type definitions.",
    h1: "Print TypeScript Code with Syntax Highlighting",
    subtitle:
      "Format and export TypeScript files as PDF with colorized types, interfaces, and generics. Line numbers, custom fonts, and multiple page sizes.",
    keywords: [
      "print typescript code",
      "typescript code to pdf",
      "ts syntax highlighting",
      "typescript code printer",
      "format typescript code",
      "typescript pdf export",
    ],
    features: [
      {
        title: "TypeScript Syntax Highlighting",
        description:
          "Full support for TypeScript-specific syntax: interfaces, type aliases, generics, enums, decorators, and utility types.",
      },
      {
        title: "PDF Export",
        description:
          "Export TypeScript files as PDF with type annotations clearly highlighted and distinguished from runtime code.",
      },
      {
        title: "Customizable Layout",
        description:
          "Adjust font size, orientation, and columns. TypeScript's verbose type definitions benefit from landscape orientation.",
      },
      {
        title: "Line Numbers",
        description: "Line numbers help reference specific type definitions and implementations during code reviews.",
      },
    ],
    useCases: [
      {
        title: "Type System Reviews",
        description:
          "Print TypeScript interfaces and type definitions for architectural review. Paper makes it easier to trace type relationships across files.",
      },
      {
        title: "Teaching TypeScript",
        description:
          "Create handouts showing type annotations alongside JavaScript code. Students can see how TypeScript adds safety to JavaScript patterns.",
      },
      {
        title: "API Documentation",
        description:
          "Print TypeScript interface definitions as part of API contracts. Include them in design documents and specification reviews.",
      },
      {
        title: "Migration Planning",
        description:
          "Print JavaScript files alongside their TypeScript equivalents to plan and review JS-to-TS migration strategies.",
      },
    ],
    faq: [
      {
        question: "How do I print TypeScript code with syntax highlighting?",
        answer:
          "Paste your TypeScript code into Codeprint and select TypeScript as the language. Types, interfaces, and generics are highlighted with distinct colors. Click Print or PDF to export.",
      },
      {
        question: "Does it highlight TypeScript-specific syntax?",
        answer:
          "Yes. Codeprint highlights TypeScript interfaces, type aliases, generics, enums, decorators, utility types like Partial<T> and Omit<T>, and access modifiers like private and readonly.",
      },
      {
        question: "Can I print .tsx React TypeScript files?",
        answer:
          "Yes. Select TypeScript as the language and paste your .tsx code. JSX elements within TypeScript files are highlighted correctly alongside type annotations.",
      },
      {
        question: "What about very long type definitions?",
        answer:
          "Long type definitions wrap automatically. For complex types, try landscape orientation or a smaller font size. Multi-column layout can also help fit more type definitions on a page.",
      },
    ],
  },
  {
    slug: "html",
    name: "HTML",
    hljsKey: "html",
    extension: "html",
    defaultFilename: "index.html",
    sampleCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard | My App</title>
  <link rel="stylesheet" href="/styles/main.css">
</head>
<body>
  <header class="navbar">
    <nav aria-label="Main navigation">
      <a href="/" class="logo">MyApp</a>
      <ul class="nav-links">
        <li><a href="/dashboard">Dashboard</a></li>
        <li><a href="/settings">Settings</a></li>
        <li><a href="/profile">Profile</a></li>
      </ul>
    </nav>
  </header>

  <main class="container">
    <section id="stats" class="dashboard-grid">
      <div class="card">
        <h2>Total Users</h2>
        <p class="stat">1,247</p>
      </div>
      <div class="card">
        <h2>Revenue</h2>
        <p class="stat">$45,230</p>
      </div>
    </section>
  </main>

  <script src="/js/dashboard.js"></script>
</body>
</html>`,
    title: "Print HTML Code with Syntax Highlighting for Free",
    description:
      "Print HTML code with syntax highlighting, line numbers, and PDF export. Free tool for formatting HTML pages, templates, and markup for documentation.",
    h1: "Print HTML Code with Syntax Highlighting",
    subtitle:
      "Format and export HTML files as PDF with colorized tags, attributes, and structure. Perfect for web development documentation and teaching.",
    keywords: [
      "html code to pdf",
      "print html code",
      "html syntax highlighting",
      "html code printer",
      "format html code",
      "html pdf export",
    ],
    features: [
      {
        title: "HTML Syntax Highlighting",
        description:
          "Tags, attributes, values, comments, and entities are colorized for clear visual structure of your markup.",
      },
      {
        title: "PDF Export",
        description: "Export HTML documents as PDF with highlighted markup structure preserved for offline reference.",
      },
      {
        title: "Customizable Layout",
        description:
          "Choose landscape for wide HTML templates or portrait for component markup. Adjust font size for readability.",
      },
      {
        title: "Line Numbers",
        description: "Line numbers help identify nesting levels and reference specific elements during reviews.",
      },
    ],
    useCases: [
      {
        title: "Web Development Docs",
        description:
          "Print HTML templates for documentation. Include formatted markup in design systems and component libraries.",
      },
      {
        title: "Teaching HTML",
        description:
          "Create handouts for HTML courses. Color-coded tags and attributes help beginners understand document structure.",
      },
      {
        title: "Accessibility Audits",
        description:
          "Print HTML for offline accessibility reviews. Check ARIA attributes, semantic elements, and heading structure on paper.",
      },
      {
        title: "Template Reviews",
        description: "Review email templates, landing pages, and component markup in printed form for thorough QA.",
      },
    ],
    faq: [
      {
        question: "How do I print HTML with syntax highlighting?",
        answer:
          "Paste your HTML into Codeprint and it will colorize tags, attributes, and content automatically. Click Print or PDF to export the formatted markup.",
      },
      {
        question: "Does it support HTML5 elements?",
        answer:
          "Yes. All HTML5 elements including <main>, <section>, <article>, <nav>, <header>, <footer>, and custom data attributes are highlighted correctly.",
      },
      {
        question: "Can I print HTML with embedded CSS and JavaScript?",
        answer:
          "Yes. Inline <style> and <script> blocks within HTML are highlighted with their respective language syntax for CSS and JavaScript.",
      },
      {
        question: "How do I handle large HTML files?",
        answer:
          "Codeprint handles large files well. Use multi-column layout for dense HTML and adjust font size to fit more content per page.",
      },
    ],
  },
  {
    slug: "css",
    name: "CSS",
    hljsKey: "css",
    extension: "css",
    defaultFilename: "styles.css",
    sampleCode: `:root {
  --primary: #6366f1;
  --primary-hover: #4f46e5;
  --bg: #ffffff;
  --text: #1e293b;
  --border: #e2e8f0;
  --radius: 0.5rem;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', system-ui, sans-serif;
  color: var(--text);
  background: var(--bg);
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.625rem 1.25rem;
  border-radius: var(--radius);
  font-weight: 500;
  transition: all 0.15s ease;
  cursor: pointer;
}

.btn-primary {
  background: var(--primary);
  color: white;
  border: none;
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
}`,
    title: "Print CSS Code with Syntax Highlighting for Free",
    description:
      "Print CSS code with syntax highlighting, line numbers, and PDF export. Free tool for formatting stylesheets, custom properties, and media queries.",
    h1: "Print CSS Code with Syntax Highlighting",
    subtitle:
      "Format and export CSS files as PDF with colorized selectors, properties, and values. Great for style guide documentation and design system reviews.",
    keywords: [
      "print css code",
      "css to pdf",
      "css syntax highlighting",
      "css code printer",
      "format css code",
      "css stylesheet pdf",
    ],
    features: [
      {
        title: "CSS Syntax Highlighting",
        description:
          "Selectors, properties, values, custom properties, media queries, and comments are colorized for quick scanning.",
      },
      {
        title: "PDF Export",
        description: "Export stylesheets as PDF with syntax colors preserved for design system documentation.",
      },
      {
        title: "Customizable Layout",
        description:
          "Multi-column layout works well for CSS, fitting more rules per page. Adjust font size for dense stylesheets.",
      },
      {
        title: "Line Numbers",
        description: "Reference specific CSS rules by line number during style audits and team reviews.",
      },
    ],
    useCases: [
      {
        title: "Design System Docs",
        description:
          "Print CSS custom properties and component styles as part of your design system documentation package.",
      },
      {
        title: "Style Audits",
        description:
          "Print stylesheets for specificity audits. Review selector complexity and identify opportunities to simplify CSS.",
      },
      {
        title: "Teaching CSS",
        description:
          "Color-coded selectors and properties help students understand the cascade, specificity, and inheritance.",
      },
      {
        title: "Client Handoffs",
        description: "Include formatted CSS in client deliverables alongside design mockups and brand guidelines.",
      },
    ],
    faq: [
      {
        question: "How do I print CSS with syntax highlighting?",
        answer:
          "Paste your CSS into Codeprint, and selectors, properties, values, and comments are colorized automatically. Export via Print or PDF.",
      },
      {
        question: "Does it support CSS custom properties?",
        answer:
          "Yes. CSS custom properties (--variables), calc(), clamp(), and modern CSS features like container queries and :has() are highlighted correctly.",
      },
      {
        question: "Can I print Sass or SCSS?",
        answer:
          "Codeprint highlights standard CSS. For Sass/SCSS, CSS-compatible parts will be colorized, but Sass-specific syntax such as nesting and mixins may not be fully highlighted.",
      },
      {
        question: "What about Tailwind CSS utility classes?",
        answer:
          "Tailwind CSS config files (JavaScript/TypeScript) can be printed with their respective language. For utility classes in HTML, print your HTML files with HTML syntax highlighting.",
      },
    ],
  },
  {
    slug: "java",
    name: "Java",
    hljsKey: "java",
    extension: "java",
    defaultFilename: "Main.java",
    sampleCode: `import java.util.*;
import java.util.stream.Collectors;

public class UserService {
    private final Map<String, User> users = new HashMap<>();

    public User createUser(String name, String email) {
        String id = UUID.randomUUID().toString();
        User user = new User(id, name, email);
        users.put(id, user);
        return user;
    }

    public Optional<User> findById(String id) {
        return Optional.ofNullable(users.get(id));
    }

    public List<User> findByName(String query) {
        return users.values().stream()
            .filter(u -> u.getName()
                .toLowerCase()
                .contains(query.toLowerCase()))
            .sorted(Comparator.comparing(User::getName))
            .collect(Collectors.toList());
    }

    public boolean deleteUser(String id) {
        return users.remove(id) != null;
    }

    public record User(String id, String name, String email) {}
}`,
    title: "Print Java Code with Syntax Highlighting for Free",
    description:
      "Print Java code with syntax highlighting, line numbers, and PDF export. Free tool for formatting Java classes, methods, and enterprise code.",
    h1: "Print Java Code with Syntax Highlighting",
    subtitle:
      "Format and export Java source files as PDF with colorized syntax, line numbers, and customizable layout. Ideal for code reviews and academic submissions.",
    keywords: [
      "print java code",
      "java code to pdf",
      "java syntax highlighting",
      "java code printer",
      "format java code",
      "java pdf export",
    ],
    features: [
      {
        title: "Java Syntax Highlighting",
        description:
          "Full support for Java keywords, annotations, generics, records, sealed classes, and pattern matching.",
      },
      {
        title: "PDF Export",
        description:
          "Export Java source files as PDF with proper formatting for class hierarchies and method signatures.",
      },
      {
        title: "Customizable Layout",
        description:
          "Adjust font size and page orientation for Java's typically verbose class definitions and method signatures.",
      },
      {
        title: "Line Numbers",
        description: "Line numbers are essential for Java code reviews and academic assignment submissions.",
      },
    ],
    useCases: [
      {
        title: "Code Reviews",
        description:
          "Print Java classes for offline review. Java's verbose syntax benefits from paper review where you can annotate and trace logic flow.",
      },
      {
        title: "Academic Submissions",
        description:
          "Many computer science courses require printed Java code submissions. Codeprint formats them professionally with line numbers.",
      },
      {
        title: "Architecture Documentation",
        description:
          "Print key Java interfaces and abstract classes as part of architecture documentation and design review packages.",
      },
      {
        title: "Certification Study",
        description:
          "Print Java code samples for Oracle certification exam preparation. Study patterns and APIs away from screens.",
      },
    ],
    faq: [
      {
        question: "How do I print Java code with syntax highlighting?",
        answer:
          "Paste your Java code into Codeprint and select Java as the language. Keywords, types, annotations, and comments are highlighted. Export via Print or PDF.",
      },
      {
        question: "Does it support modern Java features?",
        answer:
          "Yes. Java records, sealed classes, pattern matching, text blocks, and var type inference are all highlighted correctly.",
      },
      {
        question: "Can I print multiple Java files?",
        answer:
          "Codeprint handles one file at a time. For multiple files, print each class separately with its filename in the header to keep them organized.",
      },
      {
        question: "How does it handle Java annotations?",
        answer:
          "Annotations like @Override, @Autowired, and custom annotations are highlighted distinctly from other code elements for easy identification.",
      },
    ],
  },
  {
    slug: "cpp",
    name: "C++",
    hljsKey: "cpp",
    extension: "cpp",
    defaultFilename: "main.cpp",
    sampleCode: `#include <iostream>
#include <vector>
#include <algorithm>
#include <memory>

template<typename T>
class Stack {
private:
    std::vector<T> data;

public:
    void push(const T& value) {
        data.push_back(value);
    }

    T pop() {
        if (data.empty()) {
            throw std::runtime_error("Stack underflow");
        }
        T value = std::move(data.back());
        data.pop_back();
        return value;
    }

    [[nodiscard]] bool empty() const noexcept {
        return data.empty();
    }

    [[nodiscard]] size_t size() const noexcept {
        return data.size();
    }
};

int main() {
    auto stack = std::make_unique<Stack<int>>();

    for (int i = 1; i <= 10; ++i) {
        stack->push(i * i);
    }

    while (!stack->empty()) {
        std::cout << stack->pop() << "\\n";
    }

    return 0;
}`,
    title: "Print C++ Code with Syntax Highlighting for Free",
    description:
      "Print C++ code with syntax highlighting, line numbers, and PDF export. Free tool for formatting C++ templates, classes, and systems code.",
    h1: "Print C++ Code with Syntax Highlighting",
    subtitle:
      "Format and export C++ source files as PDF with colorized syntax for templates, STL, and modern C++ features. Line numbers and custom layout.",
    keywords: [
      "print c++ code",
      "cpp code to pdf",
      "c++ syntax highlighting",
      "cpp code printer",
      "format c++ code",
      "c++ pdf export",
    ],
    features: [
      {
        title: "C++ Syntax Highlighting",
        description: "Full support for C++ templates, STL containers, smart pointers, lambdas, concepts, and ranges.",
      },
      {
        title: "PDF Export",
        description: "Export C++ files as PDF with template syntax and preprocessor directives clearly highlighted.",
      },
      {
        title: "Customizable Layout",
        description:
          "C++ templates can produce long lines. Use landscape orientation and adjust the font size for the best results.",
      },
      {
        title: "Line Numbers",
        description:
          "Reference specific lines in C++ code during reviews, especially useful for complex template instantiations.",
      },
    ],
    useCases: [
      {
        title: "Code Reviews",
        description:
          "Print C++ code for careful offline review. Template metaprogramming and memory management code benefits from careful paper analysis.",
      },
      {
        title: "Systems Programming",
        description:
          "Print kernel modules, drivers, and embedded code for review sessions where every line matters for safety and performance.",
      },
      {
        title: "Academic Work",
        description:
          "Print C++ assignments and data structure implementations for submission and study. Line numbers help professors give feedback.",
      },
      {
        title: "Competition Prep",
        description:
          "Print algorithm implementations for competitive programming study. Review and optimize solutions on paper.",
      },
    ],
    faq: [
      {
        question: "How do I print C++ code with syntax highlighting?",
        answer:
          "Paste your C++ code into Codeprint and select C++ as the language. Templates, STL usage, preprocessor directives, and comments are highlighted. Export via Print or PDF.",
      },
      {
        question: "Does it support C++20 and C++23 features?",
        answer:
          "Yes. Modern C++ features including concepts, ranges, coroutines, modules syntax, and structured bindings are highlighted by the underlying highlight.js engine.",
      },
      {
        question: "Can I print header files (.h / .hpp)?",
        answer:
          "Yes. Select C++ as the language for header files. Include guards, forward declarations, and class definitions in headers are all highlighted correctly.",
      },
      {
        question: "How do I handle C++ template-heavy code?",
        answer:
          "Template-heavy C++ code often has long lines. Switch to landscape orientation and reduce font size in settings. Multi-column layout can also help.",
      },
    ],
  },
  {
    slug: "csharp",
    name: "C#",
    hljsKey: "csharp",
    extension: "cs",
    defaultFilename: "Program.cs",
    sampleCode: `using System;
using System.Collections.Generic;
using System.Linq;

namespace MyApp.Services;

public record UserDto(string Name, string Email);

public class UserService
{
    private readonly Dictionary<Guid, User> _users = new();

    public User Create(UserDto dto)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Email = dto.Email,
            CreatedAt = DateTime.UtcNow
        };

        _users[user.Id] = user;
        return user;
    }

    public User? FindById(Guid id) =>
        _users.GetValueOrDefault(id);

    public IEnumerable<User> Search(string query) =>
        _users.Values
            .Where(u => u.Name.Contains(query,
                StringComparison.OrdinalIgnoreCase))
            .OrderBy(u => u.Name);

    public bool Delete(Guid id) =>
        _users.Remove(id);
}

public class User
{
    public Guid Id { get; init; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public DateTime CreatedAt { get; init; }
}`,
    title: "Print C# Code with Syntax Highlighting for Free",
    description:
      "Print C# code with syntax highlighting, line numbers, and PDF export. Free tool for formatting .NET classes, LINQ queries, and ASP.NET code.",
    h1: "Print C# Code with Syntax Highlighting",
    subtitle:
      "Format and export C# source files as PDF with colorized syntax for .NET, LINQ, async/await, and records. Line numbers and custom layout included.",
    keywords: [
      "print c# code",
      "csharp code to pdf",
      "c# syntax highlighting",
      "csharp code printer",
      "format c# code",
      "c# pdf export",
    ],
    features: [
      {
        title: "C# Syntax Highlighting",
        description:
          "Full support for C# records, LINQ, async/await, pattern matching, nullable reference types, and .NET attributes.",
      },
      {
        title: "PDF Export",
        description: "Export C# files as PDF with .NET-specific syntax clearly highlighted for team reviews.",
      },
      {
        title: "Customizable Layout",
        description: "Adjust layout for C# code with XML doc comments, attributes, and LINQ chains.",
      },
      {
        title: "Line Numbers",
        description: "Line numbers for referencing specific code during .NET code reviews and design discussions.",
      },
    ],
    useCases: [
      {
        title: "Code Reviews",
        description:
          "Print C# classes for offline review. .NET's rich type system and attribute usage benefit from careful paper analysis.",
      },
      {
        title: ".NET Architecture",
        description:
          "Print key service classes and interfaces for architecture review sessions and design documentation.",
      },
      {
        title: "Enterprise Documentation",
        description:
          "Include formatted C# code in enterprise documentation, compliance audits, and technical specification documents.",
      },
      {
        title: "Certification Study",
        description:
          "Print C# code samples for Microsoft certification exam preparation. Study .NET APIs and patterns on paper.",
      },
    ],
    faq: [
      {
        question: "How do I print C# code with syntax highlighting?",
        answer:
          "Paste your C# code into Codeprint and select C# as the language. Keywords, types, LINQ queries, and attributes are highlighted. Export via Print or PDF.",
      },
      {
        question: "Does it support modern C# features?",
        answer:
          "Yes. C# 12 features including records, primary constructors, collection expressions, pattern matching, and file-scoped namespaces are highlighted.",
      },
      {
        question: "Can I print ASP.NET Razor pages?",
        answer:
          "Codeprint highlights C# code. For Razor syntax (.cshtml), the C# portions will be highlighted while the HTML parts follow HTML highlighting rules.",
      },
      {
        question: "How does it handle XML documentation comments?",
        answer:
          "XML doc comments (/// summary) are highlighted as comments with their XML tags visible, making documentation review straightforward.",
      },
    ],
  },
  {
    slug: "go",
    name: "Go",
    hljsKey: "go",
    extension: "go",
    defaultFilename: "main.go",
    sampleCode: `package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
)

type User struct {
	ID    string \`json:"id"\`
	Name  string \`json:"name"\`
	Email string \`json:"email"\`
}

type UserStore struct {
	mu    sync.RWMutex
	users map[string]User
}

func NewUserStore() *UserStore {
	return &UserStore{
		users: make(map[string]User),
	}
}

func (s *UserStore) Get(id string) (User, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	user, ok := s.users[id]
	return user, ok
}

func (s *UserStore) Set(user User) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.users[user.ID] = user
}

func main() {
	store := NewUserStore()

	http.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(store.users)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	fmt.Println("Server listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}`,
    title: "Print Go Code with Syntax Highlighting for Free",
    description:
      "Print Go code with syntax highlighting, line numbers, and PDF export. Free tool for formatting Go structs, interfaces, goroutines, and HTTP handlers.",
    h1: "Print Go Code with Syntax Highlighting",
    subtitle:
      "Format and export Go source files as PDF with colorized syntax for structs, interfaces, channels, and goroutines. Clean formatting for Go's clean code.",
    keywords: [
      "print go code",
      "go code to pdf",
      "golang syntax highlighting",
      "go code printer",
      "format go code",
      "golang pdf export",
    ],
    features: [
      {
        title: "Go Syntax Highlighting",
        description: "Full support for Go structs, interfaces, goroutines, channels, defer, and struct tags.",
      },
      {
        title: "PDF Export",
        description: "Export Go files as PDF with clean formatting that matches Go's emphasis on simplicity.",
      },
      {
        title: "Customizable Layout",
        description:
          "Go's enforced formatting (gofmt) produces consistently readable code. Choose your preferred font size and page layout.",
      },
      {
        title: "Line Numbers",
        description: "Line numbers for referencing specific functions and methods during code reviews.",
      },
    ],
    useCases: [
      {
        title: "Code Reviews",
        description:
          "Print Go code for offline review. Go's simple syntax makes printed code very readable for careful analysis.",
      },
      {
        title: "Systems Documentation",
        description:
          "Print Go microservice code for architecture documentation. Include handler functions and data models.",
      },
      {
        title: "Teaching Go",
        description:
          "Create handouts for Go workshops. Go's small language spec makes printed examples effective teaching aids.",
      },
      {
        title: "Concurrency Analysis",
        description:
          "Print goroutine and channel code for offline analysis of concurrent patterns and potential race conditions.",
      },
    ],
    faq: [
      {
        question: "How do I print Go code with syntax highlighting?",
        answer:
          "Paste your Go code into Codeprint and select Go as the language. Keywords, types, struct tags, and comments are highlighted. Export via Print or PDF.",
      },
      {
        question: "Does it support Go generics?",
        answer:
          "Yes. Go 1.18+ generics syntax including type parameters, constraints, and type sets are highlighted correctly.",
      },
      {
        question: "Can I print Go test files?",
        answer:
          "Yes. Go test functions (Test*, Benchmark*, Example*) and testing package usage are highlighted like any other Go code.",
      },
      {
        question: "How does Go's formatting affect printing?",
        answer:
          "Go's gofmt-enforced formatting produces consistently indented code that prints very cleanly. The consistent style means printed Go code is always well-structured.",
      },
    ],
  },
  {
    slug: "rust",
    name: "Rust",
    hljsKey: "rust",
    extension: "rs",
    defaultFilename: "main.rs",
    sampleCode: `use std::collections::HashMap;
use std::fmt;

#[derive(Debug, Clone)]
struct User {
    id: String,
    name: String,
    email: String,
}

impl fmt::Display for User {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{} <{}>", self.name, self.email)
    }
}

struct UserStore {
    users: HashMap<String, User>,
}

impl UserStore {
    fn new() -> Self {
        Self {
            users: HashMap::new(),
        }
    }

    fn add(&mut self, user: User) -> &User {
        let id = user.id.clone();
        self.users.insert(id.clone(), user);
        self.users.get(&id).unwrap()
    }

    fn find(&self, id: &str) -> Option<&User> {
        self.users.get(id)
    }

    fn search(&self, query: &str) -> Vec<&User> {
        self.users
            .values()
            .filter(|u| u.name.to_lowercase().contains(&query.to_lowercase()))
            .collect()
    }
}

fn main() {
    let mut store = UserStore::new();

    store.add(User {
        id: "1".to_string(),
        name: "Alice".to_string(),
        email: "alice@example.com".to_string(),
    });

    if let Some(user) = store.find("1") {
        println!("Found: {user}");
    }
}`,
    title: "Print Rust Code with Syntax Highlighting for Free",
    description:
      "Print Rust code with syntax highlighting, line numbers, and PDF export. Free tool for formatting Rust structs, traits, lifetimes, and pattern matching.",
    h1: "Print Rust Code with Syntax Highlighting",
    subtitle:
      "Format and export Rust source files as PDF with colorized syntax for ownership, lifetimes, traits, and pattern matching. Clean, readable output.",
    keywords: [
      "print rust code",
      "rust code to pdf",
      "rust syntax highlighting",
      "rust code printer",
      "format rust code",
      "rust pdf export",
    ],
    features: [
      {
        title: "Rust Syntax Highlighting",
        description:
          "Full support for Rust ownership, lifetimes, traits, derive macros, pattern matching, and error handling.",
      },
      {
        title: "PDF Export",
        description: "Export Rust files as PDF with lifetime annotations and type signatures clearly highlighted.",
      },
      {
        title: "Customizable Layout",
        description:
          "Adjust layout for Rust's expressive type signatures and where clauses. Landscape works well for trait implementations.",
      },
      {
        title: "Line Numbers",
        description: "Reference specific lines in Rust code for borrow checker discussions and safety reviews.",
      },
    ],
    useCases: [
      {
        title: "Safety Reviews",
        description:
          "Print Rust code for unsafe block reviews. Paper analysis helps trace ownership and lifetime relationships across functions.",
      },
      {
        title: "Learning Rust",
        description:
          "Print Rust examples to study ownership, borrowing, and lifetimes. Annotate printed code with ownership flow diagrams.",
      },
      {
        title: "Systems Documentation",
        description:
          "Include formatted Rust code in systems documentation for network stacks, parsers, and embedded firmware.",
      },
      {
        title: "Code Reviews",
        description:
          "Print Rust code for thorough offline review. Rust's complex type system benefits from careful paper analysis.",
      },
    ],
    faq: [
      {
        question: "How do I print Rust code with syntax highlighting?",
        answer:
          "Paste your Rust code into Codeprint and select Rust as the language. Ownership keywords, lifetimes, macros, and traits are highlighted. Export via Print or PDF.",
      },
      {
        question: "Does it highlight Rust lifetimes and generics?",
        answer:
          "Yes. Lifetime annotations ('a), generic parameters, where clauses, and trait bounds are all highlighted with distinct colors.",
      },
      {
        question: "Can I print Rust macro definitions?",
        answer:
          "Yes. Both declarative macros (macro_rules!) and procedural macros are highlighted. Derive macros and attribute macros are also supported.",
      },
      {
        question: "How do I handle Rust's long type signatures?",
        answer:
          "Rust type signatures can be verbose. Use landscape orientation and a smaller font size. Long lines wrap automatically while maintaining readability.",
      },
    ],
  },
  {
    slug: "php",
    name: "PHP",
    hljsKey: "php",
    extension: "php",
    defaultFilename: "index.php",
    sampleCode: `<?php

declare(strict_types=1);

namespace App\\Services;

use App\\Models\\User;
use App\\Repositories\\UserRepository;

class UserService
{
    public function __construct(
        private readonly UserRepository $repository
    ) {}

    public function create(string $name, string $email): User
    {
        $user = new User(
            id: uniqid(),
            name: $name,
            email: $email,
            createdAt: new \\DateTimeImmutable()
        );

        $this->repository->save($user);

        return $user;
    }

    public function findById(string $id): ?User
    {
        return $this->repository->find($id);
    }

    /**
     * @return User[]
     */
    public function search(string $query): array
    {
        return array_filter(
            $this->repository->all(),
            fn(User $user) => str_contains(
                strtolower($user->name),
                strtolower($query)
            )
        );
    }
}`,
    title: "Print PHP Code with Syntax Highlighting for Free",
    description:
      "Print PHP code with syntax highlighting, line numbers, and PDF export. Free tool for formatting PHP classes, Laravel code, and WordPress templates.",
    h1: "Print PHP Code with Syntax Highlighting",
    subtitle:
      "Format and export PHP files as PDF with colorized syntax for classes, namespaces, and modern PHP features. Great for Laravel, Symfony, and WordPress code.",
    keywords: [
      "print php code",
      "php code to pdf",
      "php syntax highlighting",
      "php code printer",
      "format php code",
      "php pdf export",
    ],
    features: [
      {
        title: "PHP Syntax Highlighting",
        description:
          "Full support for PHP 8+ features: named arguments, enums, fibers, readonly properties, and union types.",
      },
      {
        title: "PDF Export",
        description: "Export PHP files as PDF with namespace and class hierarchy clearly visible.",
      },
      {
        title: "Customizable Layout",
        description: "Adjust layout for PHP code with docblocks, annotations, and framework-specific patterns.",
      },
      {
        title: "Line Numbers",
        description: "Line numbers for referencing specific methods during code reviews and debugging.",
      },
    ],
    useCases: [
      {
        title: "Code Reviews",
        description: "Print PHP classes for offline review. Trace dependency injection and service patterns on paper.",
      },
      {
        title: "WordPress Development",
        description: "Print WordPress theme and plugin code for review. Format hooks, filters, and template files.",
      },
      {
        title: "Framework Code",
        description: "Print Laravel controllers, Symfony services, or custom framework code for architecture reviews.",
      },
      {
        title: "Legacy Code Analysis",
        description: "Print legacy PHP code for refactoring planning. Annotate printed code with modernization notes.",
      },
    ],
    faq: [
      {
        question: "How do I print PHP code with syntax highlighting?",
        answer:
          "Paste your PHP code into Codeprint and select PHP as the language. PHP tags, keywords, variables, and strings are highlighted. Export via Print or PDF.",
      },
      {
        question: "Does it support modern PHP 8 features?",
        answer:
          "Yes. PHP 8 features including enums, named arguments, match expressions, readonly properties, and union/intersection types are highlighted.",
      },
      {
        question: "Can I print Laravel Blade templates?",
        answer:
          "Blade templates are a mix of PHP and HTML. Select PHP as the language for the best highlighting of PHP sections. HTML portions will also be partially highlighted.",
      },
      {
        question: "How does it handle PHP heredoc/nowdoc syntax?",
        answer:
          "PHP heredoc and nowdoc strings are highlighted as string literals with proper start/end delimiter recognition.",
      },
    ],
  },
  {
    slug: "ruby",
    name: "Ruby",
    hljsKey: "ruby",
    extension: "rb",
    defaultFilename: "app.rb",
    sampleCode: `# frozen_string_literal: true

class UserService
  attr_reader :users

  def initialize
    @users = {}
  end

  def create(name:, email:)
    id = SecureRandom.uuid
    user = User.new(id:, name:, email:)
    @users[id] = user
    user
  end

  def find(id)
    @users[id]
  end

  def search(query)
    @users.values.select do |user|
      user.name.downcase.include?(query.downcase)
    end.sort_by(&:name)
  end

  def delete(id)
    @users.delete(id)
  end
end

User = Struct.new(:id, :name, :email, keyword_init: true) do
  def to_s
    "#{name} <#{email}>"
  end
end

service = UserService.new
service.create(name: "Alice", email: "alice@example.com")
service.create(name: "Bob", email: "bob@example.com")

puts service.search("ali").map(&:to_s)`,
    title: "Print Ruby Code with Syntax Highlighting for Free",
    description:
      "Print Ruby code with syntax highlighting, line numbers, and PDF export. Free tool for formatting Ruby classes, Rails code, and scripts.",
    h1: "Print Ruby Code with Syntax Highlighting",
    subtitle:
      "Format and export Ruby files as PDF with colorized syntax for blocks, symbols, and metaprogramming. Perfect for Rails reviews and Ruby teaching.",
    keywords: [
      "print ruby code",
      "ruby code to pdf",
      "ruby syntax highlighting",
      "ruby code printer",
      "format ruby code",
      "ruby pdf export",
    ],
    features: [
      {
        title: "Ruby Syntax Highlighting",
        description: "Full support for Ruby blocks, symbols, heredocs, regex, and metaprogramming patterns.",
      },
      {
        title: "PDF Export",
        description: "Export Ruby files as PDF with elegant formatting that matches Ruby's expressive syntax.",
      },
      {
        title: "Customizable Layout",
        description: "Ruby's compact syntax prints well in multi-column layout. Adjust font size for readability.",
      },
      {
        title: "Line Numbers",
        description: "Line numbers for referencing specific methods and blocks during pair programming reviews.",
      },
    ],
    useCases: [
      {
        title: "Code Reviews",
        description: "Print Ruby code for careful offline review. Ruby's expressiveness benefits from focused reading.",
      },
      {
        title: "Rails Development",
        description: "Print Rails models, controllers, and services for architecture discussions and team reviews.",
      },
      {
        title: "Teaching Ruby",
        description: "Create handouts for Ruby workshops. Ruby's readable syntax makes printed examples effective.",
      },
      {
        title: "Script Documentation",
        description: "Print Ruby scripts and rake tasks for operations documentation and runbook creation.",
      },
    ],
    faq: [
      {
        question: "How do I print Ruby code with syntax highlighting?",
        answer:
          "Paste your Ruby code into Codeprint and select Ruby as the language. Keywords, symbols, blocks, and string interpolation are highlighted. Export via Print or PDF.",
      },
      {
        question: "Does it support Ruby on Rails code?",
        answer:
          "Yes. Rails code is standard Ruby and is fully highlighted. ActiveRecord queries, routing DSL, and controller actions are all colorized correctly.",
      },
      {
        question: "Can I print ERB templates?",
        answer:
          "ERB templates mix Ruby and HTML. Select Ruby as the language for the best Ruby highlighting. The HTML portions will be treated as part of the Ruby output.",
      },
      {
        question: "How does it handle Ruby heredocs?",
        answer:
          "Ruby heredoc strings (<<~HEREDOC) are highlighted as string literals with proper delimiter recognition.",
      },
    ],
  },
  {
    slug: "swift",
    name: "Swift",
    hljsKey: "swift",
    extension: "swift",
    defaultFilename: "App.swift",
    sampleCode: `import Foundation

struct User: Codable, Identifiable {
    let id: UUID
    var name: String
    var email: String
    let createdAt: Date
}

actor UserStore {
    private var users: [UUID: User] = [:]

    func create(name: String, email: String) -> User {
        let user = User(
            id: UUID(),
            name: name,
            email: email,
            createdAt: Date()
        )
        users[user.id] = user
        return user
    }

    func find(id: UUID) -> User? {
        users[id]
    }

    func search(query: String) -> [User] {
        users.values
            .filter { $0.name.localizedCaseInsensitiveContains(query) }
            .sorted { $0.name < $1.name }
    }

    func delete(id: UUID) -> Bool {
        users.removeValue(forKey: id) != nil
    }
}

@main
struct MyApp {
    static func main() async {
        let store = UserStore()

        let user = await store.create(
            name: "Alice",
            email: "alice@example.com"
        )
        print("Created: \\(user.name)")
    }
}`,
    title: "Print Swift Code with Syntax Highlighting for Free",
    description:
      "Print Swift code with syntax highlighting, line numbers, and PDF export. Free tool for formatting Swift structs, protocols, async/await, and SwiftUI code.",
    h1: "Print Swift Code with Syntax Highlighting",
    subtitle:
      "Format and export Swift files as PDF with colorized syntax for protocols, actors, property wrappers, and SwiftUI views.",
    keywords: [
      "print swift code",
      "swift code to pdf",
      "swift syntax highlighting",
      "swift code printer",
      "format swift code",
      "swift pdf export",
    ],
    features: [
      {
        title: "Swift Syntax Highlighting",
        description: "Full support for Swift protocols, actors, async/await, property wrappers, and result builders.",
      },
      {
        title: "PDF Export",
        description: "Export Swift files as PDF for iOS/macOS project documentation and code reviews.",
      },
      {
        title: "Customizable Layout",
        description: "Adjust layout for Swift's clean syntax. SwiftUI body properties may benefit from landscape mode.",
      },
      {
        title: "Line Numbers",
        description: "Line numbers for referencing specific Swift declarations and protocol conformances.",
      },
    ],
    useCases: [
      {
        title: "iOS Code Reviews",
        description: "Print Swift code for offline iOS/macOS code reviews. Review view models and services on paper.",
      },
      {
        title: "SwiftUI Reviews",
        description: "Print SwiftUI views to review layout hierarchy and modifier chains away from Xcode.",
      },
      {
        title: "Teaching Swift",
        description: "Create handouts for Swift programming courses. Swift's clean syntax prints beautifully.",
      },
      {
        title: "App Architecture",
        description: "Print protocol definitions and service layers for iOS architecture review sessions.",
      },
    ],
    faq: [
      {
        question: "How do I print Swift code with syntax highlighting?",
        answer:
          "Paste your Swift code into Codeprint and select Swift as the language. Keywords, types, protocols, and property wrappers are highlighted. Export via Print or PDF.",
      },
      {
        question: "Does it support SwiftUI code?",
        answer:
          "Yes. SwiftUI views, modifiers, property wrappers (@State, @Binding, @Environment), and result builders are all highlighted correctly.",
      },
      {
        question: "Can I print Swift Package Manager files?",
        answer:
          "Yes. Package.swift files are standard Swift and are fully highlighted with type names and string literals colorized.",
      },
      {
        question: "Does it support Swift concurrency?",
        answer:
          "Yes. Swift concurrency features including async/await, actors, Task groups, and Sendable are highlighted.",
      },
    ],
  },
  {
    slug: "kotlin",
    name: "Kotlin",
    hljsKey: "kotlin",
    extension: "kt",
    defaultFilename: "Main.kt",
    sampleCode: `data class User(
    val id: String = java.util.UUID.randomUUID().toString(),
    val name: String,
    val email: String,
    val createdAt: java.time.Instant = java.time.Instant.now()
)

class UserService {
    private val users = mutableMapOf<String, User>()

    fun create(name: String, email: String): User {
        val user = User(name = name, email = email)
        users[user.id] = user
        return user
    }

    fun findById(id: String): User? = users[id]

    fun search(query: String): List<User> =
        users.values
            .filter { it.name.contains(query, ignoreCase = true) }
            .sortedBy { it.name }

    fun delete(id: String): Boolean =
        users.remove(id) != null
}

fun main() {
    val service = UserService()

    val alice = service.create("Alice", "alice@example.com")
    val bob = service.create("Bob", "bob@example.com")

    println("Users matching 'ali': \${service.search("ali")}")

    service.findById(alice.id)?.let { user ->
        println("Found: \${user.name} (\${user.email})")
    }
}`,
    title: "Print Kotlin Code with Syntax Highlighting for Free",
    description:
      "Print Kotlin code with syntax highlighting, line numbers, and PDF export. Free tool for formatting Kotlin classes, coroutines, and Android code.",
    h1: "Print Kotlin Code with Syntax Highlighting",
    subtitle:
      "Format and export Kotlin files as PDF with colorized syntax for data classes, coroutines, extension functions, and Jetpack Compose.",
    keywords: [
      "print kotlin code",
      "kotlin code to pdf",
      "kotlin syntax highlighting",
      "kotlin code printer",
      "format kotlin code",
      "kotlin pdf export",
    ],
    features: [
      {
        title: "Kotlin Syntax Highlighting",
        description:
          "Full support for Kotlin data classes, sealed classes, coroutines, extension functions, and scope functions.",
      },
      {
        title: "PDF Export",
        description: "Export Kotlin files as PDF for Android project documentation and code reviews.",
      },
      {
        title: "Customizable Layout",
        description: "Kotlin's concise syntax works well in multi-column layout. Adjust font for readability.",
      },
      {
        title: "Line Numbers",
        description: "Line numbers for referencing specific Kotlin functions and class members during reviews.",
      },
    ],
    useCases: [
      {
        title: "Android Code Reviews",
        description: "Print Kotlin Android code for offline reviews. Review ViewModels and repositories on paper.",
      },
      {
        title: "Compose UI Reviews",
        description: "Print Jetpack Compose code to review composable functions and state management patterns.",
      },
      {
        title: "Teaching Kotlin",
        description: "Create handouts for Kotlin courses. Kotlin's expressive yet concise syntax is ideal for print.",
      },
      {
        title: "Backend Development",
        description: "Print Ktor or Spring Boot Kotlin code for server-side architecture reviews.",
      },
    ],
    faq: [
      {
        question: "How do I print Kotlin code with syntax highlighting?",
        answer:
          "Paste your Kotlin code into Codeprint and select Kotlin as the language. Keywords, types, and string templates are highlighted. Export via Print or PDF.",
      },
      {
        question: "Does it support Kotlin coroutines?",
        answer:
          "Yes. Coroutine keywords including suspend, launch, async, withContext, and Flow are highlighted correctly.",
      },
      {
        question: "Can I print Jetpack Compose code?",
        answer:
          "Yes. Compose annotations (@Composable), modifier chains, and state management code are all highlighted as standard Kotlin.",
      },
      {
        question: "Does it highlight Kotlin DSL code?",
        answer:
          "Yes. Kotlin DSL patterns including type-safe builders, extension functions, and lambda receivers are all highlighted.",
      },
    ],
  },
  {
    slug: "sql",
    name: "SQL",
    hljsKey: "sql",
    extension: "sql",
    defaultFilename: "query.sql",
    sampleCode: `-- Create users table
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    role        VARCHAR(20) DEFAULT 'user',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for email lookups
CREATE INDEX idx_users_email ON users(email);

-- Insert sample data
INSERT INTO users (name, email, role) VALUES
    ('Alice Johnson', 'alice@example.com', 'admin'),
    ('Bob Smith', 'bob@example.com', 'user'),
    ('Carol White', 'carol@example.com', 'user');

-- Complex query: Active users with order stats
SELECT
    u.name,
    u.email,
    COUNT(o.id) AS total_orders,
    COALESCE(SUM(o.amount), 0) AS total_spent,
    MAX(o.created_at) AS last_order
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.role != 'guest'
    AND u.created_at >= '2024-01-01'
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC
LIMIT 20;`,
    title: "Print SQL Queries with Syntax Highlighting for Free",
    description:
      "Print SQL queries with syntax highlighting, line numbers, and PDF export. Free tool for formatting SQL DDL, DML, and complex queries for documentation.",
    h1: "Print SQL with Syntax Highlighting",
    subtitle:
      "Format and export SQL queries as PDF with colorized keywords, functions, and table references. Perfect for database documentation and query reviews.",
    keywords: [
      "print sql",
      "sql to pdf",
      "sql syntax highlighting",
      "sql code printer",
      "format sql queries",
      "sql pdf export",
    ],
    features: [
      {
        title: "SQL Syntax Highlighting",
        description:
          "Full support for SQL keywords, functions, data types, joins, subqueries, CTEs, and window functions.",
      },
      {
        title: "PDF Export",
        description: "Export SQL queries as PDF for database documentation, migration reviews, and audits.",
      },
      {
        title: "Customizable Layout",
        description: "Adjust font size for complex multi-table queries. Landscape works well for wide SELECT lists.",
      },
      {
        title: "Line Numbers",
        description: "Line numbers help reference specific clauses and conditions during query optimization reviews.",
      },
    ],
    useCases: [
      {
        title: "Query Reviews",
        description: "Print complex SQL queries for optimization review. Trace joins and subqueries on paper.",
      },
      {
        title: "Database Documentation",
        description: "Include formatted DDL statements in database schema documentation and migration guides.",
      },
      {
        title: "Compliance Audits",
        description: "Print database queries for security and compliance audits. Document data access patterns.",
      },
      {
        title: "Teaching SQL",
        description: "Create handouts for SQL courses. Colorized keywords help students learn query structure.",
      },
    ],
    faq: [
      {
        question: "How do I print SQL with syntax highlighting?",
        answer:
          "Paste your SQL code into Codeprint and select SQL as the language. Keywords, functions, and string literals are highlighted. Export via Print or PDF.",
      },
      {
        question: "Does it support different SQL dialects?",
        answer:
          "Codeprint highlights standard SQL keywords. PostgreSQL, MySQL, SQL Server, and SQLite specific functions and keywords are generally recognized by the highlighter.",
      },
      {
        question: "Can I print stored procedures?",
        answer:
          "Yes. Stored procedures, functions, and triggers are highlighted with SQL syntax. PL/pgSQL and T-SQL control flow keywords are also supported.",
      },
      {
        question: "How do I handle wide SQL queries?",
        answer:
          "Use landscape orientation for queries with many columns. You can also reduce font size or break long lines manually before pasting.",
      },
    ],
  },
  {
    slug: "shell",
    name: "Shell/Bash",
    hljsKey: "bash",
    extension: "sh",
    defaultFilename: "script.sh",
    sampleCode: `#!/bin/bash
set -euo pipefail

# Configuration
readonly APP_NAME="myapp"
readonly LOG_DIR="/var/log/\${APP_NAME}"
readonly BACKUP_DIR="/backups/\${APP_NAME}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "\${LOG_DIR}/deploy.log"
}

check_dependencies() {
    local deps=("docker" "docker-compose" "jq" "curl")

    for dep in "\${deps[@]}"; do
        if ! command -v "$dep" &>/dev/null; then
            log "ERROR: $dep is not installed"
            exit 1
        fi
    done
    log "All dependencies satisfied"
}

deploy() {
    local version="\${1:?Version required}"
    local environment="\${2:-staging}"

    log "Deploying \${APP_NAME} v\${version} to \${environment}"

    # Backup current state
    mkdir -p "\${BACKUP_DIR}"
    docker-compose config > "\${BACKUP_DIR}/docker-compose.$(date +%s).yml"

    # Pull and deploy
    docker-compose pull
    docker-compose up -d --remove-orphans

    # Health check
    for i in {1..30}; do
        if curl -sf "http://localhost:8080/health" > /dev/null; then
            log "Deployment successful: health check passed"
            return 0
        fi
        sleep 2
    done

    log "ERROR: Health check failed after 60 seconds"
    return 1
}

check_dependencies
deploy "$@"`,
    title: "Print Shell Scripts with Syntax Highlighting for Free",
    description:
      "Print bash and shell scripts with syntax highlighting, line numbers, and PDF export. Free tool for formatting deployment scripts, CI pipelines, and automation.",
    h1: "Print Shell Scripts with Syntax Highlighting",
    subtitle:
      "Format and export bash scripts as PDF with colorized syntax for variables, functions, pipes, and control flow. Perfect for ops documentation.",
    keywords: [
      "print bash script",
      "shell script to pdf",
      "bash syntax highlighting",
      "shell code printer",
      "format bash script",
      "shell pdf export",
    ],
    features: [
      {
        title: "Bash Syntax Highlighting",
        description:
          "Full support for variables, functions, pipes, redirects, heredocs, arrays, and control structures.",
      },
      {
        title: "PDF Export",
        description: "Export shell scripts as PDF for operations runbooks and deployment documentation.",
      },
      {
        title: "Customizable Layout",
        description: "Adjust font and layout for scripts with long pipe chains or complex variable expansions.",
      },
      {
        title: "Line Numbers",
        description: "Line numbers are essential for shell scripts where specific lines may be referenced in logs.",
      },
    ],
    useCases: [
      {
        title: "Operations Runbooks",
        description:
          "Print deployment scripts for operations runbooks. Include formatted scripts in incident response docs.",
      },
      {
        title: "Security Audits",
        description:
          "Print shell scripts for security review. Check for injection vulnerabilities and unsafe practices.",
      },
      {
        title: "CI/CD Documentation",
        description:
          "Print CI pipeline scripts for documentation. Format GitHub Actions, Jenkins, and GitLab CI scripts.",
      },
      {
        title: "Teaching Shell",
        description: "Create handouts for shell scripting workshops. Colorized pipes and redirects aid comprehension.",
      },
    ],
    faq: [
      {
        question: "How do I print bash scripts with syntax highlighting?",
        answer:
          "Paste your shell script into Codeprint and select Shell/Bash as the language. Variables, functions, and control structures are highlighted. Export via Print or PDF.",
      },
      {
        question: "Does it support zsh and fish syntax?",
        answer:
          "Codeprint uses bash highlighting which covers most POSIX shell and zsh syntax. Fish-specific syntax may not be fully highlighted.",
      },
      {
        question: "Can I print Dockerfiles?",
        answer:
          "Dockerfiles use shell-like syntax. Select Shell/Bash for reasonable highlighting of RUN commands, ENV variables, and other directives.",
      },
      {
        question: "How does it handle heredocs in scripts?",
        answer:
          "Bash heredocs (<<EOF) are highlighted as string blocks with the delimiter recognized. Variable expansion within heredocs is also colorized.",
      },
    ],
  },
  {
    slug: "json",
    name: "JSON",
    hljsKey: "json",
    extension: "json",
    defaultFilename: "data.json",
    sampleCode: `{
  "name": "my-project",
  "version": "2.1.0",
  "description": "A sample project configuration",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --fix",
    "test": "vitest run"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "typescript": "^5.6.0",
    "vitest": "^2.0.0",
    "eslint": "^9.0.0"
  },
  "engines": {
    "node": ">=20.0.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/example/my-project.git"
  },
  "license": "MIT"
}`,
    title: "Print JSON with Syntax Highlighting for Free",
    description:
      "Pretty print JSON with syntax highlighting, line numbers, and PDF export. Free online tool for formatting JSON data, config files, and API responses.",
    h1: "Print JSON with Syntax Highlighting",
    subtitle:
      "Format and export JSON data as PDF with colorized keys, values, and structure. Perfect for API documentation, config files, and data inspection.",
    keywords: [
      "print json pretty",
      "json to pdf",
      "json syntax highlighting",
      "json pretty printer",
      "format json online",
      "json pdf export",
    ],
    features: [
      {
        title: "JSON Syntax Highlighting",
        description:
          "Keys, string values, numbers, booleans, and null are colorized for clear visual distinction of data structure.",
      },
      {
        title: "PDF Export",
        description: "Export formatted JSON as PDF for API documentation and configuration file archives.",
      },
      {
        title: "Customizable Layout",
        description: "Adjust font size for deeply nested JSON. Multi-column layout works well for flat JSON arrays.",
      },
      {
        title: "Line Numbers",
        description: "Line numbers help reference specific keys and values in large JSON configuration files.",
      },
    ],
    useCases: [
      {
        title: "API Documentation",
        description: "Print JSON request/response examples for API documentation. Include sample payloads in specs.",
      },
      {
        title: "Config Audits",
        description:
          "Print JSON config files for security audits. Review settings, permissions, and environment config.",
      },
      {
        title: "Data Inspection",
        description: "Print JSON data dumps for offline analysis. Review large datasets on paper with line numbers.",
      },
      {
        title: "Debugging",
        description: "Print API responses for debugging. Annotate JSON output to trace data flow through systems.",
      },
    ],
    faq: [
      {
        question: "How do I pretty print JSON?",
        answer:
          "Paste your JSON into Codeprint to display keys, strings, numbers, and booleans in distinct colors. Export it through Print or PDF.",
      },
      {
        question: "Does it validate JSON?",
        answer:
          "Codeprint highlights JSON syntax but does not validate it. For validation, use a JSON validator first, then paste the valid JSON here for formatted printing.",
      },
      {
        question: "Can I print large JSON files?",
        answer:
          "Yes. Codeprint handles large JSON files with pagination. Use a smaller font size and multi-column layout for very large files.",
      },
      {
        question: "Does it support JSON with comments (JSONC)?",
        answer:
          "JSON with comments (JSONC) used in VS Code settings will be highlighted, though comments may not be perfectly colorized since they are not part of standard JSON.",
      },
    ],
  },
  {
    slug: "c",
    name: "C",
    hljsKey: "c",
    extension: "c",
    defaultFilename: "main.c",
    sampleCode: `#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int id;
    const char *name;
    double score;
} Student;

double average_score(const Student *students, size_t count) {
    double total = 0.0;
    for (size_t i = 0; i < count; ++i) {
        total += students[i].score;
    }
    return count == 0 ? 0.0 : total / count;
}

int main(void) {
    Student students[] = {
        {1, "Ada", 96.5},
        {2, "Linus", 91.0},
        {3, "Grace", 98.0}
    };

    size_t count = sizeof students / sizeof students[0];
    printf("Average: %.1f\\n", average_score(students, count));
    return EXIT_SUCCESS;
}`,
    title: "C to PDF with Syntax Highlighting",
    description:
      "Print C code to PDF with syntax highlighting, line numbers, and custom layout. Free online tool for reviewing systems code, headers, and embedded programs.",
    h1: "C to PDF with Syntax Highlighting",
    subtitle: "Preserve preprocessor directives, pointers, structs, and indentation in a sharp, selectable PDF.",
    keywords: ["c code to pdf", "print c code", "c syntax highlighting", "c source to pdf"],
    features: [
      {
        title: "C Syntax Highlighting",
        description: "Preprocessor directives, types, pointers, constants, and comments remain visually distinct.",
      },
      {
        title: "PDF Export",
        description: "Generate a selectable PDF that keeps syntax colors and line numbers intact.",
      },
      {
        title: "Layout Options",
        description: "Use landscape for long declarations or multiple columns for compact source files.",
      },
      {
        title: "Line Numbers",
        description: "Reference exact statements during code review, debugging, or classroom walkthroughs.",
      },
    ],
    useCases: [
      {
        title: "Systems Reviews",
        description: "Trace pointer ownership, memory allocation, and error paths away from the screen.",
      },
      {
        title: "Embedded Work",
        description: "Print firmware routines and annotate timing, register, and hardware assumptions.",
      },
      {
        title: "Teaching",
        description: "Create readable handouts for data structures, algorithms, and operating-systems courses.",
      },
      {
        title: "Security Audits",
        description: "Mark unsafe boundaries and input-validation paths on a stable paper reference.",
      },
    ],
    faq: [
      {
        question: "How do I convert C code to PDF?",
        answer:
          "Paste your C source, choose C, then click PDF. Syntax colors, line numbers, and layout settings are included.",
      },
      {
        question: "Are preprocessor directives highlighted?",
        answer:
          "Yes. Includes, defines, conditional compilation, types, strings, and comments receive distinct syntax colors.",
      },
      {
        question: "Does it preserve pointer and indentation formatting?",
        answer:
          "Yes. Codeprint preserves whitespace and punctuation exactly as entered, including pointer declarations and nested blocks.",
      },
      {
        question: "Is my C source uploaded?",
        answer: "No. Highlighting and PDF generation run in your browser, so source code stays on your device.",
      },
    ],
  },
  {
    slug: "r",
    name: "R",
    hljsKey: "r",
    extension: "r",
    defaultFilename: "analysis.R",
    sampleCode: `library(dplyr)
library(ggplot2)

summarise_cohort <- function(data, min_orders = 3) {
  data %>%
    filter(!is.na(revenue)) %>%
    group_by(cohort) %>%
    summarise(
      customers = n_distinct(customer_id),
      orders = n(),
      revenue = sum(revenue),
      .groups = "drop"
    ) %>%
    filter(orders >= min_orders) %>%
    mutate(revenue_per_customer = revenue / customers)
}

cohorts <- read.csv("orders.csv") %>%
  summarise_cohort()

print(cohorts)
`,
    title: "R to PDF with Syntax Highlighting",
    description:
      "Print R code to PDF with syntax highlighting, line numbers, and custom layout. Free online tool for scripts, reports, and statistical analysis.",
    h1: "R to PDF with Syntax Highlighting",
    subtitle: "Turn analysis scripts into readable PDFs without losing pipes, formulas, comments, or indentation.",
    keywords: ["r code to pdf", "print r script", "r syntax highlighting", "r script to pdf"],
    features: [
      {
        title: "R Syntax Highlighting",
        description: "Functions, packages, pipes, strings, formulas, and comments are colorized clearly.",
      },
      {
        title: "PDF Export",
        description: "Create a sharp PDF for methods appendices, peer review, and reproducible research.",
      },
      {
        title: "Layout Options",
        description: "Adjust type size and orientation for long tidyverse pipelines or model formulas.",
      },
      {
        title: "Line Numbers",
        description: "Make code review notes and research feedback easy to reference.",
      },
    ],
    useCases: [
      {
        title: "Research Reviews",
        description: "Share analysis logic with collaborators who prefer a printable methods appendix.",
      },
      {
        title: "Teaching",
        description: "Create statistics handouts with line numbers for guided walkthroughs.",
      },
      {
        title: "Audit Trails",
        description: "Archive the exact script used for a reported analysis or visualization.",
      },
      {
        title: "Model Debugging",
        description: "Trace transformations and formulas on paper while comparing output.",
      },
    ],
    faq: [
      {
        question: "How do I convert an R script to PDF?",
        answer:
          "Paste the script, select R, and click PDF. The generated document preserves syntax colors and whitespace.",
      },
      {
        question: "Does it highlight tidyverse pipes?",
        answer: "Yes. Functions, operators, pipes, strings, numbers, and comments are highlighted by the R grammar.",
      },
      {
        question: "Can I print R Markdown?",
        answer:
          "Use the Markdown tool for full prose-and-code documents. Use the R tool when you want a source-code-focused printout.",
      },
      {
        question: "Is it free and private?",
        answer: "Yes. There is no account or upload; the script stays in your browser.",
      },
    ],
  },
  {
    slug: "dart",
    name: "Dart",
    hljsKey: "dart",
    extension: "dart",
    defaultFilename: "main.dart",
    sampleCode: `import 'dart:async';

class User {
  const User({required this.id, required this.name});

  final String id;
  final String name;
}

abstract interface class UserRepository {
  Future<User?> findById(String id);
}

Future<String> greeting(
  UserRepository repository,
  String id,
) async {
  final user = await repository.findById(id);
  return switch (user) {
    User(name: final name) => 'Hello, $name',
    null => 'User not found',
  };
}
`,
    title: "Dart to PDF with Syntax Highlighting",
    description:
      "Print Dart code to PDF with syntax highlighting, line numbers, and custom layout. Free online tool for Dart and Flutter source files.",
    h1: "Dart to PDF with Syntax Highlighting",
    subtitle: "Keep classes, futures, null safety, patterns, and Flutter-friendly formatting intact on paper.",
    keywords: ["dart code to pdf", "print dart code", "flutter code to pdf", "dart syntax highlighting"],
    features: [
      {
        title: "Dart Syntax Highlighting",
        description: "Classes, async code, null-safety syntax, patterns, and annotations stay distinct.",
      },
      {
        title: "PDF Export",
        description: "Export Dart or Flutter snippets as selectable text with colors preserved.",
      },
      {
        title: "Layout Options",
        description: "Landscape orientation works well for nested widget trees and long constructors.",
      },
      {
        title: "Line Numbers",
        description: "Reference widget structure and async control flow precisely during review.",
      },
    ],
    useCases: [
      {
        title: "Flutter Reviews",
        description: "Print widget trees and state-management code for architecture discussions.",
      },
      {
        title: "Teaching",
        description: "Create clear handouts for Dart syntax, futures, streams, and null safety.",
      },
      {
        title: "Interview Prep",
        description: "Annotate algorithms and Flutter exercises away from the IDE.",
      },
      {
        title: "Documentation",
        description: "Include formatted Dart examples in implementation guides and technical specs.",
      },
    ],
    faq: [
      {
        question: "How do I convert Dart code to PDF?",
        answer:
          "Paste your .dart source, select Dart, then click PDF to export it with syntax highlighting and line numbers.",
      },
      {
        question: "Does it work with Flutter code?",
        answer: "Yes. Flutter widgets are Dart code and retain their syntax colors and indentation.",
      },
      {
        question: "Are modern Dart features supported?",
        answer:
          "Yes. The highlighter supports null safety, async and await, classes, annotations, records, and pattern syntax.",
      },
      {
        question: "Does my source leave the browser?",
        answer: "No. Codeprint processes the file locally in your browser.",
      },
    ],
  },
  {
    slug: "scala",
    name: "Scala",
    hljsKey: "scala",
    extension: "scala",
    defaultFilename: "Main.scala",
    sampleCode: `final case class Order(
  id: String,
  customerId: String,
  total: BigDecimal
)

trait OrderRepository:
  def findByCustomer(customerId: String): List[Order]

final class OrderService(repository: OrderRepository):
  def totalFor(customerId: String): BigDecimal =
    repository
      .findByCustomer(customerId)
      .map(_.total)
      .sum

@main def run(): Unit =
  println("Order service ready")
`,
    title: "Scala to PDF with Syntax Highlighting",
    description:
      "Print Scala code to PDF with syntax highlighting, line numbers, and custom layout. Free online tool for Scala 2 and Scala 3 source.",
    h1: "Scala to PDF with Syntax Highlighting",
    subtitle: "Preserve types, case classes, traits, pattern matching, and significant indentation in a readable PDF.",
    keywords: ["scala code to pdf", "print scala code", "scala syntax highlighting", "scala source to pdf"],
    features: [
      {
        title: "Scala Syntax Highlighting",
        description: "Traits, case classes, types, pattern matches, strings, and comments remain easy to scan.",
      },
      {
        title: "PDF Export",
        description: "Generate a selectable PDF for design reviews, teaching, or documentation.",
      },
      {
        title: "Layout Options",
        description: "Use landscape for expressive type signatures and multi-column mode for compact examples.",
      },
      {
        title: "Line Numbers",
        description: "Reference exact expressions and match branches in collaborative reviews.",
      },
    ],
    useCases: [
      {
        title: "Architecture Reviews",
        description: "Trace domain types, effects, and repository boundaries on paper.",
      },
      {
        title: "Functional Programming",
        description: "Annotate transformations, folds, and type-class relationships away from the IDE.",
      },
      {
        title: "Teaching",
        description: "Create handouts that preserve Scala 3 indentation and Scala 2 brace syntax.",
      },
      {
        title: "Documentation",
        description: "Add formatted Scala examples to platform and data-engineering guides.",
      },
    ],
    faq: [
      {
        question: "How do I convert Scala code to PDF?",
        answer:
          "Paste Scala source, select Scala, and click PDF. The export includes syntax colors, line numbers, and your layout settings.",
      },
      {
        question: "Does it support Scala 3 syntax?",
        answer:
          "Yes. Significant indentation, given and using clauses, extension methods, enums, and modern syntax are highlighted.",
      },
      {
        question: "Can I print Spark code?",
        answer:
          "Yes. Spark applications are Scala source and work well in landscape mode when transformation chains are long.",
      },
      {
        question: "Is Codeprint private?",
        answer: "Yes. Your Scala code is processed locally and is never uploaded to a server.",
      },
    ],
  },
]

// Helper to get a language by slug
export function getLanguageBySlug(slug: string): LanguageData | undefined {
  return LANGUAGES.find((l) => l.slug === slug)
}

// Get all language slugs for generateStaticParams
export function getAllLanguageSlugs(): string[] {
  return LANGUAGES.map((l) => l.slug)
}

const LANGUAGE_DISPLAY_ORDER = [
  "python",
  "javascript",
  "typescript",
  "html",
  "css",
  "java",
  "c",
  "cpp",
  "csharp",
  "go",
  "rust",
  "php",
  "ruby",
  "swift",
  "kotlin",
  "sql",
  "shell",
  "json",
  "r",
  "dart",
  "scala",
] as const

export function getLanguagesForDisplay(): LanguageData[] {
  return LANGUAGE_DISPLAY_ORDER.map((slug) => getLanguageBySlug(slug)).filter((language): language is LanguageData =>
    Boolean(language),
  )
}

// Get all languages for navigation and cross-links
export function getLanguagesForNav(): { slug: string; name: string }[] {
  return getLanguagesForDisplay().map((l) => ({ slug: l.slug, name: l.name }))
}
