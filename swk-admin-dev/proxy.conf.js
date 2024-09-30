const PROXY_CONFIG = {};

// api服务器配置
PROXY_CONFIG['/internal/api/v1'] = {
  target: 'http://localhost:8080/internal/api/v1/',
  secure: false,
  changeOrigin: true,
  pathRewrite: {
    '^/internal/api/v1': ''
  }
};
// api服务器配置
PROXY_CONFIG['/system/api/v1'] = {
  target: 'http://localhost:8080/system/api/v1/',
  secure: false,
  changeOrigin: true,
  pathRewrite: {
    '^/system/api/v1': ''
  }
};

// 文件服务器配置
PROXY_CONFIG['/storage/'] = {
  target: 'http://192.168.1.112:9090/',
  secure: false,
  changeOrigin: true,
  pathRewrite: {
    '^/storage/': ''
  }
};

// ws服务器配置
PROXY_CONFIG['/ws/'] = {
  target: 'ws://localhost:8080/internal/api/v1/ws/',
  secure: false,
  changeOrigin: true,
  ws: true,
  pathRewrite: {
    '^/ws/': ''
  }
};

// ws服务器配置
PROXY_CONFIG['/socket.io/'] = {
  target: 'http://localhost:8001/socket.io/',
  secure: false,
  changeOrigin: true,
  ws: true,
  pathRewrite: {
    '^/socket.io/': ''
  }
};

module.exports = PROXY_CONFIG;
