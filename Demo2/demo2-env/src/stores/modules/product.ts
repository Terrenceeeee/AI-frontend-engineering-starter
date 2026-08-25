import { defineStore } from 'pinia';
import type { IProductResponse } from '../../api/product';

interface IProductState {
  data: IProductResponse[];
  loading: boolean;
}

export const useProductStore = defineStore('product', {
  state: (): IProductState => ({
    data: [],
    loading: false,
  }),

  actions: {
    async fetchData() {
      this.loading = true;
      try {
        // const res = await getProductData();
        // this.data = res.data;
        console.log('获取 Product 数据');
      } finally {
        this.loading = false;
      }
    },
  },
});
