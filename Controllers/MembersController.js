const mongoose=require("mongoose");
require("./../Model/MembersModel");
const Members=mongoose.model("members");
require("./../Model/MembersReportModel");
const MembersReport=mongoose.model("membersReport");

const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt");
const saltRounds=10;
const salt=bcrypt.genSaltSync(saltRounds);
const fileSystem=require("fs");
const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const d=new Date().getMonth();

exports.MemberLogin=(request,response,next)=>{
    Members.findOne({email:request.body.email})
    .then((data)=>{
        if(data == null){
            let error=new Error("U are Not Registered in the System...!");
            error.status=401;
            next(error);
        }else{
            if(bcrypt.compareSync(request.body.password,data.password)){
                let token=jwt.sign(
                    {id:data._id,role:"Member"},
                    "OSTrack",
                    {expiresIn:"2h"}
                )
                response.status(200).json({Message:"Authenticated",token});
            }else{
                next(new Error("Password is Invalid...!"));
            }
        }
    })
}
/**************** Login For Member **************/

exports.getAllMembers=(request,response,next)=>{
    Members.find({})
    .then((data)=>{
        response.status(200).json({data});
    })
    .catch((error)=>{
        next(error);
    })
}
/**************** Get All Members **************/

exports.getMember=(request,response,next)=>{
    Members.findOne({_id:request.params._id})
    .then((data)=>{
        response.status(200).json({data});
    })
    .catch((error)=>{
        next(new Error("No Such Member Exists...!"));
    })
};
/**************** Get a Member **************/

exports.addMember=async(request,response,next)=>{
    try{
        let data=await new Members({
            _id:request.body._id,
            fullName:request.body.fullName,
            email:request.body.email,
            password:bcrypt.hashSync(request.body.password,salt),
            phoneNumber:request.body.phoneNumber,
            birthDate:request.body.birthDate,
            fullAddress:request.body.address,
            image:request.body.image
        }).save()
        .then(async(data)=>{
            MembersReport.updateOne({},{
                $inc:{
                    newMembers:1
                },
                $set:{
                    year:new Date().getFullYear(),
                    month:month[d],
                    numberOfMembers:await Members.countDocuments({})
                }
            },{upsert:true})
            .then(()=>{
                response.status(201).json({data});
            })
            .catch((error)=>{
                next(error);
            })
        })
    }catch(error){
        next(error);
    }
}
/**************** Add New Member **************/

exports.updateMember=(request,response,next)=>{
    if(request.decodedToken.role == "Member" && request.decodedToken.id == request.body._id){
        let hashedPass=request.body.password?bcrypt.hashSync(request.body.password,salt):request.body.password;
        Members.findOneAndUpdate(
            {_id:request.body.id},
            {
                $set:{
                    fullName:request.body.fullName,
                    password:hashedPass,
                    phoneNumber:request.body.phoneNumber,
                    birthDate:request.body.birthDate,
                    address:request.body.address,
                    image:request.body.image                    
                }
            }
        )
        .then((data)=>{
            if(data == null){
                next(new Error("No Such Member Exists...!"));
            }else{
                if(data["image"] != null){
                    fileSystem.unlink(data["image"],(error)=>{
                        next(new Error("Can't Remove Old Image...!"));
                    });
                    response.status(200).json({data:"update member data"});
                }
            }
        })
        .catch((error)=>{
            next(error);
        })
    }else if(request.decodedToken.role == "BasicAdmin" || request.decodedToken.role == "Admin" || request.decodedToken.role == "Employee"){
        let hashedPass=request.body.password?bcrypt.hashSync(request.body.password,salt):request.body.password;
        Members.findOneAndUpdate(
            {_id:request.body._id},
            {
                $set:{
                    fullName:request.body.fullName,
                    email:request.body.email,
                    password:hashedPass,
                    phoneNumber:request.body.phoneNumber,
                    birthDate:request.body.birthDate,
                    address:request.body.address,
                    image:request.body.image                    
                }
            }
        )
        .then((data)=>{
            if(data == null){
                next(new Error("No Such Member Exists...!"));
            }else{
                if(data["image"] != null){
                    fileSystem.unlink(data["image"],(error)=>{
                        next(new Error("Can't Remove Old Image...!"));
                    });
                    response.status(200).json({data:"Updated Successfully."});
                }
            }
        })
        .catch((error)=>{
            next(error);
        })
    }else{
        response.status(401).json({data:"Unauthorized...!"});
    }
}
/**************** Update Exist Member **************/

exports.deleteMember=(request,response,next)=>{
    Members.findOneAndDelete({_id:request.params._id})
    .then((data)=>{
        if(data == null){
            next(new Error("No Such Member Exists...!"));
        }else{
            if(data["image"] != null){
                let path=data.image;
                console.log(path);
                fileSystem.unlink(path,(error)=>{
                    next(error);
                });
            }
        }
    })
    .then(async(data)=>{
        MembersReport.updateOne({},{
            $inc:{
                deletedMembers:1,
                // numberOfMembers: -1
            },
            $set:{
                year:new Date().getFullYear(),
                month:month[d],
                numberOfMembers: await Members.countDocuments()
            }
        },{upsert:true})
        .then(()=>{
            response.status(200).json({data:"Deleted Successfully."});
        })
        .catch((error)=>{
            next(error);
        })
    })
}
/**************** Delete Member **************/

exports.getMembersReport=(request,response,next)=>{
    MembersReport.find({})
    .then((data)=>{
        response.status(200).json({data});
    })
    .catch((error)=>{
        next(error);
    })
}
/**************** Login For Member **************/
