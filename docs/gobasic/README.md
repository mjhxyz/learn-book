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

- bool, string
- (u)int, (u)int8, (u)int16, (u)int32, (u)int64, unintptr
- byte, rune(字符int32)
- float32, float64, complex64, complex128


### 常量&枚举


### 条件语句

### 循环

### 函数

### 指针

### 内建容器

### 字符串


