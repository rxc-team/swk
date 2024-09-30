// Code generated by protoc-gen-micro. DO NOT EDIT.
// source: question.proto

package question

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

// Api Endpoints for QuestionService service

func NewQuestionServiceEndpoints() []*api.Endpoint {
	return []*api.Endpoint{}
}

// Client API for QuestionService service

type QuestionService interface {
	// 查找单个問題
	FindQuestion(ctx context.Context, in *FindQuestionRequest, opts ...client.CallOption) (*FindQuestionResponse, error)
	// 查找多个問題
	FindQuestions(ctx context.Context, in *FindQuestionsRequest, opts ...client.CallOption) (*FindQuestionsResponse, error)
	// 添加問題
	AddQuestion(ctx context.Context, in *AddQuestionRequest, opts ...client.CallOption) (*AddQuestionResponse, error)
	// 编辑問題
	ModifyQuestion(ctx context.Context, in *ModifyQuestionRequest, opts ...client.CallOption) (*ModifyQuestionResponse, error)
	// 硬删除单个問題
	DeleteQuestion(ctx context.Context, in *DeleteQuestionRequest, opts ...client.CallOption) (*DeleteQuestionResponse, error)
	// 硬删除多个問題
	DeleteQuestions(ctx context.Context, in *DeleteQuestionsRequest, opts ...client.CallOption) (*DeleteQuestionsResponse, error)
}

type questionService struct {
	c    client.Client
	name string
}

func NewQuestionService(name string, c client.Client) QuestionService {
	return &questionService{
		c:    c,
		name: name,
	}
}

func (c *questionService) FindQuestion(ctx context.Context, in *FindQuestionRequest, opts ...client.CallOption) (*FindQuestionResponse, error) {
	req := c.c.NewRequest(c.name, "QuestionService.FindQuestion", in)
	out := new(FindQuestionResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *questionService) FindQuestions(ctx context.Context, in *FindQuestionsRequest, opts ...client.CallOption) (*FindQuestionsResponse, error) {
	req := c.c.NewRequest(c.name, "QuestionService.FindQuestions", in)
	out := new(FindQuestionsResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *questionService) AddQuestion(ctx context.Context, in *AddQuestionRequest, opts ...client.CallOption) (*AddQuestionResponse, error) {
	req := c.c.NewRequest(c.name, "QuestionService.AddQuestion", in)
	out := new(AddQuestionResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *questionService) ModifyQuestion(ctx context.Context, in *ModifyQuestionRequest, opts ...client.CallOption) (*ModifyQuestionResponse, error) {
	req := c.c.NewRequest(c.name, "QuestionService.ModifyQuestion", in)
	out := new(ModifyQuestionResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *questionService) DeleteQuestion(ctx context.Context, in *DeleteQuestionRequest, opts ...client.CallOption) (*DeleteQuestionResponse, error) {
	req := c.c.NewRequest(c.name, "QuestionService.DeleteQuestion", in)
	out := new(DeleteQuestionResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *questionService) DeleteQuestions(ctx context.Context, in *DeleteQuestionsRequest, opts ...client.CallOption) (*DeleteQuestionsResponse, error) {
	req := c.c.NewRequest(c.name, "QuestionService.DeleteQuestions", in)
	out := new(DeleteQuestionsResponse)
	err := c.c.Call(ctx, req, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// Server API for QuestionService service

type QuestionServiceHandler interface {
	// 查找单个問題
	FindQuestion(context.Context, *FindQuestionRequest, *FindQuestionResponse) error
	// 查找多个問題
	FindQuestions(context.Context, *FindQuestionsRequest, *FindQuestionsResponse) error
	// 添加問題
	AddQuestion(context.Context, *AddQuestionRequest, *AddQuestionResponse) error
	// 编辑問題
	ModifyQuestion(context.Context, *ModifyQuestionRequest, *ModifyQuestionResponse) error
	// 硬删除单个問題
	DeleteQuestion(context.Context, *DeleteQuestionRequest, *DeleteQuestionResponse) error
	// 硬删除多个問題
	DeleteQuestions(context.Context, *DeleteQuestionsRequest, *DeleteQuestionsResponse) error
}

func RegisterQuestionServiceHandler(s server.Server, hdlr QuestionServiceHandler, opts ...server.HandlerOption) error {
	type questionService interface {
		FindQuestion(ctx context.Context, in *FindQuestionRequest, out *FindQuestionResponse) error
		FindQuestions(ctx context.Context, in *FindQuestionsRequest, out *FindQuestionsResponse) error
		AddQuestion(ctx context.Context, in *AddQuestionRequest, out *AddQuestionResponse) error
		ModifyQuestion(ctx context.Context, in *ModifyQuestionRequest, out *ModifyQuestionResponse) error
		DeleteQuestion(ctx context.Context, in *DeleteQuestionRequest, out *DeleteQuestionResponse) error
		DeleteQuestions(ctx context.Context, in *DeleteQuestionsRequest, out *DeleteQuestionsResponse) error
	}
	type QuestionService struct {
		questionService
	}
	h := &questionServiceHandler{hdlr}
	return s.Handle(s.NewHandler(&QuestionService{h}, opts...))
}

type questionServiceHandler struct {
	QuestionServiceHandler
}

func (h *questionServiceHandler) FindQuestion(ctx context.Context, in *FindQuestionRequest, out *FindQuestionResponse) error {
	return h.QuestionServiceHandler.FindQuestion(ctx, in, out)
}

func (h *questionServiceHandler) FindQuestions(ctx context.Context, in *FindQuestionsRequest, out *FindQuestionsResponse) error {
	return h.QuestionServiceHandler.FindQuestions(ctx, in, out)
}

func (h *questionServiceHandler) AddQuestion(ctx context.Context, in *AddQuestionRequest, out *AddQuestionResponse) error {
	return h.QuestionServiceHandler.AddQuestion(ctx, in, out)
}

func (h *questionServiceHandler) ModifyQuestion(ctx context.Context, in *ModifyQuestionRequest, out *ModifyQuestionResponse) error {
	return h.QuestionServiceHandler.ModifyQuestion(ctx, in, out)
}

func (h *questionServiceHandler) DeleteQuestion(ctx context.Context, in *DeleteQuestionRequest, out *DeleteQuestionResponse) error {
	return h.QuestionServiceHandler.DeleteQuestion(ctx, in, out)
}

func (h *questionServiceHandler) DeleteQuestions(ctx context.Context, in *DeleteQuestionsRequest, out *DeleteQuestionsResponse) error {
	return h.QuestionServiceHandler.DeleteQuestions(ctx, in, out)
}
