import { useState, useEffect } from 'react';
import axiosPublic,{axiosPrivate} from '@/api/axios';

const useProducts = () => {
  const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect(() => {
  //   fetchProducts();
  // }, []);

    useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

    const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosPrivate.get('/products/categories', { withCredentials: true });
      console.log("category ",data)
      setCategories(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

    const addCategory = async (categoryData) => {
    try {
      const { data } = await axiosPrivate.post('/products/add-category', categoryData, { withCredentials: true });
      setCategories(prev => [...prev, data.category]);
      return data.category;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosPrivate.get(`/products`, { withCredentials: true });
      setProducts(data);
      console.log("products ",data)
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductsByCategory = async (categoryId) => {
  try {
    setIsLoading(true);
    const { data } = await axiosPrivate.get(`/products/${categoryId}`, { withCredentials: true });
    setProducts(data);
    console.log(data)
  } catch (err) {
    setError(err.response?.data?.message || err.message);
  } finally {
    setIsLoading(false);
  }
};

  const addProduct = async (productData) => {
    try {
      const { data } = await axiosPrivate.post(`/products/add-product`, productData, { withCredentials: true });
      setProducts(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const bulkAddProducts = async (products) => {
  try{
    console.log("bulk add: ",products)
    const res = await axiosPrivate.post('/products/bulk-add', products);
    setProducts(prev => [...prev, res.data]);
    return res.data;
  }catch(err){
    setError(err.response?.data?.message||err.message)
  }
};

  const updateProduct = async (id, productData) => {
    try {
      const { data } = await axiosPrivate.patch(`/products/edit-product/${id}`, productData, { withCredentials: true });
      setProducts(prev => prev.map(p => p._id === id ? data.product : p));
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await axiosPrivate.delete(`/products/${id}`, { withCredentials: true });
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  return {
    products,
    categories,
    isLoading,
    error,
    fetchProducts,
    fetchCategories,
    bulkAddProducts,
    addCategory,
    fetchProductsByCategory,
    addProduct,
    updateProduct,
    deleteProduct,
  };
};

export default useProducts; 