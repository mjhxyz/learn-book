# Go 基础

## Go 语言安装

### 常用网站

- 官网 golang.org
- 国内下载: studygolang.com/dl
- 国内镜像: goproxy.cn

> 下载对应对应操作系统的文件，添加到环境变量中就行了。

### 镜像配置

```bash
go env -w GO111MODULE=on
go env -w GOPROXY=https://goproxy.cn,direct
```

## 基础语法

### 变量定义

::: tip 变量定义方式
- 使用 `var` 关键字
- 使用 `:=`定义变量
:::

::: warning 注意
- 包内部的变量，不是全局变量
- 函数外面不能使用 `:=` 定义变量
- 省略 var, 第一次使用变量的时候必须使用 `:=`
- 一行能定义多个变量, 类似于 python
- `var` 类型在变量名之后
- `var` 能不用就不用
- `var` 还可以放在 () 中定义多个变量
:::

```go
var aa = 3
var ss = "kkk"
var bb = true

var (
	cc = 3
	dd = "kkk"
	ee = true
)

func variableZeroValue() {
	var a int
	var s string
}

func variableInitValue() {
	var a, b int = 3, 4
	var s string = "abc"
}

func variableTypeDeduction() {
	var a, b, c, s = 3, 4, true, "def"
	fmt.Println(a, b, c, s)
}

func variableShorter() {
	a, b, c, s := 3, 4, true, "def"
}
```

### 内建变量

#### 所有内建变量

| -       | -               | -         | -          | -        | -        |
| ------- | --------------- | --------- | ---------- | -------- | -------- |
| bool    | string          |
| (u)int  | (u)int8         | (u)int16  | (u)int32   | (u)int64 | unintptr |
| byte    | rune(字符int32) |
| float32 | float64         | complex64 | complex128 |

#### 复数使用
```go
func euler() {
 // 复数表示
 fmt.Println(cmplx.Pow(math.E, 1i*math.Pi) + 1)
}
```

#### 强制类型转换

- Go 中类型转换是强制的!

```go
func triangle() {
 var a, b int = 3, 4
 var c int
 c = int(math.Sqrt(float64(a*b + b*b)))
}
```
### 常量的定义

- 使用 `const` 关键字
- 一般全部小写, const 数值 `可作为各种类型使用`

```go
func consts() {
 const filename = "abc.txt"
 const a, b = 3, 4
 const (
  filename2 = "dcd.txt"
  e, f      = 5, 6
 )
 var c int
 // 常量没有说明类型的时候，可以当作字面量
 c = int(math.Sqrt(a*a + b*b))
 fmt.Println(filename, c, filename2, e, f)
}
```

### 枚举的定义

- 没有专门的 `枚举关键字`
- 需要使用 `const` 来定义
- 可以用 `自增值`

```go
func enums() {
 // 没有特殊的关键字，用一组 const 定义表示
 const (
  cpp    = 0
  java   = 1
  python = 2
  golang = 3
 )
 // 还可以简写
 const (
  cpp2 = iota
  _    // 跳过一个
  java2
  python2
  golang2
 )
 // 还有 b, kb, mb, gb, tb, pb
 // iota 能参与运算
 const (
  b = 1 << (10 * iota)
  kb
  mb
  gb
  tb
  pb
 )
}
```

### 条件语句

#### if 语句

::: tip if 语句特点
- 条件表达式没有括号
- `{}` 必须有
- 能有两个子句
:::

```go
 const filename = "abc.txt"
 contents, err := os.ReadFile(filename)
 if err != nil {
  fmt.Println(err)
 } else {
  fmt.Printf("%s\n", contents)
 }


// 但是出了 if 中, err 和 contents 就不能访问了
const filename = "abc.txt"
if contents, err := os.ReadFile(filename); err != nil {
 fmt.Println(err)
} else {
 fmt.Printf("%s\n", contents)
}
```

#### switch 语句

::: tip switch 语句特点
- case 语句不一定是常量
- case 能是表达式
- switch 会自动 `break`, 除非使用 `fallthrough`
:::

```go
func grade(score int) string {
 g := ""
 switch {
 case score < 0 || score > 100:
  panic(fmt.Sprintf("Wrong score: %d", score))
 case score < 60:
  g = "F"
 case score < 80:
  g = "C"
 case score < 90:
  g = "B"
 case score <= 100:
  g = "A"
 }
 return g
}
```

### 循环

#### for 循环

::: tip 循环语句特点
- 没有 `while` 关键字, 被 for 取代
- 条件里不需要括号
- 条件可以省略 `初始条件`，`结束条件`，`递增表达式`
- 省略初始条件，相当于 `while`
- 什么都省略掉，`死循环`
:::

```go
// 转换为二进制
func convertToBin(n int) string {
 // 对2取模, 余数放在最后, 然后除以2 .... 直到商为0
 result := ""
 if n == 0 {
  return "0"
 }
 for ; n > 0; n /= 2 {
  lsb := n % 2
  result = strconv.Itoa(lsb) + result
 }
 return result
}


// for 条件 === while 条件
func printFile(filename string) {
 // 一行一行读取文件
 file, err := os.Open(filename)
 if err != nil {
  panic(err)
 }
 scanner := bufio.NewScanner(file)
 for scanner.Scan() {
  fmt.Println(scanner.Text())
 }
}

// 死循环
func forever() {
 for { 
  fmt.Println("abc")
 }
}
```

### 函数

::: tip 函数特点
- 函数可以有多个返回值
- 函数可以作为参数
- 能给返回值命名, 帮助编辑器补全代码
- 如果命名了，则可以省略 return 后面的值, 但不推荐这样做
:::

#### 函数定义

```go
func div(a, b int) (q, r int) {
 return a / b, a % b
}
q, _ := div(a, b) // 不用第二个值
```

#### 高阶函数

```go
// 函数式编程, 具体操作方式来源于 op
func apply(op func(int, int) int, a, b int) int {
 pointer := reflect.ValueOf(op).Pointer()
 opName := runtime.FuncForPC(pointer).Name()
 fmt.Printf("Calling function %s with args (%d, %d)", opName, a, b)
 return op(a, b)
}
```

#### 可变参数列表

```go
func sum(numbers ...int) int {
 s := 0
 for i := range numbers {
  s += numbers[i]
 }
 return s
}
```

### 指针

::: tip 指针特点
- 指针不能运算, 这是 Go 指针简单的原因
- Go 只有值传递一种方式，每次都要拷贝一份 
:::

```go
func swap(a, b *int) {
 *b, *a = *a, *b
}
a, b := 3, 4
swap(&a, &b)
```

### 内建容器

#### 数组

::: tip 数组特点
- 数组是`值类型`，赋值和传参会复制整个数组
- 调用 func f(arr[10]int) 是会 `拷贝` 数组
- 可以使用 `指向数组的指针` 就可以了, 不过也挺麻烦的
- 所以一般不直接使用数组
:::

**数组定义**

```go
var arr1 [5]int
arr2 := [3]int{1, 3, 5}          // := 需要给初始值
arr3 := [...]int{2, 4, 6, 8, 10} // ... 表示根据初始值自动推断长度
var grid [4][5]int               // 二维数组
```

**遍历数组**

```go
// 遍历数组1
for i := 0; i < len(arr3); i++ {
 fmt.Println(arr3[i])
}
 
// 遍历数组2
for i := range arr3 { // 获取下标
 fmt.Println(arr3[i])
}
 
// 遍历数组3
for i, v := range arr3 { // 获取下标和值
 fmt.Println(i, v)
}
```

#### 切片

::: tip 切片特点
- 切片是数组的 `view`, 本身没有数据, 是对底层的数组的一个 `view`
- 切片的长度可以改变, 底层的数组是不会变的
- 切片的 `容量(cap)` 是指底层数组的容量
- 切片只要 `不超过` cap 就能 `向后扩展`, 不能向前扩展
- 切片添加元素时，如果超过 `cap` ，系统会重新分配更加大的底层数组
- 切片中 append, len 会改变，cap 也可能会改变
:::

**切片结构**

分为三个部分:

- `ptr`: 指向底层数组的指针, 也是切片的第一个元素的位置
- `len`: 切片的长度, 从 `ptr` 开始
- `cap`: 切片的容量, 从 `ptr` 开始, 到底层数组的最后一个元素

**向切片添加数据**

```go
s4 := append(s2, 10)
s5 := append(s3, 11)
s6 := append(s4, 12)
```

**拷贝切片**

```go
copy(s2, s1) // 将 s1 内容复制到 s2
```

**创建切片**

```go
var s []int // Zero value for slice is nil
for i := 0; i < 100; i++ {
 printSlice(s)
 s = append(s, i)
}

s1 := []int{2, 4, 6, 8}
s2 := make([]int, 16) // 创建一个长度为16的slice
s3 := make([]int, 10, 32) // 创建一个长度为10, 容量为32的slice
```

**删除切片中元素**

```go
// 删除中间的元素
s2 = append(s2[:3], s2[4:]...) // 删除s2[3]

fmt.Println("Popping from front")
front := s2[0]
s2 = s2[1:]

fmt.Println("Popping from back")
tail := s2[len(s2)-1]
s2 = s2[:len(s2)-1]
```

#### Map

::: tip Map 特点
- Map 的 `key` 可以是 `除了 slice, map, function` 的其他类型
- struct 类型如果不包含上述字段, 也可以作为 key
- Map 的 `value` 可以是 `任意类型`
- Map 的 `key` 是无序的, 每次打印出来的 map 都会不一样
- Map 的 `key` 不能重复, 重复了就会覆盖
:::

**创建Map**

三种方法:

```go
m := map[string]string{
  "age":    "99",
  "name":  "mao",
}

 m2 := make(map[string]int) // m2 == empty map

 var m3 map[string]int // m3 == nil
```

**遍历Map**

```go
 for k, v := range m {
  fmt.Println(k, v)
 }
```

**操作Map**

```go
// 获取 value, 如果不存在返回初始值
 courseName, ok := m["age"]
 fmt.Println(courseName, ok)

 if courseName, ok := m["age"]; ok {
  fmt.Println(courseName, ok)
 } else {
  fmt.Println("key does not exist")
 }

// 删除元素
 name, ok := m["name"]
 delete(m, "name")
 name, ok = m["name"]
```

### 字符串

::: tip 字符串特点
- `rune` 相当于 go 的 char
- 使用 range 可以遍历 `pos, rune` 对
- 使用 `utf8.RuneCountInString` 获取字符数量
- 使用 `len` 获取字节长度
- 使用 `[]byte` 获取字节数组
:::

```go
 s := "走,忽略"
 fmt.Println(s)
 for _, b := range []byte(s) {
  fmt.Printf("%X ", b)
 }
 fmt.Println()

 for i, ch := range s { // ch is a rune
  fmt.Printf("(%d %X) ", i, ch)
 }
 fmt.Println()

 fmt.Println(
  "Rune count:",
  utf8.RuneCount([]byte(s)))

 bytes := []byte(s)
 for len(bytes) > 0 {
  ch, size := utf8.DecodeRune(bytes) // 解码第一个rune, 返回rune和长度
  bytes = bytes[size:]
  fmt.Printf("%c ", ch)
 }
 fmt.Println()

 // 直接使用rune 就完事了
 for i, ch := range []rune(s) {
  fmt.Printf("(%d %c) ", i, ch)
 }
```

#### 字符串其他操作

- 在 `strings` 包中
