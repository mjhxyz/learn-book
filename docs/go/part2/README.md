# Go 编程思想(二)

## 面向接口

### duck typing

::: tip duck typing
- 像鸭子走路，像鸭子叫，那么它就是鸭子
- 描述事物的外部行为而非内部结构
- 严格说 GO 属于 结构化类型系统, 类似 duck typing
:::


**GO语言的duck typing**

- 同时需要 Readable, Appendable 怎么办?
- 同时具有 python, c++ 的灵活性
- 又具有 java 类型检查

### 接口定义和实现

::: tip 接口
- 实现者不需要指定实现哪个接口，只需要实现哪些方法就行了
- 由使用者来决定有哪些方法
- 接口的实现是 `隐式` 的，只要实现接口里面的方法就行了
:::

**调用者**
```go
type Retriever interface {
	Get(url string) string
}

func download(r Retriever) string {
	return r.Get("http://z.cn")
}
```

**实现者**

```go
type Retriever struct {
	Contents string
}

func (r Retriever) Get(url string) string {
	return r.Contents
}
```

### 接口的值类型

:::tip 接口的值类型
- Go的接口的值，不是一个简单的引用，肚子里有两个东西，`类型`，和`值`
- 除了通过打印，还可以通过 `switch` 和 `type assertion` 来判断
- 接口变量里面自带指针, 所以接口实现中的变量，不需要使用指针, 只要一个指针接收者就行了
- 指针接收者实现只能以指针方式使用; 值接收者都可以
:::

```go
type Retriever interface {
	Get(url string) string
}

func download(r Retriever) string {
	return r.Get("http://z.cn")
}

func main() {
	var r Retriever
	r = mock.Retriever{Contents: "this is a fake!!!"}
	inspect(r)
	r = &real.Retriever{
		UserAgent: "Mao",
		TimeOut:   time.Minute,
	}
	inspect(r)

	// Type assertion 获取具体的类型
	// 类似于强制类型转换，如果转不过来，则会报错
	// 可以加一个 ok 参数接收
	if mockRetriever, ok := r.(*mock.Retriever); ok {
		fmt.Println(mockRetriever.Contents)
	} else {
		fmt.Println("not a mock retriever")
	}
}

func inspect(r Retriever) {
	fmt.Printf("%T %v\n", r, r)
	switch v := r.(type) {
	case mock.Retriever:
		fmt.Println("Contents:", v.Contents)
	case *real.Retriever:
		fmt.Println("UserAgent:", v.UserAgent)
	}
}
```


**查看接口变量**

- 表示任何类型: `interface{}`
- Type Assertion
- Type Switch

**修改自定义队列的实现，支持任何类型, 但是上层限定只能操作int**

```go
type E interface{}
type Queue []E

func (q *Queue) Push(v int) {
	*q = append(*q, v)
}

func (q *Queue) Pop() int {
	head := (*q)[0]
	*q = (*q)[1:]
	// 强制转换将 interface{} 转换为 int
	return head.(int)
}

func (q *Queue) IsEmpty() bool {
	return len(*q) == 0
}
```

### 接口的组合

::: tip 接口的组合
- 将现有的接口组合起来
- 也是调用者自己来决定需要哪些方法

:::

```go
// 实现者
type Retriever struct {
	Contents string
}

// 注意这里是指针接收者，才能修改里面的内容
// 要不然是值传递
func (r *Retriever) Post(url string, form map[string]string) string {
	r.Contents = form["contents"]
	return "ok"
}

func (r *Retriever) Get(url string) string {
	return r.Contents
}


// 使用者
type Retriever interface {
	Get(url string) string
}

type Poster interface {
	Post(url string,
		form map[string]string) string
}

const url = "http://z.cn"

func download(r Retriever) string {
	return r.Get(url)
}

func post(p Poster) {
	p.Post(url,
		map[string]string{
			"name": "mao",
			"lang": "go",
		})
}

type RetrieverPoster interface {
	Retriever
	Poster
}

func session(s RetrieverPoster) string {
	s.Post(url, map[string]string{
		"contents": "another faked z.cn",
	})
	return s.Get(url)
}

```

### 系统常用接口

::: tip 系统常用接口
- `Stringer`, 相当于 java 的 toString
- `Reader`, 用于读取
- `Write`, 用于写入
:::

```go
type Stringer interface {
	String() string
}

type Reader interface {
	Read(p []byte) (n int, err error)
}

type Writer interface {
	Write(p []byte) (n int, err error)
}
```

## 函数式编程

::: tip 函数式编程
- 函数是一等公民: 参数，变量，返回值都可以是函数
- 高阶函数: 参数为函数的函数
- 函数 -> 闭包
:::

### 闭包

::: tip 闭包

- 函数体内部可以访问函数体外部的变量
- 闭包指的是，函数体 + 局部变量 + 自由变量 + 自由变量引用的环境
- 更为自然，不需要修饰如何访问自由变量
- 没有 lambda 表达式，但是有匿名函数
:::

**累加器**

```go
func adder() func(int) int {
	s := 0
	return func(value int) int {
		s += value
		return s
	}
}
```

**斐波那契数列**

```go
func fibonacci() func() int {
	a, b := 0, 1
	return func() int {
		a, b = b, a+b
		return a
	}
}
```

### 为函数实现接口

> 给函数实现接口，让函数能像文件一样使用, 像文件一样读取 `斐波那契数列`


**斐波那契数列升级**

```go
type intGen func() int

func (g intGen) Read(p []byte) (n int, err error) {
	next := g()
	// next 写入 p
	if next > 10000 {
		return 0, io.EOF
	}
	s := fmt.Sprintf("%d\n", next)
	// TODO: incorrect if p is too small
	return strings.NewReader(s).Read(p)
}

func fibonacci() intGen {
	a, b := 0, 1
	return func() int {
		a, b = b, a+b
		return a
	}
}

func printFileContents(reader io.Reader) {
	scanner := bufio.NewScanner(reader)
	for scanner.Scan() {
		fmt.Println(scanner.Text())
	}
}

```

**使用函数遍历二叉树**

> 类似于策略模式, 使用者提供具体的操作细节

```go
func (node *Node) Traverse() {
	node.TraversaFunc(func(n *Node) {
		n.Print()
	})
	fmt.Println()
}

func (node *Node) TraversaFunc(f func(*Node)) {
	if node == nil {
		return
	}
	node.Left.TraversaFunc(f)
	f(node)
	node.Right.TraversaFunc(f)
}
```

## 错误处理&资源管理

### defer 调用

::: tip defer 调用
- 确保调用在函数 `结束时` 发生
- defer 相当有一个栈, 先进后出
- 不怕中间有 return,就算有 `panic` 都会执行
- :point_right: 参数在 `derfer` 语句时计算
- :point_right: defer 列表为后进先出
:::

使用 `defer` 的场景:

- Open/Close
- Lock/Unlock
- PrintHeader/PrintFooter


**基础使用**

```go
func tryDefer() {
	defer fmt.Println(1)
	defer fmt.Println(2)
	fmt.Println(3)
	panic("this is panic")
	fmt.Println(4)
}
```

**用于释放资源**

```go
func writeFile(filename string) {
	file, err := os.Create(filename)
	if err != nil {
		panic(err)
	}
	defer file.Close()

	// 用缓冲区写入文件
	writer := bufio.NewWriter(file)
	defer writer.Flush()

	f := fib.Fibonacci()
	for i := 0; i < 20; i++ {
		fmt.Fprintln(writer, f())
	}
}
```

### 错误处理

::: tip error vs panic
- 意料之中的:使用 `error` 如: 文件打不开
- 意料之外的:使用 `panic` 如: 数组越界
- defer + panic + recover 进行错误处理
- Type Assertion 来判断错误类型
:::

**基本概念**

::: tip 错误处理
- error 为接口类型, 需要实现 `Error() string` 方法
- 可以通过 `errors.New` 来创建一个 error
- 可以通过 type assertion 来获取错误类型
:::

```go
	file, err := os.OpenFile(filename, os.O_EXCL|os.O_CREATE, 0666)
	//err = errors.New("这是一个自定义错误")
	if err != nil {
		// OpenFile: // If there is an error, it will be of type *PathError.
		if pathError, ok := err.(*os.PathError); !ok {
			// 不是 PathError:
			panic(err)
		} else {
			fmt.Printf("%s, %s, %s\n",
				pathError.Op,
				pathError.Path,
				pathError.Err,
			)
		}
	}
```

**如何实现统一的错误处理逻辑**

> 可以中间包装一层, 实现的那一层，有 error 就返回 error, 中间层接受业务处理的函数，返回一个框架或者工具所需的函数, 只要业务处理函数出现了错误，那么可以判断错误类型，进行相应的处理

```go
var logger, _ = zap.NewProduction()

type appHandler func(writer http.ResponseWriter, request *http.Request) error

func errWrapper(handler appHandler) func(writer http.ResponseWriter, request *http.Request) {
	return func(writer http.ResponseWriter, request *http.Request) {
		err := handler(writer, request)
		if err != nil {
			logger.Warn("Error handling request: " + err.Error())
			code := http.StatusOK
			switch {
			case os.IsNotExist(err):
				code = http.StatusNotFound
			case os.IsPermission(err):
				code = http.StatusForbidden
			default:
				code = http.StatusInternalServerError
			}

			http.Error(
				writer,
				http.StatusText(code),
				code)
		}
	}
}
```

**进一步的错误处理**

> 上面的代码，只是处理了能够预见的错误，但是还有一些错误是无法预见的，比如 `panic`，这时候可以使用 `recover` 来捕获错误，然后进行处理

```go
func errWrapper(handler appHandler) func(writer http.ResponseWriter, request *http.Request) {
	return func(writer http.ResponseWriter, request *http.Request) {
		defer func() {
			if r := recover(); r != nil {
				logger.Sugar().Warn("Panic: ", r)
				http.Error(
					writer,
					http.StatusText(http.StatusInternalServerError),
					http.StatusInternalServerError)
			}
		}()

		...省略代码

	}
}
```

**自定义 Error**

> 可以自定义一个 Error 类型，然后实现 `Error() string` 方法, 这也就能让逻辑处理部分，能够自己决定给前端返回什么样的错误信息

```go
// errWrapper 中的逻辑
type userError interface {
	error
	Message() string
}

...

if userErr, ok := err.(userError); ok {
	http.Error(writer, userErr.Message(), http.StatusBadRequest)
	return
}

// 具体业务处理器的逻辑
const prefix = "/list/"

type userError string

func (e userError) Error() string {
	return e.Message()
}

func (e userError) Message() string {
	return string(e)
}

func HandleFileList(writer http.ResponseWriter, request *http.Request) error {
	if strings.Index(
		request.URL.Path, prefix) != 0 {
		return userError("必须以 " + prefix + " 开头")
	}
...

```

## 测试

### 传统测试 vs 表格驱动测试

**传统测试**

- 测试数据和测试逻辑混在一起
- 出错信息不明确
- 一旦一个数据初测，测试全部结束

**表格驱动测试**

- 分离了测试数据和测试逻辑
- 明确出错信息
- 可以部分失败
- go 语言的语法使得更容易实践表格驱动测试



### 单元测试

::: tip 测试详情
- 单独添加一个 `main` 包
- 里面的测试函数以 `Test`开头
- 测试函数的参数为 `*testing.T`
:::

```go
func TestTriangle(t *testing.T) {
	tests := []struct{ a, b, c int }{
		{3, 4, 5},
		{5, 12, 13},
		{8, 15, 17},
		{12, 35, 37},
		{30000, 40000, 50000},
	}
	for _, tt := range tests {
		if actual := calcTriangle(tt.a, tt.b); actual != tt.c { // 测试失败
			t.Errorf("calcTriangle(%d, %d); 结果为: %d, 期望为: %d,",
				tt.a, tt.b, actual, tt.c)
		}
	}
}

```
然后也可以直接在控制台执行 `go test .` 来运行测试
```bash
# 生成测试覆盖率文件
go test -coverprofile="c.out"

# 生成 html 文件,查看测试覆盖率
go tool cover -html "c.out"
```

### 性能测试

::: tip 性能测试
- 以 `Benchmark` 开头
- 参数为 `b *testing.B`
- 测试的次数可以使用 `b.N` 来获取
:::

```go
func BenchmarkTriangle(b *testing.B) {
	s := struct {
		a, b, c int
	}{30000, 40000, 50000}

	for i := 0; i < b.N; i++ {
		actual := calcTriangle(s.a, s.b)
		if actual != s.c {
			b.Errorf("calcTriangle(%d,%d)返回为%d, 期望为: %d", s.a, s.b, actual, s.c)
		}
	}
}
```

```bash
go test -bench .
```

### 使用 pprof 进行性能调优

有一段代码，获取最长无重复子串:

```go
func LengthOfNonRepeatingSubStr(s string) int {
	chs := []rune(s)
	lastIndexMap := make(map[rune]int)
	start := 0
	result := 0

	for i, c := range chs {
		if index, ok := lastIndexMap[c]; ok && index >= start {
			start = index + 1
		}
		lastIndexMap[c] = i
		// 计算最大长度
		curLength := i - start + 1
		if curLength > result {
			result = curLength
		}
	}
	return result
}
```

编写 `benchmark` 后使用 `go test -bench . -cpuprofile cpu.out` 生成 cpu.out 文件

```bash
# 获得操作的命令行
go tool pprof cpu.out

# Entering interactive mode (type "help" for commands, "o" for options)
# 打印 web 可以出现, 但是需要安装 graphviz
# windows 下安装 graphviz
# https://graphviz.org/download/#windows
(pprof) web
```

可以发现耗时的地方是, `rune` 解码，和 `map` 的操作, 由于程序需要支持国际化，所以 `rune` 解码是必须的，那么就需要优化 `map` 的操作, 那么就可以将 `map` 替换为 `[]数组`

```go
func LengthOfNonRepeatingSubStr(s string) int {
	chs := []rune(s)
	lastIndexMap := make([]int, 0xffff)
	for i := range lastIndexMap {
		lastIndexMap[i] = -1
	}
	start := 0
	result := 0

	for i, c := range chs {
		if index := lastIndexMap[c]; index > -1 && index >= start {
			start = index + 1
		}
		lastIndexMap[c] = i
		// 计算最大长度
		curLength := i - start + 1
		if curLength > result {
			result = curLength
		}
	}
	return result
}
```

**性能调优步骤总结**

1. 编写 benchmark
2. `go test -bench . -cpuprofile cpu.out` 获取性能数据
3. `go tool pprof cpu.out` 进行性能分析
4. `web` 查看性能分析结果, 并分析性能瓶颈, 慢在哪里
5. 优化代码, 重新进行性能分析, 重复 `2-4 步骤`
