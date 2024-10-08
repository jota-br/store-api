async function authenticate(req, res, next) {
    const token = req.session.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded; // Add the decoded token to the request object
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}