import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetDailyStatsQuery, useGetOrdersBySessionQuery } from '../features/orders/ordersAPI';
import { selectAllOrders, setAllOrders } from '../features/orders/ordersSlice';
import { getSettings } from '../features/settings/settingsSlice';
import { useGetExpensesBySessionQuery } from '../features/expense/expenseAPI';
import { setExpenses } from '../features/expense/expenseSlice';
import { checkAuth } from '../features/auth/authSlice';

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
    if(isAuthenticated && successOrderBySession && sessionOrders){
      dispatch(setAllOrders(sessionOrders))
    }
  },[isOpen,successOrderBySession,isAuthenticated]) 

  useEffect(()=>{
    if(isAuthenticated){
      dispatch(setExpenses(allExpenses))
    }
  },[isOpen,allExpenses,isAuthenticated])

  useEffect(()=>{
    if(isAuthenticated){
      dispatch(getSettings())
    }
  },[isAuthenticated])

  return null;
};

export default AppInitializer;
