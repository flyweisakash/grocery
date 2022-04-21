import authRoutes from "../../routes/user/auth";
import userRoutes from "../../routes/user"

function apiRoutes(app) {
    app.use("/api/auth", authRoutes);
    app.use("/api/user", userRoutes);
}

module.exports = apiRoutes;
