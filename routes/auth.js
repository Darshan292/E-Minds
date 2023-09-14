const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
// const session=require('express-session');


const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});
// Signup page
router.post('/Signup',async(req, res)=>{
    const{USN, NAME, BRANCH, SECTION, EMAIL, PASSWORDS, PASSWORDSCONFIRM} = req.body;
    let hashedPassword = await bcrypt.hash(PASSWORDS, 8)

    if( PASSWORDS !== PASSWORDSCONFIRM ){
        return res.render('Signup', {
            message: 'Passwords do not match'
          });
    }
    
    

    var value = [USN, NAME, BRANCH, SECTION, EMAIL, hashedPassword]


    db.query('select EMAIL from users where email= ?',[EMAIL],(error, result)=>{
        if(error){
            console.log(error.message)
        }
        if(result.length > 0){
          return res.render('Signup', {
            message: 'Email exists'
          })
        }else call();
        
    })
    function call(){
    db.query('INSERT INTO `users`(`USN`, `NAME`, `BRANCH`, `SECTION`, `EMAIL`, `PASSWORDS`) VALUES (?)',[value],(error,result)=>{
        if(error)
        console.log(error.message)
    })
    res.render('Login')
}

});
    

// login page

router.post('/Home',async(req, res)=>{
    // console.log(req.body)
    const{EMAIL, PASSWORDS} = req.body;

    db.query('SELECT PASSWORDS FROM users WHERE EMAIL=?',[EMAIL],(error, result)=>{
        if(error)
            console.log(error.message);
            else if(result.length==0)
                res.render('Login');
        else
        { console.log(result);
            bcrypt.compare(PASSWORDS,result[0].PASSWORDS,(error,result)=>{
            // console.log(result);
            if(result) fielddisplay();
             else{res.render('Login', {
                message: 'Wrong Password'
              })
                 }
         })
        }
            
    })
    function fielddisplay(){
        const token = jwt.sign({email: EMAIL},"HACKER",{
            expiresIn: '1h'
        })
        // res.cookie('user', token)
        res.cookie("user", token,{
            httpOnly: true
        });
        console.log(req.cookies.user)
        db.query('Select I.`ISSUE`, I.`EMAIL` as `IMAIL`, T.`TEXT_BODY`,T.BODY_DATE, T.EMAIL, Ts.FIELD_NAME, Ts.TOPIC_NAME FROM `issues` I , `texts` T, `topics` Ts WHERE T.TOPIC_ID=I.TOPIC_ID AND TS.TOPIC_ID=T.TOPIC_ID GROUP BY (I.ISSUE) order by (BODY_DATE) DESC',(error,Issue)=>{
            console.log(Issue);
            
            if(error){ console.log(error);}
               db.query('SELECT * FROM `fields` ORDER BY FIELD_ID DESC;',(error, result)=>{
                if(error){
                console.log(error.message);
            }
            else if(result.length== 0){
                res.render('Home',{message: "No field exist"});
             }
             else {
                res.render('Home',{contents:(result), body:Issue})}   
        })
    })
}
})


router.get("/HomeNav", function(req, res){
    db.query('Select I.`ISSUE`, I.`EMAIL` as `IMAIL`, T.`TEXT_BODY`,T.BODY_DATE, T.EMAIL, Ts.FIELD_NAME, Ts.TOPIC_NAME FROM `issues` I , `texts` T, `topics` Ts WHERE T.TOPIC_ID=I.TOPIC_ID AND TS.TOPIC_ID=T.TOPIC_ID GROUP BY (I.ISSUE) order by (BODY_DATE) DESC',(error,Issue)=>{
        console.log(Issue);
        
        if(error){ console.log(error);}
           db.query('SELECT * FROM `fields` ORDER BY FIELD_ID DESC;',(error, result)=>{
            if(error){
            console.log(error.message);
        }
        else if(result.length== 0){
            res.render('Home',{message: "No field exist"});
         }
         else {
            res.render('Home',{contents:(result), body:Issue})}   
    })
})
});

// Fields
router.post('/Fields',async(req, res)=>{
    const{FIELD_NAME} = req.body;
    var value = [FIELD_NAME]
    db.query('select * from fields where FIELD_NAME= ?',[FIELD_NAME],(error, result)=>{
        if(result.length > 0){
            db.query('SELECT * FROM `fields` ORDER BY FIELD_ID DESC',(error, result)=>{
                if(error){
                    console.log(error.message);
                }
                else if(result.length== 0){
                    res.render('Home',{message: "No field exist"});
                 }
                 else {
                   
                    res.render('Home',{contents:result ,alert_message:'FIELD EXISTS'})
                }   
            })
        //     res.render('Home', {
        //     alert_message: 'FIELD EXISTS'
        //   })
        }
        if(result.length == 0){fieldinsert();
        }
        fielddisplay();
    })

    function fieldinsert(){
        console.log(req.cookies.user);
        const data = jwt.verify(req.cookies.user,"HACKER")
        console.log("Hakcker")
        console.log(data.email)
        db.query('INSERT INTO `fields`(`FIELD_NAME`,`EMAIL`) VALUES (?,?)',[value,data.email],(error,result)=>{
            if(error)
            console.log(error.message)
        })
        }
    function fielddisplay(){
        db.query('SELECT * FROM `topics` where `FIELD_NAME`=?',[FIELD_NAME],(error, result)=>{
            if(error){
                console.log(error.message);
            }
            else if(result.length== 0){
                db.query('INSERT INTO `topics`(`FIELD_NAME`) VALUES (?)',[FIELD_NAME],(error,result)=>{
                    if(error) console.log(error.message);
                    // else {// console.log(result);
                    //     topicdisplay();}
                    })
             }
                res.render('Topic',{contents:(result), Titles:[FIELD_NAME]}); 
        })
    }
});

router.get('/topics', (req,res) =>{
    if(!req.query.tname){
    const FIELD_SELECT = req.query.name;
     console.log(FIELD_SELECT);
    db.query('SELECT * FROM `topics` WHERE `FIELD_NAME`=?',[FIELD_SELECT],(error,result)=>{
        console.log('hey');
        console.log(result);
        if(result.length == 0){

            db.query('INSERT INTO `topics`(`FIELD_NAME`) VALUES (?)',[FIELD_SELECT],(error,result)=>{
                if(error) console.log(error.message);
                // else {// console.log(result);
                //     topicdisplay();}
                })
        }
        { topicdisplay();}
    })

// const params = new URLSearchParams(window.location.search);
//    const title = params.get('name');
//    console.log(title)


    function topicdisplay(){
        db.query('SELECT * FROM `topics` where `FIELD_NAME`=?',[FIELD_SELECT],(error, result)=>{
            // console.log(result)
            if(error){
                console.log(error.message);
            }
            else if(result.length== 0){
                res.render('Topic',{message: "No topic exist"});
             }
             else {
                res.render('Topic',{contents:(result)});
            }   
        })
    }
    }
else{
    console.log('hello');
    const TOPIC_NAME = req.query.tname;
    const FIELD_NAME = req.query.name;
    console.log(FIELD_NAME);
    console.log(TOPIC_NAME);
    // const{TOPIC_NAME} = req.body;
    var value = [TOPIC_NAME]

    db.query('select * from topics where TOPIC_NAME= ? AND FIELD_NAME=? ',[TOPIC_NAME,FIELD_NAME],(error, result)=>{
        // console.log(result);
        if(result.length > 0){
            // db.query('SELECT * FROM `topics`where `FIELD_NAME`=?',[FIELD_NAME],(error, result)=>{
            //     if(error){
            //         console.log(error.message);
            //     }
            //     else if(result.length== 0){
            //         res.render('Topic',{message: "No topic exist"});
            //      }
            //      else {
            //         console.log('if result');
            //         // console.log(result)
            //         res.render('Topic',{contents:result ,alert_message:'TOPIC EXISTS'})
            topictextdisplay();
                }   
            })
// HERE WHERE THE BODY OF THE TEXTS WILL BE DISPLAYED.
    function topictextdisplay(){
        db.query('SELECT `TOPIC_ID` FROM `topics` where `FIELD_NAME`=? AND `TOPIC_NAME`=? ',[FIELD_NAME,TOPIC_NAME],(error, tid)=>{
            console.log('RESULT');
            const resu=tid[0].TOPIC_ID;
            // console.log(result);
            if(error){
                console.log(error.message);
            }
             else {db.query('SELECT * FROM `issues` WHERE `TOPIC_ID`= ?',[resu],(error,Body)=>{
                db.query('SELECT * FROM `texts` WHERE `TOPIC_ID`= ? ORDER BY(BODY_DATE) DESC',[resu],(error,resultss)=>{
                if(error){ console.log(error);}
                console.log(resu);
                console.log('BODY')
                console.log(Body)
                // if(resultss[0].BODY_DATE!=0){
                //     console.log(resultss[0].BODY_DATE)}
                console.log('issues');
                Body[0].DATE = Body[0].DATE.toLocaleString();
               for(let i=0; i<resultss.length; i++){
                resultss[i].BODY_DATE = resultss[i].BODY_DATE.toLocaleString();
               }
                
                console.log('Body');
                res.render('Topic_discuss',{Title:[TOPIC_NAME],ID:(resultss),ISSUE:(Body)});
                
                })
            })
            }   
        })
    }
}

});


router.get('/text',(req, res) => {
    console.log(req.query)
    const TOPIC_NAME=req.query.title1;
    const FIELD_NAME=req.query.field;
    console.log('IDAHAR IDHAR')
    console.log(TOPIC_NAME);
    console.log(FIELD_NAME);
    if(!req.query.fields){
    db.query('select * from topics where TOPIC_NAME= ? AND FIELD_NAME=? ',[TOPIC_NAME,FIELD_NAME],(error, result)=>{
        // console.log(result);
        // if(result.length > 0){
        //     db.query('SELECT * FROM `topics`where `FIELD_NAME`=?',[FIELD_NAME],(error, result)=>{
        //         if(error){
        //             console.log(error.message);
        //         }
            //else 
        if(result.length== 0){
            topicinsert();
            topictextdisplay();
             }
        else {
            db.query('select * from topics where FIELD_NAME= ?',[FIELD_NAME],(error,result)=>{
            res.render('Topic',{contents:result ,alert_message:'TOPIC EXISTS',Titles:[FIELD_NAME]})
        });  
            }
        });
    function topicinsert(){
        const data = jwt.verify(req.cookies.user,"HACKER")
        db.query('INSERT INTO `topics`(`TOPIC_NAME`, `FIELD_NAME`, `EMAIL` ) values(?, ?, ?)',[TOPIC_NAME ,FIELD_NAME,data.email],(error,result)=>{
            // console.log(result);
            if(error)
            console.log(error.message);
        })
        }
    function topictextdisplay(){
        db.query('DELETE FROM topics WHERE `topics`.`FIELD_NAME` = ? AND `topics`.`TOPIC_NAME` = ?',[FIELD_NAME,'None'],(error,result)=>{
            console.log(result);})
            db.query('SELECT `TOPIC_ID` FROM `topics` WHERE topics.TOPIC_NAME=?  AND topics.FIELD_NAME=? ',[TOPIC_NAME,FIELD_NAME],(error,result)=>{
                console.log('Topic_Id will be');
                console.log(result);
                res.render('Text',{ID:(result)});
            })
            }
        } 
});

    
        
    
router.post('/body',(req,res)=>{
    const data = jwt.verify(req.cookies.user,"HACKER");
    const {USN, TEXT_BODY} = req.body;
    const TOPIC_ID = req.query.id;;
    console.log(USN);
    console.log(TEXT_BODY);
    console.log(TOPIC_ID);
    // db.query('INSERT INTO `likes`(`TOPIC_ID`) VALUES (?)',[TOPIC_ID],(error,result)=>{
    //     if(error){console.log(error);}
    //     else{console.log('Likes');
    //     console.log(result);}
    // })
    db.query('INSERT INTO `issues`(`EMAIL`, `TOPIC_ID`, `ISSUE`) VALUES(?, ?, ?)',[data.email, TOPIC_ID, TEXT_BODY],(error,result)=>{
        db.query('SELECT * FROM `topics` where `TOPIC_ID`=?',[TOPIC_ID],(error,topictable)=>{
            const T_NAME = topictable[0].TOPIC_NAME;
            const F_NAME = topictable[0].FIELD_NAME;

            console.log(result);
        // res.send('DONE');
        res.redirect('topics?name='+F_NAME);
        })

    })
    
})

router.post('/Comments',(req,res)=>{
    const data = jwt.verify(req.cookies.user,"HACKER")
    const {TEXT_BODY} = req.body;
    const TOPIC_ID = req.query.t_id;
    console.log(TOPIC_ID);
    db.query('INSERT INTO `texts`(`EMAIL`, `TOPIC_ID`, `TEXT_BODY` ) values(?, ?, ? )',[data.email ,TOPIC_ID, TEXT_BODY],(error,result)=>{
        // console.log(result);
        if(error)
        console.log(error.message);
        else{console.log(result);
        // res.send('Done');
        {db.query('SELECT * FROM `issues` WHERE `TOPIC_ID`= ?',[TOPIC_ID],(error,Body)=>{ 
            db.query('SELECT * FROM `texts` WHERE `TOPIC_ID`= ? ORDER BY(BODY_DATE) DESC ',[TOPIC_ID],(error,resultss)=>{
                db.query('SELECT * from `topics` where `TOPIC_ID` =?', [TOPIC_ID],(error,t_name)=>{
                    if(error){ console.log(error);}
                    const TOPIC_NAME = t_name[0].TOPIC_NAME;
                    console.log("anushhhhh")
                    console.log(Body)
                    Body[0].DATE = Body[0].DATE.toLocaleString();
                    for(let i=0; i<resultss.length; i++){
                        resultss[i].BODY_DATE = resultss[i].BODY_DATE.toLocaleString();
                       }
            res.render('Topic_discuss',{Title:(TOPIC_NAME),ID:(resultss),ISSUE:(Body)});
                })
            })
        })
        }   
    }
        
    })

})


router.get('/profile',(req, res) => {
    const data = jwt.verify(req.cookies.user,"HACKER")

    db.query('SELECT * FROM `users` WHERE `EMAIL`=?',[data.email],(error,result)=>{
        console.log(data.email);
        console.log("usersss")
        console.log(result);
        res.render('profile',{User:(result)});
    })
});

router.get('/delete',(req,res)=>{
    const data = jwt.verify(req.cookies.user,"HACKER")
    const TEXT_BODY = req.query.body;
    const TOPIC_ID = req.query.t_id;
    console.log(TEXT_BODY)
    db.query('DELETE FROM `texts` WHERE TOPIC_ID=? AND TEXT_BODY=? AND EMAIL=?',[TOPIC_ID,TEXT_BODY, data.email],(error,result)=>{
        console.log("DELETE")
        console.log(error)
        console.log(result)
        db.query('SELECT * FROM `issues` WHERE `TOPIC_ID`= ?',[TOPIC_ID],(error,Body)=>{
            db.query('SELECT * FROM `texts` WHERE `TOPIC_ID`= ? ORDER BY(BODY_DATE) DESC ',[TOPIC_ID],(error,resultss)=>{
                if(resultss.length!=0){
                    console.log(resultss)
                    db.query('SELECT * from `topics` where `TOPIC_ID` =?', [TOPIC_ID],(error,t_name)=>{
                    if(error){ console.log(error);}
                    const TOPIC_NAME = t_name[0].TOPIC_NAME;
                    console.log("anushhhhh")
                    console.log("Here buddy")
                    Body[0].DATE = Body[0].DATE.toLocaleString();
                    for(let i=0; i<resultss.length; i++){
                        resultss[i].BODY_DATE = resultss[i].BODY_DATE.toLocaleString();
                       }
                    res.render('Topic_discuss',{Title:(TOPIC_NAME),ID:(resultss),ISSUE:(Body)});
                    
                })
            }
            else{ 
                db.query('SELECT * from `topics` where `TOPIC_ID` =?', [TOPIC_ID],(error,t_name)=>{
                    if(error){ console.log(error);}
                    const TOPIC_NAME = t_name[0].TOPIC_NAME;
                    console.log("anushhhhh")
                    console.log("Here buddy")
                    Body[0].DATE = Body[0].DATE.toLocaleString();
                    res.render('Topic_discuss',{Title:(TOPIC_NAME),ID:(resultss),ISSUE:(Body)});
                    
                })
        }
            })
    })
})
});

module.exports = router;