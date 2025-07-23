import React from 'react'
import axiosPublic,{axiosPrivate} from '@/api/axios';

export default function useBranch() {
  
    async function getBranch(){
        try{
            const res = await axiosPrivate.get('/branch/')
            return res.data
        }catch(err){
            console.log(err)
        }
    }

    return {
        getBranch
  }
}
