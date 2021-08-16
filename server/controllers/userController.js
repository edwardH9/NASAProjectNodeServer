const mysql = require('mysql')
const pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.HOST,
    user: 'root',
    password: 'SProtocol934',
    database: process.env.DATABASE
});

exports.view=(req,res)=>{
    pool.getConnection((err, connection)=>{
        if(err) throw err;
    
        connection.query("SELECT * FROM authorizedUsers",(err,rows)=>{
            connection.release()
            if(!err){
                res.render('index',{rows})
            }else{console.log(err)}
        })
    })
}

exports.login = (req,res)=>{
    pool.getConnection((err, connection)=>{
        if(err) throw err;
        let userQ=req.body.username
        let pass = req.body.password
        connection.query('SELECT userID FROM valid WHERE userName LIKE ?',['%'+userQ+'%'],(err,data)=>{
                if(!err){
                    if(Object.keys(data).length==0){
                        return res.render("failedLogin",{error:"Unknown Username"})
                    }
                    let check1=data[0].userID
                    connection.query('SELECT userID FROM valid WHERE password LIKE?',['%'+pass+'%'],(err3,data2)=>{
                        if(!err3){
                            if(Object.keys(data2).length==0){
                                return res.render("failedLogin",{error:"Incorrect Password"})
                            }
                            let check2=data2[0].userID
                            if(check1==check2){
                                connection.query('SELECT firstName FROM authorizedUsers WHERE userID LIKE?',['%'+data[0].userID+'%'], (err2,uData)=>{
                                    connection.release()
                                    if(!err2){
                                        if(uData[0].firstName=="Edward"){
                                            res.render('logInS',{uData})
                                        } else if(uData[0].firstName=="Paulo"){
                                            res.render('logInS',{uData})
                                        }
                                    }else{
                                        console.log("Error",err2)
                                        res.send("An error occured while validating Password")
                                    }
                                })
                            }else{
                                res.render("failedLogin",{error:"Username and Password Mismatch"})
                            }                       
                        }else {
                            res.send("An error occured while validating username")
                            console.log(err3)
                    }
                    })
                }else{console.log(err)}
            })
    })
}

exports.api = (req,res)=>{
    pool.getConnection((err, connection)=>{
        if(err) throw err;
        connection.query("SELECT * FROM missionLog",(err,rows)=>{
            connection.release()
            if(!err){
                res.render('missionPage',{rows})
            }else{console.log(err)}
        })
    })
}

exports.search = (req,res)=>{
    pool.getConnection((err, connection)=>{
        let searchTerms=req.body.searchTerms
        if(err) throw err;
        connection.query("SELECT * FROM missionLog WHERE missionSite LIKE ? OR teamLead LIKE ?",['%'+searchTerms+'%','%'+searchTerms+'%'],(err,rows)=>{
            connection.release()
            if(Object.keys(rows).length==0){
                return res.render("missionPage",{rows})
            }
            if(!err){
                res.render('missionPage',{rows})
            }else{console.log(err)}
        })
    })
}