const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

let User = require('../models/user');
let Complaint = require('../models/complaint');
let ComplaintMapping = require('../models/complaint-mapping');



// Home Page - Dashboard
router.get('/', ensureAuthenticated, (req, res, next) => {
    res.render('index');
});

// Login Form
router.get('/login', (req, res, next) => {
    res.render('login');
});

// Register Form
router.get('/register', (req, res, next) => {
    res.render('register');
});

// Logout
router.get('/logout', ensureAuthenticated,(req, res, next) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login');
});

// Admin
router.get('/admin', ensureAuthenticated, (req,res,next) => {
    Complaint.getAllComplaints((err, complaints) => {
        if (err) throw err;
    
        User.getEngineer((err, engineer) => {
            if (err) throw err;

            res.render('admin/admin', {
                complaints : complaints,
                engineer : engineer,
            });
        });
    });        
});
///////////////////////////
//user
router.get('/user', ensureAuthenticated, (req,res,next) => {
    Complaint.getAllComplaints((err, complaints) => {
        if (err) throw err;
        res.render('user', {
            complaints : complaints
        });
        
    });        
});
//////////////////////////////


router.post('/change/:id', async (req, res) => {
    
        
        console.log( req.params.id);
        const comp = await Complaint.findOne({ _id: req.params.id });
        console.log(comp);

        var optingBool;
        await Complaint.findOne({ _id: req.params.id }, async function (err, doc) {
            // const salt = await bcryptjs.genSalt(10);
            
            
            doc.likes=doc.likes+1;
            doc.save();
            // var optingBool = opting == "yes" ? true : false;
            
            // doc.onspotReg.reg = true;
            
        });
        

       
        res.redirect("/user");
        
    
});



router.post('/changein/:id', async (req, res) => {
    
        
    console.log( req.params.id);
    const comp = await Complaint.findOne({ _id: req.params.id });
    console.log(comp);

    var optingBool;
    await Complaint.findOne({ _id: req.params.id }, async function (err, doc) {
        // const salt = await bcryptjs.genSalt(10);
        
        
        doc.likes=doc.likes-1;
        doc.save();
        // var optingBool = opting == "yes" ? true : false;
        
        // doc.onspotReg.reg = true;
        
    });
    

   
    res.redirect("/user");
    

});

///////////////////////////////
router.post('/stat/:id', async (req, res) => {
    
        
    console.log( req.params.id);
    const comp = await Complaint.findOne({ _id: req.params.id });
    console.log(comp);

    var optingBool;
    await Complaint.findOne({ _id: req.params.id }, async function (err, doc) {
        // const salt = await bcryptjs.genSalt(10);
        
        
       if(doc.status==false){
           doc.status=true;
           
       }
       else{
           doc.status=false;
       }
       doc.save();
        // var optingBool = opting == "yes" ? true : false;
        
        // doc.onspotReg.reg = true;
        
    });
    

   
    res.redirect("/admin");
    

});












////////////////////////


// Assign the Complaint to Engineer
router.post('/assign', (req,res,next) => {
    const complaintID = req.body.complaintID;
    const engineerName = req.body.engineerName;

    req.checkBody('complaintID', 'Contact field is required').notEmpty();
    req.checkBody('engineerName', 'Description field is required').notEmpty();

    let errors = req.validationErrors();

    if (errors) {
        res.render('admin/admin', {
            errors: errors
        });
    } else {
        const newComplaintMapping = new ComplaintMapping({
            complaintID: complaintID,
            engineerName: engineerName,
        });

        ComplaintMapping.registerMapping(newComplaintMapping, (err, complaint) => {
            if (err) throw err;
            req.flash('success_msg', 'You have successfully assigned a complaint to Engineer');
            res.redirect('/admin');
        });
    }

});

// Junior Eng
router.get('/jeng', ensureAuthenticated, (req,res,next) => {
    res.render('junior/junior');
});

//Complaint
router.get('/complaint', ensureAuthenticated, (req, res, next) => {
    //console.log(req.session.passport.username);
    //console.log(user.name);
    res.render('complaint', {
        username: req.session.user,
    });
});

//Register a Complaint
router.post('/registerComplaint', (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const contact = req.body.contact;
    const desc = req.body.desc;
    const likes=0;
    const status="no"
    
    const postBody = req.body;
    console.log(postBody);

    req.checkBody('contact', 'Contact field is required').notEmpty();
    req.checkBody('desc', 'Description field is required').notEmpty();

    let errors = req.validationErrors();

    if (errors) {
        res.render('complaint', {
            errors: errors
        });
    } else {
        const newComplaint = new Complaint({
            name: name,
            email: email,
            contact: contact,
            desc: desc,
            likes: likes,
            status: status
        });

        Complaint.registerComplaint(newComplaint, (err, complaint) => {
            if (err) throw err;
            req.flash('success_msg', 'You have successfully launched a complaint');
            res.redirect('/');
        });
    }
});



// Process Register
router.post('/register', (req, res, next) => {
    const name = req.body.name;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const password2 = req.body.password2;
    const role = req.body.role;

    req.checkBody('name', 'Name field is required').notEmpty();
    req.checkBody('email', 'Email field is required').notEmpty();
    req.checkBody('email', 'Email must be a valid email address').isEmail();
    req.checkBody('username', 'Username field is required').notEmpty();
    req.checkBody('password', 'Password field is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
    req.checkBody('role', 'Role option is required').notEmpty();

    let errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors
        });
    } else {
        const newUser = new User({
            name: name,
            username: username,
            email: email,
            password: password,
            role: role,
            likecond:false
        });

        User.registerUser(newUser, (err, user) => {
            if (err) throw err;
            req.flash('success_msg', 'You are Successfully Registered and can Log in');
            res.redirect('/login');
        });
    }
});

// Local Strategy
passport.use(new LocalStrategy((username, password, done) => {
    User.getUserByUsername(username, (err, user) => {
        if (err) throw err;
        if (!user) {
            return done(null, false, {
                message: 'No user found'
            });
        }

        User.comparePassword(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, {
                    message: 'Wrong Password'
                });
            }
        });
    });
}));

passport.serializeUser((user, done) => {
    var sessionUser = {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        likecond:user.likecond
    }
    done(null, sessionUser);
});

passport.deserializeUser((id, done) => {
    User.getUserById(id, (err, sessionUser) => {
        done(err, sessionUser);
    });
});

// Login Processing
router.post('/login', passport.authenticate('local', 
    { 
        failureRedirect: '/login', 
        failureFlash: true 
    
    }), (req, res, next) => {
    
        req.session.save((err) => {
        if (err) {
            return next(err);
        }
        if(req.user.role==='admin'){
            res.redirect('/admin');
        }
        else if(req.user.role==='jeng'){
            res.redirect('/jeng');
        }
        else{
            res.render('index');
        }
    });
});

// Access Control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error_msg', 'You are not Authorized to view this page');
        res.redirect('/login');
    }
}

module.exports = router;