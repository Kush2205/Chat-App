import express, { Router, Request, Response, NextFunction } from 'express';
import  {CreateUserSchema , SigninSchema}  from '@repo/common/config';
import {prisma} from "@repo/database/config"

import jwt from 'jsonwebtoken';
import {JWT_SECRET} from "@repo/common-backend/config"
const secret = JWT_SECRET;
export const authRouter:express.Router = express.Router();

 authRouter.post('/signin', async (req: Request, res: Response) => {
    try{
    const {email , password} = req.body;
    const status = SigninSchema.safeParse({email , password});
   if(!status.success){
       res.status(400).json({error: status.error});
   }
   else{
     try {
        const user = await prisma.user.findFirst({
            where:{
                email,
                password
             }
        });
         if(user && secret){
            const token = jwt.sign({id: user.id , name : user.name}, secret);
            res.status(200).json({token});
        }
        else{
            res.status(401).json({error: "Invalid Credentials"});
        }
        
    } catch (error) {
         res.status(500).json({error: error});
    }
      
  
     }
 }catch(e){
     res.status(500).json({error: "Internal Server Error"});
 }
});


authRouter.post('/signup', async(req: Request, res: Response) => {
    
       try {
           const {email , password , name} = req.body;
           const status = CreateUserSchema.safeParse({email , password , name});
           if(status.success){
            const user = await prisma.user.create({
                data:{
                    email,
                    password,
                    name
               }
            });
   
            if(user && secret){
               const token = jwt.sign({id: user.id , name : user.name}, secret);
               res.status(200).json({token});
            }
           }
           else{
               res.status(400).json({error: status.error});
           }
         
        
        
       } catch (error) {
              res.status(500).json({error: error});
       }
       
  

   
    
});
