import { Router } from 'express';
import GatewayController from '../controllers/gateway.controller';

const router = Router();

// Gateway endpoints
router.post('/gateway/proxy', GatewayController.proxyRequest);
router.post('/gateway/invoke', GatewayController.invokeService);
router.get('/gateway/health', GatewayController.getGatewayHealth);
router.get('/core/health', GatewayController.getCoreHealth);
router.post('/gateway/register-node', GatewayController.registerNode);
router.get('/gateway/nodes', GatewayController.getNodes);
router.post('/gateway/scale-node', GatewayController.scaleNode);
router.post('/gateway/token', GatewayController.issueToken);
router.post('/gateway/rate-check', GatewayController.rateCheck);

export default router;
