import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from '@/features/auth/authSlice';
import { useGetDailyStatsQuery, useGetOrdersBySessionQuery } from '../features/orders/ordersAPI';
import { selectAllOrders, setAllOrders } from '../features/orders/ordersSlice';
import { getSettings } from '../features/settings/settingsSlice';
import { useGetExpensesBySessionQuery } from '../features/expense/expenseAPI';
import { setExpenses } from '../features/expense/expenseSlice';

const AppInitializer = () => {
  const dispatch = useDispatch();
  const {isOpen,sessionId} = useSelector((state)=>state.register)
  const {isAuthenticated} = useSelector((state)=>state.auth)
  const {data:sessionOrders,isSuccess:successOrderBySession} = useGetOrdersBySessionQuery(sessionId,{skip:!sessionId})
    const {data:allExpenses} = useGetExpensesBySessionQuery(sessionId,{skip:!sessionId})
  
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // useEffect(()=>{
  //       dispatch(getSettings())
  // },[isAuthenticated,dispatch])

  useEffect(()=>{
    if(successOrderBySession && sessionOrders){
      dispatch(setAllOrders(sessionOrders))
    }
  },[isOpen,successOrderBySession])

  useEffect(()=>{
    dispatch(setExpenses(allExpenses))
  },[isOpen,allExpenses])

  return null;
};

export default AppInitializer;
