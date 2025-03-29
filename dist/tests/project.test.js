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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
describe('Project API', () => {
    let token;
    let projectId;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Authenticate and get a token
        const res = yield (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({ email: 'test@example.com', password: 'password123' });
        token = res.body.token;
    }));
    it('should create a new project', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default)
            .post('/api/project')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Test Project', description: 'A sample project' });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        projectId = res.body.id;
    }));
    it('should retrieve project details', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default)
            .get(`/api/project/${projectId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('name', 'Test Project');
    }));
});
//# sourceMappingURL=project.test.js.map