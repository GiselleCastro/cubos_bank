import { Router } from 'express';
import { ValidateSchemaMiddleware } from '../middlewares/schemaValidation.js';
import { createUserBodySchema, loginBodySchema } from '../schema/user.js';
import { UsersControllerFactory } from '../controllers/factories/users.controller.factory.js';

export const router = Router();

const controller = UsersControllerFactory.make();


router.post('/people', ValidateSchemaMiddleware.handle(createUserBodySchema), controller.registerUser());
router.post('/login', ValidateSchemaMiddleware.handle(loginBodySchema), controller.login());
