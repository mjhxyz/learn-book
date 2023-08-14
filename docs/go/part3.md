# Go 并发编程

## 协程

::: tip 协程

- 轻量级的 `线程`
- `非抢占式` 多任务处理, 由协程主动交出控制权
- **goroutine现在可以被异步抢占。因此没有函数调用的循环不再对调度器造成死锁或造成垃圾回收的大幅变慢**
- 编译器/解释器/虚拟机层面的多任务
- 多个线程可能在一个或者多个线程上运行
- 子程序是协程的一个特例

:::

- 下面的代码 `Go1.13下` 会出现死锁，`Go1.14` 修复了这个问题
- 也可以通过手动调用 `runtime.Gosched()` 来交出控制权
- 还有一个点就是，下面的匿名函数一定要传一个参数进去，不然会出现 `index out of range` 的错误
- 因为 `i` 是一个变量，当 `for` 循环结束的时候，`i` 的值是 `10`，所以会出现 `index out of range` 的错误
- 可以通过 `go run -race main.go` 来检查是否有 `race condition(数据访问冲突)` 的问题


```go
func main() {
	var a [10]int
	for i := 0; i < 10; i++ {
		go func(i int) {
			for {
				//fmt.Printf("Hello from goroutine %d\n", i)
				a[i]++
				// 交出控制权
				// runtime.Gosched()
			}
		}(i)
	}
	time.Sleep(time.Millisecond)
	fmt.Println(a)
}
```

**Go 的协程**

- 任何函数只需要加上 `go` 就能送给调度器运行
- 不需要再定义时区分是否为异步函数
- 调度器再合适的点进行切换

**goroutine可能的切换点**

- I/O, select
- channel
- 等待锁
- 函数调用(有时)
- runtime.Gosched()

## Channel

::: tip Channel
- `channel` 是 `goroutine` 之间的通道

:::

### 基本使用

```go
func worker(id int, c chan int) {
	for {
		//n := <-c // 从 channel 拿出数据
		fmt.Printf("Worker %d 收到了 %c\n", id, <-c)
	}
}

func channelDemo() {
	// chan of int => 是一个 channel 里面的内容是 int
	//var c chan int // c == nil 不能直接用

	//c := make(chan int)       // 这里的 channel 才可以直接用了
	var channels [10]chan int // 10 个 channel

	for i := 0; i < 10; i++ { // 启动 10 个 Wroker
		// 启动 10 个 worker 并且分发所有的 channel
		channels[i] = make(chan int)
		go worker(i, channels[i])
	}

	for i := 0; i < 10; i++ {
		// 如果发送了一个数据，但是没有其他的协程接收,会死锁的
		channels[i] <- 'a' + i // 向 channel 发送数据
	}
	for i := 0; i < 10; i++ {
		channels[i] <- 'A' + i
	}
	time.Sleep(time.Millisecond)
}
```

### channel的方向

- `chan<- int` 只能往 `channel` 里面`写`数据
- `<-chan int` 只能从 `channel` 里面`读`数据

```go
func createWorker(id int) chan<- int {
	...
}
```

### buffered channel

::: tip buffered channel
- 具有`缓冲区`的 channel
:::


```go
func bufferedChannel() {
	// 设置 channel 的缓冲区大小为 3
	c := make(chan int, 3)
	// 发送三个后，不会切换
	c <- 1
	c <- 2
	c <- 3
	// 发送第四个的时候，才会死锁
	c <- 4
}
```

### channel的关闭

::: tip channel的关闭
- 如果数据有一个明确的结尾，那么可以将 channel 关闭
- 永远是 `发送方` 来关闭 channel 的, 通知接收方没有数据要发送
- 如果发送方关闭了 channel，接收方还在接收，会接收到 channel 的零值, 所以接收方需要特殊处理
:::

```go
// 关闭 channel
func channelClose() {
	// 设置 channel 的缓冲区大小为 3
	c := make(chan int, 3)
	go worker(0, c)
	c <- 'a'
	c <- 'b'
	c <- 'c'
	c <- 'd'
	close(c)
	time.Sleep(time.Millisecond)
}

func worker(id int, c chan int) {
	// 判断 channel 被关闭方法1
	for n := range c { // 等待 c 发送完毕被关闭
		fmt.Printf("Worker %d 收到了 %c\n", id, n)
	}

	// 判断 channel 被关闭方法2
	//for {
	//	//n := <-c // 从 channel 拿出数据
	//	n, ok := <-c // ok: 是否还有值
	//	if !ok {
	//		break
	//	}
	//	fmt.Printf("Worker %d 收到了 %c\n", id, n)
	//}
}
```

### 使用 channel 等待任务结束

**只使用 channel**

```go

func doWorker(id int, w worker) {
	// 判断 channel 被关闭方法2
	for n := range w.in { // 等待 c 发送完毕被关闭
		fmt.Printf("Worker %d 收到了 %c\n", id, n)
		go func() {
			// 开一个新的协程，防止出现死锁
			w.done <- true // 通知外面事情做完了
		}()
	}
}

func createWorker(id int) worker {
	w := worker{
		in:   make(chan int),
		done: make(chan bool),
	}
	go doWorker(id, w)
	return w
}

type worker struct {
	in   chan int
	done chan bool
}

func channelDemo() {
	var workers [10]worker

	for i, _ := range workers { // 启动 10 个 Wroker
		workers[i] = createWorker(i)
	}

	for i, worker := range workers {
		worker.in <- 'a' + i // 向 channel 发送任务数据
	}
	for i, worker := range workers {
		worker.in <- 'A' + i
	}

	// 等待所有协程任务结束
	for _, worker := range workers {
		<-worker.done
		<-worker.done
	}
}
```

**WaitGroup**

::: tip WaitGroup
- `WaitGroup` 用来等待一组 `goroutine` 结束
- `WaitGroup` 是一个计数器，`Add` 方法用来添加计数(表示添加了一个 `goroutine`)
- `Done` 方法用来减少计数(表示一个 `goroutine` 已经结束了)
- `Wait` 方法表示等待所有的 `goroutine` 结束
:::


```go
func doWorker(id int, w worker) {
	// 判断 channel 被关闭方法2
	for n := range w.in { // 等待 c 发送完毕被关闭
		fmt.Printf("Worker %d 收到了 %c\n", id, n)
		w.done()
	}
}

func createWorker(id int, wg *sync.WaitGroup) worker {
	w := worker{
		in: make(chan int),
		done: func() {
			wg.Done()
		},
	}
	go doWorker(id, w)
	return w
}

type worker struct {
	in   chan int
	done func()
}

func channelDemo() {
	var workers [10]worker
	var wg sync.WaitGroup

	for i, _ := range workers {
		workers[i] = createWorker(i, &wg)
	}

	wg.Add(20) // 添加 20 个任务
	for i, worker := range workers {
		worker.in <- 'a' + i // 向 channel 发送任务数据
	}
	for i, worker := range workers {
		worker.in <- 'A' + i
	}
	wg.Wait() // 等待 20 个任务做完
}
```

## Select

### CSP 模型

::: tip Select 主要一下操作
- 用于 `同时` 在多个 `channel` 上等待数据
- 如果添加 `default` 实际上就是 `非阻塞` 从 channel 获取值
- `select` 会随机选择一个可用通用做收发操作
- 如果没有 `case` 可用，它将阻塞，直到有 `case` 可用
- 如果有多个 `case` 都可以运行，`select` 会随机选择一个执行
- 可以使用 `time.After` 来避免永久阻塞，设置超时时间
- 可以使用 `time.Tick` 来设置间隔时间, 每隔一段时间收到数据
- 在 `select` 中使用 nil channel, 当数据准备好的时候，将 nil channel 替换为真实的 channel
:::


```go
func generator() chan int {
	out := make(chan int)
	go func() {
		i := 0
		for {
			time.Sleep(time.Duration(rand.Intn(1500)) * time.Millisecond)
			out <- i
			i++
		}
	}()
	return out
}
func worker(id int, c chan int) {
	for n := range c { // 等待 c 发送完毕被关闭
		time.Sleep(time.Second)
		fmt.Printf("Worker %d 收到了 %d\n", id, n)
	}
}

func createWorker(id int) chan<- int {
	c := make(chan int)
	go worker(id, c)
	return c
}

func main() {
	c1, c2 := generator(), generator()
	var worker = createWorker(0)

	var values []int                   // 队列存储结果, 防止结果被覆盖掉
	tm := time.After(10 * time.Second) // 10s 后会往这个 channel 送一个时间, 整体的时间
	tick := time.Tick(time.Second)     //定时器，每隔指定时间，都会送值来

	for {
		var activateWorker chan<- int
		var activateValue int
		if len(values) > 0 {
			activateWorker = worker
			activateValue = values[0]
		}

		// 加上 default 类似于非阻塞的逻辑
		select {
		case n := <-c1:
			values = append(values, n)
		case n := <-c2:
			values = append(values, n)
		case activateWorker <- activateValue: // 如果 activateWorker 是 nil, 则不会到这里
			values = values[1:]
		case <-time.After(800 * time.Millisecond): // 每次 select 花的时间
			fmt.Println("获取超时了!!!")
		case <-tick: // 定时器，每隔一段时间就会有值
			// 但是会和上面的 800ms 超时的重叠，导致不太好达到超时的情况
			fmt.Println("队列长度为:", len(values))
		case <-tm: // 这里是从程序运行开始计算的时间
			fmt.Println("时间到了, 结束")
			return
		}
	}
}
```

### 传统的同步机制

- `WaitGroup`
- `Mutex`
- `Cond`

**原子整数**

- 使用 `sync.Mutex` 来保证原子性
- 如果想对某个 `代码块` 进行原子性保护，可以使用 `sync.Mutex` 配合 `匿名函数` 来保证

```go
type AtomicInt struct {
	value int
	lock  sync.Mutex
}

func (a *AtomicInt) inc() {
	a.lock.Lock()
	defer a.lock.Unlock()
	a.value++
}

func (a *AtomicInt) get() int {
	a.lock.Lock()
	defer a.lock.Lock()
	return a.value
}
```

## 并发模式

::: tip 并发模式
- 生成器
- 可以当作服务或者任务
:::

### 生成器

```go
// 生成消息的生成器
func msgGen(name string) chan string {
	c := make(chan string)
	go func() {
		i := 0
		for {
			time.Sleep(time.Duration(rand.Intn(2000)) * time.Millisecond)
			c <- fmt.Sprintf("服务 %s: 消息 %d", name, i)
			i++
		}
	}()
	return c
}

func main() {
	m1 := msgGen("service1")
	m2 := msgGen("service2")
	for {
		fmt.Println(<-m1)
		fmt.Println(<-m2)
	}
}
```

但是上面的代码实际上是`交替继续`，而不是`并发`的, 因此还能继续优化,同时等待多个服务, 两种方案:

#### fanIn

> 将多个 channel `合并` 成一个 channel

**基本实现**

- 适合于 `channel` 的个数不知道的情况
- 注意这里有个坑，就是 go 闭包的问题，需要传一个参数进去，不然会出现开的每一个协程都是 `同一个` channel 的问题

```go
func fanIn(chs ...chan string) chan string {
	c := make(chan string)
	// 创建多个 goroutine, 分别从不同的 channel 中获取数据
	for _, ch := range chs {
		go func(ch chan string) {
			for {
				c <- <-ch
			}
		}(ch)
	}
	return c
}
```

**通过select实现**

使用 `select` 可以实现 `fanIn` 的功能, 优点:

1. 不管多少个 `channel`, 只需要一个 `goroutine`
2. 代码更加简洁

```go
func fanInBySelect(c1, c2 chan string) chan string {
	c := make(chan string)
	go func() {
		for {
			select {
			case c <- <-c1:
			case c <- <-c2:
			}
		}
	}()
	return c
}
```
