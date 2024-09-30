// Code generated by protoc-gen-go. DO NOT EDIT.
// source: folder.proto

package folder

import (
	fmt "fmt"
	proto "github.com/golang/protobuf/proto"
	math "math"
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

// 文件夹
type Folder struct {
	FolderId             string   `protobuf:"bytes,1,opt,name=folder_id,json=folderId,proto3" json:"folder_id"`
	FolderName           string   `protobuf:"bytes,2,opt,name=folder_name,json=folderName,proto3" json:"folder_name"`
	FolderDir            string   `protobuf:"bytes,3,opt,name=folder_dir,json=folderDir,proto3" json:"folder_dir"`
	Domain               string   `protobuf:"bytes,4,opt,name=domain,proto3" json:"domain"`
	CreatedAt            string   `protobuf:"bytes,5,opt,name=created_at,json=createdAt,proto3" json:"created_at"`
	CreatedBy            string   `protobuf:"bytes,6,opt,name=created_by,json=createdBy,proto3" json:"created_by"`
	UpdatedAt            string   `protobuf:"bytes,7,opt,name=updated_at,json=updatedAt,proto3" json:"updated_at"`
	UpdatedBy            string   `protobuf:"bytes,8,opt,name=updated_by,json=updatedBy,proto3" json:"updated_by"`
	DeletedAt            string   `protobuf:"bytes,9,opt,name=deleted_at,json=deletedAt,proto3" json:"deleted_at"`
	DeletedBy            string   `protobuf:"bytes,10,opt,name=deleted_by,json=deletedBy,proto3" json:"deleted_by"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *Folder) Reset()         { *m = Folder{} }
func (m *Folder) String() string { return proto.CompactTextString(m) }
func (*Folder) ProtoMessage()    {}
func (*Folder) Descriptor() ([]byte, []int) {
	return fileDescriptor_f25f26c637458ab1, []int{0}
}

func (m *Folder) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_Folder.Unmarshal(m, b)
}
func (m *Folder) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_Folder.Marshal(b, m, deterministic)
}
func (m *Folder) XXX_Merge(src proto.Message) {
	xxx_messageInfo_Folder.Merge(m, src)
}
func (m *Folder) XXX_Size() int {
	return xxx_messageInfo_Folder.Size(m)
}
func (m *Folder) XXX_DiscardUnknown() {
	xxx_messageInfo_Folder.DiscardUnknown(m)
}

var xxx_messageInfo_Folder proto.InternalMessageInfo

func (m *Folder) GetFolderId() string {
	if m != nil {
		return m.FolderId
	}
	return ""
}

func (m *Folder) GetFolderName() string {
	if m != nil {
		return m.FolderName
	}
	return ""
}

func (m *Folder) GetFolderDir() string {
	if m != nil {
		return m.FolderDir
	}
	return ""
}

func (m *Folder) GetDomain() string {
	if m != nil {
		return m.Domain
	}
	return ""
}

func (m *Folder) GetCreatedAt() string {
	if m != nil {
		return m.CreatedAt
	}
	return ""
}

func (m *Folder) GetCreatedBy() string {
	if m != nil {
		return m.CreatedBy
	}
	return ""
}

func (m *Folder) GetUpdatedAt() string {
	if m != nil {
		return m.UpdatedAt
	}
	return ""
}

func (m *Folder) GetUpdatedBy() string {
	if m != nil {
		return m.UpdatedBy
	}
	return ""
}

func (m *Folder) GetDeletedAt() string {
	if m != nil {
		return m.DeletedAt
	}
	return ""
}

func (m *Folder) GetDeletedBy() string {
	if m != nil {
		return m.DeletedBy
	}
	return ""
}

// 查找多个文件夹
type FindFoldersRequest struct {
	Domain               string   `protobuf:"bytes,1,opt,name=domain,proto3" json:"domain"`
	FolderName           string   `protobuf:"bytes,2,opt,name=folder_name,json=folderName,proto3" json:"folder_name"`
	Database             string   `protobuf:"bytes,3,opt,name=database,proto3" json:"database"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *FindFoldersRequest) Reset()         { *m = FindFoldersRequest{} }
func (m *FindFoldersRequest) String() string { return proto.CompactTextString(m) }
func (*FindFoldersRequest) ProtoMessage()    {}
func (*FindFoldersRequest) Descriptor() ([]byte, []int) {
	return fileDescriptor_f25f26c637458ab1, []int{1}
}

func (m *FindFoldersRequest) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_FindFoldersRequest.Unmarshal(m, b)
}
func (m *FindFoldersRequest) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_FindFoldersRequest.Marshal(b, m, deterministic)
}
func (m *FindFoldersRequest) XXX_Merge(src proto.Message) {
	xxx_messageInfo_FindFoldersRequest.Merge(m, src)
}
func (m *FindFoldersRequest) XXX_Size() int {
	return xxx_messageInfo_FindFoldersRequest.Size(m)
}
func (m *FindFoldersRequest) XXX_DiscardUnknown() {
	xxx_messageInfo_FindFoldersRequest.DiscardUnknown(m)
}

var xxx_messageInfo_FindFoldersRequest proto.InternalMessageInfo

func (m *FindFoldersRequest) GetDomain() string {
	if m != nil {
		return m.Domain
	}
	return ""
}

func (m *FindFoldersRequest) GetFolderName() string {
	if m != nil {
		return m.FolderName
	}
	return ""
}

func (m *FindFoldersRequest) GetDatabase() string {
	if m != nil {
		return m.Database
	}
	return ""
}

type FindFoldersResponse struct {
	FolderList           []*Folder `protobuf:"bytes,1,rep,name=folder_list,json=folderList,proto3" json:"folder_list"`
	XXX_NoUnkeyedLiteral struct{}  `json:"-"`
	XXX_unrecognized     []byte    `json:"-"`
	XXX_sizecache        int32     `json:"-"`
}

func (m *FindFoldersResponse) Reset()         { *m = FindFoldersResponse{} }
func (m *FindFoldersResponse) String() string { return proto.CompactTextString(m) }
func (*FindFoldersResponse) ProtoMessage()    {}
func (*FindFoldersResponse) Descriptor() ([]byte, []int) {
	return fileDescriptor_f25f26c637458ab1, []int{2}
}

func (m *FindFoldersResponse) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_FindFoldersResponse.Unmarshal(m, b)
}
func (m *FindFoldersResponse) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_FindFoldersResponse.Marshal(b, m, deterministic)
}
func (m *FindFoldersResponse) XXX_Merge(src proto.Message) {
	xxx_messageInfo_FindFoldersResponse.Merge(m, src)
}
func (m *FindFoldersResponse) XXX_Size() int {
	return xxx_messageInfo_FindFoldersResponse.Size(m)
}
func (m *FindFoldersResponse) XXX_DiscardUnknown() {
	xxx_messageInfo_FindFoldersResponse.DiscardUnknown(m)
}

var xxx_messageInfo_FindFoldersResponse proto.InternalMessageInfo

func (m *FindFoldersResponse) GetFolderList() []*Folder {
	if m != nil {
		return m.FolderList
	}
	return nil
}

// 查找单个文件
type FindFolderRequest struct {
	FolderId             string   `protobuf:"bytes,1,opt,name=folder_id,json=folderId,proto3" json:"folder_id"`
	Database             string   `protobuf:"bytes,2,opt,name=database,proto3" json:"database"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *FindFolderRequest) Reset()         { *m = FindFolderRequest{} }
func (m *FindFolderRequest) String() string { return proto.CompactTextString(m) }
func (*FindFolderRequest) ProtoMessage()    {}
func (*FindFolderRequest) Descriptor() ([]byte, []int) {
	return fileDescriptor_f25f26c637458ab1, []int{3}
}

func (m *FindFolderRequest) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_FindFolderRequest.Unmarshal(m, b)
}
func (m *FindFolderRequest) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_FindFolderRequest.Marshal(b, m, deterministic)
}
func (m *FindFolderRequest) XXX_Merge(src proto.Message) {
	xxx_messageInfo_FindFolderRequest.Merge(m, src)
}
func (m *FindFolderRequest) XXX_Size() int {
	return xxx_messageInfo_FindFolderRequest.Size(m)
}
func (m *FindFolderRequest) XXX_DiscardUnknown() {
	xxx_messageInfo_FindFolderRequest.DiscardUnknown(m)
}

var xxx_messageInfo_FindFolderRequest proto.InternalMessageInfo

func (m *FindFolderRequest) GetFolderId() string {
	if m != nil {
		return m.FolderId
	}
	return ""
}

func (m *FindFolderRequest) GetDatabase() string {
	if m != nil {
		return m.Database
	}
	return ""
}

type FindFolderResponse struct {
	Folder               *Folder  `protobuf:"bytes,1,opt,name=folder,proto3" json:"folder"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *FindFolderResponse) Reset()         { *m = FindFolderResponse{} }
func (m *FindFolderResponse) String() string { return proto.CompactTextString(m) }
func (*FindFolderResponse) ProtoMessage()    {}
func (*FindFolderResponse) Descriptor() ([]byte, []int) {
	return fileDescriptor_f25f26c637458ab1, []int{4}
}

func (m *FindFolderResponse) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_FindFolderResponse.Unmarshal(m, b)
}
func (m *FindFolderResponse) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_FindFolderResponse.Marshal(b, m, deterministic)
}
func (m *FindFolderResponse) XXX_Merge(src proto.Message) {
	xxx_messageInfo_FindFolderResponse.Merge(m, src)
}
func (m *FindFolderResponse) XXX_Size() int {
	return xxx_messageInfo_FindFolderResponse.Size(m)
}
func (m *FindFolderResponse) XXX_DiscardUnknown() {
	xxx_messageInfo_FindFolderResponse.DiscardUnknown(m)
}

var xxx_messageInfo_FindFolderResponse proto.InternalMessageInfo

func (m *FindFolderResponse) GetFolder() *Folder {
	if m != nil {
		return m.Folder
	}
	return nil
}

// 添加文件夹记录
type AddRequest struct {
	FolderName           string   `protobuf:"bytes,1,opt,name=folder_name,json=folderName,proto3" json:"folder_name"`
	FolderDir            string   `protobuf:"bytes,2,opt,name=folder_dir,json=folderDir,proto3" json:"folder_dir"`
	Domain               string   `protobuf:"bytes,3,opt,name=domain,proto3" json:"domain"`
	Writer               string   `protobuf:"bytes,4,opt,name=writer,proto3" json:"writer"`
	Database             string   `protobuf:"bytes,5,opt,name=database,proto3" json:"database"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *AddRequest) Reset()         { *m = AddRequest{} }
func (m *AddRequest) String() string { return proto.CompactTextString(m) }
func (*AddRequest) ProtoMessage()    {}
func (*AddRequest) Descriptor() ([]byte, []int) {
	return fileDescriptor_f25f26c637458ab1, []int{5}
}

func (m *AddRequest) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_AddRequest.Unmarshal(m, b)
}
func (m *AddRequest) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_AddRequest.Marshal(b, m, deterministic)
}
func (m *AddRequest) XXX_Merge(src proto.Message) {
	xxx_messageInfo_AddRequest.Merge(m, src)
}
func (m *AddRequest) XXX_Size() int {
	return xxx_messageInfo_AddRequest.Size(m)
}
func (m *AddRequest) XXX_DiscardUnknown() {
	xxx_messageInfo_AddRequest.DiscardUnknown(m)
}

var xxx_messageInfo_AddRequest proto.InternalMessageInfo

func (m *AddRequest) GetFolderName() string {
	if m != nil {
		return m.FolderName
	}
	return ""
}

func (m *AddRequest) GetFolderDir() string {
	if m != nil {
		return m.FolderDir
	}
	return ""
}

func (m *AddRequest) GetDomain() string {
	if m != nil {
		return m.Domain
	}
	return ""
}

func (m *AddRequest) GetWriter() string {
	if m != nil {
		return m.Writer
	}
	return ""
}

func (m *AddRequest) GetDatabase() string {
	if m != nil {
		return m.Database
	}
	return ""
}

type AddResponse struct {
	FolderId             string   `protobuf:"bytes,1,opt,name=folder_id,json=folderId,proto3" json:"folder_id"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *AddResponse) Reset()         { *m = AddResponse{} }
func (m *AddResponse) String() string { return proto.CompactTextString(m) }
func (*AddResponse) ProtoMessage()    {}
func (*AddResponse) Descriptor() ([]byte, []int) {
	return fileDescriptor_f25f26c637458ab1, []int{6}
}

func (m *AddResponse) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_AddResponse.Unmarshal(m, b)
}
func (m *AddResponse) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_AddResponse.Marshal(b, m, deterministic)
}
func (m *AddResponse) XXX_Merge(src proto.Message) {
	xxx_messageInfo_AddResponse.Merge(m, src)
}
func (m *AddResponse) XXX_Size() int {
	return xxx_messageInfo_AddResponse.Size(m)
}
func (m *AddResponse) XXX_DiscardUnknown() {
	xxx_messageInfo_AddResponse.DiscardUnknown(m)
}

var xxx_messageInfo_AddResponse proto.InternalMessageInfo

func (m *AddResponse) GetFolderId() string {
	if m != nil {
		return m.FolderId
	}
	return ""
}

// 修改文件夹信息
type ModifyRequest struct {
	FolderId             string   `protobuf:"bytes,1,opt,name=folder_id,json=folderId,proto3" json:"folder_id"`
	FolderName           string   `protobuf:"bytes,2,opt,name=folder_name,json=folderName,proto3" json:"folder_name"`
	Writer               string   `protobuf:"bytes,3,opt,name=writer,proto3" json:"writer"`
	Database             string   `protobuf:"bytes,4,opt,name=database,proto3" json:"database"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *ModifyRequest) Reset()         { *m = ModifyRequest{} }
func (m *ModifyRequest) String() string { return proto.CompactTextString(m) }
func (*ModifyRequest) ProtoMessage()    {}
func (*ModifyRequest) Descriptor() ([]byte, []int) {
	return fileDescriptor_f25f26c637458ab1, []int{7}
}

func (m *ModifyRequest) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_ModifyRequest.Unmarshal(m, b)
}
func (m *ModifyRequest) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_ModifyRequest.Marshal(b, m, deterministic)
}
func (m *ModifyRequest) XXX_Merge(src proto.Message) {
	xxx_messageInfo_ModifyRequest.Merge(m, src)
}
func (m *ModifyRequest) XXX_Size() int {
	return xxx_messageInfo_ModifyRequest.Size(m)
}
func (m *ModifyRequest) XXX_DiscardUnknown() {
	xxx_messageInfo_ModifyRequest.DiscardUnknown(m)
}

var xxx_messageInfo_ModifyRequest proto.InternalMessageInfo

func (m *ModifyRequest) GetFolderId() string {
	if m != nil {
		return m.FolderId
	}
	return ""
}

func (m *ModifyRequest) GetFolderName() string {
	if m != nil {
		return m.FolderName
	}
	return ""
}

func (m *ModifyRequest) GetWriter() string {
	if m != nil {
		return m.Writer
	}
	return ""
}

func (m *ModifyRequest) GetDatabase() string {
	if m != nil {
		return m.Database
	}
	return ""
}

type ModifyResponse struct {
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *ModifyResponse) Reset()         { *m = ModifyResponse{} }
func (m *ModifyResponse) String() string { return proto.CompactTextString(m) }
func (*ModifyResponse) ProtoMessage()    {}
func (*ModifyResponse) Descriptor() ([]byte, []int) {
	return fileDescriptor_f25f26c637458ab1, []int{8}
}

func (m *ModifyResponse) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_ModifyResponse.Unmarshal(m, b)
}
func (m *ModifyResponse) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_ModifyResponse.Marshal(b, m, deterministic)
}
func (m *ModifyResponse) XXX_Merge(src proto.Message) {
	xxx_messageInfo_ModifyResponse.Merge(m, src)
}
func (m *ModifyResponse) XXX_Size() int {
	return xxx_messageInfo_ModifyResponse.Size(m)
}
func (m *ModifyResponse) XXX_DiscardUnknown() {
	xxx_messageInfo_ModifyResponse.DiscardUnknown(m)
}

var xxx_messageInfo_ModifyResponse proto.InternalMessageInfo

// 删除单个文件夹
type DeleteRequest struct {
	FolderId             string   `protobuf:"bytes,1,opt,name=folder_id,json=folderId,proto3" json:"folder_id"`
	Writer               string   `protobuf:"bytes,2,opt,name=writer,proto3" json:"writer"`
	Database             string   `protobuf:"bytes,3,opt,name=database,proto3" json:"database"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *DeleteRequest) Reset()         { *m = DeleteRequest{} }
func (m *DeleteRequest) String() string { return proto.CompactTextString(m) }
func (*DeleteRequest) ProtoMessage()    {}
func (*DeleteRequest) Descriptor() ([]byte, []int) {
	return fileDescriptor_f25f26c637458ab1, []int{9}
}

func (m *DeleteRequest) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_DeleteRequest.Unmarshal(m, b)
}
func (m *DeleteRequest) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_DeleteRequest.Marshal(b, m, deterministic)
}
func (m *DeleteRequest) XXX_Merge(src proto.Message) {
	xxx_messageInfo_DeleteRequest.Merge(m, src)
}
func (m *DeleteRequest) XXX_Size() int {
	return xxx_messageInfo_DeleteRequest.Size(m)
}
func (m *DeleteRequest) XXX_DiscardUnknown() {
	xxx_messageInfo_DeleteRequest.DiscardUnknown(m)
}

var xxx_messageInfo_DeleteRequest proto.InternalMessageInfo

func (m *DeleteRequest) GetFolderId() string {
	if m != nil {
		return m.FolderId
	}
	return ""
}

func (m *DeleteRequest) GetWriter() string {
	if m != nil {
		return m.Writer
	}
	return ""
}

func (m *DeleteRequest) GetDatabase() string {
	if m != nil {
		return m.Database
	}
	return ""
}

// 删除多个文件夹
type DeleteSelectFoldersRequest struct {
	FolderIdList         []string `protobuf:"bytes,1,rep,name=folder_id_list,json=folderIdList,proto3" json:"folder_id_list"`
	Writer               string   `protobuf:"bytes,2,opt,name=writer,proto3" json:"writer"`
	Database             string   `protobuf:"bytes,3,opt,name=database,proto3" json:"database"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *DeleteSelectFoldersRequest) Reset()         { *m = DeleteSelectFoldersRequest{} }
func (m *DeleteSelectFoldersRequest) String() string { return proto.CompactTextString(m) }
func (*DeleteSelectFoldersRequest) ProtoMessage()    {}
func (*DeleteSelectFoldersRequest) Descriptor() ([]byte, []int) {
	return fileDescriptor_f25f26c637458ab1, []int{10}
}

func (m *DeleteSelectFoldersRequest) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_DeleteSelectFoldersRequest.Unmarshal(m, b)
}
func (m *DeleteSelectFoldersRequest) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_DeleteSelectFoldersRequest.Marshal(b, m, deterministic)
}
func (m *DeleteSelectFoldersRequest) XXX_Merge(src proto.Message) {
	xxx_messageInfo_DeleteSelectFoldersRequest.Merge(m, src)
}
func (m *DeleteSelectFoldersRequest) XXX_Size() int {
	return xxx_messageInfo_DeleteSelectFoldersRequest.Size(m)
}
func (m *DeleteSelectFoldersRequest) XXX_DiscardUnknown() {
	xxx_messageInfo_DeleteSelectFoldersRequest.DiscardUnknown(m)
}

var xxx_messageInfo_DeleteSelectFoldersRequest proto.InternalMessageInfo

func (m *DeleteSelectFoldersRequest) GetFolderIdList() []string {
	if m != nil {
		return m.FolderIdList
	}
	return nil
}

func (m *DeleteSelectFoldersRequest) GetWriter() string {
	if m != nil {
		return m.Writer
	}
	return ""
}

func (m *DeleteSelectFoldersRequest) GetDatabase() string {
	if m != nil {
		return m.Database
	}
	return ""
}

// 物理删除多个文件夹
type HardDeleteFoldersRequest struct {
	FolderIdList         []string `protobuf:"bytes,1,rep,name=folder_id_list,json=folderIdList,proto3" json:"folder_id_list"`
	Database             string   `protobuf:"bytes,2,opt,name=database,proto3" json:"database"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *HardDeleteFoldersRequest) Reset()         { *m = HardDeleteFoldersRequest{} }
func (m *HardDeleteFoldersRequest) String() string { return proto.CompactTextString(m) }
func (*HardDeleteFoldersRequest) ProtoMessage()    {}
func (*HardDeleteFoldersRequest) Descriptor() ([]byte, []int) {
	return fileDescriptor_f25f26c637458ab1, []int{11}
}

func (m *HardDeleteFoldersRequest) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_HardDeleteFoldersRequest.Unmarshal(m, b)
}
func (m *HardDeleteFoldersRequest) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_HardDeleteFoldersRequest.Marshal(b, m, deterministic)
}
func (m *HardDeleteFoldersRequest) XXX_Merge(src proto.Message) {
	xxx_messageInfo_HardDeleteFoldersRequest.Merge(m, src)
}
func (m *HardDeleteFoldersRequest) XXX_Size() int {
	return xxx_messageInfo_HardDeleteFoldersRequest.Size(m)
}
func (m *HardDeleteFoldersRequest) XXX_DiscardUnknown() {
	xxx_messageInfo_HardDeleteFoldersRequest.DiscardUnknown(m)
}

var xxx_messageInfo_HardDeleteFoldersRequest proto.InternalMessageInfo

func (m *HardDeleteFoldersRequest) GetFolderIdList() []string {
	if m != nil {
		return m.FolderIdList
	}
	return nil
}

func (m *HardDeleteFoldersRequest) GetDatabase() string {
	if m != nil {
		return m.Database
	}
	return ""
}

type DeleteResponse struct {
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *DeleteResponse) Reset()         { *m = DeleteResponse{} }
func (m *DeleteResponse) String() string { return proto.CompactTextString(m) }
func (*DeleteResponse) ProtoMessage()    {}
func (*DeleteResponse) Descriptor() ([]byte, []int) {
	return fileDescriptor_f25f26c637458ab1, []int{12}
}

func (m *DeleteResponse) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_DeleteResponse.Unmarshal(m, b)
}
func (m *DeleteResponse) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_DeleteResponse.Marshal(b, m, deterministic)
}
func (m *DeleteResponse) XXX_Merge(src proto.Message) {
	xxx_messageInfo_DeleteResponse.Merge(m, src)
}
func (m *DeleteResponse) XXX_Size() int {
	return xxx_messageInfo_DeleteResponse.Size(m)
}
func (m *DeleteResponse) XXX_DiscardUnknown() {
	xxx_messageInfo_DeleteResponse.DiscardUnknown(m)
}

var xxx_messageInfo_DeleteResponse proto.InternalMessageInfo

// 恢复选中文件夹
type RecoverSelectFoldersRequest struct {
	FolderIdList         []string `protobuf:"bytes,1,rep,name=folder_id_list,json=folderIdList,proto3" json:"folder_id_list"`
	Writer               string   `protobuf:"bytes,2,opt,name=writer,proto3" json:"writer"`
	Database             string   `protobuf:"bytes,3,opt,name=database,proto3" json:"database"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *RecoverSelectFoldersRequest) Reset()         { *m = RecoverSelectFoldersRequest{} }
func (m *RecoverSelectFoldersRequest) String() string { return proto.CompactTextString(m) }
func (*RecoverSelectFoldersRequest) ProtoMessage()    {}
func (*RecoverSelectFoldersRequest) Descriptor() ([]byte, []int) {
	return fileDescriptor_f25f26c637458ab1, []int{13}
}

func (m *RecoverSelectFoldersRequest) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_RecoverSelectFoldersRequest.Unmarshal(m, b)
}
func (m *RecoverSelectFoldersRequest) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_RecoverSelectFoldersRequest.Marshal(b, m, deterministic)
}
func (m *RecoverSelectFoldersRequest) XXX_Merge(src proto.Message) {
	xxx_messageInfo_RecoverSelectFoldersRequest.Merge(m, src)
}
func (m *RecoverSelectFoldersRequest) XXX_Size() int {
	return xxx_messageInfo_RecoverSelectFoldersRequest.Size(m)
}
func (m *RecoverSelectFoldersRequest) XXX_DiscardUnknown() {
	xxx_messageInfo_RecoverSelectFoldersRequest.DiscardUnknown(m)
}

var xxx_messageInfo_RecoverSelectFoldersRequest proto.InternalMessageInfo

func (m *RecoverSelectFoldersRequest) GetFolderIdList() []string {
	if m != nil {
		return m.FolderIdList
	}
	return nil
}

func (m *RecoverSelectFoldersRequest) GetWriter() string {
	if m != nil {
		return m.Writer
	}
	return ""
}

func (m *RecoverSelectFoldersRequest) GetDatabase() string {
	if m != nil {
		return m.Database
	}
	return ""
}

type RecoverSelectFoldersResponse struct {
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *RecoverSelectFoldersResponse) Reset()         { *m = RecoverSelectFoldersResponse{} }
func (m *RecoverSelectFoldersResponse) String() string { return proto.CompactTextString(m) }
func (*RecoverSelectFoldersResponse) ProtoMessage()    {}
func (*RecoverSelectFoldersResponse) Descriptor() ([]byte, []int) {
	return fileDescriptor_f25f26c637458ab1, []int{14}
}

func (m *RecoverSelectFoldersResponse) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_RecoverSelectFoldersResponse.Unmarshal(m, b)
}
func (m *RecoverSelectFoldersResponse) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_RecoverSelectFoldersResponse.Marshal(b, m, deterministic)
}
func (m *RecoverSelectFoldersResponse) XXX_Merge(src proto.Message) {
	xxx_messageInfo_RecoverSelectFoldersResponse.Merge(m, src)
}
func (m *RecoverSelectFoldersResponse) XXX_Size() int {
	return xxx_messageInfo_RecoverSelectFoldersResponse.Size(m)
}
func (m *RecoverSelectFoldersResponse) XXX_DiscardUnknown() {
	xxx_messageInfo_RecoverSelectFoldersResponse.DiscardUnknown(m)
}

var xxx_messageInfo_RecoverSelectFoldersResponse proto.InternalMessageInfo

func init() {
	proto.RegisterType((*Folder)(nil), "folder.Folder")
	proto.RegisterType((*FindFoldersRequest)(nil), "folder.FindFoldersRequest")
	proto.RegisterType((*FindFoldersResponse)(nil), "folder.FindFoldersResponse")
	proto.RegisterType((*FindFolderRequest)(nil), "folder.FindFolderRequest")
	proto.RegisterType((*FindFolderResponse)(nil), "folder.FindFolderResponse")
	proto.RegisterType((*AddRequest)(nil), "folder.AddRequest")
	proto.RegisterType((*AddResponse)(nil), "folder.AddResponse")
	proto.RegisterType((*ModifyRequest)(nil), "folder.ModifyRequest")
	proto.RegisterType((*ModifyResponse)(nil), "folder.ModifyResponse")
	proto.RegisterType((*DeleteRequest)(nil), "folder.DeleteRequest")
	proto.RegisterType((*DeleteSelectFoldersRequest)(nil), "folder.DeleteSelectFoldersRequest")
	proto.RegisterType((*HardDeleteFoldersRequest)(nil), "folder.HardDeleteFoldersRequest")
	proto.RegisterType((*DeleteResponse)(nil), "folder.DeleteResponse")
	proto.RegisterType((*RecoverSelectFoldersRequest)(nil), "folder.RecoverSelectFoldersRequest")
	proto.RegisterType((*RecoverSelectFoldersResponse)(nil), "folder.RecoverSelectFoldersResponse")
}

func init() { proto.RegisterFile("folder.proto", fileDescriptor_f25f26c637458ab1) }

var fileDescriptor_f25f26c637458ab1 = []byte{
	// 610 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0xbc, 0x56, 0xdd, 0x6a, 0xdb, 0x30,
	0x14, 0xae, 0x93, 0xd4, 0x4b, 0x4e, 0x7e, 0x68, 0x95, 0x2d, 0x68, 0xce, 0x7e, 0x82, 0x57, 0x46,
	0xd9, 0x45, 0x07, 0x1d, 0xec, 0x6a, 0x30, 0x52, 0xba, 0xd0, 0x41, 0xb7, 0x41, 0x72, 0x3b, 0xc8,
	0x1c, 0x4b, 0x05, 0x41, 0x12, 0x67, 0xb2, 0x9a, 0xe2, 0xcb, 0xbd, 0xc5, 0xde, 0x64, 0x4f, 0xb4,
	0xf7, 0x18, 0xb1, 0x24, 0xdb, 0x72, 0x1c, 0xa7, 0xf4, 0x62, 0x77, 0xd1, 0xf9, 0xce, 0x39, 0xdf,
	0x77, 0x8e, 0x3e, 0x99, 0x40, 0xeb, 0x26, 0x98, 0x13, 0xca, 0xcf, 0x56, 0x3c, 0x10, 0x01, 0xb2,
	0xe5, 0xc9, 0xfd, 0x53, 0x01, 0x7b, 0x14, 0xff, 0x44, 0x7d, 0x68, 0xc8, 0xe0, 0x94, 0x11, 0x6c,
	0x0d, 0xac, 0xd3, 0xc6, 0xb8, 0x2e, 0x03, 0x9f, 0x09, 0x7a, 0x09, 0x4d, 0x05, 0x2e, 0xbd, 0x05,
	0xc5, 0x95, 0x18, 0x06, 0x19, 0xfa, 0xea, 0x2d, 0x28, 0x7a, 0x0e, 0xea, 0x34, 0x25, 0x8c, 0xe3,
	0x6a, 0x8c, 0xab, 0x7e, 0x97, 0x8c, 0xa3, 0x1e, 0xd8, 0x24, 0x58, 0x78, 0x6c, 0x89, 0x6b, 0x31,
	0xa4, 0x4e, 0x9b, 0x32, 0x9f, 0x53, 0x4f, 0x50, 0x32, 0xf5, 0x04, 0x3e, 0x94, 0x65, 0x2a, 0x32,
	0x14, 0x59, 0x78, 0x16, 0x61, 0xdb, 0x80, 0x2f, 0xa2, 0x0d, 0x7c, 0xbb, 0x22, 0xba, 0xfa, 0x91,
	0x84, 0x55, 0x44, 0x56, 0x6b, 0x78, 0x16, 0xe1, 0xba, 0x01, 0xcb, 0x6a, 0x42, 0xe7, 0x54, 0x55,
	0x37, 0x24, 0xac, 0x22, 0xb2, 0x5a, 0xc3, 0xb3, 0x08, 0x83, 0x01, 0x5f, 0x44, 0x2e, 0x03, 0x34,
	0x62, 0x4b, 0x22, 0x97, 0x17, 0x8e, 0xe9, 0xcf, 0x5b, 0x1a, 0x8a, 0xcc, 0x9c, 0x96, 0x31, 0xe7,
	0xde, 0xfd, 0x39, 0x50, 0x27, 0x9e, 0xf0, 0x66, 0x5e, 0x48, 0xd5, 0xf6, 0x92, 0xb3, 0x3b, 0x82,
	0xae, 0x41, 0x15, 0xae, 0x82, 0x65, 0x48, 0xd1, 0xdb, 0xa4, 0xe7, 0x9c, 0x85, 0x02, 0x5b, 0x83,
	0xea, 0x69, 0xf3, 0xbc, 0x73, 0xa6, 0xee, 0x59, 0x66, 0x6b, 0x8e, 0x6b, 0x16, 0x0a, 0xf7, 0x1a,
	0x8e, 0xd3, 0x3e, 0x5a, 0x71, 0xe9, 0xb5, 0x67, 0x55, 0x55, 0x72, 0xaa, 0x3e, 0x64, 0x17, 0x90,
	0x88, 0x7a, 0x0d, 0xca, 0x5a, 0x71, 0xaf, 0x6d, 0x3d, 0xda, 0x78, 0xbf, 0x2d, 0x80, 0x21, 0x21,
	0x5a, 0x45, 0x6e, 0x3f, 0xd6, 0x1e, 0x7f, 0x55, 0x76, 0xfb, 0xab, 0x6a, 0xec, 0xbd, 0x07, 0xf6,
	0x1d, 0x67, 0x82, 0x72, 0xed, 0x3b, 0x79, 0x32, 0x06, 0x3b, 0xcc, 0x0d, 0xf6, 0x06, 0x9a, 0xb1,
	0x32, 0x35, 0x51, 0xd9, 0x82, 0xdc, 0x5f, 0x16, 0xb4, 0xbf, 0x04, 0x84, 0xdd, 0x44, 0xf7, 0xda,
	0xe7, 0x5e, 0x1b, 0xa4, 0x7a, 0xab, 0x3b, 0xf5, 0xd6, 0x72, 0x7a, 0x8f, 0xa0, 0xa3, 0x25, 0x48,
	0xc9, 0xee, 0x0f, 0x68, 0x5f, 0xc6, 0x46, 0xbd, 0x97, 0xa8, 0x94, 0xb3, 0xb2, 0x93, 0x33, 0x6f,
	0xc9, 0x35, 0x38, 0x92, 0x61, 0x42, 0xe7, 0xd4, 0x17, 0xb9, 0x57, 0x70, 0x02, 0x9d, 0x84, 0x2e,
	0x35, 0x67, 0x63, 0xdc, 0xd2, 0x9c, 0x1b, 0x3b, 0x3e, 0x88, 0xf7, 0x3b, 0xe0, 0x2b, 0x8f, 0x13,
	0xc9, 0xfd, 0x20, 0xd6, 0x32, 0x4b, 0x1f, 0x41, 0x47, 0xef, 0x4d, 0x6d, 0xf2, 0x0e, 0xfa, 0x63,
	0xea, 0x07, 0x6b, 0xca, 0xff, 0xf3, 0xa0, 0x2f, 0xe0, 0x59, 0x31, 0xb1, 0x14, 0x76, 0xfe, 0xb7,
	0x06, 0x6d, 0x19, 0x9b, 0x50, 0xbe, 0x66, 0x3e, 0x45, 0x57, 0xd0, 0xcc, 0x7c, 0x25, 0x90, 0x93,
	0x3c, 0xbc, 0xad, 0xaf, 0x94, 0xd3, 0x2f, 0xc4, 0xd4, 0xc8, 0x07, 0xe8, 0x13, 0x40, 0x0a, 0xa0,
	0xa7, 0xdb, 0xc9, 0xba, 0x8f, 0x53, 0x04, 0x25, 0x6d, 0xde, 0x43, 0x63, 0x48, 0x74, 0x17, 0xa4,
	0x53, 0xd3, 0x47, 0xef, 0x74, 0x8d, 0x58, 0x52, 0xf7, 0x11, 0x5a, 0xd2, 0xcf, 0xaa, 0xf4, 0x89,
	0x4e, 0x33, 0x1e, 0x9a, 0xd3, 0xcb, 0x87, 0xb3, 0x0d, 0xb2, 0x06, 0x49, 0x1b, 0x18, 0x8f, 0x22,
	0x6d, 0x90, 0xbb, 0xf3, 0x03, 0x34, 0x81, 0x6e, 0x81, 0xbb, 0x91, 0x6b, 0x16, 0x14, 0x39, 0xa2,
	0xa4, 0xe9, 0x37, 0x38, 0xde, 0xb2, 0x2e, 0x1a, 0xe8, 0xf4, 0x5d, 0xae, 0x2e, 0x69, 0xe8, 0xc3,
	0xe3, 0x22, 0x8b, 0xa0, 0x57, 0xba, 0xa2, 0xc4, 0xb9, 0xce, 0x49, 0x79, 0x92, 0x26, 0x99, 0xd9,
	0xf1, 0xff, 0x85, 0x77, 0xff, 0x02, 0x00, 0x00, 0xff, 0xff, 0x1e, 0x39, 0x6a, 0x28, 0x3f, 0x08,
	0x00, 0x00,
}
