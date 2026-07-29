import request from '../utils/request';

export interface IProductParams {
  // TODO: 定义接口参数
}

export interface IProductResponse {
  // TODO: 定义接口返回数据
}

/**
 * 获取 Product 数据
 */
export const getProductData = (params?: IProductParams) => {
  return request.get<IProductResponse>('/api/product', { params });
};

/**
 * 更新 Product 数据
 */
export const updateProductData = (data: IProductParams) => {
  return request.post('/api/product/update', data);
};