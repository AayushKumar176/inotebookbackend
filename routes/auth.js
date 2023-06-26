const express=require('express');
const User= require('../models/User');
const router =express.Router();
const { body, validationResult } = require('express-validator');
const  bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');

const JWT_SECRET= 'priyanshuisagoodb$oy';



// Route 1:  create a user using: POST "/api/auth/createuser". No login required
router.post('/createuser', [
    body('name' ,'Enter a valid name').isLength({ min: 3 }),
    body('email' ,'Enter a valid email').isEmail(),
    body('password' , 'Password must be at least 5 characters').isLength({ min: 5 }),
], async (req,res)=>{
  let success=false;
  // If there are errors return bad request and errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    // check whether the user with the same email already exists
    try{
    let user= await User.findOne({email: req.body.email});
    // console.log(user);
    if(user){
      return res.status(400).json({success, error:"Sorry a user with this email already exists"})
    }
    const salt= await bcrypt.genSalt(10); 
    secPass= await bcrypt.hash(req.body.password, salt);
    // Create a new user
     user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      })
      
      // .then(user => res.json(user))
      // .catch(err=>{console.log(err)
      //   res.json({error: 'Please enter a unique value for email' ,message:err.message})})   

      const data={
        user:{
          id:user.id
        }
      }

      const authToken= jwt.sign(data, JWT_SECRET);
      // console.log(jwtData);

      success=true;
      res.json({success, authToken});
      // catch errors
    } catch(error){
       console.error(error.message);
       res.status(500).send("Internal Server error");
    }

    // console.log(req.body);
    // const user=User(req.body);
    // user.save();
    // res.send(req.body);
})

// Route 2:  Authenticate a user using: POST "/api/auth/login". No login required

router.post('/login', [
  
  body('email' ,'Enter a valid email').isEmail(),
  body('password' ,'Password cannot be blank').exists(),
  
], async (req,res)=>{

  let success=false;

   // If there are errors return bad request and errors
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
   }

   const {email,password}= req.body;

   try{
      let user= await User.findOne({email});
      if(!user){
        return res.status(400).json({success, error: "Please try to login with correct credentials"})
      }

      const passwordCompare = await bcrypt.compare(password, user.password)
      if(!passwordCompare){
        return res.status(400).json({success ,error: "Please try to login with correct credentials"})
      }

      const data={
        user:{
          id:user.id
        }
      }

      const authToken= jwt.sign(data, JWT_SECRET);
      success=true;
      res.json({success ,authToken});



   } catch(error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
   }

})

// Route 3:  Get logged in User details "/api/auth/getuser".  login required
router.post('/getuser', fetchuser , async (req,res)=>{
try {
  userId=req.user.id;
  const user=await User.findById(userId).select("-password")
  res.send(user);
} catch (error) {
  console.error(error.message);
  res.status(500).send("Internal server error");
}
})
module.exports=router

