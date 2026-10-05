const express = require('express');
const router = express.Router();
const consoleController = require('../controllers/consoleController');

// Endpoint de Health Check
router.get('/health', consoleController.getHealth);

// Endpoints CRUD para Consoles
router.get('/consoles', consoleController.listConsoles);
router.get('/consoles/:id', consoleController.getConsoleById);
router.post('/consoles', consoleController.createConsole);
router.put('/consoles/:id', consoleController.updateConsole);
router.delete('/consoles/:id', consoleController.deleteConsole);

module.exports = router;
