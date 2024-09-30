// Code generated by protoc-gen-micro. DO NOT EDIT.
// source: backup.proto

package backup

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

// Api Endpoints for BackupService service

func NewBackupServiceEndpoints() []*api.Endpoint {
	return []*api.Endpoint{}
}

// Client API for BackupService service

type BackupService interface {
	FindBackups(ctx context.Context, in *FindBackupsRequest, opts ...client.CallOption) (*FindBackupsResponse, error)
	FindBackup(ctx context.Context, in *FindBackupRequest, opts ...client.CallOption) (*FindBackupResponse, error)
	AddBackup(ctx context.Context, in *AddBackupRequest, opts ...client.CallOption) (*AddBackupResponse, error)
	HardDeleteBackups(ctx context.Context, in *HardDeleteBackupsRequest, opts ...client.CallOption) (*DeleteResponse, error)
}

type backupService struct {
	c    client.Client
	name string
}

func NewBackupService(name string, c client.Client) BackupService {
	return &backupService{
		c:    c,
		name: name,
	}
}

func (c *backupService) FindBackups(ctx context.Context, in *FindBackupsRequest, opts ...client.CallOption) (*FindBackupsResponse, error) {
	req := c.c.NewRequest(c.name, "BackupService.FindBackups", in)
	out := new(FindBackupsResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *backupService) FindBackup(ctx context.Context, in *FindBackupRequest, opts ...client.CallOption) (*FindBackupResponse, error) {
	req := c.c.NewRequest(c.name, "BackupService.FindBackup", in)
	out := new(FindBackupResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *backupService) AddBackup(ctx context.Context, in *AddBackupRequest, opts ...client.CallOption) (*AddBackupResponse, error) {
	req := c.c.NewRequest(c.name, "BackupService.AddBackup", in)
	out := new(AddBackupResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *backupService) HardDeleteBackups(ctx context.Context, in *HardDeleteBackupsRequest, opts ...client.CallOption) (*DeleteResponse, error) {
	req := c.c.NewRequest(c.name, "BackupService.HardDeleteBackups", in)
	out := new(DeleteResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// Server API for BackupService service

type BackupServiceHandler interface {
	FindBackups(context.Context, *FindBackupsRequest, *FindBackupsResponse) error
	FindBackup(context.Context, *FindBackupRequest, *FindBackupResponse) error
	AddBackup(context.Context, *AddBackupRequest, *AddBackupResponse) error
	HardDeleteBackups(context.Context, *HardDeleteBackupsRequest, *DeleteResponse) error
}

func RegisterBackupServiceHandler(s server.Server, hdlr BackupServiceHandler, opts ...server.HandlerOption) error {
	type backupService interface {
		FindBackups(ctx context.Context, in *FindBackupsRequest, out *FindBackupsResponse) error
		FindBackup(ctx context.Context, in *FindBackupRequest, out *FindBackupResponse) error
		AddBackup(ctx context.Context, in *AddBackupRequest, out *AddBackupResponse) error
		HardDeleteBackups(ctx context.Context, in *HardDeleteBackupsRequest, out *DeleteResponse) error
	}
	type BackupService struct {
		backupService
	}
	h := &backupServiceHandler{hdlr}
	return s.Handle(s.NewHandler(&BackupService{h}, opts...))
}

type backupServiceHandler struct {
	BackupServiceHandler
}

func (h *backupServiceHandler) FindBackups(ctx context.Context, in *FindBackupsRequest, out *FindBackupsResponse) error {
	return h.BackupServiceHandler.FindBackups(ctx, in, out)
}

func (h *backupServiceHandler) FindBackup(ctx context.Context, in *FindBackupRequest, out *FindBackupResponse) error {
	return h.BackupServiceHandler.FindBackup(ctx, in, out)
}

func (h *backupServiceHandler) AddBackup(ctx context.Context, in *AddBackupRequest, out *AddBackupResponse) error {
	return h.BackupServiceHandler.AddBackup(ctx, in, out)
}

func (h *backupServiceHandler) HardDeleteBackups(ctx context.Context, in *HardDeleteBackupsRequest, out *DeleteResponse) error {
	return h.BackupServiceHandler.HardDeleteBackups(ctx, in, out)
}
