const jwt = require("jsonbtoken");

function extractTokenFromHeaders(req) {
    if (!req.headers.authorization) {
        throw new Error ("Requisição inválida: não contém cabeçalho Autorization");
    }
    return req.headers.authorization.split(" ")[1];
}

function isAuthenticated(req, res, next) {
    const token = extractTokenFromHeaders(req);

    jwt.verify(token, process.env.TOKEN_SING_SECRET, (err, decoded) => {
        if (err) {
            console.log(err);
            return res
            .status(401)
            .json({ message: "Acesso Negado", reason: err.message });
        }

        req.user = decoded;

        return next()
    });
}

module.exports = isAuthenticated