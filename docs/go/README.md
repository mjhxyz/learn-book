# Go 编程思想

## 结构体

::: tip 结构体特点
- 只有封装，没有继承和多态
- 没有 `class`，只有 `struct`
- 不论`地址`还是结构本身，一律使用 `.` 来访问成员
- 需要显示定义和命名 `方法接收者`
- 值传递，所以只有 `指针接收者` 才可以改变结构内容
- `nil` 也可以调用方法
- `结构过大` 也考虑使用指针接收者
- 如果有指针接收者，最好都是指针接收者
:::

### 定义结构体

```go
type treeNode struct {
  value       int
  left, right *treeNode
}
```

### 定义结构体方法

```go
// 值接收者
func (node treeNode) print() {
  fmt.Println(node.value)
}

// 指针接收者
func (node *treeNode) setValue(value int) {
  node.value = value
}
```

**nil也可以调用方法**

```go
func (node *treeNode) setValue(value int) {
	if node == nil {
		return
	}
	node.value = value
}
```

## 包

::: tip 包特点
- 每个目录一个包
- main包包含可执行入口
- 为结构定义的方法必须 `放在同一个包内`
- 可以是不同的文件
:::

```bash
tree
|-- entry
|   |-- entry.go
|-- node.go
|-- traversal.go
```

上面结构中

- `entry` 包含可执行入口, 包名为 `main`
- `node.go` 和 `traversal.go` 包名为 `tree`
- `node.go` 中定义了 Node 结构体
- `traversal.go` 中定义了 Node 结构体的遍历方法
- `entry` 中使用了 `tree` 包中的结构体和方法

## 扩展已有类型

如何扩充系统类型或者别人的类型

::: tip 扩展已有类型
- 定义别名
- 使用组合
:::

### 组合的方式

> 给别人的类型添加方法, 比如给之前的 `Node` 添加一个后续遍历的能力

```go
type MyTreeNode struct {
	node *tree.Node
}

func (myNode *MyTreeNode) postOrder() {
	if myNode == nil || myNode.node == nil {
		return
	}
	// 左右中
	node := MyTreeNode{myNode.node.Left}
	node.postOrder()
	right := MyTreeNode{myNode.node.Right}
	right.postOrder()
	myNode.node.Print()
}
```

### 定义别名的方式

> 使用 []int 来实现队列的操作

```go
package queue

type Queue []int

func (q *Queue) Push(v int) {
	*q = append(*q, v)
}

func (q *Queue) Pop() int {
	head := (*q)[0]
	*q = (*q)[1:]
	return head
}

func (q *Queue) IsEmpty() bool {
	return len(*q) == 0
}
```

### 使用内嵌的方式

::: tip 内嵌
- 将结构体中，成员的 `名称给省略掉`，就叫做内嵌
- 字段的名字就是最后 . 出来的名字
- 本质上就是语法糖，能省下代码量
- 能直接通过结构体, 访问内部的字段和方法, 将复杂的结构体简化
:::

::: danger 和继承的区别

- 继承中的 `override`，实际上效果类似与 Go 的 `shadowed` 类似
- 如果需要调用内嵌结构体的方法，可以使用 `匿名结构体.方法名` 的方式
- 继承中，可以将子类赋值给父类，但是内嵌结构体不行
:::

```go
type MyTreeNode struct {
	*tree.Node // Embeding
}

func (myNode *MyTreeNode) postOrder() {
	if myNode == nil || myNode.Node == nil {
		return
	}
	// 左右中
	node := MyTreeNode{myNode.Left}
	node.postOrder()
	right := MyTreeNode{myNode.Right}
	right.postOrder()
	myNode.Print()
}

func main() {
	// 创建结构体的几种方式
	root := MyTreeNode{&tree.Node{Value: 3}}
	root.Left = &tree.Node{}
	root.Right = &tree.Node{5, nil, nil}
	root.Right.Left = new(tree.Node)
	root.Left.Right = tree.CreateNode(2)
	root.Right.Left.SetValue(4)
	root.Traverse()
	root.postOrder()
}
```

## GO 语言的依赖管理

### 包搜索路径

1. 当前包下的 `vendor` 目录
2. 在 `GOROOT` 的 `src` 目录下查找
3. 在 `GOPATH` 的 `src` 目录下查找

### GO mod

::: tip GO mod
- 由 go 命令统一管理，用户不必关心依赖包的存放位置
- 初始化: `go mod init`
- 增加依赖: `go get`
- 更新依赖: `go get [@v...], go mod tidy`
:::

逐步淘汰了 `GOPATH` 和 `GOVENDOR` 的方式

**拉取依赖**

```bash
go get -u go.uber.org/zap
```

拉取后，go.mod 添加了一个 require

```go.mod
require (
	go.uber.org/multierr v1.11.0 // indirect
	go.uber.org/zap v1.25.0 // indirect
)
```

如果有的时候，下载了但是不能使用，重启一下编辑器试试

```bash
# 清洁没用用到的版本
go mod tidy
```

**迁移项目到 go mode**
```bash
# 能创建 go.mod
go mod init modtest
# 下载依赖
go build ./...
```