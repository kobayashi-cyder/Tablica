### **Tablica: A Next-Generation Lightweight Programming Language**

Tablica is a lightweight and extensible programming language designed for efficient data management, graph processing, and JIT compilation. By leveraging innovative concepts like `MetaTables` (mt) and `Unmodifiable Tables` (umt), Tablica offers a powerful framework for managing static and dynamic data while maintaining high performance through JIT compilation.

---

## **Core Features**
1. **MetaTable (mt)**: 
   - A dynamic table-based structure for mutable data operations.
   - Ideal for managing stateful computations and recursive operations.

2. **Unmodifiable Table (umt)**:
   - A read-only table for shared or static data.
   - Optimized for memory efficiency and data reuse through normalization.

3. **JIT Compilation**:
   - Built on LLVM, Tablica transforms source code into optimized native machine code at runtime.

4. **Graph and Data Processing**:
   - Inherent support for smoothing operations, clustering, and recursive data handling.

5. **Standard Library**:
   - Essential modules for array operations, numerical calculations, graph algorithms, and file I/O.

---

## **Key Objectives**
1. **Performance**: 
   - Tablica prioritizes runtime speed through JIT compilation and lightweight structures.
2. **Flexibility**: 
   - Easily manage both static (`umt`) and dynamic (`mt`) data with clear APIs.
3. **Extensibility**:
   - Designed to integrate with external libraries and tools through robust API and ABI support.

---

## **Implementation Plan**

### **Phase 1: Core Implementation**
1. **MetaTables (mt) and Unmodifiable Tables (umt)**:
   - Implement core data structures with efficient data sharing and normalization.
   - Provide APIs for creation, updating, and querying tables.
   
   ```cpp
   class MetaTable {
   public:
       int id;
       std::unordered_map<std::string, std::string> data;

       MetaTable(int id) : id(id) {}

       void update(const std::string& key, const std::string& value) {
           data[key] = value;
       }

       std::string fetch(const std::string& key) {
           return data[key];
       }
   };
   ```

2. **JIT Compilation (LLVM-based)**:
   - Create a minimal JIT engine to compile and execute Tablica code dynamically.
   
   ```cpp
   #include "llvm/IR/IRBuilder.h"
   llvm::LLVMContext Context;
   llvm::Module* Module = new llvm::Module("Tablica", Context);
   llvm::IRBuilder<> Builder(Context);

   llvm::FunctionType* FuncType = llvm::FunctionType::get(Builder.getInt32Ty(), false);
   llvm::Function* MainFunc = llvm::Function::Create(FuncType, llvm::Function::ExternalLinkage, "main", Module);

   llvm::BasicBlock* Entry = llvm::BasicBlock::Create(Context, "entry", MainFunc);
   Builder.SetInsertPoint(Entry);

   llvm::Value* LHS = Builder.getInt32(10);
   llvm::Value* RHS = Builder.getInt32(20);
   llvm::Value* Sum = Builder.CreateAdd(LHS, RHS, "sum");

   Builder.CreateRet(Sum);
   Module->print(llvm::errs(), nullptr);
   ```

3. **Standard Library (Minimal Set)**:
   - Array operations, basic arithmetic functions, and file I/O.

   ```cpp
   namespace tablica {
       int add(int a, int b) {
           return a + b;
       }
   }
   ```

---

### **Phase 2: Language Features**
1. **Control Structures**:
   - Implement `if-else`, `for`, `while`, and function calls.
   - Create an Abstract Syntax Tree (AST) to handle program structures.

2. **Graph Operations**:
   - Develop smoothing functions, shortest path algorithms, and clustering.

   ```cpp
   void smoothGraph(std::vector<float>& data, int iterations) {
       for (int i = 0; i < iterations; ++i) {
           for (size_t j = 1; j < data.size() - 1; ++j) {
               data[j] = (data[j - 1] + data[j] + data[j + 1]) / 3.0f;
           }
       }
   }
   ```

3. **Expanding the Standard Library**:
   - Add support for linear algebra, statistics, and graph-based data manipulations.

---

### **Phase 3: Ecosystem Development**
1. **Documentation**:
   - Write detailed guides, API references, and contribution guidelines.

2. **API/ABI Support**:
   - Expose Tablica's core functions via C-style APIs.
   - Provide bindings for Python, Rust, or other languages.

   ```cpp
   extern "C" int tablica_add(int a, int b) {
       return tablica::add(a, b);
   }
   ```

3. **Integration with External Tools**:
   - Enable interoperation with data science libraries or distributed systems.

---

## **Development Timeline**
1. **Phase 1 (Core Features)**:
   - Complete within 4–6 weeks (MetaTables, Standard Library, and LLVM-based JIT).

2. **Phase 2 (Language Features)**:
   - Extend within 6–8 weeks (control structures, graph algorithms, and advanced library functions).

3. **Phase 3 (Ecosystem)**:
   - Finalize within 4–6 weeks (documentation, API, and bindings).

---

## **Sample Workflow**
```plaintext
# Example Tablica code (example.csm)
let x = 10 + 20;
if x > 20 {
    print(x);
}
```

```bash
# Compile and run
tablica example.mtab
```

---

## **Conclusion**
Tablica is poised to become a versatile and high-performance language for managing complex data operations. By focusing on lightweight structures, JIT compilation, and extensibility, it provides a unique solution for developers seeking efficiency and flexibility.

**GitHub Repository**: [Tablica](https://github.com/kobayashi-cyder/Tablica) 

We look forward to feedback and contributions from the community!
