var express = require('express');
var http=require('http');
var request=require('request');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});




var mongoose = require('mongoose');
var passport = require('passport');

var ejwt = require('express-jwt');


var Post = require('../models/Posts');
var Comment = require('../models/Comments');
var User = require('../models/Users');
var Item = require('../models/Users');
var Preference=require('../models/PaymentPreference');

var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var util = require('./util')


var auth = ejwt({secret: 'SECRET', userProperty: 'payload'});





//var Post = mongoose.model('Post');
//var Comment = mongoose.model('Comment');

router.post('/register', function(req, res, next){
            if(!req.body.username || !req.body.password){
            return res.status(400).json({message: 'Please fill out all fields'});
            }
            
            console.log("register: " + req.body);
            
            var user = new User();
            
            console.log("register - username: " + req.body.username);
            user.username = req.body.username;
            
            
            console.log("register - password: " + req.body.password);
            console.log("util: " + util);
                        console.log("util - export: " + util.exports);
            util.setPassword(user, req.body.password)
            
            console.log("register - saving");
            user.save(function (err){
                      if(err){ return next(err); }
                      
                      return res.json({token: util.generateJWT(user)})
                      });
});

router.post('/login', function(req, res, next){
            if(!req.body.username || !req.body.password){
            return res.status(400).json({message: 'Please fill out all fields'});
            }
            
            passport.authenticate('local', function(err, user, info){
                                  if(err){ return next(err); }
                                  
                                  if(user){
                                  return res.json({token: util.generateJWT(user)});
                                  } else {
                                  return res.status(401).json(info);
                                  }
                                  })(req, res, next);
});

router.get('/posts', auth, function(req, res, next) {
           //console.log("retirve all posts - auth: " + auth);
           Post.find(function(err, posts){
                     if(err){ return next(err); }
                     
                     //console.log("retirve all posts - posts: " + res.json(posts));
                     res.json(posts);
                     });
});

router.post('/posts', auth, function(req, res, next) {
            //var post = new Post(req.body);
            console.log("req.payload.username: " + req.payload.username);
            req.body.author = req.payload.username;
            console.log("req.body.author: " + req.payload.username);
            
            Post.create(req.body, function(err, post){
                      if(err){ return next(err); }
                      
                      res.json(post);
                      });
            });

router.param('post', function(req, res, next, id) {
//            var query = Post.findById(id);
            
             console.log("Post ID: " + id);
            Post.findById(id, function (err, post){
                       if (err) { return next(err); }
                       if (!post) { return next(new Error('can\'t find post')); }
                       
                       console.log("Post Title: " + post.title);
                       req.post = post;
                       return next();
                       });
            });

router.get('/posts/:post', function(req, res) {
           req.post.populate('comments', function(err, post) {
                             if (err) { return next(err); }
                             
                             res.json(post);
                             });
           });

router.put('/posts/:post/upvote', auth, function(req, res, next) {
           
           console.log("Before upvotes: " + req.post.upvotes);
           
           req.post.upvotes += 1;
           
           console.log("After upvotes: " + req.post.upvotes);
           
           
           req.post.save(function(err, post){
                         if (err) { return next(err); }
                         
                         res.json(post);
                         });
           
           /*Post.update(req.post, function(err, post){
                       if(err){ return next(err); }
                       
                       res.json(post);
                       });*/

           
           
           /*req.post.upvote(function(err, post){
                           if (err) { return next(err); }
                           
                           res.json(post);
                           });*/
           });

router.post('/posts/:post/comments', auth, function(req, res, next) {
            var comment = new Comment(req.body);
            comment.post = req.post;
            comment.author = req.payload.username;
            comment.save(function(err, comment){
                         if(err){ return next(err); }
                         
                         req.post.comments.push(comment);
                         req.post.save(function(err, post) {
                                       if(err){ return next(err); }
                                       
                                       res.json(comment);
                                       });
                         });
            });

router.param('comment', function(req, res, next, id) {
             //            var query = Post.findById(id);
             
             Comment.findById(id, function (err, comment){
                           if (err) { return next(err); }
                           if (!comment) { return next(new Error('can\'t find post')); }
                           
                           req.comment = comment;
                           return next();
                           });
             });



router.put('/posts/:post/comments/:comment/upvote', auth, function(req, res, next) {
           
           //console.log("comment upvotes: " + req.comment.upvotes);
           
           req.comment.upvotes += 1;
           
           //console.log("comment upvotes: " + req.comment.upvotes);
           
           
           req.comment.save(function(err, comment){
                         if (err) { return next(err); }
                         
                         res.json(comment);
                         });
           
           /*Post.update(req.post, function(err, post){
            if(err){ return next(err); }
            
            res.json(post);
            });*/
           
           
           
           /*req.post.upvote(function(err, post){
            if (err) { return next(err); }
            
            res.json(post);
            });*/
           });




/** URLs for Items */

router.get('/items', auth, function(req, res, next) {
    //console.log("retirve all posts - auth: " + auth);
    Item.find(function(err, posts){
              if(err){ return next(err); }
              
              //console.log("retirve all posts - posts: " + res.json(posts));
              res.json(posts);
              });
});

router.get('/triggerPayment', function(req, res, next) {
    //console.log("retirve all posts - auth: " + auth);
              var amt=req.query.amount;
              var merchantId=req.query.payAgg_MID;
              console.log("M : "+merchantId);

              var responseData="";
              Preference.findById(merchantId,function (err, data){
                console.log("gfsd"+data);
              if (data!=null)
              {    
                responseData='<html><body>';
                  for(var i=0;i<data.paymentMethods.length;i++)
                  {
                    if(data.paymentMethods[i].key=="PP")
                    {
                      responseData+='<a href="http://payagg-purulalwani.rhcloud.com/paypalPayment?amt="'+amt+'" target="_blank">Paypal</a><br>'
                    }
                    else
                    {
                      responseData+='<a href="http://payagg-purulalwani.rhcloud.com/intiPayment?type='+data.paymentMethods[i].key+'" target="_blank">'+data.paymentMethods[i].value+'</a><br>';
                    }
                      console.log("responseData :"+responseData);
                  }
                  responseData+='</body></html>';
              } 
                           });
              //console.log("retirve all posts - posts: " + res.json(posts));
              res.json({txnid: 12345, html:responseData});
              
});

router.get('/intiPayment',function(req,res,next){
var type=req.query.type;
res.setHeader('content-type', 'text/html');
if(type=="CreditCard")
{
res.end('<html><form action="http://payagg-purulalwani.rhcloud.com/creditCardPayment" method="post"><table><tr><td>Name On Card<br></td><td><input type="text" id="name"></td></tr><tr><td>Card Number</td><td><input type="text" id="number"></td></tr><tr><td>Expiry Date</td><td><input type="text" id="date"></td></tr><tr><td>CVV</td><td><input type="text" id="cvv"></td></tr><tr><td></td><td><input type="submit" value="PAY"></td></tr></table></form></html>');
}
// else
// {
// res.end('<html><form action="http://payagg-purulalwani.rhcloud.com/paypalPayment" method="post"><table><tr><td>Username</td><td><input type="text" id="username"></td></tr><tr><td>Password</td><td><input type="password" id="password"></td></tr><tr><td></td><td><input type="submit" value="PAY"></td></tr></table></form></html>');  
// }

});

router.post('/creditCardPayment',function(req,res,next){




});


router.get('/paypalPayment',function(req,res,next){
  var file="";
  request.get('https://api-3t.sandbox.paypal.com/nvp?USER=purulalwani-facilitator_api1.gmail.com&PWD=JN87FYAKTW69FHQT&SIGNATURE=A8U4kN1ozZa4NoSGUvTXiP3pGt8FAevAp1IrIeFt0XbsQUf70iPlImPv&METHOD=SetExpressCheckout&VERSION=98&PAYMENTREQUEST_0_AMT=2&PAYMENTREQUEST_0_CURRENCYCODE=USD&PAYMENTREQUEST_0_PAYMENTACTION=SALE&cancelUrl=http://www.example.com/cancel.html&returnUrl=http://payagg-purulalwani.rhcloud.com/executePayment?amt=2',function(err,response,body){
    console.log("Init Pay"+ body);
    var info= body.split('&')[0].split('=')[1];
    console.log(body);
    var token=decodeURIComponent(info);
    console.log("token : "+token);
    var url='https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token='+token;
    console.log("URL : "+url);
    var file='<html><head><script>window.location.href="'+url+'"</script></head></html>';
    res.setHeader('content-type', 'text/html');
    res.end(file);
 //    request.get(url,function(err,resp,body1){
    
      
 //      res.writeHead(200, {
 //   'Content-Type': 'text/html', 
 //   'Set-Cookie': '604800',
 //   'Connection': 'keep-alive',
 //   'User-Agent':'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'
 // });
 //    //  console.log("body : "+body1);
 //      res.end(body1);
 //  //    console.log("body : "+body);
 //    });
 
    // request.get('https://api-3t.sandbox.paypal.com/nvp?METHOD=GetExpressCheckoutDetails&TOKEN=EC%2d8BA611440L054983X&USER=purulalwani-facilitator_api1.gmail.com&PWD=JN87FYAKTW69FHQT&SIGNATURE=A8U4kN1ozZa4NoSGUvTXiP3pGt8FAevAp1IrIeFt0XbsQUf70iPlImPv&VERSION=98',function(err,res,body){
    //     //console.log("Checkout details " +body);
    // });

  });

 
});

router.get('/executePayment',function(req,res,next){
var amt=req.query.amt;
var payerId=req.query.PayerID;
var token=req.query.token;
var url='https://api-3t.sandbox.paypal.com/nvp?METHOD=DoExpressCheckoutPayment&TOKEN='+token+'&USER=purulalwani-facilitator_api1.gmail.com&PWD=JN87FYAKTW69FHQT&SIGNATURE=A8U4kN1ozZa4NoSGUvTXiP3pGt8FAevAp1IrIeFt0XbsQUf70iPlImPv&VERSION=98&PAYERID='+payerId+'&PAYMENTREQUEST_0_AMT='+amt;
request.get(url,function(err,resp,body){
  res.end('success');
});

});
module.exports = router;