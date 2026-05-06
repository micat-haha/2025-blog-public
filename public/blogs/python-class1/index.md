在学习 Python 的过程中，面向对象是一个非常重要的知识点。概念比较抽象，例如：什么是类？什么是对象？`self` 到底是什么？为什么有些方法前后都有双下划线？封装又有什么意义？

今天学习了 Python 面向对象中的几个核心概念：

* 类
* 对象
* 属性
* 方法
* 魔术方法
* 封装

---

## 一、什么是类？

类可以理解为一种“模板”或“蓝图”。

它用来描述一类事物应该具有哪些数据，以及可以执行哪些行为。

例如，在现实生活中，“学生”是一类事物。学生通常有姓名、年龄、成绩等信息，也可以学习、考试、展示个人信息。

在 Python 中，可以用 `class` 关键字定义一个类：

```python
class Student:
    def __init__(self, name, age, score):
        self.name = name
        self.age = age
        self.score = score

    def study(self):
        print(f"{self.name} 正在学习")

    def show_info(self):
        print(f"姓名：{self.name}，年龄：{self.age}，成绩：{self.score}")
```

这里的 `Student` 就是一个类。

它定义了学生应该有哪些属性：

```python
self.name
self.age
self.score
```

也定义了学生可以执行哪些行为：

```python
study()
show_info()
```

可以简单理解为：

> 类是对一类事物的抽象描述。

---

## 二、什么是对象？

对象是根据类创建出来的具体实例。

如果说类是模板，那么对象就是根据这个模板创建出来的具体个体。

例如：

```python
stu1 = Student("张三", 20, 88)
stu2 = Student("李四", 21, 95)
```

这里的 `stu1` 和 `stu2` 都是对象。

它们都来自 `Student` 类，但是它们保存的数据不同。

```python
stu1.show_info()
stu2.show_info()
```

输出结果：

```text
姓名：张三，年龄：20，成绩：88
姓名：李四，年龄：21，成绩：95
```

类和对象的关系可以总结如下：

| 概念 | 含义                      |
| -- | ----------------------- |
| 类  | 模板，例如“学生”               |
| 对象 | 根据类创建出来的具体个体，例如“张三这个学生” |
| 属性 | 对象保存的数据，例如姓名、年龄、成绩      |
| 方法 | 对象可以执行的行为，例如学习、展示信息     |

---

## 三、`__init__` 方法

`__init__` 是 Python 类中最常见的魔术方法之一。

它的作用是在对象创建时进行初始化。

例如：

```python
class Student:
    def __init__(self, name, age):
        self.name = name
        self.age = age
```

当我们执行：

```python
stu = Student("张三", 20)
```

Python 会自动调用 `__init__` 方法，将 `"张三"` 和 `20` 传入对象中。

可以理解为，下面这行代码：

```python
stu = Student("张三", 20)
```

完成了两件事：

```text
1. 创建一个 Student 对象
2. 调用 __init__ 方法初始化对象属性
```

因此，`__init__` 通常用来给对象设置初始属性。

---

## 四、`self` 是什么？

`self` 表示当前对象本身。

在类的方法中，如果要访问对象自己的属性，就需要使用 `self`。

例如：

```python
class Student:
    def __init__(self, name):
        self.name = name

    def say_hello(self):
        print(f"你好，我是 {self.name}")
```

创建对象并调用方法：

```python
stu = Student("张三")
stu.say_hello()
```

输出：

```text
你好，我是 张三
```

这里的：

```python
self.name
```

表示当前对象的 `name` 属性。

当我们调用：

```python
stu.say_hello()
```

Python 实际上会自动把 `stu` 这个对象传给 `self`。

也就是说：

```python
stu.say_hello()
```

大致可以理解为：

```python
Student.say_hello(stu)
```

所以，实例方法的第一个参数通常都写成 `self`。

需要注意的是，`self` 不是 Python 的关键字，只是一种约定写法。虽然可以写成其他名字，但不推荐这样做。

---

## 五、属性：实例属性和类属性

Python 类中的属性主要分为两类：

* 实例属性
* 类属性

---

### 1. 实例属性

实例属性属于某一个具体对象。

例如：

```python
class Student:
    def __init__(self, name, age):
        self.name = name
        self.age = age
```

创建两个对象：

```python
stu1 = Student("张三", 20)
stu2 = Student("李四", 22)
```

此时，`stu1.name` 和 `stu2.name` 是两个不同对象自己的属性。

```python
print(stu1.name)
print(stu2.name)
```

输出：

```text
张三
李四
```

实例属性的特点是：

> 每个对象都有自己独立的一份数据。

---

### 2. 类属性

类属性属于整个类，被所有对象共享。

例如：

```python
class Student:
    school = "北京大学"

    def __init__(self, name):
        self.name = name
```

创建对象：

```python
stu1 = Student("张三")
stu2 = Student("李四")
```

访问类属性：

```python
print(stu1.school)
print(stu2.school)
print(Student.school)
```

输出：

```text
北京大学
北京大学
北京大学
```

这里的 `school` 是类属性，它属于 `Student` 类，而不是某一个具体对象。

类属性适合存放所有对象共享的数据。

例如，可以用类属性统计创建了多少个学生对象：

```python
class Student:
    count = 0

    def __init__(self, name):
        self.name = name
        Student.count += 1
```

使用：

```python
s1 = Student("张三")
s2 = Student("李四")
s3 = Student("王五")

print(Student.count)
```

输出：

```text
3
```

---

## 六、实例属性和类属性的易错点

类属性是共享的，但如果通过对象名重新赋值，可能并不会修改类属性，而是给对象新增一个同名的实例属性。

例如：

```python
class Student:
    school = "清华大学"

s1 = Student()
s2 = Student()

s1.school = "北京大学"

print(s1.school)
print(s2.school)
print(Student.school)
```

输出：

```text
北京大学
清华大学
清华大学
```

原因是：

```python
s1.school = "北京大学"
```

这行代码并没有修改类属性，而是给 `s1` 对象新增了一个实例属性 `school`。

如果想修改类属性，应该通过类名修改：

```python
Student.school = "北京大学"
```

此外，如果类属性是列表、字典这类可变对象，也要特别小心。

```python
class A:
    nums = []

a1 = A()
a2 = A()

a1.nums.append(1)
a2.nums.append(2)

print(a1.nums)
print(a2.nums)
```

输出：

```text
[1, 2]
[1, 2]
```

因为 `nums` 是类属性，被所有对象共享。

如果希望每个对象都有自己的列表，应该写成实例属性：

```python
class A:
    def __init__(self):
        self.nums = []
```

---

## 七、方法的类型

Python 类中的方法主要有三种：

* 实例方法
* 类方法
* 静态方法

---

### 1. 实例方法

实例方法是最常见的方法。

它的第一个参数是 `self`，表示当前对象。

```python
class Student:
    def __init__(self, name):
        self.name = name

    def study(self):
        print(f"{self.name} 正在学习")
```

使用：

```python
stu = Student("张三")
stu.study()
```

实例方法可以访问实例属性，也可以访问类属性。

它主要用于操作某一个具体对象。

---

### 2. 类方法

类方法使用 `@classmethod` 装饰器定义。

它的第一个参数通常写成 `cls`，表示当前类。

```python
class Student:
    count = 0

    def __init__(self, name):
        self.name = name
        Student.count += 1

    @classmethod
    def show_count(cls):
        print(f"当前学生数量：{cls.count}")
```

使用：

```python
s1 = Student("张三")
s2 = Student("李四")

Student.show_count()
```

输出：

```text
当前学生数量：2
```

类方法主要用于操作类属性，或者作为备用构造方法。

例如：

```python
class Date:
    def __init__(self, year, month, day):
        self.year = year
        self.month = month
        self.day = day

    @classmethod
    def from_string(cls, date_str):
        year, month, day = date_str.split("-")
        return cls(int(year), int(month), int(day))
```

使用：

```python
d = Date.from_string("2026-05-06")
print(d.year, d.month, d.day)
```

输出：

```text
2026 5 6
```

这里的 `from_string` 就是一个类方法，它可以根据字符串创建一个新的 `Date` 对象。

---

### 3. 静态方法

静态方法使用 `@staticmethod` 装饰器定义。

它不需要 `self`，也不需要 `cls`。

```python
class MathTool:
    @staticmethod
    def add(a, b):
        return a + b
```

使用：

```python
print(MathTool.add(3, 5))
```

输出：

```text
8
```

静态方法更像是放在类里面的普通函数。

它适合处理这种情况：

> 这个函数和类有关系，但不需要访问实例属性，也不需要访问类属性。

---

## 八、三种方法的区别

| 方法类型 | 第一个参数  | 是否能访问实例属性 | 是否能访问类属性 | 典型用途         |
| ---- | ------ | --------- | -------- | ------------ |
| 实例方法 | `self` | 可以        | 可以       | 操作具体对象       |
| 类方法  | `cls`  | 不可以直接访问   | 可以       | 操作类本身、备用构造方法 |
| 静态方法 | 无固定参数  | 不可以       | 不可以      | 和类相关的工具函数    |

示例：

```python
class Example:
    class_value = 100

    def __init__(self, value):
        self.value = value

    def instance_method(self):
        print(self.value)
        print(Example.class_value)

    @classmethod
    def class_method(cls):
        print(cls.class_value)

    @staticmethod
    def static_method(x, y):
        return x + y
```

---

## 九、什么是魔术方法？

魔术方法也叫特殊方法。

它们的特点是：方法名前后都有两个下划线。

例如：

```python
__init__
__str__
__repr__
__len__
__add__
__eq__
```

这些方法通常不是由我们手动调用，而是在特定场景下由 Python 自动调用。

例如：

```python
class Student:
    def __init__(self, name):
        self.name = name
```

当执行：

```python
stu = Student("张三")
```

Python 会自动调用 `__init__` 方法。

魔术方法的作用是让我们自己定义的类可以像 Python 内置类型一样使用。

例如：

```python
len(obj)
print(obj)
obj1 + obj2
obj1 == obj2
obj[index]
for x in obj
```

这些操作背后都可能对应某些魔术方法。

---

## 十、常见魔术方法

### 1. `__init__`

`__init__` 用于对象初始化。

```python
class Student:
    def __init__(self, name):
        self.name = name
```

创建对象时会自动调用：

```python
stu = Student("张三")
```

---

### 2. `__str__`

`__str__` 用于定义对象被 `print()` 打印时的显示内容。

如果不定义 `__str__`：

```python
class Student:
    def __init__(self, name):
        self.name = name

stu = Student("张三")
print(stu)
```

输出可能是：

```text
<__main__.Student object at 0x000001A2F3...>
```

这个结果不够直观。

定义 `__str__` 后：

```python
class Student:
    def __init__(self, name):
        self.name = name

    def __str__(self):
        return f"学生姓名：{self.name}"
```

使用：

```python
stu = Student("张三")
print(stu)
```

输出：

```text
学生姓名：张三
```

---

### 3. `__repr__`

`__repr__` 通常用于给开发者看的对象表示。

```python
class Student:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def __repr__(self):
        return f"Student(name={self.name!r}, age={self.age!r})"
```

使用：

```python
stu = Student("张三", 20)
print(repr(stu))
```

输出：

```text
Student(name='张三', age=20)
```

一般来说：

```text
__str__  面向用户，要求易读
__repr__ 面向开发者，要求准确
```

---

### 4. `__len__`

`__len__` 可以让对象支持 `len()` 函数。

```python
class Team:
    def __init__(self, members):
        self.members = members

    def __len__(self):
        return len(self.members)
```

使用：

```python
team = Team(["张三", "李四", "王五"])
print(len(team))
```

输出：

```text
3
```

---

### 5. `__getitem__`

`__getitem__` 可以让对象支持下标访问。

```python
class Team:
    def __init__(self, members):
        self.members = members

    def __getitem__(self, index):
        return self.members[index]
```

使用：

```python
team = Team(["张三", "李四", "王五"])

print(team[0])
print(team[1])
```

输出：

```text
张三
李四
```

---

### 6. `__setitem__`

`__setitem__` 可以让对象支持下标赋值。

```python
class Team:
    def __init__(self, members):
        self.members = members

    def __setitem__(self, index, value):
        self.members[index] = value
```

使用：

```python
team = Team(["张三", "李四"])
team[0] = "赵六"

print(team.members)
```

输出：

```text
['赵六', '李四']
```

---

### 7. `__iter__`

`__iter__` 可以让对象支持 `for` 循环遍历。

```python
class Team:
    def __init__(self, members):
        self.members = members

    def __iter__(self):
        return iter(self.members)
```

使用：

```python
team = Team(["张三", "李四", "王五"])

for member in team:
    print(member)
```

输出：

```text
张三
李四
王五
```

---

### 8. `__contains__`

`__contains__` 可以让对象支持 `in` 判断。

```python
class Team:
    def __init__(self, members):
        self.members = members

    def __contains__(self, item):
        return item in self.members
```

使用：

```python
team = Team(["张三", "李四"])

print("张三" in team)
print("王五" in team)
```

输出：

```text
True
False
```

---

### 9. `__eq__`

`__eq__` 可以让对象支持 `==` 比较。

```python
class Student:
    def __init__(self, name, score):
        self.name = name
        self.score = score

    def __eq__(self, other):
        return self.name == other.name and self.score == other.score
```

使用：

```python
s1 = Student("张三", 90)
s2 = Student("张三", 90)
s3 = Student("李四", 80)

print(s1 == s2)
print(s1 == s3)
```

输出：

```text
True
False
```

如果不定义 `__eq__`，默认比较的是两个对象是不是同一个对象，而不是对象内容是否相同。

---

### 10. `__lt__`

`__lt__` 可以让对象支持 `<` 比较。

```python
class Student:
    def __init__(self, name, score):
        self.name = name
        self.score = score

    def __lt__(self, other):
        return self.score < other.score
```

使用：

```python
s1 = Student("张三", 90)
s2 = Student("李四", 80)

print(s2 < s1)
```

输出：

```text
True
```

它还可以用于排序：

```python
students = [
    Student("张三", 90),
    Student("李四", 80),
    Student("王五", 95)
]

students.sort()

for stu in students:
    print(stu.name, stu.score)
```

输出：

```text
李四 80
张三 90
王五 95
```

---

### 11. `__add__`

`__add__` 可以让对象支持 `+` 运算。

```python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def __str__(self):
        return f"Vector({self.x}, {self.y})"
```

使用：

```python
v1 = Vector(1, 2)
v2 = Vector(3, 4)

v3 = v1 + v2

print(v3)
```

输出：

```text
Vector(4, 6)
```

---

### 12. `__call__`

`__call__` 可以让对象像函数一样被调用。

```python
class Adder:
    def __init__(self, base):
        self.base = base

    def __call__(self, x):
        return self.base + x
```

使用：

```python
add_10 = Adder(10)

print(add_10(5))
print(add_10(20))
```

输出：

```text
15
30
```

这里的 `add_10` 是一个对象，但因为它实现了 `__call__` 方法，所以可以像函数一样调用。

---

### 13. `__enter__` 和 `__exit__`

`__enter__` 和 `__exit__` 用于上下文管理器，也就是 `with` 语句。

```python
class FileManager:
    def __enter__(self):
        print("进入 with 代码块")
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        print("退出 with 代码块")
```

使用：

```python
with FileManager() as fm:
    print("正在执行操作")
```

输出：

```text
进入 with 代码块
正在执行操作
退出 with 代码块
```

日常开发中，文件操作就是典型例子：

```python
with open("data.txt", "r", encoding="utf-8") as f:
    content = f.read()
```

`with` 的好处是可以自动释放资源，例如自动关闭文件。

---

## 十一、常见魔术方法总结

| 魔术方法           | 触发场景                 | 作用          |
| -------------- | -------------------- | ----------- |
| `__init__`     | 创建对象                 | 初始化对象       |
| `__str__`      | `print(obj)`         | 定义用户友好的字符串  |
| `__repr__`     | `repr(obj)`          | 定义开发者友好的字符串 |
| `__len__`      | `len(obj)`           | 返回对象长度      |
| `__getitem__`  | `obj[index]`         | 支持下标访问      |
| `__setitem__`  | `obj[index] = value` | 支持下标赋值      |
| `__iter__`     | `for x in obj`       | 支持遍历        |
| `__contains__` | `x in obj`           | 支持成员判断      |
| `__eq__`       | `obj1 == obj2`       | 支持相等比较      |
| `__lt__`       | `obj1 < obj2`        | 支持小于比较      |
| `__add__`      | `obj1 + obj2`        | 支持加法运算      |
| `__call__`     | `obj()`              | 让对象像函数一样调用  |
| `__enter__`    | 进入 `with`            | 上下文管理       |
| `__exit__`     | 退出 `with`            | 资源释放或异常处理   |

---

## 十二、什么是封装？

封装是面向对象编程的三大特性之一。

面向对象的三大特性通常是：

```text
封装
继承
多态
```

封装的核心思想是：

> 把数据和操作数据的方法放在类里面，并控制外部对数据的访问。

换句话说，对象内部的数据不应该被外部随意修改，而应该通过类提供的方法进行访问和修改。

---

## 十三、为什么需要封装？

假设有一个学生类：

```python
class Student:
    def __init__(self, name, score):
        self.name = name
        self.score = score
```

使用时，可以直接修改成绩：

```python
stu = Student("张三", 90)
stu.score = -100
```

显然，成绩不应该是负数。

如果外部可以随意修改对象的数据，就容易导致对象内部状态不合理。

封装的目的就是避免这种情况。

通过封装，可以限制外部访问方式，并在修改数据时进行校验。

---

## 十四、Python 中的访问控制

Python 没有 Java、C++ 那种严格的 `private`、`protected`、`public` 关键字。

Python 主要通过命名约定来表示访问权限。

---

### 1. 公有属性

普通属性就是公有属性，外部可以直接访问。

```python
class Student:
    def __init__(self, name):
        self.name = name
```

使用：

```python
stu = Student("张三")
print(stu.name)

stu.name = "李四"
```

---

### 2. 受保护属性

以一个下划线开头的属性，表示“建议不要在类外部直接访问”。

```python
class Student:
    def __init__(self, name):
        self._name = name
```

虽然语法上可以访问：

```python
stu = Student("张三")
print(stu._name)
```

但按照约定，`_name` 表示这是类内部或子类内部使用的属性，不建议外部直接访问。

---

### 3. 私有属性

以两个下划线开头的属性，表示私有属性。

```python
class Student:
    def __init__(self, name, score):
        self.__name = name
        self.__score = score
```

外部不能直接访问：

```python
stu = Student("张三", 90)
print(stu.__score)
```

会报错：

```text
AttributeError: 'Student' object has no attribute '__score'
```

但在类内部可以访问：

```python
class Student:
    def __init__(self, name, score):
        self.__name = name
        self.__score = score

    def show_score(self):
        print(self.__score)
```

---

## 十五、私有属性的本质

Python 中的私有属性并不是真正绝对无法访问。

双下划线开头的属性会发生名称改写。

例如：

```python
self.__score
```

会被 Python 改写成类似：

```python
self._Student__score
```

因此，外部其实可以通过下面这种方式访问：

```python
print(stu._Student__score)
```

但是非常不推荐这样做。

双下划线的意义更多是一种保护机制：

> 告诉外部使用者：这是类的内部实现细节，不要直接访问。

---

## 十六、使用 getter 和 setter 封装属性

为了避免外部随意修改属性，可以提供专门的方法来读取和修改数据。

```python
class Student:
    def __init__(self, name, score):
        self.__name = name
        self.__score = score

    def get_score(self):
        return self.__score

    def set_score(self, score):
        if 0 <= score <= 100:
            self.__score = score
        else:
            raise ValueError("成绩必须在 0 到 100 之间")
```

使用：

```python
stu = Student("张三", 90)

print(stu.get_score())

stu.set_score(95)
print(stu.get_score())

stu.set_score(-10)
```

当传入非法成绩时，会报错：

```text
ValueError: 成绩必须在 0 到 100 之间
```

这种写法的好处是：外部不能随便修改成绩，必须通过 `set_score()` 方法修改，而方法内部可以进行数据校验。

---

## 十七、使用 `@property` 实现更优雅的封装

在 Python 中，更常见的写法是使用 `@property`。

它可以让方法像属性一样被访问，同时仍然可以进行数据校验。

```python
class Student:
    def __init__(self, name, score):
        self.name = name
        self._score = None
        self.score = score

    @property
    def score(self):
        return self._score

    @score.setter
    def score(self, value):
        if 0 <= value <= 100:
            self._score = value
        else:
            raise ValueError("成绩必须在 0 到 100 之间")
```

使用：

```python
stu = Student("张三", 90)

print(stu.score)

stu.score = 95
print(stu.score)

stu.score = -10
```

表面上看，访问方式仍然像普通属性：

```python
stu.score
stu.score = 95
```

但实际上，Python 会自动调用对应的 getter 和 setter 方法。

因此，`@property` 的优点是：

```text
1. 保留属性访问的简洁写法
2. 可以在赋值时进行数据检查
3. 更符合 Python 的代码风格
```

---

## 十八、完整示例：类、对象、方法、魔术方法和封装

下面通过一个完整的例子，把前面的知识串起来。

```python
class Student:
    school = "清华大学"

    def __init__(self, name, age, score):
        self.name = name
        self.age = age
        self._score = None
        self.score = score

    @property
    def score(self):
        return self._score

    @score.setter
    def score(self, value):
        if 0 <= value <= 100:
            self._score = value
        else:
            raise ValueError("成绩必须在 0 到 100 之间")

    def study(self):
        print(f"{self.name} 正在学习")

    def show_info(self):
        print(f"姓名：{self.name}，年龄：{self.age}，成绩：{self.score}")

    @classmethod
    def show_school(cls):
        print(f"学校：{cls.school}")

    @staticmethod
    def is_pass(score):
        return score >= 60

    def __str__(self):
        return f"{self.name}，{self.age}岁，成绩：{self.score}"

    def __eq__(self, other):
        return self.name == other.name and self.score == other.score

    def __lt__(self, other):
        return self.score < other.score
```

使用：

```python
s1 = Student("张三", 20, 88)
s2 = Student("李四", 21, 95)
s3 = Student("张三", 20, 88)

s1.study()
s1.show_info()

Student.show_school()

print(Student.is_pass(s1.score))

print(s1)

print(s1 == s3)
print(s1 < s2)
```

输出：

```text
张三 正在学习
姓名：张三，年龄：20，成绩：88
学校：清华大学
True
张三，20岁，成绩：88
True
True
```

这个例子中包含了：

| 内容   | 示例                                     |
| ---- | -------------------------------------- |
| 类    | `Student`                              |
| 对象   | `s1`、`s2`、`s3`                         |
| 实例属性 | `name`、`age`、`score`                   |
| 类属性  | `school`                               |
| 实例方法 | `study()`、`show_info()`                |
| 类方法  | `show_school()`                        |
| 静态方法 | `is_pass()`                            |
| 封装   | 使用 `@property` 控制 `score`              |
| 魔术方法 | `__init__`、`__str__`、`__eq__`、`__lt__` |

---

## 十九、类和对象的内存理解

看下面这个例子：

```python
class Student:
    school = "清华大学"

    def __init__(self, name):
        self.name = name
```

创建两个对象：

```python
s1 = Student("张三")
s2 = Student("李四")
```

可以理解为：

```text
Student 类：
    school = "清华大学"
    __init__()

s1 对象：
    name = "张三"

s2 对象：
    name = "李四"
```

其中：

* `school` 是类属性，属于 `Student` 类，被所有对象共享
* `name` 是实例属性，属于每个具体对象，各自独立

---

## 二十、什么时候应该使用类？

不是所有代码都需要写成类。

适合使用类的情况包括：

```text
1. 数据和行为关系紧密
2. 需要创建多个相似对象
3. 需要维护对象状态
4. 需要封装复杂逻辑
5. 项目规模较大，需要更清晰的代码结构
```

例如：

```text
学生管理系统
文件处理器
模型训练器
图像处理流程
数据库连接对象
机器学习模型
爬虫任务
```

这些场景都适合使用类。

不太适合使用类的情况包括：

```text
1. 只是简单计算
2. 一个函数就能解决问题
3. 没有状态需要保存
```

例如：

```python
def add(a, b):
    return a + b
```

这种简单函数没有必要专门写成类。

---

## 二十一、一个实际项目风格的例子

假设需要写一个 CSV 数据处理器，可以用类来组织代码。

```python
import pandas as pd


class CSVProcessor:
    def __init__(self, file_path):
        self.file_path = file_path
        self.data = None

    def load_data(self):
        self.data = pd.read_csv(self.file_path)
        return self.data

    def show_head(self, n=5):
        if self.data is None:
            raise ValueError("请先调用 load_data() 读取数据")
        print(self.data.head(n))

    def remove_missing(self):
        if self.data is None:
            raise ValueError("请先调用 load_data() 读取数据")
        self.data = self.data.dropna()
        return self.data

    def save_data(self, output_path):
        if self.data is None:
            raise ValueError("没有可保存的数据")
        self.data.to_csv(output_path, index=False)

    def __str__(self):
        return f"CSVProcessor(file_path={self.file_path})"
```

使用：

```python
processor = CSVProcessor("data.csv")

processor.load_data()
processor.show_head()
processor.remove_missing()
processor.save_data("cleaned_data.csv")

print(processor)
```

这个类把文件路径、数据内容和数据处理方法封装到了一起。

它的好处是：

```text
1. 数据和操作被组织在同一个对象中
2. 代码结构更加清晰
3. 后续容易扩展更多功能
4. 可以避免全局变量过多
5. 更适合大型项目维护
```

---

## 二十二、Python 面向对象知识框架

可以把 Python 面向对象的核心知识整理成下面这个结构：

```text
类 class
│
├── 属性
│   ├── 实例属性：self.name
│   └── 类属性：Student.school
│
├── 方法
│   ├── 实例方法：def method(self)
│   ├── 类方法：@classmethod
│   └── 静态方法：@staticmethod
│
├── 魔术方法
│   ├── __init__
│   ├── __str__
│   ├── __repr__
│   ├── __len__
│   ├── __getitem__
│   ├── __eq__
│   ├── __lt__
│   ├── __add__
│   └── __call__
│
└── 封装
    ├── 公有属性：name
    ├── 受保护属性：_name
    ├── 私有属性：__name
    ├── getter / setter
    └── @property
```

---

## 二十三、学习类时容易混淆的几个问题

### 1. 类和对象不是一回事

```python
Student
```

是类。

```python
stu = Student()
```

`stu` 是对象。

类是模板，对象是模板创建出来的具体实例。

---

### 2. 定义实例方法时要写 `self`

```python
def show(self):
    pass
```

调用时不需要手动传入 `self`：

```python
stu.show()
```

不要写成：

```python
stu.show(stu)
```

因为 Python 会自动把当前对象传给 `self`。

---

### 3. 类属性是共享的

如果类属性是可变对象，例如列表或字典，多个对象可能会相互影响。

```python
class A:
    nums = []
```

如果希望每个对象都有独立的数据，应写在 `__init__` 中：

```python
class A:
    def __init__(self):
        self.nums = []
```

---

### 4. 魔术方法不是随便调用的普通方法

魔术方法通常由 Python 在特定场景下自动调用。

例如：

```python
print(obj)
```

会触发：

```python
obj.__str__()
```

```python
len(obj)
```

会触发：

```python
obj.__len__()
```

```python
obj1 + obj2
```

会触发：

```python
obj1.__add__(obj2)
```

---

## 二十四、总结

Python 面向对象的核心可以概括为一句话：

> 类是模板，对象是实例，属性保存数据，方法描述行为。

类中可以定义属性和方法。

属性分为：

```text
实例属性
类属性
```

方法分为：

```text
实例方法
类方法
静态方法
```

魔术方法可以让自定义对象支持 Python 内置语法，例如：

```python
print(obj)
len(obj)
obj1 + obj2
obj1 == obj2
for x in obj
obj[index]
with obj:
```

封装用于保护对象内部数据，常见方式包括：

```text
_name
__name
getter / setter
@property
```

> 面向对象的本质，是把一类事物的数据和行为组织到一起，通过对象来管理状态，通过方法来操作状态。

当程序变得复杂时，类可以帮助我们更好地组织代码、减少重复、提高可维护性。
