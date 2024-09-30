# PIT3微服务程序

## 本地环境搭建
1. 下载最新的源代码，编译打包成docker镜像   
2. 测试

## 环境配置
1. 安装`go`语言sdk
2. 安装`consul`服务发现
下载对应版本的consul，安装到本地
3. 编译`micro`服务
```bash
go get -u github.com/micro/micro
go install github.com/micro/micro
```
4. 编译`Protobuf`的工具
```bash
# install protoc-gen-go
go get -u github.com/golang/protobuf/{proto,protoc-gen-go}
go install github.com/golang/protobuf/{proto,protoc-gen-go}

# install protoc-gen-micro
go get -u github.com/micro/protoc-gen-micro
go install github.com/micro/protoc-gen-micro
```


## DB服务安装（docker版本）
1. 安装docker桌面版本
2. 通过docker-compose安装db
```bash
 # 克隆
 git clone https://github.com/rxc-team/docker.git docker
 # 进入docker目录
 cd docker
 # 启动服务
 docker-compose up -d
 # 停止并删除服务
 docker-compose down
```
## 下载最新的代码，进行启动
>服务端代码（go）
### 前提：
1. go版本1.12.x(最合适的1.12.9)
2. 设置环境变量`GO111MODULE=on`（在国内需要设置代理 `GOPROXY=https://goproxy.io` ）
3. 将代码放在gopath->src文件中(当然也可以不放在gopath中)

### 下载最新的代码：
1. 创建`rxcsoft.cn`文件夹
2. 进入该文件夹
```bash
 # 进入工作目录
 cd rxcsoft.cn
 # 从GitHub克隆代码
 git clone https://github.com/rxc-team/pit3-micro.git pit3
 git clone https://github.com/rxc-team/pit3-utils.git utils
```

### 修改go.mod文件中的部分本地路径
1. 使用`vs-code`打开`rxcsoft.cn`目录
2. 全部替换`E:/Develops/09.micro/rxcsoft.cn`为上一步`rxcsoft.cn`所在路径

### 获取依赖
1. 下载utils使用的第三方lib
```bash
 # 进入utils项目路径
 cd utils
 # 获取第三方lib文件
 go get
 # 将第三方lib放入vendor文件夹
 go mod vendor
```
2. 下载api使用的第三方lib(以internal为例)
```bash
 # 进入micro项目路径
 cd pit3/api/internal
 # 获取第三方lib文件
 go get
 # 将第三方lib放入vendor文件夹
 go mod vendor
 ##############################################
 ####修改config.env文件和db-config.json文件####
 ##############################################
```
3. 下载srv使用的第三方lib(以manage为例)
```bash
 # 进入micro项目路径
 cd pit3/srv/manage
 # 获取第三方lib文件
 go get
 # 将第三方lib放入vendor文件夹
 go mod vendor
 ##############################################
 ####修改db-config.json文件####
 ##############################################
```

## 测试启动
以window为例，直接双击`bin/start.bat`文件启动服务