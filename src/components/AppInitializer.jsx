import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from '@/features/auth/authSlice';
import { useGetDailyStatsQuery, useGetOrdersBySessionQuery } from '../features/orders/ordersAPI';
import { selectAllOrders, setAllOrders } from '../features/orders/ordersSlice';
import { getSettings } from '../features/settings/settingsSlice';

const AppInitializer = () => {
  const dispatch = useDispatch();
  const {isOpen,sessionId,isAuthenticated} = useSelector((state)=>state.register)
  const {data:sessionOrders,isSuccess:successOrderBySession} = useGetOrdersBySessionQuery(sessionId,{skip:!sessionId})

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(()=>{
        dispatch(getSettings())
  },[isAuthenticated])

  useEffect(()=>{
    if(successOrderBySession && sessionOrders){
      dispatch(setAllOrders(sessionOrders))
    }
  },[isOpen,successOrderBySession])

  return null;
};

export default AppInitializer;
