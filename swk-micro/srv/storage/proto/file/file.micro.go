// Code generated by protoc-gen-micro. DO NOT EDIT.
// source: file.proto

package file

import (
	fmt "fmt"
	proto "github.com/golang/protobuf/proto"
	math "math"
)

import (
	context "context"
	api "github.com/micro/go-micro/v2/api"
	client "github.com/micro/go-micro/v2/client"
	server "github.com/micro/go-micro/v2/server"
)

// Reference imports to suppress errors if they are not otherwise used.
var _ = proto.Marshal
var _ = fmt.Errorf
var _ = math.Inf

// This is a compile-time assertion to ensure that this generated file
// is compatible with the proto package it is being compiled against.
// A compilation error at this line likely means your copy of the
// proto package needs to be updated.
const _ = proto.ProtoPackageIsVersion3 // please upgrade the proto package

// Reference imports to suppress errors if they are not otherwise used.
var _ api.Endpoint
var _ context.Context
var _ client.Option
var _ server.Option

// Api Endpoints for FileService service

func NewFileServiceEndpoints() []*api.Endpoint {
	return []*api.Endpoint{}
}

// Client API for FileService service

type FileService interface {
	// 查找多个文件
	FindFiles(ctx context.Context, in *FindFilesRequest, opts ...client.CallOption) (*FindFilesResponse, error)
	// 查找单个文件
	FindFile(ctx context.Context, in *FindFileRequest, opts ...client.CallOption) (*FindFileResponse, error)
	// 添加单个文件
	AddFile(ctx context.Context, in *AddRequest, opts ...client.CallOption) (*AddResponse, error)
	// 删除单个文件
	DeleteFile(ctx context.Context, in *DeleteRequest, opts ...client.CallOption) (*DeleteResponse, error)
	// 删除多个文件
	DeleteSelectFiles(ctx context.Context, in *DeleteSelectFilesRequest, opts ...client.CallOption) (*DeleteResponse, error)
	// 物理删除单个文件
	HardDeleteFile(ctx context.Context, in *HardDeleteRequest, opts ...client.CallOption) (*DeleteResponse, error)
	// 物理删除多个文件
	HardDeleteFiles(ctx context.Context, in *HardDeleteFilesRequest, opts ...client.CallOption) (*DeleteResponse, error)
	// 删除文件夹文件
	DeleteFolderFile(ctx context.Context, in *DeleteFolderRequest, opts ...client.CallOption) (*DeleteResponse, error)
	// 恢复选中文件
	RecoverSelectFiles(ctx context.Context, in *RecoverSelectFilesRequest, opts ...client.CallOption) (*RecoverSelectFilesResponse, error)
	// 恢复文件夹文件
	RecoverFolderFiles(ctx context.Context, in *RecoverFolderFilesRequest, opts ...client.CallOption) (*RecoverFolderFilesResponse, error)
}

type fileService struct {
	c    client.Client
	name string
}

func NewFileService(name string, c client.Client) FileService {
	return &fileService{
		c:    c,
		name: name,
	}
}

func (c *fileService) FindFiles(ctx context.Context, in *FindFilesRequest, opts ...client.CallOption) (*FindFilesResponse, error) {
	req := c.c.NewRequest(c.name, "FileService.FindFiles", in)
	out := new(FindFilesResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *fileService) FindFile(ctx context.Context, in *FindFileRequest, opts ...client.CallOption) (*FindFileResponse, error) {
	req := c.c.NewRequest(c.name, "FileService.FindFile", in)
	out := new(FindFileResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *fileService) AddFile(ctx context.Context, in *AddRequest, opts ...client.CallOption) (*AddResponse, error) {
	req := c.c.NewRequest(c.name, "FileService.AddFile", in)
	out := new(AddResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *fileService) DeleteFile(ctx context.Context, in *DeleteRequest, opts ...client.CallOption) (*DeleteResponse, error) {
	req := c.c.NewRequest(c.name, "FileService.DeleteFile", in)
	out := new(DeleteResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *fileService) DeleteSelectFiles(ctx context.Context, in *DeleteSelectFilesRequest, opts ...client.CallOption) (*DeleteResponse, error) {
	req := c.c.NewRequest(c.name, "FileService.DeleteSelectFiles", in)
	out := new(DeleteResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *fileService) HardDeleteFile(ctx context.Context, in *HardDeleteRequest, opts ...client.CallOption) (*DeleteResponse, error) {
	req := c.c.NewRequest(c.name, "FileService.HardDeleteFile", in)
	out := new(DeleteResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *fileService) HardDeleteFiles(ctx context.Context, in *HardDeleteFilesRequest, opts ...client.CallOption) (*DeleteResponse, error) {
	req := c.c.NewRequest(c.name, "FileService.HardDeleteFiles", in)
	out := new(DeleteResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *fileService) DeleteFolderFile(ctx context.Context, in *DeleteFolderRequest, opts ...client.CallOption) (*DeleteResponse, error) {
	req := c.c.NewRequest(c.name, "FileService.DeleteFolderFile", in)
	out := new(DeleteResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *fileService) RecoverSelectFiles(ctx context.Context, in *RecoverSelectFilesRequest, opts ...client.CallOption) (*RecoverSelectFilesResponse, error) {
	req := c.c.NewRequest(c.name, "FileService.RecoverSelectFiles", in)
	out := new(RecoverSelectFilesResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *fileService) RecoverFolderFiles(ctx context.Context, in *RecoverFolderFilesRequest, opts ...client.CallOption) (*RecoverFolderFilesResponse, error) {
	req := c.c.NewRequest(c.name, "FileService.RecoverFolderFiles", in)
	out := new(RecoverFolderFilesResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// Server API for FileService service

type FileServiceHandler interface {
	// 查找多个文件
	FindFiles(context.Context, *FindFilesRequest, *FindFilesResponse) error
	// 查找单个文件
	FindFile(context.Context, *FindFileRequest, *FindFileResponse) error
	// 添加单个文件
	AddFile(context.Context, *AddRequest, *AddResponse) error
	// 删除单个文件
	DeleteFile(context.Context, *DeleteRequest, *DeleteResponse) error
	// 删除多个文件
	DeleteSelectFiles(context.Context, *DeleteSelectFilesRequest, *DeleteResponse) error
	// 物理删除单个文件
	HardDeleteFile(context.Context, *HardDeleteRequest, *DeleteResponse) error
	// 物理删除多个文件
	HardDeleteFiles(context.Context, *HardDeleteFilesRequest, *DeleteResponse) error
	// 删除文件夹文件
	DeleteFolderFile(context.Context, *DeleteFolderRequest, *DeleteResponse) error
	// 恢复选中文件
	RecoverSelectFiles(context.Context, *RecoverSelectFilesRequest, *RecoverSelectFilesResponse) error
	// 恢复文件夹文件
	RecoverFolderFiles(context.Context, *RecoverFolderFilesRequest, *RecoverFolderFilesResponse) error
}

func RegisterFileServiceHandler(s server.Server, hdlr FileServiceHandler, opts ...server.HandlerOption) error {
	type fileService interface {
		FindFiles(ctx context.Context, in *FindFilesRequest, out *FindFilesResponse) error
		FindFile(ctx context.Context, in *FindFileRequest, out *FindFileResponse) error
		AddFile(ctx context.Context, in *AddRequest, out *AddResponse) error
		DeleteFile(ctx context.Context, in *DeleteRequest, out *DeleteResponse) error
		DeleteSelectFiles(ctx context.Context, in *DeleteSelectFilesRequest, out *DeleteResponse) error
		HardDeleteFile(ctx context.Context, in *HardDeleteRequest, out *DeleteResponse) error
		HardDeleteFiles(ctx context.Context, in *HardDeleteFilesRequest, out *DeleteResponse) error
		DeleteFolderFile(ctx context.Context, in *DeleteFolderRequest, out *DeleteResponse) error
		RecoverSelectFiles(ctx context.Context, in *RecoverSelectFilesRequest, out *RecoverSelectFilesResponse) error
		RecoverFolderFiles(ctx context.Context, in *RecoverFolderFilesRequest, out *RecoverFolderFilesResponse) error
	}
	type FileService struct {
		fileService
	}
	h := &fileServiceHandler{hdlr}
	return s.Handle(s.NewHandler(&FileService{h}, opts...))
}

type fileServiceHandler struct {
	FileServiceHandler
}

func (h *fileServiceHandler) FindFiles(ctx context.Context, in *FindFilesRequest, out *FindFilesResponse) error {
	return h.FileServiceHandler.FindFiles(ctx, in, out)
}

func (h *fileServiceHandler) FindFile(ctx context.Context, in *FindFileRequest, out *FindFileResponse) error {
	return h.FileServiceHandler.FindFile(ctx, in, out)
}

func (h *fileServiceHandler) AddFile(ctx context.Context, in *AddRequest, out *AddResponse) error {
	return h.FileServiceHandler.AddFile(ctx, in, out)
}

func (h *fileServiceHandler) DeleteFile(ctx context.Context, in *DeleteRequest, out *DeleteResponse) error {
	return h.FileServiceHandler.DeleteFile(ctx, in, out)
}

func (h *fileServiceHandler) DeleteSelectFiles(ctx context.Context, in *DeleteSelectFilesRequest, out *DeleteResponse) error {
	return h.FileServiceHandler.DeleteSelectFiles(ctx, in, out)
}

func (h *fileServiceHandler) HardDeleteFile(ctx context.Context, in *HardDeleteRequest, out *DeleteResponse) error {
	return h.FileServiceHandler.HardDeleteFile(ctx, in, out)
}

func (h *fileServiceHandler) HardDeleteFiles(ctx context.Context, in *HardDeleteFilesRequest, out *DeleteResponse) error {
	return h.FileServiceHandler.HardDeleteFiles(ctx, in, out)
}

func (h *fileServiceHandler) DeleteFolderFile(ctx context.Context, in *DeleteFolderRequest, out *DeleteResponse) error {
	return h.FileServiceHandler.DeleteFolderFile(ctx, in, out)
}

func (h *fileServiceHandler) RecoverSelectFiles(ctx context.Context, in *RecoverSelectFilesRequest, out *RecoverSelectFilesResponse) error {
	return h.FileServiceHandler.RecoverSelectFiles(ctx, in, out)
}

func (h *fileServiceHandler) RecoverFolderFiles(ctx context.Context, in *RecoverFolderFilesRequest, out *RecoverFolderFilesResponse) error {
	return h.FileServiceHandler.RecoverFolderFiles(ctx, in, out)
}
