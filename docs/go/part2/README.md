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
