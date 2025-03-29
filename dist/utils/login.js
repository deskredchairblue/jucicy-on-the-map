"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validator_1 = require("../utils/validator");
const token_1 = require("../utils/token");
// Mock function for user authentication – replace with real database lookup & password validation.
function authenticateUser(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        // Example: Only accepts a fixed test user.
        if (email === 'user@example.com' && password === 'Password1') {
            return { userId: '123456', role: 'user' };
        }
        return null;
    });
}
const router = (0, express_1.Router)();
router.post('/login', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Validate input fields
        const errors = (0, validator_1.validateLoginInput)(email, password);
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        // Authenticate user (replace with actual logic)
        const user = yield authenticateUser(email, password);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Generate a JWT login token
        const token = (0, token_1.generateLoginToken)({ userId: user.userId, role: user.role });
        res.status(200).json({ token });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
//# sourceMappingURL=login.js.map