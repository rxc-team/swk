function build_mac() {
    # 清空文件夹
    rm -rf build/darwin
    # 创建编译文件夹
    mkdir -p build/darwin
    # 复制文件到编译文件夹
    cp -r config.env build/darwin/config.env
    # 编译代码成可执行文件
    GOOS=darwin GOARCH=amd64 CGO_ENABLED=0 go build -o build/darwin/tool ./main.go
}
function build_window64() {
    # 清空文件夹
    rm -rf build/windows_x64
    # 创建编译文件夹
    mkdir -p build/windows_x64
    # 复制文件到编译文件夹
    cp -r config.env build/windows_x64/config.env
    # 编译代码成可执行文件
    GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build -o build/windows_x64/tool.exe ./main.go
}
function build_window32() {
    # 清空文件夹
    rm -rf build/windows_x86
    # 创建编译文件夹
    mkdir -p build/windows_x86
    # 复制文件到编译文件夹
    cp -r config.env build/windows_x86/config.env
    # 编译代码成可执行文件
    GOOS=windows GOARCH=386 CGO_ENABLED=0 go build -o build/windows_x86/tool.exe ./main.go
}

# build_mac
build_window64
