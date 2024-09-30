// Code generated by protoc-gen-micro. DO NOT EDIT.
// source: level.proto

package level

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

// Api Endpoints for LevelService service

func NewLevelServiceEndpoints() []*api.Endpoint {
	return []*api.Endpoint{}
}

// Client API for LevelService service

type LevelService interface {
	FindLevels(ctx context.Context, in *FindLevelsRequest, opts ...client.CallOption) (*FindLevelsResponse, error)
	FindLevel(ctx context.Context, in *FindLevelRequest, opts ...client.CallOption) (*FindLevelResponse, error)
	AddLevel(ctx context.Context, in *AddLevelRequest, opts ...client.CallOption) (*AddLevelResponse, error)
	ModifyLevel(ctx context.Context, in *ModifyLevelRequest, opts ...client.CallOption) (*ModifyLevelResponse, error)
	DeleteLevel(ctx context.Context, in *DeleteLevelRequest, opts ...client.CallOption) (*DeleteLevelResponse, error)
	DeleteLevels(ctx context.Context, in *DeleteLevelsRequest, opts ...client.CallOption) (*DeleteLevelsResponse, error)
}

type levelService struct {
	c    client.Client
	name string
}

func NewLevelService(name string, c client.Client) LevelService {
	return &levelService{
		c:    c,
		name: name,
	}
}

func (c *levelService) FindLevels(ctx context.Context, in *FindLevelsRequest, opts ...client.CallOption) (*FindLevelsResponse, error) {
	req := c.c.NewRequest(c.name, "LevelService.FindLevels", in)
	out := new(FindLevelsResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *levelService) FindLevel(ctx context.Context, in *FindLevelRequest, opts ...client.CallOption) (*FindLevelResponse, error) {
	req := c.c.NewRequest(c.name, "LevelService.FindLevel", in)
	out := new(FindLevelResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *levelService) AddLevel(ctx context.Context, in *AddLevelRequest, opts ...client.CallOption) (*AddLevelResponse, error) {
	req := c.c.NewRequest(c.name, "LevelService.AddLevel", in)
	out := new(AddLevelResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *levelService) ModifyLevel(ctx context.Context, in *ModifyLevelRequest, opts ...client.CallOption) (*ModifyLevelResponse, error) {
	req := c.c.NewRequest(c.name, "LevelService.ModifyLevel", in)
	out := new(ModifyLevelResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *levelService) DeleteLevel(ctx context.Context, in *DeleteLevelRequest, opts ...client.CallOption) (*DeleteLevelResponse, error) {
	req := c.c.NewRequest(c.name, "LevelService.DeleteLevel", in)
	out := new(DeleteLevelResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *levelService) DeleteLevels(ctx context.Context, in *DeleteLevelsRequest, opts ...client.CallOption) (*DeleteLevelsResponse, error) {
	req := c.c.NewRequest(c.name, "LevelService.DeleteLevels", in)
	out := new(DeleteLevelsResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// Server API for LevelService service

type LevelServiceHandler interface {
	FindLevels(context.Context, *FindLevelsRequest, *FindLevelsResponse) error
	FindLevel(context.Context, *FindLevelRequest, *FindLevelResponse) error
	AddLevel(context.Context, *AddLevelRequest, *AddLevelResponse) error
	ModifyLevel(context.Context, *ModifyLevelRequest, *ModifyLevelResponse) error
	DeleteLevel(context.Context, *DeleteLevelRequest, *DeleteLevelResponse) error
	DeleteLevels(context.Context, *DeleteLevelsRequest, *DeleteLevelsResponse) error
}

func RegisterLevelServiceHandler(s server.Server, hdlr LevelServiceHandler, opts ...server.HandlerOption) error {
	type levelService interface {
		FindLevels(ctx context.Context, in *FindLevelsRequest, out *FindLevelsResponse) error
		FindLevel(ctx context.Context, in *FindLevelRequest, out *FindLevelResponse) error
		AddLevel(ctx context.Context, in *AddLevelRequest, out *AddLevelResponse) error
		ModifyLevel(ctx context.Context, in *ModifyLevelRequest, out *ModifyLevelResponse) error
		DeleteLevel(ctx context.Context, in *DeleteLevelRequest, out *DeleteLevelResponse) error
		DeleteLevels(ctx context.Context, in *DeleteLevelsRequest, out *DeleteLevelsResponse) error
	}
	type LevelService struct {
		levelService
	}
	h := &levelServiceHandler{hdlr}
	return s.Handle(s.NewHandler(&LevelService{h}, opts...))
}

type levelServiceHandler struct {
	LevelServiceHandler
}

func (h *levelServiceHandler) FindLevels(ctx context.Context, in *FindLevelsRequest, out *FindLevelsResponse) error {
	return h.LevelServiceHandler.FindLevels(ctx, in, out)
}

func (h *levelServiceHandler) FindLevel(ctx context.Context, in *FindLevelRequest, out *FindLevelResponse) error {
	return h.LevelServiceHandler.FindLevel(ctx, in, out)
}

func (h *levelServiceHandler) AddLevel(ctx context.Context, in *AddLevelRequest, out *AddLevelResponse) error {
	return h.LevelServiceHandler.AddLevel(ctx, in, out)
}

func (h *levelServiceHandler) ModifyLevel(ctx context.Context, in *ModifyLevelRequest, out *ModifyLevelResponse) error {
	return h.LevelServiceHandler.ModifyLevel(ctx, in, out)
}

func (h *levelServiceHandler) DeleteLevel(ctx context.Context, in *DeleteLevelRequest, out *DeleteLevelResponse) error {
	return h.LevelServiceHandler.DeleteLevel(ctx, in, out)
}

func (h *levelServiceHandler) DeleteLevels(ctx context.Context, in *DeleteLevelsRequest, out *DeleteLevelsResponse) error {
	return h.LevelServiceHandler.DeleteLevels(ctx, in, out)
}
