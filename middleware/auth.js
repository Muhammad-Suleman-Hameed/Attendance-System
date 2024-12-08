const jwt = require('jsonwebtoken')

exports.auth = function(req, res , next){
    const token = req.header('x-auth-token')
    if(!token) return res.status(403).send('No token or Invalid token')

try {
    const decoded = jwt.verify(token , process.env.JWT_PRIVATE_KEY)
    req.user = decoded
    //console.log("Decoded user:", req.user);

    next();
} catch (error) {
    console.error(error.message)
    res.status(400).send('Invalid Token')
}    
}