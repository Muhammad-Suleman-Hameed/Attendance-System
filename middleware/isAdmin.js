exports.isAdmin =  function(req, res , next){
    if(!req.user.isAdmin) return res.status(403).send('Access denied. Not an Admin')
        //console.log("Admin check:", req.user.isAdmin);
        next();
}