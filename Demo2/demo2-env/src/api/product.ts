import request from '../utils/request';

export type IProductParams = Record<string, unknown>;

export type IProductResponse = Record<string, unknown>;

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