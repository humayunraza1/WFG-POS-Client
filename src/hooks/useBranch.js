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


    async function addBranch(branchData){
        try{
            const res  = await axiosPrivate.post('/branch/add-branch',{name:branchData.name,address:branchData.address,phone:branchData.phone,code:branchData.code})
            return res.data
        }catch(err){
            console.log(err)
        }
    }
    async function updateBranch(id,branchData){
        try{
            const res  = await axiosPrivate.put('/branch/edit',{id,name:branchData.name,address:branchData.address,phone:branchData.phone,isActive:branchData.isActive})
            return res.data
        }catch(err){
            console.log(err)
        }
    }


    return {

        addBranch,
        updateBranch,
        getBranch
  }
}
